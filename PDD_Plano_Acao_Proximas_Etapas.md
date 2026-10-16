# PDD — Plano de Ação e Especificação Técnica das Próximas Etapas
## Conecta Barueri — Guia Operacional para Desenvolvedores e IAs

> **Status:** Documento Oficial de Planejamento e Arquitetura Técnica  
> **Destinatários:** Equipe Conecta Barueri (Vinicius, Marianna, Lucas, Belloni) e Assistentes de IA (Gemini / Antigravity / ChatGPT)  
> **Horizonte Temporal:** 2 Semanas até a Pré-Banca → Reta Final até a Banca Definitiva do TCC  

---

## 1. CONTEXTO, PAPÉIS E FLUXO DE TRABALHO DA EQUIPE

### 1.1. Divisão Formal de Responsabilidades ("Nome aos Bois")

| Membro | Papel Primário | Responsabilidades Técnicas e Entregas |
| :--- | :--- | :--- |
| **Vinicius** | **Banco de Dados, Modelagem, Dados e Validação Funcional** | - Modelagem relacional e integridade no PostgreSQL via SQLAlchemy.<br>- Arquitetura da Mock Engine de APIs de Barueri e tabela de indicadores tratados.<br>- Alinhamento de requisitos técnicos e funcionais com Marianna.<br>- Validação funcional rigorosa pós-implementação (regras de negócio, queries e rotas). |
| **Marianna** | **Design de Interface, UI/UX e Revisão Visual** | - Criação e prototipagem de novas telas e revisão de telas existentes.<br>- Especificação de componentes visuais (Seletor 3×3, Header Strip, grades de ODS).<br>- Redesenho da Nova Landing Page oficial.<br>- Validação visual e de UX pós-implementação (fidelidade ao design, cores, tipografia e WCAG). |
| **Lucas e Belloni** | **Frontend e Backend (Full-Stack)** | - Implementação de rotas Flask, Blueprints e controladores.<br>- Construção de formulários Flask-WTF e validação CSRF.<br>- Renderização server-side via Jinja2 com estrita herança (`base_site` / `base_app`).<br>- Interatividade client-side com Vanilla JavaScript, Bootstrap 5, Chart.js e Leaflet.js. |

### 1.2. Protocolo Estrito de Desenvolvimento em 5 Etapas

Nenhuma tela ou funcionalidade vai diretamente para o código sem passar pelo ciclo de consenso e revisão dupla:

```text
[1. Demanda & Requisitos] (Vinicius)
           ↓
[2. Design & Protótipo] (Marianna)
           ↓
[3. Consenso Técnico-Visual] (Vinicius + Marianna) ──(Aprovado)──┐
                                                                 ↓
[4. Implementação Full-Stack] (Lucas + Belloni) ←────────────────┘
           ↓
[5. Revisão Dupla Pós-Implementação]:
     ├── Revisão Funcional & Banco: Vinicius (testa fluxo, rotas, ORM e segurança)
     └── Revisão Visual & UX: Marianna (testa fidelidade visual, espaçamentos e responsividade)
           ↓
[Merge & Conclusão da Feature]
```

---

## 2. DIAGNÓSTICO DO ESTADO ATUAL E OBJETIVOS DOS MARCOS

### 2.1. O que foi apresentado na Banca Anterior vs. Gargalos
* **Apresentado:** Protótipo inicial do editor de slides, conceito de pastas (projetos) e ideia de reuso de dados.
* **Gargalos Críticos:**
  1. *Ausência de Governança:* Tudo operava sob um perfil genérico; o `/admin` é estático e não há separação de usuários.
  2. *Landing Page Desfasada:* Visual herdado do Figma de abril, destoando do padrão Light Mode atual.
  3. *Editor com Pouca Liberdade:* Apenas 4 templates, sem controle de alinhamento, sem ajuste de cores seguras e com risco de textos ilegíveis sobre fotos.
  4. *Inexistência de APIs da Prefeitura:* O preenchimento dinâmico não possui fonte de dados porque a prefeitura/CIT não forneceu endpoints reais.
  5. *Falta de Saída Externa:* Slides presos no navegador, sem exportação para apresentação corporativa ou PDF.

