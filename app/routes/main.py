from flask import Blueprint, render_template

# Nome padronizado do Blueprint
main_bp = Blueprint('main', __name__)

# Rota principal (carrega a Landing Page)
@main_bp.route('/')
def index():
    return render_template('landing/index.html')