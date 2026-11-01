// ── 3Dの骨格を1ピクセル単位で焼く小さなレンダラ ──
// 体の各部を球を引き伸ばしたカプセルとして塗り、Zバッファ・法線・段階トーン・リムライト・輪郭線を掛ける。
// 手足はIKで解くので毎フレーム違う絵になり、コマ割りではなく60fpsで滑らかに動く。
const BW=220,BH=190;
const rigCan=mkCanvas(BW,BH),rigG=rigCan.getContext('2d'),rigImg=rigG.createImageData(BW,BH);
const CB=new Uint32Array(rigImg.data.buffer),ZB=new Float32Array(BW*BH);ZB.fill(-1e9);
let dirty=[0,0,0,0];
const LE=new Uint8Array(new Uint32Array([1]).buffer)[0]===1;
const pack=(c,a=255)=>LE?((a<<24)|((c[2]&255)<<16)|((c[1]&255)<<8)|(c[0]&255))>>>0:0;
// 素材色(暗→明)
const MATS={
 skin:['#4a241c','#7c4630','#b0714c','#d89a6c','#f0bf92'],skinD:['#38201a','#5e3626','#8a5636','#b47c52','#d8a478'],skinP:['#6b4a44','#9a7468','#c8a48e','#e8cfb6','#fbeadb'],
 hair:['#08070c','#14121c','#242130','#3a3648','#5a5468'],hairG:['#3a3a42','#5e5e68','#8c8c94','#b6b6bc','#dedee0'],hairB:['#160d0a','#2a1810','#422818','#5e3a24','#7e5234'],
 ai:['#0c1426','#16233f','#223a60','#315583','#4a78a8','#7aa3c8'],aiL:['#1d2c44','#30486a','#47688f','#6c8fb0','#9dbad0'],
 white:['#7c7470','#a49c94','#cac2b6','#e8e0d2','#fff8ea'],hakama:['#191618','#2a2528','#3e383a','#57504f','#726a66'],obi:['#3c0e12','#6a1a1c','#962826','#c23f30','#e86a48'],
 red:['#3a0a0e','#6e1216','#a81e1e','#d83a2a','#ff6a44'],gold:['#4a2c0c','#7e5416','#b48228','#dcb044','#fbe07c'],saya:['#07070b','#14121a','#26222c','#3c3642','#6a6068'],
 steel:['#394656','#6d7e90','#a3b6c6','#d4e2ec','#ffffff'],iron:['#16181e','#2a2e36','#444a54','#666e78','#98a0a8'],wood:['#2a1608','#4a2a12','#6c421e','#8e5e2e','#b28048'],straw:['#47331a','#6e5228','#98763a','#c0a052','#e4c878'],
 kaki:['#3e1d0c','#6c3414','#98501e','#c0722c','#e49a44'],moss:['#141c10','#25321a','#3a4a26','#566838','#788a50'],gray:['#1e1e22','#34343a','#4e4e56','#6e6e76','#94949c'],black:['#050508','#0c0c12','#16161e','#22222c','#34343f'],
 oni:['#3a0606','#6e0e0e','#a81a14','#d43622','#ff6a40'],bone:['#5a5448','#8a8270','#b8ae98','#dcd4bc','#fffbe6'],sakura:['#6e2c4a','#a44d6c','#d07c92','#eea9b8','#ffd8dc'],matsu:['#123c34','#1c5a4a','#2a7c64','#459c80','#74c4a4'],fuji:['#241a44','#3a2b6a','#5a4494','#7e68b8','#ac98dc'],
 kuro:['#0d0a10','#1a1520','#2a2332','#3e3548','#584c66'],sumi:['#100e14','#1e1b24','#2e2a36','#44404e','#5e5a68'],spirit:['#2a5070','#4c88a8','#84c4dc','#c0ecf4','#ffffff'],kage:['#18060c','#3a0a18','#6a1424','#a0222c','#e04a3a'],
};
let RAMP={},RIM={},Light={L:[-.48,.68,.55],R:[.8,.5],tint:[1,1,1],rim:[255,235,200],rimA:.55,out:[14,10,16]};
function setLight(o){Object.assign(Light,o);RAMP={};RIM={};for(const k in MATS){const a=MATS[k].map(h=>hex(h).map((v,i)=>clamp(v*Light.tint[i],0,255)));RAMP[k]=a.map(c=>pack(c));RIM[k]=a.map(c=>pack(mixc(c,Light.rim,Light.rimA)));}Light.outP=pack(Light.out);}
setLight({});
// ── カプセルを焼く(座標は画面空間、z は手前ほど大)
function cap(a,b,ra,rb,mat,pat=0,o=null){const ox=a[0],oy=a[1],oz=a[2],dx=b[0]-ox,dy=b[1]-oy,dz=b[2]-oz,L2=dx*dx+dy*dy||1e-6,mr=Math.max(ra,rb)+1;
  const x0=Math.max(0,Math.floor(Math.min(ox,b[0])-mr)),x1=Math.min(BW-1,Math.ceil(Math.max(ox,b[0])+mr)),y0=Math.max(0,Math.floor(Math.min(oy,b[1])-mr)),y1=Math.min(BH-1,Math.ceil(Math.max(oy,b[1])+mr));
  if(x0<dirty[0])dirty[0]=x0;if(y0<dirty[1])dirty[1]=y0;if(x1>dirty[2])dirty[2]=x1;if(y1>dirty[3])dirty[3]=y1;
  const rp=RAMP[mat],rm=RIM[mat],n=rp.length-1,Lx=Light.L[0],Ly=Light.L[1],Lz=Light.L[2],Rx=Light.R[0],Ry=Light.R[1],flash=R.flash,dis=R.dis,sca=R.s;
  for(let y=y0;y<=y1;y++){const py=y+.5-oy;for(let x=x0;x<=x1;x++){const px=x+.5-ox;let t=(px*dx+py*dy)/L2;t=t<0?0:t>1?1:t;const r=ra+(rb-ra)*t,ex=px-dx*t,ey=py-dy*t,d2=ex*ex+ey*ey;if(d2>r*r)continue;
      const dzz=Math.sqrt(r*r-d2),z=oz+dz*t+dzz,i=x+y*BW;if(z<=ZB[i])continue;const b4=BAYER[(y&3)*4+(x&3)];if(dis>0&&b4<dis)continue;
      const nx=ex/r,ny=-ey/r,nz=dzz/r;let s=nx*Lx+ny*Ly+nz*Lz;s=s*.5+.5;
      switch(pat){case 1:s+=.13*Math.sin((ex/sca)*1.9+t*.6);break; // 袴のひだ
        case 2:s+=((Math.floor(t*9)+Math.floor(x*.7))&1)?.16:-.16;break; // 柄巻き
        case 3:{const f=t*(o&&o.bands||5)%1;if(f<.22)s-=.3;else if(f<.36)s+=.14;break;} // 札板
        case 4:if((x+Math.floor(y*.5))%5===0)s+=.13;break; // 縞の着物
        case 5:if((x+y*2)%7===0)s+=.22;else if((x-y*2)%11===0)s-=.14;break; // 細かな地紋
        case 6:s=ex*(dx>0?-1:1)+ey*.6>0?.98:.55+Math.sin(t*5+R.time*6)*.05;break; // 刃:峰と刃先の二段
        case 7:if(Math.floor(t*11+Math.abs(ex)*.25)&1)s-=.14;if((x+y)%5===0)s+=.07;break; // 編み笠
        case 8:if(Math.floor(t*7)&1)s-=.1;if(x%3===0)s-=.05;break;} // 木の節
      let idx=Math.floor((s+(b4-.5)*.1)*(n+.6));idx=idx<0?0:idx>n?n:idx;
      let c=rp[idx];if(1-nz>.5&&nx*Rx+ny*Ry>.42)c=rm[idx];if(flash>0&&b4<flash)c=0xffffffff;
      if(o&&o.emit&&b4<.5)c=rm[n];
      CB[i]=c;ZB[i]=z;}}}
