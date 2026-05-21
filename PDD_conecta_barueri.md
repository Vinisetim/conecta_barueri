# PDD - Documento de Descrição do Projeto: Conecta Barueri

## 1. Visão Geral do Sistema
O **Conecta Barueri** é uma plataforma corporativa e institucional de inteligência de dados (Dashboard analítico) desenvolvida em parceria com a Prefeitura de Barueri. O sistema centraliza, processa e exibe indicadores socioeconômicos e operacionais do município, organizados por categorias/módulos (Saúde, Social, Segurança, Educação, Economia e Meio Ambiente).

## 2. Modelo de Negócio e Proposta de Valor
* **Público-Target Atual:** Servidores públicos municipais e gestores de secretarias da Prefeitura de Barueri.
* **Proposta de Valor:** Substituir relatórios fragmentados e planilhas por uma interface centralizada e visualmente intuitiva, otimizando a tomada de decisões estratégicas e o acompanhamento de metas governamentais.

## 3. Políticas de Acesso e Regras de Autenticação
* **Regra de Escopo Atual:** O sistema opera em modelo fechado. O acesso à área técnica e aos painéis de dados é restrito exclusivamente a pessoas com credenciais da prefeitura previamente cadastradas por um Administrador do sistema.
* **Diretriz de Escalabilidade (Futuro):** A arquitetura da aplicação deve ser projetada de forma desacoplada para permitir, caso decidido pela gestão, a abertura de uma versão pública com restrições de escopo de dados (ex: visualização de dados agregados para o cidadão comum, sem permissão de edição ou acesso a relatórios internos confidenciais).

## 4. Stack Tecnológica Base
* **Backend / Linguagem:** Python 3 (com framework Flask).
* **Banco de Dados:** PostgreSQL (Mapeado via Flask-SQLAlchemy).
* **Segurança:** Flask-Login (gerenciamento de sessões) e Flask-Bcrypt (criptografia de senhas em hash).
* **Frontend:** HTML5, CSS3, Bootstrap 5 (visual corporativo e responsivo) e Bootstrap Icons.

## 5. Estrutura Arquitetural Base (Padrão MVC / Factory)
A estrutura de diretórios do projeto segue o padrão modular MVC através do uso de Blueprints. Como o sistema está em desenvolvimento ativo, esta árvore reflete a base atual e prevê o crescimento modular de estilos e visões específicas:

```text
conecta-barueri/
│
├── app/
│   ├── __init__.py          # Inicialização do app, configurações e registro de extensões/blueprints
│   ├── models.py            # Modelos do SQLAlchemy correspondentes às tabelas do banco
│   │
│   ├── routes/              # Camada Controller (Rotas e Regras de Negócio)
│   │   ├── auth.py          # Rotas de controle de sessão (Login, Logout)
│   │   └── main.py          # Rotas institucionais e páginas gerais (Landing Page)
│   │
│   ├── static/              # Arquivos Estáticos Globais e Contextuais
│   │   ├── css/
│   │   │   ├── app/         # Folhas de estilo da área interna/dashboard
│   │   │   ├── auth/        # Folhas de estilo das telas de autenticação
│   │   │   ├── landing/     # Folhas de estilo da landing page institucional
│   │   │   └── global.css   # Variáveis globais, resets e padrões de tipografia
│   │   └── js/              # Scripts comportamentais (divididos por contexto)
│   │
│   └── templates/           # Camada View (Interface de Usuário em Jinja2)
│       ├── app/             # Telas da aplicação logada (Dashboard e Módulos)
│       ├── auth/            # Telas do fluxo de acesso (login.html)
│       ├── landing/         # Telas da área pública (index.html)
│       └── base.html        # Estrutura base comum/esqueleto do site
│
├── .gitignore               # Restrição de arquivos de ambiente virtual (.venv) e chaves
├── banco_de_dados.sql       # Script de definição física e sementes do banco (Sujeito a alterações)
├── requirements.txt         # Listagem de dependências pip do projeto
└── run.py                   # Ponto de entrada do servidor web Flask
```

## 6. Modelagem de Dados Atual (PostgreSQL)
O banco de dados é estruturado através de Schemas para separar o contexto de segurança e controle de acessos da camada de persistência de conteúdo das apresentações.

### 6.1. Schema: login
* **Tabela usuario:** Armazena o perfil básico dos servidores cadastrados.
  * `id` (SERIAL, Chave Primária)
  * `nome` (VARCHAR(255))
  * `email` (TEXT)
  * `admin` (BOOLEAN) - Define privilégios de gerenciamento e criação de novos usuários.
* **Tabela senha:** Relacionamento 1:1 com a tabela de usuários para segregação de credenciais.
  * `usuario_id` (INTEGER, Chave Primária e Estrangeira referenciando `login.usuario(id)`).
  * `senha` (VARCHAR(255)) - Armazena a credencial (obrigatoriamente convertida em hash criptográfico Bcrypt pela aplicação).

### 6.2. Schema: apresentacao
* **Tabela categoria:** Listagem estática das secretarias municipais monitoradas (Saúde, Social, Segurança, Educação, Economia e Meio Ambiente).
  * `id` (SERIAL, Chave Primária).
  * `nome` (VARCHAR(100), Único, Não Nulo).
