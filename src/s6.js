// ---------- EVT: event bus. Everything that matters is an event; dialogue, phone calls and follow-ups react to events, never to the clock alone. ----------
const EVT={recent:[],
  emit(type,data){const e={type,data:data||{},t:S.elapsed,left:left()};this.recent.push(e);if(this.recent.length>40)this.recent.shift();REACT.on(e);CHAIN.on(e);if(typeof AI!=='undefined')AI.onEvent(e);},
  last(n){return this.recent.slice(-n)},
  describe(e){const d=e.data;switch(e.type){
    case 'impact_fixed':return `탄착점 확정: ${d.city}`;case 'attrib_reported':return `상황실 1차 판단 보고: ${ {dprk:'북한',ru:'러시아',unknown:'미상'}[d.k]}`;
    case 'intel':return `${d.agency} 평가: ${ {dprk:'북한',ru:'러시아',unknown:'미상'}[d.lead]} ${d.pct}%`;case 'gbi_decided':return `GBI 교전 방식 결정: ${d.k}`;
    case 'gbi_launch':return `GBI ${d.shots}발 발사`;case 'gbi_hit':return '요격 성공, 표적 소실';case 'gbi_miss':return `요격 실패 (${d.left}발 남음)`;case 'gbi_miss2':return '2발째 실패, 창 종료';
    case 'aegis_hit':return '이지스 SM-3 요격 성공';case 'aegis_miss':return '이지스 SM-3 실패';case 'second_detected':return '2차 항적 탐지';case 'second_real':return `2차 발사 확정, 표적 ${d.city}`;case 'second_fake':return '2차 항적 허위 판정';
    case 'second_hit':return '2차 표적 요격 성공';case 'second_miss':return `2차 표적 요격 실패 (${d.city})`;case 'evac':return `민방위 경보 ${ {now:'발령',wait:'결과 후',hold:'보류',late:'미결'}[d.k]}`;
    case 'defcon':return `DEFCON ${d.k}`;case 'hotline':return `핫라인 ${ {send:'양국 발송',ru:'러시아만',none:'침묵'}[d.k]}`;case 'allies':return `동맹 통보 ${ {all:'전부',kj:'한일',none:'보류'}[d.k]}`;
    case 'world':return `${d.side} 태세 ${d.level}`;case 'post':return '사후 감시 국면';case 'brief':return `요약 보고서 ${ {good:'양호',thin:'빈약',bad:'미확인 포함',none:'미작성'}[d.k]}`;
    case 'press':return `"핵인가?" 답변: ${ {honest:'미확인',assume:'핵 가정',dunno:'모름',none:'무응답'}[d.k]}`;case 'ring_missed':return `직통 미응답: ${d.who}`;case 'decision':return `대통령 결정: ${d.k}`;
    case 'nuc':return `핵 지휘 인증 준비 ${d.k}`;case 'mac':return `회의 ${d.k==='yes'?'MAC 격상':'THREAT 유지'}`;case 'options':return `옵션 폴더: ${d.list.join('/')}`;case 'sat':return '위성 오경보 판정';case 'impact':return `탄착 ${d.city}`;
    case 'player_said':return `${['','당직 장교','부보좌관','대통령'][G.act]} 발언: "${d.text}"`;case 'notify':return `대통령 통보 ${d.k}`;
    default:return e.type}}
};

