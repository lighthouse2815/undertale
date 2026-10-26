import { inInteractionRange, touchesObject } from './npc.mjs';
import { blocked, createCollider } from './movement.mjs';

// obj_pushrock1/2/3: đẩy từng bước, chốt khi chạm obj_toribuster.
export class RuinsRock {
  constructor(world) {
    this.world = world;
    const settings = { obj_pushrock1: [31, 100], obj_pushrock2: [32, 80], obj_pushrock3: [35, 60] };
    this.rocks = world.roomObjects.filter(({ item }) => settings[item.ObjectName]).map((entry) => {
      const [flag, distance] = settings[entry.item.ObjectName], start = entry.item.X;
      entry.item = { ...entry.item };
      const body = createCollider(world.dataSource, entry.item);
      world.colliders.push(body);
      const rock = { entry, body, flag, start, target: start + distance, pushed: world.flags[flag] === 1 };
      if (rock.pushed) entry.image.x = rock.target;
      this.sync(rock);
      return rock;
    });
    this.wall = world.colliders.find((body) => body.objectName === 'obj_plotwall4');
    this.triggers = world.dataSource.room.GameObjects.filter((item) => item.ObjectName === 'obj_toribuster');
    this.openSpikes();
  }

  sync({ entry, body }) {
    entry.item.X = entry.image.x;
    body.x = entry.image.x;
    body.rectangle.x = body.x + body.sprite.MarginLeft;
    entry.image.setDepth(entry.image.y + entry.sprite.Height);
  }

  openSpikes() {
    if (!this.wall) return;
    this.wall.disabled = this.world.flags[35] === 1;
    for (const spike of this.world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room'))
      spike.image.setTexture(`spr_spiketile:${this.wall.disabled ? 1 : 0}`);
  }

  tryMove(x, y, dx, dy) {
    const world = this.world;
    const rock = this.rocks.find(({ body }) => blocked(world, [body], x, y));
    if (!rock) return false;
    if (!rock.pushed && !dy && (dx > 0 || dx < 0 && rock.entry.image.x > rock.start)) {
      rock.entry.image.x += dx; world.player.setPosition(x, y);
      this.sync(rock);
      if (this.triggers.some((trigger) => touchesObject(world, rock.entry.image, trigger))) {
        rock.entry.image.x = rock.target; world.player.x -= 6;
        rock.pushed = true; world.flags[rock.flag] = 1;
        this.sync(rock); this.openSpikes();
      }
    }
    return true;
  }

  interact() {
    const world = this.world;
    const sign = world.roomObjects.find((entry) => entry.item.ObjectName === 'obj_readable_room1');
    if (!sign || !inInteractionRange(world, sign)) return false;
    world.showDialogue(['* Three out of four grey rocks\n  recommend you push them.']);
    return true;
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
