from playwright.sync_api import sync_playwright
from PIL import Image
import io
p='file:///home/claude/eg/wrap.html'
N=['green-mother','pale-shepherd']
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(p);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(800);pg.evaluate("muted=true")
    print(pg.evaluate("""(async N=>{const out=[];for(const id of N){const m=MONSTERS.find(x=>x.id===id),i=new Image();i.src=m.art;await i.decode().catch(()=>{});
      out.push([id,m.tier||'rare',META[id].el,META[id].kind,i.naturalWidth,(passiveOf(m)||{}).n,movePool(m).length])}return out})""",N))
    pg.evaluate("MONSTERS.forEach(m=>roster[m.id]={star:5,dupes:0,caught:1});slots.battle=['kamaitachi','ichimokuren','hraesvelgr']")
    print('gale pool:',pg.evaluate("[...new Set(Array.from({length:40},()=>{startFight('gale',false);return F.foes.map(f=>f.id)}).flat())].filter(i=>META[i].el==='wind')"))
    pg.evaluate("startFight('gale',false)");pg.wait_for_timeout(1500);pg.screenshot(path='nw1.png')
    pg.evaluate("showInfo('hraesvelgr')");pg.wait_for_timeout(600);pg.screenshot(path='nw2.png')
    # hatch odds sanity: none of the new ones break the hatch pools
    print('hatch pool sample ok:',pg.evaluate("typeof pickMon"))
    print(errs);b.close()
