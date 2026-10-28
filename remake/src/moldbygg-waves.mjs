import { RuinsWave } from './ruins-waves.mjs';
import { loadMoldsmalWaveAssets } from './moldsmal-waves.mjs';

export function loadMoldbyggWaveAssets(scene) {
  loadMoldsmalWaveAssets(scene);
  const base = new URL('../assets/', import.meta.url);
  for (const [key, count] of [['spr_wormbul', 2], ['spr_circlebulletb', 1]]) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < count; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
}

// obj_8smallgen và obj_stalkergen khi Moldbygg đã hiện hình.
export class MoldbyggWave extends RuinsWave {
  constructor(scene, command, { population = 1, random = Math.random } = {}) {
    super(scene, 'moldbygg'); this.duration = 180; this.command = command; this.population = population; this.random = random; this.next = 2; this.rings = []; this.stalks = [];
    this.border = { left: 237, right: 397, top: 250, bottom: 385 }; const b = this.border;
    scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2); scene.soul.setPosition(154.5, 154.5);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false); this.mask = this.clip.createGeometryMask();
    this.rate = command <= 50 ? (population === 2 ? 44 : 40) : (population === 2 ? 34 : population === 3 ? 21 : 35);
  }
  bullet(sprite, x, y, values = {}) {
    const data = this.scene.cache.json.get(sprite), scale = values.scale ?? 1;
    const bullet = this.add(sprite, x, y, values); bullet.originX = data.OriginX; bullet.originY = data.OriginY; bullet.scale = scale;
    bullet.image.setOrigin(data.OriginX / data.Width, data.OriginY / data.Height).setScale(scale / 2).setMask(this.mask);
    if (values.frame) bullet.image.setTexture(`${sprite}:${values.frame}`);
    return bullet;
  }
  spawnRing() {
    const b = this.border, cx = b.left + 20 + this.random() * 120, cy = b.top + 20 + this.random() * 121;
    const hdist = Math.abs(b.left - cx) - Math.abs(b.right - cx), vdist = Math.abs(b.top - cy) - Math.abs(b.bottom - cy);
    let distance = Math.abs(vdist) > Math.abs(hdist) ? (vdist >= 0 ? cy - b.top : b.bottom - cy) : (hdist >= 0 ? cx - b.left : b.right - cx);
    distance *= 1.5 * (this.population > 1 ? 1.6 : 1.8);
    const speed = (2.4 + this.random() * .2) * (this.population > 1 ? 1.6 : 2.2), diagonal = distance * 2 / 3;
    const offsets = [[-distance, 0], [-diagonal, -diagonal], [0, -distance], [diagonal, -diagonal], [distance, 0], [diagonal, diagonal], [0, distance], [-diagonal, diagonal]];
    const angles = [0, 315, 270, 225, 180, 135, 90, 45], id = this.rings.length + 1;
    for (let i = 0; i < 8; i++) { const angle = angles[i] * Math.PI / 180; const sprite = this.population > 1 ? 'spr_bulletmd' : 'spr_bulletsm'; this.bullet(sprite, cx + offsets[i][0], cy + offsets[i][1], { kind: 'ring', ring: id, vx: Math.cos(angle) * speed, vy: -Math.sin(angle) * speed, damage: 8, scale: this.population > 1 ? 1 : 2 }); }
    this.rings.push({ id, cx, cy, expires: this.frames + Math.max(1, Math.floor(distance / speed)) });
  }
  spawnStalk() {
    const b = this.border, multi = this.population > 1, x = b.left + 8 + this.random() * 119, y = multi ? b.top - 30 : b.bottom + 10;
    const stalk = { age: 0, pieces: [] };
    for (let i = 0; i < 4; i++) stalk.pieces.push(this.bullet('spr_wormbul', x, y + (multi ? -25 : 25) * i, { kind: 'stalk', frame: i === 0 ? 1 : 0, index: i, vy: multi ? 4.2 : -4, damage: 6 }));
    this.stalks.push(stalk);
  }
  overlaps(bullet) {
    const scene = this.scene, data = scene.cache.json.get(bullet.sprite), scale = bullet.scale, hx = scene.soul.x * 2, hy = scene.soul.y * 2;
    const left = Math.ceil(Math.max(hx, bullet.x + (data.MarginLeft - bullet.originX) * scale));
    const right = Math.floor(Math.min(hx + 15, bullet.x + (data.MarginRight + 1 - bullet.originX) * scale - 1));
    const top = Math.ceil(Math.max(hy, bullet.y + (data.MarginTop - bullet.originY) * scale));
    const bottom = Math.floor(Math.min(hy + 15, bullet.y + (data.MarginBottom + 1 - bullet.originY) * scale - 1));
    for (let x = left; x <= right; x++) for (let y = top; y <= bottom; y++) {
      if (!(scene.textures.getPixel(Math.floor(x - hx), Math.floor(y - hy), 'spr_heart:mask')?.red > 0)) continue;
      if (data.CollisionKind !== 'Precise' || scene.textures.getPixel(Math.floor((x - bullet.x) / scale + bullet.originX), Math.floor((y - bullet.y) / scale + bullet.originY), `${bullet.sprite}:mask`)?.red > 0) return true;
    }
    return false;
  }
  step() {
    this.frames++;
    if (this.frames >= this.next) {
      if (this.command <= 50) { if (this.rings.length < (this.population === 1 ? 4 : 3)) this.spawnRing(); else this.next = Infinity; }
      else this.spawnStalk();
      if (this.next !== Infinity) this.next = this.frames + this.rate;
    }
    for (const ring of this.rings) if (!ring.finished && this.frames >= ring.expires) {
      ring.finished = true; for (const bullet of this.bullets) if (bullet.ring === ring.id) bullet.dead = true;
      this.bullet('spr_bulletmd', ring.cx, ring.cy, { kind: 'drop', vx: 0, vy: -1.5, damage: 0 });
    }
    for (const stalk of this.stalks) {
      stalk.age++;
      for (const piece of stalk.pieces) {
        piece.x += (piece.index % 2 ? Math.cos(stalk.age / 10) : Math.sin(stalk.age / 10)) / 2;
        if (stalk.age < 40) piece.vy += this.population > 1 ? -.1 : .1;
        else if (stalk.age === 40) { piece.x = Math.round(piece.x); piece.y = Math.round(piece.y); piece.vy = 0; }
        else if (stalk.age === 70) piece.vy = this.population > 1 ? -2 : 2;
        else if (stalk.age > 70) piece.vy += this.population > 1 ? -.2 : .2;
        if (stalk.age >= 130) piece.dead = true;
      }
      if ([46, 54, 62].includes(stalk.age)) {
        const head = stalk.pieces[0], x = head.x + 13, y = head.y + 13, dx = this.scene.soul.x * 2 + 6 - x, dy = this.scene.soul.y * 2 + 6 - y, length = Math.hypot(dx, dy) || 1;
        this.bullet('spr_circlebulletb', x, y, { kind: 'loop', vx: 3 * dx / length, vy: 3 * dy / length, scale: .2, growth: .1, damage: 8 });
      }
    }
    const b = this.border;
    for (const bullet of this.bullets) {
      bullet.age++; if (bullet.kind === 'drop') bullet.vy -= .2;
      if (bullet.kind === 'ring') bullet.image.setAlpha(Math.min(1, bullet.age * .1));
      if (bullet.kind === 'loop') { bullet.scale += bullet.growth; bullet.growth /= 1.1; bullet.image.setScale(bullet.scale / 2); }
      bullet.x += bullet.vx; bullet.y += bullet.vy; bullet.image.setPosition(bullet.x / 2, bullet.y / 2);
      if (!bullet.dead && this.scene.invFrames <= 0 && this.overlaps(bullet)) { this.scene.hurt(bullet.damage); bullet.dead = true; }
      if (bullet.kind === 'drop' || bullet.kind === 'loop') { if (bullet.x < b.left - 40 || bullet.x > b.right + 40 || bullet.y < b.top - 40 || bullet.y > b.bottom + 40) bullet.dead = true; }
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter(bullet => !bullet.dead); return this.frames >= this.duration;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
