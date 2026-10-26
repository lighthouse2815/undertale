import { inInteractionRange } from './npc.mjs';

const NAP = [
  '* zzzzzzzzzzzzzzzz..\n* zzzzzzzzzzzzzz...',
  '* zzzzzzzzzz..\n* (are they gone yet)\n* zzzzzzzzzzzzzzz...',
  "* (This ghost keeps saying 'z'\n  out loud repeatedly,\n  pretending to sleep.)",
];
const NAP_AFTER = [
  '* i usually come to the\n  RUINS because there\'s\n  nobody around...',
  '* but today i met somebody\n  nice...', '* ...', '* oh, i\'m rambling again', '* i\'ll get out of your way',
];

export class Ruins12Lesson {
  constructor(world) {
    this.world = world;
    this.nap = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_napstablook1');
    this.cheese = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_cheesetable1');
    this.stage = world.plot > 10.5 ? 'gone' : world.plot >= 10.4 ? 'leaving' : 'sleeping';
    if (this.stage === 'gone') this.nap?.image.destroy();
  }

  interact() {
    const world = this.world;
    if (this.nap && this.stage === 'sleeping' && inInteractionRange(world, this.nap)) {
      world.showChoice(NAP[0], ['Yes', 'No'], (choice) => {
        if (choice === 0) {
          world.showDialogue([...NAP.slice(1), '* (You decide not to move it.)'], { onClose: () => this.finish() });
        } else this.finish();
      });
      return true;
    }
    if (this.nap && this.stage === 'leaving' && inInteractionRange(world, this.nap)) {
      world.showDialogue(NAP_AFTER, { onClose: () => this.leave() });
      return true;
    }
    if (this.cheese && inInteractionRange(world, this.cheese)) {
      world.showDialogue(world.flags[7] === 1 ? ["* (Looks like cheese has a\n  nibble taken out of it.)"]
        : ["* This cheese has been here\n  quite a long time.", "* It's stuck to the table..."]);
      return true;
    }
    return false;
  }

  finish() {
    const world = this.world; world.plot = 10.4; world.flags[36] = 1; this.stage = 'leaving';
    if (this.nap) this.nap.image.setAlpha(.45);
  }

  leave() {
    const world = this.world; world.plot = 11; this.stage = 'gone'; this.nap?.image.destroy();
  }

  destroy() { }
}
