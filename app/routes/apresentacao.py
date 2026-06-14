from flask import Blueprint, render_template

apresentacao_bp = Blueprint('apresentacao', __name__)

@apresentacao_bp.route('/indicadores')
def indicadores():
    """Rota principal de apresentacao"""
    return render_template('apresentacao/apresentacao.html')