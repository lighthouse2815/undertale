import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { startWaterfallQuietMusic } from './waterfall-music.mjs';
import data from './waterfall-star-dialogue.json' with { type: 'json' };

// room_water11: Tonsil, bảng đá và kính thiên văn lạ.
export class WaterfallStarRoom {
  constructor(world) {
    this.world = world; this.npc = world.roomObjects.find(e => e.item.ObjectName === 'obj_npc_room');
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room2');
    this.telescope = world.roomObjects.find(e => e.item.ObjectName === 'obj_telescope');
    if (this.npc) {
      this.npc.item = { ...this.npc.item, Y: this.npc.item.Y + 10 }; this.npc.object = { ...this.npc.object, Sprite: 'spr_tonsildude' }; this.npc.sprite = world.dataSource.sprites.get('spr_tonsildude');
      world.dataSource.objects.set('obj_npc_room', this.npc.object); this.npc.image.setPosition(this.npc.item.X, this.npc.item.Y).setTexture('spr_tonsildude:0').setOrigin(0).setDepth(this.npc.item.Y + this.npc.sprite.Height);
      world.colliders.push(createCollider(world.dataSource, this.npc.item));
    }
    world.colliders.push(createCollider(world.dataSource, this.telescope.item)); startWaterfallQuietMusic(world);
  }
  interact() {
    const w = this.world;
    if (this.npc && inInteractionRange(w, this.npc)) {
      let ids = [300, 301, 302, 303, 304, 305];
      if (w.flags[85] === 1) ids = [308];
      if (w.flags[7] === 1) ids = [313, 314];
      if (w.flags[350] === 1) ids = [319, 320];
      w.showDialogue(ids.map(id => data[`obj_npc_room_${id}`])); return true;
    }
    const e = this.telescope;
    if (inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } })) { w.showDialogue([data.obj_telescope_75]); return true; }
    if (this.signs.some(e => inInteractionRange(w, e))) { w.showDialogue([data.obj_readable_room2_569, data.obj_readable_room2_570]); return true; }
    return false;
  }
}
