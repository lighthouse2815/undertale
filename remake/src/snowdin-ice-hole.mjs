import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';

// Phòng dưới hố: hai người tuyết, Ice Cap sau kết thúc và obj_falltransition.
export class SnowdinIceHole {
  constructor(world) {
    this.world = world; this.text = world.dataSource.iceHoleDialogue; this.elapsed = 0; this.frames = 0; this.locked = false; this.talked = 0; this.talking = false;
    startSnowdinMusic(world);
    this.npc = world.roomObjects.find((e) => e.item.ObjectName === 'obj_icecap_npcb');
    if (world.plot <= 100 || world.flags[203]) { this.npc.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.npc); this.npc = null; }
    for (const e of world.roomObjects.filter((e) => ['obj_papyrussnowman', 'obj_sanssnowman', 'obj_icecap_npcb'].includes(e.item.ObjectName))) { world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY); }
    if (world.flags[388] === 1) { world.flags[388] = 0; this.locked = true; this.finalY = world.player.y; world.player.y = -20; world.player.setAlpha(.5); }
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++; const p = this.world.player;
      if (this.locked) {
        p.y += 6;
        if (this.frames >= 4 && (this.frames - 4) % 5 === 0) p.facing = ({ d: 'r', r: 'u', u: 'l', l: 'd' })[p.facing];
        p.setTexture(`spr_mainchara${p.facing}:0`).setDepth(p.y + 30);
        if (p.y >= this.finalY - 3) { p.y = this.finalY; p.setAlpha(1); this.locked = false; this.world.release(); }
      }
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
