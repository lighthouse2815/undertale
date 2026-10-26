import { inInteractionRange, walkNpc } from './npc.mjs';

const TEXT = {
  first: ["* WHOA there, pardner!\n* Who said you could push\n  me around?", "* HMM?\n* So you're ASKIN' me to\n  move over?", "* Okay, just for you,\n  pumpkin."],
  second: ["* HMM?\n* You want me to move some\n  more?", "* Alrighty, how's this?"],
  third: ["* HMM?\n* That was the wrong direction?", "* Okay, think I got it."],
  fourth: ["* Was that helpful?"],
  fifth: ["* HMM?\n* You wanted me to STAY there?", "* You're giving me a real\n  workout."],
  done: ["* The exit's open.\n* Guess I better roll out..."],
};

export class RuinsGoofyrock {
  constructor(world) {
    this.world = world;
    this.entry = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_goofyrock');
    this.stage = world.flags[33] === 1 ? 15 : 0;
    this.rock = this.entry?.image;
    if (this.stage === 15 && this.rock) this.rock.x = 280;
    this.wall = world.colliders.find((body) => body.objectName === 'obj_plotwall5');
    if (this.wall) this.wall.disabled = this.stage === 15;
  }

  interact() {
    const world = this.world;
    if (!this.entry || world.dialogue || !inInteractionRange(world, this.entry)) return false;
    if (this.stage === 15) { world.showDialogue(TEXT.done); return true; }
    const pages = this.stage === 0 ? TEXT.first : this.stage === 3 ? TEXT.second
      : this.stage === 6 ? TEXT.third : this.stage === 9 ? TEXT.fourth : TEXT.fifth;
    world.showDialogue(pages, { onClose: () => this.advance() });
    return true;
  }

  advance() {
    const world = this.world;
    this.stage = this.stage === 0 ? 3 : this.stage === 3 ? 6 : this.stage === 6 ? 9 : this.stage === 9 ? 12 : 15;
    if (this.stage === 15) {
      world.flags[33] = 1; this.rock.x = 280;
      if (this.wall) this.wall.disabled = true;
      for (const entry of world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room')) entry.image.setTexture('spr_spiketile:1');
      return;
    }
    const target = this.stage === 3 ? 230 : this.stage === 6 ? 280 : this.stage === 9 ? 220 : 280;
    this.rock.x = target;
  }

  destroy() { }
}
