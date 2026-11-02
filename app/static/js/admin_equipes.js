document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "conecta_barueri_equipes_v2";
    const usuariosBanco = Array.isArray(window.USUARIOS_BANCO) ? window.USUARIOS_BANCO : [];

    // Elementos de Visão (Lista vs Detalhe da Equipe)
    const equipesListView = document.getElementById("equipesListView");
    const equipeDetalheView = document.getElementById("equipeDetalheView");
    const projectsGrid = document.getElementById("projectsGrid");
    const btnVoltarEquipes = document.getElementById("btnVoltarEquipes");

    // Elementos da Tela de Detalhes da Equipe
    const detalheCover = document.getElementById("detalheEquipeCover");
    const detalheAvatar = document.getElementById("detalheEquipeAvatar");
    const detalheNome = document.getElementById("detalheEquipeNome");
    const detalheData = document.getElementById("detalheEquipeData");
    const detalheQtdMembros = document.getElementById("detalheEquipeQtdMembros");
    const tabelaMembrosBody = document.getElementById("tabelaMembrosEquipeBody");
    const pesquisaMembroInput = document.getElementById("pesquisaMembroEquipe");

    // Modal Nova Equipe
    const btnNovaEquipe = document.getElementById("btnNovaEquipe");
    const modalNovaEquipe = document.getElementById("modalNovaEquipe");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnCancelModal = document.getElementById("btnCancelModal");
    const btnSaveEquipe = document.getElementById("btnSaveEquipe");
    const inputNomeEquipe = document.getElementById("inputNomeEquipe");
    const inputImagemEquipe = document.getElementById("inputImagemEquipe");
    const listaCheckMembrosNovaEquipe = document.getElementById("listaCheckMembrosNovaEquipe");

    // Modal Adicionar Membro
    const btnAbrirModalMembro = document.getElementById("btnAbrirModalMembro");
    const modalAdicionarMembro = document.getElementById("modalAdicionarMembro");
    const btnCloseModalMembro = document.getElementById("btnCloseModalMembro");
    const btnCancelModalMembro = document.getElementById("btnCancelModalMembro");
    const btnSalvarNovoMembro = document.getElementById("btnSalvarNovoMembro");
    const selectFuncionarioBanco = document.getElementById("selectFuncionarioBanco");
    const inputNomeMembro = document.getElementById("inputNomeMembro");
    const inputEmailMembro = document.getElementById("inputEmailMembro");
    const selectFuncaoMembro = document.getElementById("selectFuncaoMembro");

    let equipeAbertaId = null;

    function obterIniciais(nome) {
        if (!nome || !nome.trim()) return "EQ";
        const partes = nome
            .trim()
            .split(/\s+/)
            .filter(p => !["de", "da", "do", "dos", "das", "e"].includes(p.toLowerCase()));
        const lista = partes.length ? partes : nome.trim().split(/\s+/);
        if (lista.length >= 2) {
            return (lista[0][0] + lista[lista.length - 1][0]).toUpperCase();
        }
        return lista[0].substring(0, 2).toUpperCase();
    }

    // Membros padrão para a equipe inicial (mesclando usuários reais do banco)
    function gerarMembrosIniciaisPadrao() {
        if (usuariosBanco.length > 0) {
            return usuariosBanco.map((u, idx) => ({
                id: u.id || idx + 1,
                nome: u.nome,
                email: u.email,
                iniciais: u.iniciais || obterIniciais(u.nome),
                funcao: idx === 0 ? "Líder da Equipe" : (u.perfil || "Editor"),
                status: u.status || "Ativo"
            }));
        }
        return [
            {
                id: 1,
                nome: "Equipe de DEV",
                email: "dev@barueri.sp.gov.br",
                iniciais: "ED",
                funcao: "Líder da Equipe",
                status: "Ativo"
            }
        ];
    }

    function carregarEquipes() {
        try {
            const salvo = localStorage.getItem(STORAGE_KEY);
            if (salvo) {
                const parsed = JSON.parse(salvo);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("Erro ao ler equipes do localStorage:", e);
        }

        const inicial = [
            {
                id: "eq-uber",
                nome: "Uber",
                iniciais: "UB",
                criadoEm: "12 mai. 2026",
                corAvatar: "#0052ff",
                imageUrl: null,
                gradient: "linear-gradient(135deg, #0a1628 0%, #1a3a6e 60%, #0052ff 100%)",
                membros: gerarMembrosIniciaisPadrao()
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inicial));
        return inicial;
    }

    let equipes = carregarEquipes();

    function salvarEquipes() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(equipes));
        } catch (e) {
            console.warn("Não foi possível salvar no localStorage:", e);
        }
    }

    // =========================================================
    // RENDERIZAR GRID DE CARDS DE EQUIPES
    // =========================================================
    function renderizarGridEquipes() {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = "";

        equipes.forEach(eq => {
            const qtdMembros = Array.isArray(eq.membros) ? eq.membros.length : 0;
            const thumbClass = eq.imageUrl ? "card-thumb card-thumb-bg" : "card-thumb";
            const thumbStyle = eq.imageUrl
                ? `background-image: url('${eq.imageUrl}');`
                : `background: ${eq.gradient || "linear-gradient(135deg, #0a1628 0%, #1a3a6e 60%, #0052ff 100%)"};`;

            const miniAvatares = (eq.membros || [])
                .slice(0, 4)
                .map(m => `<span class="stack-mini-avatar" title="${m.nome}">${m.iniciais || obterIniciais(m.nome)}</span>`)
                .join("");

            const cardHtml = `
                <div class="project-card" data-id="${eq.id}" data-title="${eq.nome}">
                    <div class="${thumbClass}" style="${thumbStyle}">
                        <span class="card-members-pill">
                            <i class="bi bi-people-fill"></i>
                            ${qtdMembros} membro(s)
                        </span>
                        <div class="thumb-mock" style="${eq.imageUrl ? "display:none;" : ""}">
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
                            <div class="creator-avatar" style="background:${eq.corAvatar || "#0052ff"};">
                                ${eq.iniciais || obterIniciais(eq.nome)}
                            </div>
                            <div class="creator-info">
                                <div class="creator-name">${eq.nome}</div>
                                <div class="creator-date">
                                    <i class="bi bi-calendar3" style="font-size:10px;"></i>
                                    Criado em ${eq.criadoEm}
                                </div>
                            </div>
                            <div class="creator-actions">
                                <button class="btn-delete-equipe" type="button" title="Remover equipe">
                                    <i class="bi bi-trash text-danger"></i>
                                </button>
                            </div>
                        </div>

                        <div class="card-footer-members">
                            <div class="card-avatars-stack">
                                ${miniAvatares}
                            </div>
                            <span>Ver equipe <i class="bi bi-arrow-right"></i></span>
                        </div>
                    </div>
                </div>
            `;

            projectsGrid.insertAdjacentHTML("beforeend", cardHtml);
        });
    }

    // =========================================================
    // ABRIR TELA DE DETALHES DA EQUIPE E SEUS MEMBROS
    // =========================================================
    function abrirDetalheEquipe(equipeId) {
        const eq = equipes.find(item => String(item.id) === String(equipeId));
        if (!eq) return;

        equipeAbertaId = eq.id;

        if (detalheCover) {
            if (eq.imageUrl) {
                detalheCover.style.backgroundImage = `url('${eq.imageUrl}')`;
            } else {
                detalheCover.style.background =
                    eq.gradient || "linear-gradient(135deg, #0a1628 0%, #1a3a6e 60%, #0052ff 100%)";
            }
        }

        if (detalheAvatar) {
            detalheAvatar.textContent = eq.iniciais || obterIniciais(eq.nome);
            detalheAvatar.style.background = eq.corAvatar || "#0052ff";
        }

        if (detalheNome) detalheNome.textContent = eq.nome;
        if (detalheData) detalheData.textContent = `Criado em ${eq.criadoEm}`;
        if (pesquisaMembroInput) pesquisaMembroInput.value = "";

        renderizarTabelaMembrosEquipe();

        if (equipesListView) equipesListView.style.display = "none";
        if (equipeDetalheView) equipeDetalheView.classList.add("active");
    }

    function voltarParaListaEquipes() {
        equipeAbertaId = null;
        if (equipeDetalheView) equipeDetalheView.classList.remove("active");
        if (equipesListView) equipesListView.style.display = "block";
        renderizarGridEquipes();
    }

    function obterClasseFuncaoBadge(funcao) {
        if (funcao === "Líder da Equipe") return "lider";
        if (funcao === "Administrador") return "admin";
        return "editor";
    }

    function renderizarTabelaMembrosEquipe() {
        if (!tabelaMembrosBody) return;
        const eq = equipes.find(item => String(item.id) === String(equipeAbertaId));
        if (!eq) return;

        const listaMembros = Array.isArray(eq.membros) ? eq.membros : [];
        if (detalheQtdMembros) {
            detalheQtdMembros.textContent = `${listaMembros.length} membro(s)`;
        }

        const termo = (pesquisaMembroInput ? pesquisaMembroInput.value : "").toLowerCase().trim();
        const filtrados = listaMembros.filter(m => {
            const nome = (m.nome || "").toLowerCase();
            const email = (m.email || "").toLowerCase();
            return !termo || nome.includes(termo) || email.includes(termo);
        });

        tabelaMembrosBody.innerHTML = "";

        if (filtrados.length === 0) {
            tabelaMembrosBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:28px; color:#667085;">
                        Nenhum membro encontrado nesta equipe. Clique em <strong>+ Adicionar membro</strong> para vincular integrantes.
                    </td>
                </tr>
            `;
            return;
        }

        filtrados.forEach((membro, index) => {
            const iniciais = membro.iniciais || obterIniciais(membro.nome);
            const funcao = membro.funcao || "Editor";
            const status = membro.status || "Ativo";
            const statusClass = status === "Inativo" ? "inativo" : "ativo";

            tabelaMembrosBody.innerHTML += `
                <tr>
                    <td>
                        <div class="membro-user-cell">
                            <span class="membro-avatar">${iniciais}</span>
                            <strong>${membro.nome}</strong>
                        </div>
                    </td>
                    <td>${membro.email}</td>
                    <td>
                        <span class="membro-badge ${obterClasseFuncaoBadge(funcao)}">
                            ${funcao}
                        </span>
                    </td>
                    <td>
                        <span class="membro-badge ${statusClass}">
                            ${status}
                        </span>
                    </td>
                    <td>
                        <button
                            type="button"
                            class="btn-remove-membro"
                            data-membro-email="${membro.email}"
                            title="Remover membro da equipe"
                        >
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // Remover membro da equipe (delegação na tabela)
    if (tabelaMembrosBody) {
        tabelaMembrosBody.addEventListener("click", function (e) {
            const btnRemove = e.target.closest(".btn-remove-membro");
            if (!btnRemove) return;

            const emailAlvo = btnRemove.dataset.membroEmail;
            const eq = equipes.find(item => String(item.id) === String(equipeAbertaId));
            if (!eq || !Array.isArray(eq.membros)) return;

            const membro = eq.membros.find(m => m.email === emailAlvo);
            if (!confirm(`Deseja remover "${membro ? membro.nome : emailAlvo}" desta equipe?`)) return;

            eq.membros = eq.membros.filter(m => m.email !== emailAlvo);
            salvarEquipes();
            renderizarTabelaMembrosEquipe();
        });
    }

    if (pesquisaMembroInput) {
        pesquisaMembroInput.addEventListener("keyup", renderizarTabelaMembrosEquipe);
    }

    if (btnVoltarEquipes) {
        btnVoltarEquipes.addEventListener("click", voltarParaListaEquipes);
    }

    // =========================================================
    // CLIQUE NO CARD DE EQUIPE (ABRIR EQUIPE OU EXCLUIR EQUIPE)
    // =========================================================
    if (projectsGrid) {
        projectsGrid.addEventListener("click", function (e) {
            const btnDelete = e.target.closest(".btn-delete-equipe");
            const card = e.target.closest(".project-card");
            if (!card) return;

            const eqId = card.dataset.id;
            const eqNome = card.dataset.title || "esta equipe";

            if (btnDelete) {
                e.stopPropagation();
                if (confirm(`Tem certeza que deseja remover a equipe "${eqNome}"?`)) {
                    equipes = equipes.filter(item => String(item.id) !== String(eqId));
                    salvarEquipes();
                    renderizarGridEquipes();
                }
                return;
            }

            abrirDetalheEquipe(eqId);
        });
    }

    // =========================================================
    // MODAL 1: CRIAR NOVA EQUIPE COM SELEÇÃO DE MEMBROS DO BANCO
    // =========================================================
    function popularCheckboxesNovaEquipe() {
        if (!listaCheckMembrosNovaEquipe) return;
        if (usuariosBanco.length === 0) {
            listaCheckMembrosNovaEquipe.innerHTML = `<small>Nenhum usuário encontrado no banco.</small>`;
            return;
        }
        listaCheckMembrosNovaEquipe.innerHTML = usuariosBanco
            .map(
                (u, i) => `
                <label class="membro-check-item">
                    <input type="checkbox" value="${u.id}" ${i === 0 ? "checked" : ""}>
                    <div>
                        <strong>${u.nome}</strong>
                        <div style="font-size:0.75rem;color:#667085;">${u.email} • ${u.perfil}</div>
                    </div>
                </label>
            `
            )
            .join("");
    }

    function openModalNovaEquipe() {
        if (inputNomeEquipe) inputNomeEquipe.value = "";
        if (inputImagemEquipe) inputImagemEquipe.value = "";
        popularCheckboxesNovaEquipe();
        modalNovaEquipe?.classList.add("show");
        inputNomeEquipe?.focus();
    }

    function closeModalNovaEquipe() {
        modalNovaEquipe?.classList.remove("show");
    }

    btnNovaEquipe?.addEventListener("click", openModalNovaEquipe);
    btnCloseModal?.addEventListener("click", closeModalNovaEquipe);
    btnCancelModal?.addEventListener("click", closeModalNovaEquipe);

    modalNovaEquipe?.addEventListener("click", e => {
        if (e.target === modalNovaEquipe) closeModalNovaEquipe();
    });

    btnSaveEquipe?.addEventListener("click", () => {
        const nome = (inputNomeEquipe ? inputNomeEquipe.value : "").trim();
        if (!nome) {
            alert("Por favor, digite o nome da equipe.");
            inputNomeEquipe?.focus();
            return;
        }

        const selecionadosIds = Array.from(
            listaCheckMembrosNovaEquipe
                ? listaCheckMembrosNovaEquipe.querySelectorAll('input[type="checkbox"]:checked')
                : []
        ).map(cb => Number(cb.value));

        const membrosSelecionados = usuariosBanco
            .filter(u => selecionadosIds.includes(Number(u.id)))
            .map((u, idx) => ({
                id: u.id,
                nome: u.nome,
                email: u.email,
                iniciais: u.iniciais || obterIniciais(u.nome),
                funcao: idx === 0 ? "Líder da Equipe" : (u.perfil || "Editor"),
                status: u.status || "Ativo"
            }));

        const gradientColors = [
            "linear-gradient(135deg, #0a1628 0%, #1a3a6e 60%, #0052ff 100%)",
            "linear-gradient(135deg, #0a280a 0%, #1a6e2a 60%, #1aaa3a 100%)",
            "linear-gradient(135deg, #1a0a28 0%, #3a1a6e 60%, #6a1aff 100%)",
            "linear-gradient(135deg, #280a0a 0%, #6e1a1a 60%, #c0390e 100%)",
            "linear-gradient(135deg, #0f2a45 0%, #1e5f8a 60%, #2196f3 100%)"
        ];
        const randomGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

        const dateStr = new Intl.DateTimeFormat("pt-BR", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
            .format(new Date())
            .replace(" de ", " ");

        const criarRegistroEquipe = imageUrl => {
            const novaEquipe = {
                id: "eq-" + Date.now(),
                nome: nome,
                iniciais: obterIniciais(nome),
                criadoEm: dateStr,
                corAvatar: "#0052ff",
                imageUrl: imageUrl || null,
                gradient: randomGradient,
                membros: membrosSelecionados
            };
            equipes.push(novaEquipe);
            salvarEquipes();
            renderizarGridEquipes();
            closeModalNovaEquipe();
        };

        const file = inputImagemEquipe?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => criarRegistroEquipe(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            criarRegistroEquipe(null);
        }
    });

    // =========================================================
    // MODAL 2: ADICIONAR MEMBRO NA EQUIPE ABERTA
    // =========================================================
    function openModalMembro() {
        if (!equipeAbertaId) return;

        if (selectFuncionarioBanco) {
            selectFuncionarioBanco.innerHTML =
                `<option value="">-- Escolher funcionário do banco ou digitar abaixo --</option>` +
                usuariosBanco
                    .map(u => `<option value="${u.id}">${u.nome} (${u.email})</option>`)
                    .join("");
        }

        if (inputNomeMembro) inputNomeMembro.value = "";
        if (inputEmailMembro) inputEmailMembro.value = "";
        if (selectFuncaoMembro) selectFuncaoMembro.value = "Editor";

        modalAdicionarMembro?.classList.add("show");
        inputNomeMembro?.focus();
    }

    function closeModalMembro() {
        modalAdicionarMembro?.classList.remove("show");
    }

    selectFuncionarioBanco?.addEventListener("change", function () {
        const idEscolhido = Number(this.value);
        const u = usuariosBanco.find(item => Number(item.id) === idEscolhido);
        if (u) {
            if (inputNomeMembro) inputNomeMembro.value = u.nome || "";
            if (inputEmailMembro) inputEmailMembro.value = u.email || "";
            if (selectFuncaoMembro) {
                selectFuncaoMembro.value = u.perfil === "Administrador" ? "Administrador" : "Editor";
            }
        }
    });

    btnAbrirModalMembro?.addEventListener("click", openModalMembro);
    btnCloseModalMembro?.addEventListener("click", closeModalMembro);
    btnCancelModalMembro?.addEventListener("click", closeModalMembro);

    modalAdicionarMembro?.addEventListener("click", e => {
        if (e.target === modalAdicionarMembro) closeModalMembro();
    });

    btnSalvarNovoMembro?.addEventListener("click", function () {
        const nome = (inputNomeMembro ? inputNomeMembro.value : "").trim();
        const email = (inputEmailMembro ? inputEmailMembro.value : "").trim().toLowerCase();
        const funcao = selectFuncaoMembro ? selectFuncaoMembro.value : "Editor";

        if (!nome || !email) {
            alert("Preencha o nome e o e-mail do membro.");
            return;
        }

        const eq = equipes.find(item => String(item.id) === String(equipeAbertaId));
        if (!eq) return;

        if (!Array.isArray(eq.membros)) eq.membros = [];

        if (eq.membros.some(m => (m.email || "").toLowerCase() === email)) {
            alert("Este membro já faz parte desta equipe.");
            return;
        }

        eq.membros.push({
            id: Date.now(),
            nome: nome,
            email: email,
            iniciais: obterIniciais(nome),
            funcao: funcao,
            status: "Ativo"
        });

        salvarEquipes();
        renderizarTabelaMembrosEquipe();
        closeModalMembro();
    });

    // Inicializa a grade de equipes
    renderizarGridEquipes();
});
