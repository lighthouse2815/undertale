import { UndyneBridgeSpears } from './undyne-bridge-spears.mjs';

// obj_undyneencounter4 và obj_starker: đoạn cuối cầu và cú rơi.
export class WaterfallUndyneBridgeEnd {
  constructor(world){
    this.world=world;this.elapsed=0;this.frames=0;this.stage='crossing';this.tiles=new UndyneBridgeSpears(world,{end:true});this.darkPlayer=world.flags[85]!==1;
    this.shadow=world.roomObjects.find(e=>e.item.ObjectName==='obj_starker')?.image;
    if(this.darkPlayer){this.posePlayer();}else{this.shadow?.destroy();this.shadow=null;}
    this.music=world.chaseMusic;world.chaseMusic=null;
    if(!this.music&&world.plot<114){this.music=world.sound.add('mus_undynefast',{loop:true});this.music.play();}
  }
  posePlayer(){const p=this.world.player,key=`spr_mainchara${p.facing}_stark`,s=this.world.dataSource.sprites.get(key);p.setTexture(`${key}:0`).setOrigin(s.OriginX/s.Width,s.OriginY/s.Height);}
  wait(stage,frames){this.stage=stage;this.frames=0;this.duration=frames;}
  checkTrigger(){
    const w=this.world,p=w.player;
    if(this.stage==='crossing'&&p.x>540){this.stage='pursued';this.tiles.destroy();this.tiles=null;this.volume=this.music?.volume??0;this.undyne=w.add.image(w.cameras.main.scrollX-420,100,'spr_undynea_starkr:0').setOrigin(0).setDepth(500);}
    if(this.stage==='pursued'&&p.x<220&&!w.dialogue){w.release();this.cameraStart=w.cameras.main.scrollX;this.wait('pause',30);return true;}
    return false;
  }
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}return !['crossing','pursued','done'].includes(this.stage);}
  step(){
    const w=this.world,p=w.player;this.frames++;
    if(this.shadow)this.shadow.setPosition(p.x,p.y).setDepth(p.depth-100);
    if(this.stage==='crossing'){this.tiles.step();return;}
    if(this.music&&this.stage!=='crossing'&&this.volume>0){this.volume=Math.max(0,this.volume-.01);this.music.setVolume(this.volume);}
    if(this.stage==='pause'&&this.frames>=this.duration)this.wait('pan',0);
    else if(this.stage==='pan'){w.cameras.main.scrollX-=1;if(w.cameras.main.scrollX<this.cameraStart-50)this.wait('advance',140);}
    else if(this.stage==='advance'){this.undyne.x+=1;this.undyne.setTexture(`spr_undynea_starkr:${Math.floor(this.frames*.1)%4}`);if(this.frames>=this.duration){this.undyne.setTexture('spr_undynea_starkr:0');this.wait('stand',60);}}
    else if(this.stage==='stand'&&this.frames>=this.duration){w.sound.play('snd_spearappear');this.wait('warn',30);}
    else if(this.stage==='warn'&&this.frames>=this.duration){w.sound.play('snd_arrow');this.spears=Array.from({length:3},(_,i)=>({speed:24,image:w.add.image(176+i*6+Math.random()*3,-220+i*3+Math.random()*6,'spr_undynespear:0').setOrigin(0).setAngle(-90).setDepth(1000)}));this.wait('spears',0);}
    else if(this.stage==='spears'){
      for(const s of this.spears){s.speed+=.3;s.image.y+=s.speed;}if(this.spears.at(-1).image.y>p.y){w.sound.play('snd_spearrise');w.cameras.main.shake(1000/10,.006);this.wait('impact',30);}
    }else if(this.stage==='impact'&&this.frames>=this.duration){this.shakeX=p.x;this.shakeY=p.y;this.wait('shake',70);}
    else if(this.stage==='shake'){
      const amount=1+this.frames*.08;p.setPosition(this.shakeX+(Math.random()-.5)*amount,this.shakeY+(Math.random()-.5)*amount);if(this.frames>=this.duration){p.setPosition(this.shakeX,this.shakeY);this.fallSpeed=1;this.wait('fall',110);}
    }else if(this.stage==='fall'){
      this.fallSpeed+=.2;p.x+=1;p.y+=this.fallSpeed-.8;p.angle-=.5;w.cameras.main.scrollY+=2;
      if(!this.white)this.white=w.add.rectangle(0,0,320,240,0xffffff,0).setOrigin(0).setScrollFactor(0).setDepth(99999);this.white.alpha=Math.min(1,this.white.alpha+.001);
      if(this.frames>=this.duration){w.sound.play('snd_splash');this.wait('splash',3);}
    }else if(this.stage==='splash'&&this.frames>=this.duration){
      this.white?.destroy();this.white=null;this.black=w.add.rectangle(0,0,320,240,0x000000).setOrigin(0).setScrollFactor(0).setDepth(99999);p.setPosition(20,20).setAngle(0);this.musicbox=w.sound.add('mus_musicbox',{loop:true,volume:0,rate:.7});this.wait('dark',120);
    }else if(this.stage==='dark'&&this.frames>=this.duration){
      this.musicbox.play();this.stage='talking';const name=w.game.registry.get('charname')??'';w.showDialogue(['It sounds like it\ncame from over\nhere...',"Oh! You've fallen\ndown, haven't you...",'Are you okay?','Here, get up...','...',`${name}, huh?`,"That's a nice name."],{onClose:()=>{this.stage='lastLine';w.showDialogue([' My name is'],{onClose:()=>{this.lastClosed=true;}});}});
    }else if(this.stage==='lastLine'){
      this.boxVolume=Math.max(0,(this.boxVolume??1)-.008);this.musicbox.setVolume(this.boxVolume);this.musicbox.setRate(.7+this.frames*.004);
      if(this.boxVolume<=.009&&this.lastClosed){this.stage='transition';this.musicbox.destroy();this.musicbox=null;w.release();w.openRoom('room_water_trashzone1').catch(e=>console.error(e));}
    }else if(this.stage==='talking'&&this.musicbox){this.boxVolume=Math.min(1,(this.boxVolume??0)+.02);this.musicbox.setVolume(this.boxVolume);}
  }
  destroy(){this.tiles?.destroy();this.music?.destroy();this.musicbox?.destroy();this.undyne?.destroy();this.shadow?.destroy();this.white?.destroy();this.black?.destroy();for(const s of this.spears??[])s.image.destroy();}
}
