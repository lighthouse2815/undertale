import {touchesObject} from './npc.mjs';
import text from './waterfall-rain-kid.json' with {type:'json'};

export class WaterfallRainKid {
  constructor(world,spawn,vertical=false){
    if(vertical){
      this.world=world;this.vertical=true;this.elapsed=0;this.frames=0;this.stage=world.plot>112?'done':'following';this.trigger=world.dataSource.room.GameObjects.find(e=>e.ObjectName==='obj_monsterkidtrigger5');
      if(this.stage==='done')return;
      this.sprite=spawn==='obj_markerB'?'spr_mkid_l':'spr_mkid_d';this.kid=world.add.image(world.player.x-8,world.player.y+(spawn==='obj_markerB'?8:0),`${this.sprite}:0`).setOrigin(0).setDepth(world.player.y+30);return;
    }
    this.world=world;this.elapsed=0;this.frames=0;this.stage=world.plot>113?'done':'waiting';this.trigger=world.dataSource.room.GameObjects.find(e=>e.ObjectName==='obj_monsterkidtrigger3');this.last=world.dataSource.room.GameObjects.find(e=>e.ObjectName==='obj_monsterkidtrigger4');this.lastDone=(world.flags[91]??0)>0;this.numero=(world.flags[90]??0)>0?1:0;
    if(this.stage==='done')return;
    this.kid=world.add.image(this.trigger.X+20,this.trigger.Y,'spr_mkid_d:0').setOrigin(0).setDepth(this.trigger.Y+30);
    if(spawn==='obj_markerB'){this.stage='following';this.numero=2;this.kid.setPosition(world.player.x-8,world.player.y+8);}
  }
  show(ids,callback){const w=this.world;this.stage='talking';w.release();w.showDialogue(ids.map(id=>text[`obj_monsterkidtrigger${id}`]),{onClose:callback});}
  checkTrigger(previous){
    const w=this.world;if(w.dialogue||!['waiting','following'].includes(this.stage))return false;
    if(this.vertical){
      if(this.stage==='following'&&(w.flags[91]??0)<4&&touchesObject(w,w.player,this.trigger,9,9)){
        w.player.setPosition(previous.x,Math.max(864,Math.min(908,previous.y)));w.flags[91]=4;this.pose('spr_mkid_dt');this.show(['5_91','5_92'],()=>{this.stage='following';});return true;
      }
      return false;
    }
    if(this.stage==='waiting'&&touchesObject(w,w.player,this.trigger,1,10)){
      w.player.setPosition(previous.x,previous.y);const flag=w.flags[90]??0,has=w.flags[85]===1;let ids;
      if(flag===3)ids=['3_134'];else if(flag===2)ids=has?['3_146']:['3_140','3_141'];else if(flag===1)ids=has?['3_158','3_159']:['3_154'];else ids=has?['3_167','3_168']:['3_173','3_174'];
      if(flag===2&&!has)w.flags[90]=3;else if(flag<2&&has)w.flags[90]=2;else if(flag===0&&!has)w.flags[90]=1;
      this.pose('spr_mkid_dt');this.show(ids,()=>{this.stage='approach';this.timer=30;});return true;
    }
    if(this.stage==='following'&&!this.lastDone&&touchesObject(w,w.player,this.last,1,20)){
      w.player.setPosition(previous.x,previous.y);this.pose('spr_mkid_rt');this.show(['4_66','4_67','4_68','4_69'],()=>{w.flags[91]=1;this.lastDone=true;this.stage='following';});return true;
    }
    if(this.stage==='following'&&w.player.x<80){w.player.setPosition(previous.x,previous.y);this.pose('spr_mkid_lt');this.show(this.numero>0?['3_286']:['3_284','3_285'],()=>{this.stage='exit';this.timer=30;});return true;}
    return false;
  }
  pose(key){this.sprite=key;this.kid.setTexture(`${key}:0`);}
  update(delta){if(!this.kid)return false;this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}return !['waiting','following','done'].includes(this.stage);}
  step(){
    if(!this.kid)return;const w=this.world,p=w.player;this.frames++;
    if(this.stage==='approach'){
      const tx=p.x-6,ty=p.y>=142?p.y-2:p.y+8,dx=tx-this.kid.x,dy=ty-this.kid.y,dist=Math.hypot(dx,dy);if(dist>2){this.kid.x+=dx/dist*2;this.kid.y+=dy/dist*2;}else this.kid.setPosition(tx,ty);
      if(this.timer>0)this.timer--;if(this.timer<=0&&dist<=4){this.pose('spr_mkid_rt');this.show(['3_201'],()=>{this.stage='following';this.pose('spr_mkid_r');});}
    }else if(this.stage==='following'){
      const dx=p.x-this.kid.x,dy=p.y-this.kid.y,dist=Math.hypot(dx,dy);if(dist>12){const speed=Math.min(4,dist-12);this.kid.x+=dx/dist*speed;this.kid.y+=dy/dist*speed;this.sprite=Math.abs(dx)>Math.abs(dy)?dx<0?'spr_mkid_l':'spr_mkid_r':dy<0?'spr_mkid_u':'spr_mkid_d';}
      if(this.vertical&&this.kid.y>520&&(w.flags[91]??0)<3){w.flags[91]=3;this.pose('spr_mkid_rt');this.stage='flowerWait';this.timer=25;}
    }else if(this.stage==='flowerWait'&&--this.timer<=0){
      this.stage='talking';w.release();w.showDialogue([337,338,339,340,341,342,343].map(id=>text[`obj_mkid_actor_${id}`]),{onClose:()=>{this.stage='following';this.pose('spr_mkid_d');}});
    }else if(this.stage==='exit'){this.kid.x+=8;if(--this.timer<=0){this.kid.destroy();this.kid=w.add.image(this.trigger.X+20,this.trigger.Y,'spr_mkid_d:0').setOrigin(0).setDepth(this.trigger.Y+30);this.sprite='spr_mkid_d';this.numero=2;this.stage='waiting';return;}}
    const s=w.dataSource.sprites.get(this.sprite??'spr_mkid_d');this.kid.setTexture(`${this.sprite??'spr_mkid_d'}:${Math.floor(this.frames*.25)%s.TextureCount}`).setDepth(this.kid.y+s.Height);
  }
  destroy(){this.kid?.destroy();}
}
