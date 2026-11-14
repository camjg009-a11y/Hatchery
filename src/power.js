// ---- Power: one number for how strong a creature, a team or a Hatcher is. Every part of it is shown on the Power screen. ----
// Creature power = (Attack x2 + Health /6 + Defense /2), +20% if it has a passive.
// The weights come from simulated fights: Attack decided most fights, Health next, Defense a little; Speed barely changed who won.
const PW={atk:2,hp:6,def:2,pas:.2},PW_OK=1,PW_BOSS=.8; // PW_OK: at equal power you win about 3 fights in 4. PW_BOSS: bosses lost more often than their raw power said, so they count at 80% // PW_OK: team power needed per point of enemy power to be favoured (from simulated fights)
const PW_CK={arena:.03,rush:5000,raid:{day:1000,week:5000,month:25000,year:150000},set:10000,face:5000,final:50000}; // Hatcher power checkpoints
let raidWins={day:0,week:0,month:0,year:0};try{raidWins=Object.assign(raidWins,JSON.parse(localStorage.getItem("hatchery-raidwins")||"{}"))}catch(e){}
function statPower(s,pas,acts){const a=s.atk*(acts||1);return Math.round((PW.atk*a+s.hp/PW.hp+s.def/PW.def)*(pas?1+PW.pas:1))}
function unitPower(u,acts){return statPower({atk:u.atk*(u.fb?u.fb.atk:1),hp:u.max,def:u.def*(u.fb?u.fb.def:1)},!!u.pas,acts)}
function creatureUnit(id){const m=MONSTERS.find(x=>x.id===id);return roster[id]&&m?mkUnit(m,roster[id].star,"you"):null}
function creaturePower(id){const u=creatureUnit(id);return u?unitPower(u):0}
function creatureParts(id){const u=creatureUnit(id);if(!u)return null;const a=PW.atk*u.atk,h=u.max/PW.hp,d=u.def/PW.def,sub=a+h+d;
  return{u,a,h,d,sub,pas:u.pas?u.pas.n||"Passive":null,total:unitPower(u)}}
// team power: each creature's power with the team's bonds applied (realm and kind bonds raise Attack and Defense; element bonds raise that element's damage)
function teamParts(ids,rid){ids=(ids||slots.battle).filter(id=>roster[id]);const us=ids.map(creatureUnit).filter(Boolean);if(!us.length)return{rows:[],lines:[],base:0,total:0};
  const base=us.reduce((a,u)=>a+unitPower(u),0),bd=teamBonds(us,rid||null);
  const rows=us.map(u=>{const plain=statPower({atk:u.atk,hp:u.max,def:u.def},!!u.pas),eb=bd.elB[u.el]||0,bonded=statPower({atk:u.atk*u.fb.atk*(1+eb),hp:u.max,def:u.def*u.fb.def},!!u.pas);return{u,plain,bonded}});
  return{rows,lines:bd.lines,base,total:rows.reduce((a,r)=>a+r.bonded,0)}}
const teamPower=(ids,rid)=>teamParts(ids,rid).total;
// enemy power for an arena level: the realm's usual foes at that level (3 of them), or the boss and its egg at 80%
const EP_MEMO={};function enemyPower(rid,L,boss){const key=rid+L+(boss?'b':'');if(boss&&EP_MEMO[key])return EP_MEMO[key];const G=REGION[rid],all=MONSTERS.filter(m=>m.eggs.includes(G.realm)&&!m.evolvesFrom);
  if(boss){const pool=all.filter(m=>m.tier==="epic"||m.tier==="legendary");const avg=pool.reduce((a,m)=>{const b=mkUnit(m,1,"foe",foeScale(L,true));const e=mkEgg(rid,b);return a+unitPower(b)+unitPower(e)},0)/pool.length;return EP_MEMO[key]=Math.round(avg*PW_BOSS)}
  const pool=all.filter(m=>m.tier==="common"||m.tier==="uncommon"||!m.tier);return Math.round(3*pool.reduce((a,m)=>a+unitPower(mkUnit(m,1,"foe",foeScale(L,false))),0)/pool.length)}