// ── 変換(ヨー→ピッチ→画面)
const R={yaw:0,pitch:0,mirror:false,s:1,ox:0,oy:0,cy:1,sy:0,cp:1,sp:0,flash:0,dis:0,time:0};
function view(x,y,z){const X=x*R.cy-z*R.sy,Z1=x*R.sy+z*R.cy,Y=y*R.cp-Z1*R.sp,Z=Z1*R.cp+y*R.sp;return[R.ox+(R.mirror?-X:X)*R.s,R.oy-Y*R.s,Z*R.s];}
// ── 2関節IK:a→c を長さ l1,l2 で結ぶ中間点(pole 方向に膝・肘を出す)
function ik(a,c,l1,l2,pole){let dx=c[0]-a[0],dy=c[1]-a[1],dz=c[2]-a[2],d=Math.hypot(dx,dy,dz)||1e-4;const m=l1+l2-.01;if(d>m){const k=m/d;c=[a[0]+dx*k,a[1]+dy*k,a[2]+dz*k];dx*=k;dy*=k;dz*=k;d=m;}
  const ux=dx/d,uy=dy/d,uz=dz/d,A=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-A*A));const pd=pole[0]*ux+pole[1]*uy+pole[2]*uz;let px=pole[0]-ux*pd,py=pole[1]-uy*pd,pz=pole[2]-uz*pd;const pl=Math.hypot(px,py,pz)||1;px/=pl;py/=pl;pz/=pl;return[[a[0]+ux*A+px*h,a[1]+uy*A+py*h,a[2]+uz*A+pz*h],c];}
