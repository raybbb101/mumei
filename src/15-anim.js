// ── 動きの帳面:キーフレームは「溜めは短く、振り抜きは速く、残心は長く」 ──
const READY=pose({hx:-1,hy:26.5,lean:.16,tw:-.28,hp:-.06,rx:13,ry:34,rz:3,lx:5,ly:30,lz:0,frx:10,fry:2,frz:4,flx:-11,fly:2,flz:-4,sw:.5,grip:1,shea:0});
const K=(t,o,e,base)=>[t,pose(o,base||READY),e||ease.lin];
const clip=(d,keys,extra)=>Object.assign({d,k:keys},extra||{});
const CL={
 // 袈裟斬り(右上→左下)
 slash1:clip(.40,[K(0,{}),K(.06,{hx:-4,hy:27,lean:-.02,tw:.55,rx:3,ry:56,rz:3,sw:2.1,frx:7,flx:-12},ease.out),K(.135,{hx:6,hy:24.5,lean:.32,tw:-.3,rx:18,ry:42,sw:.72,frx:17,flx:-11},ease.in),K(.19,{hx:11,hy:21.5,lean:.5,tw:-.85,rx:21,ry:21,rz:5,sw:-.92,frx:22,flx:-10},ease.out),K(.27,{hx:11,hy:22,lean:.46,tw:-.8,rx:20,ry:20,sw:-1.0,frx:22,flx:-10}),K(.40,{hx:2,hy:26,lean:.2,frx:12,flx:-11,rx:14,ry:33,sw:.42},ease.io)],{active:[.1,.19],dmg:10,reach:48,lunge:46,sfx:'swing',hitH:[-4,62]}),
 // 逆袈裟(左下→右上)
 slash2:clip(.40,[K(0,{hx:4,hy:25,rx:16,ry:28,sw:-.3}),K(.06,{hx:0,hy:22.5,lean:.42,tw:.7,rx:6,ry:17,rz:6,sw:-2.5,frx:10,flx:-14},ease.out),K(.13,{hx:7,hy:26,lean:.1,tw:-.2,rx:19,ry:36,sw:.28,frx:18,flx:-10},ease.in),K(.19,{hx:11,hy:29,lean:-.12,tw:-.8,rx:13,ry:57,rz:5,sw:2.0,frx:21,flx:-8,hp:-.2},ease.out),K(.27,{hx:11,hy:29,lean:-.14,tw:-.85,rx:12,ry:58,sw:2.15,frx:21,flx:-8}),K(.40,{hx:3,hy:26,lean:.14,rx:14,ry:36,sw:.6,frx:13,flx:-11},ease.io)],{active:[.09,.19],dmg:11,reach:48,lunge:50,sfx:'swing',hitH:[0,70]}),
 // 唐竹割り(踏み込み)
 slash3:clip(.56,[K(0,{hx:3,hy:26,rx:14,ry:38,sw:.9}),K(.1,{hx:-3,hy:29,lean:-.2,tw:.3,rx:0,ry:62,rz:1,sw:2.65,frx:7,flx:-10,hp:-.15},ease.out),K(.175,{hx:12,hy:25,lean:.36,tw:-.1,rx:20,ry:50,sw:1.05,frx:21,fry:7,flx:-12},ease.in),K(.235,{hx:17,hy:16,lean:.8,tw:-.2,rx:27,ry:17,rz:2,sw:-.42,frx:30,flx:-10},ease.out5),K(.38,{hx:17,hy:16.5,lean:.76,tw:-.25,rx:27,ry:17,sw:-.46,frx:30,flx:-10}),K(.56,{hx:3,hy:26,lean:.2,rx:14,ry:33,sw:.42,frx:12,flx:-11},ease.io)],{active:[.15,.25],dmg:20,reach:58,lunge:78,sfx:'swing2',heavy:true,hitH:[-4,70]}),
 // 燕返し:返す二太刀
 tsubame:clip(.55,[K(0,{hx:12,hy:17,lean:.7,rx:26,ry:18,sw:-.5}),K(.06,{hx:15,hy:18,lean:.55,tw:.6,rx:21,ry:20,rz:5,sw:-2.6},ease.out),K(.14,{hx:19,hy:29,lean:-.1,tw:-.7,rx:17,ry:60,sw:2.0,frx:27,flx:-8},ease.in),K(.2,{hx:20,hy:30,lean:-.2,tw:.1,rx:11,ry:63,sw:2.7},ease.out),K(.28,{hx:25,hy:18,lean:.8,tw:-.8,rx:32,ry:15,sw:-.75,frx:36,flx:-7},ease.in3),K(.42,{hx:25,hy:18,lean:.76,tw:-.8,rx:32,ry:15,sw:-.8,frx:36,flx:-7}),K(.55,{hx:3,hy:26,rx:14,ry:33,sw:.42,frx:12,flx:-11},ease.io)],{active:[.08,.29],dmg:26,reach:62,lunge:60,sfx:'swing2',heavy:true,hitH:[-4,80],multi:2}),
 air:clip(.42,[K(0,{hy:33,frx:8,fry:18,flx:-8,fly:20,rx:6,ry:56,sw:2.2,lean:-.1}),K(.08,{hy:33,frx:9,fry:20,flx:-9,fly:22,lean:-.25,tw:.55,rx:0,ry:62,sw:2.8},ease.out),K(.17,{hy:32,frx:14,fry:15,flx:-6,fly:24,lean:.55,tw:-.5,rx:22,ry:26,sw:-.6},ease.in),K(.28,{hy:32,frx:14,fry:14,flx:-6,fly:22,lean:.5,tw:-.5,rx:22,ry:24,sw:-.8}),K(.42,{hy:33,frx:10,fry:12,flx:-10,fly:14,lean:.2,rx:14,ry:33,sw:.3},ease.io)],{active:[.1,.19],dmg:12,reach:50,sfx:'swing',hitH:[-30,70]}),
 // 納刀(チャキ)
 noto:clip(.82,[K(0,{}),K(.14,{hx:0,hy:28,lean:.08,tw:.2,rx:18,ry:42,sw:1.3,grip:0,lx:0,ly:33,lz:-6},ease.out),K(.32,{hy:29,lean:.1,tw:.45,rx:12,ry:39,rz:5,sw:3.0,swz:0,grip:0,lx:2,ly:32,lz:-6},ease.io),K(.5,{hy:28,lean:.14,tw:.3,rx:7,ry:34,rz:1,sw:3.45,grip:0,lx:2,ly:33,lz:-6,frx:8,flx:-10},ease.io),K(.56,{hy:27,lean:.14,tw:.3,rx:7,ry:33,rz:0,sw:3.45,grip:0,lx:2,ly:33,lz:-6,shea:1,frx:8,flx:-10}),K(.82,pose({},STAND).reduce((o,v,i)=>(o[PN[i]]=v,o),{}),ease.io)]),
 // 抜刀(ゆっくり構える)
 draw:clip(.34,[K(0,{hy:28,lean:.1,tw:.3,rx:5,ry:32,rz:0,lx:2,ly:32,lz:-6,sw:-.2,grip:0,shea:1}),K(.09,{hy:26,lean:.2,tw:-.1,rx:19,ry:40,rz:4,sw:.25,grip:0,lx:0,ly:32,lz:-6,shea:0},ease.out3),K(.34,{},ease.io)],{sfx:'swing'}),
 parry:clip(.34,[K(0,{}),K(.05,{hx:-2,hy:27,lean:-.08,tw:-.3,rx:14,ry:46,rz:4,sw:1.25,frx:9,flx:-13},ease.out3),K(.34,{hx:-2,hy:27,lean:-.05,tw:-.32,rx:14,ry:45,rz:4,sw:1.22,frx:9,flx:-13})]),
 clash:clip(.26,[K(0,{hx:-7,hy:25,lean:-.28,tw:-.6,rx:9,ry:50,rz:4,sw:1.6,frx:6,flx:-17},ease.out3),K(.26,{},ease.io)]),
 dodge:clip(.36,[K(0,{hx:0,hy:22,lean:.6,tw:.5,rx:-6,ry:29,rz:7,sw:2.9,grip:0,lx:7,ly:18,lz:-5,frx:13,fry:3,flx:-17,fly:4}),K(.12,{hx:2,hy:15,lean:1.0,tw:.6,rx:-13,ry:23,rz:7,sw:3.05,grip:0,lx:11,ly:12,lz:-5,frx:22,fry:2,flx:-16,fly:2},ease.out),K(.27,{hx:1,hy:17,lean:.85,tw:.5,rx:-11,ry:24,sw:3,grip:0,frx:17,flx:-14,lx:10,ly:14}),K(.36,{},ease.io)]),
 hurt:clip(.36,[K(0,{hx:-5,hy:25,lean:-.52,tw:.7,hp:-.4,rx:0,ry:36,rz:7,sw:.9,grip:.3,frx:6,flx:-14}),K(.09,{hx:-7,hy:24,lean:-.44,tw:.6,hp:-.2,rx:2,ry:32,sw:.5,grip:.3,frx:6,flx:-15},ease.out),K(.36,{},ease.io)]),
 stagger:clip(.7,[K(0,{hx:-6,hy:24,lean:-.42,tw:.8,hp:-.4,rx:-2,ry:30,rz:9,sw:-.8,grip:0,lx:-2,ly:40,frx:4,flx:-15},ease.out3),K(.4,{hx:-3,hy:22,lean:.34,tw:.6,hp:.25,rx:6,ry:19,rz:7,sw:-1.2,grip:0,lx:3,ly:24,frx:6,flx:-13},ease.io),K(.7,{},ease.io)]),
 // 倒れる
 die:clip(.95,[K(0,{hx:-6,hy:25,lean:-.5,tw:.9,hp:-.5,rx:-3,ry:36,rz:10,sw:-.5,grip:0,lx:-5,ly:44,lz:-8,frx:5,flx:-14}),K(.28,{hx:-2,hy:19,lean:.6,tw:.5,hp:.4,rx:9,ry:15,sw:-1.4,grip:0,lx:6,ly:18,lz:-8,frx:9,flx:-10,fly:2},ease.io),K(.55,{hx:6,hy:10,lean:1.15,tw:.2,hp:.5,rx:20,ry:6,sw:-.1,grip:0,lx:15,ly:7,lz:-8,frx:8,fry:2,flx:-8,fly:4},ease.in),K(.72,{hx:13,hy:5,lean:1.5,tw:.1,hp:.35,rx:33,ry:3,sw:.1,grip:0,lx:28,ly:3,lz:-8,frx:-5,fry:3,flx:-12,fly:3},ease.out)]),
 // 目覚め:仰向け→膝立ち→立ち上がる
 wake:clip(3.1,[K(0,{hx:-7,hy:5,lean:-1.52,tw:0,hp:-.05,rx:-5,ry:3,rz:8,lx:-8,ly:3,lz:-8,frx:15,fry:2,flx:12,fly:2,flz:-3,grip:0,shea:1,sw:-1.3}),K(.5,{hx:-7,hy:5,lean:-1.52,hp:-.05,rx:-5,ry:3,rz:8,lx:-8,ly:3,lz:-8,frx:15,fry:2,flx:12,fly:2,grip:0,shea:1,sw:-1.3}),K(1.3,{hx:-3,hy:9,lean:-.55,hp:.3,tw:.1,rx:-10,ry:3,rz:8,lx:-10,ly:3,lz:-8,frx:15,fry:2,flx:11,fly:2,grip:0,shea:1,sw:-1.3},ease.io),K(1.9,{hx:0,hy:13,lean:.65,hp:-.4,tw:.2,rx:8,ry:6,rz:8,lx:6,ly:4,lz:-8,frx:9,fry:2,flx:-9,fly:2,grip:0,shea:1,sw:-1.3},ease.io),K(2.6,{hx:0,hy:24,lean:.32,hp:-.2,tw:.15,rx:7,ry:21,rz:8,lx:4,ly:30,lz:-7,frx:7,flx:-6,grip:0,shea:1,sw:-1.3},ease.io),K(3.1,STANDO(),ease.io)]),
 getup:clip(.75,[K(0,{hx:-8,hy:6,lean:-1.4,rx:-6,ry:4,lx:-7,ly:3,frx:12,flx:9,sw:.1,grip:0}),K(.34,{hx:-1,hy:14,lean:.6,hp:-.4,rx:10,ry:7,lx:6,ly:4,frx:9,flx:-9,sw:-.3,grip:0},ease.io),K(.75,{},ease.io)]),
 // 敵の技
 eSlash:clip(.9,[K(0,{}),K(.34,{hx:-4,hy:27,lean:-.1,tw:.5,rx:1,ry:58,sw:2.3,frx:7,flx:-12},ease.out),K(.46,{hx:-4,hy:27,lean:-.12,tw:.52,rx:1,ry:59,sw:2.36,frx:7,flx:-12}),K(.53,{hx:10,hy:22,lean:.5,tw:-.8,rx:22,ry:22,rz:5,sw:-.9,frx:21,flx:-10},ease.in),K(.7,{hx:11,hy:22,lean:.5,tw:-.8,rx:21,ry:21,sw:-1,frx:21,flx:-10}),K(.9,{},ease.io)],{active:[.47,.56],hitAt:.5,tele:[0,.46],reach:50,dmg:9,lunge:58,lungeAt:[.46,.55],sfx:'swing',hitH:[-4,62]}),
 eThrust:clip(1.02,[K(0,{}),K(.45,{hx:-9,hy:24,lean:-.18,tw:.8,rx:-5,ry:36,rz:4,sw:.02,frx:7,flx:-16},ease.out),K(.56,{hx:-10,hy:24,lean:-.2,tw:.82,rx:-6,ry:36,sw:.02,frx:7,flx:-16}),K(.62,{hx:12,hy:24,lean:.55,tw:-.9,rx:28,ry:37,rz:3,sw:.01,frx:25,flx:-13},ease.in3),K(.8,{hx:12,hy:24,lean:.52,tw:-.85,rx:27,ry:36,sw:.01,frx:25,flx:-13}),K(1.02,{},ease.io)],{active:[.57,.66],tele:[0,.56],reach:96,dmg:12,lunge:30,lungeAt:[.56,.63],sfx:'swing2',red:true,hitH:[12,60],thrust:true}),
 eSlam:clip(1.5,[K(0,{}),K(.62,{hx:-7,hy:30,lean:-.34,tw:.3,rx:-3,ry:64,rz:2,sw:2.45,frx:7,flx:-12,hp:-.2},ease.out),K(.8,{hx:-8,hy:31,lean:-.4,tw:.3,rx:-4,ry:66,sw:2.6,frx:7,flx:-12,hp:-.2}),K(.89,{hx:14,hy:16,lean:.85,tw:-.3,rx:27,ry:14,sw:-.14,frx:27,flx:-12,hp:.1},ease.in3),K(1.2,{hx:14,hy:16,lean:.82,tw:-.3,rx:27,ry:14,sw:-.16,frx:27,flx:-12}),K(1.5,{},ease.io)],{active:[.82,.92],tele:[0,.8],reach:64,dmg:20,lunge:44,lungeAt:[.8,.87],sfx:'swing2',red:true,hitH:[-4,80],slam:true}),
 eDash:clip(.8,[K(0,{}),K(.26,{hx:-6,hy:17,lean:.9,tw:.5,rx:-4,ry:21,rz:6,sw:3,grip:0,lx:6,ly:15,frx:12,flx:-16},ease.out),K(.36,{hx:-5,hy:15,lean:1,tw:.5,rx:-5,ry:20,sw:3.05,grip:0,lx:7,ly:14,frx:13,flx:-18}),K(.42,{hx:14,hy:21,lean:.65,tw:-.8,rx:29,ry:26,sw:-.3,grip:0,frx:27,flx:-14},ease.in3),K(.6,{hx:14,hy:21,lean:.6,tw:-.8,rx:28,ry:25,sw:-.36,grip:0,frx:27,flx:-14}),K(.8,{},ease.io)],{active:[.37,.47],tele:[0,.36],reach:44,dmg:9,lunge:150,lungeAt:[.36,.44],sfx:'iai',hitH:[-4,62]}),
 eThrow:clip(.72,[K(0,{}),K(.24,{hx:-3,hy:26,lean:-.22,tw:.9,rx:-8,ry:48,rz:7,sw:2.5,grip:0,lx:13,ly:40,lz:-4,frx:8,flx:-12},ease.out),K(.32,{hx:6,hy:24,lean:.42,tw:-.8,rx:24,ry:38,rz:5,sw:.1,grip:0,lx:-5,ly:34,frx:14,flx:-12},ease.in3),K(.72,{},ease.io)],{throwAt:.3,tele:[0,.24]}),
 // 人々の仕草
 bow:clip(1.4,[K(0,{},0,STAND),K(.45,{lean:.72,hp:.25,rx:9,ry:15,lx:7,ly:15,grip:0},ease.io,STAND),K(.9,{lean:.72,hp:.25,rx:9,ry:15,lx:7,ly:15,grip:0},0,STAND),K(1.4,{},ease.io,STAND)]),
 kneel:clip(1,[K(0,{hy:12,lean:.25,hp:.2,rx:9,ry:15,rz:6,lx:7,ly:15,lz:-6,frx:8,fry:2,flx:-11,fly:2,grip:0,shea:1,sw:-1.3},0),K(1,{hy:12,lean:.25,hp:.2,rx:9,ry:15,rz:6,lx:7,ly:15,lz:-6,frx:8,fry:2,flx:-11,fly:2,grip:0,shea:1,sw:-1.3})]),
};
// 歩き・走りは手続きで作る(足跡の位相 φ を速さで進める)
const _lp=new Float32Array(PL);
function locomotion(A,speed,drawn,dt){const k=clamp(speed/170),mov=clamp(speed/30);A.phase=(A.phase||0)+speed*dt/(13+12*k);const f=A.phase,t=A.time;const base=drawn?READY:STAND;const q=_lp;q.set(base);
  const br=Math.sin(t*2.1),br2=Math.sin(t*1.05+.7);
  q[PI.hy]+=br*.32;q[PI.ry]+=br*.34+br2*.15;q[PI.ly]+=br*.3;q[PI.lean]+=br2*.006;q[PI.hp]+=Math.sin(t*.8)*.02;if(drawn)q[PI.sw]+=Math.sin(t*1.6)*.016;
  if(mov>0){const stride=8+13*k,lift=2.4+7.2*k;const footX=(ph)=>Math.cos(ph)*stride+k*5,footY=(ph)=>{const s=Math.sin(ph);return 2+(s>0?s*lift:0);};
    const set=(i,v)=>{q[i]=lerp(q[i],v,mov);};
    set(PI.frx,footX(f));set(PI.fry,footY(f));set(PI.frz,3.2);set(PI.flx,footX(f+Math.PI));set(PI.fly,footY(f+Math.PI));set(PI.flz,-3.2);
    set(PI.hy,29-k*3.2+Math.cos(f*2)*(.75+1.1*k));set(PI.hx,k*3.6);set(PI.lean,.05+.36*k+(drawn?.08:0));set(PI.tw,Math.cos(f)*(.15+.22*k)+(drawn?-.15:0));
    if(!drawn){const sw=Math.cos(f+Math.PI);set(PI.rx,3+sw*(4+9*k)+k*3);set(PI.ry,29+Math.abs(sw)*k*5+k*4);set(PI.lx,1+k*2);set(PI.ly,32+k*2);set(PI.lz,-7);}
    else if(k>.45){const m=clamp((k-.45)*3);q[PI.rx]=lerp(q[PI.rx],-7,m);q[PI.ry]=lerp(q[PI.ry],31,m);q[PI.rz]=lerp(q[PI.rz],7,m);q[PI.sw]=lerp(q[PI.sw],2.82,m);q[PI.grip]=lerp(1,0,m);const sw=Math.cos(f);q[PI.lx]=lerp(q[PI.lx],8+sw*7,m);q[PI.ly]=lerp(q[PI.ly],33,m);q[PI.lz]=-6;}
    else{q[PI.rx]+=Math.cos(f)*1.2;q[PI.ry]+=Math.cos(f*2)*.8;}
  }
  return q;}
