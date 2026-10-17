// Shared LAN match client: one WebSocket to the host running serve.py.
function netSend(payload){
if(netSocket&&netSocket.readyState===WebSocket.OPEN)netSocket.send(JSON.stringify(payload));
}
function setNetStatus(message){
const el=document.getElementById('networkStatus');
if(el)el.textContent=message;
}
function connectMultiplayer(){
const scheme=location.protocol==='https:'?'wss:':'ws:';
const url=scheme+'//'+location.host+'/ws?room='+encodeURIComponent(netRoom);
setNetStatus('Подключение к комнате '+netRoom+'…');
netSocket=new WebSocket(url);
netSocket.addEventListener('open',()=>{
setNetStatus('Подключено • '+netRoom);
netSend({type:'join',name:username});
});
netSocket.addEventListener('message',event=>{
let data;
try{data=JSON.parse(event.data);}catch{return;}
if(data.type==='welcome'){
netPlayerId=data.id;
setNetStatus('Комната '+data.room+' • подключено');
}else if(data.type==='snapshot'){
applyNetworkSnapshot(data);
}else if(data.type==='kill'){
addKillFeed(data.killer,data.victim,Boolean(data.headshot));
}else if(data.type==='shot'){
const other=remotePlayers.get(data.id);
if(other&&other.body)flashRemoteShot(other);
}else if(data.type==='error'){
setNetStatus(data.message);
showCenterMsg(data.message,5000);
}
});
netSocket.addEventListener('close',()=>{
netPlayerId=null;
if(multiplayer){
roundPhase='waiting';
setNetStatus('Связь потеряна. Запустите python serve.py и обновите страницу.');
updateTimerUI();
}
});
netSocket.addEventListener('error',()=>setNetStatus('Не удалось подключиться к игровому WebSocket'));
}
function createRemotePlayer(data){
const body=createHumanModel(data.team);
body.position.set(data.pos[0],data.pos[1]-CONFIG.playerHeight,data.pos[2]);
const tagCanvas=document.createElement('canvas');
tagCanvas.width=256;tagCanvas.height=64;
const ctx=tagCanvas.getContext('2d');
ctx.fillStyle=data.team==='T'?'#ffad80':'#88bbff';
ctx.textAlign='center';
ctx.font='bold 31px sans-serif';
ctx.fillText(data.name,128,43,240);
const texture=new THREE.CanvasTexture(tagCanvas);
const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));
label.position.y=2.15;label.scale.set(1.9,0.47,1);
body.add(label);
scene.add(body);
return{id:data.id,name:data.name,team:data.team,body,alive:data.alive,hp:data.hp,
pos:new THREE.Vector3(...data.pos),targetPos:new THREE.Vector3(...data.pos),
moveDir:new THREE.Vector3(),kills:data.kills,deaths:data.deaths,weapon:data.weapon};
}
function applyNetworkSnapshot(data){
const mine=data.players.find(p=>p.id===netPlayerId);
const changedRound=data.round!==netPrevRound;
const previousPhase=netPrevPhase;
const newPhase=data.phase;
netPrevPhase=newPhase;netPrevRound=data.round;
roundNum=data.round;
scoreT=data.scoreT;
scoreCT=data.scoreCT;
roundPhase=newPhase;
netTimer=data.remaining;
prepareTimer=netTimer;
const currentIds=new Set();
data.players.forEach(p=>{
if(p.id===netPlayerId)return;
currentIds.add(p.id);
let remote=remotePlayers.get(p.id);
if(!remote){
remote=createRemotePlayer(p);
remotePlayers.set(p.id,remote);
}
if(remote.team!==p.team){
scene.remove(remote.body);
remote.body.traverse(o=>{if(o.isSprite&&o.material.map)o.material.map.dispose();});
remote=createRemotePlayer(p);
remotePlayers.set(p.id,remote);
}
remote.name=p.name;remote.team=p.team;
remote.kills=p.kills;remote.deaths=p.deaths;remote.weapon=p.weapon;
remote.hp=p.hp;remote.alive=p.alive;
remote.targetPos.set(...p.pos);
remote.body.visible=p.alive;
remote.body.rotation.y=p.yaw+Math.PI;
});
for(const [id,remote] of remotePlayers){
if(!currentIds.has(id)){
scene.remove(remote.body);
remote.body.traverse(o=>{if(o.isSprite&&o.material.map)o.material.map.dispose();});
remotePlayers.delete(id);
}
}
if(mine){
const previousHP=player.hp;
const wasAlive=player.alive;
player.name=mine.name;
player.team=mine.team;
player.hp=mine.hp;
player.alive=mine.alive;
playerStats[mine.name]={kills:mine.kills,deaths:mine.deaths,team:mine.team};
if(mine.hp<previousHP){
const overlay=document.getElementById('damageOverlay');
overlay.style.opacity=1;
setTimeout(()=>overlay.style.opacity=0,200);
}
if(wasAlive&&!mine.alive){
showCenterMsg('ВЫ УБИТЫ',1900);
spectateIndex=0;
}
if(!mine.alive&&weapon.mesh)weapon.mesh.visible=false;
if(mine.alive&&weapon.mesh)weapon.mesh.visible=true;
}
if(changedRound||previousPhase!==newPhase){
if(newPhase==='preparing'){
if(mine){
player.pos.set(...mine.pos);
player.vel.set(0,0,0);
camera.position.copy(player.pos);
player.onGround=true;
}
weapon.reloading=false;
const spec=document.getElementById('spectateInfo');spec.style.display='none';
weapon.ammo=WEAPONS[currentWeapon].magSize;
weapon.reserve=WEAPONS[currentWeapon].reserve;
if(weapon.mesh)weapon.mesh.visible=true;
showCenterMsg('РАУНД '+roundNum+' • ПОДГОТОВКА',1700);
}else if(newPhase==='active'){
showCenterMsg('⚔️ БОЙ НАЧАЛСЯ!',1200);
}else if(newPhase==='waiting'){
setNetStatus('Комната '+netRoom+' • ожидание второго игрока');
}else if(newPhase==='finished'){
showCenterMsg((scoreT>scoreCT?'🏆 ТЕРРОРИСТЫ':'🏆 СПЕЦНАЗ')+' ПОБЕДИЛИ',999999);
}
}
updateHUD();
updateScoreboard();
updateTimerUI();
}
function updateNetwork(dt){
if(!multiplayer||!netPlayerId||roundPhase!=='active')return;
const now=performance.now();
if(now-netLastSent<50)return;
netLastSent=now;
netSend({type:'state',pos:[player.pos.x,player.pos.y,player.pos.z],yaw,weapon:currentWeapon});
}
function updateRemotePlayers(dt){
for(const p of remotePlayers.values()){
const before=p.pos.clone();
const blend=Math.min(1,dt*13);
p.pos.lerp(p.targetPos,blend);
p.moveDir.subVectors(p.pos,before);
p.body.position.set(p.pos.x,p.pos.y-CONFIG.playerHeight,p.pos.z);
animateBotWalk(p,Math.min(dt,0.05));
}
}
function flashRemoteShot(p){
const light=new THREE.PointLight(0xffb64d,2,5);
light.position.set(p.pos.x,p.pos.y-0.3,p.pos.z);
scene.add(light);
setTimeout(()=>scene.remove(light),75);
}
