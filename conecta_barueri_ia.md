# PDD - Documento de Descrição do Projeto: Conecta Barueri (Para IA)
> **Versão:** 1.1 | **Atualizado em:** 2026-05-29

---

## 📌 Prompt de Inicialização

Use este prompt ao iniciar um novo chat com a IA:

> "Estou anexando o arquivo `conecta_barueri_ia.md` com o PDD do meu projeto Flask, o **Conecta Barueri**. Ele contém a arquitetura MVC, os modelos de banco de dados, as decisões de design e as pendências técnicas atuais.
>
> Leia e memorize. Não gere código ainda. Confirme que entendeu a estrutura e se coloque à disposição."

---

## 1. Visão Geral do Sistema
**Conecta Barueri** é uma plataforma institucional de inteligência de dados (Dashboard analítico) desenvolvida para a Prefeitura de Barueri. Centraliza e exibe indicadores socioeconômicos e operacionais por módulos: Saúde, Social, Segurança, Educação, Economia e Meio Ambiente.

---

## 2. Stack Tecnológica
- **Backend:** Python 3 + Flask
- **Banco de Dados:** PostgreSQL mapeado via Flask-SQLAlchemy
- **Segurança:** Flask-Login (sessões) + Flask-Bcrypt (hashing de senhas)
- **Formulários:** Flask-WTF + WTForms (validação + proteção CSRF automática)
- **Frontend:** HTML5, CSS3, Bootstrap 5, Bootstrap Icons

---

## 3. Estrutura de Arquivos (Estado Atual)

```text
conecta-barueri/
│
├── app/
│   ├── __init__.py          # Fábrica: inicializa db, bcrypt, login_manager; registra blueprints
│   ├── models.py            # Classes ORM: Usuario, Senha
│   ├── forms.py             # LoginForm (Flask-WTF)
│   │
│   ├── routes/
│   │   ├── auth.py          # Blueprint 'auth': GET/POST /login, GET /logout
│   │   └── main.py          # Blueprint 'main': GET /
│   │
│   ├── static/css/
│   │   ├── app/dashboard.css
│   │   ├── auth/login.css
│   │   ├── landing/landing.css
│   │   ├── global.css        # Variáveis CSS globais (--primary, --dark-slate, etc.)
│   │   ├── sidebar.css
│   │   └── style.css
│   │
│   ├── templates/
│   │   ├── app/
│   │   │   ├── base_app.html     # Base da área logada
│   │   │   └── home.html         # Home pós-login (em desenvolvimento)
│   │   ├── auth/
│   │   │   └── login.html        # Herda de landing/base_site.html
│   │   ├── landing/
│   │   │   ├── base_site.html    # Base unificada: landing + auth
│   │   │   └── index.html        # Landing page (herda base_site.html)
│   │   └── base.html             # Esqueleto raiz (reservado)
│   │
│   └── testes/testes.html
│
├── banco_de_dados.sql
├── requirements.txt
└── run.py
```

---

## 4. Modelos ORM (models.py)

```python
# Schema: login
class Usuario(UserMixin, db.Model):
    __tablename__ = 'usuario'
    __table_args__ = {'schema': 'login'}
    id       = db.Column(db.Integer, primary_key=True)
    nome     = db.Column(db.String(255), nullable=False)
    # ⚠️ PENDÊNCIA: campo email ausente — adicionar antes de testar login
    # email  = db.Column(db.Text)
    admin    = db.Column(db.Boolean, default=False)
    senha    = db.relationship('Senha', backref='usuario', uselist=False)

class Senha(db.Model):
    __tablename__ = 'senha'
    __table_args__ = {'schema': 'login'}
    usuario_id = db.Column(db.Integer, db.ForeignKey('login.usuario.id'), primary_key=True)
    senha      = db.Column(db.String(255), nullable=False)
```

---

## 5. Formulários (forms.py)