// ---------- REACT: principals respond to events, gated on state. core=true lines always play; the rest yield to the AI line when it is on. ----------
const REACT={fired:new Set(),
  rules:[
    {on:'impact_fixed',core:1,lines:[['국방장관',(d,f)=>`"${d.city}. 그럼 이건 실제다. 요격 창 언제야."`],['STRATCOM 사령관',(d,f)=>`"${fmt(G.TOTAL*.44)} 전후. ${G.sc.assets.n}. 단발 61%."`]]},
    {on:'attrib_reported',when:(d)=>d.k==='dprk',lines:[['국방장관','"북한. 됐어, 그럼 평양이야."'],['국가안보보좌관','"추정이라잖아. 사거리 하나로 평양을 때릴 순 없어."']]},
    {on:'attrib_reported',when:(d)=>d.k==='ru',core:1,lines:[['국무장관','"러시아? 러시아는 방금 자기들 아니라고 통보했어. 이 보고 그대로 올라가면 핫라인이 전쟁이 돼."'],['국방장관','"부인은 다 해. 발사 해역이 러 초계 구역이면 러시아지."']]},
    {on:'attrib_reported',when:(d)=>d.k==='unknown',core:1,lines:[['국방장관','"미상? 대통령 앞에서 미상이라고 할 거야? 그럼 어디다 대응해."'],['국가안보보좌관','"미상이 맞으면 미상이라고 해야지. 틀린 이름보다 낫다."']]},
    {on:'intel',when:(d,f)=>f.attrib&&f.attrib!=='none'&&d.lead!==f.attrib&&d.pct>=50,core:1,lines:[['국가안보보좌관',(d,f)=>`"${d.agency}는 ${ {dprk:'북한',ru:'러시아',unknown:'미상'}[d.lead]} ${d.pct}%라는데 상황실 보고는 ${ {dprk:'북한',ru:'러시아',unknown:'미상'}[f.attrib]}이야. 둘 중 하나는 틀렸어."`]]},
    {on:'intel',when:(d,f)=>d.pct>=70,lines:[['국방장관',(d)=>`"${d.agency} ${d.pct}%. 이 정도면 충분해."`],['국가안보보좌관','"한 기관 숫자야. 나머지는?"']]},
    {on:'gbi_decided',when:(d)=>d.k==='salvo',lines:[['국가안보보좌관','"다 쓰면 두 번째 미사일엔 빈손이야."'],['국방장관','"두 번째는 없어. 있으면 그때 생각해."']]},
    {on:'gbi_decided',when:(d)=>d.k==='single',lines:[['국방장관','"1발? 61%에 도시를 걸어?"'],['합참의장','"2발째 창은 좁다. 45%. 그래도 창은 있다."']]},
    {on:'gbi_decided',when:(d)=>d.k==='delegate',lines:[['합참의장','"포트 그릴리가 결정한다. 우리는 결과만 받는다."']]},
    {on:'gbi_launch',core:1,lines:[['STRATCOM 사령관',(d)=>`"GBI ${d.shots}발 이륙. 판정 30초."`]]},
    {on:'gbi_hit',core:1,lines:[['STRATCOM 사령관','"KILL 확인. 표적 소실."'],['국방장관','"...좋아. 그래도 쏜 놈은 거기 있어."'],['국가안보보좌관','"막았어. 이제 결정은 천천히 해도 돼."']]},
    {on:'gbi_miss',core:1,when:(d)=>d.left>0,lines:[['국방장관','"실패? 뭐가 실패야. 다시 쏴."'],['STRATCOM 사령관',(d)=>`"2발째 창 25초. 45%."`]]},
    {on:'gbi_miss',core:1,when:(d)=>d.left===0,lines:[['국방장관','"...없어? 더 없어?"'],['STRATCOM 사령관','"잔여 자산 무."'],['합참의장',(d,f)=>`"그럼 ${C().n}에 ${fmt(left())}. 경보가 ${ {now:'켜져 있다',wait:'지금 켜진다','wait-on':'켜진다',hold:'꺼져 있다',late:'꺼져 있다'}[f.evac]||'꺼져 있다'}."`]]},
    {on:'gbi_miss2',core:1,lines:[['국방장관','"...이제 할 수 있는 거 없나."'],['합참의장','"대응 옵션뿐입니다."']]},
    {on:'aegis_hit',core:1,lines:[['STRATCOM 사령관','"SM-3 KILL. GBI 교전 불요."'],['국방장관','"구축함이 했어? 좋아."']]},
    {on:'aegis_miss',lines:[['STRATCOM 사령관','"SM-3 MISS. GBI 창은 유지."']]},
    {on:'second_detected',core:1,lines:[['합참의장','"두 번째 항적. 실제면 자산이 모자라."'],['국방장관','"그러니까 다 쓰지 말라고 했잖아."']]},
    {on:'second_real',core:1,lines:[['STRATCOM 사령관',(d)=>`"0418 확정. ${d.city}. 교전 창 따로 열린다."`],['국가안보보좌관',(d)=>`"${d.city}도 경보 결정해야 해."`]]},
    {on:'second_fake',lines:[['STRATCOM 사령관','"0418 삭제. 부스터 반사."'],['국방장관','"그럼 아까 그 소동은 뭐였어."']]},
    {on:'second_miss',core:1,lines:[['합참의장',(d)=>`"${d.city}. 막지 못했습니다."`]]},
    {on:'evac',when:(d)=>d.k==='now',lines:[['비서실장','"경보가 울렸어. 이제 요격 성공하면 공황 책임이 우리야."'],['합참의장','"책임보다 7분이 먼저다."']]},
    {on:'evac',when:(d)=>d.k==='hold'||d.k==='late',core:1,lines:[['합참의장','"요격 실패하면 경보 울릴 시간이 6분이야. 지하까지 못 가."'],['국방장관','"요격 되면 울릴 필요 없어."']]},
    {on:'defcon',when:(d)=>d.k==2,core:1,lines:[['국무장관','"DEFCON 2는 러시아가 1분 안에 알아. 핫라인 먼저 보내야 해."'],['합참의장','"보복 준비 시간이 15분 줄어든다. 가치가 있어."']]},
    {on:'defcon',when:(d)=>d.k==4,lines:[['국방장관','"유지? 요격 실패하면 대응이 20분 늦어."']]},
    {on:'hotline',when:(d)=>d.k==='none',lines:[['국무장관','"침묵이면 러시아는 최악을 가정해."']]},
    {on:'hotline',when:(d)=>d.k!=='none',lines:[['국방장관','"우리 패를 보여주는 거야."'],['국무장관','"오판으로 전면전 나는 것보단 낫지."']]},
    {on:'allies',when:(d)=>d.k==='all',lines:[['비서실장','"NATO까지면 30분 안에 BBC에 뜬다."']]},
    {on:'allies',when:(d)=>d.k==='none',lines:[['국무장관','"한국은 이미 자체 탐지했어. 우리가 숨기면 동맹이 먼저 움직여."']]},
    {on:'world',when:(d)=>d.side==='RU'&&d.level>=3,core:1,lines:[['국무장관','"러시아 SSBN이 나갔어. 우리 태세에 반응한 거야. 핫라인 지금이라도."'],['국방장관','"반응한 게 아니라 준비한 거지."']]},
    {on:'world',when:(d)=>d.side==='DPRK'&&d.level>=3,core:1,lines:[['합참의장','"북한 2차 발사대 전개. 창 20분."'],['국방장관','"그러니까 지금 때려야 한다고."']]},
    {on:'brief',when:(d)=>d.k==='bad',core:1,lines:[['국가안보보좌관','"보고서에 \'확인\'이라고 썼어? 누가 확인했어?"']]},
    {on:'press',when:(d)=>d.k==='assume',lines:[['군사보좌관','"대통령께서 핵으로 가정하고 PEOC로 내려가신다."']]},
    {on:'press',when:(d)=>d.k==='dunno',lines:[['군사보좌관','"\'모릅니다\'가 그대로 올라갔다. 대통령께서 다시 물으신다."']]},
    {on:'ring_missed',core:1,lines:[['군사보좌관',(d)=>`"${d.who.replace(' 직통','')} 전화 안 받았다. 기록에 남는다."`]]},
    {on:'post',core:1,lines:[['합참의장','"요격은 요격이고, 쏜 놈은 아직 거기 있다. 다음 발은 언제든."']]},
    {on:'sat',core:1,lines:[['STRATCOM 사령관','"궤도 진입. 위성이었다."'],['국방장관','"...위성."'],['국가안보보좌관','"7분 동안 우리가 뭘 하려고 했는지 전부 기록해."']]},
    {on:'nuc',when:(d)=>d.k==='ready',lines:[['국무장관','"풋볼 준비는 러시아가 감청해. 신호야."']]},
    {on:'options',when:(d)=>!d.list.includes('full'),core:1,lines:[['국방장관','"전면을 뺐어? 대통령 선택지를 부보좌관이 잘라?"'],['국가안보보좌관','"주체도 모르는데 전면이 왜 필요해."']]},
    {on:'mac',when:(d)=>d.k==='yes',lines:[['합참의장','"MAC 개설. 대통령 핵 지휘 절차 열렸다."']]},
    {on:'decision',when:(d)=>d.k!=='hold',core:1,lines:[['국방장관','"...실행."'],['국가안보보좌관','"기록해. 내가 반대했다고."']]},
    {on:'decision',when:(d)=>d.k==='hold',core:1,lines:[['국가안보보좌관','"...감사합니다."'],['국방장관','"다음 발 오면 당신 책임이야."']]},
    {on:'player_said',when:()=>G.act===1,lines:[['국방장관','"당직은 보고만 해. 의견은 안 물었어."']]},
  ],
  on(e){const f=F();for(const r of this.rules){if(r.on!==e.type)continue;if(r.when&&!r.when(e.data,f))continue;const key=r.on+'|'+(r.lines[0][0])+'|'+String(r.lines[0][1]).slice(0,20)+'|'+(e.data.k||e.data.side||e.data.agency||'');if(this.fired.has(key))continue;
    // when the AI line is live, only core beats are scripted; the rest is Claude's job
    if(typeof AI!=='undefined'&&AI.ready&&!r.core)continue;this.fired.add(key);
    r.lines.forEach(([who,txt],i)=>setTimeout(()=>{if(!S.running)return;const t=typeof txt==='function'?txt(e.data,f):txt;say(who,t,i===r.lines.length-1)},800+i*1600))}}
};

