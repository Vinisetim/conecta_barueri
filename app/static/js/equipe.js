const btnAbrir = document.getElementById('abrirmodal');
const btnFechar = document.getElementById('fecharModal');
const modal = document.getElementById('meuModal');

// Abre a modal
btnAbrir.addEventListener('click', () => {
  modal.showModal();
});

// Fecha a modal
btnFechar.addEventListener('click', () => {
  modal.close();
});