"""
Script 07: Seed da Pasta/Apresentação Vitrine e dos Projetos Oficiais (Conecta Barueri)
Cria uma pasta pessoal com apresentação demonstrativa para testes e cadastra
os Projetos Oficiais do CIT (Barueri Sem Papel e Metaverso) com seus respectivos Kits de Slides!
"""
import os
import sys

# Garante acesso aos módulos da raiz 'conecta_barueri'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import Usuario, Pasta, Projeto, Apresentacao, Templates, Slide, CampoPreenchido, SlotFlexivel, Indicador

def rodar_seed_projeto_vitrine():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("🚀 [07/07] SEMEANDO PASTAS, APRESENTAÇÕES E PROJETOS OFICIAIS...")
        print("=" * 60)

        # 1. Busca usuário dono (prioriza admin)
        admin = Usuario.query.filter_by(admin=True).first()
        if not admin:
            admin = Usuario.query.first()
        if not admin:
            print("⚠️ Erro: Nenhum usuário encontrado! Execute primeiro o script '02_seed_usuarios.py'.")
            return

        # 2. Garante a Pasta de Trabalho Demonstrativa do Usuário
        nome_pasta = "Planejamento e Inovação 2026"
        pasta = Pasta.query.filter_by(nome=nome_pasta, usuario_id=admin.id).first()

        if not pasta:
            pasta = Pasta(
                usuario_id=admin.id,
                nome=nome_pasta,
                descricao="Pasta temática oficial demonstrando a transformação digital, o programa Barueri Sem Papel e os compromissos municipais com os ODS.",
                capa_uri="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
            )
            db.session.add(pasta)
            db.session.flush()
            print(f"✨ Pasta de Trabalho criada: '{nome_pasta}' (ID: {pasta.id})")
        else:
            print(f"ℹ️ Pasta de Trabalho já existente: '{nome_pasta}' (ID: {pasta.id})")

        # 3. Garante a Apresentação de Trabalho na Pasta
        nome_apresentacao = "Apresentação Oficial Conecta Barueri (Banca TCC)"
        apresentacao = Apresentacao.query.filter_by(nome=nome_apresentacao, pasta_id=pasta.id).first()

        if not apresentacao:
            apresentacao = Apresentacao(
                pasta_id=pasta.id,
                nome=nome_apresentacao
            )
            db.session.add(apresentacao)
            db.session.flush()
            print(f"✨ Apresentação Vitrine criada: '{nome_apresentacao}' (ID: {apresentacao.id})")

            # Mapeamento dos templates para os slides
            tpl_capa = Templates.query.filter_by(codigo="capa").first()
            tpl_indicadores = Templates.query.filter_by(codigo="indicadores").first()
            tpl_apresentador = Templates.query.filter_by(codigo="apresentador").first()
            tpl_encerramento = Templates.query.filter_by(codigo="encerramento").first()

            # Slide 1: Capa
            if tpl_capa:
                s1 = Slide(
                    apresentacao_id=apresentacao.id,
                    template_id=tpl_capa.id,
                    ordem=1,
                    alinhamento_texto="left",
                    filtro_fundo="escurecer",
                    estilo_fundo="full_scrim",
                    cabecalho_ativo=True
                )
                db.session.add(s1)
                db.session.flush()

                db.session.add(CampoPreenchido(
                    slide_id=s1.id,
                    chave_campo="titulo",
                    tipo_fonte="manual",
                    valor_manual="Conecta Barueri — Gestão Pública Inteligente",
                    tamanho_texto="36px",
                    cor_texto="#FFFFFF",
                    fonte="Montserrat"
                ))
                db.session.add(CampoPreenchido(
                    slide_id=s1.id,
                    chave_campo="subtitulo",
                    tipo_fonte="manual",
                    valor_manual="Plataforma Integrada de Inteligência de Dados e Apresentações Oficiais",
                    tamanho_texto="20px",
                    cor_texto="#F8F9FA"
                ))
                db.session.add(CampoPreenchido(
                    slide_id=s1.id,
                    chave_campo="imagem_fundo",
                    tipo_fonte="manual",
                    valor_manual="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80"
                ))
                # Slot flexível com selos ODS
                db.session.add(SlotFlexivel(
                    slide_id=s1.id,
                    tipo_elemento="ods",
                    posicao_matriz="bottom-right",
                    config_json={"arranjo": "linha", "selos": [9, 11, 16]}
                ))

            # Slide 2: Indicadores Dinâmicos
            if tpl_indicadores:
                s2 = Slide(
                    apresentacao_id=apresentacao.id,
                    template_id=tpl_indicadores.id,
                    ordem=2,
                    alinhamento_texto="left",
                    filtro_fundo="nenhum",
                    estilo_fundo="contained"
                )
                db.session.add(s2)
                db.session.flush()

                ind_papel = Indicador.query.filter_by(nome_metrica="Processos 100% Digitais (Barueri Sem Papel)").first()

                db.session.add(CampoPreenchido(
                    slide_id=s2.id,
                    chave_campo="titulo",
                    tipo_fonte="manual",
                    valor_manual="Eficiência Administrativa e Descarbonização",
                    tamanho_texto="30px",
                    cor_texto="#102A56"
                ))
                if ind_papel:
                    db.session.add(CampoPreenchido(
                        slide_id=s2.id,
                        chave_campo="card_metrica_1",
                        tipo_fonte="indicador",
                        indicador_id=ind_papel.id,
                        valor_manual=f"{ind_papel.valor_numerico}{ind_papel.unidade_medida}"
                    ))

            # Slide 3: Apresentador / Bio
            if tpl_apresentador:
                s3 = Slide(
                    apresentacao_id=apresentacao.id,
                    template_id=tpl_apresentador.id,
                    ordem=3,
                    alinhamento_texto="left"
                )
                db.session.add(s3)
                db.session.flush()

                db.session.add(CampoPreenchido(
                    slide_id=s3.id,
                    chave_campo="nome_apresentador",
                    tipo_fonte="manual",
                    valor_manual="Jonatas Randal"
                ))
                db.session.add(CampoPreenchido(
                    slide_id=s3.id,
                    chave_campo="cargo",
                    tipo_fonte="manual",
                    valor_manual="Secretário Municipal de Inovação e Tecnologia (CIT)"
                ))

            # Slide 4: Encerramento
            if tpl_encerramento:
                s4 = Slide(
                    apresentacao_id=apresentacao.id,
                    template_id=tpl_encerramento.id,
                    ordem=4,
                    alinhamento_texto="center"
                )
                db.session.add(s4)
                db.session.flush()

                db.session.add(CampoPreenchido(
                    slide_id=s4.id,
                    chave_campo="titulo",
                    tipo_fonte="manual",
                    valor_manual="Obrigado!",
                    tamanho_texto="42px",
                    cor_texto="#0052FF"
                ))
                db.session.add(CampoPreenchido(
                    slide_id=s4.id,
                    chave_campo="mensagem_final",
                    tipo_fonte="manual",
                    valor_manual="Conecta Barueri — Etec Antônio Furlan (2026)"
                ))

            db.session.commit()
            print("✅ 4 Slides de exemplo criados com sucesso na apresentação vitrine!")
        else:
            print(f"ℹ️ Apresentação Vitrine já existente (ID: {apresentacao.id}).")

        # 4. Garante os Projetos Oficiais do CIT (Iniciativas Municipais com Kits de Slides)
        print("\n🏛️ Semeando Projetos Oficiais do CIT com Kits de Slides Homologados...")
        
        tpl_capa = Templates.query.filter_by(codigo="capa").first()
        tpl_pilares = Templates.query.filter_by(codigo="modulos_pilares").first()
        tpl_indicadores = Templates.query.filter_by(codigo="indicadores").first()

        # Projeto 1: Barueri Sem Papel
        proj_papel = Projeto.query.filter_by(slug="barueri-sem-papel").first()
        if not proj_papel:
            proj_papel = Projeto(
                slug="barueri-sem-papel",
                nome="Programa Barueri Sem Papel",
                secretaria_principal="Secretaria de Inovação e Tecnologia (CIT)",
                resumo="Programa pioneiro de eliminação total do papel na administração pública municipal, garantindo agilidade, descarbonização e transparência.",
                descricao_completa="O Barueri Sem Papel transformou a tramitação de memorandos, processos administrativos e alvarás em um fluxo 100% digital via plataforma Solar BPM.",
                foto_url="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
                destaques=[
                    "100% dos processos administrativos digitais",
                    "Economia anual superior a R$ 3 milhões",
                    "Mais de 500 mil árvores preservadas"
                ],
                beneficios=[
                    {"titulo": "Agilidade", "descricao": "Tramitação de processos em minutos em vez de semanas úteis."},
                    {"titulo": "Sustentabilidade", "descricao": "Eliminação total de insumos gráficos e resíduos físicos."},
                    {"titulo": "Transparência", "descricao": "Rastreamento do processo pelo munícipe em tempo real."}
                ],
                data_implantacao="Outubro de 2017",
                status_operacional="Em Produção / Concluído",
                ods_vinculados=[9, 11, 12, 16]
            )
            db.session.add(proj_papel)
            db.session.flush()

            # Kit Slide 1: Capa
            if tpl_capa:
                k1 = Slide(
                    projeto_id=proj_papel.id,
                    template_id=tpl_capa.id,
                    ordem=1,
                    alinhamento_texto="left",
                    filtro_fundo="escurecer",
                    estilo_fundo="full_scrim",
                    cabecalho_ativo=True
                )
                db.session.add(k1)
                db.session.flush()
                db.session.add(CampoPreenchido(slide_id=k1.id, chave_campo="titulo", tipo_fonte="manual", valor_manual="Barueri Sem Papel — Eficiência Digital", tamanho_texto="36px", cor_texto="#FFFFFF", fonte="Montserrat"))
                db.session.add(CampoPreenchido(slide_id=k1.id, chave_campo="subtitulo", tipo_fonte="manual", valor_manual="Governo 100% digital a serviço do cidadão e do meio ambiente", tamanho_texto="20px", cor_texto="#F8F9FA"))
                db.session.add(CampoPreenchido(slide_id=k1.id, chave_campo="imagem_fundo", tipo_fonte="manual", valor_manual=proj_papel.foto_url))

            # Kit Slide 2: Módulos e Pilares
            if tpl_pilares:
                k2 = Slide(
                    projeto_id=proj_papel.id,
                    template_id=tpl_pilares.id,
                    ordem=2,
                    alinhamento_texto="left",
                    filtro_fundo="nenhum",
                    estilo_fundo="contained"
                )
                db.session.add(k2)
                db.session.flush()
                db.session.add(CampoPreenchido(slide_id=k2.id, chave_campo="titulo", tipo_fonte="manual", valor_manual="Pilares de Sustentação do Programa", tamanho_texto="32px", cor_texto="#102A56", fonte="Montserrat"))
                db.session.add(CampoPreenchido(slide_id=k2.id, chave_campo="pilar_1_titulo", tipo_fonte="manual", valor_manual="Agilidade Absoluta"))
                db.session.add(CampoPreenchido(slide_id=k2.id, chave_campo="pilar_1_texto", tipo_fonte="manual", valor_manual="Tramitação de processos em minutos em vez de semanas úteis."))
                db.session.add(CampoPreenchido(slide_id=k2.id, chave_campo="pilar_2_titulo", tipo_fonte="manual", valor_manual="Descarbonização"))
                db.session.add(CampoPreenchido(slide_id=k2.id, chave_campo="pilar_2_texto", tipo_fonte="manual", valor_manual="Eliminação total de insumos gráficos e resíduos físicos."))
                db.session.add(CampoPreenchido(slide_id=k2.id, chave_campo="pilar_3_titulo", tipo_fonte="manual", valor_manual="Cidadão Conectado"))
                db.session.add(CampoPreenchido(slide_id=k2.id, chave_campo="pilar_3_texto", tipo_fonte="manual", valor_manual="Rastreamento do processo pelo munícipe em tempo real via web."))

            # Kit Slide 3: Indicadores
            if tpl_indicadores:
                k3 = Slide(
                    projeto_id=proj_papel.id,
                    template_id=tpl_indicadores.id,
                    ordem=3,
                    alinhamento_texto="left"
                )
                db.session.add(k3)
                db.session.flush()
                db.session.add(CampoPreenchido(slide_id=k3.id, chave_campo="titulo", tipo_fonte="manual", valor_manual="Resultados Consolidados do Barueri Sem Papel", tamanho_texto="30px", cor_texto="#102A56"))
                db.session.add(CampoPreenchido(slide_id=k3.id, chave_campo="card_metrica_1", tipo_fonte="manual", valor_manual="100% Digitais"))
                db.session.add(CampoPreenchido(slide_id=k3.id, chave_campo="card_rotulo_1", tipo_fonte="manual", valor_manual="Processos Administrativos"))
                db.session.add(CampoPreenchido(slide_id=k3.id, chave_campo="card_metrica_2", tipo_fonte="manual", valor_manual="R$ 3M+"))
                db.session.add(CampoPreenchido(slide_id=k3.id, chave_campo="card_rotulo_2", tipo_fonte="manual", valor_manual="Economia Anual em Papel"))

            print("✨ Projeto Oficial 'Barueri Sem Papel' criado com Kit de 3 slides homologados!")
        else:
            print("ℹ️ Projeto Oficial 'Barueri Sem Papel' já existente.")

        # Projeto 2: Metaverso Barueri
        proj_meta = Projeto.query.filter_by(slug="metaverso-barueri").first()
        if not proj_meta:
            proj_meta = Projeto(
                slug="metaverso-barueri",
                nome="Projeto Metaverso Barueri",
                secretaria_principal="Secretaria de Inovação e Tecnologia (CIT)",
                resumo="Ambiente virtual tridimensional para gêmeo digital da cidade, capacitação de servidores e atendimento interativo ao cidadão.",
                foto_url="https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1200&auto=format&fit=crop&q=80",
                destaques=[
                    "Gêmeo digital e modelagem 3D do município",
                    "Aulas de realidade virtual para a rede de ensino",
                    "Totem e atendimento virtual no ecossistema imersivo"
                ],
                beneficios=[
                    {"titulo": "Gêmeo Digital", "descricao": "Simulação de tráfego e zeladoria urbana."},
                    {"titulo": "Educação 3D", "descricao": "Aulas imersivas para alunos da rede municipal."},
                    {"titulo": "Atendimento", "descricao": "Balcão virtual com atendentes no Metaverso."}
                ],
                data_implantacao="Março de 2023",
                status_operacional="Em Expansão",
                ods_vinculados=[4, 9, 11]
            )
            db.session.add(proj_meta)
            db.session.flush()

            if tpl_capa:
                km1 = Slide(
                    projeto_id=proj_meta.id,
                    template_id=tpl_capa.id,
                    ordem=1,
                    alinhamento_texto="left",
                    filtro_fundo="escurecer",
                    estilo_fundo="full_scrim",
                    cabecalho_ativo=True
                )
                db.session.add(km1)
                db.session.flush()
                db.session.add(CampoPreenchido(slide_id=km1.id, chave_campo="titulo", tipo_fonte="manual", valor_manual="Metaverso Barueri — A Cidade do Futuro", tamanho_texto="36px", cor_texto="#FFFFFF", fonte="Montserrat"))
                db.session.add(CampoPreenchido(slide_id=km1.id, chave_campo="subtitulo", tipo_fonte="manual", valor_manual="Inovação imersiva e simulação urbana a serviço de Barueri", tamanho_texto="20px", cor_texto="#F8F9FA"))
                db.session.add(CampoPreenchido(slide_id=km1.id, chave_campo="imagem_fundo", tipo_fonte="manual", valor_manual=proj_meta.foto_url))

            print("✨ Projeto Oficial 'Metaverso Barueri' criado com Kit de slides homologados!")
        else:
            print("ℹ️ Projeto Oficial 'Metaverso Barueri' já existente.")

        db.session.commit()
        print("✅ Projetos oficiais e Kits de Slides garantidos com sucesso!")
        print("=" * 60 + "\n")

if __name__ == '__main__':
    rodar_seed_projeto_vitrine()
