import { RuinsWave } from './ruins-waves.mjs';

export function loadMoldsmalWaveAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const key of ['spr_bulletmd', 'spr_bulletsm']) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    if (!scene.textures.exists(`${key}:0`)) scene.load.image(`${key}:0`, new URL(`sprites/${key}/${key}_0.png`, base).href);
    if (!scene.textures.exists(`${key}:mask`)) scene.load.image(`${key}:mask`, new URL(`sprites/${key}/${key}_0.mask.png`, base).href);
  }
}

// Một obj_1sidegen cho mỗi Moldsmal sống, cùng khung và đồng hồ trận.
export class MoldsmalWave extends RuinsWave {
  constructor(scene, commands, { damage = 7 } = {}) {
    super(scene, 'moldsmal'); this.duration = 120; this.border = { left: 237, right: 397, top: 250, bottom: 385 };
    const b = this.border; scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2); scene.soul.setPosition(154.5, 154.5);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false); this.mask = this.clip.createGeometryMask();
    const factor = commands.length === 3 ? 2 : commands.length === 2 ? 1.5 : 1;
    this.generators = commands.map(command => ({ kind: command <= 50 ? 'pollen' : 'splinter', rate: Math.trunc((command <= 50 ? 15 : 30) * factor), next: 1, damage }));
  }
  spawn(generator) {
    const b = this.border; let x = b.left + Math.round(Math.random() * (b.right - b.left));
    if (x > b.right - 20) x -= 20; if (x < b.left + 6) x += 6;
    const pollen = generator.kind === 'pollen';
    this.add('spr_bulletmd', x, b.top, { kind: generator.kind, vx: pollen ? 1.5 : 0, vy: pollen ? 1.2 : 2,
      explodeAt: pollen ? null : 20 + Math.random() * 20, damage: generator.damage }).image.setMask(this.mask);
    generator.next = this.frames + generator.rate;
  }
  split(bullet) {
    for (let i = 0; i < 9; i++) {
      const angle = i * 40 * Math.PI / 180;
      this.add('spr_bulletsm', bullet.x + 3, bullet.y + 3, { kind: 'fragment', vx: Math.cos(angle) * 1.5, vy: -Math.sin(angle) * 1.5, damage: bullet.damage }).image.setMask(this.mask);
    }
    bullet.dead = true;
  }
  step() {
    this.frames++;
    for (const generator of this.generators) if (this.frames >= generator.next) this.spawn(generator);
    const b = this.border;
    for (const bullet of [...this.bullets]) {
      bullet.age++;
      if (bullet.kind === 'pollen') {
        if (bullet.age === 10 || bullet.age > 10 && (bullet.age - 10) % 20 === 0) bullet.vx = -bullet.vx;
        bullet.vy += .02;
      } else if (bullet.kind === 'splinter' && bullet.age >= bullet.explodeAt) this.split(bullet);
      bullet.x += bullet.vx; bullet.y += bullet.vy; bullet.image.setPosition(bullet.x / 2, bullet.y / 2);
      if (!bullet.dead && this.scene.invFrames <= 0 && this.touchesHeart(bullet)) { this.scene.hurt(bullet.damage); bullet.dead = true; }
      const d = this.scene.cache.json.get(bullet.sprite);
      if (bullet.x + d.MarginRight < b.left && bullet.vx < 0 || bullet.x + d.MarginLeft > b.right && bullet.vx > 0 || bullet.y + d.MarginBottom < b.top && bullet.vy < 0 || bullet.y + d.MarginTop > b.bottom && bullet.vy > 0) bullet.dead = true;
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter(bullet => !bullet.dead);
    return this.frames >= this.duration;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
