# Hatchery build: src/page.html + src/*.js -> hatchery.html, and copies the art it uses into art/
import base64,re,os,shutil,json
S=lambda f:open('src/'+f).read()
eng=S('battle.js')+'\n'+S('rush.js')+'\n'+S('raid.js')+'\n'+S('power.js')+'\n'+S('vfx.js').replace('__FXR__',open('fx/meta.json').read())
t=S('page.html').replace('/*@ENGINE@*/',eng.strip())
b=lambda f:base64.b64encode(open(f,'rb').read()).decode()
# only the small UI frames stay embedded; everything else is a separate published file
for k in ['panel','btn','btnp','pill','bar','div','round','card']: t=t.replace('__UI_%s__'%k.upper(),b('ui/%s.webp'%k))
os.makedirs('art',exist_ok=True); files={}
for p in sorted(set(re.findall(r'art/([a-z0-9-]+)\.webp',t))):
    if p=='icons': src='ui/icons.webp'
    elif p.startswith('fx-'): src='fx/'+p+'.webp'
    elif p.startswith('egg-'): src=p[4:]+'_t2.webp'
    elif p.startswith('bg-'): src='bg_'+p[3:]+'.webp'
    else: src='n2/'+p+'.webp'
    shutil.copyfile(src,'art/'+p+'.webp'); files['art/'+p+'.webp']='art/'+p+'.webp'
open('hatchery.html','w').write(t)
open('wrap.html','w').write('<!doctype html>\n'+t)
json.dump(files,open('files.json','w'),indent=0)
print('left',re.findall(r'__[A-Z_]+__',t),'page MB',round(len(t)/1e6,2),'files',len(files),'art MB',round(sum(os.path.getsize(f) for f in files)/1e6,2))
