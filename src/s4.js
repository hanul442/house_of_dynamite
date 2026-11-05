// ---------- AI conference line (principals argue, and answer the player) ----------
const AI={sample:null,ready:false,busy:false,cool:0,lastAuto:0,stances:{},fails:0,
  P:{
    '국방장관':'강경파. 참을성 없음. "주체 모르면 요격 말고 할 게 없다", "지금 안 하면 다음엔 열 발이다". 북한 가정. 부보좌관·당직을 무시하다가 필요하면 몰아붙임.',
    '합참의장':'절차와 창(window)에 집착. 요격 창·실행 창·옵션 준비 시간을 숫자로 말함. 결단을 재촉. 감정 절제.',
    'STRATCOM 사령관':'숫자만 말함. 확률, 자산, 교전 창, 레이더 상태. 짧고 건조. 정치는 모른다고 함.',
    '국가안보보좌관':'신중파. 확증 없이는 안 된다. 오판 시 되돌릴 수 없다는 말을 반복. 국방장관과 정면 충돌.',
    '국무장관':'외교. 러시아·중국 통화, 동맹 통보, 핫라인. 보복은 외교의 끝이라 함.',
    '군사보좌관':'대통령 곁. 대통령 질문을 전달하고 답을 재촉. "대통령께서 기다리신다". 짧게.',
    '비서실장':'정치와 언론. 의회, CNN, 책임 소재. "역사가 어떻게 기록하나".',
    '부통령':'역사와 승계. 가끔만 말함. 무겁게.'
  },
  roster(){return G.act===1?['국방장관','합참의장','STRATCOM 사령관','국가안보보좌관','군사보좌관']:G.act===2?['국방장관','합참의장','STRATCOM 사령관','국가안보보좌관','국무장관','비서실장']:['국방장관','합참의장','국가안보보좌관','국무장관','군사보좌관','부통령']},
  async init(){try{if(!window.claude||!window.claude.use)return;this.sample=await window.claude.use('sample');this.ready=!!this.sample}catch(e){this.ready=false}this.tag()},
  tag(){const t=$('aiTag');if(!t)return;t.textContent=this.ready?'AI 참모 ON':'AI 참모 없음 (대본)';t.classList.toggle('off',!this.ready);$('sayBtn').disabled=!this.ready;$('sayIn').placeholder=this.ready?'회의선에 끼어든다… (Enter)':'AI 참모 연결 불가 — 대본 모드'},
  facts(){const f=F(),sc=G.sc,c=C();const known=[`역할: 플레이어는 ${['','백악관 상황실 당직 장교(대위)','국가안보 부보좌관','대통령'][G.act]}`,`탄도미사일 1발 ${sc.site.sea}에서 발사, 탄착 추정 ${c.n}, TTI ${S.phase==='post'?'표적 소실 후 T+'+fmt(S.elapsed-S.postStart):fmt(left())}`,`요격 자산 ${sc.assets.n}, 단발 61%`,`발사 주체 1차 판단: ${ {dprk:'북한 추정',ru:'러시아 가능성',unknown:'미상'}[f.attrib]||'미보고'} (확증 없음)`,`러시아 "우리 아님" 통보, 중국 무응답`,`DEFCON ${f.defcon}, 경보 ${ {now:'발령',wait:'결과 후','wait-on':'발령',hold:'보류'}[f.evac]||'미결'}, 요격 ${G.intercept==='hit'||G.intercept==='hit2'||G.aegisHit?'성공':G.intercept==='miss'?'실패':'아직'}`];
    if(sc.second&&S.t2)known.push(`2차 항적 TRK 0418 ${sc.second.real?'실제 발사 확정, 표적 '+sc.second.city.n:'분석 중'}`);if(f.options.length)known.push(`옵션 폴더: ${f.options.join('/')}`);if(f.decision)known.push(`대통령 결정: ${f.decision}`);
    return known.join('\n')},
  async speak(playerLine){
    if(!this.ready||this.busy||this.cool>0||!S.running||S.linkDead)return;this.busy=true;
    const roster=this.roster();const recent=S.feed.slice(-14).map(m=>`[${m.src}] ${m.text}`).join('\n');const conf=Object.entries(S.principals).map(([k,v])=>`${k}: ${v}`).join('\n');
    const prompt=`당신은 미국 핵 위기 시뮬레이션의 참모들을 연기한다. 영화 '하우스 오브 다이너마이트'의 상황실 톤: 짧고, 서로 말을 끊고, 숫자와 책임이 오간다. 절대 설명하지 말고 대사만.
참모 성격:
${roster.map(n=>`- ${n}: ${this.P[n]}`).join('\n')}
현재 알려진 사실 (참모들도 이것만 안다. 발사 주체의 진실은 아무도 모른다):
${this.facts()}
최근 보고:
${recent}
회의선 최근 발언:
${conf||'(없음)'}
${playerLine?`플레이어(${['','당직 장교','부보좌관','대통령'][G.act]})가 방금 말했다: "${playerLine}"\n참모 2~4명이 이 말에 반응한다. 동의하는 쪽과 반박하는 쪽이 갈려야 한다. 직급이 낮으면 무시당하거나 혼나기도 한다.`:'플레이어는 말이 없다. 참모 2~3명이 자기들끼리 현 상황을 두고 부딪친다. 한 명은 결단을 재촉하고 한 명은 막는다.'}
규칙: 한국어 구어체 존댓말/반말은 직급 관계에 맞게. 각 대사 30자 이내. 같은 사람 연속 금지. 기존 대사 반복 금지. 반드시 JSON만 출력: {"lines":[{"who":"이름","text":"대사"}],"stances":{"이름":"5자 이내 입장"}} (who는 위 참모 이름 그대로)`;
    try{const r=await this.sample.json(prompt,{modelTier:'quick',cache:false});const lines=Array.isArray(r&&r.lines)?r.lines.slice(0,4):[];
      if(r&&r.stances)Object.assign(this.stances,r.stances);this.renderStances();
      lines.forEach((l,i)=>{if(!l||!roster.includes(l.who)||!l.text)return;setTimeout(()=>{if(S.running){say(l.who,String(l.text).slice(0,80),i===lines.length-1);const el=[...document.querySelectorAll('.who')].find(w=>w.querySelector('b')&&w.querySelector('b').textContent===l.who);if(el)el.classList.add('ai')}},i*1400)});
      this.fails=0;this.cool=8}
    catch(e){this.fails++;const code=e&&e.code;if(code==='rate_limited')this.cool=60;else if(code==='not_granted'){this.ready=false;this.tag()}else this.cool=20;if(this.fails>=4){this.ready=false;this.tag()}}
    this.busy=false;
  },
  renderStances(){const h=Object.entries(this.stances).filter(([k])=>this.roster().includes(k)).map(([k,v])=>`<span><b>${k}</b> ${String(v).slice(0,10)}</span>`).join('');$('stances').innerHTML=h},
  tick(dt){if(this.cool>0)this.cool=Math.max(0,this.cool-dt/G.speed);
    // unprompted arguments once the line is open, roughly every 50s of mission time
    if(this.ready&&!this.busy&&S.running&&Object.keys(S.principals).length&&S.elapsed-this.lastAuto>=50&&this.cool<=0){this.lastAuto=S.elapsed;this.speak(null)}},
  reset(){this.stances={};this.lastAuto=S.elapsed;this.cool=0;this.busy=false;$('stances').innerHTML='';if(!this.ready)this.init()}
};
$('sayBtn').onclick=()=>{const v=$('sayIn').value.trim();if(!v||!S||!S.running)return;$('sayIn').value='';me(`[회의선] "${v}"`);AI.lastAuto=S.elapsed;AI.speak(v)};
$('sayIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('sayBtn').onclick()}});

// ---------- original tension score (procedural; not the film's OST) ----------
const MUSIC={on:true,ctx:null,nodes:null,next:0,
  start(){if(!this.on)return;try{this.ctx=this.ctx||AC||new (window.AudioContext||window.webkitAudioContext)();AC=this.ctx;const c=this.ctx;if(this.nodes)return;const g=c.createGain();g.gain.value=0;g.connect(c.destination);
    const mk=(f,type,det)=>{const o=c.createOscillator();o.type=type;o.frequency.value=f;o.detune.value=det||0;const og=c.createGain();og.gain.value=.08;o.connect(og);og.connect(g);o.start();return o};
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=220;lp.connect(g);
    const drone=[mk(55,'sawtooth',0),mk(55,'sawtooth',7),mk(82.4,'triangle',-5)];drone.forEach(o=>{o.disconnect();const og=c.createGain();og.gain.value=.05;o.connect(og);og.connect(lp)});
    const shim=c.createOscillator();shim.type='sine';shim.frequency.value=1760;const sg=c.createGain();sg.gain.value=0;shim.connect(sg);sg.connect(g);shim.start();
    this.nodes={g,lp,shim:sg,drone};g.gain.linearRampToValueAtTime(.9,c.currentTime+3);this.next=c.currentTime+.5}catch(e){}},
  stop(){if(!this.nodes)return;try{const c=this.ctx;this.nodes.g.gain.linearRampToValueAtTime(0,c.currentTime+1.5);const n=this.nodes;setTimeout(()=>{try{n.drone.forEach(o=>o.stop())}catch(e){}},1700)}catch(e){}this.nodes=null},
  tick(){if(!this.nodes||!S||!G)return;const c=this.ctx,t=c.currentTime;const p=S.phase==='post'?0.2:Math.min(1,S.elapsed/G.TOTAL);const urgency=S.ring?1:p;
    const period=1.6-urgency*1.1; // heartbeat quickens toward impact
    if(t>=this.next){this.next=t+period;const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(40,t+.18);const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(this.nodes.g);o.start(t);o.stop(t+.25);
      if(urgency>.5){const o2=c.createOscillator();o2.type='sine';o2.frequency.setValueAtTime(60,t+period*.3);o2.frequency.exponentialRampToValueAtTime(38,t+period*.3+.15);const g2=c.createGain();g2.gain.setValueAtTime(.0001,t+period*.3);g2.gain.exponentialRampToValueAtTime(.2,t+period*.3+.02);g2.gain.exponentialRampToValueAtTime(.0001,t+period*.3+.2);o2.connect(g2);g2.connect(this.nodes.g);o2.start(t+period*.3);o2.stop(t+period*.3+.22)}}
    this.nodes.lp.frequency.setTargetAtTime(220+urgency*900,t,.5);this.nodes.shim.gain.setTargetAtTime(p>.8?.04*(p-.8)*5:0,t,1);
    if(S.phase==='post')this.nodes.g.gain.setTargetAtTime(.35,t,2)}
};
$('mus').onclick=()=>{MUSIC.on=!MUSIC.on;$('mus').textContent=MUSIC.on?'음악 ON':'음악 OFF';$('mus').setAttribute('aria-pressed',MUSIC.on);if(MUSIC.on&&S&&S.running)MUSIC.start();else MUSIC.stop()};
