from flask import Blueprint, render_template

projetos_bp = Blueprint('projetos', __name__)

@projetos_bp.route('/projetos')
def projetos():
    """Rota principal de apresentacao"""
    return render_template('admin/admin_projetos.html')