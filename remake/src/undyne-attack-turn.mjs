import { UndyneGreenWave, loadUndyneGreenWaveAssets } from './undyne-green-wave.mjs';
import { UndyneFollowSpearWave, loadUndyneFollowSpearAssets } from './undyne-follow-spear-wave.mjs';
import { UndyneRisingSpearWave, loadUndyneRisingSpearAssets } from './undyne-rising-spear-wave.mjs';

export function loadUndyneAttackTurnAssets(scene) {
  loadUndyneGreenWaveAssets(scene); loadUndyneFollowSpearAssets(scene); loadUndyneRisingSpearAssets(scene);
  if (!scene.textures.exists('spr_undynespear_r:0')) scene.load.image('spr_undynespear_r:0', new URL('../assets/sprites/spr_undynespear_r/spr_undynespear_r_0.png', import.meta.url).href);
}

// Một lượt né của Undyne; scene boss quyết định menu, lời thoại và pha tiếp theo.
export class UndyneAttackTurn {
  constructor(scene, { kind, lesson = 1, rating = 16, damage = 7, firingRate, duration, undying = false, order = 0, onComplete } = {}) {
    this.scene = scene; this.kind = kind; this.onComplete = onComplete; this.elapsed = 0; this.hits = 0; this.finished = false; this.lesson = lesson; this.undying = undying; this.phase = 'wave';
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
    if (this.kind !== 'green' && this.phase !== 'green' || this.phase === 'red') {
      const speed = (s.soulSpeed ?? 4) / (s.keys.shift.isDown ? 4 : 2), arena = s.arena;
      s.soul.x = Math.max(arena.x + 2, Math.min(arena.x + arena.width - 8, s.soul.x + (input('right') ? speed : 0) - (input('left') ? speed : 0)));
      s.soul.y = Math.max(arena.y + 2, Math.min(arena.y + arena.height - 8, s.soul.y + (input('down') ? speed : 0) - (input('up') ? speed : 0)));
    }
    const hp = s.hp;
    let done;
    if (this.phase === 'switch') {
      if (--this.switchFrames === 0) {
        this.phase = 'red'; this.redFrames = 60;
        this.spear = { x: -10, y: s.soul.y * 2, speed: { 6: 11, 11: 13, 20: 14 }[this.lesson] };
        this.spear.image = s.add.image(-5, s.soul.y, 'spr_undynespear_r:0').setOrigin(0).setScale(.5).setDepth(1000);
      }
      done = false;
    } else if (this.phase === 'returnGreen' || this.phase === 'green') {
      if (--this.switchFrames === 15) this.phase = 'green';
      done = this.switchFrames <= 0;
    } else if (this.phase === 'red') {
      const spear = this.spear; spear.x += spear.speed; spear.image.setX(spear.x / 2);
      const left = Math.max(0, Math.ceil(spear.x - s.soul.x * 2)), right = Math.min(15, Math.floor(spear.x + 52 - s.soul.x * 2));
      const top = Math.max(0, Math.ceil(spear.y + 13 - s.soul.y * 2)), bottom = Math.min(15, Math.floor(spear.y + 19 - s.soul.y * 2));
      for (let y = top; y <= bottom && s.invFrames <= 0; y++) for (let x = left; x <= right && s.invFrames <= 0; x++) {
        if (s.textures.getPixel(x, y, 'spr_heart:mask')?.red > 0) s.hurt(6);
      }
      done = --this.redFrames <= 0;
    } else done = this.wave.step({ up: input('up'), down: input('down'), left: input('left'), right: input('right') });
    if (s.hp < hp) this.hits++;
    s.bullets = this.wave.bullets;
    s.soul.setTexture(`${(this.kind === 'green' && this.phase !== 'red' || this.phase === 'green') ? 'spr_heartgreen' : 'spr_heart'}:${s.invFrames > 0 ? Math.floor(s.invFrames * .5) % 2 : 0}`);
    if (s.hp <= 0) { this.finished = true; this.wave.destroy(); this.spear?.image.destroy(); s.die(); return true; }
    // Bộ phát báo đổi màu trước khi kết thúc 3 frame; alarm[10]/[11] kết thúc sau 25 frame từ tín hiệu.
    if (done && this.phase === 'wave' && this.kind !== 'green' && this.wave.transition && !this.undying) { this.phase = 'returnGreen'; this.switchFrames = this.wave.transition.delay - 8; return false; }
    if (done && this.phase === 'wave' && this.kind === 'green' && this.wave.refuse && !this.undying && [6, 11, 20].includes(this.lesson)) { this.phase = 'switch'; this.switchFrames = 10; return false; }
    if (done) {
      this.spear?.image.destroy(); this.finished = true; const result = { kind: this.kind, hits: this.hits, refuse: this.wave.refuse ?? false, transition: this.wave.transition ?? null };
      this.wave.destroy(); s.bullets = []; this.onComplete?.(result); return true;
    }
    return false;
  }
  destroy() { if (!this.finished) { this.finished = true; this.wave.destroy(); this.spear?.image.destroy(); this.scene.bullets = []; } }
}
