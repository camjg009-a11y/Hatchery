// ---- move visual effects ----
// Painted effect pieces (one sheet per element, plus combo sheets) are moved, scaled, spun and faded into animations.
const PAL={fire:["#fff3b0","#ffb347","#ff6a2b","#e0401c"],water:["#effcff","#9fe6ff","#4ab4ff","#2a78e0"],lightning:["#ffffff","#fff8b0","#ffe45c","#b8a6ff"],
  wind:["#ffffff","#e6fff6","#b4f2e0","#78d0bc"],earth:["#f0deb0","#c09a64","#8a6640","#9cc860"],light:["#ffffff","#fff8dc","#ffeaa8","#ffd04c"],
  shadow:["#f2d8ff","#c77dff","#8a3cff","#5a1aa6"],none:["#ffffff","#e6e2ff","#cfc8d8","#a29cc0"],venom:["#f0ffd0","#b8ff5c","#6ad43a","#2f8a2a"],
  spirit:["#f0fffb","#a8ffe8","#5ce0c8","#2a9c8c"],blood:["#ffffff","#ffd6d6","#ff7a7a","#d0304a"],random:["#ff8a4d","#5dc8ff","#ffe45c","#bfeee0","#a5c46a"]};
const FXR=__FXR__;
const FXSRC={fire:"art/fx-fire.webp",water:"art/fx-water.webp",lightning:"art/fx-lightning.webp",wind:"art/fx-wind.webp",earth:"art/fx-earth.webp",light:"art/fx-light.webp",
  shadow:"art/fx-shadow.webp",phys:"art/fx-phys.webp",wl:"art/fx-wl.webp",le:"art/fx-le.webp",ef:"art/fx-ef.webp",fw:"art/fx-fw.webp",ww:"art/fx-ww.webp",st:"art/fx-st.webp",ls:"art/fx-ls.webp"};
const FXA={};
function atl(k){if(!FXA[k]){const i=new Image();i.decoding="async";i.src=FXSRC[k];FXA[k]=i}return FXA[k]}
function fxPreload(){for(const k in FXSRC)atl(k)}
const GL={};
function glow(col){if(GL[col])return GL[col];const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,"#ffffff");r.addColorStop(.2,col);r.addColorStop(.55,col+"55");r.addColorStop(1,col+"00");g.fillStyle=r;g.fillRect(0,0,64,64);return GL[col]=c}
const V={P:[],E:[],on:false};
const rr=(a,b)=>a+Math.random()*(b-a),pk=a=>a[Math.floor(Math.random()*a.length)],W=ms=>new Promise(r=>setTimeout(r,ms/SPD));
function vcan(){const c=$("vfx");if(!c)return null;const a=$("arena").getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);
  if(c._w!==a.width||c._h!==a.height){c._w=a.width;c._h=a.height;c.width=Math.max(1,a.width*d);c.height=Math.max(1,a.height*d);c.getContext("2d").setTransform(d,0,0,d,0,0)}return c}
function vpos(u){const a=$("arena").getBoundingClientRect();
  const el=u.side==="foe"?(u.isEgg?$("bossEgg"):$("foeImg")):F&&F.shown===u?$("myImg"):$("teamRow").children[F?F.team.indexOf(u):0];
  const r=el?el.getBoundingClientRect():{left:a.left+a.width/2-40,top:a.top+a.height/2-40,width:80,height:80};
  const w=Math.max(50,r.width*.62),h=Math.max(50,r.height*.66);
  return{x:r.left-a.left+r.width/2,y:r.top-a.top+r.height*.58,w,h,foot:r.top-a.top+r.height*.95,face:u.side==="foe"?-1:1}}
function pt(o){const p=Object.assign({t:0,life:600,vx:0,vy:0,ax:0,ay:0,drag:0,s:6,s2:null,a:1,shape:"glow",rot:0,vr:0,add:1},o);if(p.delay)p.t=-p.delay;V.P.push(p);vgo();return p}
function em(dur,fn,delay){V.E.push({t:-(delay||0),dur,fn});vgo()}
function fl(c,a,d){const e=$("vfl");if(!e)return;e.style.background=c;e.animate([{opacity:a},{opacity:0}],{duration:d,easing:"ease-out"})}
function vdark(a,d){const e=$("vdk");if(!e)return;e.animate([{opacity:0},{opacity:a,offset:.3},{opacity:a,offset:.6},{opacity:0}],{duration:d,easing:"ease-in-out"})}
function vgo(){if(V.on)return;V.on=true;let last=performance.now();
  const step=now=>{const dt=Math.min(40,now-last)*SPD;last=now;vdraw(dt);
    if(V.P.length||V.E.length)requestAnimationFrame(step);else{V.on=false;const c=$("vfx");if(c)c.getContext("2d").clearRect(0,0,c._w||c.width,c._h||c.height)}};
  requestAnimationFrame(step)}
const easeO=k=>1-Math.pow(1-k,3);
function vdraw(dt){const c=vcan();if(!c){V.P.length=0;V.E.length=0;return}const x=c.getContext("2d"),Wd=c._w,H=c._h;x.clearRect(0,0,Wd,H);
  for(let i=V.E.length-1;i>=0;i--){const e=V.E[i];e.t+=dt;if(e.t<0)continue;const k=Math.min(1,e.t/e.dur);x.save();try{e.fn(k,dt,x)}catch(err){}x.restore();if(k>=1)V.E.splice(i,1)}
  const f=dt/16.67;
  for(let i=0;i<V.P.length;i++){const p=V.P[i];p.t+=dt;if(p.t<0)continue;if(p.t>=p.life){V.P.splice(i--,1);continue}
    p.vx+=p.ax*f;p.vy+=p.ay*f;if(p.drag){const q=Math.pow(1-p.drag,f);p.vx*=q;p.vy*=q}p.x+=p.vx*f;p.y+=p.vy*f;p.rot+=p.vr*f;
    const k=p.t/p.life,ke=p.ease?easeO(k):k,s=Math.max(.1,p.s2==null?p.s:p.s+(p.s2-p.s)*ke);
    const al=p.a*(p.fade==="in"?Math.sin(Math.min(1,k)*Math.PI):p.fade==="hold"?(k<.65?1:1-(k-.65)/.35):p.fade==="pop"?(k<.1?k/.1:k<.6?1:1-(k-.6)/.4):1-k*k);
    x.globalCompositeOperation=p.add?"lighter":"source-over";x.globalAlpha=Math.max(0,Math.min(1,al));vshape(x,p,s,ke)}
  x.globalAlpha=1;x.globalCompositeOperation="source-over"}
