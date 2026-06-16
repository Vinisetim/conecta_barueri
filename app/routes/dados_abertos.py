from flask import Blueprint, render_template

dados_abertos_bp = Blueprint('dados_abertos', __name__)


@dados_abertos_bp.route('/dados-abertos')
def dados_abertos():
    """Rota principal da tela de Dados Abertos"""
    return render_template('dados_abertos/dados_abertos.html')