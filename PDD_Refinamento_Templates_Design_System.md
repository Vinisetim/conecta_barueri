# PDD — Refinamento de Templates, Design System e Especificação do Editor

## Conecta Barueri — Engenharia Reversa dos Slides Reais (Canva) e Matriz de Gaps

> **Status:** Documento Oficial de Especificação Visual e Funcional  
> **Base de Referência:** Análise estrutural das apresentações oficiais do CIT no Canva (*SIT Barueri 2025*, *Apresentação Metaverso* e *Apresentação UNIP*).  
> **Destinatários:** Equipe Conecta Barueri (Vinicius, Marianna, Lucas, Belloni) e Assistentes de IA.

---

## 1\. INTRODUÇÃO E OBJETIVO

O propósito do Conecta Barueri não é apenas reproduzir apresentações estáticas, mas sim fornecer uma **plataforma de autoria e governança visual institucional**. Qualquer servidor da Prefeitura deve ser capaz de **criar e recriar slides no exato padrão visual dos materiais de alta fidelidade do CIT**, utilizando templates estruturados que impedem quebras de layout, desalinhamentos ou perda da identidade oficial.

A partir da extração dos dados técnicos e dos layouts dos 81 slides das apresentações oficiais de Barueri no Canva, este documento estabelece:

1. O **Design System Oficial** (cores exatas, tipografia, proporções e contrastes).  
2. O **Catálogo Refinado de Templates** (ajustes nos 8 existentes \+ 2 novos modelos identificados nos materiais reais).  
3. A **Especificação dos Controles do Editor** para cada template.  
4. A **Matriz de Gap Analysis** comparando minuciosamente o código atual do repositório com o que precisa ser entregue.

---

## 2\. DESIGN SYSTEM OFICIAL (TOKENS EXTRAÍDOS DO CANVA)

### 2.1. Canvas e Proporção

* **Resolução Padrão:** `1920 × 1080 px` (Proporção `16:9` Widescreen).  
* **Grid de Segurança:** Margens internas de respiro de `60px` (topo, base, esquerda e direita).  
* **Container Query:** No editor e na apresentação, o canvas deve preservar a relação de aspecto `16:9` em qualquer viewport através de `aspect-ratio: 16/9;`.

### 2.2. Paleta de Cores Homologada

| Token / Variável CSS | Valor HEX | Amostra / Função Semântica | Aplicação nos Slides Reais |
| :---- | :---: | :---- | :---- |
| `--cb-bg-white` | `#FFFFFF` | Branco Puro (Fundo padrão e texto em fotos) | Usado em 240+ elementos dos slides do Canva. |
| `--cb-text-dark` | `#414042` | Cinza Chumbo Corporativo (Texto primário) | Títulos e parágrafos sobre fundos claros (elimina o contraste agressivo do `#000`). |
| `--cb-text-muted` | `#64748B` | Cinza Neutro Secundário | Subtítulos, rótulos de métricas e descrições curtas. |
| `--cb-navy-primary` | `#0C2E4E` | Azul Marinho CIT (Cor institucional master) | Faixa superior de cabeçalho, cards de destaque e fundos de abertura. |
| `--cb-blue-accent` | `#0052FF` | Azul Royal Conecta Barueri | Acentos visuais, botões, ícones, números de destaque e bordas ativas. |
| `--cb-cyan-light` | `#39AFD3` | Azul Ciano / Tecnologia | Subtítulos secundários, tags de eventos e gráficos. |
| `--cb-green-ods` | `#039967` | Verde Esmeralda Sustentável | Destaques de sustentabilidade, ODS 11/12, árvores salvas e indicadores positivos. |
| `--cb-orange-accent` | `#F79646` | Laranja Governamental | Métricas financeiras economizadas, alertas e novos lançamentos. |
| `--cb-purple-tech` | `#8C52FF` | Roxo / Violeta Inovação | Exclusivo dos slides do *Metaverso*, robótica e ambientes virtuais. |
| `--cb-card-bg` | `#F8FAFD` | Cinza Gelo Suave | Fundo de cards de indicadores e blocos de conteúdo com borda `#E2E8F0`. |
| `--cb-scrim-dark` | `rgba(12, 46, 78, 0.72)` | Overlay Protetor de Fotos | Máscara sobre fotografias para garantir conformidade WCAG nos textos brancos. |