function vshape(x,p,s,ke){const ga=x.globalAlpha;switch(p.shape){
  case"spr":{const im=atl(p.k);if(!im.complete||!im.naturalWidth)break;const r=FXR[p.k][p.i];let sx=r[0],sy=r[1],sw=r[2],sh=r[3];
    if(p.half==="t")sh/=2;else if(p.half==="b"){sy+=sh/2;sh/=2}
    const sq=p.sq2==null?(p.sq||1):(p.sq||1)+(p.sq2-(p.sq||1))*ke,w=s,h=s*sh/sw*sq;
    x.save();x.translate(p.x,p.y);x.rotate(p.rot);if(p.fx||p.fy)x.scale(p.fx?-1:1,p.fy?-1:1);const oy=p.anc==="b"?-h:p.anc==="t"?0:-h/2;
    if(p.halo){const g=x.globalCompositeOperation;x.globalCompositeOperation="lighter";x.globalAlpha=ga*.55;const R=Math.max(w,h)*.62;x.drawImage(glow(p.halo),-R,oy+h/2-R,R*2,R*2);x.globalCompositeOperation=g;x.globalAlpha=ga}
    x.drawImage(im,sx,sy,sw,sh,-w/2,oy,w,h);x.restore();break}
  case"glow":x.drawImage(glow(p.c),p.x-s,p.y-s,s*2,s*2);break;
  case"dot":x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,s,0,7);x.fill();break;
  case"spark":{const L=Math.hypot(p.vx,p.vy)*(p.len||3)+1,an=Math.atan2(p.vy,p.vx);x.strokeStyle=p.c;x.lineWidth=s;x.lineCap="round";x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x-Math.cos(an)*L,p.y-Math.sin(an)*L);x.stroke();break}
  case"ring":x.strokeStyle=p.c;x.lineWidth=(p.w||3)*(1-p.t/p.life)+.6;x.beginPath();x.ellipse(p.x,p.y,s,s*(p.sq||1),0,0,7);x.stroke();break;
  case"smoke":{const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,s);g.addColorStop(0,p.c);g.addColorStop(1,p.c+"00");x.fillStyle=g;x.beginPath();x.arc(p.x,p.y,s,0,7);x.fill();break}
}x.globalAlpha=ga}
// building blocks
function sp(k,i,P,o){return pt(Object.assign({shape:"spr",k,i,x:P.x,y:P.y,add:1},o||{}))}
function vburst(P,pal,o={}){const n=o.n||16;for(let i=0;i<n;i++){const an=o.dir!=null?o.dir+rr(-(o.spread||.8),o.spread||.8):rr(0,6.283),spd=rr(.35,1)*(o.sp||5);
  pt({x:P.x+rr(-5,5),y:P.y+rr(-5,5),vx:Math.cos(an)*spd,vy:Math.sin(an)*spd,ay:o.g||0,drag:o.drag??.06,life:rr(.6,1)*(o.life||520),s:rr(.6,1.2)*(o.s||5),s2:o.s2,c:pk(pal),
    shape:o.shape||"glow",len:o.len,add:o.add??1,delay:o.delay})}}
function vring(P,c,r0,r1,o={}){pt({x:P.x,y:P.y,s:r0,s2:r1,c,shape:"ring",life:o.life||420,w:o.w||4,sq:o.sq||1,a:o.a||1,delay:o.delay})}
function smoke(P,n,c){for(let i=0;i<n;i++)pt({x:P.x+rr(-24,24),y:P.y+rr(-12,12),vx:rr(-.7,.7),vy:rr(-1.3,-.3),s:rr(12,22),s2:rr(32,48),c:c||"#2a2230",shape:"smoke",life:rr(700,1100),add:0,a:.5})}
function converge(P,pal,o={}){const n=o.n||18,r=o.r||90,fr=o.fr||22;for(let i=0;i<n;i++){const an=rr(0,6.28),R=r*rr(.7,1.1);
  pt({x:P.x+Math.cos(an)*R,y:P.y+Math.sin(an)*R*.8,vx:-Math.cos(an)*R/fr,vy:-Math.sin(an)*R*.8/fr,life:fr*16.7,s:rr(3,6),s2:1,c:pk(pal),shape:o.shape||"spark",len:2,fade:"in"})}}
// a piece that travels from A to B (dir = which way the painted piece points: 0 right, PI left); resolves on arrival
function fly(k,i,A,B,o={}){const d=o.dur||340,ang=Math.atan2(B.y-A.y,B.x-A.x),ori=o.orient!==false;
  const p=sp(k,i,A,{s:o.s||80,s2:o.s2,life:d+30,fade:"hold",add:o.add??1,a:o.a||1,fx:o.fx,halo:o.halo,rot:ori?ang-(o.dir||0):0});let px=A.x,py=A.y;
  return new Promise(res=>em(d,kk=>{const e=o.ease?kk*kk:kk,x=A.x+(B.x-A.x)*e+(o.wob?Math.cos(kk*16)*o.wob:0),y=A.y+(B.y-A.y)*e-(o.arc||0)*Math.sin(kk*Math.PI)+(o.wob?Math.sin(kk*16)*o.wob:0);
    if(ori&&(o.arc||o.wob)&&(x!==px||y!==py))p.rot=Math.atan2(y-py,x-px)-(o.dir||0);if(o.spin)p.rot+=o.spin;p.x=x;p.y=y;if(o.trail)o.trail(x,y,px,py);px=x;py=y;
    if(kk>=1){p.t=p.life;res()}}))}
