"""
Script 08: Pipeline de Ingestão em Lote do Portal CIT de Barueri (Conecta Barueri)
Responsável por consumir as iniciativas municipais publicadas no portal oficial do CIT:
- Base: https://portal.barueri.sp.gov.br/cit/ProjetosSecretaria.aspx?op=22
- Extrai metadados completos: Nome, Secretaria, Resumo, Destaques, Benefícios, ODS e Fotos em alta resolução.
- Persiste na tabela 'apresentacao.projeto'.
- Gera automaticamente o Kit Modular de 3 Slides (Capa, Módulos/Pilares e Indicadores) em 'apresentacao.slide'.
"""
import os
import sys
import re
import unicodedata
import requests
from bs4 import BeautifulSoup
import urllib3

# Desativa alertas de certificados SSL para portais governamentais com cadeias legadas
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Garante acesso aos módulos da raiz 'conecta_barueri'
DIRETORIO_ATUAL = os.path.dirname(os.path.abspath(__file__))
DIRETORIO_RAIZ = os.path.abspath(os.path.join(DIRETORIO_ATUAL, '..'))
sys.path.insert(0, DIRETORIO_RAIZ)

from app import create_app, db
from app.models import Projeto, Slide, CampoPreenchido, SlotFlexivel, Templates

BASE_URL = "https://portal.barueri.sp.gov.br/cit/"
CIT_CATALOGO_URL = f"{BASE_URL}ProjetosSecretaria.aspx?op=22"
DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def slugify(texto):
    """Gera um slug único e limpo para URLs e identificação no banco"""
    if not texto:
        return "projeto-cit"
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')
    texto = re.sub(r'[^\w\s-]', '', texto).strip().lower()
    return re.sub(r'[-\s]+', '-', texto)[:180]

