import { RuinsWave } from './ruins-waves.mjs';

// obj_crygen1/2/3 và obj_sadmsggen; tọa độ gốc 640×480, 30 Hz.
export class NapstablookWave extends RuinsWave {
  constructor(scene, kind) {
    super(scene, kind);
    this.next = 10;
    this.interval = kind === 'tears' ? 4000 / -scene.mercyModifier : kind === 'stream' ? 3600 / -scene.mercyModifier : 8;
    this.duration = { tears: 140, stream: 170, sad: 140, hat: 260 }[kind];
    this.border = { left: scene.arena.x * 2, right: (scene.arena.x + scene.arena.width) * 2, top: 250, bottom: 385 };
    // Đây là generator chỉ vẽ chữ rung, không kế thừa blt_parent nên không gây sát thương.
    if (kind === 'sad') this.add('spr_bulletNapstaSad', this.border.left + 30, 280, { damageable: false });
    if (kind === 'hat') { scene.hat.setTexture('spr_blookhat:0').setVisible(true); this.hatHits = 0; }
  }

  spawn() {
    for (const [dx, dy] of [[52, 48], [82, this.kind === 'stream' ? 56 : 58]]) {
      const stream = this.kind === 'stream', hat = this.kind === 'hat';
      const bullet = this.add(stream ? 'spr_streambullet' : 'spr_teardrop', this.scene.enemy.x * 2 + dx, this.scene.enemy.y * 2 + dy,
        { vx: stream ? .4 : Math.random() * (hat ? 6 : 10) - (hat ? 2 : 6.1), vy: stream || hat ? 2 : 4,
          damage: hat ? 0 : 5, scale: stream ? 1 : .8 + Math.random() * .4,
          gravity: stream ? .2 : hat ? -.5 : .4, friction: stream ? 0 : hat ? .2 : .4,
          damageable: !stream, dropdown: false, climbing: false, rbord: false, alpha: 1 });
      bullet.image.setScale(bullet.scale / 2);
    }
  }

