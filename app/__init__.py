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
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://usuario:senha@localhost/conecta_barueri'

    #Conecta extensões ao app
    bcrypt.init_app(app)
    login_manager.init_app(app)

    #inicialização do banco de dados
    db.init_app(app)


    #qual rota o Flask_login redireciona ao acessar sem estar logado:
    login_manager.login_view = 'auth.login'

    # Registro do Blueprint da Landing Page
    from app.routes.main import main_bp
    app.register_blueprint(main_bp)

    #Registro de rota Login:
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    return app
