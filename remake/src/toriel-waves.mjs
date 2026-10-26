import { Curves } from '../vendor/phaser.esm.min.js';
import { RuinsWave } from './ruins-waves.mjs';

// obj_torielboss/obj_1sidegen: tọa độ gốc 640×480, cập nhật 30 Hz.
export class TorielWave extends RuinsWave {
  constructor(scene, command, { hard = false, conversation = 0 } = {}) {
    super(scene, 'toriel');
    this.hard = hard; this.command = command; this.phase = Math.floor(scene.time.now * .03);
    this.kind = scene.hp <= 2 || conversation >= 13 ? 'avoid' : command <= 20 ? 'helix'
      : command <= 40 ? 'mini' : command <= 60 ? 'float' : command <= 80 ? 'hands' : 'hand';
    this.border = { left: 227, right: 407, top: command < 40 || scene.hp < 3 ? 200 : 250, bottom: 385 };
    this.duration = conversation > 13 ? 1 : this.kind === 'hand' || this.kind === 'hands' ? 200 : this.kind === 'avoid' ? 140 : hard ? 160 : 140;
    this.rate = this.kind === 'avoid' ? 2 : this.kind === 'helix' ? hard ? 4 : 5 : this.kind === 'float' ? hard ? 5 : 6 : hard ? 1 : 2;
    const b = this.border;
    scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2);
    scene.soul.setPosition((b.left + b.right) / 4 - 4, (b.top + b.bottom) / 4 - 4);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false);
    this.mask = this.clip.createGeometryMask(); this.hands = [];
    if (this.kind === 'hand' || this.kind === 'hands') {
      this.addHand('path_hand1', b.left - 45, b.top + 5, this.kind === 'hands');
      if (this.kind === 'hands') this.addHand('path_hand2', b.right + 5, b.bottom - 15, true);
      if (this.hands[1]) this.hands[1].damage = scene.hp > 6 ? hard ? 6 : 5 : 0;
    }
  }

  fire(kind, x, y, values = {}) {
    let damage = kind === 'avoid' ? 1 : this.scene.hp < 6 ? 1 : this.scene.hp < 8 ? 2 : this.hard ? 8 : 6;
    if (kind === 'chase') damage = this.scene.hp < 6 ? 1 : this.scene.hp < 8 ? 2 : 4;
    if (kind === 'seek') damage = this.scene.hp < 6 ? 1 : this.scene.hp < 8 ? 2 : 5;
    const bullet = this.add('spr_firebullet', x, y, { kind, damage, r: Math.round(Math.random()), ...values });
    bullet.image.setMask(this.mask); return bullet;
  }

  addHand(name, x, y, seeking) {
    const points = this.scene.cache.json.get(name).Points;
    const curve = new Curves.Spline(points.map((point) => [point.X - points[0].X + x, point.Y - points[0].Y + y]));
    const bullet = this.add('spr_handbullet', x, y, { kind: 'hand', damage: this.hard ? 8 : 6, curve,
      length: curve.getLength(), distance: 0, pathSpeed: .2, nextFire: 8, seeking, finished: false });
    bullet.frame = Number(y < this.border.top + 60); bullet.image.setTexture(`spr_handbullet:${bullet.frame}`).setMask(this.mask);
    this.hands.push(bullet);
  }

  spawn() {
    const b = this.border, center = (b.left + b.right) / 2 - 3;
    if (this.kind === 'helix' || this.kind === 'float') this.fire('helix', center, b.top - 5, { vy: .7, gravity: .12 });
    if (this.kind === 'mini') this.fire('mini', center, b.top + 5, { vy: Math.abs(Math.sin((this.phase + this.frames) / 20) * .95), gravity: .06, bounces: 0 });
    if (this.kind === 'float') for (const x of [b.left + 2, b.right - 18]) this.fire('float', x, b.top + 90, { vy: Math.random() * 8 - 4 });
    if (this.kind === 'avoid') {
      const angle = (250 + Math.random() * 40) * Math.PI / 180, gravity = .1 + Math.random() * .2;
      this.fire('avoid', b.left + Math.round(Math.random() * (b.right - b.left)) - 40, b.top - 20,
        { gravityX: Math.cos(angle) * gravity, gravityY: -Math.sin(angle) * gravity });
    }
  }

  stepHand(bullet) {
    if (this.scene.hp < 8) bullet.damage = this.scene.hp < 6 ? 1 : 2;
    if (!bullet.finished) {
      bullet.distance = Math.min(bullet.length, bullet.distance + bullet.pathSpeed);
      const point = bullet.curve.getPointAt(bullet.distance / bullet.length);
      bullet.x = point.x; bullet.y = point.y;
      bullet.pathSpeed += bullet.distance / bullet.length < .5 ? .2 : -.1;
      if (bullet.distance === bullet.length) bullet.finished = true;
    }
    if (bullet.age === bullet.nextFire) {
      if (bullet.finished) bullet.removeAt = bullet.age + (bullet === this.hands[0] ? 100 : 70);
      else {
        const fire = this.fire(bullet.seeking ? 'seek' : 'chase', bullet.x + 22, bullet.y + 5,
          { hand: bullet, vy: bullet.seeking ? 0 : Math.random() * 8 - 4, speed: 0 });
        fire.image.setTexture('spr_firebullet:0'); bullet.nextFire += 4;
        this.scene.sound.play('snd_noise');
      }
    }
    if (bullet.age >= bullet.removeAt) bullet.dead = true;
  }

  stepFire(bullet) {
    const b = this.border, hx = this.scene.soul.x * 2, hy = this.scene.soul.y * 2;
    const oldY = bullet.y;
    if (bullet.kind === 'helix') {
      bullet.vx = (bullet.r ? 1 : -1) * Math.sin((this.phase + this.frames) / 10) * 4;
      if (bullet.horizontalGravity) bullet.vx += bullet.horizontalGravity;
      bullet.vy += bullet.gravity;
    } else if (bullet.kind === 'mini') {
      bullet.vx = (bullet.r ? 1 : -1) * Math.sin((bullet.age - 1) / 5) * 8; bullet.vy += bullet.gravity;
    } else if (bullet.kind === 'avoid') {
      if (Math.abs(bullet.y - hy) < 100) bullet.vx = (180 / (Math.abs(bullet.x - hx) + 10) - 1) * (hx > bullet.x ? -1 : 1);
      bullet.vx += bullet.gravityX; bullet.vy += bullet.gravityY;
    } else if (bullet.kind === 'chase') {
      if (bullet.age === 45) { this.aim(bullet, 2); bullet.accelerating = true; }
      if (bullet.age >= 49 && (bullet.age - 49) % 2 === 0) { bullet.vx += hx > bullet.x ? .1 : -.1; bullet.vy += hy > bullet.y ? .1 : -.1; }
      if (bullet.accelerating) { const angle = Math.atan2(bullet.vy, bullet.vx); bullet.vx += Math.cos(angle) * .05; bullet.vy += Math.sin(angle) * .05; }
    } else if (bullet.kind === 'seek' && bullet.hand.finished) {
      if (!bullet.accelerating) { this.aim(bullet, .6); bullet.accelerating = true; }
      const angle = Math.atan2(bullet.vy, bullet.vx); bullet.vx += Math.cos(angle) * .1; bullet.vy += Math.sin(angle) * .1;
    }
    bullet.x += bullet.vx; bullet.y += bullet.vy;
    const data = this.scene.cache.json.get(bullet.sprite);
    if (bullet.kind === 'helix' && bullet.y + data.MarginBottom >= b.bottom) {
      bullet.y = oldY; bullet.vy = 0; bullet.gravity = 0; bullet.horizontalGravity = (bullet.r ? -1 : 1) * .12;
    } else if (bullet.kind === 'mini' && bullet.y + data.MarginBottom >= b.bottom) {
      bullet.y = oldY; bullet.gravity = 0; bullet.vy = -.2; bullet.bounces++;
      this.scene.sound.play('snd_noise'); if (bullet.bounces === 3) bullet.dead = true;
    } else if (bullet.kind === 'chase' || bullet.kind === 'seek') {
      if (bullet.x + data.MarginLeft <= b.left && bullet.vx < 0 || bullet.x + data.MarginRight >= b.right && bullet.vx > 0) {
        bullet.vx *= -1; bullet.friction = bullet.kind === 'seek' ? .08 : .04;
      }
      const topHit = bullet.y + data.MarginTop <= b.top && bullet.vy < 0;
      const bottomHit = bullet.y + data.MarginBottom >= b.bottom && bullet.vy > 0;
      if (topHit || bottomHit) {
        bullet.vy *= -1; bullet.friction = bullet.kind === 'seek' ? .08 : .04;
        if (bullet.kind === 'chase') {
          if (bottomHit && bullet.bounced) bullet.dead = true;
          if (topHit) bullet.bounced = true;
        }
      }
      if (bullet.friction) {
        const speed = Math.max(0, Math.hypot(bullet.vx, bullet.vy) - bullet.friction), angle = Math.atan2(bullet.vy, bullet.vx);
        bullet.vx = Math.cos(angle) * speed; bullet.vy = Math.sin(angle) * speed;
      }
    }
    if (bullet.kind === 'avoid') {
      bullet.image.setVisible(bullet.y > b.top);
      if (bullet.x < b.left || bullet.x > b.right || bullet.y > b.bottom) bullet.dead = true;
    } else if (['helix', 'mini', 'float'].includes(bullet.kind)) {
      if (bullet.x + data.MarginLeft <= b.left && bullet.vx < 0 || bullet.x + data.MarginRight >= b.right && bullet.vx > 0
        || bullet.y + data.MarginTop <= b.top && bullet.vy < 0 || bullet.kind === 'float' && bullet.y + data.MarginBottom >= b.bottom && bullet.vy > 0) bullet.dead = true;
    }
    bullet.image.setTexture(`spr_firebullet:${Math.floor(bullet.age * (bullet.kind === 'avoid' ? .2 : .5)) % data.TextureCount}`);
  }

  step() {
    this.frames++;
    if (this.duration <= 1) return true;
    if (!['hand', 'hands'].includes(this.kind) && this.frames >= this.next) { this.spawn(); this.next += this.rate; }
    for (const bullet of [...this.bullets]) {
      bullet.age++;
      if (bullet.kind === 'hand') this.stepHand(bullet); else this.stepFire(bullet);
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2);
      if (!bullet.dead && bullet.image.visible && this.scene.invFrames <= 0 && this.touchesHeart(bullet)) {
        this.scene.hurt(bullet.damage); bullet.dead = true;
      }
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    return this.frames >= this.duration || this.scene.hp <= 2 && this.kind !== 'avoid';
  }

  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
