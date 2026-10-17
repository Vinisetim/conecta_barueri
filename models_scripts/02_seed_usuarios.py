"""
Script 02: Seed de Usuários Institucionais de Teste (Conecta Barueri)
Popula a tabela 'login.usuario' e 'login.senhas' com:
1. Administrador Geral (admin@barueri.sp.gov.br / admin123)
2. Servidor Comum (usuario@barueri.sp.gov.br / usuario123)
Com senhas estritamente criptografadas via Flask-Bcrypt.
"""
import os
import sys

# Garante acesso aos módulos da raiz 'conecta_barueri'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db, bcrypt
from app.models import Usuario, Senha

USUARIOS_INICIAIS = [
    {
        "nome": "Administrador Geral (CIT)",
        "email": "admin@barueri.sp.gov.br",
        "senha_plana": "admin123",
        "admin": True,
        "status": True
    },
    {
        "nome": "Servidor Municipal de Teste",
        "email": "usuario@barueri.sp.gov.br",
        "senha_plana": "usuario123",
        "admin": False,
        "status": True
    }
]

def rodar_seed_usuarios():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("👤 [02/07] SEMEANDO USUÁRIOS E CREDENCIAIS (BCRYPT)...")
        print("=" * 60)

        for dados in USUARIOS_INICIAIS:
            usuario = Usuario.query.filter_by(email=dados["email"]).first()
            hash_senha = bcrypt.generate_password_hash(dados["senha_plana"]).decode('utf-8')

            if not usuario:
                usuario = Usuario(
                    nome=dados["nome"],
                    email=dados["email"],
                    admin=dados["admin"],
                    status=dados["status"]
                )
                db.session.add(usuario)
                db.session.flush()  # Gera o usuario.id

                senha_registro = Senha(
                    usuario_id=usuario.id,
                    senha=hash_senha
                )
                db.session.add(senha_registro)
                print(f"✨ Usuário criado: {dados['email']} (Papel: {'Admin' if dados['admin'] else 'Comum'})")
            else:
                usuario.nome = dados["nome"]
                usuario.admin = dados["admin"]
                usuario.status = dados["status"]

                if usuario.senha_obj:
                    usuario.senha_obj.senha = hash_senha
                else:
                    senha_registro = Senha(usuario_id=usuario.id, senha=hash_senha)
                    db.session.add(senha_registro)

                print(f"🔄 Usuário atualizado: {dados['email']} (Senha redefinida para '{dados['senha_plana']}')")

        db.session.commit()
        print("✅ Usuários e senhas garantidos com sucesso!")
        print("=" * 60 + "\n")

if __name__ == '__main__':
    rodar_seed_usuarios()
