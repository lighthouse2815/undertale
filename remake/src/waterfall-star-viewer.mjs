export class WaterfallStarViewer {
  constructor(world, lensSprite = 'spr_starcheckeredit') { this.world = world; this.lensSprite = lensSprite; }
  openViewer() {
    const world = this.world, music = world.waterfallMusic ?? world.townMusic;
    this.view = { x: 0, y: 0, frames: 0, elapsed: 0, music, volume: music?.volume };
    music?.setVolume(music.volume / 2); world.release();
    this.view.pattern = world.add.image(0, 0, 'spr_starpattern:0').setOrigin(0).setScrollFactor(0).setDepth(100001);
    this.view.lens = world.add.image(0, 0, `${this.lensSprite}:0`).setOrigin(0).setScrollFactor(0).setDepth(100002);
    this.view.cover = world.add.graphics().setScrollFactor(0).setDepth(100003);
    this.drawViewer();
  }
  drawViewer() {
    const v = this.view, left = v.x + 120, top = v.y + 85, right = v.x + 201, bottom = v.y + 156;
    v.lens.setPosition(v.x, v.y); v.cover.clear().fillStyle(0x000000).fillRect(0, 0, 320, top).fillRect(0, bottom, 320, 240 - bottom).fillRect(0, top, left, bottom - top).fillRect(right, top, 320 - right, bottom - top);
  }
  update(delta) {
    const v = this.view; if (!v) return false; const world = this.world;
    v.elapsed = Math.min(200, v.elapsed + delta);
    while (v.elapsed >= 1000 / 30) {
      v.elapsed -= 1000 / 30; v.frames++;
      const input = direction => world.keys[direction].isDown || [...world.touch.values()].some(pointer => pointer.direction === direction);
      v.x = Math.max(-120, Math.min(119, v.x + (input('right') ? 4 : 0) - (input('left') ? 4 : 0)));
      v.y = Math.max(-85, Math.min(84, v.y + (input('down') ? 4 : 0) - (input('up') ? 4 : 0)));
      v.pattern.setTexture(`spr_starpattern:${Math.floor(v.frames * .2) % 4}`); this.drawViewer();
    }
    if (v.frames >= 2 && world.justConfirmed()) this.closeViewer();
    return true;
  }
  closeViewer() {
    const v = this.view; if (!v || v.frames < 2) return;
    v.pattern.destroy(); v.lens.destroy(); v.cover.destroy(); if (v.music && !v.music.pendingRemove) v.music.setVolume(v.volume);
    this.view = null; this.world.release(); this.world.interactionCooldown = 250;
  }
  destroy() { if (this.view) { this.view.frames = Math.max(2, this.view.frames); this.closeViewer(); } }
}
