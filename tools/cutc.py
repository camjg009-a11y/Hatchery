# creature cutout from a flat grey background. mode "solid": opaque body + soft glow; "veil": fully translucent (unmixed from the grey)
from PIL import Image, ImageDraw
import numpy as np, sys, json
from scipy import ndimage as ndi
A='/mnt/user-data/attachments/795ec65c-3ffb-5d1b-b29f-806f58dde49c/%s-image.png'
def cut(name,f,mode="solid",near_t=.07,holes=False,VS=.33):
    a=np.asarray(Image.open(A%f).convert('RGB')).astype(float)
    bg=np.median(np.concatenate([a[:10].reshape(-1,3),a[-10:].reshape(-1,3),a[:,:10].reshape(-1,3),a[:,-10:].reshape(-1,3)]),0)
    d=np.where(a>bg,(a-bg)/(255-bg),(bg-a)/bg).max(2)
    if mode=='veil':
        al=np.clip((d-.03)/VS,0,1);al=ndi.gaussian_filter(al,.6)
        col=np.clip((a-(1-al[...,None])*bg)/np.maximum(al[...,None],1e-3),0,255);alpha=al
    else:
        near=d<near_t;lab,k=ndi.label(near);border=np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]]));border=border[border>0]
        bgm=np.isin(lab,border)
        pure=ndi.binary_opening(d<0.035,iterations=2);l2,k2=ndi.label(pure);sz=ndi.sum(pure,l2,range(1,k2+1))
        bgm|=ndi.binary_dilation(np.isin(l2,[i+1 for i,s in enumerate(sz) if s>250]),iterations=2)&near
        if holes:bgm|=ndi.binary_opening(d<0.09,iterations=1)
        solid=ndi.binary_opening(~bgm,iterations=1)
        l3,k3=ndi.label(solid);s3=ndi.sum(solid,l3,range(1,k3+1));solid=np.isin(l3,[i+1 for i,s in enumerate(s3) if s>=40])
        Sf=ndi.gaussian_filter(solid.astype(float),0.8)
        al=np.clip((d-0.05)/0.85,0,1)*(~solid);alpha=np.maximum(Sf,al)
        fg=np.clip((a-(1-al[...,None])*bg)/np.maximum(al[...,None],1e-3),0,255);col=np.where((Sf>0.35)[...,None],a,fg)
    out=Image.fromarray(np.dstack([col,alpha*255]).astype('uint8'))
    out=out.crop(out.split()[3].point(lambda v:255 if v>10 else 0).getbbox())
    o=Image.new('RGBA',(out.width+16,out.height+16));o.paste(out,(8,8));o.thumbnail((760,760),Image.LANCZOS)
    o.save(f'n2/{name}.webp','WEBP',quality=84);return o
J=json.loads(sys.argv[1]);T=360;sh=Image.new('RGB',(T*len(J),T*2),(22,20,34));dr=ImageDraw.Draw(sh)
for i,(name,f,mode,nt,holes) in enumerate(J):
    o=cut(name,f,mode,nt,holes)
    for r,bgc in enumerate([(22,20,34),(205,190,160)]):
        tile=Image.new('RGB',(T,T),bgc);q=o.copy();q.thumbnail((T-10,T-10));tile.paste(q,((T-q.width)//2,(T-q.height)//2),q);sh.paste(tile,(i*T,r*T))
    dr.text((i*T+6,4),name,fill=(255,255,120))
sh.save(sys.argv[2])
