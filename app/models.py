from app import db, bcrypt, login_manager
from flask_login import UserMixin

@login_manager.user_loader
def load_user(user_id):
    """
    Callback obrigatório do Flask-Login para restaurar o objeto de usuário a partir do ID da sessão.
    Utiliza db.session.get() (padrão moderno do SQLAlchemy) e trata conversões inválidas de forma segura.
    """
    try:
        return db.session.get(Usuario, int(user_id))
    except (ValueError, TypeError):
        return None

class Usuario(UserMixin, db.Model):
    # Configurações da tabela e isolamento no schema 'login'
    __tablename__ = 'usuario'
    __table_args__ = {'schema': 'login'}

    # Colunas de identificação e perfil
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255))
    email = db.Column(db.Text)
    admin = db.Column(db.Boolean, default=False)
    status = db.Column(db.Boolean, default=True)

    # Relacionamento 1:1 com a tabela de credenciais (isolamento de segurança)
    senha_obj = db.relationship('Senha', backref='usuario', uselist=False)
    pastas = db.relationship('Pasta', backref='dono', lazy=True, cascade='all, delete-orphan')

    @property
    def projetos(self):
        """Compatibilidade: retorna as pastas do usuário."""
        return self.pastas

    @property
    def iniciais(self):
        """
        Retorna as iniciais do nome do usuário (ex: 'Equipe de DEV' -> 'ED') para o avatar.
        """
        if not self.nome or not self.nome.strip():
            return "US"
        partes = [p for p in self.nome.strip().split() if p.lower() not in ('de', 'da', 'do', 'dos', 'das', 'e')]
        if not partes:
            partes = self.nome.strip().split()
        if len(partes) >= 2:
            return (partes[0][0] + partes[-1][0]).upper()
        return partes[0][:2].upper()

    @property
    def is_active(self):
        """
        Determina se a conta do usuário está ativa no sistema.
        Contas desativadas (status=False) são impedidas de autenticar pelo Flask-Login.
        """
        return bool(self.status)

    @property
    def senha(self):
        """
        Propriedade de compatibilidade: permite acessar o registro de senha
        tanto via usuario.senha quanto usuario.senha_obj.
        """
        return self.senha_obj

    def verificar_senha(self, senha_digitada):
        """
        Verifica com segurança se a senha informada corresponde ao hash Bcrypt gravado.
        Retorna False se o usuário não possuir registro de credencial associado.
        """
        if not self.senha_obj or not self.senha_obj.senha:
            return False
        return bcrypt.check_password_hash(self.senha_obj.senha, senha_digitada)

class Senha(db.Model):
    __tablename__ = 'senhas'
    __table_args__ = {'schema': 'login'}

    #colunas

    # o usuario id aqui vai funcionar como chave estrengeira que liga as duas e como chave primaria desta tabela
    usuario_id = db.Column(db.Integer, db.ForeignKey('login.usuario.id'), primary_key=True)

    #senha criptografada
    senha = db.Column(db.String(255), nullable=False)

