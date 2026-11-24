# Especificação Arquitetural de Dados — Pasta vs. Projeto e Uso das Tabelas
**Projeto:** Conecta Barueri (TCC ETEC Barueri / Parceria CIT)  
**Módulo:** Engenharia de Dados & Modelagem Relacional (PostgreSQL / Supabase)  
**Autor:** Vinicius (Equipe de Dados)  
**Status:** Documento Separado de Referência & Guia de Uso  

---

## 1. Contexto e Resolução do Problema Histórico

Durante as etapas iniciais de desenvolvimento do *Conecta Barueri*, utilizou-se o termo **"Projeto"** para representar o contêiner onde o servidor público guardava suas apresentações. Na prática do software e da interface, essa entidade sempre funcionou como uma **pasta de arquivos** pessoal (ex: *"Minhas Apresentações"*, *"Reuniões da Saúde 2026"*).

Paralelamente, a Prefeitura de Barueri — por meio da Secretaria de Inovação e Tecnologia (CIT) — possui um acervo público formal de **Iniciativas Municipais** (ex: *Programa Barueri Sem Papel*, *Metaverso Barueri*, *Internet Social*, *Iluminação Pública em LED*), que também são denominadas **Projetos**.

Para eliminar a ambiguidade perante a banca do TCC e garantir que o software atenda com rigor às duas necessidades, a modelagem de dados foi desacoplada em duas entidades distintas:

1. **`Pasta` (`apresentacao.pasta`):** O contêiner organizacional PESSOAL do usuário.
2. **`Projeto` (`apresentacao.projeto`):** A Iniciativa Municipal OFICIAL do CIT, que funciona como vitrine no catálogo e como **Kit Modular de Slides** no editor.

---

## 2. Matriz Comparativa: Pasta vs. Projeto

| Critério de Comparação | `apresentacao.pasta` (Pasta) | `apresentacao.projeto` (Projeto / Iniciativa) |
| :--- | :--- | :--- |
| **Definição Conceitual** | Diretório de trabalho pessoal ou setorial do funcionário público. | Iniciativa pública oficial de transformação digital e serviços de Barueri. |
| **Propriedade (Ownership)** | **Pertence a um usuário específico** (`usuario_id` obrigatório). | **Pertence ao acervo municipal global** (sem dono único, dados institucionais do CIT). |
| **Visibilidade** | Privada ao criador (e administradores). Visível na área de trabalho do usuário. | Pública e compartilhada. Visível na vitrine geral (`/projetos`) e no modal de reúso do editor. |
| **O que contém diretamente** | Contém **Apresentações** executáveis (`Apresentacao 1:N`). | Contém **Slides Mestres do Kit** (`Slide 1:N`, normalmente 2 a 3 slides). |
| **Origem dos Dados** | Criada manualmente pelo servidor através da interface web. | Alimentada pelo script de ingestão em lote (`08_ingestao_portal_sit.py`) ou por admin. |
| **Finalidade de Negócio** | Organizar arquivos de trabalho, evitar poluição visual e permitir futura delegação de acessos. | Fornecer dados auditados, fotos oficiais e slides pré-formatados para reuso em 1 clique. |
| **Vínculo com Slide** | Indireto: `Pasta` -> `Apresentacao` -> `Slide`. | **Direto:** `Projeto` -> `Slide` (como template mestre de kit). |

---

## 3. Diagrama Entidade-Relacionamento (DER Atualizado)

