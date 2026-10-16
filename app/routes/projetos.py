import json
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import Projeto, Apresentacao, Slide, CampoPreenchido, Templates

projetos_bp = Blueprint('projetos', __name__)

@projetos_bp.route('/projetos')
@login_required
def projetos():
    """Rota principal de projetos e listagem de apresentações salvas"""
    # Se o usuário for admin, visualiza todos os projetos do sistema para gestão unificada.
    # Caso contrário, visualiza os projetos sob sua titularidade.
    if getattr(current_user, 'admin', False):
        projetos_usuario = Projeto.query.order_by(Projeto.nome.asc()).all()
    else:
        projetos_usuario = Projeto.query.filter_by(usuario_id=current_user.id).order_by(Projeto.nome.asc()).all()

    # Recupera todas as apresentações dos projetos do usuário ordenadas por criação mais recente
    projeto_ids = [p.id for p in projetos_usuario]
    if projeto_ids:
        apresentacoes = Apresentacao.query.filter(
            Apresentacao.projeto_id.in_(projeto_ids)
        ).order_by(Apresentacao.data_criacao.desc()).all()
    else:
        apresentacoes = []

    return render_template(
        'admin/admin_projetos.html',
        apresentacoes=apresentacoes,
        projetos=projetos_usuario
    )

@projetos_bp.route('/projetos/criar', methods=['POST'])
@login_required
def criar_projeto():
    """Cria uma nova pasta (Projeto) para o usuário autenticado"""
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

    novo_projeto = Projeto(
        usuario_id=current_user.id,
        nome=nome,
        descricao=descricao or 'Pasta de apresentações',
        capa_uri=cor
    )
    db.session.add(novo_projeto)
    db.session.commit()

    if request.is_json:
        return jsonify({
            'status': 'sucesso',
            'projeto_id': novo_projeto.id,
            'nome': novo_projeto.nome,
            'mensagem': f'Pasta "{nome}" criada com sucesso!'
        })

    flash(f'Pasta "{nome}" criada com sucesso!', 'success')
    return redirect(url_for('projetos.projetos'))

@projetos_bp.route('/projetos/editar/<int:id>', methods=['POST'])
@login_required
def editar_projeto(id):
    projeto = Projeto.query.get_or_404(id)
    # Check permissions
    if not getattr(current_user, 'admin', False) and projeto.usuario_id != current_user.id:
        if request.is_json: return jsonify({'status': 'erro', 'mensagem': 'Permissão negada'}), 403
        flash('Permissão negada.', 'danger')
        return redirect(url_for('projetos.projetos'))

    data = request.get_json(silent=True) or request.form
    nome = (data.get('nome') or '').strip()
    descricao = (data.get('descricao') or '').strip()
    cor = (data.get('cor') or '#0052ff').strip()

    if not nome:
        if request.is_json: return jsonify({'status': 'erro', 'mensagem': 'O nome da pasta é obrigatório'}), 400
        flash('O nome da pasta é obrigatório.', 'danger')
        return redirect(url_for('projetos.projetos'))

    projeto.nome = nome
    projeto.descricao = descricao
    projeto.capa_uri = cor
    db.session.commit()

    if request.is_json:
        return jsonify({'status': 'sucesso', 'mensagem': 'Pasta atualizada com sucesso!'})
    flash('Pasta atualizada com sucesso!', 'success')
    return redirect(url_for('projetos.projetos'))

@projetos_bp.route('/projetos/deletar/<int:id>', methods=['POST', 'DELETE'])
@login_required
def deletar_projeto(id):
    projeto = Projeto.query.get_or_404(id)
    if not getattr(current_user, 'admin', False) and projeto.usuario_id != current_user.id:
        if request.is_json: return jsonify({'status': 'erro', 'mensagem': 'Permissão negada'}), 403
        flash('Permissão negada.', 'danger')
        return redirect(url_for('projetos.projetos'))

    try:
        # Busca todas as apresentações vinculadas a este projeto
        apresentacoes = Apresentacao.query.filter_by(projeto_id=id).all()
        for ap in apresentacoes:
            slides = Slide.query.filter_by(apresentacao_id=ap.id).all()
            for s in slides:
                CampoPreenchido.query.filter_by(slide_id=s.id).delete(synchronize_session=False)
                db.session.delete(s)
            db.session.delete(ap)
        db.session.delete(projeto)
        db.session.commit()

        if request.is_json:
            return jsonify({'status': 'sucesso', 'mensagem': 'Pasta deletada com sucesso do banco de dados!'})
        flash('Pasta deletada com sucesso!', 'success')
        return redirect(url_for('projetos.projetos'))
    except Exception as e:
        db.session.rollback()
        print(f"[ERRO AO DELETAR PASTA/PROJETO]: {e}")
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': f'Erro ao deletar pasta: {str(e)}'}), 500
        flash('Erro ao deletar pasta.', 'danger')
        return redirect(url_for('projetos.projetos'))

