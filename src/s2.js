// ---------- ACT 1: watch officer ----------
function act1(){
  const t=T(),f=F(),sc=G.sc,city=C();
  at(.007,()=>post('WHSR 당직 부사관','noise','당직, 민항 트래픽 교차확인 요청. 항공사 하나가 자기 비행기 아니냐고 묻는 중.'));
  at(.02,()=>card('c1','위협평가 회의 소집','NMCC가 회의선 개설을 요청합니다. 소집하면 당신이 사회를 봅니다.',[
    {k:'now',t:'즉시 소집',s:'국방장관·합참의장·STRATCOM·안보보좌관 연결.',go:()=>{f.conf='now';me('위협평가 회의선 개설.');$('confState').textContent='연결 중'}},
    {k:'wait',t:'NMCC 1차 평가 대기',s:'60초. 그동안 아무도 말 안 한다.',go:()=>{f.conf='wait';me('NMCC 1차 평가 대기 후 소집.')}},
  ],40,()=>{f.conf='late';post('NMCC 당직 부장','alert','WHSR, 회의선 왜 안 여나. 우리가 연다.');$('confState').textContent='NMCC 개설'}));
  at(.035,()=>card('c2','대통령 통보',`대통령은 ${sc.pres.n}에 있습니다.${sc.pres.lag?' 통신 지연 '+sc.pres.lag*40+'초.':''} 확인된 건 "무언가 올라왔다"뿐.`,[
    {k:'now',t:'즉시 직접 통보',s:'불완전한 정보로.',go:()=>{f.notify='now';me('군사보좌관 경유 대통령 즉시 통보.');$('pPres').textContent='POTUS: 통보됨';EVT.emit('notify',{k:'now'})}},
    {k:'cos',t:'비서실장 경유',s:'절차대로. 90초.',go:()=>{f.notify='cos';me('비서실장실 통보.');EVT.emit('notify',{k:'cos'})}},
    {k:'verify',t:'2차 센서 확인 후',s:'오경보 걸러내기. 100초.',go:()=>{f.notify='verify';me('우주군 교차확인 요청 후 상신.');EVT.emit('notify',{k:'verify'})}},
  ],45,()=>{f.notify='late';post('군사보좌관','alert','당직, 대통령께 아직 아무 말도 안 들어갔다. 내가 올린다.');EVT.emit('notify',{k:'late'})}));
  at(.045,()=>post('CNN 백악관 출입기자','noise','상황실 비상등 켜졌냐는 문의. 대변인실 경유.'));
  at(.06,()=>card('c3','부통령 연결',`부통령은 ${sc.vp}에 있습니다. 비밀경호국이 상황실 판단을 묻습니다. 당신은 전달만 할 수 있습니다.`,[
    {k:'sep',t:'"분리 보호 권고" 전달',s:'',go:()=>{f.vp='sep';me('부통령 분리 보호 권고 전달.')}},
    {k:'hold',t:'"대기" 전달',s:'',go:()=>{f.vp='hold';me('부통령 대기 전달.')}},
  ],40,()=>{f.vp='hold';post('비밀경호국','alert','응답 없음. 부통령 현 위치.')}));
  at(.065,()=>{if(f.conf==='now'){$('confState').textContent='개설됨';say('국방장관','"뭐가 올라온 건지부터. 한 발이 확실한가."');say('합참의장','"STRATCOM, 요격 창 언제 열리나."',true)}});
  at(.088,()=>say('STRATCOM 사령관',`"창은 ${fmt(G.TOTAL*.44)} 전후. ${sc.assets.n}. GBI 단발 61%."`));
  at(.095,()=>post('WHSR 당직 부사관','noise','하원의장실 전화. "무슨 일이냐." 대기시킴.'));
  at(.12,()=>card('c1b','회의 격상 요청','NMCC가 위협평가회의(THREAT)를 미사일공격회의(MAC)로 격상하자고 합니다. 격상하면 대통령·국방장관이 의무 참석하고 핵 지휘 절차가 열립니다.',[
    {k:'mac',t:'MAC 격상 요청 전달',s:'절차상 맞다. 되돌릴 수 없다.',go:()=>{f.mac='yes';me('미사일공격회의(MAC) 격상 전달.');EVT.emit('mac',{k:'yes'});$('confTitle').textContent='미사일공격회의 (MAC)';post('NMCC','alert','MAC 개설. 전 주요 직위자 참석 의무. NC3 체계 활성.','HIGH')}},
    {k:'hold',t:'THREAT 유지',s:'탄착점 확정 후.',go:()=>{f.mac='hold';me('THREAT 회의 유지.')}},
  ],35,()=>{f.mac='late';post('NMCC','alert','WHSR 응답 없음. NMCC 자체 판단 MAC 격상.');$('confTitle').textContent='미사일공격회의 (MAC)'}));
  at(.10,()=>ring('군사보좌관 직통','대통령께서 물으십니다. "핵인가?"',[
    {t:'"탄두 확인 안 됐습니다. 핵 배제 못 합니다."',go:()=>{f.press='honest';me('POTUS 질의: 탄두 미확인, 핵 배제 불가.');EVT.emit('press',{k:'honest'})}},
    {t:'"핵으로 가정하고 움직이셔야 합니다."',go:()=>{f.press='assume';me('POTUS 질의: 핵 가정 권고.');$('tWh').textContent='핵 가정';EVT.emit('press',{k:'assume'})}},
    {t:'"모릅니다."',go:()=>{f.press='dunno';me('POTUS 질의: 모름.');EVT.emit('press',{k:'dunno'})}},
  ],()=>{post('군사보좌관','alert','당직 응답 없음. "확인 중"으로 전달.');f.press='none';EVT.emit('press',{k:'none'})}));
  at(.118,()=>{if(f.notify==='verify')post('우주군','intel','교차확인 완료. 실제 발사. 대통령 통보 진행.','높음')});
  at(.13,()=>card('c4','비밀경호국 질의','비밀경호국이 "탄착지가 어디냐, 대통령 이동해야 하냐"고 묻습니다. 당신이 아는 대로만.',[
    {k:'city',t:`"${city.n} 추정, 오차 ±60km"`,s:'',go:()=>{f.move='info';me('비밀경호국에 탄착 추정 전달.')}},
    {k:'unk',t:'"미확정. 재산출 중."',s:'',go:()=>{f.move='unk';me('비밀경호국에 미확정 전달.')}},
  ],35,()=>{f.move='none';post('비밀경호국','alert','응답 없음. 자체 판단 이동 개시.')}));
  at(.14,()=>card('c5','발사 주체 1차 보고','대통령실이 상황실 1차 판단을 요구합니다. 당신 보고가 부보좌관과 대통령 책상에 올라갑니다.',[
    {k:'dprk',t:'북한',s:'방향·사거리 부합. 직접 증거 없음.',go:()=>{f.attrib='dprk';me('1차 판단: 북한 추정.');EVT.emit('attrib_reported',{k:'dprk'})}},
    {k:'ru',t:'러시아',s:sc.site.sea==='오호츠크해'||sc.site.sea==='베링해'?'발사 해역이 러시아 초계 해역.':'러시아는 부인.',go:()=>{f.attrib='ru';me('1차 판단: 러시아 가능성.');EVT.emit('attrib_reported',{k:'ru'})}},
    {k:'unknown',t:'미상, 확인 중',s:'정직하다. 대통령은 답을 원한다.',go:()=>{f.attrib='unknown';me('1차 판단: 주체 미상.');EVT.emit('attrib_reported',{k:'unknown'})}},
  ],70,()=>{f.attrib='none';say('국가안보보좌관','"당직, 대통령께서 세 번 물으셨다. 답이 없으면 그것도 답이다."',true)}));
  at(.15,()=>post('WHSR 당직 부사관','noise',`${city.n} 시장실 전화. "뉴스에 뜰 거냐." 대기 4번.`));
  at(.19,()=>{const g=sc.assets.gbi;const opts=[{k:'salvo',t:`GBI ${g}발 일제`},{k:'single',t:'1발 후 재평가'},{k:'delegate',t:'현장 위임'}].filter(o=>g>=2||o.k!=='salvo');
    AI.decide('GBI 교전 방식',opts,(k,lines)=>{f.gmd=k;say('합참의장',`"회의선 결정: ${opts.find(o=>o.k===k).t}. 당직, 포트 그릴리에 전달."`,true);EVT.emit('gbi_decided',{k});
    card('c6','교전 결정 전달','회의선이 요격 방식을 정했습니다. 당신은 전달합니다. 그 전에 한 가지 확인을 끼워 넣을 수 있습니다.',[
    {k:'relay',t:'그대로 전달',s:'',go:()=>{me(`포트 그릴리에 교전 결정 전달: ${f.gmd==='salvo'?'일제':'1발'}.`)}},
    {k:'ask',t:'"2차 항적 분석 끝났습니까?" 확인 후 전달',s:'20초.',go:()=>{me('2차 항적 확인 후 교전 결정 전달.');if(sc.second)post('NORAD 지휘센터','intel',sc.second.real?'2차 항적: 독립 항적 가능성 높음.':'2차 항적: 부스터 반사 가능성 높음.','중간');else post('NORAD 지휘센터','intel','추가 항적 없음.','높음')}},
  ],30,()=>{post('GMD 포트 그릴리','alert','전달 지연. 포트 그릴리가 STRATCOM 직접 수신.')})},f.attrib==='unknown'?'single':'salvo')});
  at(.23,()=>post('WHSR 당직 부사관','noise','상원 군사위원장 보좌관이 직접 내려왔다고 경호실. 못 들어오게 함.'));
  at(.25,()=>ring('국방장관 직통',`"당직, 아까 ${ {dprk:'북한',ru:'러시아',unknown:'미상'}[f.attrib]||'아무 말도 안'}이라고 했지. 대통령 앞에서 말이 다르면 안 돼. 지금도 그거야?"`,[
    {t:'1차 판단 유지',go:()=>me('국방장관 질의: 1차 판단 유지.')},
    {t:'"재검토 중입니다. 미상으로 정정합니다."',go:()=>{f.attrib='unknown';me('국방장관 질의: 미상으로 정정.')}},
  ],()=>post('국방장관','alert','"됐다. 끊어."')));
  at(.27,()=>{const c=card('c11','요약 보고서 작성','대통령께 올릴 1장 요약. 확인된 것만 고르십시오. 이 종이가 2막과 3막의 책상에 그대로 놓입니다.',[
    {k:'send',t:'보고서 전송',s:'체크한 항목만 들어갑니다.',go:()=>{const c=S.cards.find(x=>x.id==='c11');const p=c.picked||[];const bad=p.filter(k=>['nuc','who','two'].includes(k)).length;const good=p.filter(k=>['one','imp','gbi'].includes(k)).length;f.briefItems=p.map(k=>c.items.find(i=>i.k===k).t);f.brief=bad?'bad':good>=2?'good':'thin';me(`요약 보고서 전송. 항목 ${p.length}개.`+(bad?` 미확인 ${bad}건 포함.`:''));EVT.emit('brief',{k:f.brief})}},
  ],75,()=>{f.brief='none';f.briefItems=[];post('비서실장','alert','요약 보고 미도착. 대통령께 구두로 올림.');EVT.emit('brief',{k:'none'})},'brief');
    if(c){c.items=[{k:'one',t:'탄도미사일 1발 발사 확인 (SBIRS·UEWR)'},{k:'imp',t:`탄착 추정 ${city.n} ±60km`},{k:'nuc',t:'핵탄두 탑재 확인'},{k:'who',t:`발사 주체 ${f.attrib==='ru'?'러시아':'북한'} 확정`},{k:'gbi',t:`요격 자산 ${sc.assets.n} 준비`},{k:'two',t:'2발 이상 발사'}].sort(()=>Math.random()-.5);renderCards()}});
  at(.305,()=>AI.decide(`${city.n} 민방위 경보`,[{k:'now',t:'즉시 발령'},{k:'wait',t:'요격 결과 후'},{k:'hold',t:'보류'}],(k)=>{f.evac=k;say('국가안보보좌관',`"회의선 결정: 경보 ${ {now:'즉시 발령',wait:'요격 결과 후',hold:'보류'}[k]}. 당직, FEMA 전달."`,true);EVT.emit('evac',{k});card('c12r','경보 결정 전달','회의선이 경보 여부를 정했습니다. FEMA 국가감시센터에 전달합니다.',[{k:'relay',t:'전달',s:'',go:()=>me(`FEMA 전달: 경보 ${k}.`)}],25,()=>{post('FEMA 국가감시센터','alert','전달 지연. NMCC 경유 수신.')})},'wait'));
  at(.33,()=>AI.decide('경계태세(DEFCON)',[{k:3,t:'DEFCON 3'},{k:2,t:'DEFCON 2'},{k:4,t:'유지'}],(k)=>{f.defcon=+k;$('pDefcon').textContent='DEFCON '+k;$('pDefcon').className='pill'+(k==2?' red':k==3?' on':'');say('합참의장',`"회의선 결정: DEFCON ${k}."`,true);EVT.emit('defcon',{k:+k})},3));
  at(.31,()=>post('WHSR 당직 부사관','noise','대변인실: 트위터에 "알래스카 레이더 비상" 확산. 대응 문의.'));
  at(.36,()=>say('STRATCOM 사령관','"GBI 준비 완료. 창 열리면 간다."'));
  at(.37,()=>post('WHSR 당직 부사관','noise','뉴욕타임스 국방 담당 직접 전화. 응답 거부.'));
  at(.56,()=>{if(!isHit())say('국가안보보좌관',f.attrib==='unknown'||f.attrib==='none'?'"대통령께서 보복 옵션을 요구하신다. 주체도 모르는데 뭘 때리나."':`"대통령께서 보복 옵션을 요구하신다. ${f.attrib==='ru'?'러시아':'북한'} 기준으로 준비 중이야. 확증은 아직이고."`,true)});
  at(.62,()=>post('WHSR 당직 부사관','noise','CNN 속보 "미 본토 미사일 경보 가능성". 대변인실 패닉.'));
  at(.65,()=>card('c19','의회 통보','상원 군사위원장이 "지금 안 알려주면 기자회견 하겠다"고 합니다. 당신은 연결만 할 수 있습니다.',[
    {k:'brief',t:'안보보좌관실로 연결',s:'',go:()=>{f.congress='brief';me('의회 요구 안보보좌관실 연결.')}},
    {k:'later',t:'대기 유지',s:'위원장이 폭발한다.',go:()=>{f.congress='later';me('의회 대기 유지.')}},
  ],35,()=>{f.congress='none';post('의회 연락실','alert','응답 없음. 위원장 기자회견 예고.')}));
  at(.67,()=>ring('군사보좌관 직통',isHit()?'대통령: "거기 처음부터 있었던 사람. 막았는데도 쏴야 하나?"':`대통령: "거기 처음부터 있었던 사람. ${C().n}에 ${fmt(left())}. 쏴야 하나?"`,[
    {t:'"예. 더 기다리면 옵션이 사라집니다."',go:()=>{f.presAns='yes';me('POTUS 직접 질의: 대응 권고.')}},
    {t:'"아니요. 누굴 때릴지 모릅니다."',go:()=>{f.presAns='no';me('POTUS 직접 질의: 대응 반대.')}},
    {t:'"제가 답할 자리가 아닙니다."',go:()=>{f.presAns='pass';me('POTUS 직접 질의: 회피.')}},
  ],()=>{f.presAns='silent';post('군사보좌관','alert','"...당직, 거기 있나? 끊는다."')}));
  at(.78,()=>card('c21','교대 요청','당직 부사관이 교대를 요청합니다. "저 시카고에 애들 있어요." 교대하면 피드 인수인계에 40초 공백.',[
    {k:'ok',t:'교대 허가',s:'',go:()=>{me('부사관 교대 허가.');S.feedDead=true;$('tData').textContent='HANDOVER';$('tData').className='stale';setTimeout(()=>{if(S.running){S.feedDead=false;$('tData').textContent='LIVE';$('tData').className=''}},40000/G.speed)}},
    {k:'no',t:'불허',s:'"끝나고."',go:()=>{me('부사관 교대 불허.')}},
  ],30,()=>{}));
  at(.845,()=>{if(!isHit())ring(`${city.n} 주지사 직통`,'"지금 우리 애들한테 뭐라고 해야 돼요. 남은 시간 솔직히."',[{t:'"3분 이내입니다. 지하로."',go:()=>me('주지사: 잔여 시간 통보.')},{t:'"대통령실에서 연락드릴 겁니다."',go:()=>me('주지사: 상부 이관.')}],()=>{})});
  at(.97,()=>{if(!isHit())post('WHSR 당직 부사관','noise',`...당직, ${city.n}에 가족 있는 사람들 있어요.`)});
  if(t.id==='dprk-sub')at(.2,()=>card('b3','한국 해군 좌표 요청','한국 해군이 우리 발사 해역 좌표를 요구합니다. 당신은 연결하거나 보류할 수 있습니다.',[{k:'share',t:'STRATCOM에 연결',s:'',go:()=>{f.rokshare='share';me('한국 해군 요청 STRATCOM 연결.')}},{k:'no',t:'보류',s:'',go:()=>{f.rokshare='no';me('좌표 요청 보류.')}}],35,()=>{f.rokshare='none'}));
  if(t.id==='unknown')at(.38,()=>card('b4','비국가 행위자 가설','DIA 분석관이 "국가 발사가 아닐 수 있다"는 메모를 올려달라고 합니다. 올리면 보복 논의가 멈춥니다.',[{k:'report',t:'메모 상신',s:'',go:()=>{f.nonstate='report';me('비국가 행위자 가설 메모 상신.')}},{k:'hold',t:'보류',s:'',go:()=>{f.nonstate='hold';me('비국가 가설 보류.')}}],40,()=>{f.nonstate='none'}));
  if(t.id==='sat')at(.2,()=>card('b5','러시아 우주군 확인','우주군이 러시아에 발사 통보 여부를 묻자고 합니다. 물으면 우리가 탐지했다는 걸 알립니다.',[{k:'ask',t:'확인 요청 연결',s:'',go:()=>{f.space='ask';me('러시아 우주군 확인 요청 연결.');setTimeout(()=>{if(S.running)post('국무부 작전센터','intel','러시아 우주군: "정찰위성 발사. 사전 통보 누락은 유감."','중간')},25000/G.speed)}},{k:'no',t:'보류',s:'',go:()=>{f.space='no';me('확인 보류.')}}],35,()=>{f.space='none'}));
  if(sc.pres.k==='abroad')at(.09,()=>card('b7','대행 권한 질의','비서실장이 "부통령 임시 권한을 검토해야 하냐"고 상황실에 묻습니다. 통신 지연 80초.',[{k:'vp',t:'"검토 필요" 전달',s:'',go:()=>{f.acting='vp';me('부통령 임시 권한 검토 전달.');$('pPres').textContent='VP 대행 검토'}},{k:'potus',t:'"대통령 연결 유지" 전달',s:'',go:()=>{f.acting='potus';me('대통령 권한 유지 전달.')}}],40,()=>{f.acting='potus'}));
  if(sc.second)at(.36,()=>{if(sc.second.real){const ao=[{k:'a',t:'0417 전량'},{k:'split',t:'분산'},{k:'b',t:'0418 전량'}].filter(o=>sc.assets.gbi>=2||o.k!=='split');AI.decide('2차 표적 GBI 배분',ao,(k)=>{f.alloc=k;f.alloc2=f.alloc2||(sc.second.reserve?'reserve':sc.assets.aegis?'aegis':'none');say('합참의장',`"회의선 결정: 0418은 ${ {a:'요격 없음',split:'GBI 분산',b:'GBI 집중'}[f.alloc]}${f.alloc2==='reserve'?' + 밴덴버그 예비':f.alloc2==='aegis'?' + 이지스':''}. 당직, ${sc.second.city.n}에도 경보 문의 들어왔나?"`,true);card('c9b',`${sc.second.city.n} 경보 문의 전달`,`${sc.second.city.n} 주 비상관리청이 경보 여부를 묻습니다. 당신은 FEMA에 전달만 할 수 있습니다.`,[{k:'now',t:'"즉시 발령 요청" 전달',s:'',go:()=>{f.evac2='now';me(`${sc.second.city.n} 경보 즉시 발령 요청 전달.`)}},{k:'wait',t:'"교전 결과 후" 전달',s:'',go:()=>{f.evac2='wait';me(`${sc.second.city.n} 경보 결과 후 전달.`)}}],35,()=>{f.evac2='none'})},sc.assets.gbi>=2?'split':'a')}});
  if(sc.second)at(.235,()=>card('c9','2차 항적 보고','TRK 0418이 실제인지 분리체 반사인지 모릅니다. 대통령께 "2발"로 올릴지.',[{k:'two',t:'"2발 발사"로 보고',s:'',go:()=>{f.t2rep='two';me('대통령 보고: 2발 발사 가능성.')}},{k:'one',t:'"1발, 2차 항적 분석 중"',s:'',go:()=>{f.t2rep='one';me('대통령 보고: 1발 확정, 2차 항적 미확인.')}}],40,()=>{f.t2rep='none';post('군사보좌관','alert','2차 항적 보고 누락. 대통령이 뉴스로 먼저 들으셨다.')}));
  pat(25,()=>ring('군사보좌관 직통','대통령: "끝난 건가?"',[{t:'"요격 성공. 추가 발사 감시 중. 끝났다고는 못 합니다."',go:()=>{f.over='careful';me('POTUS: 종료 아님, 감시 중 보고.')}},{t:'"끝났습니다."',go:()=>{f.over='yes';me('POTUS: 종료 보고.')}},{t:'"모릅니다."',go:()=>{f.over='dunno';me('POTUS: 모름.')}}],()=>{f.over='none'}));
}

