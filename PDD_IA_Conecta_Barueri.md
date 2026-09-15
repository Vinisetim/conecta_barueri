# PDD — Documento de Descrição do Projeto: Conecta Barueri (Especificação para IA)

> **Versão:** 2.0 | **Data:** 2026-09  
> **Target:** LLM / Code Generation Assistant  
> **Status:** Especificação Técnica Rígida e Diretrizes de Sistema (Fonte Única da Verdade)

---

## 0. PROMPT DE ANCORAGEM (BOOTSTRAP PROMPT)

```text
[INSTRUÇÃO DE INICIALIZAÇÃO DE CONTEXTO - CONECTA BARUERI]
Você é o assistente de desenvolvimento do projeto Conecta Barueri.
Este documento (PDD v2.0) estabelece a arquitetura, regras de negócio e limites de escopo.
Regras absolutas:
1. NÃO gere código de produção antes de entender a funcionalidade e validar os arquivos afetados.
2. NÃO sugira ou implemente Dash, React, Vue ou Analytics.
3. RESPEITE a hierarquia relacional: Usuario -> Projeto -> Apresentacao -> Slide -> Template -> CampoPreenchido.
4. MANTENHA o login atual (Flask-Login + Bcrypt) 100% funcional.
5. RESPEITE a convenção do url_for() para Blueprints.
Confirme a leitura e aguarde instruções.
```

---

## 1. ESPECIFICAÇÃO DE ESCOPO E PIEZAS ARQUITETURAIS

### 1.1. Propósito do Sistema
Plataforma corporativa Flask/PostgreSQL de geração de apresentações institucionais baseadas em templates fixos restritos. Identidade visual institucional 100% protegida pelo sistema.

### 1.2. Constraints de Escopo (MVP vs. Visão Futura)

| Módulo / Feature | Status no MVP | Ação Exigida da IA |
| :--- | :--- | :--- |
| **Editor de Slides por Templates Fixos** | ✅ PERMITIDO / OBRIGATÓRIO | Implementar via formulários WTForms e Jinja2 |
| **Preenchimento Manual de Campos** | ✅ PERMITIDO / OBRIGATÓRIO | Foco primário de persistência no banco |
| **Reuso de Mídias (Mesmo Projeto)** | ✅ PERMITIDO | FK entre `CampoPreenchido` do mesmo `Projeto` |
| **Slots Flexíveis (ODS, QR Code, Logo)** | ✅ PERMITIDO | Renderizar via Seletor Matricial 3×3 de posições fixas (proibido drag-and-drop livre) |
| **Editor Drag-and-Drop / Layout Livre** | 🚫 PROIBIDO | JAMAIS gerar JS para movimentação livre de elementos |
| **Colaboradores (Editor / Visualizador)** | 🚫 FORA DO MVP (Roadmap Pós-MVP) | No MVP, apenas o criador (`usuario_id`) acessa seu projeto. NÃO criar tabelas/lógica de colaboradores agora. |
| **Dash (Python/Plotly)** | 🚫 PROIBIDO / DESCARTADO | Usar exclusivamente Chart.js no client-side |
| **Analytics (Cliques, tempo por slide)** | 🚫 PROIBIDO | JAMAIS criar rotas/tabelas de métricas de uso |
| **Hierarquia de 7 Papéis (CIT)** | 🚫 PROIBIDO | Manter estritamente `admin=True` e `admin=False` |
| **Abertura Pública / Links sem Login** | 🚫 PROIBIDO | Manter todas as rotas internas protegidas por `@login_required` |

---

## 2. STACK TECNOLÓGICA E REGRAS DE PROGRAMAÇÃO

