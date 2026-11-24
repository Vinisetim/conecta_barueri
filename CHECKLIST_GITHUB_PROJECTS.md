# Checklist de Tarefas — Sprint Final Banca Definitiva (GitHub Projects)

Este documento contém a divisão e priorização **imediata** de tarefas para o quadro do **GitHub Projects** e issues da reta final para a Banca do TCC.

---

## 🔄 Fluxo de Trabalho Obrigatório
1. **Demanda / Especificação:** Vinicius define o escopo funcional e alinha com Marianna as telas novas ou revisões necessárias.
2. **Design e Protótipo:** Marianna desenha/revisa as telas e componentes visuais.
3. **Consenso:** Vinicius e Marianna aprovam a especificação visual e comportamental da tela.
4. **Implementação:** Lucas e Belloni recebem a especificação aprovada e implementam no código (Frontend + Backend).
5. **Revisão Dupla Pós-Implementação:**
   - **Vinicius:** Valida a funcionalidade, integridade do banco de dados, regras de negócio e rotas.
   - **Marianna:** Valida a fidelidade visual, espaçamentos, tipografia, cores e UX.

---

## 🚨 SPRINT FINAL: TAREFAS PRIORITÁRIAS (FOCO TOTAL NA BANCA)

### 👤 Vinicius (Banco de Dados, Engenharia de Dados e Validação Funcional)

- [ ] **DB-URG-01 (Estrutura de Projetos Modulares e Apresentadores):** Ajustar no `models.py` os campos da entidade `Projeto` para refletir as iniciativas municipais (com fotos, destaques e benefícios) e criar a entidade `Apresentador` para perfis biográficos oficiais reutilizáveis.
- [ ] **DB-URG-02 (Pipeline de Ingestão do Portal SIT):** Criar o script `models_scripts/08_ingestao_portal_sit.py` que consome as páginas oficiais de projetos do Portal SIT (`Portifolio.aspx`), extrai os campos e persiste no banco de dados os Kits Modulares de Slides.
- [ ] **DB-URG-03 (Seed de Perfis de Autoridade):** Criar script de carga para a tabela `apresentador` contendo o perfil oficial do Secretário Jonatas Randal e autoridades do CIT com foto, mini-bio e 4 conquistas históricas.
- [ ] **REV-URG-01 (Validação Funcional do Link Público):** Testar acesso anônimo/sem login na rota `/p/<id>` garantindo que a visualização seja fluida, em tela cheia e sem elementos de edição expostos.
- [ ] **REV-URG-02 (Validação do Reúso em Lote):** Homologar a importação em lote de kits de projetos (ex: Metaverso, Barueri Sem Papel) para dentro de uma apresentação ativa.

---

### 💻 Lucas e Belloni (Frontend e Backend)

- [ ] **DEV-URG-01 (Link Público /p/<id>):** Criar a rota pública `GET /p/<int:id>` em `app/routes/apresentacao.py` sem `@login_required` que abre diretamente o modo apresentação (`iniciar_apresentacao.html`) em tela cheia limpa.
- [ ] **DEV-URG-02 (API de Projetos e Apresentadores):** Criar as rotas de backend:
  - `GET /api/projetos/<int:id>/slides`: Retorna os 2 a 3 slides estruturados do kit do projeto.
  - `GET /api/apresentadores`: Retorna a lista de perfis de autoridades cadastrados.
- [ ] **DEV-URG-03 (Completar os Templates no Editor):** Implementar no canvas e na sidebar de `criar-apresentacao.html` e `criar-apresentacao.js` os templates pendentes:
  - `video` (player 16:9 e métricas de audiência);
  - `apresentador` (foto oficial, nome, cargo, biografia e 4 badges);
  - `encerramento` (agradecimento "OBRIGADO", QR Code e copyright);
  - `modulos_pilares` (grid de 3 cards com título e explicação de benefícios);
  - `premios_marcos` (grade de troféus e reconhecimentos).
- [ ] **DEV-URG-04 (Reúso em Lote no Editor):** No modal de reúso do editor, implementar a aba **"Projetos do CIT"**: ao selecionar um projeto, injeta de uma vez todos os slides daquele kit na apresentação.
- [ ] **DEV-URG-05 (Catálogo da Tela /projetos):** Ajustar a tela `/projetos` para renderizar a vitrine de iniciativas municipais cadastradas, com busca, filtros por secretaria/ODS e modal de pré-visualização dos slides.
- [ ] **DEV-URG-06 (Performance e Cache de Backend):** Configurar cache em memória no Flask (`app.config`) para templates e ODS, eliminando requisições lentas e repetidas ao Supabase.

---

### 🎨 Marianna (Design, UI/UX e Revisão Visual)

- [ ] **UI-URG-01 (Design da Vitrine de Projetos):** Desenhar o layout dos cards das iniciativas municipais para a tela `/projetos` (foto oficial, título, secretaria responsável, badges de ODS e botão "Ver Kit").
- [ ] **UI-URG-02 (Design dos Templates 9 e 10):** Desenhar a diagramação do grid de 3 cards de benefícios (`modulos_pilares`) e da grade de troféus institucionais (`premios_marcos`).
- [ ] **UI-URG-03 (Fidelidade Visual aos Slides Reais do Canva):** Revisar as fontes (Montserrat e Inter), margens de respiro de 60px e cores institucionais (`#0C2E4E`, `#0052FF`, `#414042`) no canvas do editor.
- [ ] **UI-URG-04 (Design do Modal de Reúso Expandido):** Desenhar a interface do modal de reúso com a separação clara entre *"Slide Individual"* e *"Kit de Projeto Completo"*.

---

## 📦 TAREFAS JÁ CONCLUÍDAS (HISTÓRICO)
- [x] **DB-01 / DB-02:** Schema de usuários (`status`, `admin`), isolamento de senhas e atributos visuais do slide.
- [x] **DB-03 / DB-04:** Modelo de slots flexíveis na matriz 3x3 e scripts automatizados de seed em `models_scripts/`.
- [x] **DEV-01 / DEV-02:** CRUD completo de funcionários no `/admin/usuario` com hash Bcrypt e bloqueio de usuários comuns.
- [x] **DEV-MAP:** Template de mapa com Leaflet.js e catálogo de pins de Barueri.
- [x] **DEV-REUSO:** Mecanismo base de reutilização de slides implementado em `criar-apresentacao.js`.
