import json
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import Pasta, Projeto, Apresentacao, Slide, CampoPreenchido, Templates

projetos_bp = Blueprint('projetos', __name__)

# ==============================================================================
# GESTÃO DE PASTAS DO USUÁRIO (ANTIGA TELA DE PROJETOS)
# ==============================================================================

@projetos_bp.route('/pastas')
@projetos_bp.route('/projetos')
@login_required
def projetos():
    """
    Rota principal de Pastas (antiga 'Projetos') e listagem de apresentações salvas.
    Usuários gerenciam suas pastas de trabalho e suas apresentações.
    """
    if getattr(current_user, 'admin', False):
        pastas_usuario = Pasta.query.order_by(Pasta.nome.asc()).all()
    else:
        pastas_usuario = Pasta.query.filter_by(usuario_id=current_user.id).order_by(Pasta.nome.asc()).all()

    pasta_ids = [p.id for p in pastas_usuario]
    if pasta_ids:
        apresentacoes = Apresentacao.query.filter(
            Apresentacao.pasta_id.in_(pasta_ids)
        ).order_by(Apresentacao.data_criacao.desc()).all()
    else:
        apresentacoes = []

    return render_template(
        'admin/admin_projetos.html',
        apresentacoes=apresentacoes,
        pastas=pastas_usuario,
        projetos=pastas_usuario  # Compatibilidade com templates existentes
    )


@projetos_bp.route('/pastas/criar', methods=['POST'])
@projetos_bp.route('/projetos/criar', methods=['POST'])
@login_required
def criar_projeto():
    """Cria uma nova Pasta para o usuário autenticado."""
    data = request.get_json(silent=True)
    if not data:
        data = request.form

    nome = (data.get('nome') or '').strip()
    descricao = (data.get('descricao') or '').strip()
    cor = (data.get('cor') or '#0052ff').strip()

    if not nome:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'O nome da pasta é obrigatório.'}), 400
        flash('O nome da pasta é obrigatório.', 'danger')
        return redirect(url_for('projetos.projetos'))

    nova_pasta = Pasta(
        usuario_id=current_user.id,
        nome=nome,
        descricao=descricao or 'Pasta de apresentações',
        capa_uri=cor
    )
    db.session.add(nova_pasta)
    db.session.commit()

    if request.is_json:
        return jsonify({
            'status': 'sucesso',
            'pasta_id': nova_pasta.id,
            'projeto_id': nova_pasta.id,  # Retrocompatibilidade
            'nome': nova_pasta.nome,
            'mensagem': f'Pasta "{nome}" criada com sucesso!'
        })

    flash(f'Pasta "{nome}" criada com sucesso!', 'success')
    return redirect(url_for('projetos.projetos'))


@projetos_bp.route('/pastas/editar/<int:id>', methods=['POST'])
@projetos_bp.route('/projetos/editar/<int:id>', methods=['POST'])
@login_required
def editar_projeto(id):
    """Atualiza dados de uma Pasta."""
    pasta = Pasta.query.get_or_404(id)
    if not getattr(current_user, 'admin', False) and pasta.usuario_id != current_user.id:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'Permissão negada'}), 403
        flash('Permissão negada.', 'danger')
        return redirect(url_for('projetos.projetos'))

    data = request.get_json(silent=True) or request.form
    nome = (data.get('nome') or '').strip()
    descricao = (data.get('descricao') or '').strip()
    cor = (data.get('cor') or '#0052ff').strip()

    if not nome:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'O nome da pasta é obrigatório'}), 400
        flash('O nome da pasta é obrigatório.', 'danger')
        return redirect(url_for('projetos.projetos'))

    pasta.nome = nome
    pasta.descricao = descricao
    pasta.capa_uri = cor
    db.session.commit()

    if request.is_json:
        return jsonify({'status': 'sucesso', 'mensagem': 'Pasta atualizada com sucesso!'})
    flash('Pasta atualizada com sucesso!', 'success')
    return redirect(url_for('projetos.projetos'))


