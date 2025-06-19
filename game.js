/* Number Go Up – v0.5 avec Succès */

//////////////////// 1. ÉTAT ////////////////////
const state = {
  count: 0,
  rate: 0,
  prestige: 0,
  shopQty: [0, 0, 0],
  clicks: 0,
  best: 0,            // meilleur score atteint
  achieved: []        // ids des succès débloqués
};

//////////////////// 2. PERSISTANCE /////////////
const SAVE_KEY = 'ngu-save';
const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(state));
const load = () => Object.assign(state, JSON.parse(localStorage.getItem(SAVE_KEY)) || {});
load();

//////////////////// 3. SUCCÈS //////////////////
const ACHIEVEMENTS = [
  {id:'click10',  label:'10 clics',                   test:s=>s.clicks>=10},
  {id:'click1k',  label:'1000 clics',                 test:s=>s.clicks>=1000},
  {id:'pts1k',    label:'1 000 points',               test:s=>s.best>=1_000},
  {id:'pts1m',    label:'1 000 000 points',           test:s=>s.best>=1_000_000},
  {id:'rate10',   label:'10 / s',                     test:s=>s.rate>=10},
  {id:'rate1k',   label:'1000 / s',                   test:s=>s.rate>=1000},
  {id:'ouvrier1', label:'1er Ouvrier',                test:s=>s.shopQty[0]>=1},
  {id:'ouvrier50',label:'50 Ouvriers',                test:s=>s.shopQty[0]>=50},
  {id:'usine1',   label:'1ère Usine',                 test:s=>s.shopQty[1]>=1},
  {id:'fusion1',  label:'1ère Fusion quantique',      test:s=>s.shopQty[2]>=1},
  {id:'prestige1',label:'Premier Prestige',           test:s=>s.prestige>=1},
  {id:'prestige10',label:'Prestige ×10',              test:s=>s.prestige>=10},
  {id:'multi1e3', label:'Total ×1000 (prestige+ups)', test:s=>s.best*s.prestige>=1e3},
  {id:'idle5m',   label:'5 min de jeu',               test:s=>s.playTime>=300},
  // … ajoute jusqu’à 20 si tu veux
];

//////////////////// 4. SHOP CONFIG /////////////
const SHOP_ITEMS = [
  { name:'Ouvrier',       base:10,    inc:1   },
  { name:'Usine',         base:100,   inc:10  },
  { name:'Fusion quant.', base:1_000, inc:100}
];

//////////////////// 5. DOM /////////////////////
const $counter  = document.getElementById('counter');
const $rate     = document.getElementById('rate');
const $clicker  = document.getElementById('clicker');
const $shop     = document.getElementById('shop');
const $prestige = document.getElementById('prestige');
const $achList  = document.getElementById('achievements');

//////////////////// 6. OUTILS /////////////////
const itemCost = i => Math.floor(SHOP_ITEMS[i].base * 1.15 ** state.shopQty[i]);
const canPrestige = () => state.count >= 1_000_000;
function flash(el){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),250);}
function shakeShop(){ $shop.classList.add('shake'); setTimeout(()=>$shop.classList.remove('shake'),300);}

//////////////////// 7. RENDU //////////////////
function render(){
  $counter.textContent = Math.floor(state.count).toLocaleString('fr-FR');
  $rate.textContent    = `(${state.rate.toLocaleString('fr-FR')} / s)`;
  $prestige.hidden     = !canPrestige();
  renderShop();
  renderAchievements();
}

function renderShop(){
  $shop.innerHTML='';
  SHOP_ITEMS.forEach((item,i)=>{
    const cost=itemCost(i);
    const btn=document.createElement('button');
    btn.textContent=`${item.name} (+${item.inc}/s) — ${cost.toLocaleString('fr-FR')}`;
    btn.disabled=state.count<cost;
    btn.onclick=()=>buy(i);
    $shop.appendChild(btn);
  });
}

function renderAchievements(){
  $achList.innerHTML='';
  ACHIEVEMENTS.forEach(a=>{
    const li=document.createElement('li');
    const done=state.achieved.includes(a.id);
    li.textContent=a.label;
    if(done) li.classList.add('done');
    $achList.appendChild(li);
  });
}

//////////////////// 8. LOGIQUE JOUEUR /////////
$clicker.addEventListener('click',()=>{
  state.count+=1*(1+state.prestige*0.1);
  state.clicks++;
  flash($counter);
  render(); save();
});

function buy(i){
  const cost=itemCost(i);
  if(state.count<cost) return;
  state.count-=cost;
  state.shopQty[i]++;
  state.rate+=SHOP_ITEMS[i].inc;
  shakeShop(); flash($counter);
  render(); save();
}

$prestige.addEventListener('click',()=>{
  if(!canPrestige()) return;
  const gain=Math.floor(state.count/1_000_000);
  if(!confirm(`Prestige +${gain} ?`)) return;
  Object.assign(state,{count:0,rate:0,prestige:state.prestige+gain,shopQty:[0,0,0]});
  flash($counter); shakeShop(); render(); save();
});

//////////////////// 9. TICK AUTO + SUCCÈS //////
setInterval(()=>{
  state.count+=state.rate;
  state.best=Math.max(state.best,state.count);
  state.playTime=(state.playTime||0)+1;

  // check succès
  ACHIEVEMENTS.forEach(a=>{
    if(!state.achieved.includes(a.id) && a.test(state)){
      state.achieved.push(a.id);
      // petite notification ?
      console.log(`Succès débloqué : ${a.label}`);
    }
  });

  flash($counter);
  render(); save();
},1000);

// affichage initial
render();