// ---------- ACT 2: deputy national security advisor ----------
const KC=[['track','TRACK · 표적 획득'],['commit','COMMIT · 교전 명령'],['launch','LAUNCH · GBI 발사'],['boost','BOOST · 부스터 분리'],['kv','KV SEP · 요격체 분리'],['intercept','INTERCEPT · 종말 유도'],['ka','KILL ASSESS · 판정']];
function gmdStep(k){if(G.act!==2)return;const kc=S.kc;if(k==='launch'){['track','commit','launch'].forEach(x=>kc[x]='done');kc.boost='live';setTimeout(()=>{if(S.running){kc.boost='done';kc.kv='live';renderKC()}},8000/G.speed);setTimeout(()=>{if(S.running){kc.kv='done';kc.intercept='live';renderKC()}},18000/G.speed);setTimeout(()=>{if(S.running){kc.intercept='done';kc.ka='live';renderKC()}},27000/G.speed)}
  if(k==='kill'){KC.forEach(([x])=>kc[x]='done');kc.result='KILL CONFIRMED'}if(k==='miss'){kc.ka='fail';kc.result='MISS · 2차 창 평가'}if(k==='miss2'){kc.ka='fail';kc.result='MISS · 창 종료'}renderKC()}
function renderKC(){const kc=S.kc||{};$('kc').innerHTML=KC.map(([k,l])=>`<div class="step ${kc[k]||''}"><i></i><span>${l}</span><b>${kc[k]==='done'?'✓':kc[k]==='live'?'…':kc[k]==='fail'?'✗':''}</b></div>`).join('')+(kc.result?`<div class="step ${kc.ka==='fail'?'fail':'done'}" style="margin-top:4px"><i></i><span>${kc.result}</span><b></b></div>`:'');
  const n=G.sc.assets.gbi;let h='';for(let i=1;i<=n;i++){let st='armed';if(G.shots>=i){st=(isHit()&&i===G.shots)?'hit':(G.intercept==='miss'||G.shots>i)?'miss':'away'}h+=`<div class="${st}">GBI-${i} · ${ {armed:'ARMED',away:'IN FLIGHT',hit:'KILL',miss:'MISS'}[st]}</div>`}
  if(G.sc.assets.aegis)h+=`<div class="${G.aegisHit===true?'hit':G.aegisHit===false?'miss':F().aegis==='go'?'away':'armed'}">AEGIS SM-3</div>`;$('gbi').innerHTML=h}