// 姿勢ベクトルの添字
const PN=['hx','hy','hz','lean','tw','hp','hy2','rx','ry','rz','lx','ly','lz','frx','fry','frz','flx','fly','flz','sw','swz','grip','shea','armor'];
const PI={};PN.forEach((n,i)=>PI[n]=i);const PL=PN.length;
function pose(o,base){const p=new Float32Array(PL);if(base)p.set(base);for(const k in o)p[PI[k]]=o[k];return p;}
const STAND=pose({hx:0,hy:29,hz:0,lean:.04,tw:.12,hp:0,hy2:0,rx:3,ry:29,rz:8.5,lx:0,ly:32,lz:-7.5,frx:1.5,fry:2,frz:3.8,flx:-2,fly:2,flz:-3.8,sw:-1.3,swz:0,grip:0,shea:1});
// ── 人物1体を焼く
function drawRig(ctx,A,sx,sy,o={}){const S=A.style,s=(o.scale||1)*(S.scale||1),p=A.pose;
  R.yaw=o.yaw===undefined?.45:o.yaw;R.pitch=o.pitch||0;R.mirror=!!o.mirror;R.s=s;R.ox=o.ox===undefined?BW/2:o.ox;R.oy=o.oy===undefined?BH-22:o.oy;R.cy=Math.cos(R.yaw);R.sy=Math.sin(R.yaw);R.cp=Math.cos(R.pitch);R.sp=Math.sin(R.pitch);R.flash=A.flash||0;R.dis=A.dissolve||0;R.time=A.time||0;
  dirty=[BW,BH,0,0];
  const B=S.build||{},w=B.w||1,g=(n)=>p[PI[n]],hip=[g('hx'),g('hy'),g('hz')],ln=g('lean'),tw=g('tw'),sl=Math.sin(ln),cl=Math.cos(ln);
  const chest=[hip[0]+sl*17,hip[1]+cl*17,hip[2]],neck=[hip[0]+sl*20,hip[1]+cl*20,hip[2]];
  const hl=ln*.55+g('hp'),head=[neck[0]+Math.sin(hl)*6.2,neck[1]+Math.cos(hl)*6.2,neck[2]];
  const SW=6.6*w,shR=[chest[0]+Math.sin(tw)*SW-sl*.5,chest[1]+1,chest[2]+Math.cos(tw)*SW],shL=[chest[0]-Math.sin(tw)*SW,chest[1]+1,chest[2]-Math.cos(tw)*SW];
  const hipR=[hip[0]+Math.sin(tw*.4)*4,hip[1]-1,hip[2]+3.6],hipL=[hip[0]-Math.sin(tw*.4)*4,hip[1]-1,hip[2]-3.6];
  const [kR,fR]=ik(hipR,[g('frx'),g('fry'),g('frz')],15.2,15.2,[1,.1,.15]),[kL,fL]=ik(hipL,[g('flx'),g('fly'),g('flz')],15.2,15.2,[1,.1,-.15]);
  const sa=g('sw'),swz=g('swz'),dir=[Math.cos(sa)*Math.cos(swz),Math.sin(sa)*Math.cos(swz),Math.sin(swz)];
  const handT=[g('rx'),g('ry'),g('rz')];let handLT=[g('lx'),g('ly'),g('lz')];const grip=g('grip');
  if(grip>0){const gp=[handT[0]-dir[0]*6,handT[1]-dir[1]*6,handT[2]-dir[2]*6];handLT=[lerp(handLT[0],gp[0],grip),lerp(handLT[1],gp[1],grip),lerp(handLT[2],gp[2],grip)];}
  const [eR,hR]=ik(shR,handT,11,11,[-.6,-.8,.55]),[eL,hL]=ik(shL,handLT,11,11,[-.5,-.8,-.55]);
  // 布の鎖(モデル空間)
  const anchors={head:[head[0]-4.2,head[1]+1.5,head[2]],back:[hip[0]-5,hip[1]+1,hip[2]-1],hip:[hip[0]-4,hip[1]+1,hip[2]+5],hair:[head[0]-5,head[1]+1.5,head[2]],sleeveR:[hR[0],hR[1],hR[2]]};
  if(A.chains)A.chains.forEach(c=>c.anchor=anchors[c.def.at]);
  const v=(q)=>view(q[0],q[1],q[2]),V=(q,r,m,pat,oo)=>{};
  const seg=(a,b,ra,rb,m,pat,oo)=>cap(v(a),v(b),ra*s,rb*s,m,pat||0,oo||null);
  const M=S.mats;
  // 胴
  seg(hip,chest,6.4*w,8*w,M.body,S.bodyPat||0,S.bodyOpt);
  seg(shL,shR,3.5,3.5,M.body,S.bodyPat||0,S.bodyOpt);
  seg([hip[0]+sl*2.6,hip[1]+cl*2.6,hip[2]],[hip[0]+sl*4.2,hip[1]+cl*4.2,hip[2]],6.9*w,7.1*w,M.obi);
  // 衿(合わせ)
  if(M.collar){const f=(u,d,z)=>[chest[0]+Math.cos(ln)*d+sl*u-0,chest[1]-sl*d+cl*u,chest[2]+z];const fr=7*w;seg(f(3,fr*.86,3),f(-6,fr*1.05,0),1.15,1.05,M.collar);seg(f(3,fr*.86,-3),f(-5,fr*1.02,0),1.1,1,M.collar);}
  if(S.armor){seg([chest[0]+1,chest[1]-6,chest[2]],[chest[0]+1,chest[1]+4,chest[2]],8.8*w,8.2*w,S.armor,3,{bands:5});seg([hip[0],hip[1]-2,hip[2]],[hip[0],hip[1]-10,hip[2]],8.4*w,10*w,S.armor,3,{bands:3});
    const sodeR=[shR[0],shR[1]+1,shR[2]+1],sodeL=[shL[0],shL[1]+1,shL[2]-1];seg(sodeR,[lerp(shR[0],eR[0],.6),lerp(shR[1],eR[1],.6),shR[2]+2],4.3,5,S.armor,3,{bands:3});seg(sodeL,[lerp(shL[0],eL[0],.6),lerp(shL[1],eL[1],.6),shL[2]-2],4.3,5,S.armor,3,{bands:3});}
  // 脚
  if(S.robe){const hemR=[lerp(kR[0],fR[0],.75),lerp(kR[1],fR[1],.85),fR[2]],hemL=[lerp(kL[0],fL[0],.75),lerp(kL[1],fL[1],.85),fL[2]];seg(hipR,hemR,5*w,4.4*w,M.leg,S.legPat||4);seg(hipL,hemL,5*w,4.4*w,M.leg,S.legPat||4);const mid=[(hemR[0]+hemL[0])/2,(hemR[1]+hemL[1])/2,0];seg(hip,mid,6.2*w,5.6*w,M.leg,S.legPat||4);}
  else if(S.tight){seg(hipR,kR,4.8,3.4,M.leg);seg(kR,fR,3.3,2.5,M.leg);seg(hipL,kL,4.8,3.4,M.leg);seg(kL,fL,3.3,2.5,M.leg);seg([fR[0],fR[1]+6,fR[2]],[fR[0],fR[1]+11,fR[2]],2.9,3.2,M.wrap||M.leg,3,{bands:4});seg([fL[0],fL[1]+6,fL[2]],[fL[0],fL[1]+11,fL[2]],2.9,3.2,M.wrap||M.leg,3,{bands:4});}
  else{const hem=(k,f)=>[lerp(k[0],f[0],.8),lerp(k[1],f[1],.8)+.5,f[2]];seg(hipR,kR,4.9*w,5*w,M.leg,1);seg(kR,hem(kR,fR),5*w,6.1*w,M.leg,1);seg(hipL,kL,4.9*w,5*w,M.leg,1);seg(kL,hem(kL,fL),5*w,6.1*w,M.leg,1);seg(hip,[(kR[0]+kL[0])/2,(kR[1]+kL[1])/2,0],6.2*w,4.6*w,M.leg,1);}
  // 足(草履)
  const foot=(f,zs)=>{const toe=[f[0]+5.2,Math.max(.8,f[1]-1.2),f[2]];seg([f[0]-1.4,f[1]-.6,f[2]],toe,1.9,1.5,M.foot||'skin');seg([f[0]-1.8,f[1]-2,f[2]],[toe[0]+.4,toe[1]-1.1,f[2]],1.5,1.1,M.sandal||'straw',7);};foot(fR);foot(fL);
  // 腕+袖
  const sl2=M.sleeve||M.body,arm=(sh,el,ha,side)=>{const wide=S.narrow?3:3.6;seg(sh,el,3.4,wide,sl2,S.bodyPat||0,S.bodyOpt);seg(el,[lerp(el[0],ha[0],.72),lerp(el[1],ha[1],.72),lerp(el[2],ha[2],.72)],wide,S.narrow?2.5:3.2,sl2,S.bodyPat||0,S.bodyOpt);seg([lerp(el[0],ha[0],.72),lerp(el[1],ha[1],.72),lerp(el[2],ha[2],.72)],ha,1.9,1.7,M.skin);if(!S.narrow){const dr=[lerp(el[0],ha[0],.4),lerp(el[1],ha[1],.4)-1,lerp(el[2],ha[2],.4)];seg(dr,[dr[0]-.8,dr[1]-5.4,dr[2]+side],3.3,1.4,sl2,S.bodyPat||0,S.bodyOpt);}seg(ha,ha,2.2,2.2,M.skin);};arm(shR,eR,hR,1);arm(shL,eL,hL,-1);
  // 首と頭
  const hr=(S.headR||5.3);seg(neck,head,2.8,2.8,M.skin);seg([head[0],head[1]-1.3,head[2]],[head[0]+1,head[1]+.5,head[2]],hr*.86,hr,M.skin);
  const hd=[Math.cos(hl),-Math.sin(hl)],hu=[Math.sin(hl),Math.cos(hl)],hy2=g('hy2'),cz=Math.cos(hy2),sz=Math.sin(hy2);
  const hp=(f,u,z)=>{const F=f*cz-z*sz,Z=f*sz+z*cz;return[head[0]+hd[0]*F+hu[0]*u,head[1]+hd[1]*F+hu[1]*u,head[2]+Z];};
  drawHair(S,M,seg,hp,hr);
  if(S.mask)drawMask(S,seg,hp,hr);
  if(S.hat)drawHat(S,seg,hp,hr);
  // 目鼻
  if(!S.noFace){seg(hp(hr*.88,-.3,0),hp(hr*.98,-.9,0),.9,.75,M.skin);
    const eye=(z)=>{const q=v(hp(hr*.82,.5,z));const nz=q[2]-v(hp(0,.5,0))[2];if(nz<-.8*s)return;const x=q[0]|0,y=q[1]|0,e=A.blink?0:1,col=pack(hex(S.eye||'#0e0a10'));
        const W2=Math.max(1,Math.round(s*.72)),H2=A.blink?1:Math.max(1,Math.round(s*1.1));for(let j=0;j<H2;j++)for(let i=0;i<W2;i++){const k=x+i+(y+j)*BW;if(k>=0&&k<CB.length){CB[k]=col;ZB[k]=1e6;}}
        if(s>1.8&&!A.blink){const k=x+(R.mirror?W2-1:0)+y*BW;CB[k]=0xffffffff;}
        const by=y-Math.round(s*1.5);for(let i=-1;i<W2+1;i++){const k=x+i+by*BW;if(k>=0&&k<CB.length&&s>=1.6){CB[k]=pack(hex('#1c1416'));ZB[k]=1e6;}}};
    eye(2);eye(-2);
    if(s>=1.8){const q=v(hp(hr*.92,-2.5,0));const mw=Math.round(s*1.6),mh=A.mouth?Math.round(s*.9):1,mc=pack(hex(A.mouth?'#40141a':'#5a2c28'));for(let j=0;j<mh;j++)for(let i=-mw;i<=mw;i++){const k=(q[0]|0)+i+((q[1]|0)+j)*BW;if(k>=0&&k<CB.length){CB[k]=mc;ZB[k]=1e6;}}}}
  // 鞘・刀
  if(S.weapon==='katana'&&!o.bust)drawKatana(S,M,seg,hip,hR,dir,g('shea'),sl,cl);
  else if(S.weapon&&!o.bust)drawWeapon(S,seg,hR,dir);
  if(S.saya&&S.weapon!=='katana'&&!o.bust){const a=[hip[0]+1,hip[1]+2,hip[2]-7];seg(a,[a[0]-20,a[1]-7,a[2]-1],1.4,1.2,'saya');}
  // 布
  if(A.chains)for(const c of A.chains){const d=c.def,pts=c.pts;for(let i=0;i<pts.length-1;i++){const t=i/(pts.length-1);seg(pts[i],pts[i+1],lerp(d.r[0],d.r[1],t),lerp(d.r[0],d.r[1],(i+1)/(pts.length-1)),d.mat,d.pat||0);}}
  // ── 輪郭線と奥行きの線
  const x0=Math.max(1,dirty[0]-1),y0=Math.max(1,dirty[1]-1),x1=Math.min(BW-2,dirty[2]+1),y1=Math.min(BH-2,dirty[3]+1),outP=A.outline||Light.outP,depthK=(o.bust?10:6.5)*s;
  const OUT=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=x+y*BW;if(CB[i]===0){if(CB[i-1]|CB[i+1]|CB[i-BW]|CB[i+BW])OUT.push(i);}else{const z=ZB[i];if((CB[i+BW]&&ZB[i+BW]-z>depthK)||(CB[i+1]&&ZB[i+1]-z>depthK)||(CB[i-1]&&ZB[i-1]-z>depthK)||(CB[i-BW]&&ZB[i-BW]-z>depthK)){const c=CB[i];if(c!==0xffffffff)CB[i]=(c&0xff000000)|(((c>>16&255)*.55&255)<<16)|(((c>>8&255)*.55&255)<<8)|((c&255)*.55&255);}}}
  for(const i of OUT)CB[i]=outP;
  // 太刀筋
  if(A.trail&&A.trail.length>1)drawTrail(A.trail,sx,sy,o);
  const w2=x1-x0+1,h2=y1-y0+1;
  if(w2>0&&h2>0){rigG.putImageData(rigImg,0,0,x0,y0,w2,h2);ctx.drawImage(rigCan,x0,y0,w2,h2,Math.round(sx-R.ox+x0),Math.round(sy-R.oy+y0),w2,h2);
    for(let y=y0;y<=y1;y++){const a=y*BW;CB.fill(0,a+x0,a+x1+1);ZB.fill(-1e9,a+x0,a+x1+1);}}
  // 刀身の先端を返す(太刀筋用)
  return{hand:hR,dir};
}
function drawKatana(S,M,seg,hip,hR,dir,shea,sl,cl){const hipS=[hip[0]+3,hip[1]+3,hip[2]-7.5],tail=[hipS[0]-26,hipS[1]-11,hipS[2]-1];seg(hipS,tail,1.35,1.15,M.saya||'saya');seg([hipS[0]-1,hipS[1],hipS[2]],[hipS[0]-3,hipS[1]-1,hipS[2]],1.7,1.7,'gold');
  if(shea>.5){const f=[hipS[0]+8,hipS[1]+3.4,hipS[2]+.5];seg(hipS,f,1.4,1.2,'kuro',2);seg(hipS,[hipS[0]+.6,hipS[1]+.2,hipS[2]],2.6,2.6,'gold');return;}
  const gs=[hR[0]+dir[0]*2.4,hR[1]+dir[1]*2.4,hR[2]+dir[2]*2.4],pm=[hR[0]-dir[0]*8,hR[1]-dir[1]*8,hR[2]-dir[2]*8];seg(gs,pm,1.2,1.1,'kuro',2);seg(gs,gs,2.5,2.5,'gold');
  // 刀身(わずかな反り)
  const L=(S.blade||31),perp=[-dir[1],dir[0],0],mid=[gs[0]+dir[0]*L*.55+perp[0]*.9,gs[1]+dir[1]*L*.55+perp[1]*.9,gs[2]+dir[2]*L*.55],tip=[gs[0]+dir[0]*L,gs[1]+dir[1]*L,gs[2]+dir[2]*L];seg(gs,mid,.78,.68,M.blade||'steel',6);seg(mid,tip,.68,.34,M.blade||'steel',6);}
