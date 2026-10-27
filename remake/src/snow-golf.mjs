import { Geom } from '../vendor/phaser.esm.min.js';
import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';

// obj_rollsnow/gen/golfedge/golfhole/iceflag, tọa độ overworld gốc ở 30Hz.
export class SnowGolf {
  constructor(world) {
    this.world = world; this.text = world.dataSource.golfDialogue; this.elapsed = 0; this.frames = 0; this.flags = []; this.read = 0;
    this.generator = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_rollsnowgen');
    this.hole = world.roomObjects.find((e) => e.item.ObjectName === 'obj_golfhole'); this.hole.image.setDepth(-950000);
    this.holeBody = createCollider(world.dataSource, this.hole.item).rectangle;
    this.flagClip = world.add.graphics().fillStyle(0xffffff).fillRect(0, 0, world.dataSource.room.Width, this.hole.item.Y + 10).setVisible(false);
    this.flagMask = this.flagClip.createGeometryMask();
    this.edges = world.dataSource.room.GameObjects.filter((e) => e.ObjectName === 'obj_golfedge').map((e) => createCollider(world.dataSource, e).rectangle);
    this.disabled = world.flags[203] >= 16; this.nextBall = Infinity;
    if (!this.disabled) this.spawn(false);
  }

  spawn(falling) {
    const w = this.world;
    this.ball = { x: this.generator.X, y: falling ? w.cameras.main.scrollY - 10 : this.generator.Y, vx: 0, vy: 0, size: 2, angle: 0,
      falling: falling ? 1 : 0, friction: .1, touched: false, shrink: 30, rolltime: 0, timeRunning: false, cooldown: 0 };
    this.image = w.add.image(this.ball.x, this.ball.y, 'spr_rollsnow:0').setOrigin(.5);
    this.draw(); this.nextBall = Infinity;
  }

