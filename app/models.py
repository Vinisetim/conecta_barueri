from app import db, bcrypt
from flask_login import UserMixin
from app import login_manager

@login_manager.user_loader
def load_user(user_id):
    """
    Callback obrigatório do Flask-Login. Dado um ID, retorna o objeto do usuário correspondente.
    Chamado automaticamente a cada requisição para checar sessão
    """
    return Usuario.query.get(int(user_id))

class Usuario(UserMixin, db.Model):
    """
    Mapeia a tabela login.usuario do PostgreSQL.
    Herda User Mixin para compatibilildade com Flask-Login.
    """
    __tablename__ = 'usuario'
    __table_args__ = {'schema': 'login'}

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    admin = db.Column(db.Boolean, default=False)

    #Relacionamento 1:1 com a tabela senha
    #cria automaticamente usuario.senha e senha.usuario usando o backref
    senha = db.relationship('Senha', backref='usuario', uselist=False)

class Senha(db.Model):
    """
    Mapeia a tabela login.senha do PostgreSQL.
    Separada do Usuario por segurança - isola credenciais dos dados de perfil
    """

    __tablename__ =  'senha'
    __table_args__ = {'schema': 'login'}

    email = db.Column(db.Text, nullable=False)
    senha = db.Column(db.String(255), nullable=False)