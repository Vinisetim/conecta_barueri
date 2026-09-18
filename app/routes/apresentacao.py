import json
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
    try:
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
    except Exception:
        db.session.rollback()
        projetos_usuario = []

    # Popula dinamicamente as opções do select com os projetos do usuário
    form.projeto_id.choices = [(p.id, p.nome) for p in projetos_usuario] if projetos_usuario else [(1, 'Projeto Geral')]

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
                'tamanhoTitulo': item.get('tamanhoTitulo'),
                'tamanhoSubtitulo': item.get('tamanhoSubtitulo'),
                'corTitulo': item.get('corTitulo'),
                'corSubtitulo': item.get('corSubtitulo'),
                'ods': 'true' if item.get('ods') else 'false',
                'odsNums': json.dumps(item.get('odsNums') or []) if item.get('odsNums') is not None else None,
                'qr': 'true' if item.get('qr') else 'false',
                'qrLink': item.get('qrLink', ''),
                'logos': json.dumps(item.get('logos') or ['barueri']) if item.get('logos') is not None else None,
                'customLogoImg': item.get('customLogoImg'),
                'bgCapa': item.get('bgCapa'),
                'imgTexto': item.get('imgTexto'),
                'chartType': item.get('chartType', 'line'),
                'chartIndicador': item.get('chartIndicador'),
                'periodo': item.get('periodo', 'Últimos 12 meses'),
                'indicadores': json.dumps(item.get('indicadores') or []) if item.get('indicadores') is not None else None
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

@apresentacao_bp.route('/apresentacao/deletar/<int:id>', methods=['POST', 'DELETE'])
@login_required
def deletar_apresentacao(id):
    apresentacao = Apresentacao.query.get_or_404(id)
    # Check permissions (assuming current user must own the project unless admin)
    if not getattr(current_user, 'admin', False) and apresentacao.projeto and apresentacao.projeto.usuario_id != current_user.id:
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
            'logos': ['barueri'],
            'customLogoImg': None,
            'ods': False,
            'odsNums': [],
            'qr': False,
            'qrLink': '',
            'bgCapa': None,
            'imgTexto': None,
            'chartType': 'line',
            'chartIndicador': 1,
            'periodo': 'Últimos 12 meses',
            'indicadores': []
        }

        # Reconstrói os dados a partir de CampoPreenchido
        for campo in slide.campos:
            val = campo.valor_manual
            if campo.chave_campo in ('ods', 'qr'):
                slide_dict[campo.chave_campo] = (val == 'true')
            elif campo.chave_campo in ('tamanhoTitulo', 'tamanhoSubtitulo'):
                try:
                    slide_dict[campo.chave_campo] = float(val) if val else (4.0 if campo.chave_campo == 'tamanhoTitulo' else 1.8)
                except (ValueError, TypeError):
                    slide_dict[campo.chave_campo] = 4.0 if campo.chave_campo == 'tamanhoTitulo' else 1.8
            elif campo.chave_campo in ('logos', 'odsNums', 'indicadores'):
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
            'indicadores': []
        }]

    # Carrega as pastas para exibir no seletor de salvar
    if getattr(current_user, 'admin', False):
        projetos = Projeto.query.order_by(Projeto.nome.asc()).all()
    else:
        projetos = Projeto.query.filter_by(usuario_id=current_user.id).order_by(Projeto.nome.asc()).all()

    return render_template(
        'apresentacao/criar-apresentacao.html',
        apresentacao=apresentacao,
        slides_iniciais=slides_iniciais,
        projetos=projetos
    )
