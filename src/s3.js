// ---------- map (azimuthal equidistant over the North Pacific, real coastlines) ----------
const cv=$('map'),ctx=cv.getContext('2d');
const nl=lon=>lon<0?lon+360:lon;
const MAPC={lon:192,lat:56,R:235,cx:320,cy:215};const D2R=Math.PI/180;
function proj(lon,lat){const l1=MAPC.lat*D2R,l2=lat*D2R,dl=(lon-MAPC.lon)*D2R;const cosc=Math.sin(l1)*Math.sin(l2)+Math.cos(l1)*Math.cos(l2)*Math.cos(dl);const c=Math.acos(Math.max(-1,Math.min(1,cosc)));const k=c<1e-9?1:c/Math.sin(c);const x=k*Math.cos(l2)*Math.sin(dl),y=k*(Math.cos(l1)*Math.sin(l2)-Math.sin(l1)*Math.cos(l2)*Math.cos(dl));return[MAPC.cx+MAPC.R*x,MAPC.cy-MAPC.R*y]}
function toV(lon,lat){const a=lat*D2R,b=lon*D2R;return[Math.cos(a)*Math.cos(b),Math.cos(a)*Math.sin(b),Math.sin(a)]}
function fromV(v){return[Math.atan2(v[1],v[0])/D2R,Math.asin(v[2])/D2R]}
function gc(a,b,t){const u=toV(a.lon,a.lat),w=toV(b.lon,b.lat);const d=Math.acos(Math.max(-1,Math.min(1,u[0]*w[0]+u[1]*w[1]+u[2]*w[2])));const s1=Math.sin((1-t)*d)/Math.sin(d),s2=Math.sin(t*d)/Math.sin(d);return fromV([u[0]*s1+w[0]*s2,u[1]*s1+w[1]*s2,u[2]*s1+w[2]*s2])}
const GREELY={lon:-145.7,lat:64.0},VAND={lon:-120.6,lat:34.7};
const cam={x:320,y:200,s:1,tx:320,ty:200,ts:1,mode:'auto'};
function camTarget(){
  if(!S||!G||cam.mode==='wide')return[320,200,1];const sc=G.sc,e=S.elapsed,f=e/G.TOTAL,site=sc.site,city=sc.city;const ended=isHit()||G.intercept==='sat';const[cx,cy]=proj(city.lon,city.lat);
  if(cam.mode==='city')return[cx,cy,3.2];if(ended&&!S.running)return[320,200,1];
  if(ended){const stop=G.aegisHit?.40:G.intercept==='hit'?.47:G.intercept==='sat'?.47:.52;const[lo,la]=gc(site,city,stop);const[x,y]=proj(lo,la);return[x,y,2.2]}
  if(f<.11)return[320,200,1];if(f<.11+60/G.TOTAL)return[cx,cy,3.2];
  if(f>=.43&&f<.54&&G.shots>0){const[lo,la]=gc(site,city,Math.min(.52,Math.max(.44,f))+.02);const[x,y]=proj(lo,la);return[x,y,2.6]}
  if(f>=.88)return[cx,cy,3.6];const[lo,la]=gc(site,city,Math.min(1,f));const[x,y]=proj(lo,la);return[(x+cx)/2,(y+cy)/2,1.7];
}
$('eta').style.cursor='pointer';$('eta').title='클릭: 카메라 모드 전환';$('eta').onclick=()=>{cam.mode={auto:'wide',wide:'city',city:'auto'}[cam.mode]};
function drawMap(){
  const W=cv.width,H=cv.height;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
  const[tx,ty,ts]=camTarget();cam.tx=tx;cam.ty=ty;cam.ts=ts;const k=S&&S.running?.06:.12;cam.x+=(cam.tx-cam.x)*k;cam.y+=(cam.ty-cam.y)*k;cam.s+=(cam.ts-cam.s)*k;
  const hw=W/2/cam.s,hh=H/2/cam.s;cam.x=Math.max(hw,Math.min(W-hw,cam.x));cam.y=Math.max(hh,Math.min(H-hh,cam.y));
  ctx.translate(W/2,H/2);ctx.scale(cam.s,cam.s);ctx.translate(-cam.x,-cam.y);ctx.fillStyle='#070b10';ctx.fillRect(-W,-H,W*3,H*3);
  ctx.strokeStyle='#14202c';ctx.lineWidth=1/cam.s;for(let lon=90;lon<=330;lon+=10){ctx.beginPath();for(let lat=0;lat<=85;lat+=2){const[x,y]=proj(lon,lat);lat?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}for(let lat=0;lat<=80;lat+=10){ctx.beginPath();for(let lon=90;lon<=330;lon+=2){const[x,y]=proj(lon,lat);lon>90?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
  ctx.fillStyle='#16222f';ctx.strokeStyle='#33485e';ctx.lineWidth=.8/cam.s;ctx.beginPath();for(const ring of LAND){ring.forEach((p,i)=>{const[x,y]=proj(p[0],p[1]);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath()}ctx.fill('evenodd');ctx.stroke();
  ctx.font=`${9/cam.s}px "IBM Plex Mono",monospace`;ctx.fillStyle='#3e5068';[['CONUS',-100,40],['ALASKA',-153,65],['RUSSIA',110,64],['JAPAN',138,34],['PACIFIC',-168,28],['CANADA',-108,56],['CHINA',105,36],['KOREA',127,36.5],['KAMCHATKA',158,56],['HAWAII',-158,19]].forEach(([n,lo,la])=>{const[x,y]=proj(lo,la);ctx.fillText(n,x,y)});
  ctx.fillStyle='#2f4256';for(const k2 in CITIES){const c=CITIES[k2];const[x,y]=proj(c.lon,c.lat);ctx.beginPath();ctx.arc(x,y,1.5/cam.s,0,Math.PI*2);ctx.fill()}
  if(!S||!G){ctx.setTransform(1,0,0,1,0,0);return}
  const sc=G.sc,e=S.elapsed,prog=Math.min(1,e/G.TOTAL),site=sc.site,city=sc.city,s=cam.s,KM=0.0554*2.5;
  const ended=isHit()||G.intercept==='sat';const stop=G.intercept==='sat'?Math.min(prog,.47):ended?(G.aegisHit?.40:G.intercept==='hit'?.47:.52):prog;
  const path=(a,b,to,dash,color,w)=>{ctx.setLineDash(dash.map(d=>d/s));ctx.strokeStyle=color;ctx.lineWidth=w/s;ctx.beginPath();for(let t=0;t<=to+1e-9;t+=.01){const[lo,la]=gc(a,b,Math.min(1,t));const[x,y]=proj(lo,la);t?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();ctx.setLineDash([])};
  const known=e>=G.TOTAL*.11;
  if(known)path(site,city,1,[3,6],'#7a4e24',1.2);path(site,city,stop,[],'#f3b43a',2);
  if(sc.second&&sc.second.real&&(S.t2||G.secondHit)){const off=sc.second.offset/G.TOTAL;const p2=Math.max(0,prog-off);path(site,sc.second.city,1,[2,5],'#5a4030',1);path(site,sc.second.city,G.secondHit?Math.min(p2,.62-off):p2,[],'#c98a3a',1.5);if(!G.secondHit&&S.running){const[l2,a2]=gc(site,sc.second.city,Math.min(1,p2));const[x2,y2]=proj(l2,a2);ctx.fillStyle='#ffa07a';ctx.beginPath();ctx.arc(x2,y2,4/Math.sqrt(s),0,Math.PI*2);ctx.fill();ctx.font=`${8/s}px "IBM Plex Mono",monospace`;ctx.fillText('TRK 0418',x2+8/s,y2-6/s)}else if(G.secondHit){const[l2,a2]=gc(site,sc.second.city,Math.max(0,.62-off));const[x2,y2]=proj(l2,a2);ctx.strokeStyle='#48c98a';ctx.lineWidth=2/s;const q=6/s;ctx.beginPath();ctx.moveTo(x2-q,y2-q);ctx.lineTo(x2+q,y2+q);ctx.moveTo(x2+q,y2-q);ctx.lineTo(x2-q,y2+q);ctx.stroke()}}else if(sc.second&&S.t2){path(site,sc.second.city,1,[2,5],'#5a4030',1)}
  const[lx,ly]=proj(site.lon,site.lat);ctx.strokeStyle='#5a4a2a';ctx.lineWidth=1/s;ctx.beginPath();ctx.arc(lx,ly,(S.calls.dia||G.shared.calls>2?8:known?22:40)/Math.sqrt(s),0,Math.PI*2);ctx.stroke();dot(lx,ly,'#f3b43a',S.calls.dia?site.n:'LAUNCH ?');
  const[gx,gy]=proj(GREELY.lon,GREELY.lat);dot(gx,gy,'#4ea4e6','FT GREELY GBI');const[vx,vy]=proj(VAND.lon,VAND.lat);dot(vx,vy,'#3e5068','VANDENBERG');if(sc.assets.aegis){const[ax,ay]=proj(136,40);dot(ax,ay,'#4ea4e6','AEGIS')}
  const[cx,cy]=proj(city.lon,city.lat);
  if(known){const fr=Math.min(1,(prog-.11)/.89);let cep=60*Math.pow(1-fr,1.6)+4;if(S.calls.stratcom)cep*=.6;if(S.feedDead)cep*=1.3;S.cep=cep;const r=Math.max(4/s,cep*KM);ctx.strokeStyle='rgba(255,74,61,.7)';ctx.lineWidth=1/s;ctx.setLineDash([3/s,3/s]);ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(255,74,61,.08)';ctx.fill();ctx.fillStyle='#ffb0a8';ctx.font=`${8/s}px "IBM Plex Mono",monospace`;ctx.fillText(`CEP ±${Math.round(cep)}km`,cx+r+3/s,cy+r)}
  dot(cx,cy,known?'#ff4a3d':'#3e5068',known?city.n:'IMPACT ?');
  if(sc.second&&sc.second.real&&S.t2){const[sx,sy]=proj(sc.second.city.lon,sc.second.city.lat);dot(sx,sy,'#ff4a3d',sc.second.city.n)}
  if(e>=G.TOTAL*.44&&e<=G.TOTAL*(G.intercept==='miss'&&G.shots===2?.52:.47)&&G.shots>0){const t0=e>=G.TOTAL*.49?.49:.44,tt=Math.min(1,(e-G.TOTAL*t0)/(G.TOTAL*.03));const[tlo,tla]=gc(site,city,t0+.03);const[tx2,ty2]=proj(tlo,tla);const ix=gx+(tx2-gx)*tt,iy=gy+(ty2-gy)*tt;ctx.strokeStyle='#4ea4e6';ctx.lineWidth=1/s;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(ix,iy);ctx.stroke();ctx.fillStyle='#4ea4e6';ctx.beginPath();ctx.arc(ix,iy,3/s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9fd0ff';ctx.font=`${8/s}px "IBM Plex Mono",monospace`;ctx.fillText('GBI',ix+5/s,iy-5/s)}
  if(S.running&&!ended&&!S.feedDead){const[mlo,mla]=gc(site,city,prog);const[mx,my]=proj(mlo,mla);ctx.fillStyle='#ff4a3d';ctx.beginPath();ctx.arc(mx,my,5/Math.sqrt(s),0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff4a3d';ctx.lineWidth=1/s;ctx.beginPath();ctx.arc(mx,my,(9+(Math.floor(e*2)%3)*3)/Math.sqrt(s),0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffb0a8';ctx.font=`${9/s}px "IBM Plex Mono",monospace`;ctx.fillText('TRK 0417',mx+10/s,my-8/s)}
  if(ended){const[mlo,mla]=gc(site,city,stop);const[mx,my]=proj(mlo,mla);ctx.strokeStyle='#48c98a';ctx.lineWidth=2/s;const q=7/s;ctx.beginPath();ctx.moveTo(mx-q,my-q);ctx.lineTo(mx+q,my+q);ctx.moveTo(mx+q,my-q);ctx.lineTo(mx-q,my+q);ctx.stroke()}
  ctx.setTransform(1,0,0,1,0,0);const g=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.9);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.font='9px "IBM Plex Mono",monospace';ctx.fillStyle='#3e5068';ctx.fillText(`C2BMC · ${cam.mode.toUpperCase()} · ×${cam.s.toFixed(1)}`,8,12);
  if(S.feedDead){ctx.fillStyle='rgba(255,74,61,.08)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ff4a3d';ctx.font='600 12px "IBM Plex Mono",monospace';ctx.fillText('DATA LINK STALE',14,H-14)}
}
function dot(x,y,c,l){const s=cam.s;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,3.5/Math.sqrt(s),0,Math.PI*2);ctx.fill();ctx.fillStyle='#9fb0c0';ctx.font=`${9/s}px "IBM Plex Mono",monospace`;ctx.fillText(l,x+7/s,y+3/s)}

// ---------- wall ----------
const LAMPS=[['NC3','nc3'],['JWICS','jwics'],['SIPR','sipr'],['SBIRS','sbirs'],['C2BMC','c2bmc'],['GMD FC','gmd'],['CONF','conf'],['HOTLINE','hot']];
function wall(){
  const now=new Date();const z=(tz,lab)=>`<div>${lab}<b>${new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now)}</b></div>`;
  $('clocks').innerHTML=z('America/New_York','WASHINGTON')+z('UTC','ZULU')+z('Europe/Moscow','MOSCOW')+z('Asia/Pyongyang','PYONGYANG')+z('America/Anchorage','GREELY');
  const f=G?F():{},st={nc3:G&&G.sc.pres.lag?'warn':'',jwics:f.cyber==='switch'?'warn':'',sipr:'',sbirs:S&&S.feedDead?'off':'',c2bmc:S&&S.feedDead?'off':'',gmd:G&&G.intercept==='miss'&&G.shots>0?'warn':'',conf:S&&S.linkDead?'off':S&&!Object.keys(S.principals).length?'warn':'',hot:f.hotline==='none'?'warn':''};
  $('lamps').innerHTML=LAMPS.map(([n,k])=>`<span class="lamp ${st[k]||''}"><i></i>${n}</span>`).join('');
  const e=$('eam');if(S&&S.running&&f.defcon&&f.defcon<=3&&!(f.decision&&f.decision!=='hold')){if(!e.innerHTML){const grp=()=>Math.random().toString(36).slice(2,8).toUpperCase();e.innerHTML=`<span>EAM · SKYKING SKYKING DO NOT ANSWER · ${grp()} ${grp()} ${grp()} ${grp()} · AUTHENTICATION ${grp()}</span>`}}else if(!(f.decision&&f.decision!=='hold'))e.innerHTML='';
}
setInterval(wall,1000);wall();

// ---------- loop ----------
function loop(){
  if(!S.running||S.paused)return;const dt=G.speed*.25;S.elapsed+=dt;for(const k in S.callCool)if(S.callCool[k]>0)S.callCool[k]=Math.max(0,S.callCool[k]-dt);
  if(S.cep&&!S.feedDead)$('tCep').textContent='±'+Math.round(S.cep)+'km';
  if(S.phase!=='post'&&!S.feedDead&&G.intercept!=='sat'&&!isHit()&&S.elapsed-S.lastTele>=22&&S.elapsed>=G.TOTAL*.06){S.lastTele=S.elapsed;const p=S.elapsed/G.TOTAL,peak=G.sc.isSLBM?650:1200,alt=Math.max(0,4*peak*p*(1-p)),vel=(G.sc.isSLBM?5.9:7.0)*(0.75+0.5*Math.sin(p*Math.PI)),site=G.sc.site,city=G.sc.city;const u=toV(site.lon,site.lat),w=toV(city.lon,city.lat);const rng=Math.acos(Math.max(-1,Math.min(1,u[0]*w[0]+u[1]*w[1]+u[2]*w[2])))*6371;const rem=Math.round(rng*(1-p));$('tAlt').textContent=Math.round(alt)+' km';$('tVel').textContent=vel.toFixed(1)+' km/s';$('tPhase').textContent=p<.17?'부스트':p<.85?(p>.5?'중간 · 하강':'중간 단계'):'종말 단계';post('C2BMC','noise',`TRK 0417 · 고도 ${Math.round(alt)}km · ${vel.toFixed(1)}km/s · 잔여 ${rem}km · TTI ${fmt(left())}${S.cep?' · CEP ±'+Math.round(S.cep)+'km':''}`)}
  const c=$('clock');if(S.phase==='post'){c.textContent='T+'+fmt(S.elapsed-S.postStart);c.classList.remove('crit');c.style.color='var(--green)'}else{c.textContent=fmt(left());c.classList.toggle('crit',left()<=180);c.style.color=''}
  $('eta').textContent=G.intercept==='sat'?'궤도 진입':S.phase==='post'?'T+'+fmt(S.elapsed-S.postStart):'TTI '+fmt(left());
  const open=S.cards.filter(x=>!x.done).length;$('presWait').textContent=open>=2?'⚠ '+open+'건 동시 대기':'';
  if(S.ring&&Math.floor(S.elapsed*2)%2===0)SFX.tick();
  commonReports();[act1,act2,act3][G.act-1]();runTimers();if(!S.running)return;tickCards();tickRing();updCalls();drawMap();AI.tick(dt);MUSIC.tick();WORLD.tick();
}

// ---------- act flow ----------
function startAct(act,speed){
  G.act=act;G.speed=speed;S=freshAct();S.running=true;INTEL.reset();if(act===1)WORLD.reset();EVT.recent=[];REACT.fired.clear();CHAIN.fired.clear();$('unseal').hidden=true;
  const startAt=act===1?0:act===2?.11:.47;S.elapsed=startAt*G.TOTAL;S.startSec=S.elapsed;
  const f=F();
  $('roleTag').textContent=['','1막 · 상황실 당직 장교','2막 · 국가안보 부보좌관','3막 · 대통령'][act];$('pSpeed').textContent='×'+speed;
  $('banner').style.background='';$('banner').textContent='MISSILE THREAT · CONUS · OPREP-3 PINNACLE';$('banner').classList.toggle('on',act>1);$('wrap').style.filter='';
  $('feed').innerHTML='';$('conf').innerHTML='<div class="empty">회의선이 열리지 않았습니다.</div>';$('conf').classList.remove('dead');$('confState').textContent='미소집';$('feedCount').textContent='0';$('fixLink').hidden=true;$('fixFeed').hidden=true;$('eam').innerHTML='';
  $('gmdCon').hidden=true;$('presCon').hidden=true;$('folder').hidden=true;$('mapTitle').textContent='NORAD 공통작전상황도 · 북태평양';$('decTitle').innerHTML='결정·작업 대기 <span id="decCount">0</span>';$('confTitle').textContent='위협평가 회의선';
  [['pTrack',act>1?'TRK 0417 · 1발':'TRK —'],['pDefcon','DEFCON '+f.defcon],['pGmd','GMD 대기'],['pPres','POTUS: '+(f.move==='peoc'?'PEOC':f.move==='heli'?'공중':G.sc.pres.n)]].forEach(([id,t])=>{const p=$(id);p.className='pill'+(id==='pTrack'&&act>1?' red':'')+(id==='pDefcon'&&f.defcon<=3?(f.defcon===2?' red':' on'):'');p.textContent=t});
  [['tPhase',act>1?'중간 단계':'—'],['tAlt','—'],['tVel','—'],['tSens',act>1?'SBIRS+UEWR':'—'],['tLaunch',act>1&&f.calls?G.sc.site.n:'미확정'],['tImp',act>1?G.sc.city.n:'산출 중'],['tCep','—'],['tRv',act>1?'1개 분리':'미확인'],['tWh','미확인'],['tAsset',G.sc.assets.n],['tWin',fmt(G.TOTAL*.44)+'~'+fmt(G.TOTAL*.36)],['tData','LIVE']].forEach(([id,t])=>{$(id).textContent=t;$(id).className=$(id).className.replace('stale','')});
  if(act>=2){G.intercept=null;G.shots=0;G.aegisHit=null;G.secondHit=null;G.altHit=null;if(G.sc.second&&G.sc.second.real)S.t2=true}
  if(act===2){$('gmdCon').hidden=false;$('mapTitle').textContent='C2BMC · GMD 교전 콘솔 · 포트 그릴리';S.kc={track:'done'};renderKC()}
  if(act===3){
    $('presCon').hidden=false;$('mapTitle').textContent=(f.move==='peoc'?'PEOC':f.move==='heli'?'마린원 / AF1':G.sc.pres.n)+' · 대통령 상황도';$('decTitle').innerHTML='대통령 결정 <span id="decCount">0</span>';$('confTitle').textContent='참모 (회의선)';
    $('briefDoc').innerHTML=`<div class="h">WHSR 요약 보고서 · 상황실 당직 장교</div>${f.briefItems.length?f.briefItems.map(x=>'· '+x).join('\n'):'(서면 보고 없음 — 구두 보고만)'}\n\n<div class="h">1차 판단</div>발사 주체: ${ {dprk:'북한 추정',ru:'러시아 가능성',unknown:'미상',none:'미보고'}[f.attrib||'none']}\n<div class="h">부보좌관 권고</div>요격 ${ {salvo:'일제',single:'1발',delegate:'위임'}[f.gmd]||'—'} · 경보 ${ {now:'발령',wait:'결과 후','wait-on':'발령',hold:'보류',late:'미결'}[f.evac]||'—'} · DEFCON ${f.defcon} · 폴더 ${f.options.join('/')||'표준'}`;
    $('bisCode').textContent='— 봉인 —';if(!f.options.length)f.options=['full','limited','conv','hold'];
    // replay the engagement with the same dice so act 3 sees act 2's result
    if(f.aegis==='go'&&T().id!=='sat'){G.aegisHit=G.sc.rolls.aegis<.5;if(G.aegisHit)G.intercept='hit'}
    if(!isHit()&&T().id!=='sat'){resolveGBI();S.shot2=f.gmd!=='delegate';resolveSecondShot()}
    if(G.sc.second&&G.sc.second.real&&T().id!=='sat'){resolveSecond();if(G.secondHit)S.t2=false}
    if(T().id==='sat'){G.intercept='sat';$('pTrack').textContent='TRK 0417 · 궤도 진입';$('pTrack').className='pill green';$('banner').textContent='FALSE ALARM · ORBITAL INSERTION';S.fired.add('0.47')}
    else if(isHit()){S.phase='post';S.postStart=S.elapsed;$('banner').style.background='var(--green)';$('banner').textContent='TARGET DESTROYED · POST-ENGAGEMENT WATCH';$('pGmd').textContent='요격 성공';$('pGmd').className='pill green';$('pTrack').textContent='TRK 0417 · 소실';$('pTrack').className='pill green';['post0','post15','post70','post100','post140'].forEach(k=>S.fired.add(k));later(()=>{if(S.running)post('GMD 포트 그릴리','alert',`요격 성공. ${G.shots||'SM-3'}${G.shots?'발 교전':''}. 표적 소실.`,'높음')},300)}
    else{$('pGmd').textContent='요격 실패';$('pGmd').className='pill red';later(()=>{if(S.running)post('GMD 포트 그릴리','alert',`요격 실패. ${G.shots}발 교전. 표적 계속 비행. TTI ${fmt(left())}.`,'높음')},300)}
    if(f.evac==='now'||f.evac==='wait-on')later(()=>{if(S.running)post('FEMA 국가감시센터','',`${G.sc.city.n} 민방위 경보 발령 중.`)},600);
  }
  $('intro').hidden=true;$('ending').hidden=true;$('ring').hidden=true;renderCards();updCalls();AI.reset();MUSIC.start();clearInterval(timer);timer=setInterval(loop,250);loop();
}
function endAct(){if(!S.running)return;if(S.paused)setPause(false);S.running=false;clearInterval(timer);if(S.ring)closeRing();MUSIC.stop();if(G.act<3){showInterstitial();return}finish()}
function showInterstitial(){
  const f=F(),next=G.act+1;$('a'+G.act).classList.add('done');
  $('introKicker').textContent=`${G.act}막 종료 · ${next}막 준비`;
  $('introTitle').textContent=next===2?'의자가 바뀐다. 당신은 이제 국가안보 부보좌관이다.':'마지막 의자. 당신은 대통령이다.';
  $('introBody').textContent=next===2?'같은 18분을 다시 산다. 탄착지가 확정되는 순간부터. 상황실이 올린 보고서가 책상에 있고, 요격·경보·DEFCON·동맹·옵션 폴더가 당신 손에 있다.':'요격 결과가 들어오는 순간부터. 인증하고, 폴더를 열고, 참모들이 당신을 통해 싸우는 걸 듣고, 한 번 결정한다. 혹은 하지 않는다.';
  const h=$('handoff');h.hidden=false;h.innerHTML=`<div class="h4">${G.act}막에서 넘어오는 것</div>`+(next===2?`통보: ${ {now:'즉시',cos:'비서실장 경유',verify:'확인 후',late:'지연'}[f.notify]||'—'} · 1차 판단: ${ {dprk:'북한',ru:'러시아',unknown:'미상',none:'미보고'}[f.attrib]||'—'} · 요약 보고: ${ {good:'양호',thin:'빈약',bad:'미확인 포함',none:'미작성'}[f.brief]||'—'} · "핵인가?": ${ {honest:'미확인 답변',assume:'핵 가정',dunno:'모름',none:'무응답'}[f.press]||'—'} · 놓친 직통 ${f.ringMissed}통`
   :`요격 ${ {salvo:'일제',single:'1발',delegate:'위임'}[f.gmd]||'—'} · 이지스 ${f.aegis||'—'} · 경보 ${ {now:'발령',wait:'결과 후',hold:'보류',late:'미결','wait-on':'발령'}[f.evac]||'—'} · DEFCON ${f.defcon} · 핫라인 ${f.hotline||'—'} · 동맹 ${f.allies||'—'} · 핵 인증 준비 ${f.nuc||'—'} · 폴더 [${f.options.join(', ')||'표준'}] · 부보좌관 권고: ${ {limited:'제한 타격',hold:'보류',pass:'회피',silent:'무응답'}[f.presAns2]||'—'}`);
  $('introScn').innerHTML=`<b>${G.sc.code}</b> · 탄착까지 ${fmt(G.sc.total)} · 대통령 ${G.sc.pres.n} · 요격 자산 ${G.sc.assets.n}`;
  $('start').textContent=`${next}막 시작`;$('intro').hidden=false;
}
function finish(){
  const f=F(),t=T(),sc=G.sc,city=C(),hit=isHit(),sat=G.intercept==='sat';
  const evacd=f.evac==='now'||f.evac==='wait-on',target=f.target||(f.attrib==='ru'?'러시아':'북한');
  let title,body;const struck=['full','limited','conv'].includes(f.decision);
  if(sat){title='오경보';body=`러시아 정찰위성이었다. 조기경보가 탄도로 오인했고, 7분 동안 미국 정부 전체가 ${josa(city.n,'을','를')} 포기할지 고민했다.`+(struck?' 그리고 대통령은 위성에 대해 보복을 명령했다.':' 아무것도 발사되지 않았다. 다음 날 아무도 이 밤을 공개하지 않았다.')}
  else if(struck){const wrong=t.who!==target;title=wrong?'빗나간 보복':f.decision==='conv'?'재래식 대응':f.decision==='limited'?'제한 타격':'전면 보복';
    body=(hit?'미사일은 요격됐다. ':`${josa(city.n,'은','는')} 피격됐다. `)+`대통령은 ${target}에 ${ {full:'전면 핵',limited:'제한 핵',conv:'재래식'}[f.decision]} 타격을 명령했다. `+(wrong?`발사 주체는 ${josa(t.who,'이었다','였다')}. 보복은 상관없는 나라를 때렸고, 그 나라는 되받아쳤다.`:t.id==='ru-rogue'?'러시아였지만 크렘린은 몰랐다. 모스크바는 자국 부대의 반란보다 미국의 타격을 먼저 봤다.':`주체는 실제로 ${josa(t.who,'이었다','였다')}. 판단은 맞았다. 그래도 상대의 다음 발사를 아무도 몰랐고, 그 상태로 집행됐다.`)}
  else if(f.decision==='hold'){title=hit?'멈춘 손':'보류된 응답';body=(hit?'미사일은 요격됐고, ':`${josa(city.n,'은','는')} 피격됐고, `)+'대통령은 보류를 택했다. '+({'ru-acc':'사흘 뒤 러시아가 오발을 인정했다. 보류가 전면전을 막았다.','ru-rogue':'닷새 뒤 러시아가 해당 부대를 체포했다고 발표했다.',unknown:'한 달이 지나도 주체는 밝혀지지 않았다. 보복할 대상이 없었다는 걸 세상은 그때야 알았다.'}[t.id]||'일주일 뒤 북한 발사로 확정됐다. 보류는 정치적으로 공격받았지만 확증 위에서 결정할 시간을 남겼다.')}
  else{title=hit?'결정하지 않은 사람':'공백';body=(hit?'미사일은 요격됐다. ':`${josa(city.n,'은','는')} 피격됐다. `)+'대통령은 창이 닫힐 때까지 결정하지 않았다. 역사는 그것도 결정이라고 기록했다.'}
  if(!hit&&!sat)body+=evacd?' 경보 덕에 지하로 내려간 사람들이 있었다.':' 경보는 울리지 않았다. 도시는 평소처럼 움직이다 멈췄다.';
  if(sc.second&&sc.second.real)body+=` 2차 미사일은 ${josa(sc.second.city.n,'을','를')} ${G.secondHit?'겨냥했으나 요격됐다.':'타격했다.'+((f.evac2==='now'||f.evac2==='wait-on')?' 그쪽은 경보가 울렸다.':' 그쪽은 경보조차 없었다.')}`;
  if(WORLD.ru.alert>=3)body+=' 그 사이 러시아 전략군은 발사 준비 단계까지 올라가 있었다.';if(WORLD.dprk.alert>=3)body+=' 북한은 2차 발사대를 전개한 상태였다.';if(WORLD.esc===0)body+=' 상대국 태세는 끝까지 평시 근처에 머물렀다. 누군가는 그걸 운이라 했고 누군가는 핫라인 덕이라 했다.';
  if(f.auth==='fail')body+=' 인증 코드를 한 번 틀렸다.';if(f.brief==='bad')body+=' 1막의 당신이 쓴 보고서에 미확인 사항이 확인으로 적혀 있었다.';
  $('endTitle').textContent=title;$('endBody').textContent=body;$('endKicker').textContent=`${sc.code} · 3막 종료 · ${sat?'오경보':hit?'표적 소실':'탄착'}`;
  $('known').innerHTML=[`발사 1발, ${sc.site.sea}`,`탄착 추정 ${city.n}`,'러시아 부인, 중국 무응답',`요격 자산 ${sc.assets.n}`,'재진입체 1개, 탄두 미확인',`상황실 1차 판단: ${ {dprk:'북한',ru:'러시아',unknown:'미상',none:'미보고'}[f.attrib]||'—'}`].map(x=>`<li>${x}</li>`).join('');
  $('truth').innerHTML=[`발사 주체: ${t.who}`,`발사 지점: ${sc.site.n} (${sc.site.lat.toFixed(1)}N ${nl(sc.site.lon).toFixed(1)}E)`,t.label,t.warhead?'탄두: 핵탄두 탑재':'탄두: 핵 미탑재',sat?'요격 불필요':`요격 ${G.shots}발 교전, ${hit?'성공':'실패'}`,sc.second?`2차 항적: ${sc.second.real?'실제 ('+sc.second.city.n+') · 교전 '+(G.shots2||0)+'자산 · '+(G.secondHit?'요격':'실패'):'허위'}`:'2차 항적 없음'].map(x=>`<li>${x}</li>`).join('');
  $('tl').innerHTML=G.log.map(l=>`<div><b>${l.act}막 ${fmt(l.t)}</b>${l.text}</div>`).join('')||'<div>기록 없음</div>';
  const attribOk=(f.attrib==='dprk'&&t.id.startsWith('dprk'))||(f.attrib==='ru'&&t.id.startsWith('ru'));const V=(v,m)=>m[v]||'미결';
  const rows=[['1막 통보',V(f.notify,{now:'즉시',cos:'비서실장',verify:'확인 후',late:'지연'})],['1막 판단',f.attrib==='none'?'미보고':attribOk?'정답':f.attrib==='unknown'?'미상':'오판'],['1막 보고서',V(f.brief,{good:'양호',thin:'빈약',bad:'미확인 포함',none:'미작성'})],['1막 "핵인가"',V(f.press,{honest:'미확인',assume:'핵 가정',dunno:'모름',none:'무응답'})],['2막 요격',V(f.gmd,{salvo:'일제',single:'1발',delegate:'위임'})],['2막 경보',V(f.evac,{now:'즉시',wait:'결과 후','wait-on':'결과 후 발령',hold:'보류',late:'미결'})],['2막 DEFCON',''+f.defcon],['2막 핫라인',V(f.hotline,{send:'양국',ru:'러',none:'침묵'})],['2막 폴더',f.options.join('/')||'미결'],['2막 권고',V(f.presAns2,{limited:'제한',hold:'보류',pass:'회피',silent:'무응답'})],['3막 인증',V(f.auth,{ok:'성공',fail:'실패 후',none:'미완'})],['3막 결정',V(f.decision,{full:'전면',limited:'제한',conv:'재래식',hold:'보류',none:'없음'})],['놓친 직통',f.ringMissed+'통'],['마감 초과',f.penalty+'건']];
  $('score').innerHTML=rows.map(r=>{const bad=/미결|지연|오판|미보고|미작성|미확인 포함|빈약|무응답|실패|없음|회피/.test(r[1])||(r[0]==='놓친 직통'&&f.ringMissed>0)||(r[0]==='마감 초과'&&f.penalty>0);const good=r[1]==='정답'||r[1]==='양호'||r[1]==='성공';return`<span>${r[0]}</span><b class="${bad?'bad':good?'good':''}">${r[1]}</b>`}).join('');
  $('ending').hidden=false;
}
function showIntro(){G=freshGame();S=null;['a1','a2','a3'].forEach(id=>$(id).classList.remove('done'));$('handoff').hidden=true;$('introKicker').textContent='같은 18분, 세 개의 의자';$('introTitle').textContent='전화는 전부 당신한테 온다.';$('introBody').textContent='미사일 1발이 올라왔다. 같은 18분을 세 번 산다. 처음엔 백악관 상황실 당직 장교로, 다음엔 국가안보 부보좌관으로, 마지막엔 대통령으로. 앞에서 당신이 올린 보고가 뒤에서 당신 책상에 놓인다.';$('start').textContent='1막 시작';
  const sc=G.sc;$('introScn').innerHTML=`<b>${sc.code}</b> · ${sc.isSLBM?'단거리 비행(SLBM급)':'대륙간 비행'} · 탄착까지 ${fmt(sc.total)} · 대통령 ${sc.pres.n} · 요격 자산 ${sc.assets.n}`;$('scnTag').textContent=sc.code;drawMap()}
let chosen=3;
document.querySelectorAll('.speed button').forEach(b=>b.onclick=()=>{chosen=+b.dataset.speed;document.querySelectorAll('.speed button').forEach(x=>x.setAttribute('aria-pressed',x===b))});
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{filter=b.dataset.f;document.querySelectorAll('.filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('.msg').forEach(m=>m.classList.toggle('hide',filter!=='all'&&m.dataset.cls!==filter))});
$('start').onclick=()=>{try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}startAct(G.act+1,chosen)};
// ---------- pause ----------
// the act clock, card/ring deadlines and game timers all stop; the board is covered so a pause can't be used to read ahead
function setPause(on){if(!S||!S.running||S.paused===on)return;S.paused=on;$('pauseBox').hidden=!on;$('pause').setAttribute('aria-pressed',on);$('pause').textContent=on?'계속':'일시정지';
  try{if(AC)on?AC.suspend():AC.resume()}catch(e){}if(on)$('pauseGo').focus()}
$('pause').onclick=()=>setPause(!(S&&S.paused));$('pauseGo').onclick=()=>setPause(false);
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true)});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||!S||!S.running)return;const typing=e.target&&e.target.tagName==='INPUT';
  if(e.key==='Escape'||(!typing&&(e.key==='p'||e.key==='P'||e.key==='ㅔ'))){e.preventDefault();setPause(!S.paused);return}
  // 1–4 answer the phone that's ringing
  if(!typing&&!S.paused&&S.ring&&/^[1-9]$/.test(e.key)){const b=$('ringOpts').querySelectorAll('.opt')[+e.key-1];if(b){e.preventDefault();b.click()}}});
AI.init();
$('reroll').onclick=showIntro;
$('again').onclick=()=>{$('ending').hidden=true;showIntro();$('intro').hidden=false};
MOBILE.init();showIntro();
})();