const _sp=new Float32Array(PL);
function sampleClip(c,t){const ks=c.k;if(t<=ks[0][0])return ks[0][1];for(let i=1;i<ks.length;i++){const a=ks[i-1],b=ks[i];if(t<=b[0]){const u=(t-a[0])/(b[0]-a[0]||1e-4),e=b[2](clamp(u));for(let j=0;j<PL;j++)_sp[j]=a[1][j]+(b[1][j]-a[1][j])*e;return _sp;}}return ks[ks.length-1][1];}
function play(A,c,spd=1,blend=.04){A.clip=c;A.ct=0;A.cspd=spd;A.from=A.pose.slice();A.blendT=A.blend=blend;A.fired={};}
function stopClip(A,blend=.1){A.clip=null;A.from=A.pose.slice();A.blendT=A.blend=blend;}
function animate(A,dt,speed,drawn){A.time+=dt;let tgt;let ended=false;
  if(A.clip){A.ct+=dt*(A.cspd||1);if(A.ct>=A.clip.d){if(A.clip.hold){A.ct=A.clip.d;}else{ended=true;}}tgt=sampleClip(A.clip,Math.min(A.ct,A.clip.d));}
  else if(A.holdPose)tgt=A.holdPose;else tgt=locomotion(A,speed,drawn,dt);
  if(A.blendT>0){A.blendT-=dt;const u=1-clamp(A.blendT/A.blend);for(let j=0;j<PL;j++)A.pose[j]=A.from[j]+(tgt[j]-A.from[j])*u;}else A.pose.set(tgt);
  if(ended){A.clip=null;A.from=A.pose.slice();A.blendT=A.blend=.07;}
  // 瞬き
  A.blinkT=(A.blinkT===undefined?rand(2,5):A.blinkT)-dt;if(A.blinkT<0){A.blink=true;if(A.blinkT<-.11){A.blink=false;A.blinkT=rand(1.8,5.5);}}
  if(A.flash>0)A.flash=Math.max(0,A.flash-dt*6);
  return ended;}
function STANDO(){const o={};PN.forEach((n,i)=>o[n]=STAND[i]);return o;}
