from app import create_app, db
from sqlalchemy import text

#importar os modelos para sqlalchemy ler

from app.models import Usuario, Senha, Projeto, Apresentacao, Templates, Slide, CampoPreenchido

app = create_app()

with app.app_context():
    #criar os schemas para divir o banco
    db.session.execute(text('CREATE SCHEMA IF NOT EXISTS login;'))
    db.session.execute(text('CREATE SCHEMA IF NOT EXISTS apresentacao;'))
    db.session.commit()

    db.create_all()

    print('Banco de dados criado na nuvem')