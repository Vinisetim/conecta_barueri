document.addEventListener("DOMContentLoaded", function() {
    const btnNovaEquipe = document.getElementById("btnNovaEquipe");
    const projectsGrid = document.getElementById("projectsGrid");

    // Adicionar nova equipe
    if (btnNovaEquipe) {
        btnNovaEquipe.addEventListener("click", () => {
            const nomeEquipe = prompt("Digite o nome da nova equipe:");
            
            if (nomeEquipe && nomeEquipe.trim() !== "") {
                adicionarEquipe(nomeEquipe.trim());
            }
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
    function adicionarEquipe(nome) {
        // Pega data atual formatada
        const dateStr = new Intl.DateTimeFormat('pt-BR', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        }).format(new Date()).replace(" de ", " ");
        
        // Cores aleatórias para o gradient do thumb para dar variedade visual
        const gradientColors = [
            'linear-gradient(135deg, #0a1628 0%, #1a3a6e 60%, #0052ff 100%)',
            'linear-gradient(135deg, #0a280a 0%, #1a6e2a 60%, #1aaa3a 100%)',
            'linear-gradient(135deg, #1a0a28 0%, #3a1a6e 60%, #6a1aff 100%)',
            'linear-gradient(135deg, #280a0a 0%, #6e1a1a 60%, #c0390e 100%)',
            'linear-gradient(135deg, #0f2a45 0%, #1e5f8a 60%, #2196f3 100%)'
        ];
        const randomGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

        // Iniciais para o avatar
        const initials = nome.substring(0, 2).toUpperCase();

        const html = `
            <div class="project-card" data-title="${nome}" style="opacity: 0; transform: scale(0.9);">
                <div class="card-thumb" style="background: ${randomGradient};">
                    <div class="thumb-mock">
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
