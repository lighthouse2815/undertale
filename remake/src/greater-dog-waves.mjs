import { RuinsWave } from './ruins-waves.mjs';
import { maskContains } from './collision-mask.mjs';

export function loadGreaterDogWaveAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const key of ['spr_sleepdog', 'spr_wakedog', 'spr_barkbullet', 'spr_dogspear']) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    const count = key === 'spr_barkbullet' ? 1 : 2;
    for (let i = 0; i < count; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    if (key === 'spr_sleepdog' || key === 'spr_wakedog') if (!scene.textures.exists(`${key}:mask`)) scene.load.image(`${key}:mask`, new URL(`sprites/${key}/${key}_0.mask.png`, base).href);
  }
}

// obj_sleepdog/blt_barkbullet và blt_dogspear: Greater Dog không dùng đạn của Lesser Dog.
export class GreaterDogWave extends RuinsWave {
  constructor(scene, command) {
    super(scene, 'greaterDog'); this.kind = command <= 50 ? 'sleepDog' : 'spear'; this.duration = this.kind === 'sleepDog' ? 120 : 90;
    this.border = this.kind === 'sleepDog' ? { left: 237, right: 397, top: 250, bottom: 385 } : { left: 202, right: 432, top: 290, bottom: 385 };
    const b = this.border; scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2);
    scene.soul.setPosition(154.5, 154.5); this.oldHeart = { x: scene.soul.x * 2, y: scene.soul.y * 2 };
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false); this.mask = this.clip.createGeometryMask();
    if (this.kind === 'sleepDog') {
      this.movementFrames = 0; this.dog = this.add('spr_sleepdog', (b.left + b.right) / 2 - 29, b.bottom - 30, { damage: 5, scale: 2, frame: 0 }); this.dog.image.setScale(1);
    } else this.spear = this.add('spr_dogspear', b.right - 16, b.bottom + 4, { damage: 7, vy: -4, stage: 0, blut: Math.round(Math.random() * 35), blue: false, frame: 0 });
    for (const bullet of this.bullets) bullet.image.setMask(this.mask);
  }
  bark(hx, hy) {
    const x = this.dog.x + 20, y = this.dog.y + 8, tx = hx + (hx - this.oldHeart.x) * 30 - 8, ty = hy + (hy - this.oldHeart.y) * 30;
    const direction = Math.atan2(ty - y, tx - x), bullet = this.add('spr_barkbullet', x, y, { damage: 7, vx: Math.cos(direction) * 7, vy: Math.sin(direction) * 7 });
    bullet.image.setMask(this.mask); return bullet;
  }
  step() {
    this.frames++; const scene = this.scene, hx = scene.soul.x * 2, hy = scene.soul.y * 2;
    const moving = hx !== this.oldHeart.x || hy !== this.oldHeart.y;
    if (this.dog) {
      if (moving) this.movementFrames++;
      if (this.movementFrames > 7 && !this.awake) { this.awake = true; this.movementFrames = -99999; this.dog.sprite = 'spr_wakedog'; this.dog.frame = 0; this.barkAt = this.frames + 2; }
      if (this.frames === this.barkAt) { this.dog.frame = 1; this.bark(hx, hy); this.secondBarkAt = this.frames + 8; this.closeAt = this.frames + 20; this.barkAt = this.frames + 40; }
      if (this.frames === this.secondBarkAt) this.bark(hx, hy);
      if (this.frames === this.closeAt) this.dog.frame = 0;
      if (!this.awake) this.dog.frame = Math.floor(this.frames * .1) % 2;
    }
    for (const bullet of this.bullets) {
      bullet.age++;
      if (bullet === this.spear) {
        bullet.blut++; if (bullet.blut > 21) { bullet.blue = true; bullet.frame = 1; } if (bullet.blut > 42) { bullet.blut = 0; bullet.blue = false; bullet.frame = 0; }
        if (bullet.stage === 0 && bullet.y < this.border.top) { bullet.stage = 1; bullet.y = this.border.top; bullet.vy = 0; bullet.vx = -4; }
      }
      bullet.x += bullet.vx; bullet.y += bullet.vy; bullet.image.setPosition(bullet.x / 2, bullet.y / 2).setTexture(`${bullet.sprite}:${bullet.frame ?? 0}`);
      if (this.touchesHeart(bullet)) {
        if (bullet.blue && !moving) bullet.blut = 2;
        else if (scene.invFrames <= 0) {
          scene.hurt(bullet.damage);
          if (bullet !== this.spear) bullet.dead = true;
        }
      }
      if (bullet !== this.dog && (bullet.x + scene.cache.json.get(bullet.sprite).Width < 0 || bullet.x > 640 || bullet.y > 480 || bullet.y + scene.cache.json.get(bullet.sprite).Height < 0)) bullet.dead = true;
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((e) => !e.dead); this.oldHeart = { x: hx, y: hy }; return Boolean(this.dog?.dead) || this.frames >= this.duration;
  }
  touchesHeart(bullet) {
    const scene = this.scene, data = scene.cache.json.get(bullet.sprite), scale = bullet.scale ?? 1;
    for (let hx = 0; hx < 16; hx++) for (let hy = 0; hy < 16; hy++) {
      const x = Math.floor((scene.soul.x * 2 + hx - bullet.x) / scale), y = Math.floor((scene.soul.y * 2 + hy - bullet.y) / scale);
      if (x < data.MarginLeft || x > data.MarginRight || y < data.MarginTop || y > data.MarginBottom || !maskContains(scene, 'spr_heart:mask', hx, hy)) continue;
      if (data.CollisionKind !== 'Precise' || maskContains(scene, `${bullet.sprite}:mask`, x, y)) return true;
    }
    return false;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
