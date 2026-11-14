from playwright.sync_api import sync_playwright
import time
p='file:///home/claude/eg/wrap.html'
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(p);pg.evaluate("localStorage.setItem('hatchery-tips',JSON.stringify(Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))))");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(700)
    pg.evaluate("muted=true;MONSTERS.forEach(m=>roster[m.id]={star:12,dupes:0,caught:1});hatcher.lv=20;slots.battle=MONSTERS.filter(m=>m.tier==='legendary'&&!m.evolvesFrom).slice(0,3).map(m=>m.id)")
    def run(label,startjs,spd):
        pg.evaluate("SPD=1;AUTO=false;paintAuto()");pg.evaluate(startjs);pg.wait_for_timeout(400)
        0 and print(label,errs[-2:],pg.evaluate("$('toast')&&$('toast').textContent"),pg.evaluate("JSON.stringify({fight:$('fight').hidden,guide:$('guide').hidden})"));pg.evaluate("$('guide').hidden||$('gOk').click()");pg.click('#autoBtn');t=time.time()
        if spd==2:pg.click('#spdBtn')
        try:pg.wait_for_function("F&&F.over",timeout=240000)
        except Exception as e:print(label,'TIMEOUT',pg.evaluate("JSON.stringify({busy:F.busy,over:F.over,ch:F.ch,act:F.active,hp:F.team.map(c=>c.hp)})"));return
        print(label,'spd',pg.evaluate("SPD"),'auto',pg.evaluate("AUTO"),'secs',round(time.time()-t,1),'title',pg.evaluate("$('resTitle').textContent"))
        pg.evaluate("AUTO=false;SPD=1;paintAuto();document.querySelector('#resBody button, #resOk, .resbtn')&&0")
    rid=pg.evaluate("Object.keys(regions)[0]")
    for i in range(3):
        run('arena 1x',f"startFight('{rid}')",1)
        run('arena 2x',f"startFight('{rid}')",2)
    run('raid 2x',"raidFight('day')",2)
    run('rush 2x',"rushStart()",2)
    print('errors',errs[:5]);b.close()