// a piece stretched between two points (beams, arcs)
function span(k,i,A,B,o={}){const L=Math.hypot(B.x-A.x,B.y-A.y);return sp(k,i,{x:(A.x+B.x)/2,y:(A.y+B.y)/2},Object.assign({s:L*(o.len||1.05),rot:Math.atan2(B.y-A.y,B.x-A.x)-(o.dir||0)},o))}
// a vertical piece standing on y, tall enough to reach the top of the arena
function tall(k,i,x0,y,o={}){const r=FXR[k][i],h=y+(o.over||20);return sp(k,i,{x:x0,y},Object.assign({anc:"b",s:h*r[2]/r[3]*(o.wide||1),sq:1/(o.wide||1)},o))}
const ELIMP={fire:["fire",2],water:["water",11],lightning:["lightning",4],wind:["wind",10],earth:["earth",10],light:["light",1],shadow:["shadow",10],none:["phys",3]};
function impact(B,el,o={}){const q=ELIMP[el]||ELIMP.none,big=o.big||1;sp(q[0],q[1],B,{s:50*big,s2:170*big,life:420,ease:1,fade:"pop",rot:rr(0,6.28),add:q[0]==="earth"||q[0]==="shadow"?0:1,halo:q[0]==="shadow"?"#8a3cff":null});
  sp("phys",3,B,{s:40*big,s2:130*big,life:260,rot:rr(0,6.28)})}
