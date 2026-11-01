// ── 手応えの層:火花・墨・光・止め ──
const Fx={parts:[],decals:[],sheets:{},anims:[],floats:[],lights:[],ghosts:[],
 load(){const m={parry:{fw:200,fh:112,px:100,py:96,cols:5,n:31},'crit-hit':{fw:216,fh:136,px:84,py:106,cols:5,n:28}};for(const k in m){const i=new Image();i.src=FX_DATA[k];this.sheets[k]=Object.assign({img:i},m[k]);}},
 sheet(n,x,y,flip=false,sp=1){this.anims.push({s:this.sheets[n],x,y,t:0,flip,sp});},
 sparks(x,y,n,dir,o={}){for(let i=0;i<n;i++){const a=(o.spread===undefined?1.2:o.spread)*(Math.random()-.5)+(dir>0?0:Math.PI)+(o.up||0),v=rand(o.v0||60,o.v1||260);this.parts.push({t:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:o.g===undefined?360:o.g,life:rand(.12,o.life||.42),age:0,c:o.c||(Math.random()<.5?'#fff6c8':'#ffb044')});}},
 ink(x,y,n,dir,c){for(let i=0;i<n;i++){const a=(dir>0?0:Math.PI)+rand(-.8,.5)*(dir>0?1:-1),v=rand(40,230);this.parts.push({t:'ink',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-50,g:520,life:rand(.25,.7),age:0,s:rand(1,3.2)|0||1,c:c||(Math.random()<.74?'#2a0a10':'#8c1a1e'),gy:BASE_Y+rand(-5,14)});}},
 dust(x,y,n,dir=0){for(let i=0;i<n;i++)this.parts.push({t:'dust',x:x+rand(-5,5),y:y-rand(0,2),vx:rand(-22,22)-dir*rand(14,44),vy:rand(-22,-4),g:-5,life:rand(.25,.62),age:0,s:rand(2,6)});},
 wisp(x,y,n,c='#16121a'){for(let i=0;i<n;i++)this.parts.push({t:'wisp',x:x+rand(-11,11),y:y-rand(0,58),vx:rand(-16,16),vy:rand(-52,-14),g:-10,life:rand(.5,1.2),age:0,s:rand(1,3.4)|0||1,c:Math.random()<.2?'#d84a2c':c});},
 coin(x,y){this.parts.push({t:'coin',x,y:y-30,vx:rand(-70,70),vy:rand(-170,-70),g:430,life:1.1,age:0,gy:BASE_Y});},
 float(x,y,s,c='#fff2d0',size=15){this.floats.push({x,y,s,c,size,age:0,life:.72});},
 light(x,y,c,r,life=.14){this.lights.push({x,y,c,r,age:0,life});},
 clear(){this.parts.length=0;this.decals.length=0;this.anims.length=0;this.floats.length=0;this.lights.length=0;this.ghosts.length=0;},
 update(dt){const P=this.parts;for(let i=P.length-1;i>=0;i--){const q=P[i];q.age+=dt;if(q.age>=q.life){P.splice(i,1);continue;}q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.gy&&q.y>q.gy){if(q.t==='ink'){if(this.decals.length<90)this.decals.push({x:q.x,y:q.gy,w:rand(2,8)|0,h:rand(1,2.4)|0||1,c:q.c,age:0});P.splice(i,1);continue;}q.y=q.gy;q.vy*=-.4;q.vx*=.6;}}
  for(let i=this.anims.length-1;i>=0;i--){const a=this.anims[i];a.t+=dt*30*a.sp;if(a.t>=a.s.n)this.anims.splice(i,1);}
  for(let i=this.floats.length-1;i>=0;i--){const f=this.floats[i];f.age+=dt;if(f.age>f.life)this.floats.splice(i,1);}
  for(let i=this.lights.length-1;i>=0;i--){const f=this.lights[i];f.age+=dt;if(f.age>f.life)this.lights.splice(i,1);}
  for(let i=this.decals.length-1;i>=0;i--){const d=this.decals[i];d.age+=dt;if(d.age>9)this.decals.splice(i,1);}
  for(let i=this.ghosts.length-1;i>=0;i--){const d=this.ghosts[i];d.age+=dt;if(d.age>.26)this.ghosts.splice(i,1);}},
 drawGround(g,cam){for(const d of this.decals){const a=clamp(1.6-d.age*.18);g.globalAlpha=a;g.fillStyle=d.c;g.fillRect(Math.round(d.x-cam),Math.round(d.y),d.w,d.h);}g.globalAlpha=1;},
 draw(g,cam){const ox=-cam;for(const q of this.parts){const x=Math.round(q.x+ox),y=Math.round(q.y),u=q.age/q.life;if(q.t==='spark'){g.fillStyle=u<.45?'#ffffff':q.c;const l=Math.min(6,Math.hypot(q.vx,q.vy)*.018+1);const dx=q.vx/(Math.hypot(q.vx,q.vy)||1),dy=q.vy/(Math.hypot(q.vx,q.vy)||1);for(let k=0;k<l;k++)g.fillRect(Math.round(x-dx*k),Math.round(y-dy*k),1,1);}
    else if(q.t==='ink'){g.fillStyle=q.c;g.fillRect(x,y,q.s,q.s);}
    else if(q.t==='wisp'){if(BAYER[((x&3)+(y&3)*4)]>1-u)continue;g.fillStyle=q.c;g.fillRect(x,y,q.s,q.s);}
    else if(q.t==='dust'){g.globalAlpha=(1-u)*.42;g.fillStyle=G.world?css(G.world.b.road[3]):'#c8b090';const s=Math.round(q.s*(.6+u));g.fillRect(x-(s>>1),y-(s>>1),s,s);g.globalAlpha=1;}
    else if(q.t==='coin'){g.fillStyle=(q.age*18|0)%2?'#ffe07c':'#b48228';g.fillRect(x-1,y-1,3,3);g.fillStyle='#fff';g.fillRect(x,y-1,1,1);}}
  for(const a of this.anims){const f=Math.floor(a.t),s=a.s,sx=(f%s.cols)*s.fw,sy=Math.floor(f/s.cols)*s.fh;if(s.img.complete&&s.img.naturalWidth){g.save();g.translate(Math.round(a.x+ox),Math.round(a.y));if(a.flip)g.scale(-1,1);g.drawImage(s.img,sx,sy,s.fw,s.fh,-s.px,-s.py,s.fw,s.fh);g.restore();}}
  for(const f of this.floats){const u=f.age/f.life;g.globalAlpha=clamp((1-u)*2.4);g.font=`${f.size}px "Yuji Boku","Hiragino Mincho ProN",serif`;g.textAlign='center';g.lineWidth=3;g.strokeStyle='#0c0a10';const y=f.y-ease.out3(clamp(u*2))*12;g.strokeText(f.s,f.x+ox,y);g.fillStyle=f.c;g.fillText(f.s,f.x+ox,y);g.globalAlpha=1;}
  g.globalCompositeOperation='lighter';for(const l of this.lights){const u=1-l.age/l.life,c=glow(l.c,48),r=l.r*(.7+.3*u);g.globalAlpha=u;g.drawImage(c,l.x+ox-r,l.y-r,r*2,r*2);}g.globalAlpha=1;g.globalCompositeOperation='source-over';}};