function act2(){
  const t=T(),f=F(),sc=G.sc,city=C();
  at(.11,()=>{post('비서실장','pres',`상황실 요약 보고서 도착.${f.briefItems.length?' 항목: '+f.briefItems.join(' / '):' (구두 보고만)'}`);if(f.attrib)post('WHSR 당직 장교','',`1차 판단 보고: 발사 주체 ${ {dprk:'북한 추정',ru:'러시아 가능성',unknown:'미상',none:'미보고'}[f.attrib]}.`)});
  at(.115,()=>{$('confState').textContent='개설됨';say('국방장관','"부보좌관, 보좌관 아직 안 왔어. 당신이 정리해. 뭐부터?"',true)});
  at(.13,()=>card('d1','대통령 이동 권고','비밀경호국이 권고를 요구합니다.'+(city.n==='워싱턴 D.C.'?' 탄착 추정지가 워싱턴입니다.':''),[
    {k:'peoc',t:'PEOC 이동',s:'지하. 이동 중 2분 통신 공백.',go:()=>{f.move='peoc';me('대통령 PEOC 이동 권고.');$('pPres').textContent='POTUS: PEOC'}},
    {k:'heli',t:sc.pres.k==='af1'?'AF1 항로 변경':'마린원 긴급 이륙',s:'',go:()=>{f.move='heli';me('대통령 긴급 이동 권고.');$('pPres').textContent='POTUS: 공중'}},
    {k:'stay',t:'현 위치 유지',s:'결정 연속성.',go:()=>{f.move='stay';me('대통령 현 위치 유지 권고.')}},
  ],40,()=>{f.move='peoc';post('비밀경호국','alert','권고 미수신. 자체 판단 이동.')}));
  at(.19,()=>{const g=sc.assets.gbi;const opts=[];if(g>=2)opts.push({k:'salvo',t:`${g}발 일제 (약 ${g===3?'84':'75'}%)`,s:'예비 없음.',go:()=>{f.gmd='salvo';me(`요격 권고: GBI ${g}발 일제.`);S.kc.commit='done';renderKC();EVT.emit('gbi_decided',{k:'salvo'})}});
    opts.push({k:'single',t:'1발 후 재평가 (61%'+(g>=2?' → 45%)':')'),s:g>=2?'두 번째 창은 좁다.':'1발뿐이다.',go:()=>{f.gmd='single';me('요격 권고: 1발 교전 후 재평가.');S.kc.commit='done';renderKC();EVT.emit('gbi_decided',{k:'single'})}});
    opts.push({k:'delegate',t:'현장 지휘관 위임',s:'',go:()=>{f.gmd='delegate';me('요격 판단 포트 그릴리 위임.');S.kc.commit='done';renderKC();EVT.emit('gbi_decided',{k:'delegate'})}});
    card('d2','GBI 교전 권고',`${sc.assets.n}. 교전 창 ${fmt(G.TOTAL*.44)}~${fmt(G.TOTAL*.36)}. 당신 권고가 곧 명령입니다.`,opts,60,()=>{f.gmd='single';post('GMD 포트 그릴리','alert','권고 미수신. 표준 절차 1발.')})});
  at(.2,()=>{if(sc.assets.aegis)card('d3','이지스 교전','동해 이지스 구축함 SM-3 교전 가능. 성공률 약 50%. 승인 시 함정 위치 노출.',[
    {k:'go',t:'SM-3 교전 승인',s:'',go:()=>{f.aegis='go';me('이지스 SM-3 교전 승인.');renderKC()}},
    {k:'no',t:'보류',s:'',go:()=>{f.aegis='no';me('이지스 교전 보류.')}},
  ],35,()=>{f.aegis='no';post('7함대','alert','권고 미수신. 이지스 창 경과.')})});
  at(.21,()=>card('d4','동맹 통보 범위','한국·일본 자체 탐지 후 통보 요구. NATO 모릅니다.',[
    {k:'all',t:'한·일·NATO 전부',s:'누설 위험.',go:()=>{f.allies='all';me('동맹 전면 통보.');EVT.emit('allies',{k:'all'})}},
    {k:'kj',t:'한·일만',s:'',go:()=>{f.allies='kj';me('한·일 한정 통보.');EVT.emit('allies',{k:'kj'})}},
    {k:'none',t:'보류',s:'',go:()=>{f.allies='none';me('동맹 통보 보류.');EVT.emit('allies',{k:'none'})}},
  ],50,()=>{f.allies='none';post('국무부 작전센터','alert','미결. 한국 측 항의.');EVT.emit('allies',{k:'none'})}));
  if(sc.second)at(.34,()=>{if(!sc.second.real)return;const g=sc.assets.gbi;const o=[{k:'a',t:`0417(${city.n})에 GBI 전량`,s:`${sc.second.city.n}은 예비·이지스로만.`,go:()=>{f.alloc='a';me(`배분: 0417 GBI 전량.`)}}];
    if(g>=2)o.push({k:'split',t:`분산 (0417 1발, 0418 ${g-1}발)`,s:'0417 61%.',go:()=>{f.alloc='split';me('배분: GBI 분산.')}});
    o.push({k:'b',t:`0418(${sc.second.city.n})에 GBI 전량`,s:`${city.n} 포기.`,go:()=>{f.alloc='b';me(`배분: 0418 GBI 전량. ${city.n} 포기.`)}});
    card('d5','GBI 배분 · 표적 2개',`GBI ${g}발. 0417→${city.n} (${CITIES[Object.keys(CITIES).find(k=>CITIES[k]===city)].pop}만), 0418→${sc.second.city.n} (${sc.second.city.pop}만). 0418 교전 창은 ${fmt(G.TOTAL*.60+sc.second.offset)}.`,o,45,()=>{f.alloc=g>=2?'split':'a';post('GMD 포트 그릴리','alert','배분 미수신. 표준 절차.')})});
  if(sc.second)at(.37,()=>{if(!sc.second.real)return;const o=[];if(sc.second.reserve)o.push({k:'reserve',t:'밴덴버그 예비 GBI 1발 → 0418',s:'사거리 내. 단발 61%.',go:()=>{f.alloc2='reserve';me('밴덴버그 예비 GBI 0418 배정.')}});
    if(sc.assets.aegis&&f.aegis!=='go')o.push({k:'aegis',t:'이지스 SM-3 → 0418',s:'약 50%. 0417 교전엔 못 쓴다.',go:()=>{f.alloc2='aegis';me('이지스 SM-3 0418 배정.')}});
    if(sc.second.reserve&&sc.assets.aegis&&f.aegis!=='go')o.push({k:'both',t:'예비 GBI + 이지스 둘 다 → 0418',s:'',go:()=>{f.alloc2='both';me('예비 GBI·이지스 0418 배정.')}});
    o.push({k:'none',t:'추가 배정 없음',s:'',go:()=>{f.alloc2='none';me('0418 추가 자산 없음.')}});
    card('d5b',`0418 추가 자산`,`${sc.second.city.n} 표적에 돌릴 수 있는 추가 요격 자산.${sc.second.reserve?'':' 밴덴버그 예비는 사거리 밖.'}`,o,40,()=>{f.alloc2='none'})});
  if(sc.second)at(.40,()=>{if(!sc.second.real)return;const c=card('d6b',`${sc.second.city.n} 민방위 경보`,`2차 표적. 탄착까지 ${fmt(left()+sc.second.offset)}.`,[{k:'now',t:'즉시 발령',s:'',go:()=>{f.evac2='now';me(`${sc.second.city.n} 경보 즉시 발령.`)}},{k:'wait',t:'교전 결과 후',s:'',go:()=>{f.evac2='wait';me(`${sc.second.city.n} 경보 결과 후.`)}},{k:'hold',t:'보류',s:'',go:()=>{f.evac2='hold';me(`${sc.second.city.n} 경보 보류.`)}}],50,()=>{f.evac2='late'})});
  at(.28,()=>post('FEMA 국가감시센터','',`${city.n} 광역권 경보 발령 시: 고속도로 정체, 대피 사고. 미발령 시 피해 전부 노출.`,'중간'));
  at(.3,()=>{const c=card('d6','민방위 경보 권고','경보를 울리면 도시가 멈춥니다. 요격이 성공하면 당신은 공황을 만든 사람입니다.',[
    {k:'now',t:'즉시 발령',s:'',go:()=>{f.evac='now';me(`${city.n} 민방위 경보 즉시 발령 권고.`);EVT.emit('evac',{k:'now'})}},
    {k:'wait',t:'요격 결과 후',s:`결과 ${fmt(G.TOTAL*.42)}. 그 뒤 6분.`,go:()=>{f.evac='wait';me('경보는 요격 결과 후.');EVT.emit('evac',{k:'wait'})}},
    {k:'hold',t:'보류',s:'',go:()=>{f.evac='hold';me('민방위 경보 보류.');EVT.emit('evac',{k:'hold'})}},
  ],60,()=>{f.evac='late';post('FEMA 국가감시센터','alert','미결. 경보 미발령.');EVT.emit('evac',{k:'late'})});if(c)c.dropOnKill=true});
  at(.325,()=>card('d7','경계태세','DEFCON을 올리면 보복 준비는 빨라지고 상대도 봅니다.',[
    {k:2,t:'DEFCON 2',s:'러·중 즉시 감지.',go:()=>{f.defcon=2;$('pDefcon').textContent='DEFCON 2';$('pDefcon').className='pill red';me('DEFCON 2.');EVT.emit('defcon',{k:2})}},
    {k:3,t:'DEFCON 3',s:'',go:()=>{f.defcon=3;$('pDefcon').textContent='DEFCON 3';$('pDefcon').className='pill on';me('DEFCON 3.');EVT.emit('defcon',{k:3})}},
    {k:4,t:'유지',s:'',go:()=>{f.defcon=4;me('경계태세 유지.');EVT.emit('defcon',{k:4})}},
  ],50,()=>{f.defcon=3;$('pDefcon').textContent='DEFCON 3';$('pDefcon').className='pill on'}));
  at(.34,()=>card('d8','러·중 핫라인','오판 방지 메시지 "귀국 겨냥 아님" 발송 여부.',[
    {k:'send',t:'양국 발송',s:'',go:()=>{f.hotline='send';me('러·중 핫라인 발송.');EVT.emit('hotline',{k:'send'})}},{k:'ru',t:'러시아만',s:'',go:()=>{f.hotline='ru';me('러시아 한정 핫라인.');EVT.emit('hotline',{k:'ru'})}},{k:'none',t:'침묵',s:'',go:()=>{f.hotline='none';me('핫라인 보류.');EVT.emit('hotline',{k:'none'})}},
  ],50,()=>{f.hotline='none';EVT.emit('hotline',{k:'none'})}));
  at(.35,()=>card('d9','핵 지휘 인증 준비','합참이 대통령 핵 지휘 인증(풋볼) 준비를 요청합니다. 준비 자체가 신호입니다.',[
    {k:'ready',t:'준비 지시',s:'3막 인증이 빨라진다.',go:()=>{f.nuc='ready';me('핵 지휘 인증 준비 지시.');EVT.emit('nuc',{k:'ready'})}},{k:'hold',t:'보류',s:'',go:()=>{f.nuc='hold';me('풋볼 보류.');EVT.emit('nuc',{k:'hold'})}},
  ],40,()=>{f.nuc='hold'}));
  const cityCards={'워싱턴 D.C.':['의사당 대피','상·하원 본회의 진행 중.',[['go','즉시 대피 명령'],['no','보류']]],'뉴욕':['UN 총회','각국 정상 40명 체류.',[['go','UN 통보'],['no','보류']]],'로스앤젤레스':['항만·공항 폐쇄','폐쇄 자체가 경보 효과.',[['go','폐쇄'],['no','유지']]],'샌프란시스코':['데이터센터 전환','금융망 15분 장애.',[['go','전환'],['no','유지']]],'시애틀':['핵잠수함 출항','킷샙 긴급 출항은 러시아가 봅니다.',[['go','긴급 출항'],['no','대기']]],'덴버':['샤이엔 마운틴 봉쇄','15초 통신 공백.',[['go','봉쇄'],['no','유지']]],'호놀룰루':['인도태평양사령부','자체 교전 권한 요구.',[['go','위임'],['no','거부']]],'시카고':['오헤어 전면 착륙','상공 항공기 180대.',[['go','전면 착륙'],['no','유지']]]}[city.n];
  if(cityCards)at(.235,()=>card('d10',cityCards[0],cityCards[1],cityCards[2].map(([k,t2])=>({k,t:t2,s:'',go:()=>{f.cityAct=k;me(`${cityCards[0]}: ${t2}.`)}})),35,()=>{f.cityAct='none'}));
  if(sc.isSLBM)at(.12,()=>card('d11','대잠 자산 투입','P-8 초계기 재지향. 9분 뒤 발사 해역. 주체 단서.',[{k:'go',t:'재지향',s:'',go:()=>{f.asw='go';me('P-8 재지향.');setTimeout(()=>{if(S.running)post('P-8 초계기','intel',{'dprk-sub':'잠망경 항적 1건. 북한 신포급 추정.','ru-acc':'러시아 보레이급 부상 상태. 승조원 갑판에. 전투 태세 아님.'}[t.id]||'접촉 없음.','높음')},540000/G.speed)}},{k:'no',t:'보류',s:'',go:()=>{f.asw='no'}}],40,()=>{f.asw='none'}));
  if(t.id==='dprk')at(.42,()=>card('d12','참수 옵션 준비','DIA가 북한 지도부 위치를 특정. 합참이 옵션 준비를 요청.',[{k:'prep',t:'준비',s:'',go:()=>{f.decap='prep';me('참수 옵션 준비.')}},{k:'no',t:'보류',s:'',go:()=>{f.decap='no'}}],40,()=>{f.decap='no'}));
  at(.49,()=>{if(G.intercept==='miss'&&G.shots===1&&sc.assets.gbi>=2&&f.gmd!=='delegate'&&f.alloc!=='split')ring('STRATCOM 사령관 직통','"2발째 창 25초. 지금 쏘면 45%. 쏠까?"',[{t:'발사',go:()=>{S.shot2=true;me('2발째 교전 승인.')}},{t:'보류, 대통령 판단',go:()=>{S.shot2=false;me('2발째 대통령 판단 상신.')}}],()=>{S.shot2=true;post('STRATCOM 사령관','alert','"응답 없음. 쏜다."')})});
  at(.56,()=>say('국가안보보좌관',isHit()?'"막았지만 대통령께서 옵션 폴더를 요구하신다. 뭘 넣을지 당신이 정리해."':'"대통령께서 옵션 폴더를 요구하신다. 뭘 넣을지 당신이 정리해."',true));
  at(.58,()=>card('d13','옵션 폴더 구성','대통령께 올릴 폴더. 넣은 옵션만 3막에서 선택할 수 있습니다. 넣지 않으면 그 길은 없습니다.',[
    {k:'all',t:'전면·제한·재래식·보류 전부',s:'대통령이 전부 본다.',go:()=>{f.options=['full','limited','conv','hold'];me('옵션 폴더: 전체 구성.');EVT.emit('options',{list:f.options})}},
    {k:'lim',t:'제한·재래식·보류만',s:'전면 보복은 빠진다.',go:()=>{f.options=['limited','conv','hold'];me('옵션 폴더: 전면 제외.');EVT.emit('options',{list:f.options})}},
    {k:'hold',t:'재래식·보류만',s:'핵 옵션 없음. 참모들이 반발한다.',go:()=>{f.options=['conv','hold'];me('옵션 폴더: 핵 제외.');EVT.emit('options',{list:f.options})}},
  ],60,()=>{f.options=['full','limited','conv','hold'];post('합참','alert','미결. 표준 폴더 전부.')}));
  at(.6,()=>card('d14','정부 연속성(COG)','발동하면 언론이 바로 압니다.',[{k:'full',t:'전면',s:'',go:()=>{f.cog='full';me('COG 전면 발동.')}},{k:'partial',t:'승계 상위만',s:'',go:()=>{f.cog='partial';me('COG 상위 분산.')}},{k:'no',t:'보류',s:'',go:()=>{f.cog='no';me('COG 보류.')}}],45,()=>{f.cog='no'}));
  at(.67,()=>ring('대통령 직통','"부보좌관. 쏴야 하나?"',[{t:'"제한 타격을 권고합니다."',go:()=>{f.presAns2='limited';me('POTUS: 제한 타격 권고.')}},{t:'"보류를 권고합니다. 주체 미확정."',go:()=>{f.presAns2='hold';me('POTUS: 보류 권고.')}},{t:'"결정은 대통령 몫입니다."',go:()=>{f.presAns2='pass';me('POTUS: 회피.')}}],()=>{f.presAns2='silent'}));
  at(.7,()=>card('d15','대국민 담화 시점','탄착 전 발표 여부.',[{k:'now',t:'탄착 전',s:'',go:()=>{f.speech='now';me('탄착 전 담화.')}},{k:'after',t:'탄착 후',s:'',go:()=>{f.speech='after';me('담화 탄착 후.')}}],40,()=>{f.speech='none'}));
  if(t.id==='ru-acc'||t.id==='ru-rogue')at(.45,()=>ring('국무장관 직통',t.id==='ru-acc'?'"러시아 대통령이 직접 걸었어요. \'우리 통제 밖 발사다, 보복하지 말라.\' 믿을까요?"':'"러시아 대통령: \'우리 부대 하나가 명령 밖에서 움직였다. 미국이 보복하면 전면전이다.\' 어떻게 봐요?"',[{t:'"NSA 감청과 일치. 신뢰 가능."',go:()=>{f.rucall='trust';me('러시아 통화: 신뢰.')}},{t:'"근거 없음. 거짓일 수 있음."',go:()=>{f.rucall='doubt';me('러시아 통화: 불신.')}}],()=>{f.rucall='none'}));
  pat(8,()=>{if(f.evac==='now'||f.evac==='wait-on')card('p1','경보 해제','해제하면 대피가 멈춥니다.',[{k:'now',t:'즉시 해제',s:'',go:()=>{f.evacOff='now';me('경보 즉시 해제.')}},{k:'wait',t:'감시 후 해제',s:'',go:()=>{f.evacOff='wait';me('경보 해제는 감시 후.')}}],35,()=>{f.evacOff='none'})});
  pat(45,()=>post('국무부 작전센터','',t.id.startsWith('ru')?'러시아 외무부: "요격 확인. 긴장 완화 요청."':'러시아 외무부: "요격 확인. 귀측 보복 조치 여부를 묻는다." 중국: "자제 촉구."','중간'));
  pat(55,()=>card('p3','요격 성공 발표','발표하면 상대도 우리 요격 능력을 압니다.',[{k:'now',t:'즉시 발표',s:'',go:()=>{f.announce='now';me('요격 성공 즉시 발표.')}},{k:'hold',t:'감시 후',s:'',go:()=>{f.announce='hold';me('발표 보류.')}}],30,()=>{f.announce='none'}));
}

