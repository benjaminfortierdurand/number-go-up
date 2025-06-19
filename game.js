/* Number Go Up – v0.2
   Compteur + auto-tick + boutique */

////////////////////
// 1. État du jeu //
////////////////////
const state = {
  count: 0,                // total de points
  rate: 0,                 // génération /s
  prestige: 0,             // multiplicateur permanent
  shopQty: [0, 0, 0]       // nb d'items achetés par type
};

///////////////////////////////
// 2. Sauvegarde localStorage //
///////////////////////////////
const SAVE_KEY = 'ngu-save';
function save()  { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
function load()  {
  try { Object.assign(state, JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); }
  catch { /* save corrompue : on reset */ }
}
load();

////////////////////////////////
// 3. Définition des upgrades //
////////////////////////////////
const SHOP_ITEMS = [
  { name: 'Ouvrier',       base: 10,    inc: 1  },
  { name: 'Usine',         base: 100,   inc: 10 },
  { name: 'Fusion quant.', base: 1_000, inc: 100 }
];

/////////////////////////////////
// 4. Raccourcis vers le DOM  //
/////////////////////////////////
const $counter  = document.getElementById('counter');
const $clicker  = document.getElementById('clicker');
const $shop     = document.getElementById('shop');

/////////////////////////
// 5. Rendu principal  //
/////////////////////////
function render() {
  $counter.textContent = Math.floor(state.count).toLocaleString('fr-FR');
  renderShop();
}

/////////////////////////////////
// 6. Gestion de la boutique   //
/////////////////////////////////
function itemCost(idx) {
  return Math.floor(SHOP_ITEMS[idx].base * 1.15 ** state.shopQty[idx]);
}

function buy(idx) {
  const cost = itemCost(idx);
  if (state.count < cost) return;           // pas assez d'argent
  state.count -= cost;
  state.shopQty[idx] += 1;
  state.rate += SHOP_ITEMS[idx].inc;
  render(); save();
}

function renderShop() {
  // Donne un contenu HTML à <section id="shop">
  $shop.innerHTML = '';
  SHOP_ITEMS.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.textContent = `${item.name} (+${item.inc}/s) — ${itemCost(i)}`;
    if (state.count < itemCost(i)) btn.disabled = true;
    btn.onclick = () => buy(i);
    $shop.appendChild(btn);
  });
}

//////////////////////////////////
// 7. Clic manuel +1 (× prestige)
//////////////////////////////////
$clicker.addEventListener('click', () => {
  state.count += 1 * (1 + state.prestige * 0.1);
  render(); save();
});

////////////////////////////////////////////
// 8. Tick automatique : +rate chaque sec //
////////////////////////////////////////////
setInterval(() => {
  state.count += state.rate;
  render(); save();
}, 1_000);

// premier affichage
render();