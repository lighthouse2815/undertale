import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { grillbyNpcDialogue } from './grillby-npc-dialogue.mjs';

// Khách và chủ quán Grillby; sansmode bật sau bữa ăn cùng Sans.
export class GrillbyNpcs {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.talking = null; this.sansmode = false; this.npcs = [];
    for (const e of [...world.roomObjects]) {
      const name = e.item.ObjectName.replace(/^obj_/, '');
      if (!['grillbynpc_hotandbothered', 'grillbynpc_foodmonster', 'grillbynpc_lesserdog', 'grillbynpc_womandog', 'grillbynpc_mandog', 'grillbynpc_doggo', 'grillbynpc_grillby', 'grillbynpc_hot2', 'townnpc_weirdfish', 'townnpc_hatescity'].includes(name)) continue;
      const f = world.flags, pair = ['grillbynpc_womandog', 'grillbynpc_mandog'].includes(name), doggo = name === 'grillbynpc_doggo';
      if (name === 'grillbynpc_lesserdog' && f[55] === 1 || pair && (f[53] === 1 || f[7] === 1) || doggo && (f[52] === 1 || f[7] === 1) || !pair && !doggo && name !== 'grillbynpc_lesserdog' && murderLevel(f) >= 7) {
        e.image.destroy(); world.roomObjects = world.roomObjects.filter((entry) => entry !== e); continue;
      }
      const npc = { ...e, name, talked: 0 }; this.npcs.push(npc); world.colliders.push(createCollider(world.dataSource, e.item));
      e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY);
    }
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      for (const e of this.npcs) {
        const rate = e.name === 'grillbynpc_grillby' ? .25 : e === this.talking ? .2 : 0;
        e.image.setTexture(`${e.object.Sprite}:${Math.floor(this.frames * rate) % e.sprite.TextureCount}`);
      }
    }
  }
  interact() {
    const w = this.world, e = this.npcs.find((n) => inInteractionRange(w, { ...n, item: { ...n.item, X: n.item.X - n.sprite.OriginX, Y: n.item.Y - n.sprite.OriginY } }));
    if (!e) return false;
    const pages = grillbyNpcDialogue(e.name, w.flags, w.plot, e.talked, this.sansmode); e.talked++; this.talking = e;
    w.showDialogue(pages, { onClose: () => { this.talking = null; } }); return true;
  }
  destroy() { this.npcs.forEach((e) => e.image.destroy()); }
}
