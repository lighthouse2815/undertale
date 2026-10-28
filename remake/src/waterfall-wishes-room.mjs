import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startWaterfallMusic } from './waterfall-music.mjs';

export class WaterfallWishesRoom {
  constructor(world) {
    this.world = world; this.flowers = world.roomObjects.filter(e => e.item.ObjectName === 'obj_echoflower');
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room1');
    for (const e of this.flowers) { world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY); }
    startWaterfallMusic(world);
  }
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
