import { createCollider } from './movement.mjs';

// obj_boardride_a: chuyến bè một chiều qua phòng lịch sử Waterfall.
export class WaterfallRaft {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.stage = 'waiting';
    this.board = world.roomObjects.find(e => e.item.ObjectName === 'obj_boardride_a');
    this.x = this.board.item.X; this.y = this.board.item.Y;
    this.board.image.setDepth(-100000);
    if (world.plot > 108) {
      this.board.image.destroy(); this.board.image = null; this.stage = 'gone';
      world.colliders.push(createCollider(world.dataSource, { ...this.board.item, ObjectName: 'obj_solidsmall' }));
    }
  }
  tryBoard() {
    const world = this.world, p = world.player;
    if (this.stage !== 'waiting' || world.dialogue || p.x + 19 < this.x + 16 || p.x > this.x + 24 || p.y + 29 < this.y + 2 || p.y + 19 > this.y + 18) return false;
    world.saveGame(true); world.release(); p.frameIndex = 0; p.setTexture(`spr_mainchara${p.facing}:0`); this.stage = 'ride';
    const oldMusic = world.waterfallMusic; this.oldMusic = oldMusic;
    if (oldMusic) this.fadeOut = world.tweens.add({ targets: oldMusic, volume: 0, duration: oldMusic.volume / .006 * 1000 / 30, onComplete: () => { oldMusic.destroy(); this.oldMusic = null; } });
    const music = world.waterfallMusic = world.sound.add('mus_ambientwater', { loop: true, volume: 0 }); music.play();
    this.fadeIn = world.tweens.add({ targets: music, volume: .9, duration: .9 / .005 * 1000 / 30 });
    return true;
  }
  update(delta) {
    if (this.stage === 'gone') return false;
    if (this.stage === 'waiting') this.tryBoard();
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.stage === 'ride' || this.stage === 'pause';
  }
  step() {
    const world = this.world;
    if (this.stage === 'ride') {
      const dx = Math.min(3, 1000 - this.x); this.x += dx; world.player.x += dx; this.board.image.x = this.x; world.updateCamera();
      if (this.x >= 1000) { this.stage = 'pause'; this.wait = 8; }
    } else if (this.stage === 'pause') {
      if (--this.wait <= 0) { this.stage = 'return'; world.release(); }
    } else if (this.stage === 'return') { this.x -= 3; this.board.image.x = this.x; }
  }
  destroy() { this.fadeOut?.stop(); this.fadeIn?.stop(); this.oldMusic?.destroy(); }
}
