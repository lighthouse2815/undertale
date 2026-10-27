import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// Bảy obj_townnpc_*: thoại theo plot/tuyến, số lần nói riêng và Monster Kid quay mặt.
export class SnowdinTownNpcs {
  constructor(world) {
    this.world = world; this.text = world.dataSource.townNpcDialogue; this.elapsed = 0; this.frames = 0; this.talking = null;
    this.npcs = [];
    for (const e of [...world.roomObjects]) {
      const name = e.item.ObjectName.replace(/^obj_townnpc_/, ''); if (!this.text[name]) continue;
      const kid = name === 'monsterkid1';
      if (kid ? world.plot > 100 && !world.flags[7] : murderLevel(world.flags) >= 7) {
        e.image.destroy(); world.roomObjects = world.roomObjects.filter((entry) => entry !== e); continue;
      }
      const npc = { ...e, name, kid, talked: 0 }; this.npcs.push(npc); world.colliders.push(createCollider(world.dataSource, e.item));
      e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY);
    }
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      for (const e of this.npcs) {
        const key = e.kid && e === this.talking ? `spr_mkid_${this.kidFacing}t` : e.object.Sprite;
        const s = this.world.dataSource.sprites.get(key), frame = e === this.talking ? Math.floor(this.frames * .2) % s.TextureCount : 0;
        e.image.setTexture(`${key}:${frame}`).setOrigin(s.OriginX / s.Width, s.OriginY / s.Height);
      }
    }
  }
  destroy() { this.npcs.forEach((e) => e.image.destroy()); }
  interact() {
    const w = this.world, e = this.npcs.find((e) => inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!e) return false;
    const f = w.flags, data = this.text[e.name], deadDogs = f[52] === 1 && f[53] === 1 && f[54] === 1;
    let key = e.talked ? 'repeat' : 'normal';
    if (e.kid) {
      if (f[7] === 1 && [0, 1, 2].includes(f[98] ?? 0)) key = `end${f[98] ?? 0}${e.talked ? 'Repeat' : ''}`;
      if (murderLevel(f) >= 7) key = 'murder';
    } else {
      if (e.name === 'bunlady' ? w.plot > 121 : w.plot >= 122) key = 'late';
      if (f[7] === 1) key = e.talked && data.endRepeat ? 'endRepeat' : 'end';
      if (deadDogs && data.dead) key = 'dead';
      if (f[67] === 1 && (data.papDead || data.dead && ['bunboy', 'unfunny'].includes(e.name))) key = data.papDead ? 'papDead' : 'dead';
    }
    e.talked++;
    // Alarm gốc không tạo writer ởplot112, kể cả khi instance còn ở town sau kết thúc.
    if (e.kid && w.plot === 112) return true;
    this.talking = e; this.kidFacing = { u: 'd', d: 'u', l: 'r', r: 'l' }[w.player.facing];
    w.showDialogue(data[key], { onClose: () => { this.talking = null; } }); return true;
  }
}
