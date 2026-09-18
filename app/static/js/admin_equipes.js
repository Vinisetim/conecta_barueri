document.addEventListener("DOMContentLoaded", function() {
    const btnNovaEquipe = document.getElementById("btnNovaEquipe");
    const projectsGrid = document.getElementById("projectsGrid");

    // Modal elements
    const modalNovaEquipe = document.getElementById("modalNovaEquipe");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnCancelModal = document.getElementById("btnCancelModal");
    const btnSaveEquipe = document.getElementById("btnSaveEquipe");
    const inputNomeEquipe = document.getElementById("inputNomeEquipe");
    const inputImagemEquipe = document.getElementById("inputImagemEquipe");

    // Funções para abrir e fechar o modal
    function openModal() {
        inputNomeEquipe.value = "";
        inputImagemEquipe.value = ""; // reseta o arquivo
        modalNovaEquipe.classList.add("show");
        inputNomeEquipe.focus();
    }

    function closeModal() {
        modalNovaEquipe.classList.remove("show");
    }

    if (btnNovaEquipe) btnNovaEquipe.addEventListener("click", openModal);
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

    // Fechar modal ao clicar fora
    if (modalNovaEquipe) {
        modalNovaEquipe.addEventListener("click", (e) => {
            if (e.target === modalNovaEquipe) {
                closeModal();
            }
        });
    }

    // Salvar Nova Equipe
    if (btnSaveEquipe) {
        btnSaveEquipe.addEventListener("click", () => {
            const nome = inputNomeEquipe.value.trim();
            if (!nome) {
                alert("Por favor, digite o nome da equipe.");
                inputNomeEquipe.focus();
                return;
            }

            let imageUrl = null;
            const file = inputImagemEquipe.files[0];
            if (file) {
                // Cria uma URL local temporária para a imagem selecionada
                imageUrl = URL.createObjectURL(file);
            }

            adicionarEquipe(nome, imageUrl);
            closeModal();
        });
    }

    // Remover equipe (Event Delegation)
    if (projectsGrid) {
        projectsGrid.addEventListener("click", (e) => {
            const btnDelete = e.target.closest(".btn-delete-equipe");
            
            if (btnDelete) {
                // Impede que o clique no botão dispare eventos no card inteiro
                e.stopPropagation();
                
                const card = btnDelete.closest(".project-card");
                const nome = card.dataset.title || "esta equipe";
                
                if (confirm(`Tem certeza que deseja remover ${nome}?`)) {
                    // Efeito suave de saída
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

    // Função para criar o HTML do card dinamicamente
    function adicionarEquipe(nome, imageUrl) {
        // Pega data atual formatada
        const dateStr = new Intl.DateTimeFormat('pt-BR', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        }).format(new Date()).replace(" de ", " ");
        
        let thumbStyle = "";
        
        if (imageUrl) {
            // Se tiver imagem, define como background image e adiciona classe para cobrir
            thumbStyle = `background-image: url('${imageUrl}');`;
        } else {
            // Cores aleatórias para o gradient do thumb para dar variedade visual
            const gradientColors = [
                'linear-gradient(135deg, #0a1628 0%, #1a3a6e 60%, #0052ff 100%)',
                'linear-gradient(135deg, #0a280a 0%, #1a6e2a 60%, #1aaa3a 100%)',
                'linear-gradient(135deg, #1a0a28 0%, #3a1a6e 60%, #6a1aff 100%)',
                'linear-gradient(135deg, #280a0a 0%, #6e1a1a 60%, #c0390e 100%)',
                'linear-gradient(135deg, #0f2a45 0%, #1e5f8a 60%, #2196f3 100%)'
            ];
            const randomGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];
            thumbStyle = `background: ${randomGradient};`;
        }

        // Iniciais para o avatar
        const initials = nome.substring(0, 2).toUpperCase();
        
        // Classe adicional se tiver bg image
        const thumbClass = imageUrl ? "card-thumb card-thumb-bg" : "card-thumb";

        const html = `
            <div class="project-card" data-title="${nome}" style="opacity: 0; transform: scale(0.9);">
                <div class="${thumbClass}" style="${thumbStyle}">
                    <div class="thumb-mock" style="${imageUrl ? 'display:none;' : ''}">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div class="thumb-circle"></div>
                            <div class="thumb-chart">
                                <div class="thumb-bar" style="height:40px;"></div>
                                <div class="thumb-bar" style="height:55px;"></div>
                                <div class="thumb-bar" style="height:30px;"></div>
                                <div class="thumb-bar" style="height:48px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body-proj">
                    <div class="card-creator">
                        <div class="creator-avatar" style="background:#0052ff;">${initials}</div>
                        <div class="creator-info">
                            <div class="creator-name">${nome}</div>
                            <div class="creator-date"><i class="bi bi-calendar3" style="font-size:10px;"></i> Criado em ${dateStr}</div>
                        </div>
                        <div class="creator-actions">
                            <button class="btn-delete-equipe" title="Remover equipe"><i class="bi bi-trash text-danger"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adiciona ao DOM
        projectsGrid.insertAdjacentHTML('beforeend', html);
        
        // Anima a entrada do novo card
        const newCard = projectsGrid.lastElementChild;
        requestAnimationFrame(() => {
            newCard.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            newCard.style.opacity = "1";
            newCard.style.transform = "scale(1)";
        });
    }
});