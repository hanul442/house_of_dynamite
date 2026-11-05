// ---------- INTEL: truth → sensors → agency interpretation → report ----------
// Each agency holds its own belief about launch point, impact point and attribution.
// Beliefs start noisy/biased and converge with time and with re-check calls; agencies disagree on purpose.
const INTEL={
  agencies:{},
  reset(){const t=T(),sc=G.sc;
    // attribution signal from the truth, as each agency would see it
    const sig={dprk:{dprk:.75,ru:.08,unknown:.17},'dprk-sub':{dprk:.55,ru:.15,unknown:.30},'ru-acc':{dprk:.15,ru:.60,unknown:.25},'ru-rogue':{dprk:.10,ru:.70,unknown:.20},unknown:{dprk:.30,ru:.25,unknown:.45},sat:{dprk:.10,ru:.55,unknown:.35}}[t.id];
    const mk=(name,bias,noise,cepL,cepI)=>({name,bias,noise,sig,cepL,cepI,checks:0,belief:null});
    this.agencies={
      DIA:mk('DIA',{dprk:.25,ru:-.05,unknown:-.2},.25,70,0),
      NSA:mk('NSA',{dprk:0,ru:0,unknown:0},.35,0,0),
      STRATCOM:mk('STRATCOM',{dprk:.05,ru:.10,unknown:-.15},.2,40,60),
      STATE:mk('국무부',{dprk:-.05,ru:-.25,unknown:.3},.3,0,0),
      NORAD:mk('NORAD',{dprk:0,ru:.05,unknown:-.05},.15,90,80),
    };
    for(const k in this.agencies)this.update(k,0);
  },
  // belief at mission fraction p: truth signal pulled toward bias, noise shrinking with time and checks
  update(k,p){const a=this.agencies[k];const conv=Math.min(1,p*1.3+a.checks*.25);const n=a.noise*(1-conv);const b={};let s=0;for(const key of ['dprk','ru','unknown']){b[key]=Math.max(.02,a.sig[key]*conv+(1/3)*(1-conv)+a.bias[key]*(1-conv)+ (Math.random()-.5)*n);s+=b[key]}for(const key in b)b[key]=b[key]/s;a.belief=b;return b},
  pct(k){const b=this.agencies[k].belief;return `북한 ${Math.round(b.dprk*100)} / 러시아 ${Math.round(b.ru*100)} / 미상·기타 ${Math.round(b.unknown*100)}`},
  consensus(){const keys=Object.keys(this.agencies);const sum={dprk:0,ru:0,unknown:0};keys.forEach(k=>{for(const x in sum)sum[x]+=this.agencies[k].belief[x]});const best=Object.entries(sum).sort((a,b)=>b[1]-a[1])[0];const spread=Math.max(...keys.map(k=>this.agencies[k].belief[best[0]]))-Math.min(...keys.map(k=>this.agencies[k].belief[best[0]]));return{best:best[0],pct:Math.round(best[1]/keys.length*100),spread:Math.round(spread*100)}},
  launchErr(p){const a=this.agencies.NORAD;return Math.max(3,Math.round(90*Math.pow(1-Math.min(1,p*1.8+a.checks*.3),1.4)+3))},
  report(k,p){const a=this.agencies[k];this.update(k,p);const b=a.belief;const lead=Object.entries(b).sort((x,y)=>y[1]-x[1])[0];const nm={dprk:'북한',ru:'러시아',unknown:'미상·비국가'}[lead[0]];const conf=lead[1]>.6?'HIGH':lead[1]>.42?'MED':'LOW';
    const why={DIA:{dprk:'이동식 발사대 감시 공백·사거리 부합',ru:'발사 해역 러 초계 구역 중첩',unknown:'플랫폼 미식별·영해 외'},NSA:{dprk:'전략군 지휘망 통신량 변동',ru:'태평양함대 긴급 통신',unknown:'전 대상 통신 평소 수준'},STRATCOM:{dprk:'부스트 프로파일 화성 계열 근접',ru:'프로파일 러 SLBM/ICBM 근접',unknown:'알려진 체계 불일치'},'국무부':{dprk:'북 채널 무응답',ru:'러 부인 통보 지연',unknown:'관련국 전원 부인'},NORAD:{dprk:'발사점 역산 북한 연안 인접',ru:'발사점 역산 러 해역',unknown:'발사점 역산 공해'}}[a.name][lead[0]];
    return{text:`${a.name} 평가 ${Math.round(lead[1]*100)}% ${nm}. 분포 ${this.pct(k)}. 근거: ${why}. CONF ${conf}.`,conf,lead:lead[0]}},
};