function drawWeapon(S,seg,h,d){const W=S.weapon;if(W==='yari'){const t=[h[0]+d[0]*44,h[1]+d[1]*44,h[2]+d[2]*44],b=[h[0]-d[0]*26,h[1]-d[1]*26,h[2]-d[2]*26];seg(b,t,.85,.85,'wood',8);seg(t,[t[0]+d[0]*8,t[1]+d[1]*8,t[2]+d[2]*8],1.15,.3,'steel',6);seg([t[0]-d[0]*.6,t[1]-d[1]*.6,t[2]],[t[0]+d[0]*.8,t[1]+d[1]*.8,t[2]],1.7,1.5,'red');}
  else if(W==='kanabo'){const t=[h[0]+d[0]*30,h[1]+d[1]*30,h[2]+d[2]*30],b=[h[0]-d[0]*6,h[1]-d[1]*6,h[2]-d[2]*6];seg(b,t,1.5,3.7,'iron',3,{bands:7});for(let i=0;i<5;i++){const k=11+i*4.4,q=[h[0]+d[0]*k-d[1]*(2.2+k*.05),h[1]+d[1]*k+d[0]*(2.2+k*.05),h[2]+2];seg(q,q,.8,.8,'bone');}}
  else if(W==='kunai'){const t=[h[0]+d[0]*12,h[1]+d[1]*12,h[2]+d[2]*12];seg(h,t,.8,.3,'steel',6);seg(h,[h[0]-d[0]*3,h[1]-d[1]*3,h[2]],.9,.9,'kage');}
  else if(W==='shinai'){const t=[h[0]+d[0]*30,h[1]+d[1]*30,h[2]+d[2]*30],b=[h[0]-d[0]*8,h[1]-d[1]*8,h[2]-d[2]*8];seg(b,t,.95,.8,'wood',8);}
  else if(W==='staff'){const t=[h[0]+d[0]*22,h[1]+d[1]*22,h[2]],b=[h[0]-d[0]*24,h[1]-d[1]*24,h[2]];seg(b,t,.8,.8,'wood',8);seg(t,t,1.7,1.7,'gold');}
  else if(W==='fan'){const t=[h[0]+d[0]*6,h[1]+d[1]*6+2,h[2]];seg(h,t,1,3.5,'white',4);}
  else if(W==='suzu'){const t=[h[0]+d[0]*7,h[1]+d[1]*7,h[2]];seg(h,t,.5,.5,'wood');seg(t,t,2,2,'gold');}
  else if(W==='brush'){const t=[h[0]+d[0]*8,h[1]+d[1]*8,h[2]];seg(h,t,.5,.5,'wood');seg(t,[t[0]+d[0]*2,t[1]+d[1]*2,t[2]],.9,.3,'black');}
  else if(W==='oar'){const t=[h[0]+d[0]*20,h[1]+d[1]*20,h[2]],b=[h[0]-d[0]*18,h[1]-d[1]*18,h[2]];seg(b,t,.8,.8,'wood',8);seg(t,[t[0]+d[0]*10,t[1]+d[1]*10,t[2]],1.6,2.2,'wood',8);}
}
function drawHair(S,M,seg,hp,hr){const H=M.hair||'hair',st=S.hairStyle||'top';if(st==='none')return;if(st==='bald')return;
  seg(hp(-1.1,1.1,0),hp(-1.8,.2,0),hr*.98,hr*1.0,H);seg(hp(1.5,2.7,0),hp(-1.2,2.4,0),hr*.8,hr*.88,H);
  if(st==='top'||st==='ronin'){const a=hp(-2.6,hr+.5,0),b=hp(-5.3,hr+2.4,0);seg(a,b,1.5,1.05,H);seg(hp(-.8,hr-.5,0),a,1.9,1.5,H);if(st==='ronin'){seg(hp(2.8,1.4,hr*.68),hp(3.2,-2.6,hr*.78),.8,.45,H);seg(hp(3.4,1.6,-hr*.68),hp(3.4,-2,-hr*.78),.8,.45,H);}}
  if(st==='long'){seg(hp(-2.6,1,0),hp(-4.2,-9,0),hr*.86,3.8,H);}
  if(st==='bun'){seg(hp(-3.6,hr-.4,0),hp(-3.6,hr-.4,0),3.3,3.3,H);seg(hp(-1,hr,0),hp(-1,hr,0),2.6,2.6,M.pin||'gold');seg(hp(-4,hr+1.5,2.8),hp(-4.6,hr+3,4.6),.4,.4,M.pin||'gold');}
  if(st==='kid'){seg(hp(-1,hr+.2,0),hp(-1,hr+.2,0),2.2,2.2,H);}
  if(st==='miko'){seg(hp(-3.1,-.5,0),hp(-5.2,-17,0),4,2.2,H);seg(hp(-3.8,-1,0),hp(-3.8,-1.9,0),3.1,3,'white');}}
