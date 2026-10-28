import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startWaterfallQuietMusic } from './waterfall-music.mjs';

export class WaterfallFriendlyHub {
  constructor(world) {
    this.world = world; this.talked = 0;
    this.sign = world.roomObjects.find(e => e.item.ObjectName === 'obj_sign_room');
    this.clam = world.roomObjects.find(e => e.item.ObjectName === 'obj_clamgirl');
    const fun = world.flags[5] ?? 0;
    if (this.clam && (murderLevel(world.flags) >= 8 || fun < 80 || fun > 89)) { this.clam.image.destroy(); this.clam = null; }
    for (const e of [this.sign, this.clam].filter(Boolean)) {
      e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY); world.colliders.push(createCollider(world.dataSource, e.item));
    }
    startWaterfallQuietMusic(world);
  }
  interact() {
    const w = this.world;
    const inRange = e => e && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } });
    if (inRange(this.sign)) { w.showDialogue(['* North: Blook Acres\n* East: Hotland\n* ???: Temmie Village']); return true; }
    if (!inRange(this.clam)) return false;
    let lines = this.talked ? ['* Not knowing where I live\n  is no issue.\n* Fate finds a way.', "* In life's grand scheme, she\n  might be why you came here\n  in the first place..."] : ["* I'm visiting Waterfall\n  from the city.", "* Synchronicity...?\n* My neighbor's daughter looks\n  about your age.", '* Her name is "Suzy."\n* I feel like you two should\n  be friends.', "* You have...\n* A neighbor's blessing!!!"];
    if (w.flags[7] !== 1) w.flags[279] = 1;
    if (w.flags[350] === 1) lines = ['* I sense a disturbance in\n  the nearby aura...', '* I think you should leave\n  that girl alone.'];
    if (w.flags[7] === 1) lines = w.flags[279] === 1 ? ["* So you never met my\n  neighbor's daughter.", "* Don't despair.\n* This world has infinite\n  opportunities.", "* But there's a limit to the\n  things you can do today.\n* Accepting this is healthy.", "* Take my neighbor's blessing!\n* And consider this blessing\n  for anything you like!"] : ["* I wanted to tell you about\n  my neighbor's daughter.", '* But you walked right by me\n  before I could tell you.', '* Fate has decided that I\n  should not tell you.'];
    this.talked++; this.clam.image.setTexture('spr_clamgirl_b:0');
    w.showDialogue(lines, { onClose: () => this.clam?.image.setTexture('spr_clamgirl_a:0') }); return true;
  }
}
