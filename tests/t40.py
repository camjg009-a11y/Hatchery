from playwright.sync_api import sync_playwright
p='file:///home/claude/eg/wrap.html'
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto(p);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(900);pg.evaluate("muted=true")
    pg.evaluate("MONSTERS.forEach(m=>roster[m.id]={star:5,dupes:0,caught:1});slots.battle=['ashroot-boar','storm-hare','tide-otter'];view('regions')");pg.wait_for_timeout(1500)
    pg.screenshot(path='rg1.png');pg.evaluate("$('regionList').scrollTop=9999");pg.wait_for_timeout(300);pg.screenshot(path='rg2.png')
    for rid in ['ember','storm','cloister','rift']:
        pg.evaluate(f"startFight('{rid}',false)");pg.wait_for_timeout(1800);pg.screenshot(path=f'ar_{rid}.png')
        print(rid,pg.evaluate("F.foes.map(f=>f.m.name+':'+f.el).join(', ')"))
    print('errors',errs);b.close()