@projetos_bp.route('/pastas/deletar/<int:id>', methods=['POST', 'DELETE'])
@projetos_bp.route('/projetos/deletar/<int:id>', methods=['POST', 'DELETE'])
@login_required
def deletar_projeto(id):
    """Exclui uma Pasta e suas apresentações vinculadas."""
    pasta = Pasta.query.get_or_404(id)
    if not getattr(current_user, 'admin', False) and pasta.usuario_id != current_user.id:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'Permissão negada'}), 403
        flash('Permissão negada.', 'danger')
        return redirect(url_for('projetos.projetos'))

    try:
        apresentacoes = Apresentacao.query.filter_by(pasta_id=id).all()
        for ap in apresentacoes:
            slides = Slide.query.filter_by(apresentacao_id=ap.id).all()
            for s in slides:
                CampoPreenchido.query.filter_by(slide_id=s.id).delete(synchronize_session=False)
                db.session.delete(s)
            db.session.delete(ap)
        db.session.delete(pasta)
        db.session.commit()

        if request.is_json:
            return jsonify({'status': 'sucesso', 'mensagem': 'Pasta deletada com sucesso!'})
        flash('Pasta deletada com sucesso!', 'success')
        return redirect(url_for('projetos.projetos'))
    except Exception as e:
        db.session.rollback()
        print(f"[ERRO AO DELETAR PASTA]: {e}")
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': f'Erro ao deletar pasta: {str(e)}'}), 500
        flash('Erro ao deletar pasta.', 'danger')
        return redirect(url_for('projetos.projetos'))


# ==============================================================================
# PROJETOS OFICIAIS DO CIT (KITS DE SLIDES)
# ==============================================================================

@projetos_bp.route('/api/projetos-cit', methods=['GET'])
@login_required
def api_projetos_cit():
    """
    Retorna a listagem dos 114 Projetos Oficiais do CIT (Iniciativas Municipais).
    Permite busca por termo 'q' e filtro por 'secretaria'.
    Cada projeto funciona como um Kit Modular de Slides para inserção com 1 clique no editor.
    """
    termo = (request.args.get('q') or '').strip().lower()
    secretaria = (request.args.get('secretaria') or '').strip().lower()

    query = Projeto.query

    if termo:
        query = query.filter(
            db.or_(
                Projeto.nome.ilike(f'%{termo}%'),
                Projeto.resumo.ilike(f'%{termo}%'),
                Projeto.secretaria_principal.ilike(f'%{termo}%')
            )
        )

    if secretaria and secretaria != 'todas':
        query = query.filter(Projeto.secretaria_principal.ilike(f'%{secretaria}%'))

    projetos_list = query.order_by(Projeto.nome.asc()).all()

    resultado = []
    for p in projetos_list:
        resultado.append({
            'id': p.id,
            'nome': p.nome,
            'slug': p.slug,
            'secretaria': p.secretaria_principal,
            'resumo': p.resumo or '',
            'descricao_completa': p.descricao_completa or '',
            'foto_url': p.foto_url or '',
            'destaques': p.destaques or [],
            'beneficios': p.beneficios or [],
            'status_operacional': p.status_operacional or 'Em Operação',
            'ods_vinculados': p.ods_vinculados or [],
            'total_slides': len(p.slides_kit)
        })

    return jsonify({
        'status': 'sucesso',
        'total': len(resultado),
        'projetos': resultado
    })


