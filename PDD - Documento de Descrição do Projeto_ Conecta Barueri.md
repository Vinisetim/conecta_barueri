# PDD - Documento de Descrição do Projeto: Conecta Barueri

> **Versão:** 2.0 | **Atualizado em:** 2026-09  
> **Base:** PDD v1.2 + Adendos de Escopo + Decisões Técnicas + Modelagem Projeto/Apresentação + Divisão de Tarefas  
> **Status:** Documento consolidado e expandido para orientação de desenvolvimento e equipe

---

## 1. Visão Geral do Sistema

O **Conecta Barueri** é uma plataforma corporativa e institucional de inteligência de dados desenvolvida em parceria com a Secretaria de Inovação e Tecnologia (CIT) da Prefeitura de Barueri.

O objetivo do sistema é centralizar, organizar e apresentar informações e indicadores socioeconômicos e operacionais do município, permitindo que servidores e gestores tenham acesso a informações estruturadas para acompanhamento e apresentação de dados.

O projeto originalmente previa uma experiência de **Dashboard analítico**, com módulos relacionados a:

- Saúde;
- Social;
- Segurança;
- Educação;
- Economia;
- Meio Ambiente.

### Atualização de escopo (O Pivot da Tela de Apresentação)

Após a apresentação do projeto à Prefeitura de Barueri e o recebimento de feedback da equipe, a proposta da tela de Apresentação foi modificada.

A experiência anteriormente planejada como um **mapa interativo com gráficos utilizando Leaflet.js e Chart.js** deixa de ser o núcleo da aplicação.

A tela de Apresentação passa a ser um **editor institucional de slides baseado em templates fixos e pré-configurados**.

O objetivo é permitir que o usuário monte apresentações institucionais utilizando estruturas visuais previamente definidas, preenchendo os conteúdos permitidos em cada template.

O sistema **não será um editor gráfico livre**.

O usuário não poderá criar livremente a estrutura visual dos slides, movimentar elementos arbitrariamente ou alterar a identidade visual institucional (sem editor drag-and-drop).

O mapa interativo (Leaflet) e os gráficos (Chart.js) foram mantidos no projeto, mas agora funcionam como componentes de templates específicos dentro do editor de slides ou visualizações bônus.

---

## 2. Modelo de Negócio e Proposta de Valor

### Público-alvo atual

O público-alvo inicial é composto por:

- servidores públicos municipais;
- gestores de secretarias;
- usuários autorizados da Prefeitura de Barueri.

O sistema opera inicialmente em um ambiente fechado, com acesso condicionado à existência de uma conta cadastrada.

### Proposta de Valor

O Conecta Barueri busca substituir informações dispersas em relatórios, planilhas e diferentes fontes por uma plataforma centralizada capaz de:

- organizar informações institucionais;
- facilitar a apresentação de indicadores;
- permitir a criação de apresentações personalizadas;
- manter uma identidade visual institucional consistente;
- facilitar o acesso a informações para tomada de decisões.

### Visão futura

A longo prazo, o sistema poderá possuir uma camada pública de apresentação de dados aprovados, caso essa abertura seja definida pela Prefeitura.

Essa possibilidade permanece **fora do escopo do MVP atual**.

---

## 3. Divisão de Tarefas da Equipe

Para garantir a entrega do MVP no prazo do TCC (~2 semanas de desenvolvimento focal), as responsabilidades da equipe foram estruturadas da seguinte forma:

| Membro | Papel | Escopo de Atuação |
| ------ | ----- | ----------------- |
| **Vinisete** | Dados, APIs & Banco de Dados | Modelagem PostgreSQL/SQLAlchemy, scripts de ingestão (ETL assíncrono), arquitetura de dados (camadas bruta e tratada), integrações de API. |
| **Marianna** | Frontend Design (UI/UX) | Design de templates de slides, estilização CSS corporativo (Light Mode), layouts Bootstrap 5, padronização visual. |
| **VinicinMD** | Frontend & Backend Development | Rotas Flask, renderização Jinja2, formulários Flask-WTF, interatividade JavaScript (Vanilla/fetch). |
| **Lucas007** | Frontend & Backend Development | Rotas Flask, autenticação (Flask-Login/Bcrypt), lógica de persistência de apresentações e slides, suporte a testes. |

---

## 4. Políticas de Acesso e Regras de Autenticação

## 4.1. Modelo atual

O sistema opera inicialmente em modelo fechado.

O acesso à área autenticada é restrito a usuários previamente cadastrados.

O modelo atual de permissões é simplificado:

```text
Usuário comum
Admin
```

O campo `admin` do modelo `Usuario` é utilizado para diferenciar usuários administrativos.

### Regra de desenvolvimento

Ao implementar funcionalidades que dependam de permissões, deve-se utilizar somente o modelo atual de:

- usuário comum (`admin = False`);
- administrador (`admin = True`).

Não implementar automaticamente a hierarquia de permissões proposta pela CIT.

---

## 4.2. Visão futura

A CIT apresentou uma proposta de níveis de acesso mais complexa, que poderá ser considerada futuramente:

| Papel | Responsabilidade |
| ----- | ---------------- |
| Administrador geral | Gerencia sistema, usuários, permissões, templates e integrações |
| Gestor institucional | Aprova conteúdos estratégicos e versões finais |
| Gestor de área/secretaria | Gerencia conteúdo da própria área |
| Editor | Cadastra e atualiza textos, imagens, indicadores e projetos |
| Revisor/aprovador | Confere informações antes da publicação |
| Apresentador | Monta apresentações com conteúdo aprovado |
| Público externo | Acessa somente conteúdo publicado |

Essa estrutura é **visão futura** e não faz parte do MVP.

---

## 4.3. Possível abertura pública

A abertura do sistema ao público externo ainda não foi definida pela Prefeitura.

Caso futuramente seja aprovada, poderá existir uma separação entre:

- ambiente público;
- área administrativa;
- modo apresentador;
- links de compartilhamento.

