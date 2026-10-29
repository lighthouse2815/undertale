import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import dialogue from './waterfall-puzzle-hater.json' with { type: 'json' };

export class WaterfallPuzzleHater {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0; this.kidTimer = world.plot <= 119 && !(world.flags[98] ?? 0) ? 25 : 0;
    this.locked = this.kidTimer > 0; if (this.locked) world.release();
    this.npc = world.roomObjects.find(e => e.item.ObjectName === 'obj_puzzlehater');
    this.box = world.roomObjects.find(e => e.item.ObjectName === 'obj_puzzlehaterbox');
    if (murderLevel(world.flags) >= 8 || world.plot < 122 || world.flags[350] === 1) {
      for (const e of [this.npc, this.box]) e?.image.destroy();
      world.roomObjects = world.roomObjects.filter(e => e !== this.npc && e !== this.box); this.npc = this.box = null;
    } else for (const e of [this.npc, this.box]) { e.image.setDepth(e.item.Y + e.sprite.Height); world.colliders.push(createCollider(world.dataSource, e.item)); }
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    this.frame++;
    if (this.kidTimer && --this.kidTimer === 0) this.world.showDialogue(dialogue.kid, { onClose: () => { this.world.plot = 120; this.locked = false; } });
    if (this.npc) this.npc.image.setTexture(`spr_puzzlehater:${this.world.dialogue && this.talking ? Math.floor(this.frame * .2) % this.npc.sprite.TextureCount : 0}`);
  }
  openBox() {
    const w = this.world, flag = w.flags[280] ?? 0;
    if (flag === 1) w.flags[280] = 2;
    if (flag > 0) w.player.facing = 'l';
    this.talking = flag > 0;
    w.showDialogue(dialogue[flag === 1 ? 'box_first' : flag === 2 ? 'box_repeat' : 'box_initial'], { onClose: () => { this.talking = false; } });
  }
  checkTrigger() {
    if (!this.box || this.world.flags[280] !== 1 || this.world.dialogue || !touchesObject(this.world, this.world.player, this.box.item)) return false;
    this.openBox(); return true;
  }
  interact() {
    const w = this.world;
    if (this.npc && inInteractionRange(w, this.npc)) {
      const flag = w.flags[280] ?? 0, ending = w.flags[7] === 1;
      const key = ending ? flag >= 1 ? 'npc_ending_done' : 'npc_ending' : flag === 0 ? 'npc_first' : flag === 1 ? 'npc_wait' : 'npc_done';
      if (!ending && flag === 0) w.flags[280] = 1;
      this.talking = true; w.showDialogue(dialogue[key], { onClose: () => { this.talking = false; } }); return true;
    }
    if (this.box && inInteractionRange(w, this.box)) { this.openBox(); return true; }
    return false;
  }
}
