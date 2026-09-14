"""
Script de Seed: Catálogo Oficial dos 17 ODS da ONU (Conecta Barueri)
Popula a tabela apresentacao.ods com títulos oficiais, números, resumos, cores hex e caminhos de ícone.
"""
from app import create_app, db
from app.models import Ods

app = create_app()

ODS_DADOS = [
    {
        "numero": 1,
        "titulo": "Erradicação da Pobreza",
        "descricao": "Erradicar a pobreza em todas as suas formas e em todos os lugares.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Objetivo_Desenvolvimento_Sustent%C3%A1vel_1_PT.jpg/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_1_PT.jpg",
        "cor_hex": "#E5243B"
    },
    {
        "numero": 2,
        "titulo": "Fome Zero e Agricultura Sustentável",
        "descricao": "Erradicar a fome, alcançar a segurança alimentar e melhoria da nutrição e promover a agricultura sustentável.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Objetivo_Desenvolvimento_Sustent%C3%A1vel_2_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_2_PT.webp",
        "cor_hex": "#DDA63A"
    },
    {
        "numero": 3,
        "titulo": "Saúde e Bem-Estar",
        "descricao": "Garantir o acesso à saúde de qualidade e promover o bem-estar para todas e todos, em todas as idades.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Objetivo_Desenvolvimento_Sustent%C3%A1vel_3_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_3_PT.webp",
        "cor_hex": "#4C9F38"
    },
    {
        "numero": 4,
        "titulo": "Educação de Qualidade",
        "descricao": "Garantir o acesso à educação inclusiva, de qualidade e equitativa, e promover oportunidades de aprendizagem ao longo da vida para todas e todos.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Objetivo_Desenvolvimento_Sustent%C3%A1vel_4_PT_01.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_4_PT_01.webp",
        "cor_hex": "#C5192D"
    },
    {
        "numero": 5,
        "titulo": "Igualdade de Gênero",
        "descricao": "Alcançar a igualdade de gênero e empoderar todas as mulheres e meninas.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Objetivo_Desenvolvimento_Sustent%C3%A1vel_5_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_5_PT.webp",
        "cor_hex": "#FF3A21"
    },
    {
        "numero": 6,
        "titulo": "Água Potável e Saneamento",
        "descricao": "Garantir a disponibilidade e a gestão sustentável da água potável e do saneamento para todas e todos.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Objetivo_Desenvolvimento_Sustent%C3%A1vel_6_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_6_PT.webp",
        "cor_hex": "#26BDE2"
    },
    {
        "numero": 7,
        "titulo": "Energia Limpa e Acessível",
        "descricao": "Garantir o acesso a fontes de energia fiáveis, sustentáveis e modernas para todas e todos.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Objetivo_Desenvolvimento_Sustent%C3%A1vel_7_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_7_PT.webp",
        "cor_hex": "#FCC30B"
    },
    {
        "numero": 8,
        "titulo": "Trabalho Decente e Crescimento Econômico",
        "descricao": "Promover o crescimento econômico sustentado, inclusivo e sustentável, emprego pleno e produtivo e trabalho decente para todas e todos.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Objetivo_Desenvolvimento_Sustent%C3%A1vel_8_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_8_PT.webp",
        "cor_hex": "#A21942"
    },
    {
        "numero": 9,
        "titulo": "Indústria, Inovação e Infraestrutura",
        "descricao": "Construir infraestruturas resilientes, promover a industrialização inclusiva e sustentável e fomentar a inovação.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Objetivo_Desenvolvimento_Sustent%C3%A1vel_9_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_9_PT.webp",
        "cor_hex": "#FD6925"
    },
    {
        "numero": 10,
        "titulo": "Redução das Desigualdades",
        "descricao": "Reduzir as desigualdades no interior dos países e entre os países.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Objetivo_Desenvolvimento_Sustent%C3%A1vel_10_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_10_PT.webp",
        "cor_hex": "#DD1367"
    },
    {
        "numero": 11,
        "titulo": "Cidades e Comunidades Sustentáveis",
        "descricao": "Tornar as cidades e comunidades mais inclusivas, seguras, resilientes e sustentáveis.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Objetivo_Desenvolvimento_Sustent%C3%A1vel_11_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_11_PT.webp",
        "cor_hex": "#FD9D24"
    },
    {
        "numero": 12,
        "titulo": "Consumo e Produção Responsáveis",
        "descricao": "Garantir padrões de consumo e de produção sustentáveis.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Objetivo_Desenvolvimento_Sustent%C3%A1vel_12_PT.jpg/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_12_PT.jpg",
        "cor_hex": "#BF8B2E"
    },
    {
        "numero": 13,
        "titulo": "Ação Contra a Mudança Global do Clima",
        "descricao": "Tomar medidas urgentes para combater a mudança climática e os seus impactos.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Objetivo_Desenvolvimento_Sustent%C3%A1vel_13_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_13_PT.webp",
        "cor_hex": "#3F7E44"
    },
    {
        "numero": 14,
        "titulo": "Vida na Água",
        "descricao": "Conservar e usar de forma sustentável os oceanos, mares e os recursos marinhos para o desenvolvimento sustentável.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Objetivo_Desenvolvimento_Sustent%C3%A1vel_14_PT.jpg/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_14_PT.jpg",
        "cor_hex": "#0A97D9"
    },
    {
        "numero": 15,
        "titulo": "Vida Terrestre",
        "descricao": "Proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres, gerir de forma sustentável as florestas, combater a desertificação e deter a perda de biodiversidade.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Objetivo_Desenvolvimento_Sustent%C3%A1vel_15_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_15_PT.webp",
        "cor_hex": "#56C02B"
    },
    {
        "numero": 16,
        "titulo": "Paz, Justiça e Instituições Eficazes",
        "descricao": "Promover sociedades pacíficas e inclusivas para o desenvolvimento sustentável, proporcionar o acesso à justiça para todos e construir instituições eficazes e responsáveis.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Objetivo_Desenvolvimento_Sustent%C3%A1vel_16_PT.jpg/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_16_PT.jpg",
        "cor_hex": "#00689D"
    },
    {
        "numero": 17,
        "titulo": "Parcerias e Meios de Implementação",
        "descricao": "Fortalecer os meios de implementação e revitalizar a parceria global para o desenvolvimento sustentável.",
        "icone_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Objetivo_Desenvolvimento_Sustent%C3%A1vel_17_PT.webp/250px-Objetivo_Desenvolvimento_Sustent%C3%A1vel_17_PT.webp",
        "cor_hex": "#19486A"
    }
]