@projetos_bp.route('/api/projetos-cit/<int:projeto_id>/slides', methods=['GET'])
@login_required
def api_projeto_cit_slides(projeto_id):
    """
    Retorna os slides mestres que compõem o Kit do Projeto do CIT informado.
    Normalmente são 2 a 3 slides:
      1. Capa Oficial do Projeto
      2. Módulos e Pilares do Projeto
      3. Indicadores e Resultados Consolidados
    Mapeia os campos da tabela CampoPreenchido para o formato pronto para inserção no editor.
    """
    projeto = Projeto.query.get_or_404(projeto_id)
    slides_mestres = Slide.query.filter_by(projeto_id=projeto.id).order_by(Slide.ordem.asc()).all()

    slides_formatados = []

    for s in slides_mestres:
        tpl_cod = s.template_usado.codigo if s.template_usado else 'capa'
        slide_obj = {
            'template': tpl_cod,
            'template_nome': s.template_usado.nome if s.template_usado else 'Slide Oficial',
            'titulo': '',
            'subtitulo': '',
            'tamanhoTitulo': 4.0,
            'tamanhoSubtitulo': 1.8,
            'corTitulo': '#0f172a',
            'corSubtitulo': '#64748b',
            'corFundo': '#ffffff',
            'logos': ['barueri'],
            'customLogoImg': None,
            'ods': True if (projeto.ods_vinculados and len(projeto.ods_vinculados) > 0) else False,
            'odsNums': [str(x) for x in (projeto.ods_vinculados or [])],
            'qr': False,
            'qrLink': '',
            'bgCapa': projeto.foto_url or None,
            'bgGeral': projeto.foto_url or None,
            'imgTexto': projeto.foto_url or None,
            'chartType': 'line',
            'chartIndicador': 1,
            'periodo': 'Últimos 12 meses',
            'indicadores': [],
            'mapaTipo': 'barueri',
            'mapaPins': [],
            'pilar_1_titulo': '',
            'pilar_1_texto': '',
            'pilar_2_titulo': '',
            'pilar_2_texto': '',
            'pilar_3_titulo': '',
            'pilar_3_texto': '',
            'projeto_origem_id': projeto.id,
            'projeto_origem_nome': projeto.nome
        }

        campos_map = {c.chave_campo: c.valor_manual for c in s.campos}

        # Título e Subtítulo
        if 'titulo' in campos_map and campos_map['titulo']:
            slide_obj['titulo'] = campos_map['titulo']
        else:
            slide_obj['titulo'] = projeto.nome

        if 'subtitulo' in campos_map and campos_map['subtitulo']:
            slide_obj['subtitulo'] = campos_map['subtitulo']
        elif tpl_cod == 'capa':
            slide_obj['subtitulo'] = projeto.resumo or f"Iniciativa da {projeto.secretaria_principal}"

        # Imagem de fundo
        if 'imagem_fundo' in campos_map and campos_map['imagem_fundo']:
            slide_obj['bgCapa'] = campos_map['imagem_fundo']
            slide_obj['bgGeral'] = campos_map['imagem_fundo']
            slide_obj['imgTexto'] = campos_map['imagem_fundo']

        # Pilares (Template modulos_pilares)
        for i in range(1, 4):
            k_tit = f'pilar_{i}_titulo'
            k_txt = f'pilar_{i}_texto'
            if k_tit in campos_map:
                slide_obj[k_tit] = campos_map[k_tit] or ''
            if k_txt in campos_map:
                slide_obj[k_txt] = campos_map[k_txt] or ''

        # Indicadores (Template indicadores)
        if tpl_cod == 'indicadores':
            indicadores_lista = []
            icones_padrao = ['bi-graph-up', 'bi-check2-circle', 'bi-people', 'bi-shield-check', 'bi-star', 'bi-lightning']
            cores_padrao = ['#0052ff', '#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ec4899']

            for i in range(1, 7):
                rotulo = campos_map.get(f'card_rotulo_{i}')
                metrica = campos_map.get(f'card_metrica_{i}')
                if rotulo or metrica:
                    indicadores_lista.append({
                        'nome': rotulo or f'Métrica {i}',
                        'valor': metrica or '',
                        'icone': icones_padrao[(i - 1) % len(icones_padrao)],
                        'cor': cores_padrao[(i - 1) % len(cores_padrao)]
                    })

            # Se campos_map tem chave 'indicadores' em formato JSON
            if not indicadores_lista and 'indicadores' in campos_map:
                try:
                    parsed = json.loads(campos_map['indicadores'])
                    if isinstance(parsed, list):
                        indicadores_lista = parsed
                except Exception:
                    pass

            # Fallback se não houver métricas específicas, usa destaques ou benefícios do projeto
            if not indicadores_lista and projeto.destaques:
                for idx, dest in enumerate(projeto.destaques[:4], start=1):
                    indicadores_lista.append({
                        'nome': dest,
                        'valor': 'Oficial',
                        'icone': icones_padrao[(idx - 1) % len(icones_padrao)],
                        'cor': cores_padrao[(idx - 1) % len(cores_padrao)]
                    })

            slide_obj['indicadores'] = indicadores_lista

        slides_formatados.append(slide_obj)

    return jsonify({
        'status': 'sucesso',
        'projeto': {
            'id': projeto.id,
            'nome': projeto.nome,
            'secretaria': projeto.secretaria_principal,
            'resumo': projeto.resumo,
            'foto_url': projeto.foto_url
        },
        'total_slides': len(slides_formatados),
        'slides': slides_formatados
    })