### 2.2. O Marco da Pré-Banca (Semana 1 e Semana 2): Feature Complete
A Pré-Banca exige que **todas as funcionalidades prometidas existam e funcionem de ponta a ponta**. Não pode haver botões "em breve", telas vazias ou recursos simulados apenas no discurso.

### 2.3. O Marco da Banca Final: Polimento, Segurança e Estabilidade
Período dedicado a eliminar bugs, blindar o sistema contra acessos indevidos, otimizar renderizações, implementar exportação limpa e ensaiar o roteiro da apresentação.

---

## 3. ESPECIFICAÇÃO TÉCNICA DETALHADA POR MÓDULO

### MÓDULO 1: Governança de Usuários, Permissões e Painel `/admin`

#### Arquitetura de Permissões:
* **Usuário Comum (`admin=False`):**
  - Autentica-se pelo `/login`.
  - Tem acesso a `/home`, `/projetos`, `/apresentacao`.
  - **Isolamento de Dados:** Ao listar projetos (`Projeto.query`), o filtro obrigatório é `filter_by(usuario_id=current_user.id)`. Jamais pode ver ou editar projetos de terceiros.
  - Tentativas de acessar rotas `/admin/*` resultam em `abort(403)`.
* **Administrador (`admin=True`):**
  - Acesso total ao sistema e ao painel `/admin`.
  - Pode visualizar todos os projetos do sistema para fins de auditoria.

#### Endpoints do Módulo `/admin` (`routes/admin.py`):
1. `GET /admin/usuario`: Listagem de usuários com tabela Bootstrap 5, exibindo: ID, Nome, E-mail, Papel (Admin/Comum), Status (Badge Verde `Ativo` / Cinza `Inativo`), Data de Criação e Ações.
2. `POST /admin/usuario/criar`: Modal ou tela de criação de novo funcionário/secretário. Campos: Nome, E-mail, Senha Provisória, Papel (`admin`). Utiliza `Flask-Bcrypt` para hash antes de persistir em `login.senhas`.
3. `POST /admin/usuario/<id>/toggle-status`: Alterna o status do usuário (`usuario.status = not usuario.status`). Usuário inativo tem login bloqueado via `is_active` do Flask-Login.

---

### MÓDULO 2: Nova Landing Page Oficial (`/`)

#### Diretrizes de Design e Estrutura:
* Substituição integral do layout desatualizado de abril.
* Estilo corporativo: Light Mode, tipografia sóbria, uso das variáveis CSS de `global.css`.
* **Seções Obrigatórias do Template `landing/index.html`:**
  1. *Hero Section:* Título de impacto do Conecta Barueri, subtítulo explicando a plataforma de gestão visual e geração de apresentações para secretarias, e botão primário CTA *"Acessar Plataforma"*.
  2. *Painel de Recursos:* 3 a 4 cards institucionais destacando: Templates Governamentais Homologados, Integração com Indicadores Municipais e Preservação da Identidade Visual.
  3. *Alinhamento com os ODS da ONU:* Destaque sobre o compromisso de Barueri com a Agenda 2030.
  4. *Rodapé Institucional:* Logos da Prefeitura de Barueri e CIT, termos de uso e links institucionais.
* **Regra Jinja2:** Extensão estrita de `landing/base_site.html`. Proibido redeclarar tags `<head>`, Bootstrap ou estilos globais.

---

### MÓDULO 3: Editor de Slides Avançado e Catálogo dos 8 Templates