```yaml
backend:
  language: "Python 3"
  framework: "Flask (Factory Pattern + Blueprints)"
  orm: "SQLAlchemy (Strictly ORM - Zero Raw Queries)"
  auth: "Flask-Login (Session) + Flask-Bcrypt (Password Hashing)"
  forms: "Flask-WTF + WTForms (CSRF Active: {{ form.hidden_tag() }})"

frontend:
  rendering: "Jinja2 Server-Side (Strict Template Inheritance)"
  css_framework: "Bootstrap 5 (Light Mode Corporate: #FFFFFF, #F8F9FA, #0052ff)"
  interactivity: "Vanilla JavaScript + fetch() (JSON Endpoints)"
  charts_maps: "Chart.js (Charts) / Leaflet.js (Municipal Map Template Only)"

database:
  engine: "PostgreSQL"
  schemas:
    login: ["usuario", "senha"]
    apresentacao: ["projeto", "apresentacao", "slide", "template", "campo_preenchido", "slot_flexivel", "ods", "apresentador"]
```

---

## 3. ESQUEMA RELACIONAL DO BANCO DE DADOS (ORM TARGET)

⚠️ **TABELA LEGADA `salvar_apresentacao` COM `dados_salvos VARCHAR(255)` ESTÁ DESCONTINUADA.**

### 3.1. Mapeamento de Entidades SQLAlchemy

**Definições Conceituais das Entidades:**
- **`Projeto` (Pasta Temática):** Entidade agregadora e pasta temática de um assunto/secretaria (ex: "Saúde 2026"). Possui nome, descrição, imagem de capa e pertence a um dono (`usuario_id`). Delimita o escopo de reuso de arquivos de mídia (imagens/vídeos). Contém **1 ou N Apresentações**.
- **`Apresentacao` (Arquivo de Slides):** O arquivo de apresentação em si, renderizável em tela cheia. Pertence obrigatoriamente a um `projeto_id`. É composto por **1 ou N Slides** ordenados. Permite que um mesmo projeto tenha múltiplas versões (ex: versão técnica interna vs versão resumida pública).

```text
login.usuario (id, nome, email, admin, status)
     │ 1:1
login.senha (usuario_id FK, senha_hash)
     │ 1:N
apresentacao.projeto (id, usuario_id FK, nome, descricao, capa_url)
     │ 1:N
apresentacao.apresentacao (id, projeto_id FK, nome, categoria_id FK, data_criacao)
     │ 1:N
apresentacao.slide (id, apresentacao_id FK, ordem INT, template_id FK, alinhamento_texto, estilo_fundo, filtro_fundo)
     │ 1:N
     ├── apresentacao.template (id PK, nome, codigo, descricao) [Lookup estática referenciada por template_id]
     ├── apresentacao.campo_preenchido (id, slide_id FK, chave_campo, tipo_fonte, valor_manual, indicador_id FK, campo_origem_id FK, tamanho_texto, cor_texto, fonte)
     └── apresentacao.slot_flexivel (id, slide_id FK, tipo_elemento, posicao_matriz, config_json)

apresentacao.ods (id PK, numero UNIQUE INT, titulo, descricao, icone_url, cor_hex) [Catálogo estático de apoio aos slots flexíveis]
apresentacao.apresentador (id PK, criado_por_id FK opcional, nome, cargo, biografia, foto_url, topicos JSONB, midias_extras JSONB) [Catálogo institucional global de autoridades e palestrantes]
```

### 3.2. Regra das 3 Origens do `CampoPreenchido`
1. `tipo_fonte = 'manual'`: Utiliza `valor_manual` (TEXT/String/URL). Foco primário do MVP.
2. `tipo_fonte = 'indicador'`: Utiliza `indicador_id` (FK para tabela de dados tratados).
3. `tipo_fonte = 'reuso_midia'`: Utiliza `campo_origem_id` (FK auto-referencial para outro `CampoPreenchido` de mídia pertencente a uma apresentação do **mesmo** `projeto_id`).

