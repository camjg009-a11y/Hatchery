from playwright.sync_api import sync_playwright
import os,json,sys
JS="""async([teams,star,arenas,levels,N])=>{window.__fast=true;muted=true;const sleep=()=>new Promise(r=>setTimeout(r,0));
  MONSTERS.forEach(m=>roster[m.id]={star,dupes:0,caught:1});const out={};
  for(const [name,team] of teams){out[name]={};for(const rid of arenas){let best=0;
    for(const lv of levels){let w=0;for(let i=0;i<N;i++){slots.battle=team;regions[rid].lv=lv;regions[rid].kills=0;startFight(rid,false);let g=0;
        while(!F.over&&g++<600){if(!F.busy){const u=chooser();pick(aiPick(u))}await sleep()}if($('resTitle').textContent!=='Defeat')w++}
      if(w/N>=.5)best=lv;else break}
    out[name][rid]=best}}return out}"""
teams=[["Primal epics",["hraesvelgr","tempest","ashen-phoenix"]],["Primal w/ legendaries",["green-mother","world-tortoise","hraesvelgr"]],
       ["Sanctum epics",["ophanim","lumen","seraph-moth"]],["Sanctum w/ legendaries",["toll-keeper","radiant-qilin","ophanim"]],
       ["Void epics",["taotie","dusk-moth","tsuchigumo"]],["Void w/ legendaries",["pale-shepherd","star-eater-whale","taotie"]]]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844});e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto('file://'+os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'wrap.html'));pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(400)
    r=pg.evaluate(JS,[teams,4,["ember","sanctum","void"],[1,3,5,8,10,12,14,16,20,25],8])
    for k,v in r.items():print(f"{k:24s} Primal(Ember) {v['ember']:>3}   Sanctum {v['sanctum']:>3}   Void {v['void']:>3}")
    print(e[:3]);b.close()