### 2.3. Tipografia e Escala Tipográfica Oficial

O Canva utiliza a família proprietária *Canva Sans*. No Conecta Barueri, utilizamos o pareamento equivalente do Google Fonts:

* **Família Primária (Títulos e Números de Destaque):** `Montserrat` (Pesos: 700 Bold e 800 Extra-Bold).  
* **Família Secundária (Textos, Rótulos e Parágrafos):** `Inter` (Pesos: 400 Regular, 500 Medium e 600 Semi-Bold).

#### Escala de Tamanhos para Canvas 1920×1080 (convertida para CSS responsivo via `cqw` / `px`):

* **Título Master (Capa / Abertura):** `48px` a `58px` \| `font-weight: 800` \| `line-height: 1.15` \| `letter-spacing: -0.5px`.  
* **Título de Slide Interno:** `32px` a `38px` \| `font-weight: 700` \| `line-height: 1.25`.  
* **Subtítulo / Tagline:** `18px` a `24px` \| `font-weight: 500` \| `line-height: 1.35` \| `color: --cb-text-muted`.  
* **Grande Número de Indicador:** `64px` a `96px` \| `font-weight: 800` \| `line-height: 1.0` \| `color: --cb-blue-accent`.  
* **Rótulo / Descrição do Indicador:** `12px` a `14px` \| `font-weight: 600` \| `text-transform: uppercase` \| `letter-spacing: 0.5px`.  
* **Corpo de Texto / Descrição Conceitual:** `14px` a `16px` \| `font-weight: 400` \| `line-height: 1.55`.  
* **Metadado de Rodapé (Fonte e Data):** `10px` a `11px` \| `font-weight: 400` \| `font-style: italic` \| `color: #94A3B8`.

---

## 3\. CATÁLOGO REFINADO DE TEMPLATES (8 HOMOLOGADOS \+ 2 RECOMENDADOS)

A inspeção nos materiais do Canva revelou que as apresentações oficiais de Barueri orbitam em torno de 10 estruturas visuais claras. A seguir, a anatomia de cada uma e o que o editor precisa fornecer:

---

### Template 1: Capa / Abertura Institucional (`capa`)

* **Uso Real no Canva:** Slide 1 da SIT 2025 (*"Inovação em Ação"*), Slide 6 (*"Barueri sem Papel"*), Slide 15 (*"Barueri no Metaverso"*).  
* **Variações Estruturais:**  
  1. *Capa Geral de Apresentação:* Título de impacto, subtítulo institucional, foto de fundo com máscara escura (*scrim*), logotipo oficial da Prefeitura de Barueri e CIT.  
  2. *Capa / Divisor de Projeto:* Usado para introduzir um projeto municipal dentro de um deck. Fundo limpo ou foto temática, título do projeto centralizado, tagline e badge da secretaria responsável.  
* **Elementos Fixos no Canvas:**  
  - Header Strip ou logos no topo.  
  - Bloco de Título e Subtítulo com botões de alinhamento (Esquerda, Centro).  
  - Slot flexível de ODS alinhado no canto inferior direito.  
* **Controles no Editor (Sidebar Direita):**  
  - Switch: *Tipo de Capa* (`Geral de Apresentação` vs. `Divisor de Projeto`).  
  - Input: *Título Principal* (com seletor de cor: Branco, Azul Marinho ou Azul Barueri).  
  - Textarea: *Subtítulo / Descrição Curta*.  
  - Upload / URL: *Imagem de Fundo*.  
  - Select: *Filtro de Contraste* (`Máscara Escura Azul Marinho`, `Máscara Clara Translúcida`, `Nenhum`).  
  - Switches de Acessórios: `Logos Institucionais`, `Selo ODS`, `QR Code`.

---

