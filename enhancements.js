'use strict';

/* Texas Housing OS collaboration + advanced-guides + WebLLM enhancement layer.
   This file intentionally contains no credentials and never auto-shares private household records. */

const ENHANCED_VERSION = '2.0.0';
const TRYSTERO_VERSION = '0.25.3';
const WEBLLM_VERSION = '0.2.85';
const COLLAB_APP_ID = 'org.planetaryrestorationarchive.texas-housing-os.v2';
const DEFAULT_PUBLIC_ROOM = 'texas-housing-commons-public-v1';
const STRATEGY_URLS = {
  nostr: `https://cdn.jsdelivr.net/npm/@trystero-p2p/nostr@${TRYSTERO_VERSION}/+esm`,
  mqtt: `https://cdn.jsdelivr.net/npm/@trystero-p2p/mqtt@${TRYSTERO_VERSION}/+esm`,
  torrent: `https://cdn.jsdelivr.net/npm/@trystero-p2p/torrent@${TRYSTERO_VERSION}/+esm`,
  ipfs: `https://cdn.jsdelivr.net/npm/@trystero-p2p/ipfs@${TRYSTERO_VERSION}/+esm`
};

const ROLE_OPTIONS = [
  'Household / family','Renter','Homeowner','Student','Senior / caregiver','Community organization','Housing counselor',
  'Nonprofit','Builder / contractor','Developer','Landlord / property operator','Municipal planner','County staff',
  'Water / wastewater utility','Energy / grid','Mobility / transit','Broadband / connectivity','Emergency management',
  'Public health','Education / workforce','Research / university','Finance / lender','Insurance / resilience','Other'
];
const WORKSTREAMS = ['Housing','Land','Zoning','Permitting','Infrastructure','Water','Energy','Mobility','Broadband','Disaster resilience','Public health','Education','Workforce','Finance','Insurance','Accessibility','Homelessness prevention','Evidence'];
const RECORD_TYPES = ['project','task','decision','comment'];

// Extend app registries after the core script has loaded.
if (!ROUTES.some(r => r.id === 'collaboration')) {
  GROUPS.Collaboration = 'Collaboration & AI';
  ROUTES.push(
    {id:'collaboration',title:'Multiplayer Commons',icon:'◎',group:'Collaboration'},
    {id:'guides',title:'Simplified Advanced Guides',icon:'▤',group:'Collaboration'},
    {id:'ai-lab',title:'Local AI Planning Lab',icon:'✦',group:'Collaboration'}
  );
}
CONTENT.collaboration = {tag:'Peer-to-peer coordination',intro:'Coordinate projects, tasks, decisions and comments over direct WebRTC while keeping private household records local.',actions:['Join the public commons or a named room','Choose a decentralized discovery strategy','Share only explicit collaboration records','Resolve detected record conflicts'],risks:['Peer IDs are transport identifiers, not verified human or organizational identities.','Direct WebRTC can fail behind some NAT/firewall configurations; TURN may be required.']};
CONTENT.guides = {tag:'Progressive technical learning',intro:'Each guide moves from a one-minute explanation to actions, advanced concepts and implementation detail.',actions:['Start with the one-minute layer','Apply the checklist','Open advanced detail only as needed','Verify source dates and local applicability'],risks:['Technical examples describe architecture; they do not replace local legal, engineering or procurement review.']};
CONTENT['ai-lab'] = {tag:'Private browser-local assistance',intro:'Use WebLLM in a dedicated worker when WebGPU and model downloads are available, with a deterministic non-AI fallback when they are not.',actions:['Check WebGPU','Load a small local model','Generate planning assistance','Keep evidence and assumptions visible'],risks:['Model output can be wrong; verify factual claims and do not treat generated text as professional advice.']};

if (!SOURCES.some(s => s.title.includes('QuickFacts — Texas'))) {
  SOURCES.unshift({grade:'A',title:'U.S. Census Bureau QuickFacts — Texas',publisher:'U.S. Census Bureau',period:'Population 2025; housing/income 2020–2024; permits 2024',geo:'Texas',url:'https://www.census.gov/quickfacts/fact/table/TX/COM100222',note:'Statewide baseline: population 31,709,821 (July 1, 2025 estimate); 12,848,245 housing units (2025 estimate); median gross rent $1,403; median owner-occupied value $283,800; median household income $78,476; 91.4% of households had broadband subscriptions; 225,756 building permits in 2024. Source years differ and must remain labeled.',retrieved:RETRIEVED});
  SOURCES.push({grade:'A',title:'Texas Broadband Development Office — BEAD Program',publisher:'Texas Comptroller Broadband Development Office',period:'Final Proposal approved 2025-12-04; implementation status retrieved 2026-09-28',geo:'Texas',url:'https://comptroller.texas.gov/programs/broadband/funding/bead/',note:'Texas reports 22 selected applicants, more than 240,000 broadband-serviceable locations, more than 2,700 community anchor institutions, $1.2B federal awards and $177M state match; the state said projects could begin construction as soon as summer 2026.',retrieved:RETRIEVED});
  SOURCES.push({grade:'A',title:'Texas Broadband Development Office — BOOT Program',publisher:'Texas Comptroller Broadband Development Office',period:'Current program status retrieved 2026-09-28',geo:'Texas',url:'https://comptroller.texas.gov/programs/broadband/funding/boot/',note:'BOOT I reports $10.4M awarded for 1,468 residential locations, 77 businesses and 15 community anchor institutions. BOOT II reports $623.4M awarded for 61,185 residential locations, 18,250 businesses and 2,191 community anchor institutions; official awardee files contain current project status.',retrieved:RETRIEVED});
}

