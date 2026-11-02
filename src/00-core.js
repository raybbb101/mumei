'use strict';
// ── 基本定数 ── 内部解像度 640×360。野外は上下に帯を残した横長の画、町で全画面へ開く
const W=640,H=360,STRIP_T=56,STRIP_H=248,HORIZON=150,BASE_Y=214;
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const ease={lin:t=>t,out:t=>1-(1-t)*(1-t),out3:t=>1-Math.pow(1-t,3),out5:t=>1-Math.pow(1-t,5),in:t=>t*t,in3:t=>t*t*t,io:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,back:t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);}};
function RNG(seed){let a=seed>>>0;const f=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};f.r=(x,y)=>x+(y-x)*f();f.i=(x,y)=>Math.floor(x+(y-x+1)*f());f.pick=a=>a[Math.floor(f()*a.length)];return f;}
const rand=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const bayer=(x,y)=>BAYER[(y&3)*4+(x&3)];
function hex(c){if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255];}
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const css=(c,a=1)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
function ramp(list,t){t=clamp(t)*(list.length-1);const i=Math.min(list.length-2,t|0);return mixc(list[i],list[i+1],t-i);}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
// 周期ノイズ
function makeNoise(seed,period){const r=RNG(seed),g=new Float32Array(period*period);for(let i=0;i<g.length;i++)g[i]=r();const s=t=>t*t*(3-2*t);
  return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=s(x-xi),fy=s(y-yi),m=v=>((v%period)+period)%period;const a=g[m(xi)+m(yi)*period],b=g[m(xi+1)+m(yi)*period],c=g[m(xi)+m(yi+1)*period],d=g[m(xi+1)+m(yi+1)*period];return lerp(lerp(a,b,fx),lerp(c,d,fx),fy);};}
const N0=makeNoise(11,256);
function fbm(x,y,oct=4,n=N0){let v=0,a=.5,f=1,t=0;for(let i=0;i<oct;i++){v+=a*n(x*f,y*f);t+=a;a*=.5;f*=2;}return v/t;}
// 横に繋がるfbm(周期 w ピクセル、基本周波数 cells)
function tfbm(x,y,w,cells,oct=4,seed=0){let v=0,a=.5,t=0,c=cells;for(let i=0;i<oct;i++){const n=TN(c,seed+i);v+=a*n(x/w*c,y/w*c);t+=a;a*=.5;c*=2;}return v/t;}
const TNC={};function TN(p,s){const k=p+'_'+s;return TNC[k]||(TNC[k]=makeNoiseWrapX(s*97+p,p));}
function makeNoiseWrapX(seed,period){const r=RNG(seed),H=512,g=new Float32Array(period*H);for(let i=0;i<g.length;i++)g[i]=r();const s=t=>t*t*(3-2*t);
  return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=s(x-xi),fy=s(y-yi),mx=v=>((v%period)+period)%period,my=v=>((v%H)+H)%H;const a=g[mx(xi)+my(yi)*period],b=g[mx(xi+1)+my(yi)*period],c=g[mx(xi)+my(yi+1)*period],d=g[mx(xi+1)+my(yi+1)*period];return lerp(lerp(a,b,fx),lerp(c,d,fx),fy);};}
