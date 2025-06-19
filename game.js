/* Number Go Up — VERSION STABLE 1.3
   Ajout : tremblement du bouton Prestige lorsqu’il devient disponible */

//////////////////// 1. ÉTAT ////////////////////
const state = {
  count: 0,
  rate: 0,
  prestige: 0,
  shopQty: [0, 0, 0],
  clicks: 0,
  best: 0,
  playTime: 0,
  achieved: []
};

//////////////////// 2. PERSISTENCE /////////////
const SAVE_KEY  = 'ngu-save';
const THEME_KEY = 'ngu-theme';
const saveState = () => localStorage.setItem(SAVE_KEY, JSON.stringify(state));
const loadState = () => Object.assign(state, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'));
loadState();

//////////////////// 3. CONFIG //////////////////
const ACHIEVEMENTS = [
  {id:'click10',  label:'10 clics',         test:s=>s.clicks>=10},
  {id:'click1k',  label:'1 000 clics',      test:s=>s.clicks>=1_000},
  {id:'pts1k',    label:'1 000 points',     test:s=>s.best>=1_000},
  {id:'pts1m',    label:'1 000 000 points', test:s=>s.best>=1_000_000},
  {id:'ouvrier1', label:'1er Ouvrier',      test:s=>s.shopQty[0]>=1},
  {id:'prestige1',label:'Premier Prestige', test:s=>s.prestige>=1}
];
const SHOP_ITEMS = [
  {name:'Ouvrier', base:10,   inc:1},
  {name:'Usine',   base:100,  inc:10},
  {name:'Fusion',  base:1_000,inc:100}
];

//////////////////// 4. DOM /////////////////////
const $counter   = document.getElementById('counter');
const $rate      = document.getElementById('rate');
const $clicker   = document.getElementById('clicker');
const $shop      = document.getElementById('shop');
const $prestige  = document.getElementById('prestige');
const $achList   = document.getElementById('achievements');
const $toast     = document.getElementById('toast');
const $pFill     = document.getElementById('prestige-fill');
const $resetBtn  = document.getElementById('reset');
const $themeBtn  = document.getElementById('theme-toggle');

function popPlusOne(x, y){
  const span = document.createElement('span');
  span.textContent = '+1';
  span.className   = 'pop';      // la classe définie dans style.css
  span.style.left  = x + 'px';
  span.style.top   = y + 'px';
  document.body.appendChild(span);
  setTimeout(()=> span.remove(), 600);   // disparait après 0,6 s
}

//////////////////// 5. THÈME ///////////////////
function applyTheme(mode){
  document.body.classList.toggle('light', mode==='light');
  localStorage.setItem(THEME_KEY, mode);
  $themeBtn.textContent = mode==='light' ? '🌙' : '☀️';
}
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
$themeBtn.addEventListener('click', ()=>{
  applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
});

//////////////////// 6. SON & TOAST /////////////
const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
function ping(){
  try{
    const o=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    o.frequency.value=880; o.connect(g); g.connect(audioCtx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+0.25); o.stop(audioCtx.currentTime+0.25);
  }catch{}
}
function toast(text){
  $toast.textContent=text; $toast.hidden=false;
  $toast.classList.remove('show'); void $toast.offsetWidth; $toast.classList.add('show'); ping();
  setTimeout(()=>{ $toast.classList.remove('show'); setTimeout(()=>{ $toast.hidden=true;},300); },1800);
}

//////////////////// 7. OUTILS /////////////////
const itemCost    = i=>Math.floor(SHOP_ITEMS[i].base * 1.15 ** state.shopQty[i]);
const canPrestige = ()=>state.count >= 1_000_000;
function flash(){ $counter.classList.add('flash'); setTimeout(()=>$counter.classList.remove('flash'),200); }

//////////////////// 8. RENDU //////////////////
let prestigeShown=false;
function render(){
  $counter.textContent = Math.floor(state.count).toLocaleString('fr-FR');
  $rate.textContent    = `(${state.rate.toLocaleString('fr-FR')} / s)`;

  const showPrestige = canPrestige();
  if(showPrestige && !prestigeShown){
    $prestige.classList.add('pulse');
    setTimeout(()=> $prestige.classList.remove('pulse'), 2400);
  }
  prestigeShown = showPrestige;
  $prestige.hidden = !showPrestige;

  $pFill.style.width = Math.min(state.count/1_000_000*100,100)+'%';

  // boutique
  $shop.innerHTML='';
  SHOP_ITEMS.forEach((it,i)=>{
    const cost=itemCost(i);
    const btn=document.createElement('button');
    btn.textContent=`${it.name} (+${it.inc}/s) — ${cost.toLocaleString('fr-FR')}`;
    btn.disabled = state.count < cost;
    btn.onclick  = ()=>buy(i);
    $shop.appendChild(btn);
  });

  // succès
  $achList.innerHTML='';
  ACHIEVEMENTS.forEach(a=>{
    const li=document.createElement('li');
    li.textContent=a.label;
    if(state.achieved.includes(a.id)) li.classList.add('done');
    $achList.appendChild(li);
  });
}

//////////////////// 9. ACTIONS ////////////////
$clicker.addEventListener('click', e =>{
  state.count += 1 * (1 + state.prestige*0.1);
  state.clicks++;

  popPlusOne(e.clientX, e.clientY);   // ← nouveau !
  flash(); render(); saveState();
});
function buy(i){
  const cost=itemCost(i); if(state.count<cost) return;
  state.count-=cost; state.shopQty[i]++; state.rate+=SHOP_ITEMS[i].inc; flash(); render(); saveState();
}
$prestige.addEventListener('click',()=>{
  if(!canPrestige()) return;
  const gain=Math.floor(state.count/1_000_000);
  if(!confirm(`Prestige +${gain} ?`)) return;
  Object.assign(state,{count:0,rate:0,prestige:state.prestige+gain,shopQty:[0,0,0]});
  toast(`Prestige +${gain}`); flash(); render(); saveState();
});
$resetBtn.addEventListener('click',()=>{
  if(confirm('Tout effacer ?')){ localStorage.removeItem(SAVE_KEY); location.reload(); }
});

//////////////////// 10. TICK + SUCCÈS //////////
let paused=false; document.addEventListener('visibilitychange',()=>paused=document.hidden);
setInterval(()=>{
  if(paused) return;
  state.count += state.rate;
  state.best  = Math.max(state.best, state.count);
  state.playTime++;
  ACHIEVEMENTS.forEach(a=>{ if(!state.achieved.includes(a.id) && a.test(state)){ state.achieved.push(a.id); toast('Succès : '+a.label); }});
  flash(); render(); saveState();
},1000);

window.addEventListener('beforeunload', () => {
  localStorage.removeItem(SAVE_KEY);
});

// premier rendu
render();