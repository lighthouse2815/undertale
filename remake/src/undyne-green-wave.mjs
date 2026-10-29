import laterPatterns from './undyne-green-patterns.json' with { type: 'json' };
import { UndyneGreenSoul, loadUndyneGreenSoulAssets } from './undyne-green-soul.mjs';
import { UndyneGreenSpear, UndyneGreenYellowSpear, loadUndyneGreenSpearAssets } from './undyne-green-spear.mjs';

// Các chuỗi obj_spearblocker User1; số lần lặp và thứ tự theo scr_sr.
const patterns = [
  [[0,0,1,0], [0,0,1,0], [0,0,.5,0], [0,0,.5,0], [0,0,1,0], [0,2,1,0], [0,2,1,0], [1,2,0,0], [1,2,0,0]],
  Array.from({ length: 3 }, () => [3,0,1,.5]),
  [[3,0,1,.625], [3,0,1,.625], [0,0,1,.625], [0,0,1,.625], [1,0,1,.625], [1,0,1,.625]],
  [[0,0,0,.75], [1,0,0,.75], [0,0,0,.75], [1,0,0,.75], [1,0,0,.75], [0,0,0,.75], [0,0,0,.75], [2,0,0,.75]],
];

export function loadUndyneGreenWaveAssets(scene) { loadUndyneGreenSoulAssets(scene); loadUndyneGreenSpearAssets(scene); }

export class UndyneGreenWave {
  constructor(scene, lesson, { rating = 10, damage = 7, duration = lesson < 0 ? 300 : 200 } = {}) {
    const key = lesson > 20 ? 21 : lesson;
    let pattern = patterns[key] ?? laterPatterns[key];
    if (lesson === 9) pattern = [[0,0,2,3 / (rating >= 11 ? rating - 1 : rating)], ...[3,1,2,3,1,2].map(site => [site,0,1,1.5])];
    if (lesson === 10) pattern = [[0,0,.1,1], [0,0,.1,1.5], [0,0,2 + (rating <= 11 ? .5 : 0),2], [1,0,.1,1], [1,0,.1,1.5], [1,0,2 + (rating <= 11 ? .5 : 0),2], ...[2,3,2,3].map(site => [site,0,1,2])];
    if (!pattern) throw new RangeError(`Chưa có chuỗi giáo ${lesson}`);
    this.refuse = [6, 11, 20, -7, -10, -14].includes(lesson);
    this.scene = scene; this.soul = new UndyneGreenSoul(scene); this.frames = 0; this.rating = rating; this.damage = damage; this.duration = duration;
    this.sequence = pattern.map(([site, type, time, speed]) => ({ site: site === 4 ? Math.floor(Math.random() * 4) : site, type: type === 3 ? Math.floor(Math.random() * 2) : type, time: time || (type === 2 ? 0 : 1), speed: speed || 1 }));
    this.index = 0; this.next = 5; this.bullets = []; this.done = false;
  }
  step(input = {}) {
    if (this.done) return true;
    this.frames++; this.soul.step(input);
    if (this.index < this.sequence.length && this.frames >= this.next) {
      const entry = this.sequence[this.index++], options = { speed: entry.speed, damage: this.damage, rating: this.rating };
      if (entry.type === 2) {
        // Giáo vàng nhận site=time và speed mặc định; giáo thường nhận site/speed của scr_sr.
        this.bullets.push(new UndyneGreenYellowSpear(this.scene, this.soul, entry.time, { damage: this.damage, rating: this.rating }));
        this.bullets.push(new UndyneGreenSpear(this.scene, this.soul, entry.site, options));
      } else {
        const Type = entry.type === 1 ? UndyneGreenYellowSpear : UndyneGreenSpear;
        this.bullets.push(new Type(this.scene, this.soul, entry.site, options));
      }
      this.next = this.frames + Math.max(1, Math.round(this.rating * (entry.type === 2 ? 2 : entry.time)));
      if (this.rating > 8) this.rating--;
    }
    for (const bullet of this.bullets) bullet.step();
    this.bullets = this.bullets.filter(bullet => !bullet.done);
    this.done = this.frames >= this.duration || this.frames > 30 && this.index === this.sequence.length && !this.bullets.length;
    if (this.done) this.destroy();
    return this.done;
  }
  destroy() { if (this.destroyed) return; this.destroyed = true; for (const bullet of this.bullets) bullet.destroy(); this.bullets = []; this.soul.destroy(); }
}
