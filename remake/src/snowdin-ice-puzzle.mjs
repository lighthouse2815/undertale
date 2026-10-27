import { SnowdinXoxoPuzzle } from './snowdin-xoxo-puzzle.mjs';
import { touchesObject } from './npc.mjs';

// room_tundra_iceentrance: X/O trên băng, cầu thu vào/mở ra và hố rơi xuống phòng người tuyết.
export class SnowdinIcePuzzle extends SnowdinXoxoPuzzle {
  constructor(world) {
    super(world, 63); this.stage = 'idle'; this.pit = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_specialdrophole'); this.particles = [];
    if (world.plot >= 63) this.openBridge(false);
  }
  openBridge(animate) {
    const w = this.world;
    this.bridge = w.add.image(this.pit.X + 3, this.pit.Y, 'spr_fakebridge:0').setOrigin(0).setDepth(-999999).setCrop(0, 0, 0, 38);
    this.bridgeWidth = 0;
    if (animate) {
      this.stage = 'bridge'; this.frames = 0; this.locked = true; this.nextChunk = 21; w.release(); w.snowdinMusic.pause();
      Object.assign(w.snowdinIce, { active: false, remaining: 0, vx: 0, vy: 0 });
    } else this.bridgeReady = 2;
    w.snowdinIce.tiles.push({ ...this.pit, ObjectName: 'obj_iceevent' });
  }
  press() {
    if (this.stage === 'falling' || this.stage === 'changing') return;
    const w = this.world, before = w.plot; super.press();
    if (before < 63 && w.plot >= 63) this.openBridge(true);
  }
  step() {
    if (this.stage === 'changing') return;
    this.stepPuzzle(); const w = this.world, p = w.player;
    if (this.bridgeReady && --this.bridgeReady === 0) { this.bridgeWidth = 38; this.bridge.setCrop(0, 0, 38, 38); }
    if (this.stage === 'bridge') {
      if (this.bridgeWidth < 38 && this.frames >= this.nextChunk) {
        this.bridgeWidth = Math.min(38, this.bridgeWidth + 8); this.bridge.setCrop(0, 0, this.bridgeWidth, 38); w.sound.play('snd_chug'); this.nextChunk += 15;
        if (this.bridgeWidth === 38) this.bridgeUnlock = this.frames + 20;
      }
      if (this.bridgeUnlock && this.frames >= this.bridgeUnlock) { this.stage = 'idle'; this.locked = false; w.snowdinMusic.resume(); w.release(); }
    } else if (this.stage === 'falling') {
      if (this.frames >= 23) {
        this.stage = 'changing'; p.setAlpha(1); w.transitionRoom('room_tundra_icehole', 'obj_markerB', 0);
      } else if (this.frames >= 2) {
        p.y += 5; p.setAlpha(.5);
        if ((this.frames - 2) % 4 === 0) p.facing = ({ d: 'r', r: 'u', u: 'l', l: 'd' })[p.facing];
        p.setTexture(`spr_mainchara${p.facing}:0`).setDepth(p.y + 30);
      }
    }
    if (p.x > 540 && p.x < 560 && !this.hat) {
      const frames = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 4]; this.hat = w.add.image(p.x - 1, p.y - 15, `spr_snowhat:${frames[Math.floor(Math.random() * frames.length)]}`).setOrigin(0);
    }
    if (this.hat?.active) {
      this.hat.setPosition(p.x - 1, p.y - 15).setDepth(p.depth + 1);
      if (!w.snowdinIce.active && !this.locked && !w.dialogue) {
        for (let i = 0; i < 4; i++) {
          const x = this.hat.x + 10 + (i ? (Math.random() < .5 ? -1 : 1) * Math.random() * 7 : 0), y = this.hat.y + (i ? 12 + (Math.random() < .5 ? -1 : 1) * Math.random() * 4 : 15);
          this.particles.push({ image: w.add.image(x, y, 'spr_snowhatparticle:0').setDepth(-20001), vx: (Math.random() < .5 ? -1 : 1) * Math.random() * 2, scale: 1 });
        }
        this.hat.destroy(); this.hat = null;
      }
    }
    for (const particle of this.particles) { particle.image.x += particle.vx; particle.image.y += 3; particle.scale -= .1; if (particle.scale < 0) particle.image.destroy(); else particle.image.setScale(particle.scale); }
    this.particles = this.particles.filter((e) => e.image.active);
  }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'idle' || w.plot >= 63 || w.dialogue || !touchesObject(w, w.player, this.pit)) return false;
    this.stage = 'falling'; this.frames = 0; this.locked = true; w.flags[388] = 1; w.release(); Object.assign(w.snowdinIce, { active: false, remaining: 0, vx: 0, vy: 0 }); w.sound.play('snd_fall2'); return true;
  }
  destroy() { if (this.stage === 'bridge' && this.world.snowdinMusic?.isPaused) this.world.snowdinMusic.resume(); this.bridge?.destroy(); this.hat?.destroy(); this.particles.forEach((e) => e.image.destroy()); }
}
