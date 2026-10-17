// Режим наблюдения за союзниками после смерти.
// ================== SPECTATOR MODE ==================
function getSpectateTargets(){
// Все живые союзники (включая ботов той же команды)
return bots.filter(b=>b.team===player.team&&b.alive);
}

function updateSpectator(){
if(player.alive){
// Не в spectate mode
document.getElementById('spectateInfo').style.display='none';
if(weapon.mesh)weapon.mesh.visible=true;
return;
}
const targets=getSpectateTargets();
if(targets.length===0){
// Никого не осталось — камера на своей позиции
camera.position.copy(player.pos);
camera.rotation.order='YXZ';
camera.rotation.y=yaw;
camera.rotation.x=pitch;
if(weapon.mesh)weapon.mesh.visible=false;
document.getElementById('spectateInfo').style.display='none';
return;
}
// Wrap index
if(spectateIndex>=targets.length)spectateIndex=0;
if(spectateIndex<0)spectateIndex=targets.length-1;
spectateTarget=targets[spectateIndex];

// Камера на позиции глаз союзника
const eyePos=spectateTarget.pos.clone();
eyePos.y+=CONFIG.playerHeight-0.1;
camera.position.copy(eyePos);

// Поворот как у союзника
camera.rotation.order='YXZ';
camera.rotation.y=spectateTarget.body.rotation.y;
camera.rotation.x=0;

// Скрыть оружие
if(weapon.mesh)weapon.mesh.visible=false;

// Показать UI
const info=document.getElementById('spectateInfo');
info.style.display='block';
document.getElementById('specName').textContent=spectateTarget.name;
}

