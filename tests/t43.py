from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
import io,sys
p='file:///home/claude/eg/wrap.html'
K=sys.argv[1].split(',');T=[int(x) for x in sys.argv[2].split(',')];out=sys.argv[3]
EL={"fire":"fireBolt fireRing firePillar","water":"waterOrb waterRain waterWave bubbles","lightning":"zap field storm sky","wind":"blade windRing tornado tail","earth":"rocks vines quake skin","light":"beam flash column blessing","shadow":"shadeOrb sigil eclipse"}
def el(k):
    for e,v in EL.items():
        if k in v.split():return e
    return "none"
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(p);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(900);pg.evaluate("muted=true")
    pg.evaluate("MONSTERS.forEach(m=>roster[m.id]={star:5,dupes:0,caught:1});slots.battle=['ashroot-boar','storm-hare','tide-otter'];startFight('hearth',false)");pg.wait_for_timeout(1500)
    pg.wait_for_function("Object.values(FXA).every(i=>i.complete)",timeout=20000)
    tiles=[]
    for k in K:
        e=el(k);row=[];last=0
        if k.startswith('combo:'):pg.evaluate(f"vCombo(curFoe(),'{k[6:]}')")
        elif k.startswith('st:'):pg.evaluate(f"vStatus(curFoe(),'{k[3:]}')")
        else:pg.evaluate(f"(()=>{{const u=F.team[F.active],t=curFoe(),A=vpos(u),B=vpos(t);FX['{k}'](A,B,PAL['{e}'],u,t,{{n:'x',el:'{e}',sAtk:1.3}})}})()")
        for ms in T:
            pg.wait_for_timeout(ms-last);last=ms
            row.append(Image.open(io.BytesIO(pg.screenshot())).crop((0,110,390,600)).resize((234,294)))
        pg.wait_for_timeout(1200);tiles.append((k,row))
    print('errors',errs);b.close()
n=len(T);o=Image.new('RGB',(len(tiles)*234,n*294));d=ImageDraw.Draw(o)
for i,(k,row) in enumerate(tiles):
    for j,im in enumerate(row):o.paste(im,(i*234,j*294))
    d.text((i*234+4,4),k,fill='yellow')
o.save(out);print(o.size)