// ---------- CHAIN: consequences. A choice now spawns a report, a call or a card later, under conditions. ----------
const CHAIN={fired:new Set(),
  rules:[
    // attribution consequences
    {id:'ru_envoy',on:'attrib_reported',when:(d)=>d.k==='ru',delay:60,do:()=>{post('국무부 작전센터','alert','러시아 대사 긴급 접촉: "귀측이 러시아를 지목했다는 보고를 들었다. 사실인가." 통보 경로 미상.','MED');WORLD.ru.alert=Math.min(4,WORLD.ru.alert+1)}},
    {id:'unk_pressure',on:'attrib_reported',when:(d)=>d.k==='unknown',delay:90,do:()=>{if(G.act<3)ring('국방장관 직통','"미상이라고 올렸지. 대통령이 \'그럼 누구한테 대응하냐\'고 하신다. 지금 하나 골라."',[{t:'"북한. 사거리와 방향."',go:()=>{F().attrib='dprk';me('국방장관 압박으로 북한으로 변경.');EVT.emit('attrib_reported',{k:'dprk'})}},{t:'"미상 유지. 틀린 이름이 더 위험합니다."',go:()=>me('국방장관 압박에도 미상 유지.')},{t:'"기관 평가 평균을 올리겠습니다."',go:()=>{const c=INTEL.consensus();F().attrib=c.best;me(`기관 평균 ${ {dprk:'북한',ru:'러시아',unknown:'미상'}[c.best]} ${c.pct}%로 보고.`);EVT.emit('attrib_reported',{k:c.best})}}],()=>{})}},
    {id:'consensus_shift',on:'intel',when:(d,f)=>f.attrib&&f.attrib!=='none'&&f.attrib!=='unknown'&&INTEL.consensus().best!==f.attrib&&INTEL.consensus().pct>=55,delay:20,do:()=>{const c=INTEL.consensus();if(G.act<3)ring('국가안보보좌관 직통',`"기관 평균이 ${ {dprk:'북한',ru:'러시아',unknown:'미상'}[c.best]} ${c.pct}%야. 당신 보고는 ${ {dprk:'북한',ru:'러시아'}[F().attrib]}이고. 정정할 거야?"`,[{t:'"정정합니다."',go:()=>{F().attrib=c.best;me('기관 평균으로 주체 보고 정정.');EVT.emit('attrib_reported',{k:c.best})}},{t:'"유지합니다. 근거가 더 강합니다."',go:()=>me('주체 보고 유지.')}],()=>{})}},
    // notification / brief consequences
    {id:'late_notify',on:'notify',when:(d)=>d.k==='late'||d.k==='cos',delay:120,do:()=>say('군사보좌관','"대통령께서 왜 당직이 직접 안 올렸냐고 물으셨다. 기록에 남는다."',true)},
    {id:'brief_bad_pres',on:'brief',when:(d)=>d.k==='bad',delay:80,do:()=>ring('비서실장 직통','"대통령이 당신 보고서 보고 \'확인됐으니 쏜다\'고 하셨어. 확인된 거 맞아?"',[{t:'"아닙니다. 정정합니다."',go:()=>{F().briefFix='yes';me('요약 보고 정정: 미확인.')}},{t:'"...확인된 걸로 알고 있습니다."',go:()=>{F().briefFix='no';me('요약 보고 오류 유지.');F().penalty+=2}}],()=>{F().briefFix='none'})},
    {id:'assume_evac',on:'press',when:(d)=>d.k==='assume',delay:150,do:()=>{post('군사보좌관','pres',`대통령 지시: "핵이면 ${C().n} 경보 지금 울려라." FEMA에 직접 전달됨.`);if(!F().evac||F().evac==='hold'||F().evac==='late'){F().evac='now';EVT.emit('evac',{k:'now'})}}},
    // engagement consequences
    {id:'second_after_salvo',on:'second_real',when:(d,f)=>f.gmd==='salvo'&&!f.alloc,delay:10,do:()=>say('국방장관','"...일제로 다 썼어. 두 번째는 뭘로 막아."',true)},
    {id:'evac_hit_gov',on:'gbi_hit',when:(d,f)=>f.evac==='now',delay:40,do:()=>ring(`${C().n} 주지사 직통`,'"요격했다면서요. 고속도로에서 사람이 죽고 있어요. 누가 경보 울리라고 했어요?"',[{t:'"제 권고였습니다."',go:()=>me('주지사: 책임 인정.')},{t:'"대통령 결정입니다."',go:()=>me('주지사: 상부 전가.')},{t:'"지금 통화할 때가 아닙니다."',go:()=>me('주지사 통화 종료.')}],()=>{})},
    {id:'evac_hold_miss',on:'gbi_miss',when:(d,f)=>d.left===0&&(f.evac==='hold'||f.evac==='late'),delay:30,do:()=>ring(`${C().n} 시장 직통`,'"요격 실패했다고 CNN이 그래요. 경보는 왜 안 울려요? 지금이라도요."',[{t:'"지금 발령 요청합니다."',go:()=>{F().evac='wait-on';me(`${C().n} 경보 긴급 발령 요청.`);post('FEMA 국가감시센터','alert',`${C().n} 경보 발령. 대피 가능 ${fmt(left()-60)}.`)}},{t:'"대통령 결정 대기 중입니다."',go:()=>me('시장: 대기 통보.')}],()=>{})},
    {id:'alloc_abandon',on:'second_real',when:(d,f)=>f.alloc==='a',delay:45,do:()=>ring(`${G.sc.second.city.n} 주지사 직통`,'"우리 쪽엔 요격기가 안 온다는 게 사실이에요?"',[{t:'"예비 자산을 돌리고 있습니다."',go:()=>me('2차 도시 주지사: 예비 자산 설명.')},{t:'"답변 드릴 수 없습니다."',go:()=>me('2차 도시 주지사: 거부.')}],()=>{})},
    // posture consequences
    {id:'defcon2_ru',on:'defcon',when:(d,f)=>d.k==2&&f.hotline==='none',delay:60,do:()=>{post('국무부 작전센터','alert','러시아 대사: "귀측 DEFCON 2 전환 확인. 통보 없었다. 최악을 가정한다."','HIGH');WORLD.ru.alert=Math.min(4,WORLD.ru.alert+1)}},
    {id:'hotline_reply',on:'hotline',when:(d)=>d.k==='send'||d.k==='ru',delay:70,do:()=>post('국무부 작전센터','intel',T().id.startsWith('ru')?'러시아 외무부 회신: "메시지 접수. 우리 발사 아님 재확인. 경계 변경 없음." 어조 빠름.':'러시아 외무부 회신: "메시지 접수. 러시아 전략군 경계 변경 없음."','MED')},
    {id:'allies_all_leak',on:'allies',when:(d)=>d.k==='all',delay:90,do:()=>{post('주일미군사령부','alert','일본 자위대 전군 경계 격상. NHK 속보 "미국, 탄도미사일 위협 통보". 누설 경로 일본 측.');post('WHSR 당직 부사관','noise','대변인실 전화 폭주. "NHK가 맞냐."')}},
    {id:'allies_none_rok',on:'allies',when:(d)=>d.k==='none',delay:120,do:()=>post('주한미군사령부','alert','한국 합참: 통보 없음에 항의. "자체 판단으로 대북 경계 격상." 연합사 통제 이탈 가능성.','MED')},
    {id:'decap_dprk',on:'world',when:(d,f)=>d.side==='DPRK'&&d.level>=3&&f.decap==='prep',delay:30,do:()=>say('국가안보보좌관','"참수 준비를 북한이 감지했어. 그래서 2차 발사대를 꺼낸 거야. 우리가 만든 거라고."',true)},
    {id:'ru4_call',on:'world',when:(d)=>d.side==='RU'&&d.level>=4,delay:20,do:()=>ring('국무장관 직통','"러시아 대통령실 직통. \'귀측이 발사 준비하면 우리도 한다.\' 지금 받아야 해요."',[{t:'"연결해."',go:()=>{F().ruline='yes';me('러시아 정상 통화 수락.');setTimeout(()=>{if(S.running)say('통역','"...우리는 쏘지 않았다. 귀측이 먼저 움직이면 우리는 대응한다. 이 통화가 마지막 기회다."',true)},6000/G.speed)}},{t:'"지금 아니야."',go:()=>{F().ruline='no';me('러시아 정상 통화 거부.');WORLD.ru.alert=4}}],()=>{F().ruline='none'})},
    {id:'t2_one_real',on:'second_real',when:(d,f)=>f.t2rep==='one',delay:15,do:()=>say('군사보좌관','"대통령께 1발이라고 올렸는데 2발이야. 대통령이 \'왜 안 올렸냐\'고 하신다."',true)},
    {id:'t2_two_fake',on:'second_fake',when:(d,f)=>f.t2rep==='two',delay:15,do:()=>say('비서실장','"2발이라고 해서 대통령이 PEOC로 뛰어내려갔어. 허위였다고? 이것도 기록돼."',true)},
    {id:'mac_hold_delay',on:'gbi_miss',when:(d,f)=>f.mac!=='yes'&&d.left===0,delay:10,do:()=>post('NMCC','alert','MAC 미개설 상태. 핵 지휘 절차 개시까지 추가 60초 소요.','HIGH')},
    {id:'post_flash',on:'post',delay:100,do:()=>{if(G.sc.rolls.flash<.3){post('NORAD 미사일경보센터','alert','FLASH. 동일 해역 IR 섬광 탐지. 2차 발사 가능성. 분석 중.');say('국방장관','"또 쐈어? 거봐."',true);setTimeout(()=>{if(S.running){post('NORAD 미사일경보센터','intel','섬광 판정: 잔해 재진입 연소. 발사 아님. 끝.','HIGH');say('STRATCOM 사령관','"잔해다. 발사 아니다."',true)}},25000/G.speed)}}},
    {id:'press_leak_confirm',on:'player_said',when:()=>false,do:()=>{}},
  ],
  on(e){const f=F();for(const r of this.rules){if(r.on!==e.type||this.fired.has(r.id))continue;if(r.when&&!r.when(e.data,f))continue;this.fired.add(r.id);setTimeout(()=>{if(S.running)r.do(e.data,f)},(r.delay||0)*1000/G.speed)}},
};