function drawMask(S,seg,hp,hr){const m=S.mask;if(m==='karasu'){seg(hp(hr*.3,1,0),hp(hr*.6,-.5,0),hr*.8,hr*.72,'black');seg(hp(hr*.7,.2,0),hp(hr*1.9,-1.8,0),2,.4,'kuro');}
  else if(m==='oni'){seg(hp(hr*.3,1,0),hp(hr*.6,-1,0),hr*.8,hr*.78,'oni');seg(hp(.5,hr-.6,2.8),hp(1.8,hr+3.8,3.8),1.3,.35,'bone');seg(hp(.5,hr-.6,-2.8),hp(1.8,hr+3.8,-3.8),1.3,.35,'bone');seg(hp(hr*.95,-2,1.5),hp(hr*.92,-3.6,1.6),.7,.3,'bone');seg(hp(hr*.95,-2,-1.5),hp(hr*.92,-3.6,-1.6),.7,.3,'bone');}
  else if(m==='scarf'){seg(hp(hr*.34,-1.4,0),hp(hr*.34,-2.6,0),hr*.84,hr*.72,S.mats.scarf||'kuro');}
  else if(m==='wrap'){seg(hp(hr*.2,1.6,0),hp(hr*.2,1.6,0),hr*1.0,hr*1.0,S.mats.scarf||'kuro');}
  else if(m==='band'){const rr=hr*1.0;for(let i=0;i<14;i++){const a=i/14*TAU,b=(i+1)/14*TAU;seg(hp(Math.cos(a)*rr-.5,2.9-Math.cos(a)*.3,Math.sin(a)*rr),hp(Math.cos(b)*rr-.5,2.9-Math.cos(b)*.3,Math.sin(b)*rr),.7,.7,S.mats.band||'red');}}}
