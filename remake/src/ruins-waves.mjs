const BORDER = { left: 237, right: 397, top: 250, bottom: 385 };
const radians = (angle) => angle * Math.PI / 180;

// Chuyển các generator của Froggit/Whimsun; tọa độ và vận tốc gốc ở 640×480, 30 Hz.
export class RuinsWave {
  constructor(scene, kind) {
    this.scene = scene; this.kind = kind; this.frames = 0; this.next = 1; this.bullets = [];
    if (kind === 'leap') this.add('spr_smallfrogbullet', BORDER.right - 40, BORDER.bottom - 40, { launchAt: 30 + Math.random() * 30, damage: 4 });
    if (kind === 'circle') {
      let x = scene.soul.x * 2, y = scene.soul.y * 2 + 42;
      // obj_rotategen đặt từng con rồi cộng vào tọa độ generator, không phải một vòng tròn cố định.
      for (let angle = 0; angle < 360; angle += 36) {
        this.add('spr_butterflybllt', x, y, { angle, damage: 0 });
        x += 20 * Math.cos(radians(angle)); y -= 20 * Math.sin(radians(angle));
      }
    }
  }

  add(sprite, x, y, values) {
    const image = this.scene.add.image(x / 2, y / 2, `${sprite}:0`).setOrigin(0).setScale(.5);
    const bullet = { sprite, x, y, vx: 0, vy: 0, age: 0, damage: 4, image, ...values };
    this.bullets.push(bullet); return bullet;
  }

  aim(bullet, speed) {
    const angle = Math.atan2(this.scene.soul.y * 2 + 2 - bullet.y, this.scene.soul.x * 2 + 2 - bullet.x);
    bullet.vx = Math.cos(angle) * speed; bullet.vy = Math.sin(angle) * speed;
  }

  step() {
    this.frames++;
    if (this.frames >= this.next) {
      if (this.kind === 'flies') {
        const bullet = this.add('spr_flybullet', BORDER.left + Math.round(Math.random() * 160), BORDER.top, {});
        this.aim(bullet, 2.5); this.next = this.frames + 20;
      } else if (this.kind === 'columns') {
        for (const dx of [-40, 40]) this.add('spr_butterflybllt', this.scene.soul.x * 2 + dx, BORDER.bottom - 4,
          { vy: -(0.2 + Math.random() * 2), damage: 4 });
        this.next = this.frames + 7 + Math.floor(Math.random() * 3);
      }
    }
    for (const bullet of this.bullets) {
      bullet.age++;
      if (this.kind === 'circle') {
        bullet.vx = Math.cos(radians(bullet.angle)) * 2; bullet.vy = -Math.sin(radians(bullet.angle)) * 2;
        bullet.image.setAngle(-bullet.angle); bullet.angle += 3;
      } else if (this.kind === 'columns') {
        bullet.vy -= .1; bullet.image.setAngle(-90);
      } else if (this.kind === 'leap') {
        if (bullet.age >= bullet.launchAt && bullet.vx === 0) {
          const angle = radians(145 - Math.random() * 20), speed = 7 + Math.random() * 3;
          bullet.vx = Math.cos(angle) * speed; bullet.vy = -Math.sin(angle) * speed; bullet.damage *= 1.8;
        }
        if (bullet.age >= bullet.launchAt) {
          bullet.vx += Math.cos(radians(280)) * .4; bullet.vy -= Math.sin(radians(280)) * .4;
        }
      } else if (this.kind === 'flies') {
        if (bullet.age % 30 === 0) { bullet.vx = 0; bullet.vy = 0; }
        if (bullet.age >= 45 && (bullet.age - 45) % 45 === 0) this.aim(bullet, 3);
      }
      bullet.x += bullet.vx; bullet.y += bullet.vy;
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2);
      const frame = this.kind === 'leap' ? Number(bullet.age >= bullet.launchAt)
        : Math.floor(bullet.age * (this.kind === 'flies' ? .5 : .25)) % 2;
      bullet.image.setTexture(`${bullet.sprite}:${frame}`);
      if (this.scene.invFrames <= 0 && this.touchesHeart(bullet)) {
        this.scene.hurt(bullet.damage); bullet.dead = this.kind !== 'leap';
      }
      const data = this.scene.cache.json.get(bullet.sprite);
      if (bullet.x + data.MarginRight < BORDER.left && bullet.vx < 0 || bullet.x + data.MarginLeft > BORDER.right && bullet.vx > 0
        || bullet.y + data.MarginBottom < BORDER.top && bullet.vy < 0 || bullet.y + data.MarginTop > BORDER.bottom && bullet.vy > 0) bullet.dead = true;
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    return this.frames >= 100 || (this.kind === 'leap' && !this.bullets.length);
  }

  touchesHeart(bullet) {
    const scene = this.scene, data = scene.cache.json.get(bullet.sprite);
    const hx = scene.soul.x * 2, hy = scene.soul.y * 2;
    const left = Math.ceil(Math.max(hx, bullet.x + data.MarginLeft)), right = Math.floor(Math.min(hx + 15, bullet.x + data.MarginRight));
    const top = Math.ceil(Math.max(hy, bullet.y + data.MarginTop)), bottom = Math.floor(Math.min(hy + 15, bullet.y + data.MarginBottom));
    for (let x = left; x <= right; x++) for (let y = top; y <= bottom; y++) {
      if (!scene.textures.getPixelAlpha(Math.floor(x - hx), Math.floor(y - hy), 'spr_heart:mask')) continue;
      if (data.CollisionKind !== 'Precise' || scene.textures.getPixelAlpha(Math.floor(x - bullet.x), Math.floor(y - bullet.y), `${bullet.sprite}:mask`)) return true;
    }
    return false;
  }

  destroy() { for (const bullet of this.bullets) bullet.image.destroy(); this.bullets = []; }
}
