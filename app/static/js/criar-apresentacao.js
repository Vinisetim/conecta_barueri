document.addEventListener("DOMContentLoaded", function() {
    let ODS_OPTIONS = {
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

    // --- CATÁLOGOS PRÉ-DEFINIDOS DE PINS DO MAPA ---
    const MAPA_LOCAIS_CATALOGO = {
        barueri: [
            { id: "alphaville", nome: "Alphaville", lat: -23.4927, lng: -46.8508 },
            { id: "centro", nome: "Centro", lat: -23.5044, lng: -46.8756 },
            { id: "engenho_novo", nome: "Engenho Novo", lat: -23.5123, lng: -46.8934 },
            { id: "parque_camargos", nome: "Parque dos Camargos", lat: -23.5189, lng: -46.8834 },
            { id: "aldeia_serra", nome: "Aldeia da Serra", lat: -23.5389, lng: -46.8923 },
            { id: "jardim_mutinga", nome: "Jardim Mutinga", lat: -23.5156, lng: -46.8612 },
            { id: "tambore", nome: "Tamboré", lat: -23.4890, lng: -46.8370 },
            { id: "jardim_belval", nome: "Jardim Belval", lat: -23.5080, lng: -46.8860 },
            { id: "jardim_silveira", nome: "Jardim Silveira", lat: -23.5220, lng: -46.8670 },
            { id: "cruz_preta", nome: "Cruz Preta", lat: -23.4980, lng: -46.8880 }
        ],
        brasil: [
            { id: "sao_paulo", nome: "São Paulo - SP", lat: -23.5505, lng: -46.6333 },
            { id: "rio_de_janeiro", nome: "Rio de Janeiro - RJ", lat: -22.9068, lng: -43.1729 },
            { id: "brasilia", nome: "Brasília - DF", lat: -15.7975, lng: -47.8919 },
            { id: "salvador", nome: "Salvador - BA", lat: -12.9777, lng: -38.5016 },
            { id: "belo_horizonte", nome: "Belo Horizonte - MG", lat: -19.9167, lng: -43.9345 },
            { id: "curitiba", nome: "Curitiba - PR", lat: -25.4284, lng: -49.2733 },
            { id: "porto_alegre", nome: "Porto Alegre - RS", lat: -30.0346, lng: -51.2177 },
            { id: "recife", nome: "Recife - PE", lat: -8.0476, lng: -34.8770 },
            { id: "fortaleza", nome: "Fortaleza - CE", lat: -3.7319, lng: -38.5267 },
            { id: "manaus", nome: "Manaus - AM", lat: -3.1190, lng: -60.0217 },
            { id: "belem", nome: "Belém - PA", lat: -1.4558, lng: -48.4902 },
            { id: "goiania", nome: "Goiânia - GO", lat: -16.6869, lng: -49.2648 }
        ]
    };

    // Dados para gráficos dos popups de mapa
    const POPUP_CHART_INDICADORES = {
        saude: { label: "Atendimentos Médicos", color: "#ef4444", data: [6420, 6800, 7150, 7400, 7900, 8735] },
        seguranca: { label: "Ocorrências Solucionadas", color: "#3b82f6", data: [890, 940, 980, 1050, 1140, 1243] },
        educacao: { label: "Alunos Matriculados", color: "#8b5cf6", data: [3100, 3250, 3400, 3600, 3750, 3890] },
        mobilidade: { label: "Passageiros Transportados (mil)", color: "#f59e0b", data: [9800, 10400, 11200, 11800, 12100, 12430] },
        "meio-ambiente": { label: "Índice de Coleta Seletiva (%)", color: "#10b981", data: [82, 85, 88, 90, 92, 94.3] },
        social: { label: "Famílias Assistidas", color: "#ec4899", data: [1750, 1860, 1980, 2100, 2240, 2341] }
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

    if (urlParams.get('template') && slides.length === 1) { slides[0].template = initialTemplate; }
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
    const layoutMapa = document.querySelector(".layout-mapa");
    const tplMapa = document.querySelectorAll(".tpl-mapa");
    const slideMapContainer = document.getElementById("slideMapContainer");
    const mapaTipoRadios = document.querySelectorAll("input[name='mapaTipoRadio']");
    const mapaPinsBadge = document.getElementById("mapaPinsBadge");
    const selectPinLocal = document.getElementById("selectPinLocal");
    const btnTipoPopups = document.querySelectorAll(".btn-tipo-popup");
    const pinFieldsTexto = document.getElementById("pinFieldsTexto");
    const pinFieldsGrafico = document.getElementById("pinFieldsGrafico");
    const pinFieldsImagem = document.getElementById("pinFieldsImagem");
    const inputPinTextoTitulo = document.getElementById("inputPinTextoTitulo");
    const inputPinTextoDescricao = document.getElementById("inputPinTextoDescricao");
    const inputPinGraficoTitulo = document.getElementById("inputPinGraficoTitulo");
    const selectPinGraficoTipo = document.getElementById("selectPinGraficoTipo");
    const selectPinGraficoIndicador = document.getElementById("selectPinGraficoIndicador");
    const inputPinImgTitulo = document.getElementById("inputPinImgTitulo");
    const inputPinImgUrl = document.getElementById("inputPinImgUrl");
    const btnUploadPinImg = document.getElementById("btnUploadPinImg");
    const inputUploadPinImgFile = document.getElementById("inputUploadPinImgFile");
    const btnAddPin = document.getElementById("btnAddPinMapa") || document.getElementById("btnAddPin");
    const listaPinsAdicionados = document.getElementById("listaPinsAdicionados");

    let slideMapInstance = null;
    let slideMapMarkers = [];

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

        if (tpl === 'mapa') {
            const logoHtml = buildLogosHtml(slide, true);
            const pinCount = (slide.mapaPins || []).length;
            const regiaoNome = (slide.mapaTipo === 'brasil') ? 'Brasil' : 'Barueri';
            const defaultTextColor = '#0f172a';
            const defaultSubColor = '#64748b';
            const textColor = slide.corTitulo || defaultTextColor;
            const subtextColor = slide.corSubtitulo || defaultSubColor;
            const titleSize = slide.tamanhoTitulo ? (slide.tamanhoTitulo * 1.5) + 'px' : '5.5px';
            const subtitleSize = slide.tamanhoSubtitulo ? (slide.tamanhoSubtitulo * 1.5) + 'px' : '3.8px';
            return `
                <div style="width:100%; height:100%; position:relative; padding:3px 4px; display:flex; flex-direction:column; justify-content:space-between; background:#f0f9ff; box-sizing:border-box; overflow:hidden;">
                    <div style="position:absolute; inset:0; opacity:0.25; background-image: radial-gradient(#0284c7 1px, transparent 1px); background-size: 6px 6px;"></div>
                    <div style="position:relative; z-index:1; display:flex; flex-direction:column;">
                        ${logoHtml}
                        <div style="font-size:${titleSize}; font-weight:800; color:${textColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; line-height:1;">${title || 'Mapa Interativo'}</div>
                        <div style="font-size:${subtitleSize}; color:${subtextColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; line-height:1; margin-top:1px;">${subtitle || ('Região: ' + regiaoNome)}</div>
                    </div>
                    <div style="position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
                        <span style="font-size:3px; background:rgba(255,255,255,0.9); padding:0.5px 2px; border-radius:1px; font-weight:700; color:#ef4444; border:0.5px solid #fca5a5; display:inline-flex; align-items:center; gap:1px;">
                            <i class="bi bi-geo-alt-fill" style="font-size:3px;"></i> ${pinCount}/5 pins
                        </span>
                        <span style="font-size:3px; color:#0369a1; font-weight:700; text-transform:uppercase;">${regiaoNome}</span>
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
        if(slide.template === "modulos_pilares") syncPilaresSlide(slide);
        if(slide.template === "mapa") {
            slide.mapaTipo = slide.mapaTipo || "barueri";
            slide.mapaPins = slide.mapaPins || [];
            syncMapaSidebar(slide);
            renderSlideMap(slide);
        }
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
        if (selectChartIndicador) selectChartIndicador.value = slide.chartIndicador || 1;

        const selectPeriodo = document.getElementById("selectPeriodo");
        if (selectPeriodo) selectPeriodo.value = slide.periodo || "Últimos 12 meses";

        const previewPeriodo = document.getElementById("previewPeriodo");
        if (previewPeriodo) previewPeriodo.textContent = slide.periodo || "Últimos 12 meses";

        const ctx = document.getElementById('slideChart');
        if (!ctx) return;

        let type = slide.chartType || "line";
        let data, options;

        const idInd = parseInt(slide.chartIndicador) || 1;
        const ind = (INDICADORES_PREDEFINIDOS && INDICADORES_PREDEFINIDOS.find(i => i.id === idInd || i.id_padrao === idInd)) || (INDICADORES_PREDEFINIDOS && INDICADORES_PREDEFINIDOS[0]) || { nome: "Métrica", cor: "#0052ff", valor: "100" };

        let labels = [];
        let valores = [];
        if (ind && Array.isArray(ind.historico) && ind.historico.length > 0) {
            labels = ind.historico.map(h => String(h.periodo || ''));
            valores = ind.historico.map(h => typeof h.valor === 'number' ? h.valor : parseFloat(h.valor) || 0);
        } else {
            labels = ['2020', '2021', '2022', '2023', '2024'];
            const baseVal = parseFloat(String(ind.valor || '100').replace(/[^0-9.]/g, '')) || 100;
            valores = [
                Math.round(baseVal * 0.70 * 10) / 10,
                Math.round(baseVal * 0.80 * 10) / 10,
                Math.round(baseVal * 0.88 * 10) / 10,
                Math.round(baseVal * 0.94 * 10) / 10,
                baseVal
            ];
        }

        const corPrincipal = ind.cor || '#0052ff';
        const nomeMetrica = ind.nome_metrica || ind.nome || 'Métrica Municipal';

        if (type === "line" || type === "bar") {
            data = {
                labels: labels,
                datasets: [{
                    label: nomeMetrica,
                    data: valores,
                    borderColor: corPrincipal,
                    backgroundColor: type === "line" ? corPrincipal + '25' : corPrincipal,
                    borderWidth: type === "line" ? 3 : 0,
                    tension: 0.35,
                    fill: type === "line",
                    borderRadius: type === "bar" ? 5 : 0
                }]
            };
            options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${nomeMetrica}: ${context.parsed.y} ${ind.unidade_medida || ''}`.trim();
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: false, grid: { color: '#f1f5f9' }, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false } }
                }
            };
        } else if (type === "pie") {
            const coresPie = ['#0052ff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
            data = {
                labels: labels.slice(-5),
                datasets: [{
                    data: valores.slice(-5),
                    backgroundColor: coresPie.slice(0, Math.min(valores.length, 5)),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            };
            options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
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

        if (layoutCapa) layoutCapa.style.display = "none";
        if (layoutImgTexto) layoutImgTexto.style.display = "none";
        if (layoutIndicadores) layoutIndicadores.style.display = "none";
        if (layoutGrafico) layoutGrafico.style.display = "none";
        if (layoutMapa) layoutMapa.style.display = "none";

        tplCapa.forEach(el => el.style.display = "none");
        tplImgTexto.forEach(el => el.style.display = "none");
        tplIndicadores.forEach(el => el.style.display = "none");
        tplGrafico.forEach(el => el.style.display = "none");
        tplMapa.forEach(el => el.style.display = "none");

        document.getElementById("activeSlideSurface").className = "slide-surface template-" + val;

        if(val === "capa") {
            layoutCapa.style.display = "block";
            tplCapa.forEach(el => el.style.display = "flex");
            labelTitulo.textContent = "Título";
            labelSubtitulo.textContent = "Subtítulo";
            fgSubtitulo.style.display = "flex";
        } else if(val === "modulos_pilares") {
            if (layoutModulosPilares) layoutModulosPilares.style.display = "flex";
            tplModulosPilares.forEach(el => el.style.display = "flex");
            labelTitulo.textContent = "Título dos Pilares";
            labelSubtitulo.textContent = "Subtítulo / Introdução";
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
        } else if(val === "mapa") {
            if (layoutMapa) layoutMapa.style.display = "flex";
            tplMapa.forEach(el => el.style.display = "block");
            labelTitulo.textContent = "Título do Slide";
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
            if(slide.template === "mapa") {
                slide.mapaTipo = slide.mapaTipo || "barueri";
                slide.mapaPins = slide.mapaPins || [];
                syncMapaSidebar(slide);
                renderSlideMap(slide);
            }
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

    // --- INDICADORES OFICIAIS DO BANCO DE DADOS (apresentacao.indicador) ---
    let INDICADORES_PREDEFINIDOS = [
        { id: 1, id_padrao: 1, secretaria: "Inovação e Tecnologia (CIT)", nome: "Processos 100% Digitais (Barueri Sem Papel)", nome_metrica: "Processos 100% Digitais (Barueri Sem Papel)", valor: "98.4 %", valor_numerico: 98.4, unidade_medida: "%", icone: "bi-cpu", cor: "#0052ff", historico: [{"periodo": "2020", "valor": 34.0}, {"periodo": "2021", "valor": 61.5}, {"periodo": "2022", "valor": 82.0}, {"periodo": "2023", "valor": 94.2}, {"periodo": "2024", "valor": 98.4}] },
        { id: 2, id_padrao: 2, secretaria: "Inovação e Tecnologia (CIT)", nome: "Pontos de Conexão Wi-Fi Gratuita nos Bairros", nome_metrica: "Pontos de Conexão Wi-Fi Gratuita nos Bairros", valor: "185 pontos", valor_numerico: 185, unidade_medida: "pontos", icone: "bi-wifi", cor: "#10b981", historico: [{"periodo": "2020", "valor": 45}, {"periodo": "2021", "valor": 80}, {"periodo": "2022", "valor": 120}, {"periodo": "2023", "valor": 160}, {"periodo": "2024", "valor": 185}] },
        { id: 3, id_padrao: 3, secretaria: "Saúde", nome: "Consultas Médicas Realizadas na Rede Básica", nome_metrica: "Consultas Médicas Realizadas na Rede Básica", valor: "2.45 milhões", valor_numerico: 2.45, unidade_medida: "milhões", icone: "bi-heart-pulse", cor: "#3b82f6", historico: [{"periodo": "2020", "valor": 1.8}, {"periodo": "2021", "valor": 1.95}, {"periodo": "2022", "valor": 2.15}, {"periodo": "2023", "valor": 2.38}, {"periodo": "2024", "valor": 2.45}] },
        { id: 4, id_padrao: 4, secretaria: "Saúde", nome: "Índice de Cobertura Vacinal Pediátrica", nome_metrica: "Índice de Cobertura Vacinal Pediátrica", valor: "96.8 %", valor_numerico: 96.8, unidade_medida: "%", icone: "bi-shield-check", cor: "#a855f7", historico: [{"periodo": "2020", "valor": 88.5}, {"periodo": "2021", "valor": 91.2}, {"periodo": "2022", "valor": 93.7}, {"periodo": "2023", "valor": 95.4}, {"periodo": "2024", "valor": 96.8}] },
        { id: 5, id_padrao: 5, secretaria: "Educação", nome: "Alunos Matriculados na Rede Municipal", nome_metrica: "Alunos Matriculados na Rede Municipal", valor: "68.2 mil alunos", valor_numerico: 68.2, unidade_medida: "mil alunos", icone: "bi-book", cor: "#f59e0b", historico: [{"periodo": "2020", "valor": 61.0}, {"periodo": "2021", "valor": 62.8}, {"periodo": "2022", "valor": 65.4}, {"periodo": "2023", "valor": 67.1}, {"periodo": "2024", "valor": 68.2}] },
        { id: 6, id_padrao: 6, secretaria: "Educação", nome: "Escolas com Laboratórios Maker e Robótica", nome_metrica: "Escolas com Laboratórios Maker e Robótica", valor: "74 escolas", valor_numerico: 74, unidade_medida: "escolas", icone: "bi-robot", cor: "#f59e0b", historico: [{"periodo": "2020", "valor": 12}, {"periodo": "2021", "valor": 28}, {"periodo": "2022", "valor": 45}, {"periodo": "2023", "valor": 62}, {"periodo": "2024", "valor": 74}] },
        { id: 7, id_padrao: 7, secretaria: "Segurança Urbana", nome: "Câmeras Inteligentes Conectadas ao COI", nome_metrica: "Câmeras Inteligentes Conectadas ao COI", valor: "620 câmeras", valor_numerico: 620, unidade_medida: "câmeras", icone: "bi-shield-check", cor: "#a855f7", historico: [{"periodo": "2020", "valor": 210}, {"periodo": "2021", "valor": 320}, {"periodo": "2022", "valor": 440}, {"periodo": "2023", "valor": 530}, {"periodo": "2024", "valor": 620}] },
        { id: 8, id_padrao: 8, secretaria: "Finanças e Planejamento", nome: "Investimento Municipal em Modernização Tecnológica", nome_metrica: "Investimento Municipal em Modernização Tecnológica", valor: "142.5 R$ Milhões", valor_numerico: 142.5, unidade_medida: "R$ Milhões", icone: "bi-graph-up-arrow", cor: "#ef4444", historico: [{"periodo": "2020", "valor": 48.2}, {"periodo": "2021", "valor": 72.5}, {"periodo": "2022", "valor": 98.0}, {"periodo": "2023", "valor": 121.4}, {"periodo": "2024", "valor": 142.5}] }
    ];

    function popularSelectsIndicadores() {
        const selectIndicadorNovo = document.getElementById("selectIndicadorNovo");
        if (selectIndicadorNovo) {
            const valAntigo = selectIndicadorNovo.value;
            selectIndicadorNovo.innerHTML = INDICADORES_PREDEFINIDOS.map(ind => 
                `<option value="${ind.id}">${escapeHtml(ind.nome_metrica || ind.nome)} (${escapeHtml(ind.valor)})</option>`
            ).join("");
            if (valAntigo && INDICADORES_PREDEFINIDOS.some(i => String(i.id) === String(valAntigo))) {
                selectIndicadorNovo.value = valAntigo;
            }
        }

        const selectChartIndicador = document.getElementById("selectChartIndicador");
        if (selectChartIndicador) {
            const valAntigo = selectChartIndicador.value;
            selectChartIndicador.innerHTML = INDICADORES_PREDEFINIDOS.map(ind => 
                `<option value="${ind.id}">${escapeHtml(ind.nome_metrica || ind.nome)} (${escapeHtml(ind.secretaria || '')})</option>`
            ).join("");
            if (valAntigo && INDICADORES_PREDEFINIDOS.some(i => String(i.id) === String(valAntigo))) {
                selectChartIndicador.value = valAntigo;
            }
        }

        const selectPinGraficoIndicador = document.getElementById("selectPinGraficoIndicador");
        if (selectPinGraficoIndicador) {
            const valAntigo = selectPinGraficoIndicador.value;
            selectPinGraficoIndicador.innerHTML = INDICADORES_PREDEFINIDOS.map(ind => 
                `<option value="${ind.id}">${escapeHtml(ind.nome_metrica || ind.nome)}</option>`
            ).join("");
            if (valAntigo && INDICADORES_PREDEFINIDOS.some(i => String(i.id) === String(valAntigo))) {
                selectPinGraficoIndicador.value = valAntigo;
            }
        }
    }

    async function carregarIndicadoresDoBanco() {
        try {
            const resp = await fetch('/api/indicadores');
            const data = await resp.json();
            if (resp.ok && data.status === 'sucesso' && Array.isArray(data.indicadores) && data.indicadores.length > 0) {
                INDICADORES_PREDEFINIDOS = data.indicadores;
                popularSelectsIndicadores();
                const curSlide = slides.find(s => s.id === activeSlideId);
                if (curSlide && curSlide.template === 'grafico') {
                    renderChart(curSlide);
                } else if (curSlide && curSlide.template === 'indicadores') {
                    renderIndicadores(curSlide);
                }
            }
        } catch (err) {
            console.warn("Aviso ao carregar indicadores dinâmicos do banco:", err);
        }
    }

    async function carregarOdsDoBanco() {
        try {
            const resp = await fetch('/api/ods');
            const data = await resp.json();
            if (resp.ok && data.status === 'sucesso' && Array.isArray(data.ods) && data.ods.length > 0) {
                data.ods.forEach(o => {
                    const numKey = String(o.numero);
                    ODS_OPTIONS[numKey] = {
                        num: numKey,
                        label: o.titulo,
                        color: o.cor_hex || '#0052ff',
                        icone_url: o.icone_url
                    };
                });
                const curSlide = slides.find(s => s.id === activeSlideId);
                if (curSlide && curSlide.ods) {
                    updateSlotsVisibility();
                }
            }
        } catch (err) {
            console.warn("Aviso ao carregar ODS do banco:", err);
        }
    }

    const btnAddIndicador = document.getElementById("btnAddIndicador");
    if (btnAddIndicador) {
        btnAddIndicador.addEventListener("click", () => {
            const selectInd = document.getElementById("selectIndicadorNovo");
            const val = parseInt(selectInd.value);
            const template = INDICADORES_PREDEFINIDOS.find(i => i.id === val || i.id_padrao === val);

            if (template) {
                const slide = slides.find(s => s.id === activeSlideId);
                if (slide && slide.template === "indicadores") {
                    if (!slide.indicadores) slide.indicadores = [];

                    if (slide.indicadores.length >= 4) {
                        alert("Você só pode adicionar no máximo 4 indicadores por slide.");
                        return;
                    }

                    // Verify if it's already added
                    if (slide.indicadores.some(i => i.id_padrao === val || i.id === val)) {
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
            mapaTipo: "barueri",
            mapaPins: [],
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
        }

        if (btnNextSlide) {
            btnNextSlide.disabled = (currentIndex === total - 1);
        }
    }

    function navegarSlidePreview(delta) {
        const currentIndex = slides.findIndex(s => s.id === activeSlideId);
        const nextIndex = currentIndex + delta;
        if (nextIndex >= 0 && nextIndex < slides.length) {
            activeSlideId = slides[nextIndex].id;
            renderThumbnails();
            renderActiveSlide();
            atualizarPreviewNavegacao();

            setTimeout(() => {
                const curSlide = slides.find(s => s.id === activeSlideId);
                if (curSlide && curSlide.template === "mapa" && slideMapInstance) {
                    slideMapInstance.invalidateSize();
                } else if (curSlide && curSlide.template === "grafico" && slideChartInstance) {
                    slideChartInstance.resize();
                }
            }, 180);
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
        activeSlideSurface.style.width = "100%";
        activeSlideSurface.style.height = "100%";

        // 3. Exibe o modal ocupando a tela toda (tela preta total com barra no topo)
        previewModal.style.display = "flex";
        atualizarPreviewNavegacao();

        // 4. Solicita tela cheia nativa do navegador
        try {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (previewModal.requestFullscreen) {
                    await previewModal.requestFullscreen();
                } else if (previewModal.webkitRequestFullscreen) {
                    await previewModal.webkitRequestFullscreen();
                } else if (previewModal.msRequestFullscreen) {
                    await previewModal.msRequestFullscreen();
                } else if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            }
        } catch (err) {
            console.warn("Fullscreen request blocked or not permitted:", err);
        }

        // 5. Redimensiona mapas e gráficos após a transição
        setTimeout(() => {
            const curSlide = slides.find(s => s.id === activeSlideId);
            if (curSlide && curSlide.template === "mapa" && slideMapInstance) {
                slideMapInstance.invalidateSize();
            } else if (curSlide && curSlide.template === "grafico" && slideChartInstance) {
                slideChartInstance.resize();
            }
        }, 220);
        setTimeout(() => {
            const curSlide = slides.find(s => s.id === activeSlideId);
            if (curSlide && curSlide.template === "mapa" && slideMapInstance) {
                slideMapInstance.invalidateSize();
            } else if (curSlide && curSlide.template === "grafico" && slideChartInstance) {
                slideChartInstance.resize();
            }
        }, 550);
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
            activeSlideSurface.style.width = "100%";
            activeSlideSurface.style.height = "auto";
            activeSlideSurface.style.borderRadius = "var(--radius-lg)";
            activeSlideSurface.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.06)";
        }

        const curSlideClosed = slides.find(s => s.id === activeSlideId);
        if (curSlideClosed && curSlideClosed.template === "mapa" && slideMapInstance) {
            setTimeout(() => { slideMapInstance.invalidateSize(); }, 250);
        } else if (curSlideClosed && curSlideClosed.template === "grafico" && slideChartInstance) {
            setTimeout(() => { slideChartInstance.resize(); }, 250);
        }
    }

    if (btnVisualizar) {
        btnVisualizar.addEventListener("click", abrirModoApresentacao);
    }

    if (btnClosePreview) {
        btnClosePreview.addEventListener("click", fecharModoApresentacao);
    }

    if (btnPrevSlide) {
        btnPrevSlide.addEventListener("click", () => navegarSlidePreview(-1));
    }

    if (btnNextSlide) {
        btnNextSlide.addEventListener("click", () => navegarSlidePreview(1));
    }

    // Monitora evento de saída de tela cheia (ex: tecla ESC nativa do navegador)
    const onFullscreenChangeHandler = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && previewModal && previewModal.style.display === "flex") {
            fecharModoApresentacao();
        } else if ((document.fullscreenElement || document.webkitFullscreenElement) && previewModal && previewModal.style.display === "flex") {
            setTimeout(() => {
                const curSlide = slides.find(s => s.id === activeSlideId);
                if (curSlide && curSlide.template === "mapa" && slideMapInstance) {
                    slideMapInstance.invalidateSize();
                } else if (curSlide && curSlide.template === "grafico" && slideChartInstance) {
                    slideChartInstance.resize();
                }
            }, 200);
        }
    };
    document.addEventListener("fullscreenchange", onFullscreenChangeHandler);
    document.addEventListener("webkitfullscreenchange", onFullscreenChangeHandler);

    window.addEventListener("resize", () => {
        if (previewModal && previewModal.style.display === "flex") {
            const curSlide = slides.find(s => s.id === activeSlideId);
            if (curSlide && curSlide.template === "mapa" && slideMapInstance) {
                slideMapInstance.invalidateSize();
            } else if (curSlide && curSlide.template === "grafico" && slideChartInstance) {
                slideChartInstance.resize();
            }
        }
    });

    // Teclas de atalho no modo apresentação: Setas, Espaço, PageUp/Down, Esc
    document.addEventListener("keydown", (e) => {
        if (previewModal && previewModal.style.display === "flex") {
            if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
                e.preventDefault();
                navegarSlidePreview(1);
            } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
                e.preventDefault();
                navegarSlidePreview(-1);
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
    const tabBtnKitsCit = document.getElementById("tabBtnKitsCit");
    const tabBtnAcervoSlides = document.getElementById("tabBtnAcervoSlides");
    const tabBtnAcervoDados = document.getElementById("tabBtnAcervoDados");
    const painelKitsCit = document.getElementById("painelKitsCit");
    const painelAcervoSlides = document.getElementById("painelAcervoSlides");
    const painelAcervoDados = document.getElementById("painelAcervoDados");
    const countKitsCit = document.getElementById("countKitsCit");
    const countAcervoSlides = document.getElementById("countAcervoSlides");
    const countAcervoDados = document.getElementById("countAcervoDados");
    const gridKitsCit = document.getElementById("gridKitsCit");
    const emptyKitsCit = document.getElementById("emptyKitsCit");
    const gridAcervoSlides = document.getElementById("gridAcervoSlides");
    const emptyAcervoSlides = document.getElementById("emptyAcervoSlides");
    const gridAcervoDados = document.getElementById("gridAcervoDados");
    const emptyAcervoDados = document.getElementById("emptyAcervoDados");
    const inputBuscaKitsCit = document.getElementById("inputBuscaKitsCit");
    const selectFiltroSecretariaCit = document.getElementById("selectFiltroSecretariaCit");
    const inputBuscaAcervoSlides = document.getElementById("inputBuscaAcervoSlides");
    const selectFiltroPastaAcervo = document.getElementById("selectFiltroPastaAcervo");
    const selectFiltroTemplateAcervo = document.getElementById("selectFiltroTemplateAcervo");
    const btnAcervoPasta = document.getElementById("btnAcervoPasta");

    let kitsCitCache = null;

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
        if (painelKitsCit) painelKitsCit.style.display = (aba === 'kits') ? 'block' : 'none';
        if (painelAcervoSlides) painelAcervoSlides.style.display = (aba === 'slides') ? 'block' : 'none';
        if (painelAcervoDados) painelAcervoDados.style.display = (aba === 'dados') ? 'block' : 'none';

        [tabBtnKitsCit, tabBtnAcervoSlides, tabBtnAcervoDados].forEach(btn => {
            if (btn) {
                btn.style.color = '#64748b';
                btn.style.borderBottom = '2px solid transparent';
            }
        });

        if (aba === 'kits' && tabBtnKitsCit) {
            tabBtnKitsCit.style.color = '#0052ff';
            tabBtnKitsCit.style.borderBottom = '2px solid #0052ff';
        } else if (aba === 'slides' && tabBtnAcervoSlides) {
            tabBtnAcervoSlides.style.color = '#0052ff';
            tabBtnAcervoSlides.style.borderBottom = '2px solid #0052ff';
        } else if (aba === 'dados' && tabBtnAcervoDados) {
            tabBtnAcervoDados.style.color = '#0052ff';
            tabBtnAcervoDados.style.borderBottom = '2px solid #0052ff';
        }
    }

    if (tabBtnKitsCit) tabBtnKitsCit.addEventListener("click", () => alternarAbaAcervo('kits'));
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

    async function carregarAcervoPasta(tabPadrao = 'kits', targetFilter = null) {
        acervoTargetField = targetFilter;
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

        carregarKitsCit();
        carregarAcervoGlobal();
    }

    // =========================================================================
    // KITS DE PROJETOS OFICIAIS DO CIT
    // =========================================================================
    async function carregarKitsCit() {
        if (!gridKitsCit) return;
        if (!kitsCitCache) {
            gridKitsCit.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: #64748b;">
                    <i class="bi bi-arrow-repeat spin" style="font-size: 2rem; color: #0052ff; display:block; margin-bottom: 8px;"></i>
                    Carregando 114 projetos oficiais do CIT de Barueri...
                </div>
            `;
            try {
                const resp = await fetch('/api/projetos-cit');
                const data = await resp.json();
                if (resp.ok && data.status === 'sucesso') {
                    kitsCitCache = data.projetos || [];
                    if (countKitsCit) countKitsCit.textContent = kitsCitCache.length;
                    popularFiltroSecretarias(kitsCitCache);
                } else {
                    gridKitsCit.innerHTML = '<p class="text-danger text-center w-100">Falha ao carregar projetos do CIT.</p>';
                    return;
                }
            } catch (err) {
                console.error("Erro ao buscar projetos do CIT:", err);
                gridKitsCit.innerHTML = '<p class="text-danger text-center w-100">Erro de rede ao buscar projetos do CIT.</p>';
                return;
            }
        }
        renderGradeKitsCit();
    }

    function popularFiltroSecretarias(projetos) {
        if (!selectFiltroSecretariaCit) return;
        const secretarias = new Set();
        projetos.forEach(p => {
            if (p.secretaria) secretarias.add(p.secretaria);
        });
        const atual = selectFiltroSecretariaCit.value;
        selectFiltroSecretariaCit.innerHTML = '<option value="todas">Todas as Secretarias</option>';
        Array.from(secretarias).sort().forEach(sec => {
            const opt = document.createElement('option');
            opt.value = sec;
            opt.textContent = sec;
            selectFiltroSecretariaCit.appendChild(opt);
        });
        if (atual) selectFiltroSecretariaCit.value = atual;
    }

    function renderGradeKitsCit() {
        if (!gridKitsCit || !kitsCitCache) return;
        const termo = (inputBuscaKitsCit ? inputBuscaKitsCit.value : '').toLowerCase().trim();
        const secFiltro = selectFiltroSecretariaCit ? selectFiltroSecretariaCit.value : 'todas';

        const filtrados = kitsCitCache.filter(p => {
            const matchBusca = !termo ||
                (p.nome && p.nome.toLowerCase().includes(termo)) ||
                (p.resumo && p.resumo.toLowerCase().includes(termo)) ||
                (p.secretaria && p.secretaria.toLowerCase().includes(termo));
            const matchSec = (secFiltro === 'todas') || (p.secretaria === secFiltro);
            return matchBusca && matchSec;
        });

        if (countKitsCit) countKitsCit.textContent = filtrados.length;

        if (filtrados.length === 0) {
            gridKitsCit.innerHTML = '';
            if (emptyKitsCit) emptyKitsCit.style.display = 'block';
            return;
        }

        if (emptyKitsCit) emptyKitsCit.style.display = 'none';

        gridKitsCit.innerHTML = filtrados.map(p => {
            const fotoEstilo = p.foto_url 
                ? `background-image: url('${escapeHtml(p.foto_url)}'); background-size: cover; background-position: center;`
                : `background: linear-gradient(135deg, #0052ff 0%, #0284c7 100%);`;

            return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <div style="height: 110px; ${fotoEstilo} position: relative; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.75) 100%); z-index: 1;"></div>
                        <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: flex-start;">
                            <span style="font-size: 0.68rem; font-weight: 700; background: rgba(255,255,255,0.92); color: #0052ff; padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">CIT Oficial</span>
                            <span style="font-size: 0.68rem; font-weight: 600; background: rgba(16,185,129,0.9); color: #fff; padding: 2px 8px; border-radius: 12px;">${escapeHtml(p.status_operacional || 'Ativo')}</span>
                        </div>
                        <div style="position: relative; z-index: 2; color: #fff;">
                            <span style="font-size: 0.72rem; opacity: 0.9; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.secretaria || 'Prefeitura de Barueri')}</span>
                        </div>
                    </div>
                    <div style="padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-between;">
                        <div>
                            <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; line-height: 1.3;" title="${escapeHtml(p.nome)}">${escapeHtml(p.nome)}</h4>
                            <p style="margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${escapeHtml(p.resumo || '')}">
                                ${escapeHtml(p.resumo || 'Iniciativa inovadora integrada ao catálogo de projetos municipais.')}
                            </p>
                        </div>
                        <div style="margin-top: 6px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-size: 0.72rem; font-weight: 600; color: #0052ff; background: #eff6ff; padding: 3px 8px; border-radius: 6px; border: 1px solid #bfdbfe;">
                                    <i class="bi bi-stack me-1"></i> Kit com ${p.total_slides || 3} slides
                                </span>
                            </div>
                            <button type="button" class="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-1" onclick="window.inserirKitProjeto(${p.id})" style="background: #0052ff; border: none; font-size: 0.82rem; padding: 8px 12px; border-radius: 8px; font-weight: 600;">
                                <i class="bi bi-plus-circle-fill"></i> Inserir Kit Completo (${p.total_slides || 3} slides)
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.inserirKitProjeto = async function(projetoId) {
        try {
            mostrarToastNotificacao("Carregando kit de slides do projeto...", "#0052ff");
            const resp = await fetch(`/api/projetos-cit/${projetoId}/slides`);
            const data = await resp.json();

            if (!resp.ok || data.status !== 'sucesso') {
                alert("Erro ao obter kit de slides: " + (data.mensagem || "Erro inesperado"));
                return;
            }

            const slidesKit = data.slides || [];
            if (slidesKit.length === 0) {
                alert("Este projeto não possui slides pré-configurados no kit.");
                return;
            }

            let primeiroNovoId = null;

            slidesKit.forEach((sMestre, idx) => {
                slideCounter++;
                const novoSlide = {
                    id: slideCounter,
                    template: sMestre.template || 'capa',
                    titulo: sMestre.titulo || '',
                    subtitulo: sMestre.subtitulo || '',
                    tamanhoTitulo: sMestre.tamanhoTitulo || 4.0,
                    tamanhoSubtitulo: sMestre.tamanhoSubtitulo || 1.8,
                    corTitulo: sMestre.corTitulo || '#0f172a',
                    corSubtitulo: sMestre.corSubtitulo || '#64748b',
                    corFundo: sMestre.corFundo || '#ffffff',
                    logos: Array.isArray(sMestre.logos) ? [...sMestre.logos] : ['barueri'],
                    customLogoImg: sMestre.customLogoImg || null,
                    ods: !!sMestre.ods,
                    odsNums: Array.isArray(sMestre.odsNums) ? [...sMestre.odsNums] : [],
                    qr: !!sMestre.qr,
                    qrLink: sMestre.qrLink || '',
                    bgCapa: sMestre.bgCapa || null,
                    bgGeral: sMestre.bgGeral || sMestre.bgCapa || null,
                    imgTexto: sMestre.imgTexto || null,
                    chartType: sMestre.chartType || 'line',
                    chartIndicador: sMestre.chartIndicador || 1,
                    periodo: sMestre.periodo || 'Últimos 12 meses',
                    indicadores: Array.isArray(sMestre.indicadores) ? JSON.parse(JSON.stringify(sMestre.indicadores)) : [],
                    mapaTipo: sMestre.mapaTipo || 'barueri',
                    mapaPins: Array.isArray(sMestre.mapaPins) ? JSON.parse(JSON.stringify(sMestre.mapaPins)) : [],
                    pilar_1_titulo: sMestre.pilar_1_titulo || '',
                    pilar_1_texto: sMestre.pilar_1_texto || '',
                    pilar_2_titulo: sMestre.pilar_2_titulo || '',
                    pilar_2_texto: sMestre.pilar_2_texto || '',
                    pilar_3_titulo: sMestre.pilar_3_titulo || '',
                    pilar_3_texto: sMestre.pilar_3_texto || '',
                    origens_campos: {}
                };

                slides.push(novoSlide);
                if (idx === 0) primeiroNovoId = novoSlide.id;
            });

            if (primeiroNovoId) activeSlideId = primeiroNovoId;
            renderThumbnails();
            renderActiveSlide();
            if (slidesThumbsList) slidesThumbsList.scrollTop = slidesThumbsList.scrollHeight;

            fecharAcervoModal();
            mostrarToastNotificacao(`Kit "${data.projeto?.nome || 'Projeto'}" inserido com sucesso (${slidesKit.length} slides)!`);
        } catch (err) {
            console.error("Erro ao inserir kit do projeto:", err);
            alert("Erro de comunicação ao inserir kit do projeto.");
        }
    };

    // =========================================================================
    // SLIDES E DADOS COMPARTILHADOS DE TODA A PLATAFORMA
    // =========================================================================
    async function carregarAcervoGlobal() {
        if (!gridAcervoSlides) return;
        gridAcervoSlides.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: #64748b;">
                <i class="bi bi-arrow-repeat spin" style="font-size: 2rem; color: #0052ff; display:block; margin-bottom: 8px;"></i>
                Carregando slides compartilhados de toda a plataforma...
            </div>
        `;

        try {
            const resp = await fetch('/api/acervo/global');
            const data = await resp.json();

            if (!resp.ok || data.status !== 'sucesso') {
                gridAcervoSlides.innerHTML = '<p class="text-danger text-center w-100">Falha ao buscar acervo.</p>';
                return;
            }

            acervoCache = data;
            if (countAcervoSlides) countAcervoSlides.textContent = data.total_slides || (data.slides ? data.slides.length : 0);

            // Popula o select de filtro por pasta
            if (selectFiltroPastaAcervo && data.pastas) {
                const pastaAtual = selectFiltroPastaAcervo.value;
                selectFiltroPastaAcervo.innerHTML = '<option value="">Todas as Pastas</option>';
                data.pastas.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.nome;
                    selectFiltroPastaAcervo.appendChild(opt);
                });
                if (pastaAtual) selectFiltroPastaAcervo.value = pastaAtual;
            }

            const totalDados = (data.dados_manuais.midias?.length || 0) +
                               (data.dados_manuais.textos?.length || 0) +
                               (data.dados_manuais.indicadores?.length || 0) +
                               (data.dados_manuais.links?.length || 0);
            if (countAcervoDados) countAcervoDados.textContent = totalDados;

            renderGradeAcervoSlides();
            renderGradeAcervoDados(acervoFiltroDadoAtual);
        } catch (err) {
            console.error("Falha ao carregar acervo global:", err);
            gridAcervoSlides.innerHTML = '<p class="text-danger text-center w-100">Erro de conexão ao buscar acervo.</p>';
        }
    }

    function renderGradeAcervoSlides() {
        if (!gridAcervoSlides || !acervoCache) return;

        const termo = (inputBuscaAcervoSlides ? inputBuscaAcervoSlides.value : '').toLowerCase().trim();
        const tplFiltro = selectFiltroTemplateAcervo ? selectFiltroTemplateAcervo.value : '';
        const pastaFiltro = selectFiltroPastaAcervo ? selectFiltroPastaAcervo.value : '';

        const slidesFiltrados = (acervoCache.slides || []).filter(s => {
            const matchBusca = !termo ||
                (s.titulo && s.titulo.toLowerCase().includes(termo)) ||
                (s.subtitulo && s.subtitulo.toLowerCase().includes(termo)) ||
                (s.apresentacao_nome && s.apresentacao_nome.toLowerCase().includes(termo)) ||
                (s.pasta_nome && s.pasta_nome.toLowerCase().includes(termo));
            const matchTpl = !tplFiltro || s.template === tplFiltro;
            const matchPasta = !pastaFiltro || (s.pasta_id && String(s.pasta_id) === String(pastaFiltro));
            return matchBusca && matchTpl && matchPasta;
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
                'modulos_pilares': { label: 'Pilares', bg: '#ecfdf5', color: '#047857' },
                'imagem_texto': { label: 'Imagem + Texto', bg: '#f0fdf4', color: '#15803d' },
                'grafico': { label: 'Gráfico', bg: '#fef3c7', color: '#b45309' },
                'indicadores': { label: 'Indicadores', bg: '#f5f3ff', color: '#6d28d9' },
                'mapa': { label: 'Mapa', bg: '#e0f2fe', color: '#0369a1' }
            }[s.template] || { label: 'Slide', bg: '#f1f5f9', color: '#475569' };

            return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                    <div style="padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.74rem; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="${escapeHtml(s.apresentacao_nome)}">
                            <i class="bi bi-file-earmark-slides text-primary me-1"></i>${escapeHtml(s.apresentacao_nome)}
                        </span>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <span style="font-size: 0.66rem; font-weight: 600; padding: 2px 5px; border-radius: 4px; background: #f1f5f9; color: #475569;" title="Pasta: ${escapeHtml(s.pasta_nome || 'Geral')}">
                                <i class="bi bi-folder2 me-1"></i>${escapeHtml(s.pasta_nome || 'Geral')}
                            </span>
                            <span style="font-size: 0.68rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${tplBadge.bg}; color: ${tplBadge.color};">
                                ${tplBadge.label}
                            </span>
                        </div>
                    </div>
                    <div style="padding: 10px; display: flex; justify-content: center; align-items: center; background: #f8fafc;">
                        <div class="thumb-canvas-mini" style="height: 90px; aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); background: #fff; position: relative;">
                            ${renderMiniSlidePreview(s)}
                        </div>
                    </div>
                    <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-between;">
                        <div style="font-size: 0.8rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(s.titulo || 'Sem título')}">
                            ${escapeHtml(s.titulo || 'Slide sem título')}
                        </div>
                        <button type="button" class="btn btn-sm btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-1 btn-importar-slide-acervo" data-slide-id="${s.slide_id}" onclick="window.importarSlideDoAcervo(${s.slide_id})" style="background: #0052ff; border: none; font-size: 0.8rem; padding: 6px 10px; border-radius: 6px; font-weight: 600;">
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
            mapaTipo: sOrigem.mapaTipo || 'barueri',
            mapaPins: Array.isArray(sOrigem.mapaPins) ? JSON.parse(JSON.stringify(sOrigem.mapaPins)) : [],
            pilar_1_titulo: sOrigem.pilar_1_titulo || '',
            pilar_1_texto: sOrigem.pilar_1_texto || '',
            pilar_2_titulo: sOrigem.pilar_2_titulo || '',
            pilar_2_texto: sOrigem.pilar_2_texto || '',
            pilar_3_titulo: sOrigem.pilar_3_titulo || '',
            pilar_3_texto: sOrigem.pilar_3_texto || '',
            origens_campos: {}
        };

        slides.push(novoSlide);
        activeSlideId = novoSlide.id;
        renderThumbnails();
        renderActiveSlide();
        if (slidesThumbsList) slidesThumbsList.scrollTop = slidesThumbsList.scrollHeight;

        fecharAcervoModal();
        mostrarToastNotificacao(`Slide importado com sucesso!`);
    };

    function renderGradeAcervoDados(filtro = 'todos') {
        if (!gridAcervoDados || !acervoCache || !acervoCache.dados_manuais) return;

        const { midias = [], textos = [], indicadores = [], links = [] } = acervoCache.dados_manuais;
        let htmlCards = '';
        let totalExibidos = 0;

        // Renderização de Mídias
        let midiasFiltradas = [];
        if (filtro === 'todos' || filtro === 'bgCapa' || filtro === 'imgTexto' || filtro === 'customLogoImg') {
            midiasFiltradas = midias.filter(m => filtro === 'todos' || m.tipo === filtro);
            midiasFiltradas.forEach((m, idx) => {
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
                            <button type="button" class="btn btn-sm btn-outline-primary w-100 btn-aplicar-midia-acervo" data-idx="${idx}" style="font-size: 0.78rem; font-weight: 600; padding: 5px;">
                                <i class="bi bi-box-arrow-in-down me-1"></i> Usar Mídia
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Renderização de Textos
        let textosFiltrados = [];
        if (filtro === 'todos' || filtro === 'textos') {
            textosFiltrados = textos;
            textosFiltrados.forEach((t, idx) => {
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
                            <button type="button" class="btn btn-sm btn-outline-primary flex-fill btn-aplicar-texto-acervo" data-alvo="titulo" data-idx="${idx}" style="font-size: 0.72rem; padding: 4px;">
                                Como Título
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary flex-fill btn-aplicar-texto-acervo" data-alvo="subtitulo" data-idx="${idx}" style="font-size: 0.72rem; padding: 4px;">
                                Como Subtítulo
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Renderização de Indicadores
        let indicadoresFiltrados = [];
        if (filtro === 'todos' || filtro === 'indicadores') {
            indicadoresFiltrados = indicadores;
            indicadoresFiltrados.forEach((ind, idx) => {
                totalExibidos++;
                htmlCards += `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 0.7rem; font-weight: 700; color: ${ind.cor || '#0052ff'}; text-transform: uppercase;">Indicador</span>
                                <span style="font-size: 0.7rem; color: #94a3b8;">${escapeHtml(ind.apresentacao_nome)}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                                <i class="bi ${ind.icone || 'bi-graph-up'}" style="font-size: 1.2rem; color: ${ind.cor || '#0052ff'};"></i>
                                <div>
                                    <div style="font-size: 1rem; font-weight: 700; color: #0f172a;">${escapeHtml(ind.valor || '-')}</div>
                                    <div style="font-size: 0.75rem; color: #64748b;">${escapeHtml(ind.nome || 'Métrica')}</div>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary w-100 btn-aplicar-indicador-acervo" data-idx="${idx}" style="font-size: 0.74rem; font-weight: 600; padding: 4px;">
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

        // Binds de botões de aplicação avulsa
        gridAcervoDados.querySelectorAll('.btn-aplicar-midia-acervo').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const item = midiasFiltradas[idx];
                if (item) window.aplicarMidiaDoAcervo(item);
            });
        });

        gridAcervoDados.querySelectorAll('.btn-aplicar-texto-acervo').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const alvo = btn.dataset.alvo;
                const item = textosFiltrados[idx];
                if (item) window.aplicarTextoDoAcervo(item, alvo);
            });
        });

        gridAcervoDados.querySelectorAll('.btn-aplicar-indicador-acervo').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const item = indicadoresFiltrados[idx];
                if (item) window.aplicarIndicadorDoAcervo(item);
            });
        });
    }

    window.aplicarMidiaDoAcervo = function(item) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;
        const target = acervoTargetField || item.tipo;
        if (target === 'bgCapa' || target === 'bgGeral') {
            slide.bgCapa = item.valor;
            slide.bgGeral = item.valor;
        } else if (target === 'imgTexto') {
            slide.imgTexto = item.valor;
        } else if (target === 'customLogoImg') {
            slide.customLogoImg = item.valor;
            slide.logos = ['custom'];
        }
        slide.origens_campos = slide.origens_campos || {};
        slide.origens_campos[target] = item.campo_id;
        updatePreviewMedia();
        updateActiveThumbnail();
        fecharAcervoModal();
        mostrarToastNotificacao(`Mídia aplicada com sucesso ao slide!`);
    };

    window.aplicarTextoDoAcervo = function(item, alvo) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;
        if (alvo === 'titulo') {
            slide.titulo = item.valor;
            if (inputTitulo) inputTitulo.value = item.valor;
        } else {
            slide.subtitulo = item.valor;
            if (inputSubtitulo) inputSubtitulo.value = item.valor;
        }
        slide.origens_campos = slide.origens_campos || {};
        slide.origens_campos[alvo] = item.campo_id;
        updatePreviewTexts();
        updateActiveThumbnail();
        fecharAcervoModal();
        mostrarToastNotificacao(`Texto aplicado como ${alvo} com sucesso!`);
    };

    window.aplicarIndicadorDoAcervo = function(item) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide) return;
        if (slide.template !== 'indicadores') {
            slide.template = 'indicadores';
            if (selectTemplate) selectTemplate.value = 'indicadores';
            switchTemplate();
        }
        slide.indicadores = slide.indicadores || [];
        slide.indicadores.push({
            id: Date.now(),
            nome: item.nome,
            valor: item.valor,
            icone: item.icone || 'bi-graph-up',
            cor: item.cor || '#0284c7'
        });
        renderIndicadores(slide);
        updateActiveThumbnail();
        fecharAcervoModal();
        mostrarToastNotificacao(`Indicador "${item.nome}" inserido no slide!`);
    };

    if (btnAcervoPasta) {
        btnAcervoPasta.addEventListener("click", () => {
            carregarAcervoPasta('kits');
        });
    }

    if (inputBuscaKitsCit) inputBuscaKitsCit.addEventListener("input", renderGradeKitsCit);
    if (selectFiltroSecretariaCit) selectFiltroSecretariaCit.addEventListener("change", renderGradeKitsCit);
    if (inputBuscaAcervoSlides) inputBuscaAcervoSlides.addEventListener("input", renderGradeAcervoSlides);
    if (selectFiltroPastaAcervo) selectFiltroPastaAcervo.addEventListener("change", renderGradeAcervoSlides);
    if (selectFiltroTemplateAcervo) selectFiltroTemplateAcervo.addEventListener("change", renderGradeAcervoSlides);

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


    // =========================================================================
    // MAPA TEMPLATE - IMPLEMENTAÇÃO COMPLETA COM BANCO DE DADOS & TRAVAMENTO
    // =========================================================================
    let activeTipoPopup = "texto";

    function populateSelectPinLocal(regiao) {
        if (!selectPinLocal) return;
        const catalog = MAPA_LOCAIS_CATALOGO[regiao] || MAPA_LOCAIS_CATALOGO.barueri;
        selectPinLocal.innerHTML = catalog.map(item => `<option value="${item.id}">${escapeHtml(item.nome)}</option>`).join("");
    }

    function syncMapaSidebar(slide) {
        if (!slide) return;
        const regiao = slide.mapaTipo || "barueri";

        mapaTipoRadios.forEach(r => {
            r.checked = (r.value === regiao);
        });

        populateSelectPinLocal(regiao);

        const pins = slide.mapaPins || [];
        if (mapaPinsBadge) {
            mapaPinsBadge.textContent = `${pins.length} / 5`;
            mapaPinsBadge.style.background = pins.length >= 5 ? "#fee2e2" : "#eff6ff";
            mapaPinsBadge.style.color = pins.length >= 5 ? "#ef4444" : "#0052ff";
            mapaPinsBadge.style.borderColor = pins.length >= 5 ? "#fca5a5" : "#bfdbfe";
        }

        if (btnAddPin) {
            btnAddPin.disabled = (pins.length >= 5);
            btnAddPin.style.opacity = pins.length >= 5 ? "0.5" : "1";
            btnAddPin.style.cursor = pins.length >= 5 ? "not-allowed" : "pointer";
            btnAddPin.title = pins.length >= 5 ? "Máximo de 5 pins atingido." : "Adicionar pin";
        }

        renderListaPinsAdicionados(slide);
    }

    function renderListaPinsAdicionados(slide) {
        if (!listaPinsAdicionados) return;
        const pins = slide.mapaPins || [];

        if (pins.length === 0) {
            listaPinsAdicionados.innerHTML = `
                <div style="text-align:center; padding:16px 8px; color:#94a3b8; font-size:0.78rem; background:#f8fafc; border-radius:6px; border:1px dashed #cbd5e1;">
                    <i class="bi bi-geo-alt" style="font-size:1.2rem; display:block; margin-bottom:4px; color:#cbd5e1;"></i>
                    Nenhum pin adicionado ao mapa ainda.<br>Selecione um local acima e adicione até 5 pins.
                </div>
            `;
            return;
        }

        listaPinsAdicionados.innerHTML = pins.map((pin, idx) => {
            let badgeTipo = '';
            if (pin.tipoPopup === 'grafico') {
                badgeTipo = '<span style="font-size:0.7rem; background:#eff6ff; color:#2563eb; padding:2px 6px; border-radius:4px; font-weight:600;"><i class="bi bi-bar-chart"></i> Gráfico</span>';
            } else if (pin.tipoPopup === 'imagem') {
                badgeTipo = '<span style="font-size:0.7rem; background:#ecfdf5; color:#059669; padding:2px 6px; border-radius:4px; font-weight:600;"><i class="bi bi-image"></i> Imagem</span>';
            } else {
                badgeTipo = '<span style="font-size:0.7rem; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; font-weight:600;"><i class="bi bi-fonts"></i> Texto</span>';
            }

            return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:#fff; border:1px solid #e2e8f0; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                    <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                        <span style="width:20px; height:20px; border-radius:50%; background:#fee2e2; color:#ef4444; font-size:0.72rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${idx + 1}</span>
                        <div style="display:flex; flex-direction:column; min-width:0;">
                            <span style="font-size:0.8rem; font-weight:700; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(pin.localNome)}</span>
                            <div style="margin-top:2px;">${badgeTipo}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <button type="button" class="btn-pan-pin" data-pin-id="${pin.id}" style="background:none; border:none; color:#0052ff; cursor:pointer; font-size:0.85rem; padding:4px;" title="Centralizar e abrir popup"><i class="bi bi-crosshair"></i></button>
                        <button type="button" class="btn-remover-pin" data-pin-id="${pin.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem; padding:4px;" title="Remover este pin"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            `;
        }).join("");

        listaPinsAdicionados.querySelectorAll(".btn-remover-pin").forEach(btn => {
            btn.addEventListener("click", () => {
                const pinId = btn.getAttribute("data-pin-id");
                removerPinDoMapa(pinId);
            });
        });

        listaPinsAdicionados.querySelectorAll(".btn-pan-pin").forEach(btn => {
            btn.addEventListener("click", () => {
                const pinId = btn.getAttribute("data-pin-id");
                focarPinNoMapa(pinId);
            });
        });
    }

    function removerPinDoMapa(pinId) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide || !slide.mapaPins) return;
        slide.mapaPins = slide.mapaPins.filter(p => String(p.id) !== String(pinId));
        syncMapaSidebar(slide);
        renderSlideMap(slide);
        renderThumbnails();
        updateActiveThumbnail();
    }

    function focarPinNoMapa(pinId) {
        const slide = slides.find(s => s.id === activeSlideId);
        if (!slide || !slide.mapaPins || !slideMapInstance) return;
        const pin = slide.mapaPins.find(p => String(p.id) === String(pinId));
        if (!pin) return;

        slideMapInstance.panTo([pin.lat, pin.lng], { animate: true, duration: 0.5 });
        const markerObj = slideMapMarkers.find(m => String(m._pinId) === String(pinId));
        if (markerObj) {
            setTimeout(() => {
                markerObj.openPopup();
            }, 400);
        }
    }

    function renderSlideMap(slide) {
        const container = document.getElementById("slideMapContainer");
        if (!container) return;

        if (typeof L === "undefined") {
            console.warn("Leaflet não carregado ainda.");
            return;
        }

        if (slideMapInstance) {
            try {
                slideMapInstance.remove();
            } catch (e) {
                console.warn("Erro ao remover mapa anterior:", e);
            }
            slideMapInstance = null;
            slideMapMarkers = [];
        }

        const isBrasil = (slide.mapaTipo === "brasil");

        const tagHeader = document.getElementById("mapaRegiaoTag");
        if (tagHeader) {
            tagHeader.textContent = isBrasil ? "República Federativa do Brasil" : "Município de Barueri";
        }
        const badgeInferior = document.getElementById("mapaRegiaoBadgeInferior");
        if (badgeInferior) {
            badgeInferior.textContent = isBrasil ? "Brasil • Nacional" : "Barueri • SP";
        }

        // Bounding box e limites rígidos de travamento
        const barueriBounds = [[-23.565, -46.985], [-23.455, -46.775]];
        const barueriCenter = [-23.5080, -46.8760];

        const brasilBounds = [[-34.5, -74.5], [5.5, -34.0]];
        const brasilCenter = [-14.235, -51.925];

        const currentBounds = isBrasil ? brasilBounds : barueriBounds;
        const centerCoord = isBrasil ? brasilCenter : barueriCenter;
        const zoomLevel = isBrasil ? 4 : 13;
        const minZ = isBrasil ? 4 : 12;
        const maxZ = isBrasil ? 8 : 16;

        slideMapInstance = L.map('slideMapContainer', {
            center: centerCoord,
            zoom: zoomLevel,
            minZoom: minZ,
            maxZoom: maxZ,
            maxBounds: currentBounds,
            maxBoundsViscosity: 1.0,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(slideMapInstance);

        L.control.zoom({ position: 'bottomright' }).addTo(slideMapInstance);

        // GeoJSON com borda azul e máscara
        const geojsonUrl = isBrasil ? '/static/data/brasil.geojson' : '/static/data/barueri.geojson';

        fetch(geojsonUrl)
            .then(res => res.json())
            .then(geoData => {
                if (!slideMapInstance) return;

                const mundo = [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]];
                let polyHoles = [];
                if (geoData.features && geoData.features.length > 0) {
                    geoData.features.forEach(feat => {
                        const geom = feat.geometry;
                        if (geom.type === 'Polygon') {
                            polyHoles.push(geom.coordinates[0].map(pt => [pt[1], pt[0]]));
                        } else if (geom.type === 'MultiPolygon') {
                            geom.coordinates.forEach(poly => {
                                polyHoles.push(poly[0].map(pt => [pt[1], pt[0]]));
                            });
                        }
                    });
                }

                if (polyHoles.length > 0) {
                    polyHoles.forEach(hole => {
                        L.polygon([mundo, hole], {
                            color: 'none',
                            fillColor: '#ffffff',
                            fillOpacity: 0.82,
                            interactive: false
                        }).addTo(slideMapInstance);
                    });
                }

                L.geoJSON(geoData, {
                    style: {
                        color: '#0052ff',
                        weight: 3,
                        opacity: 1,
                        fillColor: '#38bdf8',
                        fillOpacity: 0.16
                    },
                    interactive: false
                }).addTo(slideMapInstance);
            })
            .catch(err => console.warn('Erro ao carregar GeoJSON de limites:', err));

        const pins = slide.mapaPins || [];
        slideMapMarkers = [];

        const pinColors = {
            grafico: { bg: '#0052ff', icon: 'bi-bar-chart-fill' },
            imagem: { bg: '#059669', icon: 'bi-image-fill' },
            texto: { bg: '#7c3aed', icon: 'bi-geo-alt-fill' }
        };

        pins.forEach((pin, idx) => {
            const col = pinColors[pin.tipoPopup] || pinColors.texto;

            const pinIcon = L.divIcon({
                className: 'map-pin-div-wrapper',
                html: `
                    <div class="map-pin-badge" style="border-color: ${col.bg};" title="${escapeHtml(pin.localNome)}">
                        <div class="map-pin-icon-circle" style="background: ${col.bg};">
                            <i class="bi ${col.icon}"></i>
                        </div>
                        <span class="map-pin-text">${escapeHtml(pin.localNome)}</span>
                    </div>
                `,
                iconSize: [120, 32],
                iconAnchor: [20, 16],
                popupAnchor: [0, -18]
            });

            const marker = L.marker([pin.lat, pin.lng], { icon: pinIcon }).addTo(slideMapInstance);
            marker._pinId = pin.id;

            let popupContent = '';
            if (pin.tipoPopup === 'grafico') {
                const chartCanvasId = 'popupChart_' + pin.id + '_' + Date.now();
                popupContent = `
                    <div class="popup-box-inner">
                        <div class="popup-box-header">
                            <i class="bi bi-bar-chart-fill text-primary" style="font-size:1.05rem;"></i>
                            <h5>${escapeHtml(pin.popupTitulo || pin.localNome)}</h5>
                        </div>
                        <div class="popup-box-body">
                            <div class="popup-chart-container">
                                <canvas id="${chartCanvasId}"></canvas>
                            </div>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent);

                marker.on('popupopen', () => {
                    setTimeout(() => {
                        const canvas = document.getElementById(chartCanvasId);
                        if (!canvas) return;

                        const indKey = pin.chartIndicador || 1;
                        const indId = parseInt(indKey) || 1;
                        const indData = (INDICADORES_PREDEFINIDOS && INDICADORES_PREDEFINIDOS.find(i => i.id === indId || i.id_padrao === indId || String(i.id) === String(indKey))) ||
                                        (POPUP_CHART_INDICADORES && POPUP_CHART_INDICADORES[indKey]) ||
                                        (INDICADORES_PREDEFINIDOS && INDICADORES_PREDEFINIDOS[0]);

                        const ctype = pin.chartType || 'bar';

                        let pLabels = [];
                        let pData = [];
                        let pColor = '#0052ff';
                        let pNome = 'Métrica';

                        if (indData && Array.isArray(indData.historico) && indData.historico.length > 0) {
                            pLabels = indData.historico.map(h => String(h.periodo || ''));
                            pData = indData.historico.map(h => typeof h.valor === 'number' ? h.valor : parseFloat(h.valor) || 0);
                            pColor = indData.cor || '#0052ff';
                            pNome = indData.nome_metrica || indData.nome || 'Métrica';
                        } else if (indData && Array.isArray(indData.data)) {
                            pLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
                            pData = indData.data;
                            pColor = indData.color || '#0052ff';
                            pNome = indData.label || 'Métrica';
                        } else {
                            pLabels = ['2020', '2021', '2022', '2023', '2024'];
                            pData = [100, 120, 150, 180, 200];
                        }

                        new Chart(canvas.getContext('2d'), {
                            type: ctype,
                            data: {
                                labels: pLabels,
                                datasets: [{
                                    label: pNome,
                                    data: pData,
                                    backgroundColor: ctype === 'pie' ? ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'] : pColor + 'cc',
                                    borderColor: pColor,
                                    borderWidth: 1.5,
                                    borderRadius: ctype === 'bar' ? 4 : 0,
                                    fill: (ctype === 'line')
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: (ctype === 'pie'), position: 'bottom', labels: { boxWidth: 8, font: { size: 9 } } }
                                },
                                scales: ctype === 'pie' ? {} : {
                                    x: { grid: { display: false }, ticks: { font: { size: 8 } } },
                                    y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 8 } } }
                                }
                            }
                        });
                    }, 80);
                });

            } else if (pin.tipoPopup === 'imagem') {
                const imgUrl = pin.popupImagem || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';
                popupContent = `
                    <div class="popup-box-inner" style="padding: 10px;">
                        <div class="popup-box-header" style="margin-bottom: 6px;">
                            <i class="bi bi-image text-success" style="font-size:1.05rem;"></i>
                            <h5>${escapeHtml(pin.popupTitulo || pin.localNome)}</h5>
                        </div>
                        <div class="popup-box-body">
                            <img src="${escapeHtml(imgUrl)}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 8px; display: block; border: 1px solid #e2e8f0;">
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent);

            } else {
                popupContent = `
                    <div class="popup-box-inner">
                        <div class="popup-box-header">
                            <i class="bi bi-geo-alt-fill text-danger" style="font-size:1.05rem;"></i>
                            <h5>${escapeHtml(pin.popupTitulo || pin.localNome)}</h5>
                        </div>
                        <div class="popup-box-body">
                            <p>${escapeHtml(pin.popupTexto || 'Nenhuma descrição detalhada informada para esta região.')}</p>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent);
            }

            slideMapMarkers.push(marker);
        });

        // Legenda flutuante de pontos de interesse
        const cardPontos = document.getElementById("mapaPontosInteresseCard");
        const listaPontos = document.getElementById("mapaPontosInteresseLista");
        if (cardPontos && listaPontos) {
            if (pins.length > 0) {
                cardPontos.style.display = "block";
                listaPontos.innerHTML = pins.map(p => {
                    const col = pinColors[p.tipoPopup] || pinColors.texto;
                    return `
                        <div class="ponto-legenda-item" data-pin-id="${p.id}" style="display:flex; align-items:center; gap:0.6cqw; cursor:pointer; padding:0.25cqw 0.4cqw; border-radius:0.4cqw; transition:background 0.15s ease;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Centralizar no mapa">
                            <div style="width:1.6cqw; height:1.6cqw; min-width:1.6cqw; border-radius:50%; background:${col.bg}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85cqw;">
                                <i class="bi ${col.icon}"></i>
                            </div>
                            <span style="font-size:1.05cqw; font-weight:700; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(p.localNome)}</span>
                        </div>
                    `;
                }).join("");

                listaPontos.querySelectorAll(".ponto-legenda-item").forEach(item => {
                    item.addEventListener("click", () => {
                        const pid = item.getAttribute("data-pin-id");
                        focarPinNoMapa(pid);
                    });
                });
            } else {
                cardPontos.style.display = "none";
                listaPontos.innerHTML = "";
            }
        }

        setTimeout(() => {
            if (slideMapInstance) {
                slideMapInstance.invalidateSize();
            }
        }, 180);
    }

    // Ouvintes de eventos do Mapa
    mapaTipoRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (!slide) return;
            slide.mapaTipo = e.target.value;
            syncMapaSidebar(slide);
            renderSlideMap(slide);
            renderThumbnails();
            updateActiveThumbnail();
        });
    });

    btnTipoPopups.forEach(btn => {
        btn.addEventListener("click", () => {
            btnTipoPopups.forEach(b => {
                b.classList.remove("active");
                b.style.background = "#f8fafc";
                b.style.color = "#475569";
                b.style.borderColor = "#cbd5e1";
            });
            btn.classList.add("active");
            btn.style.background = "#0052ff";
            btn.style.color = "#ffffff";
            btn.style.borderColor = "#0052ff";

            activeTipoPopup = btn.getAttribute("data-popup") || "texto";

            if (pinFieldsTexto) pinFieldsTexto.style.display = (activeTipoPopup === "texto") ? "block" : "none";
            if (pinFieldsGrafico) pinFieldsGrafico.style.display = (activeTipoPopup === "grafico") ? "block" : "none";
            if (pinFieldsImagem) pinFieldsImagem.style.display = (activeTipoPopup === "imagem") ? "block" : "none";
        });
    });

    if (btnUploadPinImg && inputUploadPinImgFile) {
        btnUploadPinImg.addEventListener("click", () => inputUploadPinImgFile.click());
        inputUploadPinImgFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (re) => {
                if (inputPinImgUrl) inputPinImgUrl.value = re.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (btnAddPin) {
        btnAddPin.addEventListener("click", () => {
            const slide = slides.find(s => s.id === activeSlideId);
            if (!slide) return;
            if (!slide.mapaPins) slide.mapaPins = [];

            if (slide.mapaPins.length >= 5) {
                alert("Você só pode adicionar no máximo 5 pins no mapa.");
                return;
            }

            const regiao = slide.mapaTipo || "barueri";
            const catalog = MAPA_LOCAIS_CATALOGO[regiao] || MAPA_LOCAIS_CATALOGO.barueri;
            const localId = selectPinLocal ? selectPinLocal.value : "";
            const localObj = catalog.find(item => item.id === localId) || catalog[0];

            if (!localObj) {
                alert("Selecione um local válido.");
                return;
            }

            const novoPin = {
                id: 'pin_' + Date.now(),
                localKey: localObj.id,
                localNome: localObj.nome,
                lat: localObj.lat,
                lng: localObj.lng,
                tipoPopup: activeTipoPopup
            };

            if (activeTipoPopup === "grafico") {
                novoPin.popupTitulo = inputPinGraficoTitulo ? inputPinGraficoTitulo.value.trim() : "";
                if (!novoPin.popupTitulo) novoPin.popupTitulo = localObj.nome;
                novoPin.chartType = selectPinGraficoTipo ? selectPinGraficoTipo.value : "bar";
                novoPin.chartIndicador = selectPinGraficoIndicador ? selectPinGraficoIndicador.value : "1";
            } else if (activeTipoPopup === "imagem") {
                novoPin.popupTitulo = inputPinImgTitulo ? inputPinImgTitulo.value.trim() : "";
                if (!novoPin.popupTitulo) novoPin.popupTitulo = localObj.nome;
                novoPin.popupImagem = inputPinImgUrl ? inputPinImgUrl.value.trim() : "";
                if (!novoPin.popupImagem) novoPin.popupImagem = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
            } else {
                novoPin.popupTitulo = inputPinTextoTitulo ? inputPinTextoTitulo.value.trim() : "";
                if (!novoPin.popupTitulo) novoPin.popupTitulo = localObj.nome;
                novoPin.popupTexto = inputPinTextoDescricao ? inputPinTextoDescricao.value.trim() : "";
                if (!novoPin.popupTexto) novoPin.popupTexto = `Indicadores e métricas institucionais registrados para a região de ${localObj.nome}.`;
            }

            slide.mapaPins.push(novoPin);

            if (inputPinTextoTitulo) inputPinTextoTitulo.value = "";
            if (inputPinTextoDescricao) inputPinTextoDescricao.value = "";
            if (inputPinGraficoTitulo) inputPinGraficoTitulo.value = "";
            if (inputPinImgTitulo) inputPinImgTitulo.value = "";
            if (inputPinImgUrl) inputPinImgUrl.value = "";

            syncMapaSidebar(slide);
            renderSlideMap(slide);
            renderThumbnails();
            updateActiveThumbnail();

            setTimeout(() => {
                focarPinNoMapa(novoPin.id);
            }, 300);
        });
    }

    window.removerPinDoMapa = removerPinDoMapa;
    window.focarPinNoMapa = focarPinNoMapa;

    // --- INICIALIZAÇÃO DE DADOS DINÂMICOS DO BANCO ---
    popularSelectsIndicadores();
    carregarIndicadoresDoBanco();
    carregarOdsDoBanco();

    renderThumbnails();
    renderActiveSlide();
});