// ── ピクセル画用の小さな絵筆。x は横に折り返す(tile)
class Pix{constructor(w,h,tile=false){this.w=w;this.h=h;this.tile=tile;this.c=mkCanvas(w,h);this.g=this.c.getContext('2d');this.img=this.g.createImageData(w,h);this.d=this.img.data;}
  set(x,y,c,a=255){x|=0;y|=0;if(y<0||y>=this.h)return;if(this.tile)x=((x%this.w)+this.w)%this.w;else if(x<0||x>=this.w)return;const i=(x+y*this.w)*4,d=this.d;if(a>=255){d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;}else{const sa=a/255,da=d[i+3]/255,oa=sa+da*(1-sa);if(oa<=0)return;d[i]=(c[0]*sa+d[i]*da*(1-sa))/oa;d[i+1]=(c[1]*sa+d[i+1]*da*(1-sa))/oa;d[i+2]=(c[2]*sa+d[i+2]*da*(1-sa))/oa;d[i+3]=oa*255;}}
  rect(x,y,w,h,c,a=255){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.set(x+i,y+j,c,a);}
  line(x0,y0,x1,y1,c,w=1){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0||1;for(let i=0;i<=n;i++){const t=i/n;this.rect(lerp(x0,x1,t)-(w>>1),lerp(y0,y1,t)-(w>>1),w,w,c);}}
  get(x,y){x|=0;y|=0;if(y<0||y>=this.h)return null;if(this.tile)x=((x%this.w)+this.w)%this.w;else if(x<0||x>=this.w)return null;const i=(x+y*this.w)*4;return[this.d[i],this.d[i+1],this.d[i+2],this.d[i+3]];}
  // 光の向きを持つ葉・雲の塊(左上が明るい)。ramp は暗→明の色配列
  blob(cx,cy,rx,ry,pal,r,opt={}){const nz=opt.nz===undefined?.35:opt.nz,li=opt.light||0,sc=opt.scale||.14,sd=r()*400;
    for(let y=Math.floor(cy-ry*1.4);y<cy+ry*1.4;y++)for(let x=Math.floor(cx-rx*1.4);x<cx+rx*1.4;x++){const dx=(x-cx)/rx,dy=(y-cy)/ry,n=fbm(x*sc+sd,y*sc+sd,3);const d=dx*dx+dy*dy+(n-.5)*nz*2.2;if(d>1)continue;
      let l=.46-dx*.28-dy*.42+(n-.5)*1.2+li;l+=(bayer(x,y)-.5)*.16;if(d>.8)l-=.1;this.set(x,y,pal[clamp(Math.floor(l*pal.length),0,pal.length-1)]);}}
  flush(){this.g.putImageData(this.img,0,0);return this.c;}}
