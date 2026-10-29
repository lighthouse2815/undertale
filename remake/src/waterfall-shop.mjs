import { Scene } from '../vendor/phaser.esm.min.js';
import { registerBitmapFont } from './fonts.mjs';
import { addItem } from './inventory.mjs';
import { murderLevel } from './route.mjs';
import { startWaterfallQuietMusic } from './waterfall-music.mjs';
import dialogue from './waterfall-shop-dialogue.json' with {type:'json'};
import inventory from './inventory.json' with {type:'json'};

const ids=[37,41,44,45],prices=[25,18,30,55];
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>dialogue[`obj_shop2_${a+i}`]);

// obj_shop2: cửa hàng Gerson, bao gồm nhánh tuyến giết và sau kết thúc.
export class WaterfallShop extends Scene {
  constructor(key = 'WaterfallShop'){super(key);}
  preload(){
    const base=new URL('../assets/',import.meta.url);
    for(const [key,count] of [['spr_shop2_bg',1],['spr_shopkeeper2_body',1],['spr_shopkeeper2_arm',1],['spr_shopkeeper2_mouthbottom',1],['spr_shopkeeper2_mouthtop',1],['spr_shopkeeper2_eyes',5],['spr_heartsmall',1]])for(let i=0;i<count;i++)if(!this.textures.exists(`${key}:${i}`))this.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
    if(!this.cache.bitmapFont.exists('fnt_maintext')){this.load.json('fnt_maintext',new URL('fonts/fnt_maintext/fnt_maintext.json',base).href);this.load.image('fnt_maintext',new URL('fonts/fnt_maintext/fnt_maintext.png',base).href);}
    for(const [key,ext] of [['mus_shop','ogg'],['snd_buyitem','wav'],['snd_select','wav']])if(!this.cache.audio.exists(key))this.load.audio(key,new URL(`sounds/${key}/${key}.${ext}`,base).href);
    this.assetError=null;this.onAssetError=file=>{this.assetError=new Error(`Không tải được tài nguyên ${file.key}.`);};this.load.on('loaderror',this.onAssetError);this.events.once('shutdown',()=>this.load.off('loaderror',this.onAssetError));
  }
  create(){
    if(this.assetError){Object.assign(window.__remake,{phase:'error',error:this.assetError.message});return;}
    if(!this.cache.bitmapFont.exists('fnt_maintext'))registerBitmapFont(this,'fnt_maintext',this.cache.json.get('fnt_maintext'));
    this.world=this.game.scene.getScene('World');this.violent=murderLevel(this.world.flags)>=10;this.mode='main';this.selection=0;this.selected=0;this.side=0;this.sales=0;this.mainMessage=0;this.pages=null;this.pageIndex=0;this.speakingFrames=0;this.speakingTime=100;this.animationElapsed=0;
    if(this.world.flags[7]!==1){this.music=this.sound.add('mus_shop',{loop:true,volume:.8,rate:this.violent?.2:.93});this.music.play();}
    this.events.once('shutdown',()=>this.music?.destroy());this.onKey=event=>{if(!event.repeat)this.key(event.code);};window.addEventListener('keydown',this.onKey);this.events.once('shutdown',()=>window.removeEventListener('keydown',this.onKey));
    Object.assign(window.__remake,{phase:'shop',room:'room_shop2',scene:this});this.draw();
  }
  text(x,y,value,size=12){return this.add.bitmapText(x,y,'fnt_maintext',value??'',size);}
  box(x,y,w,h){this.add.rectangle(x,y,w,h,0xffffff).setOrigin(0);this.add.rectangle(x+4,y+4,w-8,h-8,0).setOrigin(0);}
  draw(){
    this.children.removeAll(true);const w=this.world;this.add.image(0,0,'spr_shop2_bg:0').setOrigin(0);
    this.keeperParts=[['spr_shopkeeper2_arm',100,68],['spr_shopkeeper2_body',146,84],['spr_shopkeeper2_mouthbottom',142,75],['spr_shopkeeper2_mouthtop',130,44],['spr_shopkeeper2_eyes',130,59]].map(([key,x,y])=>({x,y,image:this.add.image(x,y,`${key}:0`).setOrigin(0)}));this.animateKeeper();
    const divided=this.mode!=='pages';this.box(0,120,320,120);if(divided)this.add.rectangle(210,124,4,112,0xffffff).setOrigin(0);
    if(this.mode==='main'){
      const msg=this.violent?237:w.flags[7]===1?236:this.mainMessage?234:235;this.text(10,129,dialogue[`obj_shop2_${msg}`]);
      ['Buy','Sell','Talk','Exit'].forEach((v,i)=>this.text(240,130+i*20,v));this.add.image(225,134+this.selection*20,'spr_heartsmall:0').setOrigin(0);
    }else if(this.mode==='buy'||this.mode==='confirm'){
      ids.forEach((id,i)=>this.text(30,130+i*20,`${prices[i]}G - ${inventory.items[id].name}`));this.text(30,210,'Exit');this.add.image(15,134+this.selection*20,'spr_heartsmall:0').setOrigin(0);
      if(this.selection<4){const d=5-w.armorDefense,a=2-w.weaponStrength,sign=n=>n>=0?`+${n}`:String(n),info=['Heals 18HP\n(Looks\nlike a\ncrab.)','Heals 10HP\nSPEED\nup in\nbattle.',`Armor: 5DF\n(${sign(d)} DF)\nInvincible\nlonger`,`Weapon: 2AT\n(${sign(a)} AT)\nInvincible\nlonger`];this.box(0,53,210,67);this.text(10,58,info[this.selection]);}
      if(this.mode==='buy'){const n=(this.violent?295:287)+this.side;this.text(216,130,dialogue[`obj_shop2_${n}`]);}
      else{this.text(216,130,`Buy it for\n${prices[this.selection]}G ?\n\n  Yes\n  No`);this.add.image(215,174+this.selected*15,'spr_heartsmall:0').setOrigin(0);}
    }else if(this.mode==='talk'){
      this.titles().forEach((v,i)=>{const label=this.text(30,130+i*20,v);if(label.width>170)label.setScale(170/label.width,1);});this.text(30,210,'Exit');this.add.image(15,134+this.selection*20,'spr_heartsmall:0').setOrigin(0);this.text(216,130,dialogue[`obj_shop2_${this.violent?392:390}`]);
    }else if(this.mode==='pages')this.text(10,128,this.pages[this.pageIndex]);
    if(divided){this.text(230,210,`${w.gold}G`);this.text(280,210,`${w.inventory.length}/8`);}
  }
  update(_time,delta){
    if(window.__remake.phase!=='shop'||window.__remake.scene!==this)return;
    this.animationElapsed=Math.min(200,this.animationElapsed+delta);
    while(this.animationElapsed>=1000/30){this.animationElapsed-=1000/30;if(this.speakingTime>0){this.speakingTime--;this.speakingFrames=(this.speakingFrames+1)%12;}else if(this.speakingFrames>0)this.speakingFrames=(this.speakingFrames+1)%12;}
    this.animateKeeper();
  }
  animateKeeper(){
    if(!this.keeperParts)return;const phase=this.speakingFrames>=6?4:this.speakingFrames>=3?2:0;
    for(const [index,part] of this.keeperParts.entries())part.image.setPosition(part.x+(index===0?phase:0),part.y+(index===0?phase/2:index>=3?phase:0));
  }
  titles(){const f=this.world.flags;if(f[7]===1)return [5,6,7,8].map(n=>dialogue[`shop2_talk${n}_title`]);if(this.violent)return [9,10,11,12].map(n=>dialogue[`shop2_talk${n}_title`]);return [dialogue.shop2_talk1_title,dialogue[`shop2_talk2${['a','b','c','d'][Math.min(3,f[96]??0)]}_title`],dialogue.shop2_talk3_title,dialogue.shop2_talk4_title];}
  show(pages,after){this.mode='pages';this.pages=pages;this.pageIndex=0;this.afterPages=after;this.speakingTime=pages[0].length*2;}
  talk(index){
    const f=this.world.flags,violent=this.violent;let pages;
    if(index===0)pages=f[7]===1?range(478,489):violent?range(468,473):range(462,463);
    else if(index===1){const level=Math.min(3,f[96]??0);pages=level===0?range(524,529):level===1?range(516,519):level===2?range(503,509):range(497,498);f[96]=Math.min(3,level+1);if(f[7]===1)pages=range(537,549);if(violent)pages=range(555,558);}
    else if(index===2)pages=violent?range(584,588):f[7]===1?range(573,578):range(564,569);
    else pages=violent?range(612,617):f[7]===1?range(601,606):range(595,598);
    this.show(pages,()=>{this.mode='talk';this.selection=index;});
  }
  key(code){
    if(['ArrowUp','ArrowDown'].includes(code)&&this.mode!=='pages'){const max=this.mode==='main'?3:this.mode==='confirm'?1:4;const dir=code==='ArrowDown'?1:-1;if(this.mode==='confirm')this.selected=(this.selected+dir+2)%2;else this.selection=(this.selection+dir+max+1)%(max+1);this.draw();return;}
    if(['KeyX','Escape','ShiftLeft','ShiftRight'].includes(code)){
      if(this.mode==='buy'||this.mode==='talk'){this.mode='main';this.selection=0;this.mainMessage=1;}else if(this.mode==='confirm'){this.mode='buy';this.side=2;}this.draw();return;
    }
    if(!['KeyZ','Enter'].includes(code))return;
    if(this.mode!=='pages')this.speakingTime=0;
    if(this.mode==='pages')this.nextPage();
    else if(this.mode==='main'){
      const choice=this.selection;this.mainMessage=1;this.selection=0;
      if(choice===0){this.mode='buy';this.side=0;}else if(choice===2)this.mode='talk';
      else if(choice===1){const pages=this.violent?[dialogue.obj_shop2_448]:this.sales++? [dialogue.obj_shop2_444]:range(438,442);this.show(pages,()=>{this.mode='main';});}
      else this.show([dialogue[`obj_shop2_${this.violent?456:454}`]],()=>this.leave());
    }else if(this.mode==='buy'){if(this.selection===4){this.mode='main';this.selection=0;}else{this.mode='confirm';this.selected=0;}}
    else if(this.mode==='confirm'){
      if(this.selected===1)this.side=2;
      else if(this.world.gold<prices[this.selection])this.side=3;
      else if(!addItem(this.world,ids[this.selection]))this.side=4;
      else{this.world.gold-=prices[this.selection];this.sound.play('snd_buyitem');this.side=1;}
      this.mode='buy';
    }else if(this.mode==='talk'){if(this.selection===4){this.mode='main';this.selection=0;}else this.talk(this.selection);}
    if(window.__remake.scene===this)this.draw();
  }
  nextPage(){if(++this.pageIndex>=this.pages.length){this.speakingTime=0;this.afterPages();}else this.speakingTime=this.pages[this.pageIndex].length*2;}
  leave(){
    const w=this.world;this.scene.stop();this.scene.resume('World');w.player.setPosition(150,90);w.player.facing='d';w.player.setTexture('spr_maincharad:0');w.updateCamera();w.release();w.confirmDown=false;w.confirmPressed=false;w.confirmWasDown=false;w.interactionCooldown=250;
    Object.assign(window.__remake,{phase:'running',room:'room_water_shop',scene:w});if(w.flags[7]!==1)startWaterfallQuietMusic(w);w.cameras.main.fadeIn(13*1000/30);
  }
}
