from playwright.sync_api import sync_playwright
import os,json,sys
SIM="""async(cfg)=>{
  window.__fast=true;muted=true;const out={};
  for(const [name,team,star,rid,lv,boss] of cfg){
    let w=0,turns=0,N=60;
    for(let i=0;i<N;i++){
      roster={};team.forEach(id=>roster[id]={star,dupes:0,caught:1,first:1});slots.battle=team.slice();
      regions[rid]={lv,kills:boss?999:0};
      startFight(rid,boss);let g=0;
      while(!F.over&&g++<400){
        if(!F.busy){const u=chooser(),r=u.moves.filter(x=>!(u.cds[x.id]>0));const dm=r.filter(x=>x.pow);const mv=r.length?(dm.length&&Math.random()<.8?dm[Math.floor(Math.random()*dm.length)]:r[Math.floor(Math.random()*r.length)]):STRIKE;pick(mv);turns+=1/(F.boss?F.team.filter(c=>c.hp>0).length||1:1)}
        await new Promise(r=>setTimeout(r,0));
      }
      if(document.getElementById('resTitle').textContent!=='Defeat')w++;
    }
    out[name]=[Math.round(100*w/N)+'%',Math.round(turns/N)+' turns'];
  }
  return out}"""
cfg=json.loads(sys.argv[1])
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.path.abspath('wrap.html')); pg.wait_for_timeout(2500)
    pg.evaluate("(()=>{const l=document.getElementById('loader');l&&l.remove()})()")
    r=pg.evaluate(SIM,cfg)
    for k,v in r.items(): print(k,v)
    print(errs[:3]); b.close()