function drawHat(S,seg,hp,hr){const h=S.hat;const cone=(R,H2,mat,pat,y0)=>{const n=Math.ceil(H2/.9);for(let k=0;k<=n;k++){const t=k/n,y=y0+H2*t,r=R*(1-t)+.8;for(let a=0;a<4;a++){const c=Math.cos(a*Math.PI/4)*r,d=Math.sin(a*Math.PI/4)*r;seg(hp(-c-.6,y,-d),hp(c-.6,y,d),.9,.9,mat,pat);}}};if(h==='amigasa'){cone(12.5,5.5,'straw',7,hr-1.6);}
  else if(h==='jingasa'){cone(10.5,4,'iron',0,hr-1.2);seg(hp(-.6,hr+3,0),hp(-.6,hr+3,0),1.2,1.2,'gold');}
  else if(h==='kabuto'){seg(hp(-.5,1.5,0),hp(-.5,2.5,0),hr*1.08,hr*1.05,'iron',3,{bands:6});seg(hp(-2,-1,0),hp(-3,-3.5,0),hr*.95,hr*.95,'iron',3,{bands:3});seg(hp(hr*.4,hr-1,2),hp(hr*1.1,hr+6,4.6),1.1,.3,'gold');seg(hp(hr*.4,hr-1,-2),hp(hr*1.1,hr+6,-4.6),1.1,.3,'gold');}
  else if(h==='tenugui'){seg(hp(-.4,1.9,0),hp(-.4,2.3,0),hr*.97,hr*.97,S.mats.scarf||'white');}
  else if(h==='eboshi'){seg(hp(-1,hr-.2,0),hp(-3,hr+7,0),3.6,2,'black');}}
