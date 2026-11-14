from PIL import Image
import numpy as np, json, os
from scipy import ndimage
A='/mnt/user-data/attachments/795ec65c-3ffb-5d1b-b29f-806f58dde49c/%s-image.png'
S={'fire':'bee20d82','water':'336842c2','lightning':'c547b300','wind':'8a648632','earth':'e61d2f31','light':'145763d0','shadow':'014294a4','phys':'a414fb2c',
   'wl':'db0eb3c3','le':'e02d467d','ef':'17ed188d','fw':'5b014816','ww':'16d9aefe','st':'7ba7d7ff','ls':'05781380'}
SOLID={'le':26,'ef':20,'st':34}  # sheets with opaque objects (rocks, foam): keep their solid interiors
C=320;meta={}
def flood(cell,bg,T):
    d=np.sqrt(((cell-bg)**2).sum(-1));near=d<T
    lab,n=ndimage.label(near);edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    return ~np.isin(lab,list(edge))
for name,f in S.items():
    im=np.array(Image.open(A%f).convert('RGB')).astype(float);H,W,_=im.shape
    out=Image.new('RGBA',(4*C,3*C));rects=[]
    for r in range(3):
        for c in range(4):
            cell=im[r*H//3:(r+1)*H//3,c*W//4:(c+1)*W//4]
            bd=np.concatenate([cell[:5].reshape(-1,3),cell[-5:].reshape(-1,3),cell[:,:5].reshape(-1,3),cell[:,-5:].reshape(-1,3)])
            bg=np.median(bd,0)
            if name=='earth':
                fg=flood(cell,bg,18);a=ndimage.gaussian_filter(fg.astype(float),.9);rgb=cell
            elif bg.mean()>200:
                a=np.clip(((bg-cell)/np.maximum(bg,1)).max(-1),0,1);a=np.clip((a-.04)/.96,0,1)
                rgb=(cell-bg*(1-a[...,None]))/np.maximum(a[...,None],1e-3)
            else:
                a=np.clip(((cell-bg)/np.maximum(255-bg,1)).max(-1),0,1);a=np.clip((a-.03)/.97,0,1)
                rgb=(cell-bg*(1-a[...,None]))/np.maximum(a[...,None],1e-3)
                if name in SOLID:
                    s=np.sqrt(((cell-bg)**2).sum(-1))>SOLID[name];s=ndimage.binary_opening(s,iterations=2);s=ndimage.binary_erosion(s,iterations=1);s=ndimage.gaussian_filter(s.astype(float),1.2)
                    rgb=s[...,None]*cell+(1-s[...,None])*np.clip(rgb,0,255);a=np.maximum(a,s)
            rgb=np.clip(rgb,0,255)
            ys,xs=np.where(a>.04)
            y0,y1,x0,x1=max(0,ys.min()-3),min(a.shape[0],ys.max()+4),max(0,xs.min()-3),min(a.shape[1],xs.max()+4)
            t=Image.fromarray(np.dstack([rgb,a*255]).astype(np.uint8),'RGBA').crop((x0,y0,x1,y1))
            s_=min(1,(C-4)/max(t.size));t=t.resize((max(1,round(t.width*s_)),max(1,round(t.height*s_))),Image.LANCZOS)
            ox,oy=c*C+(C-t.width)//2,r*C+(C-t.height)//2;out.paste(t,(ox,oy));rects.append([ox,oy,t.width,t.height])
    out.save('fx/fx-%s.webp'%name,quality=80,method=6);meta[name]=rects
    for bgc,tag in [((235,225,205),'L'),((20,16,30),'D')]:
        pv=Image.new('RGBA',out.size,bgc+(255,));pv.alpha_composite(out);pv.convert('RGB').resize((480,360)).save('fx/pv-%s-%s.png'%(name,tag))
json.dump(meta,open('fx/meta.json','w'))
print({k:os.path.getsize('fx/fx-%s.webp'%k)//1024 for k in S})
o=Image.new('RGB',(480*4,360*8))
for i,k in enumerate(S):
    o.paste(Image.open('fx/pv-%s-L.png'%k),((i%2)*960,(i//2)*360));o.paste(Image.open('fx/pv-%s-D.png'%k),((i%2)*960+480,(i//2)*360))
o.save('fx/pv_all.png')
