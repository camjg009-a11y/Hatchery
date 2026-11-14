// ---- Boss Rush: epic and legendary bosses back to back; health carries over, fainted creatures stay out, a buff every 5 floors ----
const RUSH_BUFFS={
  heal:{n:"Second Wind",d:"Heal your whole team 40%.",ok:()=>RUSH.team.some(u=>u.hp>0&&u.hp<u.max),now:()=>RUSH.team.forEach(u=>{if(u.hp>0)u.hp=Math.min(u.max,u.hp+Math.round(u.max*.4))}),w:1.4},
  revive:{n:"Rekindle",d:"Bring back a fainted creature at half health.",ok:()=>RUSH.team.some(u=>u.hp<=0),now:()=>{const u=RUSH.team.find(u=>u.hp<=0);u.hp=Math.round(u.max*.5)},w:2.5},
  atk:{n:"Sharpened",d:"Your team gets +15% Attack.",now:()=>RUSH.team.forEach(u=>u.atk*=1.15)},
  def:{n:"Hardened",d:"Your team gets +15% Defense.",now:()=>RUSH.team.forEach(u=>u.def*=1.15)},
  spd:{n:"Quickened",d:"Your team gets +15% Speed.",now:()=>RUSH.team.forEach(u=>u.spd*=1.15)},
  hp:{n:"Vigor",d:"Your team gets +20% max health.",now:()=>RUSH.team.forEach(u=>{const g=Math.round(u.max*.2);u.max+=g;if(u.hp>0)u.hp+=g})},
  combo:{n:"Chain Reaction",d:"Your combos hit 60% harder."},
  linger:{n:"Lingering",d:"Statuses you apply last a turn longer."},
  trigger:{n:"Hair Trigger",d:"Your charge moves fire with no wind-up.",max:1,w:.7},
  iron:{n:"Iron Will",d:"Brace can be used every turn.",max:1,w:.8},
  guard:{n:"Opening Guard",d:"Each creature starts every fight shielded from one hit."},
  medic:{n:"Field Medic",d:"Heal 10% more after each fight."},
  ambush:{n:"First Blood",d:"Deal 50% more damage on the first turn of each fight."},
  keen:{n:"Keen Edge",d:"+15% crit chance for your team."},
  glass:{n:"Glass Edge",d:"+40% Attack, but −25% max health.",curse:1,now:()=>RUSH.team.forEach(u=>{u.atk*=1.4;u.max=Math.round(u.max*.75);u.hp=Math.min(u.hp,u.max)}),w:.6},
  blood:{n:"Blood Pact",d:"+30% damage, but no healing after fights.",curse:1,max:1,w:.6}
};
const MUT={thorns:{n:"Thorns",d:"Reflects 15% of the damage it takes."},regen:{n:"Regenerating",d:"Heals 5% health every turn."},enraged:{n:"Enraged",d:"+50% Attack below half health."},
  swift:{n:"Swift",d:"Double Speed."},warded:{n:"Warded",d:"Immune to statuses."},armored:{n:"Armored",d:"Takes 25% less damage."}};
const RUSH_HP=1.13,RUSH_ATK=1.1,RUSH_DEF=1.06,RUSH_START=1.6,RUSH_GOD=1.4; // per-floor growth; first-floor strength vs a region boss; every 10th floor
let RUSH=null,rushBest=0,rushEnded=0,rushSaved=null;
try{rushBest=+(localStorage.getItem("hatchery-rush")||0);rushEnded=+(localStorage.getItem("hatchery-rushend")||0);rushSaved=JSON.parse(localStorage.getItem("hatchery-rushrun")||"null")}catch(e){}
// a run is saved at the start of every floor and while a reward is waiting, so closing the game never loses it
function rushPack(){const nx=RUSH.next?1:0;return{fl:RUSH.floor+nx,cl:RUSH.cleared,L:RUSH.L,buffs:RUSH.buffs,wild:RUSH.wild,order:RUSH.order,last:RUSH.last,pend:RUSH.pending,offer:RUSH.offer||null,
  cur:nx?null:RUSH.cur||null,team:RUSH.team.map(u=>({id:u.id,hp:Math.max(0,Math.round(u.hp)),max:u.max,atk:u.atk,def:u.def,spd:u.spd,dealt:u.dealt||0})),t:Date.now()}}
