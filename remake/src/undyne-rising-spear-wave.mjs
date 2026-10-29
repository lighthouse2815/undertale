export function loadUndyneRisingSpearAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  if (!scene.textures.exists('spr_risespearbullet:0')) scene.load.image('spr_risespearbullet:0', new URL('sprites/spr_risespearbullet/spr_risespearbullet_0.png', base).href);
  for (const key of ['snd_spearappear', 'snd_spearrise']) if (!scene.cache.audio.exists(key)) scene.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
}

// obj_risespearbulletgen và obj_risespearbullet: ba cột, báo trước rồi lao lên.
export class UndyneRisingSpearWave {
  constructor(scene, { firingRate = 22, duration = 200, undying = false, order = 0, type = 0 } = {}) {
    this.scene = scene; this.firingRate = firingRate; this.duration = duration; this.undying = undying; this.order = order; this.type = type;
    this.frames = 0; this.next = 10; this.previousLane = -1; this.bullets = []; this.transition = null; this.done = false;
    const arena = scene.arena;
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(arena.x, arena.y, arena.width, arena.height).setVisible(false);
    this.mask = this.clip.createGeometryMask();
  }
  spawn() {
    let lane = Math.floor(Math.random() * 3); if (lane === this.previousLane) lane = (lane + 1) % 3; this.previousLane = lane;
    const arena = this.scene.arena, x = arena.x * 2 + lane * 23, y = (arena.y + arena.height) * 2;
    const image = this.scene.add.image(x / 2, y / 2, 'spr_risespearbullet:0').setOrigin(0).setScale(.5).setDepth(1000).setMask(this.mask).setVisible(false);
    this.bullets.push({ x, y, lane, born: this.frames, age: 0, part: 0, velocity: 0, alpha: 1, type: this.type, damage: this.undying ? 11 : 7, image, deactivate: false });
  }
  touchesHeart(bullet) {
    const s = this.scene, hx = s.soul.x * 2, hy = s.soul.y * 2, top = bullet.type ? bullet.y - 59 : bullet.y + 6, bottom = bullet.type ? bullet.y - 6 : bullet.y + 59;
    for (let y = Math.ceil(Math.max(hy, top)); y <= Math.floor(Math.min(hy + 15, bottom)); y++) for (let x = Math.ceil(Math.max(hx, bullet.x + 8)); x <= Math.floor(Math.min(hx + 15, bullet.x + 14)); x++) {
      if (s.textures.getPixel(x - Math.floor(hx), y - Math.floor(hy), 'spr_heart:mask')?.red > 0) return true;
    }
    return false;
  }
  step() {
    if (this.done) return true;
    this.frames++; const remaining = this.duration - this.frames;
    if (remaining > 8 && this.frames >= this.next) { this.spawn(); this.next = this.frames + this.firingRate; }
    if (remaining < 4 && !this.transition) {
      if (!this.undying && this.order === 9) this.transition = { lesson: 8, delay: 30 };
      else if (!this.undying && this.order === 15) this.transition = { lesson: 13, delay: 30 };
      else if (this.undying && this.order === 6) this.transition = { lesson: -8, delay: 30 };
    }
    for (const bullet of this.bullets) {
      if (bullet.born === this.frames) continue;
      bullet.age++; bullet.y += bullet.velocity;
      if (bullet.age === 1) { bullet.image.setVisible(true); if (bullet.type) bullet.y -= 150; bullet.velocity = bullet.type ? 1 : -1; this.scene.sound.play('snd_spearappear'); }
      if (bullet.age === 20) { bullet.part = 1; bullet.velocity = 0; }
      if (bullet.age === 32) { bullet.part = 2; bullet.velocity = bullet.type ? 10 : -10; this.scene.sound.play('snd_spearrise'); }
      if (bullet.age === 38) { bullet.part = 3; bullet.velocity = 0; }
      if (bullet.age === 40) bullet.part = 4;
      if (remaining < 4) bullet.deactivate = true;
      if (bullet.part === 4 || bullet.deactivate) bullet.alpha -= .1;
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2).setScale(.5, bullet.type ? -.5 : .5).setAlpha(Math.max(0, bullet.alpha));
      if (bullet.part > 0 && bullet.part < 4 && !bullet.deactivate && this.scene.invFrames <= 0 && this.touchesHeart(bullet)) this.scene.hurt(bullet.damage);
      if (bullet.alpha <= 0) { bullet.image.destroy(); bullet.dead = true; }
    }
    this.bullets = this.bullets.filter(b => !b.dead);
    if (remaining <= 0) { this.done = true; this.destroy(); }
    return this.done;
  }
  destroy() { if (this.destroyed) return; this.destroyed = true; for (const bullet of this.bullets) bullet.image.destroy(); this.bullets = []; this.mask.destroy(); this.clip.destroy(); }
}