// ── ゲーム全体の状態
const G={mode:'title',time:0,lock:0,freeze:0,slow:0,slowK:1,shake:0,shakeDir:[1,0],zoom:0,flash:0,flashC:'#fff',cam:0,camMin:0,camMax:6000,en:0,ren:0,coin:0,dango:1,hpMax:100,atkBonus:0,skills:{},flags:{},quests:{},mems:[],stage:0,weather:null,world:null,enemies:[],shots:[],props:[],fieldNpcs:[],enc:null,cleared:{},kills:0,autorun:false,town:null,afterEnc:null};
const SKILLS={tsubame:{n:'燕返し',d:'三の太刀のあと、もう一度「斬」。返す刃で二度斬る。'},ryusui:{n:'流水',d:'弾きの間合いが広がり、弾いた直後の「斬」が必ず重い一太刀になる。'},issen:{n:'一閃',d:'居合を溜め切ると、間合いが倍に伸び、触れた敵の体勢を崩す。'},zanshin:{n:'残心',d:'敵を斬り伏せるたびに気が満ち、命がわずかに戻る。'}};
const SKILL_HELP=()=>Object.keys(G.skills);
// ── 敵の帳面
const ENEMY={
 ronin:{name:'はぐれ浪人',style:'ronin',hp:34,pos:22,spd:58,atk:['eSlash'],space:46,cd:[1.3,2.5],coin:3},
 karasu:{name:'鴉面',style:'karasu',hp:42,pos:26,spd:74,atk:['eSlash','eSlash','eDash'],space:48,cd:[1,2],coin:5,aspd:1.1},
 ashigaru:{name:'足軽',style:'ashigaru',hp:38,pos:26,spd:52,atk:['eThrust'],space:84,cd:[1.4,2.6],coin:4,drawn:true},
 shinobi:{name:'影衆',style:'shinobi',hp:28,pos:18,spd:112,atk:['eDash','eThrow','eThrow'],space:92,cd:[.9,1.9],coin:5,aspd:1.08,jumpy:true},
 oni:{name:'鬼武者',style:'oni',hp:120,pos:70,spd:44,atk:['eSlam','eSlash'],space:58,cd:[1.4,2.4],coin:14,armor:true,aspd:.94},
 spirit:{name:'怨霊武者',style:'spirit',hp:46,pos:30,spd:68,atk:['eSlash','eDash'],space:46,cd:[1,1.9],coin:6,aspd:1.1,light:'#7fdcf4'},
 // 将
 oboro:{name:'鴉の頭目・朧',style:'oboro',hp:210,pos:80,spd:120,atk:['eDash','eThrow','eSlash','eDash'],space:70,cd:[.6,1.3],coin:50,boss:true,aspd:1.1,jumpy:true},
 oniwa:{name:'槍鬼・鬼庭剛右衛門',style:'oni',hp:360,pos:130,spd:52,atk:['eSlam','eSlash','eSlam'],space:62,cd:[.9,1.7],coin:80,boss:true,armor:true,scale:1.14},
 oboro2:{name:'鴉の頭目・朧(手負い)',style:'oboro',hp:300,pos:110,spd:136,atk:['eDash','eDash','eThrow','eSlash'],space:64,cd:[.45,1],coin:90,boss:true,aspd:1.22,jumpy:true},
 takamaru:{name:'藤堂鷹丸',style:'takamaru',hp:520,pos:170,spd:104,atk:['eSlash','eDash','eSlash','eThrust2'],space:52,cd:[.45,1.05],coin:0,boss:true,aspd:1.26,combo:.55,parrier:true},
 katsuragi:{name:'老剣士・葛城',style:'katsuragi',hp:90,pos:60,spd:60,atk:['eSlash','eSlash'],space:48,cd:[1,1.8],coin:0,boss:true,aspd:.98,spar:true},
 mukuu:{name:'剣僧・無空',style:'mukuu',hp:150,pos:90,spd:82,atk:['eSlash','eDash','eThrust2'],space:52,cd:[.8,1.5],coin:0,boss:true,aspd:1.08,spar:true},
 bandit:{name:'野盗',style:'ronin',hp:26,pos:18,spd:62,atk:['eSlash'],space:46,cd:[1.6,3],coin:4},
};
CL.eThrust2=clip(.8,[K(0,{}),K(.3,{hx:-8,hy:24,lean:-.15,tw:.8,rx:-4,ry:37,rz:4,sw:.02,frx:7,flx:-15},ease.out),K(.4,{hx:-9,hy:24,lean:-.18,tw:.82,rx:-5,ry:37,sw:.02,frx:7,flx:-15}),K(.45,{hx:13,hy:25,lean:.55,tw:-.85,rx:29,ry:38,rz:3,sw:.01,frx:25,flx:-13},ease.in3),K(.6,{hx:13,hy:25,lean:.52,tw:-.85,rx:28,ry:37,sw:.01,frx:25,flx:-13}),K(.8,{},ease.io)],{active:[.41,.5],tele:[0,.4],reach:62,dmg:13,lunge:70,lungeAt:[.4,.46],sfx:'swing2',red:true,hitH:[12,60],thrust:true});
const ACTOR_S=1.12;
class Fighter{constructor(style,x){this.av=makeAvatar(style);this.x=x;this.y=0;this.vx=0;this.vy=0;this.face=1;this.spd=0;this.depth=0;}
  get sx(){return this.x-G.cam+W/2;}
  draw(g,o={}){const s=(this.def&&this.def.scale||1)*ACTOR_S;drawRig(g,this.av,this.sx,BASE_Y+this.depth+this.y,Object.assign({scale:s,yaw:.45,mirror:this.face<0},o));}
  shadow(g){const sy=BASE_Y+this.depth+1,hw=clamp(15+this.y*.06,7,20),sx=Math.round(this.sx);g.fillStyle='rgba(8,6,14,.34)';for(let j=-2;j<=2;j++){const w=Math.round(hw*Math.sqrt(1-j*j/9));g.fillRect(sx-w,sy+j,w*2,1);}}}