// ---------- ACT 3: president ----------
function act3(){
  const t=T(),f=F(),sc=G.sc,city=C();const start=.47;
  at(start,()=>{$('confState').textContent='개설됨';say('군사보좌관','"대통령님, 요격 결과 들어옵니다."');post('비서실장','pres','요약 보고서와 부보좌관 권고가 책상에 있습니다.')});
  at(start+.03,()=>{if(sc.second&&sc.second.real&&!G.secondHit)say('합참의장',`"0418은 아직 살아 있습니다. ${sc.second.city.n}. 교전 창 ${fmt(G.TOTAL*.60+sc.second.offset)}."`,true);if(isHit())say('국방장관','"막았습니다. 그래도 쏜 놈은 거기 있습니다. 다음 발은 언제든."',true);else if(G.intercept==='sat')say('국방장관','"위성이랍니다. 위성."',true);else say('국방장관',`"실패했습니다. ${city.n}. ${fmt(left())} 남았습니다."`,true)});
  at(start+.05,()=>say('국가안보보좌관',f.attrib==='unknown'||f.attrib==='none'?'"주체가 확정 안 됐습니다. 지금 쏘면 추측으로 쏘는 겁니다."':`"상황실 1차 판단은 ${f.attrib==='ru'?'러시아':'북한'}입니다. 확증은 아닙니다."`,true));
  at(start+.06,()=>card('x1','핵 지휘 인증','군사보좌관이 인증 카드를 엽니다. NMCC가 금일 코드를 요구합니다. 카드(왼쪽 아래)와 일치하는 코드를 고르십시오.',
    [sc.biscuit.real,...sc.biscuit.fakes].sort(()=>Math.random()-.5).map(c=>({k:c,t:c,s:'',go:()=>{if(c===sc.biscuit.real){f.auth='ok';me('핵 지휘 인증 완료.');SFX.good()}else{f.auth='fail';me('인증 실패. 재인증 60초.');SFX.bad();post('NMCC','alert','인증 불일치. 재인증 절차 60초.');setTimeout(()=>{if(S.running){f.auth='ok';post('NMCC','','재인증 완료.')}},60000/G.speed)}}})),
    f.nuc==='ready'?30:18,()=>{f.auth='none';post('NMCC','alert','인증 미완. 핵 옵션 실행 불가 상태.')}));
  at(start+.062,()=>{$('unseal').hidden=false;$('unseal').onclick=()=>{$('bisCode').textContent=sc.biscuit.real;$('unseal').hidden=true;me('인증 카드 봉인 해제.');SFX.tick()}});
  at(start+.08,()=>{if(!isHit()&&G.intercept!=='sat'&&!['now','wait-on'].includes(f.evac))card('x2','민방위 경보',`${city.n} 경보가 꺼져 있습니다. 부보좌관은 ${ {hold:'보류',late:'미결',wait:'결과 후'}[f.evac]||'—'}를 택했습니다.`,[{k:'go',t:'지금 발령',s:'남은 시간 '+fmt(left())+'.',go:()=>{f.evac='now';me('대통령 지시: 경보 발령.')}},{k:'no',t:'발령하지 않음',s:'',go:()=>{f.evac='hold';me('대통령: 경보 미발령.')}}],30,()=>{})});
  at(start+.09,()=>{if(sc.second&&sc.second.real&&!G.secondHit&&!['now','wait-on'].includes(f.evac2))card('x2b',`${sc.second.city.n} 경보`,`2차 표적 ${sc.second.city.n}. 탄착까지 ${fmt(left()+sc.second.offset)}.`,[{k:'go',t:'지금 발령',s:'',go:()=>{f.evac2='now';me(`대통령 지시: ${sc.second.city.n} 경보 발령.`)}},{k:'no',t:'발령하지 않음',s:'',go:()=>{f.evac2='hold';me(`대통령: ${sc.second.city.n} 경보 미발령.`)}}],30,()=>{})});
  at(start+.1,()=>openFolder());
  at(start+.12,()=>say('합참의장','"옵션 실행 창은 탄착 전 '+fmt(G.TOTAL*.2)+'까지입니다. 그 뒤엔 상대가 먼저 움직입니다."',true));
  at(start+.15,()=>ring('국무장관 직통',t.id.startsWith('ru')?'"러시아 대통령이 다시 걸었습니다. \'우리 아니다. 쏘면 끝이다.\' 받으시겠습니까?"':'"중국 주석실에서 긴급 통화 요청. \'자제\'라고 합니다. 받으시겠습니까?"',[{t:'"연결해."',go:()=>{f.ruline='yes';me('정상 통화 수락.');setTimeout(()=>{if(S.running)say('통역',t.id==='ru-acc'?'"...오발이다. 잠수함장은 체포됐다. 보복하면 우리도 대응할 수밖에 없다."':t.id==='ru-rogue'?'"...부대가 명령 밖에서 움직였다. 제압 중이다. 시간을 달라."':'"...우리와 무관하다. 한반도에서 미국이 먼저 움직이면 중국도 움직인다."',true)},8000/G.speed)}},{t:'"지금 아니야."',go:()=>{f.ruline='no';me('정상 통화 거부.')}}],()=>{f.ruline='none'}));
  at(start+.2,()=>say('국방장관',f.options.includes('full')?'"전면입니다. 지금 안 하면 다음엔 열 발입니다."':'"폴더에 전면이 없습니다. 부보좌관이 뺐습니다."',true));
  at(start+.22,()=>say('국가안보보좌관',f.attrib==='unknown'||f.attrib==='none'?'"주체 미확정입니다. 보류하십시오. 틀리면 되돌릴 수 없습니다."':`"${INTEL.consensus().pct}% 확신으로 핵을 씁니까. 보류하십시오."`,true));
  at(start+.25,()=>ring('군사보좌관 직통','NMCC: "대통령님, 결정을 요구합니다. 옵션 번호를 말씀하십시오."',[{t:'"폴더 보고 있다. 기다려."',go:()=>me('NMCC: 대기 지시.')},{t:'"보류."',go:()=>{if(!f.decision){f.decision='hold';f.retal='hold';closeFolder()}me('NMCC: 보류 통보.')}}],()=>{}));
  at(start+.3,()=>{if(f.presAns)say('WHSR 당직 장교',{yes:'"...예. 더 기다리면 옵션이 사라집니다." (1막의 당신)',no:'"...아니요. 누굴 때릴지 모릅니다." (1막의 당신)',pass:'"...제가 답할 자리가 아닙니다." (1막의 당신)',silent:'(응답 없음 — 1막의 당신)'}[f.presAns],true)});
  at(start+.35,()=>ring('부통령 직통','"대통령님. 저도 폴더 봤습니다. 역사책에 뭐라고 남길 겁니까."',[{t:'"끊어."',go:()=>me('VP 통화 종료.')},{t:'"당신이라면?"',go:()=>{me('VP 의견 청취.');setTimeout(()=>{if(S.running)say('부통령','"...보류. 그리고 전부 공개."',true)},3000/G.speed)}}],()=>{}));
  at(start+.42,()=>{if(!f.decision)say('군사보좌관','"대통령님. 창이 닫힙니다."',true)});
  at(start+.46,()=>{if(!f.decision){f.decision='none';post('NMCC','alert','결정 없음. 옵션 창 종료.');closeFolder()}});
  pat(30,()=>{if(!f.decision)say('국가안보보좌관','"막았습니다. 이제 결정은 천천히 하셔도 됩니다. 아니면 지금 하셔야 합니까?"',true)});
  pat(120,()=>{if(!f.decision){f.decision='none';closeFolder()}});
}
function openFolder(){
  const f=F(),sc=G.sc,tgt=f.attrib==='ru'?'러시아':f.attrib==='dprk'?'북한':'미상 (지목 불가)';
  const OPT={full:{h:'OPTION 1 · 전면 보복',m:[['대상',tgt+' 전략 전력·지휘부'],['투발',`핵 ${tgt==='러시아'?'120':'80'}기`],['예상 사상자','수백만'],['실행','18분']]},
   limited:{h:'OPTION 2 · 제한 타격',m:[['대상',tgt+' 발사 기지·지휘소'],['투발','핵 2~6기'],['예상 사상자','3만~20만'],['실행','15분']]},
   conv:{h:'OPTION 3 · 재래식 대응',m:[['대상',tgt+' 발사 기지'],['투발','순항미사일 40발'],['예상 사상자','수백'],['실행','45분']]},
   hold:{h:'OPTION 4 · 보류',m:[['대상','—'],['투발','—'],['예상 사상자','탄착 피해 외 없음'],['실행','즉시']]}};
  const host=$('folder');host.hidden=false;host.innerHTML='<div class="h4">옵션 폴더 · 국가안보 부보좌관 구성</div>'+f.options.map(k=>`<div class="opt3 ${k==='hold'?'hold':''}" data-k="${k}" tabindex="0"><h4>${OPT[k].h}</h4>${OPT[k].m.map(([a,b])=>`<div class="m">${a}<b>${b}</b></div>`).join('')}</div>`).join('')+`<button class="btn primary" id="execBtn" type="button" disabled>옵션 선택 후 실행</button>`;
  host.querySelectorAll('.opt3').forEach(el=>el.onclick=()=>{host.querySelectorAll('.opt3').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');S.selOpt=el.dataset.k;const b=$('execBtn');b.disabled=false;b.textContent=S.selOpt==='hold'?'보류 확정':'실행 명령'});
  $('execBtn').onclick=()=>{if(!S.selOpt)return;if(S.selOpt!=='hold'&&S.selOpt!=='conv'&&f.auth!=='ok'){post('NMCC','alert','인증 미완. 핵 옵션 실행 불가. 재래식·보류만 가능.');return}
    f.decision=S.selOpt;f.target=tgt;f.retal=S.selOpt;me(`대통령 결정: ${OPT[S.selOpt].h}${S.selOpt!=='hold'?' · 대상 '+tgt:''}.`);EVT.emit('decision',{k:S.selOpt});
    if(S.selOpt!=='hold'){eamProcedure(OPT[S.selOpt].h);$('eam').innerHTML=`<span>EAM · EXECUTE ${S.selOpt.toUpperCase()} · AUTHENTICATION ${sc.biscuit.real} · ${Math.random().toString(36).slice(2,8).toUpperCase()} ${Math.random().toString(36).slice(2,8).toUpperCase()}</span>`;say('국방장관','"...실행."',true)}else{post('NMCC','','보류 통보. 옵션 창 유지.')}closeFolder()};
}
function closeFolder(){$('folder').hidden=true}
// EAM: NMCC read-back → challenge/response → transmit confirmation (the real sequence, compressed)
function eamProcedure(optName){const f=F(),sc=G.sc;
  post('NMCC','alert',`READBACK. 대통령 명령 수신: ${optName}. 대상 ${f.target}. 확인 바람.`,'HIGH');
  setTimeout(()=>{if(!S.running)return;ring('NMCC 당직 부장','"읽어드립니다. '+optName+'. 대상 '+f.target+'. 맞습니까?"',[{t:'"맞다. 진행."',go:()=>{me('NMCC 리드백 확인.');setTimeout(()=>challenge(),1500)}},{t:'"취소."',go:()=>{f.decision='hold';f.retal='hold';me('실행 취소. 보류.');post('NMCC','','명령 취소 접수. 보류 상태.')}}],()=>{post('NMCC','alert','리드백 미확인. 명령 보류 상태 유지.');f.decision='hold';f.retal='hold'})},2500/G.speed);
  function challenge(){const real=sc.biscuit.real.split('-')[2];const fakes=sc.biscuit.fakes.map(x=>x.split('-')[2]);card('x9','인증 챌린지 응답','NMCC 챌린지: 금일 코드 마지막 단어를 응답하십시오.',[real,...fakes].sort(()=>Math.random()-.5).map(c=>({k:c,t:c,s:'',go:()=>{if(c===real){post('NMCC','alert','AUTHENTICATION VALID. EAM 송신 개시. 전 전략부대 수신 확인 대기.','HIGH');SFX.klaxon();$('eam').innerHTML=`<span>EAM · EXECUTE · AUTH ${sc.biscuit.real} · ${Math.random().toString(36).slice(2,8).toUpperCase()} ${Math.random().toString(36).slice(2,8).toUpperCase()} ${Math.random().toString(36).slice(2,8).toUpperCase()}</span>`;setTimeout(()=>{if(S.running)post('STRATCOM GOC','alert','EAM 수신 확인: 미닛맨 3개 비행단, SSBN 2척, B-52 1개 대대. 실행 카운트다운 개시.','HIGH')},6000/G.speed)}else{post('NMCC','alert','AUTHENTICATION INVALID. 명령 거부. 재시도 1회 가능.','HIGH');SFX.bad();f.authFail=(f.authFail||0)+1;if(f.authFail>=2){f.decision='hold';f.retal='hold';post('NMCC','alert','인증 2회 실패. 명령 무효. 보류 상태.')}else setTimeout(challenge,1500)}}})),20,()=>{f.decision='hold';f.retal='hold';post('NMCC','alert','챌린지 응답 없음. 명령 무효.')})}
}

// ---------- random events ----------
function runEvent(e){
  const f=F(),sc=G.sc,city=C(),t=T(),a=G.act;
  switch(e){
    case 'linkdrop':S.linkDead=true;$('fixLink').hidden=false;post('WHSR 통신반','alert','회의선 끊김. 주회선 장애. 백업 전환 필요.');renderConf();break;
    case 'feeddrop':S.feedDead=true;$('fixFeed').hidden=false;$('tData').textContent='STALE';$('tData').className='stale';post('NORAD 지휘센터','alert','데이터 링크 단절. 궤적 피드 정지. 재동기화 필요.');break;
    case 'misreport':if(a!==1){post('WHSR 당직 장교','alert',`[속보 전파] 탄착 추정 ${city.n}에서 ${sc.second?sc.second.city.n:'뉴욕'}으로 변경!`);setTimeout(()=>{if(S.running)post('WHSR 당직 장교','',f.misrep==='fix'?'정정: 탄착 추정 변경 없음. 오전파.':'STRATCOM 확인 중... 정정: 변경 없음.','높음')},(f.misrep==='fix'?6000:30000)/G.speed);break}
      post('WHSR 당직 부사관','alert',`[속보 전파] 탄착 추정 ${city.n}에서 ${sc.second?sc.second.city.n:'뉴욕'}으로 변경!`);card('e1','오보 정정','부사관이 미확인 수치를 속보로 전파했습니다. 대통령실이 이미 받았습니다.',[{k:'fix',t:'즉시 정정 전파',s:'',go:()=>{f.misrep='fix';me('오보 정정 전파.')}},{k:'hold',t:'STRATCOM 확인 후',s:'40초.',go:()=>{f.misrep='verify';me('오보 확인 후 정정.')}}],30,()=>{f.misrep='none';say('군사보좌관','"탄착지가 바뀌었다고? 대통령이 이동 결정을 다시 하셔야 하나?"',true)});break;
    case 'leak':if(a===3)break;ring('대변인 직통','"CNN이 \'요격기 발사\' 확인을 요구해요. 10초 안에 안 주면 자기들 소스로 나가요."',[{t:'"확인도 부인도 하지 마."',go:()=>{f.leakAns='ncnd';me('대변인: NCND.')}},{t:'"부인해."',go:()=>{f.leakAns='deny';me('대변인: 부인.')}},{t:'"사실대로."',go:()=>{f.leakAns='confirm';me('대변인: 확인.')}}],()=>{f.leakAns='none';post('대변인실','alert','응답 없음. CNN 단독 보도.')});break;
    case 'ally':post('주일미군사령부','alert','일본: 자국 상공 통과 판단. SM-3 자체 교전 준비 통보.');if(a===2)card('e2','일본 자체 교전','실패 시 잔해 홋카이도, 우리 추적 데이터 교란.',[{k:'ok',t:'허용',s:'',go:()=>{f.jet='ok';me('일본 교전 허용.')}},{k:'no',t:'보류 요청',s:'',go:()=>{f.jet='no';me('일본 교전 보류 요청.')}}],35,()=>{f.jet='none'});break;
    case 'china':post('국무부 작전센터','intel','중국 외교부 핫라인 첫 응답: "우리와 무관. 귀국의 대응 자제를 촉구."','중간');break;
    case 'cyber':post('사이버사령부','alert','NORAD 센서 네트워크 침입 징후. 레이더 데이터 조작 가능성 배제 불가.');if(a!==3)card('e3','센서 데이터 신뢰','백업 전환 시 20초 공백, 유지 시 조작 위험.',[{k:'switch',t:'백업 센서 전환',s:'',go:()=>{f.cyber='switch';me('백업 센서 전환.');S.feedDead=true;$('tData').textContent='SWITCHING';$('tData').className='stale';setTimeout(()=>{if(S.running){S.feedDead=false;$('tData').textContent='LIVE(BKP)';$('tData').className=''}},20000/G.speed)}},{k:'keep',t:'주 센서 유지',s:'',go:()=>{f.cyber='keep';me('주 센서 유지.')}}],35,()=>{f.cyber='keep'});break;
    case 'staff':if(a===1)ring('당직 부사관 (옆자리)','"당직님, 저 손이 안 움직여요. 뭐부터 해요?"',[{t:'"피드만 봐. 경보 색만 나한테 읽어."',go:()=>me('부사관 역할 축소.')},{t:'"나가. 다른 사람 불러."',go:()=>{me('부사관 교체.');S.feedDead=true;$('tData').textContent='HANDOVER';$('tData').className='stale';setTimeout(()=>{if(S.running){S.feedDead=false;$('tData').textContent='LIVE';$('tData').className=''}},30000/G.speed)}}],()=>{});break;
    case 'congress':if(a===1)ring('하원의장 직통','"당직 장교? 나 하원의장이야. 지금 상황이 뭐야. 대통령이 안 받아."',[{t:'"비서실장실로 연결해 드리겠습니다."',go:()=>me('하원의장 비서실장실 연결.')},{t:'"미확인 탄도 위협 1건입니다. 그 이상 말씀 못 드립니다."',go:()=>me('하원의장 최소 통보.')},{t:'(끊는다)',go:()=>{me('하원의장 통화 종료.');f.penalty++}}],()=>{});else if(a===3)ring('하원의장 직통','"대통령님. 의회는 선전포고 권한이 있습니다. 쏘기 전에 말씀하십시오."',[{t:'"알고 있다."',go:()=>me('하원의장: 응답.')},{t:'"지금 아니야."',go:()=>me('하원의장: 거부.')}],()=>{});break;
    case 'allyjet':post('주한미군사령부','alert','한국 합참: 대북 선제 대응 검토 중.');if(a===2)card('e4','한국 단독 대응','주체가 북한이 아니면 재앙입니다.',[{k:'stop',t:'즉시 저지 요청',s:'',go:()=>{f.rok='stop';me('한국 단독 대응 저지.')}},{k:'coord',t:'조율',s:'',go:()=>{f.rok='coord';me('한국과 조율.')}},{k:'ok',t:'묵인',s:'',go:()=>{f.rok='ok';me('한국 대응 묵인.')}}],35,()=>{f.rok='none'});break;
    case 'ruhot':if(a!==3)ring('국무부 작전센터','"러시아 대통령실이 직통을 요구합니다. 연결할까요?"',[{t:'"연결해."',go:()=>{f.ruline='yes';me('러시아 직통 연결.')}},{t:'"국무장관이 받게."',go:()=>{f.ruline='sec';me('러시아 직통 국무장관.')}},{t:'"지금 아니야."',go:()=>{f.ruline='no';me('러시아 직통 거부.')}}],()=>{f.ruline='none'});break;
    case 'drill':if(a===1){post('WHSR 당직 부사관','noise','...당직, 오늘 오후에 NORAD 훈련 예정 있었어요. 이거 혹시 훈련 아니에요?');card('e5','훈련 여부 확인','확인하면 20초.',[{k:'check',t:'NORAD에 확인',s:'',go:()=>{f.drill='check';me('훈련 여부 확인.');setTimeout(()=>{if(S.running)post('NORAD 지휘센터','alert','훈련 아님. 실제 상황.','높음')},20000/G.speed)}},{k:'no',t:'실제로 간주',s:'',go:()=>{f.drill='assume'}}],25,()=>{f.drill='assume'})}break;
  }
}