Essas funcionalidades não devem ser implementadas no MVP sem decisão explícita.

---

## 4.4. No radar pós-MVP: Sistema de Colaboradores por Projeto e Apresentação

Esta funcionalidade está **fora do escopo do MVP**, mas deve permanecer mapeada no radar arquitetural para as próximas versões da plataforma.

### Contexto Atual do MVP:
- O usuário que cria o Projeto é o seu **Dono** (`usuario_id`).
- O projeto e suas apresentações aparecem e são acessíveis **apenas para o seu dono criador** (e para administradores do sistema).

### Conceito de Colaboradores (Etapas Pós-MVP):
1. **Convite de Usuários do Sistema:**
   - O dono de um projeto poderá adicionar outros servidores (que já possuam conta/login ativo na plataforma) como **colaboradores** do projeto.
2. **Níveis de Acesso no Projeto:**
   - **Editor:** Usuário com permissão para criar novas apresentações e editar conteúdos de apresentações existentes dentro daquele projeto.
   - **Visualizador:** Usuário com permissão estrita de consulta, podendo assistir ou rodar a apresentação em tela cheia, sem capacidade de alterar templates, textos ou mídias.
3. **Granularidade e Configuração Individual por Apresentação:**
   - Em fases posteriores, a permissão poderá descer ao nível individual de cada Apresentação.
   - *Cenário:* Mesmo que um servidor seja "Editor" no escopo geral do Projeto, o dono poderá configurar uma apresentação específica como "Somente Visualização" para determinados colaboradores (ou restrita exclusivamente ao dono), garantindo sigilo ou proteção contra alterações acidentais em materiais homologados.

---

## 5. Stack Tecnológica Base

| Camada | Tecnologia |
| ------- | ---------- |
| Backend / Linguagem | Python 3 + Flask |
| Banco de Dados | PostgreSQL via Flask-SQLAlchemy |
| ORM | SQLAlchemy |
| Segurança de Sessão | Flask-Login |
| Criptografia de Senhas | Flask-Bcrypt |
| Validação de Formulários | Flask-WTF + WTForms |
| Frontend | HTML5, CSS3, Bootstrap 5, Bootstrap Icons |
| Templates | Jinja2 |
| Interatividade Client-Side | JavaScript (Vanilla) + `fetch()` assíncrono |

### Tecnologias fora do núcleo / Descartadas

- **Dash (Python/Plotly):** Descartado definitivamente após avaliação técnica. Exigia um servidor separado (`DispatcherMiddleware`) e trazia complexidade desnecessária. Visualizações de gráficos utilizam Chart.js.
- **Frameworks SPA (React/Vue):** Descartados para evitar a manutenção de dois projetos/builds separados.
- **Leaflet.js:** Deixou de ser o núcleo da tela de Apresentação, mas é utilizado no template específico de mapa municipal.
- **Chart.js:** Deixou de ser o núcleo da tela de Apresentação, mas é utilizado no template específico de gráfico.

---

## 6. Estrutura Arquitetural (Padrão MVC / Factory)

```text
conecta-barueri/
│
├── app/
│   ├── __init__.py          # Fábrica do app: inicializa extensões e registra blueprints
│   ├── models.py            # Modelos ORM (SQLAlchemy) mapeando as tabelas do banco
│   ├── forms.py             # Formulários Flask-WTF com validação e proteção CSRF
│   │
│   ├── routes/
│   │   ├── auth.py          # Rotas de autenticação: /login, /logout (Blueprint 'auth')
│   │   └── main.py          # Rotas institucionais: landing page (/) (Blueprint 'main')
│   │
│   ├── static/
│   │   └── css/
│   │       ├── app/
│   │       │   └── dashboard.css    # Estilos da área interna
│   │       ├── auth/
│   │       │   └── login.css        # Estilos da tela de login
│   │       ├── landing/
│   │       │   └── landing.css      # Estilos da landing page
│   │       ├── global.css           # Variáveis CSS, resets e tipografia global
│   │       ├── sidebar.css          # Estilos da barra lateral
│   │       └── style.css            # Estilos auxiliares gerais
│   │
│   ├── templates/
│   │   ├── app/
│   │   │   ├── base_app.html        # Base da área logada
│   │   │   └── home.html            # Tela inicial pós-login
│   │   ├── auth/
│   │   │   └── login.html           # Tela de login
│   │   ├── landing/
│   │   │   ├── base_site.html       # Base unificada: landing + auth
│   │   │   └── index.html           # Landing page institucional
│   │   └── base.html                # Esqueleto raiz
│   │
│   └── testes/
│       └── testes.html              # Arquivo de testes de interface
│
├── .gitignore
├── LICENSE
├── README.md
├── banco_de_dados.sql
├── requirements.txt
└── run.py
```

### Evolução prevista

A implementação do editor de apresentações e do modelo relacional expandido exige novos:

- modelos ORM (`Projeto`, `Apresentacao`, `Slide`, `Template`, `CampoPreenchido`);
- formulários Flask-WTF;
- rotas nos Blueprints;
- templates Jinja2 do editor;
- arquivos CSS/JS específicos para manipulação de slides.

---

## 7. Modelagem de Dados Existente (PostgreSQL)

O banco utiliza schemas para separar responsabilidades.

## 7.1. Schema: `login`

### Tabela `usuario`

| Coluna | Tipo | Descrição |
| ------ | ---- | --------- |
| `id` | SERIAL PK | Identificador único |
| `nome` | VARCHAR(255) | Nome do servidor |
| `email` | TEXT | E-mail de acesso |
| `admin` | BOOLEAN | Define privilégios administrativos |

### Tabela `senha`

| Coluna | Tipo | Descrição |
| ------ | ---- | ----------- |
| `usuario_id` | INTEGER PK/FK | Referencia `login.usuario(id)` |
| `senha` | VARCHAR(255) | Hash Bcrypt |