function trailStep(F,dt,record,col){const A=F.av,T=A.trail;for(const q of T){q.life-=dt*4.6;}while(T.length&&T[0].life<=0)T.shift();if(record&&A.clip){const o={yaw:.45,mirror:F.face<0,scale:(F.def&&F.def.scale||1)*ACTOR_S},t1=A.ct,t0=A.trailClip===A.clip&&A.trailLast<=t1?A.trailLast:t1;for(let k=1;k<=5;k++){const u=t0+(t1-t0)*k/5;T.push({p:bladePts(A,o,sampleClip(A.clip,u)),life:1});if(t0===t1)break;}A.trailLast=t1;A.trailClip=A.clip;while(T.length>42)T.shift();}}
// ── 主人公
const P={f:null,state:'free',hp:100,ki:60,combo:0,buf:0,atkT:0,hitset:null,guardT:0,iaiT:0,inv:0,drawn:false,sheathT:0,ground:true,counter:0,dodgeDir:1,noto:false,ghostT:0};
function resetPlayer(x){if(!P.f)P.f=new Fighter('hero',x);P.f.x=x;P.f.y=0;P.f.vy=0;P.f.vx=0;P.f.face=1;P.state='free';P.inv=0;P.drawn=false;P.combo=0;P.buf=0;P.f.av.clip=null;P.f.av.holdPose=null;P.f.av.trail.length=0;}
function hitstop(t){G.freeze=Math.max(G.freeze,t);}
function slowmo(t,k=.25){G.slow=Math.max(G.slow,t);G.slowK=k;}
function shake(a,dir){G.shake=Math.max(G.shake,a);G.shakeDir=dir||[1,0];}
function flash(a,c='#ffffff'){G.flash=Math.max(G.flash,a);G.flashC=c;}
function bladeTip(F){const A=F.av,s=(F.def&&F.def.scale||1)*ACTOR_S*(A.style.scale||1);const b=bladePts(A,{yaw:.45,mirror:F.face<0,scale:(F.def&&F.def.scale||1)*ACTOR_S});return[F.x+b[0],BASE_Y+F.depth+F.y+b[1]];}
function startAttack(){const f=P.f,air=!P.ground;let c;if(air)c=CL.air;else{if(P.counter>0){c=CL.slash3;P.combo=0;}else{P.combo=P.combo%(G.skills.tsubame?4:3);c=[CL.slash1,CL.slash2,CL.slash3,CL.tsubame][P.combo];P.combo++;}}
  P.state='attack';P.drawn=true;P.atk=c;P.hitset=new Set();P.hitPhase=0;P.buf=0;P.sheathT=0;play(f.av,c,1,.025);P.atkFired=false;
  const dirKey=(Input.down.right?1:0)-(Input.down.left?1:0);if(dirKey)f.face=dirKey;else{const e=nearestEnemy(90);if(e)f.face=Math.sign(e.x-f.x)||f.face;}}
