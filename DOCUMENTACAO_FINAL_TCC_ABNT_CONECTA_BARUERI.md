# CENTRO ESTADUAL DE EDUCAÇÃO TECNOLÓGICA PAULA SOUZA
## ETEC DE BARUERI — CURSO TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS

---

# CONECTA BARUERI: PLATAFORMA CORPORATIVA DE GOVERNANÇA VISUAL E AUTORIA DE APRESENTAÇÕES INSTITUCIONAIS COM REÚSO MODULAR DE INICIATIVAS MUNICIPAIS

**Trabalho de Conclusão de Curso (TCC) — Documentação Técnica e Acadêmica Definitiva**  
**Normas de Referência:** ABNT NBR 14724 (Trabalhos Acadêmicos) e NBR 6023 (Referências)  
**Ano de Conclusão:** 2026  

---

### AUTORES (EQUIPE DE DESENVOLVIMENTO):
- **Vinicius Santana** — Líder de Banco de Dados, Engenharia de Dados e Validação Funcional
- **Marianna** — Líder de Design, Identidade Visual e UI/UX
- **Lucas e Vinicius Belloni** — Engenharia Full-Stack (Backend Flask, Arquitetura e Frontend)

### INSTITUIÇÃO PARCEIRA / STAKEHOLDER:
- **Prefeitura Municipal de Barueri**
- **Secretaria de Inovação e Tecnologia (SIT) / Centro de Inovação e Tecnologia (CIT)**
- **Interlocutora Oficial:** Érika (Gestora de Inovação e Requisitos)

---

## RESUMO

O presente Trabalho de Conclusão de Curso apresenta o desenvolvimento da plataforma **Conecta Barueri**, um sistema corporativo web projetado para resolver o problema crônico de retrabalho manual, fragmentação de dados e perda de padronização visual na elaboração de apresentações institucionais pela Prefeitura Municipal de Barueri, com foco específico nas demandas do Centro de Inovação e Tecnologia (CIT). Historicamente, secretários, gestores públicos e equipes técnicas utilizavam ferramentas generalistas (como Microsoft PowerPoint e Canva) para criar manualmente dezenas de apresentações destinadas a prestar contas ao Executivo, disputar premiações nacionais de cidades inteligentes ou conduzir palestras em universidades. Esse processo descentralizado resultava na recriação manual contínua dos mesmos projetos (ex.: *Barueri Sem Papel*, *Internet Social*, *Coworking no Metaverso*), desatualização de métricas e violação da identidade visual oficial. A solução desenvolvida adota uma arquitetura web baseada em Python (Flask) e PostgreSQL (SQLAlchemy ORM), estruturada em torno de três inovações centrais: (1) um editor institucional guiado por templates visuais fixos e restritos, eliminando ferramentas caóticas de *drag-and-drop*; (2) a concepção de iniciativas municipais como **Kits Modulares de Slides**, permitindo que projetos e biografias de autoridades sejam importados em bloco para qualquer apresentação com um clique; e (3) uma pipeline automatizada de ingestão de dados que consome o catálogo público oficial do Portal SIT, garantindo conformidade rigorosa com a LGPD e as políticas municipais de segurança da informação. O sistema comprova ganho substancial de produtividade na administração pública, transformando apresentações em ativos governamentais auditáveis, modernos e seguros.

**Palavras-chave:** Governo Digital. Cidades Inteligentes. Governança Visual. Reúso Modular de Software. Flask. Barueri.

---

## ABSTRACT

This Capstone Project presents the development of the **Conecta Barueri** platform, an institutional enterprise web system designed to eliminate manual rework, data fragmentation, and brand inconsistency in the creation of municipal presentations for the City Hall of Barueri, specifically tailored to the Center for Innovation and Technology (CIT). Historically, city secretaries, public managers, and technical teams relied on generic software (such as Microsoft PowerPoint and Canva) to manually draft decks for mayoral accountability, smart city awards competitions, and academic lectures. This decentralized workflow caused continuous manual reconstruction of identical municipal initiatives (e.g., *Paperless Barueri*, *Social Internet*, *Metaverse Coworking*), outdated KPIs, and corporate visual identity breaches. The proposed solution is built upon a layered web architecture using Python (Flask) and PostgreSQL (SQLAlchemy ORM), established on three core pillars: (1) an institutional slide authoring engine powered by rigid, pre-approved layout templates that prohibit chaotic drag-and-drop customization; (2) the architectural modeling of public initiatives as **Modular Slide Kits**, enabling full project decks and executive profiles to be imported into any presentation with a single click; and (3) an automated public data ingestion pipeline harvesting the official SIT municipal catalog, strictly complying with Brazilian General Data Protection Law (LGPD) and municipal information security constraints. The platform provides significant administrative efficiency, converting public presentations into auditable, standardized, and secure institutional assets.

**Keywords:** Digital Governance. Smart Cities. Visual Governance. Modular Software Reuse. Flask. Barueri.

---

## 1. INTRODUÇÃO

