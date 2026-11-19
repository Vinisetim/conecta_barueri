# 🛠️ Scripts de Modelagem e Seeds do Banco de Dados (Conecta Barueri)

Esta pasta centraliza de forma **modular e individual** cada um dos scripts responsáveis por criar, atualizar e semear (*seed*) o banco de dados PostgreSQL do projeto.

---

## 📋 Catálogo dos Scripts

| Ordem | Arquivo | Finalidade | Tabelas Afetadas |
| :---: | :--- | :--- | :--- |
| **01** | `01_criar_banco.py` | Executa o reset limpo do schema `apresentacao` (DROP CASCADE) e cria todas as tabelas via SQLAlchemy. | Todas as tabelas do schema `apresentacao`. |
| **02** | `02_seed_usuarios.py` | Cadastra os usuários de teste (Admin e Servidor) com senhas Bcrypt criptografadas. | `login.usuario`, `login.senhas`. |
| **03** | `03_seed_templates.py` | Cadastra os 10 templates homologados de slide para o editor (incluindo módulos/pilares e troféus). | `apresentacao.templates`. |
| **04** | `04_seed_ods.py` | Cadastra os 17 ODS da ONU com títulos, metas, cores hex e URLs CDN do Wikimedia Commons. | `apresentacao.ods`. |
| **05** | `05_seed_apresentadores.py` | Cadastra autoridades municipais (ex: Jonatas Randal da CIT) com tópicos e mídias extras. | `apresentacao.apresentador`. |
| **06** | `06_seed_indicadores.py` | Cadastra indicadores tratados de Barueri para preenchimento dinâmico e gráficos Chart.js. | `apresentacao.indicador`. |
| **07** | `07_seed_projeto_vitrine.py` | Cadastra pasta de trabalho, apresentação demonstrativa e os Projetos Oficiais do CIT (Barueri Sem Papel e Metaverso) com seus Kits de Slides. | `pasta`, `projeto`, `apresentacao`, `slide`, `campo_preenchido`, `slot_flexivel`. |
| **08** | `08_ingestao_portal_sit.py` | Pipeline batch que raspa iniciativas reais do portal oficial do CIT e gera automaticamente seus kits modulares de 3 slides. | `apresentacao.projeto`, `apresentacao.slide`, `apresentacao.campo_preenchido`, `apresentacao.slot_flexivel`. |

---

## 🚀 Como Executar

### Opção 1: Executar Todos de Uma Vez (Recomendado)
O script `executar_todos.py` roda automaticamente todos os scripts do 01 ao 08 na sequência correta de integridade referencial:

```bash
# Estando na raiz 'conecta_barueri':
.venv/bin/python models_scripts/executar_todos.py
```

### Opção 2: Executar Individualmente
Você pode rodar qualquer um dos scripts de forma isolada sempre que precisar repopular uma tabela específica:

```bash
.venv/bin/python models_scripts/01_criar_banco.py
.venv/bin/python models_scripts/02_seed_usuarios.py
.venv/bin/python models_scripts/03_seed_templates.py
.venv/bin/python models_scripts/04_seed_ods.py
.venv/bin/python models_scripts/05_seed_apresentadores.py
.venv/bin/python models_scripts/06_seed_indicadores.py
.venv/bin/python models_scripts/07_seed_projeto_vitrine.py
.venv/bin/python models_scripts/08_ingestao_portal_sit.py 15  # Ingestão das 15 principais iniciativas do CIT
```

---

## 🔑 Credenciais dos Usuários Semeados

* **Administrador:**
  * E-mail: `admin@barueri.sp.gov.br`
  * Senha: `admin123`
  * Papel: `admin = True`

* **Servidor Municipal Comum:**
  * E-mail: `usuario@barueri.sp.gov.br`
  * Senha: `usuario123`
  * Papel: `admin = False`
