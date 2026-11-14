# clutch economy: simulate a player day by day with the real systems (taps, arenas, raids, Boss Rush), counting clutches by source
# usage: clutch.py DAYS TAPS_PER_EGG ARENA_FIGHTS label
from playwright.sync_api import sync_playwright
import os,sys,json
DAYS,TAPS,FIGHTS,label=int(sys.argv[1]),int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
JS=r"""async([DAYS,TAPS,FIGHTS])=>{
  window.__fast=true;muted=true;
  const RD=Date;let OFF=0;window.Date=class extends RD{constructor(...a){if(a.length)super(...a);else super(RD.now()+OFF)}static now(){return RD.now()+OFF}};
  roster={};hatcher={lv:1,xp:0};for(const k in regions)regions[k]={lv:1,kills:0};evo={};raids={};clutch={hearth:0,sanctum:0,void:0};rushBest=0;wild={};
  for(const k in raidWins)raidWins[k]=0;
  const sleep=()=>new Promise(r=>setTimeout(r,0));
  const src={boss:0,rush:0,raid:0};let tapH=0,cluH=0;const log=[];
  const legIds=MONSTERS.filter(m=>m.tier==='legendary'&&!m.evolvesFrom&&!m.fusion).map(m=>m.id),hatchable=MONSTERS.filter(m=>!m.evolvesFrom&&!m.fusion).length;
  const asc=()=>{for(const id in roster){const m=MONSTERS.find(x=>x.id===id);if(!m||m.evolvesFrom||m.fusion)continue;const r=roster[id];while(r.dupes>=costFor(r.star,m)){r.dupes-=costFor(r.star,m);r.star++}}};
  const pickTeam=()=>{const ids=Object.keys(roster).filter(id=>{const m=MONSTERS.find(x=>x.id===id);return m&&!m.fusion});slots.battle=ids.sort((a,b)=>creaturePower(b)-creaturePower(a)).slice(0,3)};
  const hatch=(e,n,boost)=>{const pool=MONSTERS.filter(m=>m.eggs.includes(e));for(let i=0;i<n;i++){const m=pickMon(pool,boost);const g=grant(m,e);addXP(g.xp)}};
  const play=async()=>{let g=0;while(!F.over&&g++<3000){if(!F.busy){const u=chooser();if(!u)break;pick(bestMove(u))}await sleep()}return !!F.won};
  const before=()=>clutch.hearth+clutch.sanctum+clutch.void;
  for(let d=1;d<=DAYS;d++){OFF=(d-1)*864e5;console.log('ROW '+JSON.stringify({start:d}));
    // tap hatching
    for(const e of EGGS)hatch(e.id,TAPS,false);tapH+=TAPS*3;asc();pickTeam();
    // arenas: push the region with the lowest level; give up on a region for the day after losing to its boss twice
    const stuck={},lost={};for(let f=0;f<FIGHTS;f++){const open=Object.keys(REGION).filter(r=>!stuck[r]);if(!open.length)break;
      const rid=open.sort((a,b)=>regions[a].lv-regions[b].lv)[0],R=regions[rid];R.pick=R.lv;const boss=R.kills>=killsNeed(R.lv);
      const c0=before();startFight(rid,boss);const won=await play();src.boss+=before()-c0;
      if(!won){lost[rid]=(lost[rid]||0)+1;if(lost[rid]>=2)stuck[rid]=1}}
    // raids: fight each once, sweep the rest of today's attempts
    if(hatcher.lv>=RAID_UNLOCK)for(const k in RAIDS){const s=raidState(k);if(s.done||!raidLeft(k,s))continue;const c0=before();raidFight(k);await play();
      for(let q=0;q<10&&!raids[k].done&&raidLeft(k,raids[k])>0;q++){const t=raidLeft(k,raids[k]);raidSweep(k);if(raidLeft(k,raids[k])===t)break}src.raid+=before()-c0}
    // one Boss Rush run a day
    {const c0=before();rushStart();let g=0;while(g++<400){if(RUSH.done||!F)break;if(F.over){if(RUSH.pending){const b=document.querySelector("#resBody .buff");if(b)b.click();else break}else{if(!RUSH.team.some(c=>c.hp>0))break;rushNext()}await sleep();continue}
        await play()}src.rush+=before()-c0;rushFinish()}
    // open every clutch
    for(const e of EGGS){while(clutch[e.id]>0){clutch[e.id]--;hatch(e.id,10,true);cluH+=10}}asc();pickTeam();
    if(d===1||d%5===0){const owned=Object.keys(roster).filter(id=>{const m=MONSTERS.find(x=>x.id===id);return m&&!m.evolvesFrom&&!m.fusion}).length;
      log.push({day:d,hatcher:hatcher.lv,arenaAvg:+(Object.values(regions).reduce((a,r)=>a+r.lv,0)/10).toFixed(1),rush:rushBest,
        clutches:{...src},clutchHatches:cluH,tapHatches:tapH,clutchShare:+(cluH/(cluH+tapH)).toFixed(2),owned,of:hatchable,legendaries:legIds.filter(id=>roster[id]).length+'/'+legIds.length,
        team:slots.battle.map(id=>id+'★'+roster[id].star).join(','),teamPower:teamPower(),raidWins:{...raidWins}});console.log('ROW '+JSON.stringify(log[log.length-1]))}}
  window.Date=RD;return log}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)));pg.on('console',lambda m:(m.text.startswith('ROW ') and print(label,m.text[4:],flush=True)))
    pg.goto('file://'+os.path.abspath('wrap.html'));pg.evaluate("localStorage.setItem('hatchery-tips',JSON.stringify(Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))))");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(600)
    r=pg.evaluate(JS,[DAYS,TAPS,FIGHTS])
    json.dump(r,open(f'/tmp/clutch_{label}.json','w'))
    print('errors',e[:3]);b.close()