### 1.1. Contextualização
O município de Barueri, localizado na Região Metropolitana de São Paulo, consolidou-se na última década como um dos principais polos econômicos e tecnológicos do Brasil. Reconhecido reiteradamente em rankings de Cidades Inteligentes (como o *Connected Smart Cities* e o *Prêmio InovaCidade*), o município destaca-se pelo investimento contínuo em infraestrutura digital, automação de serviços públicos e modernização administrativa conduzidos pela Secretaria de Inovação e Tecnologia (SIT) e pelo Centro de Inovação e Tecnologia (CIT).

Com mais de duas centenas de sistemas de software próprios, programas de inclusão digital e iniciativas de vanguarda (como infraestrutura 100% em fibra óptica, telemedicina, digitalização integral de processos e ambientes de capacitação no Metaverso), o CIT possui uma demanda ininterrupta de comunicação institucional perante os mais diversos públicos: prefeitos e secretários municipais, câmaras de vereadores, investidores privados, comissões internacionais e a comunidade acadêmica.

### 1.2. Formulação do Problema (As Dores Institucionais)
Apesar do alto nível de maturidade tecnológica dos serviços entregues ao cidadão, a comunicação institucional interna e externa do CIT permaneceu dependente de processos analógicos e ferramentas generalistas de produtividade de escritório (tais como Microsoft PowerPoint, Google Slides e contas corporativas do Canva). 

A partir do acompanhamento direto da rotina da equipe do CIT e de reuniões conduzidas com a gestora de inovação Érika, identificaram-se quatro patologias críticas no fluxo de trabalho existente:

1. **Retrabalho Massivo e Redundância de Conteúdo:** Projetos consolidados da prefeitura aparecem repetidamente em diversas apresentações. No modelo anterior, cada servidor precisava redigitar descrições, recapturar telas de sistemas e reorganizar os mesmos slides repetidamente para cada nova reunião.
2. **Divergência de Métricas e Indicadores:** Por falta de uma fonte de dados centralizada no momento da elaboração do slide, números cruciais (como volume de processos digitais tramitados, famílias conectadas ou economia de papel) eram inseridos de memória ou copiados de relatórios antigos, propagando dados desatualizados ou contraditórios.
3. **Quebra Recorrente da Identidade Visual:** Editores gráficos generalistas com liberdade total de posicionamento (*drag-and-drop*) levam inevitavelmente ao desalinhamento de caixas de texto, uso incorreto de paletas cromáticas, fontes tipográficas incompatíveis e perda de contraste visual em projeções de auditório.
4. **Fragilidade no Compartilhamento em Tempo Real:** A necessidade de exportar arquivos pesados (.pptx ou .pdf) ou depender de links dinâmicos de edição gerava falhas técnicas em auditórios e impedia que autoridades acessassem visualizações rápidas e limpas em dispositivos móveis.

### 1.3. Justificativa
A criação de uma plataforma web dedicada à autoria e governança de apresentações institucionais justifica-se pela necessidade de transformar apresentações em **ativos de software estratégicos**. Em vez de arquivos estáticos dispersos em pastas locais de funcionários, o Conecta Barueri estabelece um repositório centralizado, auditável e padronizado, onde o design é rigidamente assegurado por templates homologados e os projetos públicos são reaproveitados como componentes modulares de software.

### 1.4. Objetivos

#### 1.4.1. Objetivo Geral
Desenvolver e implantar a plataforma web **Conecta Barueri**, fornecendo à Prefeitura Municipal de Barueri um ambiente corporativo para autoria, governança visual e exibição de apresentações institucionais, com suporte a reúso modular de iniciativas públicas e ingestão automatizada de dados.

#### 1.4.2. Objetivos Específicos
- Mapear a identidade visual oficial do CIT por meio de engenharia reversa das apresentações de alta fidelidade existentes no Canva, consolidando um *Design System* rígido (cores, fontes e grid 16:9);
- Modelar e implementar uma arquitetura relacional em PostgreSQL gerenciada pelo SQLAlchemy ORM, isolando autenticação, catálogo de iniciativas, perfis biográficos e sequências de slides;
- Desenvolver um catálogo de 10 templates institucionais homologados (abertura, imagem+texto, indicadores, gráficos Chart.js, mapa territorial Leaflet, vídeo, perfil de autoridade, encerramento, módulos/pilares e premiações);
- Estabelecer a arquitetura de **Kits Modulares de Projetos**, permitindo a injeção em lote de conjuntos completos de slides padronizados para qualquer apresentação;
- Construir uma pipeline automatizada de ingestão de dados em Python para consumir o catálogo público oficial do Portal SIT, dispensando credenciais internas sensíveis e garantindo conformidade com a LGPD;
- Implementar visualização em modo apresentação com suporte a link público simplificado (`/p/<id>`) para consumo em auditórios sem exigência de autenticação;
- Otimizar a performance da aplicação através de mecanismos de cache em memória para componentes estáticos (templates e ODS).

---

## 2. FUNDAMENTAÇÃO TEÓRICA E BENCHMARKING

### 2.1. Governo Digital e Cidades Inteligentes
O conceito de Governo Digital (*E-Government*) transcende a simples digitalização de formulários em papel; ele pressupõe a integração e a interoperabilidade de sistemas públicos para gerar eficiência administrativa e transparência ativa (GUIMARÃES, 2021). No contexto de Cidades Inteligentes (*Smart Cities*), a capacidade de um município em comunicar com clareza seus indicadores e entregas para a sociedade e para órgãos fiscalizadores é elemento fundamental de maturidade institucional.

