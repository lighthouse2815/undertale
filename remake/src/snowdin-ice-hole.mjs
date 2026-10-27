import { SnowdinFallTransition } from './snowdin-fall-transition.mjs';
import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';

// Phòng dưới hố: hai người tuyết, Ice Cap sau kết thúc và obj_falltransition.
export class SnowdinIceHole {
  constructor(world) {
    this.world = world; this.text = world.dataSource.iceHoleDialogue; this.elapsed = 0; this.frames = 0; this.talked = 0; this.talking = false;
    startSnowdinMusic(world);
    this.npc = world.roomObjects.find((e) => e.item.ObjectName === 'obj_icecap_npcb');
    if (world.plot <= 100 || world.flags[203]) { this.npc.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.npc); this.npc = null; }
    for (const e of world.roomObjects.filter((e) => ['obj_papyrussnowman', 'obj_sanssnowman', 'obj_icecap_npcb'].includes(e.item.ObjectName))) { world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY); }
    this.fall = new SnowdinFallTransition(world);
  }
  get locked() { return this.fall.locked; }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++; this.fall.step();
      if (this.npc) this.npc.image.setTexture(`${this.npc.object.Sprite}:${this.talking ? Math.floor(this.frames * .2) % this.npc.sprite.TextureCount : 0}`);
    }
    return this.locked;
  }
  interact() {
    const w = this.world, e = w.roomObjects.find((e) => ['obj_papyrussnowman', 'obj_sanssnowman', 'obj_icecap_npcb'].includes(e.item.ObjectName) && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!e) return false;
    const key = e === this.npc ? w.flags[7] === 1 ? 'icecapEnd' : this.talked++ ? 'icecapAgain' : 'icecap' : e.item.ObjectName === 'obj_sanssnowman' ? 'sans' : 'papyrus';
    this.talking = e === this.npc; w.showDialogue(this.text[key], { onClose: () => { this.talking = false; } }); return true;
  }
}
