from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
login_manager = LoginManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    #Chave de segurança(formulário e sessões)
    app.config['SECRET_KEY'] = 'chave_segura'

    #config do banco > SQLITE. Trocar para a url do PostgreSql
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///banco.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    login_manager.init_app(app)
    bcrypt.init_app(app)

    #rota do login (redirecionar usuarios não logados)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = "Por favor, faça login para acessar esta página"

    from app.routes.main import bp as main_bp
    app.register_blueprint(main_bp)

    return app