// ── 画面の文字まわり ──
const $=id=>document.getElementById(id);
const UI={speaker:null,pAv:{},advance:false,
 fit(){const vw=innerWidth,vh=innerHeight,portrait=vh>vw*1.1,touchy=matchMedia('(pointer:coarse)').matches;document.body.classList.toggle('touchy',touchy);const reserve=touchy&&portrait?230:0;let u=Math.min(vw/640,(vh-reserve)/360);document.documentElement.style.setProperty('--u',u+'px');$('wrap').style.justifyContent=reserve?'flex-start':'center';UI.layoutTouch(portrait);},
 hud(show,town){$('hud').style.opacity=show?1:0;$('hud').classList.toggle('town',!!town);},
 place(t){$('hplace').textContent=t;},
 updateHud(){const hp=clamp(P.hp/G.hpMax)*100;$('ghpi').style.width=hp+'%';$('ghpb').style.width=hp+'%';$('gkii').style.width=clamp(P.ki/100)*100+'%';$('hmoney').textContent=`銭 ${G.coin}文 / 団子 ${G.dango}`;},
 boss(e){const b=$('bossb');if(!e){b.style.display='none';return;}b.style.display='block';$('bname').textContent=e.def.name;const p=clamp(e.hp/e.hpMax)*100;$('bhi').style.width=p+'%';$('bhb').style.width=p+'%';},
 prompt(t){const p=$('prompt');if(!t){p.style.display='none';p.dataset.t='';return;}if(p.dataset.t!==t){p.dataset.t=t;p.innerHTML='';const k=document.createElement('kbd');k.textContent=matchMedia('(pointer:coarse)').matches?'話':'E';p.append(k,t);}p.style.display='block';},
 toast(t){const d=document.createElement('div');d.textContent=t;$('toast').append(d);setTimeout(()=>d.remove(),3200);},
 hint(t,sec=5){const h=$('hint');h.textContent=t;h.style.opacity=1;clearTimeout(UI._h);UI._h=setTimeout(()=>h.style.opacity=0,sec*1000);},
 banner(k,t,d){$('bk').textContent=k;$('bt').textContent=t;$('bd').textContent=d;const b=$('banner');b.style.opacity=1;clearTimeout(UI._b);UI._b=setTimeout(()=>b.style.opacity=0,5200);},
 chapter(a,b){$('cht').textContent=a;$('chs').textContent=b;const c=$('chapter');c.style.opacity=1;clearTimeout(UI._c);UI._c=setTimeout(()=>c.style.opacity=0,2300);Audio2.sfx('taiko');},
 wait(t){return new Promise(r=>setTimeout(r,t*1000));},
 fadeSleep(){return UI.flash(['……夜が明ける。'],{auto:1.3});},
 // 台詞。字送り→押すと全文→押すと次へ
 say(name,text){return new Promise(res=>{G.lock++;const d=$('dlg');d.style.display='block';$('dname').textContent=name;const body=$('dbody');body.className=name?'':'nar';body.textContent='';$('dmore').hidden=true;$('pframe').style.display=name?'block':'none';
   const key=NAME_OF[name];UI.speaker=key?(UI.pAv[key]||(UI.pAv[key]=makeAvatar(key))):null;if(UI.speaker){UI.speaker.chains=[];UI.speaker.pose.set(STAND);}
   let i=0,acc=0;const spd=name?42:32;UI._type=dt=>{acc+=dt*spd;let n=0;while(acc>=1&&i<text.length){acc-=1;const ch=text[i++];body.textContent=text.slice(0,i);n++;if(ch==='、'||ch==='。'||ch==='…'||ch==='?'||ch==='!')acc-=ch==='。'?5:2;}if(n&&(i%2===0)&&name)Audio2.sfx('text');if(i>=text.length){$('dmore').hidden=false;}};
   UI._adv=()=>{if(i<text.length){i=text.length;body.textContent=text;$('dmore').hidden=false;return;}UI._type=null;UI._adv=null;d.style.display='none';UI.speaker=null;G.lock--;Audio2.tone(620,.03,.03,'square');res();};});},
 choose(opts){return new Promise(res=>{G.lock++;const c=$('choices');c.innerHTML='';c.classList.add('open');let sel=0;$('dlg').style.display='none';const mk=opts.map((t,i)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>pick(i);b.onmouseenter=()=>{sel=i;paint();};c.append(b);return b;});const paint=()=>mk.forEach((b,i)=>b.classList.toggle('on',i===sel));paint();
   const pick=i=>{UI._choose=null;c.classList.remove('open');c.innerHTML='';Audio2.sfx('select');G.lock--;res(i);};
   UI._choose=()=>{if(Input.hit('down')){sel=(sel+1)%opts.length;paint();Audio2.tone(500,.03,.05,'square');}if(Input.hit('up')){sel=(sel+opts.length-1)%opts.length;paint();Audio2.tone(500,.03,.05,'square');}if(Input.hit('act')||Input.hit('slash')||Input.hit('jump'))pick(sel);};});},
 // 全画面の独白
 flash(lines,o={}){return new Promise(async res=>{G.lock++;const f=$('flash');f.querySelectorAll('p').forEach(p=>p.remove());f.style.display='flex';await UI.wait(.03);f.classList.add('show');await UI.wait(.5);const more=f.querySelector('.more');let waitAdv=null;UI._flashAdv=()=>{if(waitAdv){const w=waitAdv;waitAdv=null;w();}};
   for(const l of lines){if(!l){const sp=document.createElement('p');sp.textContent=' ';f.insertBefore(sp,more);continue;}const p=document.createElement('p');p.textContent=l;f.insertBefore(p,more);await UI.wait(.02);p.classList.add('in');await new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;r();}};waitAdv=go;setTimeout(go,(o.auto?o.auto*1000:(o.slow?1100:750)+l.length*22));});}
   if(!o.auto){more.style.opacity=1;await new Promise(r=>{waitAdv=r;});more.style.opacity=0;}else await UI.wait(o.auto);UI._flashAdv=null;f.classList.remove('show');await UI.wait(.7);f.style.display='none';G.lock--;res();});},
 tick(dt){if(UI._type)UI._type(dt);if(UI._choose)UI._choose();const adv=Input.hit('act')||Input.hit('slash')||Input.hit('jump');if(UI._adv&&adv&&!UI._choose)UI._adv();else if(UI._flashAdv&&adv)UI._flashAdv();
  if(UI.speaker){const A=UI.speaker,c=$('pc'),g=c.getContext('2d');g.clearRect(0,0,96,96);g.imageSmoothingEnabled=false;A.time+=dt;A.blink=(A.time%3.6)>3.46;const typing=UI._type&&$('dmore').hidden;A.mouth=typing&&(A.time*9%2)<1;A.pose.set(STAND);A.pose[PI.hy]+=Math.sin(A.time*2)*.3;drawRig(g,A,48,244,{scale:3.5/(A.style.scale||1),yaw:1.0,bust:true,ox:110,oy:232});}},
 // 巻物
 menuTab:'journal',openMenu(){if(G.mode==='title')return;$('menu').style.display='flex';G.lock++;G.menu=true;UI.drawMenu();},
 closeMenu(){if(!G.menu)return;$('menu').style.display='none';G.lock--;G.menu=false;},
 drawMenu(){const T=[['journal','旅の記'],['mem','記憶'],['skill','技'],['help','操作']];const t=$('tabs');t.innerHTML='';T.forEach(([k,n])=>{const b=document.createElement('button');b.textContent=n;if(UI.menuTab===k)b.className='on';b.onclick=()=>{UI.menuTab=k;UI.drawMenu();};t.append(b);});const m=$('mbody');const dots=n=>'●'.repeat(Math.min(n,8))+'○'.repeat(Math.max(0,5-n));let h='';
   if(UI.menuTab==='journal'){h+=`<div class="route"><span>縁(記憶の道)</span><span class="dots">${dots(G.en)}</span><span>練(剣の道)</span><span class="dots">${dots(G.ren)}</span></div>`;const ids=Object.keys(G.quests).reverse();ids.forEach(id=>{const q=QUESTS[id],done=G.quests[id]==='done';h+=`<div class="ent ${done?'done':''}"><b>${q.t}${done?'(済)':''}</b>${q.d}</div>`;});if(!ids.length)h+='<p>まだ何も書かれていない。</p>';}
   else if(UI.menuTab==='mem'){G.mems.forEach(id=>{h+=`<div class="ent"><b>${MEMS[id].t}</b>${MEMS[id].d}</div>`;});if(!G.mems.length)h+='<p>何も、思い出せない。</p>';}
   else if(UI.menuTab==='skill'){h+=`<div class="ent"><b>霜切り(体が覚えている)</b>三連の太刀、弾き、居合。</div>`;Object.keys(G.skills).forEach(k=>{h+=`<div class="ent"><b>${SKILLS[k].n}</b>${SKILLS[k].d}</div>`;});for(const k in SKILLS)if(!G.skills[k])h+=`<div class="ent" style="opacity:.5"><b>???</b>まだ知らない技。旅の師が持っているかもしれない。</div>`;}
   else h+=UI.helpHtml();
   m.innerHTML=h;},
 helpHtml(){return `<div class="ent"><b>動く</b>← → / A D で歩く。Shift を押しながらで走る。R で「常に走る」を切り替え。↑ / Space で跳ぶ。町では ↑↓←→ で全方向に歩ける。</div><div class="ent"><b>斬る</b>J / Z 連打で三連(燕返しを習うと四連)。空中でも斬れる。</div><div class="ent"><b>弾く</b>L / C。受ける瞬間に押すと相手を崩す。押しっぱなしは防御で、気を削られる。「危」の文字が出る赤い攻撃は、防御できない。弾くか、かわすか。</div><div class="ent"><b>かわす</b>I / V。一瞬、刃が当たらなくなる。</div><div class="ent"><b>居合</b>K / X を長押しで溜め、離すと踏み込んで一閃。</div><div class="ent"><b>その他</b>E / Enter で話す・入る。Q で団子を食べる。M / Tab で巻物を開く。</div>`;},
 // タッチ
 layoutTouch(portrait){const t=$('touch');if(!document.body.classList.contains('touchy')||t.dataset.p===String(portrait))return;t.dataset.p=portrait;t.innerHTML='';const B=(label,act,x,y,cl='',side='l')=>{const b=document.createElement('div');b.className='tb '+cl;b.textContent=label;b.style[side==='l'?'left':'right']=x+'px';b.style.bottom=y+'px';const on=e=>{e.preventDefault();b.classList.add('on');Audio2.unlock();if(act==='run')Input.touchRun=!Input.touchRun;else Input.press(act);};const off=e=>{e.preventDefault();b.classList.remove('on');if(act!=='run')Input.release(act);if(act==='run')b.classList.toggle('on',Input.touchRun);};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);t.append(b);};
   const y=portrait?24:10;B('←','left',8,y+50);B('→','right',104,y+50);B('↑','up',56,y+100,'s');B('↓','down',56,y+6,'s');B('走','run',8,y+118,'s');B('斬','slash',8,y+38,'','r');B('弾','guard',72,y+84,'','r');B('躱','dodge',72,y+18,'s','r');B('居','iai',136,y+56,'s','r');B('跳','jump',8,y+104,'s','r');B('話','act',136,y+6,'s','r');B('巻','menu',136,y+110,'s','r');},
};
addEventListener('resize',()=>UI.fit());
