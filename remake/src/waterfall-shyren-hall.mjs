import { inInteractionRange, touchesObject } from './npc.mjs';
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
    if(world.flags[7]!==1)for(const e of world.roomObjects.filter(e=>['obj_shyrenmovenpc','obj_shyrensisternpc'].includes(e.item.ObjectName)))e.image?.destroy();
    startWaterfallMusic(world,true);this.drawFalls();
  }
  update(delta) {this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.anim=(this.anim+3)%180;}this.drawFalls();}
  drawFalls() {const c=this.world.cameras.main, view=Math.max(0,Math.min(this.world.dataSource.room.Width-320,c.scrollX));for(const f of this.falls)for(const [i,tile] of f.tiles.entries())tile.setPosition(f.x-view*.5,f.y-210+i*30+this.anim);}
  checkTrigger() {
    const w=this.world;if(!this.trigger||w.dialogue||!touchesObject(w,w.player,this.trigger,1,12))return false;
    this.trigger=null;w.plot=Math.max(w.plot,111);w.saveGame(true);w.release();window.__remake.startBattle('shyren');return true;
  }
  interact() {const w=this.world,e=this.signs.find(e=>inInteractionRange(w,e));if(!e)return false;w.showDialogue(signs[e.item.ObjectName]);return true;}
  destroy() {for(const f of this.falls)for(const tile of f.tiles)tile.destroy();}
}