function nearestEnemy(r){let b=null,bd=r;for(const e of G.enemies){if(e.state==='dead')continue;const d=Math.abs(e.x-P.f.x);if(d<bd){bd=d;b=e;}}return b;}
function playerUpdate(dt){const f=P.f,A=f.av,lock=G.lock>0;let dir=0;const inp=lock?{}:Input.down;if(inp.right)dir++;if(inp.left)dir--;
  const hit=a=>!lock&&Input.hit(a);
  if(hit('autorun')){G.autorun=!G.autorun;UI.toast(G.autorun?'常に走る':'歩きを基本にする');}
  if(hit('item'))useDango();
  P.inv=Math.max(0,P.inv-dt);P.counter=Math.max(0,P.counter-dt);P.ki=Math.min(100,P.ki+dt*7);
  if(hit('slash'))P.buf=.2;P.buf=Math.max(0,P.buf-dt);
  const wasGround=P.ground;const running=(inp.run||G.autorun||Input.touchRun);
  switch(P.state){
   case'free':{const target=dir*(running?172:66);f.vx=lerp(f.vx,target,1-Math.exp(-dt*(dir?10:14)));if(dir)f.face=dir;
     if(hit('jump')&&P.ground){f.vy=-286;P.ground=false;Fx.dust(f.x,BASE_Y,6);Audio2.sfx('dodge');}
     if(P.buf>0&&!G.noCombat){startAttack();break;}
     if(hit('dodge')&&P.ki>=10&&P.ground){P.state='dodge';P.ki-=10;P.dodgeDir=dir||-f.face;P.t=0;P.inv=.27;P.drawn=true;play(A,CL.dodge,1,.02);if(P.dodgeDir!==f.face)A.pose[PI.lean]*=-1;Audio2.sfx('dodge');Fx.dust(f.x,BASE_Y,7,P.dodgeDir);break;}
     if(Input.down.guard&&!lock&&P.ground&&!G.noCombat){P.state='guard';P.guardT=0;P.drawn=true;play(A,CL.parry,1,.025);P.guardHeld=true;break;}
     if(Input.down.iai&&!lock&&P.ground&&!G.noCombat&&P.ki>=8){P.state='iai';P.iaiT=0;P.t=0;A.clip=null;A.holdPose=pose({hx:-3,hy:22,lean:.46,tw:.52,hp:-.22,rx:5,ry:30,rz:-1,lx:1,ly:31,lz:-6,frx:11,flx:-13,sw:-.1,grip:0,shea:1});A.from=A.pose.slice();A.blendT=A.blend=.08;Audio2.sfx('step');break;}
     if(P.drawn&&!G.enemies.length&&!lock){P.sheathT+=dt;if(P.sheathT>1.5&&P.ground&&Math.abs(f.vx)<20){P.state='noto';play(A,CL.noto,1,.08);P.t=0;P.noto=false;}}
     break;}
   case'attack':{const c=P.atk,t=A.ct;f.vx*=Math.exp(-dt*12);
     if(c.lunge){const end=c.active[1];if(t<end&&t>c.active[0]*.5){f.vx=f.face*c.lunge/Math.max(.05,end-c.active[0]*.5);}}
     if(!P.atkFired&&t>=c.active[0]*.75){P.atkFired=true;Audio2.sfx(c.sfx);}
     if(c.multi&&!P.hitPhase&&t>c.active[0]+(c.active[1]-c.active[0])*.55){P.hitPhase=1;P.hitset=new Set();Audio2.sfx('swing');}
     if(t>=c.active[0]&&t<=c.active[1])swordHits(c);
     if(t>=c.active[0]-.03&&t<=c.active[1]+.03)trailStep(f,0,true);
     const cancel=t>c.active[1]+.04;if(cancel&&P.buf>0&&(P.ground||c===CL.air)){if(P.ground)startAttack();}
     else if(cancel&&hit('dodge')&&P.ki>=10&&P.ground){P.state='dodge';P.ki-=10;P.dodgeDir=dir||-f.face;P.t=0;P.inv=.27;play(A,CL.dodge,1,.02);Audio2.sfx('dodge');Fx.dust(f.x,BASE_Y,7,P.dodgeDir);}
     else if(cancel&&Input.down.guard&&!lock&&P.ground){P.state='guard';P.guardT=0;play(A,CL.parry,1,.025);}
     if(!A.clip){P.state='free';P.comboT=0;P.combo=P.buf>0?P.combo:0;}
     break;}
   case'guard':{P.guardT+=dt;f.vx*=Math.exp(-dt*14);if(A.clip&&A.ct>.3)A.ct=.2;if(!Input.down.guard||lock){P.state='free';stopClip(A,.1);}break;}
   case'clash':{f.vx*=Math.exp(-dt*7);if(!A.clip)P.state='free';if(P.buf>0&&A.ct>.05){startAttack();}break;}
   case'iai':{P.t+=dt;P.iaiT=P.t;f.vx*=Math.exp(-dt*14);const full=P.t>.55;if(full&&!P.iaiFull){P.iaiFull=true;Audio2.sfx('select');Fx.light(f.x+f.face*4,BASE_Y-30,'#c8e8ff',36,.3);}if(!P.iaiFull&&Math.random()<dt*14)Fx.sparks(f.x+rand(-14,14),BASE_Y-rand(0,16),1,1,{spread:.4,up:-1.57,v0:20,v1:60,g:-40,life:.4,c:'#a8d8ff'});
     if(!Input.down.iai||lock){doIai(P.t);}break;}
   case'iaiDash':{P.t+=dt;const k=P.iaiDist/.1;if(P.t<.1){f.vx=f.face*k;ghost(f);}else f.vx*=Math.exp(-dt*24);iaiHits();if(P.t>.52){P.state='noto';play(A,CL.noto,1.15,.08);P.t=0;P.noto=false;P.iaiFull=false;}break;}
   case'noto':{f.vx*=Math.exp(-dt*12);P.t+=dt;const pct=A.clip?A.ct:9;if(!P.noto&&pct>.5){P.noto=true;Audio2.tone&&Audio2.tone(2400,.08,.1,'square');Audio2.tone(3200,.05,.07,'square',.03);P.drawn=false;}if(!A.clip){P.state='free';P.drawn=false;}if(dir||hit('jump')){if(pct>.5){P.drawn=false;}P.state='free';stopClip(A,.12);}if(P.buf>0){P.drawn=true;startAttack();}break;}
   case'dodge':{P.t+=dt;const u=P.t/.2;if(u<1)f.vx=P.dodgeDir*lerp(330,120,u);else f.vx*=Math.exp(-dt*10);ghost(f);if(!A.clip){P.state='free';}if(P.t>.24&&P.buf>0){startAttack();}break;}
   case'hurt':{f.vx*=Math.exp(-dt*8);if(!A.clip)P.state='free';break;}
   case'dead':{f.vx*=Math.exp(-dt*6);break;}
   case'cut':{f.vx=0;break;}
  }
  // 物理
  f.x+=f.vx*dt;if(!P.ground||f.vy){f.vy+=760*dt;f.y+=f.vy*dt;if(f.y>=0){f.y=0;f.vy=0;P.ground=true;if(!wasGround||true){Fx.dust(f.x,BASE_Y,5);Audio2.sfx('land');}}else P.ground=false;}
  f.x=clamp(f.x,G.camMin+18,G.camMax-18);
  if(P.state==='free'&&!P.ground&&!A.clip){A.holdPose=f.vy<0?pose({hy:32,lean:.12,hp:-.1,frx:7,fry:16,flx:-7,fly:21,rx:P.drawn?10:3,ry:P.drawn?38:36,rz:5,lx:P.drawn?5:0,ly:33,sw:P.drawn?.9:-1.3,grip:P.drawn?1:0,shea:P.drawn?0:1}):pose({hy:32,lean:.02,hp:.05,frx:6,fry:9,flx:-8,fly:13,rx:P.drawn?10:0,ry:P.drawn?40:40,rz:6,lx:P.drawn?5:-3,ly:39,sw:P.drawn?1.1:-1.3,grip:P.drawn?1:0,shea:P.drawn?0:1});}
  else if(P.state==='free'&&P.ground&&A.holdPose){A.holdPose=null;A.from=A.pose.slice();A.blendT=A.blend=.07;}
  if(P.state==='free'&&Math.abs(f.vx)>30&&P.ground){f.stepT=(f.stepT||0)+Math.abs(f.vx)*dt;if(f.stepT>42){f.stepT=0;Audio2.sfx('step');if(Math.abs(f.vx)>120)Fx.dust(f.x-f.face*6,BASE_Y,1,f.face);}}
  if(P.state==='free'&&P.buf>0&&!P.ground&&!G.noCombat){startAttack();}
  animate(A,dt,Math.abs(f.vx),P.drawn);stepChains(A,dt,f.vx*f.face*dt*.8,1);trailStep(f,dt,false);
}
function ghost(f){P.ghostT=(P.ghostT||0)-1;if(P.ghostT>0)return;P.ghostT=3;const c=mkCanvas(BW,BH),g=c.getContext('2d'),A=f.av;const ch=A.chains,tr=A.trail;A.chains=null;A.trail=[];drawRig(g,A,BW/2,BH-22,{scale:ACTOR_S,yaw:.45,mirror:f.face<0});A.chains=ch;A.trail=tr;g.globalCompositeOperation='source-atop';g.fillStyle='#7ab8ff';g.fillRect(0,0,BW,BH);Fx.ghosts.push({c,x:f.x,y:f.y+f.depth,age:0});if(Fx.ghosts.length>6)Fx.ghosts.shift();}
function swordHits(c){const f=P.f,reach=c.reach*ACTOR_S;for(const e of G.enemies){if(e.state==='dead'||P.hitset.has(e))continue;const dx=(e.x-f.x)*f.face;if(dx<-10||dx>reach)continue;const ey=e.y,py=f.y;if(Math.abs(ey-py)>58)continue;P.hitset.add(e);const dmg=(c.dmg+G.atkBonus)*(P.counter>0?2.2:1);damageEnemy(e,dmg,c.heavy||P.counter>0,f.face);P.counter=0;}}
function doIai(ch){const f=P.f,A=f.av,full=ch>.55;A.holdPose=null;if(ch<.12){P.state='free';P.iaiFull=false;A.from=A.pose.slice();A.blendT=A.blend=.08;return;}
  const lv=full?(G.skills.issen?2:1):0;P.iaiLv=lv;P.iaiDist=lv===2?230:lv===1?140:62;P.state='iaiDash';P.t=0;P.inv=.26;P.ki=Math.max(0,P.ki-(lv?26:8));P.drawn=true;P.hitset=new Set();
  const cl=clip(.5,[K(0,{hx:-3,hy:22,lean:.46,tw:.52,hp:-.22,rx:5,ry:30,rz:-1,lx:1,ly:31,lz:-6,frx:11,flx:-13,sw:-.1,grip:0,shea:1}),K(.03,{hx:6,hy:18,lean:.62,tw:-.3,rx:22,ry:32,rz:5,sw:-.05,grip:0,lx:-4,ly:31,lz:-7,frx:22,flx:-16,shea:0},ease.out5),K(.1,{hx:8,hy:19,lean:.42,tw:-1,rx:24,ry:41,rz:6,sw:.72,grip:0,lx:-7,ly:31,lz:-7,frx:27,flx:-18,shea:0},ease.out3),K(.32,{hx:8,hy:19,lean:.42,tw:-1,rx:24,ry:42,rz:6,sw:.78,grip:0,lx:-7,ly:31,lz:-7,frx:27,flx:-18,shea:0}),K(.5,{hx:6,hy:23,lean:.2,tw:-.3,rx:17,ry:37,rz:4,sw:.5,grip:.5,frx:18,flx:-14,shea:0},ease.io)]);
  play(A,cl,1,.01);trailStep(f,0,true);Audio2.sfx('iai');Fx.dust(f.x,BASE_Y,10,f.face);if(lv){flash(.26,'#dff0ff');shake(3,[f.face,0]);Fx.light(f.x+f.face*50,BASE_Y-30,'#a8d8ff',96,.22);}P.iaiFull=false;
  G.iaiLine={x0:f.x,x1:f.x+f.face*P.iaiDist,y:BASE_Y-32,age:0,lv};}
