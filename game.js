/* Number Go Up – v0.4
   Benjamin © 2024 – libre d’usage */

////////////////////
// 1. État global //
////////////////////
const state = {
  count   : 0,          // total de points affiché
  rate    : 0,          // génération auto / seconde
  prestige: 0,          // multiplicateur permanent (+10 % par point)
  shopQty : [0, 0, 0]   // quantité achetée pour chaque upgrade
};

//////////////////////////////
// 2. Sauvegarde / chargement
//////////////////////////////
const SAVE_KEY = 'ngu-save';
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}
function load() {
  Object.assign(state, JSON.parse(localStorage.getItem(SAVE_KEY)) || {});
}
load();

//////////////////////////////////
// 3. Configuration de la boutique
//////////////////////////////////
const SHOP_ITEMS = [
  { name: 'Ouvrier',       base: 10,    inc:   1 },
  { name: 'Usine',         base: 100,   inc:  10 },
  { name: 'Fusion quant.', base: 1_000, inc: 100 }
];

///////////////////////////////
// 4. Raccourcis DOM (cache) //
///////////////////////////////
const $counter  = document.getElementById('counter');
const $rate     = document.getElementById('rate');
const $clicker  = document.getElementById('clicker');
const $shop     = document.getElementById('shop');
const $prestige = document.getElementById('prestige');

/////////////////////////////
// 5. Fonctions utilitaires
/////////////////////////////
const itemCost    = i => Math.floor(SHOP_ITEMS[i].base * 1.15 ** state.shopQty[i]);
const canPrestige = () => state.count >= 1_000_000;

function flash(el) {
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 250);
}
function shakeShop() {
  $shop.classList.add('shake');
  setTimeout(() => $shop.classList.remove('shake'), 300);
}

////////////////////////////
// 6. Rendu interface HTML
////////////////////////////
function render() {
  $counter.textContent = Math.floor(state.count).toLocaleString('fr-FR');
  $rate.textContent    = `(${state.rate.toLocaleString('fr-FR')} / s)`;
  $prestige.hidden     = !canPrestige();
  renderShop();
}
function renderShop() {
  $shop.innerHTML = '';
  SHOP_ITEMS.forEach((item, i) => {
    const cost = itemCost(i);
    const btn  = document.createElement('button');
    btn.textContent = `${item.name} (+${item.inc}/s) — ${cost.toLocaleString('fr-FR')}`;
    btn.disabled    = state.count < cost;
    btn.onclick     = () => buy(i);
    $shop.appendChild(btn);
  });
}

/////////////////////////////////////
// 7. Gestion des interactions joueur
/////////////////////////////////////
$clicker.addEventListener('click', () => {
  state.count += 1 * (1 + state.prestige * 0.1);
  flash($counter);
  render(); save();
});

function buy(i) {
  const cost = itemCost(i);
  if (state.count < cost) return;
  state.count     -= cost;
  state.shopQty[i] += 1;
  state.rate      += SHOP_ITEMS[i].inc;
  flash($counter);
  shakeShop();
  render(); save();
}

$prestige.addEventListener('click', () => {
  if (!canPrestige()) return;
  const gain = Math.floor(state.count / 1_000_000);   // 1 point / million
  if (!confirm(`Faire prestige +${gain} ?\nVous repartirez de zéro avec +10 % par point.`)) return;

  Object.assign(state, {
    count   : 0,
    rate    : 0,
    prestige: state.prestige + gain,
    shopQty : [0, 0, 0]
  });
  flash($counter);
  shakeShop();
  render(); save();
});

////////////////////////////////////////
// 8. Tick automatique (une fois / sec)
////////////////////////////////////////
setInterval(() => {
  state.count += state.rate;
  flash($counter);
  render(); save();
}, 1_000);

// premier affichage à l’ouverture
render();