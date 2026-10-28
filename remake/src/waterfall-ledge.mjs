import { Geom } from '../vendor/phaser.esm.min.js';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { createCollider } from './movement.mjs';

// obj_monsterkidtrigger6: mỏm đá, tương tác và Kid cho người chơi trèo qua.
export class WaterfallLedge {
  constructor(world,spawn){
    this.world=world;this.elapsed=0;this.frames=0;this.timer=0;this.side=spawn==='obj_markerB'?1:0;this.stage='done';
    this.aaron=world.roomObjects.find(e=>e.item.ObjectName==='obj_aaronnpc');this.aaronTalked=0;
    if(this.aaron){if(world.plot<=121||(world.flags[204]??0)!==0){this.aaron.image.destroy();this.aaron=null;}else{world.colliders.push(createCollider(world.dataSource,this.aaron.item));this.aaron.image.setDepth(this.aaron.item.Y+this.aaron.sprite.MarginBottom);}}
    this.wall={objectName:'obj_solidextall_2',rectangle:new Geom.Rectangle(this.side?320:340,60,20,80)};world.colliders.push(this.wall);
    if(world.plot<112&&spawn==='obj_markerA'){this.stage='following';this.kid=world.add.image(world.player.x-8,world.player.y,'spr_mkid_d:0').setOrigin(0);this.sprite='spr_mkid_d';}
    else if(world.plot===112){this.stage='ready';this.kid=world.add.image(320,100,'spr_mkid_prostrate:0').setOrigin(0);this.sprite='spr_mkid_prostrate';}
  }
  pose(key){this.sprite=key;this.kid.setTexture(`${key}:0`);}
  interact(){
    const w=this.world;
    if(this.aaron&&inInteractionRange(w,this.aaron)){
      let lines=this.aaronTalked?['* And flexing ; )']:['* Since you flexed at me,\n  I\'ve been thinking of a\n  lot of things ; )','* Like...\n* Flexing ; )'];
      if(w.flags[7]===1)lines=['* You came all this way to\n  see me flex ; )','* This really says something\n  about you ; )'];
      if(w.flags[95]===1)lines=w.flags[7]===1?["* First ghosts, are real, now\n  anime's real ; )\n* All my nightmares are true ; )"]:["* I... I'm sc-scared... ; )","* Ghosts aren't real, right?\n* ; )","* What? They are real?\n* Oh nooooooo ; )"];
      this.aaronTalked++;w.showDialogue(lines);return true;
    }
    if(!this.kid||!['waiting','thinking','ready'].includes(this.stage))return false;
    const item={X:this.kid.x,Y:this.kid.y,ScaleX:1,ScaleY:1},sprite=w.dataSource.sprites.get(this.sprite),entry={item,sprite,object:{Sprite:this.sprite}};
    if(!inInteractionRange(w,entry))return false;
    if(this.stage==='ready'){
      if(w.flags[85]===1){w.showDialogue(["* Yo, you aren't going to\n  be able to climb with\n  an umbrella."]);return true;}
      this.stage='climb1';this.timer=10;this.startX=w.player.x;this.startY=w.player.y;w.release();return true;
    }
    if(this.stage==='thinking'){w.showDialogue(['* Hmmm...']);return true;}
    this.pose('spr_mkid_rt');w.showDialogue(['* Yo, this ledge is way\n  too steep...'],{onClose:()=>{this.stage='thinking';this.timer=120;}});return true;
  }
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}return ['climb1','climbWait','climb2','climbPause','kidTurn','departure','trip','tripWait'].includes(this.stage);}
  step(){
    const w=this.world,p=w.player;this.frames++;
    if(this.stage==='following'){
      if(p.x>120){this.stage='run';this.pose('spr_mkid_r');}
      else {const dx=p.x-8-this.kid.x,dy=p.y-this.kid.y,d=Math.hypot(dx,dy);if(d>12){this.kid.x+=dx/d*Math.min(4,d-12);this.kid.y+=dy/d*Math.min(4,d-12);}}
    }else if(this.stage==='run'){
      const dx=320-this.kid.x,dy=100-this.kid.y,d=Math.hypot(dx,dy);if(d>4){this.kid.x+=dx/d*4;this.kid.y+=dy/d*4;}else{this.kid.setPosition(320,100);this.pose('spr_mkid_rt');this.stage='waiting';}
    }else if(this.stage==='thinking'&&this.timer>0&&--this.timer===0){
      this.stage='talking';w.release();w.showDialogue(['* Yo, you wanna see\n  Undyne, right...?',w.flags[85]===1?'* Put up your umbrella and\n  climb on my shoulders.':'* Climb on my shoulders.'],{onClose:()=>{w.plot=112;this.pose('spr_mkid_prostrate');this.stage='ready';}});
    }else if(this.stage==='climb1'){
      const t=(11-this.timer)/10;p.setPosition(this.startX+(this.kid.x-this.startX)*t,this.startY+(this.kid.y-18-this.startY)*t);if(--this.timer===0){this.stage='climbWait';this.timer=20;}
    }else if(this.stage==='climbWait'&&--this.timer===0){this.stage='climb2';this.timer=10;this.startX=p.x;this.startY=p.y;}
    else if(this.stage==='climb2'){
      const t=(11-this.timer)/10;p.setPosition(this.startX+(345-this.startX)*t,this.startY+(70-this.startY)*t);if(--this.timer===0){this.stage='climbPause';this.timer=30;}
    }else if(this.stage==='climbPause'&&--this.timer===0){this.pose('spr_mkid_rt');this.stage='kidTurn';this.timer=20;}
    else if(this.stage==='kidTurn'&&--this.timer===0){
      this.side=1;this.wall.rectangle.x=320;this.stage='talking';const violent=murderLevel(w.flags)>=9&&!w.flags[27];w.showDialogue(violent?['* Owww...\n* Yo, try being a little\n  less rough, haha.',"* Anyway, I'll look for\n  another way through.\n* Later!"]:['* Yo, you go on ahead.',"* Don't worry about me.\n* I always find a way to\n  get through!"],{onClose:()=>{this.stage='departure';this.timer=12;this.pose('spr_mkid_l');}});
    }else if(this.stage==='departure'){this.kid.x-=5;if(--this.timer===0){this.stage='trip';this.timer=57;this.pose('spr_mkid_trip_l');}}
    else if(this.stage==='trip'&&--this.timer===0){this.kid.x-=13;this.pose('spr_mkid_l');this.stage='tripWait';this.timer=25;}
    else if(this.stage==='tripWait'&&--this.timer===0){w.plot=113;w.flags[91]=10;this.stage='leaving';}
    else if(this.stage==='leaving'){this.kid.x-=3;if(this.kid.x<-50){this.kid.destroy();this.kid=null;this.stage='done';}}
    if(this.kid){const data=w.dataSource.sprites.get(this.sprite);this.kid.setTexture(`${this.sprite}:${['run','departure','trip','leaving'].includes(this.stage)?Math.floor(this.frames*.334)%data.TextureCount:0}`).setDepth(this.kid.y+30);}
  }
  destroy(){this.kid?.destroy();}
}
