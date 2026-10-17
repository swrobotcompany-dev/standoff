// Клавиатура, мышь и управление магазином.
function setupControls(){
addEventListener('keydown',e=>{
keys[e.code]=true;
if(e.code==='KeyR')reload();
if(e.code==='KeyB'&&roundPhase==='preparing')toggleBuyMenu();
if(e.code==='Escape'&&buyMenuOpen)toggleBuyMenu(false);
// Прыжок — только если жив и не в подготовке
if(e.code==='Space'&&player.alive&&player.onGround&&roundPhase==='active'&&!scoped){
player.vel.y=CONFIG.jumpForce;
player.onGround=false;
}
// Переключение spectate target
if(e.code==='KeyQ'&&!player.alive){
spectateIndex++;
updateSpectator();
}
// Прицел AWM
if(e.code==='KeyE'&&currentWeapon==='awm'&&player.alive){
scoped=true;
camera.fov=30;
camera.updateProjectionMatrix();
document.getElementById('scopeOverlay').style.display='block';
document.getElementById('scopeCross').style.display='block';
document.getElementById('crosshair').style.display='none';
}
const a=getAvailableWeapons();
const wk=a.map(([k])=>k);
if(/^Digit[1-7]$/.test(e.code)&&wk[Number(e.code.slice(5))-1])switchWeapon(wk[Number(e.code.slice(5))-1]);
});
addEventListener('keyup',e=>{
keys[e.code]=false;
if(e.code==='KeyE'&&scoped){
scoped=false;
camera.fov=defaultFov;
camera.updateProjectionMatrix();
document.getElementById('scopeOverlay').style.display='none';
document.getElementById('scopeCross').style.display='none';
document.getElementById('crosshair').style.display='block';
}
});
renderer.domElement.addEventListener('click',()=>{
if(!mouse.locked&&!buyMenuOpen)renderer.domElement.requestPointerLock();
});
document.addEventListener('pointerlockchange',()=>{
mouse.locked=document.pointerLockElement===renderer.domElement;
});
addEventListener('mousemove',e=>{
if(!mouse.locked)return;
// В spectate mode мышь не управляет камерой
if(!player.alive)return;
const sens=scoped?CONFIG.mouseSens*0.4:CONFIG.mouseSens;
yaw-=e.movementX*sens;
pitch-=e.movementY*sens;
pitch=Math.max(-Math.PI/2+0.1,Math.min(Math.PI/2-0.1,pitch));
});
addEventListener('mousedown',e=>{
if(e.button===0){
mouse.down=true;
if(mouse.locked&&roundPhase==='active'&&player.alive&&!buyMenuOpen){
if(!WEAPONS[currentWeapon].automatic)shoot();
}
}
});
addEventListener('mouseup',e=>{
if(e.button===0)mouse.down=false;
});
}

function toggleBuyMenu(force){
buyMenuOpen=force!==undefined?force:!buyMenuOpen;
document.getElementById('buyMenu').style.display=buyMenuOpen?'flex':'none';
if(buyMenuOpen){
buildBuyMenu();
if(mouse.locked)document.exitPointerLock();
}else{
renderer.domElement.requestPointerLock();
}
}