> ⚠️ O arquivo `banco_de_dados.sql` pode conter seeds com senhas em texto puro para desenvolvimento local. Isso nunca deve ser utilizado em produção. Senhas reais devem sempre ser armazenadas como hashes Bcrypt gerados pela aplicação.

---

## 7.2. Schema: `apresentacao` (Estrutura Provisória Legada)

A estrutura legada contém:

### Tabela `categoria`

| Coluna | Tipo | Descrição |
| ------ | ---- | ----------- |
| `id` | SERIAL PK | Identificador único |
| `nome` | VARCHAR(100) UNIQUE NOT NULL | Categoria/secretaria |

Categorias inicialmente previstas: Saúde, Social, Segurança, Educação, Economia, Meio Ambiente.

### Tabela `salvar_apresentacao`

| Coluna | Tipo | Descrição |
| ------ | ---- | ----------- |
| `id` | SERIAL PK | Identificador único |
| `categoria_id` | INTEGER FK | Referencia `apresentacao.categoria(id)` |
| `usuario_id` | INTEGER FK | Referencia `login.usuario(id)` |
| `nome` | VARCHAR(255) | Nome da apresentação |
| `dados_salvos` | VARCHAR(255) | Estado/payload da apresentação |

### ⚠️ Status da estrutura legada

A tabela `salvar_apresentacao` é **provisória, conceitual e descartável**.

A coluna `dados_salvos VARCHAR(255)` **não representa a modelagem definitiva**. O banco será remodelado do zero para suportar a nova hierarquia relacional.

---

## 8. Nova Modelagem de Dados: Distinção entre Projeto e Apresentação (v2.0)

Após análise e alinhamento com a Secretaria de Inovação e Tecnologia (CIT), ficou estabelecido que **Projeto e Apresentação são entidades separadas e com papéis distintos** (descartando a hipótese inicial de que seriam apenas sinônimos):

### 8.1. O que é um Projeto?
O **Projeto** funciona como uma **pasta temática ou guarda-chuva institucional**. Ele representa um grande tema, secretaria, iniciativa governamental ou programa municipal.
- **Características de um Projeto:**
  - Possui um **Nome** (ex: *"Saúde 2026"*, *"Barueri Sem Papel"*, *"Orçamento Municipal 2025"*).
  - Possui uma **Descrição** e uma **Imagem de Capa** (para identificação visual em cards na tela de Projetos).
  - Pertence a um **Dono criador** (`usuario_id`).
  - Possui uma tela própria na plataforma, funcionando como um diretório que agrupa e lista todas as **Apresentações** contidas nele.
  - Funciona como a **fronteira de segurança e reuso de mídias**: imagens, logotipos e vídeos cadastrados em uma apresentação podem ser reaproveitados em outras apresentações do *mesmo projeto*, sem misturar acervos com secretarias alheias.
  - Pode conter **uma ou mais** Apresentações.

### 8.2. O que é uma Apresentação?
A **Apresentação** é o **arquivo renderizável de slides em si** — o documento visual interativo que de fato é aberto, exibido em tela cheia ou projetado para uma audiência em reuniões e eventos.
- **Características de uma Apresentação:**
  - Pertence obrigatoriamente a um único **Projeto pai**.
  - É composta por uma sequência ordenada de **Slides** (Slide 1, Slide 2, Slide N...).
  - Cada slide utiliza um **Template fixo** preenchido com conteúdos (textos, gráficos, mapas, indicadores).
  - Pode ser editada, duplicada ou apresentada individualmente.

### 8.3. Por que ter múltiplas Apresentações em um mesmo Projeto? (Caso de Uso Real)
Um mesmo projeto institucional frequentemente precisa ser apresentado para públicos com perfis e tempos diferentes:

```text
Projeto: "Gestão de Saúde 2026" (Pasta Temática)
  │
  ├── Apresentação A: "Reunião Técnica de Secretariado"
  │     └── 20 slides detalhados: indicadores clínicos minuciosos, custos por procedimento e gráficos por UBS.
  │
  └── Apresentação B: "Audiência Pública com Cidadãos"
        └── 6 slides resumidos: fotos de novas entregas, destaques gerais e linguagem simplificada.
```
Ambas as apresentações compartilham a mesma pasta temática (*Saúde 2026*), mas possuem conjuntos de slides adaptados para objetivos e públicos diferentes.

### 8.4. Estrutura Hierárquica Relacional Definitiva:

```text
Usuário
   │
   └── Projeto (Pasta Temática: Nome, Descrição, Capa)
          │
          └── Apresentação (1 ou N por projeto: Nome, Categoria, Data)
                 │
                 └── Slide 1, 2... N (Ordenado via atributo 'ordem')
                        │
                        ├── Template (Lookup fixa com os 7 designs institucionais)
                        │
                        ├── Campos Preenchidos (EAV: Textos, URLs, Indicadores e Reuso)
                        │
                        └── Slots Flexíveis (Matriz 3×3: ODS, QR Code, Logotipos e Bandeiras)
```

### 8.5. Dicionário de Dados Técnico e Guia de Utilização (v2.0)

Abaixo está o mapeamento detalhado das tabelas que compõem o banco de dados do MVP, descrevendo a responsabilidade de cada uma, seus campos e como a equipe de desenvolvimento deve utilizá-las:

#### 1. `login.usuario` (Identidade e Acesso)
* **Objetivo:** Armazenar os dados de perfil dos servidores e administradores autorizados.
* **Colunas:**
  * `id` (`SERIAL PRIMARY KEY`): Identificador único do usuário.
  * `nome` (`VARCHAR(255) NOT NULL`): Nome completo do servidor.
  * `email` (`VARCHAR(255) UNIQUE NOT NULL`): E-mail institucional usado para login.
  * `admin` (`BOOLEAN DEFAULT FALSE`): Diferencia usuários comuns de administradores do sistema.
  * `status` (`BOOLEAN DEFAULT TRUE`): Indica se o usuário está ativo (`True`) ou desligado (`False`).