function iaiHits(){const f=P.f;trailStep(f,0,P.t<.14);if(P.t>.2)return;for(const e of G.enemies){if(e.state==='dead'||P.hitset.has(e))continue;const dx=(e.x-f.x)*f.face;if(dx<-90||dx>44)continue;P.hitset.add(e);const d=(P.iaiLv===2?64:P.iaiLv===1?46:22)+G.atkBonus;damageEnemy(e,d,P.iaiLv>0,f.face,P.iaiLv===2);}}
function damageEnemy(e,dmg,heavy,dir,breakPos){const d=e.def;const parried=d.parrier&&e.state!=='atk'&&e.state!=='stagger'&&Math.random()<.34;
  if(parried&&!heavy){Audio2.sfx('clang');Fx.sparks(e.x-dir*12,BASE_Y-36,10,-dir);Fx.float(e.x,BASE_Y-74,'弾','#bfe0ff');hitstop(.06);e.face=-dir;play(e.f.av,CL.clash,1,.02);e.state='spar';e.timer=.1;return;}
  e.hp-=dmg;e.posture-=dmg*(heavy?1.5:1);e.f.av.flash=1;e.f.vx=dir*(heavy?120:70)*(d.armor?.3:1);
  const hy=BASE_Y-rand(28,48);Fx.ink(e.x,hy,heavy?26:12,dir);Fx.sparks(e.x-dir*2,hy,heavy?10:5,dir,{c:'#ffdca0'});Fx.light(e.x,hy,'#ffd8b0',heavy?56:34,.12);Audio2.sfx(heavy?'heavy':'hit');hitstop(heavy?.095:.055);shake(heavy?4.5:2,[dir,.2]);G.zoom=Math.max(G.zoom,heavy?.03:.012);P.ki=Math.min(100,P.ki+(heavy?5:3));
  if(heavy)Fx.sheet('crit-hit',e.x,BASE_Y-32,dir<0,1.2);
  if(e.hp<=0){killEnemy(e,dir);return;}
  if(breakPos||e.posture<=0){if(e.state==='atk')G.tokens=Math.max(0,G.tokens-1);e.state='stagger';e.timer=d.boss?1.5:1.1;e.posture=d.pos;e.f.av.flash=1;play(e.f.av,CL.stagger,d.boss?.62:.82,.02);Fx.float(e.x,BASE_Y-78,'崩','#ffcf7a');Audio2.sfx('block');return;}
  if(!d.armor&&!d.boss){if(e.state==='atk')G.tokens=Math.max(0,G.tokens-1);e.state='hurt';e.timer=.26;play(e.f.av,CL.hurt,1.1,.02);}
  else if(!d.armor&&e.state!=='atk'&&Math.random()<.4){e.state='hurt';e.timer=.22;play(e.f.av,CL.hurt,1.3,.02);}}
