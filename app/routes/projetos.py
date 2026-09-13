from flask import Blueprint, render_template
from flask_login import login_required, current_user
from app import db
from app.models import Projeto, Apresentacao

projetos_bp = Blueprint('projetos', __name__)

@projetos_bp.route('/projetos')
@login_required
def projetos():
    """Rota principal de projetos e listagem de apresentações salvas"""
    # Busca os projetos associados ao usuário autenticado
    projetos_usuario = Projeto.query.filter_by(usuario_id=current_user.id).all()

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