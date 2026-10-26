import { RuinsWave } from './ruins-waves.mjs';

const BORDER = { left: 237, right: 397, top: 250, bottom: 385 };

// obj_1sidegen, blt_gravbullet, blt_vegbullet: đạn xanh chữa 1 HP cả khi đang bất tử.
export class VegetoidWave extends RuinsWave {
  constructor(scene, kind, dinner) {
    super(scene, kind); this.next = 1; this.count = 0; this.dinner = dinner;
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(118.5, 125, 80, 67.5).setVisible(false);
    this.mask = this.clip.createGeometryMask();
  }

  step() {
    this.frames++;
    if (this.frames >= this.next) {
      this.count++;
      const carrot = this.kind === 'carrots', green = this.dinner && this.count === (carrot ? 4 : 3);
      const sprite = carrot ? green ? 'spr_carrotbullet_gr' : 'spr_carrotbullet' : 'spr_vegbullet';
      let x = BORDER.left + Math.round(Math.random() * (BORDER.right - BORDER.left)) - 20;
      if (x < BORDER.left + (carrot ? 15 : 20)) x += carrot ? 15 : 20;
      const bullet = this.add(sprite, x, BORDER.top - 3, { green, damage: 5,
        vx: carrot ? 0 : (Math.random() < .5 ? 1 : -1) * (2 + Math.random() * .2), vy: carrot ? -.5 : 0 });
      bullet.image.setTexture(`${sprite}:${carrot ? 0 : Math.round(Math.random() * 5)}`).setMask(this.mask);
      if (green && !carrot) bullet.image.setTint(0x00ff00);
      this.next = this.frames + (carrot ? 6 : 18);
    }
    for (const bullet of this.bullets) {
      const oldX = bullet.x, oldY = bullet.y;
      bullet.vy += this.kind === 'carrots' ? .25 : .2;
      bullet.x += bullet.vx; bullet.y += bullet.vy;
      const data = this.scene.cache.json.get(bullet.sprite);
      if (this.kind === 'vegetables') {
        if (bullet.x + data.MarginLeft <= BORDER.left && bullet.vx < 0 || bullet.x + data.MarginRight >= BORDER.right && bullet.vx > 0) {
          bullet.x = oldX; bullet.vx *= -1;
        }
        if (bullet.y + data.MarginBottom >= BORDER.bottom && bullet.vy > 0) { bullet.y = oldY; bullet.vy /= -1.2; }
      }
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2);
      if ((bullet.green || this.scene.invFrames <= 0) && this.touchesHeart(bullet)) {
        if (bullet.green) {
          this.scene.hp = Math.min(this.scene.maxHp, this.scene.hp + 1); this.scene.refreshHp(); this.scene.sound.play('snd_heal_c');
          this.scene.ate = true; this.scene.mercyModifier = 90;
        } else this.scene.hurt(bullet.damage);
        bullet.dead = true;
      }
      if (bullet.y > 480 || bullet.x < -24 || bullet.x > 640) bullet.dead = true;
      if (bullet.dead) bullet.image.destroy();
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    return this.frames >= 110;
  }

  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
