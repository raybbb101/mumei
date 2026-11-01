#!/usr/bin/env python3
# src/*.js と fx/*.png を 1 枚の mumei.html にまとめる
import base64,glob,os
here=os.path.dirname(os.path.abspath(__file__))
fx={os.path.basename(p)[:-4]:'data:image/png;base64,'+base64.b64encode(open(p,'rb').read()).decode() for p in glob.glob(here+'/fx/*.png')}
js='const FX_DATA='+repr(fx)+';\n'+'\n'.join(open(p,encoding='utf8').read() for p in sorted(glob.glob(here+'/src/*.js')))
html=open(here+'/src/page.html',encoding='utf8').read().replace('/*__JS__*/',js)
open(here+'/mumei.html','w',encoding='utf8').write(html)
print('mumei.html',len(html)//1024,'KB')
# 手元確認用(公開時に付く骨組みと同じもの)
open(here+'/play.html','w',encoding='utf8').write('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+html+'</body></html>')
