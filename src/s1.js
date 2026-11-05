(function(){
const $=id=>document.getElementById(id);
let S=null,G=null,timer=null,AC=null,soundOn=true,filter='all';
const R=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)], ch=p=>Math.random()<p;

// ---------- audio ----------
function beep(f,d,type,g){if(!soundOn)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),v=AC.createGain();o.type=type||'square';o.frequency.value=f;v.gain.value=g||.05;o.connect(v);v.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const SFX={tick:()=>beep(880,.03,'sine',.02),alert:()=>{beep(660,.08);setTimeout(()=>beep(520,.12),90)},ring:()=>{beep(1200,.12,'square',.06);setTimeout(()=>beep(1200,.12,'square',.06),180)},card:()=>beep(440,.06,'triangle',.05),bad:()=>beep(160,.35,'sawtooth',.06),good:()=>{beep(660,.08,'sine',.05);setTimeout(()=>beep(990,.14,'sine',.05),100)},klaxon:()=>{for(let i=0;i<3;i++)setTimeout(()=>beep(300,.25,'sawtooth',.05),i*350)}};
$('snd').onclick=()=>{soundOn=!soundOn;$('snd').textContent=soundOn?'소리 ON':'소리 OFF';$('snd').setAttribute('aria-pressed',soundOn)};

// ---------- scenario ----------
const CITIES={chi:{n:'시카고',lon:-87.6,lat:41.9,pop:950},la:{n:'로스앤젤레스',lon:-118.2,lat:34.0,pop:1300},sea:{n:'시애틀',lon:-122.3,lat:47.6,pop:400},dc:{n:'워싱턴 D.C.',lon:-77.0,lat:38.9,pop:620},nyc:{n:'뉴욕',lon:-74.0,lat:40.7,pop:1900},sf:{n:'샌프란시스코',lon:-122.4,lat:37.8,pop:470},den:{n:'덴버',lon:-105.0,lat:39.7,pop:290},hnl:{n:'호놀룰루',lon:-157.9,lat:21.3,pop:100}};
const SITES={dprk:[{n:'동해 북부 공해',lon:131.2,lat:40.4,sea:'동해'},{n:'북한 내륙(함경남도)',lon:127.6,lat:40.0,sea:'내륙'},{n:'동해 중부 공해',lon:134.0,lat:38.8,sea:'동해'}],
 'dprk-sub':[{n:'동해 공해',lon:132.5,lat:39.5,sea:'동해'},{n:'오호츠크해 남부',lon:148.0,lat:47.0,sea:'오호츠크해'}],
 'ru-acc':[{n:'오호츠크해',lon:152.0,lat:53.0,sea:'오호츠크해'},{n:'베링해 서부',lon:172.0,lat:58.0,sea:'베링해'},{n:'캄차카 근해',lon:160.5,lat:51.0,sea:'북태평양'}],
 'ru-rogue':[{n:'베링해 중부',lon:178.0,lat:60.0,sea:'베링해'},{n:'오호츠크해 북부',lon:150.0,lat:57.0,sea:'오호츠크해'}],
 unknown:[{n:'북태평양 공해',lon:165.0,lat:36.0,sea:'북태평양'},{n:'북태평양 공해',lon:175.0,lat:42.0,sea:'북태평양'},{n:'서태평양 공해',lon:150.0,lat:30.0,sea:'서태평양'}],
 sat:[{n:'보스토치니 우주기지',lon:128.3,lat:51.9,sea:'내륙'},{n:'플레세츠크 방면 궤적',lon:140.0,lat:60.0,sea:'내륙'}]};
const TRUTHS=[
 {id:'dprk',who:'북한',w:3,label:'북한 전략군 단독 발사. 이동식 발사대가 감시 공백 사이에 이동했다.',warhead:true},
 {id:'dprk-sub',who:'북한',w:2,label:'북한 신형 잠수함 SLBM. 지상 발사대만 감시하던 정보기관이 통째로 놓쳤다.',warhead:true},
 {id:'ru-acc',who:'러시아',w:2,label:'러시아 태평양함대 잠수함의 훈련 중 오발. 모스크바는 통보 시점에 사실을 몰랐다.',warhead:false},
 {id:'ru-rogue',who:'러시아',w:1,label:'러시아 전략로켓군 일부 부대의 명령 체계 밖 발사. 크렘린은 부인했고 실제로 몰랐다.',warhead:true},
 {id:'unknown',who:'미상',w:2,label:'사후 조사에서도 주체를 특정하지 못했다. 발사 지점은 공해, 어떤 플랫폼도 식별되지 않았다.',warhead:true},
 {id:'sat',who:'없음(오경보)',w:1,label:'러시아 정찰위성 발사. 궤적이 탄도 프로파일과 겹쳐 조기경보가 오인했다. 7분 뒤 궤도 진입.',warhead:false}];
