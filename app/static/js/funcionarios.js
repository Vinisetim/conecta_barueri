// ========================================
// DADOS INICIAIS
// ========================================

let funcionarios =
    JSON.parse(
        localStorage.getItem("funcionarios")
    ) || [
        {
            nome: "Mariana Lima",
            email: "mariana.lima@barueri.sp.gov.br",
            perfil: "Editor",
            equipe: "Saúde",
            status: "Ativo"
        },
        {
            nome: "Ricardo Castro",
            email: "ricardo.castro@barueri.sp.gov.br",
            perfil: "Visualizador",
            equipe: "Finanças",
            status: "Ativo"
        },
        {
            nome: "Ana Ferreira",
            email: "ana.ferreira@barueri.sp.gov.br",
            perfil: "Administrador",
            equipe: "TI",
            status: "Ativo"
        },
        {
            nome: "João Silva",
            email: "joao.silva@barueri.sp.gov.br",
            perfil: "Editor",
            equipe: "Educação",
            status: "Inativo"
        }
    ];

// ========================================
// SALVAR LOCALSTORAGE
// ========================================

function salvarDados() {

    localStorage.setItem(
        "funcionarios",
        JSON.stringify(funcionarios)
    );
}

// ========================================
// CLASSES DOS BADGES
// ========================================

function obterClassePerfil(perfil) {

    switch (perfil) {

        case "Administrador":
            return "perfil-admin";

        case "Editor":
            return "perfil-editor";

        default:
            return "perfil-visualizador";
    }
}

function obterClasseStatus(status) {

    return status === "Ativo"
        ? "status-ativo"
        : "status-inativo";
}

// ========================================
// RENDERIZAR TABELA
// ========================================

function renderizarTabela() {

    const tbody =
        document.getElementById(
            "funcionariosBody"
        );

    const pesquisa =
        document
            .getElementById(
                "pesquisaFuncionario"
            )
            .value
            .toLowerCase();

    const perfil =
        document
            .getElementById(
                "filtroPerfil"
            )
            .value;

    const status =
        document
            .getElementById(
                "filtroStatus"
            )
            .value;

    tbody.innerHTML = "";

    const funcionariosFiltrados =
        funcionarios.filter(
            funcionario => {

                const pesquisaOk =

                    funcionario.nome
                        .toLowerCase()
                        .includes(pesquisa)

                    ||

                    funcionario.email
                        .toLowerCase()
                        .includes(pesquisa);

                const perfilOk =

                    perfil ===
                    "Todos os perfis"

                    ||

                    funcionario.perfil ===
                    perfil;

                const statusOk =

                    status ===
                    "Todos os status"

                    ||

                    funcionario.status ===
                    status;

                return (
                    pesquisaOk &&
                    perfilOk &&
                    statusOk
                );
            }
        );

    funcionariosFiltrados.forEach(
        (funcionario, index) => {

            tbody.innerHTML += `

<tr>

<td>
    <strong>
        ${funcionario.nome}
    </strong>
</td>

<td>
    ${funcionario.email}
</td>

<td>
    <span class="
        funcionarios-badge
        ${obterClassePerfil(funcionario.perfil)}
    ">
        ${funcionario.perfil}
    </span>
</td>

<td>
    ${funcionario.equipe}
</td>

<td>
    <span class="
        funcionarios-badge
        ${obterClasseStatus(funcionario.status)}
    ">
        ${funcionario.status}
    </span>
</td>

<td>

    <button
        class="func-btn-edit"
        onclick="editarFuncionario(${index})"
        title="Editar"
    >
        <i class="bi bi-pencil"></i>
    </button>

    <button
        class="func-btn-delete"
        onclick="excluirFuncionario(${index})"
        title="Excluir"
    >
        <i class="bi bi-trash"></i>
    </button>

</td>

</tr>

`;
        }
    );
}

// ========================================
// ADICIONAR
// ========================================

function adicionarFuncionario() {

    const nome =
        prompt(
            "Nome do funcionário:"
        );

    if (!nome) return;

    const email =
        prompt(
            "E-mail:"
        );

    if (!email) return;

    const perfil =
        prompt(
            "Perfil:\nAdministrador\nEditor\nVisualizador"
        );

    if (!perfil) return;

    const equipe =
        prompt(
            "Equipe:"
        );

    if (!equipe) return;

    funcionarios.push({
        nome,
        email,
        perfil,
        equipe,
        status: "Ativo"
    });

    salvarDados();

    renderizarTabela();
}

// ========================================
// EDITAR
// ========================================

function editarFuncionario(index) {

    const funcionario =
        funcionarios[index];

    const novoNome =
        prompt(
            "Nome:",
            funcionario.nome
        );

    if (!novoNome) return;

    const novoEmail =
        prompt(
            "E-mail:",
            funcionario.email
        );

    if (!novoEmail) return;

    funcionario.nome =
        novoNome;

    funcionario.email =
        novoEmail;

    salvarDados();

    renderizarTabela();
}

// ========================================
// EXCLUIR
// ========================================

function excluirFuncionario(index) {

    const confirmar =
        confirm(
            "Deseja excluir este funcionário?"
        );

    if (!confirmar) return;

    funcionarios.splice(
        index,
        1
    );

    salvarDados();

    renderizarTabela();
}

// ========================================
// EVENTOS
// ========================================

document
    .getElementById(
        "btnAdicionar"
    )
    .addEventListener(
        "click",
        adicionarFuncionario
    );

document
    .getElementById(
        "pesquisaFuncionario"
    )
    .addEventListener(
        "keyup",
        renderizarTabela
    );

document
    .getElementById(
        "filtroPerfil"
    )
    .addEventListener(
        "change",
        renderizarTabela
    );

document
    .getElementById(
        "filtroStatus"
    )
    .addEventListener(
        "change",
        renderizarTabela
    );

// ========================================
// INICIALIZAÇÃO
// ========================================

renderizarTabela();