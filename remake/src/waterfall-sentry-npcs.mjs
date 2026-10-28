import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { waterfallFishDialogue, waterfallEchoDialogue, waterfallKidDialogue } from './waterfall-sentry-dialogue.mjs';

// Cá, hoa vọng âm và Monster Kid tại trạm đầu Waterfall.
export class WaterfallSentryNpcs {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.talking = null; this.flowerHeard = false; this.npcs = [];
    for (const e of [...world.roomObjects]) {
      const name = e.item.ObjectName;
      if (!['obj_npc_room', 'obj_echoflower', 'obj_townnpc_monsterkid1'].includes(name)) continue;
      if (name === 'obj_npc_room' && murderLevel(world.flags) >= 8 || name === 'obj_townnpc_monsterkid1' && world.plot > 103) {
        e.image.destroy(); world.roomObjects = world.roomObjects.filter((entry) => entry !== e); continue;
      }
      if (name === 'obj_npc_room') {
        e.object = { ...e.object, Sprite: 'spr_fishnpc_echo' }; world.dataSource.objects.set(name, e.object);
        e.sprite = world.dataSource.sprites.get(e.object.Sprite); e.image.setTexture(`${e.object.Sprite}:0`).setOrigin(e.sprite.OriginX / e.sprite.Width, e.sprite.OriginY / e.sprite.Height);
      }
      e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY);
      const npc = { ...e, talked: 0, conversation: 0 }; this.npcs.push(npc); world.colliders.push(createCollider(world.dataSource, e.item));
    }
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      for (const e of this.npcs) {
        const kid = e.item.ObjectName === 'obj_townnpc_monsterkid1';
        const key = kid && e === this.talking ? `spr_mkid_${this.kidFacing}t` : e.object.Sprite;
        const sprite = this.world.dataSource.sprites.get(key), frame = e === this.talking ? Math.floor(this.frames * .2) % sprite.TextureCount : 0;
        e.image.setTexture(`${key}:${frame}`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height);
      }
    }
  }
  interact() {
    const w = this.world, e = this.npcs.find((n) => inInteractionRange(w, { ...n, item: { ...n.item, X: n.item.X - n.sprite.OriginX, Y: n.item.Y - n.sprite.OriginY } }));
    if (!e) return false;
    const name = e.item.ObjectName, fish = this.npcs.find((n) => n.item.ObjectName === 'obj_npc_room'); let pages;
    if (name === 'obj_npc_room') pages = waterfallFishDialogue(e.talked, this.flowerHeard);
    else if (name === 'obj_echoflower') { const result = waterfallEchoDialogue(Boolean(fish), fish?.talked ?? 0, this.flowerHeard); pages = result.pages; this.flowerHeard = result.heard; }
    else pages = waterfallKidDialogue(e.talked, e.conversation);
    e.talked++; this.talking = e; this.kidFacing = { u: 'd', d: 'u', l: 'r', r: 'l' }[w.player.facing];
    w.showDialogue(pages, { onClose: () => { this.talking = null; } }); return true;
  }
  destroy() { this.npcs.forEach((e) => e.image.destroy()); }
}