* **Tabela salvar_apresentacao:** Armazena os registros estruturados e configurações salvos por cada usuário em seus respectivos módulos.
  * `id` (SERIAL, Chave Primária)[cite: 1]
  * `categoria_id` (INTEGER, Chave Estrangeira referenciando `apresentacao.categoria(id)`).
  * `usuario_id` (INTEGER, Chave Estrangeira referenciando `login.usuario(id)`).
  * `nome` (VARCHAR(255)) - Nome identificador do relatório/painel salvo.
  * `dados_salvos` (VARCHAR(255)) - Payload ou string de dados técnicos referentes ao estado do painel.

---

## 7. Diretrizes Críticas para Desenvolvimento (Padrões do Projeto)

### 7.1. Identidade Visual e UI/UX (Abordagem Light Mode)
* **Estética Geral:** A interface adota permanentemente o padrão Light Mode Corporativo, focado em alta legibilidade, sobriedade institucional e profissionalismo técnico[cite: 1]. O uso de temas totalmente escuros (Dark Mode) foi descontinuado.
* **Paleta de Cores:**
  * **Fundos:** Brancos puros (`#FFFFFF`) e variações de cinzas ultra-claros (como `#F8F9FA` ou `#F0F2F5`) para separação de seções e cards.
  * **Elementos de Destaque:** Textos principais, links e botões de ação devem utilizar variações de Azul Royal e Azul Marinho para transmitir a identidade governamental.
* **Interface Dividida (Split-Screen) no Login:** O fluxo de autenticação utiliza um layout dividido em duas colunas simétricas em resoluções desktop[cite: 1]:
  * **Coluna Esquerda:** Reservada exclusivamente ao formulário de credenciais (Inputs de Usuário, Senha, checkbox "Lembrar de mim" e botão "Entrar")[cite: 1].
  * **Coluna Direita:** Bloco visual informativo contendo ilustrações vetorizadas simples da cidade e pilares institucionais (Dados em tempo real, Segurança, Transparência e Gestão integrada).
* **Responsividade:** O design deve ser 100% responsivo usando classes utilitárias do Bootstrap (ex: `d-none d-md-flex`)[cite: 1]. Em dispositivos mobile, a coluna informativa da direita deve ser completamente oculta, priorizando o formulário de login na tela inteira.

### 7.2. Engenharia de Software e Banco de Dados

#### A. Renderização Baseada em Componentes e Herança (Jinja2)
* **Proibição de Redundância:** Fica estritamente proibida a duplicação manual de estruturas repetitivas de layout (Tags `<head>`, scripts, folhas de estilo Bootstrap, Navbars ou Footers) nos arquivos HTML individuais.
* **Layout Central (base.html):** O arquivo `app/templates/base.html` atua como o esqueleto global unificado do sistema[cite: 1]. Ele carrega todas as dependências do Bootstrap, fontes e arquivos de estilização global (`global.css`).
* **Mecanismo de Extensão:** As visões das páginas de rotas específicas (como `index.html` ou `login.html`) devem iniciar obrigatoriamente declarando a tag `{% extends 'base.html' %}`[cite: 1]. O conteúdo mutável de cada tela deve ser injetado estritamente dentro de blocos nomeados, como `{% block content %}` e `{% endblock %}`.

#### B. Criptografia e Segurança de Credenciais
* **Armazenamento de Senhas:** Nenhuma credencial de acesso de servidor ou administrador pode trafegar ou ser registrada no banco de dados em formato de texto limpo (texto plano).
* **Camada de Criptografia (Flask-Bcrypt):** O fluxo de cadastro e validação de usuários deve interceptar a string recebida nos formulários e aplicar funções matemáticas de dispersão (hashing) baseadas em Bcrypt antes de interagir com a persistência.
* **Validação em Operadores:** Checagens de login não utilizam comparadores lógicos comuns (como `==`)[cite: 1]. A autenticação deve obrigatoriamente chamar o método seguro de verificação da biblioteca para comparar o hash guardado com o texto digitado pelo usuário.

#### C. Persistência e Isolamento de Dados (Camada de Abstração)
* **Desenvolvimento Contínuo do Banco:** Fica estabelecido que a modelagem física de tabelas e a divisão de schemas (`login` e `apresentacao`) no arquivo `banco_de_dados.sql` estão sujeitas a modificações, refinamentos e ajustes estruturais frequentes pela equipe de dados.
* **Uso de ORM (Flask-SQLAlchemy):** Para mitigar o impacto de alterações estruturais no banco de dados, todas as rotas e regras de negócio do backend Python devem interagir com as tabelas exclusivamente por meio de mapeamento objeto-relacional (modelos de classes no arquivo `models.py`).
* **Isolamento de Queries:** É proibida a escrita de consultas SQL puras (raw queries) dentro das rotas dos Blueprints[cite: 1]. O isolamento provido pelas classes do SQLAlchemy garante que, caso uma coluna mude de nome ou tipo no arquivo SQL, apenas o arquivo `models.py` precisará de manutenção, sem quebrar o ecossistema de rotas e dashboards do Flask.
