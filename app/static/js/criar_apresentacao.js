/* ══════════════════════════════════════
   DADOS MOCKADOS
   ══════════════════════════════════════ */
const MONTHS = ['Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr','Mai'];
const DATA12 = [6800,6500,7100,7400,7200,7800,7600,8100,8400,8700,9100,10300];
const DATA6  = DATA12.slice(6);
const DATA3  = DATA12.slice(9);

const MODAL_DATA = {
  'Parque dos Camargos': { total:'8.735', c1:'6.421', c2:'1.842', growth:'+12,5%', data: DATA12 },
  'Alphaville':          { total:'3.210', c1:'2.450', c2:'560',   growth:'+7,3%',  data: [2400,2500,2700,2800,2900,3000,3100,3050,3100,3150,3180,3210] },
  'Engenho Novo':        { total:'4.580', c1:'3.200', c2:'980',   growth:'+9,1%',  data: [3200,3400,3600,3700,3800,4000,4100,4200,4350,4400,4500,4580] },
  'Centro':              { total:'5.120', c1:'3.900', c2:'820',   growth:'+5,4%',  data: [4400,4500,4600,4700,4750,4800,4850,4900,4980,5000,5080,5120] },
  'Aldeia da Serra':     { total:'2.870', c1:'2.100', c2:'480',   growth:'+11,2%', data: [1800,1900,2000,2100,2200,2300,2450,2550,2650,2730,2800,2870] },
  'Jardim Mutinga':      { total:'3.640', c1:'2.700', c2:'720',   growth:'+8,6%',  data: [2800,2900,3000,3100,3150,3200,3300,3400,3500,3550,3600,3640] },
};

/* ══════════════════════════════════════
   GRÁFICO DE LINHA (painel principal)
   ══════════════════════════════════════ */
let lineChart;

function buildLineChart(data, labels) {
  const canvas = document.getElementById('lineChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (lineChart) lineChart.destroy();

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderColor: '#0052ff',
        backgroundColor: 'rgba(0,82,255,.08)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#0052ff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.35,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ' ' + context.parsed.y.toLocaleString('pt-BR') + ' atendimentos';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'Inter' }, color: '#6c757d' }
        },
        y: {
          grid: { color: '#f1f3f5' },
          border: { display: false },
          ticks: {
            font: { size: 10, family: 'Inter' },
            color: '#6c757d',
            callback: function(v) {
              return v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v;
            }
          }
        }
      }
    }
  });
}

// Inicializa o gráfico principal
buildLineChart(DATA12, MONTHS);


/* ══════════════════════════════════════
   FILTROS E EVENTOS (ATUALIZADO)
   ══════════════════════════════════════ */

const periodSelect = document.getElementById('period-select');
if (periodSelect) {
  periodSelect.addEventListener('change', function() {
    var p = parseInt(this.value);
    var data   = p === 12 ? DATA12 : p === 6 ? DATA6 : DATA3;
    var labels = p === 12 ? MONTHS : p === 6 ? MONTHS.slice(6) : MONTHS.slice(9);
    buildLineChart(data, labels);
  });
}

const selEscopo = document.getElementById('sel-escopo');
if (selEscopo) {
  selEscopo.addEventListener('change', function() {
    var bairroGroup = document.getElementById('bairro-group');
    if (bairroGroup) bairroGroup.style.display = this.value === 'bairro' ? '' : 'none';
  });
}

const btnApply = document.getElementById('btn-apply-filters');
if (btnApply) {
  btnApply.addEventListener('click', function() {
    // 1. Captura os elementos dos filtros
    const selModulo = document.getElementById('sel-modulo');
    const selEscopo = document.getElementById('sel-escopo');
    const selBairro = document.getElementById('sel-bairro');

    // 2. Elementos que vamos atualizar no topo do gráfico
    const chartTag = document.querySelector('.chart-module-tag');
    const bigNum = document.getElementById('big-num');

    // Pegar o texto do Módulo formatado bonitinho (removendo o emoji se preferir, ou deixando completo)
    let moduloTexto = selModulo.options[selModulo.selectedIndex].text;
    let escopoTexto = "";
    let dadosBairro = null;

    if (selEscopo.value === 'bairro') {
      escopoTexto = selBairro.value;
      // Busca os dados mockados reais desse bairro específico na sua tabela MODAL_DATA
      dadosBairro = MODAL_DATA[escopoTexto];
    } else {
      escopoTexto = "Barueri inteira";
    }

    // 3. Atualiza dinamicamente o texto da tag do gráfico!
    if (chartTag) {
      chartTag.innerHTML = `${moduloTexto} <span>•</span> ${escopoTexto}`;
    }

    // 4. Atualiza os dados do gráfico baseado no bairro escolhido
    if (dadosBairro) {
      // Se achou o bairro no banco simulado, renderiza os dados dele
      buildLineChart(dadosBairro.data, MONTHS);
      if (bigNum) bigNum.textContent = dadosBairro.total;
    } else {
      // Caso seja "Barueri inteira" ou um escopo geral, gera o cálculo randômico padrão
      var newData = DATA12.map(function(v) {
        return Math.round(v * (0.85 + Math.random() * 0.3));
      });
      buildLineChart(newData, MONTHS);

      var totalAleatorio = Math.floor(Math.random() * 20000) + 15000;
      if (bigNum) bigNum.textContent = totalAleatorio.toLocaleString('pt-BR');
    }
  });
}

/* ══════════════════════════════════════
   LOGICA PARA SALVAR NOVO ÍCONE
   ══════════════════════════════════════ */