  step() {
    this.frames++;
    if (this.kind !== 'sad' && this.frames >= this.next) { this.spawn(); this.next = this.frames + Math.max(1, Math.round(this.interval)); }
    if (this.kind === 'hat') this.updateHat();
    for (const bullet of this.bullets) {
      bullet.age++;
      if (this.kind === 'sad') {
        bullet.image.setPosition((bullet.x + Math.random() * 2 - 1) / 2, (bullet.y + Math.random() * 2 - 1) / 2);
      } else {
        if (bullet.friction) {
          const speed = Math.hypot(bullet.vx, bullet.vy), ratio = speed ? Math.max(0, speed - bullet.friction) / speed : 0;
          bullet.vx *= ratio; bullet.vy *= ratio;
        }
        bullet.vx += bullet.gx ?? 0; bullet.vy += bullet.gravity;
        bullet.x += bullet.vx; bullet.y += bullet.vy;
        if (this.kind === 'stream') this.streamBorders(bullet);
        else {
          bullet.rotation = Math.atan2(bullet.vy, bullet.vx) - Math.PI / 2;
          if (this.kind === 'tears') {
            if (bullet.y > this.border.bottom) bullet.dead = true;
            if (bullet.x + 5 < this.border.left && bullet.vx < 0 || bullet.x + 6 > this.border.right && bullet.vx > 0) bullet.vx *= -1;
          } else {
            const cx = bullet.x + (5.5 * Math.cos(bullet.rotation) - 7 * Math.sin(bullet.rotation)) * bullet.scale;
            const cy = bullet.y + (5.5 * Math.sin(bullet.rotation) + 7 * Math.cos(bullet.rotation)) * bullet.scale;
            if (cx >= 300 && cx <= 388 && cy >= 116 && cy <= 128) {
              bullet.disappear = true; this.hatHits++;
              this.scene.hat.setTexture(`spr_blookhat:${Math.min(5, this.hatHits < 10 ? 0 : 1 + Math.floor((this.hatHits - 10) / 22))}`);
            }
            if (bullet.disappear) { bullet.alpha -= .08; bullet.image.setAlpha(Math.max(0, bullet.alpha)); }
            if (bullet.alpha < .1 || bullet.age > 450 || bullet.y < -30) bullet.dead = true;
          }
        }
        bullet.image.setPosition(bullet.x / 2, bullet.y / 2).setRotation(bullet.rotation ?? 0);
        if (this.kind === 'stream') bullet.image.setTexture(`spr_streambullet:${Math.floor(bullet.age * .25) % 2}`);
      }
      if (!bullet.dead && this.kind !== 'sad' && this.scene.invFrames <= 0 && this.touchesHeart(bullet)) {
        this.scene.hurt(bullet.damage); bullet.dead = true;
      }
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    return this.frames >= this.duration;
  }

  streamBorders(bullet) {
    const border = this.border;
    if (bullet.y + 10 >= border.bottom && bullet.vy > 0) {
      bullet.y = border.bottom - 14; bullet.vy = 0; bullet.gravity = 0;
      bullet.vx = Math.random() * 2 >= 1 ? 2 : -2; bullet.gx = Math.sign(bullet.vx) * .2;
      bullet.damageable = true; bullet.dropdown = false; bullet.rotation = -Math.PI * 1.5;
    }
    if (bullet.damageable && (bullet.x + 8 <= border.left && bullet.vx < 0 || bullet.x + 9 >= border.right && bullet.vx > 0)) {
      bullet.rbord = bullet.vx > 0; bullet.x = bullet.rbord ? border.right - 14 : border.left - 5;
      bullet.vx = 0; bullet.gx = 0; bullet.vy = -2; bullet.gravity = -.2; bullet.climbing = true;
      bullet.rotation = bullet.rbord ? Math.PI : 0;
    }
    if (bullet.climbing && bullet.y + 6 <= border.top) {
      bullet.y = border.top; bullet.x += bullet.rbord ? -2 : 6;
      bullet.vx = Math.sign(this.scene.soul.x * 2 - bullet.x) * -bullet.vy;
      bullet.vy = 0; bullet.gravity = 0; bullet.gx = Math.sign(bullet.vx) * .2;
      bullet.climbing = false; bullet.dropdown = true; bullet.rotation = Math.PI / 2;
    }
    if (bullet.dropdown && bullet.x > this.scene.soul.x * 2 - 4 && bullet.x < this.scene.soul.x * 2 + 10) {
      bullet.gravity = .1; bullet.gx = 0; bullet.vx = 0; bullet.vy = 1.5; bullet.dropdown = false; bullet.rotation = 0;
    }
  }

  updateHat() {
    const scene = this.scene;
    if (this.frames === 60 || this.frames === 160) {
      scene.speechBox?.destroy(); scene.speechText?.destroy();
      scene.speechBox = scene.add.rectangle(208, 45, 106, 72, 0xffffff).setOrigin(0);
      scene.speechText = scene.add.text(215, 49, scene.text.hat[this.frames === 60 ? 0 : 1], { color: '#000', fontSize: '9px', fontFamily: 'monospace' });
    }
    if (this.frames === 260) {
      scene.speechBox?.destroy(); scene.speechText?.destroy(); scene.mercyModifier = -50;
    }
  }

  touchesHeart(bullet) {
    if (this.kind === 'sad') return super.touchesHeart(bullet);
    const scene = this.scene, data = scene.cache.json.get(bullet.sprite);
    const scale = bullet.scale ?? 1, angle = bullet.rotation ?? 0, cos = Math.cos(angle), sin = Math.sin(angle);
    const frame = data.MaskCount > 1 ? Number(bullet.image.texture.key.split(':').at(-1)) : 0;
    const mask = `${bullet.sprite}:mask${frame ? `:${frame}` : ''}`;
    for (let hx = 0; hx < 16; hx++) for (let hy = 0; hy < 16; hy++) {
      if (!(scene.textures.getPixel(hx, hy, 'spr_heart:mask')?.red > 0)) continue;
      const dx = scene.soul.x * 2 + hx - bullet.x, dy = scene.soul.y * 2 + hy - bullet.y;
      const x = Math.floor((dx * cos + dy * sin) / scale), y = Math.floor((-dx * sin + dy * cos) / scale);
      if (x < data.MarginLeft || x > data.MarginRight || y < data.MarginTop || y > data.MarginBottom) continue;
      if (data.CollisionKind !== 'Precise' || scene.textures.getPixel(x, y, mask)?.red > 0) return true;
    }
    return false;
  }

  destroy() { super.destroy(); this.scene.speechBox?.destroy(); this.scene.speechText?.destroy(); }
}
