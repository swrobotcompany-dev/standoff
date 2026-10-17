// Модели персонажей, создание игрока и ботов.
function createPlayer(){
player={
pos:new THREE.Vector3(-60,CONFIG.playerHeight,0),
vel:new THREE.Vector3(0,0,0),
hp:CONFIG.maxHP,
team:'T',
alive:true,
name:username,
onGround:true
};
camera.position.copy(player.pos);
if(!playerStats[username])playerStats[username]={kills:0,deaths:0,team:'T'};
}

function createHumanModel(team){
const g=new THREE.Group();
const tc=team==='T'?0xb91c1c:0x1d4ed8;
const tcd=team==='T'?0x7f1d1d:0x1e3a8a;
const pc=team==='T'?0x3f2817:0x1e293b;
const sc=0xd4a574;
const bm=new THREE.MeshStandardMaterial({color:tc,roughness:0.8});
const bdm=new THREE.MeshStandardMaterial({color:tcd,roughness:0.8});
const pm=new THREE.MeshStandardMaterial({color:pc,roughness:0.9});
const sm=new THREE.MeshStandardMaterial({color:sc,roughness:0.7});
const bootm=new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.9});
const vm=new THREE.MeshStandardMaterial({color:team==='CT'?0x334155:0x4a2c1a,roughness:0.9});
const head=new THREE.Mesh(new THREE.SphereGeometry(0.22,12,10),sm);
head.position.y=1.58;
head.scale.set(1,1.1,1);
head.castShadow=true;
head.userData={part:'head'};
g.add(head);
const helmet=new THREE.Mesh(new THREE.SphereGeometry(0.25,12,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:team==='CT'?0x0f172a:0x4a2c1a,roughness:0.5}));
helmet.position.y=1.65;
helmet.castShadow=true;
g.add(helmet);
const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.12,8),sm);
neck.position.y=1.38;
g.add(neck);
const torso=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.75,0.35),bm);
torso.position.y=0.95;
torso.castShadow=true;
torso.userData={part:'torso'};
g.add(torso);
const vest=new THREE.Mesh(new THREE.BoxGeometry(0.68,0.55,0.38),vm);
vest.position.y=1.0;
vest.castShadow=true;
g.add(vest);
for(let i=-1;i<=1;i+=2){
const p=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.12,0.05),bdm);
p.position.set(i*0.2,0.85,0.2);
g.add(p);
}
for(let i=-1;i<=1;i+=2){
const s=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),bm);
s.position.set(i*0.38,1.28,0);
s.castShadow=true;
g.add(s);
}
const la=new THREE.Group();
const lu=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.08,0.4,8),bm);
lu.position.y=-0.2;lu.castShadow=true;la.add(lu);
const ll=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.07,0.4,8),bm);
ll.position.y=-0.6;ll.castShadow=true;la.add(ll);
const lh=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),sm);
lh.position.y=-0.82;la.add(lh);
la.position.set(-0.4,1.28,0);
la.userData={part:'arm'};
g.add(la);
const ra=new THREE.Group();
const ru=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.08,0.4,8),bm);
ru.position.y=-0.2;ru.castShadow=true;ra.add(ru);
const rl=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.07,0.4,8),bm);
rl.position.y=-0.6;rl.castShadow=true;ra.add(rl);
const rh=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),sm);
rh.position.y=-0.82;ra.add(rh);
ra.position.set(0.4,1.28,0);
ra.userData={part:'arm'};
g.add(ra);
const llg=new THREE.Group();
const lt=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.1,0.5,8),pm);
lt.position.y=-0.25;lt.castShadow=true;llg.add(lt);
const ls=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.09,0.5,8),pm);
ls.position.y=-0.75;ls.castShadow=true;llg.add(ls);
const lb=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.15,0.32),bootm);
lb.position.set(0,-1.05,0.05);llg.add(lb);
llg.position.set(-0.17,0.55,0);
llg.userData={part:'leg'};
g.add(llg);
const rlg=new THREE.Group();
const rt=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.1,0.5,8),pm);
rt.position.y=-0.25;rt.castShadow=true;rlg.add(rt);
const rs=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.09,0.5,8),pm);
rs.position.y=-0.75;rs.castShadow=true;rlg.add(rs);
const rb=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.15,0.32),bootm);
rb.position.set(0,-1.05,0.05);rlg.add(rb);
rlg.position.set(0.17,0.55,0);
rlg.userData={part:'leg'};
g.add(rlg);
g.userData={leftArm:la,rightArm:ra,leftLeg:llg,rightLeg:rlg,head,torso,walkPhase:0};
return g;
}

function animateBotWalk(bot,dt){
const m=bot.body.userData;
if(!m)return;
const moving=bot.moveDir.lengthSq()>0.01;
if(moving){
m.walkPhase+=dt*8;
const s=Math.sin(m.walkPhase)*0.5;
m.leftLeg.rotation.x=s;
m.rightLeg.rotation.x=-s;
m.leftArm.rotation.x=-s*0.4;
m.rightArm.rotation.x=s*0.4;
}else{
m.leftLeg.rotation.x*=0.85;
m.rightLeg.rotation.x*=0.85;
m.leftArm.rotation.x*=0.85;
m.rightArm.rotation.x*=0.85;
}
}

function spawnBots(){
bots=[];
for(let i=0;i<4;i++){
const name=BOT_NAMES_T[i];
const bot=makeBot('T',name,new THREE.Vector3(-60+Math.random()*3,0,-8+i*4));
bots.push(bot);
if(!playerStats[name])playerStats[name]={kills:0,deaths:0,team:'T'};
}
for(let i=0;i<5;i++){
const name=BOT_NAMES_CT[i];
const bot=makeBot('CT',name,new THREE.Vector3(60-Math.random()*3,0,-8+i*4));
bots.push(bot);
if(!playerStats[name])playerStats[name]={kills:0,deaths:0,team:'CT'};
}
}

function makeBot(team,name,pos){
const body=createHumanModel(team);
body.position.copy(pos);
scene.add(body);
let bw;
if(roundNum===1)bw=Math.random()<0.5?'p350':'deagle';
else{
const r=['ak47','awm'],p=['p350','deagle'];
bw=Math.random()<0.7?r[Math.floor(Math.random()*r.length)]:p[Math.floor(Math.random()*p.length)];
}
return{team,name,body,pos:pos.clone(),vel:new THREE.Vector3(0,0,0),hp:CONFIG.maxHP,alive:true,weapon:bw,lastShot:0,target:null,moveDir:new THREE.Vector3(),nextDecision:0,spawnPos:pos.clone(),onGround:true};
}

