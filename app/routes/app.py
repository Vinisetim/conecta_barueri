from flask import Blueprint, render_template

app_bp = Blueprint('app', __name__)

@app_bp.route('/home')
def home():
    """Rota principal pós-login"""
    return render_template('app/home/home.html')