// CSS enhancement layer.
const style = document.createElement('style');
style.textContent = `
.splashbox{width:min(760px,94vw)}.splash-stages{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin:1rem 0}.splash-stage{border:1px solid #214764;border-radius:12px;padding:.6rem;color:#9fc0d4;background:rgba(4,16,28,.5)}.splash-stage.active{border-color:#5bd6c6;color:#edf7ff;box-shadow:0 0 0 2px rgba(91,214,198,.12)}.splash-stage.done{color:#7fe09c}.loading span{animation:none!important;transition:width .5s ease}.splash-skip{display:inline-flex;gap:.45rem;align-items:center;margin-top:.75rem;color:#9fc0d4}.collab-layout{display:grid;grid-template-columns:minmax(270px,.8fr) minmax(0,2fr);gap:1rem}.peer-list,.record-list{display:grid;gap:.55rem}.peer,.shared-record{border:1px solid var(--line);border-radius:14px;padding:.75rem;background:var(--panel2)}.peer strong,.shared-record strong{display:block}.presence-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--good);margin-right:.4rem}.record-meta{display:flex;flex-wrap:wrap;gap:.35rem;margin:.45rem 0}.collab-status{display:flex;align-items:center;gap:.45rem}.status-pill{border:1px solid var(--line);border-radius:999px;padding:.22rem .52rem;font-size:.8rem}.status-pill.good{border-color:var(--good);color:var(--good)}.status-pill.warn{border-color:var(--accent2);color:var(--accent2)}.status-pill.bad{border-color:var(--danger);color:var(--danger)}.guide-level{margin:.55rem 0}.guide-level>summary{display:flex;gap:.5rem;align-items:center}.guide-num{display:inline-grid;place-items:center;width:1.6rem;height:1.6rem;border:1px solid var(--line);border-radius:50%;font-size:.78rem}.cross-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}.cross-card{padding:.75rem;border:1px solid var(--line);border-radius:14px;background:var(--panel2)}.ai-output{white-space:pre-wrap;min-height:140px}.live-log{max-height:220px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.82rem;background:var(--bg);padding:.7rem;border-radius:12px;border:1px solid var(--line)}.conflict{border-left:4px solid var(--danger)}.tiny{font-size:.78rem;color:var(--muted)}
@media(max-width:900px){.collab-layout,.cross-grid{grid-template-columns:1fr}.splash-stages{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

// Progressive splash. It never forces a delay: Enter workspace is active immediately.
(function enhanceSplash(){
  const box = document.querySelector('.splashbox');
  const splash = document.getElementById('splash');
  if (!box || !splash) return;
  const loading = box.querySelector('.loading span');
  if (loading) loading.id = 'splashProgress';
  const stages = document.createElement('div');
  stages.className='splash-stages';
  stages.innerHTML='<div class="splash-stage active" id="sp1"><strong>1. Connectivity</strong><br><small>Local + P2P capability</small></div><div class="splash-stage" id="sp2"><strong>2. Evidence</strong><br><small>Dated source spine</small></div><div class="splash-stage" id="sp3"><strong>3. Collaboration</strong><br><small>Shared-room readiness</small></div>';
  box.querySelector('.loading').before(stages);
  const skip = document.createElement('label');
  skip.className='splash-skip';
  skip.innerHTML='<input type="checkbox" id="skipSplash"> Skip this splash next time';
  box.querySelector('.notice').before(skip);
  document.getElementById('skipSplash').checked=localStorage.getItem('txh.skipSplash')==='1';
  document.getElementById('skipSplash').onchange=e=>localStorage.setItem('txh.skipSplash',e.target.checked?'1':'0');
  if(localStorage.getItem('txh.skipSplash')==='1') splash.classList.add('hide');
  const steps=[[20,'sp1'],[58,'sp2'],[100,'sp3']];
  steps.forEach(([p,id],i)=>setTimeout(()=>{
    const bar=document.getElementById('splashProgress'); if(bar) bar.style.width=p+'%';
    document.querySelectorAll('.splash-stage').forEach((el,j)=>{el.classList.toggle('active',j===i); if(j<i)el.classList.add('done')});
    if(i===steps.length-1){document.querySelectorAll('.splash-stage').forEach(el=>el.classList.add('done'));}
  },250+i*700));
})();

// State helpers
const Collab = {
  sessionId: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+Math.random()).slice(0,18),
  peerId: 'local-'+Math.random().toString(36).slice(2,10),
  room:null, channel:null, actions:null, roomId:localStorage.getItem('txh.collab.room')||DEFAULT_PUBLIC_ROOM,
  strategy:localStorage.getItem('txh.collab.strategy')||'nostr', password:'',
  displayName:localStorage.getItem('txh.collab.name')||'Texas collaborator',
  role:localStorage.getItem('txh.collab.role')||'Community organization', peers:new Map(), log:[], connected:false,
  turn:null
};
const AiState={engine:null,model:null,loading:false};

function logCollab(msg){
  Collab.log.unshift(`${new Date().toLocaleTimeString()} — ${msg}`); Collab.log=Collab.log.slice(0,50);
  const el=document.getElementById('collabLog'); if(el) el.innerHTML=Collab.log.map(x=>`<div>${esc(x)}</div>`).join('');
}
function localPresence(){return {peerId:Collab.peerId,name:Collab.displayName,role:Collab.role,sessionId:Collab.sessionId,at:Date.now(),verified:false};}
function hashTextSync(obj){let h=2166136261;const s=JSON.stringify(obj);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
async function dbGet(store,id){const db=await DB.open();return new Promise((res,rej)=>{const r=db.transaction(store).objectStore(store).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function dbDelete(store,id){const db=await DB.open();return new Promise((res,rej)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}

async function getSharedSnapshot(){
  const records=(await DB.all('shared')).slice(-250);
  return {schema:'txhos-collab-snapshot/2',roomId:Collab.roomId,generatedAt:new Date().toISOString(),records};
}
async function saveConflict(local,remote,origin){
  const c={id:'conflict-'+crypto.randomUUID(),recordId:remote.id,local,remote,origin,detectedAt:new Date().toISOString()};
  await DB.put('conflicts',c);logCollab(`Conflict detected for ${remote.title||remote.id}`);renderCollabRecords();
}
async function mergeRemoteRecord(remote,origin='peer'){
  if(!remote||typeof remote!=='object'||typeof remote.id!=='string'||!RECORD_TYPES.includes(remote.kind))return;
  const local=await dbGet('shared',remote.id);
  if(!local){await DB.put('shared',remote);return renderCollabRecords();}
  const same=hashTextSync({...local,receivedAt:undefined})===hashTextSync({...remote,receivedAt:undefined});
  if(same)return;
  const lr=Number(local.revision||0), rr=Number(remote.revision||0), rb=Number(remote.baseRevision||0);
  if(rr>lr && rb>=lr){await DB.put('shared',remote);return renderCollabRecords();}
  if(rr<lr)return;
  if(rr===lr || rb<lr){await saveConflict(local,remote,origin);return;}
}
async function broadcastEnvelope(type,payload){
  const env={schema:'txhos-peer-envelope/2',type,payload,from:Collab.sessionId,at:Date.now()};
  if(Collab.channel) Collab.channel.postMessage(env);
  if(Collab.actions){
    try{
      if(type==='record') await Collab.actions.record.send(payload);
      if(type==='presence') await Collab.actions.presence.send(payload);
    }catch(e){logCollab(`P2P send degraded: ${e.message||e}`)}
  }
}
function openLocalChannel(roomId){
  if(Collab.channel)Collab.channel.close();
  if(!('BroadcastChannel'in window)){logCollab('BroadcastChannel unavailable in this browser.');return;}
  Collab.channel=new BroadcastChannel('txhos-room:'+roomId);
  Collab.channel.onmessage=async e=>{
    const m=e.data;if(!m||m.from===Collab.sessionId||m.schema!=='txhos-peer-envelope/2')return;
    if(m.type==='presence'){Collab.peers.set(m.payload.sessionId,m.payload);renderPeerList();}
    if(m.type==='record')await mergeRemoteRecord(m.payload,'same-device');
    if(m.type==='snapshot-request')Collab.channel.postMessage({schema:'txhos-peer-envelope/2',type:'snapshot-response',payload:await getSharedSnapshot(),from:Collab.sessionId,at:Date.now(),target:m.from});
    if(m.type==='snapshot-response'&&(!m.target||m.target===Collab.sessionId)){for(const r of m.payload?.records||[])await mergeRemoteRecord(r,'same-device snapshot')}
  };
  Collab.channel.postMessage({schema:'txhos-peer-envelope/2',type:'presence',payload:localPresence(),from:Collab.sessionId,at:Date.now()});
  Collab.channel.postMessage({schema:'txhos-peer-envelope/2',type:'snapshot-request',payload:{roomId},from:Collab.sessionId,at:Date.now()});
  logCollab('Same-device BroadcastChannel ready.');
}

async function leavePeerRoom(){
  try{Collab.room?.leave?.()}catch{}
  Collab.room=null;Collab.actions=null;Collab.connected=false;Collab.peers.clear();renderPeerList();updateCollabStatus();
}
async function joinPeerRoom(opts={}){
  const roomInput=document.getElementById('roomId');
  const strategyInput=document.getElementById('strategySelect');
  const passInput=document.getElementById('roomPassword');
  if(roomInput)Collab.roomId=(roomInput.value||DEFAULT_PUBLIC_ROOM).trim().slice(0,120);
  if(strategyInput)Collab.strategy=strategyInput.value;
  if(passInput)Collab.password=passInput.value;
  localStorage.setItem('txh.collab.room',Collab.roomId);localStorage.setItem('txh.collab.strategy',Collab.strategy);
  openLocalChannel(Collab.roomId);
  await leavePeerRoom();
  if(!navigator.onLine){logCollab('Offline: using same-device channel only.');updateCollabStatus();return;}
  try{
    updateCollabStatus('connecting');
    const mod=await import(STRATEGY_URLS[Collab.strategy]||STRATEGY_URLS.nostr);
    const cfg={appId:COLLAB_APP_ID};
    if(Collab.password)cfg.password=Collab.password;
    const turnUrl=document.getElementById('turnUrl')?.value.trim();
    if(turnUrl){cfg.turnConfig=[{urls:[turnUrl],username:document.getElementById('turnUser')?.value||'',credential:document.getElementById('turnCredential')?.value||''}];}
    Collab.room=mod.joinRoom(cfg,Collab.roomId);
    Collab.peerId=mod.selfId||Collab.peerId;
    const record=Collab.room.makeAction('housing-record-v2');
    const presence=Collab.room.makeAction('presence-v2');
    const snapshot=Collab.room.makeAction('snapshot-v2',{kind:'request',onRequest:async()=>getSharedSnapshot()});
    Collab.actions={record,presence,snapshot};
    record.onMessage=async(data,{peerId})=>mergeRemoteRecord(data,'webrtc:'+peerId);
    presence.onMessage=(data,{peerId})=>{Collab.peers.set(peerId,{...data,peerId});renderPeerList()};
    Collab.room.onPeerJoin=async peerId=>{
      Collab.peers.set(peerId,{peerId,name:'Peer',role:'Unknown',verified:false});renderPeerList();
      try{await presence.send(localPresence(),{target:peerId})}catch{}
      try{const snap=await snapshot.request({request:'state'}, {target:peerId,timeoutMs:5000});for(const r of snap?.records||[])await mergeRemoteRecord(r,'snapshot:'+peerId)}catch(e){logCollab(`Snapshot request from ${peerId.slice(0,8)} did not complete.`)}
      logCollab(`Peer joined: ${peerId.slice(0,10)}…`);
    };
    Collab.room.onPeerLeave=peerId=>{Collab.peers.delete(peerId);renderPeerList();logCollab(`Peer left: ${peerId.slice(0,10)}…`)};
    Collab.connected=true;updateCollabStatus();await presence.send(localPresence());
    logCollab(`WebRTC room joined via ${Collab.strategy.toUpperCase()} discovery.`);
  }catch(e){Collab.connected=false;updateCollabStatus('degraded');logCollab(`Trystero unavailable; BroadcastChannel fallback remains active. ${e.message||e}`)}
}

function updateCollabStatus(forced){
  const el=document.getElementById('collabStatus');if(!el)return;
  const state=forced|| (Collab.connected?'connected':navigator.onLine?'local fallback':'offline fallback');
  const cls=Collab.connected?'good':state==='connecting'?'warn':'warn';
  el.innerHTML=`<span class="status-pill ${cls}">${esc(state)}</span><span class="tiny">Room: ${esc(Collab.roomId)}</span>`;
}
function renderPeerList(){
  const el=document.getElementById('peerList');if(!el)return;
  const peers=[...Collab.peers.values()];
  el.innerHTML=`<div class="peer"><span class="presence-dot"></span><strong>${esc(Collab.displayName)} (you)</strong><span>${esc(Collab.role)}</span><small class="tiny">${esc(Collab.peerId)} • self-asserted identity</small></div>`+(peers.length?peers.map(p=>`<div class="peer"><span class="presence-dot"></span><strong>${esc(p.name||'Peer')}</strong><span>${esc(p.role||'Unknown role')}</span><small class="tiny">${esc(p.peerId||p.sessionId||'peer')} • not identity-verified</small></div>`).join(''):'<div class="empty">No remote peers currently visible. Open this app in another tab/device using the same room to test.</div>');
}
async function renderCollabRecords(){
  const el=document.getElementById('sharedRecords');if(!el)return;
  const records=(await DB.all('shared')).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const conflicts=await DB.all('conflicts');
  el.innerHTML=(conflicts.length?`<div class="callout danger"><strong>${conflicts.length} synchronization conflict${conflicts.length===1?'':'s'} need review.</strong><div class="toolbar section"><button onclick="renderConflictPanel()">Review conflicts</button></div></div>`:'')+(records.length?records.map(r=>`<article class="shared-record"><div class="record-meta"><span class="badge">${esc(r.kind)}</span><span class="badge">${esc(r.workstream||'Housing')}</span><span class="badge">${esc(r.status||'open')}</span><span class="badge">rev ${Number(r.revision||1)}</span></div><strong>${esc(r.title)}</strong><p>${esc(r.description||'')}</p><small class="tiny">Owner role: ${esc(r.ownerRole||'Unassigned')} • Updated ${esc(r.updatedAt||'')} • Evidence ${esc(r.evidenceGrade||'F')}</small><div class="toolbar section"><button onclick="editSharedRecord('${r.id}')">Edit</button><button onclick="shareOneRecord('${r.id}')">Share now</button><button class="danger" onclick="deleteSharedRecord('${r.id}')">Delete local shared copy</button></div></article>`).join(''):'<div class="empty">No shared-room records yet. Create a project, task, decision or comment. Private household records are not included.</div>');
}
async function saveSharedRecord(){
  const id=document.getElementById('sharedId').value||('shared-'+crypto.randomUUID());
  const existing=await dbGet('shared',id); const base=Number(existing?.revision||0);
  const rec={id,kind:document.getElementById('recordKind').value,title:document.getElementById('recordTitle').value.trim(),description:document.getElementById('recordDescription').value.trim(),workstream:document.getElementById('recordWorkstream').value,ownerRole:document.getElementById('recordOwner').value,status:document.getElementById('recordStatus').value,evidenceGrade:document.getElementById('recordEvidence').value,due:document.getElementById('recordDue').value,baseRevision:base,revision:base+1,updatedAt:new Date().toISOString(),updatedBy:Collab.peerId};
  if(!rec.title){alert('Add a title first.');return}
  await DB.put('shared',rec);await broadcastEnvelope('record',rec);clearSharedForm();renderCollabRecords();logCollab(`Shared ${rec.kind}: ${rec.title}`);
}
function clearSharedForm(){['sharedId','recordTitle','recordDescription','recordDue'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});}
async function editSharedRecord(id){const r=await dbGet('shared',id);if(!r)return;document.getElementById('sharedId').value=r.id;document.getElementById('recordKind').value=r.kind;document.getElementById('recordTitle').value=r.title;document.getElementById('recordDescription').value=r.description||'';document.getElementById('recordWorkstream').value=r.workstream||'Housing';document.getElementById('recordOwner').value=r.ownerRole||ROLE_OPTIONS[0];document.getElementById('recordStatus').value=r.status||'open';document.getElementById('recordEvidence').value=r.evidenceGrade||'F';document.getElementById('recordDue').value=r.due||'';document.getElementById('recordTitle').focus()}
async function shareOneRecord(id){const r=await dbGet('shared',id);if(r){await broadcastEnvelope('record',r);toast('Record sent to room peers')}}
async function deleteSharedRecord(id){if(!confirm('Delete this shared-room record from this browser? This does not remotely erase copies already received by peers.'))return;await dbDelete('shared',id);renderCollabRecords()}
async function renderConflictPanel(){
  const conflicts=await DB.all('conflicts');const el=document.getElementById('sharedRecords');
  el.innerHTML=`<div class="card"><div class="section-title"><h3>Conflict review</h3><button onclick="renderCollabRecords()">Back</button></div>${conflicts.length?conflicts.map(c=>`<div class="shared-record conflict"><strong>${esc(c.local?.title||c.recordId)}</strong><p><b>Local:</b> rev ${c.local?.revision||0} — ${esc(c.local?.description||'')}</p><p><b>Remote:</b> rev ${c.remote?.revision||0} — ${esc(c.remote?.description||'')}</p><div class="toolbar"><button onclick="resolveConflict('${c.id}','local')">Keep local</button><button onclick="resolveConflict('${c.id}','remote')">Use remote</button></div></div>`).join(''):'<div class="empty">No conflicts.</div>'}</div>`;
}
async function resolveConflict(id,choice){const c=await dbGet('conflicts',id);if(!c)return;const winner=choice==='remote'?c.remote:c.local;winner.revision=Math.max(Number(c.local.revision||0),Number(c.remote.revision||0))+1;winner.baseRevision=winner.revision-1;winner.updatedAt=new Date().toISOString();winner.updatedBy=Collab.peerId;await DB.put('shared',winner);await dbDelete('conflicts',id);await broadcastEnvelope('record',winner);renderConflictPanel();}

function crossDomainCards(){return `<div class="cross-grid">${[
['Water','Unit count → indoor/outdoor demand → wastewater capacity → flood/drainage constraints'],['Energy','Envelope + HVAC + household load → utility burden → peak demand → outage survivability'],['Mobility','Housing location → commute time + vehicle/transit cost → total affordability'],['Broadband','Connectivity → remote work/education/telehealth access → opportunity + redundancy'],['Health','Housing quality + heat + moisture + accessibility → exposure and household resilience'],['Education','Student/family housing + workforce supply → attendance, retention and staffing'],['Disaster','Flood/wind/hail/fire/freeze exposure → damage → insurance/repair burden → displacement risk'],['Finance','Capital stack + taxes + insurance + operating cost → feasibility and long-run affordability'],['Community','Resident knowledge + nonprofit capacity + public process → implementation legitimacy and maintenance']
].map(([a,b])=>`<div class="cross-card"><strong>${a}</strong><p>${b}</p></div>`).join('')}</div>`}

function collaborationView(){
  const r=ROUTES.find(x=>x.id==='collaboration');
  return `${topHero(r,'A local-first coordination layer for households, institutions, governments, corporations, educational bodies, businesses and community organizations. WebRTC room traffic is peer-to-peer after discovery; private financial records are never auto-shared.')}
  <section class="callout warn section"><strong>Identity + network boundary.</strong> ${infoTip('Peer identifiers','Trystero peer IDs identify browser peers for transport purposes. They do not prove a person, employer, agency, school or organization is who they claim to be.')} Public-room presence is ephemeral and self-asserted. Use external identity verification for consequential decisions. Direct WebRTC may fail on restrictive NAT/firewalls; ${infoTip('TURN','A TURN server relays encrypted WebRTC traffic only when a direct peer connection cannot be established. This bundle does not hide or silently provision a TURN service.')} is an explicit fallback.</section>
  <section class="collab-layout section"><aside class="card"><h2>Room & presence</h2><div id="collabStatus" class="collab-status"></div>
  <div class="field section"><label>Display name ${infoTip('ⓘ','Shared presence label only. Do not use it as proof of identity.')}</label><input id="presenceName" value="${esc(Collab.displayName)}"></div>
  <div class="field"><label>Disciplinary / stakeholder role ${infoTip('ⓘ','A self-selected coordination role used to make multidisciplinary gaps visible; it is not a credential.')}</label><select id="presenceRole">${ROLE_OPTIONS.map(x=>`<option${x===Collab.role?' selected':''}>${esc(x)}</option>`).join('')}</select></div>
  <div class="field"><label>Room ID ${infoTip('ⓘ','Peers must use the same application ID, room ID, discovery strategy and optional password to find one another.')}</label><input id="roomId" value="${esc(Collab.roomId)}"></div>
  <div class="field"><label>Discovery strategy ${infoTip('ⓘ','Discovery exchanges signaling/session information so peers can establish WebRTC. Application records then travel over peer data channels.')}</label><select id="strategySelect">${['nostr','mqtt','torrent','ipfs'].map(x=>`<option value="${x}"${x===Collab.strategy?' selected':''}>${x.toUpperCase()}</option>`).join('')}</select></div>
  <div class="field"><label>Optional room password ${infoTip('ⓘ','Trystero uses this shared secret to derive stronger session-description encryption. Peers must know the same password. It is not persisted by this app.')}</label><input id="roomPassword" type="password" autocomplete="off" placeholder="Leave blank for public rooms"></div>
  <details><summary>Explicit TURN fallback</summary><p class="notice">Only fill these fields when your organization has intentionally provisioned a TURN service. Credentials remain in this page session and are not stored by the app.</p><div class="field"><label>TURN URL</label><input id="turnUrl" placeholder="turn:relay.example.org:3478"></div><div class="field"><label>Username</label><input id="turnUser" autocomplete="off"></div><div class="field"><label>Credential</label><input id="turnCredential" type="password" autocomplete="off"></div></details>
  <div class="toolbar section"><button class="primary" onclick="savePresenceAndJoin()">Join / reconnect</button><button onclick="joinPublicCommons()">Public commons</button><button onclick="leavePeerRoom();toast('WebRTC room left; same-device state remains local')">Leave WebRTC</button></div>
  <h3 class="section">Peers</h3><div id="peerList" class="peer-list"></div><h3 class="section">Event log</h3><div id="collabLog" class="live-log"></div></aside>
  <div><section class="card"><h2>Shared work ledger</h2><p>Only records created here are synchronized. Core household budgets, addresses, income, rent/mortgage and instability records remain local unless a user deliberately copies information into a shared record.</p>
  <input id="sharedId" type="hidden"><div class="formgrid"><div class="field"><label>Record type</label><select id="recordKind">${RECORD_TYPES.map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>Workstream</label><select id="recordWorkstream">${WORKSTREAMS.map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>Owner role</label><select id="recordOwner">${ROLE_OPTIONS.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div class="field"><label>Status</label><select id="recordStatus"><option>open</option><option>in progress</option><option>blocked</option><option>review</option><option>done</option></select></div><div class="field"><label>Evidence grade</label><select id="recordEvidence">${['A','B','C','D','E','F'].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>Due date</label><input id="recordDue" type="date"></div></div><div class="field section"><label>Title</label><input id="recordTitle" maxlength="180"></div><div class="field"><label>Description / decision rationale / comment</label><textarea id="recordDescription" rows="4" maxlength="4000"></textarea></div><div class="toolbar section"><button class="primary" onclick="saveSharedRecord()">Save + synchronize</button><button onclick="clearSharedForm()">Clear</button><button onclick="exportCollaborationBundle()">Export room JSON</button><label class="btn">Import room JSON<input type="file" hidden accept="application/json" onchange="importCollaborationBundle(this.files[0])"></label></div></section>
  <section class="section"><div class="section-title"><div><h2>Room state</h2><p>Projects, tasks, decisions and comments. Snapshot synchronization occurs when peers join.</p></div></div><div id="sharedRecords" class="record-list section"></div></section></div></section>
  <section class="section"><div class="section-title"><div><h2>Cross-domain collaboration map</h2><p>Use one housing project as the shared object, then attach disciplinary consequences rather than running disconnected workstreams.</p></div></div>${crossDomainCards()}</section>`;
}

function savePresenceAndJoin(){Collab.displayName=document.getElementById('presenceName').value.trim()||'Texas collaborator';Collab.role=document.getElementById('presenceRole').value;localStorage.setItem('txh.collab.name',Collab.displayName);localStorage.setItem('txh.collab.role',Collab.role);joinPeerRoom()}
function joinPublicCommons(){document.getElementById('roomId').value=DEFAULT_PUBLIC_ROOM;document.getElementById('roomPassword').value='';document.getElementById('strategySelect').value='nostr';joinPeerRoom()}
async function exportCollaborationBundle(){const data={schema:'texas-housing-collaboration/2',version:ENHANCED_VERSION,roomId:Collab.roomId,exportedAt:new Date().toISOString(),records:await DB.all('shared')};download(`texas-housing-room-${Collab.roomId}-${today()}.json`,JSON.stringify(data,null,2))}
async function importCollaborationBundle(file){if(!file||file.size>5_000_000)return alert('Use a JSON file under 5 MB.');try{const data=JSON.parse(await file.text());if(data.schema!=='texas-housing-collaboration/2'||!Array.isArray(data.records))throw new Error('Unsupported room bundle schema');for(const r of data.records)await mergeRemoteRecord(r,'import');toast('Collaboration bundle imported')}catch(e){alert(e.message)}}

const GUIDE_DATA=[
 {title:'Connectivity diagnosis + WebRTC/TURN',one:'WebRTC tries to connect browsers directly. Discovery helps them find each other; a TURN relay is only needed when network boundaries prevent a direct path.',actions:['Confirm both peers are online and use the same room/strategy/password.','Test same-device BroadcastChannel first.','If remote discovery works but peer connection fails, inspect firewall/NAT policy.','Use an explicitly provisioned TURN service only when needed.'],advanced:'STUN helps discover network-facing addresses; ICE tests candidate routes. Symmetric NAT, enterprise firewalls or UDP restrictions can prevent direct paths. A TURN relay carries encrypted peer traffic when direct ICE candidates fail.',expert:'Treat discovery, identity and transport as separate trust boundaries. Trystero discovery transports SDP through the chosen medium, while application records traverse WebRTC data channels after connection. Log degraded modes without pretending offline/local fallback is equivalent to remote reachability.'},
 {title:'Trystero 0.25.3 + decentralized discovery',one:'Trystero gives the app one room/action API while Nostr, MQTT, BitTorrent and IPFS can be swapped as discovery strategies.',actions:['Use Nostr by default for broad decentralized relay redundancy.','Try MQTT, then BitTorrent or IPFS when your environment favors them.','Keep room IDs non-sensitive.','Use a shared password for stronger SDP encryption when a room is private.'],advanced:'This build pins strategy imports to 0.25.3 and uses action objects (`makeAction`, `send`, `onMessage`) plus request/response snapshots. The discovery network does not become the application database.',expert:'Peer join triggers a snapshot request. Existing peers can answer with current shared-room records. State remains local-first and is merged using revisions; equal/concurrent revisions are surfaced as conflicts instead of silently overwritten.'},
 {title:'Texas broadband-project status',one:'Housing collaboration increasingly depends on connectivity. Texas has active state/federal broadband programs, but project status and completion vary by award and location.',actions:['Use the Texas BDO award map/files before assuming service exists.','Record broadband availability as a dated project dependency.','Include community anchor institutions in housing-service planning.','Keep offline workflows for field and disaster conditions.'],advanced:'Texas says its BEAD Final Proposal was approved Dec. 4, 2025. The state selected 22 applicants for more than 240,000 broadband-serviceable locations and more than 2,700 community anchor institutions, with $1.2B federal awards and $177M state match; BDO said construction could begin as soon as summer 2026. BOOT I and II separately fund last-mile projects.',expert:'Do not infer parcel-level availability from statewide award totals. Broadband maps can contain provider-reported availability, challenge outcomes and timing gaps between award, construction, activation and subscription. Treat connectivity as a versioned infrastructure dependency rather than a permanent yes/no field.'},
 {title:'Housing mapping challenges',one:'Maps are useful only when geography, year, unit and uncertainty line up. A flood zone, rent estimate, zoning layer and broadband availability layer may describe different dates and spatial units.',actions:['Record source date and geography for every layer.','Never expose private household coordinates.','Avoid “best neighborhood” rankings.','Use parcel-level conclusions only with parcel-level authoritative data.'],advanced:'Common errors include joining tract statistics to parcels as if they were parcel facts, mixing ACS multi-year estimates with current administrative data, treating absence from a mapped hazard zone as zero risk, and forgetting geocoding/coverage bias.',expert:'Maintain a layer manifest: publisher, dataset/version, CRS, spatial resolution, effective date, update cadence, license, suppression rules, missingness and known positional/semantic error. Make cross-layer joins explicit and reproducible.'},
 {title:'Multidisciplinary housing project design',one:'A housing project should be a shared system object, not separate plans from housing, water, energy, transport, health and education teams.',actions:['Define the household/community outcome first.','Assign one owner per workstream plus cross-domain dependencies.','Create shared decisions with evidence grades.','Measure both housing outputs and downstream burdens.'],advanced:'Use dependency edges: units → water/wastewater demand; building form → energy peak; location → transport cost; hazard → insurance/recovery; broadband → work/education access; accessibility → long-term household stability.',expert:'Use a lightweight systems-engineering model: needs → requirements → constraints → alternatives → evidence → decision → implementation → measured outcome. Record reversible vs irreversible decisions, uncertainty ranges, responsible party and review date.'},
 {title:'WebLLM local planning assistant',one:'WebLLM can run an LLM in the browser with WebGPU, keeping prompts local after model files are downloaded. This app runs inference in a dedicated worker so the UI stays responsive.',actions:['Check WebGPU support.','Load the 1B model only when desired; first download can be large.','Use local evidence summaries in the prompt.','Verify generated factual claims independently.'],advanced:'The main page creates a WebWorkerMLCEngine; computation lives in `webllm-worker.mjs`. Model assets are handled by WebLLM caching. If WebGPU/model loading fails, this app switches to a deterministic rule-based planning fallback instead of pretending AI is active.',expert:'A dedicated worker improves responsiveness but does not remove GPU-memory constraints. Model lifecycle, cache storage, browser GPU support and device loss need explicit failure handling. Do not put private room passwords or sensitive personal records into a prompt unless the user deliberately chooses to do so.'},
 {title:'PWA + offline architecture',one:'The core app, calculators, guides and saved local records work offline after a hosted install/cache. Service workers do not run from `file://`.',actions:['Serve over HTTPS or localhost.','Install the PWA if desired.','Test airplane mode after first successful load.','Export JSON backups before browser/storage resets.'],advanced:'The versioned service worker precaches same-origin shell files and uses conservative runtime caching for CDN JavaScript. WebLLM model caching is left to WebLLM to avoid duplicating multi-hundred-megabyte/gigabyte assets.',expert:'Design offline states by capability: shell available, local data available, remote peer discovery unavailable, cached reference material available, live official data stale/unavailable. Never collapse these into one “offline ready” badge.'},
 {title:'Evidence + provenance',one:'A useful claim says who measured it, where, when, how current it is and what it cannot prove.',actions:['Use A–F evidence grades.','Keep retrieval dates visible.','Distinguish measured outcomes from modeled outcomes.','Store assumptions beside scenario results.'],advanced:'This build embeds statewide Census QuickFacts values with their original periods instead of relabeling them as 2026 measurements. Current program status is linked to official Texas sources and separated from modeled housing scenarios.',expert:'A reproducible evidence record should preserve publisher, dataset, geography, period, publication/retrieval dates, update cadence, license, transformations, uncertainty/limitations and integrity hash where useful. A hash demonstrates consistency, not authorship.'},
 {title:'Data sovereignty + conflict-aware sync',one:'Private household data stays local. Shared-room records are a separate dataset and synchronization conflicts are surfaced rather than hidden.',actions:['Share only project/team information intended for peers.','Export backups regularly.','Review conflicts before choosing a version.','Remember deletion on one browser cannot erase copies peers already received.'],advanced:'Records carry revision, base revision, updater and timestamp metadata. Straight-line newer revisions merge automatically; equal or branched revisions generate a conflict object for explicit resolution.',expert:'This is not a full CRDT. It is an auditable optimistic-replication scheme suited to modest team records. For high-frequency co-editing, use a purpose-built CRDT such as Yjs/Automerge and document its merge semantics.'},
 {title:'Housing ↔ water ↔ energy ↔ mobility ↔ resilience',one:'A cheap unit can become expensive when transportation, utilities, insurance or disaster exposure are ignored.',actions:['Run total housing cost, not shelter-only cost.','Attach water/energy/transport assumptions to development scenarios.','Test outage and hazard conditions.','Use cross-domain owners in shared projects.'],advanced:'Housing form and location change infrastructure intensity, utility loads, travel patterns, emergency access, service delivery and family residual income. Cross-domain collaboration should track these as costs and constraints, not externalities.',expert:'Use common identifiers and versioned data envelopes across Texas OS modules. Keep household digital twins private; exchange only aggregated or explicitly shared project parameters. Treat modeled cross-domain effects as scenario evidence (E) until measured.'}
];
function guidesView(){const r=ROUTES.find(x=>x.id==='guides');return `${topHero(r,'Technical depth without forcing every user through expert material. Each guide follows the same four-layer path: one minute → actions → advanced → implementation detail.')}<section class="grid section">${GUIDE_DATA.map((g,i)=>`<article class="card"><h2>${i+1}. ${esc(g.title)}</h2><details class="guide-level" open><summary><span class="guide-num">1</span> One-minute explanation</summary><p>${esc(g.one)}</p></details><details class="guide-level"><summary><span class="guide-num">2</span> Actionable steps</summary><ol>${g.actions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details><details class="guide-level"><summary><span class="guide-num">3</span> Advanced explanation</summary><p>${esc(g.advanced)}</p></details><details class="guide-level"><summary><span class="guide-num">4</span> Expert / implementation detail</summary><p>${esc(g.expert)}</p></details></article>`).join('')}</section>`}

function aiLabView(){const r=ROUTES.find(x=>x.id==='ai-lab');return `${topHero(r,'Optional on-device planning support. WebLLM runs through a dedicated worker when WebGPU is available; a deterministic planning engine remains available without a model.')}<section class="grid g2 section"><div class="card"><h2>Runtime</h2><div class="metric"><span>WebGPU</span><b>${navigator.gpu?'Detected':'Not detected'}</b></div><div class="metric"><span>WebLLM package</span><b>${WEBLLM_VERSION}</b></div><div class="field section"><label>Model</label><select id="aiModel"><option value="Llama-3.2-1B-Instruct-q4f16_1-MLC">Llama 3.2 1B q4f16 (~0.9 GB VRAM requirement)</option><option value="Llama-3.2-1B-Instruct-q4f32_1-MLC">Llama 3.2 1B q4f32 (~1.1 GB VRAM requirement)</option></select></div><button class="primary" onclick="initLocalAI()">Initialize local model</button><div id="aiProgress" class="output section">Not initialized. The deterministic planner is ready now.</div><p class="notice">First model use requires an online download unless already cached. Model inference then occurs in-browser. Browser/GPU limitations can still prevent loading.</p></div><div class="card"><h2>Planning request</h2><div class="field"><label>Prompt</label><textarea id="aiPrompt" rows="9">Design a cross-domain action plan to reduce total housing burden for a rapidly growing Texas community. Include housing supply, preservation, water, energy, mobility, broadband, resilience, accessibility, evidence needs, responsible roles, risks and measurable outcomes.</textarea></div><label><input id="aiIncludeShared" type="checkbox" checked> Include summaries of shared-room records</label><div class="toolbar section"><button class="primary" onclick="runPlanningAssistant()">Generate plan</button><button onclick="runDeterministicPlanner()">Use deterministic fallback</button></div></div></section><section class="card section"><h2>Output</h2><div id="aiOutput" class="ai-output output">No output yet.</div></section><section class="callout warn section"><strong>Verification boundary.</strong> Generated text is a planning aid, not a source. Keep the evidence registry, local code/legal requirements and professional review separate from model output.</section>`}

async function initLocalAI(){
  const status=document.getElementById('aiProgress');if(!navigator.gpu){status.textContent='WebGPU is unavailable. Deterministic planner remains active.';return}
  if(AiState.loading)return;AiState.loading=true;status.textContent='Loading WebLLM module…';
  try{const webllm=await import(`https://esm.run/@mlc-ai/web-llm@${WEBLLM_VERSION}`);const model=document.getElementById('aiModel').value;const worker=new Worker('./webllm-worker.mjs',{type:'module'});AiState.engine=await webllm.CreateWebWorkerMLCEngine(worker,model,{initProgressCallback:r=>{if(status)status.textContent=r.text||`Loading ${(Number(r.progress||0)*100).toFixed(0)}%`}});AiState.model=model;status.textContent=`Ready: ${model}`;toast('Local AI ready')}catch(e){status.textContent=`Local model unavailable: ${e.message||e}. Deterministic planner remains active.`;AiState.engine=null}finally{AiState.loading=false}}
async function sharedSummary(){const rs=(await DB.all('shared')).slice(-20);return rs.map(r=>`[${r.kind}/${r.workstream}/${r.status}] ${r.title}: ${r.description||''}`).join('\n')}
async function runPlanningAssistant(){const out=document.getElementById('aiOutput');const prompt=document.getElementById('aiPrompt').value.trim();if(!prompt)return;if(!AiState.engine){runDeterministicPlanner();return}out.textContent='Generating locally…';try{const ctx=document.getElementById('aiIncludeShared').checked?await sharedSummary():'';const messages=[{role:'system',content:'You are the local planning assistant inside Texas Housing Affordability & Resilience OS. Distinguish evidence, assumptions and modeled scenarios. Do not invent active programs, legal conclusions or verified identities. Favor cross-domain, measurable, reversible actions and privacy.'},{role:'user',content:prompt+(ctx?'\n\nExplicitly shared room context:\n'+ctx:'')}];const res=await AiState.engine.chat.completions.create({messages,temperature:0.2,max_tokens:900});out.textContent=res.choices?.[0]?.message?.content||'No model output returned.'}catch(e){out.textContent=`Model generation failed: ${e.message||e}\n\nSwitching to deterministic planner…`;setTimeout(runDeterministicPlanner,50)}}
function deterministicPlanText(prompt){const q=prompt.toLowerCase();const needs=[];if(/rent|burden|afford/.test(q))needs.push('Run shelter + utilities + transportation + insurance/tax burden and residual-income baselines.');if(/supply|growth|unit|build/.test(q))needs.push('Compare preservation, infill, starter-home, missing-middle, ADU and new-construction pipelines with infrastructure capacity.');if(/water|waste/.test(q))needs.push('Quantify water/wastewater demand and capacity before treating unit count as feasible.');if(/energy|grid|heat|outage/.test(q))needs.push('Model envelope/HVAC loads, utility burden, peak demand and passive survivability.');if(/transport|commut|mobility/.test(q))needs.push('Compare housing + transportation costs and time, not rent/mortgage alone.');if(/broadband|connect/.test(q))needs.push('Verify location-specific broadband award/availability status and retain offline workflows.');if(/flood|hail|wind|fire|resilien|disaster/.test(q))needs.push('Map hazard pathways to damage, insurance/repair cost and displacement; test mitigation options.');if(/access|senior|disab/.test(q))needs.push('Include step-free access, adaptability and long-run aging/accessibility requirements.');if(!needs.length)needs.push('Define the housing outcome, baseline total cost, affected population, constraints, alternatives and evidence before selecting interventions.');return `DETERMINISTIC CROSS-DOMAIN PLAN\n\n1. Define the outcome\nState a measurable household/community outcome and geography. Separate measured conditions from assumptions.\n\n2. Baseline\n• ${needs.join('\n• ')}\n\n3. Multidisciplinary workstreams\nHousing/land; permitting/zoning; water/wastewater; energy; mobility; broadband; disaster resilience; accessibility/health; education/workforce; finance/insurance; community implementation. Assign one accountable owner to each.\n\n4. Evidence gate\nGrade inputs A–F. Preserve source period, retrieval date and limitation notes. Do not present modeled effects as forecasts.\n\n5. Candidate portfolio\nTest at least one preservation/stabilization option, one supply option, one infrastructure/operating-cost option and one resilience/accessibility option. Compare total household cost and hidden cost-shifting.\n\n6. 30/60/90-day execution\n30: measure + stabilize urgent risk. 60: verify constraints, partners, funding and approvals. 90: launch the smallest reversible pilot capable of producing a measurable signal.\n\n7. Outcome ledger\nTrack households stabilized, burden change, units preserved/created, processing time, infrastructure impacts, accessibility, resilience upgrades and displacement indicators.\n\nPrompt analyzed locally: ${prompt.slice(0,500)}`}
function runDeterministicPlanner(){const prompt=document.getElementById('aiPrompt')?.value||'';const out=document.getElementById('aiOutput');if(out)out.textContent=deterministicPlanText(prompt)}

function texasBaselineHTML(){return `<section class="section"><div class="section-title"><div><h2>Dated Texas statewide baseline</h2><p>Official statewide context, not a substitute for local-market data. Source periods are deliberately kept visible.</p></div></div><div class="grid g4 section"><div class="card kpi"><small>Population estimate • Jul. 1, 2025</small><strong>31.71M</strong><p>+8.8% from the April 2020 estimates base.</p></div><div class="card kpi"><small>Housing units • Jul. 1, 2025</small><strong>12.85M</strong><p>Statewide Census estimate.</p></div><div class="card kpi"><small>Median gross rent • 2020–2024</small><strong>$1,403</strong><p>ACS-based QuickFacts measure.</p></div><div class="card kpi"><small>Median owner value • 2020–2024</small><strong>$283,800</strong><p>Owner-occupied housing units.</p></div><div class="card kpi"><small>Owner cost w/ mortgage • 2020–2024</small><strong>$2,106/mo</strong><p>Median selected monthly owner cost.</p></div><div class="card kpi"><small>Median household income • 2020–2024</small><strong>$78,476</strong><p>2024 dollars.</p></div><div class="card kpi"><small>Broadband subscription • 2020–2024</small><strong>91.4%</strong><p>Households with a broadband internet subscription.</p></div><div class="card kpi"><small>Building permits • 2024</small><strong>225,756</strong><p>Statewide permits reported in QuickFacts.</p></div></div><p class="notice">Source: U.S. Census Bureau QuickFacts. These values have different reference periods and should not be combined as if they were measured in one year.</p></section>`}

// Override selected core behaviors after preserving originals.
const _coreOverview=overview;
overview=function(){return _coreOverview()+texasBaselineHTML()+`<section class="section"><div class="section-title"><div><h2>Collaboration readiness</h2><p>Move from individual analysis to multidisciplinary execution without centralizing private household records.</p></div></div><div class="grid g3 section"><div class="card"><h3>Peer-to-peer rooms</h3><p>Trystero ${TRYSTERO_VERSION} + WebRTC, with Nostr default and MQTT/BitTorrent/IPFS alternatives.</p><button onclick="navigate('collaboration')">Open Multiplayer Commons</button></div><div class="card"><h3>Simplified Advanced Guides</h3><p>Progressive explanations for networking, broadband, mapping, evidence, PWA and local AI.</p><button onclick="navigate('guides')">Open guides</button></div><div class="card"><h3>Local AI + fallback</h3><p>Dedicated-worker WebLLM when supported; deterministic planning without WebGPU.</p><button onclick="navigate('ai-lab')">Open AI Planning Lab</button></div></div></section>`};

const _coreNavigate=navigate;
navigate=function(id,push=true){
  if(!['collaboration','guides','ai-lab'].includes(id))return _coreNavigate(id,push);
  const route=ROUTES.find(r=>r.id===id);if(!route)return _coreNavigate('overview',push);
  if(push)history.pushState({id},'',`#${route.id}`);
  document.getElementById('crumb').textContent=route.title;document.querySelectorAll('.navlink').forEach(b=>b.classList.toggle('active',b.dataset.route===route.id));
  document.getElementById('view').innerHTML=id==='collaboration'?collaborationView():id==='guides'?guidesView():aiLabView();
  document.getElementById('main').focus({preventScroll:true});window.scrollTo({top:0,behavior:'auto'});document.getElementById('sidebar').classList.remove('open');document.getElementById('menuBtn').setAttribute('aria-expanded','false');wireModeGeo();
  if(id==='collaboration'){updateCollabStatus();renderPeerList();renderCollabRecords();document.getElementById('collabLog').innerHTML=Collab.log.map(x=>`<div>${esc(x)}</div>`).join('')}
};
window.navigate=navigate;

// Expanded backup/import/reset including collaboration stores.
async function enhancedExportBackup(){const data={schema:'texas-housing-os-backup/2',version:ENHANCED_VERSION,exported:new Date().toISOString(),projects:await DB.all('projects'),profiles:await DB.all('profiles'),plans:await DB.all('plans'),records:await DB.all('records'),shared:await DB.all('shared'),conflicts:await DB.all('conflicts')};download(`texas-housing-os-backup-${today()}.json`,JSON.stringify(data,null,2))}
async function enhancedImportBackup(file){if(!file||file.size>5_000_000)throw new Error('Backup must be JSON under 5 MB.');const data=JSON.parse(await file.text());if(!['texas-housing-os-backup/1','texas-housing-os-backup/2'].includes(data.schema))throw new Error('Unsupported backup schema.');for(const s of ['projects','profiles','plans','records','shared','conflicts']){if(Array.isArray(data[s]))for(const x of data[s])if(x&&typeof x.id==='string')await DB.put(s,x)}toast('Backup imported')}
async function enhancedReset(){if(!confirm('Delete all local Texas Housing OS data, including collaboration records and conflicts, from this browser?'))return;for(const s of ['projects','profiles','plans','records','shared','conflicts'])await DB.clear(s);toast('Local records reset')}
document.getElementById('exportAll').onclick=enhancedExportBackup;document.getElementById('importAll').onchange=e=>enhancedImportBackup(e.target.files[0]).catch(err=>alert(err.message));document.getElementById('resetAll').onclick=enhancedReset;

// Add collaboration privacy notes to settings.
const settings=document.querySelector('#settingsModal .modalbox');
if(settings){const c=document.createElement('div');c.className='card section';c.innerHTML='<h3>Collaboration privacy</h3><p>Only records created in the Multiplayer Commons are eligible for synchronization. Public-room presence is self-asserted and ephemeral. Room passwords and TURN credentials are not saved by this application.</p><p class="notice">Remote deletion is not guaranteed: once a peer receives a record, their browser may retain a copy.</p>';settings.insertBefore(c,settings.lastElementChild)}

// Quick navigation additions.
const quick=document.querySelector('.quicknav');if(quick&&!quick.querySelector('[data-enhanced]')){const b1=document.createElement('button');b1.dataset.enhanced='1';b1.textContent='Collaborate';b1.onclick=()=>navigate('collaboration');const b2=document.createElement('button');b2.textContent='Guides';b2.onclick=()=>navigate('guides');quick.append(b1,b2)}

// Render extended routes and refresh current screen where needed.
renderSidebar();
if(['collaboration','guides','ai-lab'].includes(location.hash.slice(1)))navigate(location.hash.slice(1),false);
else if((location.hash.slice(1)||'overview')==='overview')navigate('overview',false);

// Start the requested default public room. This sends presence metadata only; no private/core records.
setTimeout(()=>{openLocalChannel(DEFAULT_PUBLIC_ROOM);if(navigator.onLine)joinPeerRoom({auto:true});},1200);
window.addEventListener('online',()=>{if(!Collab.connected)joinPeerRoom({auto:true})});
window.addEventListener('offline',()=>{Collab.connected=false;updateCollabStatus();logCollab('Network offline; same-device collaboration can continue.')});

// Expose handlers used by inline controls.
Object.assign(window,{joinPeerRoom,leavePeerRoom,savePresenceAndJoin,joinPublicCommons,saveSharedRecord,clearSharedForm,editSharedRecord,shareOneRecord,deleteSharedRecord,renderCollabRecords,renderConflictPanel,resolveConflict,exportCollaborationBundle,importCollaborationBundle,initLocalAI,runPlanningAssistant,runDeterministicPlanner});