# ==============================================================================
# ACERVO GLOBAL COMPARTILHADO (TODAS AS PASTAS E APRESENTAÇÕES)
# ==============================================================================

def _extrair_dados_slide(s, ap=None):
    """Função auxiliar para serializar um slide para o acervo compartilhado."""
    pasta_nome = 'Geral'
    pasta_id = None
    if ap and ap.pasta:
        pasta_nome = ap.pasta.nome
        pasta_id = ap.pasta.id

    slide_dict = {
        'slide_id': s.id,
        'apresentacao_id': ap.id if ap else None,
        'apresentacao_nome': ap.nome if ap else 'Kit CIT',
        'pasta_id': pasta_id,
        'pasta_nome': pasta_nome,
        'ordem': s.ordem,
        'template': s.template_usado.codigo if s.template_usado else 'capa',
        'template_nome': s.template_usado.nome if s.template_usado else 'Slide',
        'titulo': '',
        'subtitulo': '',
        'tamanhoTitulo': 4.0,
        'tamanhoSubtitulo': 1.8,
        'corTitulo': '#0f172a',
        'corSubtitulo': '#64748b',
        'corFundo': '#ffffff',
        'logos': ['barueri'],
        'customLogoImg': None,
        'ods': False,
        'odsNums': [],
        'qr': False,
        'qrLink': '',
        'bgCapa': None,
        'bgGeral': None,
        'imgTexto': None,
        'chartType': 'line',
        'chartIndicador': 1,
        'periodo': 'Últimos 12 meses',
        'indicadores': [],
        'mapaTipo': 'barueri',
        'mapaPins': [],
        'pilar_1_titulo': '',
        'pilar_1_texto': '',
        'pilar_2_titulo': '',
        'pilar_2_texto': '',
        'pilar_3_titulo': '',
        'pilar_3_texto': ''
    }

    for campo in s.campos:
        val = campo.valor_manual
        k = campo.chave_campo
        if k in ('ods', 'qr'):
            slide_dict[k] = (val == 'true')
        elif k in ('bgCapa', 'bgGeral'):
            slide_dict['bgCapa'] = val
            slide_dict['bgGeral'] = val
        elif k == 'imagem_fundo':
            slide_dict['bgCapa'] = val
            slide_dict['bgGeral'] = val
            slide_dict['imgTexto'] = val
        elif k in ('tamanhoTitulo', 'tamanhoSubtitulo'):
            try:
                slide_dict[k] = float(val) if val else 4.0
            except (ValueError, TypeError):
                slide_dict[k] = 4.0
        elif k in ('logos', 'odsNums', 'indicadores', 'mapaPins'):
            try:
                slide_dict[k] = json.loads(val) if val else []
            except Exception:
                slide_dict[k] = []
        elif k == 'chartIndicador':
            try:
                slide_dict[k] = int(val) if val else 1
            except (ValueError, TypeError):
                slide_dict[k] = 1
        else:
            slide_dict[k] = val

    return slide_dict


