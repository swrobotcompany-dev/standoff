// Завершение и запуск раундов.
function checkRoundEnd(){
if(multiplayer)return;
const ta=(player.team==='T'&&player.alive?1:0)+bots.filter(b=>b.team==='T'&&b.alive).length;
const ca=(player.team==='CT'&&player.alive?1:0)+bots.filter(b=>b.team==='CT'&&b.alive).length;
if(ta===0||ca===0){
roundPhase='ended';
if(ca===0)scoreT++;
else scoreCT++;
updateHUD();
updateTimerUI();
if(scoreT>=CONFIG.roundsToWin||scoreCT>=CONFIG.roundsToWin){
const win=scoreT>=CONFIG.roundsToWin?'🏆 ТЕРРОРИСТЫ ПОБЕДИЛИ':'🏆 СПЕЦНАЗ ПОБЕДИЛ';
showCenterMsg(win+'<br><span style="font-size:24px">Нажмите F5 для новой игры</span>',999999);
return;
}
roundNum++;
setTimeout(()=>startRound(),3500);
}
}

function startRound(){
if(roundNum===1&&WEAPONS[initialWeapon].category!=='pistol')initialWeapon='p350';
currentWeapon=initialWeapon;
const w=WEAPONS[currentWeapon];
weapon.ammo=w.magSize;
weapon.reserve=w.reserve;
weapon.reloading=false;
createWeaponView();
player.hp=CONFIG.maxHP;
player.alive=true;
player.pos.set(-60,CONFIG.playerHeight,0);
player.vel.set(0,0,0);
player.onGround=true;
camera.position.copy(player.pos);
bots.forEach(b=>scene.remove(b.body));
spawnBots();
roundPhase='preparing';
prepareTimer=CONFIG.prepareTime;
spectateIndex=0;
spectateTarget=null;
const msg='РАУНД '+roundNum+(roundNum===1?'<br><span style="font-size:24px">Только пистолеты</span>':'');
showCenterMsg(msg,2500);
updateHUD();
updateTimerUI();
updateScoreboard();
}

