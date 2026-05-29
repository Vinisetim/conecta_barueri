from flask import Blueprint, render_template

# Nome padronizado do Blueprint
main_bp = Blueprint('main', __name__)

# Rota principal (carrega a HOME)
@main_bp.route('/')
def index():
    return render_template('home/home.html')

# Rota alternativa (opcional)
@main_bp.route('/home')
def home():
    return render_template('home/home.html')