def rodar_seed_ods():
    with app.app_context():
        # 1. Garante que a tabela exista antes de inserir/atualizar
        db.create_all()

        print("🔍 Verificando a tabela apresentacao.ods...")
        ods_existentes = {ods.numero: ods for ods in Ods.query.all()}

        if ods_existentes:
            print(f"🔄 Atualizando as URLs web dos {len(ods_existentes)} ODS existentes no banco...")
            for d in ODS_DADOS:
                if d["numero"] in ods_existentes:
                    registro = ods_existentes[d["numero"]]
                    registro.icone_url = d["icone_url"]
                    registro.cor_hex = d["cor_hex"]
                    registro.titulo = d["titulo"]
                    registro.descricao = d["descricao"]
            db.session.commit()
            print("✅ Sucesso! Todas as URLs dos ícones foram atualizadas para links web públicos.")
        else:
            print("🌱 Semeando os 17 Objetivos de Desenvolvimento Sustentável (ODS) pela primeira vez...")
            novas_ods = [
                Ods(
                    numero=d["numero"],
                    titulo=d["titulo"],
                    descricao=d["descricao"],
                    icone_url=d["icone_url"],
                    cor_hex=d["cor_hex"]
                )
                for d in ODS_DADOS
            ]
            db.session.add_all(novas_ods)
            db.session.commit()
            print(f"✅ Sucesso! {len(novas_ods)} ODS oficiais da ONU foram cadastradas no banco de dados com URLs web.")

# Executa o seed diretamente (funciona tanto via terminal 'python seed.py' quanto via 'flask run' do PyCharm)
rodar_seed_ods()
