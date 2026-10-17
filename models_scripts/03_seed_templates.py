"""
Script 03: Seed dos 8 Templates Homologados de Slide (Conecta Barueri)
Popula a tabela 'apresentacao.templates' com os 8 moldes institucionais aprovados para o MVP:
1. Capa / Abertura (capa)
2. Imagem + Texto (imagem_texto)
3. Indicadores (indicadores)
4. Gráfico (grafico)
5. Mapa de Barueri (mapa)
6. Vídeo (video)
7. Apresentador / Bio (apresentador)
8. Encerramento (encerramento)
"""
import os
import sys

# Garante acesso aos módulos da raiz 'conecta_barueri'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import Templates

TEMPLATES_HOMOLOGADOS = [
    {
        "nome": "Capa / Abertura",
        "codigo": "capa",
        "descricao": "Slide inicial institucional com título grande, subtítulo, logotipos oficiais e imagem de fundo."
    },
    {
        "nome": "Imagem + Texto",
        "codigo": "imagem_texto",
        "descricao": "Layout equilibrado em duas colunas: imagem institucional de um lado e texto explicativo do outro."
    },
    {
        "nome": "Indicadores Socioeconômicos",
        "codigo": "indicadores",
        "descricao": "Cards de destaque com números grandes, métricas e rótulos alimentados de forma manual ou dinâmica."
    },
    {
        "nome": "Gráfico de Dados",
        "codigo": "grafico",
        "descricao": "Visualização quantitativa interativa via Chart.js (barras ou linhas) acompanhada de análise textual."
    },
    {
        "nome": "Mapa de Barueri",
        "codigo": "mapa",
        "descricao": "Visualização geográfica interativa via Leaflet.js destacando pontos estratégicos e equipamentos do município."
    },
    {
        "nome": "Vídeo Institucional",
        "codigo": "video",
        "descricao": "Player de vídeo responsivo (YouTube, Vimeo ou MP4) com área dedicada para resumo e legendas."
    },
    {
        "nome": "Apresentador / Bio",
        "codigo": "apresentador",
        "descricao": "Perfil institucional de autoridade ou palestrante: foto oficial, cargo, minicurrículo e tópicos de carreira."
    },
    {
        "nome": "Encerramento",
        "codigo": "encerramento",
        "descricao": "Slide final com agradecimentos, canais de atendimento da prefeitura e logotipos de apoio."
    }
]

def rodar_seed_templates():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("📐 [03/07] SEMEANDO OS 8 TEMPLATES HOMOLOGADOS...")
        print("=" * 60)

        for dados in TEMPLATES_HOMOLOGADOS:
            template = Templates.query.filter_by(codigo=dados["codigo"]).first()

            if not template:
                template = Templates(
                    nome=dados["nome"],
                    codigo=dados["codigo"],
                    descricao=dados["descricao"]
                )
                db.session.add(template)
                print(f"✨ Template criado: [{dados['codigo']}] {dados['nome']}")
            else:
                template.nome = dados["nome"]
                template.descricao = dados["descricao"]
                print(f"🔄 Template atualizado: [{dados['codigo']}] {dados['nome']}")

        db.session.commit()
        print("✅ Todos os 8 templates estão garantidos na base de dados!")
        print("=" * 60 + "\n")

if __name__ == '__main__':
    rodar_seed_templates()
