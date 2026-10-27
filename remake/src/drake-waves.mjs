import { RuinsWave } from './ruins-waves.mjs';

// obj_4sidegen, blt_4sidebullet/blt_clawbullet_white: tọa độ 640×480, 30 Hz.
export class DrakeWave extends RuinsWave {
  constructor(scene, command, chill = false, options = {}) {
    super(scene, 'drake');
    const population = options.population ?? 1;
    this.rotating = command > 50; this.rate = Math.trunc((chill ? 17 : 16) * (population === 3 ? 2.4 : population === 2 ? chill ? 1.7 : 2 : 1) + (this.rotating ? 8 : 0));
    this.duration = chill || population === 2 ? 130 : 120; this.border = options.border ?? { left: 227, right: 407, top: 200, bottom: 385 };
    const b = this.border;
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false);
    this.mask = this.clip.createGeometryMask();
    scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2); scene.soul.setPosition(154.5, 142.5);
  }

  spawn() {
    const b = this.border, side = Math.floor(Math.random() * 4);
    // Generator không có sprite: SCR_BORDER_X_X phân thành 8 khoảng, X dùng ngẫu nhiên.
    const along = this.rotating ? null : Math.floor(1 + Math.random() * 6) / 8;
    let x = side < 2 ? b.left + (this.rotating ? 50 + Math.round(Math.random() * (b.right - b.left - 50)) : (b.right - b.left) * along) : side === 2 ? b.left - 14 : b.right + 14;
    let y = side < 2 ? side === 0 ? b.top - 14 : b.bottom + 14
      : this.rotating ? b.top + 25 + Math.round(Math.random() * (b.bottom - b.top - 50)) : b.top + (b.bottom - b.top) * along;
    const direction = side === 0 ? 270 : side === 1 ? 90 : side === 2 ? 0 : 180;
    let rotation = 0;
    if (this.rotating) {
      let turn = Math.floor(Math.random() * 2);
      x -= 12; y -= 12;
      if (y < b.top) turn = x > (b.left + b.right) / 2 ? 0 : 1;
      if (y > b.bottom) turn = x > (b.left + b.right) / 2 ? 1 : 0;
      rotation = (turn ? 1 : -1) * (1 + Math.random());
    }
    return this.claw(x, y, { direction, rotation, speed: this.rotating ? 1.5 + Math.random() * .5 : 2 + Math.random() * 1.5,
      parent: true, limit: this.rotating ? 4 + Math.round(Math.random() * 3) : 2 });
  }

  claw(x, y, values) {
    const sprite = this.rotating ? 'spr_rotclawbullet' : 'spr_clawbullet';
    const bullet = this.add(sprite, x, y, { xstart: x, ystart: y, damage: 6, speed: 0, direction: 0, rotation: 0, age: 0, copies: 0, ...values });
    bullet.startDirection = bullet.direction; bullet.startSpeed = bullet.speed;
    // Alarm 3 khởi động sau hai frame; bản sao cũng đi qua alarm này.
    bullet.speed = 0; bullet.copyAt = bullet.parent ? 2 + (this.rotating ? 6 : 26) : Infinity;
    const data = this.scene.cache.json.get(sprite);
    bullet.image.setOrigin(data.OriginX / data.Width, data.OriginY / data.Height);
    if (!this.rotating) bullet.image.setMask(this.mask);
    return bullet;
  }

  step() {
    this.frames++;
    if (this.frames >= this.next) { this.spawn(); this.next = this.frames + this.rate; }
    for (const bullet of [...this.bullets]) {
      bullet.age++;
      if (bullet.age === 2) bullet.speed = bullet.startSpeed;
      if (bullet.age === bullet.copyAt) {
        this.claw(bullet.xstart, bullet.ystart, { direction: bullet.startDirection, speed: bullet.startSpeed, rotation: bullet.rotation });
        bullet.copies++; bullet.copyAt = bullet.copies < bullet.limit ? bullet.copyAt + (this.rotating ? 6 : 26) : Infinity;
      }
      if (bullet.age >= 2) {
        if (this.rotating) bullet.speed += .1;
        const angle = bullet.direction * Math.PI / 180;
        bullet.x += Math.cos(angle) * bullet.speed; bullet.y -= Math.sin(angle) * bullet.speed;
      }
      const drawAngle = this.rotating ? bullet.direction + bullet.rotation * 2 : 0;
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2).setAngle(-drawAngle)
        .setTexture(`${bullet.sprite}:${this.rotating ? 0 : Math.floor(bullet.age * .5) % 4}`);
      bullet.angle = drawAngle;
      bullet.direction += bullet.rotation;
      const b = this.border, angle = bullet.direction * Math.PI / 180, vx = Math.cos(angle) * bullet.speed, vy = -Math.sin(angle) * bullet.speed;
      if (vx < 0 && bullet.x < b.left - 12 || vx > 0 && bullet.x > b.right + 12 || vy < 0 && bullet.y < b.top - 12 || vy > 0 && bullet.y > b.bottom + 12) bullet.dead = true;
      if (!bullet.dead && this.scene.invFrames <= 0 && this.touchesHeart(bullet)) { this.scene.hurt(bullet.damage); bullet.dead = true; }
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    return this.frames >= this.duration;
  }

  touchesHeart(bullet) {
    const scene = this.scene, data = scene.cache.json.get(bullet.sprite), angle = -(bullet.angle ?? 0) * Math.PI / 180;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    for (let hx = 0; hx < 16; hx++) for (let hy = 0; hy < 16; hy++) {
      if (!(scene.textures.getPixel(hx, hy, 'spr_heart:mask')?.red > 0)) continue;
      const x = scene.soul.x * 2 + hx, y = scene.soul.y * 2 + hy, b = this.border;
      if (x < b.left || x > b.right || y < b.top || y > b.bottom) continue;
      const dx = x - bullet.x, dy = y - bullet.y;
      const px = Math.floor(dx * cos + dy * sin + data.OriginX), py = Math.floor(-dx * sin + dy * cos + data.OriginY);
      if (px >= data.MarginLeft && px <= data.MarginRight && py >= data.MarginTop && py <= data.MarginBottom) return true;
    }
    return false;
  }

  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
