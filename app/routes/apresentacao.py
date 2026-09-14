from flask import Blueprint, render_template, request, jsonify, abort, redirect, url_for, flash
from flask_login import login_required, current_user
from app import db
from app.models import Apresentacao, Slide, CampoPreenchido, Templates, Projeto
from app.forms import CriarApresentacaoForm

apresentacao_bp = Blueprint('apresentacao', __name__)

@apresentacao_bp.route('/apresentacao')
@login_required
def apresentacao():
    """Rota principal de apresentacao"""
    return render_template('apresentacao/apresentacao.html')

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
    if getattr(current_user, 'admin', False):
        projetos_usuario = Projeto.query.order_by(Projeto.nome.asc()).all()
    else:
        projetos_usuario = Projeto.query.filter_by(usuario_id=current_user.id).order_by(Projeto.nome.asc()).all()

    # Se o usuário não possuir nenhuma pasta, cria uma pasta padrão institucional
    if not projetos_usuario:
        projeto_padrao = Projeto(
            usuario_id=current_user.id,
            nome="Projeto Geral",
            descricao="Pasta principal de apresentações institucionais"
        )
        db.session.add(projeto_padrao)
        db.session.commit()
        projetos_usuario = [projeto_padrao]

    # Popula dinamicamente as opções do select com os projetos do usuário
    form.projeto_id.choices = [(p.id, p.nome) for p in projetos_usuario]

    # Pré-seleciona a pasta caso informada via query param (?projeto_id=X)
    if request.method == 'GET' and request.args.get('projeto_id'):
        try:
            form.projeto_id.data = int(request.args.get('projeto_id'))
        except (ValueError, TypeError):
            pass

    if form.validate_on_submit():
        nome_ap = form.nome.data.strip()
        proj_id = form.projeto_id.data

        # Criação da entidade Apresentacao apontando para a pasta (projeto_id) escolhida
        nova_ap = Apresentacao(
            nome=nome_ap,
            projeto_id=proj_id
        )
        db.session.add(nova_ap)
        db.session.flush()

        # Adiciona o slide inicial padrão (Capa) com o título escolhido
        template_capa = Templates.query.filter_by(codigo='capa').first()
        if template_capa:
            slide_inicial = Slide(
                apresentacao_id=nova_ap.id,
                template_id=template_capa.id,
                ordem=1
            )
            db.session.add(slide_inicial)
            db.session.flush()

            campo_titulo = CampoPreenchido(
                slide_id=slide_inicial.id,
                chave_campo='titulo',
                valor_manual=nome_ap
            )
            campo_subtitulo = CampoPreenchido(
                slide_id=slide_inicial.id,
                chave_campo='subtitulo',
                valor_manual='Apresentação Executiva'
            )
            campo_ods = CampoPreenchido(
                slide_id=slide_inicial.id,
                chave_campo='ods',
                valor_manual='true'
            )
            db.session.add_all([campo_titulo, campo_subtitulo, campo_ods])

        db.session.commit()
        flash(f'Apresentação "{nome_ap}" criada com sucesso na pasta selecionada!', 'success')
        return redirect(url_for('apresentacao.editar_apresentacao', id=nova_ap.id))

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
        # Se projeto_id não foi informado, associamos a um projeto do usuário ou criamos um padrão
        projeto = None
        if projeto_id:
            projeto = db.session.get(Projeto, projeto_id)
        
        if not projeto:
            projeto = Projeto.query.filter_by(usuario_id=current_user.id).first()
            if not projeto:
                projeto = Projeto(
                    nome='Meu Primeiro Projeto',
                    descricao='Projeto padrão gerado automaticamente',
                    usuario_id=current_user.id
                )
                db.session.add(projeto)
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
                projeto_id=projeto.id
            )
            db.session.add(apresentacao)
            db.session.flush()

        # Salva cada slide da lista
        for idx, item in enumerate(slides_data, start=1):
            codigo_template = item.get('template') or 'capa'
            template = Templates.query.filter_by(codigo=codigo_template).first()
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
                'ods': 'true' if item.get('ods') else 'false',
                'qr': 'true' if item.get('qr') else 'false',
                'bgCapa': item.get('bgCapa'),
                'imgTexto': item.get('imgTexto'),
                'chartType': item.get('chartType', 'line'),
                'periodo': item.get('periodo', 'Últimos 12 meses')
            }

            for chave, valor in campos_para_salvar.items():
                if valor is not None:
                    campo = CampoPreenchido(
                        slide_id=slide.id,
                        chave_campo=chave,
                        valor_manual=str(valor)
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
            'ods': False,
            'qr': False,
            'bgCapa': None,
            'imgTexto': None,
            'chartType': 'line',
            'periodo': 'Últimos 12 meses'
        }

        # Reconstrói os dados a partir de CampoPreenchido
        for campo in slide.campos:
            if campo.chave_campo in ('ods', 'qr'):
                slide_dict[campo.chave_campo] = (campo.valor_manual == 'true')
            else:
                slide_dict[campo.chave_campo] = campo.valor_manual

        slides_iniciais.append(slide_dict)

    if not slides_iniciais:
        slides_iniciais = [{
            'id': 1,
            'template': 'capa',
            'titulo': apresentacao.nome,
            'subtitulo': 'Apresentação Executiva',
            'ods': True,
            'qr': False,
            'bgCapa': None,
            'imgTexto': None,
            'chartType': 'line',
            'periodo': 'Últimos 12 meses'
        }]

    return render_template(
        'apresentacao/criar-apresentacao.html',
        apresentacao=apresentacao,
        slides_iniciais=slides_iniciais
    )