* **Como usar:** Consultada pelo Flask-Login via `@login_manager.user_loader`.

#### 2. `login.senha` (Segurança e Credenciais)
* **Objetivo:** Isolar o hash da senha dos dados cadastrais comuns (relação 1:1 estrita por segurança).
* **Colunas:**
  * `usuario_id` (`INTEGER PRIMARY KEY`, FK para `login.usuario.id`): Chave que é simultaneamente PK e FK, impedindo que um usuário tenha mais de uma senha ativa.
  * `senha` (`VARCHAR(255) NOT NULL`): Hash gerado via `Flask-Bcrypt`.
* **Como usar:** Nunca salvar texto puro. Validar com `bcrypt.check_password_hash(senha_banco, senha_digitada)`.

#### 3. `apresentacao.projeto` (Pasta Temática e Guarda-chuva)
* **Objetivo:** Organizar as apresentações em pastas temáticas de secretarias ou programas, além de atuar como fronteira de segurança para o reuso de mídias.
* **Colunas:**
  * `id` (`SERIAL PRIMARY KEY`): Identificador do projeto.
  * `usuario_id` (`INTEGER NOT NULL`, FK para `login.usuario.id`): Dono/criador do projeto.
  * `nome` (`VARCHAR(150) NOT NULL`): Nome da pasta temática (ex: *"Saúde 2026"*).
  * `descricao` (`TEXT`): Descrição opcional dos objetivos do projeto.
  * `capa_url` (`VARCHAR(255)`): Imagem que ilustra o card do projeto no painel principal.
* **Como usar:** No MVP, lista apenas os projetos criados pelo usuário logado (`usuario_id == current_user.id`) ou todos caso seja `admin`.

#### 4. `apresentacao.apresentacao` (Arquivo de Slides)
* **Objetivo:** O arquivo renderizável da apresentação de slides.
* **Colunas:**
  * `id` (`SERIAL PRIMARY KEY`): Identificador único da apresentação.
  * `projeto_id` (`INTEGER NOT NULL`, FK para `apresentacao.projeto.id`): Pasta temática à qual pertence.
  * `nome` (`VARCHAR(150) NOT NULL`): Título da apresentação (ex: *"Reunião de Secretariado"*).
  * `data_criacao` (`TIMESTAMP DEFAULT CURRENT_TIMESTAMP`): Data e hora de criação.
* **Como usar:** Uma apresentação é executada em modo apresentação (tela cheia) ou editada adicionando/removendo slides.

#### 5. `apresentacao.slide` (Página Ordenada e Configurações de Tela)
* **Objetivo:** Representa uma página individual da apresentação, guardando sua posição e parâmetros visuais.
* **Colunas:**
  * `id` (`SERIAL PRIMARY KEY`): Identificador do slide.
  * `apresentacao_id` (`INTEGER NOT NULL`, FK para `apresentacao.apresentacao.id`): Apresentação pai.
  * `template_id` (`INTEGER NOT NULL`, FK para `apresentacao.template.id`): Template visual utilizado.
  * `ordem` (`INTEGER NOT NULL`): Número de sequência da página (1, 2, 3...).
  * `alinhamento_texto` (`VARCHAR(20) DEFAULT 'left'`): Alinhamento institucional (`left`, `center`, `right`, `justify`).
  * `cor_texto` (`VARCHAR(10) DEFAULT '#212529'`): Cor restrita da paleta homologada (`#FFFFFF`, `#102A56`, `#212529`, `#0052FF`).
  * `filtro_fundo` (`VARCHAR(20) DEFAULT 'nenhum'`): Efeito na foto de fundo (`'nenhum'`, `'escurecer'`, `'borrar'`).
  * `estilo_fundo` (`VARCHAR(30) DEFAULT 'contained'`): Modo de enquadramento de fundo (`'full_scrim'` ou `'contained'`).
* **Como usar:** Ao reordenar slides na interface, o frontend envia a lista de IDs na nova sequência e o backend atualiza a coluna `ordem` em lote (bulk update).

#### 6. `apresentacao.template` (Catálogo Fixo de Estruturas)
* **Objetivo:** Tabela de referência estática (Lookup Table) populada pelos desenvolvedores com os 7 layouts homologados.
* **Colunas:**
  * `id` (`SERIAL PRIMARY KEY`): Identificador do template.
  * `nome` (`VARCHAR(100) NOT NULL`): Nome visual (ex: *"Imagem + Texto"*).
  * `codigo` (`VARCHAR(50) UNIQUE NOT NULL`): Identificador de código sem acento para busca no Jinja2 (ex: `"imagem_texto"`, `"capa"`, `"video"`).
  * `descricao` (`VARCHAR(255)`): Texto informativo para orientar o usuário na criação.
* **Como usar:** Não é editada pelo usuário final. Populada via script de seed (`seed_templates.py`).

#### 7. `apresentacao.campo_preenchido` (Conteúdo Dinâmico EAV e Reuso de Mídias)
* **Objetivo:** Armazena cada dado preenchido em um slide de forma desacoplada, permitindo que cada template tenha slots distintos e viabilizando o reuso de mídias.
* **Colunas:**
  * `id` (`SERIAL PRIMARY KEY`): Identificador do registro.
  * `slide_id` (`INTEGER NOT NULL`, FK para `apresentacao.slide.id`): Slide ao qual o dado pertence.
  * `chave_campo` (`VARCHAR(100) NOT NULL`): Nome do slot no template HTML (ex: `"titulo"`, `"subtitulo"`, `"imagem_lateral"`, `"video_url"`).
  * `tipo_fonte` (`VARCHAR(50) NOT NULL`): Origem da informação:
    * `'manual'`: digitado ou upload direto (lê de `valor_manual`).
    * `'reuso_midia'`: reaproveitamento de mídia de outro slide do mesmo projeto (lê de `campo_origem_id`).
    * `'indicador'`: dado oficial tratado de secretaria (lê de `indicador_id`).
  * `valor_manual` (`TEXT`): Conteúdo em texto ou URL do arquivo.
  * `campo_origem_id` (`INTEGER`, FK auto-referencial para `campo_preenchido.id`): Aponta para o registro original da imagem/mídia sendo reaproveitada.
  * `indicador_id` (`INTEGER`): Referência futura para a tabela de indicadores municipais.

