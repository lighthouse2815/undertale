import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// obj_vulkinnpc chỉ có mặt sau kết thúc khi chưa giết quái khu vực.
export class HotlandVulkin {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0; this.talked = 0; this.talking = false;
    this.entry = world.roomObjects.find(e => e.item.ObjectName === 'obj_vulkinnpc');
    const f = world.flags;
    if (world.plot <= 191 || !(f[7] === 1 || f[8] === 1) || f[205] || f[206] || murderLevel(f) >= 12) {
      this.entry.image.destroy(); world.roomObjects = world.roomObjects.filter(e => e !== this.entry); this.entry = null; return;
    }
    this.entry.image.setDepth(this.entry.item.Y + this.entry.sprite.MarginBottom);
    world.colliders.push(createCollider(world.dataSource, this.entry.item));
  }
  update(delta) {
    if (!this.entry) return;
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frame += .2;
      this.entry.image.setTexture(`spr_vulkinpc:${this.talking ? Math.floor(this.frame) % this.entry.sprite.TextureCount : 0}`);
    }
  }
  interact() {
    const w = this.world;
    if (!this.entry || !inInteractionRange(w, this.entry)) return false;
    const pages = w.flags[7] === 1 ? ['* Oh...\n* Freedoms.', '* Feels... so spicey.']
      : [this.talked ? '* So spicey.' : '* Oh...\n* When you hug me, I feel...\n* So spicey.'];
    this.talked++; this.talking = true; this.frame = 0;
    w.showDialogue(pages, { onClose: () => { this.talking = false; } }); return true;
  }
}