function killEnemy(e,dir){if(e.state==='atk')G.tokens=Math.max(0,G.tokens-1);e.state='dead';e.timer=0;G.kills++;const d=e.def;play(e.f.av,CL.die,1,.02);e.f.av.clip=Object.assign({},CL.die,{hold:true});e.f.vx=dir*90;Fx.ink(e.x,BASE_Y-36,36,dir);for(let i=0;i<(d.coin||0);i++)Fx.coin(e.x,BASE_Y);G.coin+=d.coin||0;
  if(G.skills.zanshin){P.ki=Math.min(100,P.ki+18);P.hp=Math.min(G.hpMax,P.hp+4);}
  const alive=G.enemies.filter(q=>q.state!=='dead').length,last=alive===0&&(!G.enc||G.enc.wave>=G.enc.def.waves.length-1);
  if(last||d.boss){slowmo(d.boss?1.1:.55,.14);flash(d.boss?.8:.42,'#ffffff');hitstop(.12);G.zoom=Math.max(G.zoom,.06);shake(7,[dir,.1]);Audio2.sfx('kill');Fx.sheet('crit-hit',e.x,BASE_Y-32,dir<0,.9);G.killLine={age:0,x:e.x,dir};}
}
// 敵に打たれる
function hitPlayer(e,c,opts={}){const f=P.f,dir=Math.sign(f.x-e.x)||1;if(P.state==='dead'||P.state==='cut')return false;
  if(P.inv>0){if(P.state==='dodge'&&!P.mikiri){P.mikiri=true;slowmo(.26,.3);Fx.float(f.x,BASE_Y-82,'見切','#bfe8ff');P.ki=Math.min(100,P.ki+12);setTimeout(()=>P.mikiri=false,300);}return false;}
  const facing=(f.face===-dir);
  if(P.state==='guard'&&facing){const win=G.skills.ryusui?.26:.18;
    if(P.guardT<win){ // 弾き
      Audio2.sfx('clang');const hx=f.x+f.face*26,hy=BASE_Y-48;Fx.sheet('parry',hx,hy+30,f.face<0,1.2);Fx.light(hx,hy,'#fff0c0',90,.2);flash(.2,'#fff6e0');hitstop(.1);slowmo(.34,.26);shake(3,[f.face,0]);Fx.float(hx,hy-26,'弾','#ffe7a0',18);play(f.av,CL.clash,1,.02);P.state='clash';P.ki=Math.min(100,P.ki+18);if(G.skills.ryusui)P.counter=.9;
      if(e){e.posture-=e.def.boss?34:999;if(e.posture<=0){e.posture=e.def.pos;if(e.state==='atk')G.tokens=Math.max(0,G.tokens-1);e.state='stagger';e.timer=e.def.boss?1.3:1.1;play(e.f.av,CL.stagger,e.def.boss?.7:.85,.02);Fx.float(e.x,BASE_Y-78,'崩','#ffcf7a');e.f.vx=-dir*-1*70;}else{e.f.vx=-dir*-1*50;}}
      return false;}
    if(!c.red&&P.ki>0){Audio2.sfx('block');P.ki-=20;Fx.sparks(f.x+f.face*16,BASE_Y-44,6,f.face);f.vx=dir*90;P.guardT=.3;hitstop(.04);shake(1.5);if(P.ki<=0){P.ki=0;P.state='hurt';play(f.av,CL.stagger,1.1,.02);Fx.float(f.x,BASE_Y-82,'崩','#ff9c7a');}return false;}}
  const dmg=c.dmg*(G.hardMul||1);P.hp-=dmg;P.inv=.7;f.av.flash=1;f.vx=dir*170;f.vy=f.y<0?f.vy:0;Fx.ink(f.x,BASE_Y-38,16,dir,'#6e1216');Audio2.sfx('hurt');hitstop(.08);shake(5,[dir,.3]);flash(.22,'#ff4030');G.zoom=Math.max(G.zoom,.02);P.combo=0;
  if(P.hp<=0){P.hp=0;P.state='dead';play(f.av,CL.die,.9,.03);f.av.clip=Object.assign({},CL.die,{hold:true});slowmo(1,.25);Audio2.sfx('kill');setTimeout(()=>Game.onPlayerDown(),1400);return true;}
  P.state='hurt';play(f.av,CL.hurt,1,.02);return true;}
