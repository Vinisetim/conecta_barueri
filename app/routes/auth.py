from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user,login_required
from app.models import Usuario
from app import bcrypt
from app.forms import LoginForm

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Rota de Autenticação
        GET => exibe o formulário de login
        POST => Valida credenciais e inicia sessão"""

    form = LoginForm()

    if form.validate_on_submit():
        #Busca o usuário pelo email digitado no formulário
        usuario = Usuario.query.filter_by(email=form.email.data).first()

        #Verifica se o usuário existe e a senha bate com o Hash
        if usuario and bcrypt.check_password_hash(usuario.senha.senha, form.senha.data):
            login_user(usuario, remember=form.lembrar.data)

            #Se o usuário tentou acessar uma página protegida, redireciona para ela, se não vai para main
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.index'))

        flash('Credenciais inválidas. Tente novamente', 'danger')
    return render_template('auth/login.html', form=form)

@auth_bp.route('/logout')
@login_required
def logout():
    """Encerra a sessão do usuario autenticado e redireciona para a landing page"""
    logout_user()
    return redirect(url_for('main.index'))
#render_template(auth/login.html)