def extrair_detalhes_projeto(url_relativa, session=None):
    """
    Consome uma página individual de projeto (Portifolio.aspx?op=X)
    e extrai os campos estruturados utilizando conexão persistente (Session).
    """
    url_completa = BASE_URL + url_relativa if not url_relativa.startswith('http') else url_relativa
    headers = {"User-Agent": DEFAULT_USER_AGENT}
    client = session if session is not None else requests

    op_match = re.search(r'op=(\d+)', url_relativa)
    op_id = op_match.group(1) if op_match else ""

    try:
        resp = client.get(url_completa, headers=headers, verify=False, timeout=15)
        if resp.status_code != 200:
            print(f"⚠️ Erro HTTP {resp.status_code} ao acessar {url_completa}")
            return None

        soup = BeautifulSoup(resp.text, 'html.parser')

        # 1. Título do Projeto
        titulo = ""
        h_proj = soup.find(lambda t: t.name in ['h1', 'h2', 'h3'] and 'projeto:' in t.get_text().lower())
        if h_proj:
            titulo = h_proj.get_text().replace('Projeto:', '').strip()
        else:
            # Fallback para o primeiro h2/h3 relevante
            tag_title = soup.find('h2') or soup.find('h3')
            titulo = tag_title.get_text(strip=True) if tag_title else "Projeto Municipal CIT"

        # Limpa quebras de linha e espaços extras
        titulo = re.sub(r'\s+', ' ', titulo).strip()
        if not titulo or len(titulo) < 3:
            return None

        # 2. Resumo / Descrição Geral
        resumo = ""
        p_desc = soup.find('p')
        if p_desc:
            resumo = re.sub(r'\s+', ' ', p_desc.get_text(strip=True))

        # 3. Secretaria Principal
        secretaria = "Secretaria de Inovação e Tecnologia (CIT)"
        h_sec = soup.find(lambda t: t.name in ['h4', 'h5', 'h6', 'strong', 'b'] and 'secretaria principal:' in t.get_text().lower())
        if h_sec:
            prox = h_sec.find_next_sibling()
            if prox and prox.get_text(strip=True):
                secretaria = prox.get_text(strip=True)

        # 4. Data de Implantação e Status
        data_imp = "Em operação"
        h_data = soup.find(lambda t: t.name in ['h4', 'h5', 'h6', 'strong', 'b'] and 'implantação:' in t.get_text().lower())
        if h_data and h_data.find_next_sibling():
            data_imp = h_data.find_next_sibling().get_text(strip=True) or data_imp

        status_op = "Implantado e em uso"
        h_status = soup.find(lambda t: t.name in ['h4', 'h5', 'h6', 'strong', 'b'] and 'status:' in t.get_text().lower())
        if h_status and h_status.find_next_sibling():
            status_op = h_status.find_next_sibling().get_text(strip=True) or status_op

        # 5. Destaques (3 pontos de impacto)
        destaques = []
        h_dest = soup.find(lambda t: t.name in ['h3', 'h4', 'h5'] and 'destaque' in t.get_text().lower())
        if h_dest:
            ul_dest = h_dest.find_next_sibling('ul') or h_dest.find_next('ul')
            if ul_dest:
                for li in ul_dest.find_all('li'):
                    texto_li = re.sub(r'\s+', ' ', li.get_text(strip=True))
                    if texto_li and texto_li not in destaques:
                        destaques.append(texto_li)
        destaques = destaques[:3] if destaques else ["Inovação e Modernização Administrativa", "Atendimento Ágil ao Cidadão", "Governo Digital Barueri"]

        # 6. Benefícios / Pilares (Template 9)
        beneficios = []
        h_ben = soup.find(lambda t: t.name in ['h3', 'h4', 'h5'] and 'benefício' in t.get_text().lower())
        if h_ben:
            ul_ben = h_ben.find_next_sibling('ul') or h_ben.find_next('ul')
            if ul_ben:
                for li in ul_ben.find_all('li'):
                    txt = re.sub(r'\s+', ' ', li.get_text(strip=True))
                    if txt:
                        # Tenta separar título de descrição se houver dois pesos
                        partes = txt.split(' - ') if ' - ' in txt else [txt[:35], txt]
                        tit_pilar = partes[0].strip()
                        desc_pilar = partes[1].strip() if len(partes) > 1 else txt
                        if tit_pilar and desc_pilar:
                            beneficios.append({"titulo": tit_pilar[:60], "descricao": desc_pilar})
        
        # Garante 3 benefícios institucionais
        if len(beneficios) < 3:
            exemplos = [
                {"titulo": "Eficiência e Agilidade", "descricao": "Redução drástica no tempo de resposta e tramitação de serviços municipais."},
                {"titulo": "Acessibilidade Universal", "descricao": "Facilidade de acesso para toda a população de Barueri através de canais digitais."},
                {"titulo": "Governança e Transparência", "descricao": "Acompanhamento transparente das metas e entregas das secretarias da cidade."}
            ]
            for ex in exemplos:
                if len(beneficios) < 3:
                    beneficios.append(ex)

        # 7. ODS da ONU impactados
        ods_encontrados = []
        for img in soup.find_all('img', src=re.compile(r'ONU', re.I)):
            src = img.get('src', '')
            match = re.search(r'ONU/(\d+)', src)
            if match:
                num = int(match.group(1))
                if 1 <= num <= 17 and num not in ods_encontrados:
                    ods_encontrados.append(num)
        ods_vinculados = ods_encontrados if ods_encontrados else [9, 11]

        # 8. Foto Oficial
        foto_url = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80"
        img_car = soup.find('img', src=re.compile(r'Foto\.aspx.*op=carousel', re.I))
        if img_car and img_car.get('src'):
            src_raw = img_car['src'].replace('&amp;', '&')
            foto_url = BASE_URL + src_raw

        return {
            "nome": titulo,
            "slug": slugify(titulo),
            "secretaria_principal": secretaria,
            "resumo": resumo or f"Iniciativa oficial da Prefeitura de Barueri voltada para {titulo.lower()}.",
            "descricao_completa": resumo,
            "foto_url": foto_url,
            "destaques": destaques,
            "beneficios": beneficios[:3],
            "data_implantacao": data_imp,
            "status_operacional": status_op,
            "ods_vinculados": ods_vinculados,
            "op_id": op_id
        }
    except Exception as e:
        print(f"⚠️ Erro ao processar projeto {url_relativa}: {e}")
        return None