### Template 2: Imagem \+ Texto Conceitual (`imagem_texto`)

* **Uso Real no Canva:** Slide 7 (*"O projeto visa trazer mais agilidade..."*), Slide 11 (*"Internet Social \- Disponibilizar internet..."*).  
* **Anatomia Visual:**  
  - Layout dividido em duas seções balanceadas (50%/50% ou 40%/60%).  
  - Lado A: Imagem em container com cantos arredondados (`border-radius: 12px`), sombra suave e proporção 4:3 ou 16:9.  
  - Lado B: Título da iniciativa, parágrafo conceitual bem diagramado e lista opcional de 2 a 3 pontos-chave com bullets/ícones azuis.  
* **Controles no Editor (Sidebar Direita):**  
  - Input: *Título da Seção*.  
  - Textarea: *Texto Conceitual*.  
  - Upload / URL: *Imagem em Destaque*.  
  - Radio: *Disposição da Imagem* (`Imagem à Esquerda` vs. `Imagem à Direita`).  
  - Switch: *Lista de Destaques* (permite adicionar até 3 itens curtos com ícones).  
  - Rodapé: Selos ODS e carimbo de fonte.

---

### Template 3: Indicadores e Métricas de Impacto (`indicadores`)

* **Uso Real no Canva:** Slide 8 (*"Mil Processos Digitais"*, *"Árvores Salvas"*, *"265 Milhões de Litros de Água"*), Slide 11 (*"+3.473 Famílias Atendidas"*).  
* **Anatomia Visual:**  
  - Barra de Título superior com resumo contextual.  
  - Grade responsiva de **2, 3 ou 4 cards de métricas**.  
  - Cada card possui:  
    - Número gigante em destaque (`64px` a `80px`, cor institucional).  
    - Prefixo/Sufixo configurável (ex: `+`, `Milhões`, `km²`, `R$`, `%`).  
    - Rótulo descritivo em caixa alta.  
    - Ícone temático discreto.  
  - **Carimbo Obrigatório de Auditoria:** Legenda no canto inferior esquerdo: *"Fonte: Dados do BI coletados em DD/MM/AAAA"*.  
* **Controles no Editor (Sidebar Direita):**  
  - Input: *Título do Painel*.  
  - Select: *Quantidade de Cards* (`2 Cards Grandes`, `3 Cards`, `4 Cards em Grade 2x2`).  
  - Para cada Card:  
    - Origem do Dado: Radio (`Manual` vs. `Dinâmico via Base Municipal CIT`).  
    - Se Manual: Campos de *Valor*, *Sufixo/Prefixo* e *Descrição*.  
    - Se Dinâmico: Dropdown selecionando a métrica tratada da tabela `indicador`.  
  - Input: *Carimbo de Fonte e Data da Coleta*.

---

### Template 4: Gráfico Quantitativo \+ Análise Textual (`grafico`)

* **Uso Real no Canva:** Comparativos de evolução temporal (linhas) e distribuição por secretaria/atendimento (barras).  
* **Anatomia Visual:**  
  - Lado Esquerdo (65% da largura): Gráfico interativo renderizado via **Chart.js** (linhas com gradiente suave ou barras com bordas arredondadas).  
  - Lado Direito (35% da largura): Card corporativo com o resumo analítico: total acumulado no período, percentual de crescimento e texto interpretativo dos dados.  
* **Controles no Editor (Sidebar Direita):**  
  - Input: *Título do Gráfico*.  
  - Select: *Tipo de Gráfico* (`Linhas com Preenchimento`, `Barras Verticais`, `Barras Horizontais`).  
  - Select: *Métrica Vinculada* (conecta à tabela `indicador` com séries históricas).  
  - Input: *Período de Referência* (ex: *"Últimos 12 meses"*, *"Série Histórica 2023-2026"*).  
  - Textarea: *Texto de Análise / Insight*.

---

### Template 5: Mapa Territorial de Barueri (`mapa`)

