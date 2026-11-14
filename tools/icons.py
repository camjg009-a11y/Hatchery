from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
im=np.array(Image.open('/mnt/user-data/attachments/795ec65c-3ffb-5d1b-b29f-806f58dde49c/c7bd394f-image.png').convert('RGB')).astype(float)
H,W,_=im.shape;C=96;out=Image.new('RGBA',(6*C,4*C))
for r in range(4):
  for c in range(6):
    cell=im[r*H//4:(r+1)*H//4,c*W//6:(c+1)*W//6]
    bg=np.median(np.concatenate([cell[:6].reshape(-1,3),cell[-6:].reshape(-1,3),cell[:,:6].reshape(-1,3),cell[:,-6:].reshape(-1,3)]),0)
    d=np.sqrt(((cell-bg)**2).sum(-1));sat=cell.max(-1)-cell.min(-1)
    near=(d<22)&(sat<14)
    lab,n=ndimage.label(near);edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bgm=np.isin(lab,list(edge))
    fg=~bgm;l2,n2=ndimage.label(fg);sz=ndimage.sum(fg,l2,range(1,n2+1));keep=[i+1 for i,v in enumerate(sz) if v>0.03*sz.max()];fg=np.isin(l2,keep)
    a=fg.astype(float);a=ndimage.gaussian_filter(a,0.8)
    # bounding box of icon
    ys,xs=np.where(a>.5);y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max()
    rgba=np.dstack([cell,a*255]).astype(np.uint8)
    t=Image.fromarray(rgba,'RGBA').crop((x0,y0,x1+1,y1+1))
    s=(C-8)/max(t.size);t=t.resize((max(1,round(t.width*s)),max(1,round(t.height*s))),Image.LANCZOS)
    out.paste(t,(c*C+(C-t.width)//2,r*C+(C-t.height)//2),t)
out.save('ui/icons.webp',quality=90,method=6)
prev=Image.new('RGBA',out.size,(40,30,50,255));prev.alpha_composite(out);prev.save('icons_prev.png')
import os;print(os.path.getsize('ui/icons.webp'))