@projetos_bp.route('/projetos/<int:id>/acervo', methods=['GET'])
@login_required
def acervo_projeto(id):
    """
    Retorna o acervo compartilhado de uma pasta (Projeto):
    - Todos os slides completos existentes em apresentações da pasta
    - Todos os dados manuais reutilizáveis (mídias, textos, indicadores, links)
    Garante que o escopo de reuso é restrito ao mesmo projeto (conforme PDD v2.0).
    """
    projeto = Projeto.query.get_or_404(id)
    if not getattr(current_user, 'admin', False) and projeto.usuario_id != current_user.id:
        return jsonify({'status': 'erro', 'mensagem': 'Permissão negada'}), 403

    apresentacoes = Apresentacao.query.filter_by(projeto_id=id).order_by(Apresentacao.data_criacao.desc()).all()

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
            slide_dict = {
                'slide_id': s.id,
                'apresentacao_id': ap.id,
                'apresentacao_nome': ap.nome,
                'ordem': s.ordem,
                'template': s.template_usado.codigo if s.template_usado else 'capa',
                'template_nome': s.template_usado.nome if s.template_usado else 'Capa / Abertura',
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
                'indicadores': []
            }

            for campo in s.campos:
                val = campo.valor_manual
                k = campo.chave_campo
                if k in ('ods', 'qr'):
                    slide_dict[k] = (val == 'true')
                elif k in ('bgCapa', 'bgGeral'):
                    slide_dict['bgCapa'] = val
                    slide_dict['bgGeral'] = val
                elif k in ('tamanhoTitulo', 'tamanhoSubtitulo'):
                    try:
                        slide_dict[k] = float(val) if val else 4.0
                    except (ValueError, TypeError):
                        slide_dict[k] = 4.0
                elif k in ('logos', 'odsNums', 'indicadores'):
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

                # Coleta mídias manuais para reuso avulso
                if k in ('bgCapa', 'bgGeral', 'imgTexto', 'customLogoImg') and val and val.strip():
                    if val not in urls_vistas:
                        urls_vistas.add(val)
                        tipo_chave = 'bgCapa' if k in ('bgCapa', 'bgGeral') else k
                        midias_coletadas.append({
                            'tipo': tipo_chave,
                            'tipo_rotulo': 'Fundo' if tipo_chave == 'bgCapa' else ('Imagem' if tipo_chave == 'imgTexto' else 'Logotipo'),
                            'valor': val,
                            'campo_id': campo.id,
                            'apresentacao_nome': ap.nome,
                            'slide_ordem': s.ordem
                        })

                # Coleta links de QR code
                if k == 'qrLink' and val and val.strip():
                    if val not in urls_vistas:
                        urls_vistas.add(val)
                        links_coletados.append({
                            'valor': val,
                            'campo_id': campo.id,
                            'apresentacao_nome': ap.nome
                        })

                # Coleta títulos e subtítulos manuais
                if k in ('titulo', 'subtitulo') and val and len(val.strip()) > 3:
                    if val not in textos_vistos:
                        textos_vistos.add(val)
                        textos_coletados.append({
                            'chave': k,
                            'valor': val,
                            'campo_id': campo.id,
                            'apresentacao_nome': ap.nome
                        })

                # Coleta indicadores manuais
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

            slides_compartilhados.append(slide_dict)

    return jsonify({
        'status': 'sucesso',
        'projeto': {
            'id': projeto.id,
            'nome': projeto.nome,
            'descricao': projeto.descricao,
            'cor': projeto.capa_uri or '#0052ff'
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

@projetos_bp.route('/projetos/<int:id>/duplicar-slide', methods=['POST'])
@login_required
def duplicar_slide_projeto(id):
    """
    Copia um slide existente dentro do mesmo projeto para uma apresentação destino.
    """
    projeto = Projeto.query.get_or_404(id)
    if not getattr(current_user, 'admin', False) and projeto.usuario_id != current_user.id:
        return jsonify({'status': 'erro', 'mensagem': 'Permissão negada'}), 403

    data = request.get_json() or {}
    slide_origem_id = data.get('slide_origem_id')
    apresentacao_destino_id = data.get('apresentacao_destino_id')

    if not slide_origem_id or not apresentacao_destino_id:
        return jsonify({'status': 'erro', 'mensagem': 'Parâmetros slide_origem_id e apresentacao_destino_id obrigatórios'}), 400

    slide_origem = Slide.query.get_or_404(slide_origem_id)
    apresentacao_destino = Apresentacao.query.get_or_404(apresentacao_destino_id)

    # Valida que ambos pertencem ao mesmo projeto
    if slide_origem.apresentacao_pai.projeto_id != id or apresentacao_destino.projeto_id != id:
        return jsonify({'status': 'erro', 'mensagem': 'O compartilhamento de slides só é permitido dentro do mesmo projeto'}), 400

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
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao duplicar slide: {str(e)}'}), 500