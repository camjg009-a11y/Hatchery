from playwright.sync_api import sync_playwright
p='file:///home/claude/eg/wrap.html'
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(p);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(900);pg.evaluate("muted=true")
    pg.evaluate("MONSTERS.forEach(m=>roster[m.id]={star:9,dupes:0,caught:1});slots.battle=['ashroot-boar','storm-hare','tide-otter']")
    # field rules
    print(pg.evaluate("""(()=>{const r={};
      startFight('cloister',false);const t=curFoe(),u=F.team[0];r.cloisterCurse=applySt(t,'curse',u,1);
      startFight('hearth',false);applySt(curFoe(),'burn',F.team[0],1);r.cradleBurnTurns=curFoe().st.burn;
      startFight('ember',false);applySt(curFoe(),'burn',F.team[0],1);r.emberBurn=+(curFoe().burnDmg/(.3*eff(F.team[0],'atk'))).toFixed(2);
      startFight('falls',false);r.fallsFire=fieldMult('fire');r.fallsWater=fieldMult('water');
      startFight('sanctum',false);const v=F.team[0];v.hp=1;r.spiresHeal=heal(v,100,1);
      startFight('hearth',false);r.cradleEarth=fieldMult('earth');r.cradleLight=fieldMult('light');
      r.luck=regionLuck('hearth').total;regions.ember.lv=5;r.luck5=regionLuck('hearth').total.toFixed(3);regions.ember.lv=1;
      return JSON.stringify(r)})()"""))
    # real-time play in Stormreach
    pg.evaluate("startFight('storm',false)");pg.wait_for_timeout(1200)
    shots=0
    for turn in range(8):
        pg.wait_for_function("F&&(!F.busy||F.over)",timeout=20000)
        if pg.evaluate("F.over"):break
        n=pg.evaluate("document.querySelectorAll('#moves .mv:not([disabled])').length")
        pg.evaluate(f"document.querySelectorAll('#moves .mv:not([disabled])')[{turn}%{n}].click()")
        pg.wait_for_timeout(320);
        if shots<3: pg.screenshot(path=f'live{shots}.png');shots+=1
    pg.wait_for_timeout(1500)
    print('log:',pg.inner_text('#flog'));print('errors',errs);b.close()
