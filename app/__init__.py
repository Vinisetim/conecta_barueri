from flask import Flask

def create_app():
    app = Flask(__name__)

    # Registro do Blueprint da Landing Page
    from app.routes.main import bp as main_bp
    app.register_blueprint(main_bp)

    #Registro de rota Login:
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    return app