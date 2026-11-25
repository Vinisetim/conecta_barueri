import json
from flask import Blueprint, render_template, request, jsonify, abort, redirect, url_for, flash
from flask_login import login_required, current_user
from app import db
from app.models import Apresentacao, Slide, CampoPreenchido, Templates, Pasta, Projeto, Indicador, Ods
from app.forms import CriarApresentacaoForm

apresentacao_bp = Blueprint('apresentacao', __name__)

@apresentacao_bp.route('/apresentacao')
@login_required
def apresentacao():
    """
    Rota principal de apresentações.
    Busca os projetos (pastas) e apresentações salvas no banco de dados para o usuário autenticado.
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
        'apresentacao/apresentacao.html',
        projetos=pastas_usuario,
        pastas=pastas_usuario,
        apresentacoes=apresentacoes
    )


@apresentacao_bp.route('/apresentacao/criar', methods=['GET', 'POST'])
@login_required
def criar_apresentacao():
    """
    Rota para criação de uma nova apresentação vinculada a uma pasta (Projeto).
    Utiliza CriarApresentacaoForm (Flask-WTF) com proteção CSRF.
    Ao validar os dados, instancia Apresentacao, persiste no banco e redireciona ao editor.
    """
    form = CriarApresentacaoForm()

    # Busca as pastas (projetos) do usuário logado (ou todas se for admin)
    try:
        if getattr(current_user, 'admin', False):
            pastas_usuario = Pasta.query.order_by(Pasta.nome.asc()).all()
        else:
            pastas_usuario = Pasta.query.filter_by(usuario_id=current_user.id).order_by(Pasta.nome.asc()).all()

        # Se o usuário não possuir nenhuma pasta, cria uma pasta padrão institucional
        if not pastas_usuario:
            pasta_padrao = Pasta(
                usuario_id=current_user.id,
                nome="Pasta Geral",
                descricao="Pasta principal de apresentações institucionais"
            )
            db.session.add(pasta_padrao)
            db.session.commit()
            pastas_usuario = [pasta_padrao]
    except Exception:
        db.session.rollback()
        projetos_usuario = []

    # Popula dinamicamente as opções do select com os projetos do usuário
    form.projeto_id.choices = [(p.id, p.nome) for p in pastas_usuario] if pastas_usuario else [(1, 'Pasta Geral')]

    # Pré-seleciona a pasta e o template inicial caso informados via query param (?projeto_id=X&template=Y)
    if request.method == 'GET':
        if request.args.get('projeto_id'):
            try:
                form.projeto_id.data = int(request.args.get('projeto_id'))
            except (ValueError, TypeError):
                pass
        tpl_arg = (request.args.get('template') or '').strip()
        if tpl_arg in ('capa', 'indicadores', 'grafico', 'imagem_texto', 'mapa', 'encerramento'):
            form.template_inicial.data = tpl_arg

    if form.validate_on_submit():
        nome_ap = form.nome.data.strip()
        proj_id = form.projeto_id.data
        tpl_escolhido = (form.template_inicial.data or request.args.get('template') or 'capa').strip()
        if tpl_escolhido not in ('capa', 'indicadores', 'grafico', 'imagem_texto', 'mapa', 'encerramento'):
            tpl_escolhido = 'capa'

        # Criação da entidade Apresentacao apontando para a pasta (projeto_id) escolhida
        nova_ap = Apresentacao(
            nome=nome_ap,
            pasta_id=proj_id
        )
        db.session.add(nova_ap)
        db.session.flush()

        # Busca o template selecionado no banco (ou fallback para capa)
        template_obj = Templates.query.filter_by(codigo=tpl_escolhido).first()
        if not template_obj:
            template_obj = Templates.query.filter_by(codigo='capa').first()

        if template_obj:
            slide_inicial = Slide(
                apresentacao_id=nova_ap.id,
                template_id=template_obj.id,
                ordem=1
            )
            db.session.add(slide_inicial)
            db.session.flush()

            # Define subtítulo e campos padrão de acordo com o template inicial escolhido
            subtitulos_padrao = {
                'capa': 'Apresentação Executiva - Indicadores Municipais',
                'indicadores': 'Plataforma integrada de dados da cidade.',
                'grafico': 'Evolução no número de atendimentos e métricas setoriais.',
                'imagem_texto': 'Resumo comparativo dos principais dados socioeconômicos.', 'mapa': 'Mapeamento territorial e indicadores por região.', 'encerramento': 'Juntos construindo uma cidade cada vez mais inteligente, humana e sustentável.'
            }

            campos_iniciais = [
                CampoPreenchido(
                    slide_id=slide_inicial.id,
                    chave_campo='titulo',
                    valor_manual=nome_ap
                ),
                CampoPreenchido(
                    slide_id=slide_inicial.id,
                    chave_campo='subtitulo',
                    valor_manual=subtitulos_padrao.get(tpl_escolhido, 'Apresentação Executiva')
                ),
                CampoPreenchido(
                    slide_id=slide_inicial.id,
                    chave_campo='ods',
                    valor_manual='true'
                ),
                CampoPreenchido(
                    slide_id=slide_inicial.id,
                    chave_campo='odsNums',
                    valor_manual=json.dumps(['11'])
                )
            ]

            # Se o usuário escolheu começar por Indicadores, busca métricas oficiais do banco de dados
            if tpl_escolhido == 'indicadores':
                inds_db = Indicador.query.order_by(Indicador.id.asc()).limit(4).all()
                icones_map = {
                    'Saúde': 'bi-heart-pulse',
                    'Educação': 'bi-book',
                    'Segurança Urbana': 'bi-shield-check',
                    'Segurança': 'bi-shield-check',
                    'Inovação e Tecnologia (CIT)': 'bi-cpu',
                    'Mobilidade': 'bi-car-front',
                    'Finanças e Planejamento': 'bi-graph-up-arrow'
                }
                cores_map = {
                    'Saúde': '#3b82f6',
                    'Educação': '#f59e0b',
                    'Segurança Urbana': '#a855f7',
                    'Segurança': '#a855f7',
                    'Inovação e Tecnologia (CIT)': '#0052ff',
                    'Mobilidade': '#10b981',
                    'Finanças e Planejamento': '#ef4444'
                }
                indicadores_iniciais = []
                for ind in inds_db:
                    indicadores_iniciais.append({
                        'id': ind.id,
                        'id_padrao': ind.id,
                        'nome': ind.nome_metrica,
                        'valor': f"{ind.valor_numerico:g} {ind.unidade_medida}".strip(),
                        'icone': icones_map.get(ind.secretaria, 'bi-graph-up'),
                        'cor': cores_map.get(ind.secretaria, '#0052ff')
                    })
                if not indicadores_iniciais:
                    indicadores_iniciais = [
                        {"id": 1, "id_padrao": 1, "nome": "Processos Digitais", "valor": "98.4 %", "icone": "bi-cpu", "cor": "#0052ff"},
                        {"id": 2, "id_padrao": 2, "nome": "Wi-Fi Gratuito", "valor": "185 pontos", "icone": "bi-wifi", "cor": "#10b981"},
                        {"id": 3, "id_padrao": 3, "nome": "Consultas Básicas", "valor": "2.45 M", "icone": "bi-heart-pulse", "cor": "#3b82f6"},
                        {"id": 4, "id_padrao": 4, "nome": "Cobertura Vacinal", "valor": "96.8 %", "icone": "bi-shield-check", "cor": "#a855f7"}
                    ]
                campos_iniciais.append(
                    CampoPreenchido(
                        slide_id=slide_inicial.id,
                        chave_campo='indicadores',
                        valor_manual=json.dumps(indicadores_iniciais)
                    )
                )
            elif tpl_escolhido == 'grafico':
                campos_iniciais.extend([
                    CampoPreenchido(slide_id=slide_inicial.id, chave_campo='chartType', valor_manual='bar'),
                    CampoPreenchido(slide_id=slide_inicial.id, chave_campo='chartIndicador', valor_manual='1'),
                    CampoPreenchido(slide_id=slide_inicial.id, chave_campo='periodo', valor_manual='Últimos 12 meses')
                ])
            elif tpl_escolhido == 'encerramento':
                campos_iniciais.extend([
                    CampoPreenchido(slide_id=slide_inicial.id, chave_campo='encEmail', valor_manual='contato@barueri.sp.gov.br'),
                    CampoPreenchido(slide_id=slide_inicial.id, chave_campo='encTelefone', valor_manual='(11) 4199-8000'),
                    CampoPreenchido(slide_id=slide_inicial.id, chave_campo='encSite', valor_manual='www.barueri.sp.gov.br')
                ])

            db.session.add_all(campos_iniciais)

        db.session.commit()
        flash(f'Apresentação "{nome_ap}" criada com sucesso!', 'success')
        return redirect(url_for('apresentacao.editar_apresentacao', id=nova_ap.id, template=tpl_escolhido))

    return render_template('apresentacao/nova_apresentacao.html', form=form)


@apresentacao_bp.route('/apresentacao/salvar', methods=['POST'])
@login_required
def salvar_apresentacao():
    """
    Persistência relacional de apresentações, slides e campos preenchidos.
    Recebe payload JSON enviado via fetch() pelo editor de slides.
    """
    data = request.get_json()
    if not data:
        return jsonify({'status': 'erro', 'mensagem': 'Nenhum dado recebido no payload.'}), 400

    apresentacao_id = data.get('apresentacao_id')
    titulo = (data.get('titulo') or '').strip() or 'Apresentação Sem Título'
    projeto_id = data.get('projeto_id')
    slides_data = data.get('slides') or []

    try:
        # Se projeto_id (pasta_id) não foi informado, associamos a uma pasta do usuário ou criamos uma padrão
        pasta = None
        if projeto_id:
            pasta = db.session.get(Pasta, projeto_id)
        
        if not pasta:
            pasta = Pasta.query.filter_by(usuario_id=current_user.id).first()
            if not pasta:
                pasta = Pasta(
                    nome='Minha Primeira Pasta',
                    descricao='Pasta padrão gerada automaticamente',
                    usuario_id=current_user.id
                )
                db.session.add(pasta)
                db.session.flush()

        # Verifica se é atualização ou criação de nova apresentação
        apresentacao = None
        if apresentacao_id:
            apresentacao = db.session.get(Apresentacao, apresentacao_id)

        if apresentacao:
            apresentacao.nome = titulo
            # Remove campos e slides antigos para atualizar com a nova ordem e conteúdo
            slides_antigos = Slide.query.filter_by(apresentacao_id=apresentacao.id).all()
            for s in slides_antigos:
                for c in s.campos:
                    db.session.delete(c)
                db.session.delete(s)
            db.session.flush()
        else:
            apresentacao = Apresentacao(
                nome=titulo,
                pasta_id=pasta.id
            )
            db.session.add(apresentacao)
            db.session.flush()

        # Salva cada slide da lista
        for idx, item in enumerate(slides_data, start=1):
            codigo_template = item.get('template') or 'capa'
            template = Templates.query.filter_by(codigo=codigo_template).first()
            if not template and codigo_template in ('encerramento', 'mapa'):
                template = Templates(nome='Encerramento' if codigo_template == 'encerramento' else 'Mapa Interativo', codigo=codigo_template, descricao='Template institucional')
                db.session.add(template)
                db.session.flush()
            if not template:
                template = Templates.query.filter_by(codigo='capa').first()

            slide = Slide(
                apresentacao_id=apresentacao.id,
                template_id=template.id,
                ordem=idx
            )
            db.session.add(slide)
            db.session.flush()

            # Mapeamento dos campos estruturados para a tabela CampoPreenchido
            campos_para_salvar = {
                'titulo': item.get('titulo', ''),
                'subtitulo': item.get('subtitulo', ''),
                'tamanhoTitulo': item.get('tamanhoTitulo'),
                'tamanhoSubtitulo': item.get('tamanhoSubtitulo'),
                'corTitulo': item.get('corTitulo'),
                'corSubtitulo': item.get('corSubtitulo'),
                'corFundo': item.get('corFundo', '#ffffff'),
                'ods': 'true' if item.get('ods') else 'false',
                'odsNums': json.dumps(item.get('odsNums') or []) if item.get('odsNums') is not None else None,
                'qr': 'true' if item.get('qr') else 'false',
                'qrLink': item.get('qrLink', ''),
                'logos': json.dumps(item.get('logos') or ['barueri']) if item.get('logos') is not None else None,
                'customLogoImg': item.get('customLogoImg'),
                'bgCapa': item.get('bgCapa') or item.get('bgGeral'),
                'imgTexto': item.get('imgTexto'),
                'chartType': item.get('chartType', 'line'),
                'chartIndicador': item.get('chartIndicador'),
                'periodo': item.get('periodo', 'Últimos 12 meses'),
                'indicadores': json.dumps(item.get('indicadores') or []) if item.get('indicadores') is not None else None,
                'mapaTipo': item.get('mapaTipo', 'barueri'),
                'mapaPins': json.dumps(item.get('mapaPins') or []) if item.get('mapaPins') is not None else None,
                'pilar_1_titulo': item.get('pilar_1_titulo'),
                'pilar_1_texto': item.get('pilar_1_texto'),
                'pilar_2_titulo': item.get('pilar_2_titulo'),
                'pilar_2_texto': item.get('pilar_2_texto'),
                'pilar_3_titulo': item.get('pilar_3_titulo'),
                'pilar_3_texto': item.get('pilar_3_texto'),
                'encEmail': item.get('encEmail'),
                'encTelefone': item.get('encTelefone'),
                'encSite': item.get('encSite')
            }

            origens_campos = item.get('origens_campos') or {}

            for chave, valor in campos_para_salvar.items():
                if valor is not None:
                    origem_id = origens_campos.get(chave)
                    campo = CampoPreenchido(
                        slide_id=slide.id,
                        chave_campo=chave,
                        valor_manual=str(valor),
                        campo_origem_id=origem_id if isinstance(origem_id, int) else None
                    )
                    db.session.add(campo)

        # Confirmação da transação
        db.session.commit()

        return jsonify({
            'status': 'sucesso',
            'apresentacao_id': apresentacao.id,
            'mensagem': 'Apresentação salva com sucesso!'
        })

    except Exception as e:
        db.session.rollback()
        print(f"[ERRO AO SALVAR APRESENTACAO]: {e}")
        return jsonify({'status': 'erro', 'mensagem': f'Erro interno ao salvar: {str(e)}'}), 500

@apresentacao_bp.route('/apresentacao/deletar/<int:id>', methods=['POST', 'DELETE'])
@login_required
def deletar_apresentacao(id):
    apresentacao = Apresentacao.query.get_or_404(id)
    # Check permissions (assuming current user must own the project unless admin)
    if not getattr(current_user, 'admin', False) and apresentacao.pasta and apresentacao.pasta.usuario_id != current_user.id:
        if request.is_json: return jsonify({'status': 'erro', 'mensagem': 'Permissão negada'}), 403
        flash('Permissão negada.', 'danger')
        return redirect(url_for('projetos.projetos'))

    try:
        slides = Slide.query.filter_by(apresentacao_id=apresentacao.id).all()
        for s in slides:
            CampoPreenchido.query.filter_by(slide_id=s.id).delete(synchronize_session=False)
            db.session.delete(s)
        db.session.delete(apresentacao)
        db.session.commit()

        if request.is_json:
            return jsonify({'status': 'sucesso', 'mensagem': 'Apresentação deletada com sucesso do banco de dados!'})
        flash('Apresentação deletada com sucesso!', 'success')
        return redirect(url_for('projetos.projetos'))
    except Exception as e:
        db.session.rollback()
        print(f"[ERRO AO DELETAR APRESENTACAO]: {e}")
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': f'Erro ao deletar apresentação: {str(e)}'}), 500
        flash('Erro ao deletar apresentação.', 'danger')
        return redirect(url_for('projetos.projetos'))

@apresentacao_bp.route('/apresentacao/editar/<int:id>')
@login_required
def editar_apresentacao(id):
    """
    Restaura uma apresentação previamente salva no banco para edição no editor.
    """
    apresentacao = db.session.get(Apresentacao, id)
    if not apresentacao:
        abort(404)

    # Recupera os slides na ordem correta
    slides_query = Slide.query.filter_by(apresentacao_id=apresentacao.id).order_by(Slide.ordem.asc()).all()
    slides_iniciais = []

    for slide in slides_query:
        slide_dict = {
            'id': slide.ordem,
            'template': slide.template_usado.codigo if slide.template_usado else 'capa',
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
            'pilar_3_texto': '',
            'encEmail': 'contato@barueri.sp.gov.br',
            'encTelefone': '(11) 4199-8000',
            'encSite': 'www.barueri.sp.gov.br',
            'origens_campos': {}
        }

        # Reconstrói os dados a partir de CampoPreenchido
        for campo in slide.campos:
            val = campo.valor_manual
            if campo.campo_origem_id:
                slide_dict['origens_campos'][campo.chave_campo] = campo.campo_origem_id
            if campo.chave_campo in ('ods', 'qr'):
                slide_dict[campo.chave_campo] = (val == 'true')
            elif campo.chave_campo in ('bgCapa', 'bgGeral'):
                slide_dict['bgCapa'] = val
                slide_dict['bgGeral'] = val
            elif campo.chave_campo in ('tamanhoTitulo', 'tamanhoSubtitulo'):
                try:
                    slide_dict[campo.chave_campo] = float(val) if val else (4.0 if campo.chave_campo == 'tamanhoTitulo' else 1.8)
                except (ValueError, TypeError):
                    slide_dict[campo.chave_campo] = 4.0 if campo.chave_campo == 'tamanhoTitulo' else 1.8
            elif campo.chave_campo in ('logos', 'odsNums', 'indicadores', 'mapaPins'):
                try:
                    slide_dict[campo.chave_campo] = json.loads(val) if val else []
                except Exception:
                    slide_dict[campo.chave_campo] = []
            elif campo.chave_campo == 'chartIndicador':
                try:
                    slide_dict[campo.chave_campo] = int(val) if val else 1
                except (ValueError, TypeError):
                    slide_dict[campo.chave_campo] = 1
            else:
                slide_dict[campo.chave_campo] = val

        slides_iniciais.append(slide_dict)

    tpl_query = (request.args.get('template') or '').strip()
    if tpl_query in ('capa', 'indicadores', 'grafico', 'imagem_texto', 'mapa', 'encerramento') and len(slides_iniciais) == 1:
        slides_iniciais[0]['template'] = tpl_query

    if not slides_iniciais:
        slides_iniciais = [{
            'id': 1,
            'template': 'capa',
            'titulo': apresentacao.nome,
            'subtitulo': 'Apresentação Executiva - Indicadores Municipais',
            'tamanhoTitulo': 4.0,
            'tamanhoSubtitulo': 1.8,
            'corTitulo': '#0f172a',
            'corSubtitulo': '#64748b',
            'logos': ['barueri'],
            'customLogoImg': None,
            'ods': True,
            'odsNums': ['11'],
            'qr': False,
            'qrLink': '',
            'bgCapa': None,
            'imgTexto': None,
            'chartType': 'line',
            'chartIndicador': 1,
            'periodo': 'Últimos 12 meses',
            'indicadores': [],
            'mapaTipo': 'barueri',
            'mapaPins': []
        }]

    # Carrega as pastas do usuário diretamente do banco para o seletor de salvar
    if getattr(current_user, 'admin', False):
        pastas = Pasta.query.order_by(Pasta.nome.asc()).all()
    else:
        pastas = Pasta.query.filter_by(usuario_id=current_user.id).order_by(Pasta.nome.asc()).all()

    return render_template(
        'apresentacao/criar-apresentacao.html',
        apresentacao=apresentacao,
        slides_iniciais=slides_iniciais,
        pastas=pastas,
        projetos=pastas
    )


# ==============================================================================
# APIS DE DADOS OFICIAIS DO BANCO DE DADOS (INDICADORES E ODS)
# ==============================================================================

@apresentacao_bp.route('/api/indicadores', methods=['GET'])
@login_required
def api_indicadores():
    """
    Retorna métricas e indicadores oficiais do município de Barueri puxados diretamente
    da tabela apresentacao.indicador, incluindo suas séries históricas para gráficos.
    """
    inds = Indicador.query.order_by(Indicador.id.asc()).all()
    icones_map = {
        'Saúde': 'bi-heart-pulse',
        'Educação': 'bi-book',
        'Segurança Urbana': 'bi-shield-check',
        'Segurança': 'bi-shield-check',
        'Inovação e Tecnologia (CIT)': 'bi-cpu',
        'Mobilidade': 'bi-car-front',
        'Finanças e Planejamento': 'bi-graph-up-arrow'
    }
    cores_map = {
        'Saúde': '#3b82f6',
        'Educação': '#f59e0b',
        'Segurança Urbana': '#a855f7',
        'Segurança': '#a855f7',
        'Inovação e Tecnologia (CIT)': '#0052ff',
        'Mobilidade': '#10b981',
        'Finanças e Planejamento': '#ef4444'
    }
    resultado = []
    for i in inds:
        resultado.append({
            'id': i.id,
            'id_padrao': i.id,
            'secretaria': i.secretaria,
            'nome': i.nome_metrica,
            'nome_metrica': i.nome_metrica,
            'valor': f"{i.valor_numerico:g} {i.unidade_medida}".strip(),
            'valor_numerico': i.valor_numerico,
            'unidade_medida': i.unidade_medida,
            'icone': icones_map.get(i.secretaria, 'bi-graph-up'),
            'cor': cores_map.get(i.secretaria, '#0052ff'),
            'historico': i.historico_json or []
        })
    return jsonify({'status': 'sucesso', 'total': len(resultado), 'indicadores': resultado})


@apresentacao_bp.route('/api/indicadores/<int:id>', methods=['GET'])
@login_required
def api_indicador_detalhes(id):
    """Retorna os dados detalhados e série histórica de um indicador específico do banco."""
    ind = Indicador.query.get_or_404(id)
    return jsonify({
        'status': 'sucesso',
        'indicador': {
            'id': ind.id,
            'secretaria': ind.secretaria,
            'nome_metrica': ind.nome_metrica,
            'valor_numerico': ind.valor_numerico,
            'unidade_medida': ind.unidade_medida,
            'valor_formatado': f"{ind.valor_numerico:g} {ind.unidade_medida}".strip(),
            'historico': ind.historico_json or []
        }
    })


@apresentacao_bp.route('/api/ods', methods=['GET'])
@login_required
def api_ods():
    """
    Retorna os 17 Objetivos de Desenvolvimento Sustentável (ODS) da ONU
    puxados diretamente da tabela apresentacao.ods do banco de dados.
    """
    ods_list = Ods.query.order_by(Ods.numero.asc()).all()
    resultado = []
    for o in ods_list:
        resultado.append({
            'id': o.id,
            'numero': o.numero,
            'num': str(o.numero),
            'titulo': o.titulo,
            'label': o.titulo,
            'descricao': o.descricao or '',
            'icone_url': o.icone_url or '',
            'cor_hex': o.cor_hex or '#0052ff',
            'color': o.cor_hex or '#0052ff'
        })
    return jsonify({'status': 'sucesso', 'total': len(resultado), 'ods': resultado})
