from playwright.sync_api import sync_playwright
p='file:///home/claude/eg/wrap.html'
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)+' @ '+str(e.stack)[:300]))
    def boot(clear=False):
        if clear:pg.goto(p);pg.evaluate("localStorage.clear()")
        pg.goto(p);pg.evaluate("localStorage.setItem('hatchery-tips',JSON.stringify(Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))))");pg.goto(p);pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(600);pg.evaluate("muted=true;window.__fast=true")
    boot(True)
    pg.evaluate("MONSTERS.forEach(m=>roster[m.id]={star:15,dupes:0,caught:1});slots.battle=['ashen-phoenix','tempest','undertow'];saveProg();saveBattle();view('regions');rushStart()")
    print('start',pg.evaluate("[RUSH.floor,F.foes[0].m.name,JSON.stringify(rushSaved&&rushSaved.cur)]"))
    pg.evaluate("RUSH.team[0].hp=Math.round(RUSH.team[0].max*.5);curFoe().hp=0;endFight(true)")
    print('after win1 wild',pg.evaluate("JSON.stringify(wild)"),'saved fl',pg.evaluate("rushSaved.fl"))
    boot()
    print('reload: card text:',pg.evaluate("battleTab='rush';view('regions');document.querySelector('.rushcard').innerText.replace(/\\n+/g,' | ')"))
    pg.click('.rushcard [data-a=go]');pg.wait_for_timeout(300)
    print('resumed floor',pg.evaluate("[F.floor,Math.round(100*RUSH.team[0].hp/RUSH.team[0].max)]"))
    pg.evaluate("curFoe().hp=0;endFight(true)")  # floor 2 -> wildcard
    print('wild after floor2',pg.evaluate("JSON.stringify(wild)"),'local wild',pg.evaluate("localStorage.getItem('hatchery-wild')"))
    pg.evaluate("RUSH.floor=5;RUSH.next=false;rushFight();curFoe().hp=0;endFight(true)")
    print('pending',pg.evaluate("[RUSH.pending,JSON.stringify(RUSH.offer),rushSaved.pend,rushSaved.fl]"))
    offer=pg.evaluate("RUSH.offer[0]")
    boot()
    print('reload card:',pg.evaluate("battleTab='rush';view('regions');document.querySelector('.rushcard').innerText.replace(/\\n+/g,' | ')"))
    pg.click('.rushcard [data-a=go]');pg.wait_for_timeout(300)
    print('offer same after reload:',pg.evaluate("RUSH.offer[0]")==offer,'buttons',pg.evaluate("document.querySelectorAll('.rushcard .buff').length"))
    pg.click('.rushcard .buff');pg.wait_for_timeout(300)
    print('after pick floor',pg.evaluate("[F.floor,JSON.stringify(RUSH.buffs)]"))
    # mid-fight close: same boss on resume
    boss=pg.evaluate("F.foes[0].m.name");boot();pg.evaluate("battleTab='rush';view('regions')");pg.click('.rushcard [data-a=go]');pg.wait_for_timeout(300)
    print('same boss after mid-fight reload:',pg.evaluate("F.foes[0].m.name")==boss)
    pg.evaluate("F.team.forEach(c=>c.hp=0);endFight(false)")
    print('after loss saved run:',pg.evaluate("rushSaved"),'best',pg.evaluate("rushBest"))
    boot();print('card after loss:',pg.evaluate("battleTab='rush';view('regions');document.querySelector('.rushcard').innerText.split('\\n')[0]"))
    # cloud merge rules
    print('merge newer run adopted:',pg.evaluate("(()=>{const r={fl:9,cl:8,L:1,buffs:[],wild:{},order:Object.keys(REGION),team:[{id:'tempest',hp:10,max:20,atk:5,def:5,spd:5}],t:Date.now()+1000};mergeSave({rush:{best:20,ended:0,run:r}});return [rushBest,rushSaved&&rushSaved.fl]})()"))
    print('merge old run ignored:',pg.evaluate("(()=>{rushSaved=null;rushEnded=Date.now();mergeSave({rush:{best:1,ended:0,run:{fl:3,t:Date.now()-99999,team:[]}}});return rushSaved})()"))
    print('errors',errs);b.close()