class Pasta(db.Model):
    """
    Mapeia a tabela apresentacao.pasta (antigo 'projeto').
    Funciona como uma 'pasta' pessoal que organiza as apresentações de um determinado servidor ou tema.
    """
    __tablename__ = 'pasta'
    __table_args__ = {'schema': 'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('login.usuario.id'), nullable=False)
    nome = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    capa_uri = db.Column(db.String(500))

    apresentacoes = db.relationship('Apresentacao', backref='pasta_pai', lazy=True, cascade='all, delete-orphan')


class Projeto(db.Model):
    """
    Mapeia a tabela apresentacao.projeto.
    Representa a Iniciativa Municipal Oficial (Portfólio do CIT de Barueri).
    Funciona como vitrine institucional e provedor de Kits Modulares de Slides para reúso.
    """
    __tablename__ = 'projeto'
    __table_args__ = {'schema': 'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    nome = db.Column(db.String(255), nullable=False)
    secretaria_principal = db.Column(db.String(150))
    resumo = db.Column(db.Text)
    descricao_completa = db.Column(db.Text)
    foto_url = db.Column(db.String(500))
    destaques = db.Column(db.JSON)       # Lista dos 3 pontos de destaque
    beneficios = db.Column(db.JSON)      # Lista dos 3 cards de benefícios (Template 9)
    data_implantacao = db.Column(db.String(50))
    status_operacional = db.Column(db.String(100))
    ods_vinculados = db.Column(db.JSON)  # IDs numéricos dos ODS
    criado_em = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Slides mestres que compõem o kit oficial do projeto
    slides_kit = db.relationship('Slide', backref='projeto_pai', lazy=True, cascade='all, delete-orphan')


class Apresentacao(db.Model):
    """
    Mapeia a tabela apresentacao.apresentacao.
    Representa o arquivo executável de apresentação de slides de trabalho do servidor.
    Pertence a uma Pasta.
    """
    __tablename__ = 'apresentacao'
    __table_args__ = {'schema': 'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)
    pasta_id = db.Column(db.Integer, db.ForeignKey('apresentacao.pasta.id'), nullable=False)
    nome = db.Column(db.String(200), nullable=False)
    data_criacao = db.Column(db.DateTime, default=db.func.current_timestamp())

    slides = db.relationship('Slide', backref='apresentacao_pai', lazy=True, cascade='all, delete-orphan')

    # Propriedade de compatibilidade: permite ler e gravar 'projeto_id' redirecionando para 'pasta_id'
    @property
    def projeto_id(self):
        return self.pasta_id

    @projeto_id.setter
    def projeto_id(self, valor):
        self.pasta_id = valor

    @property
    def projeto(self):
        return self.pasta_pai

    @property
    def pasta(self):
        return self.pasta_pai


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
    Representa uma página individual dentro de uma apresentação (usuário) 
    OU um slide mestre de um kit oficial (projeto CIT).
    """
    __tablename__ = 'slide'
    __table_args__ = (
        db.CheckConstraint(
            '(apresentacao_id IS NOT NULL AND projeto_id IS NULL) OR '
            '(apresentacao_id IS NULL AND projeto_id IS NOT NULL)',
            name='chk_slide_origem_exclusiva'
        ),
        {'schema': 'apresentacao'}
    )

    id = db.Column(db.Integer, primary_key=True)

    # Pode pertencer a uma apresentacao de servidor OU a um projeto mestre do CIT:
    apresentacao_id = db.Column(db.Integer, db.ForeignKey('apresentacao.apresentacao.id', ondelete='CASCADE'), nullable=True)
    projeto_id = db.Column(db.Integer, db.ForeignKey('apresentacao.projeto.id', ondelete='CASCADE'), nullable=True)

    # Chave para identificar o tipo desse slide entre os templates
    template_id = db.Column(db.Integer, db.ForeignKey('apresentacao.templates.id'), nullable=False)

    # Número da página (para definir ordem)
    ordem = db.Column(db.Integer, nullable=False)

    # Configurações visuais do slide (plano de fundo, alinhamento geral e cabeçalho)
    alinhamento_texto = db.Column(db.String(20), default='left')
    filtro_fundo = db.Column(db.String(20), default='nenhum')
    estilo_fundo = db.Column(db.String(30), default='contained')
    cabecalho_ativo = db.Column(db.Boolean, default=False)

    campos = db.relationship('CampoPreenchido', backref='slide_pai', lazy=True, cascade='all, delete-orphan')
    slots_flexiveis = db.relationship('SlotFlexivel', backref='slide_pai', lazy=True, cascade='all, delete-orphan')

class CampoPreenchido(db.Model):
    """
    Mapeia a tabela apresentacao.campo_preenchido
    Guarda os dados flexíveis de cada template, permitindo reuso de mídias
    e estilização tipográfica individual por campo de texto.
    """

    __tablename__ = 'campo_preenchido'
    __table_args__ = {'schema':'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)

    # De qual slide esse campo foi preenchido:
    slide_id = db.Column(db.Integer, db.ForeignKey('apresentacao.slide.id'), nullable=False)

    # O "slot" que esse campo ocupa. Ex: "titulo_principal", "imagem_fundo", "video_url"
    chave_campo = db.Column(db.String(100), nullable=False)

    # Origem do dado ('manual', 'reuso_midia' ou 'indicador')
    tipo_fonte = db.Column(db.String(50), default='manual')

    # As três fontes de dados possíveis:
    # Fonte 1: Manual (o editor adicionou um texto ou imagem nova)
    valor_manual = db.Column(db.Text)

    # Fonte 2: Reúso Mídia (auto-relacionamento)
    campo_origem_id = db.Column(db.Integer, db.ForeignKey('apresentacao.campo_preenchido.id'))

    # Fonte 3: Indicador oficial tratado de Barueri
    indicador_id = db.Column(db.Integer, db.ForeignKey('apresentacao.indicador.id'), nullable=True)

    # Estilização tipográfica individual por campo de texto (quando aplicável)
    tamanho_texto = db.Column(db.String(20))   # Ex: '32px', '1.5rem' ou '24'
    cor_texto = db.Column(db.String(20))       # Ex: '#0052FF', '#FFFFFF', '#212529'
    fonte = db.Column(db.String(50))           # Ex: 'Montserrat', 'Inter', 'Roboto'

    data_criacao = db.Column(db.DateTime, default=db.func.current_timestamp())

class SlotFlexivel(db.Model):
    """
    Mapeia apresentacao.slot_flexivel
    Elemento sobrepostos e ancorados na matriz 3x3
    """

    __tablename__ = 'slot_flexivel'
    __table_args__ = {'schema':'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)
    slide_id = db.Column(db.Integer, db.ForeignKey('apresentacao.slide.id'), nullable=False)

    tipo_elemento = db.Column(db.String(50), nullable=False)
    posicao_matriz = db.Column(db.String(30), nullable=False)
    config_json = db.Column(db.JSON, nullable=False)


class Ods(db.Model):
    """
    Mapeia a tabela apresentacao.ods
    Catálogo estático com os 17 Objetivos de Desenvolvimento Sustentável da ONU
    """
    __tablename__ = 'ods'
    __table_args__ = {'schema': 'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.Integer, unique=True, nullable=False)
    titulo = db.Column(db.String(150), nullable=False)
    descricao = db.Column(db.Text)
    icone_url = db.Column(db.String(255))
    cor_hex = db.Column(db.String(10))

class Apresentador(db.Model):
    """
    Mapeia apresentacao.apresentador.
    Catálogo INSTITUCIONAL e COMPARTILHADO de autoridades, secretários e palestrantes.
    Visível globalmente para todos os usuários do sistema.
    """
    __tablename__ = 'apresentador'
    __table_args__ = {'schema':'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)

    criado_por_id = db.Column(db.Integer, db.ForeignKey('login.usuario.id'), nullable=True)

    nome = db.Column(db.String(150), nullable=False)
    cargo = db.Column(db.String(255))

    biografia = db.Column(db.Text)
    foto_url = db.Column(db.String(255))

    # Estruturas dinâmicas em JSON
    topicos = db.Column(db.JSON, default=list)
    midias_extras = db.Column('midias_extra', db.JSON, default=list)


class Indicador(db.Model):
    """
    Mapeia apresentacao.indicador
    Tabela de dados tratados municipais de Barueri para preenchimento dinâmico.
    Alimenta cards de métricas e gráficos nos templates de slides.
    """
    __tablename__ = 'indicador'
    __table_args__ = {'schema': 'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)
    secretaria = db.Column(db.String(100), nullable=False)
    nome_metrica = db.Column(db.String(150), nullable=False)
    valor_numerico = db.Column(db.Float, nullable=False)
    unidade_medida = db.Column(db.String(30), default='')
    data_atualizacao = db.Column(db.DateTime, default=db.func.current_timestamp())
    historico_json = db.Column(db.JSON, default=list)


