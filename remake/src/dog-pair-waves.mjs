import { RuinsWave } from './ruins-waves.mjs';

const SPRITES = { spr_whiteax2: 2, spr_smheartbullet: 1, spr_smheartbulletb: 1,
  spr_tinypomwag: 2, spr_tinypombark: 1, spr_tinypomsad: 1, spr_tinypomsadbark: 1 };

export function loadDogPairWaveAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const [key, count] of Object.entries(SPRITES)) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < count; i++) {
      if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
      if (key === 'spr_whiteax2' && !scene.textures.exists(`${key}:mask:${i}`)) scene.load.image(`${key}:mask:${i}`, new URL(`sprites/${key}/${key}_${i}.mask.png`, base).href);
    }
  }
  if (!scene.cache.audio.exists('snd_noise')) scene.load.audio('snd_noise', new URL('sounds/snd_noise/snd_noise.wav', base).href);
}

// blt_whiteax, obj_loopdog, obj_loopbulletgrowgen/grow và blt_sadbullet.
export class DogPairWave extends RuinsWave {
  constructor(scene, command, survivor = null) {
    super(scene, 'dogPair'); this.survivor = survivor;
    this.kind = survivor === 'dogaressa' || !survivor && command <= 50 ? 'axes' : 'hearts';
    this.duration = survivor ? 200 : this.kind === 'axes' ? 172 : 200;
    this.border = this.kind === 'axes' ? { left: 202, right: 432, top: 290, bottom: 385 } : { left: 132, right: 492, top: 250, bottom: 385 };
    const b = this.border; scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2);
    scene.soul.setPosition((Math.round((b.left + b.right) / 2) - 8) / 2, (Math.round((b.top + b.bottom) / 2) - 8) / 2);
    this.oldHeart = { x: scene.soul.x * 2, y: scene.soul.y * 2 }; this.generators = [];
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false);
    this.mask = this.clip.createGeometryMask();
    if (this.kind === 'axes') for (const side of [0, 1]) {
      const a = this.add('spr_whiteax2', side ? 350 : 99, 309, { type: 'axe', side, frame: side, launchAt: 10, launched: false, visible: false, alpha: 0, gravity: 0, damage: survivor ? 7 : 6 });
      a.image.setMask(this.mask).setVisible(false);
    } else {
      this.dogX = b.left - 54; this.dogY = b.bottom - 38 - 36; this.barkAt = survivor ? 64 : 14; this.wagAt = Infinity;
      const sprite = survivor ? 'spr_tinypomsad' : 'spr_tinypomwag';
      this.dogs = [scene.add.image(this.dogX / 2, this.dogY / 2, `${sprite}:0`).setOrigin(0).setScale(-.5, .5).setVisible(false)];
      if (!survivor) this.dogs.push(scene.add.image((b.right + 54) / 2, this.dogY / 2, `${sprite}:0`).setOrigin(0).setScale(.5).setVisible(false));
    }
  }

  spawnRing(generator) {
    let blue = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < 8; i++) {
      const angle = i * 45, radial = (angle - 90) * Math.PI / 180;
      const p = this.add(blue === 1 ? 'spr_smheartbulletb' : 'spr_smheartbullet', generator.x + Math.cos(radial) * 2, generator.y - Math.sin(radial) * 2,
        { type: 'ring', blue: blue === 1, radius: 1, direction: angle, speed: generator.speed, drift: generator.drift, nxadd: 0, radchange: 0, damage: 5 });
      p.image.setOrigin(.5); blue = blue === 1 ? 2 : 1;
    }
  }

  stepDog() {
    if (this.frames === 4) {
      this.dogs.forEach((d) => d.setVisible(true));
      if (this.survivor) this.duration = this.frames + 170 - 1; // Alarm1 đặt lại turntimer.
    }
    if (this.frames === this.barkAt) {
      this.dogBarking = true; this.wagAt = this.frames + (this.survivor ? 30 : 15);
      if (this.survivor) this.add('spr_smheartbullet', this.dogX - 20, this.dogY + 25, { type: 'sad', vx: 5, vy: 0, gravity: .15, friction: .1, damage: 1 }).image.setOrigin(.5);
      else {
        const add = Math.floor(Math.random() * 8) / 10;
        this.generators.push({ x: this.dogX - 20, y: this.dogY + 10, age: 0, speed: 1.2 + add, drift: 2.2 + add });
      }
      this.barkAt = this.survivor ? Infinity : this.frames + 75;
    }
    if (this.frames === this.wagAt) this.dogBarking = false;
    const key = this.survivor ? this.dogBarking ? 'spr_tinypomsadbark' : 'spr_tinypomsad' : this.dogBarking ? 'spr_tinypombark' : 'spr_tinypomwag';
    this.dogs.forEach((d) => d.setTexture(`${key}:${Math.floor(this.frames * .2) % SPRITES[key]}`));
    for (const g of this.generators) { g.x += g.speed; if (++g.age === 3) this.spawnRing(g); }
    this.generators = this.generators.filter((g) => g.age < 3);
  }

  stepAxe(p) {
    p.alpha = Math.min(1, p.alpha + .05);
    if (p.age === p.launchAt) {
      p.visible = true;
      if (p.launched) { p.vx = p.side ? -1.8 : 1.8; p.vy = this.survivor ? -3.1 : -3.8; p.gravity = .2; }
      else { p.launched = true; p.launchAt = p.age + 10 + Math.floor(Math.random() * 14); }
    }
    const oldX = p.x, oldY = p.y;
    p.vy += p.gravity; p.x += p.vx; p.y += p.vy;
    if (p.gravity && p.vy > 0 && p.y + 74 >= this.border.bottom) {
      p.x = oldX; p.y = oldY; p.vx = p.vy = p.gravity = 0; p.launchAt = p.age + (this.survivor ? 4 : 15);
      this.scene.sound.play('snd_noise'); this.scene.cameras.main.shake(1000 / 15, .006);
    }
    p.image.setVisible(p.visible).setAlpha(p.alpha).setTexture(`spr_whiteax2:${p.frame}`);
  }

  stepHeart(p) {
    if (p.type === 'ring') {
      if (p.radius < 55) { p.radius = Math.min(55, p.radius + 2); p.radchange = 1; }
      // radchange trong source giữ nguyên sau khi đạt radius55.
      if (p.radchange) { const a = (p.direction - 90) * Math.PI / 180; p.x += 2 * Math.cos(a); p.y -= 2 * Math.sin(a); }
      p.direction += 360 / (2 * Math.PI * p.radius / p.speed);
      p.x += p.speed * Math.cos(p.direction * Math.PI / 180); p.y -= p.speed * Math.sin(p.direction * Math.PI / 180);
      if (p.nxadd < p.drift) p.nxadd += .125;
      p.x += p.nxadd;
      if (p.x >= this.border.right || p.x + 8 < 0 || p.x - 8 > 640 || p.y + 8 < 0 || p.y - 8 > 480) p.dead = true;
    } else {
      const speed = Math.hypot(p.vx, p.vy), ratio = speed ? Math.max(0, speed - p.friction) / speed : 0;
      p.vx *= ratio; p.vy = p.vy * ratio + p.gravity;
      const oldX = p.x, oldY = p.y; p.x += p.vx; p.y += p.vy;
      if (p.y + 1 >= this.border.bottom && p.vy > 0) { p.x = oldX; p.y = oldY; p.vx = p.vy = p.gravity = p.friction = 0; }
    }
  }

  touchesHeart(p) {
    const scene = this.scene, d = scene.cache.json.get(p.sprite), hx = scene.soul.x * 2, hy = scene.soul.y * 2;
    const x0 = p.x - d.OriginX, y0 = p.y - d.OriginY;
    for (let x = Math.ceil(Math.max(hx, x0 + d.MarginLeft)); x <= Math.floor(Math.min(hx + 15, x0 + d.MarginRight)); x++) {
      for (let y = Math.ceil(Math.max(hy, y0 + d.MarginTop)); y <= Math.floor(Math.min(hy + 15, y0 + d.MarginBottom)); y++) {
        if (!(scene.textures.getPixel(Math.floor(x - hx), Math.floor(y - hy), 'spr_heart:mask')?.red > 0)) continue;
        if (p.type !== 'axe' || scene.textures.getPixel(Math.floor(x - x0), Math.floor(y - y0), `spr_whiteax2:mask:${p.frame}`)?.red > 0) return true;
      }
    }
    return false;
  }

  step() {
    this.frames++; if (this.dogs) this.stepDog();
    const scene = this.scene, hx = scene.soul.x * 2, hy = scene.soul.y * 2, moving = Math.abs(hx - this.oldHeart.x) > .01 || Math.abs(hy - this.oldHeart.y) > .01;
    for (const p of this.bullets) {
      p.age++; if (p.type === 'axe') this.stepAxe(p); else this.stepHeart(p);
      p.image.setPosition(p.x / 2, p.y / 2);
      if (!p.dead && scene.invFrames <= 0 && (!p.blue || moving) && this.touchesHeart(p)) {
        scene.hurt(p.damage); if (p.type === 'axe') scene.invFrames = 45; else p.dead = true;
      }
      if (p.dead) p.image.destroy();
    }
    this.bullets = this.bullets.filter((p) => !p.dead); this.oldHeart = { x: hx, y: hy };
    return this.frames >= this.duration;
  }
  destroy() { super.destroy(); this.dogs?.forEach((d) => d.destroy()); this.mask.destroy(); this.clip.destroy(); }
}
