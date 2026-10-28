import dialogue from './waterfall-undyne-kid.json' with { type: 'json' };

// obj_undyneencounter2: Undyne nhấc Monster Kid, sau đó Kid nói và chạy đi.
export class WaterfallUndyneKid {
  constructor(world, { undyne, kid, cleanup }) {
    this.world = world; this.undyne = undyne; this.kid = kid; this.cleanup = cleanup;
    this.stage = 'pause'; this.frames = 0; this.elapsed = 0; this.locked = true; world.release();
    if (world.chaseMusic) this.musicFade = world.tweens.add({ targets: world.chaseMusic, volume: 0, duration: 100 * 1000 / 30 });
  }
  destroy() { this.musicFade?.stop(); this.musicFade = null; }
  wait(stage) { this.stage = stage; this.frames = 0; }
  pose(actor, sprite, frame = 0) { actor.setTexture(`${sprite}:${frame}`); }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world, u = this.undyne, kid = this.kid; this.frames++;
    if (this.stage === 'pause' && this.frames >= 90) { u.x = 290; this.wait('approach'); }
    else if (this.stage === 'approach') {
      u.x++; this.pose(u, 'spr_undynea_r', Math.floor(this.frames * .1) % 4);
      if (u.x > 480) { this.pose(u, 'spr_undynea_r'); this.wait('look'); }
    } else if (this.stage === 'look' && this.frames >= 90) this.wait('raise');
    else if (this.stage === 'raise') {
      this.pose(u, 'spr_undynea_r_raise', Math.min(2, Math.floor(this.frames * .2)));
      if (this.frames >= 10) this.wait('hold');
    } else if (this.stage === 'hold' && this.frames >= 20) this.wait('grab');
    else if (this.stage === 'grab') {
      this.pose(u, 'spr_undynea_r_raise', Math.min(5, 2 + Math.floor(this.frames * .5)));
      if (this.frames === 2) w.sound.play('snd_grab');
      if (this.frames >= 6) this.wait('holdKid');
    } else if (this.stage === 'holdKid' && this.frames >= 60) this.wait('lift');
    else if (this.stage === 'lift') {
      this.pose(u, 'spr_undynea_r_raiseup', Math.min(13, 2 + Math.floor(this.frames * .2)));
      if (this.frames >= 55) this.wait('liftPause');
    } else if (this.stage === 'liftPause' && this.frames >= 120) this.wait('lower');
    else if (this.stage === 'lower') {
      this.pose(u, 'spr_undynea_r_raiseup', Math.max(1, 13 - this.frames));
      if (this.frames >= 12) { this.pose(u, 'spr_undynea_r'); this.wait('wait1'); }
    } else if (this.stage === 'wait1' && this.frames >= 30) this.wait('wait2');
    else if (this.stage === 'wait2' && this.frames >= 40) this.wait('wait3');
    else if (this.stage === 'wait3' && this.frames >= 30) this.wait('leave');
    else if (this.stage === 'leave') {
      u.x -= 2; this.pose(u, 'spr_undynea_l', Math.floor(this.frames * .2) % 4);
      if (u.x < 300) { u.destroy(); this.undyne = null; w.flags[17] = 0; this.locked = false; this.wait('waitPlayer'); }
    } else if (this.stage === 'waitPlayer') {
      if (w.player.x + 19 >= 200 && w.player.x <= 220 || w.player.x + 19 >= 780 && w.player.x <= 790) {
        this.locked = true; w.release(); this.left = w.player.x < 400; kid.y = w.player.y > 120 ? 100 : 130;
        this.musicFade?.stop(); this.musicFade = null; w.chaseMusic?.destroy(); w.chaseMusic = null; w.waterfallMusic = w.sound.add('mus_ambientwater', { loop: true, volume: 0 });
        this.wait('kidWalk');
      }
    } else if (this.stage === 'kidWalk') {
      kid.x += this.left ? -4 : 4; this.pose(kid, this.left ? 'spr_mkid_l' : 'spr_mkid_r', Math.floor(this.frames * .2) % 4);
      if (Math.abs(kid.x - w.player.x) < 45) this.wait('kidPause1');
    } else if (this.stage === 'kidPause1' && this.frames >= 20) this.wait('kidPause2');
    else if (this.stage === 'kidPause2' && this.frames >= 20) this.wait('kidPause3');
    else if (this.stage === 'kidPause3' && this.frames >= 20) {
      this.wait('talk'); const ids = [329, 330, 331, 332, ...(w.flags[284] === 1 ? [338, 339, 340, 341] : [333, 334, 335])];
      w.showDialogue(ids.map(id => dialogue[id]), { onClose: () => this.wait('run') });
    } else if (this.stage === 'run') {
      kid.x += 6; this.pose(kid, 'spr_mkid_r', Math.floor(this.frames * .3) % 4);
      if (this.frames >= (this.left ? 7 : 12)) this.wait('trip');
    } else if (this.stage === 'trip') {
      this.pose(kid, 'spr_mkid_trip_r', Math.min(19, Math.floor(this.frames * .334)));
      if (this.frames >= 57) { kid.x += 13; this.pose(kid, 'spr_mkid_r'); this.wait('tripPause'); }
    } else if (this.stage === 'tripPause' && this.frames >= 15) this.wait('runAway');
    else if (this.stage === 'runAway') {
      kid.x += 4; this.pose(kid, 'spr_mkid_r', Math.floor(this.frames * .25) % 4);
      if (this.frames >= 30) { w.plot = 110; w.flags[15] = 0; w.flags[16] = 0; w.waterfallMusic?.play(); w.waterfallMusic?.setVolume(.8); this.locked = false; this.cleanup(); this.wait('done'); }
    }
  }
}
