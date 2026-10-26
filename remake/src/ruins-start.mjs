import { inInteractionRange, touchesObject } from './npc.mjs';
import { createCollider } from './movement.mjs';

// room_ruins7: cuộc gọi Toriel, Froggit nhỏ và điểm SAVE.
export class RuinsStart {
  constructor(world) {
    this.world = world;
    this.text = world.dataSource.ruinsStartDialogue;
    this.phoneUsed = world.plot > 9.1;
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_torielcall1');
    this.frog = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_smallfrog');
    if (this.frog) {
      this.body = createCollider(world.dataSource, this.frog.item); world.colliders.push(this.body);
    }
  }

  animate() {
    if (!this.frog) return;
    const world = this.world;
    if (world.kills > 0) {
      this.frog.image.destroy(); this.frog = null;
      this.body.disabled = true;
      return;
    }
    this.frog.image.setTexture(`${this.frog.object.Sprite}:${Math.floor(world.time.now / (1000 / 3)) % this.frog.sprite.TextureCount}`);
  }

  update() {
    const world = this.world;
    if (!this.phoneUsed && touchesObject(world, world.player, this.trigger, 1, 400)) {
      this.phoneUsed = true;
      world.sound.play('snd_phone');
      const afterDog = (world.flags[37] ?? 0) !== 0;
      if (afterDog) world.flags[37] = 2;
      const pages = this.text[afterDog ? 'afterDog' : 'call'];
      world.showDialogue(pages.map((page) => page.text), { onPage: (index) => world.setDialoguePortrait(pages[index].portrait),
        onClose: () => { world.plot = 9.2; } });
      return true;
    }
    return false;
  }

  interact() {
    const world = this.world;
    if (this.frog && inInteractionRange(world, this.frog)) {
      world.showDialogue(this.text[world.flags[7] === 1 ? 'frogAfter' : world.flags[6] === 1 ? 'frogHard' : 'frog']);
      return true;
    }
    return false;
  }
}
