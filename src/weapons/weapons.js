// Оружие: модели, стрельба, урон и перезарядка.
function createWeaponView(){
if(weapon.mesh)camera.remove(weapon.mesh);
const gun=new THREE.Group();
const colors=SKIN_COLORS[selectedSkin];
const mm=new THREE.MeshStandardMaterial({color:colors[0],metalness:0.3,roughness:0.6});
const sm=new THREE.MeshStandardMaterial({color:colors[1],metalness:0.2,roughness:0.7});
const dm=new THREE.MeshStandardMaterial({color:0x111111,metalness:0.5,roughness:0.4});
const gm=new THREE.MeshStandardMaterial({color:0x2a2a2a,metalness:0.6,roughness:0.3});

if(currentWeapon==='ak47'){
gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.14,0.13,0.75),mm));
const stock=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.18,0.28),sm);
stock.position.set(0,-0.04,0.38);gun.add(stock);
const stockEnd=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.22,0.08),sm);
stockEnd.position.set(0,-0.02,0.52);gun.add(stockEnd);
const mag=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.22,0.12),dm);
mag.position.set(0,-0.18,0.05);gun.add(mag);
const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,0.38),dm);
barrel.rotation.x=Math.PI/2;barrel.position.set(0,0.02,-0.54);gun.add(barrel);
const sight=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.04,0.02),gm);
sight.position.set(0,0.09,-0.3);gun.add(sight);
const handguard=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.1,0.2),sm);
handguard.position.set(0,-0.01,-0.2);gun.add(handguard);
gun.position.set(0.3,-0.25,-0.5);
}else if(currentWeapon==='awm'){
gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.11,0.11,1.15),mm));
const stock=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.16,0.38),sm);
stock.position.set(0,-0.02,0.58);gun.add(stock);
const cheek=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.08,0.15),sm);
cheek.position.set(0,0.06,0.65);gun.add(cheek);
const scopeBase=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.08),dm);
scopeBase.position.set(0,0.1,-0.1);gun.add(scopeBase);
const scopeTube=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.28),dm);
scopeTube.rotation.x=Math.PI/2;scopeTube.position.set(0,0.12,-0.1);gun.add(scopeTube);
const scopeLens=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.02),new THREE.MeshStandardMaterial({color:0x4a9eff,emissive:0x2244aa,emissiveIntensity:0.3}));
scopeLens.rotation.x=Math.PI/2;scopeLens.position.set(0,0.12,-0.25);gun.add(scopeLens);
const mag=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.18,0.1),dm);
mag.position.set(0,-0.14,0.1);gun.add(mag);
const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,0.55),dm);
barrel.rotation.x=Math.PI/2;barrel.position.set(0,0.02,-0.78);gun.add(barrel);
const muzzle=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.025,0.08),gm);
muzzle.rotation.x=Math.PI/2;muzzle.position.set(0,0.02,-1.05);gun.add(muzzle);
gun.position.set(0.3,-0.25,-0.6);
}else if(currentWeapon==='deagle'){
gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.09,0.14,0.32),mm));
const grip=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.18,0.11),sm);
grip.position.set(0,-0.14,0.08);grip.rotation.x=-0.2;gun.add(grip);
const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.023,0.023,0.22),dm);
barrel.rotation.x=Math.PI/2;barrel.position.set(0,0.02,-0.24);gun.add(barrel);
const trigger=new THREE.Mesh(new THREE.BoxGeometry(0.015,0.04,0.02),gm);
trigger.position.set(0,-0.05,0.02);gun.add(trigger);
const sight=new THREE.Mesh(new THREE.BoxGeometry(0.015,0.03,0.015),gm);
sight.position.set(0,0.08,-0.12);gun.add(sight);
gun.position.set(0.25,-0.2,-0.4);
}else if(currentWeapon==='p350'){
gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.07,0.11,0.26),mm));
const grip=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.16,0.09),sm);
grip.position.set(0,-0.12,0.07);grip.rotation.x=-0.15;gun.add(grip);
const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.18),dm);
barrel.rotation.x=Math.PI/2;barrel.position.set(0,0.01,-0.19);gun.add(barrel);
const slide=new THREE.Mesh(new THREE.BoxGeometry(0.065,0.04,0.2),gm);
slide.position.set(0,0.04,0);gun.add(slide);
const sight=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.025,0.012),gm);
sight.position.set(0,0.07,-0.1);gun.add(sight);
gun.position.set(0.25,-0.2,-0.4);
}

camera.add(gun);
scene.add(camera);
weapon.mesh=gun;
updateScopeHint();
}

function updateScopeHint(){
const hint=document.getElementById('scopeHint');
hint.style.display=currentWeapon==='awm'?'block':'none';
}


