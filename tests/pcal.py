# measures each creature's solo fighting strength: foe HP removed in one fight vs a hard arena, averaged
from playwright.sync_api import sync_playwright
import os,sys,json
star=int(sys.argv[1]);L=int(sys.argv[2]);N=int(sys.argv[3])
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto('file://'+os.path.abspath('wrap.html'));pg.evaluate("localStorage.setItem('hatchery-tips',JSON.stringify(Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))))");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(600)
    r=pg.evaluate("""async([star,L,N])=>{window.__fast=true;muted=true;hatcher.lv=1;const regs=['hearth','ember','falls','storm','gale','root','sanctum','cloister','void','rift'];const out={};
      for(const m of MONSTERS){roster={};roster[m.id]={star,dupes:0,caught:1};slots.battle=[m.id];let tot=0;
        for(let n=0;n<N;n++){const rid=regs[n%regs.length];regions[rid].lv=L;regions[rid].pick=L;startFight(rid);const start=F.foes.reduce((a,f)=>a+f.max,0);let g=0;
          while(!F.over&&g++<3000){if(!F.busy){const u=chooser();if(!u)break;pick(bestMove(u))}await new Promise(r=>setTimeout(r,0))}
          tot+=F.foes.reduce((a,f)=>a+(f.max-Math.max(0,f.hp)),0)/start}
        const u=mkUnit(m,star,'you');out[m.id]={s:tot/N,hp:u.max,atk:u.atk,def:u.def,spd:u.spd,pas:passiveOf(m)?passiveOf(m).k:null,tier:m.tier||'common',realm:realmsOf(m)[0],evo:!!m.evolvesFrom}}
      return out}""",[star,L,N])
    json.dump(r,open(f'/tmp/pcal_{star}_{L}.json','w'));print('done',len(r),e[:3]);b.close()