def salvar_projeto_e_gerar_kit(dados):
    """
    Persiste a entidade Projeto no banco e gera automaticamente os 3 slides mestres do Kit.
    """
    slug = dados["slug"]
    projeto = Projeto.query.filter_by(slug=slug).first()
    # Se existir com o mesmo slug mas o nome for diferente, diferencia usando o op_id do portal
    if projeto and projeto.nome.strip().lower() != dados["nome"].strip().lower() and dados.get("op_id"):
        slug = f"{slug}-{dados['op_id']}"
        projeto = Projeto.query.filter_by(slug=slug).first()

    if not projeto:
        projeto = Projeto(
            slug=slug,
            nome=dados["nome"],
            secretaria_principal=dados["secretaria_principal"],
            resumo=dados["resumo"],
            descricao_completa=dados["descricao_completa"],
            foto_url=dados["foto_url"],
            destaques=dados["destaques"],
            beneficios=dados["beneficios"],
            data_implantacao=dados["data_implantacao"],
            status_operacional=dados["status_operacional"],
            ods_vinculados=dados["ods_vinculados"]
        )
        db.session.add(projeto)
        db.session.flush()
        print(f"✨ Projeto Ingerido: [{projeto.id}] {projeto.nome}")
    else:
        projeto.nome = dados["nome"]
        projeto.secretaria_principal = dados["secretaria_principal"]
        projeto.resumo = dados["resumo"]
        projeto.foto_url = dados["foto_url"]
        projeto.destaques = dados["destaques"]
        projeto.beneficios = dados["beneficios"]
        projeto.data_implantacao = dados["data_implantacao"]
        projeto.status_operacional = dados["status_operacional"]
        projeto.ods_vinculados = dados["ods_vinculados"]
        db.session.flush()
        print(f"🔄 Projeto Atualizado: [{projeto.id}] {projeto.nome}")

    # Garante a geração do Kit de 3 Slides caso ainda não existam para este projeto
    slides_existentes = Slide.query.filter_by(projeto_id=projeto.id).all()
    if not slides_existentes:
        tpl_capa = Templates.query.filter_by(codigo="capa").first()
        tpl_pilares = Templates.query.filter_by(codigo="modulos_pilares").first()
        tpl_indicadores = Templates.query.filter_by(codigo="indicadores").first()

        # Slide 1: Capa Oficial do Kit
        if tpl_capa:
            s1 = Slide(
                projeto_id=projeto.id,
                template_id=tpl_capa.id,
                ordem=1,
                alinhamento_texto="left",
                filtro_fundo="escurecer",
                estilo_fundo="full_scrim",
                cabecalho_ativo=True
            )
            db.session.add(s1)
            db.session.flush()

            db.session.add(CampoPreenchido(slide_id=s1.id, chave_campo="titulo", tipo_fonte="manual", valor_manual=projeto.nome, tamanho_texto="36px", cor_texto="#FFFFFF", fonte="Montserrat"))
            db.session.add(CampoPreenchido(slide_id=s1.id, chave_campo="subtitulo", tipo_fonte="manual", valor_manual=projeto.resumo[:180], tamanho_texto="20px", cor_texto="#F8F9FA"))
            db.session.add(CampoPreenchido(slide_id=s1.id, chave_campo="imagem_fundo", tipo_fonte="manual", valor_manual=projeto.foto_url))

            # Selos ODS sobrepostos
            if projeto.ods_vinculados:
                db.session.add(SlotFlexivel(
                    slide_id=s1.id,
                    tipo_elemento="ods",
                    posicao_matriz="bottom-right",
                    config_json={"arranjo": "linha", "selos": projeto.ods_vinculados}
                ))

        # Slide 2: Módulos e Pilares de Benefícios
        if tpl_pilares and projeto.beneficios:
            s2 = Slide(
                projeto_id=projeto.id,
                template_id=tpl_pilares.id,
                ordem=2,
                alinhamento_texto="left",
                filtro_fundo="nenhum",
                estilo_fundo="contained"
            )
            db.session.add(s2)
            db.session.flush()

            db.session.add(CampoPreenchido(slide_id=s2.id, chave_campo="titulo", tipo_fonte="manual", valor_manual=f"Pilares de Sustentação — {projeto.nome[:40]}", tamanho_texto="30px", cor_texto="#102A56", fonte="Montserrat"))
            for idx, ben in enumerate(projeto.beneficios[:3], start=1):
                db.session.add(CampoPreenchido(slide_id=s2.id, chave_campo=f"pilar_{idx}_titulo", tipo_fonte="manual", valor_manual=ben.get("titulo", f"Pilar {idx}")))
                db.session.add(CampoPreenchido(slide_id=s2.id, chave_campo=f"pilar_{idx}_texto", tipo_fonte="manual", valor_manual=ben.get("descricao", "")))

        # Slide 3: Indicadores e Destaques Consolidados
        if tpl_indicadores and projeto.destaques:
            s3 = Slide(
                projeto_id=projeto.id,
                template_id=tpl_indicadores.id,
                ordem=3,
                alinhamento_texto="left"
            )
            db.session.add(s3)
            db.session.flush()

            db.session.add(CampoPreenchido(slide_id=s3.id, chave_campo="titulo", tipo_fonte="manual", valor_manual="Destaques e Métricas da Iniciativa", tamanho_texto="30px", cor_texto="#102A56"))
            for idx, dest in enumerate(projeto.destaques[:3], start=1):
                db.session.add(CampoPreenchido(slide_id=s3.id, chave_campo=f"card_metrica_{idx}", tipo_fonte="manual", valor_manual=dest[:30]))
                db.session.add(CampoPreenchido(slide_id=s3.id, chave_campo=f"card_rotulo_{idx}", tipo_fonte="manual", valor_manual=f"Destaque Operacional {idx}"))

        print(f"   ↳ 🎯 Kit de 3 slides homologados gerado para o projeto '{projeto.nome}'!")

    db.session.commit()

