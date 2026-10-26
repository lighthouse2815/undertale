import { inInteractionRange, touchesObject } from './npc.mjs';
import { createCollider } from './movement.mjs';

// room_ruins9: obj_pushrock3, obj_plotwall4 và spikes_room.
export class RuinsRock {
  constructor(world) {
    this.world = world;
    this.entry = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_pushrock3');
    this.wall = world.colliders.find((body) => body.objectName === 'obj_plotwall4');
    this.spikes = world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room');
    this.pushed = world.flags[35] === 1;
    this.sync();
  }

  sync() {
    const world = this.world;
    if (!this.entry) return;
    if (this.pushed) {
      this.entry.image.x = this.entry.item.X + 60;
      this.entry.image.setVisible(false);
      if (this.wall) this.wall.disabled = true;
      for (const spike of this.spikes) spike.image.setTexture('spr_spiketile:1');
    } else if (this.wall) this.wall.disabled = false;
  }

  update() {
    const world = this.world;
    if (!this.entry || this.pushed || world.dialogue) return false;
    const rock = this.entry.image;
    const dx = world.player.x - rock.x, dy = world.player.y - rock.y;
    if (Math.abs(dx) < 28 && Math.abs(dy) < 25 && world.player.facing === 'r') {
      this.pushed = true; world.flags[35] = 1;
      rock.x = this.entry.item.X + 60; world.player.x -= 6;
      this.sync(); world.sound.play('snd_noise');
      return true;
    }
    return false;
  }

  interact() {
    const world = this.world;
    const sign = world.roomObjects.find((entry) => entry.item.ObjectName === 'obj_readable_room1');
    if (sign && inInteractionRange(world, sign)) {
      world.showDialogue(["* (The path ahead is blocked by spikes.)"]);
      return true;
    }
    return false;
  }
}

export class RuinsHoles {
  constructor(world) {
    this.world = world;
    this.holes = world.dataSource.room.GameObjects.filter((item) => ['obj_holeup', 'obj_holedown', 'obj_holedown2'].includes(item.ObjectName));
    this.cooldown = 0;
  }

  update(delta) {
    if (this.locked) {
      this.timer -= delta;
      if (this.timer <= 0) {
        this.locked = false;
        this.world.player.setVisible(true);
        this.world.player.y = this.hole.ObjectName === 'obj_holeup' ? 440 : 120;
      }
      return true;
    }
    this.cooldown = Math.max(0, this.cooldown - delta);
    if (this.cooldown || this.world.dialogue) return false;
    const player = this.world.player;
    const hole = this.holes.find((item) => Math.abs(player.x - item.X) < 24 && Math.abs(player.y - item.Y) < 28);
    if (!hole) return false;
    this.cooldown = 1600; this.timer = 41 * 1000 / 30; this.hole = hole; this.locked = true;
    this.world.player.setVisible(false);
    return true;
  }

  destroy() { this.cooldown = 0; }
}
