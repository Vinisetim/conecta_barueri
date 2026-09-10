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

    data_criacao = db.Column(db.DateTime, default=db.func.current_timestamp())

    slides = db.relationship('Slide', backref='apresentacao_pai', lazy=True)


class Templates(db.Model):
    """
    Mapeia a tabela apresentacao.templates
    Representa o template (o 'molde') do slide
    """

    __tablename__ = 'templates'
    __table_args__ = {'schema':'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)

    #Nome do template na tela
    nome = db.Column(db.String(100), nullable=False)

    #nome interno do template
    codigo = db.Column(db.String(50), nullable=False, unique=True)

    #descrição para mostrar quando for selecionar um template (opicional)
    descricao = db.Column(db.String(255))

    slides_que_usam = db.relationship('Slide', backref='template_usado', lazy=True)

class Slide(db.Model):
    """
    Mapeia a tabela apresentacao.slide
    Representa uma pagina individual dentro da apresentação
    """
    __tablename__ = 'slide'
    __table_args__ = {'schema':'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)

    #chave estrangeira para conectar o slide a apresentacao
    apresentacao_id = db.Column(db.Integer, db.ForeignKey('apresentacao.apresentacao.id'), nullable=False)

    #chave para identificar o tipo desse slide entre os templates
    template_id = db.Column(db.Integer, db.ForeignKey('apresentacao.templates.id'), nullable=False)

    #numero da página (para definir ordem)
    ordem = db.Column(db.Integer, nullable=False)

    campos = db.relationship('CampoPreenchido', backref='slide_pai', lazy=True)

class CampoPreenchido(db.Model):
    """
    Mapeia a tabela apresentacao.campo_preenchido
    Guarda os dados flexíveis de cada template, permitindo reuso de mídias
    """

    __tablename__ = 'campo_preenchido'
    __table_args__ = {'schema':'apresentacao'}


    id = db.Column(db.Integer, primary_key=True)

    #De qual slide esse campo foi preenchido:
    slide_id = db.Column(db.Integer, db.ForeignKey('apresentacao.slide.id'), nullable=False)

    #o "slot" que esse campo ocupa. Ex: "titulo_principal, "imagem_fundo", "video_url"
    chave_campo = db.Column(db.String(100), nullable=False)

    #Da onde veio o dado ('manual', 'inidicador' ou 'reuso_midia')

    # As três fontes de dados possiveis:

    #Fonte 1: Manual (o editor adicionou um texto ou imagem nova)
    valor_manual = db.Column(db.Text)

    #Fonte 2: Reúso Mídia (auto-relacionamento)
    campo_origem_id = db.Column(db.Integer, db.ForeignKey('apresentacao.campo_preenchido.id'))

    #Fonte 3: indicador (Futuro)
    indicador_id = db.Column(db.Integer)

    data_criacao = db.Column(db.DateTime, default=db.func.current_timestamp())