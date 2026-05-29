# PDD - Documento de Descrição do Projeto: Conecta Barueri
> **Versão:** 1.1 | **Atualizado em:** 2026-05-29

---

## 1. Visão Geral do Sistema
O **Conecta Barueri** é uma plataforma corporativa e institucional de inteligência de dados (Dashboard analítico) desenvolvida em parceria com a Prefeitura de Barueri. O sistema centraliza, processa e exibe indicadores socioeconômicos e operacionais do município, organizados por categorias/módulos (Saúde, Social, Segurança, Educação, Economia e Meio Ambiente).

---

## 2. Modelo de Negócio e Proposta de Valor
- **Público-Target Atual:** Servidores públicos municipais e gestores de secretarias da Prefeitura de Barueri.
- **Proposta de Valor:** Substituir relatórios fragmentados e planilhas por uma interface centralizada e visualmente intuitiva, otimizando a tomada de decisões estratégicas e o acompanhamento de metas governamentais.

---

## 3. Políticas de Acesso e Regras de Autenticação
- **Regra de Escopo Atual:** O sistema opera em modelo fechado. O acesso à área técnica e aos painéis de dados é restrito exclusivamente a pessoas com credenciais da prefeitura previamente cadastradas por um Administrador do sistema.
- **Diretriz de Escalabilidade (Futuro):** A arquitetura deve ser projetada de forma desacoplada para permitir, caso decidido pela gestão, a abertura de uma versão pública com restrições de escopo de dados (ex: visualização de dados agregados para o cidadão comum, sem permissão de edição ou acesso a relatórios internos confidenciais).

---

## 4. Stack Tecnológica Base
| Camada | Tecnologia |
|---|---|
| Backend / Linguagem | Python 3 + Flask |
| Banco de Dados | PostgreSQL via Flask-SQLAlchemy |
| Segurança de Sessão | Flask-Login |
| Criptografia de Senhas | Flask-Bcrypt |
| Validação de Formulários | Flask-WTF + WTForms |
| Frontend | HTML5, CSS3, Bootstrap 5, Bootstrap Icons |

---

## 5. Estrutura Arquitetural (Padrão MVC / Factory)

```text
conecta-barueri/
│
├── app/
│   ├── __init__.py          # Fábrica do app: inicializa extensões e registra blueprints
│   ├── models.py            # Modelos ORM (SQLAlchemy) mapeando as tabelas do banco
│   ├── forms.py             # Formulários Flask-WTF com validação e proteção CSRF
│   │
│   ├── routes/
│   │   ├── auth.py          # Rotas de autenticação: /login, /logout
│   │   └── main.py          # Rotas institucionais: landing page (/)
│   │
│   ├── static/
│   │   └── css/
│   │       ├── app/
│   │       │   └── dashboard.css    # Estilos da área interna/dashboard
│   │       ├── auth/
│   │       │   └── login.css        # Estilos da tela de login
│   │       ├── landing/
│   │       │   └── landing.css      # Estilos da landing page
│   │       ├── global.css           # Variáveis CSS, resets e tipografia global
│   │       ├── sidebar.css          # Estilos da barra lateral (área logada)
│   │       └── style.css            # Estilos auxiliares gerais
│   │
│   ├── templates/
│   │   ├── app/
│   │   │   ├── base_app.html        # Base da área logada (com sidebar/navbar interna)
│   │   │   └── home.html            # Tela inicial pós-login
│   │   ├── auth/
│   │   │   └── login.html           # Tela de login (herda de landing/base_site.html)
│   │   ├── landing/
│   │   │   ├── base_site.html       # Base unificada: landing page + telas de auth
│   │   │   └── index.html           # Landing page institucional
│   │   └── base.html                # Esqueleto raiz (reservado para usos futuros)
│   │
│   └── testes/
│       └── testes.html              # Arquivo de testes de interface
│
├── .gitignore
├── LICENSE
├── README.md
├── banco_de_dados.sql       # Definição física do banco (sujeito a alterações frequentes)
├── requirements.txt
└── run.py                   # Ponto de entrada do servidor Flask
```

---

## 6. Modelagem de Dados Atual (PostgreSQL)

O banco usa dois schemas para separar autenticação de conteúdo.

### 6.1. Schema: `login`

**Tabela `usuario`** — perfil dos servidores cadastrados:
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `nome` | VARCHAR(255) | Nome do servidor |
| `email` | TEXT | E-mail de acesso (usado como login) |
| `admin` | BOOLEAN | Define privilégios de administrador |

**Tabela `senha`** — credenciais isoladas (relação 1:1 com `usuario`):
| Coluna | Tipo | Descrição |
|---|---|---|
| `usuario_id` | INTEGER PK/FK | Referencia `login.usuario(id)` |
| `senha` | VARCHAR(255) | Hash Bcrypt da senha |

