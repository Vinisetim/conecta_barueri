document.addEventListener("DOMContentLoaded", function() {
    
    // --- MODAL & CRIAÇÃO DE PROJETOS ---
    const btnNovoProjeto = document.getElementById("btnNovoProjeto");
    const modalNovoProjeto = document.getElementById("modalNovoProjeto");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnCancelModal = document.getElementById("btnCancelModal");
    const btnSaveProjeto = document.getElementById("btnSaveProjeto");
    
    const inputNomeProjeto = document.getElementById("inputNomeProjeto");
    const inputDescProjeto = document.getElementById("inputDescProjeto");
    const selectCategoriaProjeto = document.getElementById("selectCategoriaProjeto");
    const cardsGrid = document.getElementById("cardsGrid");

    function openModal() {
        if (!modalNovoProjeto) return;
        inputNomeProjeto.value = "";
        inputDescProjeto.value = "";
        selectCategoriaProjeto.value = "saude";
        modalNovoProjeto.classList.add("show");
        inputNomeProjeto.focus();
    }

    function closeModal() {
        if (!modalNovoProjeto) return;
        modalNovoProjeto.classList.remove("show");
    }

    if (btnNovoProjeto) btnNovoProjeto.addEventListener("click", openModal);
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

    // Fechar ao clicar fora
    if (modalNovoProjeto) {
        modalNovoProjeto.addEventListener("click", (e) => {
            if (e.target === modalNovoProjeto) {
                closeModal();
            }
        });
    }

    // Salvar Novo Projeto via Backend
    const formNovoProjeto = modalNovoProjeto ? modalNovoProjeto.querySelector("form") : null;
    if (formNovoProjeto) {
        formNovoProjeto.addEventListener("submit", async function(e) {
            e.preventDefault();
            const nome = inputNomeProjeto.value.trim();
            const desc = inputDescProjeto ? inputDescProjeto.value.trim() : "";
            
            if (!nome) {
                alert("Por favor, digite o nome do projeto (pasta).");
                inputNomeProjeto.focus();
                return;
            }

            try {
                const response = await fetch("/projetos/criar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: nome, descricao: desc })
                });
                const res = await response.json();
                if (response.ok && res.status === "sucesso") {
                    window.location.reload();
                } else {
                    alert(res.mensagem || "Erro ao criar pasta.");
                }
            } catch (err) {
                formNovoProjeto.submit();
            }
        });
    }

    // --- DELETAÇÃO DE PROJETOS ---
    if (cardsGrid) {
        cardsGrid.addEventListener("click", (e) => {
            const btnDelete = e.target.closest(".btn-delete-projeto");
            if (btnDelete) {
                e.stopPropagation();
                e.preventDefault();
                
                const card = btnDelete.closest(".ap-card-item");
                const nome = card.dataset.title || "este projeto";
                
                if (confirm(`Tem certeza que deseja remover ${nome}? Essa ação não pode ser desfeita e excluirá as apresentações contidas.`)) {
                    card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.9)";
                    
                    setTimeout(() => {
                        card.remove();
                    }, 300);
                }
            }
        });
    }

    // Função para criar HTML do card do projeto dinamicamente
    function adicionarProjeto(nome, desc, categoria, categoriaNome) {
        const dateStr = new Intl.DateTimeFormat('pt-BR', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        }).format(new Date()).replace(" de ", " ");
        
        const avatarStr = "VC"; // "Você"
        const usernameStr = "Seu Usuário";
        
        // Determina cores para os thumbs baseados na categoria
        // (Isso deve espelhar o CSS thumb-saude, thumb-educacao, etc.)
        const html = `
            <article class="ap-card-item" data-status="draft" data-modulo="${categoria}" data-title="${nome}" style="opacity: 0; transform: scale(0.9);">
                <div class="card-thumb thumb-${categoria}" style="align-items: center; justify-content: center; padding: 20px;">
                    <i class="bi bi-folder-fill" style="font-size: 4.5rem; color: rgba(255,255,255,0.95); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15));"></i>
                </div>
                <div class="card-body-ap">
                    <div class="card-meta-top">
                        <span class="badge-modulo ${categoria}">${categoriaNome}</span>
                        <span class="badge-status" style="color: #667085;"><i class="bi bi-file-earmark-slides"></i> 0 Apresentações</span>
                    </div>
                    <h5 class="card-title">${nome}</h5>
                    <p class="card-desc">${desc}</p>
                    <div class="card-creator">
                        <div class="creator-avatar ${categoria}">${avatarStr}</div>
                        <div class="creator-info">
                            <div class="creator-name">${usernameStr}</div>
                            <div class="creator-date"><i class="bi bi-clock"></i> Atualizado agora</div>
                        </div>
                    </div>
                    <div class="card-footer-ap">
                        <a href="/apresentacao" class="btn-card-action" style="background: var(--primary); color: white;">
                            <i class="bi bi-folder2-open"></i> Abrir Projeto
                        </a>
                        <button type="button" class="btn-card-action btn-delete-projeto" style="background: #fcfdff; color: #dc3545; border: 1px solid var(--border-soft); flex: 0 0 auto; padding: 8px 12px;" title="Excluir Projeto">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;

        // Adiciona ao topo (depois do card de criar novo, se ele existisse. Como removemos o criar novo card, vai direto no container)
        cardsGrid.insertAdjacentHTML('afterbegin', html);
        
        const newCard = cardsGrid.firstElementChild;
        requestAnimationFrame(() => {
            newCard.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            newCard.style.opacity = "1";
            newCard.style.transform = "scale(1)";
        });
    }

});

// --- FUNÇÕES GLOBAIS DE FILTRO (Chamadas pelos onkeyup/onchange do HTML) ---
window.filterCards = function() {
    const searchInput = document.getElementById("searchInput");
    const moduloFilter = document.getElementById("moduloFilter");
    const statusFilter = document.getElementById("statusFilter");
    
    if (!searchInput || !moduloFilter || !statusFilter) return;

    const searchVal = (searchInput.value || "").toLowerCase();
    const moduloVal = moduloFilter.value;
    const statusVal = statusFilter.value; // Isso pode ser reaproveitado se introduzirmos status real depois, no momento estamos usando pastas com qtds.
    
    const cards = document.querySelectorAll(".ap-card-item");

    cards.forEach(card => {
        const title = (card.getAttribute("data-title") || "").toLowerCase();
        const modulo = card.getAttribute("data-modulo") || "";
        const status = card.getAttribute("data-status") || "";

        const matchesSearch = !searchVal || title.includes(searchVal);
        const matchesModulo = !moduloVal || modulo === moduloVal;
        
        // Se statusFilter estiver sendo usado para 'draft' / 'published', mas agora temos apenas texto no badge
        // Podemos deixar passar tudo por enquanto ou apenas matching
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
