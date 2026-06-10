from  flask import Blueprint, render_template
funcionarios_bp = Blueprint('funcionarios', __name__)


@funcionarios_bp.route('/funcionarios')
def funcionarios():
    return render_template('funcionarios/funcionarios.html')