// the effects
const FX={
  fireBolt:async(A,B,p)=>{sp("fire",8,A,{s:50,s2:90,life:320,vr:.25,fade:"in"});
    await fly("fire",0,A,B,{s:100,dur:330,trail:(x,y,px,py)=>pt({x,y,s:rr(10,18),s2:0,c:pk(p),life:rr(250,400),vx:(px-x)*.1,vy:(py-y)*.1-.6})});
    sp("fire",2,B,{s:70,s2:210,life:480,ease:1,fade:"pop",rot:rr(0,6)});sp("fire",11,B,{s:60,s2:170,life:260});sp("fire",10,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.6,life:520,ease:1});smoke(B,3)},
  fireRing:async(A,B,p)=>{const G={x:B.x,y:B.foot};sp("fire",6,G,{s:B.w*.8,s2:B.w*1.35,life:1000,ease:1,fade:"hold"});
    for(let i=0;i<7;i++){const an=i/7*6.283;sp("fire",i%2?3:4,{x:B.x+Math.cos(an)*B.w*.6,y:B.foot+Math.sin(an)*B.w*.14},{anc:"b",s:rr(38,56),sq:.2,sq2:1.1,ease:1,life:820,fade:"hold",delay:i*40,fx:Math.random()<.5})}
    sp("fire",5,{x:B.x,y:B.y},{s:B.w*1.2,life:1000,vy:-.7,fade:"in",delay:200});await W(330)},
  firePillar:async(A,B,p)=>{const G={x:B.x,y:B.foot};sp("fire",9,G,{s:B.w*1.7,life:1500,fade:"hold"});sp("fire",8,B,{s:60,s2:B.w*1.5,vr:.22,life:520,fade:"in"});converge(B,p,{n:14,r:B.w});
    await W(220);fl(p[2],.3,520);shake(app,11,520);sp("fire",7,G,{anc:"b",s:B.w*1.25,sq:.2,sq2:1.35,ease:1,life:1050,fade:"hold"});sp("fire",2,B,{s:90,s2:B.w*1.8,life:520,ease:1,fade:"pop"});
    for(let i=0;i<5;i++)sp("fire",i%2?3:4,{x:B.x+rr(-B.w*.6,B.w*.6),y:B.foot},{anc:"b",s:rr(40,70),sq:.2,sq2:1.2,ease:1,life:800,fade:"hold",delay:rr(0,250)});await W(120);smoke(B,8)},
  waterOrb:async(A,B,p)=>{await fly("water",0,A,B,{s:66,arc:70,dur:380,orient:false,spin:.12,add:0,trail:(x,y)=>pt({x,y,s:rr(2,3.5),c:pk(p),shape:"dot",life:400,vy:rr(-1,0),ay:.2,add:0})});
    sp("water",1,{x:B.x,y:B.y+B.h*.35},{anc:"b",s:B.w*1.2,sq:.3,sq2:1,ease:1,life:650,fade:"hold",add:0});sp("water",11,B,{s:40,s2:160,life:360,ease:1});sp("water",4,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.5,life:650,ease:1})},
  waterRain:async(A,B,p)=>{smoke({x:B.x,y:B.y-B.h*.85},7,"#55657e");em(760,()=>{if(Math.random()<.7)pt({shape:"spr",k:"water",i:3,x:B.x+rr(-B.w*.6,B.w*.6),y:B.y-B.h*.8,vy:rr(13,16),s:12,life:rr(200,320),add:0,fade:"hold"});
    if(Math.random()<.25)sp("water",4,{x:B.x+rr(-B.w*.45,B.w*.45),y:B.foot+rr(-6,6)},{s:10,s2:60,life:420,ease:1})},140);await W(420)},
  waterWave:async(A,B,p)=>{fl(p[2],.25,650);const right=B.x>A.x,y0=Math.max(A.foot,B.foot)*.4+B.foot*.6;
    const wv=sp("water",5,{x:A.x,y:y0},{anc:"b",s:B.w*1.5,s2:B.w*2.4,fx:right,life:820,fade:"hold",add:0});
    em(800,k=>{wv.x=A.x+(B.x-A.x)*k*1.15;wv.y=y0+(B.foot-y0)*k});await W(560);shake(app,10,480);
    sp("water",6,B,{s:B.w*1.2,s2:B.w*1.8,life:700,ease:1,fade:"hold",add:0});sp("water",11,B,{s:60,s2:220,life:380,ease:1});sp("water",2,B,{s:B.w,s2:B.w*1.5,life:600,ease:1,rot:-1})},
  bubbles:async(A,B,p)=>{sp("water",9,A,{s:A.w*.6,s2:A.w*1.4,life:950,ease:1,fade:"hold",add:0,a:.8});for(let i=0;i<3;i++)sp("water",8,{x:A.x+rr(-A.w*.4,A.w*.4),y:A.foot},{s:rr(50,80),vy:-1.6,life:900,fade:"in",add:0,delay:i*150});
    sp("water",11,A,{s:30,s2:140,life:350,delay:880});await W(260)},
  mend:async(A,B,p)=>{sp("phys",9,A,{s:A.w*.6,s2:A.w*.9,vy:-1,life:950,fade:"hold"});sp("light",4,A,{s:A.w*1.1,life:900,fade:"in",vy:-.5});vring({x:A.x,y:A.foot},"#8dff9a",8,A.w*.75,{sq:.3,life:700,w:3});fl("#7dff9a",.1,500);await W(250)},
  blessing:async(A,B,p)=>{sp("light",3,{x:A.x,y:A.y-A.h*.55},{s:A.w*.4,s2:A.w*.9,life:1000,ease:1,fade:"hold"});sp("light",10,A,{s:A.w*1.1,vy:-1,life:1000,fade:"in"});sp("light",2,{x:A.x,y:A.foot},{anc:"b",s:A.w*1.1,sq:1.2,life:800,fade:"pop",a:.7});await W(260)},
  zap:async(A,B,p)=>{for(let i=0;i<3;i++){span("lightning",i%2?8:2,A,B,{life:120,fade:"hold",sq:rr(.8,1.4),fy:Math.random()<.5});await W(60)}
    sp("lightning",4,B,{s:50,s2:180,life:320,ease:1,fade:"pop"});sp("lightning",5,B,{s:B.w,s2:B.w*1.5,life:420,ease:1})},
  field:async(A,B,p)=>{sp("lightning",6,B,{s:B.w*1.5,s2:B.w*1.2,life:850,fade:"hold"});sp("lightning",3,B,{s:B.w*.5,s2:B.w*.9,life:700,fade:"in",a:.6});
    em(700,()=>{if(Math.random()<.35)sp("lightning",9,{x:B.x+rr(-B.w*.5,B.w*.5),y:B.y+rr(-B.h*.4,B.h*.3)},{s:rr(40,70),rot:rr(0,6.28),life:130,fade:"hold"})});await W(320)},
  storm:async(A,B,p)=>{smoke({x:B.x,y:10},10,"#2c2840");shake(app,7,850);for(let i=0;i<4;i++){tall("lightning",i%2,B.x+rr(-B.w*.35,B.w*.35),B.y+rr(-10,B.h*.25),{life:320,fade:"pop",wide:1.5,fx:Math.random()<.5});
    fl("#e8f0ff",.3,180);sp("lightning",4,B,{s:40,s2:140,life:260,ease:1});await W(120)}sp("lightning",10,{x:B.x,y:B.foot},{s:B.w*.7,s2:B.w*1.8,sq:.45,life:520,ease:1})},
  sky:async(A,B,p)=>{tall("lightning",7,B.x,B.foot,{life:420,fade:"pop",wide:1.3});fl("#f0f4ff",.5,320);shake(app,8,320);
    sp("lightning",4,B,{s:60,s2:230,life:360,ease:1,fade:"pop"});sp("lightning",10,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.7,sq:.4,life:560,ease:1})},
  blade:async(A,B,p)=>{const fs=[];for(let i=0;i<3;i++){const off=(i-1)*26;fs.push(fly("wind",i===1?0:1,{x:A.x,y:A.y+off},{x:B.x,y:B.y+off*.5},{s:i===1?90:70,dir:Math.PI,dur:260}));await W(50)}
    fly("wind",2,A,B,{s:130,dir:Math.PI,dur:260,a:.7});await Promise.all(fs);sp("wind",10,B,{s:40,s2:B.w*1.3,life:380,ease:1});sp("wind",8,B,{s:B.w,s2:B.w*1.5,life:500,ease:1})},
  windRing:async(A,B,p)=>{sp("wind",6,B,{s:B.w*1.6,s2:B.w*.9,life:760,fade:"hold"});sp("wind",3,B,{s:B.w*1.3,s2:B.w*.7,vr:-.28,life:760,fade:"in"});sp("wind",8,B,{s:B.w*1.2,life:700,fade:"in",vr:.05});await W(400)},
  tornado:async(A,B,p)=>{shake(app,7,950);const G={x:B.x,y:B.foot+6};const t=sp("wind",5,G,{anc:"b",s:B.w*1.6,sq:.4,sq2:1.15,ease:1,life:1150,fade:"hold"});
    em(1100,k=>{t.x=B.x+Math.sin(k*22)*7});sp("wind",4,{x:B.x-B.w*.75,y:B.foot},{anc:"b",s:B.w*.55,life:900,fade:"in",delay:150});sp("wind",4,{x:B.x+B.w*.75,y:B.foot},{anc:"b",s:B.w*.5,fx:1,life:900,fade:"in",delay:250});
    sp("wind",9,{x:B.x,y:B.foot-10},{s:B.w*1.2,s2:B.w*1.7,life:900,ease:1,fade:"hold",add:0,a:.85});await W(450)},
  tail:async(A,B,p)=>{for(let i=0;i<4;i++){const y=A.y+rr(-A.h*.45,A.h*.35);fly("wind",2,{x:A.x-A.face*A.w,y},{x:A.x+A.face*A.w,y},{s:120,dir:Math.PI,dur:300,fx:0});await W(60)}
    sp("wind",11,A,{s:A.w*1.4,vr:.06,life:820,fade:"in"});sp("wind",7,{x:A.x,y:A.y-A.h*.3},{s:A.w,life:700,fade:"in",vy:-.6});await W(150)},
  rocks:async(A,B,p)=>{for(let i=0;i<4;i++){const x0=B.x+rr(-B.w*.4,B.w*.4),y0=-30-rr(0,30),ty=B.y+rr(-10,B.h*.3),vy=rr(3,5),ay=.55,fr=(-vy+Math.sqrt(vy*vy+2*ay*(ty-y0)))/ay,L=fr*16.7;
    pt({shape:"spr",k:"earth",i:i%2,x:x0,y:y0,vy,ay,s:i%2?rr(48,64):rr(66,86),rot:rr(0,6),vr:rr(-.12,.12),life:L,add:0,fade:"hold"});
    setTimeout(()=>{sp("earth",10,{x:x0,y:ty+20},{anc:"b",s:90,s2:130,life:520,ease:1,fade:"hold",add:0});sp("earth",3,{x:x0,y:ty},{s:70,s2:130,life:750,ease:1,add:0,a:.75,vy:-.4});shake(app,4,140)},L/SPD);await W(80)}await W(300)},
  vines:async(A,B,p)=>{for(let i=0;i<4;i++){const s=i%2?1:-1;sp("earth",7+i%2,{x:B.x+s*B.w*rr(.15,.45),y:B.foot+4},{anc:"b",s:B.w*rr(.6,.8),sq:.08,sq2:1,ease:1,life:1000,fade:"hold",add:0,fx:s>0,delay:i*70})}
    for(let i=0;i<4;i++)sp("earth",9,{x:B.x+rr(-B.w*.5,B.w*.5),y:B.y+rr(-B.h*.4,B.h*.2)},{s:rr(18,26),rot:rr(0,6),vr:.04,vy:rr(-.6,.3),life:900,fade:"in",add:0,delay:250+i*60});await W(380)},
  quake:async(A,B,p)=>{shake(app,15,760);const G={x:B.x,y:B.foot};sp("earth",4,G,{s:B.w*.6,s2:B.w*2,life:1400,ease:1,fade:"hold",add:0});
    for(let i=0;i<5;i++){const xx=B.x+(i-2)*B.w*.42+rr(-10,10);sp("earth",i%2?5:6,{x:xx,y:B.foot+8},{anc:"b",s:rr(60,90),sq:.05,sq2:1,ease:1,life:900,fade:"hold",add:0,fx:Math.random()<.5,delay:i*60+80})}
    sp("earth",10,{x:B.x,y:B.foot},{anc:"b",s:B.w*1.2,s2:B.w*1.6,life:700,ease:1,fade:"hold",add:0,delay:150});sp("earth",3,G,{s:B.w*1.4,s2:B.w*2,life:900,ease:1,add:0,a:.7,delay:200});await W(330)},
  skin:async(A,B,p)=>{const ps=[0,1,2].map(i=>sp("earth",11,A,{s:46,life:620,fade:"hold",add:0}));let a0=0;
    em(600,(k,dt)=>{a0+=dt*.012;ps.forEach((q,i)=>{const an=a0+i*2.094,r=A.w*.75*(1-k*.7);q.x=A.x+Math.cos(an)*r;q.y=A.y+Math.sin(an)*r*.55;q.rot=an+1.57})});
    await W(560);sp("earth",2,A,{s:A.w*.6,s2:A.w*1.4,life:450,ease:1,add:0});sp("earth",3,A,{s:A.w*.8,s2:A.w*1.3,life:600,ease:1,add:0,a:.6})},
  beam:async(A,B,p)=>{span("light",0,A,B,{sq:2.2,sq2:.2,life:460,fade:"pop"});for(let i=0;i<4;i++){const q=Math.random();sp("light",5,{x:A.x+(B.x-A.x)*q,y:A.y+(B.y-A.y)*q},{s:20,s2:60,life:380,delay:i*60})}
    await W(150);sp("light",1,B,{s:60,s2:200,life:480,ease:1,fade:"pop",vr:.03});sp("light",9,B,{s:B.w*.4,s2:B.w*1.4,life:480,ease:1})},
  flash:async(A,B,p)=>{fl("#ffffff",.8,480);sp("light",1,B,{s:80,s2:Math.max(240,B.w*1.8),life:520,ease:1,fade:"pop",vr:.02});sp("light",7,{x:B.x,y:B.y+B.h*.3},{anc:"b",s:B.w*1.8,life:520,fade:"pop"});sp("light",4,B,{s:B.w*1.4,life:700,fade:"in"});await W(170)},
  column:async(A,B,p)=>{const G={x:B.x,y:B.foot};sp("light",11,G,{s:B.w*.5,s2:B.w*1.7,sq:.35,vr:.015,life:1300,ease:1,fade:"hold"});await W(250);shake(app,9,700);
    tall("light",2,B.x,B.foot,{life:900,fade:"pop",wide:1.6});fl("#fff6d0",.5,450);sp("light",10,B,{s:B.w*1.3,vy:-1.4,life:1000,fade:"in"});
    for(let i=0;i<3;i++)sp("light",6,{x:B.x+rr(-B.w*.6,B.w*.6),y:B.y-B.h*.8},{s:rr(30,44),rot:rr(-1,1),vr:rr(-.03,.03),vy:1.1,life:1100,fade:"in",delay:i*120});
    sp("light",9,G,{s:B.w*.4,s2:B.w*1.8,sq:.35,life:600,ease:1})},
  shadeOrb:async(A,B,p)=>{await fly("shadow",0,A,B,{s:70,wob:12,dur:420,orient:false,spin:.08,add:0,halo:"#8a3cff",trail:(x,y)=>{if(Math.random()<.3)sp("shadow",11,{x,y},{s:50,life:400,fade:"in",add:0,a:.7})}});
    sp("shadow",7,B,{s:B.w*1.5,s2:B.w*.3,vr:.25,life:380,add:0,halo:"#8a3cff"});await W(260);sp("shadow",10,B,{s:60,s2:B.w*1.8,life:520,ease:1,fade:"pop",add:0,halo:"#c77dff"})},
  sigil:async(A,B,p)=>{sp("shadow",3,B,{s:B.w*.2,s2:B.w*1.25,vr:.045,life:1050,ease:1,fade:"hold",add:0,halo:"#8a3cff"});sp("shadow",11,B,{s:B.w*1.2,life:900,fade:"in",add:0,a:.6,delay:200});await W(420)},
  eclipse:async(A,B,p)=>{vdark(.62,1150);const top={x:B.x,y:Math.max(40,B.y-B.h*.8)};sp("shadow",4,top,{s:40,s2:B.w*1.4,life:1150,ease:1,fade:"hold",add:0,halo:"#c77dff"});
    sp("shadow",5,{x:B.x-B.w*.7,y:B.y},{s:B.w*.9,sq:.2,sq2:1,ease:1,life:900,fade:"hold",add:0,delay:150});sp("shadow",6,{x:B.x+B.w*.7,y:B.y},{s:B.w*.9,sq:.2,sq2:1,ease:1,fx:1,life:900,fade:"hold",add:0,delay:220});
    await W(560);sp("shadow",7,B,{s:B.w*1.6,s2:B.w*.3,vr:.3,life:360,add:0,halo:"#8a3cff"});await W(240);shake(app,12,500);fl("#8a3cff",.35,420);
    sp("shadow",10,B,{s:80,s2:B.w*2.2,life:600,ease:1,fade:"pop",add:0,halo:"#c77dff"});sp("shadow",2,B,{s:B.w*1.4,s2:B.w*2,life:900,ease:1,add:0,a:.7})},
  twilight:async(A,B,p)=>{await fly("ls",0,A,B,{s:76,dur:380,orient:false,spin:.15});sp("ls",8,B,{s:70,s2:B.w*2,life:560,ease:1,fade:"pop"});sp("ls",10,B,{s:B.w*.4,s2:B.w*1.5,life:600,ease:1});sp("ls",11,B,{s:60,s2:180,vr:.05,life:420})},
  primal:async(A,B,p)=>{const top={x:B.x,y:Math.max(50,B.y-B.h*.9)};sp("st",4,top,{s:B.w*1.2,s2:B.w*1.8,life:1200,ease:1,fade:"hold",add:0});shake(app,10,1000);
    await W(250);tall("st",1,B.x,B.foot,{life:900,fade:"pop",wide:1.2,over:-60});sp("st",0,B,{s:B.w*.6,s2:B.w*1.8,vr:.2,life:800,fade:"in"});fl("#ffffff",.35,420);
    await W(300);sp("st",3,B,{s:80,s2:B.w*2.2,life:600,ease:1,fade:"pop"});sp("st",11,B,{s:60,s2:220,life:420})},
  pulse:async(A,B,p)=>{sp("phys",3,B,{s:50,s2:170,life:340,ease:1,rot:rr(0,6)});for(let i=0;i<3;i++){vring(B,i%2?p[1]:p[3],6,B.w*.7,{w:4,life:380});await W(70)}},
  boost:async(A,B,p,u,t,mv)=>{const G={x:A.x,y:A.foot};
    if(mv.sDef&&!mv.sAtk)sp("phys",5,G,{anc:"b",s:A.w*1.6,sq:.2,sq2:1,ease:1,life:950,fade:"pop",a:.85});
    if(mv.sAtk||(!mv.sDef&&!mv.sSpd))sp("phys",10,{x:A.x,y:A.foot},{anc:"b",s:A.w*.9,sq:.3,sq2:1,ease:1,vy:-1,life:900,fade:"hold"});
    if(mv.sSpd)for(let i=0;i<3;i++){const y=A.y+rr(-A.h*.4,A.h*.3);fly("phys",11,{x:A.x-A.face*A.w,y},{x:A.x+A.face*A.w*.8,y},{s:110,dur:260})}
    vring(G,mv.sAtk?"#ff7a4d":mv.sDef?"#5db8ff":"#7af0d0",8,A.w*.75,{sq:.3,life:650,w:4});await W(260)},
  roar:async(A,B,p)=>{for(let i=0;i<3;i++){fly("phys",4,A,{x:A.x+(B.x-A.x)*.55,y:A.y+(B.y-A.y)*.55},{s:60+i*20,s2:140,dur:360});await W(90)}shake(app,4,300);
    sp("phys",10,{x:B.x,y:B.y-B.h*.2},{s:B.w*.6,fy:1,vy:1.2,life:800,fade:"hold"});await W(200)},
  bite:async(A,B,p)=>{const s=B.w*1.1,top=sp("phys",2,B,{half:"t",s,life:420,fade:"pop"}),bot=sp("phys",2,B,{half:"b",s,life:420,fade:"pop"}),gap=B.h*.45;
    em(220,k=>{const o=gap*(1-easeO(k))+6;top.y=B.y-o-s*.12;bot.y=B.y+o+s*.12});await W(220);shake(app,5,200);sp("phys",3,B,{s:50,s2:180,life:300,ease:1,rot:rr(0,6)});vburst(B,PAL.blood,{n:10,sp:6,s:4})},
  slash:async(A,B,p)=>{sp("phys",0,B,{s:B.w*.6,s2:B.w*1.3,life:420,ease:1,fade:"pop"});await W(90);sp("phys",3,B,{s:50,s2:170,life:300,ease:1,rot:rr(0,6)})},
  cut:async(A,B,p)=>{for(let i=0;i<3;i++){sp("phys",1,{x:B.x+(i-1)*18,y:B.y+(i-1)*10},{s:B.w*.5,s2:B.w*1.3,rot:(i-1)*.5,life:320,ease:1,fade:"pop"});await W(60)}sp("phys",3,B,{s:50,s2:160,life:300,ease:1})},
  rush:async(A,B,p,u,t,mv)=>{await fly("phys",11,A,B,{s:150,dur:240});shake(app,6,220);impact(B,mv.el)},
  dive:async(A,B,p,u,t,mv)=>{await fly("phys",11,{x:B.x+30,y:-40},B,{s:150,dur:240});impact(B,mv.el)},
  ward:async(A,B,p)=>{sp("phys",5,{x:A.x,y:A.foot},{anc:"b",s:A.w*1.6,sq:.2,sq2:1,ease:1,life:950,fade:"pop",a:.85});await W(220)},
  brace:async(A,B,p,u)=>{const f=u.side==="foe"?-1:1;sp("phys",6,{x:A.x+f*A.w*.45,y:A.y},{s:A.h*.6,s2:A.h*.75,fx:f<0,life:760,ease:1,fade:"pop"});vburst({x:A.x+f*A.w*.45,y:A.y},["#ffffff","#8fc4ff"],{n:8,sp:3});await W(200)},
  venom:async(A,B,p)=>{await fly("phys",8,A,B,{s:44,arc:40,dur:360,orient:false,spin:.2,add:0});sp("phys",8,B,{s:B.w*.5,s2:B.w*1.1,rot:rr(0,6),life:800,ease:1,fade:"hold",add:0});
    vburst(B,PAL.venom,{n:12,sp:4,g:.2,shape:"dot",s:3,add:0})},
  web:async(A,B,p)=>{await fly("phys",3,A,B,{s:30,dur:240,orient:false});sp("phys",7,B,{s:B.w*.3,s2:B.w*1.4,rot:rr(-.4,.4),life:1050,ease:1,fade:"hold",add:0})},
  coil:async(A,B,p)=>{const pal=p===PAL.none?PAL.venom:p;for(let i=0;i<3;i++){vring({x:B.x,y:B.y+(i-1)*B.h*.22},pal[2],B.w*.75,B.w*.3,{sq:.3,w:7,life:420});await W(80)}
    sp("phys",3,B,{s:40,s2:140,life:300,ease:1});shake(app,4,250)},
  drain:async(A,B,p)=>{for(let i=0;i<3;i++){fly("shadow",11,{x:B.x+rr(-20,20),y:B.y+rr(-20,20)},{x:A.x,y:A.y},{s:60,dur:520,arc:rr(-40,40),add:0,halo:"#ff4f8a"});await W(90)}await W(200);sp("phys",9,A,{s:A.w*.5,vy:-.8,life:700,fade:"hold"})},
  charge:async(A,B,p,u,t,mv)=>{const q={fire:["fire",8],water:["water",10],lightning:["lightning",3],wind:["wind",3],earth:["earth",2],light:["light",8],shadow:["shadow",7]}[mv.el]||["phys",3];
    sp(q[0],q[1],A,{s:A.w*1.7,s2:A.w*.6,vr:.15,life:850,fade:"in",add:q[0]==="earth"||q[0]==="shadow"?0:1,halo:q[0]==="shadow"?"#8a3cff":null});converge(A,p,{n:16,r:A.w,fr:30,shape:"glow"})}
};
const FXN={"Ember":"fireBolt","Kindle":"fireRing","Inferno":"firePillar","Splash":"waterOrb","Drench":"waterRain","Tsunami":"waterWave","Tidal Mend":"bubbles",
  "Spark":"zap","Static Field":"field","Thunderstorm":"storm","Thunderbolt":"sky","Gust":"blade","Buffet":"windRing","Cyclone":"tornado","Tailwind":"tail",
  "Rockfall":"rocks","Entangle":"vines","Earthquake":"quake","Stone Skin":"skin","Radiance":"beam","Flash":"flash","Judgment":"column",
  "Shade":"shadeOrb","Hex Mark":"sigil","Eclipse":"eclipse","Pulse":"pulse","Overclock":"boost","Bite":"bite","Roar":"roar","Dive":"dive","Wing Guard":"ward",
  "Slipstream":"rush","Brine":"waterOrb","Venom":"venom","Web":"web","Constrict":"coil","Coil":"skin","Hex":"sigil","Spirit Mend":"mend",
  "Wild Surge":"boost","Blessing":"blessing","Drain":"drain","Twin Bond":"mend","Brace":"brace","Tremor":"quake","Day and Night":"twilight","Dust Devil":"windRing","Every Face":"primal","Mimic":"pulse","Demon Fire":"firePillar","Mourning Tide":"waterWave","Thunder Axe":"sky","Herald's Dive":"dive","Colossus":"quake","Benediction":"blessing","Miasma":"venom","Jab":"rush","Snap Jaw":"bite","Darting Strike":"blade","Primeval Gale":"tornado","Cinder Burrow":"fireRing","Searing Song":"roar","Regrow":"bubbles","Pale Grasp":"coil","Abyssal Stare":"waterWave","Cavitation Punch":"rush","Thunder Fist":"sky","Roll Up":"ward","Tail Club":"quake","Petal Lure":"beam","Praying Strike":"slash","Vesper Scythes":"cut","The Long Finger":"slash","Death Point":"sigil","Bloom of Ages":"vines","Gather the Flock":"drain","Mandrake Scream":"roar","Equivalent Exchange":"column","One Note":"roar","Wheel of Eyes":"flash","Suction Grip":"coil","Drowning Grasp":"coil","Gate Ward":"ward","Sickle Wind":"cut","Eye of the Storm":"windRing","Corpse-Wind":"tornado","Drifting Sting":"field","Wrath of the Cradle":"primal"};
