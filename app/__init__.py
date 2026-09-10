from flask import Flask
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

#instancia as extensões fora de create_app() para poder ser importadas em outros arquiivos
bcrypt = Bcrypt()
login_manager = LoginManager()
db = SQLAlchemy()



def create_app():
    """
    Fábrica da aplicação Flask, Inicializa extensões de segurança e registra as Blueprints
    """
    app = Flask(__name__)

    # SECRET_KEY string para assinar cookies de sessão, protege dados do usuário
    app.config['SECRET_KEY'] = 'chave_temporaria_dev'
    #URI do banco de dados
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:conecta123!@db.gzfefwbmhafiuybiislx.supabase.co:5432/postgres'

    #Conecta extensões ao app
    bcrypt.init_app(app)
    login_manager.init_app(app)

    #inicialização do banco de dados
    db.init_app(app)


    # Configurações do Flask-Login para controle de sessão e segurança
    # Define a rota de login padrão para redirecionamento de usuários não autenticados
    login_manager.login_view = 'auth.login'
    # Mensagem exibida via flash() ao ser barrado por @login_required
    login_manager.login_message = 'Por favor, realize o login para acessar esta página.'
    login_manager.login_message_category = 'warning'
    # Proteção de sessão forte: invalida cookies em caso de alterações anômalas no IP ou User-Agent (mitigação de Session Hijacking)
    login_manager.session_protection = 'strong'

    # Registro do Blueprint da Landing Page
    from app.routes.main import main_bp
    app.register_blueprint(main_bp)

    #Registro de rota Login:
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    #Registro da area logada
    from app.routes.inicial import app_bp
    app.register_blueprint(app_bp)

    #registro das rotas de admin
    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp)

    from app.routes.apresentacao import apresentacao_bp
    app.register_blueprint(apresentacao_bp)

    from app.routes.indicadores import indicadores_bp
    app.register_blueprint(indicadores_bp)

    from app.routes.projetos import projetos_bp
    app.register_blueprint(projetos_bp)
    
    from app.routes.dados_abertos import dados_abertos_bp
    app.register_blueprint(dados_abertos_bp)

    from app.routes.iniciar_apresentacao import iniciar_apresentacao_bp
    app.register_blueprint(iniciar_apresentacao_bp)

    return app



