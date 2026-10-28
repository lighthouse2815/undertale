import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startWaterfallQuietMusic } from './waterfall-music.mjs';

export class WaterfallFriendlyHub {
  constructor(world) {
    this.world = world; this.talked = 0; this.elapsed = 0; this.stage = 'done';
    world.flags[17] = 0; if (world.flags[389] === 4) world.flags[389] = 5;
    if (world.plot <= 116) {
      this.trigger = world.dataSource.room.GameObjects.find(e => e.ObjectName === 'obj_napstablookfriendtrigger');
      this.nap = world.add.image(300, 60, 'spr_napstablook_u:0').setOrigin(0).setDepth(93); this.stage = 'waiting';
    }
    this.sign = world.roomObjects.find(e => e.item.ObjectName === 'obj_sign_room');
    this.clam = world.roomObjects.find(e => e.item.ObjectName === 'obj_clamgirl');
    const fun = world.flags[5] ?? 0;
    if (this.clam && (murderLevel(world.flags) >= 8 || fun < 80 || fun > 89)) { this.clam.image.destroy(); this.clam = null; }
    for (const e of [this.sign, this.clam].filter(Boolean)) {
      e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY); world.colliders.push(createCollider(world.dataSource, e.item));
    }
    startWaterfallQuietMusic(world);
  }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 5, 1)) return false;
    w.release(); this.stage = 'turn'; this.timer = 15; return true;
  }
  update(delta) {
    if (['waiting', 'done'].includes(this.stage)) return false;
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return true;
  }
  step() {
    if (this.stage === 'talking' || ['waiting', 'done'].includes(this.stage)) return;
    if (this.stage === 'leave') { this.nap.y -= 3; this.nap.setDepth(this.nap.y + 33); }
    if (--this.timer > 0) return;
    if (this.stage === 'turn') { this.nap.setTexture('spr_napstablook_d:0'); this.stage = 'beforeTalk'; this.timer = 20; }
    else if (this.stage === 'beforeTalk') {
      this.stage = 'talking'; const w = this.world;
      const lines = w.flags[36] > 0 ? ['* hey...\n* my house is up here...', '* in case you want to see...', '* or in case...', "* you don't..."] : ['* oh hey... you...\n* followed me...', '* my house is up here...', "* so you probably don't want to\n  come this way...", '* hope that helps...'];
      w.showDialogue(lines, { onClose: () => { this.stage = 'leave'; this.timer = 30; } });
    } else if (this.stage === 'leave') { this.world.plot = 117; this.stage = 'done'; this.world.release(); }
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
