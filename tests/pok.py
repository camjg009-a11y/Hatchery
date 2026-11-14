from playwright.sync_api import sync_playwright
import os,sys,json
N=int(sys.argv[1]);boss=sys.argv[2]=='boss'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto('file://'+os.path.abspath('wrap.html'));pg.evaluate("localStorage.setItem('hatchery-tips',JSON.stringify(Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))))");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(600)
    r=pg.evaluate("""async([N,bb])=>{const boss=bb[0];return (async()=>{window.__fast=true;muted=true;PW_BACT=boss[1];const regs=Object.keys(REGION);const out=[];const base=MONSTERS.filter(m=>!m.fusion);
      for(let n=0;n<N;n++){const star=1+Math.floor(Math.random()*15);hatcher.lv=1+Math.floor(Math.random()*30);roster={};const t=[];while(t.length<3){const m=base[Math.floor(Math.random()*base.length)];if(!t.includes(m.id))t.push(m.id)}
        t.forEach(id=>roster[id]={star,dupes:0,caught:1});slots.battle=t;const rid=regs[Math.floor(Math.random()*regs.length)];
        const tp=teamPower(t,rid);let L=1;while(L<40&&enemyPower(rid,L+1,boss)<tp*(0.4+Math.random()*1.4))L++;
        regions[rid].lv=L;regions[rid].pick=L;regions[rid].kills=999;const ep=enemyPower(rid,L,boss);startFight(rid,boss);let g=0;
        while(!F.over&&g++<3000){if(!F.busy){const u=chooser();if(!u)break;pick(bestMove(u))}await new Promise(r=>setTimeout(r,0))}
        out.push([tp/ep,F.won?1:0,realmsOf(MONSTERS.find(m=>m.id===t[0]))[0]])}
      return out})()}""",[N,[boss,float(sys.argv[3]) if len(sys.argv)>3 else 1]])
    json.dump(r,open(f'/tmp/pok_{sys.argv[2]}.json','w'));print(len(r),e[:3]);b.close()
