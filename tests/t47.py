from playwright.sync_api import sync_playwright
from PIL import Image
import io,sys
p='file:///home/claude/eg/wrap.html'
W,H=[int(x) for x in (sys.argv[1] if len(sys.argv)>1 else '390x780').split('x')];out=sys.argv[2] if len(sys.argv)>2 else 'pos.png'
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(p);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(W//2,H//2);pg.wait_for_timeout(800);pg.evaluate("muted=true")
    pg.evaluate("MONSTERS.forEach(m=>roster[m.id]={star:5,dupes:0,caught:1});slots.battle=['ashroot-boar','storm-hare','tide-otter']")
    ims=[]
    for rid,boss in [('ember',0),('falls',0),('gale',0),('root',0),('hearth',0),('storm',1),('cloister',0),('void',0),('rift',1),('sanctum',0)]:
        if boss: pg.evaluate(f"startFight('{rid}',true);F.fa=1;showFoe();paintFight()")
        else: pg.evaluate(f"startFight('{rid}',false)")
        pg.wait_for_timeout(1500);ims.append(Image.open(io.BytesIO(pg.screenshot())).resize((W//2,H//2)))
    o=Image.new('RGB',(W//2*5,H//2*2))
    for i,im in enumerate(ims):o.paste(im,((i%5)*W//2,(i//5)*H//2))
    o.save(out);print(errs)
