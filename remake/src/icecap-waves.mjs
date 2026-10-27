import { RuinsWave } from './ruins-waves.mjs';

// obj_iceteeth, obj_1sidegen bullettype11, blt_hat/blt_icicle ở 30 Hz.
export class IceCapWave extends RuinsWave {
  constructor(scene, command, ice = false) {
    super(scene, 'icecap'); this.border = { left: 237, right: 397, top: 250, bottom: 385 };
    this.kind = command < (ice ? 96 : 50) ? 'teeth' : 'hats'; this.duration = ice ? 5 : this.kind === 'teeth' ? 100 : 150;
    this.damage = ice ? 0 : 6; this.rate = ice ? 15 : 33;
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(118.5, 125, 80, 67.5).setVisible(false); this.mask = this.clip.createGeometryMask();
    scene.arena.setPosition(118.5, 125).setSize(80, 67.5); scene.soul.setPosition(154.5, 154.5);
    if (this.kind === 'teeth') {
      this.y = 177.5 + Math.random() * 40; this.speed = 4.2; this.toothSpeed = -.1; this.distance = ice ? 500 : 265;
      this.seed = Math.random() * 40; this.teeth = Array.from({ length: 32 }, (_, i) => ({ x: 237 + i * 5, phase: this.seed + i * 4 * Math.PI / 31 }));
      this.lines = scene.add.graphics();
    }
  }

  hat(x) {
    const b = this.border, width = 50;
    if (this.bullets.some((bullet) => bullet.sprite === 'spr_hatbullet' && x + width / 2 >= bullet.x && x + width / 2 <= bullet.x + width)) x += (Math.random() < .5 ? -1 : 1) * width / 2;
    if (x > b.right - width) x -= Math.random() * (b.right - b.left);
    if (x < b.left) x += Math.random() * (b.right - b.left);
    if (this.bullets.some((bullet) => bullet.sprite === 'spr_hatbullet' && x + width / 2 >= bullet.x && x + width / 2 <= bullet.x + width && b.bottom - 13 >= bullet.y && b.bottom - 13 <= bullet.y + 50)) x += (Math.random() < .5 ? -1 : 1) * width / 2;
    const hx = this.scene.soul.x * 2;
    if (!this.bullets.some((bullet) => hx >= bullet.x - 8 && hx <= bullet.x + this.scene.cache.json.get(bullet.sprite).Width)) x = hx + 6 - width / 2;
    const bullet = this.add('spr_hatbullet', x, b.bottom + 2, { vy: -1.5, damage: this.damage, hat: true });
    bullet.image.setMask(this.mask).setAlpha(.5); return bullet;
  }

  icicle(x, y) {
    const bullet = this.add('spr_iciclebullet', x, y, { vy: -6.5, damage: this.damage - 1 });
    bullet.image.setMask(this.mask); return bullet;
  }

  step() {
    this.frames++;
    if (this.kind === 'teeth') this.stepTeeth();
    else if (this.frames >= this.next) {
      // SCR_BORDER(0,6) đặt x trước nhánh 11; lời gọi X phía sau không ghi đè x.
      this.hat(this.border.left + Math.round(Math.random() * 160)); this.next = this.frames + this.rate;
    }
    for (const bullet of [...this.bullets]) {
      bullet.age++;
      if (bullet.hat) {
        if (bullet.age === 20) bullet.vy = 0;
        if (bullet.age === 40) {
          for (const dx of [-2, 12, 5]) this.icicle(bullet.x + dx, bullet.y + 30);
        }
        if (bullet.age === 60) bullet.vy = 4;
      } else bullet.vy += .13;
      bullet.y += bullet.vy; bullet.image.setPosition(bullet.x / 2, bullet.y / 2);
      bullet.image.setTexture(`${bullet.sprite}:${bullet.hat ? bullet.age >= 60 ? 1 : bullet.age >= 20 ? Math.floor((bullet.age - 20) * .25) % 2 : 0 : bullet.vy > 0 ? 0 : 1}`);
      if (!bullet.hat && this.scene.invFrames <= 0 && this.touchesHeart(bullet)) { this.scene.hurt(bullet.damage); bullet.dead = true; }
      if (bullet.y > this.border.bottom + 60) bullet.dead = true;
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((b) => !b.dead);
    return this.frames >= this.duration;
  }

  stepTeeth() {
    this.speed = Math.max(0, this.speed - .1); this.y += this.speed;
    const b = this.border, hx = this.scene.soul.x * 2, hy = this.scene.soul.y * 2;
    this.lines.clear().lineStyle(.5, 0xffffff);
    for (const tooth of this.teeth) {
      const top = this.y + Math.sin(tooth.phase) * 30, bottom = top + this.distance;
      tooth.x = Math.max(b.left, tooth.x + this.toothSpeed); if (tooth.x > b.right) tooth.x = b.left;
      if (top > b.top) this.lines.lineBetween(tooth.x / 2, b.top / 2, tooth.x / 2, top / 2);
      if (bottom < b.bottom) this.lines.lineBetween(tooth.x / 2, b.bottom / 2, tooth.x / 2, bottom / 2);
      if (this.scene.invFrames <= 0 && tooth.x >= hx && tooth.x <= hx + 15
        && (hy <= top - 3 && hy + 15 >= b.top || hy + 15 >= bottom + 3 && hy <= b.bottom)) {
        this.scene.hurt(this.damage); this.scene.invFrames *= 2;
      }
    }
    this.distance -= this.speed * 2.15; if (this.toothSpeed < 2.4) this.toothSpeed += .08;
  }

  touchesHeart(bullet) {
    const scene = this.scene, data = scene.cache.json.get(bullet.sprite);
    const frame = data.MaskCount > 1 ? Number(bullet.image.texture.key.split(':').at(-1)) : 0;
    const mask = `${bullet.sprite}:mask${frame ? `:${frame}` : ''}`;
    for (let hx = 0; hx < 16; hx++) for (let hy = 0; hy < 16; hy++) {
      if (!(scene.textures.getPixel(hx, hy, 'spr_heart:mask')?.red > 0)) continue;
      const x = Math.floor(scene.soul.x * 2 + hx - bullet.x), y = Math.floor(scene.soul.y * 2 + hy - bullet.y);
      if (x < data.MarginLeft || x > data.MarginRight || y < data.MarginTop || y > data.MarginBottom) continue;
      if (scene.textures.getPixel(x, y, mask)?.red > 0) return true;
    }
    return false;
  }

  destroy() { super.destroy(); this.lines?.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
