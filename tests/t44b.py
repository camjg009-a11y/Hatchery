from playwright.sync_api import sync_playwright
import sys,json
p='file:///home/claude/eg/wrap.html'
cases=json.loads(sys.argv[1]);N=int(sys.argv[2]) if len(sys.argv)>2 else 12
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(p);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_function("window.__ldDone",timeout=20000);pg.wait_for_timeout(300);pg.mouse.click(195,400);pg.wait_for_timeout(700)
    pg.evaluate("muted=true;window.__fast=true;window.__pk=\""+sys.argv[3]+"\"")
    for name,teamids,star,rlv in cases:
        r=pg.evaluate("""async([ids,star,rlv,N])=>{MONSTERS.forEach(m=>roster[m.id]={star,dupes:0,caught:1});slots.battle=ids;for(const k in regions)regions[k].lv=rlv;
          const sleep=ms=>new Promise(r=>setTimeout(r,ms));const res=[];
          for(let n=0;n<N;n++){rushStart();let guard=0;
            while(guard++<4000){await sleep(1);
              if(RUSH.done)break;
              if(F.over){if(RUSH.pending){const b=document.querySelector("#resBody .buff");b.click()}else{if(!RUSH.team.some(c=>c.hp>0))throw new Error("DEAD "+JSON.stringify({hp:RUSH.team.map(c=>c.hp),fl:F.floor,foe:curFoe().hp,title:$("resTitle").textContent,buffs:RUSH.buffs}));rushNext()}continue}
              if(F.busy)continue;const u=chooser();if(!u){window.__dbg=JSON.stringify({ch:F.ch,hp:F.team.map(c=>c.hp),over:F.over,fl:F.floor});throw new Error("noU "+window.__dbg)}pick(window.__pk==="best"?bestMove(u):aiPick(u))}
            res.push(RUSH.cleared)}
          res.sort((a,b)=>a-b);return res}""",[teamids,star,rlv,N])
        print(name,'floors cleared:',r,'median',r[len(r)//2])
    print('errors',errs[:3]);b.close()