### 2.2. Governança Visual vs. Liberdade Gráfica Irrestrita
Estudos de Interação Humano-Computador (IHC) e *Design Systems* corporativos (FROST, 2016) demonstram que softwares de apresentação convencionais (PowerPoint, Canva, Figma) transferem o ônus do design para o usuário final. Em ambientes corporativos e governamentais, essa liberdade irrestrita resulta em poluição visual e degradação da marca. 

O Conecta Barueri apoia-se no princípio da **autoria guiada por formulários**: o usuário alimenta unicamente os campos semânticos de conteúdo (título, parágrafo, números, seleção de fotos), enquanto o motor de renderização posiciona os elementos respeitando margens de respiro, tamanhos de fonte e contrastes homologados pelas normas WCAG (Web Content Accessibility Guidelines).

### 2.3. Análise Comparativa de Soluções (Benchmarking)

| Requisito / Critério | Microsoft PowerPoint | Canva Corporativo | Conecta Barueri |
| :--- | :---: | :---: | :---: |
| **Tipo de Edição** | Drag-and-drop livre | Drag-and-drop livre | Templates fixos guiados por formulário |
| **Garantia de Identidade Visual** | Baixa (usuário altera fontes/cores) | Média (depende de compliance do usuário) | Alta (travada por código e CSS institucional) |
| **Reúso de Projetos Oficiais** | Manual (copiar e colar de arquivos antigos) | Manual (copiar páginas entre decks) | **Automático em 1 clique (Kits Modulares)** |
| **Alimentação de Dados** | Manual | Manual | **Automatizada (Pipeline do Portal SIT)** |
| **Governança e Auditoria** | Inexistente (arquivos locais .pptx) | Parcial (nuvem proprietária) | **Total (Banco PostgreSQL centralizado)** |
| **Exibição em Auditório sem Login** | Requer pendrive ou login | Requer login na plataforma | **Link Público Direto (`/p/<id>`)** |

### 2.4. Justificativa da Stack Tecnológica
A seleção tecnológica foi orientada pelo equilíbrio entre robustez de engenharia, maturidade da comunidade e prazo de execução da equipe:
- **Python 3 / Flask:** Framework minimalista que oferece arquitetura limpa via *Application Factory* e *Blueprints*, permitindo controle total das rotas, sanitização de requisições e consumo de dados sem o overhead de frameworks monolíticos.
- **PostgreSQL / SQLAlchemy ORM:** Banco de dados relacional de nível corporativo. A adoção estrita do SQLAlchemy ORM elimina o risco de ataques de injeção de SQL (*SQL Injection*), padroniza o ciclo de vida dos objetos e facilita migrações.
- **Jinja2 + Bootstrap 5.3 + Vanilla JavaScript:** A renderização híbrida (*Server-Side Rendering* com Jinja2 para a casca e estrutura principal, combinada com *fetch API* assíncrona em Vanilla JS para transições do editor) oferece alta performance, dispensando o overhead de compilação de frameworks frontend pesados (React/Vue/Angular).
- **Chart.js:** Biblioteca JavaScript leve e responsiva para renderização gráfica sobre canvas HTML5. Escolhida em substituição formal ao Python Dash, cuja complexidade de execução em servidor e lentidão de bootstrap inviabilizariam o MVP.
- **Leaflet.js:** Biblioteca de mapas interativos utilizada de forma focada e performática no template territorial de Barueri.

---

## 3. ENGENHARIA DE REQUISITOS E EVOLUÇÃO DE ESCOPO

### 3.1. Stakeholders e Coleta de Requisitos
Os requisitos foram levantados a partir de ciclos iterativos junto à Secretaria de Inovação e Tecnologia de Barueri, envolvendo:
- Questionários e formulários de escopo submetidos à gestora Érika;
- Reuniões técnicas presenciais e virtuais de alinhamento com a diretoria do CIT;
- Auditoria e engenharia reversa dos decks de slides reais utilizados pela prefeitura em 2025 e 2026.

### 3.2. Histórico de Pivots e Transição Pós-Pré-Banca
O projeto passou por duas grandes redefinições de escopo estratégicas:

1. **O Pivot 1 (Dashboard -> Editor de Apresentações):** No estágio inicial de concepção, o projeto previa um painel de indicadores (dashboard analítico municipal com abas de Saúde, Educação e Segurança). Durante as primeiras validações com o CIT, constatou-se que a prefeitura já dispunha de ferramentas de BI interno, mas enfrentava um gargalo severo na **comunicação dessas entregas em formato de slides institucionais**. O escopo foi então redirecionado para a plataforma de autoria de apresentações.
2. **O Pivot 2 (Pastas de Slides -> Projetos Modulares e Link Público):** Na pré-banca, a equipe apresentou um protótipo funcional onde "Projeto" funcionava meramente como uma pasta no servidor para agrupar apresentações. A cliente esclareceu que na prefeitura um projeto é uma iniciativa transversal que aparece em diversas apresentações diferentes. Paralelamente, a cliente exigiu a criação de um link público para exibição rápida e formalizou que a integração de dados deveria consumir o catálogo público do Portal SIT, e não conexões diretas de banco de dados restrito.