@projetos_bp.route('/api/acervo/global', methods=['GET'])
@projetos_bp.route('/api/acervo', methods=['GET'])
@login_required
def acervo_global():
    """
    Retorna o acervo unificado da plataforma, permitindo compartilhamento de slides,
    mídias e dados manuais entre qualquer apresentação, sem restrição de pasta.
    Suporta filtros por 'pasta_id', 'template' e busca textual 'q'.
    """
    pasta_id_filtro = request.args.get('pasta_id', type=int)
    termo = (request.args.get('q') or '').strip().lower()
    template_filtro = (request.args.get('template') or '').strip().lower()

    # Pastas do usuário (ou todas se for admin)
    if getattr(current_user, 'admin', False):
        pastas_usuario = Pasta.query.order_by(Pasta.nome.asc()).all()
    else:
        pastas_usuario = Pasta.query.filter_by(usuario_id=current_user.id).order_by(Pasta.nome.asc()).all()

    pasta_ids = [p.id for p in pastas_usuario]

    # Query de apresentações
    ap_query = Apresentacao.query
    if pasta_id_filtro:
        ap_query = ap_query.filter(Apresentacao.pasta_id == pasta_id_filtro)
    elif not getattr(current_user, 'admin', False):
        ap_query = ap_query.filter(Apresentacao.pasta_id.in_(pasta_ids)) if pasta_ids else ap_query.filter(db.literal(False))

    apresentacoes = ap_query.order_by(Apresentacao.data_criacao.desc()).all()

    slides_compartilhados = []
    midias_coletadas = []
    textos_coletados = []
    links_coletados = []
    indicadores_coletados = []

    urls_vistas = set()
    textos_vistos = set()

    for ap in apresentacoes:
        slides = Slide.query.filter_by(apresentacao_id=ap.id).order_by(Slide.ordem.asc()).all()
        for s in slides:
            s_dict = _extrair_dados_slide(s, ap)

            # Filtros opcionais
            if template_filtro and s_dict['template'] != template_filtro:
                continue
            if termo:
                titulo_ok = termo in (s_dict['titulo'] or '').lower()
                subtitulo_ok = termo in (s_dict['subtitulo'] or '').lower()
                ap_nome_ok = termo in (ap.nome or '').lower()
                if not (titulo_ok or subtitulo_ok or ap_nome_ok):
                    continue

            slides_compartilhados.append(s_dict)

            # Coleta de mídias manuais para reuso avulso
            for campo in s.campos:
                k = campo.chave_campo
                val = campo.valor_manual
                if k in ('bgCapa', 'bgGeral', 'imgTexto', 'customLogoImg', 'imagem_fundo') and val and val.strip():
                    if val not in urls_vistas:
                        urls_vistas.add(val)
                        tipo_chave = 'bgCapa' if k in ('bgCapa', 'bgGeral', 'imagem_fundo') else k
                        midias_coletadas.append({
                            'tipo': tipo_chave,
                            'tipo_rotulo': 'Fundo' if tipo_chave == 'bgCapa' else ('Imagem' if tipo_chave == 'imgTexto' else 'Logotipo'),
                            'valor': val,
                            'campo_id': campo.id,
                            'apresentacao_nome': ap.nome,
                            'pasta_nome': ap.pasta.nome if ap.pasta else 'Geral',
                            'slide_ordem': s.ordem
                        })

                if k == 'qrLink' and val and val.strip() and val not in urls_vistas:
                    urls_vistas.add(val)
                    links_coletados.append({
                        'valor': val,
                        'campo_id': campo.id,
                        'apresentacao_nome': ap.nome
                    })

                if k in ('titulo', 'subtitulo') and val and len(val.strip()) > 3 and val not in textos_vistos:
                    textos_vistos.add(val)
                    textos_coletados.append({
                        'chave': k,
                        'valor': val,
                        'campo_id': campo.id,
                        'apresentacao_nome': ap.nome,
                        'pasta_nome': ap.pasta.nome if ap.pasta else 'Geral'
                    })

                if k == 'indicadores' and val:
                    try:
                        inds = json.loads(val)
                        if isinstance(inds, list):
                            for ind in inds:
                                nome_ind = ind.get('nome')
                                if nome_ind and nome_ind not in textos_vistos:
                                    textos_vistos.add(nome_ind)
                                    indicadores_coletados.append({
                                        'nome': nome_ind,
                                        'valor': ind.get('valor', ''),
                                        'icone': ind.get('icone', 'bi-graph-up'),
                                        'cor': ind.get('cor', '#0284c7'),
                                        'campo_id': campo.id,
                                        'apresentacao_nome': ap.nome,
                                        'pasta_nome': ap.pasta.nome if ap.pasta else 'Geral'
                                    })
                    except Exception:
                        pass

    # Lista de pastas formatada para o select de filtro
    pastas_info = [{'id': p.id, 'nome': p.nome} for p in pastas_usuario]

    return jsonify({
        'status': 'sucesso',
        'total_slides': len(slides_compartilhados),
        'pastas': pastas_info,
        'slides': slides_compartilhados,
        'dados_manuais': {
            'midias': midias_coletadas,
            'textos': textos_coletados,
            'links': links_coletados,
            'indicadores': indicadores_coletados
        }
    })


