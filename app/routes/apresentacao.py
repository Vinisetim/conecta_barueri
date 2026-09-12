from flask import Blueprint, render_template

apresentacao_bp = Blueprint('apresentacao', __name__)

@apresentacao_bp.route('/apresentacao')
def apresentacao():
    """Rota principal de apresentacao"""
    return render_template('apresentacao/apresentacao.html')

@apresentacao_bp.route('/apresentacao/criar')
def criar_apresentacao():
    """Rota da futura tela de criação de apresentações"""
    return render_template('apresentacao/criar-apresentacao.html')
