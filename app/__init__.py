from flask import Flask

def create_app():
    app = Flask(__name__)

    # REGISTRA ROTAS PRINCIPAIS
    from app.routes.main import main_bp
    app.register_blueprint(main_bp)

    # REGISTRA AUTENTICAÇÃO (se existir)
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app