// ── 入力
const Input={down:{},pressed:{},released:{},map:{ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',ShiftLeft:'run',ShiftRight:'run',KeyJ:'slash',KeyZ:'slash',KeyK:'iai',KeyX:'iai',KeyL:'guard',KeyC:'guard',KeyI:'dodge',KeyV:'dodge',KeyE:'act',Enter:'act',KeyM:'menu',Tab:'menu',Escape:'menu',KeyR:'autorun',KeyQ:'item'},
  press(a){if(!this.down[a]){this.pressed[a]=true;}this.down[a]=true;},release(a){if(this.down[a])this.released[a]=true;this.down[a]=false;},
  endFrame(hold){const q={};if(hold)for(const a of hold)if(this.pressed[a])q[a]=true;this.pressed=q;this.released={};},hit(a){return !!this.pressed[a];}};
addEventListener('keydown',e=>{const a=Input.map[e.code];if(a){e.preventDefault();if(!e.repeat)Input.press(a);}Audio2.unlock();});
addEventListener('keyup',e=>{const a=Input.map[e.code];if(a){e.preventDefault();Input.release(a);}});
addEventListener('blur',()=>{for(const k in Input.down)Input.down[k]=false;});
// ── 音(すべて合成)
const Audio2={ctx:null,master:null,on:true,music:null,
  unlock(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}try{const A=window.AudioContext||window.webkitAudioContext;this.ctx=new A();this.master=this.ctx.createGain();this.master.gain.value=.7;this.master.connect(this.ctx.destination);const b=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=b;this.startAmb();}catch(e){this.ctx=null;}},
  noise(dur,f0,f1,q,vol,type='bandpass',at=0){if(!this.ctx)return;const c=this.ctx,t=c.currentTime+at,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=this.nb;s.loop=true;fl.type=type;fl.Q.value=q;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.012,dur*.2));g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(this.master);s.start(t,Math.random());s.stop(t+dur+.02);},
  tone(f,dur,vol,type='triangle',at=0,slide=0,dest){if(!this.ctx)return;const c=this.ctx,t=c.currentTime+at,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*slide),t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest||this.master);o.start(t);o.stop(t+dur+.02);},
  sfx(n){if(!this.ctx||!this.on)return;switch(n){
    case'swing':this.noise(.14,5200,900,1.2,.3);break;
    case'swing2':this.noise(.2,3200,500,1.1,.4);break;
    case'iai':this.noise(.06,9000,6000,.8,.25);this.noise(.3,7000,500,1.4,.55,'bandpass',.03);break;
    case'hit':this.noise(.11,1600,240,.8,.5);this.tone(150,.1,.32,'square',0,.45);break;
    case'heavy':this.noise(.22,1100,90,.7,.8);this.tone(90,.2,.5,'sine',0,.4);break;
    case'clang':this.tone(2150,.5,.14,'square',0,.98);this.tone(3370,.42,.12,'triangle');this.tone(5100,.24,.07,'sine');this.noise(.08,8000,3500,1,.35);break;
    case'block':this.tone(1250,.16,.14,'square',0,.8);this.noise(.05,4000,1600,1,.25);break;
    case'hurt':this.noise(.16,800,160,.8,.6);this.tone(120,.2,.3,'sawtooth',0,.5);break;
    case'step':this.noise(.05,520,240,.8,.05);break;
    case'land':this.noise(.1,420,120,.7,.2);break;
    case'dodge':this.noise(.16,1800,3600,.8,.12);break;
    case'coin':this.tone(1760,.08,.08,'square');this.tone(2637,.14,.08,'square',.05);break;
    case'text':this.tone(520+Math.random()*50,.022,.018,'square');break;
    case'select':this.tone(740,.09,.1,'triangle');this.tone(1110,.13,.08,'triangle',.05);break;
    case'door':this.noise(.5,300,900,1,.14);this.tone(196,.7,.1,'triangle');this.tone(294,.9,.07,'triangle',.08);break;
    case'skill':[523,659,784,1047].forEach((f,i)=>this.koto(f,i*.09,.14));break;
    case'taiko':this.tone(82,.5,.7,'sine',0,.55);this.noise(.05,700,200,.8,.3);break;
    case'kill':this.tone(62,.5,.6,'sine',0,.6);this.noise(.5,5000,200,.8,.4);break;}},
  koto(f,at=0,v=.09,dest){if(!this.ctx)return;this.tone(f,1.5,v,'triangle',at,1,dest);this.tone(f*2.003,.7,v*.35,'sine',at,1,dest);this.tone(f*3.01,.2,v*.2,'sawtooth',at,1,dest);},
  startAmb(){const c=this.ctx,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain(),lf=c.createOscillator(),lg=c.createGain();s.buffer=this.nb;s.loop=true;fl.type='lowpass';fl.frequency.value=480;g.gain.value=.05;lf.frequency.value=.09;lg.gain.value=170;lf.connect(lg);lg.connect(fl.frequency);s.connect(fl);fl.connect(g);g.connect(this.master);s.start();lf.start();this.ambGain=g;
    this.mg=c.createGain();this.mg.gain.value=.8;const dl=c.createDelay(1);dl.delayTime.value=.33;const fb=c.createGain();fb.gain.value=.33;this.mg.connect(this.master);this.mg.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(this.master);this.nextNote=0;this.notes=0;},
  // 陰旋法(都節)で琴を爪弾く。場面ごとに速さと密度を変える
  mood:'calm',tick(){if(!this.ctx||!this.on||!this.mg)return;const t=this.ctx.currentTime;if(t<this.nextNote)return;const sc=[0,1,5,7,8],root=this.mood==='battle'?146.8:this.mood==='sad'?110:130.8;const speed=this.mood==='battle'?.21:this.mood==='sad'?.72:.52;this.notes++;
    if(this.mood==='battle'){if(this.notes%4===0)this.tone(62,.34,.34,'sine',0,.55,this.mg);if(this.notes%8===6)this.tone(62,.28,.22,'sine',.1,.55,this.mg);}
    const r=Math.random();if(r<(this.mood==='battle'?.56:.72)){const o=Math.random()<.3?2:1,s=sc[Math.floor(Math.random()*5)],f=root*Math.pow(2,s/12)*o;this.koto(f,0,this.mood==='battle'?.05:.07,this.mg);if(Math.random()<.16)this.koto(f*.5,.09,.05,this.mg);}
    this.nextNote=t+speed*(Math.random()<.2?2:1);}};
