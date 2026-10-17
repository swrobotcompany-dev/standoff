// Таймер, таблица игроков, индикаторы и уведомления.
function updateTimerUI(){
const t=document.getElementById('timer');
const p=document.getElementById('phaseInfo');
const bh=document.getElementById('buyHint');
const po=document.getElementById('prepareOverlay');
if(roundPhase==='preparing'){
t.className='preparing';
t.textContent=Math.ceil(prepareTimer);
p.textContent='⏳ ПОДГОТОВКА (B — магазин)';
p.style.color='#fbbf24';
bh.style.display='block';
po.style.display='flex';
}else if(roundPhase==='active'){
t.className='active';
t.textContent='БОЙ';
p.textContent='⚔️ БОЙ';
p.style.color='#4ade80';
bh.style.display='none';
po.style.display='none';
}else{
t.className='ended';
t.textContent='КОНЕЦ';
p.textContent='💀 РАУНД ОКОНЧЕН';
p.style.color='#ef4444';
bh.style.display='none';
po.style.display='none';
}
}

function updateScoreboard(){
const td=document.getElementById('teamT');
const cd=document.getElementById('teamCT');
td.innerHTML='';
cd.innerHTML='';
const all=[{name:player.name,team:player.team,alive:player.alive,isSelf:true}];
bots.forEach(b=>all.push({name:b.name,team:b.team,alive:b.alive,isSelf:false}));
all.forEach(p=>{
const s=playerStats[p.name]||{kills:0,deaths:0};
const r=document.createElement('div');
let cls='player-row';
if(p.isSelf)cls+=' self';
if(!p.alive)cls+=' dead';
// Подсветка spectate target
if(!player.alive&&spectateTarget&&p.name===spectateTarget.name)cls+=' spectating';
r.className=cls;
r.innerHTML=`<span class="player-name">${p.name}${p.isSelf?' (Вы)':''}</span>
<span class="player-stats"><span class="stat-k">K:${s.kills}</span><span class="stat-d">D:${s.deaths}</span></span>`;
if(p.team==='T')td.appendChild(r);
else cd.appendChild(r);
});
}


function updateHUD(){
document.getElementById('health').textContent=Math.max(0,Math.floor(player.hp))+' HP';
document.getElementById('ammo').textContent=weapon.ammo+' / '+weapon.reserve;
document.getElementById('weaponName').textContent=WEAPONS[currentWeapon].name;
document.getElementById('scoreT').textContent=scoreT;
document.getElementById('scoreCT').textContent=scoreCT;
document.getElementById('roundNum').textContent=roundNum;
}

function showCenterMsg(text,duration){
const el=document.getElementById('centerMsg');
el.innerHTML=text;
el.style.display='block';
if(duration<99999)setTimeout(()=>el.style.display='none',duration);
}

function addKillFeed(killer,victim,hs){
const f=document.getElementById('killfeed');
const d=document.createElement('div');
d.className='killmsg';
d.innerHTML=`<b>${killer}</b> ${hs?'💀':'🔫'} <b>${victim}</b>`;
f.appendChild(d);
setTimeout(()=>d.remove(),4000);
while(f.children.length>5)f.removeChild(f.firstChild);
}