### 3.3. Requisitos Funcionais (RF)

| Identificador | Nome do Requisito | Descrição Detalhada | Prioridade |
| :--- | :--- | :--- | :---: |
| **RF-01** | Autenticação Segura | O sistema deve autenticar usuários utilizando e-mail corporativo e senha criptografada via Bcrypt, controlando sessões via Flask-Login. | Essencial |
| **RF-02** | Gestão de Usuários (Admin) | Administradores devem possuir permissão para listar, cadastrar, ativar, inativar e redefinir credenciais de servidores. | Essencial |
| **RF-03** | Criação e Edição de Decks | Servidores autorizados devem criar, renomear, duplicar e excluir apresentações institucionais. | Essencial |
| **RF-04** | Editor de Slides por Templates | O editor de apresentações deve permitir a inserção, reordenação e configuração de slides exclusivamente através de templates homologados. | Essencial |
| **RF-05** | Catálogo dos 10 Templates | O editor deve fornecer os 10 layouts oficiais: Capa, Imagem+Texto, Indicadores, Gráficos, Mapa, Vídeo, Apresentador, Encerramento, Módulos/Pilares e Prêmios. | Essencial |
| **RF-06** | Catálogo de Iniciativas Municipais | A tela `/projetos` deve exibir a vitrine oficial dos projetos de Barueri, com fotos, secretaria, status e alinhamento a ODS. | Essencial |
| **RF-07** | Reúso Modular de Projetos (Kit) | O editor deve permitir a importação em lote (1 clique) do kit completo de slides de um projeto cadastrado no acervo. | Essencial |
| **RF-08** | Acervo de Perfis de Autoridades | O sistema deve armazenar perfis biográficos de autoridades (foto, minibiografia e marcos), permitindo inserção rápida no slide de autoridade. | Importante |
| **RF-09** | Ingestão do Portal SIT | O sistema deve conter rotina de coleta e tratamento para extrair iniciativas públicas cadastradas no portal oficial da prefeitura. | Essencial |
| **RF-10** | Visualização em Modo Apresentação | O sistema deve fornecer modo de reprodução em tela cheia com transição fluida de slides por teclado (setas/espaço) ou controles de toque. | Essencial |
| **RF-11** | Link Público de Compartilhamento | O sistema deve gerar URL pública (`/p/<id>`) para visualização de apresentações em auditórios sem exigir login. | Essencial |
| **RF-12** | Renderização Gráfica Interativa | Slides de métricas quantitativas devem gerar gráficos em barras e linhas utilizando Chart.js a partir de dados configurados. | Importante |
| **RF-13** | Georreferenciamento Municipal | Slide territorial deve renderizar mapa vetorial de Barueri com marcadores temáticos sobre Leaflet.js. | Desejável |
| **RF-14** | Posicionamento de Slots (3x3) | O sistema deve permitir a ancoragem de elementos acessórios (ODS, QR Code) em quadrantes fixos da matriz 3x3 do slide. | Importante |
| **RF-15** | Cache em Memória | A aplicação deve manter em memória os dados imutáveis (templates e ODS) para eliminar lentidão de consultas ao banco. | Importante |

### 3.4. Requisitos Não-Funcionais (RNF)

| Identificador | Categoria | Descrição |
| :--- | :--- | :--- |
| **RNF-01** | **Segurança e LGPD** | O sistema não deve expor credenciais municipais internas e deve sanitizar todos os inputs contra XSS e SQL Injection. |
| **RNF-02** | **Desempenho** | O tempo de carregamento inicial do editor e a troca de slides na apresentação devem ocorrer em menos de 800 milissegundos. |
| **RNF-03** | **Fidelidade Visual** | Os slides renderizados devem preservar proporção de aspecto 16:9 widescreen e resolução de referência 1920x1080 px em qualquer monitor. |
| **RNF-04** | **Usabilidade** | A interface do editor não deve requerer conhecimentos técnicos de design gráfico por parte dos servidores. |
| **RNF-05** | **Compatibilidade** | A aplicação deve ser compatível com as versões modernas dos principais navegadores (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari). |
| **RNF-06** | **Disponibilidade** | A arquitetura da aplicação no Supabase/Render deve permitir operação ininterrupta para consultas e apresentações. |

### 3.5. Regras de Negócio (RN)
- **RN-01 (Proibição de Layout Livre):** É terminantemente proibido fornecer funcionalidades de arrastar elementos livremente na tela (*drag-and-drop* absoluto), garantindo que nenhum usuário quebre o padrão visual corporativo.
- **RN-02 (Isolamento de Apresentações):** No MVP, uma apresentação pertence ao seu criador (`usuario_id`), sendo editável apenas por ele ou por administradores do sistema.
- **RN-03 (Imutabilidade Visual dos Kits):** Os slides importados de um kit oficial de projeto trazem os textos e fotos oficiais da prefeitura, cabendo ao usuário apenas a edição opcional de métricas secundárias.
- **RN-04 (Simplicidade de Acesso):** O sistema opera estritamente com dois papéis de controle de acesso: Administrador e Usuário Comum.

