import { Curves } from '../vendor/phaser.esm.min.js';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { blocked, createCollider } from './movement.mjs';

// obj_goofyrock, path_goofyrock, SCR_TEXT 505 và obj_rock_activator.
export class RuinsGoofyrock {
  constructor(world) {
    this.world = world;
    this.text = world.dataSource.rockDialogue;
    this.entry = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_goofyrock');
    this.entry.item = { ...this.entry.item };
    this.rock = this.entry.image;
    this.stage = world.flags[33] === 1 ? 15 : 0;
    this.locked = false;
    const points = world.dataSource.paths.get('path_goofyrock').Points;
    this.path = new Curves.Path(points[0].X, points[0].Y);
    for (const point of points.slice(1)) this.path.lineTo(point.X, point.Y);
    this.length = this.path.getLength(); this.distance = this.stage === 15 ? this.length : 0;
    if (this.stage === 15) this.rock.x += 60;
    this.body = createCollider(world.dataSource, this.entry.item);
    world.colliders.push(this.body);
    this.wall = world.colliders.find((body) => body.objectName === 'obj_plotwall5');
    this.wall.disabled = this.stage === 15;
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_rock_activator');
    this.setSpikes(this.stage === 15);
    this.sync();
  }

  sync() {
    const { x, y } = this.rock;
    this.entry.item.X = x; this.entry.item.Y = y;
    this.body.x = x; this.body.y = y;
    this.body.rectangle.setPosition(x + this.body.sprite.MarginLeft, y + this.body.sprite.MarginTop);
    this.rock.setDepth(y + this.entry.sprite.Height);
    // plotwall5 tự hủy khi đá tới x=280; chỉ activator mới dựng tường trở lại.
    if (this.rock.x === 280) this.wall.disabled = true;
  }

  setSpikes(open) {
    for (const entry of this.world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room'))
      entry.image.setTexture(`spr_spiketile:${open ? 1 : 0}`);
  }

  update() {
    if (!this.world.dialogue) this.checkTrigger();
    return this.locked;
  }

  tryMove(x, y) {
    if (!blocked(this.world, [this.body], x, y)) return false;
    if (!this.locked && !this.world.dialogue) this.interact(true);
    return true;
  }

  interact(contact = false) {
    const world = this.world;
    if (this.locked || world.dialogue || ![0, 3, 6, 9, 12, 15].includes(this.stage)
      || !contact && !inInteractionRange(world, this.entry)) return false;
    const stage = this.stage;
    const key = { 0: 'first', 3: 'second', 6: 'third', 9: 'helpful', 12: 'stay', 15: world.flags[7] === 1 ? 'ending' : 'done' }[stage];
    // Conversation 9 không tăng: phải đi tới activator mới khiến đá rời nút.
    if (stage !== 9 && stage !== 15) this.stage++;
    world.showDialogue(this.text[key], { onClose: () => this.afterDialogue(stage) });
    return true;
  }

  afterDialogue(stage) {
    const world = this.world, player = world.player;
    if (stage === 0 || stage === 12) {
      if (player.x > this.rock.x + 15) this.nudgePlayer(1, 0, stage === 0 ? 11 : 21);
    } else if (stage === 3 && player.y + 30 < this.rock.y + 20) this.nudgePlayer(0, -1, 11);
    else if (stage === 6) {
      if (player.y + 30 > this.rock.y + 20) this.nudgePlayer(0, 1, 11);
      this.nudgeDelay = world.time.delayedCall(11 * 1000 / 30, () => {
        this.nudge?.stop();
        if (player.x > this.rock.x + 15) this.nudgePlayer(1, 0, 50);
      });
    }
    if (stage === 0) this.move(1, 10, 3, true);
    else if (stage === 3) this.move(1, 10, 6, true);
    else if (stage === 6) this.move(1, 60, 9, true);
    else if (stage === 12) this.move(1, 20, 15, true);
  }

  nudgePlayer(dx, dy, frames) {
    const player = this.world.player;
    this.nudge = this.world.tweens.add({ targets: player, x: player.x + dx * frames, y: player.y + dy * frames,
      duration: frames * 1000 / 30, onUpdate: () => player.setDepth(player.y + 30) });
  }

  move(speed, frames, nextStage, locked) {
    this.motion?.stop(); this.pauseTimer?.remove();
    this.stage = nextStage - 1; this.locked = locked;
    this.motion = this.world.tweens.add({ targets: this, distance: Math.min(this.length, this.distance + speed * frames),
      duration: frames * 1000 / 30,
      onUpdate: () => {
        const point = this.path.getPoint(this.distance / this.length);
        this.rock.setPosition(point.x, point.y); this.sync();
      },
      onComplete: () => {
        this.pauseTimer = this.world.time.delayedCall(1000 / 30, () => {
          this.locked = false; this.stage = nextStage; this.nudge?.stop();
          if (nextStage === 9 || nextStage === 15) this.setSpikes(true);
          if (nextStage === 15) { this.world.flags[33] = 1; this.rock.x = 280; this.sync(); }
        });
      } });
  }

  checkTrigger() {
    const world = this.world;
    if (world.plot > 12 || !this.trigger || this.stage <= 7 || this.stage >= 10.5
      || !touchesObject(world, world.player, this.trigger, 1, 400)) return false;
    this.setSpikes(false);
    this.move(2, 10, 12, this.locked);
    this.stage = 11;
    this.wallTimer = world.time.delayedCall(3 * 1000 / 30, () => {
      // obj_rock_activator Alarm0 tạo plotwall5 tại (380,50).
      Object.assign(this.wall, createCollider(world.dataSource, { ObjectName: 'obj_plotwall5', X: 380, Y: 50 }));
      this.wall.disabled = this.rock.x === 280;
    });
    return true;
  }

  destroy() {
    for (const tween of [this.motion, this.nudge]) tween?.stop();
    for (const timer of [this.pauseTimer, this.nudgeDelay, this.wallTimer]) timer?.remove();
  }
}