function rushSave(){rushSaved=RUSH&&!RUSH.done?rushPack():null;saveBattle()}
function rushUnpack(s){
  const team=s.team.filter(x=>MONSTERS.some(m=>m.id===x.id)).map(x=>{const m=MONSTERS.find(m=>m.id===x.id),u=mkUnit(m,roster[x.id]?roster[x.id].star:1,"you");
    Object.assign(u,{hp:x.hp,max:x.max,atk:x.atk,def:x.def,spd:x.spd,dealt:x.dealt});return u});
  RUSH={floor:s.fl,cleared:s.cl,L:s.L,buffs:s.buffs||[],wild:s.wild||{},done:false,pending:!!s.pend,offer:s.offer,cur:s.cur,order:s.order,last:s.last,next:false,team}}
function rushResume(){if(!rushSaved)return;rushUnpack(rushSaved);if(RUSH.pending)return renderRegions();rushFight()}
function rushAbandon(){if(!rushSaved)return;rushUnpack(rushSaved);rushFinish();renderRegions();toast("Run ended. Wildcards you earned are kept.")}
function rushFinish(){RUSH.done=true;rushSaved=null;rushEnded=Date.now();saveBattle()}
const rc=k=>RUSH?RUSH.buffs.filter(b=>b===k).length:0;
function RB(k){return F&&F.rush?rc(k):0}
const MU=(u,k)=>!!(u&&u.muts&&u.muts.includes(k));
function rushStartL(){let b=1;for(const k in regions)b=Math.max(b,regions[k].lv||1);return Math.max(1,b-1)} // the strongest region boss level you have beaten
function rushScale(fl){const s=foeScale(RUSH.L,true),god=fl%10===0?RUSH_GOD:1;
  return{hp:s.hp*RUSH_START*Math.pow(RUSH_HP,fl-1)*god,atk:s.atk*RUSH_START*Math.pow(RUSH_ATK,fl-1)*(god>1?1.15:1),def:s.def*Math.pow(RUSH_DEF,fl-1)}}
function rushShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function rushStart(){tip("rush");
  const ids=slots.battle.filter(id=>roster[id]);if(!ids.length)return toast("Pick a battle team first");
  RUSH={floor:1,cleared:0,L:rushStartL(),buffs:[],wild:{},done:false,pending:false,order:rushShuffle(Object.keys(REGION)),
    team:ids.map(id=>{const u=mkUnit(MONSTERS.find(x=>x.id===id),roster[id].star,"you");u.dealt=0;return u})};
  rushFight();
}
// a fusion belongs to the realms of the creatures it is made from
const fusionRealms=m=>m.fusion?[...new Set(m.fusion.flatMap(id=>(MONSTERS.find(x=>x.id===id)||{eggs:[]}).eggs))]:[];
function rushFloor(){
  const fl=RUSH.floor,rid=RUSH.order[Math.floor((fl-1)/5)%RUSH.order.length],G=REGION[rid];
  let pool=MONSTERS.filter(m=>(m.eggs.includes(G.realm)||fusionRealms(m).includes(G.realm))&&(m.tier==="epic"||m.tier==="legendary"));
  const leg=pool.filter(m=>m.tier==="legendary");
  if(fl%10===0&&leg.length)pool=leg; // every 10th floor: the realm's god
  else{const ep=pool.filter(m=>m.tier==="epic"&&m.id!==RUSH.last);if(ep.length&&Math.random()>Math.min(.3,fl*.02))pool=ep}
  const mine=pool.filter(m=>G.el&&META[m.id].el===G.el);if(mine.length&&Math.random()<.7)pool=mine;
  const m=pool[Math.floor(Math.random()*pool.length)];RUSH.last=m.id;
  const b=mkUnit(m,1,"foe",rushScale(fl));b.boss=true;
  let n=fl>=3&&Math.random()<Math.min(1,.2+fl*.07)?1:0;if(fl%5===0)n=Math.max(n,1);if(fl%10===0||fl>=15)n=2;if(fl>=25)n=3;
  b.muts=rushShuffle(Object.keys(MUT)).slice(0,n);if(MU(b,"swift"))b.spd*=2;
  return{rid,b};
}
function rushBanner(top,big){if(window.__fast)return;const d=document.createElement("div");d.className="rushban";d.innerHTML=`<small>${top}</small><b>${big}</b>`;$("arena").appendChild(d);setTimeout(()=>d.remove(),1900)}
function rushFight(){
  let rid,b;const fl=RUSH.floor,c=RUSH.cur,cm=c&&c.fl===fl&&MONSTERS.find(x=>x.id===c.id);
  if(cm){rid=c.rid;b=mkUnit(cm,1,"foe",rushScale(fl));b.boss=true;b.muts=c.muts||[];if(MU(b,"swift"))b.spd*=2} // resuming: same boss as before
  else{({rid,b}=rushFloor());RUSH.cur={fl,rid,id:b.id,muts:b.muts}}
  const G=REGION[rid];
  RUSH.team.forEach(u=>{u.mod={atk:[1,0],def:[1,0],spd:[1,0]};u.st={};u.cds={};u.charging=null;u.dot=0;u.stun=false;u.braced=0;u.over=0;u.once={};u.shield=u.hp>0?rc("guard"):0});
  F={rid,boss:true,rush:true,floor:fl,lv:fl,foes:[b],fa:0,team:RUSH.team,active:0,ch:RUSH.team.findIndex(u=>u.hp>0),picks:[],busy:false,over:false,round:0};
  {const bd=teamBonds(RUSH.team,rid);F.elB=bd.elB;F.bonds=bd.lines}
  const realm=G.realm;setRegion(EGGS.findIndex(e=>e.id===realm));root.style.setProperty("--c",EGGS.find(e=>e.id===realm).c);setArena(G.bg,G.hz);fxPreload();
  $("field").innerHTML=(G.el?ico(G.el):ico("earth"))+`<span>Floor ${fl} · ${G.name}</span>`;
  $("field").onclick=()=>toast(G.fx+(b.muts.length?" Boss: "+b.muts.map(k=>MUT[k].n+" ("+MUT[k].d.toLowerCase().replace(/\.$/,"")+")").join(", ")+".":""));
  view("fight");$("arena").classList.add("boss");$("arena").classList.remove("egging");$("fightResult").hidden=true;$("fx2").innerHTML="";
  showFoe();say(`Floor ${fl}: ${b.m.name}${b.muts.length?" — "+b.muts.map(k=>MUT[k].n).join(", "):""}.`);paintFight();
  F.team.filter(u=>u.hp>0).forEach(enter);enter(b);
  rushBanner(fl%10===0?"Floor "+fl+" · Realm god":"Floor "+fl,b.m.name);rushSave();
}
function rushEnd(won){
  const box=$("fightResult");box.hidden=false;const fl=RUSH.floor;
  if(!won)return rushSummary();
  RUSH.cleared=fl;if(fl>rushBest){rushBest=fl;try{localStorage.setItem("hatchery-rush",String(fl))}catch(e){}}
  const rl=REGION[F.rid].realm;let g=(fl%2===0?1:0)+(fl%10===0?2:0),body="";
  if(fl%10===0){clutch[rl]=(clutch[rl]||0)+1;body+=`<p><em>+1 ${EGGS.find(e=>e.id===rl).name} Clutch</em></p>`}
  if(g){wild[rl]=(wild[rl]||0)+g;RUSH.wild[rl]=(RUSH.wild[rl]||0)+g;saveProg();body+=`<p>+${g} ${REALMN[rl]} Wildcard${g>1?"s":""}</p>`}
  if(!RUSH.team.some(u=>u.hp>0))return rushSummary(); // the boss fell, but so did your last creature
  const hp=rc("blood")?0:.1+.1*rc("medic");if(hp)RUSH.team.forEach(u=>{if(u.hp>0)u.hp=Math.min(u.max,u.hp+Math.round(u.max*hp))});
  body+=`<p>${hp?`Your team recovers ${Math.round(hp*100)}% health.`:"Blood Pact: no healing."}</p>`+rushTeamLine();
  RUSH.next=true;if(fl%5===0){RUSH.pending=true;RUSH.offer=rushOffer()}rushSave();
  $("resTitle").textContent=`Floor ${fl} cleared`;
  if(RUSH.pending)body+=`<p><em>Choose a reward</em></p>`+rushOfferHTML();
  $("resBody").innerHTML=body;$("resAgain").hidden=RUSH.pending;$("resAgain").textContent="Next floor";$("resBack").textContent="End run";
  rushOfferWire($("resBody"));
  if(!muted&&audio())[523,659,784,1047].forEach((n,i)=>tone("sine",n,n,.5,.05,i*.07));
  if(!window.__fast)$("foeImg").animate([{opacity:1,filter:"brightness(1)"},{opacity:0,filter:"brightness(3) blur(6px)"}],{duration:700,fill:"forwards"});
}
function rushTeamLine(){return`<p class="rteam">${RUSH.team.map(u=>`<span class="${u.hp>0?"":"ko"}">${u.m.name} ${u.hp>0?Math.round(100*u.hp/u.max)+"%":"fainted"}</span>`).join("")}</p>`}
function rushOffer(){
  const ok=Object.keys(RUSH_BUFFS).filter(k=>{const B=RUSH_BUFFS[k];return(!B.ok||B.ok())&&(!B.max||rc(k)<B.max)}),out=[];
  while(out.length<3&&ok.length){const w=ok.map(k=>RUSH_BUFFS[k].w||1);let r=Math.random()*w.reduce((a,c)=>a+c,0),i=0;for(;i<w.length-1;i++){if(r<w[i])break;r-=w[i]}out.push(ok.splice(i,1)[0])}
  return out;
}
function rushOfferHTML(){return`<div class="buffs">${(RUSH.offer||[]).map(k=>{const B=RUSH_BUFFS[k];return`<button class="buff${B.curse?" cursed":""}" data-k="${k}"><b>${B.n}</b><small>${B.d}</small></button>`}).join("")}</div>`}
function rushOfferWire(box){box.querySelectorAll(".buff").forEach(x=>x.onclick=()=>{const B=RUSH_BUFFS[x.dataset.k];RUSH.buffs.push(x.dataset.k);if(B.now)B.now();RUSH.pending=false;RUSH.offer=null;rushNext()})}
function rushNext(){if(!RUSH||RUSH.done)return rushStart();if(RUSH.pending)return;if(RUSH.next){RUSH.floor++;RUSH.next=false}rushFight()}
function rushLeave(){if(!RUSH||RUSH.done)return view("regions");if(F){F.over=true;F.fled=true}rushSummary()}
function rushSummary(){
  rushFinish();const box=$("fightResult");box.hidden=false;view("fight");
  const mvp=RUSH.team.slice().sort((a,b)=>(b.dealt||0)-(a.dealt||0))[0],w=Object.keys(RUSH.wild);
  $("resTitle").textContent="Run over";
  $("resBody").innerHTML=`<p>Floors cleared: <b>${RUSH.cleared}</b> · Best: ${rushBest}</p>
    ${w.length?`<p>Wildcards earned: ${w.map(k=>RUSH.wild[k]+" "+REALMN[k]).join(", ")}</p>`:"<p>No wildcards this run. Clear 2 floors to earn one.</p>"}
    ${RUSH.buffs.length?`<p><small>Rewards taken: ${RUSH.buffs.map(k=>RUSH_BUFFS[k].n).join(", ")}</small></p>`:""}
    ${mvp&&mvp.dealt?`<p><small>Most damage: ${mvp.m.name} (${fmt(mvp.dealt)})</small></p>`:""}`;
  $("resAgain").hidden=false;$("resAgain").textContent="New run";$("resBack").textContent="Battle";
}
function rushCard(){
  const c=document.createElement("div");c.className="region ar rushcard";c.style.setProperty("--c","#ff5c7a");c.style.setProperty("--bg","url(art/bg-ar-rift.webp)");
  const s=rushSaved,canStart=slots.battle.some(id=>roster[id]);
  if(s){const pend=s.pend&&RUSH&&!RUSH.done&&RUSH.pending;
    c.innerHTML=`<div class="rtop"><span class="eyebrow">Boss Rush · run in progress</span><b class="rstars"><span>Best: floor ${rushBest}</span></b></div>
      <div class="rfx">${s.pend?`Floor ${s.fl-1} cleared. Choose a reward before floor ${s.fl}.`:`Next: floor ${s.fl}.`}</div>
      <p class="rteam">${s.team.map(u=>{const m=MONSTERS.find(x=>x.id===u.id);return`<span class="${u.hp>0?"":"ko"}">${m?m.name:u.id} ${u.hp>0?Math.round(100*u.hp/u.max)+"%":"fainted"}</span>`}).join("")}</p>
      ${pend?rushOfferHTML():""}
      <div class="row">${s.pend&&!pend?'<button class="btn" data-a="go">Choose reward</button>':s.pend?"":'<button class="btn" data-a="go">Continue run</button>'}<button class="btn ghost" data-a="end">End run</button></div>`;
    if(pend)rushOfferWire(c);
    const go=c.querySelector('[data-a="go"]');if(go)go.onclick=rushResume;c.querySelector('[data-a="end"]').onclick=rushAbandon;return c}
  c.innerHTML=`<div class="rtop"><span class="eyebrow">Boss Rush</span><b class="rstars"><span>Best: floor ${rushBest}</span></b></div>
    <div class="rfx">Epic and legendary bosses, one after another. Health carries over with only 10% healing between floors, fainted creatures stay out, and every 5 floors you choose a reward. Every 2nd floor cleared earns a wildcard.</div>
    <div class="row"><button class="btn" ${canStart?"":"disabled"}>Start run</button></div>`;
  c.querySelector("button").onclick=rushStart;return c;
}