---

## 4. ARQUITETURA CONCEITUAL E MODELAGEM DE SISTEMAS

### 4.1. Arquitetura de Software em Três Camadas
A aplicação adota o padrão arquitetural em camadas baseado no modelo MTV (*Model-Template-View*), análogo ao tradicional MVC:

1. **Camada de Apresentação (Frontend):** Composta por templates Jinja2 que herdam de estruturas mestras (`base_app.html` e `base_site.html`), estilizados por regras de CSS baseadas nos tokens oficiais do Canva. O editor interage com o usuário por meio de formulários que realizam chamadas assíncronas assinaladas via JavaScript nativo.
2. **Camada de Aplicação e Negócio (Backend Flask):** Organizada no padrão *Application Factory* e segregada por módulos lógicos através de *Blueprints*:
   - `auth_bp`: Gestão de sessões, login, logout e controle de permissões;
   - `admin_bp`: Gestão e auditoria de usuários;
   - `apresentacao_bp`: Criação, configuração, renderização e duplicação de apresentações e slides;
   - `projetos_bp`: Exibição do acervo de iniciativas e entrega de kits de slides via endpoints JSON;
   - `api_bp`: Endpoints auxiliares para alimentação assíncrona do editor.
3. **Camada de Persistência (PostgreSQL + SQLAlchemy):** Camada relacional responsável pelo armazenamento transacional de todas as entidades de domínio, operada 100% através do ORM.

### 4.2. A Tríade de Domínio: Apresentação, Projeto e Apresentador
A modelagem conceitual do Conecta Barueri resolve a ambiguidade corporativa através de três entidades bem demarcadas:

- **Apresentação (`apresentacao`):** O documento de entrega final (o "deck"), contendo um conjunto sequencial de slides ordenados para um evento ou reunião específica.
- **Projeto Municipal (`projeto`):** Uma política pública ou sistema oficial registrado pela prefeitura (ex: *Metaverso*, *Barueri Sem Papel*). O projeto encapsula seus dados oficiais e gera um **Kit de 2 a 3 slides**.
- **Apresentador (`apresentador`):** A identidade pública de secretários e palestrantes do município, contendo foto oficial, cargo, minibiografia e marco de realizações, permitindo inclusão imediata em slides de perfil.

### 4.3. Modelo Entidade-Relacionamento e Dicionário de Dados

#### Tabela `usuario` (Schema `login` / Público)
- `id` (SERIAL, Chave Primária): Identificador exclusivo do servidor.
- `nome` (VARCHAR(150), Não Nulo): Nome completo do servidor.
- `email` (VARCHAR(150), Não Nulo, Único): E-mail corporativo.
- `senha_hash` (VARCHAR(255), Não Nulo): Hash da senha gerado via Bcrypt.
- `papel` (VARCHAR(30), Padrão 'usuario'): Perfil de acesso ('admin' ou 'usuario').
- `status_ativo` (BOOLEAN, Padrão TRUE): Flag para bloqueio ou ativação do usuário.

#### Tabela `apresentacao` (Schema `apresentacao`)
- `id` (SERIAL, Chave Primária): Identificador da apresentação.
- `usuario_id` (INTEGER, Chave Estrangeira -> `usuario.id`): Criador do deck.
- `titulo` (VARCHAR(200), Não Nulo): Título institucional da apresentação.
- `descricao` (TEXT): Finalidade ou resumo da apresentação.
- `pasta_categoria` (VARCHAR(100)): Tag opcional de organização pessoal do usuário.
- `token_publico` (VARCHAR(64), Único): Token alfanumérico seguro para compartilhamento público.
- `ativo` (BOOLEAN, Padrão TRUE): Flag de exclusão lógica.
- `data_criacao` (TIMESTAMP, Padrão NOW()): Carimbo de data/hora de criação.

#### Tabela `slide` (Schema `apresentacao`)
- `id` (SERIAL, Chave Primária): Identificador do slide.
- `apresentacao_id` (INTEGER, Chave Estrangeira -> `apresentacao.id`, Não Nulo): Apresentação proprietária.
- `template_id` (INTEGER, Chave Estrangeira -> `template.id`, Não Nulo): Template visual aplicado.
- `ordem` (INTEGER, Não Nulo): Posição ordinal do slide na sequência do deck (1, 2, 3...).
- `titulo` (VARCHAR(200)): Título do slide.
- `subtitulo` (VARCHAR(250)): Subtítulo ou tagline do slide.
- `conteudo_texto` (TEXT): Parágrafo explicativo ou lead conceitual.
- `imagem_url` (VARCHAR(500)): Caminho ou URL da imagem principal.
- `posicao_matriz` (VARCHAR(20), Padrão 'bottom-right'): Coordenada 3x3 para ancoragem de ODS/QR.
- `dados_extras` (JSONB): Estrutura extensível para parâmetros específicos do template (ex.: lista de cards de pilares, configuração de gráfico ou série de métricas).