function spawnEnemy(type,x,side){const d=ENEMY[type],e={def:d,type,f:new Fighter(d.style,x),state:'approach',hp:d.hp*(G.hardHp||1),hpMax:d.hp*(G.hardHp||1),posture:d.pos,timer:rand(.2,.8),seed:rand(10)};e.f.def=d;e.f.depth=Math.round(rand(-5,6));e.x=x;e.y=0;e.f.face=side;if(d.drawn!==false)e.drawn=true;G.enemies.push(e);return e;}
function enemyUpdate(e,dt){const d=e.def,f=e.f,A=f.av,pf=P.f;e.x=f.x;e.y=f.y;const dist=pf.x-f.x,ad=Math.abs(dist),sd=Math.sign(dist)||1;const lock=G.lock>0;let want=0;
  const aspd=(d.aspd||1)*(d.boss&&e.hp<e.hpMax*.5?1.14:1);
  switch(e.state){
   case'approach':f.face=sd;if(!lock){if(ad>d.space+8)want=sd*d.spd*(ad>190?1.4:1);else{e.state='spar';e.timer=rand(.15,.8);}}break;
   case'spar':f.face=sd;e.timer-=dt;if(!lock){e.dance=(e.dance||rand(1)<.5?1:-1);if(ad>d.space+26)want=sd*d.spd;else if(ad<d.space-18)want=-sd*d.spd*.8;else want=Math.sin(G.time*1.6+e.seed*5)*d.spd*.33;
      const cap=d.boss?2:(G.enemies.length>3?2:1);if(e.timer<=0&&(G.tokens||0)<cap&&P.state!=='dead'&&P.state!=='cut'){const name=d.atk[Math.floor(Math.random()*d.atk.length)],c=CL[name];const need=c.reach?(c.lunge||0)*.8+c.reach*.8:400;if(ad<need+6||c.throwAt){e.state='atk';e.atk=c;G.tokens=(G.tokens||0)+1;play(A,c,aspd,.05);e.hasHit=false;e.teled=false;e.fired=false;e.thrown=false;}else{want=sd*d.spd;e.timer=.1;}}}break;
   case'atk':{const c=e.atk,t=A.ct;if(c.tele&&!e.teled&&t>=c.tele[1]-.12/aspd){e.teled=true;const[tx,ty]=bladeTip(f);Fx.parts.push({t:'spark',x:tx,y:ty,vx:0,vy:0,g:0,life:.14,age:0,c:'#fff'});Fx.light(tx,ty,c.red?'#ff4a30':'#fff6d0',c.red?46:26,.2);if(c.red){Fx.float(f.x,BASE_Y-(d.scale?96:82)*(A.style.scale||1),'危','#ff5038',17);Audio2.tone(880,.12,.09,'square',0,.7);}else Audio2.tone(1560,.06,.05,'square');}
      if(c.lungeAt&&t>=c.lungeAt[0]&&t<=c.lungeAt[1]){want=f.face*c.lunge/(c.lungeAt[1]-c.lungeAt[0]);e.rawV=want;}
      if(c.active&&t>=c.active[0]-.02&&t<=c.active[1]+.05)trailStep(f,0,true);
      if(!e.fired&&c.active&&t>=c.active[0]){e.fired=true;Audio2.sfx(c.sfx);if(c.slam){}}
      if(c.active&&!e.hasHit&&t>=c.active[0]&&t<=c.active[1]){const rch=(c.reach*(A.style.scale||1))*ACTOR_S,dx=(pf.x-f.x)*f.face;if(dx>-12&&dx<rch&&(pf.y>-(c.thrust?26:42))){e.hasHit=true;hitPlayer(e,c);}}
      if(c.slam&&t>=c.active[1]&&!e.slammed){e.slammed=true;Audio2.sfx('heavy');shake(7,[0,1]);Fx.dust(f.x+f.face*44,BASE_Y,18);Fx.sparks(f.x+f.face*44,BASE_Y-2,12,f.face,{spread:2.4,up:-1.2,g:520,c:'#ffc060'});G.zoom=Math.max(G.zoom,.02);if(P.ground&&Math.abs(pf.x-(f.x+f.face*44))<78&&P.inv<=0&&P.state!=='guard'){hitPlayer(e,{dmg:8,red:true});}}
      if(c.throwAt&&!e.thrown&&t>=c.throwAt){e.thrown=true;Audio2.sfx('swing');G.shots.push({x:f.x+f.face*18,y:BASE_Y-40,vx:f.face*(d.boss?300:250),life:2.4,rot:0,e});}
      if(!A.clip){G.tokens=Math.max(0,(G.tokens||0)-1);e.slammed=false;if(d.combo&&Math.random()<d.combo){e.state='spar';e.timer=0;}else{e.state='spar';e.timer=rand(d.cd[0],d.cd[1])*(d.boss&&e.hp<e.hpMax*.5?.75:1);}}
      break;}
   case'hurt':e.timer-=dt;if(!A.clip||e.timer<=0){e.state='spar';e.timer=rand(.15,.7);stopClip(A,.1);}break;
   case'stagger':e.timer-=dt;if(e.timer<=0){e.state='spar';e.timer=rand(.1,.45);stopClip(A,.12);}break;
   case'dead':e.timer+=dt;if(e.timer>.8){A.dissolve=clamp((e.timer-.8)/.7);if(Math.random()<dt*30)Fx.wisp(f.x,BASE_Y,1);}if(e.timer>1.6)e.gone=true;break;
  }
  if(e.state==='atk'&&e.rawV&&A.ct<=e.atk.lungeAt[1]){f.vx=e.rawV;e.rawV=0;}else if(e.state==='hurt'||e.state==='stagger'||e.state==='dead'||e.state==='atk')f.vx*=Math.exp(-dt*7);else f.vx=lerp(f.vx,want,1-Math.exp(-dt*9));
  f.x+=f.vx*dt;
  // 重なりを避ける
  for(const o of G.enemies){if(o===e||o.state==='dead')continue;const dx=f.x-o.f.x;if(Math.abs(dx)<20){f.x+=Math.sign(dx||1)*dt*42;}}
  if(G.enc){f.x=clamp(f.x,G.camMin+6,G.camMax-6);}
  animate(A,dt,Math.abs(f.vx),e.drawn);stepChains(A,dt,f.vx*f.face*dt*.8,1);trailStep(f,dt,false);}
