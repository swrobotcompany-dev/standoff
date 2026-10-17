// Логика ботов и движение игрока.
function updateBots(dt){
bots.forEach(bot=>{
if(!bot.alive)return;
// Гравитация
bot.vel.y-=CONFIG.gravity;
bot.pos.y+=bot.vel.y;
if(bot.pos.y<=CONFIG.playerHeight){
bot.pos.y=CONFIG.playerHeight;
bot.vel.y=0;
bot.onGround=true;
}else{
bot.onGround=false;
}
if(roundPhase==='preparing'){
bot.moveDir.set(0,0,0);
bot.body.position.set(bot.pos.x,bot.pos.y-CONFIG.playerHeight,bot.pos.z);
animateBotWalk(bot,dt);
return;
}
let target=null,minDist=Infinity;
const enemies=[];
if(player.alive&&player.team!==bot.team)enemies.push({pos:player.pos,isPlayer:true});
bots.forEach(b=>{
if(b!==bot&&b.alive&&b.team!==bot.team)enemies.push({pos:b.pos,bot:b});
});
enemies.forEach(e=>{
const d=e.pos.distanceTo(bot.pos);
if(d<minDist){minDist=d;target=e;}
});
bot.target=target;
const now=performance.now();
if(now>bot.nextDecision){
bot.nextDecision=now+1000+Math.random()*1500;
if(target){
const dir=new THREE.Vector3().subVectors(target.pos,bot.pos).normalize();
bot.moveDir.set(dir.x+(Math.random()-0.5)*0.5,0,dir.z+(Math.random()-0.5)*0.5).normalize();
}else{
bot.moveDir.set(Math.random()-0.5,0,Math.random()-0.5).normalize();
}
}
const speed=target&&minDist<15?0.05:0.08;
const nx=bot.pos.x+bot.moveDir.x*speed;
const nz=bot.pos.z+bot.moveDir.z*speed;
if(!checkWallCollisionXZ(nx,bot.pos.z,0.5))bot.pos.x=nx;
else bot.moveDir.x*=-1;
if(!checkWallCollisionXZ(bot.pos.x,nz,0.5))bot.pos.z=nz;
else bot.moveDir.z*=-1;
resolveWallCollision(bot.pos,0.5);
bot.pos.x=Math.max(-95,Math.min(95,bot.pos.x));
bot.pos.z=Math.max(-95,Math.min(95,bot.pos.z));
bot.body.position.set(bot.pos.x,bot.pos.y-CONFIG.playerHeight,bot.pos.z);
if(target){
const look=new THREE.Vector3().subVectors(target.pos,bot.pos);
bot.body.rotation.y=Math.atan2(look.x,look.z);
}
animateBotWalk(bot,dt);
if(target&&minDist<45&&now-bot.lastShot>600+Math.random()*400){
const ep=bot.pos.clone();ep.y-=0.2;
const te=target.pos.clone();te.y-=0.7;
if(hasLineOfSight(ep,te)){
bot.lastShot=now;
const acc=Math.max(0.3,1-minDist/50);
if(Math.random()<acc*0.45){
const w=WEAPONS[bot.weapon];
const d=w.damage*(0.6+Math.random()*0.4);
if(target.isPlayer)damagePlayer(d,bot.name);
else damageBot(target.bot,d,bot.name,false);
}
}
}
});
}

function hasLineOfSight(a,b){
const dir=new THREE.Vector3().subVectors(b,a);
const dist=dir.length();
dir.normalize();
const ray=new THREE.Raycaster(a,dir,0,dist);
const wm=walls.map(w=>w.mesh);
return ray.intersectObjects(wm).length===0;
}

function updatePlayer(dt){
// Гравитация всегда
player.vel.y-=CONFIG.gravity;
player.pos.y+=player.vel.y;
if(player.pos.y<=CONFIG.playerHeight){
player.pos.y=CONFIG.playerHeight;
player.vel.y=0;
player.onGround=true;
}else{
player.onGround=false;
}

// Если мёртв — spectate mode
if(!player.alive){
updateSpectator();
return;
}

// Во время подготовки — НЕ двигаемся (только стоим)
if(roundPhase!=='active'){
camera.position.copy(player.pos);
camera.rotation.order='YXZ';
camera.rotation.y=yaw;
camera.rotation.x=pitch;
return;
}

const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
const move=new THREE.Vector3();
const speed=keys['ShiftLeft']?CONFIG.runSpeed:CONFIG.moveSpeed;
if(keys['KeyW'])move.add(forward);
if(keys['KeyS'])move.sub(forward);
if(keys['KeyD'])move.add(right);
if(keys['KeyA'])move.sub(right);
if(move.lengthSq()>0){
move.normalize().multiplyScalar(speed);
const nx=player.pos.x+move.x;
const nz=player.pos.z+move.z;
if(!checkWallCollisionXZ(nx,player.pos.z,CONFIG.playerRadius))player.pos.x=nx;
if(!checkWallCollisionXZ(player.pos.x,nz,CONFIG.playerRadius))player.pos.z=nz;
}
resolveWallCollision(player.pos,CONFIG.playerRadius);
player.pos.x=Math.max(-95,Math.min(95,player.pos.x));
player.pos.z=Math.max(-95,Math.min(95,player.pos.z));
camera.position.copy(player.pos);
camera.rotation.order='YXZ';
camera.rotation.y=yaw;
camera.rotation.x=pitch;
}

