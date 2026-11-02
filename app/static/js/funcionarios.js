// ========================================
// DADOS DOS FUNCIONÁRIOS E PAGINAÇÃO (MÁX. 5 POR ABA)
// ========================================

let funcionarios = Array.isArray(window.FUNCIONARIOS_DB)
    ? window.FUNCIONARIOS_DB
    : [];

const ITENS_POR_PAGINA = 5;
let paginaAtual = 1;

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

function obterIniciais(nome) {
    if (!nome || !nome.trim()) return "US";
    const partes = nome
        .trim()
        .split(/\s+/)
        .filter(p => !["de", "da", "do", "dos", "das", "e"].includes(p.toLowerCase()));
    const lista = partes.length ? partes : nome.trim().split(/\s+/);
    if (lista.length >= 2) {
        return (lista[0][0] + lista[lista.length - 1][0]).toUpperCase();
    }
    return lista[0].slice(0, 2).toUpperCase();
}

// ========================================
// NAVEGAÇÃO ENTRE ABAS (PAGINAÇÃO)
// ========================================

function irParaPagina(novaPagina) {
    paginaAtual = novaPagina;
    renderizarTabela();
}

function renderizarPaginacao(totalItens) {
    const paginacaoContainer = document.getElementById("paginacaoFuncionarios");
    if (!paginacaoContainer) return;

    const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    if (paginaAtual < 1) paginaAtual = 1;

    let htmlPaginas = "";

    if (totalPaginas > 1 && paginaAtual > 1) {
        htmlPaginas += `
            <a href="#" onclick="irParaPagina(${paginaAtual - 1}); return false;" title="Aba anterior">
                <i class="bi bi-chevron-left"></i>
            </a>
        `;
    }

    for (let p = 1; p <= totalPaginas; p++) {
        const classeAtiva = p === paginaAtual ? "active" : "";
        htmlPaginas += `
            <a href="#" class="${classeAtiva}" onclick="irParaPagina(${p}); return false;">
                ${p}
            </a>
        `;
    }

    if (totalPaginas > 1 && paginaAtual < totalPaginas) {
        htmlPaginas += `
            <a href="#" onclick="irParaPagina(${paginaAtual + 1}); return false;" title="Próxima aba">
                <i class="bi bi-chevron-right"></i>
            </a>
        `;
    }

    paginacaoContainer.innerHTML = htmlPaginas;
}

// ========================================
// RENDERIZAR TABELA COM FILTROS E ABAS
// ========================================

