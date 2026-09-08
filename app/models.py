from app import db, bcrypt, login_manager
from flask_login import UserMixin

@login_manager.user_loader
def load_user(user_id):
    #busca ID na tabela usuarios
    return Usuario.query.get(int(user_id))

class Usuario(UserMixin, db.Model):
    #configurações da tabela
    __tablename__ = 'usuario'
    __table_args__ = {'schema':'login'}

    #colunas
    #id chave primaria e numero inteiro
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255))
    email = db.Column(db.Text)
    admin = db.Column(db.Boolean, default=False)
    status = db.Column(db.Boolean, default=True)
    #relacionamento com a tabela senha
    senha_obj = db.relationship('Senha', backref='usuario', uselist=False)
    projetos = db.relationship('Projeto', backref='dono', lazy=True)

class Senha(db.Model):
    __tablename__ = 'senhas'
    __table_args__ = {'schema':'login'}

    #colunas

    # o usuario id aqui vai funcionar como chave estrengeira que liga as duas e como chave primaria desta tabela
    usuario_id = db.Column(db.Integer, db.ForeignKey('login.usuario.id'), primary_key=True)

    #senha criptografada
    senha = db.Column(db.String(255), nullable=False)

class Projeto(db.Model):
    """
    Mapeia a tabela apresentacao.projeto
    Funciona como um 'pasta' que organiza apresentações de um Tema
    """
    __tablename__ = 'projeto'
    #schema diferente para organizar
    __table_args__ = {'schema':'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)

    #chave estrangeira que liga projeto ao usuario
    usuario_id = db.Column(db.Integer, db.ForeignKey('login.usuario.id'), nullable=False)

    nome = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    capa_uri = db.Column(db.String(255))

    apresentacoes = db.relationship('Apresentacao', backref='projeto', lazy=True)

class Apresentacao(db.Model):
    """
    Mapeia a tabela apresentacao.apresentacao.
    É o que seria o Slide em si
    """
    __tablename__ = 'apresentacao'
    __table_args__ = {'schema':'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)

    projeto_id = db.Column(db.Integer, db.ForeignKey('apresentacao.projeto.id'), nullable=False)

    nome = db.Column(db.String(200), nullable=False)

    data_criacao = db.Columnd(db.DateTime, default=db.func.current_timestamp())
