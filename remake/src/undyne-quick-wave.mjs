import { RuinsWave } from './ruins-waves.mjs';

export function loadUndyneQuickWaveAssets(scene) {
  const base = new URL('../assets/', import.meta.url), key = 'spr_uspearbul';
  if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
  if (!scene.textures.exists(`${key}:0`)) scene.load.image(`${key}:0`, new URL(`sprites/${key}/${key}_0.png`, base).href);
  if (!scene.cache.audio.exists('snd_arrow')) scene.load.audio('snd_arrow', new URL('sounds/snd_arrow/snd_arrow.wav', base).href);
}

// room_fastbattle: flag 370=1, mưa giáo trong 38 frame còn lại của bộ đếm.
export class UndyneQuickWave extends RuinsWave {
  constructor(scene) {
    super(scene, 'undyneQuick'); this.next = 1; this.duration = 38;
    this.border = { left: 237, right: 397, top: 250, bottom: 385 };
    const b = this.border; scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2); scene.soul.setPosition(154.5, 154.5);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false); this.mask = this.clip.createGeometryMask();
  }
  step() {
    this.frames++;
    if (this.frames >= this.next) {
      const direction = (260 + Math.random() * 20) * Math.PI / 180;
      this.add('spr_uspearbul', this.border.left + 10 + Math.random() * 150, this.border.top - 80,
        { speed: 6, direction, damage: 9 }).image.setMask(this.mask);
      this.scene.sound.play('snd_arrow'); this.next = this.frames + 3;
    }
    for (const bullet of this.bullets) {
      bullet.speed += .3; bullet.x += Math.cos(bullet.direction) * bullet.speed; bullet.y -= Math.sin(bullet.direction) * bullet.speed;
      bullet.image.setPosition(bullet.x / 2, bullet.y / 2);
      if (this.scene.invFrames <= 0 && this.touchesHeart(bullet)) {
        let damage = this.scene.previousScene.plot > 110 && this.scene.hp <= 10 ? 3 : 4;
        damage = Math.max(damage, Math.floor(this.scene.maxHp / 7));
        this.scene.hp = Math.max(0, this.scene.hp - damage); this.scene.invFrames = 60;
        this.scene.sound.play('snd_hurt1'); this.scene.cameras.main.shake(1000 / 15, .006); this.scene.refreshHp();
      }
    }
    return this.frames >= this.duration;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
