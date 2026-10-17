// Настройки и состояние игрового сеанса.
const CONFIG={maxHP:100,roundsToWin:8,moveSpeed:0.12,runSpeed:0.22,mouseSens:0.002,prepareTime:20,playerHeight:1.7,jumpForce:0.18,gravity:0.012,playerRadius:0.4};
const WEAPONS={
p350:{name:'P350',damage:28,fireRate:180,magSize:12,reserve:48,reloadTime:1800,recoil:0.03,automatic:true,category:'pistol'},
deagle:{name:'Desert Eagle',damage:55,fireRate:400,magSize:7,reserve:35,reloadTime:2200,recoil:0.08,automatic:false,category:'pistol'},
ak47:{name:'AK-47',damage:30,fireRate:100,magSize:30,reserve:90,reloadTime:2200,recoil:0.05,automatic:true,category:'rifle'},
awm:{name:'AWM',damage:115,fireRate:1500,magSize:5,reserve:20,reloadTime:3500,recoil:0.15,automatic:false,category:'rifle',hasScope:true}
};
const HEADSHOT_MULT=2.5,LIMB_MULT=0.7;
const SKIN_COLORS=[[0x444444,0x222222],[0xff6b35,0x8b0000],[0x4a9eff,0x001a4d],[0xa855f7,0x3b0764],[0xfbbf24,0x78350f]];
const BOT_NAMES_T=['Phoenix','Viper','Ghost','Reaper'];
const BOT_NAMES_CT=['Falcon','Sentinel','Cipher','Echo','Warden'];

let scene,camera,renderer,clock;
let player,bots=[];
let keys={};
let mouse={locked:false,down:false};
let yaw=0,pitch=0;
let selectedSkin=0;
let selectedMap='city';
let username='Player';
let initialWeapon='p350';
let scoreT=0,scoreCT=0,roundNum=1;
let roundPhase='preparing';
let prepareTimer=CONFIG.prepareTime;
let currentWeapon='p350';
let weapon={ammo:12,reserve:48,lastShot:0,reloading:false,mesh:null};
let walls=[];
let buyMenuOpen=false;
let playerStats={};
let scoped=false;
let defaultFov=75;
let spectateIndex=0;
let spectateTarget=null;