### 3.3. Estilização Tipográfica Individual (`campo_preenchido`) e Controles do Slide
- **Estilização Tipográfica Individual por Texto (`campo_preenchido`):**
  - Permite que cada texto do slide (título, subtítulo, citação, corpo) tenha estilo visual independente.
  - `tamanho_texto`: valor de tamanho da fonte (ex: `'32px'`, `'1.5rem'`, `'24'`).
  - `cor_texto`: cor hexadecimal restrita à paleta institucional (`#FFFFFF`, `#102A56`, `#212529`, `#0052FF`).
  - `fonte`: família tipográfica institucional (ex: `'Montserrat'`, `'Inter'`, `'Roboto'`).
- **Slots Flexíveis (Matriz 3×3):**
  - `posicao_matriz` (Ancoragem): `'top-left'`, `'top-center'`, `'top-right'`, `'mid-left'`, `'center'`, `'mid-right'`, `'bottom-left'`, `'bottom-center'`, `'bottom-right'`.
  - `config_json`: ODS (`{"arranjo": "linha"|"grade", "selos": [1, 4, 11]}`), QR Code (`{"url": "https://..."}`), Logos/Bandeiras (`{"logos": ["prefeitura", "cit", "sp", "brasil"]}`).
- **Controles Visuais do Slide (`slide`):**
  - `alinhamento_texto`: `'left'` (padrão), `'center'`, `'right'`, `'justify'`.
  - `filtro_fundo`: `'nenhum'` (padrão), `'escurecer'`, `'borrar'`.
  - `estilo_fundo`: `'full_scrim'` (overlay escuro de legibilidade WCAG sobre foto) ou `'contained'` (área parcial/card).

### 3.4. Dicionário de Dados Técnico e Regras de Uso (MVP)

| Tabela | Schema | Colunas Principais | Propósito & Regras de Uso |
| :--- | :--- | :--- | :--- |
| **`usuario`** | `login` | `id` (PK), `nome`, `email` (UNIQUE), `admin` (BOOL), `status` (BOOL) | Registro de servidores com acesso. `status=True` indica conta ativa. Autenticação via Flask-Login. |
| **`senha`** | `login` | `usuario_id` (PK/FK `usuario.id`), `senha` (VARCHAR 255) | Relação 1:1 estrita. Armazena apenas o hash Bcrypt. NUNCA texto puro. |
| **`projeto`** | `apresentacao` | `id` (PK), `usuario_id` (FK `usuario.id`), `nome`, `descricao`, `capa_url` | Pasta temática que delimita o agrupamento e o escopo de reuso de mídia. Um usuário tem vários projetos. |
| **`apresentacao`** | `apresentacao` | `id` (PK), `projeto_id` (FK `projeto.id`), `nome`, `categoria_id` (FK opcional), `data_criacao` (TIMESTAMP) | Arquivo de apresentação executável. Contém múltiplos slides ordenados. Pertence a 1 projeto. |
| **`slide`** | `apresentacao` | `id` (PK), `apresentacao_id` (FK `apresentacao.id`), `template_id` (FK `template.id`), `ordem` (INT), `alinhamento_texto`, `filtro_fundo`, `estilo_fundo` | Página individual. Controla ordenação e enquadramento de plano de fundo da página. |
| **`template`** | `apresentacao` | `id` (PK), `nome`, `codigo` (UNIQUE VARCHAR 50), `descricao` | Tabela de referência/lookup estática (7 templates fixos: `capa`, `imagem_texto`, `indicadores`, `grafico`, `mapa`, `video`, `encerramento`). |
| **`campo_preenchido`** | `apresentacao` | `id` (PK), `slide_id` (FK `slide.id`), `chave_campo`, `tipo_fonte`, `valor_manual`, `indicador_id`, `campo_origem_id` (FK auto-relacional), `tamanho_texto`, `cor_texto`, `fonte` | Modelo EAV. Armazena conteúdos dos slots, reuso de mídias e formatação tipográfica individual (`tamanho_texto`, `cor_texto`, `fonte`). |
| **`slot_flexivel`** | `apresentacao` | `id` (PK), `slide_id` (FK `slide.id`), `tipo_elemento`, `posicao_matriz`, `config_json` (JSONB) | Elementos sobrepostos (ODS, QR Code gerado em tempo real por URL, logos/bandeiras) ancorados na matriz 3×3. |
| **`ods`** | `apresentacao` | `id` (PK), `numero` (UNIQUE INT 1-17), `titulo` (VARCHAR 150), `descricao` (TEXT), `icone_url` (VARCHAR 255), `cor_hex` (VARCHAR 10) | Catálogo oficial dos 17 Objetivos de Desenvolvimento Sustentável da ONU. Alimenta os badges dos slots flexíveis. Populada via seed. |
| **`apresentador`** | `apresentacao` | `id` (PK), `criado_por_id` (FK opcional `usuario.id`), `nome`, `cargo`, `biografia`, `foto_url`, `topicos` (JSONB), `midias_extras` (JSONB) | Catálogo institucional COMPARTILHADO e GLOBAL de palestrantes, secretários e autoridades. `topicos` armazena lista de destaques (`[{"destaque": "+27 anos", "rotulo": "Na política"}]`). `midias_extras` armazena inovações (`[{"tipo": "Avatar", "titulo": "...", "url": "..."}]`). Visível globalmente para todos os usuários no template de Perfil/Bio. |