const BIG={fire:"firePillar",water:"waterWave",lightning:"sky",wind:"tornado",earth:"quake",light:"column",shadow:"eclipse"};
const ELFX={fire:"fireBolt",water:"waterOrb",lightning:"zap",wind:"blade",earth:"rocks",light:"beam",shadow:"shadeOrb",none:"pulse",random:"pulse"};
function fxOf(mv){if(FXN[mv.n])return FXN[mv.n];if(mv.brace)return"brace";if(mv.shield)return"ward";if(mv.heal&&!mv.pow)return mv.el==="water"?"bubbles":mv.el==="light"?"blessing":"mend";
  if(!mv.pow)return mv.tAtk||mv.tDef||mv.tSpd?"roar":"boost";const n=mv.n||"";
  if(/bite|fang|maw|jaw|snap|chomp|devour|feast/i.test(n))return"bite";if(/claw|rend|talon|maul|scratch/i.test(n))return"slash";if(/slash|scythe|blade|cut|sever|reap/i.test(n))return"cut";
  if(/charge|dash|rush|ram|tackle|stampede|gore|horn|trample|lunge|pounce/i.test(n))return"rush";if(/dive|swoop|plunge|drop/i.test(n))return"dive";
  if(/web|silk|snare/i.test(n))return"web";if(/venom|sting|toxin|poison/i.test(n))return"venom";if(/coil|constrict|crush|squeeze/i.test(n))return"coil";
  if(mv.drain)return"drain";if(mv.charge||mv.pow>=1.5)return BIG[mv.el]||"rush";return ELFX[mv.el]||"pulse"}