// ---------- WORLD: adversary posture reacting to what we do ----------
const WORLD={ru:{alert:1,trust:.5},cn:{alert:0},dprk:{alert:1},last:-99,esc:0,logged:new Set(),
  reset(){this.ru={alert:1,trust:.5};this.cn={alert:0};this.dprk={alert:1};this.last=-99;this.esc=0;this.logged.clear()},
  tick(){if(S.elapsed-this.last<30||S.phase==='post'&&S.elapsed-this.postStart>200)return;this.last=S.elapsed;const f=F(),t=T(),sc=G.sc;
    // inputs
    let ru=1,cn=0,dp=1;
    if(f.defcon===3){ru+=1;cn+=1;dp+=1}if(f.defcon===2){ru+=2;cn+=1;dp+=1}
    if(f.hotline==='send'||f.hotline==='ru'){ru-=1;this.ru.trust=Math.min(1,this.ru.trust+.2)}if(f.hotline==='send')cn-=1;
    if(f.allies==='all'){dp+=1;cn+=1}if(f.attrib==='ru'&&(f.leakAns==='confirm'||f.press==='assume'))ru+=1;if(f.attrib==='dprk')dp+=1;
    if(f.decap==='prep')dp+=2;if(f.nuc==='ready'&&f.defcon<=3)ru+=1;if(f.cityAct==='go'&&C().n==='시애틀')ru+=1;if(f.rok==='ok'||f.rok==='none')dp+=2;if(f.ruline==='yes'||f.rucall==='trust')ru-=1;
    if(f.decision&&f.decision!=='hold'){ru+=f.target==='러시아'?3:1;dp+=f.target==='북한'?3:1;cn+=1}
    const clamp=x=>Math.max(0,Math.min(4,x));const nru=clamp(ru),ncn=clamp(cn),ndp=clamp(dp);
    const say2=(key,text)=>{if(!this.logged.has(key)){this.logged.add(key);post('STRATCOM GOC','alert',text,'HIGH');this.esc++}};
    if(nru>=2&&this.ru.alert<2)say2('ru2','RU 전략로켓군 경계 격상 감지. 이동식 ICBM 분산 개시. 평가: 우리 태세 변경 반응.');
    if(nru>=3&&this.ru.alert<3)say2('ru3','RU 북방·태평양함대 SSBN 긴급 출항 2척. 사일로 개방 신호 3건.');
    if(nru>=4&&this.ru.alert<4)say2('ru4','RU 핵지휘통신망 활성화. 카즈베크 체계 가동 징후. 발사 준비 단계로 판단.');
    if(ndp>=3&&this.dprk.alert<3)say2('dp3','DPRK 전략군 2차 발사 준비 징후. 발사대 전개 2건. 창 20분.');
    if(ndp>=4&&this.dprk.alert<4)say2('dp4','DPRK 전군 최고 경계. 장사정포 갱도 진출. 서울 위협.');
    if(ncn>=2&&this.cn.alert<2)say2('cn2','PRC 로켓군 경계 격상. 동부전구 전투기 출격.');
    if(nru<this.ru.alert&&nru<=1)post('STRATCOM GOC','','RU 전략군 경계 완화 신호. 분산 부대 복귀 중.','MED');
    this.ru.alert=nru;this.cn.alert=ncn;this.dprk.alert=ndp;
    const lv=['평시','경계','격상','즉응','발사준비'];$('tWorld')&&($('tWorld').textContent=`RU ${lv[nru]} · DPRK ${lv[ndp]} · PRC ${lv[ncn]}`);
  },
};

// ---------- MOBILE: portrait tabs ----------
const MOBILE={tab:'feed',unread:{board:0,feed:0,dec:0},
  init(){const bar=$('tabs');if(!bar)return;bar.querySelectorAll('button').forEach(b=>b.onclick=()=>this.show(b.dataset.tab));this.show('feed')},
  show(t){this.tab=t;document.querySelector('.grid').dataset.tab=t;$('tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tab===t));this.unread[t]=0;this.badge()},
  bump(t){if(this.tab!==t)this.unread[t]++;this.badge()},
  badge(){const b=$('tabs');if(!b)return;b.querySelectorAll('button').forEach(x=>{const n=this.unread[x.dataset.tab];const s=x.querySelector('i');s.textContent=n>0?n:'';s.hidden=!n})},
};
