// Меню выбора оружия и покупки.
function getAvailableWeapons(){
return Object.entries(WEAPONS).filter(([k,w])=>multiplayer||roundNum!==1||w.category==='pistol');
}

function buildWeaponSelect(){
const c=document.getElementById('weaponSelect');
c.innerHTML='';
Object.entries(WEAPONS).forEach(([key,w])=>{
const d=document.createElement('div');
d.className='weapon'+(key===initialWeapon?' selected':'');
d.innerHTML=`<div class="wname">${w.name}</div><div class="wstats">Урон: ${w.damage}</div><div class="wstats">Магазин: ${w.magSize}</div><div class="wstats">${w.automatic?'Автомат':'Одиноч.'}</div>`;
d.addEventListener('click',()=>{
document.querySelectorAll('#weaponSelect .weapon').forEach(x=>x.classList.remove('selected'));
d.classList.add('selected');
initialWeapon=key;
});
c.appendChild(d);
});
}

function buildBuyMenu(){
const c=document.getElementById('buyWeapons');
c.innerHTML='';
getAvailableWeapons().forEach(([key,w])=>{
const d=document.createElement('div');
d.className='weapon'+(key===currentWeapon?' selected':'');
d.innerHTML=`<div class="wname">${w.name}</div><div class="wstats">Урон: ${w.damage}</div><div class="wstats">Магазин: ${w.magSize}</div><div class="wstats">${w.automatic?'Автомат':'Одиноч.'}</div>`;
d.addEventListener('click',()=>{
switchWeapon(key);
document.querySelectorAll('#buyWeapons .weapon').forEach(x=>x.classList.remove('selected'));
d.classList.add('selected');
});
c.appendChild(d);
});
}

