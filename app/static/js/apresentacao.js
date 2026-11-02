// ============================================================
// DADOS MOCKADOS
// Cada pin representa um bairro com seus indicadores
// ============================================================
const pins = [
    {
        bairro: 'Parque dos Camargos',
        modulo: 'Saúde',
        icone: 'bi-heart-pulse-fill',
        lat: -23.5234,
        lng: -46.8789,
        total: '8.735',
        variacao: '▲ 12,5% vs. período anterior',
        data: 'Dados atualizados em 24/05/2025 10:45',
        historico: [7500, 7200, 7800, 8100, 7900, 8300, 8500, 8200, 8600, 9000, 9200, 8735],
        cards: [
            { label: 'Consultas',     valor: '6.421', var: '▲ 10,2%' },
            { label: 'Exames',        valor: '1.842', var: '▲ 14,8%' },
            { label: 'Procedimentos', valor: '472',   var: '▲ 8,7%'  }
        ]
    },
    {
        bairro: 'Alphaville',
        modulo: 'Segurança',
        icone: 'bi-shield-fill-check',
        lat: -23.4927,
        lng: -46.8508,
        total: '1.243',
        variacao: '▼ 3,2% vs. período anterior',
        data: 'Dados atualizados em 24/05/2025 10:45',
        historico: [1400, 1350, 1300, 1280, 1250, 1310, 1290, 1260, 1230, 1200, 1220, 1243],
        cards: [
            { label: 'Ocorrências', valor: '842', var: '▼ 5,1%' },
            { label: 'Resolvidas',  valor: '401', var: '▲ 2,3%' },
            { label: 'Em aberto',   valor: '89',  var: '▼ 1,4%' }
        ]
    },
    {
        bairro: 'Engenho Novo',
        modulo: 'Educação',
        icone: 'bi-mortarboard-fill',
        lat: -23.5123,
        lng: -46.8934,
        total: '3.890',
        variacao: '▲ 5,7% vs. período anterior',
        data: 'Dados atualizados em 24/05/2025 10:45',
        historico: [3200, 3300, 3400, 3500, 3600, 3700, 3750, 3800, 3820, 3850, 3870, 3890],
        cards: [
            { label: 'Matrículas', valor: '2.100', var: '▲ 4,2%' },
            { label: 'Aprovados',  valor: '1.543', var: '▲ 7,1%' },
            { label: 'Evasão',     valor: '247',   var: '▼ 2,3%' }
        ]
    },
    {
        bairro: 'Centro',
        modulo: 'Mobilidade',
        icone: 'bi-car-front-fill',
        lat: -23.5044,
        lng: -46.8756,
        total: '12.430',
        variacao: '▲ 8,1% vs. período anterior',
        data: 'Dados atualizados em 24/05/2025 10:45',
        historico: [10000, 10500, 11000, 11200, 11500, 11800, 12000, 12100, 12200, 12300, 12400, 12430],
        cards: [
            { label: 'Fluxo/dia',    valor: '4.143', var: '▲ 9,2%' },
            { label: 'Acidentes',    valor: '89',    var: '▼ 3,1%' },
            { label: 'Obras ativas', valor: '12',    var: '▲ 1,0%' }
        ]
    },
    {
        bairro: 'Aldeia da Serra',
        modulo: 'Meio Ambiente',
        icone: 'bi-tree-fill',
        lat: -23.5389,
        lng: -46.8923,
        total: '94,3%',
        variacao: '▲ 2,1% vs. período anterior',
        data: 'Dados atualizados em 24/05/2025 10:45',
        historico: [88, 89, 90, 91, 91, 92, 92, 93, 93, 94, 94, 94.3],
        cards: [
            { label: 'Áreas verdes',     valor: '12 km²', var: '▲ 1,2%' },
            { label: 'Coleta seletiva',  valor: '87%',    var: '▲ 3,4%' },
            { label: 'Denúncias',        valor: '23',     var: '▼ 8,1%' }
        ]
    },
    {
        bairro: 'Jardim Mutinga',
        modulo: 'Assistência Social',
        icone: 'bi-people-fill',
        lat: -23.5156,
        lng: -46.8612,
        total: '2.341',
        variacao: '▲ 6,4% vs. período anterior',
        data: 'Dados atualizados em 24/05/2025 10:45',
        historico: [1800, 1900, 2000, 2050, 2100, 2150, 2200, 2250, 2280, 2300, 2320, 2341],
        cards: [
            { label: 'Famílias',   valor: '1.203', var: '▲ 5,2%' },
            { label: 'Benefícios', valor: '891',   var: '▲ 7,3%' },
            { label: 'Atend./mês', valor: '247',   var: '▲ 4,1%' }
        ]
    }
]

