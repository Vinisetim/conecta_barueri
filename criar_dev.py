from app import bcrypt, db, create_app
from app.models import Usuario, Senha

app = create_app()

with app.app_context():
    print('criando usuario DEV')
    dev_usuario = Usuario(
        nome="Equipe de DEV",
        email="dev@barueri.sp.gov.br",
        admin=True,
        status=True
    )

    db.session.add(dev_usuario)

    db.session.commit()

    senha_texto_puro = "barueri2026"
    hash_senha = bcrypt.generate_password_hash(senha_texto_puro).decode('utf-8')

    dev_senha = Senha(usuario_id=dev_usuario.id, senha=hash_senha)
    db.session.add(dev_senha)
    db.session.commit()