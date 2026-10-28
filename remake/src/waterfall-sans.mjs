import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// obj_sans_sentry2: lời mời và đường tắt tới Grillby.
export class WaterfallSans {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.stage = 'waiting'; this.locked = false;
    this.entry = world.roomObjects.find((e) => e.item.ObjectName === 'obj_sans_sentry2');
    if (world.flags[413] > 0 || world.flags[67] === 1 || world.plot >= 200) {
      this.entry.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.entry); this.entry = null; return;
    }
    this.entry.image.setDepth(this.entry.item.Y + this.entry.sprite.MarginBottom - this.entry.sprite.OriginY);
    world.colliders.push(createCollider(world.dataSource, this.entry.item));
  }
  wait(stage, duration = 0) { this.stage = stage; this.frames = 0; this.duration = duration; }
  pose(key, frame = 0) {
    const w = this.world, sprite = w.dataSource.sprites.get(key), image = this.entry.image;
    image.setTexture(`${key}:${frame % sprite.TextureCount}`).setDepth(image.y + sprite.Height);
  }
  show(lines, next) {
    const w = this.world; this.wait('talking');
    w.showDialogue(lines, { portrait: 'spr_face_sans', onPage: () => w.dialogueText.setFont('fnt_comicsans', 10), onClose: next });
  }
  interact() {
    const w = this.world, e = this.entry;
    if (!e || this.stage !== 'waiting' || !inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } })) return false;
    if (murderLevel(w.flags) >= 7) this.show(['* hey, i really\n  respect what you did\n  back there.', '* thanks.'], () => this.wait('waiting'));
    else if (w.flags[89] === 2) this.show(["* let's hang out again\n  sometime."], () => this.wait('waiting'));
    else if (w.flags[89] === 1) this.show(['* grievous error'], () => this.wait('waiting'));
    else this.show(["* what?\n* haven't you seen a guy\n  with two jobs before?", '* fortunately, two jobs\n  means twice as many\n  legally-required breaks.'], () => {
      this.wait('choice'); w.showChoice("* i'm going to grillby's.\n* wanna come?", ['Yeah', "I'm busy"], (choice) => {
        if (choice === 0) this.show(["* well, if you insist...\n* i'll pry myself away\n  from my work..."], () => { this.locked = true; w.release(); this.wait('pause', 10); });
        else this.show(['* OK. have fun.'], () => this.wait('waiting'));
      });
    });
    return true;
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  step() {
    if (!this.locked) return;
    const w = this.world, image = this.entry.image; this.frames++;
    if (this.stage === 'pause' && this.frames >= 10) this.wait('left', 14);
    else if (this.stage === 'left') { image.x -= 3; this.pose('spr_sans_l', Math.floor(this.frames * .25)); if (this.frames >= 14) this.wait('down', 18); }
    else if (this.stage === 'down') { image.y += 3; this.pose('spr_sans_d', Math.floor(this.frames * .25)); if (this.frames >= 18) this.wait('right', 17); }
    else if (this.stage === 'right') { image.x += 3; this.pose('spr_sans_r', Math.floor(this.frames * .25)); if (this.frames >= 17) { this.pose('spr_sans_r'); this.wait('pauseAgain', 20); } }
    else if (this.stage === 'pauseAgain' && this.frames >= 20) { this.pose('spr_sans_u'); this.show(['* over here.\n* i know a shortcut.'], () => this.wait('shortcut', 30)); }
    else if (this.stage === 'shortcut') {
      image.x += 3; w.player.x += 2; w.player.y += 1; this.pose('spr_sans_r', Math.floor(this.frames * .25));
      const sprite = w.dataSource.sprites.get('spr_maincharar'); w.player.facing = 'r'; w.player.setTexture(`spr_maincharar:${Math.floor(this.frames * .334) % sprite.TextureCount}`).setDepth(w.player.y + sprite.Height);
      if (this.frames >= 30) { w.flags[89] = 1; this.wait('transition'); w.transitionRoom('room_tundra_grillby', 'obj_markerw', 14 * 1000 / 30, true); }
    }
  }
  destroy() { this.entry?.image.destroy(); }
}
