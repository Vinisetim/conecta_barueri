from flask import Flask

def create_app():
    app = Flask(__name__)

    # Registro do Blueprint da Landing Page
    from app.routes.main import bp as main_bp
    app.register_blueprint(main_bp)

    #Registro de rota Login:
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app.routes.projetos import projetos_bp
    app.register_blueprint(projetos_bp)

    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp)

    from app.routes.equipes import equipes_bp
    app.register_blueprint(equipes_bp)

    from app.routes.funcionarios import funcionarios_bp
    app.register_blueprint(funcionarios_bp)

    return app