"""
Script 05: Seed do Catálogo Global de Apresentadores e Autoridades (Conecta Barueri)
Popula a tabela 'apresentacao.apresentador' com autoridades municipais de Barueri:
- Dados institucionais: nome, cargo, biografia e foto oficial
- Destaques estruturados em JSON (topicos: [{"destaque": "...", "rotulo": "..."}])
- Elementos visuais extras em JSON (midias_extras: [{"tipo": "...", "titulo": "...", "url": "..."}])
"""
import os
import sys

# Garante acesso aos módulos da raiz 'conecta_barueri'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import Apresentador, Usuario

APRESENTADORES_DADOS = [
    {
        "nome": "Jonatas Randal",
        "cargo": "Secretário de Inovação e Tecnologia (CIT)",
        "biografia": "Lidera as iniciativas de transformação digital, governo sem papel e cidades inteligentes da Prefeitura Municipal de Barueri, com foco em eficiência e atendimento ágil ao cidadão.",
        "foto_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        "topicos": [
            {"destaque": "+27 anos", "rotulo": "Na vida pública"},
            {"destaque": "100%", "rotulo": "Processos Digitais"},
            {"destaque": "10k+", "rotulo": "Servidores Conectados"}
        ],
        "midias_extras": [
            {
                "tipo": "Avatar",
                "titulo": "Avatar 3D Institucional CIT",
                "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
            }
        ]
    },
    {
        "nome": "Profª Celina Rodrigues",
        "cargo": "Secretária Municipal de Educação",
        "biografia": "Especialista em Gestão e Políticas Educacionais. Coordena o programa de inclusão digital e metodologias ativas nas mais de 100 escolas da rede municipal de Barueri.",
        "foto_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
        "topicos": [
            {"destaque": "68 mil", "rotulo": "Alunos Matriculados"},
            {"destaque": "100%", "rotulo": "Escolas com Fibra Óptica"},
            {"destaque": "1º Lugar", "rotulo": "Inovação Escolar no Estado"}
        ],
        "midias_extras": []
    },
    {
        "nome": "Dr. Marcelo Furtado",
        "cargo": "Secretário Municipal de Saúde",
        "biografia": "Médico sanitarista responsável pelo programa Barueri Saúde Digital, expansão da telemedicina e modernização das Unidades Básicas de Saúde (UBS).",
        "foto_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80",
        "topicos": [
            {"destaque": "2.4M", "rotulo": "Consultas/Procedimentos ao Ano"},
            {"destaque": "18", "rotulo": "UBSs 100% Informatizadas"},
            {"destaque": "98%", "rotulo": "Adesão ao Prontuário Eletrônico"}
        ],
        "midias_extras": []
    }
]

def rodar_seed_apresentadores():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("🎤 [05/07] SEMEANDO CATÁLOGO GLOBAL DE APRESENTADORES...")
        print("=" * 60)

        # Associa opcionalmente ao primeiro admin para auditoria
        admin = Usuario.query.filter_by(admin=True).first()
        criado_por_id = admin.id if admin else None

        for dados in APRESENTADORES_DADOS:
            apresentador = Apresentador.query.filter_by(nome=dados["nome"]).first()

            if not apresentador:
                apresentador = Apresentador(
                    nome=dados["nome"],
                    cargo=dados["cargo"],
                    biografia=dados["biografia"],
                    foto_url=dados["foto_url"],
                    topicos=dados["topicos"],
                    midias_extras=dados["midias_extras"],
                    criado_por_id=criado_por_id
                )
                db.session.add(apresentador)
                print(f"✨ Apresentador cadastrado: {dados['nome']} - {dados['cargo']}")
            else:
                apresentador.cargo = dados["cargo"]
                apresentador.biografia = dados["biografia"]
                apresentador.foto_url = dados["foto_url"]
                apresentador.topicos = dados["topicos"]
                apresentador.midias_extras = dados["midias_extras"]
                print(f"🔄 Apresentador atualizado: {dados['nome']}")

        db.session.commit()
        print("✅ Catálogo global de apresentadores garantido com sucesso!")
        print("=" * 60 + "\n")

if __name__ == '__main__':
    rodar_seed_apresentadores()
