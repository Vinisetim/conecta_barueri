# GAP Analysis e Plano de Próximos Passos — Conecta Barueri

## Do Protótipo Atual à Versão Final Homologada da Banca

> **Documento Estratégico e de Engenharia**  
> **Status:** Ativo / Guia de Execução da Reta Final  
> **Público:** Vinicius (DB/Dados), Marianna (Design), Lucas e Belloni (Full-Stack)

---

## 1\. O GRANDE GAP CONCEITUAL: O QUE É "PROJETO"?

O principal desalinhamento entre o que a equipe codificou até a pré-banca e o que a cliente (Érika \- CIT) realmente necessita está na definição da palavra **"PROJETO"**:

### Como está no código hoje:

- No banco e nas rotas atuais, a entidade `Projeto` foi tratada como uma **"Pasta de Apresentações"**.  
- O usuário entra na tela `/projetos`, clica em *"Novo Projeto"*, dá um nome (ex: *"Apresentações do 2º Semestre"*) e cria apresentações dentro dessa pasta.  
- **O problema:** Isso não resolve a dor do CIT\! A Érika não precisa de um organizador de pastas no servidor.

### O que o CIT e o Negócio REALMENTE exigem:

- Para o CIT, um **"Projeto"** é uma **Iniciativa Municipal Oficial** (ex: *Coworking no Metaverso*, *Barueri Sem Papel*, *Internet Social*, *Chatbot de IA*).  
- Essas iniciativas são as mesmas em todas as secretarias e eventos.  
- A dor da Érika: *"O projeto Metaverso aparece em duas apresentações diferentes e eu tenho que reconstruir os slides dele do zero toda vez"*.  
- **A Solução:** Um Projeto é um **Kit Padronizado de Slides (2 a 3 slides)** cadastrado no acervo do Conecta Barueri. Ao criar qualquer apresentação, o usuário simplesmente clica em **"Importar Projeto"**, seleciona *Metaverso*, e os 2 a 3 slides daquele projeto entram formatados na apresentação atual\!

### Como transformar sem quebrar o código existente:

1. **Separar Conceitos no Banco:**  
   - As apresentações continuam podendo ter uma tag/campo `pasta_categoria` para quem quiser organizar seus arquivos.  
   - A tabela `projeto` passa a representar a **Iniciativa Municipal Homologada** (com campos: `nome`, `secretaria_principal`, `resumo`, `foto_url`, `destaques`, `beneficios`, `status`, `data_implantacao`).  
2. **Atualizar a Tela `/projetos`:**  
   - Em vez de listar pastas genéricas vazias, a tela `/projetos` passa a ser a **Vitrine / Catálogo de Iniciativas de Barueri** (com cards elegantes, fotos reais, secretaria responsável, ODS alinhados e botão *"Visualizar Kit de Slides"*).  
3. **No Editor (`criar-apresentacao.js`):**  
   - O modal de reúso ganha a funcionalidade **"Importar Kit de Projeto"**: o usuário escolhe a iniciativa e o sistema injeta os slides pré-formatados no deck ativo.

---

## 2\. O SLIDE DE BIO/PERFIL DO APRESENTADOR (REÚSO GLOBAL)

Assim como os projetos municipais, as **autoridades e palestrantes da Prefeitura** (ex: *Jonatas Randal \- Secretário de Inovação e Tecnologia*, diretores de departamento e gestores) são apresentados em dezenas de eventos diferentes.

### Especificação do Perfil:

- **Entidade no Banco:** Tabela `apresentador` contendo:  
  - `nome` (ex: "Jonatas Randal");  
  - `cargo` (ex: "Secretário Municipal de Inovação e Tecnologia");  
  - `secretaria` (ex: "Centro de Inovação e Tecnologia \- CIT");  
  - `foto_url` (foto oficial com fundo transparente ou institucional);  
  - `biografia` (minibiografia oficial padronizada);  
  - `conquistas` (array JSON com até 4 tópicos históricos: ex: *"+27 anos de experiência pública"*, *"Criador do Barueri Sem Papel"*, *"+20 prêmios nacionais"*).  
- **Como Funciona no Editor:**  
  - O template `apresentador` possui um select no topo: **"Carregar Perfil Salvo"**.  
  - Ao selecionar *"Jonatas Randal"*, o slide preenche automaticamente a foto, nome, biografia e conquistas.  
  - Se for um novo palestrante, o usuário pode digitar os dados e marcar a opção *"Salvar este perfil no acervo institucional"*.

---

## 3\. MATRIZ DETALHADA DE GAPS (ATUAL vs. ALVO)

