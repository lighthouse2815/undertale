import { UndyneGreenWave, loadUndyneGreenWaveAssets } from './undyne-green-wave.mjs';
import { UndyneFollowSpearWave, loadUndyneFollowSpearAssets } from './undyne-follow-spear-wave.mjs';
import { UndyneRisingSpearWave, loadUndyneRisingSpearAssets } from './undyne-rising-spear-wave.mjs';

export function loadUndyneAttackTurnAssets(scene) {
  loadUndyneGreenWaveAssets(scene); loadUndyneFollowSpearAssets(scene); loadUndyneRisingSpearAssets(scene);
}

// Một lượt né của Undyne; scene boss quyết định menu, lời thoại và pha tiếp theo.
export class UndyneAttackTurn {
  constructor(scene, { kind, lesson = 1, rating = 16, damage = 7, firingRate, duration, undying = false, order = 0, onComplete } = {}) {
    this.scene = scene; this.kind = kind; this.onComplete = onComplete; this.elapsed = 0; this.hits = 0; this.finished = false;
    const options = { damage, undying, order };
    if (duration !== undefined) options.duration = duration;
    if (firingRate !== undefined) options.firingRate = firingRate;
    if (kind === 'green') {
      this.wave = new UndyneGreenWave(scene, lesson, { rating, damage, ...(duration !== undefined ? { duration } : {}) });
    } else {
      const Wave = kind === 'follow' ? UndyneFollowSpearWave : kind === 'rising' ? UndyneRisingSpearWave : null;
      if (!Wave) throw new RangeError(`Không có đợt Undyne: ${kind}`);
      scene.soul.setTexture('spr_heart:0').setOrigin(0).setScale(.5).setPosition(scene.arena.x + scene.arena.width / 2 - 4, scene.arena.y + scene.arena.height / 2 - 4).setVisible(true);
      this.wave = new Wave(scene, options);
    }
    scene.bullets = this.wave.bullets;
  }
  update(delta) {
    if (this.finished) return true;
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30 && !this.finished) { this.elapsed -= 1000 / 30; this.step(); }
    return this.finished;
  }
  step() {
    if (this.finished) return true;
    const s = this.scene, input = direction => s.keys[direction].isDown || [...s.previousScene.touch.values()].some(p => p.direction === direction);
    s.invFrames--;
    if (this.kind !== 'green') {
      const speed = (s.soulSpeed ?? 4) / (s.keys.shift.isDown ? 4 : 2), arena = s.arena;
      s.soul.x = Math.max(arena.x + 2, Math.min(arena.x + arena.width - 8, s.soul.x + (input('right') ? speed : 0) - (input('left') ? speed : 0)));
      s.soul.y = Math.max(arena.y + 2, Math.min(arena.y + arena.height - 8, s.soul.y + (input('down') ? speed : 0) - (input('up') ? speed : 0)));
    }
    const hp = s.hp, done = this.wave.step({ up: input('up'), down: input('down'), left: input('left'), right: input('right') });
    if (s.hp < hp) this.hits++;
    s.bullets = this.wave.bullets;
    s.soul.setTexture(`${this.kind === 'green' ? 'spr_heartgreen' : 'spr_heart'}:${s.invFrames > 0 ? Math.floor(s.invFrames * .5) % 2 : 0}`);
    if (s.hp <= 0) { this.finished = true; this.wave.destroy(); s.die(); return true; }
    if (done) {
      this.finished = true; const result = { kind: this.kind, hits: this.hits, refuse: this.wave.refuse ?? false, transition: this.wave.transition ?? null };
      this.wave.destroy(); s.bullets = []; this.onComplete?.(result); return true;
    }
    return false;
  }
  destroy() { if (!this.finished) { this.finished = true; this.wave.destroy(); this.scene.bullets = []; } }
}
