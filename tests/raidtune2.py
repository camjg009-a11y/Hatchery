from playwright.sync_api import sync_playwright
import os,sys,json
a,bb=float(sys.argv[1]),float(sys.argv[2]);runs=int(sys.argv[3]) if len(sys.argv)>3 else 2
cases=[(10,['toll-keeper','star-eater-whale','pale-shepherd'],1),(10,['taotie','ophanim','hraesvelgr'],1),(16,['star-eater-whale','toll-keeper','taotie'],3),(22,['star-eater-whale','toll-keeper','taotie'],4),(28,['star-eater-whale','toll-keeper','pale-shepherd'],5)]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});e=[];pg.on('pageerror',lambda x:e.append(str(x)+' @ '+str(x.stack)[:600]))
    pg.goto('file://'+os.path.abspath('wrap.html'));pg.evaluate("localStorage.setItem('hatchery-tips',JSON.stringify(Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))))");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(600)
    pg.evaluate(f"window.__fast=true;muted=true;RAIDCURVE.a={a};RAIDCURVE.b={bb}")
    for H,team,star in cases:
        res=pg.evaluate("""async([H,team,star,runs])=>{hatcher.lv=H;raids={};roster={};team.forEach(id=>roster[id]={star,dupes:0,caught:1});slots.battle=team;const out={};
          for(const k of ['day','week','month','year']){const s=raidState(k);const tot=s.eggHp+s.hp;let dm=[];for(let i=0;i<runs;i++){raids[k]=Object.assign({},s);raidFight(k);let g=0;while(!F.over&&g++<4000){if(!F.busy){const u=chooser();pick(bestMove(u))}await new Promise(r=>setTimeout(r,0))}
              const bo=F.foes.find(f=>!f.isEgg),eg=F.foes.find(f=>f.isEgg);dm.push(F.start-(Math.max(0,eg?eg.hp:0)+(bo.barsLeft-1)*bo.barHp+Math.max(0,bo.hp)))}
            const avg=dm.reduce((a,c)=>a+c,0)/dm.length;out[k]=avg>0?(tot/avg).toFixed(1):'inf'}raids={};return out}""",[H,team,star,runs])
        print(f"H{H} ★{star} L{pg.evaluate(f'raidLevel({H})')}: day {res['day']} / week {res['week']} / month {res['month']} / year {res['year']}")
    print(e[:3]);b.close()