#### 3.1. Catálogo Completo dos 8 Templates Homologados
1. **Capa / Abertura (`capa`):** Título principal, subtítulo institucional, imagem de fundo opcional com contraste e logos.
2. **Imagem + Texto (`imagem_texto`):** Layout balanceado em split; imagem em container de um lado e bloco de texto estruturado do outro.
3. **Indicadores (`indicadores`):** Título explicativo e cards de destaque com números grandes e rótulos (alimentados manual ou dinamicamente).
4. **Gráfico (`grafico`):** Bloco de visualização de dados renderizado via **Chart.js** (barras horizontais/verticais ou linhas) + texto analítico lateral.
5. **Mapa de Barueri (`mapa`):** Visualização geográfica interativa via **Leaflet.js** focada nos limites de Barueri com pins configuráveis.
6. **Vídeo (`video`):** Player de vídeo institucional responsivo (suporte a YouTube/Vimeo embed ou arquivo direto MP4) + legenda.
7. **Apresentador / Bio (`apresentador`):** Template de autoridade/palestrante: foto redonda/card, nome, cargo/secretaria e lista de tópicos.
8. **Encerramento (`encerramento`):** Slide final com agradecimentos, contatos oficiais da secretaria e bloco de logos de apoio.

#### 3.2. Controles Visuais no Painel Lateral (`criar-apresentacao.html`)
Para dar liberdade estética ao editor **sem quebrar o layout nem permitir drag-and-drop livre**, o painel lateral deve disponibilizar:

1. **Seletor de Ancoragem Matricial 3×3 (Slots Flexíveis):**
   - Matriz clicável com 9 quadrantes (`top-left`, `top-center`, `top-right`, `mid-left`, `center`, `mid-right`, `bottom-left`, `bottom-center`, `bottom-right`).
   - Define a ancoragem de elementos acessórios: ODS, QR Code, Bandeiras e Logos secundários.
2. **Formatação de Textos:**
   - Botões clássicos de alinhamento: Esquerda (padrão), Centralizado, Direita, Justificado.
   - Seletor de cores restrito à paleta:
     - `#FFFFFF` (Branco para fundos escuros / fotos).
     - `#102A56` (Azul Marinho Corporativo para fundos claros).
     - `#212529` (Grafite para texto secundário).
     - `#0052FF` (Azul Barueri para ênfases e destaques).
3. **Barra de Cabeçalho (*Header Strip*) e Tratamento de Fundo:**
   - Switch para ativar a **Barra de Cabeçalho**: uma faixa superior sólida ou semi-translúcida onde repousam título e logo, destacando o texto da foto.
   - Opção de enquadramento da foto de fundo:
     - *Tela Cheia com Scrim:* Foto cobre o slide todo com uma camada suave escura (`rgba(0,0,0,0.40)`) para garantir legibilidade WCAG.
     - *Imagem Contida (Card Parcial):* A foto fica em um container delimitado, deixando o fundo do texto em branco/cinza corporativo.
4. **Arranjo de ODS:**
   - Opção de exibir em *Faixa Horizontal (1 linha)* ou em *Grade Compacta (2 linhas)* (estilo Canva institucional).

---

### MÓDULO 4: Mock Engine de APIs de Barueri e Preenchimento Dinâmico

#### O Problema Real:
A Prefeitura de Barueri e o CIT não liberaram chaves de API para os alunos. Sem uma estratégia técnica, o preenchimento dinâmico prometido no TCC não existiria na prática.

#### A Solução Estratégica:
Implementaremos uma **Mock Engine interna** de dados abertos municipais que simula perfeitamente os serviços da prefeitura:

1. **Tabela de Indicadores Tratados (`apresentacao.indicador`):**
   - Colunas: `id`, `secretaria` (ex: "Saúde", "Educação", "Segurança", "Finanças"), `nome_metrica` (ex: "Consultas Realizadas 2026", "Alunos Matriculados", "Câmeras Monitoradas"), `valor_numerico`, `unidade_medida` (ex: "unid", "%", "R$"), `data_atualizacao`, `historico_json`.
2. **Serviço Simulador de Ingestão (`app/services/mock_api_service.py`):**
   - Gera e atualiza métricas realistas da cidade de Barueri.
   - Possui rota ou comando de sincronização (`POST /api/sincronizar-indicadores`).