| Camada / Arquivo | Como Está Hoje (Pré-Banca) | Como Tem Que Ficar (Banca Final) | Responsável |
| :---- | :---- | :---- | :---- |
| **Banco de Dados**<br>`models.py` | Tabela `projeto` com modelo de pasta. Sem tabela para perfis de apresentadores. | Entidade `Projeto` com campos do Portal SIT e tabela `Apresentador` para biografias reutilizáveis. | **Vinicius** |
| **Ingestão de Dados**<br>`models_scripts/08_ingestao_portal_sit.py` | Inexistente. | Script em Python que consome o catálogo público do portal (`Portifolio.aspx`), extrai os campos e popula o banco. | **Vinicius** |
| **Templates no Editor**<br>`criar-apresentacao.html`<br>`criar-apresentacao.js` | Apenas 5 templates funcionais (`capa`, `imagem_texto`, `indicadores`, `grafico`, `mapa`). | **10 templates completos**: incluindo `video`, `apresentador`, `encerramento`, `modulos_pilares` e `premios_marcos`. | **Lucas / Belloni** |
| **Importação em Lote**<br>`criar-apresentacao.js` | Reúso copia apenas 1 slide avulso. | Modal de reúso com aba **"Importar Projeto Completo"** injetando os 2 a 3 slides do kit de uma vez. | **Lucas / Belloni** |
| **Link Público**<br>`routes/apresentacao.py` | Todas as rotas de visualização exigem `@login_required`. | Rota pública `GET /p/<int:id>` sem login, renderizando o modo tela cheia limpo. | **Lucas / Belloni** |
| **Catálogo de Projetos**<br>`routes/projetos.py`<br>`templates/projetos/` | Lista pastas de apresentações do usuário. | Vitrine institucional de iniciativas de Barueri com cards, filtros de secretaria e ODS. | **Lucas / Belloni / Marianna** |
| **Design e Identidade**<br>`apresentacao.css`<br>`style.css` | Cores e fontes genéricas. | Paleta oficial homologada (Azul CIT `#0C2E4E`, Azul Royal `#0052FF`, cinzas e fontes Montserrat \+ Inter). | **Marianna** |
| **Performance e Cache**<br>`app/__init__.py` | Consultas repetidas de templates e ODS ao Supabase gerando lentidão. | Cache em memória de dados imutáveis na aplicação Flask. | **Lucas / Belloni / Vinicius** |

---

## 4\. PLANO DE AÇÃO PASSO A PASSO (ORDEM DE EXECUÇÃO)

### Passo 1: Dados e Acervo (Vinicius)

1. Criar o script `models_scripts/08_ingestao_portal_sit.py` para extrair os projetos do portal SIT (`Portifolio.aspx`) e salvar na tabela `projeto`.  
2. Criar o script de seed para a tabela `apresentador` com o perfil oficial do Secretário Jonatas Randal e diretores.  
3. Garantir a integridade dos relacionamentos no PostgreSQL (SQLAlchemy puro, sem raw queries).

### Passo 2: Backend e Rotas (Lucas e Belloni)

1. **Link Público:** Implementar rota `GET /p/<int:id>` em `routes/apresentacao.py` retornando o template `iniciar_apresentacao.html` sem verificação de sessão.  
2. **Endpoint de Projetos:** Criar `GET /api/projetos/<int:id>/slides` retornando o JSON dos 2 a 3 slides do kit do projeto.  
3. **Endpoint de Perfis:** Criar `GET /api/apresentadores` para abastecer o select do template de autoridade.  
4. **Cache em Memória:** Armazenar `templates` e `ods` no `app.config` para eliminar queries repetitivas no banco.

### Passo 3: Frontend do Editor (Lucas, Belloni e Marianna)

1. Adicionar o HTML/CSS dos templates pendentes:  
   - `video` (player 16:9 \+ métricas);  
   - `apresentador` (foto \+ biografia \+ 4 badges);  
   - `encerramento` (agradecimento \+ QR code \+ copyright);  
   - `modulos_pilares` (grid de 3 cards de benefícios);  
   - `premios_marcos` (troféus e reconhecimentos).  
2. No modal de reúso, implementar a aba **"Projetos do CIT"**: ao clicar em *"Inserir Projeto"*, executa `fetch(/api/projetos/<id>/slides)` e adiciona os slides sequencialmente à apresentação ativa.

### Passo 4: Vitrine do Portfólio `/projetos` (Marianna, Lucas e Belloni)

1. Renderizar os cards das iniciativas municipais com foto, título, resumo curto, secretaria e tags de ODS.  
2. Adicionar modal rápido de preview dos slides do projeto.

---

## 5\. RISCOS E O QUE NÃO FAZER (BLINDAGEM DO PRAZO)

Para garantir a entrega com nota máxima em 2 semanas:

1. ⚠️ **NÃO tentar fazer web scraping em tempo de execução de request web:** A raspagem do portal SIT deve ser executada antecipadamente via script de dados (`08_ingestao_portal_sit.py`) e armazenada no banco. O usuário final consome os dados já prontos no banco local.  
2. ⚠️ **NÃO abrir liberdade drag-and-drop:** Se o usuário puder arrastar textos livremente, o design vai quebrar e o sistema perderá seu maior diferencial (governança visual corporativa).  
3. ⚠️ **NÃO criar papéis complexos de permissão:** Apenas `admin` e `usuario` comum. Qualquer complexidade adicional consumirá tempo sem agregar valor para a banca.