import { inInteractionRange } from './npc.mjs';
import { updateWaterfallRain } from './waterfall-music.mjs';

export class WaterfallPreUndyne {
  constructor(world){
    this.world=world;this.elapsed=0;this.signs=world.roomObjects.filter(e=>['obj_readable_room1','obj_readable_room2'].includes(e.item.ObjectName));
    if(world.flags[7]!==1){
      world.waterfallRainMix ??= {deep:.5,normal:0};
      world.waterfallRain ??= world.sound.add('mus_rain_deep',{loop:true,volume:.5,rate:.9});if(!world.waterfallRain.isPlaying)world.waterfallRain.play();
      world.waterfallRainLight ??= world.sound.add('mus_rain',{loop:true,volume:0,rate:.9});if(!world.waterfallRainLight.isPlaying)world.waterfallRainLight.play();
    }
    this.shade=world.add.rectangle(0,0,320,240,0x000000,.5).setOrigin(0).setScrollFactor(0).setDepth(-200);
  }
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;updateWaterfallRain(this.world,true);}this.shade.setAlpha(Math.max(0,.5-Math.max(0,this.world.cameras.main.scrollX)/100));}
  interact(){const sign=this.signs.find(e=>inInteractionRange(this.world,e));if(!sign)return false;this.world.showDialogue(sign.item.ObjectName==='obj_readable_room1'?['* The humans, afraid of our\n  power, declared war on us.','* They attacked suddenly, and\n  without mercy.']:['* In the end, it could\n  hardly be called a war.','* United, the humans were too\n  powerful, and us monsters,\n  too weak.','* Not a single SOUL was taken,\n  and countless monsters were\n  turned to dust...']);return true;}
  destroy(){this.shade.destroy();}
}