#### Tabela `projeto` (Schema `apresentacao`)
- `id` (SERIAL, Chave Primária): Identificador do projeto municipal.
- `nome` (VARCHAR(200), Não Nulo): Nome oficial da iniciativa (ex: "Coworking no Metaverso").
- `slug` (VARCHAR(200), Único): Identificador amigável de URL.
- `secretaria_principal` (VARCHAR(150)): Secretaria proponente responsável (ex: "Centro de Inovação e Tecnologia").
- `resumo` (TEXT): Descrição conceitual do projeto extraída do portal.
- `foto_url` (VARCHAR(500)): URL da fotografia oficial em alta resolução.
- `destaques` (JSONB): Lista estruturada com os 3 pontos de destaque da iniciativa.
- `beneficios` (JSONB): Lista estruturada com os 3 blocos de benefícios (título e explicação).
- `data_implantacao` (VARCHAR(50)): Data histórica de lançamento no município.
- `status_operacional` (VARCHAR(100)): Situação do projeto (ex: "Implantado e em uso").
- `ods_vinculados` (INTEGER[]): Array de identificadores dos ODS da ONU associados.

#### Tabela `apresentador` (Schema `apresentacao`)
- `id` (SERIAL, Chave Primária): Identificador da autoridade.
- `nome` (VARCHAR(150), Não Nulo): Nome completo da autoridade (ex: "Jonatas Randal").
- `cargo` (VARCHAR(150)): Cargo ou função pública oficial.
- `secretaria` (VARCHAR(150)): Secretaria de atuação.
- `biografia` (TEXT): Minibiografia institucional padronizada.
- `foto_url` (VARCHAR(500)): URL da foto oficial da autoridade em alta resolução.
- `conquistas` (JSONB): Grade de 4 destaques de carreira ou realizações históricas.

---

## 5. ENGENHARIA E INGESTÃO DE DADOS INSTITUCIONAIS

### 5.1. Segurança da Informação e Conformidade com LGPD
Durante o desenvolvimento do Conecta Barueri, a solicitação de acesso direto a bancos de dados municipais internos foi formalmente declinada pela equipe de Segurança da Informação do CIT, com base em justificativas de conformidade com a LGPD (Lei Geral de Proteção de Dados), isolamento de redes governamentais e restrições de liberação de credenciais externas.

Essa decisão institucional foi absorvida como um requisito de engenharia positivo: conectar a aplicação diretamente a um banco municipal criaria um acoplamento perigoso, suscetível a bloqueios de firewall e riscos de segurança.

### 5.2. A Pipeline de Ingestão do Portal SIT
Para suprir o sistema com informações oficiais, fidedignas e auditáveis, foi construída a **Pipeline Automatizada de Ingestão em Python** (`models_scripts/08_ingestao_portal_sit.py`), consumindo a fonte formalmente recomendada pela gestora da pasta: o catálogo de projetos da Secretaria de Inovação e Tecnologia:
- **Origem dos Dados:** `https://portal.barueri.sp.gov.br/cit/Portifolio.aspx?op={ID}`
- **Listagem por Secretarias:** `https://portal.barueri.sp.gov.br/cit/ProjetosSecretaria.aspx?op={SECRETARIA_ID}`

A pipeline opera em três estágios:
1. **Harvester/Crawler:** Executa requisições HTTP seguras simulando cabeçalhos de navegador padrão, coletando os identificadores (`op`) de mais de 100 iniciativas registradas no CIT e secretarias irmãs;
2. **Parser e Higienização:** Utiliza a biblioteca nativa de parsing para dissecar a estrutura uniforme das páginas ASPX, extraindo: título do projeto, fotografia oficial em alta qualidade (via `Foto.aspx`), lead descritivo, os três destaques, os três blocos de benefícios (título e corpo textual), data de implantação, status e números de ODS;
3. **Persistência Relacional:** Valida se o projeto já consta no banco e realiza a gravação idempotente via SQLAlchemy ORM na tabela `projeto`, gerando simultaneamente a estrutura de metadados para compor o kit de slides.

---

## 6. DESIGN SYSTEM CORPORATIVO E CATÁLOGO DE TEMPLATES

### 6.1. Engenharia Reversa dos Slides Reais (Canva)
A identidade visual do Conecta Barueri foi integralmente extraída dos 81 slides das três apresentações oficiais fornecidas pelo CIT no Canva (*SIT Barueri 2025*, *Apresentação Metaverso* e *Apresentação UNIP*). A análise dos parâmetros CSS reais permitiu mapear os exatos padrões cromáticos e tipográficos da Prefeitura.

### 6.2. Paleta de Cores Homologada