function wpick(a){const t=a.reduce((s,x)=>s+x.w,0);let r=Math.random()*t;for(const x of a){r-=x.w;if(r<=0)return x}return a[a.length-1]}
function genScenario(){
  const truth=wpick(TRUTHS);const site=Object.assign({},pick(SITES[truth.id]));site.lon+=R(-2,2);site.lat+=R(-1.2,1.2);
  const isSLBM=truth.id==='dprk-sub'||truth.id==='ru-acc';
  const cityKeys=Object.keys(CITIES).filter(k=>!(k==='hnl'&&!isSLBM));const city=CITIES[pick(cityKeys)];
  const total=truth.id==='sat'?1080:isSLBM?Math.round(R(780,900)):Math.round(R(1020,1140));
  const assets=pick([{n:'GBI 2발',gbi:2,aegis:false},{n:'GBI 2발 + 이지스 1척',gbi:2,aegis:true},{n:'GBI 3발',gbi:3,aegis:false},{n:'GBI 1발 + 이지스 1척',gbi:1,aegis:true}]);
  const pres=pick([{k:'res',n:'관저',lag:0},{k:'af1',n:'에어포스원 (공중)',lag:1},{k:'abroad',n:'해외 순방 (브뤼셀)',lag:2},{k:'camp',n:'캠프 데이비드',lag:0},{k:'event',n:'공개 행사 (오하이오)',lag:1}]);
  const vp=pick(['워싱턴','상원 본회의장','출장(애틀랜타)']);
  const second=truth.id==='sat'?null:ch(.45)?{real:ch(.55),city:CITIES[pick(cityKeys.filter(k=>CITIES[k]!==city))],offset:Math.round(R(70,140)),reserve:ch(.6)}:null;
  const pool=['linkdrop','feeddrop','misreport','leak','ally','china','cyber','staff','congress','allyjet','ruhot','drill'];
  const events=[];while(events.length<4){const e=pick(pool);if(!events.includes(e))events.push(e)}
  const code='SCN-'+Math.random().toString(16).slice(2,6).toUpperCase();
  const rolls={r1:Math.random(),r2:Math.random(),aegis:Math.random(),second:Math.random(),flash:Math.random()};
  const bis=()=>pick(['ALPHA','BRAVO','ECHO','FOXTROT','KILO','TANGO','VICTOR','ZULU'])+'-'+Math.floor(R(1,9))+'-'+pick(['NOVEMBER','OSCAR','QUEBEC','ROMEO','SIERRA','WHISKEY']);
  const biscuit={real:bis(),fakes:[bis(),bis()]};
  return {truth,site,city,total,assets,pres,vp,second,events,code,isSLBM,rolls,biscuit};
}
function freshGame(){const sc=genScenario();return {sc,TOTAL:sc.total,act:0,speed:3,
  shared:{notify:null,conf:null,attrib:null,brief:null,briefItems:[],press:null,misrep:null,move:null,vp:null,acting:null,congress:null,rokshare:null,nonstate:null,space:null,calls:0,ringMissed:0,penalty:0,
    gmd:null,aegis:null,alloc:null,evac:null,defcon:4,hotline:null,allies:null,nuc:null,cog:null,speech:null,cityAct:null,asw:null,decap:null,jet:null,rok:null,cyber:null,drill:null,t2rep:null,leakAns:null,options:[],evac2:null,alloc2:null,presAns:null,presAns2:null,rucall:null,ruline:null,briefFix:null,over:null,announce:null,evacOff:null,
    auth:null,decision:null,target:null,retal:null},
  log:[],intercept:null,shots:0,aegisHit:null,secondHit:null,altHit:null,shots2:0,second:null}}
