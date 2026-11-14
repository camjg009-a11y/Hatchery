import sys,os,numpy as np,time
import onnxruntime as ort
from PIL import Image, ImageDraw
from scipy.ndimage import zoom
M='/root/.rembg/models/sam/sam_vit_b_01ec64.'
def so():
    s=ort.SessionOptions(); s.enable_cpu_mem_arena=False; s.enable_mem_pattern=False; s.intra_op_num_threads=4; return s
ENC=None;DEC=None
def embed(src):
    global ENC
    key='emb/'+src.replace('/','_')+'.npy'
    im=Image.open(src).convert('RGB')
    sc=min(1024/im.width,684/im.height)
    if os.path.exists(key): return im,sc,np.load(key)
    if ENC is None: ENC=ort.InferenceSession(M+'encoder.onnx',so(),providers=['CPUExecutionProvider'])
    r=im.resize((round(im.width*sc),round(im.height*sc)),Image.BILINEAR)
    cv=np.zeros((684,1024,3),np.float32); cv[:r.height,:r.width]=np.asarray(r)
    e=ENC.run(None,{ENC.get_inputs()[0].name:cv})[0]; np.save(key,e); return im,sc,e
def sam(src,pos,neg=()):
    global DEC
    im,sc,e=embed(src)
    if DEC is None: DEC=ort.InferenceSession(M+'decoder.onnx',so(),providers=['CPUExecutionProvider'])
    pts=np.array(list(pos)+list(neg)+[(0,0)],np.float32)[None]*sc
    lab=np.array([1]*len(pos)+[0]*len(neg)+[-1],np.float32)[None]
    masks,_,_=DEC.run(None,{"image_embeddings":e,"point_coords":pts,"point_labels":lab,"mask_input":np.zeros((1,1,256,256),np.float32),"has_mask_input":np.zeros(1,np.float32),"orig_im_size":np.array((684,1024),np.float32)})
    lg=masks[0,0][:round(im.height*sc),:round(im.width*sc)]
    p=1/(1+np.exp(-np.clip(lg,-30,30)))
    p=np.asarray(Image.fromarray((p*255).astype('uint8')).resize(im.size,Image.BICUBIC))
    return im,p
def show(im,m,out,pos=(),neg=()):
    a=np.asarray(im).astype(float); bg=np.array([22,20,34.])
    al=(m/255.)[...,None]; c=Image.fromarray((a*al+bg*(1-al)).astype('uint8'))
    both=Image.new('RGB',(im.width*2,im.height)); g=im.copy(); d=ImageDraw.Draw(g)
    for x in range(0,im.width,100): d.line([(x,0),(x,im.height)],fill=(0,255,0)); d.text((x+2,2),str(x),fill=(255,255,0))
    for y in range(0,im.height,100): d.line([(0,y),(im.width,y)],fill=(0,255,0)); d.text((2,y+2),str(y),fill=(255,255,0))
    for p in pos: d.ellipse([p[0]-5,p[1]-5,p[0]+5,p[1]+5],fill=(0,255,255))
    for p in neg: d.ellipse([p[0]-5,p[1]-5,p[0]+5,p[1]+5],fill=(255,0,0))
    both.paste(g,(0,0)); both.paste(c,(im.width,0)); both.save(out)
def run(name,src,groups,out=None):
    u=None
    for g in groups:
        im,m=sam(src,g[0],g[1] if len(g)>1 else []); u=m if u is None else np.maximum(u,m)
    Image.fromarray(u).save(f'sam_{name}.png')
    allp=[p for g in groups for p in g[0]]; alln=[p for g in groups if len(g)>1 for p in g[1]]
    show(im,u,out or f's_{name}.png',allp,alln); return im,u
