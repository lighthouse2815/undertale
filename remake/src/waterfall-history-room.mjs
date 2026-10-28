import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import gonerText from './waterfall-goner-dialogue.json' with { type: 'json' };

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
    this.goner = world.roomObjects.find(e => e.item.ObjectName === 'obj_mkid_goner'); this.gonerTalked = 0;
    if (this.woshua) world.colliders.push(createCollider(world.dataSource, this.woshua.item));
    if (this.goner) { this.goner.image.setTexture('spr_mkid_goner_lt:0'); world.colliders.push(createCollider(world.dataSource, this.goner.item)); }
  }
  interact() {
    const world = this.world, sign = this.signs.find(e => inInteractionRange(world, e));
    if (sign) { const index = Number(sign.item.ObjectName.at(-1)) - 1; world.showDialogue(inscriptions[index]); return true; }
    const goner = this.goner;
    if (goner && inInteractionRange(world, { ...goner, item: { ...goner.item, X: goner.item.X - goner.sprite.OriginX, Y: goner.item.Y - goner.sprite.OriginY } })) {
      const umbrella = world.flags[85] === 1;
      const ids = umbrella ? this.gonerTalked ? [115] : [107, 108, 109, 110, 111] : this.gonerTalked ? [102] : [95, 96, 97, 98];
      if (umbrella && (world.flags[5] ?? 0) >= 90) world.flags[5] = 0;
      this.gonerTalked++; world.showDialogue(ids.map(id => gonerText[`obj_mkid_goner_${id}`])); return true;
    }
    const e = this.woshua;
    if (e && inInteractionRange(world, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } })) {
      const lines = world.flags[7] === 1 ? ['* The surface intimidates me.', '* The entire outer layer of the\n  Earth is made of dirt.'] : this.talked ? ["* Don't turn to dust."] : ["* Everything's so dirty...\n* If I could erase everything,\n  I would.", "* Ohhhh.\n* Don't get the wrong idea.\n* I don't want anyone to die.", "* People turn to dust when\n  they die, and that's hard\n  to clean up..."];
      this.talked++; world.showDialogue(lines); return true;
    }
    return false;
  }
}