function switchWeapon(wn){
if(!WEAPONS[wn])return;
const a=getAvailableWeapons().map(([k])=>k);
if(!a.includes(wn))return;
if(currentWeapon===wn||weapon.reloading)return;
if(scoped){
scoped=false;
camera.fov=defaultFov;
camera.updateProjectionMatrix();
document.getElementById('scopeOverlay').style.display='none';
document.getElementById('scopeCross').style.display='none';
document.getElementById('crosshair').style.display='block';
}
currentWeapon=wn;
const w=WEAPONS[wn];
weapon.ammo=w.magSize;
weapon.reserve=w.reserve;
createWeaponView();
updateHUD();
}

function shoot(){
if(roundPhase!=='active'||!player.alive)return;
const now=performance.now();
const w=WEAPONS[currentWeapon];
if(weapon.reloading)return;
if(now-weapon.lastShot<w.fireRate)return;
if(weapon.ammo<=0){reload();return;}
weapon.lastShot=now;
weapon.ammo--;
updateHUD();
if(weapon.mesh){
weapon.mesh.position.z+=w.recoil;
const bz=currentWeapon==='awm'?-0.6:currentWeapon==='ak47'?-0.5:-0.4;
setTimeout(()=>{if(weapon.mesh)weapon.mesh.position.z=bz;},60);
}
const ray=new THREE.Raycaster();
ray.setFromCamera(new THREE.Vector2(0,0),camera);
ray.far=250;
const targets=[];
bots.forEach(b=>{
if(!b.alive||b.team===player.team)return;
b.body.traverse(o=>{
if(o.isMesh&&o.userData.part)targets.push({bot:b,mesh:o,part:o.userData.part});
});
});
const meshes=targets.map(t=>t.mesh);
const hits=ray.intersectObjects(meshes,false);
const wm=walls.map(w=>w.mesh);
const wh=ray.intersectObjects(wm,false);
const wd=wh.length?wh[0].distance:Infinity;
if(hits.length&&hits[0].distance<wd){
const f=hits[0];
const t=targets.find(x=>x.mesh===f.object);
if(t){
let d=w.damage;
let hs=false;
if(t.part==='head'){d*=HEADSHOT_MULT;hs=true;}
else if(t.part==='arm'||t.part==='leg')d*=LIMB_MULT;
damageBot(t.bot,d,player.name,hs);
spawnImpact(f.point,0xff0000);
showHitmarker(hs);
}
}else if(wh.length){
spawnImpact(wh[0].point,0xffff00);
}
spawnMuzzleFlash();
}

function showHitmarker(hs){
const h=document.getElementById('hitmarker');
h.classList.add('show');
h.style.background=hs?'radial-gradient(circle,#fbbf24 0%,transparent 70%)':'';
setTimeout(()=>h.classList.remove('show'),150);
}

function reload(){
const w=WEAPONS[currentWeapon];
if(weapon.reloading||weapon.ammo===w.magSize||weapon.reserve===0)return;
weapon.reloading=true;
showCenterMsg('Перезарядка...',w.reloadTime);
setTimeout(()=>{
const need=w.magSize-weapon.ammo;
const take=Math.min(need,weapon.reserve);
weapon.ammo+=take;
weapon.reserve-=take;
weapon.reloading=false;
updateHUD();
},w.reloadTime);
}

function spawnMuzzleFlash(){
const f=new THREE.PointLight(0xffaa00,3,5);
f.position.set(0.3,-0.2,-1);
camera.add(f);
setTimeout(()=>camera.remove(f),50);
}

function spawnImpact(point,color){
const g=new THREE.Mesh(new THREE.SphereGeometry(0.15),new THREE.MeshBasicMaterial({color}));
g.position.copy(point);
scene.add(g);
setTimeout(()=>scene.remove(g),200);
}

function damageBot(bot,dmg,attackerName,hs){
bot.hp-=dmg;
bot.body.traverse(o=>{
if(o.isMesh&&o.userData.part==='torso'){
o.material.emissive.setHex(0xff0000);
setTimeout(()=>{if(o.material)o.material.emissive.setHex(0);},100);
}
});
if(bot.hp<=0&&bot.alive){
bot.alive=false;
bot.body.visible=false;
if(playerStats[attackerName])playerStats[attackerName].kills++;
if(playerStats[bot.name])playerStats[bot.name].deaths++;
addKillFeed(attackerName,bot.name,hs);
updateScoreboard();
checkRoundEnd();
}
}

function damagePlayer(dmg,attackerName){
player.hp-=dmg;
document.getElementById('damageOverlay').style.opacity=1;
setTimeout(()=>document.getElementById('damageOverlay').style.opacity=0,300);
if(player.hp<=0&&player.alive){
player.alive=false;
if(playerStats[attackerName])playerStats[attackerName].kills++;
if(playerStats[player.name])playerStats[player.name].deaths++;
addKillFeed(attackerName,player.name,false);
showCenterMsg('ВЫ УБИТЫ',2500);
// Сброс spectate индекса
spectateIndex=0;
updateScoreboard();
checkRoundEnd();
}
updateHUD();
}