| Token CSS | Valor HEX | Função Semântica Institucional |
| :--- | :---: | :--- |
| `--cb-bg-white` | `#FFFFFF` | Branco puro corporativo (fundo clássico e texto sobre máscaras) |
| `--cb-text-dark` | `#414042` | Cinza Chumbo Oficial (títulos e textos de alta legibilidade) |
| `--cb-text-muted` | `#64748B` | Cinza Neutro Secundário (subtítulos, datas e legendas de auditoria) |
| `--cb-navy-primary` | `#0C2E4E` | Azul Marinho CIT (cor master para cabeçalhos solenes e aberturas) |
| `--cb-blue-accent` | `#0052FF` | Azul Royal Conecta Barueri (botões, indicadores e elementos de foco) |
| `--cb-cyan-light` | `#39AFD3` | Azul Ciano Tecnologia (subtítulos e categorias de inovação) |
| `--cb-green-ods` | `#039967` | Verde Esmeralda Sustentável (ODS ambientais e indicadores ecológicos) |
| `--cb-orange-accent` | `#F79646` | Laranja Governamental (métricas de economia e destaques operacionais) |
| `--cb-purple-tech` | `#8C52FF` | Roxo / Violeta Inovação (exclusivo para Metaverso e realidade virtual) |
| `--cb-card-bg` | `#F8FAFD` | Cinza Gelo Suave (fundo de cards de pilares com borda `#E2E8F0`) |
| `--cb-scrim-dark` | `rgba(12, 46, 78, 0.72)` | Overlay Protetor (máscara para contraste sobre fotografias de fundo) |

### 6.3. Tipografia e Escala do Canvas 16:9
- **Resolução de Referência:** `1920 × 1080 px` (Proporção `16:9` Widescreen) com margem interna de segurança de `60px`.
- **Família Tipográfica Primária (Títulos e Números de Impacto):** `Montserrat` (Pesos: 700 Bold e 800 Extra-Bold).
- **Família Tipográfica Secundária (Textos, Parágrafos e Badges):** `Inter` (Pesos: 400 Regular, 500 Medium e 600 Semi-Bold).

### 6.4. Os 10 Templates Homologados

1. **Template 1: Capa / Abertura Institucional (`capa`):** Título de grande porte, subtítulo institucional, foto de fundo com máscara escura opcional, selos de logotipos oficiais (Prefeitura e CIT) e slots de ODS/QR.
2. **Template 2: Imagem + Texto Conceitual (`imagem_texto`):** Layout dividido em duas colunas (imagem oficial com bordas arredondadas à esquerda ou direita, e bloco de título, resumo e lista de 3 destaques).
3. **Template 3: Indicadores e Métricas de Impacto (`indicadores`):** Painel de 2, 3 ou 4 cards de grandes métricas numéricas com prefixo/sufixo configurável e carimbo obrigatório de auditoria de dados (*"Fonte: Base CIT - Coleta em DD/MM/AAAA"*).
4. **Template 4: Gráfico Quantitativo + Análise Textual (`grafico`):** Lado esquerdo com gráfico interativo renderizado via Chart.js (barras ou linhas) e lado direito com card de síntese analítica dos dados.
5. **Template 5: Mapa Territorial de Barueri (`mapa`):** Visualizador vetorial interativo com Leaflet.js centrado no mapa de Barueri com marcadores de equipamentos públicos e painel flutuante de dados municipais.
6. **Template 6: Vídeo Institucional e Mídias Digitais (`video`):** Player de vídeo em proporção 16:9 (YouTube, Vimeo ou MP4) integrado com faixa inferior de 3 métricas de audiência da TV Inovação.
7. **Template 7: Apresentador / Perfil de Autoridade (`apresentador`):** Foto oficial institucional, nome da autoridade, cargo, secretaria, minibiografia oficial e grade de 4 conquistas históricas, com importação em 1 clique a partir do acervo de apresentadores.
8. **Template 8: Encerramento Institucional (`encerramento`):** Slide clássico com mensagem "OBRIGADO" em azul royal, contatos institucionais, QR Code direcionando ao portal da prefeitura e linha oficial de copyright.
9. **Template 9: Módulos e Pilares do Projeto (`modulos_pilares`):** Grade de 3 a 6 cards organizados horizontalmente, detalhando frentes de atuação, departamentos ou benefícios com ícone, título e descrição.
10. **Template 10: Prêmios e Reconhecimentos Oficiais (`premios_marcos`):** Grade de 3 a 4 troféus e selos de validação institucional (nome da premiação, ano, entidade concedente e categoria).

### 6.5. Anatomia do Kit de Projeto Modular
Ao importar uma iniciativa municipal no Conecta Barueri, o sistema gera instantaneamente uma sequência coordenada de slides:
- **Slide 1 (Apresentação do Projeto):** Preenchido automaticamente a partir do portal (Template `imagem_texto`, trazendo a foto oficial, título, lead, secretaria e selos ODS).
- **Slide 2 (Benefícios e Pilares):** Preenchido automaticamente a partir do portal (Template `modulos_pilares`, gerando 3 cards elegantes com os benefícios reais e explicações extraídas do portal).
- **Slide 3 (Indicadores de Impacto):** Template `indicadores` pré-configurado com a identidade visual daquele projeto e campos abertos para que o apresentador insira as métricas específicas de sua pasta.

---

## 7. ETAPAS DE DESENVOLVIMENTO, TESTES E CRONOGRAMA HISTÓRICO

O projeto foi executado sob metodologia iterativa e incremental, compreendendo quatro fases principais:

### 7.1. Fase 1: Concepção, Pesquisa e Modelagem Inicial (Março a Maio/2026)
- Entendimento das diretrizes do TCC na Etec de Barueri;
- Primeiras rodadas de entrevistas e questionários aplicados junto à equipe da Secretaria de Inovação e Tecnologia (CIT);
- Definição da stack tecnológica (Python/Flask, PostgreSQL e Bootstrap 5);
- Ocorrência do **Pivot 1**: constatação de que a criação de apresentações era a maior dor do CIT, substituindo a proposta de dashboard genérico pela plataforma de autoria de slides.

