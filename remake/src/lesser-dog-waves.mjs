import { RuinsWave } from './ruins-waves.mjs';

// blt_tinypom_leap và blt_bluespear/blt_whitespear, tọa độ gốc ở 30 Hz.
export class LesserDogWave extends RuinsWave {
  constructor(scene, command, mercy) {
    super(scene, 'lesserDog'); this.kind = command < 50 ? 'dog' : 'spears'; this.duration = mercy > 250 ? 0 : 110;
    this.border = { left: 202, right: 432, top: 290, bottom: 385 };
    scene.arena.setPosition(101, 145).setSize(115, 47.5); scene.soul.setPosition(154.5, 164.5);
    this.oldHeart = { x: scene.soul.x * 2, y: scene.soul.y * 2 };
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(101, 145, 115, 47.5).setVisible(false); this.mask = this.clip.createGeometryMask();
    if (!this.duration) return;
    if (this.kind === 'dog') this.dog = this.add('spr_tinypomwag', 357, 347, { vx: 0, vy: 0, damage: 6, barked: 0, barkAt: 10, moveAt: Infinity, wagAt: Infinity, gravity: 0, friction: 0 });
    else this.blue = this.add('spr_bluespear', 427, 290, { vx: -4, damage: 6, blue: true, whiteAt: 20 + Math.round(Math.random() * 10) });
    for (const bullet of this.bullets) bullet.image.setMask(this.mask);
  }

  stepDog(dog) {
    if (dog.age === dog.barkAt) {
      if (dog.barked < 2) {
        dog.sprite = 'spr_tinypombark'; dog.wagAt = dog.age + 4; dog.barkAt = dog.age + 8; dog.barked++;
        this.scene.sound.play('snd_pombark');
      } else { dog.moveAt = dog.age + 10; dog.sprite = 'spr_tinypomwalk'; dog.barkAt = Infinity; }
    }
    if (dog.age === dog.wagAt) dog.sprite = 'spr_tinypomwag';
    if (dog.age === dog.moveAt) {
      dog.moveAt += 4; dog.vx += this.scene.soul.x * 2 < dog.x ? -.4 : .4;
      if (!dog.gravity && this.scene.soul.y * 2 < dog.y && Math.abs(dog.x - this.scene.soul.x * 2) < 50) {
        dog.gravity = .22; dog.vy = -5; dog.sprite = 'spr_tinypomjump';
      }
    }
    if (dog.friction) {
      const speed = Math.hypot(dog.vx, dog.vy), ratio = speed ? Math.max(0, speed - dog.friction) / speed : 0;
      dog.vx *= ratio; dog.vy *= ratio;
    }
    const previousY = dog.y; dog.vy += dog.gravity; dog.x += dog.vx; dog.y += dog.vy;
    const data = this.scene.cache.json.get(dog.sprite);
    if (dog.gravity && dog.vy > 0 && dog.y + data.MarginBottom >= this.border.bottom) {
      dog.y = previousY - dog.vy; dog.vy = 0; dog.gravity = 0; dog.barked = 1; dog.friction = .2;
      dog.sprite = 'spr_tinypomwag'; dog.moveAt = Infinity; dog.barkAt = dog.age + 6;
    }
    dog.image.setTexture(`${dog.sprite}:${Math.floor(dog.age * .334) % this.scene.cache.json.get(dog.sprite).TextureCount}`);
  }

  white() {
    const right = Math.random() >= .5, b = this.border;
    const bullet = this.add('spr_whitespear', right ? b.right + 20 : b.left - 20, b.top + 7,
      { vx: right ? -7 : 7, gx: right ? .13 : -.13, damage: 6 });
    bullet.image.setMask(this.mask); return bullet;
  }

  step() {
    this.frames++; if (!this.duration) return true;
    const hx = this.scene.soul.x * 2, hy = this.scene.soul.y * 2;
    const moving = Math.abs(hx - this.oldHeart.x) > .01 || Math.abs(hy - this.oldHeart.y) > .01;
    for (const bullet of [...this.bullets]) {
      bullet.age++;
      if (bullet === this.dog) this.stepDog(bullet);
      else {
        if (bullet.blue && bullet.age === bullet.whiteAt) this.white();
        bullet.vx += bullet.gx ?? 0; bullet.x += bullet.vx;
      }
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2);
      if (this.scene.invFrames <= 0 && (!bullet.blue || moving) && this.touchesHeart(bullet)) this.scene.hurt(bullet.damage);
      if (bullet.sprite === 'spr_whitespear' && (bullet.x < -20 || bullet.x > 640)) return true;
    }
    this.oldHeart = { x: hx, y: hy }; return this.frames >= this.duration;
  }

  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
