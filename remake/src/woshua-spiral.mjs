import { RuinsWave } from './ruins-waves.mjs';
import { woshuaAttack, woshuaCleanHit } from './woshua-attack.mjs';

export function loadWoshuaSpiralAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const key of ['spr_waterbul', 'spr_waterbul_mask']) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < 3; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
  if (!scene.cache.audio.exists('snd_power')) scene.load.audio('snd_power', new URL('sounds/snd_power/snd_power.wav', base).href);
}

// obj_woshspiralgen và blt_growbullet, tọa độ gốc 640×480, 30 Hz.
export class WoshuaSpiral extends RuinsWave {
  constructor(scene, state, command, population = 1) {
    super(scene, 'woshuaSpiral');
    this.state = state; this.population = population;
    this.settings = woshuaAttack(state, command, population);
    if (this.settings.kind !== 'spiral') throw new Error('WoshuaSpiral cần đợt xoắn nước.');
    this.duration = this.settings.duration; this.next = 6;
    this.border = { left: 227, right: 407, top: 200, bottom: 385 };
    const b = this.border;
    scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2);
    scene.soul.setPosition(154.5, 142.5);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false);
    this.mask = this.clip.createGeometryMask();
    this.generatorX = (b.left + b.right) / 2;
    this.generatorY = b.top + (b.bottom - b.top) / 2 + (population === 1 ? -5 : 90);
    this.green = -1 + Math.random() * 6; this.siner = Math.random() * 30;
    this.direction = population === 1 ? 60 + Math.random() * 40 : 0;
    this.backwards = population === 1 && Math.random() < .5;
    this.turn = population === 1 ? this.backwards ? -6 : command ? 6 : 5 : 5;
    this.lastSoul = { x: scene.soul.x, y: scene.soul.y };
  }
  spawn() {
    const green = this.settings.cleaner && this.green === 0;
    const sprite = green ? 'spr_waterbul_mask' : 'spr_waterbul';
    const speed = .5 / (this.population === 1 ? 1.1 : 1);
    const acceleration = .25 / (this.population === 1 ? 1.25 : 1) / (green ? 3 : 1);
    const bullet = this.add(sprite, this.generatorX, this.generatorY, { green, blue: this.population > 1 && !green,
      direction: this.direction, speed, acceleration, life: 45, damage: this.settings.damage });
    bullet.image.setOrigin(.5).setMask(this.mask).setTexture(`${sprite}:${green ? 2 : bullet.blue ? 1 : 0}`);
    this.green--;
    if (this.green < 0) this.green = this.population === 1 ? 9 : 4;
    this.direction += this.turn;
    this.turn += this.population === 1 ? .05 : .01;
    if (this.backwards) this.turn -= .1;
    this.next = this.frames + this.settings.rate;
  }
  // Các viên nước xoay và thay đổi kích thước quanh gốc giữa sprite.
  touchesWater(bullet) {
    const scene = this.scene, data = scene.cache.json.get(bullet.sprite);
    const scale = bullet.speed / (bullet.green ? 2 : 3);
    if (scale <= 0) return false;
    const angle = (bullet.direction + 90) * Math.PI / 180;
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    const hx = scene.soul.x * 2, hy = scene.soul.y * 2;
    for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) {
      if (!(scene.textures.getPixel(x, y, 'spr_heart:mask')?.red > 0)) continue;
      const dx = hx + x - bullet.x, dy = hy + y - bullet.y;
      const px = (dx * cosine - dy * sine) / scale + data.OriginX;
      const py = (dx * sine + dy * cosine) / scale + data.OriginY;
      if (px >= data.MarginLeft && px <= data.MarginRight && py >= data.MarginTop && py <= data.MarginBottom) return true;
    }
    return false;
  }
  step() {
    this.frames++;
    if (this.frames >= this.next) this.spawn();
    if (this.population === 1) { this.siner++; this.generatorX += Math.sin(this.siner / 6); }
    const moved = Math.abs(this.scene.soul.x - this.lastSoul.x) > .005 || Math.abs(this.scene.soul.y - this.lastSoul.y) > .005;
    this.lastSoul = { x: this.scene.soul.x, y: this.scene.soul.y };
    for (const bullet of this.bullets) {
      bullet.age++; bullet.life -= bullet.green ? .5 : 1;
      bullet.speed += bullet.acceleration;
      const angle = bullet.direction * Math.PI / 180;
      bullet.x += Math.cos(angle) * bullet.speed; bullet.y -= Math.sin(angle) * bullet.speed;
      const scale = bullet.speed / (bullet.green ? 2 : 3);
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2).setScale(scale / 2).setAngle(-(bullet.direction + 90)).setAlpha(bullet.life < 10 ? Math.max(0, bullet.life / 10) : 1);
      if ((bullet.green || this.scene.invFrames <= 0 && (!bullet.blue || moved)) && this.touchesWater(bullet)) {
        if (bullet.green) { woshuaCleanHit(this.state, this.scene); this.scene.refreshHp(); this.scene.sound.play('snd_power'); bullet.dead = true; }
        else this.scene.hurt(bullet.damage);
      }
      if (bullet.life <= 0) bullet.dead = true;
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    return this.frames >= this.duration;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
