import { createCollider } from './movement.mjs';
import { UndyneChaseSpears } from './undyne-chase-spears.mjs';

// obj_undyneencounter1 và obj_uspeargen trong room_water8.
export class WaterfallUndyneChase {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.stage = world.plot < 110 ? 'waiting' : 'done'; this.locked = false; this.images = new Map();
    this.docks = world.roomObjects.filter(e => e.item.ObjectName === 'obj_dockanim');
    if (this.stage === 'done') return;
    const actor = world.dataSource.room.GameObjects.find(e => e.ObjectName === 'obj_undyneencounter1'); this.x = actor.X;
    this.undyne = world.add.image(this.x, 14, 'spr_undyne_starkd:0').setOrigin(0).setAlpha(0).setDepth(100);
    this.shadow = world.add.image(this.x, 14, 'spr_undyne_shad:0').setOrigin(0).setAlpha(0).setDepth(99);
    world.cameras.main.scrollY = 60;
  }
  wait(stage, duration = 0) { this.stage = stage; this.frames = 0; this.duration = duration; }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || w.player.x <= this.x) return false;
    this.locked = true; w.release(); w.sound.play('snd_arrow');
    this.introSpear = w.add.image(this.x + 30, -220, 'spr_undynespear:0').setAngle(-90).setDepth(1000); this.introSpeed = 24;
    const music = w.waterfallMusic;
    if (music) this.fade = w.tweens.add({ targets: music, volume: 0, duration: 20 * 1000 / 30, onComplete: () => { music.destroy(); if (w.waterfallMusic === music) w.waterfallMusic = null; } });
    this.wait('spear'); return true;
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world; this.frames++;
    for (const dock of this.docks) dock.image.setTexture(`${dock.object.Sprite}:${Math.floor(w.time.now / (1000 / 6)) % dock.sprite.TextureCount}`);
    if (this.stage === 'spear') {
      this.introSpeed += .3; this.introSpear.y += this.introSpeed;
      if (this.introSpear.y > 160) {
        this.introSpear.setAngle(0).setTexture('spr_undynespear_stabbed:0'); w.sound.play('snd_impact'); w.cameras.main.shake(1000 / 10, .012);
        for (let i = 0; i < 3; i++) w.colliders.push(createCollider(w.dataSource, { ObjectName: 'obj_solidsmall', X: 40, Y: 180 + i * 20, ScaleX: 1, ScaleY: 1 }));
        this.wait('impact', 50);
      }
    } else if (this.stage === 'impact' && this.frames >= this.duration) this.wait('camera');
    else if (this.stage === 'camera') {
      this.introSpear.alpha = Math.max(0, this.introSpear.alpha - .1); w.cameras.main.scrollY = Math.max(10, w.cameras.main.scrollY - 5);
      if (w.cameras.main.scrollY <= 10) { w.sound.play('mus_fearsting'); this.wait('reveal', 30); }
    } else if (this.stage === 'reveal') {
      this.undyne.alpha = Math.min(1, this.undyne.alpha + .05);
      if (this.frames >= this.duration) {
        this.music = w.sound.add('mus_undynefast', { loop: true }); this.music.play(); w.flags[17] = 1; w.flags[77] = w.armor;
        this.locked = false; this.wait('approach', 6);
      }
    } else if (this.stage === 'approach') {
      this.undyne.y += 4; this.shadow.setPosition(this.undyne.x, this.undyne.y);
      this.undyne.setTexture(`spr_undyne_starkd:${Math.floor(this.frames * .25) % 4}`);
      if (this.frames >= this.duration) { this.generator = new UndyneChaseSpears(); this.wait('chase'); }
    } else if (this.stage === 'chase') {
      const difference = w.player.x - this.undyne.x;
      let move = 0; if (difference > 80) move = 3; else if (difference < -60) move = -3;
      this.undyne.x += move; this.shadow.setPosition(this.undyne.x, this.undyne.y).setAlpha(Math.min(1, this.shadow.alpha + .1));
      const output = this.generator.step({ x: this.undyne.x + 24, y: this.undyne.y + 20, player: { x: w.player.x, y: w.player.y, roomWidth: w.dataSource.room.Width, roomHeight: w.dataSource.room.Height }, moving: move, flags: w.flags,
        touching: spear => { const angle = spear.rotation * Math.PI / 180, x2 = spear.x + 26.5 * Math.cos(angle), y2 = spear.y - 26.5 * Math.sin(angle); return Math.max(spear.x, x2) >= w.player.x && Math.min(spear.x, x2) <= w.player.x + 19 && Math.max(spear.y, y2) >= w.player.y + 19 && Math.min(spear.y, y2) <= w.player.y + 29; } });
      if (output.volley) { w.sound.play('snd_spearappear'); this.armUntil = this.generator.frame + 20; }
      this.undyne.setTexture(`${this.generator.frame < this.armUntil ? 'spr_undyne_starkd_arm' : 'spr_undyne_starkd'}:${Math.floor(this.frames * .2) % 4}`);
      if (output.sound) w.sound.play('snd_squeak');
      for (const spear of this.generator.spears) {
        if (!this.images.has(spear)) this.images.set(spear, w.add.image(spear.x, spear.y, 'spr_undynespear:0').setDepth(500));
        this.images.get(spear).setPosition(spear.x, spear.y).setAngle(-spear.rotation).setAlpha(spear.alpha);
      }
      for (const [spear, image] of this.images) if (!this.generator.spears.includes(spear)) { image.destroy(); this.images.delete(spear); }
      if (output.hit) { this.locked = false; w.release(); window.__remake.startBattle('undyneQuick'); }
    }
  }
  destroy() { this.fade?.stop(); this.music?.destroy(); this.introSpear?.destroy(); this.undyne?.destroy(); this.shadow?.destroy(); for (const image of this.images.values()) image.destroy(); }
}