```text
       ┌─────────────────────────────────────────────────────────────┐
       │                     login.usuario                           │
       │  - id (PK)                                                  │
       │  - nome, email, admin, status                               │
       └──────────────┬──────────────────────────────┬───────────────┘
                      │ 1:1                          │ 1:N
                      ▼                              ▼
       ┌──────────────────────────────┐      ┌──────────────────────────────┐
       │         login.senha          │      │      apresentacao.pasta      │
       │  - usuario_id (PK/FK)        │      │  - id (PK)                   │
       │  - senha (Hash Bcrypt)       │      │  - usuario_id (FK)           │
       └──────────────────────────────┘      │  - nome, descricao, capa_uri │
                                             └──────────────┬───────────────┘
                                                            │ 1:N
                                                            ▼
┌──────────────────────────────────────┐     ┌──────────────────────────────┐
│        apresentacao.projeto          │     │  apresentacao.apresentacao   │
│  - id (PK)                           │     │  - id (PK)                   │
│  - slug (UNIQUE)                     │     │  - pasta_id (FK)             │
│  - nome (ex: "Barueri Sem Papel")    │     │  - nome                      │
│  - secretaria_principal              │     │  - data_criacao              │
│  - resumo, foto_url                  │     └──────────────┬───────────────┘
│  - destaques (JSONB)                 │                    │
│  - beneficios (JSONB)                │                    │ 1:N (Slides de Trabalho)
│  - data_implantacao, status          │                    │
│  - ods_vinculados (JSONB)            │                    │
└──────────────────┬───────────────────┘                    │
                   │ 1:N (Slides Mestres do Kit)            │
                   └──────────────────┐ ┌───────────────────┘
                                      │ │
                                      ▼ ▼
                       ┌──────────────────────────────────────────────┐
                       │             apresentacao.slide               │
                       │  - id (PK)                                   │
                       │  - apresentacao_id (FK opcional) ◄───────────┤ (Slide do usuário)
                       │  - projeto_id      (FK opcional) ◄───────────┤ (Slide mestre do kit)
                       │  - template_id     (FK -> templates.id)      │
                       │  - ordem                                     │
                       │  - alinhamento_texto, filtro_fundo           │
                       │  - estilo_fundo, cabecalho_ativo             │
                       └──────────────────────┬───────────────────────┘
                                              │ 1:N
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │         apresentacao.campo_preenchido        │
                       │  - id (PK), slide_id (FK)                    │
                       │  - chave_campo, tipo_fonte, valor_manual     │
                       │  - campo_origem_id (FK), indicador_id (FK)   │
                       │  - tamanho_texto, cor_texto, fonte           │
                       └──────────────────────────────────────────────┘
```

---

## 4. Dicionário Técnico de Dados e Regras de Uso de Cada Tabela

### 4.1. Esquema `login` (Autenticação e Acesso)

#### 1. `login.usuario`
- **Propósito:** Cadastro de servidores municipais com acesso autorizado ao sistema.
- **Colunas:**
  - `id` (`SERIAL PRIMARY KEY`): Identificador único do servidor.
  - `nome` (`VARCHAR(150) NOT NULL`): Nome civil completo.
  - `email` (`VARCHAR(255) UNIQUE NOT NULL`): E-mail funcional do servidor.
  - `admin` (`BOOLEAN DEFAULT FALSE`): Define privilégios de gestão de usuários e acervo institucional.
  - `status` (`BOOLEAN DEFAULT TRUE`): Permite desativar o acesso de um servidor sem deletar suas apresentações históricas.
- **Como é Usada:** O Flask-Login carrega o usuário ativo via `load_user(user_id)`. Se `status == False`, o login é barrado.

#### 2. `login.senha`
- **Propósito:** Armazenamento isolado e seguro de credenciais criptográficas.
- **Colunas:**
  - `usuario_id` (`INTEGER PRIMARY KEY, FOREIGN KEY -> login.usuario(id)`): Garante relação 1:1 estrita.
  - `senha` (`VARCHAR(255) NOT NULL`): Hash gerado exclusivamente via Bcrypt com salt dinâmico.
- **Regras:** NUNCA recebe texto puro. A validação é feita exclusivamente através de `bcrypt.check_password_hash(hash_banco, senha_digitada)`.

---

### 4.2. Esquema `apresentacao` (Estrutura Organizacional e Acervo)

#### 3. `apresentacao.pasta` (Antiga tabela `projeto`)
- **Propósito:** Funciona como um diretório onde o servidor público guarda e categoriza suas próprias apresentações.
- **Colunas:**
  - `id` (`SERIAL PRIMARY KEY`): Identificador único da pasta.
  - `usuario_id` (`INTEGER NOT NULL, FOREIGN KEY -> login.usuario(id)`): Servidor proprietário da pasta.
  - `nome` (`VARCHAR(150) NOT NULL`): Título amigável da pasta (ex: *"Apresentações Planejamento 2026"*).
  - `descricao` (`TEXT`): Anotação interna do servidor sobre o conteúdo.
  - `capa_uri` (`VARCHAR(500)`): Imagem ilustrativa para o card no painel do usuário.
