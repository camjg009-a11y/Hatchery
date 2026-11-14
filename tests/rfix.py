from playwright.sync_api import sync_playwright
import os,sys
teams=[("mid ★5",['star-eater-whale','toll-keeper','taotie'],5),("strong ★10",['star-eater-whale','toll-keeper','pale-shepherd'],10),("endgame ★15",['star-eater-whale','toll-keeper','pale-shepherd'],15)]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto('file://'+os.path.abspath('wrap.html'));pg.evaluate("localStorage.setItem('hatchery-tips',JSON.stringify(Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))))");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(600)
    pg.evaluate("window.__fast=true;muted=true")
    for L in [int(x) for x in sys.argv[1].split(',')]:
      for name,team,star in teams:
        res=pg.evaluate("""async([L,team,star])=>{hatcher.lv=40;roster={};team.forEach(id=>roster[id]={star,dupes:0,caught:1});slots.battle=team;const out={};
          for(const k of ['month','year']){raids={};const s=raidState(k);let dm=[];for(let i=0;i<2;i++){raids[k]=Object.assign({},s);raidFight(k);let g=0;while(!F.over&&g++<4000){if(!F.busy){const u=chooser();pick(aiPick(u))}await new Promise(r=>setTimeout(r,0))}
              const bo=F.foes.find(f=>!f.isEgg),eg=F.foes.find(f=>f.isEgg);dm.push(F.start-(Math.max(0,eg?eg.hp:0)+(bo.barsLeft-1)*bo.barHp+Math.max(0,bo.hp)))}
            const avg=dm.reduce((a,c)=>a+c,0)/dm.length;out[k]=[Math.round(s.barHp),avg>0?(s.barHp/avg).toFixed(2):'inf']}raids={};return out}""",[L,team,star])
        print(f"L{L} {name}: month barHp {res['month'][0]} attempts/bar {res['month'][1]} | year barHp {res['year'][0]} attempts/bar {res['year'][1]}")
    print(e[:3]);b.close()
