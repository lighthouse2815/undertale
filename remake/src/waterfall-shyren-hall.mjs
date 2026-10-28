import { inInteractionRange, touchesObject } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { startWaterfallMusic } from './waterfall-music.mjs';

const signs = {
  obj_readable_room1:['* The northern room hides a\n  great treasure.'],
  obj_readable_room2:["* This power has no counter.\n* Indeed, a human cannot\n  take a monster's SOUL.", "* When a monster dies, its\n  SOUL disappears.", '* And an incredible power\n  would be needed to take the\n  SOUL of a living monster.'],
  obj_readable_room3:['* There is only one exception.', '* The SOUL of a special species\n  of monster called a\n  "Boss Monster."', "* A Boss Monster's SOUL is\n  strong enough to persist\n  after death...", '* If only for a few moments.', '* A human could absorb this\n  SOUL.\n* But this has never happened.', '* And now it never will.']
};
export class WaterfallShyrenHall {
  constructor(world) {
    this.world=world; this.elapsed=0; this.anim=0; this.trigger=world.plot<=110 ? world.dataSource.room.GameObjects.find(e=>e.ObjectName==='obj_shyrentrigger') : null;
    this.signs=world.roomObjects.filter(e=>signs[e.item.ObjectName]);
    this.falls=world.roomObjects.filter(e=>e.item.ObjectName==='obj_foreground_waterfall').map(e=>{
      e.image.destroy();return {x:e.item.X,y:e.item.Y,tiles:Array.from({length:20},()=>world.add.image(0,0,'spr_waterfall_anim:0').setOrigin(0).setScale(2).setAlpha(.2).setDepth(-e.object.Depth))};
    });
    this.shyren=world.roomObjects.find(e=>e.item.ObjectName==='obj_shyrenmovenpc');this.sister=world.roomObjects.find(e=>e.item.ObjectName==='obj_shyrensisternpc');
    this.sisterTalked=0;this.sisterBuffer=0;this.siner=0;
    if(world.flags[7]!==1){this.shyren.image.destroy();this.sister.image.destroy();this.shyren=null;this.sister=null;}
    else {const e=this.shyren;this.shyrenY=e.item.Y;this.hole=world.add.image(e.item.X+12,e.item.Y+50,'spr_centeredhole:0').setAlpha(.9).setDepth(-600000);e.image.setDepth(-e.object.Depth);this.sister.image.setDepth(this.sister.item.Y+this.sister.sprite.Height);world.colliders.push(createCollider(world.dataSource,this.sister.item));}

    startWaterfallMusic(world,true);this.drawFalls();
  }
  update(delta) {
    this.elapsed=Math.min(200,this.elapsed+delta);
    while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.anim=(this.anim+3)%180;this.step();}
    this.drawFalls();
    if(this.sisterText && this.sisterText.done && !this.sisterText.fadeOut && this.world.justConfirmed())this.sisterText.fadeOut=true;
    return !!this.sisterText;
  }
  step() {
    if(this.sisterBuffer>0)this.sisterBuffer--;
    if(this.shyren){this.siner++;const image=this.shyren.image;image.y+=Math.sin(this.siner/8)/2;image.setTexture(`spr_shyren_overworld:${Math.floor(this.siner*.08)%this.shyren.sprite.TextureCount}`);this.hole.setScale(.5-(this.shyrenY-image.y)/40);}
    const t=this.sisterText;if(!t)return;t.frame++;
    this.sister.image.setTexture(`spr_amalgam_save_npc:${Math.floor(t.frame*.2)%this.sister.sprite.TextureCount}`);
    if(t.frame%2===0 && t.count<t.phrase.length)t.count++;
    if(t.count>=t.phrase.length)t.done=true;
    if(t.frame%3===0){const v=t.copies[Math.floor(Math.random()*t.copies.length)];v.x=this.world.cameras.main.scrollX-50+Math.random()*220;v.y=Math.random()*(this.world.dataSource.room.Height-20);v.fade=-1;}
    if(t.fadeOut)t.opacity-=.1;
    for(const [i,v] of t.copies.entries()){v.fade=Math.min(1,v.fade+.2);v.image.setText(t.phrase.slice(0,t.count)).setPosition(v.x+Math.sin(i+t.frame/5)*5,v.y+Math.cos(i+t.frame/5)*5).setAlpha(Math.max(0,v.fade*t.opacity));}
    if(t.opacity<=0){for(const v of t.copies)v.image.destroy();this.sister.image.setTexture('spr_amalgam_save_npc:0');this.sisterText=null;this.sisterTalked=(this.sisterTalked+1)%3;this.sisterBuffer=4;this.world.release();this.world.interactionCooldown=250;}
  }
  startSisterText() {
    const w=this.world,phrases=["It's good to be\nwith my sister again.",'Part of me wants to\nsee my new "brother"\nAaron.',"But most other parts\nof me... don't."];
    const copies=Array.from({length:6},()=>({x:w.cameras.main.scrollX-50+Math.random()*220,y:Math.random()*(w.dataSource.room.Height-20),fade:0,image:w.add.bitmapText(0,0,'fnt_maintext','',12).setDepth(100001)}));
    this.sisterText={phrase:phrases[this.sisterTalked],count:0,frame:0,opacity:1,copies,done:false,fadeOut:false};w.sound.play('mus_sfx_generate',{volume:.6,rate:.6});w.release();
  }

  drawFalls() {const c=this.world.cameras.main, view=Math.max(0,Math.min(this.world.dataSource.room.Width-320,c.scrollX));for(const f of this.falls)for(const [i,tile] of f.tiles.entries())tile.setPosition(f.x-view*.5,f.y-210+i*30+this.anim);}
  checkTrigger() {
    const w=this.world;if(!this.trigger||w.dialogue||!touchesObject(w,w.player,this.trigger,1,12))return false;
    this.trigger=null;w.plot=Math.max(w.plot,111);w.saveGame(true);w.release();window.__remake.startBattle('shyren');return true;
  }
  interact() {const w=this.world;if(this.sister&&!this.sisterBuffer&&inInteractionRange(w,this.sister)){this.startSisterText();return true;}const e=this.signs.find(e=>inInteractionRange(w,e));if(!e)return false;w.showDialogue(signs[e.item.ObjectName]);return true;}
  destroy() {this.hole?.destroy();for(const v of this.sisterText?.copies??[])v.image.destroy();for(const f of this.falls)for(const tile of f.tiles)tile.destroy();}
}
