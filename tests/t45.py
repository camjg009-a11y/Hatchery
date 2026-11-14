from playwright.sync_api import sync_playwright
p='file:///home/claude/eg/wrap.html'
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(p);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(800);pg.evaluate("muted=true")
    pg.evaluate("MONSTERS.forEach(m=>roster[m.id]={star:15,dupes:0,caught:1});slots.battle=['ashen-phoenix','tempest','undertow'];view('regions')");pg.wait_for_timeout(1200)
    pg.screenshot(path='r1.png')
    pg.click('.rushcard button');pg.wait_for_timeout(700);pg.screenshot(path='r2.png')
    # jump to floor 5 with a mutated boss and win it to see the reward pick
    pg.evaluate("RUSH.floor=5;rushFight()");pg.wait_for_timeout(2200);pg.screenshot(path='r3.png')
    pg.evaluate("RUSH.team[1].hp=0;curFoe().hp=1;F.over=false");pg.evaluate("endFight(true)");pg.wait_for_timeout(900);pg.screenshot(path='r4.png')
    pg.click('#resBody .buff');pg.wait_for_timeout(900)
    pg.evaluate("F.team.forEach(c=>c.hp=0);endFight(false)");pg.wait_for_timeout(600);pg.screenshot(path='r5.png')
    print('errors',errs);b.close()
