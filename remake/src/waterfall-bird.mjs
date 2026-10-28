import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startWaterfallQuietMusic } from './waterfall-music.mjs';

export class WaterfallBird {
  constructor(world, spawnName) {
    this.world = world; this.entry = world.roomObjects.find(e => e.item.ObjectName === 'obj_carrybird');
    this.stage = 'idle'; this.elapsed = 0; this.frame = 0; this.right = spawnName === 'obj_markert' && world.plot > 115;
    if (this.right) this.entry.image.x = 100;
    if (murderLevel(world.flags) >= 10 && !world.flags[27]) { this.entry.image.destroy(); this.entry = null; }
    else { this.sync(); world.colliders.push(this.collider = createCollider(world.dataSource, this.entry.item)); }
    startWaterfallQuietMusic(world);
  }
  sync() {
    const e = this.entry; e.item = { ...e.item, X: e.image.x, Y: e.image.y }; e.image.setDepth(e.image.y + e.sprite.MarginBottom - e.sprite.OriginY);
    if (this.collider) Object.assign(this.collider, createCollider(this.world.dataSource, e.item));
  }
  interact() {
    const w = this.world, e = this.entry;
    if (!e || this.stage !== 'idle' || !inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } })) return false;
    if (w.flags[85] === 1) w.showDialogue(['* (Umbrellas and birds...)\n* (A bad combination.)']);
    else w.showDialogue(['* (This little bird wants to\n  carry you across.)'], { onClose: () => w.showChoice("* (Accept the bird's offer?)", ['Get ride', 'No'], choice => { if (choice === 0) this.start(); }) });
    return true;
  }
  start() {
    const w = this.world; w.release(); this.stage = 'wait'; this.timer = 20; this.music = w.flags[7] === 0 || !w.flags[7] ? w.waterfallMusic : null;
    if (this.music) { this.fade?.stop(); this.volume = this.music.volume; this.fade = w.tweens.add({ targets: this.music, volume: 0, duration: this.volume / .05 * 1000 / 30, onComplete: () => this.music?.pause() }); }
  }
  update(delta) {
    if (!this.entry) return false;
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.stage !== 'idle';
  }
  step() {
    const w = this.world, bird = this.entry.image, p = w.player;
    const flying = this.stage !== 'idle' && this.stage !== 'wait';
    this.frame += flying ? .25 : .1; bird.setTexture(`${flying ? 'spr_smallbird_fly' : 'spr_smallbird'}:${Math.floor(this.frame) % 2}`);
    if (this.stage === 'idle') return;
    if (this.stage === 'approach') { bird.x += this.dx; bird.y += this.dy; if (this.birdsong) this.birdsong.setVolume(Math.min(1, this.birdsong.volume + .02)); }
    if (this.stage === 'lift') bird.y -= .5;
    if (this.stage === 'across') { bird.x += this.right ? .4 : -.4; if (this.timer <= 5 && (this.right ? bird.x < 240 : bird.x > 100)) this.timer++; }
    if (this.stage === 'lower') { bird.y += .5; if (bird.y < 90 && this.timer <= 5) this.timer++; if (bird.y > 90 && this.timer > 5) this.timer--; if (this.birdsong) this.birdsong.setVolume(Math.max(0, this.birdsong.volume - .008)); }
    if (this.stage === 'leave') bird.x += this.right ? -1 : 1;
    if (this.stage === 'land') bird.y += 1;
    if (['struggle', 'across', 'lower'].includes(this.stage)) p.setPosition(Math.round(bird.x), Math.round(bird.y + 15));
    this.sync();
    if (--this.timer > 0) return;
    if (this.stage === 'wait') {
      if (w.flags[7] !== 1) { this.birdsong = w.sound.add('mus_birdsong', { loop: true, volume: 0, rate: 1.1 }); this.birdsong.play(); }
      bird.setTexture('spr_smallbird_fly:0'); this.dx = (p.x - bird.x) / 30; this.dy = (p.y - 10 - bird.y) / 30; this.stage = 'approach'; this.timer = 30;
    } else if (this.stage === 'approach') { bird.setPosition(p.x, p.y - 10); this.stage = 'perch'; this.timer = 25; }
    else if (this.stage === 'perch') { this.stage = 'lift'; this.timer = 10; }
    else if (this.stage === 'lift') { this.stage = 'struggle'; this.timer = 100; }
    else if (this.stage === 'struggle') { this.stage = 'across'; this.timer = 360; }
    else if (this.stage === 'across') { this.stage = 'lower'; this.timer = 100; }
    else if (this.stage === 'lower') { this.birdsong?.destroy(); this.birdsong = null; this.stage = 'rest'; this.timer = 20; }
    else if (this.stage === 'rest') {
      this.stage = 'leave'; this.timer = 30;
      if (this.music) { this.fade?.stop(); this.music.resume(); this.fade = w.tweens.add({ targets: this.music, volume: this.volume, duration: this.volume / .05 * 1000 / 30 }); }
    } else if (this.stage === 'leave') { this.stage = 'land'; this.timer = 10; }
    else if (this.stage === 'land') { bird.setPosition(Math.round(bird.x), Math.round(bird.y)).setTexture('spr_smallbird:0'); this.right = !this.right; this.stage = 'idle'; w.release(); this.sync(); }
  }
  destroy() { this.fade?.stop(); this.birdsong?.destroy(); }
}
