# fresh-account progression: hatch evenly from all three eggs, auto-ascend, then find the hardest region level the best team can beat
from playwright.sync_api import sync_playwright
import os,json
JS="""async(cps)=>{
  window.__fast=true;muted=true;localStorage.clear();
  roster={};hatcher={lv:1,xp:0};for(const k in regions)regions[k]={lv:1,kills:0};evo={};
  const sleep=()=>new Promise(r=>setTimeout(r,0));
  const tierOfM=m=>m.tier||'rare';const first={};let n=0;const out=[];
  const asc=()=>{for(const id in roster){const m=MONSTERS.find(x=>x.id===id);if(m.evolvesFrom||m.fusion)continue;let r=roster[id];while(r.dupes>=costFor(r.star,m)){r.dupes-=costFor(r.star,m);r.star++}}};
  const power=id=>{const u=mkUnit(MONSTERS.find(x=>x.id===id),roster[id].star,'you');return u.max*u.atk*u.def};
  async function fightWin(rid,lv,team,N){let w=0;for(let i=0;i<N;i++){slots.battle=team;regions[rid].lv=lv;regions[rid].kills=0;startFight(rid,false);let g=0;
      while(!F.over&&g++<500){if(!F.busy){const u=chooser();pick(aiPick(u))}await sleep()}if($('resTitle').textContent!=='Defeat')w++}return w/N}
  for(const cp of cps){
    while(n<cp){for(const e of EGGS){const pool=MONSTERS.filter(m=>m.eggs.includes(e.id));const m=pickMon(pool);grant(m,e.id);
        const k=e.id+':'+tierOfM(m);if(!(k in first))first[k]=n+1}n++}
    asc();syncFusions();
    const ids=Object.keys(roster).filter(id=>!MONSTERS.find(x=>x.id===id).fusion);
    const team=ids.sort((a,b)=>power(b)-power(a)).slice(0,3);
    const row={hatchesPerEgg:cp,owned:ids.length,team:team.map(id=>id+'★'+roster[id].star).join(', '),best:{}};
    for(const rid of ['hearth','sanctum','void']){let L=0;for(const lv of [1,2,3,5,8,12,16,20,25,30]){const w=await fightWin(rid,lv,team,8);if(w>=.5)L=lv;else break}row.best[rid]=L}
    out.push(row)}
  const hatchable=MONSTERS.filter(m=>!m.evolvesFrom&&!m.fusion).length;
  return {first,out,hatchable}}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.path.abspath('wrap.html'));pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(500)
    r=pg.evaluate(JS,[50,200,1000,3000,10000])
    print(json.dumps(r,indent=1));print(errs[:3]);b.close()
