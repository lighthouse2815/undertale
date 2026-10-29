export function loadUndyneGreenSpearAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const direction of ['l', 'r', 'u', 'd']) {
    const key = `spr_bullet_test_${direction}`;
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < 2; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
  for (const key of ['spr_bullet_testx', 'spr_bullet_testx_arrow']) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < 4; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
  if (!scene.textures.exists('spr_bullet_testx:mask')) scene.load.image('spr_bullet_testx:mask', new URL('sprites/spr_bullet_testx/spr_bullet_testx_0.mask.png', base).href);
  if (!scene.textures.exists('spr_bullet_test:mask')) scene.load.image('spr_bullet_test:mask', new URL('sprites/spr_bullet_test/spr_bullet_test_0.mask.png', base).href);
  if (!scene.cache.audio.exists('snd_bell')) scene.load.audio('snd_bell', new URL('sounds/snd_bell/snd_bell.wav', base).href);
}

// obj_blockbullet: giáo bay từ bốn phía, mask va vào khiên hoặc tâm SOUL.
export class UndyneGreenSpear {
  constructor(scene, greenSoul, site, { speed = 1, damage = 7, highlighted = true } = {}) {
    this.scene = scene; this.greenSoul = greenSoul; this.site = site; this.damage = damage; this.age = 0; this.done = false; this.mask = 'spr_bullet_test:mask';
    const offset = [[-300, 0], [300, 0], [0, 300], [0, -300]][site];
    this.centerX = (scene.soul.x + 4) * 2; this.centerY = (scene.soul.y + 4) * 2;
    this.x = this.centerX + offset[0]; this.y = this.centerY + offset[1];
    this.vx = -Math.sign(offset[0]) * 8 * speed; this.vy = -Math.sign(offset[1]) * 8 * speed;
    this.key = `spr_bullet_test_${['l', 'r', 'u', 'd'][site]}`; this.frame = highlighted ? 1 : 0;
    const sprite = scene.cache.json.get(this.key);
    this.image = scene.add.image(this.x / 2, this.y / 2, `${this.key}:${this.frame}`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setScale(.5).setDepth(1000).setAlpha(0);
  }
  overlaps(left, top, right, bottom) {
    const texture = this.scene.textures, x0 = Math.floor(this.x - 12), y0 = Math.floor(this.y - 12);
    for (let y = Math.max(top, y0); y <= Math.min(bottom, y0 + 23); y++) for (let x = Math.max(left, x0); x <= Math.min(right, x0 + 23); x++) {
      if (texture.getPixel(x - x0, y - y0, this.mask)?.red > 0) return true;
    }
    return false;
  }
  step() {
    if (this.done) return true;
    this.age++; this.x += this.vx; this.y += this.vy;
    this.image.setPosition(this.x / 2, this.y / 2).setAlpha(Math.min(1, this.age * .2));
    const x = this.centerX, y = this.centerY, ideal = this.greenSoul.shield.ideal;
    const line = ideal === 0 ? [x - 30, y - 30, x - 30, y + 30] : ideal === 180 ? [x + 30, y - 30, x + 30, y + 30] : ideal === 90 ? [x - 30, y + 30, x + 30, y + 30] : [x - 30, y - 30, x + 30, y - 30];
    if (this.overlaps(...line) && this.greenSoul.block([0, 180, 90, 270].indexOf(ideal))) { this.scene.sound.play('snd_bell'); this.destroy(); }
    else if (this.overlaps(x - 5, y - 5, x + 5, y + 5)) { this.scene.hurt(this.damage); this.destroy(); }
    return this.done;
  }
  destroy() { this.done = true; this.image.destroy(); }
}

// obj_blockbullet2: giáo vàng vòng ra phía đối diện trước khi lao vào.
export class UndyneGreenYellowSpear extends UndyneGreenSpear {
  constructor(scene, greenSoul, site, { speed = 1, damage = 7, rating = 8 } = {}) {
    super(scene, greenSoul, site, { speed, damage });
    this.speed = speed; this.rating = rating; this.part = 0; this.mask = 'spr_bullet_testx:mask';
    this.image.destroy(); const sprite = scene.cache.json.get('spr_bullet_testx_arrow');
    this.image = scene.add.image(this.x / 2, this.y / 2, `spr_bullet_testx_arrow:${[1, 0, 3, 2][site]}`)
      .setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setScale(.5).setDepth(1000).setAlpha(0);
  }
  step() {
    if (this.done) return true;
    if (this.part === 0 && Math.hypot(this.x - this.centerX, this.y - this.centerY) < 80) {
      this.part = 1; this.arcFrame = 0; this.arcX = this.x; this.arcY = this.y; this.vx = this.vy = 0;
      this.arcDistance = 145 + Math.max(0, this.rating - 8) * 8;
    }
    if (this.part === 1) {
      this.arcFrame++;
      const across = Math.sin(this.arcFrame * Math.PI / 20) * this.arcDistance;
      const bend = Math.sin(this.arcFrame * Math.PI / 10) * 100;
      if (this.site === 0) { this.x = this.arcX + across; this.y = this.arcY - bend; }
      if (this.site === 1) { this.x = this.arcX - across; this.y = this.arcY - bend; }
      if (this.site === 2) { this.y = this.arcY - across; this.x = this.arcX - bend; }
      if (this.site === 3) { this.y = this.arcY + across; this.x = this.arcX + bend; }
      if (this.arcFrame === 10) {
        this.part = 2; this.vx = this.site === 0 ? -8 * this.speed : this.site === 1 ? 8 * this.speed : 0;
        this.vy = this.site === 2 ? 8 * this.speed : this.site === 3 ? -8 * this.speed : 0;
      }
      // Bước cha di chuyển trước kiểm tra; áp dụng vận tốc vào frame kế tiếp.
      const vx = this.vx, vy = this.vy; this.vx = this.vy = 0;
      const result = super.step(); this.vx = vx; this.vy = vy; return result;
    }
    return super.step();
  }
}
