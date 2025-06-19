/* Number Go Up – v0.3
   Upgrades + Prestige */

////////////////////
// 1. État global //
////////////////////
const state = {
  count: 0,
  rate: 0,
  prestige: 0,          // 1 prestige = +10 %
  shopQty: [0, 0, 0]
};

/////////////////////
// 2. Persistance  //
/////////////////////
const SAVE_KEY = 'ngu-save';
const save   = () => localStorage.setItem(SAVE_KEY, JSON.stringify(state));
const load   = () => Object.assign(state, JSON.parse(localStorage.getItem(SAVE_KEY)) || {});
load();

////////////////////////////
// 3. Configuration shop  //
////////////////////////////
const SHOP_ITEMS = [
  { name: 'Ouvrier',       base: 10,    inc: 1  },
  { name: 'Usine',         base: 100,   inc: 10 },
  { name: 'Fusion quant.', base: 1_000, inc: 100 }
];

///////////////////////////////
// 4. Raccourcis vers le DOM //
///////////////////////////////
const $counter  = document.getElementById('counter');
const $clicker  = document.getElementById('clicker');
const $shop     = document.getElementById('shop');
const $prestige = document.getElementById('prestige');

///////////////////////
// 5. Fonctions util //
///////////////////////
const itemCost  = i => Math.floor(SHOP_ITEMS[i].base * 1.15 ** state.shopQty[i]);
const canPrestige = () => state.count >= 1_000_000;

/////////////////////////
// 6. Rendu principal  //
/////////////////////////
function render() {
  $counter.textContent = Math.floor(state.count).toLocaleString('fr-FR');
  $prestige.hidden = !canPrestige();
  renderShop();
}
function renderShop() {
  $shop.innerHTML = '';
  SHOP_ITEMS.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.textContent = `${item.name} (+${item.inc}/s) — ${itemCost(i)}`;
    btn.disabled = state.count < itemCost(i);
    btn.onclick  = () => buy(i);
    $shop.appendChild(btn);
  });
}

/////////////////////////////
// 7. Actions des boutons  //
/////////////////////////////
$clicker.addEventListener('click', () => {
  state.count += 1 * (1 + state.prestige * 0.1);
  render(); save();
});
function buy(i) {
  const cost = itemCost(i);
  if (state.count < cost) return;
  state.count    -= cost;
  state.shopQty[i] += 1;
  state.rate     += SHOP_ITEMS[i].inc;
  render(); save();
}
$prestige.addEventListener('click', () => {
  if (!canPrestige()) return;
  const gain = Math.floor(state.count / 1_000_000);   // 1 prestige / million
  if (!confirm(`Prestige +${gain} ? Réinitialiser la partie ?`)) return;

  // reset
  Object.assign(state, {
    count: 0,
    rate:  0,
    prestige: state.prestige + gain,
    shopQty: [0, 0, 0]
  });
  render(); save();
});

///////////////////////////////
// 8. Tick automatique / sec //
///////////////////////////////
setInterval(() => {
  state.count += state.rate;
  render(); save();
}, 1_000);

// premier affichage
render();