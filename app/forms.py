from flask_wtf import FlaskForm #A classe contém automaticamente a proteção CSRF no formulário
from wtforms import StringField, PasswordField, SubmitField, BooleanField, SelectField
from wtforms.validators import DataRequired, Email, Length

class LoginForm(FlaskForm):
    """
    Formulário de Autenticação de Usuários.
    
    A herança de FlaskForm garante automaticamente:
    - Geração e validação de tokens CSRF via {{ form.hidden_tag() }}
    - Validação de formato e obrigatoriedade no servidor antes de consultar o banco
    """

    # E-mail: sanitizado, validado com Regex de e-mail e limitado em 150 caracteres
    email = StringField('Usuário / E-mail', validators=[
        DataRequired(message='O e-mail é obrigatório para acessar o sistema.'),
        Email(message='Informe um endereço de e-mail válido (ex: usuario@barueri.sp.gov.br).'),
        Length(max=150, message='O e-mail deve ter no máximo 150 caracteres.')
    ])

    # Senha: tipo PasswordField oculta caracteres no navegador.
    # Limite superior de 128 caracteres previne ataques de DoS por sobrecarga de processamento no algoritmo Bcrypt.
    senha = PasswordField('Senha', validators=[
        DataRequired(message='A senha é obrigatória.'),
        Length(min=4, max=128, message='A senha deve ter entre 4 e 128 caracteres.')
    ])

    # Opção para persistir cookie de sessão com duração estendida
    lembrar = BooleanField('Lembrar de mim')

    # Botão de submissão do formulário
    submit = SubmitField('Entrar')


class CriarApresentacaoForm(FlaskForm):
    """
    Formulário para criação de nova Apresentação organizada em uma Pasta (Projeto).
    
    Campos:
    - nome: Título da apresentação (string de 3 a 200 caracteres)
    - projeto_id: Pasta (Projeto) de destino, populado dinamicamente no backend
    """
    nome = StringField('Nome da Apresentação', validators=[
        DataRequired(message='Informe o nome da apresentação.'),
        Length(min=3, max=200, message='O nome da apresentação deve ter entre 3 e 200 caracteres.')
    ])

    projeto_id = SelectField('Pasta do Projeto', coerce=int, validators=[
        DataRequired(message='Selecione uma pasta para salvar sua apresentação.')
    ])

    submit = SubmitField('Criar e Ir para o Editor')