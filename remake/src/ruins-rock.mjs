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

// obj_holeup/obj_holedown: chờ 10 frame, đi qua hai tầng cách nhau 400 pixel.
export class RuinsHoles {
  constructor(world) {
    this.world = world;
    this.holes = world.dataSource.room.GameObjects
      .filter((item) => ['obj_holeup', 'obj_holedown', 'obj_holedown2'].includes(item.ObjectName))
      .map((item) => ({ item, body: createCollider(world.dataSource,
        item.ObjectName === 'obj_holedown2' ? { ...item, ScaleY: 4 } : item) }));
    this.stage = 'idle'; this.locked = false; this.elapsed = 0;
    this.cosmeticHoles = [];
  }

  checkTrigger() {
    const world = this.world;
    if (this.locked || world.dialogue) return false;
    const hole = this.holes.find(({ body }) => !body.disabled && blocked(world, [body], world.player.x, world.player.y));
    if (!hole) return false;
    this.hole = hole; this.up = hole.item.ObjectName === 'obj_holeup';
    if (!this.up) {
      const image = world.add.image(world.player.x, world.player.y + 20, 'spr_hole:0').setOrigin(0).setDepth(-70000);
      this.cosmeticHoles.push(image);
      // Sau lần sập thứ 11 ở phòng 10, sàn thôi sập cho tới khi vào lại phòng.
      if (this.cosmeticHoles.length > 10 && world.dataSource.name === 'room_ruins10') {
        world.sound.play('snd_hero');
        for (const mark of this.cosmeticHoles) mark.destroy();
        this.cosmeticHoles = []; hole.body.disabled = true;
        return false;
      }
      if (this.cosmeticHoles.length >= 1000) {
        for (const mark of this.cosmeticHoles.slice(0, -1)) mark.destroy();
        this.cosmeticHoles = [image];
      }
      world.sound.play('snd_noise');
    }
    this.locked = true; this.stage = 'waiting'; this.frames = 0; this.elapsed = 0;
    return true;
  }

  update(delta) {
    if (!this.locked) return this.checkTrigger();
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30 && this.locked) {
      this.elapsed -= 1000 / 30;
      this.step();
    }
    this.world.updateCamera();
    return true;
  }

  step() {
    const world = this.world, player = world.player;
    this.frames++;
    if (this.stage === 'waiting') {
      if (this.frames < 10) return;
      this.frames = 0; this.stage = this.up ? 'rising' : 'falling';
      player.facing = 'd'; player.frameIndex = 0;
      player.setTexture('spr_maincharad:0');
      if (this.up) player.setVisible(false);
      else { player.setAlpha(.5); world.sound.play('snd_fall2'); }
      return;
    }
    if (!this.up && this.frames % 4 === 0) {
      player.facing = { d: 'r', r: 'u', u: 'l', l: 'd' }[player.facing];
      player.setTexture(`spr_mainchara${player.facing}:0`);
    }
    player.y += this.up ? -10 : 5;
    player.setDepth(player.y + 30);
    if (this.frames === (this.up ? 40 : 80)) {
      this.locked = false; this.stage = 'idle';
      player.setVisible(true).setAlpha(1);
    }
  }

  destroy() {
    this.locked = false;
    if (this.world.player?.active) this.world.player.setVisible(true).setAlpha(1);
    for (const image of this.cosmeticHoles) image.destroy();
    this.cosmeticHoles = [];
  }
}
