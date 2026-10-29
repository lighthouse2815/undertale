import dialogue from './waterfall-undyne-cutscene.json' with { type: 'json' };

// obj_undyne_echoflower: cảnh đe dọa, chuyển trận giả và Monster Kid xen vào.
export class WaterfallUndyneCutscene {
  constructor(world, hall) {
    this.world = world; this.hall = hall; this.elapsed = 0; this.stage = 'dialogue'; this.timer = 0; this.frame = 0; this.locked = true;
    world.release(); world.showDialogue(dialogue.start, { onClose: () => this.begin() });
  }
  sprite(key, x, y, depth = 0) { return this.world.add.image(x, y, `${key}:0`).setOrigin(0).setDepth(depth); }
  setSprite(image, key, frame = 0) { const sprite = this.world.dataSource.sprites.get(key); image.setTexture(`${key}:${Math.floor(frame) % sprite.TextureCount}`); }
  wait(stage, frames) { this.stage = stage; this.timer = frames; this.frame = 0; }
  say(lines, next, delay = 0) { this.stage = 'dialogue'; this.world.showDialogue(dialogue[lines], { onClose: () => this.wait(next, delay) }); }
  begin() {
    const w = this.world; this.undyne = this.sprite('spr_undynea_r', 520, 80, 100); this.kid = this.sprite('spr_mkid_d', 730, 60, 100).setVisible(false);
    this.wait('pan', 20);
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world, u = this.undyne, kid = this.kid;
    if (this.stage === 'dialogue' || !this.locked) return;
    this.frame++; this.timer--;
    if (this.hall.halo?.active) { this.hall.halo.setAlpha(Math.max(0, this.hall.halo.alpha - .02)); if (this.hall.halo.alpha <= 0) { this.hall.halo.destroy(); this.hall.halo = null; } }
    if (this.stage === 'pan') w.cameras.main.scrollX = Math.max(0, w.cameras.main.scrollX - 5);
    if (this.stage === 'walk1' || this.stage === 'walk2') { u.x++; this.setSprite(u, 'spr_undynea_r', this.frame * .2); }
    if (this.stage === 'rushfade') this.setSprite(u, 'spr_undyne_rushfade', this.frame * .2);
    if (this.stage === 'rushghost') this.ghost.setAlpha(Math.min(1, this.frame * .05));
    if (this.stage === 'rushwalk') { u.x++; this.setSprite(u, 'spr_undyne_rush', this.frame * .2); }
    if (this.stage === 'rushfast') { u.x += 3; this.setSprite(u, 'spr_undyne_rush', this.frame * .5); }
    if (this.stage === 'kidfall') kid.y += 4;
    if (this.stage === 'kidlook') { const key = this.timer > 60 ? 'spr_mkid_l' : this.timer > 40 ? 'spr_mkid_r' : 'spr_mkid_l'; this.setSprite(kid, key); }
    if (this.stage === 'kidlook2') { const key = this.timer > 50 ? 'spr_mkid_r' : this.timer > 30 ? 'spr_mkid_l' : 'spr_mkid_dt'; this.setSprite(kid, key); }
    if (this.stage === 'grab') { u.x += 3; this.setSprite(u, 'spr_undynea_r', this.frame * .25); }
    if (this.stage === 'exit') { u.x -= 2; this.setSprite(u, 'spr_undyne_cheektug', this.frame * .25); }
    if (this.stage === 'panback') w.cameras.main.scrollX += 1;
    if (this.stage === 'exit' && u.x < w.cameras.main.scrollX - 100 && !w.dialogue) { u.destroy(); kid.destroy(); this.undyne = this.kid = null; w.waterfallMusic?.stop(); this.wait('panback', 100); return; }
    if (this.stage === 'flash') {
      const on = Math.floor((this.frame - 1) / 4) % 2 === 0;
      this.flash.setVisible(on); this.heart.setVisible(on).setPosition(w.player.x + 5, w.player.y + 17);
      if (on && (this.frame - 1) % 8 === 0) w.sound.play('snd_noise');
    }
    if (this.timer > 0) return;
    switch (this.stage) {
      case 'pan': w.player.facing = 'l'; this.setSprite(w.player, 'spr_maincharal'); this.wait('pause1', 80); break;
      case 'pause1': this.wait('walk1', 30); break;
      case 'walk1': this.setSprite(u, 'spr_undynea_r'); this.wait('pause2', 40); break;
      case 'pause2': this.wait('walk2', 30); break;
      case 'walk2': this.setSprite(u, 'spr_undynea_r'); this.wait('pause3', 40); break;
      case 'pause3': this.say('threat', 'preRush', 20); break;
      case 'preRush': w.sound.play('snd_grab'); this.wait('rushfade', 40); break;
      case 'rushfade': this.ghost = this.sprite('spr_undyne_rush', u.x, u.y, 101).setAlpha(0); w.sound.play('snd_spearappear'); this.wait('rushghost', 40); break;
      case 'rushghost': this.ghost.destroy(); this.ghost = null; this.wait('rushwalk', 10); break;
      case 'rushwalk': this.setSprite(u, 'spr_undyne_rush'); this.wait('rushpause', 30); break;
      case 'rushpause': this.wait('rushfast', 28); break;
      case 'rushfast': this.setSprite(u, 'spr_undyne_rush'); this.wait('rushstop', 30); break;
      case 'rushstop': this.flash = w.add.rectangle(0, 0, 320, 240, 0).setOrigin(0).setScrollFactor(0).setDepth(99998); this.heart = this.sprite('spr_heartsmall', 0, 0, 99999); this.wait('flash', 24); break;
      case 'flash': this.flash.destroy(); this.heart.destroy(); this.flash = this.heart = null; kid.setVisible(true); w.sound.play('snd_splash'); this.wait('kidfall', 11); break;
      case 'kidfall': this.setSprite(kid, 'spr_mkid_dt'); this.say('help', 'kidpause', 30); break;
      case 'kidpause': this.wait('kidlook', 80); break;
      case 'kidlook': this.setSprite(kid, 'spr_mkid_rt'); this.wait('kidready', 10); break;
      case 'kidready': this.say('cheer', 'kidlook2', 90); break;
      case 'kidlook2': this.say('question', 'grab', 7); break;
      case 'grab': w.sound.play('snd_movemenu'); kid.setVisible(false); this.setSprite(u, 'spr_undyne_cheektug'); this.wait('hold', 20); break;
      case 'hold': this.stage = 'exit'; this.timer = 9999; this.frame = 0; w.showDialogue(dialogue.exit); break;
      case 'panback': w.plot = 118; this.hall.refresh(); w.waterfallMusic?.play({ loop: true, volume: 1, rate: .9 }); this.locked = false; this.stage = 'done'; w.release(); break;
    }
  }
  destroy() { for (const image of [this.undyne, this.kid, this.ghost, this.flash, this.heart]) image?.destroy(); }
}