// 太刀筋(ディザの帯):白→青へ冷め、先端ほど濃い
const TR_COL=[pack([255,255,255]),pack([210,236,255]),pack([120,180,240]),pack([70,110,190])];
function tri(ax,ay,bx,by,cx,cy,col,al){const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(BW-1,Math.ceil(Math.max(ax,bx,cx))),y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(BH-1,Math.ceil(Math.max(ay,by,cy)));const D=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(D)<.01)return;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const u=((by-cy)*(x-cx)+(cx-bx)*(y-cy))/D,v=((cy-ay)*(x-cx)+(ax-cx)*(y-cy))/D;if(u<0||v<0||u+v>1)continue;if(BAYER[(y&3)*4+(x&3)]>al)continue;CB[x+y*BW]=col;}
  if(x0<dirty[0])dirty[0]=x0;if(y0<dirty[1])dirty[1]=y0;if(x1>dirty[2])dirty[2]=x1;if(y1>dirty[3])dirty[3]=y1;}
function drawTrail(T,sx,sy,o){const n=T.length;for(let i=0;i<n-1;i++){const a=T[i],b=T[i+1],f=(i+1)/n,al=clamp(clamp(Math.min(a.life,b.life)*1.7)*(.45+.75*f)*2.1);const col=TR_COL[Math.min(3,Math.floor((1-f)*1.6+(1-a.life)*2.2))];
    const c=(p,k)=>[p[k]+R.ox,p[k+1]+R.oy];const [t1x,t1y]=c(a.p,0),[h1x,h1y]=c(a.p,2),[t2x,t2y]=c(b.p,0),[h2x,h2y]=c(b.p,2);tri(t1x,t1y,h1x,h1y,t2x,t2y,col,al);tri(t2x,t2y,h1x,h1y,h2x,h2y,col,al);}}
// 刀先と鍔の画面位置(太刀筋の記録用)
function bladePts(A,o,p=A.pose){const s=(o.scale||1)*(A.style.scale||1),sa=p[PI.sw],L=(A.style.reach||A.style.blade||31);const X=(x,z)=>x*Math.cos(o.yaw)-z*Math.sin(o.yaw);const f=(x,y,z)=>[(o.mirror?-1:1)*X(x,z)*s,-y*s];const hx=p[PI.rx],hy=p[PI.ry],hz=p[PI.rz],a=f(hx+Math.cos(sa)*(L+2),hy+Math.sin(sa)*(L+2),hz),b=f(hx+Math.cos(sa)*L*.42,hy+Math.sin(sa)*L*.42,hz);return[a[0],a[1],b[0],b[1]];}
// ── 布の鎖(ヴェルレ)
function mkChains(style){return(style.chains||[]).map(d=>({def:d,pts:Array.from({length:d.n},(_,i)=>[-i*d.len,40,0]),prev:Array.from({length:d.n},(_,i)=>[-i*d.len,40,0]),anchor:[0,40,0]}));}
function stepChains(A,dt,dvx,wind){if(!A.chains)return;const k=Math.min(dt,1/30)*60;for(const c of A.chains){const d=c.def,P=c.pts,Q=c.prev;P[0]=c.anchor.slice();for(let i=1;i<P.length;i++){const p=P[i],q=Q[i],vx=(p[0]-q[0])*.9,vy=(p[1]-q[1])*.9,vz=(p[2]-q[2])*.9;Q[i]=p.slice();p[0]+=vx-dvx*.35*k-(wind||0)*(.03+.02*Math.sin(A.time*3.1+i))*k;p[1]+=vy-(d.g===undefined?.12:d.g)*k+Math.sin(A.time*5+i*1.3)*.015*k;p[2]+=vz+Math.sin(A.time*2.3+i)*.012*k;}
    for(let it=0;it<2;it++)for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];let dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz)||1e-4;const f=(l-d.len)/l;if(i>1){a[0]+=dx*f*.5;a[1]+=dy*f*.5;a[2]+=dz*f*.5;b[0]-=dx*f*.5;b[1]-=dy*f*.5;b[2]-=dz*f*.5;}else{b[0]-=dx*f;b[1]-=dy*f;b[2]-=dz*f;}if(b[1]<1)b[1]=1;}}}