* **Uso Real no Canva:** Slide 5 da SIT 2025 (*"65,701 km² de Área Territorial"*, fibra ótica, câmeras distribuídas).  
* **Anatomia Visual:**  
  - Lado Central/Esquerdo: Mapa vetorial interativo de Barueri via **Leaflet.js** com os limites municipais destacados.  
  - Pins interativos nos bairros/equipamentos (Centro, Alphaville, Silveira, Engenho Novo, etc.).  
  - Lado Direito / Overlay: Painel flutuante com dados territoriais consolidados da cidade.  
* **Controles no Editor (Sidebar Direita):**  
  - Input: *Título do Mapa*.  
  - Radio: *Escala Territorial* (`Município de Barueri` vs. `Estado de São Paulo` vs. `Brasil`).  
  - Seletor de Categoria dos Pins: `Câmeras de Segurança`, `Pontos de Wi-Fi / Fibra`, `Unidades Básicas de Saúde`, `Escolas Conectadas`.  
  - Seletor de Pins: Checkbox para adicionar até 5 locais no mapa.

---

### Template 6: Vídeo Institucional e Mídias Digitais (`video`)

* **Uso Real no Canva:** Slide 23 (*"TV Inovação Barueri Podcast e Rádio"*, canais de streaming, YouTube).  
* **Anatomia Visual:**  
  - Player centralizado em container de vidro/card escuro com proporção 16:9.  
  - Suporte a embed de vídeo (YouTube/Vimeo) ou player nativo MP4.  
  - Faixa inferior com 3 métricas de audiência (ex: *"+1M Visualizações"*, *"+40 Canais"*, *"+180k Impressões"*).  
* **Controles no Editor (Sidebar Direita):**  
  - Input: *Título do Vídeo / Mídia*.  
  - Input: *URL do Vídeo* (YouTube, Vimeo ou arquivo MP4).  
  - Textarea: *Sinopse / Descrição da Transmissão*.  
  - Switch: *Exibir Métricas de Mídia* (3 cards rápidos de visualizações, canais e alcance).

---

### Template 7: Apresentador / Perfil de Autoridade (`apresentador`)

* **Uso Real no Canva:** Slide 2 da UNIP (*"Conheça Randal, Jonatas — Secretário Municipal de Inovação e Tecnologia"*).  
* **Anatomia Visual:**  
  - Coluna Esquerda: Foto oficial institucional em card com moldura e badge de cargo/secretaria.  
  - Coluna Direita:  
    - Nome completo da autoridade.  
    - Minibiografia profissional oficial.  
    - Grid de 4 badges de conquistas históricas (ex: *"+27 anos na política"*, *"Criador do Barueri sem Papel"*, *"+20 prêmios"*, *"1º Secretário do Metaverso"*).  
* **Controles no Editor (Sidebar Direita):**  
  - Select: *Importar Autoridade Cadastrada* (puxa da tabela `apresentacao.apresentador` com 1 clique).  
  - Ou Edição Manual: *Nome*, *Cargo*, *Secretaria*, *Biografia* e *Upload da Foto*.  
  - Lista de Conquistas: 4 inputs para os tópicos de destaque.

---

### Template 8: Encerramento Institucional (`encerramento`)

* **Uso Real no Canva:** Slide 26 da SIT 2025 e Slide 36 da UNIP (*"OBRIGADO"*).  
* **Anatomia Visual:**  
  - Layout limpo, sóbrio e simétrico.  
  - Grande título *"OBRIGADO"* em azul institucional (`#0052FF`) ou branco sobre fundo marinho.  
  - Subtítulo de agradecimento aos participantes/banca.  
  - QR Code de acesso ao portal oficial da prefeitura.  
  - Logotipos oficiais de apoio no rodapé (Prefeitura, CIT, Inovação, ONUBR).  
  - Linha de copyright oficial: *"@Copyright 2026 \- Prefeitura Municipal de Barueri \- CIT \- Todos os direitos reservados"*.  
* **Controles no Editor (Sidebar Direita):**  
  - Input: *Mensagem Principal* (Padrão: "OBRIGADO").  
  - Textarea: *Mensagem de Fechamento / Contatos*.  
  - Input: *Link para geração do QR Code*.  
  - Switches de Logos de Apoio e Selos ODS.

