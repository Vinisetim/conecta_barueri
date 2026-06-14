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
// MAPA
const map = L.map('map', {
    center: [-23.5044, -46.8756],
    zoom: 14,       // ← era 13
    minZoom: 13,    // ← era 12
    maxZoom: 16,
    zoomControl: false,
    maxBounds: [
        [-23.65, -47.05],
        [-23.38, -46.70]
    ],
    maxBoundsViscosity: 1.0
})

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: '',
    shadowUrl: ''
})
// Tile minimalista — sem poluição visual nas ruas
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO'
}).addTo(map)

// Botões de zoom no canto inferior esquerdo
L.control.zoom({ position: 'bottomleft' }).addTo(map)

// ============================================================
// GEOJSON — máscara escura fora de Barueri + contorno azul
// Só o desenho do município fica dentro do fetch
// ============================================================
fetch('/static/data/barueri.geojson')
    .then(response => response.json())
    .then(data => {
        const mundo = [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]]
        const barueri = data.features[0].geometry.coordinates[0]

        // 1º — máscara escura do entorno
        L.polygon([mundo, barueri], {
            color: 'none',
            fillColor: '#0f172a',
            fillOpacity: 0.55
        }).addTo(map)

        // 2º — preenchimento azul claro de Barueri POR CIMA da máscara
        L.geoJSON(data, {
            style: {
                color: '#0052ff',
                weight: 2.5,
                fillColor: '#4d82ff',  // azul mais visível
                fillOpacity: 0.25      // mais opaco que antes
            }
        }).addTo(map)
    })

// ============================================================
// PINS — criados fora do fetch, não dependem do GeoJSON
// ============================================================
let graficoAtual = null

pins.forEach(pin => {
    // divIcon permite usar HTML/CSS como ícone do marker
    const iconeHTML = L.divIcon({
        className: '', // remove estilos padrão do Leaflet
        html: `<div class="pin-wrapper"><i class="bi ${pin.icone}"></i></div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24] // ancora o centro do ícone na coordenada
    })

    const marker = L.marker([pin.lat, pin.lng], { icon: iconeHTML }).addTo(map)

    // Ao clicar no pin, abre o popup com os dados desse pin
    marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e) // impede o click de fechar o popup imediatamente
        abrirPopup(pin)
    })
})

// ============================================================
// FUNÇÕES DE POPUP
// ============================================================
function abrirPopup(pin) {
    const popup = document.getElementById('popup')

    // Preenche os campos do HTML com os dados do pin clicado
    document.getElementById('popup-modulo').textContent = pin.modulo
    document.getElementById('popup-bairro').textContent = pin.bairro
    document.getElementById('popup-data').textContent = pin.data
    document.getElementById('popup-total').textContent = pin.total
    document.getElementById('popup-variacao').textContent = pin.variacao
    document.getElementById('popup-icone').innerHTML = `<i class="bi ${pin.icone}"></i>`

    // Preenche os três cards de métricas dinamicamente
    pin.cards.forEach((card, i) => {
        const n = i + 1
        document.getElementById(`card${n}-label`).textContent = card.label
        document.getElementById(`card${n}-valor`).textContent = card.valor
        document.getElementById(`card${n}-var`).textContent = card.var
    })

    // Reseta o select para "linha" sempre que abre um novo pin
    document.getElementById('tipo-grafico').value = 'line'

    popup.classList.remove('d-none')
    renderizarGrafico(pin, 'line')
}

function fecharPopup() {
    document.getElementById('popup').classList.add('d-none')
    if (graficoAtual) {
        graficoAtual.destroy()
        graficoAtual = null
    }
}

function renderizarGrafico(pin, tipo) {
    // Destrói o gráfico anterior para evitar sobreposição
    if (graficoAtual) {
        graficoAtual.destroy()
        graficoAtual = null
    }

    const ctx = document.getElementById('grafico-popup').getContext('2d')

    // Labels e dados mudam conforme o tipo de gráfico
    const labels = tipo === 'pie' ? pin.cards.map(c => c.label) : meses
    const dados  = tipo === 'pie'
        ? pin.cards.map(c => parseFloat(c.valor.replace('.', '').replace(',', '.')))
        : pin.historico

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
    }

    graficoAtual = new Chart(ctx, config)
}

// ============================================================
// EVENT LISTENERS
// ============================================================

// Fechar pelo botão X
document.getElementById('popup-fechar').addEventListener('click', fecharPopup)

// Fechar ao clicar no mapa fora do popup
map.on('click', fecharPopup)

// Trocar tipo de gráfico pelo select
document.getElementById('tipo-grafico').addEventListener('change', (e) => {
    const bairroAtual = document.getElementById('popup-bairro').textContent
    const pinAtual = pins.find(p => p.bairro === bairroAtual)
    if (pinAtual) renderizarGrafico(pinAtual, e.target.value)
})