// ── 衣装帳
const ST={};
const band={at:'head',n:6,len:3.2,r:[.95,.55],mat:'red',g:.08};
ST.hero={mats:{skin:'skin',hair:'hair',body:'ai',sleeve:'ai',obi:'kuro',collar:'white',leg:'hakama',band:'red',saya:'saya',blade:'steel'},hairStyle:'ronin',mask:'band',bodyPat:5,chains:[band,{at:'hip',n:5,len:3,r:[.7,.4],mat:'red',g:.14},{at:'back',n:4,len:4.2,r:[3.2,1.6],mat:'ai',g:.1}],weapon:'katana',saya:true};
ST.ronin={mats:{skin:'skinD',hair:'hair',body:'gray',obi:'kuro',collar:'white',leg:'kuro'},hairStyle:'ronin',hat:'amigasa',bodyPat:4,weapon:'katana',saya:true};
ST.karasu={mats:{skin:'skinD',hair:'hair',body:'kuro',obi:'red',collar:'gray',leg:'sumi'},hairStyle:'ronin',mask:'karasu',weapon:'katana',saya:true,chains:[{at:'back',n:4,len:4,r:[3,1.4],mat:'kuro',g:.1}]};
ST.ashigaru={mats:{skin:'skinD',hair:'hair',body:'kaki',obi:'kuro',leg:'kaki',wrap:'white'},hat:'jingasa',hairStyle:'top',weapon:'yari',reach:50,tight:true,narrow:true,armor:'iron',build:{w:1}};
ST.shinobi={mats:{skin:'skinD',hair:'black',body:'black',obi:'kage',leg:'black',wrap:'kage',scarf:'black'},hairStyle:'none',mask:'wrap',hat:null,weapon:'kunai',reach:18,tight:true,narrow:true,scale:.93,chains:[{at:'head',n:6,len:3.6,r:[1.3,.6],mat:'kage',g:.05}],eye:'#ffefd8'};
ST.oni={mats:{skin:'skinD',hair:'hair',body:'kuro',obi:'red',leg:'red'},hairStyle:'none',mask:'oni',hat:'kabuto',armor:'kage',weapon:'kanabo',reach:36,scale:1.28,build:{w:1.18},eye:'#ffd040'};
ST.oboro={mats:{skin:'skinD',hair:'black',body:'kuro',obi:'gold',leg:'kuro',wrap:'red',scarf:'kuro'},hairStyle:'none',mask:'karasu',hat:'amigasa',weapon:'kunai',reach:22,tight:true,narrow:true,chains:[{at:'back',n:5,len:4.4,r:[3.6,1.4],mat:'black',g:.06},{at:'head',n:5,len:3.6,r:[1,.5],mat:'red',g:.05}],eye:'#ff5040'};
ST.takamaru={mats:{skin:'skin',hair:'hairB',body:'white',sleeve:'white',obi:'gold',collar:'red',leg:'sumi',band:'gold',saya:'white',blade:'spirit'},hairStyle:'ronin',bodyPat:5,weapon:'katana',saya:true,blade:34,chains:[{at:'back',n:5,len:4.6,r:[3.8,1.6],mat:'white',g:.08},{at:'hair',n:5,len:3,r:[1.8,.5],mat:'hairB',g:.1}]};
ST.katsuragi={mats:{skin:'skinD',hair:'hairG',body:'white',obi:'kuro',collar:'ai',leg:'ai'},hairStyle:'top',weapon:'shinai',reach:32,saya:false};
ST.mukuu={mats:{skin:'skinD',hair:'hair',body:'gray',obi:'kuro',collar:'white',leg:'gray',scarf:'sumi'},hairStyle:'bald',weapon:'staff',reach:30,robe:true};
const npc=(o)=>Object.assign({weapon:null},o);
ST.orin=npc({mats:{skin:'skinP',hair:'hair',body:'sakura',obi:'gold',collar:'white',leg:'sakura',sandal:'wood',pin:'red'},hairStyle:'bun',robe:true,scale:.95,bodyPat:5,narrow:false});
ST.tessai=npc({mats:{skin:'skinD',hair:'hairG',body:'moss',obi:'kuro',collar:'white',leg:'moss',scarf:'white'},hat:'tenugui',hairStyle:'none',scale:.98,bodyPat:4});
ST.sokichi=npc({mats:{skin:'skin',hair:'hairB',body:'kaki',obi:'wood',collar:'white',leg:'hakama',band:'moss'},hairStyle:'top',mask:'band',bodyPat:5,weapon:'brush'});
ST.ryonen=npc({mats:{skin:'skin',body:'kuro',obi:'gold',collar:'white',leg:'kuro'},hairStyle:'bald',robe:true,weapon:'staff'});
ST.kota=npc({mats:{skin:'skin',hair:'hair',body:'ai',obi:'red',collar:'white',leg:'aiL'},hairStyle:'kid',scale:.68,headR:6.2,tight:true});
ST.chigusa=npc({mats:{skin:'skinP',hair:'hair',body:'white',sleeve:'white',obi:'red',collar:'white',leg:'red',sandal:'wood'},hairStyle:'miko',robe:true,scale:.96,chains:[{at:'hair',n:4,len:4,r:[1.5,.7],mat:'hair',g:.14}],weapon:'suzu'});
ST.gonpachi=npc({mats:{skin:'skinD',hair:'hairB',body:'gray',obi:'wood',collar:'white',leg:'gray',scarf:'gray'},hairStyle:'ronin',scale:1.05,build:{w:1.12},tight:true,narrow:false});
ST.osa=npc({mats:{skin:'skin',hair:'hairB',body:'kaki',obi:'kuro',collar:'gray',leg:'kuro',band:'white'},hairStyle:'bun',mask:'band',narrow:true,tight:false});
ST.osuzu=npc({mats:{skin:'skinP',hair:'hair',body:'fuji',obi:'gold',collar:'white',leg:'fuji',scarf:'white'},hairStyle:'long',robe:true,scale:.94,mask:'band',noFace:false,weapon:'fan'});
ST.yohei=npc({mats:{skin:'skinD',hair:'hairG',body:'aiL',obi:'wood',leg:'aiL'},hat:'amigasa',hairStyle:'top',tight:true,scale:.96,weapon:'oar'});
ST.ochiyo=npc({mats:{skin:'skinD',hair:'hairG',body:'gray',obi:'wood',collar:'white',leg:'gray'},hairStyle:'bun',robe:true,scale:.82});
ST.villagerM=npc({mats:{skin:'skin',hair:'hair',body:'matsu',obi:'wood',leg:'hakama'},hairStyle:'top',tight:true,bodyPat:4});
ST.villagerF=npc({mats:{skin:'skinP',hair:'hairB',body:'fuji',obi:'white',collar:'white',leg:'fuji',pin:'gold'},hairStyle:'bun',robe:true,scale:.94,bodyPat:5});
ST.spirit=npc({mats:{skin:'spirit',hair:'spirit',body:'spirit',obi:'spirit',collar:'spirit',leg:'spirit',saya:'spirit',blade:'spirit'},hairStyle:'ronin',weapon:'katana',saya:true,noFace:true});
function makeAvatar(styleName){const style=ST[styleName];return{style,pose:STAND.slice(),chains:mkChains(style),time:Math.random()*10,flash:0,dissolve:0,trail:[]};}
