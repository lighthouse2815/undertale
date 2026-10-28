import { createCollider } from './movement.mjs';
import { UndyneChaseSpears } from './undyne-chase-spears.mjs';
import { WaterfallUndyneKid } from './waterfall-undyne-kid.mjs';

// obj_undyneencounter2 trong room_water9.
export class WaterfallUndyneSecond {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.images = new Map(); this.stage = world.plot < 110 ? 'chase' : 'done';
    this.docks = world.roomObjects.filter(e => e.item.ObjectName === 'obj_dockanim');
    if (this.stage === 'done') return;
    this.undyne = world.add.image(-40, 90, 'spr_undyne_starkd:0').setOrigin(0).setDepth(0);
    this.kid = world.add.image(360, 100, 'spr_mkid_r:0').setOrigin(0).setDepth(500);
    this.generator = new UndyneChaseSpears(); world.player.x += 6;
    this.barriers = [120, 140].map(y => createCollider(world.dataSource, { ObjectName: 'obj_solidsmall', X: 4, Y: y, ScaleX: 1, ScaleY: 1 }));
    world.colliders.push(...this.barriers);
    if (!world.chaseMusic) { world.chaseMusic = world.sound.add('mus_undynefast', { loop: true }); world.chaseMusic.play(); }
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.cutscene?.locked ?? false;
  }
  step() {
    const w = this.world;
    for (const dock of this.docks) dock.image.setTexture(`${dock.object.Sprite}:${Math.floor(w.time.now / (1000 / 6)) % dock.sprite.TextureCount}`);
    if (this.stage === 'cutscene') { this.cutscene.step(); return; }
    if (this.stage !== 'chase' || w.dialogue) return;
    if (w.player.x > 510) {
      this.clearSpears(); this.stage = 'cutscene'; this.cutscene = new WaterfallUndyneKid(w, { undyne: this.undyne, kid: this.kid, cleanup: () => { this.stage = 'done'; this.kid.destroy(); this.removeBarriers(); } }); return;
    }
    const output = this.generator.step({ x: 0, y: 0, player: { x: w.player.x, y: w.player.y, roomWidth: w.dataSource.room.Width, roomHeight: w.dataSource.room.Height }, room: 'room_water9', delay: w.player.x > 460, flags: w.flags,
      touching: spear => { const angle = spear.rotation * Math.PI / 180, x2 = spear.x + 26.5 * Math.cos(angle), y2 = spear.y - 26.5 * Math.sin(angle); return Math.max(spear.x, x2) >= w.player.x && Math.min(spear.x, x2) <= w.player.x + 19 && Math.max(spear.y, y2) >= w.player.y + 19 && Math.min(spear.y, y2) <= w.player.y + 29; } });
    for (let i = 0; i < output.launched; i++) w.sound.play('snd_arrow');
    for (const spear of this.generator.spears) {
      if (!this.images.has(spear)) this.images.set(spear, w.add.image(spear.x, spear.y, 'spr_undynespear:0').setDepth(500));
      this.images.get(spear).setPosition(spear.x, spear.y).setAngle(-spear.rotation).setAlpha(spear.alpha);
    }
    for (const [spear, image] of this.images) if (!this.generator.spears.includes(spear)) { image.destroy(); this.images.delete(spear); }
    if (output.hit) { w.release(); window.__remake.startBattle('undyneQuick'); }
  }
  removeBarriers() { this.world.colliders = this.world.colliders.filter(c => !this.barriers.includes(c)); }
  clearSpears() { for (const image of this.images.values()) image.destroy(); this.images.clear(); if (this.generator) this.generator.spears = []; }
  destroy() { this.cutscene?.destroy(); this.clearSpears(); this.undyne?.destroy(); this.kid?.destroy(); this.world.chaseMusic?.destroy(); this.world.chaseMusic = null; }
}
