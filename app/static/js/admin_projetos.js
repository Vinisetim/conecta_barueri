// ============================================================
// ADMIN PROJETOS & APRESENTAÇÕES (GERENCIAMENTO DE PASTAS E ACERVO)
// ============================================================

// Alternância entre visualização de Pastas e Todas as Apresentações
function switchView(mode) {
    const secPastas = document.getElementById("sectionPastas");
    const secAps = document.getElementById("sectionApresentacoes");
    const tabPastas = document.getElementById("tabPastas");
    const tabAps = document.getElementById("tabApresentacoes");

    if (mode === 'apresentacoes') {
        if (secPastas) secPastas.style.display = 'none';
        if (secAps) secAps.style.display = 'block';
        if (tabPastas) tabPastas.classList.remove('active');
        if (tabAps) tabAps.classList.add('active');
    } else {
        if (secPastas) secPastas.style.display = 'block';
        if (secAps) secAps.style.display = 'none';
        if (tabPastas) tabPastas.classList.add('active');
        if (tabAps) tabAps.classList.remove('active');
    }
}
window.switchView = switchView;

// Filtro rápido de cards
window.filterCards = function() {
    const searchInput = document.getElementById("searchInput");
    const moduloFilter = document.getElementById("moduloFilter");
    const statusFilter = document.getElementById("statusFilter");
    
    if (!searchInput) return;

    const searchVal = (searchInput.value || "").toLowerCase();
    const moduloVal = moduloFilter ? moduloFilter.value : "";
    const statusVal = statusFilter ? statusFilter.value : "";
    
    const cards = document.querySelectorAll(".ap-card-item");

    cards.forEach(card => {
        const title = (card.getAttribute("data-title") || "").toLowerCase();
        const modulo = card.getAttribute("data-modulo") || "";
        const status = card.getAttribute("data-status") || "";

        const matchesSearch = !searchVal || title.includes(searchVal);
        const matchesModulo = !moduloVal || modulo === moduloVal;
        const matchesStatus = !statusVal || status === statusVal;

        if (matchesSearch && matchesModulo && matchesStatus) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
};

window.setView = function(viewType) {
    const grid = document.getElementById("cardsGrid");
    const gridBtn = document.getElementById("gridBtn");
    const listBtn = document.getElementById("listBtn");

    if (!grid || !gridBtn || !listBtn) return;

    if (viewType === "list") {
        grid.classList.add("list-view");
        gridBtn.classList.remove("active");
        listBtn.classList.add("active");
    } else {
        grid.classList.remove("list-view");
        gridBtn.classList.add("active");
        listBtn.classList.remove("active");
    }
};

// Funções Globais de Exclusão (com fallback e animação na tela)
window.excluirProjetoBtn = async function(event, btn) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const projId = btn.getAttribute("data-proj-id");
    const projNome = btn.getAttribute("data-proj-nome") || "esta pasta";

    if (!confirm(`Atenção! Deseja realmente excluir a pasta "${projNome}" e TODAS as apresentações dentro dela?\n\nEsta ação é irreversível e excluirá definitivamente do banco de dados.`)) {
        return;
    }

    try {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        const response = await fetch(`/projetos/deletar/${projId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const res = await response.json();
        if (response.ok && res.status === 'sucesso') {
            const card = btn.closest('.ap-card-item');
            if (card) {
                card.style.transition = "opacity 0.35s ease, transform 0.35s ease";
                card.style.opacity = "0";
                card.style.transform = "scale(0.85)";
                setTimeout(() => {
                    card.remove();
                    window.location.reload();
                }, 350);
            } else {
                window.location.reload();
            }
        } else {
            alert(res.mensagem || "Erro ao deletar pasta.");
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    } catch (err) {
        console.error(err);
        alert("Erro ao conectar ao servidor para deletar pasta.");
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};

window.excluirApresentacaoBtn = async function(event, btn) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const apId = btn.getAttribute("data-id");
    const apNome = btn.getAttribute("data-nome") || "esta apresentação";

    if (!confirm(`Atenção! Deseja realmente excluir a apresentação "${apNome}"?\n\nEsta ação é irreversível e apagará todos os seus slides do banco de dados.`)) {
        return;
    }

    try {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        const response = await fetch(`/apresentacao/deletar/${apId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const res = await response.json();
        if (response.ok && res.status === 'sucesso') {
            const item = btn.closest('.ap-card-item, .pasta-apresentacao-item, .apresentacao-row-item');
            if (item) {
                item.style.transition = "opacity 0.35s ease, transform 0.35s ease";
                item.style.opacity = "0";
                item.style.transform = "scale(0.85)";
                setTimeout(() => {
                    item.remove();
                    window.location.reload();
                }, 350);
            } else {
                window.location.reload();
            }
        } else {
            alert(res.mensagem || "Erro ao deletar apresentação.");
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    } catch (err) {
        console.error(err);
        alert("Erro ao conectar ao servidor para deletar apresentação.");
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};

document.addEventListener("DOMContentLoaded", function() {
    // Leitura dos dados relacionais serializados
    const rawData = document.getElementById("dadosProjetosEApresentacoes");
    let projetosMap = {};
    if (rawData) {
        try {
            projetosMap = JSON.parse(rawData.textContent);
        } catch (e) {
            console.error("Erro ao analisar dados das apresentações:", e);
        }
    }

    // Modal Ver Apresentações / Acervo
    const modalVer = document.getElementById("modalVerApresentacoes");
    const btnCloseVerModal = document.getElementById("btnCloseVerModal");
    const btnFecharVerModal = document.getElementById("btnFecharVerModal");
    const modalVerProjTitulo = document.getElementById("modalVerProjTitulo");
    const modalApresentacoesConteudo = document.getElementById("modalApresentacoesConteudo");
    const modalBtnCriarNestaPasta = document.getElementById("modalBtnCriarNestaPasta");
    const tabBtnVerApresentacoes = document.getElementById("tabBtnVerApresentacoes");
    const tabBtnVerAcervo = document.getElementById("tabBtnVerAcervo");
    const painelVerApresentacoes = document.getElementById("painelVerApresentacoes");
    const painelVerAcervo = document.getElementById("painelVerAcervo");
    const modalAcervoPastaConteudo = document.getElementById("modalAcervoPastaConteudo");

    let currentModalProjId = null;

    function fecharModalVer() {
        if (modalVer) modalVer.classList.remove("show");
    }

    if (btnCloseVerModal) btnCloseVerModal.addEventListener("click", fecharModalVer);
    if (btnFecharVerModal) btnFecharVerModal.addEventListener("click", fecharModalVer);
    if (modalVer) {
        modalVer.addEventListener("click", function(e) {
            if (e.target === modalVer) fecharModalVer();
        });
    }

    function alternarAbaVerModal(aba) {
        if (aba === 'apresentacoes') {
            if (painelVerApresentacoes) painelVerApresentacoes.style.display = 'block';
            if (painelVerAcervo) painelVerAcervo.style.display = 'none';
            if (tabBtnVerApresentacoes) {
                tabBtnVerApresentacoes.style.color = '#0052ff';
                tabBtnVerApresentacoes.style.borderBottom = '2px solid #0052ff';
            }
            if (tabBtnVerAcervo) {
                tabBtnVerAcervo.style.color = '#64748b';
                tabBtnVerAcervo.style.borderBottom = '2px solid transparent';
            }
        } else {
            if (painelVerApresentacoes) painelVerApresentacoes.style.display = 'none';
            if (painelVerAcervo) painelVerAcervo.style.display = 'block';
            if (tabBtnVerAcervo) {
                tabBtnVerAcervo.style.color = '#0052ff';
                tabBtnVerAcervo.style.borderBottom = '2px solid #0052ff';
            }
            if (tabBtnVerApresentacoes) {
                tabBtnVerApresentacoes.style.color = '#64748b';
                tabBtnVerApresentacoes.style.borderBottom = '2px solid transparent';
            }
            carregarAcervoDaPastaNoModal(currentModalProjId);
        }
    }

    if (tabBtnVerApresentacoes) tabBtnVerApresentacoes.addEventListener("click", () => alternarAbaVerModal('apresentacoes'));
    if (tabBtnVerAcervo) tabBtnVerAcervo.addEventListener("click", () => alternarAbaVerModal('acervo'));

    async function carregarAcervoDaPastaNoModal(projId) {
        if (!projId || !modalAcervoPastaConteudo) return;
        modalAcervoPastaConteudo.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-arrow-repeat spin fs-2 text-primary d-block mb-2"></i>
                <p>Carregando acervo compartilhado...</p>
            </div>
        `;

        try {
            const resp = await fetch(`/projetos/${projId}/acervo`);
            const data = await resp.json();
            if (!resp.ok || data.status !== 'sucesso') {
                modalAcervoPastaConteudo.innerHTML = `<div class="text-danger text-center py-3">Erro ao carregar acervo.</div>`;
                return;
            }

            const slides = data.slides || [];
            const midias = data.dados_manuais?.midias || [];

            if (slides.length === 0) {
                modalAcervoPastaConteudo.innerHTML = `
                    <div class="text-center py-4 text-muted">
                        <i class="bi bi-folder-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
                        <p class="mb-0">Nenhum slide compartilhado nesta pasta ainda.</p>
                        <small>Crie apresentações nesta pasta para que os slides fiquem acessíveis para reuso.</small>
                    </div>
                `;
                return;
            }

            let acervoHtml = `
                <div class="alert alert-info py-2 px-3 small mb-3 d-flex align-items-center justify-content-between">
                    <span><i class="bi bi-info-circle me-1"></i> <strong>${slides.length}</strong> slide(s) e <strong>${midias.length}</strong> mídia(s) disponíveis para reuso entre as apresentações desta pasta.</span>
                </div>
            `;

            slides.forEach((s) => {
                acervoHtml += `
                    <div class="apresentacao-row-item">
                        <div style="min-width: 0;">
                            <div class="fw-semibold text-dark mb-1 d-flex align-items-center gap-2">
                                <span class="badge bg-light text-primary border" style="font-size: 0.72rem;">Slide #${s.ordem}</span>
                                <span class="text-truncate" style="max-width: 250px;">${s.titulo || 'Slide sem título'}</span>
                            </div>
                            <div class="text-muted small">
                                <span>Apresentação: <strong>${s.apresentacao_nome}</strong></span> • 
                                <span class="badge bg-secondary-subtle text-secondary" style="font-size: 0.7rem;">${s.template_nome || s.template}</span>
                            </div>
                        </div>
                        <div>
                            <a href="/apresentacao/editar/${s.apresentacao_id}" class="btn btn-sm btn-outline-primary rounded-3 px-3 d-inline-flex align-items-center gap-1">
                                <i class="bi bi-pencil-square"></i> Abrir
                            </a>
                        </div>
                    </div>
                `;
            });

            modalAcervoPastaConteudo.innerHTML = acervoHtml;
        } catch (err) {
            console.error("Erro ao buscar acervo da pasta:", err);
            modalAcervoPastaConteudo.innerHTML = `<div class="text-danger text-center py-3">Erro ao buscar dados do acervo.</div>`;
        }
    }

    // Clique em "Ver Projetos" nos cards
    document.querySelectorAll(".btn-ver-projeto").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            const projId = this.getAttribute("data-proj-id");
            const projNome = this.getAttribute("data-proj-nome");
            currentModalProjId = projId;
            const projData = projetosMap[projId] || { nome: projNome, apresentacoes: [] };

            alternarAbaVerModal('apresentacoes');

            if (modalVerProjTitulo) {
                modalVerProjTitulo.textContent = `Pasta: ${projData.nome}`;
            }

            if (modalBtnCriarNestaPasta) {
                modalBtnCriarNestaPasta.href = `/apresentacao/criar?projeto_id=${projId}`;
            }

            if (modalApresentacoesConteudo) {
                if (projData.apresentacoes && projData.apresentacoes.length > 0) {
                    let itemsHtml = '';
                    projData.apresentacoes.forEach(ap => {
                        itemsHtml += `
                            <div class="apresentacao-row-item">
                                <div>
                                    <div class="fw-semibold text-dark mb-1">
                                        <i class="bi bi-file-earmark-slides text-primary me-2"></i>${ap.nome}
                                    </div>
                                    <div class="text-muted small">
                                        <span>${ap.slides_count} slide(s)</span> • 
                                        <span>Criado em ${ap.data_criacao}</span>
                                    </div>
                                </div>
                                <div style="display:flex; gap:6px;">
                                    <a href="${ap.editar_url}" class="btn btn-sm btn-primary rounded-3 px-3 d-inline-flex align-items-center gap-1" style="background: #0052ff; border:none;">
                                        <i class="bi bi-pencil-square"></i> Editar
                                    </a>
                                    <button type="button" class="btn btn-sm btn-delete-apresentacao" data-id="${ap.id}" data-nome="${ap.nome}" onclick="excluirApresentacaoBtn(event, this)" style="background: #fff0f2; color: #e11d48; border: 1px solid #ffe4e6; flex: 0 0 auto;" title="Excluir Apresentação">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    });
                    modalApresentacoesConteudo.innerHTML = itemsHtml;
                } else {
                    modalApresentacoesConteudo.innerHTML = `
                        <div class="text-center py-4 text-muted">
                            <i class="bi bi-folder-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
                            <p class="mb-2">Nenhuma apresentação salva nesta pasta ainda.</p>
                            <a href="/apresentacao/criar?projeto_id=${projId}" class="btn btn-sm btn-outline-primary rounded-3">
                                <i class="bi bi-plus-lg me-1"></i> Criar primeira apresentação
                            </a>
                        </div>
                    `;
                }
            }

            if (modalVer) modalVer.classList.add("show");
        });
    });

    // --- MODAL & CRIAÇÃO DE PROJETOS ---
    const btnNovoProjeto = document.getElementById("btnNovoProjeto");
    const modalNovoProjeto = document.getElementById("modalNovoProjeto");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnCancelModal = document.getElementById("btnCancelModal");
    const inputNomeProjeto = document.getElementById("inputNomeProjeto");
    const inputDescProjeto = document.getElementById("inputDescProjeto");
    const inputCorProjeto = document.getElementById("inputCorProjeto");

    function openModalNovo() {
        if (!modalNovoProjeto) return;
        if (inputNomeProjeto) inputNomeProjeto.value = "";
        if (inputDescProjeto) inputDescProjeto.value = "";
        if (inputCorProjeto) inputCorProjeto.value = "#0052ff";
        modalNovoProjeto.classList.add("show");
        if (inputNomeProjeto) inputNomeProjeto.focus();
    }

    function closeModalNovo() {
        if (!modalNovoProjeto) return;
        modalNovoProjeto.classList.remove("show");
    }

    if (btnNovoProjeto) btnNovoProjeto.addEventListener("click", openModalNovo);
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModalNovo);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModalNovo);
    if (modalNovoProjeto) {
        modalNovoProjeto.addEventListener("click", (e) => {
            if (e.target === modalNovoProjeto) closeModalNovo();
        });
    }

    // Modal Editar Pasta
    const modalEditarProjeto = document.getElementById('modalEditarProjeto');
    const formEditarProjeto = document.getElementById('formEditarProjeto');
    const btnCloseEditarModal = document.getElementById('btnCloseEditarModal');
    const btnCancelEditarModal = document.getElementById('btnCancelEditarModal');
    const inputEditNomeProjeto = document.getElementById('inputEditNomeProjeto');
    const inputEditDescProjeto = document.getElementById('inputEditDescProjeto');
    const inputEditCorProjeto = document.getElementById('inputEditCorProjeto');

    function fecharModalEditar() {
        if (modalEditarProjeto) modalEditarProjeto.classList.remove('show');
    }

    if (btnCloseEditarModal) btnCloseEditarModal.addEventListener('click', fecharModalEditar);
    if (btnCancelEditarModal) btnCancelEditarModal.addEventListener('click', fecharModalEditar);
    if (modalEditarProjeto) {
        modalEditarProjeto.addEventListener('click', e => {
            if (e.target === modalEditarProjeto) fecharModalEditar();
        });
    }

    // Delegação de cliques para botões dinâmicos
    document.body.addEventListener('click', function(e) {
        const btnDeleteProj = e.target.closest('.btn-delete-projeto, .btn-delete-projeto-real');
        if (btnDeleteProj) {
            window.excluirProjetoBtn(e, btnDeleteProj);
            return;
        }

        const btnDeleteAp = e.target.closest('.btn-delete-apresentacao');
        if (btnDeleteAp) {
            window.excluirApresentacaoBtn(e, btnDeleteAp);
            return;
        }

        const btnEditProj = e.target.closest('.btn-editar-projeto');
        if (btnEditProj) {
            e.preventDefault();
            e.stopPropagation();
            const projId = btnEditProj.getAttribute('data-proj-id');
            const projNome = btnEditProj.getAttribute('data-proj-nome');
            const projDesc = btnEditProj.getAttribute('data-proj-desc');
            const projCor = btnEditProj.getAttribute('data-proj-cor');

            if (formEditarProjeto) {
                formEditarProjeto.action = `/projetos/editar/${projId}`;
            }
            if (inputEditNomeProjeto) inputEditNomeProjeto.value = projNome;
            if (inputEditDescProjeto) inputEditDescProjeto.value = projDesc;
            if (inputEditCorProjeto) inputEditCorProjeto.value = projCor || "#0052ff";

            if (modalEditarProjeto) modalEditarProjeto.classList.add('show');
        }
    });
});
