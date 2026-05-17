from flask import Blueprint, render_template

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login')
def login():
    # Por enquanto, apenas para não dar erro
    return "Página de Login em construção"