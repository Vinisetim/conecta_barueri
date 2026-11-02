"""
Script 01: Criação de Schemas e Tabelas do Banco de Dados (Conecta Barueri)
Responsável por garantir os schemas 'login' e 'apresentacao' e criar todas as tabelas via SQLAlchemy ORM.
"""
import os
import sys

# Garante acesso aos módulos da raiz 'conecta_barueri'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from sqlalchemy import text
# Importa todos os models para registro no metadata do SQLAlchemy
from app.models import (
    Usuario, Senha, Projeto, Apresentacao, Templates,
    Slide, CampoPreenchido, SlotFlexivel, Ods, Apresentador, Indicador
)

def criar_banco():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("🛠️  [01/07] CRIANDO SCHEMAS E TABELAS NO POSTGRESQL...")
        print("=" * 60)

        # 1. Criação dos schemas organizacionais
        print("📌 Criando schemas 'login' e 'apresentacao'...")
        db.session.execute(text('CREATE SCHEMA IF NOT EXISTS login;'))
        db.session.execute(text('CREATE SCHEMA IF NOT EXISTS apresentacao;'))
        db.session.commit()
        print("✅ Schemas garantidos com sucesso.")

        # 2. Criação de todas as tabelas mapeadas no SQLAlchemy
        print("📌 Criando tabelas mapeadas via ORM...")
        db.create_all()
        print("✅ Todas as tabelas foram criadas/verificadas com sucesso no Supabase!")
        print("=" * 60 + "\n")

if __name__ == '__main__':
    criar_banco()
