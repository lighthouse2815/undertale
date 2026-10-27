import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { addItem } from './inventory.mjs';

// obj_nicecreamguy tại Snowdin, SCR_TEXT230/231. Waterfall/Hotland chuyển riêng.
export class NiceCream {
  constructor(world) {
    this.world = world; this.text = world.dataSource.niceCreamDialogue; this.elapsed = 0; this.frames = 0; this.stage = 'idle'; this.locked = false; this.display = [];
    this.entry = world.roomObjects.find((e) => e.item.ObjectName === 'obj_nicecreamguy');
    const f = world.flags;
    if (world.plot >= 101 || murderLevel(f) >= 3 && !f[27] || f[203] >= 16) {
      this.entry.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.entry); this.entry = null; return;
    }
    this.pose(f[60] > 0 ? 'spr_icecreamguy_happy' : 'spr_icecreamguy_sad');
    world.colliders.push(createCollider(world.dataSource, this.entry.item));
  }

  pose(key) { this.sprite = key; this.entry.image.setTexture(`${key}:0`).setDepth(this.entry.item.Y + this.entry.sprite.Height); }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      if (this.entry) this.entry.image.setTexture(`${this.sprite}:${this.world.dialogue ? Math.floor(this.frames * .2) % this.world.dataSource.sprites.get(this.sprite).TextureCount : 0}`);
      if (this.stage === 'turning' && this.frames > 30) {
        this.pose('spr_icecreamguy_happy'); this.stage = 'talking';
        this.world.showDialogue(this.text.customer, { onClose: () => { this.world.flags[60] = 1; this.offer(); } });
      }
    }
    if (this.display.length) this.refreshDisplay();
    return this.locked;
  }

  showDisplay() {
    const w = this.world;
    this.display = [w.add.rectangle(204, 92, 100, 53, 0xffffff).setOrigin(0), w.add.rectangle(207, 95, 94, 47, 0x000000).setOrigin(0),
      w.add.bitmapText(218, 100, 'fnt_maintext', '', 12), w.add.bitmapText(218, 120, 'fnt_maintext', '', 12)];
    this.display.forEach((child) => child.setScrollFactor(0).setDepth(100003)); this.refreshDisplay();
  }

  refreshDisplay() {
    const w = this.world;
    this.display[2].setText(this.text.gold.replace(/\\\[G\]/g, String(w.gold)));
    this.display[3].setText(this.text.space.replace(/\\\[1\]/g, String(w.inventory.length)));
  }

  offer() {
    const w = this.world, t = this.text; this.stage = 'talking';
    this.showDisplay();
    w.showDialogue(w.flags[60] < 5 ? t.offer : t.offerAgain, { onClose: () => w.showChoice(t.prompt, ['Yes', 'No'], (choice) => {
      let lines;
      if (choice === 1) lines = t.no;
      else if (w.gold < 15) lines = t.poor;
      else if (!addItem(w, 17)) lines = t.full;
      else { w.gold -= 15; w.flags[60] = (w.flags[60] ?? 0) + 15; lines = t.buy; }
      this.refreshDisplay(); w.showDialogue(lines, { onClose: () => this.close() });
    }) });
  }

  close() { this.display.forEach((child) => child.destroy()); this.display = []; this.locked = false; this.stage = 'idle'; this.world.release(); this.world.confirmPressed = false; }

  interact() {
    const w = this.world;
    if (!this.entry || !inInteractionRange(w, this.entry)) return false;
    this.locked = true;
    if (!w.flags[60]) w.showDialogue(this.text.intro, { onClose: () => { this.pose('spr_icecreamguy_anim'); this.stage = 'turning'; this.frames = 0; } });
    else this.offer();
    return true;
  }

  destroy() { this.display.forEach((child) => child.destroy()); this.display = []; }
}
