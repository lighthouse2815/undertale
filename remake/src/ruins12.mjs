import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';

const NAP = [
  '* zzzzzzzzzzzzzzz..\n* zzzzzzzzzzzzzz...',
  '* zzzzzzzzzz..\n* (are they gone yet)\n* zzzzzzzzzzzzzzz...',
  "* (This ghost keeps saying 'z'\n  out loud repeatedly,\n  pretending to sleep.)",
];
const NAP_AFTER = [
  '* i usually come to the\n  RUINS because there\'s\n  nobody around...',
  '* but today i met somebody\n  nice...', '* ...', '* oh, i\'m rambling again', '* i\'ll get out of your way',
];
const MOUSE_SAVE = [
  '* (Knowing the mouse might one\n  day leave its hole and\n  get the cheese...)',
  '* (It fills you with\n  determination.)',
];

export class Ruins12Lesson {
  constructor(world) {
    this.world = world;
    this.nap = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_napstablook1');
    this.cheese = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_cheesetable1');
    this.mouse = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_mousehole');
    if (this.cheese) {
      world.colliders.push(createCollider(world.dataSource, this.cheese.item));
      this.cheese.image.setDepth(this.cheese.item.Y + this.cheese.sprite.Height);
    }
    if (this.nap && (world.flags[202] ?? 0) >= 20 && world.plot < 10.4) world.plot = 10.4;
    this.stage = world.plot > 10.5 ? 'gone' : 'sleeping';
    if (this.stage === 'gone') this.nap?.image.destroy();
  }

  update() {
    const world = this.world;
    if (!this.nap || this.stage === 'gone') return false;
    if (world.plot > 10.5) { this.stage = 'gone'; this.nap.image.destroy(); return false; }
    if (world.plot === 10.3 || world.plot === 10.35) {
      world.plot = 10.4; world.flags[36] = 1; this.stage = 'leaving';
      world.showDialogue(NAP_AFTER, { onClose: () => this.leave() });
      return true;
    }
    if (world.plot === 10.4) {
      if (!this.fading) this.leave();
      return true;
    }
    return false;
  }

  interact() {
    const world = this.world;
    if (this.mouse && inInteractionRange(world, this.mouse)) {
      if (!world.sound.isPlaying('snd_movemenu')) world.sound.play('snd_movemenu');
      return true;
    }
    if (this.nap && this.stage === 'sleeping' && inInteractionRange(world, this.nap)) {
      world.showDialogue(NAP, { onClose: () => world.showChoice('* Move it with force?', ['Yes', 'No'], (choice) => {
        if (choice !== 0) return;
        world.flags[200] = 0;
        for (const flag of [10, 11, 12, 13]) world.flags[flag] = 0;
        world.release(); window.__remake.startBattle('napstablook');
      }) });
      return true;
    }
    if (this.cheese && inInteractionRange(world, this.cheese)) {
      world.showDialogue(world.flags[7] === 1 ? ["* (Looks like cheese has a\n  nibble taken out of it.)"]
        : ["* This cheese has been here\n  quite a long time.", "* It's stuck to the table..."]);
      return true;
    }
    return false;
  }

  get saveDialogue() {
    if (!this.mouse) return null;
    return this.world.flags[202] >= 20 ? ['* Determination.'] : MOUSE_SAVE;
  }

  leave() {
    this.stage = 'leaving';
    this.fading = this.world.tweens.add({ targets: this.nap.image, alpha: 0, duration: 18 * 1000 / 30,
      onComplete: () => { this.world.plot = 11; this.stage = 'gone'; this.nap.image.destroy(); this.fading = null; } });
  }

  destroy() { this.fading?.stop(); }
}