async function playFx(u,mv,t){if(window.__fast||!$("vfx"))return;const k=fxOf(mv),A=vpos(u),B=vpos(t),
  p=PAL[(mv.n==="Hex"||mv.n==="Spirit Mend")?"spirit":(mv.els?mv.els[0]:mv.el)]||PAL.none;
  // unique moves get a burst of their element on top of their own effect
  const uniq=META[u.id]&&META[u.id].u&&META[u.id].u.n===mv.n&&!["twilight","primal"].includes(k);
  try{await Promise.race([FX[k](A,B,p,u,t,mv),W(1000)]);if(uniq&&mv.pow)impact(B,mv.el,{big:.8})}catch(e){await W(200)}}
const ST_FX={burn:B=>sp("fire",3,{x:B.x,y:B.y+B.h*.25},{anc:"b",s:46,sq:.3,sq2:1,ease:1,life:700,fade:"hold"}),
  soak:B=>sp("water",2,B,{s:B.w*.6,s2:B.w,life:600,ease:1,rot:-.8,add:0}),shock:B=>sp("lightning",5,B,{s:B.w*.6,s2:B.w*1.1,life:500,ease:1}),
  root:B=>sp("earth",7,{x:B.x,y:B.foot},{anc:"b",s:B.w*.5,sq:.1,sq2:1,ease:1,life:800,fade:"hold",add:0}),scatter:B=>sp("wind",8,B,{s:B.w*.8,s2:B.w*1.2,life:600,ease:1}),
  blind:B=>sp("light",1,{x:B.x,y:B.y-B.h*.25},{s:30,s2:110,life:520,ease:1,fade:"pop"}),curse:B=>sp("shadow",3,{x:B.x,y:B.y-B.h*.2},{s:30,s2:80,vr:.05,life:800,ease:1,fade:"hold",add:0,halo:"#8a3cff"})};
