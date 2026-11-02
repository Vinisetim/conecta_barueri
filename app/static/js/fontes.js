// ======================================
// FONTES DE DADOS E PAGINAÇÃO (MÁX. 5 POR ABA)
// ======================================

let fontes =
    JSON.parse(
        localStorage.getItem("fontes")
    ) || [
        {
            nome: "SAFEM",
            descricao: "Sistema Integrado de Administração Financeira",
            status: "Conectado",
            sincronizacao: "24/05/2025 10:45"
        },
        {
            nome: "Portal Transparência",
            descricao: "Dados do Portal da Transparência",
            status: "Conectado",
            sincronizacao: "24/05/2025 10:30"
        },
        {
            nome: "Censo Escolar",
            descricao: "Dados do Censo Escolar",
            status: "Erro",
            sincronizacao: "24/05/2025 09:15"
        }
    ];

const ITENS_POR_PAGINA = 5;
let paginaAtual = 1;

// ======================================
// SALVAR LOCALSTORAGE
// ======================================

function salvarFontes() {
    localStorage.setItem(
        "fontes",
        JSON.stringify(fontes)
    );
}

// ======================================
// STATUS BADGE
// ======================================

function classeStatus(status) {
    return status === "Conectado"
        ? "success"
        : "error";
}

// ======================================
// NAVEGAÇÃO ENTRE ABAS (PAGINAÇÃO)
// ======================================

function irParaPaginaFonte(novaPagina) {
    paginaAtual = novaPagina;
    renderizarFontes();
}

function renderizarPaginacaoFontes(totalItens) {
    const paginacaoContainer = document.getElementById("paginacaoFontes");
    if (!paginacaoContainer) return;

    const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    if (paginaAtual < 1) paginaAtual = 1;

    let htmlPaginas = "";

    if (totalPaginas > 1 && paginaAtual > 1) {
        htmlPaginas += `
            <a href="#" onclick="irParaPaginaFonte(${paginaAtual - 1}); return false;" title="Aba anterior">
                <i class="bi bi-chevron-left"></i>
            </a>
        `;
    }

    for (let p = 1; p <= totalPaginas; p++) {
        const classeAtiva = p === paginaAtual ? "active" : "";
        htmlPaginas += `
            <a href="#" class="${classeAtiva}" onclick="irParaPaginaFonte(${p}); return false;">
                ${p}
            </a>
        `;
    }

    if (totalPaginas > 1 && paginaAtual < totalPaginas) {
        htmlPaginas += `
            <a href="#" onclick="irParaPaginaFonte(${paginaAtual + 1}); return false;" title="Próxima aba">
                <i class="bi bi-chevron-right"></i>
            </a>
        `;
    }

    paginacaoContainer.innerHTML = htmlPaginas;
}

// ======================================
// RENDERIZAR TABELA POR ABA (5 POR ABA)
// ======================================