// 1. Mapeamento de estilos por módulo (para o ícone saber qual cor e desenho usar)
const estilosModulo = {
    'saude': { icon: 'bi-heart-pulse', color: '#2563eb', bg: '#eff6ff', label: 'Saúde' },
    'seguranca': { icon: 'bi-shield-check', color: '#16a34a', bg: '#f0fdf4', label: 'Segurança' },
    'educacao': { icon: 'bi-mortarboard', color: '#7c3aed', bg: '#faf5ff', label: 'Educação' },
    'mobilidade': { icon: 'bi-bus-front', color: '#d97706', bg: '#fef3c7', label: 'Mobilidade' },
    'meio-ambiente': { icon: 'bi-tree', color: '#15803d', bg: '#f0fdf4', label: 'Meio Ambiente' },
    'social': { icon: 'bi-people', color: '#e11d48', bg: '#fff1f2', label: 'Assistência Social' }
};

// 2. Seleciona o botão de salvar (o da Topbar)
const btnSaveIcon = document.querySelector('.btn-save-icon');

if (btnSaveIcon) {
    btnSaveIcon.addEventListener('click', function() {
        // Captura os valores atuais dos selects
        const moduloVal = document.getElementById('sel-modulo').value;
        const escopoVal = document.getElementById('sel-escopo').value;
        const bairroVal = document.getElementById('sel-bairro').value;

        // Define o nome que aparecerá no card
        const nomeRegiao = (escopoVal === 'cidade') ? 'Barueri (Geral)' : bairroVal;
        const estilo = estilosModulo[moduloVal];

        // Criar o HTML do novo Card
        const novoCardHTML = `
            <div class="saved-icon-card" 
                 onclick="openModal('${nomeRegiao}', '${estilo.label}', '${estilo.bg}', '${estilo.color}')">
                <button class="card-menu-btn">⋮</button>
                <div class="icon-bubble" style="background:${estilo.bg}; color:${estilo.color}">
                    <i class="bi ${estilo.icon}"></i>
                </div>
                <span class="ic-name">${nomeRegiao}</span>
                <span class="ic-module">${estilo.label}</span>
            </div>
        `;

        // Seleciona a grade de ícones
        const iconsGrid = document.querySelector('.icons-grid');
        const newCardPlaceholder = document.querySelector('.new-card');

        // Insere o novo card antes do botão de "Novo ícone"
        if (iconsGrid && newCardPlaceholder) {
            newCardPlaceholder.insertAdjacentHTML('beforebegin', novoCardHTML);

            // Feedback visual opcional
            alert(`Ícone de ${nomeRegiao} salvo com sucesso!`);
        }
    });
}


/* ══════════════════════════════════════
   MODAL
   ══════════════════════════════════════ */
var modalChart;

function openModal(bairro, modulo, bg, color) {
  var d = MODAL_DATA[bairro] || MODAL_DATA['Parque dos Camargos'];

  document.getElementById('modal-title').textContent  = bairro + ' — ' + modulo;
  document.getElementById('modal-growth').textContent = d.growth + ' vs. período anterior';
  document.getElementById('mk1').textContent = d.total;
  document.getElementById('mk2').textContent = d.c1;
  document.getElementById('mk3').textContent = d.c2;

  document.getElementById('modal-overlay').classList.add('open');

  setTimeout(function() {
    var canvas = document.getElementById('modalChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (modalChart) modalChart.destroy();

    modalChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MONTHS,
        datasets: [{
          data: d.data,
          backgroundColor: color + '99',
          borderColor: color,
          borderWidth: 1.5,
          borderRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6c757d' } },
          y: {
            grid: { color: '#f1f3f5' },
            border: { display: false },
            ticks: {
              font: { size: 10 },
              color: '#6c757d',
              callback: function(v) { return v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v; }
            }
          }
        }
      }
    });
  }, 50);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

const modalOverlay = document.getElementById('modal-overlay');
if (modalOverlay) {
  modalOverlay.addEventListener('click', function(e) {
    if (e.target.id === 'modal-overlay') closeModal();
  });
}

/* ══════════════════════════════════════
   CONFIGURAÇÃO DO MAPA (LEAFLET)
   ══════════════════════════════════════ */



const map = L.map('map', {
    center: [-23.5030, -46.8750],
    zoom: 14,
    minZoom: 13,
    maxZoom: 17,
    zoomControl: false,
    maxBounds: [
        [-23.58, -46.95],
        [-23.43, -46.78]
    ],
    maxBoundsViscosity: 1.0
});


const layer=L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
   maxZoom: 20
})


layer.addTo(map);
/* ══════════════════════════════════════
   CORREÇÃO DO MAPA APAGADO/CINZA
   ══════════════════════════════════════ */
// Executa imediatamente e repete após o carregamento total da janela
// function forcarRenderizacaoMapa() {
//     map.invalidateSize();
// }






// GEOJSON Barueri
fetch('/static/data/barueri.geojson')
    .then(response => response.json())
    .then(data => {
        const mundo = [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]];
        const barueri = data.features[0].geometry.coordinates[0];

        L.polygon([mundo, barueri], {
            color: 'none',
            fillColor: '#0f172a',
            fillOpacity: 0.55
        }).addTo(map);

        L.geoJSON(data, {
            style: {
                color: '#0052ff',
                weight: 2.5,
                fillColor: '#4d82ff',
                fillOpacity: 0.25
            }
        }).addTo(map);
    })
    .catch(err => console.error("Erro ao carregar o GeoJSON do mapa:", err));

