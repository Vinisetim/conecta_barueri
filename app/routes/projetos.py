from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import Projeto, Apresentacao

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

    # Garante que todo usuário possui ao menos um projeto inicial para organizar seu conteúdo
    if not projetos_usuario:
        projeto_padrao = Projeto(
            usuario_id=current_user.id,
            nome="Projeto Geral",
            descricao="Pasta principal de apresentações institucionais"
        )
        db.session.add(projeto_padrao)
        db.session.commit()
        projetos_usuario = [projeto_padrao]

    # Recupera todas as apresentações dos projetos do usuário ordenadas por criação mais recente
    projeto_ids = [p.id for p in projetos_usuario]
    apresentacoes = Apresentacao.query.filter(
        Apresentacao.projeto_id.in_(projeto_ids)
    ).order_by(Apresentacao.data_criacao.desc()).all()

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

    if not nome:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'O nome da pasta é obrigatório.'}), 400
        flash('O nome da pasta é obrigatório.', 'danger')
        return redirect(url_for('projetos.projetos'))

    novo_projeto = Projeto(
        usuario_id=current_user.id,
        nome=nome,
        descricao=descricao or 'Pasta de apresentações'
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