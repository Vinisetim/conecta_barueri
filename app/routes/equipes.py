from  flask import Blueprint, render_template
equipes_bp = Blueprint('equipes', __name__)


@equipes_bp.route('/equipes')
def admin():
    return render_template('admin/equipes.html')