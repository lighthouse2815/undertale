import {createCollider} from './movement.mjs';
import {inInteractionRange} from './npc.mjs';

export class WaterfallUmbrellaRoom {
  constructor(world){
    this.world=world;if(world.flags[7]!==1){this.rain=world.waterfallRain ??= world.sound.add('mus_rain_deep',{loop:true,volume:.5,rate:.9});if(!this.rain.isPlaying)this.rain.play();}this.elapsed=0;this.anim=0;this.box=world.roomObjects.find(e=>e.item.ObjectName==='obj_umbrellabox');this.sign=world.roomObjects.find(e=>e.item.ObjectName==='obj_sign_room');
    for(const e of [this.box,this.sign]){world.colliders.push(createCollider(world.dataSource,e.item));e.image.setDepth(e.item.Y+e.sprite.Height);}
    this.falls=world.roomObjects.filter(e=>e.item.ObjectName==='obj_foreground_waterfall').map(e=>{e.image.destroy();return {x:e.item.X,y:e.item.Y,tiles:Array.from({length:20},()=>world.add.image(0,0,'spr_waterfall_anim:0').setOrigin(0).setScale(2).setAlpha(.2).setDepth(-e.object.Depth))};});
    this.draw();
  }
  interact(){
    const w=this.world,e=this.box;
    if(inInteractionRange(w,e)){const returning=w.flags[85]===1;w.showChoice(returning?'* (Return the umbrella?)':'* (Take an umbrella?)',returning?['Put back','Do not']:['Take one','Do not'],choice=>{if(choice!==0)return;w.flags[85]=returning?0:1;w.showDialogue([returning?'* (You returned the umbrella.)':'* (You took an umbrella.)']);});return true;}
    if(inInteractionRange(w,this.sign)){w.showDialogue(['* (Please take one.)']);return true;}
    return false;
  }
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.anim=(this.anim+3)%180;}this.draw();}
  draw(){const w=this.world,view=Math.max(0,Math.min(w.dataSource.room.Width-320,w.cameras.main.scrollX));for(const f of this.falls)for(const [i,tile] of f.tiles.entries())tile.setPosition(f.x-view*.5,f.y-210+i*30+this.anim);}
  destroy(){for(const f of this.falls)for(const tile of f.tiles)tile.destroy();}
}