def executar_ingestao(limite=None):
    """
    Função principal que descobre as páginas de projetos no portal do CIT
    e orquestra a raspagem e persistência.
    Se limite for None, 0 ou 'todas', ingere TODAS as iniciativas encontradas no catálogo.
    """
    app = create_app()
    with app.app_context():
        print("\n" + "=" * 70)
        print("🌐 [08/08] INICIANDO PIPELINE DE INGESTÃO DO PORTAL CIT (BARUERI)...")
        print(f"🔗 Catálogo Alvo: {CIT_CATALOGO_URL}")

        session = requests.Session()
        session.headers.update({"User-Agent": DEFAULT_USER_AGENT})

        try:
            resp = session.get(CIT_CATALOGO_URL, verify=False, timeout=15)
            if resp.status_code != 200:
                print(f"❌ Não foi possível carregar o catálogo do CIT (Status: {resp.status_code})")
                return

            soup = BeautifulSoup(resp.text, 'html.parser')
            links_projetos = []

            for a in soup.find_all('a', href=re.compile(r'Portifolio\.aspx\?op=\d+', re.I)):
                href = a['href']
                if href not in links_projetos:
                    links_projetos.append(href)

            total_encontrados = len(links_projetos)
            print(f"🔎 Encontradas {total_encontrados} iniciativas municipais no portal do CIT!")

            if limite is None or limite <= 0:
                alvo = links_projetos
                print(f"🎯 Meta de Ingestão: TODAS as {total_encontrados} iniciativas oficiais!")
            else:
                alvo = links_projetos[:limite]
                print(f"🎯 Meta de Ingestão: Top {len(alvo)} de {total_encontrados} iniciativas oficiais")
            print("=" * 70)

            sucessos = 0
            for idx, link_rel in enumerate(alvo, start=1):
                print(f"\n[{idx}/{len(alvo)}] Raspando: {link_rel}...")
                dados = extrair_detalhes_projeto(link_rel, session=session)
                if dados:
                    salvar_projeto_e_gerar_kit(dados)
                    sucessos += 1

            print("\n" + "=" * 70)
            print(f"🎉 INGESTÃO CONCLUÍDA: {sucessos} projetos cadastrados/atualizados com kits de slides!")
            print("=" * 70 + "\n")

        except Exception as e:
            print(f"❌ Falha crítica no pipeline de ingestão: {e}")

def executar_ingestao_padrao():
    """Wrapper para chamada pelo orquestrador mestre (todas as iniciativas)"""
    executar_ingestao(limite=None)

if __name__ == '__main__':
    limite_arg = None  # Padrão: ingerir TODAS as iniciativas
    if len(sys.argv) > 1:
        param = sys.argv[1].strip().lower()
        if param in ('todas', 'tudo', 'all', '0', '-1', 'none'):
            limite_arg = None
        else:
            try:
                limite_arg = int(param)
            except ValueError:
                limite_arg = None
    executar_ingestao(limite=limite_arg)