  bounds(ball = this.ball) { const size = ball.collisionSize ?? ball.size; return new Geom.Rectangle(ball.x - 3 * size, ball.y - size, 6 * size, 6 * size); }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
  }

  step() {
    this.frames++; const w = this.world;
    for (const flag of this.flags) {
      if (flag.yoff > 1) flag.image.y--;
      flag.yoff--;
      const c = w.cameras.main, p = flag.image;
      if (p.x > c.scrollX + 320 || p.x < c.scrollX - 10 || p.y > c.scrollY + 270 || p.y < c.scrollY) p.destroy();
    }
    this.flags = this.flags.filter((flag) => flag.image.active);
    if (!this.ball) { if (this.frames >= this.nextBall && !this.disabled) this.spawn(true); return; }
    const b = this.ball, previous = { x: b.x, y: b.y };
    b.cooldown = Math.max(0, b.cooldown - 1);
    b.angle += (Math.abs(b.vx) + Math.abs(b.vy)) * 3 / b.size;
    b.collisionSize = b.size; // Step gốc đặt image_xscale trước khi giảm size; Draw dùng size mới.
    if (!b.falling) this.attract();
    if (b.falling === 1) { b.friction = -.1; b.vy = 3; b.falling = 2; }
    if (b.falling === 2 && b.y > this.generator.Y) { b.y = this.generator.Y; b.friction = .1; b.vx = b.vy = 0; b.falling = 0; }
    if (b.touched && !b.vx && !b.vy) { if (b.shrink > 0) b.shrink--; else b.size -= .01; }
    if (b.timeRunning) b.rolltime++;
    if (b.falling === 5) b.size -= .05;
    if (b.size < .2) { this.image.destroy(); this.ball = null; this.nextBall = this.frames + 10; return; }
    const speed = Math.hypot(b.vx, b.vy), scale = speed ? Math.max(0, speed - b.friction) / speed : 0;
    b.vx *= scale; b.vy *= scale; b.x += b.vx; b.y += b.vy;
    if (b.falling === 5 && Geom.Rectangle.Overlaps(this.bounds(), this.holeBody)) { b.friction = 1; if (b.size > .3) b.size -= .1; }
    if (!b.falling) {
      const body = this.bounds(), p = w.player, feet = new Geom.Rectangle(p.x, p.y + 19, 20, 11);
      if (Geom.Rectangle.Overlaps(body, feet)) {
        if (!b.cooldown) {
          const angle = Math.atan2(p.y + 24 - b.y, p.x + 9.5 - b.x), force = 4 + 1 / b.size + .1;
          b.vx = -Math.cos(angle) * force; b.vy = -Math.sin(angle) * force; b.shrink = 30; b.cooldown = 15;
        }
        b.touched = true; b.timeRunning = true;
      }
      if (Geom.Rectangle.Overlaps(body, this.holeBody)) this.score();
      else {
        const edge = this.edges.find((edge) => Geom.Rectangle.Overlaps(body, edge));
        if (edge) this.bounce(edge, previous);
      }
    }
    this.draw();
  }

  attract() {
    const b = this.ball, r = this.bounds(), h = this.holeBody;
    const dx = Math.max(h.left - r.right, r.left - h.right, 0), dy = Math.max(h.top - r.bottom, r.top - h.bottom, 0);
    if (Math.hypot(dx, dy) >= 8) return;
    if (r.bottom < h.top) b.y += .2;
    if (r.top > h.bottom) b.y -= .2;
    const center = this.hole.item.X + this.hole.sprite.Width / 2;
    if (b.x < center) b.x += .2;
    if (b.x > center) b.x -= .2;
  }

  bounce(edge, previous) {
    const b = this.ball; b.x = previous.x; b.y = previous.y;
    const speed = Math.hypot(b.vx, b.vy), scale = speed > .06 ? (speed - .05) / speed : 0; b.vx *= scale; b.vy *= scale;
    const r = this.bounds();
    if (edge.right < r.left) { b.x += 2; b.vx = -b.vx; }
    if (edge.left > r.right) { b.x -= 2; b.vx = -b.vx; }
    if (edge.top > r.bottom) { b.y -= 2; b.vy = -b.vy; }
    if (edge.bottom < r.top) { b.y += 2; b.vy = -b.vy; }
  }

  score() {
    const b = this.ball, w = this.world; let type = 0;
    for (const [i, time] of [180, 240, 330, 450, 600].entries()) if (b.rolltime > time) type = i + 1;
    if (b.size < .6) type = 6;
    const image = w.add.image(this.hole.item.X, this.hole.item.Y + 10, `spr_iceflag:${type}`).setOrigin(0).setDepth(this.hole.item.Y + 10).setMask(this.flagMask);
    this.flags.push({ image, type, yoff: 40 }); this.read = 0; w.sound.play('snd_dumbvictory'); b.falling = 5;
    b.friction = 1; if (b.size > .3) b.size -= .1;
  }

  draw() {
    const b = this.ball, p = this.world.player;
    const depth = b.falling === 5 ? -900000 : b.falling ? -1000 : b.vy > .1 ? p.depth + 1 : b.vy < -.1 ? p.depth - 1 : b.y + 4;
    this.image.setPosition(b.x, b.y).setScale(b.size).setAngle(-b.angle).setDepth(depth);
  }

  interact() {
    const w = this.world, e = w.roomObjects.find((e) => e.item.ObjectName === 'obj_readable_room2' && inInteractionRange(w, e));
    if (!e) return false;
    let lines;
    if (!this.flags.length) lines = this.disabled ? this.text.empty : this.text.hole;
    else if (this.read) lines = this.text.read;
    else {
      const type = this.flags[0].type;
      lines = this.text.rewards[type];
      if (type === 0) {
        if (w.flags[387]) { lines = this.text.redAgain; w.gold += 10; }
        else { w.flags[387] = 1; w.gold += 50; }
      } else w.gold += [0, 5, 3, 2, 1, 2, 4][type];
    }
    this.read++; w.showDialogue(lines); return true;
  }

  destroy() { this.image?.destroy(); this.flags.forEach((flag) => flag.image.destroy()); this.flags = []; this.flagMask.destroy(); this.flagClip.destroy(); }
}
