import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startWaterfallQuietMusic } from './waterfall-music.mjs';
import text from './waterfall-blookyard-dialogue.json' with {type:'json'};

const lines=(prefix,ids)=>ids.map(id=>text[`${prefix}_${id}`]);
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);

// obj_blookhouses và hai nhân vật chỉ có sau kết thúc trong Blook Acres.
export class WaterfallBlookYard {
  constructor(world){
    this.world=world;this.ghost=world.roomObjects.find(e=>e.item.ObjectName==='obj_napstablook_actor');
    if(world.flags[7]!==1||murderLevel(world.flags)>=10){this.ghost?.image.destroy();this.ghost=null;}
    else{
      this.ghost.object={...this.ghost.object,Sprite:'spr_napstablook_d_headphone'};this.ghost.sprite=world.dataSource.sprites.get(this.ghost.object.Sprite);this.ghost.image.setTexture(`${this.ghost.object.Sprite}:0`).setDepth(this.ghost.item.Y+this.ghost.sprite.MarginBottom);
      world.dataSource.objects.set(this.ghost.item.ObjectName,this.ghost.object);world.colliders.push(createCollider(world.dataSource,this.ghost.item));
      const item={ObjectName:'obj_npc_room',X:216,Y:122,ScaleX:1,ScaleY:1},sprite=world.dataSource.sprites.get('spr_mettex_npc'),object={Sprite:'spr_mettex_npc'};
      world.dataSource.objects.set('obj_npc_room',object);this.mettaton={item,object,sprite,image:world.add.image(item.X,item.Y,'spr_mettex_npc:0').setOrigin(0).setDepth(item.Y+sprite.MarginBottom)};world.colliders.push(createCollider(world.dataSource,item));
    }
    if(!world.flags[433]){const item={ObjectName:'obj_solidsmall',X:172,Y:116,ScaleX:1,ScaleY:1},object=world.dataSource.objects.get(item.ObjectName),sprite=world.dataSource.sprites.get(object.Sprite);this.locked={item,object,sprite};world.colliders.push(createCollider(world.dataSource,item));}
    if(world.flags[433]){const sprite=world.dataSource.sprites.get(world.dataSource.objects.get('obj_doorCmusicfade').Sprite);world.doors.push({destination:'room_water_hapstablook',direction:'C',marker:'obj_markerC',musicFade:true,duration:13*1000/30,left:172+sprite.MarginLeft-sprite.OriginX,right:172+sprite.MarginRight-sprite.OriginX,top:112+sprite.MarginTop-sprite.OriginY,bottom:112+sprite.MarginBottom-sprite.OriginY});}
    startWaterfallQuietMusic(world);
  }
  interact(){
    const w=this.world,f=w.flags;
    if(this.locked&&inInteractionRange(w,this.locked)){w.showDialogue(["* (It's locked.)"]);return true;}
    if(this.ghost&&inInteractionRange(w,this.ghost)){
      const count=f[199]??0;let ids=count>=2?range(204,208):count===1?range(196,199):[...(f[194]>0?[157,158]:[152,153]),...(f[36]>0?range(163,165):range(171,173)),...range(179,189)];
      f[199]=count+1;w.showDialogue(lines('obj_napstablook_actor',ids));return true;
    }
    if(this.mettaton&&inInteractionRange(w,this.mettaton)){
      const count=f[198]??0,ids=count>=2?[651,652,653]:count===1?[631,632,633,634,635,636,638,640,642,644,646]:range(615,627);f[198]=count+1;w.showDialogue(lines('obj_npc_room',ids));return true;
    }
    return false;
  }
  destroy(){this.mettaton?.image.destroy();}
}
