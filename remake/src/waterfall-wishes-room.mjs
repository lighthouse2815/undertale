import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startWaterfallMusic } from './waterfall-music.mjs';

export class WaterfallWishesRoom {
  constructor(world) {
    this.world = world; this.flowers = world.roomObjects.filter(e => e.item.ObjectName === 'obj_echoflower');
    this.elapsed = 0; this.frames = 0; this.waterfalls = [];
    for (const e of world.roomObjects.filter(e => e.item.ObjectName === 'obj_brightwaterfall')) {
      e.image.destroy();
      const add = (part, x, y) => { const key = `spr_waterfall_bright_${part}`; const image = world.add.image(x, y, `${key}:0`).setOrigin(0).setDepth(-e.object.Depth); this.waterfalls.push({ image, key, frames: world.dataSource.sprites.get(key).TextureCount }); };
      const { X:x, Y:y, ScaleX:width, ScaleY:height } = e.item;
      for (let col = 0; col < width; col++) add(col === 0 ? 'lt' : col === width-1 ? 'rt' : 'mt', x+col*20, y);
      for (let row = 1; row < height; row++) for (let col = 0; col < width; col++) add(row === height-1 ? col === 0 ? 'bl' : col === width-1 ? 'br' : 'bm' : col === 0 ? 'lm' : col === width-1 ? 'rm' : 'mm', x+col*20, y+(row === height-1 ? row-1 : row)*20);
    }
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room1');
    for (const e of this.flowers) { world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY); }
    startWaterfallMusic(world);
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.frames++; }
    for (const tile of this.waterfalls) tile.image.setTexture(`${tile.key}:${Math.floor(this.frames / 5) % tile.frames}`);
  }
  destroy() { for (const tile of this.waterfalls) tile.image.destroy(); }
  interact() {
    const w = this.world;
    const f = this.flowers.find(e => inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (f) {
      let lines = ['* (You hear a passing\n  conversation.)', "* Don't say that!\n* Come on, I promise I\n  won't laugh."];
      if (f.item.X < 700 && f.item.Y < 360) lines = [lines[0], "* So? Don't you have any\n  wishes to make?"];
      if (f.item.X < 700 && f.item.Y > 360) lines = [lines[0], '* ... hmmm, just one, but...', "* It's kind of stupid."];
      if (murderLevel(w.flags) >= 8 || w.flags[350] === 1) lines = ["* (It's strangely silent.)"];
      w.showDialogue(lines); return true;
    }
    if (this.signs.some(e => inInteractionRange(w, e))) { w.showDialogue(['* "The power to take their\n  SOULs."', '* "This is the power that\n  the humans feared."']); return true; }
    return false;
  }
}
