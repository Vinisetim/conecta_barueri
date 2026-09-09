from app import create_app, db
from app.models import Templates

app = create_app()

with app.app_context():
    print("Verificando se já existem templates...")

    # Se já tiver os templates não faz nada
    if Templates.query.first():
        print("Os templates já estão no banco! O backend pode começar a trabalhar.")
    else:
        print("Plantando as sementes (Templates) no banco de dados...")

        # Criando a lista de templates
        templates_iniciais = [
            Templates(nome="Capa / Abertura", codigo="capa",
                     descricao="Slide inicial com título grande e fundo institucional."),
            Templates(nome="Imagem + Texto", codigo="imagem_texto",
                     descricao="Imagem em destaque de um lado, bloco de texto do outro."),
            Templates(nome="Indicadores", codigo="indicadores",
                     descricao="Cards de indicadores com números em destaque."),
            Templates(nome="Gráfico", codigo="grafico", descricao="Exibição de dados visuais via Chart.js."),
            Templates(nome="Mapa", codigo="mapa", descricao="Visualização geográfica do município."),
            Templates(nome="Vídeo", codigo="video", descricao="Player de vídeo embutido com legenda."),
            Templates(nome="Encerramento", codigo="encerramento", descricao="Slide final com contatos e logos.")
        ]

        # O db.session.add_all para inserir uma lista inteira de uma vez
        db.session.add_all(templates_iniciais)
        db.session.commit()

        print("Todos os 7 templates foram cadastrados com sucesso no Supabase")