// 手裏剣
function shotsUpdate(dt){for(let i=G.shots.length-1;i>=0;i--){const s=G.shots[i];s.x+=s.vx*dt;s.life-=dt;s.rot+=dt*24;const f=P.f;let del=s.life<=0;if(Math.abs(s.x-f.x)<14&&f.y>-44&&!del){if(s.back){}else{const r=hitPlayer(s.e,{dmg:7,red:false});if(!(P.inv>0&&P.state==='dodge')){del=true;}if(P.state==='clash'){s.vx=-s.vx*1.4;s.back=true;del=false;}}}
    if(s.back){for(const e of G.enemies){if(e.state!=='dead'&&Math.abs(e.f.x-s.x)<16){damageEnemy(e,14,false,Math.sign(s.vx));del=true;}}}
    if(del)G.shots.splice(i,1);}}
function shotsDraw(g){for(const s of G.shots){const x=Math.round(s.x-G.cam+W/2),y=s.y;g.fillStyle='#d8e4ec';const k=(s.rot|0)%2;if(k){g.fillRect(x-3,y,7,1);g.fillRect(x,y-3,1,7);}else{for(let i=-2;i<=2;i++){g.fillRect(x+i,y+i,1,1);g.fillRect(x+i,y-i,1,1);}}g.fillStyle='#2a2830';g.fillRect(x,y,1,1);}}
function useDango(){if(G.dango<=0){UI.toast('団子がない');return;}if(P.hp>=G.hpMax){UI.toast('今は腹が減っていない');return;}G.dango--;P.hp=Math.min(G.hpMax,P.hp+45);Audio2.sfx('coin');Fx.float(P.f?P.f.x:0,BASE_Y-82,'団子','#fff0c0');UI.toast('団子を食べた。命が少し戻る');}
