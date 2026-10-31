document.addEventListener("DOMContentLoaded", function() {
    const ODS_OPTIONS = {
        "1":  { num: "1",  label: "Erradicação da Pobreza",            color: "#E5243B" },
        "2":  { num: "2",  label: "Fome Zero",                          color: "#DDA63A" },
        "3":  { num: "3",  label: "Saúde e Bem-Estar",                  color: "#4C9F38" },
        "4":  { num: "4",  label: "Educação de Qualidade",              color: "#C5192D" },
        "5":  { num: "5",  label: "Igualdade de Género",                color: "#FF3A21" },
        "6":  { num: "6",  label: "Água Potável e Saneamento",          color: "#26BDE2" },
        "7":  { num: "7",  label: "Energia Acessível e Limpa",          color: "#FCC30B" },
        "8":  { num: "8",  label: "Trabalho e Crescimento",             color: "#A21942" },
        "9":  { num: "9",  label: "Inovação e Infraestrutura",          color: "#FD6925" },
        "10": { num: "10", label: "Redução das Desigualdades",          color: "#DD1367" },
        "11": { num: "11", label: "Cidades Sustentáveis",               color: "#FD9D24" },
        "12": { num: "12", label: "Consumo Responsável",                color: "#BF8B2E" },
        "13": { num: "13", label: "Ação Climática",                     color: "#3F7E44" },
        "14": { num: "14", label: "Vida na Água",                       color: "#0A97D9" },
        "15": { num: "15", label: "Vida Terrestre",                     color: "#56C02B" },
        "16": { num: "16", label: "Paz e Instituições Eficazes",        color: "#00689D" },
        "17": { num: "17", label: "Parcerias e Meios de Implementação", color: "#19486A" }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const initialTemplate = urlParams.get('template') || "capa";

        const dadosScript = document.getElementById("dadosIniciaisApresentacao");
    let initData = {};
    if (dadosScript) {
        try {
            initData = JSON.parse(dadosScript.textContent);
        } catch (e) {
            console.error("Erro ao fazer parse dos dados iniciais da apresentação:", e);
        }
    }

    let slides = (initData.slides && initData.slides.length > 0) ? initData.slides : [{
        "id": 1,
        "template": "capa",
        "titulo": "Capa",
        "subtitulo": "Apresentação Executiva - Indicadores Municipais",
        "logos": ["barueri"],
        "customLogoImg": null,
        "ods": true,
        "odsNums": ["11"],
        "qr": false,
        "qrLink": "",
        "bgCapa": null,
        "imgTexto": null,
        "chartType": "line",
        "chartIndicador": 1,
        "periodo": "Últimos 12 meses",
        "indicadores": [],
        "tamanhoTitulo": 4.0,
        "tamanhoSubtitulo": 1.8,
        "corTitulo": "#0f172a",
        "corSubtitulo": "#64748b"
    }];

    window.apresentacaoId = initData.apresentacaoId !== undefined ? initData.apresentacaoId : null;
    window.projetoId = initData.projetoId !== undefined ? initData.projetoId : null;
    const salvarUrl = initData.salvarUrl || "/apresentacao/salvar";

    let activeSlideId = (slides && slides.length > 0) ? slides[0].id : 1;
    let slideCounter = (slides && slides.length > 0) ? slides.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0) : 1;
    if (slideCounter < 1) slideCounter = 1;

    let slideChartInstance = null;

    const selectTemplate = document.getElementById("selectTemplate");
    const layoutCapa = document.querySelector(".layout-capa");
    const layoutImgTexto = document.querySelector(".layout-imagem-texto");
    const layoutIndicadores = document.querySelector(".layout-indicadores");
    const layoutGrafico = document.querySelector(".layout-grafico");

    const tplCapa = document.querySelectorAll(".tpl-capa");
    const tplImgTexto = document.querySelectorAll(".tpl-imgtexto");
    const tplIndicadores = document.querySelectorAll(".tpl-indicadores");
    const tplGrafico = document.querySelectorAll(".tpl-grafico");

    const labelTitulo = document.getElementById("labelTitulo");
    const labelSubtitulo = document.getElementById("labelSubtitulo");
    const fgSubtitulo = document.querySelector(".fg-subtitulo");

    const inputTitulo = document.getElementById("inputTitulo");
    const inputSubtitulo = document.getElementById("inputSubtitulo");

    const slotODS = document.getElementById("slotODS");
    const slotQRCode = document.getElementById("slotQRCode");

    const chkLogoItems = document.querySelectorAll(".chk-logo-item");
    const chkLogoCustom = document.getElementById("chkLogoCustom");
    const fgLogoCustom = document.getElementById("fgLogoCustom");
    const inputUploadLogoCustom = document.getElementById("inputUploadLogoCustom");

    const toggleODS = document.getElementById("toggleODS");
    const toggleQR = document.getElementById("toggleQR");
    const fgODSSelect = document.getElementById("fgODSSelect");
    const odsSelectsContainer = document.getElementById("odsSelectsContainer");
    const btnAddOds = document.getElementById("btnAddOds");
    const fgQRLink = document.getElementById("fgQRLink");
    const inputQRLink = document.getElementById("inputQRLink");
    const qrCodeImg = document.getElementById("qrCodeImg");
    const qrCodePlaceholder = document.getElementById("qrCodePlaceholder");

    const btnNovoSlide = document.getElementById("btnNovoSlide");
    const slidesThumbsList = document.getElementById("slidesThumbsList");

    // Novos elementos para upload de imagem
    const btnUploadBgCapa = document.getElementById("btnUploadBgCapa");
    const inputUploadBgCapa = document.getElementById("inputUploadBgCapa");
    const bgCapaThumbPreview = document.getElementById("bgCapaThumbPreview");

    const btnUploadImgTexto = document.getElementById("btnUploadImgTexto");
    const inputUploadImgTexto = document.getElementById("inputUploadImgTexto");
    const imgTextoThumbPreview = document.getElementById("imgTextoThumbPreview");
    const activeSlideSurface = document.getElementById("activeSlideSurface");
    const imgTextoCanvasImg = document.querySelector(".it-img"); // a imagem no template Imagem+Texto

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function buildLogosHtml(slide, isMini = false) {
        const logos = slide.logos || ["barueri"];
        if (logos.length === 0) return "";

        const hasBg = !!slide.bgGeral; // For main canvas, css classes handle color usually, but we will force white if it has bg.
        const textColor = hasBg ? '#ffffff' : '#0f172a';
        const barueriColor = hasBg ? '#ffffff' : '#0284c7';

        // Base scales
        const scale = isMini ? 1 : 2; // mini uses fixed px, main uses cqw (approximated here)

        let html = `<div style="display:flex; align-items:center; gap:${isMini ? '6px' : '2cqw'}; flex-wrap:wrap; margin-bottom:${isMini ? '2px' : '0'};">`;

        if (logos.includes('barueri')) {
            if (isMini) {
                html += `
                <div style="display:flex; align-items:center; gap:2px;">
                    <img src="/static/img/logo-barueri.jpeg" style="width:6px; height:6px; object-fit:contain; border-radius:1px;">
                    <div style="display:flex; flex-direction:column; line-height:1;">
                        <span style="font-size:2px; font-weight:600; color:${textColor};">Prefeitura de</span>
                        <span style="font-size:3.5px; font-weight:700; color:${barueriColor};">Barueri</span>
                    </div>
                </div>`;
            } else {
                html += `
                <div style="display:flex; align-items:center; gap:1cqw;">
                    <img src="/static/img/logo-barueri.jpeg" style="width:5cqw; height:5cqw; object-fit:contain; border-radius:0.5cqw;">
                    <div style="display:flex; flex-direction:column; line-height:1;">
                        <span style="font-size:1.5cqw; font-weight:600; color:${textColor};">Prefeitura de</span>
                        <span style="font-size:2.5cqw; font-weight:800; color:${barueriColor};">Barueri</span>
                    </div>
                </div>`;
            }
        }
        if (logos.includes('sit')) {
            html += `
            <div style="display:flex; flex-direction:column; line-height:1; text-align:right;">
                <span style="font-size:${isMini ? '2px' : '1.5cqw'}; font-weight:800; color:${textColor};">SECRETARIA DE</span>
                <span style="font-size:${isMini ? '2.5px' : '2cqw'}; font-weight:900; color:${textColor};">INOVAÇÃO E TECNOLOGIA</span>
            </div>`;
        }
        if (logos.includes('inovacao')) {
            html += `
            <div style="display:flex; align-items:center; gap:${isMini ? '1px' : '0.5cqw'};">
                <i class="bi bi-cpu" style="font-size:${isMini ? '5px' : '3.5cqw'}; color:${textColor};"></i>
                <div style="display:flex; flex-direction:column; line-height:1;">
                    <span style="font-size:${isMini ? '3px' : '2cqw'}; font-weight:900; color:${textColor};">INOVAÇÃO</span>
                    <span style="font-size:${isMini ? '2px' : '1.2cqw'}; font-weight:600; color:${textColor};">BARUERI</span>
                </div>
            </div>`;
        }
        if (logos.includes('tv')) {
            html += `
            <div style="display:flex; align-items:center; gap:${isMini ? '1px' : '0.5cqw'};">
                <i class="bi bi-play-btn" style="font-size:${isMini ? '5px' : '3.5cqw'}; color:${textColor};"></i>
                <span style="font-size:${isMini ? '3px' : '2cqw'}; font-weight:900; color:${textColor}; line-height:1;">TV INOVAÇÃO</span>
            </div>`;
        }
        if (logos.includes('onu')) {
            html += `
            <div style="display:flex; align-items:center; gap:${isMini ? '1px' : '0.5cqw'};">
                <i class="bi bi-globe-americas" style="font-size:${isMini ? '5px' : '3.5cqw'}; color:${textColor};"></i>
                <div style="display:flex; flex-direction:column; line-height:1;">
                    <span style="font-size:${isMini ? '2px' : '1.2cqw'}; font-weight:600; color:${textColor};">Projetos alinhados</span>
                    <span style="font-size:${isMini ? '3px' : '2cqw'}; font-weight:900; color:${textColor};">ONU BR</span>
                </div>
            </div>`;
        }
        if (logos.includes('custom') && slide.customLogoImg) {
            html += `
            <div style="display:flex; align-items:center;">
                <img src="${slide.customLogoImg}" style="height:${isMini ? '6px' : '4cqw'}; max-width:${isMini ? '15px' : '15cqw'}; object-fit:contain;">
            </div>`;
        }

        html += `</div>`;
        return html;
    }

    function renderMiniSlidePreview(slide) {
        const tpl = slide.template || 'capa';
        const title = escapeHtml(slide.titulo || '');
        const subtitle = escapeHtml(slide.subtitulo || '');

        let odsBadge = '';
        if (slide.ods && slide.odsNums && slide.odsNums.length > 0) {
            odsBadge = `<div style="position:absolute; top:4px; right:6px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; z-index: 2;">`;
            odsBadge += slide.odsNums.map(num => {
                const opt = ODS_OPTIONS[num];
                if(!opt) return '';
                return `<div style="width:7px; height:7px; background:${opt.color}; color:#fff; font-size:3.5px; font-weight:900; border-radius:1px; display:flex; align-items:center; justify-content:center; line-height:1;">${opt.num}</div>`;
            }).join('');
            odsBadge += `</div>`;
        }

        const qrBadge = slide.qr ? `
            <div style="position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; background: #fff; border: 0.5px solid #cbd5e1; border-radius: 1px; display: flex; align-items: center; justify-content: center; font-size: 6px; color: #0f172a; z-index: 2; line-height: 1; overflow:hidden; padding: 0.5px;">
                ${(slide.qrLink && slide.qrLink.trim() !== '') ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(slide.qrLink)}" style="width:100%; height:100%; object-fit:contain;">` : `<i class="bi bi-qr-code" style="font-size: 6px;"></i>`}
            </div>` : '';

        const globalBgStyle = slide.bgGeral ? `background: url(${slide.bgGeral}) center/cover no-repeat;` : `background: ${slide.corFundo || '#ffffff'};`;
        const hasBgImg = !!slide.bgGeral;

        if (tpl === 'capa') {
            const defaultTextColor = hasBgImg ? '#ffffff' : '#0f172a';
            const defaultSubColor = hasBgImg ? 'rgba(255,255,255,0.85)' : '#64748b';
            const textColor = slide.corTitulo || defaultTextColor;
            const subColor = slide.corSubtitulo || defaultSubColor;
            const titleSize = slide.tamanhoTitulo ? (slide.tamanhoTitulo * 1.5) + 'px' : '7px';
            const subSize = slide.tamanhoSubtitulo ? (slide.tamanhoSubtitulo * 1.5) + 'px' : '4.5px';

            const logoHtml = buildLogosHtml(slide, true);
            return `
                <div style="width:100%; height:100%; position:relative; padding: 4px 6px; display:flex; flex-direction:column; justify-content:space-between; ${globalBgStyle} box-sizing: border-box; overflow:hidden;">
                    ${hasBgImg ? '<div style="position:absolute; inset:0; background:rgba(0,0,0,0.35); z-index:0;"></div>' : ''}
                    ${logoHtml}
                    <div style="position:relative; z-index:1; margin-bottom:2px;">
                        <div style="font-size:${titleSize}; font-weight:800; color:${textColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.1;">${title || 'Capa'}</div>
                        <div style="font-size:${subSize}; color:${subColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.1;">${subtitle || 'Apresentação Executiva'}</div>
                    </div>
                    ${odsBadge}
                    ${qrBadge}
                </div>
            `;
        }

        if (tpl === 'imagem_texto') {
            const imgSrc = slide.imgTexto || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';
            const defaultTextColor = hasBgImg ? '#ffffff' : '#0f172a';
            const defaultSubColor = hasBgImg ? 'rgba(255,255,255,0.85)' : '#64748b';
            const textColor = slide.corTitulo || defaultTextColor;
            const subColor = slide.corSubtitulo || defaultSubColor;
            const titleSize = slide.tamanhoTitulo ? (slide.tamanhoTitulo * 1.5) + 'px' : '6px';
            const subSize = slide.tamanhoSubtitulo ? (slide.tamanhoSubtitulo * 1.5) + 'px' : '4.5px';

            const logoHtml = buildLogosHtml(slide, true);
            return `
                <div style="width:100%; height:100%; position:relative; padding:3px; display:flex; flex-direction:column; ${globalBgStyle} box-sizing:border-box; overflow:hidden;">
                    ${hasBgImg ? '<div style="position:absolute; inset:0; background:rgba(255,255,255,0.7); z-index:0;"></div>' : ''}
                    <div style="position:relative; z-index:1; display:flex; flex-direction:column; height:100%;">
                        ${logoHtml}
                        <div style="display:flex; flex:1; gap:4px; align-items:center; min-height:0;">
                            <div style="width:45%; height:100%; border-radius:2px; overflow:hidden; flex-shrink:0; background:#f1f5f9; position:relative;">
                                <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover; display:block;">
                            </div>
                            <div style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; gap:2px;">
                                <div style="font-size:3.5px; font-weight:700; color:#64748b; text-transform:uppercase; line-height:1;">TÍTULO</div>
                                <div style="font-size:${titleSize}; font-weight:800; color:${textColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1;">${title || 'Título'}</div>
                                <div style="font-size:${subSize}; color:${subColor}; line-height:1.1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${subtitle || 'Texto de apoio'}</div>
                            </div>
                        </div>
                    </div>
                    ${odsBadge}
                    ${qrBadge}
                </div>
            `;
        }

        if (tpl === 'indicadores') {
            const indArray = slide.indicadores || [];
            const indHtml = indArray.map(ind => `
                <div style="background:#f8fafc; border:0.5px solid #e2e8f0; border-radius:2px; padding:1.5px 2px; text-align:center;">
                    <div style="font-size:5px; font-weight:800; color:#0f172a; line-height:1;">${ind.valor}</div>
                    <div style="font-size:3px; color:#64748b; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1;">${ind.nome}</div>
                </div>
            `).join("");

            const defaultTextColor = hasBgImg ? '#ffffff' : '#0f172a';
            const textColor = slide.corTitulo || defaultTextColor;
            const titleSize = slide.tamanhoTitulo ? (slide.tamanhoTitulo * 1.5) + 'px' : '5.5px';

            const logoHtml = buildLogosHtml(slide, true);

            return `
                <div style="width:100%; height:100%; position:relative; padding:3px 4px; display:flex; flex-direction:column; ${globalBgStyle} box-sizing:border-box; overflow:hidden;">
                    ${hasBgImg ? '<div style="position:absolute; inset:0; background:rgba(255,255,255,0.6); z-index:0;"></div>' : ''}
                    <div style="position:relative; z-index:1; display:flex; flex-direction:column; height:100%;">
                        ${logoHtml}
                        <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                            <div style="text-align:center; margin-bottom:2px;">
                                <div style="font-size:${titleSize}; font-weight:800; color:${textColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1;">${title || 'Indicadores'}</div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:2px;">
                                ${indHtml}
                            </div>
                        </div>
                    </div>
                    ${odsBadge}
                    ${qrBadge}
                </div>
            `;
        }

        if (tpl === 'grafico') {
            const cType = slide.chartType || 'line';
            let chartSvg = '';
            if (cType === 'pie') {
                chartSvg = `<div style="width:18px; height:18px; border-radius:50%; background:conic-gradient(#3b82f6 0% 45%, #60a5fa 45% 80%, #93c5fd 80% 100%);"></div>`;
            } else if (cType === 'bar') {
                chartSvg = `
                    <svg viewBox="0 0 60 22" style="width:80%; height:80%;">
                        <rect x="3" y="11" width="6" height="11" fill="#3b82f6" rx="1"/>
                        <rect x="13" y="5" width="6" height="17" fill="#3b82f6" rx="1"/>
                        <rect x="23" y="9" width="6" height="13" fill="#3b82f6" rx="1"/>
                        <rect x="33" y="2" width="6" height="20" fill="#3b82f6" rx="1"/>
                        <rect x="43" y="6" width="6" height="16" fill="#3b82f6" rx="1"/>
                        <rect x="53" y="1" width="6" height="21" fill="#3b82f6" rx="1"/>
                    </svg>`;
            } else {
                chartSvg = `
                    <svg viewBox="0 0 60 22" style="width:85%; height:85%;">
                        <path d="M 2,16 Q 12,12 20,14 T 38,6 T 58,2 L 58,22 L 2,22 Z" fill="rgba(59,130,246,0.15)"/>
                        <polyline fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" points="2,16 12,11 20,14 30,8 38,6 50,8 58,2"/>
                        <circle cx="20" cy="14" r="1.5" fill="#3b82f6"/>
                        <circle cx="38" cy="6" r="1.5" fill="#3b82f6"/>
                        <circle cx="58" cy="2" r="1.5" fill="#3b82f6"/>
                    </svg>`;
            }

            const defaultTextColor = hasBgImg ? '#ffffff' : '#0f172a';
            const textColor = slide.corTitulo || defaultTextColor;
            const titleSize = slide.tamanhoTitulo ? (slide.tamanhoTitulo * 1.5) + 'px' : '5.5px';

            const logoHtml = buildLogosHtml(slide, true);

            return `
                <div style="width:100%; height:100%; position:relative; padding:3px 4px; display:flex; flex-direction:column; ${globalBgStyle} box-sizing:border-box; overflow:hidden;">
                    ${hasBgImg ? '<div style="position:absolute; inset:0; background:rgba(255,255,255,0.6); z-index:0;"></div>' : ''}
                    <div style="position:relative; z-index:1; display:flex; flex-direction:column; height:100%;">
                        ${logoHtml}
                        <div style="font-size:${titleSize}; font-weight:800; color:${textColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; line-height:1;">${title || 'Gráfico'}</div>
                        <div style="flex:1; margin-top:2px; background:#f8fafc; border:0.5px solid #e2e8f0; border-radius:2px; display:flex; flex-direction:column; padding:2px;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                                <span style="font-size:3px; font-weight:700; color:#1e293b;">Total</span>
                                <span style="font-size:2.5px; background:#e2e8f0; color:#475569; padding:0.5px 1.5px; border-radius:1px;">${slide.periodo || '12 meses'}</span>
                            </div>
                            <div style="flex:1; display:flex; align-items:flex-end; justify-content:center;">
                                ${chartSvg}
                            </div>
                        </div>
                    </div>
                    ${odsBadge}
                    ${qrBadge}
                </div>
            `;
        }

        return '';
    }

    function updateActiveThumbnail() {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;
        const thumbCanvas = slidesThumbsList.querySelector(`.slide-thumb-item[data-slide-id="${slide.id}"] .thumb-canvas-mini`);
        if (thumbCanvas) {
            thumbCanvas.innerHTML = renderMiniSlidePreview(slide);
        }
    }

    function renderThumbnails() {
        slidesThumbsList.innerHTML = "";
        slides.forEach((slide, index) => {
            const div = document.createElement("div");
            div.className = `slide-thumb-item ${slide.id === activeSlideId ? 'active' : ''}`;
            div.setAttribute("data-slide-id", slide.id);

            const deleteBtnHtml = slides.length > 1 ? `<button class="btn-delete-slide" data-id="${slide.id}" style="position:absolute; top:-6px; right:-6px; width:22px; height:22px; background:#ef4444; color:#fff; border:none; border-radius:50%; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.2); z-index:10;"><i class="bi bi-x-lg"></i></button>` : '';

            div.innerHTML = `
                <span class="slide-index">${index + 1}</span>
                <div class="thumb-card" style="position:relative;">
                    ${deleteBtnHtml}
                    <div class="thumb-canvas-mini" style="height:62px; aspect-ratio:16/9; width:100%; padding:0; overflow:hidden; border-radius:4px; border:1px solid #e2e8f0; background:#fff;">
                        ${renderMiniSlidePreview(slide)}
                    </div>
                    <span class="thumb-label">Slide ${index + 1}</span>
                </div>
            `;

            div.addEventListener("click", (e) => {
                if(e.target.closest('.btn-delete-slide')) return;
                activeSlideId = slide.id;
                renderThumbnails();
                renderActiveSlide();
            });

            slidesThumbsList.appendChild(div);

            const deleteBtn = div.querySelector('.btn-delete-slide');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    slides = slides.filter(s => s.id !== slide.id);
                    if (activeSlideId === slide.id) {
                        activeSlideId = slides[0].id;
                    }
                    renderThumbnails();
                    renderActiveSlide();
                });
            }
        });
    }

    function renderActiveSlide() {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;

        selectTemplate.value = slide.template;
        inputTitulo.value = slide.titulo;
        inputSubtitulo.value = slide.subtitulo;

        // Sync text styles
        const inputCorFundo = document.getElementById("inputCorFundo");
        const inputCorTitulo = document.getElementById("inputCorTitulo");
        const inputCorSubtitulo = document.getElementById("inputCorSubtitulo");
        const inputRangeTitulo = document.getElementById("inputRangeTitulo");
        const inputRangeSubtitulo = document.getElementById("inputRangeSubtitulo");

        if(inputCorFundo) inputCorFundo.value = slide.corFundo || "#ffffff";
        if(inputCorTitulo) inputCorTitulo.value = slide.corTitulo || "#0f172a";
        if(inputCorSubtitulo) inputCorSubtitulo.value = slide.corSubtitulo || "#64748b";
        if(inputRangeTitulo) {
            inputRangeTitulo.value = slide.tamanhoTitulo || 4.0;
        }
        if(inputRangeSubtitulo) {
            inputRangeSubtitulo.value = slide.tamanhoSubtitulo || 1.8;
        }

        const currentLogos = slide.logos || ["barueri"];
        chkLogoItems.forEach(chk => {
            chk.checked = currentLogos.includes(chk.value);
        });
        if (chkLogoCustom) {
            chkLogoCustom.checked = currentLogos.includes("custom");
            fgLogoCustom.style.display = chkLogoCustom.checked ? "block" : "none";
        }

        toggleODS.checked = slide.ods;
        toggleQR.checked = slide.qr;

        switchTemplate();
        updatePreviewTexts();
        updateSlotsVisibility();
        syncOdsSelects(slide);
        updatePreviewMedia();
        if(slide.template === "grafico") renderChart(slide);
        if(slide.template === "indicadores") renderIndicadores(slide);
    }

    // --- ODS SELECTS ---
    function syncOdsSelects(slide) {
        if (!odsSelectsContainer) return;
        odsSelectsContainer.innerHTML = "";
        const nums = slide.odsNums || [];

        nums.forEach((num, index) => {
            const group = document.createElement("div");
            group.className = "form-group";
            group.style.margin = "0";

            const labelRow = document.createElement("div");
            labelRow.style.display = "flex";
            labelRow.style.justifyContent = "space-between";
            labelRow.style.alignItems = "center";
            labelRow.style.marginBottom = "2px";

            const label = document.createElement("label");
            label.style.fontSize = "0.82rem";
            label.style.color = "var(--text-muted)";
            label.textContent = `ODS ${index + 1}`;

            const btnRemove = document.createElement("i");
            btnRemove.className = "bi bi-x-circle text-danger";
            btnRemove.style.cursor = "pointer";
            btnRemove.style.fontSize = "0.82rem";
            btnRemove.title = "Remover ODS";
            btnRemove.onclick = () => {
                slide.odsNums.splice(index, 1);
                syncOdsSelects(slide);
                updateSlotsVisibility();
                updateActiveThumbnail();
            };

            labelRow.appendChild(label);
            labelRow.appendChild(btnRemove);

            const select = document.createElement("select");
            select.className = "form-control ods-select";
            select.style.fontSize = "0.82rem";
            select.style.padding = "6px 10px";

            const defOpt = document.createElement("option");
            defOpt.value = "";
            defOpt.textContent = "Selecionar ODS...";
            select.appendChild(defOpt);

            Object.values(ODS_OPTIONS).forEach(opt => {
                const o = document.createElement("option");
                o.value = opt.num;
                o.textContent = `ODS ${opt.num} — ${opt.label}`;
                select.appendChild(o);
            });

            select.value = num || "";

            select.addEventListener("change", (e) => {
                slide.odsNums[index] = e.target.value;
                updateSlotsVisibility();
                updateActiveThumbnail();
            });

            group.appendChild(labelRow);
            group.appendChild(select);
            odsSelectsContainer.appendChild(group);
        });
    }

    if (btnAddOds) {
        btnAddOds.addEventListener("click", () => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide) {
                if (!slide.odsNums) slide.odsNums = [];
                slide.odsNums.push("");
                syncOdsSelects(slide);
            }
        });
    }


    function renderIndicadores(slide) {
        const gridPreview = document.getElementById("indGridPreview");
        const listEdit = document.getElementById("indListEdit");

        // Ensure array exists
        if (!slide.indicadores) slide.indicadores = [];

        // Render Canvas Preview
        gridPreview.innerHTML = slide.indicadores.map(ind => `
            <div class="ind-card">
                <i class="bi ${ind.icone} ind-icon" style="color: ${ind.cor};"></i>
                <div class="ind-info">
                    <h3>${ind.valor}</h3>
                    <span>${ind.nome}</span>
                </div>
            </div>
        `).join("");

        // Render Sidebar Edit List
        listEdit.innerHTML = slide.indicadores.map(ind => `
            <div class="ind-edit-item" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; margin-bottom: 4px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <i class="bi ${ind.icone}" style="color: ${ind.cor};"></i>
                    <span style="font-size: 0.85rem; font-weight: 600;">${ind.nome} (${ind.valor})</span>
                </div>
                <div class="ind-actions" style="cursor: pointer;" onclick="window.removeIndicador(${ind.id})">
                    <i class="bi bi-trash text-danger"></i>
                </div>
            </div>
        `).join("");
    }

    // Global function to remove indicator
    window.removeIndicador = function(indId) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (slide && slide.indicadores) {
            slide.indicadores = slide.indicadores.filter(i => i.id !== indId);
            renderIndicadores(slide);
            updateActiveThumbnail();
        }
    };

    function updatePreviewTexts() {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;
        document.querySelectorAll(".preview-titulo").forEach(el => {
            el.textContent = slide.titulo || "Título";
            if (slide.corTitulo) el.style.setProperty('color', slide.corTitulo, 'important');
            if (slide.tamanhoTitulo) el.style.setProperty('font-size', `${slide.tamanhoTitulo}cqw`, 'important');
        });
        document.querySelectorAll(".preview-subtitulo").forEach(el => {
            el.textContent = slide.subtitulo || "Subtítulo";
            if (slide.corSubtitulo) el.style.setProperty('color', slide.corSubtitulo, 'important');
            if (slide.tamanhoSubtitulo) el.style.setProperty('font-size', `${slide.tamanhoSubtitulo}cqw`, 'important');
        });
    }

    function updateSlotsVisibility() {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;

        // Build Logos HTML
        const logosHtml = buildLogosHtml(slide, false);

        // Update Logo visibility & content
        document.querySelectorAll(".slide-top-brand").forEach(el => {
            if (logosHtml === "") {
                el.style.display = "none";
                el.innerHTML = "";
            } else {
                el.style.display = "flex";
                el.innerHTML = logosHtml;
            }
        });

        // Ensure sidebar controls match current state
        if(fgODSSelect) fgODSSelect.style.display = slide.ods ? "flex" : "none";
        if(fgQRLink) fgQRLink.style.display = slide.qr ? "block" : "none";
        if (slide.qr && inputQRLink) inputQRLink.value = slide.qrLink || "";

        // Build HTML for ODS
        const nums = (slide.odsNums || []).filter(v => v !== "");
        const hasOds = slide.ods && nums.length > 0;
        let odsHtml = '';
        if (hasOds) {
            odsHtml = `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6cqw; z-index: 1000;">`;
            nums.forEach(num => {
                const opt = ODS_OPTIONS[num];
                if(opt) {
                    odsHtml += `
                    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: ${opt.color}; color: #ffffff; width: 4.5cqw; height: 4.5cqw; border-radius: 0.6cqw; flex-shrink: 0; box-shadow: 0 0.3cqw 0.8cqw rgba(0,0,0,0.2); text-align: center;">
                        <span style="font-size: 2.2cqw; font-weight: 900; line-height: 1;">${opt.num}</span>
                    </div>`;
                }
            });
            odsHtml += `</div>`;
        }

        // Build HTML for QR Code
        let qrHtml = '';
        if (slide.qr) {
            let qrInner = `<i class="bi bi-qr-code" style="font-size: 3cqw; color: #64748b;"></i>`;
            if (slide.qrLink && slide.qrLink.trim() !== "") {
                qrInner = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(slide.qrLink)}" style="width:100%; height:100%; object-fit:contain;">`;
            }
            qrHtml = `
            <div style="display: flex; align-items: center; justify-content: center; width: 5.2cqw; height: 5.2cqw; background: #ffffff; border: 0.2cqw solid #cbd5e1; border-radius: 0.6cqw; padding: 0.3cqw; overflow: hidden; flex-shrink: 0; z-index: 1000; box-shadow: 0 0.3cqw 0.8cqw rgba(0,0,0,0.1);">
                ${qrInner}
            </div>`;
        }

        const combinedHtml = `<div style="display: flex; gap: 1.5cqw; align-items: flex-end;">${qrHtml}</div>`;

        // Inject into current template slots (for QR)
        const tpl = slide.template || "capa";
        const globalContainer = document.querySelector('.global-slots-container');
        const itOdsSlot = document.querySelector('.it-ods-slot');
        const itQrSlot = document.querySelector('.it-qr-slot');
        const indContent = document.querySelector('.ind-content-wrapper');

        // Global ODS container at Top Right
        let odsContainer = document.getElementById('global-ods-top-right');
        if (!odsContainer) {
            odsContainer = document.createElement('div');
            odsContainer.id = 'global-ods-top-right';
            odsContainer.style.cssText = "position: absolute; top: 3cqw; right: 4cqw; z-index: 1000;";
            document.getElementById('activeSlideSurface').appendChild(odsContainer);
        }
        odsContainer.innerHTML = odsHtml;

        // Reset all specific slot containers
        if(globalContainer) globalContainer.innerHTML = '';
        if(itOdsSlot) itOdsSlot.innerHTML = '';
        if(itQrSlot) itQrSlot.innerHTML = '';
        const oldInd = document.getElementById('dyn-ind-slots');
        if(oldInd) oldInd.remove();

        if (tpl === "capa" || tpl === "grafico") {
            if(globalContainer) globalContainer.innerHTML = combinedHtml;
        } else if (tpl === "imagem_texto") {
            // itOdsSlot is no longer used for ODS, but we can leave it empty
            if(itQrSlot) itQrSlot.innerHTML = qrHtml;
        } else if (tpl === "indicadores") {
            if(indContent) {
                const w = document.createElement("div");
                w.id = "dyn-ind-slots";
                w.style.cssText = "position: absolute; bottom: 1.5cqw; right: 1.5cqw; z-index: 1000;";
                w.innerHTML = combinedHtml;
                indContent.appendChild(w);
            }
        }
    }

        function renderChart(slide) {
        if (slideChartInstance) {
            slideChartInstance.destroy();
        }

        document.querySelectorAll(".btn-chart-type").forEach(btn => {
            if (btn.dataset.type === slide.chartType) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        const selectChartIndicador = document.getElementById("selectChartIndicador");
        if(selectChartIndicador) selectChartIndicador.value = slide.chartIndicador || 1;

        const selectPeriodo = document.getElementById("selectPeriodo");
        if(selectPeriodo) selectPeriodo.value = slide.periodo || "Últimos 12 meses";

        const previewPeriodo = document.getElementById("previewPeriodo");
        if(previewPeriodo) previewPeriodo.textContent = slide.periodo || "Últimos 12 meses";

        const ctx = document.getElementById('slideChart');
        if(!ctx) return;

        let type = slide.chartType || "line";
        let data, options;

        const idInd = slide.chartIndicador || 1;
        const ind = INDICADORES_PREDEFINIDOS.find(i => i.id_padrao === idInd) || INDICADORES_PREDEFINIDOS[0];
        const baseVal = parseFloat(ind.valor.replace('.', ''));

        if (type === "line" || type === "bar") {
            data = {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: ind.nome,
                    data: [
                        Math.round(baseVal * 0.75), 
                        Math.round(baseVal * 0.82), 
                        Math.round(baseVal * 0.90), 
                        Math.round(baseVal * 0.85), 
                        Math.round(baseVal * 0.95), 
                        baseVal
                    ],
                    borderColor: ind.cor,
                    backgroundColor: type === "line" ? ind.cor + '33' : ind.cor,
                    borderWidth: type === "line" ? 3 : 0,
                    tension: 0.4,
                    fill: type === "line",
                    borderRadius: type === "bar" ? 4 : 0
                }]
            };
            options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false } }
                }
            };
        } else if (type === "pie") {
            data = {
                labels: ['Região Norte', 'Região Sul', 'Região Centro'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: [ind.cor, ind.cor + '99', ind.cor + '44'],
                    borderWidth: 0
                }]
            };
            options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } } }
                }
            };
        }

        slideChartInstance = new Chart(ctx, {
            type: type,
            data: data,
            options: options
        });
    }

    function updatePreviewMedia() {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;

        // Tratar imagem de fundo global (todos os templates) e cor de fundo
        const bgGeralThumbPreview = document.getElementById("bgGeralThumbPreview");
        const btnRemoveBgGeral = document.getElementById("btnRemoveBgGeral");

        if (slide.bgGeral) {
            activeSlideSurface.style.backgroundImage = `url(${slide.bgGeral})`;
            activeSlideSurface.style.backgroundSize = "cover";
            activeSlideSurface.style.backgroundPosition = "center";
            activeSlideSurface.style.backgroundColor = "transparent";
            if(bgGeralThumbPreview) {
                bgGeralThumbPreview.src = slide.bgGeral;
                bgGeralThumbPreview.style.display = "block";
            }
            if(btnRemoveBgGeral) btnRemoveBgGeral.style.display = "block";
        } else {
            activeSlideSurface.style.backgroundImage = "";
            activeSlideSurface.style.backgroundColor = slide.corFundo || "#ffffff";
            if(bgGeralThumbPreview) bgGeralThumbPreview.style.display = "none";
            if(btnRemoveBgGeral) btnRemoveBgGeral.style.display = "none";
        }

        // Tratar imagem para Imagem + Texto
        if (slide.template === "imagem_texto") {
            if (slide.imgTexto) {
                imgTextoCanvasImg.src = slide.imgTexto;
                imgTextoThumbPreview.src = slide.imgTexto;
            } else {
                imgTextoCanvasImg.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
                imgTextoThumbPreview.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
            }
        }
    }

    function switchTemplate() {
        const val = selectTemplate.value;

        layoutCapa.style.display = "none";
        layoutImgTexto.style.display = "none";
        layoutIndicadores.style.display = "none";
        layoutGrafico.style.display = "none";

        tplCapa.forEach(el => el.style.display = "none");
        tplImgTexto.forEach(el => el.style.display = "none");
        tplIndicadores.forEach(el => el.style.display = "none");
        tplGrafico.forEach(el => el.style.display = "none");

        document.getElementById("activeSlideSurface").className = "slide-surface template-" + val;

        if(val === "capa") {
            layoutCapa.style.display = "block";
            tplCapa.forEach(el => el.style.display = "flex");
            labelTitulo.textContent = "Título";
            labelSubtitulo.textContent = "Subtítulo";
            fgSubtitulo.style.display = "flex";
        } else if(val === "imagem_texto") {
            layoutImgTexto.style.display = "flex";
            tplImgTexto.forEach(el => el.style.display = "flex");
            labelTitulo.textContent = "Título do Slide";
            labelSubtitulo.textContent = "Texto de Apoio";
            fgSubtitulo.style.display = "flex";
        } else if(val === "indicadores") {
            layoutIndicadores.style.display = "flex";
            tplIndicadores.forEach(el => el.style.display = "block");
            labelTitulo.textContent = "Título";
            labelSubtitulo.textContent = "Texto Introdutório";
            fgSubtitulo.style.display = "flex";
        } else if(val === "grafico") {
            layoutGrafico.style.display = "flex";
            tplGrafico.forEach(el => el.style.display = "block");
            labelTitulo.textContent = "Título";
            labelSubtitulo.textContent = "Texto Introdutório";
            fgSubtitulo.style.display = "flex";
        }

        updateSlotsVisibility();
    }

    inputTitulo.addEventListener("input", (e) => {
        const slide = slides.find(s => s.id === activeSlideId);
        if (slide) slide.titulo = e.target.value;
        updatePreviewTexts();
        updateActiveThumbnail();
    });

    inputSubtitulo.addEventListener("input", (e) => {
        const slide = slides.find(s => s.id === activeSlideId);
        if (slide) slide.subtitulo = e.target.value;
        updatePreviewTexts();
        updateActiveThumbnail();
    });

    const inputRangeTitulo = document.getElementById("inputRangeTitulo");
    const lblRangeTitulo = document.getElementById("lblRangeTitulo");
    const inputRangeSubtitulo = document.getElementById("inputRangeSubtitulo");
    const lblRangeSubtitulo = document.getElementById("lblRangeSubtitulo");
    const inputCorTitulo = document.getElementById("inputCorTitulo");
    const inputCorSubtitulo = document.getElementById("inputCorSubtitulo");

    if (inputRangeTitulo) {
        inputRangeTitulo.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value).toFixed(1);
            if (lblRangeTitulo) lblRangeTitulo.textContent = val;
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide) { slide.tamanhoTitulo = val; updatePreviewTexts(); updateActiveThumbnail(); }
        });
    }
    if (inputRangeSubtitulo) {
        inputRangeSubtitulo.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value).toFixed(1);
            if (lblRangeSubtitulo) lblRangeSubtitulo.textContent = val;
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide) { slide.tamanhoSubtitulo = val; updatePreviewTexts(); updateActiveThumbnail(); }
        });
    }
    if (inputCorTitulo) {
        inputCorTitulo.addEventListener("input", (e) => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide) { slide.corTitulo = e.target.value; updatePreviewTexts(); updateActiveThumbnail(); }
        });
    }
    if (inputCorSubtitulo) {
        inputCorSubtitulo.addEventListener("input", (e) => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide) { slide.corSubtitulo = e.target.value; updatePreviewTexts(); updateActiveThumbnail(); }
        });
    }

    selectTemplate.addEventListener("change", (e) => {
        const slide = slides.find(s => s.id === activeSlideId);
        if (slide) {
            slide.template = e.target.value;
            switchTemplate();
            updatePreviewMedia();
            if(slide.template === "grafico") renderChart(slide);
            if(slide.template === "indicadores") renderIndicadores(slide);
            renderThumbnails();
        }
    });

    function syncSlideLogos() {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;
        slide.logos = [];
        chkLogoItems.forEach(chk => {
            if (chk.checked) slide.logos.push(chk.value);
        });
        if (chkLogoCustom && chkLogoCustom.checked) {
            slide.logos.push("custom");
        }
        updateSlotsVisibility();
        updateActiveThumbnail();
    }

    chkLogoItems.forEach(chk => chk.addEventListener("change", syncSlideLogos));

    if (chkLogoCustom) {
        chkLogoCustom.addEventListener("change", (e) => {
            fgLogoCustom.style.display = e.target.checked ? "block" : "none";
            syncSlideLogos();
        });
    }

    if (inputUploadLogoCustom) {
        inputUploadLogoCustom.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const slide = slides.find(s => s.id === activeSlideId);
                    if (slide) {
                        slide.customLogoImg = event.target.result;
                        updateSlotsVisibility();
                        updateActiveThumbnail();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    toggleODS.addEventListener("change", (e) => {
        const slide = slides.find(s => s.id === activeSlideId);
        if (slide) slide.ods = e.target.checked;
        updateSlotsVisibility();
        updateActiveThumbnail();
    });

    toggleQR.addEventListener("change", (e) => {
        const slide = slides.find(s => s.id === activeSlideId);
        if (slide) slide.qr = e.target.checked;
        updateSlotsVisibility();
        updateActiveThumbnail();
    });

    if (inputQRLink) {
        inputQRLink.addEventListener("input", (e) => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide) {
                slide.qrLink = e.target.value;
                updateSlotsVisibility();
                updateActiveThumbnail();
            }
        });
    }

    // Fundo do Slide
    const btnUploadBgGeral = document.getElementById("btnUploadBgGeral");
    const inputUploadBgGeral = document.getElementById("inputUploadBgGeral");
    const btnRemoveBgGeral = document.getElementById("btnRemoveBgGeral");
    const inputCorFundo = document.getElementById("inputCorFundo");

    if(btnUploadBgGeral) {
        btnUploadBgGeral.addEventListener("click", () => inputUploadBgGeral.click());
    }
    if(inputUploadBgGeral) {
        inputUploadBgGeral.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const slide = slides.find(s => s.id === activeSlideId);
                    if (slide) {
                        slide.bgGeral = event.target.result;
                        updatePreviewMedia();
                        updateActiveThumbnail();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    if(btnRemoveBgGeral) {
        btnRemoveBgGeral.addEventListener("click", () => {
            const slide = slides.find(s => s.id === activeSlideId);
            if(slide) {
                slide.bgGeral = null;
                updatePreviewMedia();
                updateActiveThumbnail();
            }
        });
    }
    if(inputCorFundo) {
        inputCorFundo.addEventListener("input", (e) => {
            const slide = slides.find(s => s.id === activeSlideId);
            if(slide) {
                slide.corFundo = e.target.value;
                updatePreviewMedia();
                updateActiveThumbnail();
            }
        });
    }

    // Upload de Imagem para Imagem+Texto
    btnUploadImgTexto.addEventListener("click", () => {
        inputUploadImgTexto.click();
    });

    inputUploadImgTexto.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const slide = slides.find(s => s.id === activeSlideId);
                if (slide) {
                    slide.imgTexto = event.target.result;
                    updatePreviewMedia();
                    updateActiveThumbnail();
                }
            };
            reader.readAsDataURL(file);
        }
    });

    document.querySelectorAll(".btn-chart-type").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide && slide.template === "grafico") {
                slide.chartType = e.currentTarget.dataset.type;
                renderChart(slide);
                updateActiveThumbnail();
            }
        });
    });

    const selectChartIndicador = document.getElementById("selectChartIndicador");
    if(selectChartIndicador) {
        selectChartIndicador.addEventListener("change", (e) => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide && slide.template === "grafico") {
                slide.chartIndicador = parseInt(e.target.value);
                renderChart(slide);
                updateActiveThumbnail();
            }
        });
    }

    const selectPeriodo = document.getElementById("selectPeriodo");
    if(selectPeriodo) {
        selectPeriodo.addEventListener("change", (e) => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (slide && slide.template === "grafico") {
                slide.periodo = e.target.value;
                const previewPeriodo = document.getElementById("previewPeriodo");
                if(previewPeriodo) previewPeriodo.textContent = slide.periodo;
                updateActiveThumbnail();
            }
        });
    }

    const INDICADORES_PREDEFINIDOS = [
        { id_padrao: 1, nome: "Saúde", valor: "3.237", icone: "bi-heart-pulse", cor: "#3b82f6" },
        { id_padrao: 2, nome: "Segurança", valor: "3.847", icone: "bi-shield-check", cor: "#a855f7" },
        { id_padrao: 3, nome: "Educação", valor: "3.755", icone: "bi-book", cor: "#f59e0b" },
        { id_padrao: 4, nome: "Mobilidade", valor: "4.687", icone: "bi-car-front", cor: "#10b981" },
        { id_padrao: 5, nome: "Meio Ambiente", valor: "1.240", icone: "bi-tree", cor: "#84cc16" },
        { id_padrao: 6, nome: "Economia", valor: "8.921", icone: "bi-graph-up-arrow", cor: "#ef4444" }
    ];

    const btnAddIndicador = document.getElementById("btnAddIndicador");
    if (btnAddIndicador) {
        btnAddIndicador.addEventListener("click", () => {
            const selectInd = document.getElementById("selectIndicadorNovo");
            const val = parseInt(selectInd.value);
            const template = INDICADORES_PREDEFINIDOS.find(i => i.id_padrao === val);

            if (template) {
                const slide = slides.find(s => s.id === activeSlideId);
                if (slide && slide.template === "indicadores") {
                    if (!slide.indicadores) slide.indicadores = [];

                    if (slide.indicadores.length >= 4) {
                        alert("Você só pode adicionar no máximo 4 indicadores por slide.");
                        return;
                    }

                    // Verify if it's already added
                    if (slide.indicadores.some(i => i.id_padrao === val)) {
                        alert("Este indicador já está no slide.");
                        return;
                    }

                    slide.indicadores.push({
                        id: Date.now(),
                        id_padrao: template.id_padrao,
                        nome: template.nome,
                        valor: template.valor,
                        icone: template.icone,
                        cor: template.cor
                    });

                    renderIndicadores(slide);
                    updateActiveThumbnail();
                }
            }
        });
    }

    btnNovoSlide.addEventListener("click", () => {
        slideCounter++;
        const currentSlide = slides.find(s => s.id === activeSlideId) || {};

        slides.push({
            id: slideCounter,
            template: "capa",
            titulo: "Novo Slide",
            subtitulo: "Subtítulo do novo slide",
            logos: currentSlide.logos ? [...currentSlide.logos] : ["barueri"],
            customLogoImg: currentSlide.customLogoImg || null,
            ods: false,
            odsNums: [],
            qr: false,
            qrLink: "",
            bgCapa: null,
            imgTexto: null,
            chartType: "line",
            periodo: "Últimos 12 meses",
            indicadores: [],
            tamanhoTitulo: currentSlide.tamanhoTitulo || 4.0,
            tamanhoSubtitulo: currentSlide.tamanhoSubtitulo || 1.8,
            corTitulo: currentSlide.corTitulo || "#0f172a",
            corSubtitulo: currentSlide.corSubtitulo || "#64748b"
        });
        activeSlideId = slideCounter;
        renderThumbnails();
        renderActiveSlide();
        slidesThumbsList.scrollTop = slidesThumbsList.scrollHeight;
    });

    // --- Lógica de Salvar ---
    const btnSalvar = document.getElementById("btnSalvar");
    const saveToast = document.getElementById("saveToast");
    const saveModal = document.getElementById("saveModal");
    const btnCloseSave = document.getElementById("btnCloseSave");
    const btnCancelSave = document.getElementById("btnCancelSave");
    const btnConfirmSave = document.getElementById("btnConfirmSave");
    const inputSaveNome = document.getElementById("inputSaveNome");
    const selectSaveProjeto = document.getElementById("selectSaveProjeto");

    // Sincronização entre o input do cabeçalho e o modal de salvar
    const displayTituloInput = document.getElementById("displayApresentacaoTitulo");
    if (displayTituloInput) {
        displayTituloInput.addEventListener("input", (e) => {
            if (inputSaveNome) inputSaveNome.value = e.target.value;
        });
    }

    btnSalvar.addEventListener("click", () => {
        // Preenche o nome padrão baseado no input do cabeçalho ou no primeiro slide
        const currentTitle = displayTituloInput ? (displayTituloInput.value || displayTituloInput.innerText || "").trim() : "";
        if (currentTitle) {
            inputSaveNome.value = currentTitle;
        } else if (slides.length > 0 && !inputSaveNome.value) {
            inputSaveNome.value = slides[0].titulo || "Nova Apresentação";
        }
        if (window.projetoId && selectSaveProjeto) {
            selectSaveProjeto.value = window.projetoId;
        }
        saveModal.style.display = "flex";
    });

    function fecharSaveModal() {
        saveModal.style.display = "none";
    }

    if (btnCloseSave) btnCloseSave.addEventListener("click", fecharSaveModal);
    if (btnCancelSave) btnCancelSave.addEventListener("click", fecharSaveModal);

    if (btnConfirmSave) {
        btnConfirmSave.addEventListener("click", async () => {
            const originalBtnHtml = btnConfirmSave.innerHTML;
            btnConfirmSave.disabled = true;
            btnConfirmSave.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> <span>Salvando...</span>`;

            const nomeStr = inputSaveNome.value.trim() || (slides[0]?.titulo || "Apresentação sem título");
            const projetoIdVal = selectSaveProjeto.value ? parseInt(selectSaveProjeto.value) : window.projetoId;

            const payload = {
                apresentacao_id: window.apresentacaoId,
                projeto_id: projetoIdVal,
                titulo: nomeStr,
                slides: slides
            };

            try {
                const response = await fetch(salvarUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok && data.status === 'sucesso') {
                    if (data.apresentacao_id) {
                        window.apresentacaoId = data.apresentacao_id;
                        window.projetoId = projetoIdVal;
                        // Atualiza a URL no navegador sem recarregar a página
                        if (!window.location.pathname.includes('/apresentacao/editar/')) {
                            window.history.replaceState(null, '', `/apresentacao/editar/${data.apresentacao_id}`);
                        }
                    }

                    // Atualiza o título exibido no header
                    const displayTitulo = document.getElementById("displayApresentacaoTitulo");
                    if (displayTitulo) {
                        if ('value' in displayTitulo) displayTitulo.value = nomeStr;
                        else displayTitulo.textContent = nomeStr;
                    }

                    fecharSaveModal();

                    if (saveToast) {
                        const msgSpan = saveToast.querySelector('span');
                        if (msgSpan) msgSpan.textContent = data.mensagem || "Apresentação salva com sucesso no banco!";
                        saveToast.style.display = "flex";
                        setTimeout(() => {
                            saveToast.style.display = "none";
                        }, 3500);
                    }
                } else {
                    alert("Erro ao salvar apresentação: " + (data.mensagem || "Falha no servidor."));
                }
            } catch (error) {
                console.error("Erro na requisição ao salvar:", error);
                alert("Erro de conexão ao salvar apresentação no banco de dados.");
            } finally {
                btnConfirmSave.disabled = false;
                btnConfirmSave.innerHTML = originalBtnHtml;
            }
        });
    }

    // --- Lógica de Visualizar (Apresentação Full Screen Proporcional) ---
    const btnVisualizar = document.getElementById("btnVisualizar");
    const previewModal = document.getElementById("previewModal");
    const previewContainer = document.getElementById("previewContainer");
    const btnPrevSlide = document.getElementById("btnPrevSlide");
    const btnNextSlide = document.getElementById("btnNextSlide");
    const btnClosePreview = document.getElementById("btnClosePreview");
    const btnToggleFullscreen = document.getElementById("btnToggleFullscreen");
    const previewSlideCounter = document.getElementById("previewSlideCounter");

    const canvasStage = document.querySelector(".canvas-stage");

    function atualizarPreviewNavegacao() {
        const currentIndex = slides.findIndex(s => s.id === activeSlideId);
        const total = slides.length;
        if (previewSlideCounter) {
            previewSlideCounter.textContent = `Slide ${currentIndex + 1} / ${total}`;
        }

        if (btnPrevSlide) {
            btnPrevSlide.disabled = (currentIndex === 0);
            btnPrevSlide.style.opacity = (currentIndex === 0) ? "0.4" : "1";
            btnPrevSlide.style.cursor = (currentIndex === 0) ? "not-allowed" : "pointer";
        }

        if (btnNextSlide) {
            btnNextSlide.disabled = (currentIndex === total - 1);
            btnNextSlide.style.opacity = (currentIndex === total - 1) ? "0.4" : "1";
            btnNextSlide.style.cursor = (currentIndex === total - 1) ? "not-allowed" : "pointer";
        }
    }

    async function abrirModoApresentacao() {
        if (!previewModal || !previewContainer || !activeSlideSurface) return;

        // 1. Move o slide para o container de preview
        previewContainer.innerHTML = "";
        previewContainer.appendChild(activeSlideSurface);

        // 2. Limpa estilos inline fixos para permitir a responsividade 16:9 máxima
        activeSlideSurface.style.maxWidth = "none";
        activeSlideSurface.style.maxHeight = "none";

        // 3. Exibe o modal
        previewModal.style.display = "flex";
        atualizarPreviewNavegacao();

        // 4. Solicita tela cheia nativa do navegador
        try {
            if (!document.fullscreenElement) {
                if (previewModal.requestFullscreen) {
                    await previewModal.requestFullscreen();
                } else if (previewModal.webkitRequestFullscreen) {
                    await previewModal.webkitRequestFullscreen();
                } else if (previewModal.msRequestFullscreen) {
                    await previewModal.msRequestFullscreen();
                }
            }
        } catch (err) {
            console.warn("Fullscreen request blocked or not permitted:", err);
        }
    }

    async function fecharModoApresentacao() {
        // 1. Sai de tela cheia se estiver ativa
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                }
            } catch (e) {
                console.warn("Erro ao sair de tela cheia:", e);
            }
        }

        // 2. Oculta o modal de preview
        if (previewModal) previewModal.style.display = "none";

        // 3. Devolve activeSlideSurface para o palco do editor (.canvas-stage)
        if (canvasStage && activeSlideSurface) {
            canvasStage.innerHTML = "";
            canvasStage.appendChild(activeSlideSurface);
            activeSlideSurface.style.maxWidth = "660px";
            activeSlideSurface.style.maxHeight = "100%";
            activeSlideSurface.style.height = "auto";
            activeSlideSurface.style.borderRadius = "var(--radius-lg)";
            activeSlideSurface.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.06)";
        }
    }

    if (btnVisualizar) {
        btnVisualizar.addEventListener("click", abrirModoApresentacao);
    }

    if (btnClosePreview) {
        btnClosePreview.addEventListener("click", fecharModoApresentacao);
    }

    if (btnPrevSlide) {
        btnPrevSlide.addEventListener("click", () => {
            const currentIndex = slides.findIndex(s => s.id === activeSlideId);
            if (currentIndex > 0) {
                activeSlideId = slides[currentIndex - 1].id;
                renderThumbnails();
                renderActiveSlide();
                atualizarPreviewNavegacao();
            }
        });
    }

    if (btnNextSlide) {
        btnNextSlide.addEventListener("click", () => {
            const currentIndex = slides.findIndex(s => s.id === activeSlideId);
            if (currentIndex < slides.length - 1) {
                activeSlideId = slides[currentIndex + 1].id;
                renderThumbnails();
                renderActiveSlide();
                atualizarPreviewNavegacao();
            }
        });
    }

    if (btnToggleFullscreen) {
        btnToggleFullscreen.addEventListener("click", async () => {
            if (!document.fullscreenElement) {
                try {
                    if (previewModal.requestFullscreen) await previewModal.requestFullscreen();
                } catch (e) {
                    console.warn(e);
                }
            } else {
                try {
                    if (document.exitFullscreen) await document.exitFullscreen();
                } catch (e) {
                    console.warn(e);
                }
            }
        });
    }

    // Monitora evento de saída de tela cheia (ex: usuário pressionou ESC no teclado)
    document.addEventListener("fullscreenchange", () => {
        const icon = btnToggleFullscreen ? btnToggleFullscreen.querySelector("i") : null;
        if (icon) {
            if (document.fullscreenElement) {
                icon.className = "bi bi-fullscreen-exit";
            } else {
                icon.className = "bi bi-arrows-fullscreen";
            }
        }
        // Se saiu de tela cheia mas o modal ainda está aberto, o usuário fechou pelo ESC nativo
        if (!document.fullscreenElement && previewModal && previewModal.style.display === "flex") {
            fecharModoApresentacao();
        }
    });

    // Teclas de atalho no modo apresentação: Setas, Espaço, PageUp/Down, Esc
    document.addEventListener("keydown", (e) => {
        if (previewModal && previewModal.style.display === "flex") {
            if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
                e.preventDefault();
                const currentIndex = slides.findIndex(s => s.id === activeSlideId);
                if (currentIndex < slides.length - 1) {
                    activeSlideId = slides[currentIndex + 1].id;
                    renderThumbnails();
                    renderActiveSlide();
                    atualizarPreviewNavegacao();
                }
            } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
                e.preventDefault();
                const currentIndex = slides.findIndex(s => s.id === activeSlideId);
                if (currentIndex > 0) {
                    activeSlideId = slides[currentIndex - 1].id;
                    renderThumbnails();
                    renderActiveSlide();
                    atualizarPreviewNavegacao();
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                fecharModoApresentacao();
            }
        }
    });

    // Fallback manual para as abas retráteis (caso o JS do Bootstrap não esteja carregado/funcionando)
    document.querySelectorAll('.slots-header[data-bs-toggle="collapse"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-bs-target');
            if (targetId) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';

                    if (isExpanded) {
                        targetEl.classList.remove('show');
                        this.setAttribute('aria-expanded', 'false');
                    } else {
                        targetEl.classList.add('show');
                        this.setAttribute('aria-expanded', 'true');
                    }
                }
            }
        });
    });
    // ==========================================
    // --- LÓGICA DO ACERVO COMPARTILHADO DA PASTA ---
    // ==========================================
    let acervoCache = null;
    let acervoTargetField = null;
    let acervoFiltroDadoAtual = 'todos';

    function getEffectiveProjetoId() {
        if (window.projetoId) return window.projetoId;
        if (selectSaveProjeto && selectSaveProjeto.value) return parseInt(selectSaveProjeto.value);
        const urlParams = new URLSearchParams(window.location.search);
        const pId = urlParams.get('projeto_id');
        if (pId) return parseInt(pId);
        return null;
    }

    const modalAcervoPasta = document.getElementById("modalAcervoPasta");
    const btnCloseAcervoModal = document.getElementById("btnCloseAcervoModal");
    const btnFecharAcervoModal = document.getElementById("btnFecharAcervoModal");
    const tabBtnAcervoSlides = document.getElementById("tabBtnAcervoSlides");
    const tabBtnAcervoDados = document.getElementById("tabBtnAcervoDados");
    const painelAcervoSlides = document.getElementById("painelAcervoSlides");
    const painelAcervoDados = document.getElementById("painelAcervoDados");
    const spanAcervoNomePasta = document.getElementById("spanAcervoNomePasta");
    const countAcervoSlides = document.getElementById("countAcervoSlides");
    const countAcervoDados = document.getElementById("countAcervoDados");
    const gridAcervoSlides = document.getElementById("gridAcervoSlides");
    const emptyAcervoSlides = document.getElementById("emptyAcervoSlides");
    const gridAcervoDados = document.getElementById("gridAcervoDados");
    const emptyAcervoDados = document.getElementById("emptyAcervoDados");
    const inputBuscaAcervoSlides = document.getElementById("inputBuscaAcervoSlides");
    const selectFiltroTemplateAcervo = document.getElementById("selectFiltroTemplateAcervo");
    const btnAcervoPasta = document.getElementById("btnAcervoPasta");

    function fecharAcervoModal() {
        if (modalAcervoPasta) modalAcervoPasta.style.display = "none";
    }

    if (btnCloseAcervoModal) btnCloseAcervoModal.addEventListener("click", fecharAcervoModal);
    if (btnFecharAcervoModal) btnFecharAcervoModal.addEventListener("click", fecharAcervoModal);
    if (modalAcervoPasta) {
        modalAcervoPasta.addEventListener("click", (e) => {
            if (e.target === modalAcervoPasta) fecharAcervoModal();
        });
    }

    function alternarAbaAcervo(aba) {
        if (aba === 'slides') {
            if (painelAcervoSlides) painelAcervoSlides.style.display = 'block';
            if (painelAcervoDados) painelAcervoDados.style.display = 'none';
            if (tabBtnAcervoSlides) {
                tabBtnAcervoSlides.style.color = '#0052ff';
                tabBtnAcervoSlides.style.borderBottom = '2px solid #0052ff';
            }
            if (tabBtnAcervoDados) {
                tabBtnAcervoDados.style.color = '#64748b';
                tabBtnAcervoDados.style.borderBottom = '2px solid transparent';
            }
        } else {
            if (painelAcervoSlides) painelAcervoSlides.style.display = 'none';
            if (painelAcervoDados) painelAcervoDados.style.display = 'block';
            if (tabBtnAcervoDados) {
                tabBtnAcervoDados.style.color = '#0052ff';
                tabBtnAcervoDados.style.borderBottom = '2px solid #0052ff';
            }
            if (tabBtnAcervoSlides) {
                tabBtnAcervoSlides.style.color = '#64748b';
                tabBtnAcervoSlides.style.borderBottom = '2px solid transparent';
            }
        }
    }

    if (tabBtnAcervoSlides) tabBtnAcervoSlides.addEventListener("click", () => alternarAbaAcervo('slides'));
    if (tabBtnAcervoDados) tabBtnAcervoDados.addEventListener("click", () => alternarAbaAcervo('dados'));

    function mostrarToastNotificacao(msg, cor = "#10b981") {
        if (saveToast) {
            saveToast.style.background = cor;
            const msgSpan = document.getElementById("saveToastText") || saveToast.querySelector('span');
            if (msgSpan) msgSpan.textContent = msg;
            saveToast.style.display = "flex";
            setTimeout(() => { saveToast.style.display = "none"; }, 3500);
        }
    }

    async function carregarAcervoPasta(tabPadrao = 'slides', targetFilter = null) {
        acervoTargetField = targetFilter;
        const projId = getEffectiveProjetoId();

        if (!projId) {
            alert("Esta apresentação ainda não está vinculada a uma pasta salva. Salve a apresentação em uma pasta primeiro para habilitar o compartilhamento de acervo.");
            return;
        }

        if (modalAcervoPasta) modalAcervoPasta.style.display = "flex";
        alternarAbaAcervo(tabPadrao);

        if (targetFilter) {
            acervoFiltroDadoAtual = targetFilter;
            document.querySelectorAll('.filter-dado-btn').forEach(btn => {
                if (btn.dataset.tipo === targetFilter) {
                    btn.classList.remove('btn-outline-secondary');
                    btn.classList.add('btn-primary');
                } else {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline-secondary');
                }
            });
        }

        if (gridAcervoSlides) {
            gridAcervoSlides.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: #64748b;">
                    <i class="bi bi-arrow-repeat spin" style="font-size: 2rem; color: #0052ff; display:block; margin-bottom: 8px;"></i>
                    Carregando slides compartilhados da pasta...
                </div>
            `;
        }
        if (gridAcervoDados) {
            gridAcervoDados.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: #64748b;">
                    <i class="bi bi-arrow-repeat spin" style="font-size: 2rem; color: #0052ff; display:block; margin-bottom: 8px;"></i>
                    Carregando mídias e dados do acervo...
                </div>
            `;
        }

        try {
            const resp = await fetch(`/projetos/${projId}/acervo`);
            const data = await resp.json();

            if (!resp.ok || data.status !== 'sucesso') {
                alert("Erro ao consultar acervo: " + (data.mensagem || "Erro inesperado"));
                return;
            }

            acervoCache = data;
            if (spanAcervoNomePasta) spanAcervoNomePasta.textContent = data.projeto.nome;
            if (countAcervoSlides) countAcervoSlides.textContent = data.total_slides;

            const totalDados = (data.dados_manuais.midias?.length || 0) +
                               (data.dados_manuais.textos?.length || 0) +
                               (data.dados_manuais.indicadores?.length || 0) +
                               (data.dados_manuais.links?.length || 0);
            if (countAcervoDados) countAcervoDados.textContent = totalDados;

            renderGradeAcervoSlides();
            renderGradeAcervoDados(acervoFiltroDadoAtual);
        } catch (err) {
            console.error("Falha ao carregar acervo da pasta:", err);
            if (gridAcervoSlides) gridAcervoSlides.innerHTML = '<p class="text-danger text-center w-100">Erro de conexão ao buscar acervo.</p>';
            if (gridAcervoDados) gridAcervoDados.innerHTML = '<p class="text-danger text-center w-100">Erro de conexão ao buscar acervo.</p>';
        }
    }

    function renderGradeAcervoSlides() {
        if (!gridAcervoSlides || !acervoCache) return;

        const termo = (inputBuscaAcervoSlides ? inputBuscaAcervoSlides.value : '').toLowerCase().trim();
        const tplFiltro = selectFiltroTemplateAcervo ? selectFiltroTemplateAcervo.value : '';

        const slidesFiltrados = (acervoCache.slides || []).filter(s => {
            const matchBusca = !termo ||
                (s.titulo && s.titulo.toLowerCase().includes(termo)) ||
                (s.subtitulo && s.subtitulo.toLowerCase().includes(termo)) ||
                (s.apresentacao_nome && s.apresentacao_nome.toLowerCase().includes(termo));
            const matchTpl = !tplFiltro || s.template === tplFiltro;
            return matchBusca && matchTpl;
        });

        if (slidesFiltrados.length === 0) {
            gridAcervoSlides.innerHTML = "";
            if (emptyAcervoSlides) emptyAcervoSlides.style.display = "block";
            return;
        }

        if (emptyAcervoSlides) emptyAcervoSlides.style.display = "none";

        gridAcervoSlides.innerHTML = slidesFiltrados.map(s => {
            const tplBadge = {
                'capa': { label: 'Capa', bg: '#eff6ff', color: '#1d4ed8' },
                'imagem_texto': { label: 'Imagem + Texto', bg: '#f0fdf4', color: '#15803d' },
                'grafico': { label: 'Gráfico', bg: '#fef3c7', color: '#b45309' },
                'indicadores': { label: 'Indicadores', bg: '#f5f3ff', color: '#6d28d9' }
            }[s.template] || { label: 'Slide', bg: '#f1f5f9', color: '#475569' };

            return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                    <div style="padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="${escapeHtml(s.apresentacao_nome)}">
                            <i class="bi bi-file-earmark-slides text-primary me-1"></i>${escapeHtml(s.apresentacao_nome)}
                        </span>
                        <span style="font-size: 0.7rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${tplBadge.bg}; color: ${tplBadge.color};">
                            ${tplBadge.label}
                        </span>
                    </div>
                    <div style="padding: 10px; display: flex; justify-content: center; align-items: center; background: #f1f5f9;">
                        <div class="thumb-canvas-mini" style="height: 90px; aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); background: #fff; position: relative;">
                            ${renderMiniSlidePreview(s)}
                        </div>
                    </div>
                    <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-between;">
                        <div style="font-size: 0.8rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(s.titulo || 'Sem título')}">
                            ${escapeHtml(s.titulo || 'Slide sem título')}
                        </div>
                        <button type="button" class="btn btn-sm btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-1" onclick="window.importarSlideDoAcervo(${s.slide_id})" style="background: #0052ff; border: none; font-size: 0.8rem; padding: 6px 10px; border-radius: 6px; font-weight: 600;">
                            <i class="bi bi-plus-circle"></i> Inserir este Slide
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    window.importarSlideDoAcervo = function(slideOrigemId) {
        if (!acervoCache || !acervoCache.slides) return;
        const sOrigem = acervoCache.slides.find(s => s.slide_id === slideOrigemId);
        if (!sOrigem) return;

        slideCounter++;
        const novoSlide = {
            id: slideCounter,
            template: sOrigem.template || 'capa',
            titulo: sOrigem.titulo || '',
            subtitulo: sOrigem.subtitulo || '',
            tamanhoTitulo: sOrigem.tamanhoTitulo || 4.0,
            tamanhoSubtitulo: sOrigem.tamanhoSubtitulo || 1.8,
            corTitulo: sOrigem.corTitulo || '#0f172a',
            corSubtitulo: sOrigem.corSubtitulo || '#64748b',
            corFundo: sOrigem.corFundo || '#ffffff',
            logos: Array.isArray(sOrigem.logos) ? [...sOrigem.logos] : ['barueri'],
            customLogoImg: sOrigem.customLogoImg || null,
            ods: !!sOrigem.ods,
            odsNums: Array.isArray(sOrigem.odsNums) ? [...sOrigem.odsNums] : [],
            qr: !!sOrigem.qr,
            qrLink: sOrigem.qrLink || '',
            bgCapa: sOrigem.bgCapa || null,
            bgGeral: sOrigem.bgGeral || sOrigem.bgCapa || null,
            imgTexto: sOrigem.imgTexto || null,
            chartType: sOrigem.chartType || 'line',
            chartIndicador: sOrigem.chartIndicador || 1,
            periodo: sOrigem.periodo || 'Últimos 12 meses',
            indicadores: Array.isArray(sOrigem.indicadores) ? JSON.parse(JSON.stringify(sOrigem.indicadores)) : [],
            origens_campos: {}
        };

        slides.push(novoSlide);
        activeSlideId = novoSlide.id;
        renderThumbnails();
        renderActiveSlide();
        if (slidesThumbsList) slidesThumbsList.scrollTop = slidesThumbsList.scrollHeight;

        fecharAcervoModal();
        mostrarToastNotificacao(`Slide importado com sucesso da pasta!`);
    };

    function renderGradeAcervoDados(filtro = 'todos') {
        if (!gridAcervoDados || !acervoCache || !acervoCache.dados_manuais) return;

        const { midias = [], textos = [], indicadores = [], links = [] } = acervoCache.dados_manuais;
        let htmlCards = '';
        let totalExibidos = 0;

        // Renderização de Mídias (Fundos, Imagens, Logos)
        if (filtro === 'todos' || filtro === 'bgCapa' || filtro === 'imgTexto' || filtro === 'customLogoImg') {
            const midiasFiltradas = midias.filter(m => filtro === 'todos' || m.tipo === filtro);
            midiasFiltradas.forEach(m => {
                totalExibidos++;
                const tipoBadge = m.tipo === 'bgCapa' ? 'Fundo' : (m.tipo === 'imgTexto' ? 'Imagem' : 'Logotipo');
                htmlCards += `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                        <div style="height: 100px; background: #f8fafc; display: flex; align-items: center; justify-content: center; position: relative; border-bottom: 1px solid #f1f5f9; overflow: hidden;">
                            <img src="${m.valor}" alt="${tipoBadge}" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;">
                            <span style="position: absolute; top: 6px; right: 6px; background: rgba(15,23,42,0.7); color: #fff; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                                ${tipoBadge}
                            </span>
                        </div>
                        <div style="padding: 10px; display: flex; flex-direction: column; gap: 6px; flex: 1; justify-content: space-between;">
                            <span style="font-size: 0.72rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(m.apresentacao_nome)}">
                                De: ${escapeHtml(m.apresentacao_nome)}
                            </span>
                            <button type="button" class="btn btn-sm btn-outline-primary w-100" onclick="window.aplicarMidiaAcervo('${m.tipo}', ${JSON.stringify(m.valor)}, ${m.campo_id})" style="font-size: 0.78rem; font-weight: 600; padding: 5px;">
                                <i class="bi bi-box-arrow-in-down me-1"></i> Usar Mídia
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Renderização de Textos (Títulos e Subtítulos)
        if (filtro === 'todos' || filtro === 'textos') {
            textos.forEach(t => {
                totalExibidos++;
                const chaveRotulo = t.chave === 'titulo' ? 'Título' : 'Subtítulo';
                htmlCards += `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 0.7rem; font-weight: 700; color: #0052ff; text-transform: uppercase;">${chaveRotulo}</span>
                                <span style="font-size: 0.7rem; color: #94a3b8;">${escapeHtml(t.apresentacao_nome)}</span>
                            </div>
                            <p style="margin: 0; font-size: 0.85rem; color: #1e293b; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;" title="${escapeHtml(t.valor)}">
                                "${escapeHtml(t.valor)}"
                            </p>
                        </div>
                        <div style="display: flex; gap: 6px; margin-top: 4px;">
                            <button type="button" class="btn btn-sm btn-outline-primary flex-fill" onclick="window.aplicarTextoAcervo('titulo', ${JSON.stringify(t.valor)}, ${t.campo_id})" style="font-size: 0.72rem; padding: 4px;">
                                Como Título
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary flex-fill" onclick="window.aplicarTextoAcervo('subtitulo', ${JSON.stringify(t.valor)}, ${t.campo_id})" style="font-size: 0.72rem; padding: 4px;">
                                Como Subtítulo
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Renderização de Indicadores
        if (filtro === 'todos' || filtro === 'indicadores') {
            indicadores.forEach(ind => {
                totalExibidos++;
                htmlCards += `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 38px; height: 38px; border-radius: 8px; background: #eff6ff; display: flex; align-items: center; justify-content: center; color: ${ind.cor || '#0052ff'}; font-size: 1.2rem; flex-shrink: 0;">
                                <i class="bi ${ind.icone || 'bi-graph-up'}"></i>
                            </div>
                            <div style="min-width: 0; flex: 1;">
                                <div style="font-size: 1rem; font-weight: 800; color: #0f172a; line-height: 1.1;">${escapeHtml(ind.valor)}</div>
                                <div style="font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(ind.nome)}</div>
                            </div>
                        </div>
                        <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 2px;">
                            De: ${escapeHtml(ind.apresentacao_nome)}
                        </div>
                        <button type="button" class="btn btn-sm btn-primary w-100" onclick="window.aplicarIndicadorAcervo(${JSON.stringify(ind).replace(/"/g, '&quot;')}, ${ind.campo_id})" style="font-size: 0.75rem; font-weight: 600; padding: 5px; background: #0052ff; border: none;">
                            <i class="bi bi-plus-circle me-1"></i> Inserir no Slide
                        </button>
                    </div>
                `;
            });
        }

        if (totalExibidos === 0) {
            gridAcervoDados.innerHTML = "";
            if (emptyAcervoDados) emptyAcervoDados.style.display = "block";
            return;
        }

        if (emptyAcervoDados) emptyAcervoDados.style.display = "none";
        gridAcervoDados.innerHTML = htmlCards;
    }

    window.aplicarMidiaAcervo = function(tipo, valor, campoId) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;
        if (!slide.origens_campos) slide.origens_campos = {};

        if (tipo === 'bgCapa') {
            slide.bgGeral = valor;
            slide.bgCapa = valor;
            slide.origens_campos['bgCapa'] = campoId;
            updatePreviewMedia();
        } else if (tipo === 'imgTexto') {
            slide.imgTexto = valor;
            slide.origens_campos['imgTexto'] = campoId;
            updatePreviewMedia();
        } else if (tipo === 'customLogoImg') {
            slide.customLogoImg = valor;
            if (!slide.logos) slide.logos = [];
            if (!slide.logos.includes('custom')) slide.logos.push('custom');
            slide.origens_campos['customLogoImg'] = campoId;
            if (chkLogoCustom) chkLogoCustom.checked = true;
            if (fgLogoCustom) fgLogoCustom.style.display = 'block';
            updateSlotsVisibility();
        }

        updateActiveThumbnail();
        fecharAcervoModal();
        mostrarToastNotificacao("Mídia aplicada ao slide com sucesso!");
    };

    window.aplicarTextoAcervo = function(campoAlvo, valor, campoId) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;
        if (!slide.origens_campos) slide.origens_campos = {};

        if (campoAlvo === 'titulo') {
            slide.titulo = valor;
            if (inputTitulo) inputTitulo.value = valor;
        } else {
            slide.subtitulo = valor;
            if (inputSubtitulo) inputSubtitulo.value = valor;
        }
        slide.origens_campos[campoAlvo] = campoId;

        updatePreviewTexts();
        updateActiveThumbnail();
        fecharAcervoModal();
        mostrarToastNotificacao(`Texto inserido como ${campoAlvo}!`);
    };

    window.aplicarIndicadorAcervo = function(item, campoId) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;

        if (slide.template !== 'indicadores') {
            if (confirm("O slide atual não está usando o template de Indicadores. Deseja alternar o template deste slide para Indicadores para adicionar este item?")) {
                slide.template = 'indicadores';
                if (selectTemplate) selectTemplate.value = 'indicadores';
                switchTemplate();
            } else {
                return;
            }
        }

        if (!slide.indicadores) slide.indicadores = [];
        if (slide.indicadores.length >= 4) {
            alert("Você só pode adicionar no máximo 4 indicadores por slide.");
            return;
        }

        slide.indicadores.push({
            id: Date.now(),
            id_padrao: null,
            nome: item.nome,
            valor: item.valor,
            icone: item.icone || 'bi-graph-up',
            cor: item.cor || '#0284c7'
        });

        if (!slide.origens_campos) slide.origens_campos = {};
        slide.origens_campos['indicadores'] = campoId;

        renderIndicadores(slide);
        updateActiveThumbnail();
        fecharAcervoModal();
        mostrarToastNotificacao(`Indicador "${item.nome}" inserido no slide!`);
    };

    if (btnAcervoPasta) {
        btnAcervoPasta.addEventListener("click", () => {
            carregarAcervoPasta('slides');
        });
    }

    document.querySelectorAll(".btn-abrir-acervo-midia").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target") || 'bgCapa';
            carregarAcervoPasta('dados', target);
        });
    });

    document.querySelectorAll(".btn-abrir-acervo-dados").forEach(btn => {
        btn.addEventListener("click", () => {
            const tipo = btn.getAttribute("data-tipo") || 'textos';
            carregarAcervoPasta('dados', tipo);
        });
    });

    if (inputBuscaAcervoSlides) inputBuscaAcervoSlides.addEventListener("input", renderGradeAcervoSlides);
    if (selectFiltroTemplateAcervo) selectFiltroTemplateAcervo.addEventListener("change", renderGradeAcervoSlides);

    document.querySelectorAll('.filter-dado-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-dado-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-secondary');
            });
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-primary');
            acervoFiltroDadoAtual = btn.dataset.tipo;
            renderGradeAcervoDados(acervoFiltroDadoAtual);
        });
    });

    renderThumbnails();
    renderActiveSlide();
});
