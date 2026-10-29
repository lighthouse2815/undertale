import { colorBitmapFont } from './fonts.mjs';
import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { spawnStalkerFlowey, updateStalkerFlowey } from './stalker-flowey.mjs';
import { showWaterfallSave } from './waterfall-save.mjs';
import dialogue from './waterfall-flower-hall.json' with { type: 'json' };

export class WaterfallFlowerHall {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.floweyHeard = false;
    this.flowers = world.roomObjects.filter(e => e.item.ObjectName === 'obj_echoflower');
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room1');
    this.trigger = world.plot < 119 ? world.dataSource.room.GameObjects.find(e => e.ObjectName === 'obj_trigger_room') : null;
    this.doom = murderLevel(world.flags) === 10 && !world.flags[27] && world.plot < 120 ? world.dataSource.room.GameObjects.find(e => e.ObjectName === 'obj_water_doomreminder') : null;
    const save = world.roomObjects.find(e => e.item.ObjectName === 'obj_savepoint');
    if (save && (murderLevel(world.flags) < 11 || world.flags[27] || world.plot > 119)) { save.image.destroy(); world.roomObjects = world.roomObjects.filter(e => e !== save); }
    else if (save) world.colliders.push(createCollider(world.dataSource, save.item));
    for (const flower of this.flowers) { flower.image.setDepth(flower.item.Y + flower.sprite.Height); world.colliders.push(createCollider(world.dataSource, flower.item)); }
    this.pollen = Array.from({ length: 100 }, () => this.newPollen()); this.pollenGraphics = world.add.graphics().setDepth(-100);
  }
  newPollen() { return { x: Math.random() * 320, y: Math.random() * 640, radius: 1 + Math.random() * 3, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1, alpha: 0 }; }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    updateStalkerFlowey(this.world, this.flowey);
  }
  step() {
    const graphics = this.pollenGraphics; graphics.clear(); this.frames++;
    for (let i = 0; i < this.pollen.length; i++) {
      const particle = this.pollen[i]; particle.alpha += .03;
      const alpha = particle.alpha >= 2 ? 4 - particle.alpha : particle.alpha;
      particle.x += particle.vx * alpha / 4; particle.y += particle.vy * alpha / 4;
      if (alpha <= 0) { this.pollen[i] = this.newPollen(); continue; }
      graphics.fillStyle(0xffff00, Math.min(1, alpha)).fillCircle(particle.x, particle.y, particle.radius);
    }
  }
  checkTrigger() {
    const w = this.world;
    if (this.trigger && touchesObject(w, w.player, this.trigger, 1, 10)) {
      this.trigger = null; w.plot = 119; this.floweyHeard = true; this.flowey = spawnStalkerFlowey(w, 140, 420);
    }
    if (this.doom && !w.dialogue && touchesObject(w, w.player, this.doom, 10, 1)) {
      this.doom = null; const left = Math.max(0, 18 - (w.flags[204] ?? 0));
      colorBitmapFont(w, 'fnt_maintext', 'red', '#ff0000');
      w.showDialogue([`* Strongly felt ${left} left.\n* Shouldn't proceed yet.`], { onPage: () => w.dialogueText.setFont('fnt_maintext:red') }); return true;
    }
    return false;
  }
  interact() {
    const w = this.world;
    const flower = this.flowers.find(e => inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (flower) {
      const silent = murderLevel(w.flags) >= 8 || w.flags[350] === 1;
      const key = silent ? 'silent' : flower.item.Y === 420 && this.floweyHeard ? w.flags[45] === 4 ? 'flowey_genocide' : 'flowey' : String(flower.item.Y);
      w.showDialogue(dialogue[key]); return true;
    }
    if (this.signs.some(e => inInteractionRange(w, e))) { w.showDialogue(dialogue.sign); return true; }
    const save = w.roomObjects.find(e => e.item.ObjectName === 'obj_savepoint');
    if (save && inInteractionRange(w, save)) { showWaterfallSave(w); return true; }
    return false;
  }
  destroy() { this.flowey?.destroy(); this.pollenGraphics.destroy(); }
}
