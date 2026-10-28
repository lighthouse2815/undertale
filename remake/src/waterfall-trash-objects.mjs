import {createCollider} from './movement.mjs';
import {inInteractionRange} from './npc.mjs';
import {addItem} from './inventory.mjs';

export class WaterfallTrashObjects {
  constructor(world){
    this.world=world;this.objects=world.roomObjects.filter(e=>['obj_assortedtrash','obj_garbagecooler'].includes(e.item.ObjectName));
    for(const e of this.objects){
      if(e.item.ObjectName==='obj_assortedtrash'&&e.item.Y>420){const key=e.item.Y>500?'spr_rustbike':'spr_watercomputer';e.object={...e.object,Sprite:key};e.sprite=world.dataSource.sprites.get(key);e.image.setTexture(`${key}:0`).setOrigin(e.sprite.OriginX/e.sprite.Width,e.sprite.OriginY/e.sprite.Height);}
      world.dataSource.objects.set(e.item.ObjectName,e.object);world.colliders.push(createCollider(world.dataSource,e.item));e.image.setDepth(e.item.Y+e.sprite.MarginBottom);
    }
  }
  interact(){
    const w=this.world,e=this.objects.find(e=>inInteractionRange(w,e));if(!e)return false;
    if(e.item.ObjectName==='obj_garbagecooler'){
      const flag=w.flags[108]??0;if(flag>2){w.showDialogue(['* (The cooler is empty.)']);return true;}
      const choose=()=>w.showChoice(flag===0?'* (Take one?)':'* (Take a space food bar\n  from the cooler?)',['Yes','No'],choice=>{if(choice!==0)return;if(addItem(w,35)){w.flags[108]++;w.showDialogue(['* (You got the Astronaut Food.)']);}else w.showDialogue(["* (You're carrying too much.)"]);});
      if(flag===0){w.flags[108]=1;w.showDialogue(["* (It's a cooler.\n* It has no brand, and\n  shows no signs of wear...)",'* (Inside are a couple\n  of freeze-dried space\n  food bars.)'],{onClose:choose});}else choose();return true;
    }
    const y=e.item.Y,lines=y>540?['* (You rest your hand on\n  the rusted bike.)','* (Its horn wheezes a honk\n  of despair.)']:y>420?['* (A beat-up desktop computer.)\n* (The inside is empty.)']:["* (It's a DVD case for an\n  anime.)",'* (Desperate claw marks cover\n  the edges.)'];
    w.showDialogue(lines,{onClose:y>540?()=>w.sound.play('snd_slidewhist'):undefined});return true;
  }
}