#### 8. `apresentacao.slot_flexivel` (Elementos Sobrepostos e Ancoragem Matricial)
* **Objetivo:** Gerenciar elementos flutuantes/sobrepostos em posições pré-fixadas (matriz 3×3) sem comprometer a identidade visual.
* **Colunas:**
  * `id` (`SERIAL PRIMARY KEY`): Identificador do slot.
  * `slide_id` (`INTEGER NOT NULL`, FK para `apresentacao.slide.id`): Slide onde o elemento será sobreposto.
  * `tipo_elemento` (`VARCHAR(50) NOT NULL`): Categoria do elemento (`'ods'`, `'qrcode'`, `'logo'`).
  * `posicao_matriz` (`VARCHAR(30) NOT NULL`): Posição de ancoragem na tela (`'top-left'`, `'top-center'`, `'top-right'`, `'mid-left'`, `'center'`, `'mid-right'`, `'bottom-left'`, `'bottom-center'`, `'bottom-right'`).
  * `config_json` (`JSONB NOT NULL`): Configurações específicas em formato chave-valor (ex: para QR Code: `{"url": "https://barueri.sp.gov.br"}`; para ODS: `{"selos": [1, 4, 11], "arranjo": "grade"}`).

---

### 8.6. Backlog de Dados e Pendências Técnicas de Banco (Issue #29 & Roadmap)

Mapeamento das funcionalidades de dados registradas na Issue #29 do repositório, classificadas entre o escopo imediato e evoluções pós-MVP:

| Item do Banco | Objetivo e Estrutura Prevista | Status de Entrega |
| :--- | :--- | :--- |
| **Indicadores / Dados Tratados** | Tabela `apresentacao.indicador` (`id`, `nome`, `valor`, `fonte`, `data_referencia`, `categoria_id`). Alimenta dinamicamente os slides de dados via `campo_preenchido.indicador_id`. | ⏳ Aguardando integração de APIs municipais. |
| **Apresentadores (Perfil/Bio)** | Tabela `apresentacao.apresentador` (`id`, `nome`, `descricao`, `avatar_url`). Catálogo de autoridades e palestrantes institucionais. | 🚫 Pós-MVP (Template Perfil/Bio despriorizado no MVP). |
| **Pontos do Mapa Interativo** | Tabela `apresentacao.ponto_mapa` (`id`, `slide_id` FK, `latitude`, `longitude`, `titulo`, `descricao`, `indicador_id` FK). Alimenta os marcadores (pins) do Leaflet.js no template de mapa municipal. | ⏳ Previsto para o template bônus de mapa. |
| **Catálogo Oficial dos 17 ODS** | Tabela `apresentacao.ods_catalogo` (`id` 1-17, `numero`, `nome`, `icone_url`, `cor_hex`). Tabela de consulta estática para seleção de badges da ONU. | ⏳ Em especificação (atualmente suprida pelo `config_json` do slot flexível). |
| **Colaboradores de Projeto** | Tabela associativa `apresentacao.projeto_colaborador` (`projeto_id` FK, `usuario_id` FK, `papel`: `'editor'` ou `'visualizador'`). | 🚫 Pós-MVP (no MVP apenas o criador `usuario_id` acessa seu projeto). |

---

### 8.7. Status Atual de Sincronização das Tabelas (Alinhamento Backend & Banco)

Para orientar a equipe de desenvolvimento (backend e frontend) sobre o que já está disponível para consumo imediato em rotas e o que está em processo de alteração/adição:

| Tabela | Schema | Status no Supabase | Ação Atual da Equipe de Dados | Impacto no Backend |
| :--- | :--- | :--- | :--- | :--- |
| **`usuario`** | `login` | 🟢 Ativa no banco | Estrutura concluída (com `status` boolean). | Pronto para rotas de autenticação e sessão. |
| **`senha`** | `login` | 🟢 Ativa no banco | Estrutura 1:1 concluída com Bcrypt. | Pronto para rotas de validação de senha. |
| **`projeto`** | `apresentacao` | 🟢 Ativa no banco | Estrutura concluída (agrupador e reuso). | Pronto para listagem e criação de projetos. |
| **`apresentacao`** | `apresentacao` | 🟢 Ativa no banco | Estrutura concluída (arquivos de slides). | Pronto para rotas de criação de apresentações. |
| **`template`** | `apresentacao` | 🟢 Ativa no banco | Populada com os 7 templates fixos via seed. | Backend pode listar templates nos formulários. |
| **`slide`** | `apresentacao` | 🟡 Em Alteração | **Adição de 4 colunas visuais:** `alinhamento_texto`, `cor_texto`, `filtro_fundo`, `estilo_fundo` (sem cabeçalho). | Backend deve incluir esses campos nos formulários e salvar nos endpoints. |
| **`slot_flexivel`** | `apresentacao` | 🟢 Codificada em `models.py` | Suporte a ODS, QR Code e Logos sobrepostos na matriz 3×3 via JSONB. | Backend pode montar endpoints para ancorar elementos. |
| **`campo_preenchido`** | `apresentacao` | 🟢 Codificada em `models.py` | Suporte a preenchimento manual e reuso de mídias no mesmo projeto. | Backend utilizará para salvar o conteúdo dos templates. |

### 8.8. Próximo Passo Prioritário de Dados
* **Modelagem da Tabela de ODS (`apresentacao.ods_catalogo`):** Estruturação dos 17 Objetivos de Desenvolvimento Sustentável da ONU com ícones oficiais e códigos de cor para alimentar a seleção dinâmica nos slots flexíveis dos slides.

---

