// ── 舞台監督:野外・町・切替・保存 ──
const cv=$('c'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const F=mkCanvas(W,STRIP_H),fg=F.getContext('2d');fg.imageSmoothingEnabled=false;
const TF=mkCanvas(W,H),tg=TF.getContext('2d');tg.imageSmoothingEnabled=false;
// 上下の帯(漆に金の細線、麻の葉をうっすら)
const BAR=(()=>{const p=new Pix(W,STRIP_T);for(let y=0;y<STRIP_T;y++)for(let x=0;x<W;x++){const n=fbm(x*.03,y*.09,3);let c=mixc(hex('#120e16'),hex('#1c1520'),n);const a=((x+(Math.floor(y/12)%2)*12)%24),b=y%12;if(Math.abs(a-12)===Math.abs(b-6)*2||a===12)c=mixc(c,hex('#3a2c20'),.32);p.set(x,y,c);}return p.flush();})();
const FUSUMA={};
function drawBars(g,k){if(k<=0)return;const h=Math.round(STRIP_T*k);g.drawImage(BAR,0,STRIP_T-h,W,h,0,0,W,h);g.save();g.translate(0,H);g.scale(1,-1);g.drawImage(BAR,0,STRIP_T-h,W,h,0,0,W,h);g.restore();g.fillStyle='#cda451';g.fillRect(0,h,W,1);g.fillRect(0,H-h-1,W,1);g.fillStyle='#000';g.fillRect(0,h+1,W,1);g.fillRect(0,H-h-2,W,1);}
const Game={duelCtx:null,fieldNpcs:[],
 reset(){Object.assign(G,{time:0,lock:0,freeze:0,slow:0,shake:0,zoom:0,flash:0,en:0,ren:0,coin:0,dango:1,hpMax:100,atkBonus:0,skills:{},flags:{},quests:{},mems:[],stage:0,enemies:[],shots:[],enc:null,cleared:{},kills:0,autorun:false,town:null,tokens:0,noCombat:false,mode:'field'});P.hp=100;P.ki=60;},
 async newGame(){Game.reset();UI.hud(false);$('title').style.opacity=0;setTimeout(()=>$('title').style.display='none',1000);await Game.startStage(0,{skipCard:true,noIntro:true});G.lock++;UI.hud(false);await UI.flash(['','無 銘',''],{auto:1.6});UI.hud(true);UI.place(STAGES[0].sub);await Story.prologue();UI.chapter(STAGES[0].title,STAGES[0].sub);G.lock--;Game.save();},
 async startStage(i,o={}){G.stage=i;const d=STAGES[i];G.mode='field';G.def=d;G.world=bakeWorld(d.biome);setLight(G.world.b);Fx.clear();G.enemies=[];G.shots=[];G.enc=null;G.props=[];d.deco(G.props);if(d.town)G.props.push(new Prop(d.gateX,.86,sprite('gate_'+d.town,()=>sprGate(TOWN_DEF[d.town].name)),8,.05));G.weather=new Weather(G.world.b.weather,G.world.b.weather==='snow'?90:G.world.b.weather==='firefly'?26:G.world.b.weather==='maple'?46:30);resetPlayer(o.x||d.start);if(!P.f.av)return;G.camMin=0;G.camMax=d.len;G.cam=clamp(P.f.x+60,W/2,d.len-W/2);Game.fieldNpcs=d.npcs.map(n=>({def:n,av:makeAvatar(n.style),x:n.x}));UI.hud(true);UI.place(d.sub);Audio2.mood='calm';G.barK=1;if(!o.skipCard)UI.chapter(d.title,d.sub);if(d.intro&&!o.noIntro)Story[d.intro]();},
 fieldUpdate(dt){const d=G.def;playerUpdate(dt);const list=G.enemies;for(let i=list.length-1;i>=0;i--){enemyUpdate(list[i],dt);if(list[i].gone)list.splice(i,1);}shotsUpdate(dt);Fx.update(dt);
  for(const n of Game.fieldNpcs){animate(n.av,dt,0,false);stepChains(n.av,dt,0,.3);}
  const pc=G.cam,lead=G.enc?0:P.f.face*46+P.f.vx*.16;const tgt=clamp(P.f.x+lead,G.camMin+W/2,G.camMax-W/2);G.cam=lerp(pc,tgt,1-Math.exp(-dt*(G.enc?5:3.6)));G.weather.update(dt,(G.cam-pc)*.8,G.time);
  if(G.killLine){G.killLine.age+=dt;if(G.killLine.age>.3)G.killLine=null;}if(G.iaiLine){G.iaiLine.age+=dt;if(G.iaiLine.age>.34)G.iaiLine=null;}
  if(!G.lock&&!Game.busy&&!Game.duelCtx){d.enc.forEach((e,i)=>{const key=G.stage+'_'+i;if(!G.enc&&!G.cleared[key]&&P.f.x>e.x-90)Game.beginEnc(e,key);});}
  if(G.enc&&!G.encStarting)Game.encStep();
  // 促し
  let pr=null,action=null;if(!G.enc&&!G.lock&&!Game.busy){for(const n of Game.fieldNpcs){if(Math.abs(n.x-P.f.x)<40){pr=n.def.name+'と話す';action=()=>Game.talk(Story[n.def.talk],n);}}if(d.town&&Math.abs(P.f.x-d.gateX)<56){pr=TOWN_DEF[d.town].name+'に入る';action=()=>Game.enterTown(d.town);}if(d.exit&&P.f.x>d.len-60){pr='竹林を抜ける';action=()=>Game.nextStage(3);}}
  UI.prompt(pr);if(action&&Input.hit('act'))action();UI.boss(G.enc&&G.enemies.find(e=>e.def.boss&&e.state!=='dead'));},
 async beginEnc(e,key){G.encStarting=true;G.enc={def:e,key,wave:0};const cx=clamp(e.x,W/2,G.def.len-W/2);G.camMin=cx-W/2;G.camMax=cx+W/2;if(!e.boss)Audio2.mood='battle';if(e.pre)await Story[e.pre]();Audio2.mood='battle';P.drawn=true;if(P.state==='free'&&P.ground){play(P.f.av,CL.draw,1,.05);Audio2.sfx('swing');}Game.spawnWave();G.encStarting=false;},
 spawnWave(){const e=G.enc.def,w=e.waves[G.enc.wave];const L=G.camMin,Rr=G.camMax;w.forEach((t,i)=>{const side=e.boss?(P.f.x<(L+Rr)/2?-1:1):(i%2?-1:1),x=side>0?Rr-6-i*12:L+6+i*12;spawnEnemy(t,x,-side);});G.tokens=0;},
 encStep(){if(G.enemies.some(e=>e.state!=='dead'))return;if(G.enemies.length)return;const e=G.enc;if(e.wave<e.def.waves.length-1){e.wave++;Game.spawnWave();return;}G.encEndT=(G.encEndT||0)+1/60;if(G.encEndT<.15)return;G.encEndT=0;Game.endEnc();},
 async endEnc(){const e=G.enc;G.cleared[e.key]=true;G.enc=null;G.camMin=0;G.camMax=G.def.len;Audio2.mood='calm';UI.boss(null);G.tokens=0;if(Game.duelCtx){const dc=Game.duelCtx;Game.duelCtx=null;await UI.wait(.6);Game.returnTown();dc.resolve(true);return;}if(e.def.post)await Story[e.def.post]();Game.save();},
 async onPlayerDown(){if(Game.duelCtx){const dc=Game.duelCtx;Game.duelCtx=null;G.enemies=[];G.enc=null;Audio2.mood='calm';P.hp=G.hpMax;P.state='free';P.f.av.clip=null;await UI.wait(.4);Game.returnTown();dc.resolve(false);return;}
  await UI.flash(['……水の音がする。','まだ、終われない。誰かが、そう言っている。'],{auto:1.2});G.enemies=[];G.shots=[];Fx.clear();G.tokens=0;P.hp=G.hpMax;P.ki=60;P.state='free';P.inv=2;const e=G.enc;if(e){G.enc=null;G.encStarting=false;G.camMin=0;G.camMax=G.def.len;P.f.x=Math.max(60,e.def.x-220);G.cam=clamp(P.f.x,W/2,G.def.len-W/2);}P.f.av.clip=null;P.f.av.holdPose=null;P.f.y=0;P.f.vy=0;P.ground=true;P.f.av.dissolve=0;play(P.f.av,CL.getup,1,.02);Audio2.mood='calm';},
 async talk(fn,n){if(!fn)return;Game.busy=true;try{await fn();}finally{Game.busy=false;}},
 // 帯が開いて町へ
 async enterTown(id){Game.busy=true;G.lock++;UI.prompt(null);const d=G.def,gx=d.gateX;Audio2.sfx('door');P.f.face=gx>P.f.x?1:-1;const t0=performance.now();while(Math.abs(P.f.x-gx)>4){P.f.x+=(gx-P.f.x)*.16;P.f.vx=(gx-P.f.x)*6;await nextFrame();if(performance.now()-t0>700)break;}P.f.vx=0;
  G.enterWalk={t:0,d:.75};await UI.wait(.72);
  const snap=mkCanvas(W,H);snap.getContext('2d').drawImage(cv,0,0);G.enterWalk=null;
  const T=new Town(id);G.town=T;setLight({tint:T.d.tint,rim:T.d.rim,rimA:T.d.rimA,out:[10,8,14]});P.f.av.clip=null;P.f.av.holdPose=null;P.f.av.pose.set(STAND);P.state='free';T.pl.x=T.d.spawn[0];T.pl.y=T.d.spawn[1];T.pl.yaw=0;T.snapCam();G.mode='town';G.trans={k:'open',t:0,d:1.35,snap,fx:(gx-G.cam+W/2),fy:STRIP_T+BASE_Y-60};UI.hud(true,true);UI.place(T.d.name);await UI.wait(1.15);UI.chapter(T.d.sub,T.d.name);Game.save();G.lock--;Game.busy=false;},
 // 全画面から帯へ閉じて、次の場へ
 async leaveTown(){const T=G.town,id=T.id;Game.busy=true;G.lock++;UI.prompt(null);if(id==='himori'&&!has('tak_gate')){set('tak_gate');await Story.takamaruGate();}const next=id==='kirino'?1:id==='himori'?2:4;const snap=mkCanvas(W,H);T.draw(tg);snap.getContext('2d').drawImage(TF,0,0);Audio2.sfx('door');G.town=null;await Game.startStage(next,{skipCard:true});G.trans={k:'close',t:0,d:1.2,snap};await UI.wait(1);UI.chapter(STAGES[next].title,STAGES[next].sub);G.lock--;Game.busy=false;if(next===4){G.cleared={...G.cleared};}Game.save();},
 returnTown(){const snap=mkCanvas(W,H);snap.getContext('2d').drawImage(cv,0,0);const T=G.duelCtx0;G.town=T;setLight({tint:T.d.tint,rim:T.d.rim,rimA:T.d.rimA,out:[10,8,14]});P.f.av.clip=null;P.f.av.holdPose=null;P.state='free';P.f.y=0;P.f.vy=0;P.ground=true;G.enemies=[];G.shots=[];G.mode='town';G.trans={k:'open',t:0,d:1,snap,fx:320,fy:220};UI.hud(true,true);UI.place(T.d.name);},
 duel(types,o){return new Promise(res=>{const snap=mkCanvas(W,H);G.town.draw(tg);snap.getContext('2d').drawImage(TF,0,0);G.duelCtx0=G.town;G.mode='field';const w=bakeWorld(o.biome);G.world=w;setLight(w.b);G.def={len:900,enc:[],sub:o.title,biome:o.biome,deco(){},npcs:[]};Game.fieldNpcs=[];G.props=[];G.weather=new Weather(w.b.weather,40);Fx.clear();G.enemies=[];G.shots=[];G.tokens=0;resetPlayer(300);P.state='free';P.hp=Math.max(P.hp,G.hpMax*.8);G.camMin=130;G.camMax=770;G.cam=450;UI.place(o.title);UI.hud(true);G.trans={k:'close',t:0,d:.9,snap};Game.duelCtx={resolve:res};G.enc={def:{waves:[types],x:450,boss:types.length===1},key:'duel',wave:0};Audio2.mood='battle';setTimeout(()=>{if(Game.duelCtx){P.drawn=true;play(P.f.av,CL.draw,1,.05);Game.spawnWave();}},700);});},
 async nextStage(i){Game.busy=true;G.lock++;UI.prompt(null);await UI.flash([''],{auto:.4});await Game.startStage(i);G.lock--;Game.busy=false;Game.save();},
 toTitle(){G.mode='title';UI.hud(false);UI.prompt(null);$('title').style.display='flex';setTimeout(()=>$('title').style.opacity=1,20);G.world=bakeWorld('dawn');setLight(G.world.b);G.def=null;G.enemies=[];Fx.clear();G.props=[];Game.fieldNpcs=[];resetPlayer(0);G.weather=new Weather('petal',40);G.cam=500;Audio2.mood='calm';Title.refresh();},
 // ── 保存(viewerの保存先が使えれば共有、なければ端末内)
 snapshot(){return{v:1,ts:Date.now(),stage:G.stage,town:G.town?G.town.id:null,pos:G.town?[G.town.pl.x,G.town.pl.y]:[P.f?P.f.x:0,0],en:G.en,ren:G.ren,coin:G.coin,dango:G.dango,hpMax:G.hpMax,atkBonus:G.atkBonus,skills:G.skills,flags:G.flags,quests:G.quests,mems:G.mems,cleared:G.cleared,kills:G.kills,hp:P.hp};},
 save(){if(Game.duelCtx||G.mode==='title')return;const s=Game.snapshot();Store.write(s);},
 async cont(){const s=await Store.read();if(!s){UI.toast('記録がありません');return;}Game.reset();Object.assign(G,{en:s.en,ren:s.ren,coin:s.coin,dango:s.dango,hpMax:s.hpMax,atkBonus:s.atkBonus,skills:s.skills,flags:s.flags,quests:s.quests,mems:s.mems,cleared:s.cleared,kills:s.kills});P.hp=s.hp||G.hpMax;$('title').style.opacity=0;setTimeout(()=>$('title').style.display='none',1000);if(s.town){G.stage=s.stage;resetPlayer(0);const T=new Town(s.town);G.town=T;setLight({tint:T.d.tint,rim:T.d.rim,rimA:T.d.rimA,out:[10,8,14]});T.pl.x=s.pos[0];T.pl.y=s.pos[1];T.snapCam();G.mode='town';G.def=STAGES[s.stage];G.world=bakeWorld(G.def.biome);UI.hud(true,true);UI.place(T.d.name);G.barK=0;}else{await Game.startStage(s.stage,{x:s.pos[0],noIntro:true});}},
};
const Store={db:null,uid:null,key:'mumei.save.v1',
 async init(){try{if(!window.claude||!window.claude.use)return;const[db,user]=await Promise.all([claude.use('db'),claude.use('user')]);if(!db||!user)return;Store.uid=await user.id();Store.db=db.collection('data/users/'+Store.uid).doc('save');Title.refresh();}catch(e){Store.db=null;}},
 write(s){try{localStorage.setItem(Store.key,JSON.stringify(s));}catch(e){}if(Store.db){try{const q=Store.db.set(s);if(q&&q.catch)q.catch(()=>{});}catch(e){}}},
 async read(){let a=null,b=null;try{a=JSON.parse(localStorage.getItem(Store.key)||'null');}catch(e){}if(Store.db){try{const d=await Store.db.get();b=d&&(d.data?(typeof d.data==='function'?d.data():d.data):d);}catch(e){}}if(a&&b)return(a.ts||0)>=(b.ts||0)?a:b;return a||(b&&b.v?b:null);}};
const nextFrame=()=>new Promise(r=>requestAnimationFrame(r));
// ── 描画
function drawField(g,time){const w=G.world,left=G.cam-W/2;drawWorldBack(g,w,G.cam,time,G.props);Fx.drawGround(g,left);
 const ctxOpt={};P.f.shadow(g);for(const e of G.enemies)e.f.shadow(g);for(const n of Game.fieldNpcs){const sx=Math.round(n.x-left);g.fillStyle='rgba(8,6,14,.34)';for(let j=-2;j<=2;j++){const q=Math.round(13*Math.sqrt(1-j*j/9));g.fillRect(sx-q,BASE_Y+j,q*2,1);}drawRig(g,n.av,n.x-left,BASE_Y,{scale:ACTOR_S,yaw:n.def.yaw||2.4});}
 for(const gh of Fx.ghosts){g.globalAlpha=(1-gh.age/.26)*.55;g.drawImage(gh.c,Math.round(gh.x-left-BW/2),Math.round(BASE_Y+gh.y-(BH-22)));}g.globalAlpha=1;
 const list=[...G.enemies].sort((a,b)=>a.f.depth-b.f.depth);for(const e of list)if(e.f.depth<0)e.f.draw(g);
 if(G.enterWalk){const u=G.enterWalk.t/G.enterWalk.d;drawRig(g,P.f.av,P.f.sx,BASE_Y-u*20,{scale:ACTOR_S*(1-u*.2),yaw:lerp(.45,-1.57,clamp(u*2.4)),mirror:false});}else P.f.draw(g);
 for(const e of list)if(e.f.depth>=0)e.f.draw(g);shotsDraw(g);Fx.draw(g,left);drawCombatMarks(g,left);G.weather.draw(g,time);drawRays(g,w,time);
 if(G.iaiLine){const l=G.iaiLine,u=l.age/.34,x0=l.x0-left,x1=l.x1-left;g.fillStyle='#fff';const th=l.age<.08?3:1;g.fillRect(Math.min(x0,x1),l.y-(th>>1),Math.abs(x1-x0)*(1-u*.4),th);g.fillStyle='#bfe0ff';for(let i=0;i<8;i++){const x=lerp(x0,x1,i/8+Math.random()*.1);g.fillRect(x,l.y+rand(-4,4),rand(3,10),1);}}
 drawWorldFront(g,w,G.cam,G.props);
 if(G.killLine){const k=G.killLine,u=k.age/.3,sx=k.x-left;g.fillStyle=`rgba(255,255,255,${1-u})`;g.beginPath();const th=(1-u)*7;g.moveTo(sx-260*k.dir,BASE_Y-150-th);g.lineTo(sx+260*k.dir,BASE_Y+60-th);g.lineTo(sx+260*k.dir,BASE_Y+60+th);g.lineTo(sx-260*k.dir,BASE_Y-150+th);g.fill();}}
function vignette(){if(vignette.c)return vignette.c;const c=mkCanvas(W,H),g=c.getContext('2d'),q=g.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,W*.68);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(6,4,14,.42)');g.fillStyle=q;g.fillRect(0,0,W,H);return vignette.c=c;}
function compose(frame,y,h,zoom){const sx=(rand(-1,1)*G.shake*.6+G.shakeDir[0]*G.shake*.5)|0,sy=(rand(-1,1)*G.shake*.6+G.shakeDir[1]*G.shake*.5)|0,z=1+zoom,w=W*z,hh=h*z;ctx.drawImage(frame,0,0,W,h,Math.round((W-w)/2+sx),Math.round(y+(h-hh)/2+sy),Math.round(w),Math.round(hh));}
let last=performance.now(),acc=0;
// 手応えの止め(ヒットストップ)の間に押された操作を捨てない
const HOLD_KEYS=['slash','guard','dodge','jump','iai'];
function drawCombatMarks(g,left){if(P.state==='iai'){const t=P.t,w=26,x=Math.round(P.f.x-left-w/2),y=BASE_Y-82,u=clamp(t/.55),just=t>=.55&&t<.8;g.fillStyle='#0a080c';g.fillRect(x-1,y-1,w+2,4);g.fillStyle=just?((t*30|0)%2?'#ffffff':'#ffe07c'):u>=1?'#a8d8ff':'#6aa9d8';g.fillRect(x,y,Math.round(w*u),2);}
 for(const e of G.enemies){if(e.def.boss||!(e.barT>0)||e.state==='dead')continue;const w=24,x=Math.round(e.f.x-left-w/2),y=BASE_Y+e.f.depth-78*(e.def.scale||1)*(e.f.av.style.scale||1);g.fillStyle='#0a080c';g.fillRect(x-1,y-1,w+2,5);g.fillStyle='#d03e2e';g.fillRect(x,y,Math.round(w*clamp(e.hp/e.hpMax)),2);g.fillStyle=e.guardT>0?'#bfe0ff':'#cda451';g.fillRect(x,y+2,Math.round(w*clamp(e.posture/e.def.pos)),1);}}
function frame(now){requestAnimationFrame(frame);let real=Math.min(.05,(now-last)/1000);last=now;if(document.hidden){return;}
 rigBeginFrame();Audio2.tick();
 if(Input.hit('menu')&&G.mode!=='title'&&!UI._adv&&!UI._choose&&!UI._flashAdv){if(G.menu)UI.closeMenu();else if(!G.lock)UI.openMenu();}
 if(G.mode==='title')Title.tick();
 UI.tick(real);
 let dt=real;if(G.freeze>0){G.freeze-=real;dt=0;}if(G.slow>0){G.slow-=real;dt*=G.slowK;}
 G.time+=dt||0;if(G.enterWalk)G.enterWalk.t+=real;
 G.shake=Math.max(0,G.shake-real*26);G.zoom=Math.max(0,G.zoom-real*.3);G.flash=Math.max(0,G.flash-real*4.2);
 if(!G.menu){if(G.mode==='field'&&dt>0){Game.fieldUpdate(dt);}else if(G.mode==='field'){for(const a of[P.f.av]){}Fx.update(real*.15);}else if(G.mode==='town'&&G.town){G.town.update(dt);const n=G.town.nearest;if(!G.lock&&!Game.busy&&n){UI.prompt(n.exit?n.label:n.spot?n.label:n.name+'と話す');if(Input.hit('act')){if(n.exit)Game.exitAsk();else{const key=n.spot?n.spot.talk:n.target.def.talk;Game.talk(Story[key]);}}}else UI.prompt(null);}}
 if(!G.lock&&G.mode!=='title')UI.updateHud();else if(G.mode!=='title')UI.updateHud();
 // 合成
 ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
 if(G.mode==='field'||G.mode==='title'){drawField(fg,G.time);compose(F,STRIP_T,STRIP_H,G.zoom);ctx.drawImage(vignette(),0,0);drawBars(ctx,1);}
 else if(G.mode==='town'&&G.town){G.town.draw(tg);compose(TF,0,H,0);ctx.drawImage(vignette(),0,0);}
 if(G.flash>0&&G.mode!=='title'){ctx.globalAlpha=clamp(G.flash);ctx.fillStyle=G.flashC;ctx.fillRect(0,STRIP_T,W,STRIP_H);ctx.globalAlpha=1;}
 // 切替:開く・閉じる
 if(G.trans){const T=G.trans;T.t+=real;const u=clamp(T.t/T.d),e=ease.io(u);
  if(T.k==='open'){ // 帯が開き、野外の画が奥へほどける
   const s=1+e*.55,ax=T.fx,ay=T.fy;ctx.globalAlpha=1-ease.in(clamp(u*1.15));ctx.imageSmoothingEnabled=false;ctx.drawImage(T.snap,ax-ax*s,ay-ay*s,W*s,H*s);ctx.globalAlpha=1;drawFusuma(1-e);}
  else{ // 全画面が帯へ閉じる
   const s=1+e*.3;ctx.globalAlpha=1-ease.out(clamp(u*1.25));ctx.drawImage(T.snap,W/2-W/2*s,H/2-H/2*s,W*s,H*s);ctx.globalAlpha=1;drawFusumaClose(e);}
  if(u>=1)G.trans=null;}
 Input.endFrame(dt===0&&G.mode==='field'?HOLD_KEYS:null);}
function drawFusuma(k){if(k<=0)return;const h=Math.round(STRIP_T*k);if(h>0){ctx.drawImage(BAR,0,STRIP_T-h,W,h,0,0,W,h);ctx.save();ctx.translate(0,H);ctx.scale(1,-1);ctx.drawImage(BAR,0,STRIP_T-h,W,h,0,0,W,h);ctx.restore();ctx.fillStyle='#cda451';ctx.fillRect(0,h,W,1);ctx.fillRect(0,H-h-1,W,1);}}
function drawFusumaClose(k){}
Game.exitAsk=async function(){Game.busy=true;const id=G.town.id;if(id==='shirogiri'&&(!has('letter')||!has('chi3'))){await N(has('letter')?'……まだ、話していない者がいる。千草は墓の前にいるはずだ。':'……山道の先が気にかかる。だがその前に、この村で見るべきものがある。');Game.busy=false;return;}const c=await ask(['旅立つ','もう少しここにいる']);Game.busy=false;if(c===0)Game.leaveTown();};
// ── 表紙
const Title={sel:0,els:[],init(){this.els=[$('tnew'),$('tcont'),$('thelp')];$('tnew').onclick=()=>this.go(0);$('tcont').onclick=()=>this.go(1);$('thelp').onclick=()=>this.go(2);this.els.forEach((b,i)=>b.onmouseenter=()=>{this.sel=i;this.paint();});$('mclose').onclick=()=>UI.closeMenu();$('dlg').onclick=()=>{if(UI._adv)UI._adv();};$('flash').onclick=()=>{if(UI._flashAdv)UI._flashAdv();};$('prompt').onclick=()=>{Input.press('act');setTimeout(()=>Input.release('act'),40);};this.refresh();this.paint();},
 async refresh(){const s=await Store.read();$('tcont').style.display=s?'block':'none';if(!s&&this.sel===1)this.sel=0;this.paint();},
 paint(){this.els.forEach((b,i)=>b.classList.toggle('on',i===this.sel));},
 busy:false,async go(i){Audio2.unlock();if(this.busy)return;if(i===0){this.busy=true;Audio2.sfx('door');await Game.newGame();this.busy=false;}else if(i===1){this.busy=true;Audio2.sfx('door');await Game.cont();this.busy=false;}else{UI.menuTab='help';$('menu').style.display='flex';G.menu=true;G.lock++;$('tabs').innerHTML='';$('mbody').innerHTML=UI.helpHtml();}},
 tick(){if(G.menu){if(Input.hit('act')||Input.hit('menu'))UI.closeMenu();}else{if(Input.hit('down')){do{this.sel=(this.sel+1)%3;}while(this.els[this.sel].style.display==='none');this.paint();Audio2.tone(500,.03,.05,'square');}if(Input.hit('up')){do{this.sel=(this.sel+2)%3;}while(this.els[this.sel].style.display==='none');this.paint();Audio2.tone(500,.03,.05,'square');}if(Input.hit('act')||Input.hit('slash'))this.go(this.sel);}
  G.cam+=.05;P.f.x=G.cam-120;animate(P.f.av,1/60,0,false);stepChains(P.f.av,1/60,0,1.2);G.weather.update(1/60,.05,G.time);G.time+=1/60;}};
addEventListener('pointerdown',()=>Audio2.unlock(),{capture:true});
window.MUMEI={G,P,Game,Input,Story,UI,Store};
async function boot(){UI.fit();Fx.load();try{await Promise.race([Promise.all([document.fonts.load('14px "Yuji Boku"','無銘'),document.fonts.load('14px "DotGothic16"','無銘')]),UI.wait(1.8)]);}catch(e){}
 Game.reset();resetPlayer(0);Title.init();Game.toTitle();Store.init();requestAnimationFrame(t=>{last=t;frame(t);});}
boot();
