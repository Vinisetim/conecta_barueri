from urllib.parse import urlsplit
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app.models import Usuario
from app import bcrypt
from app.forms import LoginForm

# Blueprint de autenticação registrado com o nome 'auth'
auth_bp = Blueprint('auth', __name__)

# Hash Bcrypt pré-calculado para manter a latência de verificação uniforme (mitigação de Timing Attack / Enumeração de Usuários)
DUMMY_BCRYPT_HASH = "$2b$12$e8Y43K.9i75bC1Z9Hh5tG.17KzWvDqGzYjCgH7wFq9j0z9i3Y6cK6"


def is_safe_url(target):
    """
    Valida se a URL de redirecionamento é segura (endereço interno e relativo da aplicação).
    Protege contra ataques de Open Redirect (OWASP A01).
    """
    if not target:
        return False
    parsed = urlsplit(target)
    # Impede URLs que possuam esquema (ex: http:) ou netloc (ex: site-externo.com)
    return parsed.netloc == '' and parsed.scheme == '' and target.startswith('/')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """
    Rota de Autenticação de Usuários:
    - GET: Renderiza o formulário de login (ou redireciona à home se já autenticado).
    - POST: Valida CSRF, sanitiza dados, checa credenciais via Bcrypt e inicia sessão.
    """
    # Usuário já autenticado é encaminhado imediatamente à área restrita
    if current_user.is_authenticated:
        return redirect(url_for('app.home'))

    form = LoginForm()

    if form.validate_on_submit():
        # Sanitização e normalização de e-mail (espaços em branco e caixa baixa)
        email_limpo = form.email.data.strip().lower()
        senha_digitada = form.senha.data

        try:
            # Busca pelo usuário no banco via ORM SQLAlchemy
            usuario = Usuario.query.filter_by(email=email_limpo).first()

            # Verificação com tempo de resposta constante:
            # Se o usuário e sua senha existirem, executa a checagem real; caso contrário, executa hash dummy.
            if usuario and usuario.senha_obj:
                senha_valida = usuario.verificar_senha(senha_digitada)
            else:
                bcrypt.check_password_hash(DUMMY_BCRYPT_HASH, senha_digitada)
                senha_valida = False

            if usuario and senha_valida:
                # Inicia sessão protegida no Flask-Login
                login_user(usuario, remember=form.lembrar.data)

                # Redirecionamento seguro para a página solicitada previamente ou para o painel principal
                next_page = request.args.get('next')
                if next_page and is_safe_url(next_page):
                    return redirect(next_page)
                return redirect(url_for('app.home'))

            # Mensagem deliberadamente genérica para não revelar existência de contas
            flash('E-mail ou senha incorretos. Por favor, verifique seus dados e tente novamente.', 'danger')

        except Exception as erro:
            # Log no terminal para diagnóstico rápido da equipe de desenvolvimento
            print(f"⚠️ [ERRO DE AUTENTICAÇÃO/BANCO DE DADOS]: {erro}")
            flash('Não foi possível conectar ao banco de dados PostgreSQL. Verifique se o banco está rodando e com credenciais corretas.', 'danger')

    return render_template('auth/login.html', form=form)


@auth_bp.route('/logout')
@login_required
def logout():
    """
    Encerra a sessão ativa do usuário com Flask-Login, limpando cookies de autenticação.
    """
    logout_user()
    flash('Você encerrou sua sessão com segurança.', 'info')
    return redirect(url_for('auth.login'))


# ============================================================
# ROTA DE DESENVOLVIMENTO (AMBIENTE LOCAL)
# ============================================================
@auth_bp.route('/dev-login')
def dev_login():
    """
    Rota auxiliar de desenvolvimento local.
    Redireciona para o endpoint correto da área logada ('app.home').
    """
    return redirect(url_for('app.home'))