function vStatus(t,k){if(window.__fast||!$("vfx")||!F||!ST_FX[k])return;ST_FX[k](vpos(t))}
// combo payoffs use the combination sheets
const COMBO_FX={
  lightning:B=>{sp("wl",8,{x:B.x,y:B.y+B.h*.4},{anc:"b",s:B.w*1.5,life:650,fade:"pop"});tall("wl",2,B.x,B.y+B.h*.3,{life:420,fade:"pop",wide:1.4,over:-20});sp("wl",10,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.8,life:560,ease:1});sp("wl",11,B,{s:60,s2:200,life:380})},
  earth:B=>{tall("le",0,B.x,B.foot,{life:500,fade:"pop",wide:1.6,over:-30});sp("le",2,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.8,life:1000,ease:1,fade:"hold"});sp("le",8,{x:B.x,y:B.foot},{anc:"b",s:B.w*1.4,life:650,fade:"pop",delay:120});sp("le",10,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.9,life:700,ease:1,delay:120})},
  fire:B=>{sp("ef",3,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.9,life:1100,ease:1,fade:"hold"});sp("ef",8,{x:B.x,y:B.foot+6},{anc:"b",s:B.w*1.5,sq:.3,sq2:1,ease:1,life:750,fade:"hold"});sp("ef",10,{x:B.x,y:B.foot},{s:B.w*.8,s2:B.w*1.7,life:800,ease:1,fade:"hold"});sp("ef",9,B,{s:B.w*.6,s2:B.w*1.6,life:600,ease:1})},
  wind:B=>{sp("fw",0,{x:B.x,y:B.foot+6},{anc:"b",s:B.w*1.4,sq:.3,sq2:1.1,ease:1,life:900,fade:"hold",vr:0});sp("fw",10,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.8,sq:.45,life:620,ease:1});sp("fw",8,B,{s:B.w,s2:B.w*1.7,life:650,ease:1,fade:"pop",delay:120})},
  water:B=>{sp("ww",0,{x:B.x,y:B.foot+6},{anc:"b",s:B.w*1.3,sq:.3,sq2:1.1,ease:1,life:900,fade:"hold"});sp("ww",10,{x:B.x,y:B.foot},{s:B.w*.6,s2:B.w*1.8,life:620,ease:1});sp("ww",8,B,{s:B.w,s2:B.w*1.7,life:650,ease:1,fade:"pop",delay:120})},
  shadow:B=>{sp("ls",2,{x:B.x,y:B.y-B.h*.3},{s:40,s2:B.w*1.3,life:800,ease:1,fade:"hold"});sp("ls",8,B,{s:60,s2:B.w*2,life:600,ease:1,fade:"pop",delay:150});sp("ls",10,B,{s:B.w*.4,s2:B.w*1.6,life:600,ease:1,delay:150})},
  light:B=>{sp("ls",6,{x:B.x,y:B.foot},{s:B.w*.5,s2:B.w*1.6,sq:.4,vr:.03,life:900,ease:1,fade:"hold"});sp("ls",11,B,{s:60,s2:220,vr:.05,life:520,ease:1,fade:"pop"});sp("ls",8,B,{s:60,s2:B.w*1.9,life:600,ease:1,fade:"pop",delay:120})}};
function vCombo(t,el){if(window.__fast||!$("vfx")||!F)return;const B=vpos(t);fl((PAL[el]||PAL.none)[2],.35,380);(COMBO_FX[el]||(b=>impact(b,el,{big:1.4})))(B)}
function vCharge(u,el){if(window.__fast||!$("vfx")||!F)return;FX.charge(vpos(u),null,PAL[el]||PAL.none,u,null,{el})}
function vStrike(u){if(!$("vfx")||!F)return;FX.sky(null,vpos(u),PAL.lightning)}