function renderizarFontes() {
    const tbody = document.getElementById("fontesBody");
    const contadorEl = document.getElementById("contadorFontes");
    if (!tbody) return;

    tbody.innerHTML = "";

    const totalPaginas = Math.max(1, Math.ceil(fontes.length / ITENS_POR_PAGINA));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    if (paginaAtual < 1) paginaAtual = 1;

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const fontesPagina = fontes.slice(inicio, fim);

    if (contadorEl) {
        contadorEl.textContent = `${fontes.length} fonte(s) cadastrada(s)`;
    }

    renderizarPaginacaoFontes(fontes.length);

    if (fontesPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma fonte de dados cadastrada.</td>
            </tr>
        `;
        return;
    }

    fontesPagina.forEach((fonte, idxPagina) => {
        const indexReal = inicio + idxPagina;

        tbody.innerHTML += `
            <tr>
                <td>
                    <strong>${fonte.nome}</strong>
                </td>

                <td>
                    ${fonte.descricao}
                </td>

                <td>
                    <span class="fontes-status ${classeStatus(fonte.status)}">
                        ${fonte.status}
                    </span>
                </td>

                <td>
                    ${fonte.sincronizacao}
                </td>

                <td>
                    <button
                        class="fonte-edit"
                        type="button"
                        onclick="editarFonte(${indexReal})"
                        title="Editar fonte"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        class="fonte-delete"
                        type="button"
                        onclick="excluirFonte(${indexReal})"
                        title="Excluir fonte"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// ======================================
// MODAL DE ADICIONAR / EDITAR FONTE
// ======================================

const modalFonte = document.getElementById("modalFonte");
const formFonte = document.getElementById("formFonte");
const modalFonteTitulo = document.getElementById("modalFonteTitulo");
const inputFonteIndex = document.getElementById("fonteIndex");
const inputFonteNome = document.getElementById("fonteNome");
const inputFonteDescricao = document.getElementById("fonteDescricao");
const selectFonteStatus = document.getElementById("fonteStatus");

function adicionarFonte() {
    if (!modalFonte) return;
    modalFonteTitulo.textContent = "Nova Fonte de Dados";
    inputFonteIndex.value = "";
    inputFonteNome.value = "";
    inputFonteDescricao.value = "";
    selectFonteStatus.value = "Conectado";
    modalFonte.classList.add("open");
    inputFonteNome.focus();
}

function fecharModalFonte() {
    if (!modalFonte) return;
    modalFonte.classList.remove("open");
}

function editarFonte(index) {
    const fonte = fontes[index];
    if (!fonte || !modalFonte) return;

    modalFonteTitulo.textContent = "Editar Fonte de Dados";
    inputFonteIndex.value = String(index);
    inputFonteNome.value = fonte.nome || "";
    inputFonteDescricao.value = fonte.descricao || "";
    selectFonteStatus.value = fonte.status === "Erro" ? "Erro" : "Conectado";

    modalFonte.classList.add("open");
    inputFonteNome.focus();
}

function salvarFormularioFonte(event) {
    event.preventDefault();

    const nome = (inputFonteNome ? inputFonteNome.value : "").trim();
    const descricao = (inputFonteDescricao ? inputFonteDescricao.value : "").trim();
    const status = selectFonteStatus ? selectFonteStatus.value : "Conectado";
    const indexStr = inputFonteIndex ? inputFonteIndex.value.trim() : "";

    if (!nome || !descricao) {
        alert("Preencha o nome e a descrição da fonte de dados.");
        return;
    }

    const agora = new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).replace(",", "");

    if (indexStr !== "") {
        const idx = Number(indexStr);
        if (fontes[idx]) {
            fontes[idx].nome = nome;
            fontes[idx].descricao = descricao;
            fontes[idx].status = status;
            fontes[idx].sincronizacao = agora;
        }
    } else {
        fontes.push({
            nome,
            descricao,
            status,
            sincronizacao: agora
        });
        // Ao criar a 6ª fonte (ou novo múltiplo de 5 + 1), cria e navega para a nova aba
        paginaAtual = Math.ceil(fontes.length / ITENS_POR_PAGINA);
    }

    salvarFontes();
    fecharModalFonte();
    renderizarFontes();
}

// ======================================
// EXCLUIR FONTE
// ======================================

function excluirFonte(index) {
    const fonte = fontes[index];
    const confirmar = confirm(`Deseja realmente excluir a fonte "${fonte ? fonte.nome : ""}"?`);
    if (!confirmar) return;

    fontes.splice(index, 1);
    salvarFontes();
    renderizarFontes();
}

// ======================================
// EVENTOS E INICIALIZAÇÃO
// ======================================

document.getElementById("btnNovaFonte")?.addEventListener("click", adicionarFonte);
document.getElementById("btnFecharModalFonte")?.addEventListener("click", fecharModalFonte);
document.getElementById("btnCancelarModalFonte")?.addEventListener("click", fecharModalFonte);

modalFonte?.addEventListener("click", e => {
    if (e.target === modalFonte) fecharModalFonte();
});

formFonte?.addEventListener("submit", salvarFormularioFonte);

renderizarFontes();