@projetos_bp.route('/pastas/<int:id>/acervo', methods=['GET'])
@projetos_bp.route('/projetos/<int:id>/acervo', methods=['GET'])
@login_required
def acervo_projeto(id):
    """
    Retorna o acervo compartilhado filtrado por uma pasta específica,
    mantendo compatibilidade com chamadas legadas do frontend.
    """
    pasta = Pasta.query.get_or_404(id)
    if not getattr(current_user, 'admin', False) and pasta.usuario_id != current_user.id:
        return jsonify({'status': 'erro', 'mensagem': 'Permissão negada'}), 403

    # Reutiliza acervo global passando a pasta
    apresentacoes = Apresentacao.query.filter_by(pasta_id=id).order_by(Apresentacao.data_criacao.desc()).all()
    slides_compartilhados = []
    midias_coletadas = []
    textos_coletados = []
    links_coletados = []
    indicadores_coletados = []

    urls_vistas = set()
    textos_vistos = set()

    for ap in apresentacoes:
        slides = Slide.query.filter_by(apresentacao_id=ap.id).order_by(Slide.ordem.asc()).all()
        for s in slides:
            s_dict = _extrair_dados_slide(s, ap)
            slides_compartilhados.append(s_dict)

            for campo in s.campos:
                k = campo.chave_campo
                val = campo.valor_manual
                if k in ('bgCapa', 'bgGeral', 'imgTexto', 'customLogoImg', 'imagem_fundo') and val and val.strip():
                    if val not in urls_vistas:
                        urls_vistas.add(val)
                        tipo_chave = 'bgCapa' if k in ('bgCapa', 'bgGeral', 'imagem_fundo') else k
                        midias_coletadas.append({
                            'tipo': tipo_chave,
                            'tipo_rotulo': 'Fundo' if tipo_chave == 'bgCapa' else ('Imagem' if tipo_chave == 'imgTexto' else 'Logotipo'),
                            'valor': val,
                            'campo_id': campo.id,
                            'apresentacao_nome': ap.nome,
                            'slide_ordem': s.ordem
                        })

                if k in ('titulo', 'subtitulo') and val and len(val.strip()) > 3 and val not in textos_vistos:
                    textos_vistos.add(val)
                    textos_coletados.append({
                        'chave': k,
                        'valor': val,
                        'campo_id': campo.id,
                        'apresentacao_nome': ap.nome
                    })

                if k == 'indicadores' and val:
                    try:
                        inds = json.loads(val)
                        if isinstance(inds, list):
                            for ind in inds:
                                nome_ind = ind.get('nome')
                                if nome_ind and nome_ind not in textos_vistos:
                                    textos_vistos.add(nome_ind)
                                    indicadores_coletados.append({
                                        'nome': nome_ind,
                                        'valor': ind.get('valor', ''),
                                        'icone': ind.get('icone', 'bi-graph-up'),
                                        'cor': ind.get('cor', '#0284c7'),
                                        'campo_id': campo.id,
                                        'apresentacao_nome': ap.nome
                                    })
                    except Exception:
                        pass

    return jsonify({
        'status': 'sucesso',
        'projeto': {
            'id': pasta.id,
            'nome': pasta.nome,
            'descricao': pasta.descricao,
            'cor': pasta.capa_uri or '#0052ff'
        },
        'pasta': {
            'id': pasta.id,
            'nome': pasta.nome,
            'descricao': pasta.descricao,
            'cor': pasta.capa_uri or '#0052ff'
        },
        'total_slides': len(slides_compartilhados),
        'slides': slides_compartilhados,
        'dados_manuais': {
            'midias': midias_coletadas,
            'textos': textos_coletados,
            'links': links_coletados,
            'indicadores': indicadores_coletados
        }
    })


