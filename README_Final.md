# Conecta Barueri

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Framework-000000?logo=flask&logoColor=white)

O **Conecta Barueri** é uma plataforma corporativa e institucional de inteligência de dados, desenvolvida em parceria com a Secretaria de Inovação e Tecnologia (CIT) da **Prefeitura de Barueri**.

O objetivo principal do sistema é centralizar informações socioeconômicas e operacionais do município e fornecer uma ferramenta robusta para que servidores e gestores públicos criem apresentações oficiais com base em dados estruturados.

## 🎯 O Problema que Resolvemos

Na gestão pública, informações e métricas importantes frequentemente ficam dispersas em diferentes planilhas, relatórios e secretarias, dificultando a compilação rápida de dados para reuniões e eventos. Além disso, a criação de apresentações manuais (como em editores gráficos convencionais) muitas vezes resulta em quebras do padrão visual da instituição.

O **Conecta Barueri** soluciona esses problemas atuando em duas frentes:
1. **Centralização:** Organiza e disponibiliza os dados do município em um único repositório confiável.
2. **Padronização:** Fornece um **editor de apresentações baseado em templates restritos**. O usuário não precisa se preocupar com design, alinhamento ou cores institucionais — o sistema protege a identidade visual da prefeitura, permitindo que o gestor foque exclusivamente na composição do conteúdo.

## ✨ Principais Funcionalidades

O sistema foi desenhado para ser intuitivo para o usuário final, com os seguintes recursos principais:

- **Autenticação Segura:** Controle de acesso corporativo restrito, com níveis de permissão (Usuário e Administrador).
- **Gestão de Projetos:** Organização temática do conteúdo. Um usuário pode criar "Projetos" (ex: *Educação 2026*, *Barueri Sem Papel*) para agrupar diferentes materiais de uma mesma secretaria.
- **Editor de Slides Institucionais:** Interface para montagem de apresentações compostas por múltiplos slides.
- **Templates Dinâmicos:** A plataforma restringe a criação visual a blocos estruturais pré-aprovados pela prefeitura (ex: Slides de Capa, Imagem + Texto, Indicadores de Dados e Mapas).
- **Reuso de Mídias:** Sistema inteligente que permite reaproveitar logotipos, imagens e vídeos já utilizados em outras apresentações de um mesmo projeto, agilizando a criação de novos materiais.
- **Renderização de Dados:** Capacidade de puxar e preencher indicadores oficiais do município diretamente nos slides.

## 🏗️ Estrutura Macro do Sistema

A organização lógica das informações dentro da plataforma segue esta hierarquia contínua:

1. **Usuário:** Dono e gerenciador do conteúdo.
2. ↳ **Projeto:** Pasta temática que agrupa assuntos relacionados.
3. &nbsp;&nbsp;&nbsp;&nbsp;↳ **Apresentação:** O arquivo final (versões diferentes podem pertencer a um mesmo projeto).
4. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↳ **Slide:** As páginas ordenadas da apresentação.
5. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↳ **Template & Campos:** A estrutura fixa e os dados nela preenchidos (texto, mídia ou indicadores).

## 💻 Stack Tecnológica

O sistema foi construído utilizando tecnologias modernas e consolidadas para garantir segurança, velocidade e manutenibilidade:

**Backend & Persistência:**
* **Python 3**
* **Flask** (Framework Web)
* **PostgreSQL** (Banco de Dados Relacional)
* **SQLAlchemy** (ORM)

**Segurança & Validação:**
* **Flask-Login** (Gestão de Sessões)
* **Flask-Bcrypt** (Criptografia de Senhas)
* **Flask-WTF / WTForms** (Validação e proteção CSRF)

**Frontend:**
* **HTML5 & CSS3**
* **Bootstrap 5** (Responsividade e Componentes)
* **Jinja2** (Motor de Templates Server-side)
* **JavaScript (Vanilla)**
* **Chart.js & Leaflet.js** (Renderização opcional de gráficos e mapas interativos)

## 🚀 Como Executar o Projeto Localmente

Para rodar o Conecta Barueri em seu ambiente de desenvolvimento, siga os passos abaixo:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/conecta-barueri.git
   cd conecta-barueri
   ```

2. **Crie e ative um ambiente virtual (recomendado):**
   ```bash
   python -m venv venv
   
   # No Windows:
   venv\Scripts\activate
   # No Linux/Mac:
   source venv/bin/activate
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure o Banco de Dados:**
   Certifique-se de ter o PostgreSQL rodando localmente. Crie o banco de dados correspondente e, se necessário, importe o arquivo `banco_de_dados.sql` fornecido na raiz do projeto para criar as estruturas iniciais.

5. **Execute a aplicação:**
   ```bash
   python run.py
   ```
   O sistema estará disponível no seu navegador acessando `http://localhost:5000`.

## 🎓 Créditos e Equipe

O **Conecta Barueri** foi idealizado e desenvolvido como Trabalho de Conclusão de Curso (TCC) do programa técnico de Informática para Internet.

* **Instituição:** Etec Antônio Furlan (Centro Paula Souza)
* **Ano:** 2026
* **Equipe de Desenvolvimento:**
  * Vinícius Santos Gomes (VinicinMD)
  * Lucas007
  * Marianna
  * Vinisete
