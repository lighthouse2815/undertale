import data from './papyrus-dust.json' with { type: 'json' };

// obj_vaporized_new dùng dữ liệu hàng trắng/đen gốc cho thân (9) và đầu (10).
export class PapyrusDust {
  constructor(scene, key, x, y) {
    this.scene = scene; this.key = key; this.x = x; this.y = y; this.line = 0; this.index = 0; this.particles = []; this.finished = false;
    this.data = data[key === 'body' ? 9 : 10]; this.width = key === 'body' ? 148 : 44; this.height = key === 'body' ? 208 : 70;
    this.image = scene.add.image(x, y, `spr_papyrusboss_${key}:0`).setOrigin(0).setScale(.5);
    scene.sound.play('snd_vaporized');
  }
  step() {
    const scene = this.scene;
    if (!this.finished) for (let row = 0; row < 4 && !this.finished; row++) {
      let width = 0, char;
      do {
        char = this.data[this.index++]; const code = char.charCodeAt(0);
        if (code >= 84 && code <= 121) width += Math.max(0, code - 85) * 2;
        if (code >= 39 && code <= 82) {
          const count = Math.max(0, code - 40);
          if (this.width > 120 && count) this.addParticle(width, this.line * 2, count);
          else for (let i = 0; i < count; i++) this.addParticle(width + i * 2, this.line * 2 + 2, 1);
          width += count * 2;
        }
      } while (char !== '}' && char !== '~');
      this.line++; if (char === '~') this.finished = true;
    }
    if (this.finished || this.line * 2 >= this.height) this.image.setVisible(false);
    else this.image.setCrop(0, this.line * 2, this.width, this.height - this.line * 2);
    for (const p of this.particles) {
      p.age++; p.vy -= p.gravity; p.image.x += p.vx / 2; p.image.y += p.vy / 2;
      if (p.age >= 12 || p.image.x < -p.width || p.image.x > 320 || p.image.y < -2 || p.image.y > 240) p.image.destroy();
      else p.image.setTexture(`spr_pixwht:${p.age}`);
    }
    this.particles = this.particles.filter((p) => p.image.active);
    return this.finished && !this.particles.length;
  }
  addParticle(x, y, width) {
    const image = this.scene.add.image(this.x + x / 2, this.y + y / 2, 'spr_pixwht:0').setOrigin(0).setScale(width / 2, .5);
    this.particles.push({ image, width, age: 0, vx: Math.random() * 4 - 2, vy: 0, gravity: Math.random() * .5 + .2 });
  }
  destroy() { this.image.destroy(); this.particles.forEach((p) => p.image.destroy()); this.particles = []; }
}
