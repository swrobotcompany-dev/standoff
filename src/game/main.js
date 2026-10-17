// Главный цикл, обработчики меню и запуск игры.
function animate(){
requestAnimationFrame(animate);
const dt=clock.getDelta();
if(multiplayer){
netTimer=Math.max(0,netTimer-dt);
updateTimerUI();
}else if(roundPhase==='preparing'){
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
if(multiplayer){updateNetwork(dt);updateRemotePlayers(dt);}else{updateBots(dt);}
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

function startSoloGame(){
multiplayer=false;
startGame();
}

function startGame(){
// The primary button joins the shared LAN match.
if(document.activeElement&&document.activeElement.id==='soloButton')multiplayer=false;
else multiplayer=true;
username=document.getElementById('username').value.trim()||'Player';
document.getElementById('menu').style.display='none';
const roomInput=document.getElementById('roomCode');
netRoom=(roomInput&&roomInput.value.trim()||'public').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,24)||'public';
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
if(multiplayer){
roundPhase='waiting';
weapon.ammo=WEAPONS[currentWeapon].magSize;
weapon.reserve=WEAPONS[currentWeapon].reserve;
connectMultiplayer();
updateScoreboard();
updateTimerUI();
}else{startRound();}
animate();
showCenterMsg('Кликните для захвата мыши',3000);
}
