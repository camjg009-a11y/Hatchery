from playwright.sync_api import sync_playwright
from PIL import Image
import io
p='file:///home/claude/eg/wrap.html'
K=["fireBolt","fireRing","firePillar","waterOrb","waterRain","waterWave","bubbles","mend","zap","field","storm","sky","blade","windRing","tornado","tail","rocks","vines","quake","skin","beam","flash","column","shadeOrb","sigil","eclipse","pulse","boost","roar","bite","slash","rush","dive","ward","brace","venom","web","coil","drain","charge"]
EL={"fire":"fireBolt fireRing firePillar","water":"waterOrb waterRain waterWave bubbles","lightning":"zap field storm sky","wind":"blade windRing tornado tail","earth":"rocks vines quake skin","light":"beam flash column","shadow":"shadeOrb sigil eclipse"}
def el(k):
    for e,v in EL.items():
        if k in v.split():return e
    return "none"
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(p);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(900);pg.evaluate("muted=true")
    pg.evaluate("MONSTERS.forEach(m=>roster[m.id]={star:5,dupes:0,caught:1});slots.battle=['ashroot-boar','storm-hare','tide-otter'];startFight('hearth',false)");pg.wait_for_timeout(1500)
    tiles=[]
    for k in K:
        e=el(k);row=[]
        for i,ms in enumerate([180,420]):
            if i==0: pg.evaluate(f"(()=>{{const u=F.team[F.active],t=curFoe(),A=vpos(u),B=vpos(t);FX['{k}'](A,B,PAL['{e}'],u,t,{{n:'x',el:'{e}',sAtk:1.3}})}})()")
            pg.wait_for_timeout(ms if i==0 else ms-180)
            im=Image.open(io.BytesIO(pg.screenshot())).crop((0,110,390,600)).resize((195,245));row.append(im)
        pg.wait_for_timeout(900)
        tiles.append((k,row))
    print('errors',errs);b.close()
from PIL import ImageDraw
cols=10;rows=(len(tiles)+cols-1)//cols
o=Image.new('RGB',(cols*195,rows*2*245),'black');d=ImageDraw.Draw(o)
for i,(k,row) in enumerate(tiles):
    x=(i%cols)*195;y=(i//cols)*490
    o.paste(row[0],(x,y));o.paste(row[1],(x,y+245));d.text((x+4,y+4),k,fill='yellow')
o.save('fx_all.png');print(o.size)