## 9. As Três Fontes de Conteúdo dos Campos Preenchidos

Ao preencher os campos de um slide (texto, imagem, indicador, etc.), a modelagem deve prever **três fontes de dados possíveis**:

```text
Campo Preenchido de um Slide
 ├── 1. Manual → Valor digitado/enviado diretamente pelo apresentador (Foco do MVP).
 ├── 2. Dinâmico (Indicador) → FK referenciando a tabela global de dados tratados.
 └── 3. Dinâmico (Reuso de Mídia) → FK referenciando outro Campo Preenchido de mídia
                                     já existente em OUTRA apresentação do MESMO projeto.
```

### Detalhamento do Reuso de Mídia:
- O reuso aplica-se primariamente a **campos de mídia** (imagem, vídeo, QR Code, logotipo).
- O escopo do reuso é **estritamente limitado ao mesmo Projeto**, evitando misturar acervos de mídias de secretarias distintas.

---

## 10. Catálogo de Templates de Slide e Slots Flexíveis

### 10.1. Biblioteca de Templates (MVP)

Os templates são estruturas visuais fixas e pré-configuradas:

| Template | Descrição | Conteúdos Permitidos |
| -------- | --------- | -------------------- |
| **Capa / Abertura** | Slide inicial obrigatório de toda apresentação. | Título grande, subtítulo, imagem de fundo institucional, logotipos. |
| **Imagem + Texto** | Exibição de conteúdo explicativo. | Imagem em destaque de um lado, bloco de texto formatado do outro. |
| **Indicadores** | Apresentação de métricas e estatísticas. | Texto introdutório + cards de indicadores (número de destaque e rótulo). |
| **Gráfico** | Exibição de dados visuais. | Um gráfico (barras/linha via Chart.js) + texto explicativo. |
| **Mapa** | Visualização geográfica parametrizada por escala. | Município (Barueri via Leaflet interativo) ou Estado/País/Mundo (imagem estática + pins percentuais x%, y%). |
| **Vídeo** | Mídia audiovisual. | Player de vídeo embutido (horizontal/vertical) + legenda. |
| **Encerramento** | Slide final da apresentação. | Título de fechamento, mensagens institucionais, contatos e logos. |

> **Observação:** O template de *Perfil / Bio complexo* foi considerado difícil de padronizar no MVP e foi classificado como funcionalidade fora do escopo primário.

### 10.2. Slots Flexíveis e Elementos Sobrepostos (Sistema de Ancoragem Matricial 3×3)

Qualquer slide, independentemente do template escolhido, pode conter elementos acessórios posicionados em **slots fixos pré-definidos**.
Para eliminar a complexidade e a perda de padrão do *drag-and-drop* livre, o sistema adota um **Seletor de Ancoragem Matricial 3×3** (inspirado no Figma Auto Layout), onde o usuário clica em quadrantes predefinidos para fixar os elementos:

```text
┌─────────────────┬───────────────────┬──────────────────┐
│   Top-Left      │    Top-Center     │    Top-Right     │
│ (Logo Barueri)  │   (Cabeçalho)     │ (Bandeiras/Data) │
├─────────────────┼───────────────────┼──────────────────┤
│   Mid-Left      │      Center       │    Mid-Right     │
│                 │ (Conteúdo Master) │                  │
├─────────────────┼───────────────────┼──────────────────┤
│   Bottom-Left   │   Bottom-Center   │   Bottom-Right   │
│ (Logos Apoio)   │                   │ (ODS / QR Code)  │
└─────────────────┴───────────────────┴──────────────────┘
```

1. **Selo dos ODS (Objetivos de Desenvolvimento Sustentável da ONU):**
   - Ativação por switch no painel lateral de configuração.
   - Seleção múltipla de badges dos 17 ODS da ONU.
   - **Arranjo visual:**
     - *Faixa Horizontal (1 linha):* ideal para 1 a 3 selos alinhados.
     - *Grade Compacta (2 linhas):* ideal para múltiplos selos (como no slide institucional de referência do Canva).
   - Posição definida pelo seletor matricial (padrão sugerido: `Bottom-Right`).

2. **QR Code Institucional:**
   - Ativação por switch com input de URL/destino.
   - Posição definida pelo seletor matricial (padrão sugerido: `Bottom-Right` ou `Bottom-Left`).

3. **Logotipos Secundários e Bandeiras de Apoio:**
   - Marcas institucionais complementares (Prefeitura de Barueri, CIT, Inovação Barueri, TV Inovação, ONUBR, bandeiras oficiais de Barueri/SP/Brasil).
   - Ancoragem nos slots de rodapé (`Bottom-Left`) ou topo (`Top-Right`).

---

### 10.3. Controles de Estilo, Legibilidade e Layout do Slide

O painel lateral direito de configuração de cada slide oferece ajustes controlados que preservam a identidade institucional sem engessar a criação:

1. **Alinhamento de Textos:**
   - Seletor clássico de botões: Esquerda (padrão), Centralizado, Direita e Justificado.
   - Aplicável aos campos de título, subtítulo e corpos de texto explicativo.

2. **Paleta de Cores de Texto (Restrita e Segura):**
   - Para evitar contrastes inacessíveis ou poluição visual, a troca de cor é restrita à paleta homologada:
     - **Branco Puro (`#FFFFFF`):** para textos sobre fotos com overlay ou fundos institucionais escuros.
     - **Azul Marinho Corporativo (`#102A56`) / Grafite (`#212529`):** para textos sobre fundos claros corporativos.
     - **Azul Conecta Barueri (`#0052FF`):** para destaques, títulos e ênfases.