- **Regras de Uso:**
  - Um usuário pode ter múltiplas pastas (`usuario.pastas`).
  - Ao deletar uma pasta, o sistema pode alertar ou impedir caso existam apresentações nela.
  - Facilita extensões futuras de compartilhamento (ex: compartilhar a pasta inteira com outro setor).

#### 4. `apresentacao.projeto` (Novo Catálogo Oficial do CIT)
- **Propósito:** Registro das iniciativas oficiais de inovação e governo digital da Prefeitura de Barueri. Serve de base para a vitrine `/projetos` e fornece Kits Modulares de Slides prontos para uso.
- **Colunas:**
  - `id` (`SERIAL PRIMARY KEY`): Identificador interno.
  - `slug` (`VARCHAR(200) UNIQUE NOT NULL`): Identificador amigável de URL (ex: `"barueri-sem-papel"`, `"metaverso-barueri"`).
  - `nome` (`VARCHAR(255) NOT NULL`): Nome oficial do projeto no CIT.
  - `secretaria_principal` (`VARCHAR(150)`): Órgão gestor (ex: *"Secretaria de Inovação e Tecnologia - CIT"*).
  - `resumo` (`TEXT`): Texto institucional sintetizado para o card da vitrine pública.
  - `descricao_completa` (`TEXT`): Detalhamento técnico extraído do portal municipal.
  - `foto_url` (`VARCHAR(500)`): Imagem oficial em alta definição.
  - `destaques` (`JSONB`): Lista de 3 pontos de impacto (ex: `["100% Digital", "40 mil processos/mês", "Economia de R$ 2M"]`).
  - `beneficios` (`JSONB`): Lista estruturada dos 3 pilares de benefícios que alimentam o Template 9 (`modulos_pilares`).
  - `data_implantacao` (`VARCHAR(50)`): Mês/ano de entrada em produção (ex: `"Outubro de 2023"`).
  - `status_operacional` (`VARCHAR(100)`): Estado do programa (ex: `"Em Expansão"`, `"Ativo"`).
  - `ods_vinculados` (`JSONB`): Vetor numérico dos ODS impactados (ex: `[9, 11, 16]`).
  - `criado_em` (`TIMESTAMP DEFAULT CURRENT_TIMESTAMP`): Carimbo de auditoria de inserção.
- **Regras de Uso:**
  - Não pertence a um usuário comum; é alimentada via script batch de ingestão (`08_ingestao_portal_sit.py`) ou por administrador.
  - Possui relacionamento 1:N com `Slide` (`projeto.slides_kit`), mantendo os slides mestres que formam o kit da iniciativa.

#### 5. `apresentacao.apresentacao`
- **Propósito:** Arquivo executável de apresentação de slides criado pelo servidor.
- **Colunas:**
  - `id` (`SERIAL PRIMARY KEY`): Identificador único da apresentação.
  - `pasta_id` (`INTEGER NOT NULL, FOREIGN KEY -> apresentacao.pasta(id)`): Pasta à qual pertence.
  - `nome` (`VARCHAR(200) NOT NULL`): Título da apresentação (ex: *"Audiência Pública de Prestação de Contas"*).
  - `data_criacao` (`TIMESTAMP DEFAULT CURRENT_TIMESTAMP`): Data e hora de criação.
- **Regras de Uso:**
  - O servidor abre a apresentação no editor (`/apresentacao/editar/<id>`) ou no reprodutor de tela cheia (`/apresentacao/iniciar/<id>`).
  - Seus slides são ordenados sequencialmente através do campo `ordem` da tabela `slide`.