function renderizarTabela() {
    const tbody = document.getElementById("funcionariosBody");
    if (!tbody) return;

    const inputPesquisa = document.getElementById("pesquisaFuncionario");
    const selectPerfil = document.getElementById("filtroPerfil");
    const selectStatus = document.getElementById("filtroStatus");
    const contadorEl = document.getElementById("contadorFuncionarios");

    const pesquisa = (inputPesquisa ? inputPesquisa.value : "").toLowerCase().trim();
    const perfil = selectPerfil ? selectPerfil.value : "Todos os perfis";
    const status = selectStatus ? selectStatus.value : "Todos os status";

    tbody.innerHTML = "";

    const funcionariosFiltrados = funcionarios.filter(funcionario => {
        const nomeStr = (funcionario.nome || "").toLowerCase();
        const emailStr = (funcionario.email || "").toLowerCase();

        const pesquisaOk = !pesquisa || nomeStr.includes(pesquisa) || emailStr.includes(pesquisa);
        const perfilOk = perfil === "Todos os perfis" || funcionario.perfil === perfil;
        const statusOk = status === "Todos os status" || funcionario.status === status;

        return pesquisaOk && perfilOk && statusOk;
    });

    const totalPaginas = Math.max(1, Math.ceil(funcionariosFiltrados.length / ITENS_POR_PAGINA));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    if (paginaAtual < 1) paginaAtual = 1;

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const funcionariosPagina = funcionariosFiltrados.slice(inicio, fim);

    if (contadorEl) {
        contadorEl.textContent = `${funcionariosFiltrados.length} funcionário(s) cadastrado(s)`;
    }

    renderizarPaginacao(funcionariosFiltrados.length);

    if (funcionariosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">Nenhum funcionário encontrado para os filtros selecionados.</td>
            </tr>
        `;
        return;
    }

    funcionariosPagina.forEach(funcionario => {
        const iniciais = funcionario.iniciais || obterIniciais(funcionario.nome);
        const equipeTexto = funcionario.equipe || "Sem pastas";

        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="func-user-cell">
                        <span class="func-user-avatar">${iniciais}</span>
                        <strong>${funcionario.nome}</strong>
                    </div>
                </td>

                <td>${funcionario.email}</td>

                <td>
                    <span class="funcionarios-badge ${obterClassePerfil(funcionario.perfil)}">
                        ${funcionario.perfil}
                    </span>
                </td>

                <td>${equipeTexto}</td>

                <td>
                    <span class="funcionarios-badge ${obterClasseStatus(funcionario.status)}">
                        ${funcionario.status}
                    </span>
                </td>

                <td>
                    <button
                        class="func-btn-edit"
                        type="button"
                        onclick="editarFuncionario(${funcionario.id})"
                        title="Editar funcionário"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        class="func-btn-delete"
                        type="button"
                        onclick="excluirFuncionario(${funcionario.id})"
                        title="Excluir funcionário"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// ========================================
// MODAL DE ADICIONAR / EDITAR
// ========================================

const modalOverlay = document.getElementById("modalFuncionario");
const formFuncionario = document.getElementById("formFuncionario");
const modalTitulo = document.getElementById("modalFuncionarioTitulo");
const inputId = document.getElementById("funcId");
const inputNome = document.getElementById("funcNome");
const inputEmail = document.getElementById("funcEmail");
const inputSenha = document.getElementById("funcSenha");
const labelSenha = document.getElementById("labelFuncSenha");
const selectModalPerfil = document.getElementById("funcPerfil");
const selectModalStatus = document.getElementById("funcStatus");
const btnSalvarModal = document.getElementById("btnSalvarModalFunc");

function abrirModalNovoFuncionario() {
    if (!modalOverlay) return;
    modalTitulo.textContent = "Novo Funcionário";
    inputId.value = "";
    inputNome.value = "";
    inputEmail.value = "";
    inputSenha.value = "";
    inputSenha.required = true;
    inputSenha.placeholder = "Digite a senha de acesso";
    if (labelSenha) labelSenha.textContent = "Senha de acesso *";
    selectModalPerfil.value = "Editor";
    selectModalStatus.value = "Ativo";
    modalOverlay.classList.add("open");
    inputNome.focus();
}

function fecharModalFuncionario() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("open");
}

function editarFuncionario(id) {
    const funcionario = funcionarios.find(f => Number(f.id) === Number(id));
    if (!funcionario || !modalOverlay) return;

    modalTitulo.textContent = "Editar Funcionário";
    inputId.value = funcionario.id;
    inputNome.value = funcionario.nome || "";
    inputEmail.value = funcionario.email || "";
    inputSenha.value = "";
    inputSenha.required = false;
    inputSenha.placeholder = "Deixe em branco para manter a senha atual";
    if (labelSenha) labelSenha.textContent = "Nova senha (opcional)";
    selectModalPerfil.value = funcionario.perfil === "Administrador" ? "Administrador" : "Editor";
    selectModalStatus.value = funcionario.status === "Inativo" ? "Inativo" : "Ativo";

    modalOverlay.classList.add("open");
    inputNome.focus();
}

async function salvarFuncionarioNoBanco(event) {
    event.preventDefault();

    const id = inputId.value.trim();
    const payload = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        senha: inputSenha.value.trim(),
        perfil: selectModalPerfil.value,
        status: selectModalStatus.value
    };

    if (!payload.nome || !payload.email) {
        alert("Preencha o nome e o e-mail do funcionário.");
        return;
    }

    const url = id ? `/admin/usuario/editar/${id}` : "/admin/usuario/criar";

    if (btnSalvarModal) {
        btnSalvarModal.disabled = true;
        btnSalvarModal.textContent = "Salvando...";
    }

    try {
        const resposta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.status !== "sucesso") {
            alert(dados.mensagem || "Não foi possível salvar o funcionário.");
            return;
        }

        if (id) {
            const idx = funcionarios.findIndex(f => Number(f.id) === Number(id));
            if (idx !== -1 && dados.usuario) {
                funcionarios[idx] = dados.usuario;
            }
        } else if (dados.usuario) {
            funcionarios.push(dados.usuario);
            // Ao adicionar um novo usuário (ex.: 6º usuário), navega para a última aba criada
            paginaAtual = Math.ceil(funcionarios.length / ITENS_POR_PAGINA);
        }

        fecharModalFuncionario();
        renderizarTabela();
    } catch (erro) {
        console.error("Erro ao salvar funcionário:", erro);
        alert("Erro de comunicação ao tentar salvar.");
    } finally {
        if (btnSalvarModal) {
            btnSalvarModal.disabled = false;
            btnSalvarModal.textContent = "Salvar";
        }
    }
}

// ========================================
// EXCLUIR FUNCIONÁRIO
// ========================================

async function excluirFuncionario(id) {
    const funcionario = funcionarios.find(f => Number(f.id) === Number(id));
    const nomeExibicao = funcionario ? funcionario.nome : `#${id}`;

    const confirmar = confirm(`Deseja realmente excluir o funcionário "${nomeExibicao}"?`);
    if (!confirmar) return;

    try {
        const resposta = await fetch(`/admin/usuario/excluir/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.status !== "sucesso") {
            alert(dados.mensagem || "Não foi possível excluir o funcionário.");
            return;
        }

        funcionarios = funcionarios.filter(f => Number(f.id) !== Number(id));
        renderizarTabela();
    } catch (erro) {
        console.error("Erro ao excluir funcionário:", erro);
        alert("Erro de comunicação ao tentar excluir.");
    }
}

// ========================================
// EVENTOS
// ========================================

document.getElementById("btnAdicionar")?.addEventListener("click", abrirModalNovoFuncionario);
document.getElementById("btnFecharModalFunc")?.addEventListener("click", fecharModalFuncionario);
document.getElementById("btnCancelarModalFunc")?.addEventListener("click", fecharModalFuncionario);

modalOverlay?.addEventListener("click", e => {
    if (e.target === modalOverlay) fecharModalFuncionario();
});

formFuncionario?.addEventListener("submit", salvarFuncionarioNoBanco);

document.getElementById("pesquisaFuncionario")?.addEventListener("keyup", () => {
    paginaAtual = 1;
    renderizarTabela();
});
document.getElementById("filtroPerfil")?.addEventListener("change", () => {
    paginaAtual = 1;
    renderizarTabela();
});
document.getElementById("filtroStatus")?.addEventListener("change", () => {
    paginaAtual = 1;
    renderizarTabela();
});

// ========================================
// INICIALIZAÇÃO
// ========================================

renderizarTabela();