3. **Tratamento de Fundo e Barra de Cabeçalho (Contraste sobre Imagens):**
   - **Barra de Cabeçalho Institucional (Header Strip):** Faixa horizontal no topo (sólida ou translúcida) onde títulos, subtítulos ou logos são posicionados com 100% de nitidez e contraste, destacando o texto da imagem de fundo.
   - **Modo de Enquadramento da Imagem:**
     - *Tela Cheia com Máscara de Contraste (Scrim Overlay):* A foto ocupa o slide inteiro, porém coberta por uma camada escura suave (`rgba(0,0,0, 0.35)` a `0.60`) garantindo conformidade WCAG de legibilidade.
     - *Imagem Contida (Card / Split Parcial):* A imagem não ocupa a tela inteira, reservando áreas limpas em fundo branco/cinza institucional para a leitura confortável dos blocos de texto.

---

## 11. Estado Atual de Desenvolvimento

## 11.1. Telas Implementadas

| Tela | Rota | Status |
| ---- | ---- | ------ |
| Landing Page | `/` | ✅ Concluída |
| Login | `/login` | ✅ Concluída |
| Logout | `/logout` | ✅ Concluído |
| Home pós-login | `/home` | 🔄 Em desenvolvimento |

---

## 11.2. Próximas Telas

| Tela | Descrição |
| ---- | --------- |
| Home | Painel inicial do usuário logado |
| Projects | Listagem de Projetos e suas Apresentações |
| Admin | Gerenciamento de usuários para administradores |
| Editor de Apresentação | Criação e edição de apresentações com slides e templates |

---

## 11.3. Fluxo do Editor de Apresentações

```text
Criar Projeto (ou selecionar existente)
       ↓
Criar Nova Apresentação
       ↓
Apresentação inicia com 1 Slide (Capa)
       ↓
Escolher Template do Slide
       ↓
Preencher Campos (Manual / Reuso)
       ↓
Adicionar Novos Slides
       ↓
Salvar e Exibir Apresentação
```

---

## 12. Identidade Visual e UI/UX

### 12.1. Estética geral

A interface opera permanentemente em **Light Mode Corporativo**:
- alta legibilidade;
- sobriedade institucional;
- aparência profissional;
- consistência visual.

Dark Mode está descontinuado.

---

### 12.2. Paleta de Cores

- Branco: `#FFFFFF`
- Cinza claro: `#F8F9FA`
- Cinza neutro: `#F0F2F5`
- Azul institucional: `#0052ff`

Variáveis CSS globais (`global.css`) devem ser mantidas e utilizadas em todos os estilos.

---

### 12.3. Login

Layout em split-screen:
- coluna esquerda: formulário de login;
- coluna direita: painel visual institucional;
- responsivo: coluna direita oculta em dispositivos móveis (`d-none d-md-flex`).

---

## 13. Herança de Templates (Jinja2) e Reuso de HTML/CSS

### 13.1. Proibição de redundância

Nenhum arquivo HTML deve duplicar manualmente:
- `<head>`;
- links de Bootstrap;
- Navbar;
- Footer;
- estruturas globais de layout.

### 13.2. Base unificada

`landing/base_site.html` é a base compartilhada da landing page e das telas de autenticação. O arquivo `base_auth.html` foi excluído por ser redundante. Para a área autenticada/logada, a base oficial é `app/base_app.html`.

### 13.3. Regra de extensão

Todo template de rota deve iniciar com:

```jinja2
{% extends 'landing/base_site.html' %}  {# ou 'app/base_app.html' #}
```

e injetar seu conteúdo no bloco `{% block content %}`.

### 13.4. Princípio de Reuso Máximo (Base vs. Filhos em HTML e CSS)