### 7.2. Fase 2: Implementação do Núcleo e Protótipo (Junho a Setembro/2026)
- Implementação da arquitetura Flask em camadas com Blueprints e autenticação segura via Flask-Login e senhas Bcrypt;
- Criação do CRUD de administração de usuários para servidores autorizados;
- Desenvolvimento da primeira versão do editor de slides com 5 templates básicos e persistência relacional;
- Integração do mapa vetorial de Barueri com Leaflet.js e gráficos preliminares.

### 7.3. Fase 3: Pré-Banca e Avaliação Crítica do CIT (Outubro/2026)
- Apresentação do protótipo funcional perante a pré-banca de avaliação;
- Identificação de desalinhamentos de requisitos: a cliente esclareceu a necessidade de reutilização transversal de projetos municipais (e não apenas organização de pastas locais) e demandou link público sem necessidade de credenciais de login;
- Recepção do parecer formal de Segurança da Informação do CIT, vetando acesso direto a bancos de dados internos e direcionando a integração para o portfólio público do Portal SIT.

### 7.4. Fase 4: Sprint Final de Homologação (Novembro/2026)
- Ocorrência do **Pivot 2**: modelagem formal das iniciativas como **Kits Modulares de Projetos** e criação da entidade de perfis de autoridades (`Apresentador`);
- Desenvolvimento da pipeline automatizada de ingestão de dados em Python (`08_ingestao_portal_sit.py`) mapeando o catálogo de portfólio do CIT;
- Engenharia reversa completa dos 81 slides do Canva, refinando o Design System oficial e especificando o catálogo de 10 templates;
- Implementação da rota pública de exibição em tela cheia (`GET /p/<id>`) e do mecanismo de cache em memória de templates e ODS;
- Elaboração da documentação final e consolidação dos artefatos para a banca avaliadora.

---

## 8. CONSIDERAÇÕES FINAIS E TRABALHOS FUTUROS

### 8.1. Conclusão
O projeto **Conecta Barueri** alcançou com êxito os objetivos propostos para o Trabalho de Conclusão de Curso. A plataforma soluciona uma dor real, concreta e documentada de um órgão de ponta da administração pública municipal.

Ao desvencilhar-se da abordagem ingênua de editores gráficos livres e assumir uma postura rigorosa de **governança visual corporativa baseada em templates e kits modulares**, a solução comprova que a engenharia de software aplicada à gestão pública deve priorizar padronização, agilidade e segurança jurídica. A entrega demonstra maturidade técnica ao transformar as restrições de segurança da informação impostas pela prefeitura em uma arquitetura de dados desacoplada, resiliente e 100% autônoma.

### 8.2. Limitações Conhecidas do MVP
- A ingestão de projetos públicos cobre prioritariamente as secretarias com portfólio cadastrado no portal oficial da SIT;
- O preenchimento de séries históricas numéricas para gráficos complexos ainda requer inserção manual nos templates analíticos;
- O sistema opera com permissão monousuário por deck, sem edição colaborativa simultânea no mesmo slide.

### 8.3. Trabalhos Futuros (Roadmap Pós-MVP)
- **Exportação Nativa para Formatos Offline:** Implementação de gerador de arquivos .pdf ou pacote HTML offline autocontido para situações de contingência de rede;
- **Sistema de Colaboradores e Versionamento:** Permissão para que múltiplos servidores de diferentes secretarias colaborem em uma mesma apresentação com controle de histórico de alterações;
- **Webhooks de Atualização Contínua:** Agendamento periódico da pipeline de ingestão via tarefas em background (cron jobs) para atualizar automaticamente status e novos projetos publicados pela prefeitura.

---

## REFERÊNCIAS BIBLIOGRÁFICAS (ABNT NBR 6023)

- BARUERI. Prefeitura Municipal de Barueri. **Portal da Secretaria de Inovação e Tecnologia (SIT)**. Disponível em: <https://portal.barueri.sp.gov.br/cit/>. Acesso em: 16 nov. 2026.
- BRASIL. **Lei nº 13.709, de 14 de agosto de 2018**. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018.
- FROST, Brad. **Atomic Design**. Massachusetts: Brad Frost Web, 2016.
- GUIMARÃES, Maria Cristina. **Governo Digital e a Transformação dos Serviços Públicos no Brasil**. Revista de Administração Pública, v. 55, n. 4, p. 810-828, 2021.
- GRINBERG, Miguel. **Desenvolvimento Web com Flask: Desenvolvendo Aplicações Web com Python**. São Paulo: Novatec, 2019.
- PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de Software: Uma Abordagem Profissional**. 9. ed. Porto Alegre: AMGH, 2021.
- SOMMERVILLE, Ian. **Engenharia de Software**. 10. ed. São Paulo: Pearson Education do Brasil, 2019.
- W3C. **Web Content Accessibility Guidelines (WCAG) 2.1**. World Wide Web Consortium, 2018. Disponível em: <https://www.w3.org/TR/WCAG21/>. Acesso em: 16 nov. 2026.