### 3.5. Backlog de Dados e Pendências Futuras (Issue #29 & Próximas Entregas)

Os itens abaixo foram formalizados e mapeados, divididos entre a próxima entrega e extensões futuras:
1. **Modelar tabela de Indicadores / Dados Tratados (`apresentacao.indicador`):**
   - *Estrutura planejada:* `id` (PK), `nome`, `valor`, `fonte`, `data_referencia`, `categoria_id`.
   - *Status:* Prioridade da próxima entrega (base para alimentação dinâmica de slides via `campo_preenchido.indicador_id`).
2. **Modelar estrutura de Pontos do Mapa (`apresentacao.ponto_mapa`):**
   - *Estrutura planejada:* `id` (PK), `slide_id` (FK), `latitude`, `longitude`, `titulo`, `descricao`, `indicador_id` (FK opcional).
   - *Status:* Prioridade da próxima entrega (para o template específico de mapa municipal Leaflet.js).
3. **Colaboradores por Projeto (`apresentacao.projeto_colaborador`):**
   - *Estrutura planejada:* Tabela associativa N:N com `papel` (`'editor'` ou `'visualizador'`).
   - *Status:* Pós-MVP (no MVP apenas o criador `usuario_id` gerencia seu projeto).

### 3.6. Matriz de Sincronização em Tempo Real (Banco x Backend)

| Tabela | Schema | Status no Supabase | Ação Atual da Equipe de Dados | Impacto no Backend |
| :--- | :--- | :--- | :--- | :--- |
| **`usuario`** | `login` | 🟢 Ativa no banco | Estrutura concluída (com `status` boolean). | Liberado para rotas de autenticação e sessão. |
| **`senha`** | `login` | 🟢 Ativa no banco | Estrutura 1:1 concluída com Bcrypt. | Liberado para validação de login. |
| **`projeto`** | `apresentacao` | 🟢 Ativa no banco | Estrutura concluída (pasta e reuso). | Liberado para CRUD de projetos. |
| **`apresentacao`** | `apresentacao` | 🟢 Ativa no banco | Estrutura concluída (arquivos de slides). | Liberado para CRUD de apresentações. |
| **`template`** | `apresentacao` | 🟢 Ativa no banco | Populada com os 7 templates fixos via seed. | Liberado para dropdowns de seleção de template. |
| **`slide`** | `apresentacao` | 🟢 Codificada em `models.py` | Configurações de fundo (`filtro_fundo`, `estilo_fundo`) e alinhamento (`alinhamento_texto`). Tipografia transferida para `campo_preenchido`. | Backend deve salvar os controles de fundo nos endpoints de slide. |
| **`slot_flexivel`** | `apresentacao` | 🟢 Codificada em `models.py` | Suporte a ODS, QR Code e Logos sobrepostos na matriz 3×3 via JSONB. | Backend pode montar endpoints para ancorar elementos. |
| **`campo_preenchido`** | `apresentacao` | 🟢 Codificada em `models.py` | Suporte a preenchimento manual, reuso de mídias e estilização tipográfica individual (`tamanho_texto`, `cor_texto`, `fonte`). | Backend utilizará para salvar o conteúdo e estilo tipográfico dos templates. |
| **`ods`** | `apresentacao` | 🟢 Ativa e Semeada | Populada com os 17 selos da ONU, cores hex e URLs web oficiais em português. | Liberada para consumo em dropdowns/switches de slots flexíveis. |
| **`apresentador`** | `apresentacao` | 🟢 Codificada em `models.py` | Catálogo global de autoridades com `topicos` e `midias_extras` em JSONB. | Liberada para rotas do catálogo de autoridades e template Perfil/Bio. |

