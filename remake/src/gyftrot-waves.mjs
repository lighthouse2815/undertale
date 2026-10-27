import { RuinsWave } from './ruins-waves.mjs';

export function loadGyftrotWaveAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const [key, count] of [['spr_circlebullet_noc', 1], ['spr_gyftbullet', 2]]) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < count; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
}

// obj_gyftgen/blt_gravbullet và obj_giftgen/blt_potentiallyblue, tọa độ gốc640×480.
export class GyftrotWave extends RuinsWave {
  constructor(scene, command, { mercy = -5, hardmode = false, population = 1 } = {}) {
    super(scene, 'gyftrot'); this.kind = command <= 60 ? 'gravity' : 'gifts'; this.duration = mercy > 90 ? -2 : 120;
    this.hardmode = hardmode; this.rate = Math.trunc((hardmode ? 3 : 5) * (population === 3 ? 2.4 : population === 2 ? 1.7 : 1));
    this.border = { left: 227, right: 407, top: 200, bottom: 385 }; const b = this.border;
    scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2); scene.soul.setPosition(154.5, 142.5);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false); this.mask = this.clip.createGeometryMask();
    this.oldHeart = { x: scene.soul.x * 2, y: scene.soul.y * 2 };
    if (this.kind === 'gifts') {
      for (let i = 0; i < 3; i++) {
        const phase = -50 + i * 50, x = this.giftX(phase);
        this.add('spr_gyftbullet', x, b.bottom - 60, { phase, frame: 0, blue: false, damage: 7 }).image.setMask(this.mask);
      }
      this.blueIndex = Math.floor(Math.random() * 3); this.warningAt = 5; this.shuffle = false;
    }
  }
  giftX(phase) { const b = this.border; return Math.sin(phase / 100 * Math.PI) * (b.right - b.left - 45) / 2 + b.left + 67; }
  step() {
    this.frames++; if (this.duration < 1) return true; const scene = this.scene, b = this.border;
    const hx = scene.soul.x * 2, hy = scene.soul.y * 2, moving = Math.abs(hx - this.oldHeart.x) > .01 || Math.abs(hy - this.oldHeart.y) > .01;
    if (this.kind === 'gravity' && this.frames >= this.next) {
      const slot = Math.floor(Math.random() * 6), x = b.left + (b.right - b.left) / 6 * slot;
      this.add('spr_circlebullet_noc', x < b.left + 15 ? x + 15 : x, b.top - 28, { vx: hx + 8 < x ? -.5 : hx + 8 > x ? .5 : 0, vy: -.5, damage: 7 }).image.setMask(this.mask);
      this.next = this.frames + this.rate;
    }
    if (this.kind === 'gifts') {
      if (this.frames === this.warningAt) this.bullets[this.blueIndex].flashing = true;
      if (this.frames === this.warningAt + 25) {
        this.bullets[this.blueIndex].flashing = false; this.bullets[this.blueIndex].frame = 0;
        this.shuffle = true; this.siner = 0; this.roll = Math.floor(Math.random() * 3); this.launchAt = this.frames + [41, 61, 21][this.roll];
      }
      if (this.frames === this.launchAt) {
        const blue = this.bullets[this.blueIndex]; blue.blue = true; blue.frame = 1;
        for (const bullet of this.bullets) { bullet.vy = this.roll === 2 ? -1 : -2; bullet.friction = this.roll === 2 ? -.1 : this.hardmode ? -.5 : -.3; }
        this.slowLaunch = this.roll === 2; this.shuffle = this.slowLaunch;
      }
      if (this.shuffle) {
        this.siner++;
        for (const bullet of this.bullets) { bullet.phase += this.slowLaunch ? 2 : 5; bullet.x = this.giftX(bullet.phase); }
      }
    }
    for (const bullet of this.bullets) {
      bullet.age++;
      if (this.kind === 'gravity') { bullet.vy += .25; bullet.x += bullet.vx; }
      else if (bullet.friction) bullet.vy -= Math.abs(bullet.friction);
      bullet.y += bullet.vy;
      if (bullet.flashing) bullet.frame = Math.floor((this.frames - this.warningAt + 1) * .2) % 2;
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2).setTexture(`${bullet.sprite}:${bullet.frame ?? 0}`);
      if (scene.invFrames <= 0 && (!bullet.blue || moving) && this.touchesHeart(bullet)) {
        const bonus = this.kind === 'gravity' ? [21, 30, 40, 50, 60, 70, 80, 90].filter((hp) => scene.hp >= hp).length : 0;
        scene.hurt(bullet.damage + bonus);
      }
      if (this.kind === 'gravity' && (bullet.y > 480 || bullet.x < -20 || bullet.x > 640)) bullet.dead = true;
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((e) => !e.dead); this.oldHeart = { x: hx, y: hy };
    return this.frames >= this.duration;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