// Eixo X compartilhado por todos os gráficos de linha e barra
const meses = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai']

// ============================================================
// MAPA (LEAFLET - CONFIGURAÇÃO COM TRAVAMENTO E LIMITES DESTACADOS)
// ============================================================
let map = null;
let graficoAtual = null;

const mapContainer = document.getElementById('map');
if (mapContainer && typeof L !== 'undefined') {
    // Barueri BBox e centro calibrado
    const barueriBounds = [[-23.565, -46.985], [-23.455, -46.775]];
    const barueriCenter = [-23.5080, -46.8760];

    // Mapa travado estritamente no território de Barueri (não permite sair dele)
    map = L.map('map', {
        center: barueriCenter,
        zoom: 13,
        minZoom: 12,
        maxZoom: 16,
        zoomControl: false,
        maxBounds: barueriBounds,
        maxBoundsViscosity: 1.0,
        attributionControl: false
    });

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: '',
        shadowUrl: ''
    });

    // Camada base OpenStreetMap (100% gratuita, sem marca d'água de API KEY)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Botões de zoom no canto inferior esquerdo
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // ============================================================
    // GEOJSON: Limites marcados de azul + máscara externa translúcida
    // ============================================================
    fetch('/static/data/barueri.geojson')
        .then(response => response.json())
        .then(geoData => {
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

            // 1º Máscara branca no exterior para isolar o território com destaque (como no mockup)
            if (polyHoles.length > 0) {
                polyHoles.forEach(hole => {
                    L.polygon([mundo, hole], {
                        color: 'none',
                        fillColor: '#ffffff',
                        fillOpacity: 0.82,
                        interactive: false
                    }).addTo(map);
                });
            }

            // 2º Limites marcados de azul vibrante e preenchimento suave
            L.geoJSON(geoData, {
                style: {
                    color: '#0052ff', // Linha azul nítida
                    weight: 3,
                    opacity: 1,
                    fillColor: '#38bdf8', // Azul claro destacado
                    fillOpacity: 0.16
                },
                interactive: false
            }).addTo(map);
        })
        .catch(err => console.error("Erro ao carregar o GeoJSON do mapa:", err));

    // ============================================================
    // PINS NO MAPA COM BADGES ESTILO GOOGLE MAPS / MOCKUP
    // ============================================================
    pins.forEach(pin => {
        const iconeHTML = L.divIcon({
            className: 'map-pin-div-wrapper',
            html: `
                <div class="map-pin-badge" style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.96); border:2px solid #0052ff; border-radius:9999px; padding:3px 10px 3px 4px; box-shadow:0 4px 14px rgba(0,0,0,0.22); cursor:pointer; white-space:nowrap; transition:transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
                    <div style="width:22px; height:22px; border-radius:50%; background:#0052ff; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px;">
                        <i class="bi ${pin.icone}"></i>
                    </div>
                    <span style="font-size:12px; font-weight:700; color:#0f172a;">${pin.bairro}</span>
                </div>
            `,
            iconSize: [130, 32],
            iconAnchor: [65, 16]
        });

        const marker = L.marker([pin.lat, pin.lng], { icon: iconeHTML }).addTo(map);

        marker.on('click', (e) => {
            if (e && e.originalEvent) L.DomEvent.stopPropagation(e);
            abrirPopup(pin);
        });
    });

    // Fechar ao clicar no mapa fora do popup
    map.on('click', fecharPopup);
}