3. **Consumo no Editor de Slides:**
   - No editor, ao editar um card de indicador ou gráfico, o usuário clica em *"Origem do Dado: Dinâmico"*.
   - Abre-se um seletor com as secretarias e métricas disponíveis de Barueri.
   - O campo preenchido é salvo como `tipo_fonte = 'indicador'` e grava o `indicador_id`. O valor é atualizado automaticamente na renderização do slide!

---

### MÓDULO 5: Modo Apresentação Interno (Full-Screen)

* **Rota:** `/apresentacao/<id>/iniciar`
* **Comportamento:**
  - Oculta completamente sidebars, barras de edição e menus.
  - Aciona o modo Fullscreen do navegador (via API `document.documentElement.requestFullscreen()`).
  - Navegação por teclado: Tecla `→` ou `Space` (próximo slide), Tecla `←` (slide anterior), Tecla `Esc` (sair).
  - Barra de progresso discreta no rodapé indicando `Slide X de Y`.
  - Transições suaves e renderização impecável dos gráficos e mapas no tamanho da tela.

---

### MÓDULO 6: Exportação para PDF e Impressão Externa

* **Problema:** Um sistema de slides corporativo não pode ser refém exclusivo de uma aba de navegador aberta. A banca quer ver utilidade prática.
* **Implementação:**
  1. Criação de folha de estilos `@media print` no template de apresentação.
  2. Cada slide configurado com regra CSS `page-break-after: always;` e proporção 16:9 em folha A4 paisagem.
  3. Remoção de todos os elementos interativos, botões e barras no modo de impressão.
  4. Botão *"Exportar para PDF"* que aciona `window.print()`, permitindo ao usuário salvar um PDF com 1 slide por folha em alta definição e sem marcas de corte.

---

### MÓDULO 7: Tags, Flags e Catalogação de Projetos

* **Objetivo:** Facilitar a navegação e gestão de múltiplos projetos e apresentações conforme o volume de documentos cresce.
* **Especificações:**
  - Adicionar suporte a categorias temáticas (Secretarias: "Saúde", "Educação", "Segurança", "Meio Ambiente", "CIT").
  - Campo de busca instantânea com filtro por texto e categoria nas telas de Projetos e Apresentações.
  - Badges visuais coloridas (Flags) identificando o status da apresentação (ex: `Em Edição`, `Pronta para Apresentação`, `Homologada`).

---

## 4. MATRIZ DE REGRAS TÉCNICAS E PREVENÇÃO DE BUGS (GUARDRAILS)

Toda IA e todo desenvolvedor deve obedecer cegamente a estas regras antes de commitar qualquer código:

1. ⚠️ **BUG DO BLUEPRINT (`url_for`):**
   - Sempre utilize o nome registrado na string do Blueprint, NUNCA a variável Python.
   - Exemplo: se o blueprint foi instanciado com `admin_bp = Blueprint('admin', __name__)`, a chamada obrigatória é `url_for('admin.listar_usuarios')`.
2. **HERANÇA JINJA2 STRICT DRY:**
   - Proibido duplicar `<head>`, CDN do Bootstrap, Navbar ou estilos globais em templates filhos.
   - Use `landing/base_site.html` para páginas públicas e `app/base_app.html` (ou `base.html` unificado) para a área autenticada.
3. **ORM SEM RAW QUERIES:**
   - Proibido escrever SQL puro (`db.session.execute("SELECT...")`). Toda interação deve usar o SQLAlchemy ORM (`Usuario.query...`, `db.session.add()`, etc.).
4. **BLINDAGEM DE AUTORIZAÇÃO:**
   - Toda rota interna deve conter `@login_required`.
   - Rotas administrativas devem conter `@admin_required`.
   - Usuário comum só edita ou visualiza projetos onde `projeto.usuario_id == current_user.id`.
5. **CSRF EM TODOS OS FORMULÁRIOS:**
   - Formulários devem utilizar Flask-WTF e conter `{{ form.hidden_tag() }}`. Submissões via `fetch()` devem enviar o token CSRF no header `X-CSRFToken`.

---

