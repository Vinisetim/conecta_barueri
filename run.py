from flask import Flask
from app.routes.main import bp

#instância do Flask
app = Flask(__name__,
            template_folder= 'app/templates',
            static_folder= 'app/static')

#registro de rota
app.register_blueprint(bp)

if __name__ == '__main__':
    app.run(debug=True) #modo debug para conferir atualizações em tempo real