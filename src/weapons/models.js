// Lightweight procedural weapon meshes; no external model downloads required.
function weaponBox(gun,mat,size,pos,rotationX=0){
const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);
o.position.set(...pos);
o.rotation.x=rotationX;
o.castShadow=true;
gun.add(o);
return o;
}
function weaponTube(gun,mat,radius,length,pos){
const o=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,12),mat);
o.rotation.x=Math.PI/2;
o.position.set(...pos);
o.castShadow=true;
gun.add(o);
return o;
}
function buildAdditionalWeapon(gun,kind,mm,sm,dm,gm){
if(kind==='mp7'){
weaponBox(gun,mm,[0.115,0.145,0.39],[0,0,0]);
weaponBox(gun,sm,[0.095,0.115,0.22],[0,-0.01,-0.19]);
weaponBox(gun,dm,[0.07,0.14,0.13],[0,-0.12,0.13],-0.24);
weaponBox(gun,dm,[0.062,0.19,0.085],[0,-0.23,0.14],-0.18);
weaponBox(gun,gm,[0.055,0.09,0.06],[0,-0.105,-0.14],-0.14);
weaponBox(gun,dm,[0.033,0.055,0.36],[0,0.06,0.19]);
weaponBox(gun,gm,[0.11,0.14,0.043],[0,-0.01,0.4]);
weaponTube(gun,dm,0.027,0.17,[0,0.006,-0.33]);
weaponTube(gun,gm,0.04,0.065,[0,0.006,-0.43]);
weaponBox(gun,gm,[0.055,0.018,0.24],[0,0.09,-0.06]);
weaponBox(gun,gm,[0.038,0.065,0.035],[0,0.125,-0.16]);
weaponBox(gun,gm,[0.04,0.065,0.035],[0,0.125,0.11]);
gun.position.set(0.29,-0.22,-0.49);
}else if(kind==='m870'||kind==='spas12'){
const tactical=kind==='spas12';
weaponBox(gun,mm,[0.135,0.14,0.64],[0,0,0]);
weaponBox(gun,sm,[0.12,0.18,0.41],[0,-0.035,0.46]);
weaponBox(gun,gm,[0.12,0.20,0.075],[0,-0.03,0.7]);
weaponBox(gun,dm,[0.075,0.17,0.12],[0,-0.13,0.14],-0.27);
weaponBox(gun,gm,[0.09,0.02,0.23],[0,0.09,-0.31]);
weaponTube(gun,dm,0.037,0.9,[0,0.055,-0.64]);
weaponTube(gun,gm,0.03,0.72,[0,-0.015,-0.56]);
weaponTube(gun,dm,0.05,0.065,[0,0.055,-1.12]);
weaponBox(gun,sm,[0.14,0.115,0.3],[0,-0.01,-0.34]);
weaponBox(gun,gm,[0.025,0.035,0.025],[0,0.105,-1.04]);
for(let i=0;i<4;i++){
weaponBox(gun,gm,[0.014,0.014,0.085],[0.077,-0.015,-0.41+i*0.075]);
}
if(tactical){
weaponBox(gun,gm,[0.025,0.1,0.38],[0,0.085,0.43]);
weaponBox(gun,dm,[0.15,0.025,0.12],[0,0.105,-0.12]);
weaponBox(gun,dm,[0.025,0.11,0.27],[0,-0.02,0.53]);
}else{
for(let i=0;i<3;i++)weaponTube(gun,gm,0.022,0.07,[0.087,0.02,-0.02+i*0.09]);
}
gun.position.set(0.3,-0.27,-0.65);
}
}
function decorateWeapon(gun,kind,mm,sm,dm,gm){
if(kind==='mp7'||kind==='m870'||kind==='spas12'){
buildAdditionalWeapon(gun,kind,mm,sm,dm,gm);
return;
}
// Ejection port, machined slide details, rear sights and trigger guard.
const pistol=kind==='p350'||kind==='deagle';
const length=pistol?0.22:0.48;
weaponBox(gun,dm,[0.008,0.04,length*0.27],[pistol?0.047:0.077,0.045,-0.04]);
weaponBox(gun,gm,[0.012,0.016,length],[0,0.094,pistol?-0.015:-0.11]);
weaponBox(gun,dm,[0.025,0.036,0.025],[0,0.107,pistol?0.09:0.08]);
weaponBox(gun,gm,[0.07,0.018,0.08],[0,-0.07,0.015]);
weaponBox(gun,sm,[0.045,0.1,0.09],[0,-0.12,pistol?0.07:0.27],-0.25);
if(!pistol){
weaponBox(gun,gm,[0.07,0.04,0.2],[0,0.09,-0.24]);
for(let i=0;i<5;i++){
weaponBox(gun,dm,[0.012,0.015,0.015],[0.062,0.02,-0.36+i*0.055]);
}
}else{
for(let i=0;i<4;i++){
weaponBox(gun,gm,[0.007,0.048,0.009],[0.047,-0.09,0.025+i*0.028]);
}
}
}
