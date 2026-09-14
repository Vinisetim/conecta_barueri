/* ── DATA ── */
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

/* ── LINE CHART (main) ── */
let lineChart;
function buildLineChart(data, labels) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#0052ff',
        backgroundColor: 'rgba(0,82,255,.08)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#0052ff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: .35,
        fill: true,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} atendimentos` }
      }},
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Inter' }, color: '#6c757d' } },
        y: { grid: { color: '#f1f3f5' }, border: { display: false },
             ticks: { font: { size: 10, family: 'Inter' }, color: '#6c757d',
                      callback: v => (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } }
      }
    }
  });
}
buildLineChart(DATA12, MONTHS);

function updateChart() {
  const p = parseInt(document.getElementById('period-select').value);
  const data   = p === 12 ? DATA12 : p === 6 ? DATA6 : DATA3;
  const labels = p === 12 ? MONTHS : p === 6 ? MONTHS.slice(6) : MONTHS.slice(9);
  buildLineChart(data, labels);
}

/* ── MODAL ── */
let modalChart;
function openModal(bairro, modulo, bg, color, icon) {
  const d = MODAL_DATA[bairro] || MODAL_DATA['Parque dos Camargos'];
  document.getElementById('modal-title').textContent = `${bairro} — ${modulo}`;
  document.getElementById('modal-growth').textContent = `${d.growth} vs. período anterior`;
  document.getElementById('mk1').textContent = d.total;
  document.getElementById('mk2').textContent = d.c1;
  document.getElementById('mk3').textContent = d.c2;

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');

  setTimeout(() => {
    const ctx = document.getElementById('modalChart').getContext('2d');
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
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6c757d' } },
          y: { grid: { color: '#f1f3f5' }, border: { display: false },
               ticks: { font: { size: 10 }, color: '#6c757d',
                        callback: v => (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } }
        }
      }
    });
  }, 50);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}
function closeModalOutside(e) {
  if (e.target.id === 'modal-overlay') closeModal();
}

/* ── FILTERS ── */
function applyFilters() {
  const modulo = document.getElementById('sel-modulo').value;
  const bairro = document.getElementById('sel-bairro').value;
  // simulate data change
  const randomShift = () => DATA12.map(v => Math.round(v * (.85 + Math.random()*.3)));
  buildLineChart(randomShift(), MONTHS);
  const t = document.getElementById('big-num');
  t.textContent = (Math.floor(Math.random()*8000)+2000).toLocaleString('pt-BR');
}

document.getElementById('sel-escopo').addEventListener('change', function() {
  document.getElementById('bairro-group').style.display = this.value === 'bairro' ? '' : 'none';
});