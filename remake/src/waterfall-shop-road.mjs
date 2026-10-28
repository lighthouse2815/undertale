import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { showItemBox } from './box-road.mjs';
import { startWaterfallQuietMusic } from './waterfall-music.mjs';

// room_water_shop: cùng hộp đồ với Snowdin và nhạc khu yên tĩnh.
export class WaterfallShopRoad {
  constructor(world){
    this.world=world;this.box=world.roomObjects.find(e=>e.item.ObjectName==='obj_sansbox');world.flags[300]??=14;
    world.colliders.push(createCollider(world.dataSource,this.box.item));startWaterfallQuietMusic(world);
  }
  interact(){if(!inInteractionRange(this.world,this.box))return false;showItemBox(this.world,this.world.dataSource.boxRoadDialogue.box);return true;}
}
