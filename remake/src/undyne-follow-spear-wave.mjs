export function loadUndyneFollowSpearAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  if (!scene.textures.exists('spr_whitespearbullet:0')) scene.load.image('spr_whitespearbullet:0', new URL('sprites/spr_whitespearbullet/spr_whitespearbullet_0.png', base).href);
  for (const key of ['snd_spearappear', 'snd_arrow']) if (!scene.cache.audio.exists(key)) scene.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
}

// obj_spearbulletfollowgen và obj_spearbullet_follow trong pha SOUL đỏ.
export class UndyneFollowSpearWave {
  constructor(scene, { firingRate = 18, duration = 200, undying = false, order = 0 } = {}) {
    this.scene = scene; this.firingRate = firingRate; this.duration = duration; this.undying = undying; this.order = order;
    this.frames = 0; this.next = 1; this.bullets = []; this.transition = null; this.done = false;
    this.lines = scene.add.graphics().setDepth(1000);
  }
  spawn() {
    const scene = this.scene, hx = scene.soul.x * 2, hy = scene.soul.y * 2;
    const dx = Math.random() * 8 - 4, dy = Math.random() * 8 - 4, angle = Math.atan2(-dy, -dx);
    const bullet = { x: hx + dx + Math.cos(angle) * 140, y: hy + dy + Math.sin(angle) * 140,
      direction: angle, speed: 4, friction: .2, rotation: 32, imageAngle: 0, alpha: 0, launched: false, deactivate: false, damage: this.undying ? 11 : 7 };
    bullet.image = scene.add.image(bullet.x / 2, bullet.y / 2, 'spr_whitespearbullet:0').setOrigin(.5).setScale(.5).setDepth(1000).setAlpha(0);
    this.bullets.push(bullet); scene.sound.play('snd_spearappear');
  }
  touchesHeart(bullet) {
    const s = this.scene, hx = s.soul.x * 2, hy = s.soul.y * 2, dx = Math.cos(bullet.direction) * 25, dy = Math.sin(bullet.direction) * 25;
    for (let i = 0; i <= 75; i++) {
      const px = bullet.x - dx / 2 + dx * 1.5 * i / 75, py = bullet.y - dy / 2 + dy * 1.5 * i / 75;
      const x = Math.floor(px - hx), y = Math.floor(py - hy);
      if (x >= 0 && x < 16 && y >= 0 && y < 16 && s.textures.getPixel(x, y, 'spr_heart:mask')?.red > 0) return true;
    }
    return false;
  }
  step() {
    if (this.done) return true;
    this.frames++; const remaining = this.duration - this.frames;
    if (remaining >= 3 && this.frames >= this.next) { this.spawn(); this.next = this.frames + this.firingRate; }
    if (remaining < 4 && !this.transition) {
      if (!this.undying && this.order === 9) this.transition = { lesson: 8, delay: 30 };
      else if (!this.undying && this.order === 15) this.transition = { lesson: 13, delay: 30 };
      else if (this.undying && this.order === 6) this.transition = { lesson: -8, delay: 30 };
    }
    this.lines.clear();
    for (const bullet of this.bullets) {
      bullet.x += Math.cos(bullet.direction) * bullet.speed; bullet.y += Math.sin(bullet.direction) * bullet.speed;
      bullet.speed = Math.max(0, bullet.speed - bullet.friction); bullet.alpha = Math.min(1, bullet.alpha + .05);
      bullet.imageAngle -= bullet.rotation; if (bullet.rotation > 0) bullet.rotation--;
      if (bullet.rotation === 0 && bullet.speed < 1 && !bullet.launched) {
        const hx = this.scene.soul.x * 2 + 10, hy = this.scene.soul.y * 2 + 10;
        bullet.direction = Math.atan2(hy - bullet.y, hx - bullet.x); bullet.speed = 3; bullet.friction = -.3; bullet.imageAngle = -bullet.direction * 180 / Math.PI;
        bullet.launched = true; this.scene.sound.play('snd_arrow');
      }
      if (remaining < 3) bullet.deactivate = true;
      if (bullet.deactivate) bullet.alpha -= .1;
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2).setAngle(bullet.imageAngle).setAlpha(Math.max(0, bullet.alpha));
      if (!bullet.rotation) {
        const dx = Math.cos(bullet.direction) * 25, dy = Math.sin(bullet.direction) * 25;
        this.lines.lineStyle(.5, 0xffffff, Math.max(0, bullet.alpha)).beginPath().moveTo((bullet.x - dx / 2) / 2, (bullet.y - dy / 2) / 2).lineTo((bullet.x + dx) / 2, (bullet.y + dy) / 2).strokePath();
        if (!bullet.deactivate && this.scene.invFrames <= 0 && this.touchesHeart(bullet)) this.scene.hurt(bullet.damage);
      }
      const outside = bullet.x < -40 || bullet.y < -40 || bullet.x > 680 || bullet.y > 520;
      if (outside || bullet.alpha <= 0) { bullet.image.destroy(); bullet.dead = true; }
    }
    this.bullets = this.bullets.filter(b => !b.dead);
    if (remaining <= 0) { this.done = true; this.destroy(); }
    return this.done;
  }
  destroy() { if (this.destroyed) return; this.destroyed = true; for (const bullet of this.bullets) bullet.image.destroy(); this.bullets = []; this.lines.destroy(); }
}
