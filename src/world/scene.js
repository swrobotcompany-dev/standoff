// Three.js-сцена, карты и коллизии.
function initScene(){
scene=new THREE.Scene();
if(selectedMap==='city'){
scene.background=new THREE.Color(0x87ceeb);
scene.fog=new THREE.Fog(0x87ceeb,80,300);
}else{
scene.background=new THREE.Color(0xe8c170);
scene.fog=new THREE.Fog(0xe8c170,80,300);
}
camera=new THREE.PerspectiveCamera(defaultFov,innerWidth/innerHeight,0.1,500);
renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const sun=new THREE.DirectionalLight(0xffffff,0.8);
sun.position.set(50,80,30);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-120;sun.shadow.camera.right=120;
sun.shadow.camera.top=120;sun.shadow.camera.bottom=-120;
scene.add(sun);
buildMap();
createPlayer();
spawnBots();
createWeaponView();
clock=new THREE.Clock();
addEventListener('resize',()=>{
camera.aspect=innerWidth/innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(innerWidth,innerHeight);
});
}

function buildMap(){
walls=[];
if(selectedMap==='city')buildCityMap();
else buildDesertMap();
}

function buildCityMap(){
const floor=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0x5a6b4a}));
floor.rotation.x=-Math.PI/2;
floor.receiveShadow=true;
scene.add(floor);
const road=new THREE.Mesh(new THREE.PlaneGeometry(20,200),new THREE.MeshStandardMaterial({color:0x3a3a3a}));
road.rotation.x=-Math.PI/2;
road.position.y=0.01;
scene.add(road);
const wm=new THREE.MeshStandardMaterial({color:0x8a8a8a});
addWall([0,5,-100],[200,10,3],wm);
addWall([0,5,100],[200,10,3],wm);
addWall([-100,5,0],[3,10,200],wm);
addWall([100,5,0],[3,10,200],wm);
const bm=new THREE.MeshStandardMaterial({color:0x9c5a3c});
const wdm=new THREE.MeshStandardMaterial({color:0x6b4423});
// Стены по бокам (без центральной постройки!)
addWall([-40,2.5,-30],[15,5,3],bm);
addWall([40,2.5,30],[15,5,3],bm);
addWall([-30,2.5,40],[8,5,3],bm);
addWall([30,2.5,-40],[8,5,3],bm);
// Ящики по всей карте (не в центре)
[[-25,1.5,-15],[25,1.5,-15],[-25,1.5,15],[25,1.5,15],[-35,1.5,0],[35,1.5,0],[0,1.5,-35],[0,1.5,35],[-50,1.5,-50],[50,1.5,50],[-50,1.5,50],[50,1.5,-50]].forEach(p=>addWall(p,[3,3,3],wdm));
}

function buildDesertMap(){
const floor=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0xd4a574}));
floor.rotation.x=-Math.PI/2;
floor.receiveShadow=true;
scene.add(floor);
const wm=new THREE.MeshStandardMaterial({color:0xb8956a});
addWall([0,5,-100],[200,10,3],wm);
addWall([0,5,100],[200,10,3],wm);
addWall([-100,5,0],[3,10,200],wm);
addWall([100,5,0],[3,10,200],wm);
const rm=new THREE.MeshStandardMaterial({color:0x8b6f47});
const sm=new THREE.MeshStandardMaterial({color:0xa67c52});
// Камни по углам и сторонам (без центральной скалы!)
addWall([-45,2,-35],[10,4,10],rm);
addWall([45,2,35],[10,4,10],rm);
addWall([-45,2,35],[8,4,3],sm);
addWall([45,2,-35],[8,4,3],sm);
addWall([-20,2,50],[3,4,15],sm);
addWall([20,2,-50],[3,4,15],sm);
addWall([-60,2,0],[8,4,3],rm);
addWall([60,2,0],[8,4,3],rm);
// Камни-укрытия (не в центре)
[[-30,1.5,-20],[30,1.5,-20],[-30,1.5,20],[30,1.5,20],[-70,1.5,-70],[70,1.5,70],[-70,1.5,70],[70,1.5,-70]].forEach(p=>addWall(p,[3,3,3],rm));
}

function addWall(pos,size,mat){
const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);
mesh.position.set(pos[0],pos[1],pos[2]);
mesh.castShadow=true;
mesh.receiveShadow=true;
scene.add(mesh);
walls.push({
mesh,
min:new THREE.Vector3(pos[0]-size[0]/2,pos[1]-size[1]/2,pos[2]-size[2]/2),
max:new THREE.Vector3(pos[0]+size[0]/2,pos[1]+size[1]/2,pos[2]+size[2]/2)
});
}

function checkWallCollisionXZ(x,z,radius){
for(const w of walls){
if(w.max.y<0.5)continue;
const cx=Math.max(w.min.x,Math.min(x,w.max.x));
const cz=Math.max(w.min.z,Math.min(z,w.max.z));
const dx=x-cx,dz=z-cz;
if(dx*dx+dz*dz<radius*radius)return true;
}
return false;
}

function resolveWallCollision(pos,radius){
for(const w of walls){
if(w.max.y<0.5)continue;
const cx=Math.max(w.min.x,Math.min(pos.x,w.max.x));
const cz=Math.max(w.min.z,Math.min(pos.z,w.max.z));
const dx=pos.x-cx,dz=pos.z-cz;
const ds=dx*dx+dz*dz;
if(ds<radius*radius&&ds>0.0001){
const d=Math.sqrt(ds);
const p=(radius-d)/d;
pos.x+=dx*p;
pos.z+=dz*p;
}else if(ds<0.0001){
const dists=[
{axis:'x',dir:-1,d:pos.x-w.min.x},
{axis:'x',dir:1,d:w.max.x-pos.x},
{axis:'z',dir:-1,d:pos.z-w.min.z},
{axis:'z',dir:1,d:w.max.z-pos.z}
];
dists.sort((a,b)=>a.d-b.d);
const n=dists[0];
if(n.axis==='x')pos.x+=n.dir*(n.d+radius+0.01);
else pos.z+=n.dir*(n.d+radius+0.01);
}
}
}