function freshAct(){return {elapsed:0,startSec:0,running:false,fired:new Set(),feed:[],cards:[],calls:{stratcom:0,dia:0,state:0,fema:0,norad:0},callCool:{},ring:null,ringQueue:[],principals:{},linkDead:false,feedDead:false,phase:'threat',postStart:0,lastTele:-99,t2:null,cep:null,shot2:undefined,kc:{},selOpt:null}}
const fmt=s=>{s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const left=()=>G.TOTAL-S.elapsed;
const F=()=>G.shared, T=()=>G.sc.truth, C=()=>G.sc.city;
const isHit=()=>G.intercept==='hit'||G.intercept==='hit2'||G.aegisHit===true;

// ---------- feed / conference ----------
function post(src,cls,text,conf){
  cls=cls||'';S.feed.push({t:left(),src,cls,text});
  const d=document.createElement('div');d.className='msg '+cls;d.dataset.cls=cls||'ops';if(filter!=='all'&&cls!==filter)d.classList.add('hide');
  const CF={'낮음':'LOW','중간':'MED','높음':'HIGH'};const cf=conf?(CF[conf]||conf):'';const addr=['','WHSR','NSC','POTUS'][G.act];const route=cls==='me'?`${src} ▸ ALL`:cls==='noise'||cls==='pres'?src:`${src} ▸ ${addr}`;
  d.innerHTML=`<div class="t">${S.phase==='post'?'T+'+fmt(S.elapsed-S.postStart):fmt(left())}</div><div><span class="src ${cls}">${route}</span>${cf?`<span class="conf">CONF ${cf}</span>`:''}<p>${text}</p></div>`;
  if(typeof MOBILE!=='undefined')MOBILE.bump('feed');
  const f=$('feed');f.appendChild(d);f.scrollTop=f.scrollHeight;$('feedCount').textContent=S.feed.length;
  if(cls==='alert'){SFX.alert();$('wrap').classList.remove('flash');void $('wrap').offsetWidth;$('wrap').classList.add('flash')}else if(cls==='pres')SFX.tick();
  $('ticker').textContent=S.feed.slice(-6).map(m=>`${m.src}: ${m.text}`).join('   ◆   ');
}
const ROLE=()=>['','당직 장교','부보좌관','대통령'][G.act];
function me(text){post(ROLE(),'me',text);G.log.push({act:G.act,t:left(),text})}
function say(who,text,hot){if(typeof MOBILE!=='undefined')MOBILE.bump('conf');if(S.linkDead){post(who,'noise','[회의선 끊김 — 음성 유실]');return}S.principals[who]=text;post(who,'pres',text);renderConf(hot?who:null)}
function renderConf(hot){const c=$('conf');const names=Object.keys(S.principals);c.classList.toggle('dead',S.linkDead);if(!names.length){c.innerHTML='<div class="empty">회의선이 열리지 않았습니다.</div>';return}c.innerHTML=names.map(n=>`<div class="who ${n===hot?'hot':''}"><b>${n}</b><span>${S.principals[n]}</span></div>`).join('')}

// ---------- cards ----------
function card(id,title,ask,opts,dl,onExpire,task){if(S.cards.some(c=>c.id===id))return null;const c={id,title,ask,opts,deadline:S.elapsed+dl,born:S.elapsed,onExpire,done:false,task};S.cards.push(c);SFX.card();renderCards();if(typeof MOBILE!=='undefined')MOBILE.bump('dec');return c}
function resolve(id,k){const c=S.cards.find(x=>x.id===id);if(!c||c.done)return;c.done=true;c.opts.find(o=>o.k===k).go();renderCards()}
function renderCards(){
  const host=$('decisions');host.innerHTML='';const open=S.cards.filter(c=>!c.done).sort((a,b)=>a.deadline-b.deadline);$('decCount').textContent=open.length;
  if(!open.length){host.innerHTML='<div class="empty">대기 중인 결정이 없습니다. 보고를 읽으세요.</div>';return}
  for(const c of open){const el=document.createElement('div');el.className='card'+(c.task?' task':'');el.dataset.id=c.id;
    el.innerHTML=`<h3><span>${c.task?'작업 · ':''}${c.title}</span><small>${fmt(c.deadline-S.elapsed)}</small></h3><p class="ask">${c.ask}</p><div class="bar"><i></i></div>`;
    if(c.task==='brief'){const box=document.createElement('div');box.className='chk';for(const it of (c.items||[])){const l=document.createElement('label');l.innerHTML=`<input type="checkbox" value="${it.k}"> ${it.t}`;box.appendChild(l)}el.appendChild(box)}
    const o=document.createElement('div');o.className='opts';for(const op of c.opts){const b=document.createElement('button');b.type='button';b.className='opt';b.innerHTML=`${op.t}${op.s?`<small>${op.s}</small>`:''}`;b.onclick=()=>{if(c.task==='brief'){c.picked=[...el.querySelectorAll('input:checked')].map(i=>i.value)}resolve(c.id,op.k)};o.appendChild(b)}el.appendChild(o);host.appendChild(el)}
}
function tickCards(){for(const c of S.cards){if(c.done)continue;const el=document.querySelector(`.card[data-id="${c.id}"]`);const total=c.deadline-c.born,rem=c.deadline-S.elapsed;if(el){el.querySelector('.bar i').style.width=Math.max(0,rem/total*100)+'%';el.classList.toggle('late',rem<total*.35);el.querySelector('h3 small').textContent=fmt(rem)}if(rem<=0){c.done=true;SFX.bad();F().penalty++;c.onExpire();renderCards()}}}

// ---------- rings ----------
function ring(who,q,opts,onMiss){if(S.ring){S.ringQueue.push([who,q,opts,onMiss]);return}
  const lag=G.sc.pres.lag;S.ring={who,q,opts,onMiss,deadline:S.elapsed+(12-lag*2)*Math.max(1,G.speed/1.5),born:S.elapsed};SFX.ring();
  $('ringWho').textContent=who;$('ringQ').textContent=q;const o=$('ringOpts');o.innerHTML='';for(const op of opts){const b=document.createElement('button');b.type='button';b.className='opt';b.innerHTML=op.t;b.onclick=()=>{op.go();closeRing()};o.appendChild(b)}$('ring').hidden=false}
function closeRing(){S.ring=null;$('ring').hidden=true;if(S.ringQueue.length){const n=S.ringQueue.shift();setTimeout(()=>{if(S.running)ring(...n)},700)}}
function tickRing(){if(!S.ring)return;const r=S.ring,rem=r.deadline-S.elapsed,tot=r.deadline-r.born;$('ringT').textContent=fmt(rem);$('ringBar').style.width=Math.max(0,rem/tot*100)+'%';if(rem<=0){F().ringMissed++;SFX.bad();r.onMiss();closeRing()}}

// ---------- calls ----------
document.querySelectorAll('.calls button[data-c]').forEach(b=>b.onclick=()=>callChannel(b.dataset.c));
$('fixLink').onclick=()=>{S.linkDead=false;$('fixLink').hidden=true;me('회의선 재연결 완료. 백업 회선 전환.');renderConf()};
$('fixFeed').onclick=()=>{S.feedDead=false;$('fixFeed').hidden=true;$('tData').textContent='LIVE';$('tData').className='';me('NORAD 피드 재동기화. 백업 링크 전환.')};
function callChannel(k){
  if(!S||!S.running||S.callCool[k]>0)return;S.callCool[k]=70;S.calls[k]++;F().calls++;const n=S.calls[k],t=T(),f=F(),sc=G.sc;
  const names={stratcom:'STRATCOM GOC',dia:'DIA 당직',state:'국무부 작전센터',fema:'FEMA 국가감시센터',norad:'NORAD 지휘센터'};
  me(names[k]+' 호출. 확인/추정 구분 재보고 요구.');post(names[k],'noise','연결 대기... 담당자 호출 중.');
  setTimeout(()=>{if(!S.running)return;const siteN=sc.site.n,sea=sc.site.sea;
    const L={
      stratcom:[`TRK 0417 재산출: 탄착 중심 ${C().n} 도심 ${Math.round(R(4,18))}km. 오차 반경 축소.`,`요격 자산 재확인: ${sc.assets.n}. 전부 정상.${sc.assets.gbi<2?' 밴덴버그 예비 사거리 밖.':''}`,'재진입체 단면적: 1개. 기만체 전개 징후 없음.'],
      dia:{dprk:[`발사 지점 ${siteN}. 북한 영해 경계 ${Math.round(R(5,30))}km.`,'발사 20분 전 북한 전략군 지휘망 통신 급증. 분석 지연으로 1차 보고 누락.','비행 프로파일 화성-18 계열 83% 일치.'],
        'dprk-sub':[`발사 지점 ${siteN}. 지상 발사대 활동과 무관.`,'북한 신포 조선소 신형 잠수함 9일 전 출항. 추적 실패.','프로파일 북극성 계열 SLBM 유사.'],
        'ru-acc':[`${siteN}. 러시아 잠수함 상시 초계 해역과 중첩.`,'러 태평양함대 발사 직후 긴급 통신 3건. 어조 당황.','프로파일 불라바 계열 유사.'],
        'ru-rogue':[`${siteN}. 러시아 전략로켓군 훈련 해역 인근.`,'러시아 지휘망에 비정상 통신. 모스크바와 현장 부대가 서로 다른 말을 하는 듯.','프로파일 러시아 ICBM 계열 일치.'],
        unknown:[`${siteN}. 어느 국가 영해와도 200km 이상.`,'감시 대상 전 국가 통신량 평소 수준. 설명되는 게 없다.','알려진 어떤 체계와도 불일치. 신형이거나 개조.'],
        sat:[`${siteN}. 러시아 우주기지 인근.`,'러시아 우주군 통신 평소 수준. 발사 NOTAM 미발행.','비행 프로파일이 탄도와 궤도 진입 사이. 추가 관측 필요.']}[t.id],
      state:[t.id.startsWith('ru')?'러시아 대사관 2차 통보: "우리 아님" 반복. 국방부 측 연결 거부.':'러시아 외무부 "우리 아님" 재확인. 중국 외교부 무응답.','주한·주일 대사관: 한국 합참, 일본 통합막료감부 자체 탐지. 통보 요구.','러시아 대사: "귀측 경계태세 변경 시 우리도 대응할 수밖에 없다."'],
      fema:[`${C().n} 광역권 인구 ${C().pop}만. 경보 시 지하·실내 대피 가능 추정 ${Math.round(R(30,45))}%.`,'주 비상관리청 대기. 경보 문안 준비됨. 발령 권한 대통령.',f.evac==='now'?'경보 발령 후 고속도로 전면 정체. 대피 사고 보고 중.':`경보 미발령. ${C().n} 평소와 같음. 언론 문의 폭주.`],
      norad:[`발사 해역 ${sea}. 적외선 특성 ${sc.isSLBM?'해상 발사형':'대형 지상 발사형'}.`,t.id==='sat'?'궤적 재분석: 탄도보다 완만. 궤도 진입 가능성 배제 불가.':'궤적 재분석: 전형적 탄도. 궤도 진입 가능성 없음.',sc.second?`2차 항적 재분석: ${sc.second.real?'독립 항적 확인. 실제 발사.':'1차 부스터 분리체 반사. 허위 항적.'}`:'추가 항적 없음.']}[k];
    post(names[k],k==='dia'||k==='norad'?'intel':'',L[Math.min(n-1,2)],n>=2?'높음':'중간');
    const ag={dia:'DIA',norad:'NORAD',stratcom:'STRATCOM',state:'STATE'}[k];if(ag){INTEL.agencies[ag].checks++;const r=INTEL.report(ag,S.elapsed/G.TOTAL);post(INTEL.agencies[ag].name+' 재평가','intel',r.text,r.conf);const c=INTEL.consensus();$('tAttrib').textContent=`${ {dprk:'북한',ru:'러시아',unknown:'미상'}[c.best]} ${c.pct}% (기관 편차 ${c.spread})`}
    if(k==='dia'&&n===1)$('tLaunch').textContent=siteN;
  },4000/G.speed);updCalls();
}
function updCalls(){document.querySelectorAll('.calls button[data-c]').forEach(b=>{const c=S.callCool[b.dataset.c]||0;b.disabled=c>0;const base={stratcom:'STRATCOM',dia:'DIA/NSA',state:'국무부',fema:'FEMA',norad:'NORAD'}[b.dataset.c];b.textContent=c>0?`${base} ${fmt(c)}`:`${base} 연결`})}

// ---------- scheduling ----------
// events before the act's start window are history: marked fired silently
function at(f,fn){const sec=f<=1?f*G.TOTAL:f;const key=f+'';if(S.fired.has(key))return;if(sec<S.startSec-0.5){S.fired.add(key);return}if(S.elapsed>=sec){S.fired.add(key);fn()}}
function pat(rel,fn){const key='post'+rel;if(S.phase==='post'&&S.elapsed-S.postStart>=rel&&!S.fired.has(key)){S.fired.add(key);fn()}}
function enterPost(src){
  if(S.phase==='post')return;S.phase='post';S.postStart=S.elapsed;
  $('banner').classList.add('on');$('banner').style.background='var(--green)';$('banner').textContent='TARGET DESTROYED · '+src+' · POST-ENGAGEMENT WATCH';
  $('tPhase').textContent='소실';$('tAlt').textContent='—';$('tVel').textContent='—';$('tWin').textContent='종료';
  for(const c of S.cards){if(!c.done&&c.dropOnKill){c.done=true;post('WHSR','noise',`"${c.title}" 요구 철회 — 표적 소실.`)}}
  renderCards();
}
// engagement resolution shared by every act (pre-rolled dice keep the acts consistent)
function resolveGBI(){
  const f=F(),sc=G.sc,g=f.gmd||'salvo',ng=sc.assets.gbi;let p,shots;
  if(g==='salvo'){shots=ng;p=ng===3?.84:.75}else if(g==='delegate'){const s=ng>=2&&sc.rolls.second<.5;p=s?.75:.61;shots=s?2:1}else{p=.61;shots=1}
  if(f.alloc==='b'){G.shots=0;G.intercept='miss';return{shots:0,msg:`0417 교전 없음 — GBI 전량 TRK 0418(${sc.second.city.n})에 배정.`}}
  if(f.alloc==='split'){shots=1;p=.61}
  G.shots=shots;G.intercept=sc.rolls.r1<p?'hit':'miss';return{shots,msg:`GBI ${shots}발 발사. BOOST 정상. 요격 판정 T+30초. 끝.`}
}
// second track: its own engagement, resolved with whatever was left for it
function resolveSecond(){
  const f=F(),sc=G.sc;if(!sc.second||!sc.second.real)return null;
  const ng=sc.assets.gbi;let n=0;const parts=[];
  if(f.alloc==='b'){n+=ng;parts.push(`GBI ${ng}발`)}else if(f.alloc==='split'){n+=Math.max(0,ng-1);if(ng-1>0)parts.push(`GBI ${ng-1}발`)}
  if(f.alloc2==='reserve'||f.alloc2==='both'){if(sc.second.reserve){n+=1;parts.push('밴덴버그 예비 GBI 1발')}}
  let p=1-Math.pow(.39,n);let aeg=false;
  if((f.alloc2==='aegis'||f.alloc2==='both')&&sc.assets.aegis&&f.aegis!=='go'){aeg=true;parts.push('이지스 SM-3');p=1-(1-p)*.5}
  G.shots2=n+(aeg?1:0);const ok=n+(aeg?1:0)>0&&sc.rolls.second<p;G.secondHit=ok;return{n:G.shots2,parts,ok,p}
}
function resolveSecondShot(){const f=F(),sc=G.sc;if(G.intercept==='miss'&&G.shots===1&&sc.assets.gbi>=2&&f.gmd!=='delegate'&&f.alloc!=='split'&&S.shot2!==false){G.shots=2;G.intercept=sc.rolls.r2<.45?'hit2':'miss';return true}return false}
function markKill(src){SFX.good();$('pGmd').textContent='요격 성공';$('pGmd').className='pill green';$('pTrack').textContent='TRK 0417 · 소실';$('pTrack').className='pill green';enterPost(src)}

// ---------- reports every act hears ----------
function commonReports(){
  const t=T(),f=F(),sc=G.sc,city=C(),hit=isHit;
  at(0,()=>{post('NORAD 미사일경보센터','alert',`FLASH. OPREP-3 PINNACLE NUCFLASH. SBIRS 적외선 탐지. 탄도 발사 1건, 해역 ${sc.site.sea}. 항적 TRK 0417 할당. 발사점 미확정, 오차 ±90km. 재보고 60초. 끝.`,'낮음');$('banner').classList.add('on');$('tPhase').textContent='부스트';$('tSens').textContent='SBIRS'});
  at(.014,()=>post('STRATCOM GOC','',`IMMEDIATE. TRK 0417 1차 궤적 해. 사거리 ${sc.isSLBM?'IRBM 이상':'ICBM급'}. 방위 CONUS. 탄착점 산출 ${Math.round(G.TOTAL*.1)}초 후. 끝.`,'낮음'));
  at(.028,()=>post('우주군 SBIRS','intel',`부스트 IR 특성: ${sc.isSLBM?'고체 소형 2단, 해상 발사형 추정':'대형 1단, 액체/고체 미판별'}. 2단 점화 확인. 끝.`,'중간'));
  at(.055,()=>{post('코브라 데인 레이더','intel','COBRA DANE 획득. 항적 품질 양호. 궤적 정밀화 개시. 끝.','중간');$('tSens').textContent='SBIRS+UEWR'});
  at(.08,()=>post('DIA 당직','intel',t.id.startsWith('dprk')?'북한 동해안 이동식 발사대: 최근 36시간 감시 공백.':'북한 동해안 이동식 발사대: 최근 48시간 활동 없음.','중간'));
  at(.11,()=>{post('STRATCOM GOC','alert',`FLASH. TRK 0417 예상 탄착점: ${city.n} 광역권. CEP ±60km. TTI ${fmt(left())}. 이상 없으면 재보고 없음. 끝.`,'중간');$('tImp').textContent=city.n;$('pTrack').textContent='TRK 0417 · 1발';$('pTrack').className='pill red'});
  at(.125,()=>post('국무부 작전센터','',t.id.startsWith('ru')?'러시아 외무부 핫라인: "우리 발사 아님." 통보 평소보다 4분 지연. 중국 무응답.':'러시아 외무부 핫라인: "우리 발사 아님." 중국 무응답.','낮음'));
  at(.165,()=>{post('STRATCOM GOC','intel','TRK 0417 연소 종료. 중간 단계. RV 1개 분리 확인. 기만체 분석 중. 끝.','중간');$('tRv').textContent='1개 분리'});
  [[.09,'NORAD'],[.2,'DIA'],[.3,'STRATCOM'],[.42,'STATE'],[.55,'NSA'],[.7,'DIA']].forEach(([p,k])=>at(p+.001,()=>{const r=INTEL.report(k,p);post(INTEL.agencies[k].name+' 평가','intel',r.text,r.conf);const c=INTEL.consensus();$('tAttrib').textContent=`${ {dprk:'북한',ru:'러시아',unknown:'미상'}[c.best]} ${c.pct}% (기관 편차 ${c.spread})`;if(k==='NORAD')$('tLaunch').textContent=`${sc.site.sea} ±${INTEL.launchErr(p)}km`}));
  at(.24,()=>post('NSA','intel',{dprk:'북한 전략군 지휘망 발사 직전 급증 패턴. 분석 완료 지연.','dprk-sub':'북한 해군 신포 기지 통신 패턴 이상. 지상군 조용.','ru-acc':'러 태평양함대 잠수함 1척 긴급 통신 3건. 해독 중.','ru-rogue':'러시아 지휘망 비정상. 총참모부가 현장 부대를 호출 중. 응답 없음.',unknown:'감시 대상 전 국가 통신량 평소 수준. 설명되는 게 없다.',sat:'러시아 우주군 통신 평소 수준. 발사 통보 없음.'}[t.id],'중간'));
  if(sc.second){
    at(.22,()=>{post('NORAD 미사일경보센터','alert',`2차 항적 탐지. TRK 0418. 동일 해역. 실제 발사 여부 분석 중.`,'낮음');$('pTrack').textContent='TRK 0417/0418 · 2발?';S.t2=true});
    at(.33,()=>{post('NORAD 지휘센터','intel',sc.second.real?`TRK 0418 실제 발사 확정. 탄착 추정 ${sc.second.city.n}.`:'TRK 0418 허위 항적 판정. 1차 부스터 분리체 반사. 삭제.','높음');if(!sc.second.real){$('pTrack').textContent='TRK 0417 · 1발';S.t2=false}else{$('pTrack').textContent='TRK 0417/0418 · 2발';S.t2=true}});
  }
  at(.39,()=>post('STRATCOM GOC','intel','TRK 0417 RV 레이더 단면적 1개. 기만체 무. 질량 추정 탄두급. 끝.','중간'));
  if(t.id==='sat'){
    at(.38,()=>post('NORAD 지휘센터','alert','궤적 재분석: 탄도 프로파일 이탈. 궤도 진입 가능성 60%. 러시아 정찰위성 발사일 수 있음.','중간'));
    at(.47,()=>{post('NORAD 지휘센터','alert','궤도 진입 확인. 근지점 410km. 러시아 정찰위성. 탄도 위협 종료.','높음');G.intercept='sat';$('pTrack').textContent='TRK 0417 · 궤도 진입';$('pTrack').className='pill green';$('banner').textContent='FALSE ALARM · ORBITAL INSERTION';if(G.act<3)setTimeout(()=>{if(S.running)endAct()},5000/G.speed)});
  }
  at(.40,()=>{if(f.aegis==='go'&&!hit()&&t.id!=='sat'){G.aegisHit=sc.rolls.aegis<.5;post('7함대','alert',G.aegisHit?'SM-3 요격 성공. TRK 0417 소실. GBI 교전 불요.':'SM-3 요격 실패. 표적 계속. GBI 교전 진행.','높음');if(G.aegisHit){G.intercept='hit';markKill('AEGIS SM-3');$('pGmd').textContent='이지스 성공'}}});
  at(.44,()=>{if(hit()||t.id==='sat')return;const r=resolveGBI();$('pGmd').textContent='GMD 교전';$('pGmd').className='pill on';post('GMD 포트 그릴리','alert',r.msg);gmdStep('launch')});
  at(.47,()=>{if(t.id==='sat'||G.aegisHit)return;if(G.intercept==='hit'){post('GMD 포트 그릴리','alert','KILL. TRK 0417 소실 확인. 잔해 낙하 구역 캐나다 북부. 끝.','높음');gmdStep('kill');markKill('GMD')}
    else if(G.shots>0){post('GMD 포트 그릴리','alert',(G.shots>=2?`${G.shots}발 모두 `:'')+'요격 실패. 표적 계속 비행.','높음');gmdStep('miss');$('pGmd').textContent='요격 실패';$('pGmd').className='pill red';say('국방장관','"실패? 뭐가 실패야. 다시 쏴."',true)}});
  at(.52,()=>{if(t.id==='sat')return;
    if(resolveSecondShot()){const h=G.intercept==='hit2';post('GMD 포트 그릴리','alert',h?'KILL. GBI-2 요격 성공. 창 종료 직전 표적 소실. 끝.':'MISS. GBI-2 요격 실패. 교전 창 종료. 잔여 자산 무. 끝.','높음');if(h){gmdStep('kill');markKill('GMD')}else gmdStep('miss2')}
    else if(G.intercept==='miss')post('GMD 포트 그릴리','alert','TRK 0417 교전 창 종료. 잔여 자산 무. 끝.','높음');
    if(G.intercept==='miss'&&f.evac==='wait'){f.evac='wait-on';post('FEMA 국가감시센터','alert',`대통령 지시 경보 발령. ${city.n} 대피 가능 약 6분.`)}
  });
  if(sc.second){
    at(.355,()=>{if(sc.second.real)post('STRATCOM GOC','alert',`TRK 0418 교전 창: ${fmt(G.TOTAL*.60+sc.second.offset)}~${fmt(G.TOTAL*.52+sc.second.offset)}. 가용 자산: ${sc.second.reserve?'밴덴버그 예비 GBI 1발 사거리 내. ':'밴덴버그 예비 사거리 밖. '}${sc.assets.aegis?'이지스 SM-3 2차 교전 가능.':''} TTI ${fmt(left()+sc.second.offset)}.`,'중간')});
    at(.60,()=>{if(!sc.second.real)return;const r=resolveSecond();post('GMD 포트 그릴리','alert',r.n?`TRK 0418 교전: ${r.parts.join(' + ')}. 판정 약 20초 후.`:`TRK 0418: 배정 자산 없음. 교전 불가.`,'높음')});
    at(.62,()=>{if(!sc.second.real)return;const ok=G.secondHit;post('GMD 포트 그릴리','alert',`TRK 0418(${sc.second.city.n}): ${ok?'요격 성공. 표적 소실.':G.shots2?'요격 실패. 표적 계속 비행.':'요격 미시도.'}`,'높음');if(ok){SFX.good();S.t2=false;$('pTrack').textContent=isHit()?'TRK 0417/0418 · 소실':'TRK 0417 · 1발 / 0418 소실'}else if(f.evac2==='wait'){f.evac2='wait-on';post('FEMA 국가감시센터','alert',`${sc.second.city.n} 경보 발령. 대피 가능 ${fmt(left()+sc.second.offset-60)}.`)}});
    at(.995,()=>{if(sc.second.real&&!G.secondHit)post('NORAD 미사일경보센터','alert',`TRK 0418 ${sc.second.city.n} 탄착 ${fmt(sc.second.offset)} 후.`)});
  }
  at(.54,()=>{if(f.defcon===2)post('STRATCOM GOC','alert','러시아 전략로켓군 경계태세 격상 감지. 우리 DEFCON 반응으로 판단.','높음')});
  at(.74,()=>post('STRATCOM GOC','',hit()?'잔해 분석 중. 재진입체 1개. 탄두 미확인.':'재진입체 1개 확인. 탄두 미확인. 핵 추정, 확증 없음.','중간'));
  at(.80,()=>{if(!hit())post(`${city.n} 경찰국`,'alert',f.evac==='now'||f.evac==='wait-on'?'대피 혼잡 사고 다발. 지하철역 수용 한계.':'시내 평소 통행량. 시민 대부분 상황 인지 못 함.')});
  at(.87,()=>{if(!hit())post('FEMA 국가감시센터','alert',`병원 비상 발령. 전력망 분리 준비. ${city.n} 통신망 과부하.`)});
  at(.905,()=>{if(!hit())say('국방장관','"...이제 할 수 있는 거 없나."',true)});
  at(.925,()=>{if(!hit())post('NORAD 미사일경보센터','alert','TRK 0417 재진입. 고도 100km. 탄착 T-90초. 끝.','높음')});
  at(.945,()=>{if(!hit())post('NORAD 미사일경보센터','alert','TRK 0417 탄착 T-60초.')});
  at(.985,()=>{if(!hit()){post('NORAD 미사일경보센터','alert','TRK 0417 탄착 T-15초. 전 채널 침묵.');S.linkDead=true;renderConf()}});
  at(.999,()=>{if(!hit()){post('C2BMC','alert','TRK 0417 — 신호 소실.');$('wrap').style.transition='filter 1.2s';$('wrap').style.filter='brightness(6) saturate(0)';setTimeout(()=>{$('wrap').style.filter='brightness(0.15)'},900);setTimeout(()=>{$('wrap').style.filter='';$('wrap').style.transition=''},4000)}});
  at(1,()=>{const twoLive=sc.second&&sc.second.real&&!G.secondHit;if(twoLive){post('C2BMC','alert',`TRK 0418 계속 비행. ${sc.second.city.n} 탄착 ${fmt(sc.second.offset)} 후.`);setTimeout(()=>{if(S.running){post('C2BMC','alert','TRK 0418 — 신호 소실.');setTimeout(endAct,2500)}},sc.second.offset*1000/G.speed)}else if(!hit())setTimeout(endAct,3500);else endAct()});
  pat(0,()=>post('STRATCOM GOC','alert',`표적 소실 확인. 요격 고도 ${Math.round(R(380,620))}km. 잔해 낙하 예상 구역 산출 중. 2차 발사 감시 강화.`,'높음'));
  pat(15,()=>post('NORAD 미사일경보센터','',`발사 해역(${sc.site.sea}) 적외선 감시 강화. 추가 발사 징후 현재 없음.`,'중간'));
  pat(70,()=>post('NORAD 지휘센터','intel',`잔해 낙하: ${pick(['캐나다 유콘 북부 무인지대','알래스카 북극해 해상','베링해 공해'])}. 민간 피해 없음.`,'높음'));
  pat(100,()=>{if(sc.rolls.flash<.3){post('NORAD 미사일경보센터','alert','동일 해역 적외선 섬광 탐지! 2차 발사 가능성. 분석 중.');setTimeout(()=>{if(S.running)post('NORAD 미사일경보센터','intel','섬광 판정: 잔해 재진입 연소. 발사 아님.','높음')},25000/G.speed)}else post('NORAD 미사일경보센터','','감시 5분 경과. 추가 발사 징후 없음.','높음')});
  pat(140,()=>endAct());
  const times=[.17,.32,.46,.63];sc.events.forEach((e,i)=>at(times[i],()=>{if(!(hit()&&['feeddrop','linkdrop','cyber','drill'].includes(e)))runEvent(e)}));
}
