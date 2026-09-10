// ======================================
// FONTES DE DADOS
// ======================================

let fontes =
    JSON.parse(
        localStorage.getItem("fontes")
    ) || [

        {
            nome: "SAFEM",
            descricao:
                "Sistema Integrado de Administração Financeira",
            status: "Conectado",
            sincronizacao:
                "24/05/2025 10:45"
        },

        {
            nome:
                "Portal Transparência",
            descricao:
                "Dados do Portal da Transparência",
            status: "Conectado",
            sincronizacao:
                "24/05/2025 10:30"
        },

        {
            nome:
                "Censo Escolar",
            descricao:
                "Dados do Censo Escolar",
            status: "Erro",
            sincronizacao:
                "24/05/2025 09:15"
        }

    ];

// ======================================

function salvarFontes() {

    localStorage.setItem(
        "fontes",
        JSON.stringify(fontes)
    );
}

// ======================================

function classeStatus(status) {

    return status === "Conectado"
        ? "success"
        : "error";
}

// ======================================

function renderizarFontes() {

    const tbody =
        document.getElementById(
            "fontesBody"
        );

    tbody.innerHTML = "";

    fontes.forEach(
        (
            fonte,
            index
        ) => {

            tbody.innerHTML += `

<tr>

<td>
<strong>
${fonte.nome}
</strong>
</td>

<td>
${fonte.descricao}
</td>

<td>

<span
class="
fontes-status
${classeStatus(
    fonte.status
)}
"
>

${fonte.status}

</span>

</td>

<td>
${fonte.sincronizacao}
</td>

<td>

<button
class="fonte-edit"
onclick="
editarFonte(
${index}
)"
>
<i class="bi bi-pencil"></i>
</button>

<button
class="fonte-delete"
onclick="
excluirFonte(
${index}
)"
>
<i class="bi bi-trash"></i>
</button>

</td>

</tr>

`;
        }
    );
}

// ======================================

function adicionarFonte() {

    const nome =
        prompt(
            "Nome da fonte:"
        );

    if (!nome) return;

    const descricao =
        prompt(
            "Descrição:"
        );

    if (!descricao) return;

    fontes.push({

        nome,
        descricao,

        status: "Conectado",

        sincronizacao:
            new Date()
            .toLocaleString(
                "pt-BR"
            )

    });

    salvarFontes();

    renderizarFontes();
}

// ======================================

function editarFonte(
    index
) {

    const fonte =
        fontes[index];

    const nome =
        prompt(
            "Nome:",
            fonte.nome
        );

    if (!nome) return;

    const descricao =
        prompt(
            "Descrição:",
            fonte.descricao
        );

    if (!descricao) return;

    fonte.nome =
        nome;

    fonte.descricao =
        descricao;

    salvarFontes();

    renderizarFontes();
}

// ======================================

function excluirFonte(
    index
) {

    const confirmar =
        confirm(
            "Excluir esta fonte?"
        );

    if (!confirmar) return;

    fontes.splice(
        index,
        1
    );

    salvarFontes();

    renderizarFontes();
}

// ======================================

document
    .getElementById(
        "btnNovaFonte"
    )
    .addEventListener(
        "click",
        adicionarFonte
    );

// ======================================

renderizarFontes();