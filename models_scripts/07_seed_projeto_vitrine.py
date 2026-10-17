"""
Script 07: Seed do Projeto Vitrine Oficial de Demonstração (Conecta Barueri)
Cria um projeto e uma apresentação completa com múltiplos slides configurados,
alimentados pelos templates homologados, catálogo de autoridades e indicadores dinâmicos.
Ideal para testes de ponta a ponta na Pré-Banca e Banca Final!
"""
import os
import sys

# Garante acesso aos módulos da raiz 'conecta_barueri'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import Usuario, Projeto, Apresentacao, Templates, Slide, CampoPreenchido, SlotFlexivel, Indicador

def rodar_seed_projeto_vitrine():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("🚀 [07/07] SEMEANDO PROJETO VITRINE PARA A BANCA...")
        print("=" * 60)

        # 1. Busca usuário dono (prioriza admin)
        admin = Usuario.query.filter_by(admin=True).first()
        if not admin:
            admin = Usuario.query.first()
        if not admin:
            print("⚠️ Erro: Nenhum usuário encontrado! Execute primeiro o script '02_seed_usuarios.py'.")
            return

        # 2. Garante o Projeto Vitrine
        nome_projeto = "Barueri Inteligente e Sustentável 2026"
        projeto = Projeto.query.filter_by(nome=nome_projeto, usuario_id=admin.id).first()

        if not projeto:
            projeto = Projeto(
                usuario_id=admin.id,
                nome=nome_projeto,
                descricao="Pasta temática oficial demonstrando a transformação digital, o programa Barueri Sem Papel e os compromissos municipais com os ODS.",
                capa_uri="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
            )
            db.session.add(projeto)
            db.session.flush()
            print(f"✨ Projeto Vitrine criado: '{nome_projeto}' (ID: {projeto.id})")
        else:
            print(f"ℹ️ Projeto Vitrine já existente: '{nome_projeto}' (ID: {projeto.id})")

        # 3. Garante a Apresentação Vitrine
        nome_apresentacao = "Apresentação Oficial Conecta Barueri (Banca TCC)"
        apresentacao = Apresentacao.query.filter_by(nome=nome_apresentacao, projeto_id=projeto.id).first()

        if not apresentacao:
            apresentacao = Apresentacao(
                projeto_id=projeto.id,
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

        print("=" * 60 + "\n")

if __name__ == '__main__':
    rodar_seed_projeto_vitrine()
