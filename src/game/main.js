// Главный цикл, обработчики меню и запуск игры.
function animate(){
requestAnimationFrame(animate);
const dt=clock.getDelta();
if(roundPhase==='preparing'){
prepareTimer-=dt;
if(prepareTimer<=0){
roundPhase='active';
showCenterMsg('⚔️ БОЙ НАЧАЛСЯ!',1500);
}
updateTimerUI();
}
if(mouse.down&&mouse.locked&&roundPhase==='active'&&player.alive&&!buyMenuOpen){
if(WEAPONS[currentWeapon].automatic)shoot();
}
updatePlayer(dt);
updateBots(dt);
renderer.render(scene,camera);
}

document.querySelectorAll('.skin').forEach(el=>{
el.addEventListener('click',()=>{
document.querySelectorAll('.skin').forEach(s=>s.classList.remove('selected'));
el.classList.add('selected');
selectedSkin=parseInt(el.dataset.skin);
});
});

document.querySelectorAll('.map').forEach(el=>{
el.addEventListener('click',()=>{
document.querySelectorAll('.map').forEach(s=>s.classList.remove('selected'));
el.classList.add('selected');
selectedMap=el.dataset.map;
});
});

buildWeaponSelect();

function startGame(){
username=document.getElementById('username').value.trim()||'Player';
document.getElementById('menu').style.display='none';
document.getElementById('hud').style.display='block';
roundNum=1;
scoreT=0;
scoreCT=0;
currentWeapon=initialWeapon;
playerStats={};
spectateIndex=0;
spectateTarget=null;
initScene();
setupControls();
updateHUD();
startRound();
animate();
showCenterMsg('Кликните для захвата мыши',3000);
}
