
// ---- Raids: a daily, weekly, monthly and yearly boss. Each starts as an egg, has several health bars,
// and keeps its damage between attempts. After one attempt, a sweep repeats your last attempt's damage. ----
const RAID_ROUNDS=8; // turns per attempt
const RAID_UNLOCK=10; // Hatcher level needed for raids
// a typical team's strength at each Hatcher level, expressed as the arena level it can handle
// tuned with simulated teams (Hatcher 10 ≈ epics/legendaries at ★1–2, Hatcher 19 ≈ ★4, Hatcher 28 ≈ ★5) so a typical team needs about
// 2 of 3 daily attempts, 3 of 4 weekly, 4 of 5 monthly and most of the 7 yearly ones
const RAIDCURVE={a:0,b:.2};const raidLevel=H=>Math.max(1,Math.round(RAIDCURVE.a+RAIDCURVE.b*H));
const RAIDS={
  day:{n:"Daily Boss",bars:3,tries:3,mul:1.8,muts:1,wild:1,clutch:1},
  week:{n:"Weekly Boss",bars:5,tries:3,perDay:true,hpx:3.5,mul:1.4,muts:2,wild:1,clutch:2},
  // monthly and yearly don't scale: they are fixed and brutal, and their attempts refill every day
  month:{n:"Monthly Boss",bars:8,tries:5,perDay:true,fixedL:12,mul:1.9,hpx:5/3,muts:3,wild:2,clutch:4},
  year:{n:"Yearly Boss",bars:12,tries:7,perDay:true,fixedL:14,mul:2.3,hpx:3.5,muts:4,wild:3,clutch:10}
};
let raids={};try{raids=JSON.parse(localStorage.getItem("hatchery-raids")||"{}")}catch(e){}
function raidKey(k,d){d=d||new Date();const y=d.getFullYear(),m=d.getMonth()+1;
  if(k==="day")return`${y}-${m}-${d.getDate()}`;if(k==="month")return`${y}-${m}`;if(k==="year")return`${y}`;
  const s=new Date(d);s.setHours(0,0,0,0);s.setDate(s.getDate()-((s.getDay()+6)%7));return`w${s.getFullYear()}-${s.getMonth()+1}-${s.getDate()}`} // week starts Monday
function raidResetIn(k){const d=new Date(),n=new Date(d);n.setHours(0,0,0,0);
  if(k==="day")n.setDate(n.getDate()+1);else if(k==="week")n.setDate(n.getDate()+7-((n.getDay()+6)%7));else if(k==="month"){n.setDate(1);n.setMonth(n.getMonth()+1)}else{n.setMonth(0,1);n.setFullYear(n.getFullYear()+1)}
  const h=Math.max(0,(n-d)/36e5);return h>=48?`${Math.floor(h/24)} days`:h>=1?`${Math.floor(h)} h`:`${Math.ceil(h*60)} min`}