@projetos_bp.route('/api/slides/duplicar', methods=['POST'])
@projetos_bp.route('/pastas/<int:id>/duplicar-slide', methods=['POST'])
@projetos_bp.route('/projetos/<int:id>/duplicar-slide', methods=['POST'])
@login_required
def duplicar_slide_universal(id=None):
    """
    Copia um slide existente de QUALQUER apresentação para uma apresentação destino.
    A limitação de poder compartilhar apenas dentro da mesma pasta foi removida,
    permitindo que slides de qualquer pasta ou apresentação sejam livremente compartilhados!
    """
    data = request.get_json() or {}
    slide_origem_id = data.get('slide_origem_id')
    apresentacao_destino_id = data.get('apresentacao_destino_id')

    if not slide_origem_id or not apresentacao_destino_id:
        return jsonify({'status': 'erro', 'mensagem': 'Parâmetros slide_origem_id e apresentacao_destino_id obrigatórios'}), 400

    slide_origem = Slide.query.get_or_404(slide_origem_id)
    apresentacao_destino = Apresentacao.query.get_or_404(apresentacao_destino_id)

    # Verifica permissão apenas na apresentação destino (o usuário deve ter posse da pasta destino ou ser admin)
    if not getattr(current_user, 'admin', False):
        if apresentacao_destino.pasta and apresentacao_destino.pasta.usuario_id != current_user.id:
            return jsonify({'status': 'erro', 'mensagem': 'Permissão negada na apresentação de destino'}), 403

    try:
        max_ordem = db.session.query(db.func.max(Slide.ordem)).filter_by(apresentacao_id=apresentacao_destino.id).scalar() or 0
        novo_slide = Slide(
            apresentacao_id=apresentacao_destino.id,
            template_id=slide_origem.template_id,
            ordem=max_ordem + 1
        )
        db.session.add(novo_slide)
        db.session.flush()

        for c in slide_origem.campos:
            novo_campo = CampoPreenchido(
                slide_id=novo_slide.id,
                chave_campo=c.chave_campo,
                valor_manual=c.valor_manual,
                campo_origem_id=c.id
            )
            db.session.add(novo_campo)

        db.session.commit()
        return jsonify({
            'status': 'sucesso',
            'slide_id': novo_slide.id,
            'ordem': novo_slide.ordem,
            'mensagem': 'Slide duplicado com sucesso na apresentação destino!'
        })
    except Exception as e:
        db.session.rollback()
        print(f"[ERRO AO DUPLICAR SLIDE]: {e}")
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao duplicar slide: {str(e)}'}), 500
