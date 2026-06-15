from flask import Blueprint, render_template

indicadores_bp = Blueprint('indicadores', __name__)

@indicadores_bp.route('/indicadores')
def indicadores():
    """Rota principal de apresentacao"""
    return render_template('apresentacao/indicadores.html')