// ============================================================
// FUNÇÕES DE POPUP
// ============================================================
function abrirPopup(pin) {
    const popup = document.getElementById('popup');
    if (!popup) return;

    const elModulo = document.getElementById('popup-modulo');
    const elBairro = document.getElementById('popup-bairro');
    const elData = document.getElementById('popup-data');
    const elTotal = document.getElementById('popup-total');
    const elVariacao = document.getElementById('popup-variacao');
    const elIcone = document.getElementById('popup-icone');

    if (elModulo) elModulo.textContent = pin.modulo;
    if (elBairro) elBairro.textContent = pin.bairro;
    if (elData) elData.textContent = pin.data;
    if (elTotal) elTotal.textContent = pin.total;
    if (elVariacao) elVariacao.textContent = pin.variacao;
    if (elIcone) elIcone.innerHTML = `<i class="bi ${pin.icone}"></i>`;

    if (pin.cards) {
        pin.cards.forEach((card, i) => {
            const n = i + 1;
            const l = document.getElementById(`card${n}-label`);
            const v = document.getElementById(`card${n}-valor`);
            const r = document.getElementById(`card${n}-var`);
            if (l) l.textContent = card.label;
            if (v) v.textContent = card.valor;
            if (r) r.textContent = card.var;
        });
    }

    const tipoSelect = document.getElementById('tipo-grafico');
    if (tipoSelect) tipoSelect.value = 'line';

    popup.classList.remove('d-none');
    renderizarGrafico(pin, 'line');
}

function fecharPopup() {
    const popup = document.getElementById('popup');
    if (popup) popup.classList.add('d-none');
    if (graficoAtual) {
        graficoAtual.destroy();
        graficoAtual = null;
    }
}

function renderizarGrafico(pin, tipo) {
    if (graficoAtual) {
        graficoAtual.destroy();
        graficoAtual = null;
    }

    const canvas = document.getElementById('grafico-popup');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = tipo === 'pie' ? (pin.cards ? pin.cards.map(c => c.label) : []) : meses;
    const dados = tipo === 'pie'
        ? (pin.cards ? pin.cards.map(c => parseFloat(c.valor.replace('.', '').replace(',', '.'))) : [])
        : pin.historico;

    const config = {
        type: tipo,
        data: {
            labels,
            datasets: [{
                label: pin.modulo,
                data: dados,
                borderColor: '#0052ff',
                backgroundColor: tipo === 'line'
                    ? 'rgba(0, 82, 255, 0.08)'
                    : tipo === 'bar'
                    ? 'rgba(0, 82, 255, 0.7)'
                    : ['#0052ff', '#3b82f6', '#93c5fd'],
                fill: tipo === 'line',
                tension: 0.4,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: tipo === 'pie' ? {} : {
                x: { grid: { display: false } },
                y: { grid: { color: '#f1f5f9' } }
            }
        }
    };

    graficoAtual = new Chart(ctx, config);
}

// Event Listeners seguros
const btnPopupFechar = document.getElementById('popup-fechar');
if (btnPopupFechar) {
    btnPopupFechar.addEventListener('click', fecharPopup);
}

const selectTipoGrafico = document.getElementById('tipo-grafico');
if (selectTipoGrafico) {
    selectTipoGrafico.addEventListener('change', (e) => {
        const elBairro = document.getElementById('popup-bairro');
        const bairroAtual = elBairro ? elBairro.textContent : '';
        const pinAtual = pins.find(p => p.bairro === bairroAtual);
        if (pinAtual) renderizarGrafico(pinAtual, e.target.value);
    });
}

// ==========================================
// FUNÇÕES DE FILTRO E VISUALIZAÇÃO DE APRESENTAÇÕES
// ==========================================
function filterCards() {
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
}

function setView(viewType) {
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
}

window.filterCards = filterCards;
window.setView = setView;
