from flask_wtf import FlaskForm #A classe contém automaticamente a proteção CSRF no formulário
from wtforms import StringField, PasswordField, SubmitField, BooleanField
from wtforms.validators import DataRequired, Email, Length

class LoginForm(FlaskForm):
    """Formulário de Autenticação, Valida as Credenciais antes de consultas ao banco"""

    #E-mail validado por formato e com preenchimento obrigatório
    email = StringField('Usuário', validators=[
        DataRequired(message='O email é obrigatório'),
        Email(message='Digite um e-mail válido'),
        Length(max=150, message='E-mail muito longo')
    ])

    #PasswordField oculta o texto automaticamente no HTML
    senha = PasswordField('Senha', validators=[
        DataRequired(message='A Senha é Obrigatória'),
        Length(min=4, message='A senha deve ter ao minímo 4 caracteres'),
    ])

    lembrar = BooleanField('Lembrar de mim')

    submit = SubmitField('Entrar')