---

### ⭐️ NOVO Template 9: Módulos e Pilares do Projeto (`modulos_pilares`) — *Recomendado*

* **Origem da Necessidade no Canva:** Slide 13 (*"Centro Tecnológico \- Incubadora, Pré-Incubadora, Coworking, Smartlab"*) e Slide 16 (*"AAI \- 5 Ambientes, 4 Cursos, 18 Departamentos"*).  
* **Por que é necessário:** O template atual de `indicadores` só suporta números. O CIT possui dezenas de slides que apresentam os **pilares de um projeto** (títulos, ícones e pequenas descrições de departamentos ou etapas).  
* **Anatomia:**  
  - Título do Projeto e resumo no topo.  
  - Grid de **3 a 6 cards organizados** (ex: 3 colunas x 2 linhas).  
  - Cada card possui: Ícone temático, Título do Módulo e Descrição de 2 linhas.  
* **Controles no Editor:**  
  - Input: *Título do Projeto*.  
  - Repetidor de Módulos (adicionar de 3 a 6 pilares com ícone, nome e breve texto).

---

### ⭐️ NOVO Template 10: Prêmios e Reconhecimentos (`premios_marcos`) — *Recomendado*

* **Origem da Necessidade no Canva:** Slide 4 da SIT 2025 e Slide 15 do Metaverso (*"Ranking Smart Cities 2025"*, *"Prêmio GFHS"*, *"InovaCidade"*).  
* **Por que é necessário:** O CIT utiliza exaustivamente a lista de premiações nacionais e internacionais para validar a autoridade de Barueri perante o público externo e bancas.  
* **Anatomia:**  
  - Título: *"Prêmios e Reconhecimentos Oficiais"*.  
  - Grid de 3 a 4 troféus/selos: Nome do Prêmio, Ano, Entidade Concedente e Badge da Categoria.

---

## 4\. MATRIZ DE GAP ANALYSIS (CÓDIGO ATUAL vs. ESPECIFICAÇÃO FINAL)

Abaixo está o raio-x exato da discrepância entre o que está codificado no repositório hoje e o que precisa ser entregue para a Banca Final:

| Componente / Módulo | O Que Temos no Código Atual | O Que Falta / GAP Técnico | Arquivo Afetado | Ação Necessária |
| :---- | :---- | :---- | :---- | :---- |
| **Templates no Banco** | 8 templates no `models_scripts/03_seed_templates.py`. | Tabela `templates` existe, mas não inclui os templates recomendados 9 e 10\. | `models_scripts/03_seed_templates.py` | Adicionar `modulos_pilares` e `premios_marcos` no seed. |
| **Templates no Editor (Canvas)** | Apenas 5 templates renderizados (`capa`, `imagem_texto`, `indicadores`, `grafico`, `mapa`). | **Faltam 3 templates homologados** (`video`, `apresentador`, `encerramento`) e os 2 novos. | `criar-apresentacao.html`, `criar-apresentacao.js` | Implementar os blocos HTML/JS de renderização dos 5 templates pendentes. |
| **Painel de Configuração (Sidebar)** | Controles básicos de título, subtítulo e switches de ODS/QR. | Não possui controles específicos para os templates de vídeo, bio do apresentador, seleção de colunas e cores institucionais. | `criar-apresentacao.html`, `criar-apresentacao.js` | Criar os painéis de inputs contextuais que alternam conforme o template ativo. |
| **Ancoragem Matricial 3×3** | Modelado conceitualmente no PDD e na coluna `posicao_matriz`. | No JS atual, ODS e QR Code estão fixados em coordenadas CSS estáticas (`bottom: 1.5cqw; right: 1.5cqw`). | `criar-apresentacao.js`, `apresentacao.css` | Criar o componente visual 3x3 na sidebar e aplicar classes dinâmicas (`pos-top-left`, `pos-bottom-right`). |
| **Carimbo de Coleta dos Dados** | Inexistente no canvas. | Slides de indicadores e gráficos precisam exibir a legenda de auditoria (*"Fonte: Base CIT \- Coleta em DD/MM/AAAA"*). | `criar-apresentacao.html`, `criar-apresentacao.js` | Adicionar input de fonte/data e renderizá-lo no rodapé do canvas. |
| **Indicadores Dinâmicos** | Mock local em JS (`INDICADORES_PREDEFINIDOS`). | Não há chamada `fetch()` real buscando os indicadores da tabela `apresentacao.indicador` do PostgreSQL. | `apresentacao.py`, `criar-apresentacao.js` | Criar endpoint `GET /api/indicadores/lista` e popular o dropdown do editor dinamicamente. |
| **Link Público de Compartilhamento** | Inexistente (todas as rotas exigem `@login_required`). | Não existe rota pública para visualização sem login exigida pela cliente. | `routes/apresentacao.py` | Criar rota `GET /p/<int:id>` sem `@login_required` renderizando apresentação limpa. |
| **Aba Projetos como Kits** | Aba de projetos lista pastas genéricas. | A tela `/projetos` não funciona como o catálogo de iniciativas municipais (kits de slides). | `routes/projetos.py`, templates de projetos | Separar *Pastas de Apresentações* de *Projetos Modulares Homologados*. |
| **Reúso em Lote no Editor** | Reúso copia apenas 1 slide avulso. | Não há botão para importar de uma vez todos os slides de um projeto municipal cadastrado. | `criar-apresentacao.js` | Implementar no modal de reúso a função `importarProjetoCompleto(projetoId)`. |
| **Performance e Cache** | Consultas repetidas ao Supabase gerando lentidão. | Sem cache em memória para os templates e ODS, tornando a navegação pesada. | `app/__init__.py`, `routes/apresentacao.py` | Adicionar cache em memória para dados estáticos imutáveis. |

---

## 5\. PLANO DE AÇÃO PARA IMPLEMENTAÇÃO DOS GAPS

### 5.1. Para Lucas e Belloni (Frontend e Backend)

1. **Completar os Templates no Canvas:** Adicionar os containers HTML e funções de renderização para `video`, `apresentador`, `encerramento` e `modulos_pilares` em `criar-apresentacao.html` e `criar-apresentacao.js`.  
2. **Componente do Seletor 3×3:** Transformar os switches de ODS e QR Code em seletores que alteram as classes de quadrante no canvas.  
3. **Link Público (`/p/<id>`):** Implementar a rota pública no Flask sem login e com tela cheia automática.  
4. **Endpoint de Indicadores:** Criar a rota `GET /api/indicadores` para abastecer o seletor de dados dinâmicos do editor.

### 5.2. Para Marianna (Design e UX)

1. **Especificação dos Cards de Projetos:** Desenhar a listagem da aba *Projetos* com visual limpo de catálogo (badge de secretaria, ODS vinculados e contador de slides do kit).  
2. **Interface do Modal de Reúso:** Desenhar a separação visual entre *"Reutilizar Slide Individual"* e *"Importar Projeto Completo"*.  
3. **Revisão Fina de Fontes e Espaçamentos:** Ajustar as margens do canvas para coincidir perfeitamente com os `60px` de respiro observados no Canva.

### 5.3. Para Vinicius (Banco, Dados e Validação)

1. **Atualizar Seeds com os Slides Reais do Canva:** No script `models_scripts/07_seed_projeto_vitrine.py`, cadastrar os kits de slides reais extraídos (Barueri sem Papel, Internet Social, Metaverso e Perfil do Secretário).  
2. **Conexão com a Base de Transparência do CIT:** Dar andamento ao contato com a Erika para obter a réplica do banco ou espelhar os dados oficiais na tabela `indicador`.  
3. **Validação das Rotas e Performance:** Homologar o tempo de carregamento com cache e auditar a segurança do link público.

---

*Este documento é a especificação técnica e visual definitiva para equiparar o Conecta Barueri aos padrões de design corporativo da Prefeitura.*