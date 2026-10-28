import { RuinsWave } from './ruins-waves.mjs';
import { woshuaAttack } from './woshua-attack.mjs';

export function loadWoshuaSoapAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const [key, count] of [['spr_soapbul', 1], ['spr_glitterbul', 2]]) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < count; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
}

// blt_soapbul nảy trong khung và tạo blt_shinebullet, tọa độ gốc 640×480.
export class WoshuaSoap extends RuinsWave {
  constructor(scene, state, command, population = 1) {
    super(scene, 'woshuaSoap'); this.settings = woshuaAttack(state, command, population);
    if (this.settings.kind !== 'soap') throw new Error('WoshuaSoap cần đợt bong bóng.');
    this.duration = this.settings.duration; this.border = { left: 227, right: 407, top: 200, bottom: 385 };
    const b = this.border;
    scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2); scene.soul.setPosition(154.5, 142.5);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false);
    this.mask = this.clip.createGeometryMask();
    let direction = Math.random() * 180;
    if (direction < 10) direction += 20;
    if (Math.abs(direction - 90) < 10) direction += 30;
    if (Math.abs(direction - 180) < 10) direction -= 20;
    const angle = direction * Math.PI / 180;
    this.soap = this.add('spr_soapbul', (b.left + b.right) / 2, b.top - 60 + (b.bottom - b.top) / 2,
      { vx: Math.cos(angle) * this.settings.speed, vy: -Math.sin(angle) * this.settings.speed, damage: this.settings.damage, shineAt: 4 });
    this.soap.image.setMask(this.mask);
  }
  sparkle() {
    const soap = this.soap;
    const bullet = this.add('spr_glitterbul', soap.x + 12, soap.y + 16, { scale: 1.5, damage: soap.damage - 2, sparkle: true });
    bullet.image.setOrigin(.5).setMask(this.mask).setScale(.75);
    soap.shineAt = this.frames + (this.settings.offset ? 10 : 7);
    if (this.settings.offset) {
      const speed = Math.hypot(soap.vx, soap.vy); soap.vx *= 5 / speed; soap.vy *= 5 / speed;
    }
  }
  touchesSparkle(bullet) {
    const s = this.scene, d = s.cache.json.get(bullet.sprite), hx = s.soul.x * 2, hy = s.soul.y * 2;
    for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) {
      if (!(s.textures.getPixel(x, y, 'spr_heart:mask')?.red > 0)) continue;
      const px = (hx + x - bullet.x) / bullet.scale + d.OriginX, py = (hy + y - bullet.y) / bullet.scale + d.OriginY;
      if (px >= d.MarginLeft && px <= d.MarginRight && py >= d.MarginTop && py <= d.MarginBottom) return true;
    }
    return false;
  }
  step() {
    this.frames++;
    const b = this.border, soap = this.soap;
    if (this.frames >= soap.shineAt) this.sparkle();
    const previousX = soap.x, previousY = soap.y;
    const speed = Math.hypot(soap.vx, soap.vy);
    soap.vx *= (speed + .04) / speed; soap.vy *= (speed + .04) / speed;
    soap.x += soap.vx; soap.y += soap.vy;
    if (soap.x + 6 <= b.left && soap.vx < 0 || soap.x + 23 >= b.right && soap.vx > 0) { soap.x = previousX; soap.vx = -soap.vx; }
    if (soap.y + 6 <= b.top && soap.vy < 0 || soap.y + 33 >= b.bottom && soap.vy > 0) { soap.y = previousY; soap.vy = -soap.vy; }
    soap.image.setPosition(soap.x / 2, soap.y / 2);
    if (this.scene.invFrames <= 0 && this.touchesHeart(soap)) this.scene.hurt(soap.damage);
    for (const bullet of this.bullets) {
      if (!bullet.sparkle) continue;
      bullet.age++; bullet.scale -= .03;
      bullet.image.setScale(Math.max(0, bullet.scale) / 2).setTexture(`spr_glitterbul:${Math.floor(bullet.age * .2) % 2}`);
      if (this.scene.invFrames <= 0 && this.touchesSparkle(bullet)) this.scene.hurt(bullet.damage);
      if (bullet.scale < .1) { bullet.dead = true; bullet.image.destroy(); }
    }
    this.bullets = this.bullets.filter(bullet => !bullet.dead);
    return this.frames >= this.duration;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
