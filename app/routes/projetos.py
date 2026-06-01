from  flask import Blueprint, render_template
projetos_bp = Blueprint('projetos', __name__)


@projetos_bp.route('/projetos')
def projetos():
    return render_template('project/projetos.html')