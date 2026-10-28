import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';

const inscriptions = [
  ['* (Ancient writing covers the\n  walls... you can just make\n  out the words.)', '* "The War of Humans and\n  Monsters."'],
  ['* Why did the humans attack?\n* Indeed, it seemed that they\n  had nothing to fear.', '* Humans are unbelievably strong.\n* It would take the SOUL of\n  nearly every monster...', '* ... just to equal the power\n  of a single human SOUL.'],
  ['* But humans have one weakness.\n* Ironically, it is the strength\n  of their SOUL.', '* Its power allows it to persist\n  outside the human body, even\n  after death.'],
  ['* If a monster defeats a human,\n  they can take its SOUL.', '* A monster with a human SOUL...\n* A horrible beast with\n  unfathomable power.'],
  ["* (It's an illustration of a\n  strange creature...)", "* (There's something very\n  unsettling about this drawing.)"],
];

// Năm bia lịch sử và Woshua hậu kết thúc trong room_water7.
export class WaterfallHistoryRoom {
  constructor(world) {
    this.world = world; this.talked = 0;
    this.signs = world.roomObjects.filter(e => /^obj_readable_room[1-5]$/.test(e.item.ObjectName));
    this.woshua = world.roomObjects.find(e => e.item.ObjectName === 'obj_woshuanpc');
    if (this.woshua) world.colliders.push(createCollider(world.dataSource, this.woshua.item));
  }
  interact() {
    const world = this.world, sign = this.signs.find(e => inInteractionRange(world, e));
    if (sign) { const index = Number(sign.item.ObjectName.at(-1)) - 1; world.showDialogue(inscriptions[index]); return true; }
    const e = this.woshua;
    if (e && inInteractionRange(world, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } })) {
      const lines = world.flags[7] === 1 ? ['* The surface intimidates me.', '* The entire outer layer of the\n  Earth is made of dirt.'] : this.talked ? ["* Don't turn to dust."] : ["* Everything's so dirty...\n* If I could erase everything,\n  I would.", "* Ohhhh.\n* Don't get the wrong idea.\n* I don't want anyone to die.", "* People turn to dust when\n  they die, and that's hard\n  to clean up..."];
      this.talked++; world.showDialogue(lines); return true;
    }
    return false;
  }
}