## 5. ROTEIRO CRONOLÓGICO DE EXECUÇÃO (SPRINTS)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SEMANA 1 (SPRINT 1)                              │
│  Meta: Governança, Banco Atualizado e Controles Visuais do Editor           │
├─────────────┬───────────────────────────────────────────────────────────────┤
│ Vinicius    │ • Atualizar models: Usuario (status), Slide (estilos visuais) │
│             │ • Gerar seed com admin e usuário comum de teste               │
│             │ • Alinhar requisitos das telas de admin e editor com Marianna │
├─────────────┼───────────────────────────────────────────────────────────────┤
│ Marianna    │ • Desenhar telas do /admin/usuario (listagem e cadastro)      │
│             │ • Desenhar Seletor 3x3 e controles de texto/fundo do Editor   │
│             │ • Aprovar especificações com Vinicius                         │
├─────────────┼───────────────────────────────────────────────────────────────┤
│ Lucas &     │ • Implementar CRUD de usuários no /admin com Bcrypt           │
│ Belloni     │ • Criar decorator @admin_required e isolar projetos comuns   │
│             │ • Implementar Seletor 3x3 e estilos no painel do Editor       │
├─────────────┴───────────────────────────────────────────────────────────────┤
│ REVISÃO: Vinicius valida funcionalidades e banco; Marianna valida o design. │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       SEMANA 2 (SPRINT 2 — PRÉ-BANCA)                       │
│  Meta: 8 Templates Prontos, Mock de APIs, Full-Screen e Nova Landing Page   │
├─────────────┬───────────────────────────────────────────────────────────────┤
│ Vinicius    │ • Criar Mock Engine de APIs de Barueri e tabela de indicadores│
│             │ • Popular dados simulados das secretarias                     │
│             │ • Alinhar layout da Nova Landing e dos novos templates        │
├─────────────┼───────────────────────────────────────────────────────────────┤
│ Marianna    │ • Desenhar a Nova Landing Page oficial do Conecta Barueri     │
│             │ • Especificar layout dos 4 novos templates e modo Full-Screen │
│             │ • Desenhar a grade compacta de ODS                            │
├─────────────┼───────────────────────────────────────────────────────────────┤
│ Lucas &     │ • Implementar a Nova Landing Page respeitando herança Jinja2  │
│ Belloni     │ • Concluir os 4 templates restantes (Gráfico, Mapa, etc.)     │
│             │ • Integrar o preenchimento dinâmico consumindo o mock de APIs │
│             │ • Implementar o Modo Apresentação em Tela Cheia               │
├─────────────┴───────────────────────────────────────────────────────────────┤
│ ★ MARCO DE ENTREGA: SISTEMA 100% FUNCIONAL E APRESENTADO NA PRÉ-BANCA      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    PÓS PRÉ-BANCA ATÉ A BANCA FINAL                          │
│  Meta: Exportação PDF, Filtros, Auditoria de Segurança e Polimento Final    │
├─────────────┬───────────────────────────────────────────────────────────────┤
│ Vinicius    │ • Modelar categorias, tags e flags                            │
│             │ • Auditoria de integridade do banco e consultas ORM           │
│             │ • Preparar base do "Projeto Vitrine" para o dia da banca      │
├─────────────┼───────────────────────────────────────────────────────────────┤
│ Marianna    │ • Especificar layout de impressão limpa / PDF dos slides      │
│             │ • Desenhar barras de busca, filtros e badges de status        │
│             │ • Auditoria geral de consistência de design e WCAG            │
├─────────────┼───────────────────────────────────────────────────────────────┤
│ Lucas &     │ • Implementar exportação para PDF via @media print            │
│ Belloni     │ • Implementar filtros e busca na listagem de projetos         │
│             │ • Auditoria de rotas, @login_required e CSRF em todos os forms│
│             │ • Limpeza de código e otimização de templates Jinja2          │
├─────────────┴───────────────────────────────────────────────────────────────┤
│ ★ APRESENTAÇÃO DEFINITIVA DO TCC COM NOTA MÁXIMA                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---
*Este documento é a especificação viva para as próximas sprints do Conecta Barueri. Qualquer dúvida técnica deve ser resolvida com base nas definições aqui presentes.*