### 3.7. Próxima Entrega de Dados (Roadmap Imediato)
* **`apresentacao.indicador`:** Tabela de dados tratados socioeconômicos e operacionais do município (`id`, `nome`, `valor`, `fonte`, `data_referencia`, `categoria_id`).
* **`apresentacao.ponto_mapa`:** Marcadores de geolocalização com coordenadas e descrições para o Leaflet.js.

---

## 4. CONVENÇÕES ESTREITAS E PREVENÇÃO DE BUGS (GUARDRAILS)

### 4.1. Regra Crítica do `url_for` em Blueprints
```python
# Declarado em routes/auth.py:
auth_bp = Blueprint('auth_modulo', __name__)

# CORRETO (Usar o valor da string do 1º argumento):
url_for('auth_modulo.login')

# INCORRETO (NUNCA usar o nome da variável Python):
url_for('auth_bp.login') # ERRO! BREAKS ROUTING!
```

### 4.2. Inviolabilidade do Login
Nenhuma refatoração em `models.py` ou rotas pode quebrar o funcionamento do login existente (`Flask-Login` + `Flask-Bcrypt`).
- Validação de senha: `bcrypt.check_password_hash(senha_banco, senha_digitada)`. NUNCA usar `==`.

### 4.3. Herança Jinja2 Restrita e Reuso Máximo de HTML/CSS
- Proibido duplicar `<head>`, Bootstrap, Navbar ou Footer em templates de página.
- Todo template filho deve usar `{% extends 'landing/base_site.html' %}` (ou `app/base_app.html`) e preencher `{% block content %}`.
- **Princípio de Reuso Máximo (Base vs. Filhos):** O motor Jinja2 deve ser utilizado em sua capacidade máxima de reuso e herança com HTML e CSS. Tudo o que for padrão e compartilhado (layout global, sidebar, navbar, footer, variáveis CSS `:root`, classes utilitárias, componentes repetidos e regras CSS padrão) **DEVE estar na base e nos estilos globais**. O HTML e o CSS dos templates filhos devem **apenas adicionar** novos elementos e regras exclusivas da tela, sendo **estritamente proibido reescrever ou duplicar regras já padronizadas na base**.

---

## 5. PROTOCOLO DE EXECUÇÃO EM 4 PASSO PARA A IA

Para qualquer solicitação de código ou alteração de arquivos pelo usuário, a IA DEVE seguir o fluxo:

1. **Entender:** Explicar o conceito, o objetivo e os componentes afetados.
2. **Planejar:** Listar explicitamente todos os arquivos a criar/modificar, rotas e modelos.
3. **Implementar Didaticamente:** Fornecer código modular, limpo, 100% comentado e explicando o porquê de cada decisão.
4. **Revisar:** Validar conformidade com este PDD (segurança, ORM, escopo e convenções).

---
*PDD Especificação IA v2.0 — Fonte da verdade técnica para assistentes LLM.*