#### 6. `apresentacao.slide` (O Elemento Unificador de Slides)
- **Propósito:** Representa uma tela/página individual. A grande inovação arquitetural desta tabela é que ela pode pertencer tanto a uma apresentação de usuário quanto a um kit de projeto oficial.
- **Colunas:**
  - `id` (`SERIAL PRIMARY KEY`): Identificador do slide.
  - `apresentacao_id` (`INTEGER, FOREIGN KEY -> apresentacao.apresentacao(id) ON DELETE CASCADE`, Opcional): Preenchido quando o slide é de uma apresentação de trabalho de um servidor.
  - `projeto_id` (`INTEGER, FOREIGN KEY -> apresentacao.projeto(id) ON DELETE CASCADE`, Opcional): Preenchido quando o slide é um slide mestre de um Kit Oficial de Projeto.
  - `template_id` (`INTEGER NOT NULL, FOREIGN KEY -> apresentacao.templates(id)`): Molde visual utilizado.
  - `ordem` (`INTEGER NOT NULL`): Sequência de exibição (1, 2, 3...).
  - `alinhamento_texto` (`VARCHAR(20) DEFAULT 'left'`): `'left'`, `'center'`, `'right'`, `'justify'`.
  - `filtro_fundo` (`VARCHAR(20) DEFAULT 'nenhum'`): `'nenhum'`, `'escurecer'`, `'borrar'`.
  - `estilo_fundo` (`VARCHAR(30) DEFAULT 'contained'`): `'full_scrim'` ou `'contained'`.
  - `cabecalho_ativo` (`BOOLEAN DEFAULT FALSE`): Controla a exibição da faixa institucional de cabeçalho.
- **Constraint de Integridade Lógica:**
  - Um slide deve pertencer obrigatoriamente a uma `Apresentacao` **OU** a um `Projeto` (nunca a ambos simultaneamente, nem a nenhum dos dois):
    ```sql
    CHECK (
        (apresentacao_id IS NOT NULL AND projeto_id IS NULL) OR 
        (apresentacao_id IS NULL AND projeto_id IS NOT NULL)
    )
    ```

#### 7. `apresentacao.templates` (Lookup Table dos Moldes)
- **Propósito:** Catálogo estático dos 10 templates homologados do design system de Barueri.
- **Colunas:** `id`, `nome` (ex: *"Módulos e Pilares"*), `codigo` (ex: `"modulos_pilares"`), `descricao`.
- **Regras:** Dados estáticos gerenciados pelo sistema (`03_seed_templates.py`), imutáveis pelo usuário comum.

#### 8. `apresentacao.campo_preenchido` (Modelo EAV & Tipografia Individual)
- **Propósito:** Armazena o conteúdo dinâmico de cada campo do template e suas propriedades de estilo tipográfico individual (tamanho, cor e família tipográfica).
- **Colunas:**
  - `id` (`SERIAL PRIMARY KEY`)
  - `slide_id` (`INTEGER NOT NULL, FOREIGN KEY -> apresentacao.slide(id) ON DELETE CASCADE`)
  - `chave_campo` (`VARCHAR(100) NOT NULL`): Nome lógico do slot (ex: `"titulo"`, `"subtitulo"`, `"imagem_lateral"`).
  - `tipo_fonte` (`VARCHAR(50) NOT NULL`): Origem do dado (`'manual'`, `'reuso_midia'` ou `'indicador'`).
  - `valor_manual` (`TEXT`): Conteúdo textual ou URL de imagem inserida diretamente.
  - `campo_origem_id` (`INTEGER, FOREIGN KEY -> campo_preenchido(id)`): Auto-relacionamento para reúso de mídia já existente.
  - `indicador_id` (`INTEGER, FOREIGN KEY -> apresentacao.indicador(id)`): Vincula a uma métrica dinâmica municipal.
  - `tamanho_texto` (`VARCHAR(20)`): Ex: `'32px'`, `'2rem'`.
  - `cor_texto` (`VARCHAR(20)`): Hexadecimal da paleta de Barueri (ex: `#FFFFFF`, `#0C2E4E`, `#0052FF`).
  - `fonte` (`VARCHAR(50)`): Nome da fonte tipográfica (ex: `'Montserrat'`, `'Inter'`).

#### 9. `apresentacao.slot_flexivel` (Matriz 3×3 de Elementos Sobrepostos)
- **Propósito:** Ancoragem de selos de ODS, QR Code de transparência e logos institucionais nos 9 quadrantes do slide sem conflitar com os textos principais.
- **Colunas:** `id`, `slide_id` (FK), `tipo_elemento` (`'ods'`, `'qrcode'`, `'logo'`), `posicao_matriz` (`'top-left'`, `'bottom-right'`, etc.), `config_json` (JSONB com parâmetros específicos).