> ⚠️ **Aviso:** O arquivo `banco_de_dados.sql` contém seeds com senhas em texto puro (`'aaaaaa'`, `'bbbbbb'`) para fins de desenvolvimento local. **Nunca usar em produção.** As senhas em banco devem sempre ser hashes Bcrypt gerados pela aplicação.

### 6.2. Schema: `apresentacao`

**Tabela `categoria`** — secretarias municipais monitoradas:
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `nome` | VARCHAR(100) UNIQUE NOT NULL | Nome da secretaria |

Categorias cadastradas: Saúde, Social, Segurança, Educação, Economia, Meio Ambiente.

**Tabela `salvar_apresentacao`** — painéis e relatórios salvos por usuário:
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `categoria_id` | INTEGER FK | Referencia `apresentacao.categoria(id)` |
| `usuario_id` | INTEGER FK | Referencia `login.usuario(id)` |
| `nome` | VARCHAR(255) | Nome do painel/relatório |
| `dados_salvos` | VARCHAR(255) | Payload com estado do painel |

---

## 7. Estado Atual de Desenvolvimento

### 7.1. Telas Implementadas

| Tela | Rota | Status |
|---|---|---|
| Landing Page | `/` | ✅ Concluída |
| Login | `/login` | ✅ Concluída |
| Logout | `/logout` | ✅ Concluído |
| Home (pós-login) | `/home` | 🔄 Em desenvolvimento |

### 7.2. Telas Planejadas (Próximas Entregas)

| Tela | Descrição |
|---|---|
| Home | Painel inicial do usuário logado |
| Projects | Listagem e gestão de projetos/apresentações |
| Admin | Gerenciamento de usuários (exclusivo para `admin=True`) |

### 7.3. Pendências Técnicas

> ⚠️ O campo `email` está presente na tabela `login.usuario` do banco e é usado em `auth.py` (`filter_by(email=...)`) mas **não foi mapeado na classe `Usuario` em `models.py`**. Isso causará erro ao tentar autenticar. Adicionar `email = db.Column(db.Text)` ao modelo é prioridade antes de testar o login.

---

## 8. Diretrizes Críticas para Desenvolvimento

### 8.1. Identidade Visual e UI/UX (Light Mode Corporativo)

- **Estética Geral:** Interface permanentemente em Light Mode Corporativo — alta legibilidade, sobriedade institucional, profissionalismo técnico. Dark Mode descontinuado.
- **Paleta de Cores:**
  - Fundos: branco puro (`#FFFFFF`) e cinzas ultra-claros (`#F8F9FA`, `#F0F2F5`)
  - Destaque: variações de Azul Royal e Azul Marinho (`--primary: #0052ff`)
- **Layout Split-Screen no Login:**
  - Coluna esquerda: formulário de credenciais
  - Coluna direita: bloco visual informativo com pilares institucionais
  - Mobile: coluna direita oculta via `d-none d-md-flex`
- **Responsividade:** 100% responsivo com utilitários Bootstrap 5.

### 8.2. Herança de Templates (Jinja2)

- **Proibição de Redundância:** Nenhum HTML deve duplicar `<head>`, Bootstrap, Navbar ou Footer manualmente.
- **Base Unificada Landing + Auth:** `landing/base_site.html` é a base compartilhada da landing page e das telas de autenticação. O arquivo `base_auth.html` foi **excluído** por redundância.
- **Regra de Extensão:** Todo template de rota deve iniciar com `{% extends '...' %}` e injetar conteúdo em `{% block content %}`.

### 8.3. Segurança de Credenciais (Bcrypt)

- Nenhuma senha trafega ou é persistida em texto puro.
- O hash é gerado por Flask-Bcrypt antes de qualquer interação com o banco.
- A validação usa `bcrypt.check_password_hash()`, nunca comparadores diretos (`==`).

### 8.4. Formulários (Flask-WTF)

- Todos os formulários de entrada de dados usam classes `FlaskForm` definidas em `forms.py`.
- A proteção CSRF é automática via `{{ form.hidden_tag() }}` nos templates.
- Validações de campo (formato, obrigatoriedade, tamanho) são definidas no formulário, não nas rotas.

### 8.5. Persistência e ORM (SQLAlchemy)

- Toda interação com o banco passa pelos modelos em `models.py`.
- **Proibido:** raw queries (`db.session.execute("SELECT...")`) dentro das rotas.
- O isolamento via ORM garante que mudanças no `banco_de_dados.sql` só exijam atualização em `models.py`.
- Schemas PostgreSQL são declarados via `__table_args__ = {'schema': 'nome_schema'}`.