Deve-se **sempre priorizar o melhor uso do motor Jinja2 integrado ao HTML e CSS**, aplicando o princípio DRY (*Don't Repeat Yourself*):

1. **O que pertence à Base (`base_site.html` / `base_app.html` e CSS global):**
   - Tudo o que for estrutura padrão, recorrente ou compartilhada (layout geral, sidebar, navbar, footer, variáveis CSS de cores `:root`, resets, fontes, bibliotecas e estilos de componentes globais como cards base e botões) **deve obrigatoriamente estar na base e nos arquivos CSS globais** (`global.css`, `sidebar.css`, etc.).
2. **O que pertence aos Filhos (templates e CSS de páginas específicas):**
   - O HTML e o CSS dos templates filhos devem **apenas adicionar** elementos e regras específicos daquela tela.
   - **É estritamente proibido reescrever ou redeclarar nos arquivos filhos regras de CSS e estruturas de HTML que já estão padronizadas na base**. Os filhos devem apenas consumir, especializar ou estender o que a base já provê.

---

## 14. Segurança de Credenciais (Flask-Bcrypt)

Nenhuma senha deve trafegar ou ser armazenada em texto puro.

O fluxo de salvamento:

```text
Senha digitada ──> Flask-Bcrypt ──> Hash ──> PostgreSQL
```

O fluxo de verificação:

```text
Senha digitada ──> bcrypt.check_password_hash() ──> Hash do banco ──> Resultado True/False
```

NUNCA utilizar comparação direta de igualdade:

```python
senha_digitada == senha_banco  # PROIBIDO
```

---

## 15. Formulários (Flask-WTF)

Todos os formulários de entrada de dados usam classes derivadas de `FlaskForm`.

A proteção CSRF é obrigatória em todos os formulários HTML:

```jinja2
{{ form.hidden_tag() }}
```

Exemplo de estrutura:

```python
class LoginForm(FlaskForm):
    email = StringField(
        'Usuário',
        validators=[DataRequired(), Email(), Length(max=150)]
    )
    senha = PasswordField(
        'Senha',
        validators=[DataRequired(), Length(min=4)]
    )
    lembrar = BooleanField('Lembrar de mim')
    submit = SubmitField('Entrar')
```

---

## 16. Persistência e ORM (SQLAlchemy)

Toda interação com o banco de dados deve utilizar o ORM SQLAlchemy.

### Proibido
Raw queries diretamente nas rotas:

```python
db.session.execute("SELECT ...")  # PROIBIDO
```

### Obrigatório
Mapeamento via classes em `models.py` com schemas declarados:

```python
__table_args__ = {'schema': 'nome_schema'}
```

---

## 17. Estratégia de Ingestão de Dados (Arquitetura Medallion)

A estratégia de dados do projeto adota a separação entre **origem**, **tratamento** e **consumo** (Medallion Architecture):

```text
Fontes de API / Entrada Manual
            │
            ▼
 ┌─────────────────────┐
 │ Camada Bruta        │ Payload/JSON original
 └──────────┬──────────┘
            │  Script de Ingestão (Assíncrono via Cron/APScheduler)
            ▼
 ┌─────────────────────┐
 │ Camada Tratada      │ Dados limpos e padronizados
 └──────────┬──────────┘
            │
            ▼
  Aplicação Flask (Lê apenas a Camada Tratada)
```

### Agnosticismo de Fonte
Seja um dado vindo de API externa (IBGE, SEADE, SIT) ou digitado manualmente por um usuário, após passar pelo tratamento ele DEVE ser armazenado na **mesma estrutura de tabela relacional**.

---

## 18. Escopo Formal do MVP

| Construir no MVP | Não construir no MVP (Visão Futura) |
| ---------------- | ----------------------------------- |
| Gestão de Projetos e Apresentações (Criador = Dono) | Colaboradores em Projetos/Apresentações (Editor/Visualizador) |
| Editor de slides com templates fixos | Analytics de uso (cliques, tempo por slide) |
| Preenchimento manual de campos | Hierarquia de 7 papéis da CIT |
| Reuso de mídia dentro do mesmo projeto | Links de compartilhamento público desprotegidos |
| Persistência relacional unificada | Pipeline automatizado de ingestão de múltiplas APIs |
| Login e sessão segura (Usuário/Admin) | Editor gráfico livre (drag-and-drop) |
| Responsividade e Light Mode | Customização livre de cores e fontes institucionais |
| — | Integrações completas com portais externos |

---

## 19. Pendências Técnicas Imediatas

| # | Item | Ação |
| - | ---- | ---- |
| 1 | Campo `email` no modelo `Usuario` | Adicionar `email = db.Column(db.Text)` em `models.py`. |
| 2 | Seeds com senha em texto puro | Manter restrito a dev local; jamais ir para prod. |
| 3 | Remodelagem do banco de apresentações | Implementar o schema `Projeto -> Apresentacao -> Slide -> Template -> CampoPreenchido`. |
| 4 | Bug do `url_for` em Blueprints | Garantir que todo `url_for()` use a string declarada no `Blueprint('nome', __name__)`. |

---

## 20. Decisões Arquiteturais Consolidadas

1. Flask permanece como backend principal.
2. PostgreSQL permanece como banco relacional.
3. SQLAlchemy permanece como ORM (Zero raw queries).
4. Flask-Login gerencia sessões.
5. Flask-Bcrypt gerencia hashing de senhas.
6. Flask-WTF gerencia formulários e CSRF.
7. Dash (Plotly) está descartado.
8. Leaflet.js e Chart.js são componentes de templates específicos.
9. A tela de Apresentação é um editor de slides com templates fixos.
10. O usuário não possui liberdade de layout (sem drag-and-drop).
11. Identidade visual institucional 100% protegida.
12. Projeto e Apresentação são entidades separadas.
13. Uma apresentação possui múltiplos slides ordenados.
14. Cada slide referencia um template fixo.
15. Reuso de mídias é permitido entre apresentações do mesmo projeto.
16. Slots flexíveis (ODS, QR Code) ocupam posições fixas via seletor matricial 3×3 (sem drag-and-drop livre).
17. O MVP opera exclusivamente com permissões Usuário/Admin.
18. Ingestão de APIs roda em processo assíncrono separado.
19. Dados de API e entrada manual convergem para a mesma tabela tratada.
20. O login existente não pode regredir em nenhuma refatoração.
21. Priorizar reuso máximo no Jinja2: padrões globais de HTML e CSS residem na base; filhos apenas adicionam e nunca reescrevem regras da base.

---

## 21. Diretrizes Críticas para Desenvolvimento

A IA e os desenvolvedores devem sempre respeitar:

- **Nunca duplicar** `<head>`, Bootstrap, Navbar ou Footer nos templates.
- **Priorizar reuso de Jinja2 + HTML/CSS:** tudo o que for padrão deve estar na base (`base_site.html` / `base_app.html` e CSS global). Templates e CSS filhos apenas adicionam especificidades e nunca redeclaram estilos já providos pela base.
- **Nunca escrever raw queries** nas rotas.
- **Nunca armazenar senhas em texto puro.**
- **Sempre utilizar Bcrypt** para senhas.
- **Sempre utilizar Flask-WTF** para formulários.
- **Sempre manter CSRF ativo.**
- **Conferir a string do Blueprint antes de usar `url_for()`.**
- **Manter Light Mode fixo.**
- **Manter responsividade.**
- **Preservar o login existente.**
- **Não implementar funcionalidades futuras sem solicitação.**
- **Não transformar o editor em drag-and-drop.**

---

## 22. Método de Trabalho em 4 Etapas

O desenvolvimento deve ocorrer feature por feature:

1. **Entender antes de codar:** Explicar o conceito, o problema e as partes afetadas.
2. **Planejar junto:** Listar arquivos, modelos, rotas e formulários envolvidos.
3. **Implementar com explicação didática:** Explicar a função de cada trecho de código.
4. **Revisar:** Verificar segurança, organização e aderência ao PDD.

Prioridade: **Aprendizado sobre velocidade.**

---

## 23. Requisito Mínimo para Aprovação do TCC (ETEC)

O projeto deve demonstrar um backend funcional conectado a um banco de dados relacional. A autenticação com Flask-Login, Bcrypt, PostgreSQL e SQLAlchemy é parte fundamental desse requisito e deve permanecer 100% funcional em todas as entregas.

---
> **Documento consolidado — versão 2.0**  
> Incorpora todas as definições técnicas, adendos de escopo e a modelagem conceitual relacional completa do Conecta Barueri.