// Hatcher power: every creature you own, plus checkpoints you have reached
function hatcherParts(){
  const owned=MONSTERS.filter(m=>roster[m.id]);const coll=owned.reduce((a,m)=>a+creaturePower(m.id),0);const ck=[];
  let ab=0,an=0;for(const rid in regions){const lv=regions[rid].lv||1;for(let L=1;L<lv;L++){ab+=PW_CK.arena*enemyPower(rid,L,true);an++}}ck.push({n:`Arena bosses beaten (${an})`,how:`${PW_CK.arena*100}% of each boss's power`,v:Math.round(ab)});
  ck.push({n:`Boss Rush best: floor ${rushBest}`,how:`${fmt(PW_CK.rush)} per floor`,v:PW_CK.rush*rushBest});
  for(const k in RAIDS)ck.push({n:`${RAIDS[k].n}es defeated (${raidWins[k]||0})`,how:`${fmt(PW_CK.raid[k])} each`,v:PW_CK.raid[k]*(raidWins[k]||0)});
  let sets=0;EGGS.forEach(e=>sets+=setInfo(e.id).done||0);ck.push({n:`Rarity sets completed (${sets})`,how:`${fmt(PW_CK.set)} each`,v:PW_CK.set*sets});
  const faces=MONSTERS.filter(m=>m.branch&&roster[m.id]).length,fin=MONSTERS.filter(m=>m.final&&roster[m.id]).length;
  if(MONSTERS.some(m=>m.branch))ck.push({n:`Mask faces taken (${faces})`,how:`${fmt(PW_CK.face)} each, ${fmt(PW_CK.final)} for the final form`,v:PW_CK.face*faces+PW_CK.final*fin});
  const ckt=ck.reduce((a,c)=>a+c.v,0);return{owned:owned.length,coll,ck,ckt,total:coll+ckt}}
const hatcherPower=()=>hatcherParts().total;
function saveRaidWins(){try{localStorage.setItem("hatchery-raidwins",JSON.stringify(raidWins))}catch(e){}}

// ---- the Power screen ----
function openPower(focus){const box=$("powerBody");if(!box)return;const H=hatcherParts(),T=teamParts();
  const row=(a,b,c)=>`<tr><td>${a}</td><td>${b||""}</td><td>${c}</td></tr>`;
  let html="";
  if(focus&&roster[focus]){const c=creatureParts(focus);html+=`<h3>${c.u.m.name} · ★ ${roster[focus].star}</h3><table class="ptab">
    ${row("Attack",`${fmt(Math.round(c.u.atk))} × ${PW.atk}`,fmt(Math.round(c.a)))}${row("Health",`${fmt(c.u.max)} ÷ ${PW.hp}`,fmt(Math.round(c.h)))}${row("Defense",`${fmt(Math.round(c.u.def))} ÷ ${PW.def}`,fmt(Math.round(c.d)))}
    ${row("Subtotal","",fmt(Math.round(c.sub)))}${row("Passive",c.pas?`${c.pas}: +${PW.pas*100}%`:"none",c.pas?"× "+(1+PW.pas):"× 1")}<tr class="tot"><td>Power</td><td></td><td>${fmt(c.total)}</td></tr></table>
    <p class="pnote">These are the creature's real fighting stats: its stars, your Hatcher level, completed sets${c.u.m.evolvesFrom?` and the +${Math.round((EVO_BUFF-1)*100)}% evolved-form bonus`:""} are already in them.</p>`}
  html+=`<h3>Team power · ${fmt(T.total)}</h3>`+(T.rows.length?`<table class="ptab">${T.rows.map(r=>row(r.u.m.name,r.bonded!==r.plain?`${fmt(r.plain)} before bonds`:"",fmt(r.bonded))).join("")}
    <tr class="tot"><td>Team</td><td>${T.total!==T.base?`${fmt(T.base)} before bonds`:""}</td><td>${fmt(T.total)}</td></tr></table>
    <p class="pnote">${T.lines.length?"Bonds: "+T.lines.join(" · ")+". ":""}Realm and kind bonds raise Attack and Defense; element bonds raise that element's damage, counted here as Attack. Home field is added on an arena's own card, because it depends on where you fight.</p>`:`<p class="pnote">No battle team yet.</p>`);
  html+=`<h3>Hatcher power · ${fmt(H.total)}</h3><table class="ptab">${row(`Every creature you own (${H.owned})`,"sum of their power",fmt(H.coll))}
    ${H.ck.map(c=>row(c.n,c.how,fmt(c.v))).join("")}<tr class="tot"><td>Hatcher power</td><td></td><td>${fmt(H.total)}</td></tr></table>`;
  html+=`<h3>How it's worked out</h3><ul class="pnote"><li><b>Creature power</b> = Attack × ${PW.atk} + Health ÷ ${PW.hp} + Defense ÷ ${PW.def}, then +${PW.pas*100}% if it has a passive.</li>
    <li>The weights come from thousands of simulated fights: Attack decided the most, Health came next, Defense a little. Speed barely changed who won, so it isn't counted.</li>
    <li><b>Team power</b> adds up your three creatures with their bonds applied.</li>
    <li><b>Enemy power</b> on arena cards uses the same formula on the foes you'll meet at that level. Bosses count at ${PW_BOSS*100}%: in testing, a boss with the same power as your team lost more often than regular foes did, so this lines the numbers up.</li><li>When your team's power matches the enemy's, you won about 3 fights in 4 in testing. Your number shows green when you're at or above the enemy, orange when below.</li>
    <li><b>Hatcher power</b> adds every creature you own, plus a bonus for each checkpoint above. Checkpoints never go away once reached.</li></ul>`;
  box.innerHTML=html;$("power").hidden=false;box.parentElement.scrollTop=0}