```python
class LoginForm(FlaskForm):
    email  = StringField('Usuário', validators=[DataRequired(), Email(), Length(max=150)])
    senha  = PasswordField('Senha',  validators=[DataRequired(), Length(min=4)])
    lembrar = BooleanField('Lembrar de mim')
    submit  = SubmitField('Entrar')
```

---

## 6. Rotas Implementadas

| Blueprint | Método | Rota | Descrição |
|---|---|---|---|
| `main` | GET | `/` | Landing page |
| `auth` | GET / POST | `/login` | Exibe formulário / valida credenciais |
| `auth` | GET | `/logout` | Encerra sessão, redireciona para `/` |

---

## 7. Banco de Dados (PostgreSQL)

### Schema `login`
- **`usuario`**: `id`, `nome`, `email`, `admin`
- **`senha`**: `usuario_id` (PK/FK), `senha` (hash Bcrypt)

### Schema `apresentacao`
- **`categoria`**: `id`, `nome` (Saúde, Social, Segurança, Educação, Economia, Meio Ambiente)
- **`salvar_apresentacao`**: `id`, `categoria_id`, `usuario_id`, `nome`, `dados_salvos`

> ⚠️ `banco_de_dados.sql` tem seeds com senhas em texto puro — apenas para dev local.

---

## 8. Decisões de Arquitetura Já Tomadas

1. **Base unificada landing + auth:** `login.html` herda de `landing/base_site.html`. O `base_auth.html` foi excluído.
2. **ORM obrigatório:** Nenhuma raw query nas rotas. Toda interação via `models.py`.
3. **Formulários via Flask-WTF:** CSRF automático com `{{ form.hidden_tag() }}`.
4. **Bcrypt para senhas:** Sempre `bcrypt.check_password_hash()` para validar; nunca `==`.
5. **Extensões instanciadas fora de `create_app()`:** `db`, `bcrypt`, `login_manager` são globais para importação entre módulos.
6. **Schemas PostgreSQL declarados no ORM:** via `__table_args__ = {'schema': '...'}`.

---

## 9. Pendências Técnicas (Corrigir Antes de Avançar)

| # | Arquivo | Problema | Correção |
|---|---|---|---|
| 1 | `models.py` | Campo `email` ausente na classe `Usuario` | Adicionar `email = db.Column(db.Text)` |
| 2 | `banco_de_dados.sql` | Seeds com senhas em texto puro | Apenas dev local; nunca usar em prod |

---

## 10. Próximas Telas a Implementar

| Tela | Blueprint | Arquivo Template |
|---|---|---|
| Home (pós-login) | `app` | `templates/app/home.html` |
| Projects | `app` | `templates/app/projects.html` |
| Admin | `app` | `templates/app/admin.html` |

---

## 11. Diretrizes que a IA Deve Sempre Respeitar

- **Nunca duplicar** estrutura de `<head>`, Bootstrap, Navbar ou Footer nos HTMLs — usar herança Jinja2.
- **Nunca escrever raw queries** dentro das rotas — usar SQLAlchemy ORM.
- **Nunca armazenar senha em texto puro** — sempre gerar hash Bcrypt antes de persistir.
- **Light Mode fixo** — paleta branco/cinza claro + azul `#0052ff`. Dark Mode descontinuado.
- **Formulários sempre via FlaskForm** — validação no `forms.py`, não nas rotas.
- **Responsividade obrigatória** — Bootstrap 5 com classes utilitárias responsivas.

## 12. Método de Trabalho com a IA

Trabalhar feature por feature seguindo este fluxo obrigatório:

1. **Entenda antes de codar** — explicar o conceito e como se encaixa no projeto
2. **Planeje junto** — listar arquivos a criar/modificar antes de qualquer código
3. **Implemente com explicação** — explicar cada linha importante
4. **Revise o que foi escrito** — o aluno escreve, a IA revisa e aponta melhorias

> Documentar funções e classes com docstrings sempre que for boa prática.
> Prioridade: aprendizado sobre velocidade.