function seeded(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
// the boss, arena theme and mutations for this period are the same for every attempt (and every player)
function raidPlan(k){const key=raidKey(k),r=seeded(k+key),pool=MONSTERS.filter(m=>m.tier==="epic"||m.tier==="legendary");
  const m=pool[Math.floor(r()*pool.length)],ids=Object.keys(REGION),rid=ids[Math.floor(r()*ids.length)];
  const mk=Object.keys(MUT).slice();for(let i=mk.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[mk[i],mk[j]]=[mk[j],mk[i]]}
  return{key,m,rid,muts:mk.slice(0,RAIDS[k].muts)}}
function raidState(k){const p=raidPlan(k);let s=raids[k];
  if(!s||s.key!==p.key){const L=RAIDS[k].fixedL||raidLevel(hatcher.lv),b=raidBoss(k,p,L);s=raids[k]={key:p.key,L,barHp:b.max,hp:b.max*RAIDS[k].bars,eggHp:Math.round(b.max*.6),tries:0,done:false,broken:0,last:0,best:0,hpx:RAIDS[k].hpx||1}}
  // a boss started before its health was raised keeps the damage already done, as a share of its bars
  {const x=RAIDS[k].hpx||1;if(s.hpx===undefined)s.hpx=1;if(s.hpx!==x&&!s.done){const f=x/s.hpx;s.barHp=Math.round(s.barHp*f);s.hp=Math.round(s.hp*f);s.hpx=x}}
  return s}
function raidBoss(k,p,L){const sc=foeScale(L,true),R=RAIDS[k],b=mkUnit(p.m,1,"foe",{hp:sc.hp*R.mul*(R.hpx||1),atk:sc.atk*(.8+.2*R.mul),def:sc.def});b.boss=true;b.muts=p.muts;if(MU(b,"swift"))b.spd*=2;return b}
function raidRealm(m){return realmsOf(m)[0]}
// attempts left: weekly, monthly and yearly refill each day; the daily boss is gone by then anyway
function raidLeft(k,s){const R=RAIDS[k];if(!R.perDay)return Math.max(0,R.tries-s.tries);const d=raidKey("day");if(s.dk!==d){s.dk=d;s.du=0}return Math.max(0,R.tries-s.du)}
function raidUse(k,s){s.tries++;if(RAIDS[k].perDay){raidLeft(k,s);s.du++}}
function raidFight(k){if(hatcher.lv<RAID_UNLOCK)return toast(`Raids unlock at Hatcher level ${RAID_UNLOCK}`);const s=raidState(k),R=RAIDS[k],p=raidPlan(k);
  if(s.done)return toast(`${R.n} is already defeated. A new one comes in ${raidResetIn(k)}.`);
  if(!raidLeft(k,s))return toast(R.perDay?`No attempts left today. They refill in ${raidResetIn("day")}.`:`No attempts left. ${R.n} resets in ${raidResetIn(k)}.`);
  const ids=slots.battle.filter(id=>roster[id]);if(!ids.length)return toast("Pick a battle team first");
  const b=raidBoss(k,p,s.L);b.barHp=s.barHp;b.bars=R.bars;b.max=s.barHp;b.barsLeft=Math.max(1,Math.ceil(s.hp/s.barHp));b.hp=s.hp-(b.barsLeft-1)*s.barHp; // each bar is its own health pool
  const foes=[];if(s.eggHp>0){const e=mkEgg(p.rid,b);e.max=Math.round(s.barHp*.6);e.hp=s.eggHp;foes.push(e)}foes.push(b);
  const G=REGION[p.rid];
  F={rid:p.rid,boss:true,raid:k,lv:s.L,foes,fa:0,team:ids.map(id=>mkUnit(MONSTERS.find(x=>x.id===id),roster[id].star,"you")),active:0,ch:0,picks:[],busy:false,over:false,round:0,start:s.eggHp+s.hp};
  {const bd=teamBonds(F.team,p.rid);F.elB=bd.elB;F.bonds=bd.lines}
  setRegion(EGGS.findIndex(e=>e.id===G.realm));root.style.setProperty("--c",EGGS.find(e=>e.id===G.realm).c);setArena(G.bg,G.hz);fxPreload();
  $("field").innerHTML=(G.el?ico(G.el):ico("earth"))+`<span>${R.n} · ${G.name}</span>`;
  $("field").onclick=()=>toast(G.fx+" Boss: "+p.muts.map(x=>MUT[x].n+" ("+MUT[x].d.toLowerCase().replace(/\.$/,"")+")").join(", ")+".");
  view("fight");$("arena").classList.add("boss");$("arena").classList.remove("egging");$("fightResult").hidden=true;$("fx2").innerHTML="";
  showFoe();say(`${R.n}: ${s.eggHp>0?"break its egg, then":"keep wearing down"} ${b.m.name}. You have ${RAID_ROUNDS} turns.`);paintFight();
  F.team.forEach(enter);enter(curFoe());
  rushBanner(R.n,b.m.name);
}
// damage lands on the egg first, then the boss; each broken bar pays out
function raidApply(k,dmg){const s=raids[k],R=RAIDS[k],p=raidPlan(k),rl=raidRealm(p.m);let d=dmg;
  const e=Math.min(s.eggHp,d);s.eggHp-=e;d-=e;s.hp=Math.max(0,s.hp-d);
  const broken=R.bars-Math.ceil(s.hp/s.barHp),nb=broken-s.broken;s.broken=broken;let out=[];
  if(nb>0){wild[rl]=(wild[rl]||0)+nb*R.wild;out.push(`${nb*R.wild} ${REALMN[rl]} Wildcard${nb*R.wild>1?"s":""} for ${nb} bar${nb>1?"s":""} broken`)}
  if(s.hp<=0&&!s.done){s.done=true;raidWins[k]=(raidWins[k]||0)+1;saveRaidWins();clutch[rl]=(clutch[rl]||0)+R.clutch;out.push(`<em>${R.clutch} ${EGGS.find(x=>x.id===rl).name} Clutch${R.clutch>1?"es":""}</em> for defeating it`)}
  return out}
function raidEnd(won){const k=F.raid,s=raids[k],R=RAIDS[k];
  const egg=F.foes.find(f=>f.isEgg),b=F.foes.find(f=>!f.isEgg),now=Math.max(0,egg?egg.hp:0)+(b.barsLeft-1)*b.barHp+Math.max(0,b.hp),dmg=Math.max(0,Math.round(F.start-now));
  raidUse(k,s);s.last=dmg;s.fd=raidKey("day");s.best=Math.max(s.best||0,dmg);const out=raidApply(k,dmg);saveBattle();saveProg();
  const box=$("fightResult");box.hidden=false;
  $("resTitle").textContent=s.done?`${R.n} defeated`:won?"Attempt over":F.team.some(c=>c.hp>0)?"Time's up":"Your team fell";
  $("resBody").innerHTML=`<p>You dealt <b>${fmt(dmg)}</b> damage.</p>${out.map(x=>`<p>${x}</p>`).join("")}
    <p><small>${s.done?`A new ${R.n.toLowerCase()} arrives in ${raidResetIn(k)}.`:`Bars left: ${Math.ceil(s.hp/s.barHp)} of ${R.bars} · attempts left${R.perDay?" today":""}: ${raidLeft(k,s)}`}</small></p>
    ${!s.done&&raidLeft(k,s)?`<p><small>You can also sweep from the Raids tab to repeat this attempt's damage.</small></p>`:""}`;
  $("resAgain").hidden=s.done||!raidLeft(k,s);$("resAgain").textContent="Attack again";$("resBack").textContent="Raids";battleTab="raids";
  if(!muted&&audio())[392,523,659].forEach((n,i)=>tone("sine",n,n,.5,.05,i*.08));
}
function raidSweep(k){if(hatcher.lv<RAID_UNLOCK)return;const s=raidState(k),R=RAIDS[k];
  if(s.done||!raidLeft(k,s)||!s.last)return;if(s.fd!==raidKey("day"))return toast(`Fight the ${R.n.toLowerCase()} once today to unlock sweeping`);raidUse(k,s);const out=raidApply(k,s.last);saveBattle();saveProg();
  toast(`Swept ${R.n}: ${fmt(s.last)} damage`+(out.length?" · "+out.join(" · ").replace(/<[^>]+>/g,""):""));renderRegions()}
function raidCards(list,team){
  if(hatcher.lv<RAID_UNLOCK){const c=document.createElement("div");c.className="region ar raid";c.style.setProperty("--c","#8a8098");c.style.setProperty("--bg","url(art/bg-ar-rift.webp)");
    c.innerHTML=`<div class="rtop"><span class="eyebrow">Raids locked</span><b class="rstars"><span>Hatcher ${hatcher.lv} / ${RAID_UNLOCK}</span></b></div><div class="rfx">Reach Hatcher level ${RAID_UNLOCK} to face the daily, weekly, monthly and yearly bosses. Hatch eggs and win fights to level up.</div>
      <div class="prog"><div class="bar"><i style="width:${Math.min(100,100*hatcher.lv/RAID_UNLOCK)}%"></i></div></div>`;list.appendChild(c);return}
  for(const k in RAIDS){const R=RAIDS[k],s=raidState(k),p=raidPlan(k),G=REGION[p.rid],left=Math.ceil(s.hp/s.barHp),c=document.createElement("div");
    c.className="region ar raid";c.style.setProperty("--c",ELC[META[p.m.id].el]||"#ffd98a");c.style.setProperty("--bg",`url(${G.bg})`);
    const can=!s.done&&raidLeft(k,s)>0;
    c.innerHTML=`<div class="rtop"><span class="eyebrow">${R.n}</span><b class="rstars"><span>resets in ${raidResetIn(k)}</span></b></div>
      <div class="raidrow"><img loading="lazy" src="${p.m.art}" alt=""><div><b>${p.m.name}</b><div class="rfx">${G.name} · ${p.muts.map(x=>MUT[x].n).join(", ")}</div>
      <div class="rfx">${s.done?"Defeated":`${s.eggHp>0?"Still in its egg · ":""}${left} of ${R.bars} bars · ${R.perDay?`${raidLeft(k,s)} of ${R.tries} attempts left today`:`${raidLeft(k,s)} of ${R.tries} attempts left`}`}</div></div></div>
      <div class="bars">${Array.from({length:R.bars},(_,i)=>`<i class="${i<left?"":"gone"}"></i>`).join("")}</div>
      <div class="rfx epow">Boss power <b>${fmt(Math.round(unitPower(raidBoss(k,p,s.L))*PW_BOSS))}</b> per bar · your team <b>${fmt(teamPower(team,p.rid))}</b></div>
      <div class="rfx"><small>Each bar: ${R.wild} Wildcard${R.wild>1?"s":""} · defeat: ${R.clutch} Clutch${R.clutch>1?"es":""}</small></div>
      <div class="row"><button class="btn" data-a="go" ${can&&team.length?"":"disabled"}>Attack</button>${s.last&&can?(s.fd===raidKey("day")?`<button class="btn ghost" data-a="sw">Sweep · ${fmt(s.last)}</button>`:`<button class="btn ghost" disabled title="Fight once today to unlock sweeping">Sweep · fight once today</button>`):""}</div>`;
    c.querySelector('[data-a="go"]').onclick=()=>raidFight(k);const sw=c.querySelector('[data-a="sw"]');if(sw)sw.onclick=()=>raidSweep(k);
    list.appendChild(c)}
}