#### 10. `apresentacao.ods` (Lookup dos Objetivos Globais)
- **Propósito:** Catálogo dos 17 Objetivos de Desenvolvimento Sustentável da ONU, com `numero`, `titulo`, `descricao`, `icone_url` e `cor_hex`.

#### 11. `apresentacao.apresentador` (Catálogo Oficial de Autoridades)
- **Propósito:** Catálogo compartilhado de perfis e autoridades municipais (ex: Secretário Jonatas Randal do CIT).
- **Colunas:** `id`, `criado_por_id` (FK opcional), `nome`, `cargo`, `biografia`, `foto_url`, `topicos` (JSONB com histórico e marcos), `midias_extras` (JSONB).
- **Regras:** Alimenta o Template 7 (`apresentador`) de forma padronizada para qualquer apresentação.

#### 12. `apresentacao.indicador` (Métricas Dinâmicas Municipais)
- **Propósito:** Banco de dados de métricas tratadas de Barueri (arrecadação, processos digitais, atendimentos, infraestrutura).
- **Colunas:** `id`, `secretaria`, `nome_metrica`, `valor_numerico`, `unidade_medida`, `data_atualizacao`, `historico_json`.

---

## 5. Como os Fluxos de Negócio Operam com a Nova Modelagem

### Fluxo 1: Servidor Organiza seus Trabalhos em Pastas
1. O usuário acessa o painel e cria uma pasta chamada *"Prestação de Contas Semestral"* (`apresentacao.pasta`).
2. Dentro dessa pasta, ele clica em "Nova Apresentação", gerando um registro em `apresentacao.apresentacao` com `pasta_id = pasta.id`.
3. Conforme o usuário adiciona slides, cada slide é salvo em `apresentacao.slide` com `apresentacao_id = apresentacao.id` e `projeto_id = NULL`.

### Fluxo 2: O Reúso em Lote do Kit de Projeto (1 Clique no Editor)
1. O servidor está editando uma apresentação própria e abre o modal de reúso, selecionando a aba **"Projetos do CIT"**.
2. Ele escolhe o projeto *"Barueri Sem Papel"* (`projeto.id = 5`).
3. O backend consulta todos os slides onde `slide.projeto_id == 5`.
4. O backend **clona** (duplica) esses slides e seus respectivos `campo_preenchido` e `slot_flexivel`, alterando o `apresentacao_id` das novas cópias para o ID da apresentação do usuário.
5. Os slides oficiais passam a fazer parte da apresentação do servidor com fidelidade visual perfeita e dados oficiais auditados.

### Fluxo 3: Ingestão de Dados do Portal do CIT (`08_ingestao_portal_sit.py`)
1. O script batch de raspagem faz requisição às páginas ASPX do portal municipal do CIT.
2. Faz o `INSERT` na tabela `apresentacao.projeto` com slug, fotos, benefícios e destaques.
3. Imediatamente cria 2 a 3 registros mestres em `apresentacao.slide` apontando para o `projeto_id` recém-gerado:
   - Slide 1: Template de Capa Oficial do Projeto.
   - Slide 2: Template de Módulos e Pilares com os 3 benefícios.
   - Slide 3: Template de Indicadores com as métricas da iniciativa.

---

## 6. Script DDL de Migração no PostgreSQL (Para Aplicação no Banco)

Este script SQL é a receita de migração que poderá ser executada de forma idempotente:

```sql
-- ====================================================================
-- MIGRAÇÃO RELACIONAL: SEPARAÇÃO DE PASTA E PROJETO NO SUPABASE
-- ====================================================================

-- 1. Renomeia a tabela antiga 'projeto' para 'pasta'
ALTER TABLE IF EXISTS apresentacao.projeto RENAME TO pasta;

-- 2. Atualiza a coluna de ligação na tabela de apresentações
ALTER TABLE IF EXISTS apresentacao.apresentacao RENAME COLUMN projeto_id TO pasta_id;

-- 3. Cria a nova tabela 'projeto' (Iniciativas Oficiais / Portfólio CIT)
CREATE TABLE IF NOT EXISTS apresentacao.projeto (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(200) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    secretaria_principal VARCHAR(150),
    resumo TEXT,
    descricao_completa TEXT,
    foto_url VARCHAR(500),
    destaques JSONB,
    beneficios JSONB,
    data_implantacao VARCHAR(50),
    status_operacional VARCHAR(100),
    ods_vinculados JSONB,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ajusta a tabela 'slide' para suportar vínculo duplo (Apresentacao OU Projeto)
ALTER TABLE apresentacao.slide ALTER COLUMN apresentacao_id DROP NOT NULL;

ALTER TABLE apresentacao.slide 
    ADD COLUMN IF NOT EXISTS projeto_id INTEGER REFERENCES apresentacao.projeto(id) ON DELETE CASCADE;

-- 5. Adiciona constraint garantindo que o slide pertença a exatamente uma das pontas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_slide_origem_exclusiva'
    ) THEN
        ALTER TABLE apresentacao.slide
            ADD CONSTRAINT chk_slide_origem_exclusiva
            CHECK (
                (apresentacao_id IS NOT NULL AND projeto_id IS NULL) OR 
                (apresentacao_id IS NULL AND projeto_id IS NOT NULL)
            );
    END IF;
END $$;
```

---

## 7. Mapeamento SQLAlchemy (`models.py`)

```python
class Pasta(db.Model):
    """
    Antigo 'Projeto'. Diretório organizacional pessoal do usuário
    para gerenciar seus arquivos de apresentação.
    """
    __tablename__ = 'pasta'
    __table_args__ = {'schema': 'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('login.usuario.id'), nullable=False)
    nome = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    capa_uri = db.Column(db.String(500))

    apresentacoes = db.relationship('Apresentacao', backref='pasta_pai', lazy=True, cascade='all, delete-orphan')


class Projeto(db.Model):
    """
    Novo 'Projeto'. Iniciativa Municipal Oficial do CIT de Barueri.
    Guarda metadados institucionais e provê os slides mestres do Kit.
    """
    __tablename__ = 'projeto'
    __table_args__ = {'schema': 'apresentacao'}

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    nome = db.Column(db.String(255), nullable=False)
    secretaria_principal = db.Column(db.String(150))
    resumo = db.Column(db.Text)
    descricao_completa = db.Column(db.Text)
    foto_url = db.Column(db.String(500))
    destaques = db.Column(db.JSON)       # 3 marcos de destaque
    beneficios = db.Column(db.JSON)      # 3 cards de pilares de benefícios
    data_implantacao = db.Column(db.String(50))
    status_operacional = db.Column(db.String(100))
    ods_vinculados = db.Column(db.JSON)  # IDs numéricos dos ODS
    criado_em = db.Column(db.DateTime, default=db.func.current_timestamp())

    slides_kit = db.relationship('Slide', backref='projeto_pai', lazy=True, cascade='all, delete-orphan')


class Slide(db.Model):
    """
    Slide individual renderizável.
    Pode pertencer a uma Apresentação (usuário) OU a um Projeto (kit oficial do CIT).
    """
    __tablename__ = 'slide'
    __table_args__ = (
        db.CheckConstraint(
            '(apresentacao_id IS NOT NULL AND projeto_id IS NULL) OR '
            '(apresentacao_id IS NULL AND projeto_id IS NOT NULL)',
            name='chk_slide_origem_exclusiva'
        ),
        {'schema': 'apresentacao'}
    )

    id = db.Column(db.Integer, primary_key=True)
    apresentacao_id = db.Column(db.Integer, db.ForeignKey('apresentacao.apresentacao.id'), nullable=True)
    projeto_id = db.Column(db.Integer, db.ForeignKey('apresentacao.projeto.id'), nullable=True)
    template_id = db.Column(db.Integer, db.ForeignKey('apresentacao.templates.id'), nullable=False)
    ordem = db.Column(db.Integer, nullable=False)

    alinhamento_texto = db.Column(db.String(20), default='left')
    filtro_fundo = db.Column(db.String(20), default='nenhum')
    estilo_fundo = db.Column(db.String(30), default='contained')
    cabecalho_ativo = db.Column(db.Boolean, default=False)

    campos = db.relationship('CampoPreenchido', backref='slide_pai', lazy=True, cascade='all, delete-orphan')
    slots_flexiveis = db.relationship('SlotFlexivel', backref='slide_pai', lazy=True, cascade='all, delete-orphan')
```
