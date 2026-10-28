import { grillbyDateDialogue as d, grillbyMealChoice, grillbyBrotherChoice, grillbyKetchupChoice, grillbyFlowerChoice } from './grillby-date-dialogue.mjs';

// obj_grillbynpc_sansdate: Sans dẫn Frisk vào quán và nói chuyện tại quầy.
export class GrillbyDate {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.locked = world.flags[89] === 1; this.stage = this.locked ? 'arrivalWait' : 'done';
    if (!this.locked) return;
    const item = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_grillbynpc_sansdate');
    this.sans = this.actor(item.X, item.Y, 'spr_sans_u'); this.grillby = world.grillbyNpcs.npcs.find((e) => e.name === 'grillbynpc_grillby');
    this.counter = this.actor(92, 65, 'spr_grillbycounter', -199990); this.grillbyNpcs = world.grillbyNpcs; this.grillbyNpcs.suspended = true;
    world.player.y = 200; world.player.facing = 'u'; world.release();
  }
  actor(x, y, key, depth) {
    const w = this.world, sprite = w.dataSource.sprites.get(key);
    return w.add.image(x, y, `${key}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(depth ?? y + sprite.Height);
  }
  pose(key, frame = 0) { const sprite = this.world.dataSource.sprites.get(key); this.sans.setTexture(`${key}:${frame % sprite.TextureCount}`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(this.sans.y + sprite.Height); }
  grillbyPose(key, frame = 0) { const sprite = this.world.dataSource.sprites.get(key); this.grillby.image.setTexture(`${key}:${frame % sprite.TextureCount}`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height); }
  playerPose(direction, frame = 0) { const w = this.world, sprite = w.dataSource.sprites.get(`spr_mainchara${direction}`); w.player.facing = direction; w.player.setTexture(`spr_mainchara${direction}:${frame % sprite.TextureCount}`).setDepth(w.player.y + sprite.Height); }
  wait(stage, duration = 0) { this.stage = stage; this.frames = 0; this.duration = duration; }
  show(lines, next, speaker = 'sans') {
    const w = this.world; this.wait('talking');
    w.showDialogue(lines, { portrait: speaker === 'sans' ? 'spr_face_sans' : false, onPage: () => {
      if (speaker === 'sans') w.dialogueText.setFont('fnt_comicsans', 10);
    }, onClose: next });
  }
  choice(prompt, options, choose) { this.wait('choice'); this.world.showChoice(prompt, options, choose); }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  step() {
    if (!this.locked) return;
    const w = this.world; this.frames++;
    if (this.stage === 'arrivalWait' && this.frames >= 30) this.show([d.arrival[0]], () => this.show([d.arrival[1]], () => this.wait('walkUp1', 12)));
    else if (this.stage === 'walkUp1') {
      this.sans.y -= 2; w.player.y -= 2; this.pose('spr_sans_u', Math.floor(this.frames * .2)); this.playerPose('u', Math.floor(this.frames * .2));
      if (this.frames >= 12) { this.pose('spr_sans_l'); if (w.flags[53] !== 1) this.show(d.dogs, () => this.wait('walkRight', 11), 'other'); else this.wait('noDogs', 20); }
    } else if (this.stage === 'noDogs' && this.frames >= 20) this.wait('walkRight', 11);
    else if (this.stage === 'walkRight') {
      this.sans.x += 3; w.player.x += 1; this.pose('spr_sans_r', Math.floor(this.frames * .2)); this.playerPose('r', Math.floor(this.frames * .2));
      if (this.frames >= 11) this.show(d.patrons, () => this.wait('walkUp2', 26), 'other');
    } else if (this.stage === 'walkUp2') {
      this.sans.y -= 2; w.player.y -= 3; this.pose('spr_sans_u', Math.floor(this.frames * .2)); this.playerPose('u', Math.floor(this.frames * .2));
      if (this.frames >= 26) this.show([d.brunch[0]], () => this.show(d.brunch.slice(1), () => { w.sound.play('mus_rimshot'); this.pose('spr_sans_shrug2'); this.wait('rimshot', 44); }), 'other');
    } else if (this.stage === 'rimshot' && this.frames >= 44) this.show(d.seat, () => { w.player.x = 177; this.sans.x += 2; this.wait('sit'); });
    else if (this.stage === 'sit') {
      if (this.sans.y > 74) { this.sans.y--; this.pose('spr_sans_u', Math.floor(this.frames * .25)); } else this.pose('spr_sans_stool_u');
      if (w.player.y > 73) { w.player.y--; this.playerPose('u', Math.floor(this.frames * .25)); }
      if (w.player.y <= 73 && this.sans.y <= 74) { this.sans.y = 74; w.grillbyMusic?.pause(); this.whoopee = w.sound.add('mus_whoopee'); this.whoopee.play(); this.wait('whoopee', 60); }
    } else if (this.stage === 'whoopee' && this.frames >= 60) {
      this.whoopee?.destroy(); this.whoopee = null; if (w.grillbyMusic?.isPaused) w.grillbyMusic.resume(); this.pose('spr_sans_stool_l');
      this.show(d.order, () => this.choice('* whaddya want...?', ['Fries', 'Burger'], (c) => { const result = grillbyMealChoice(c); w.flags[391] = result.foodFlag; this.show(result.pages, () => { this.pose('spr_sans_stoolcomb'); this.wait('grillbyLeft', 37); }); }));
    } else if (this.stage === 'grillbyLeft') {
      this.grillby.image.x -= 3; this.grillbyPose('spr_grillby_l', Math.floor(this.frames * .25)); this.pose('spr_sans_stoolcomb', Math.floor(this.frames * .1));
      if (this.frames >= 37) this.wait('grillbyUp', 15);
    } else if (this.stage === 'grillbyUp') {
      this.grillby.image.y -= 2; this.grillbyPose('spr_grillby_u', Math.floor(this.frames * .25));
      if (this.frames >= 15) { this.grillby.image.setVisible(false); w.sound.play('snd_chug'); this.wait('cooking', 90); }
    } else if (this.stage === 'cooking' && this.frames >= 90) {
      this.pose('spr_sans_stool_l'); this.show(d.brother, () => this.choice('* of my brother?', ['Cool', 'Uncool'], (c) => this.show(grillbyBrotherChoice(c), () => { this.grillby.image.setVisible(true); this.wait('grillbyDown', 15); })));
    } else if (this.stage === 'grillbyDown') {
      this.grillby.image.y += 2; this.grillbyPose('spr_grillby_d', Math.floor(this.frames * .25)); if (this.frames >= 15) this.wait('grillbyRight', 47);
    } else if (this.stage === 'grillbyRight') {
      this.grillby.image.x += 3; this.grillbyPose('spr_grillby_r', Math.floor(this.frames * .25));
      if (this.frames >= 47) { const key = w.flags[391] === 1 ? 'spr_sansfries' : 'spr_sansburger'; this.food = [this.actor(192, 72, key, 200), this.actor(208, 72, key, 200)]; this.pose('spr_sans_stool_u'); this.wait('foodWait', 45); }
    } else if (this.stage === 'foodWait' && this.frames >= 45) this.wait('grillbyReturn', 12);
    else if (this.stage === 'grillbyReturn') {
      this.grillby.image.x -= 3; this.grillbyPose('spr_grillby_l', Math.floor(this.frames * .25));
      if (this.frames >= 12) { this.grillbyPose('spr_npc_grillby'); this.show(d.food, () => this.choice('* want some ketchup?', ['Yes', 'No'], (c) => { const result = grillbyKetchupChoice(c); this.drink = result.drink; this.pose('spr_sans_stool_chup'); this.show(result.pages, () => this.wait(this.drink ? 'drink' : 'ketchup', this.drink ? 45 : 1)); })); }
    } else if (this.stage === 'drink') {
      const frame = Math.min(9, Math.floor(this.frames / 5)); this.pose('spr_sans_stool_chup', frame);
      if (this.frames % 5 === 1 && [1,3,5,7].includes(Math.floor((this.frames + 4) / 5))) w.sound.play('snd_swallow');
      if (this.frames >= 45) this.wait('drinkWait', 40);
    } else if (this.stage === 'drinkWait' && this.frames >= 40) { this.pose('spr_sans_stool_buttscratch'); this.wait('afterFood', 90); }
    else if (this.stage === 'ketchup' && this.frames >= this.duration) {
      this.pose('spr_sans_stool_l'); this.show(d.spilled, () => { this.food[0].setTexture(`${this.food[0].texture.key.split(':')[0]}:1`); this.show(d.offerFood, () => { this.pose('spr_sans_stool_buttscratch'); this.wait('afterFood', 90); }); }, 'other');
    } else if (this.stage === 'afterFood' && this.frames >= 90) { this.pose('spr_sans_stool_l'); this.show(d.papyrus, () => this.wait('quiet', 108)); }
    else if (this.stage === 'quiet' && this.frames >= 108) { w.grillbyMusic?.pause(); this.show(d.ask, () => this.wait('darkWait', 30)); }
    else if (this.stage === 'darkWait' && this.frames >= 30) {
      w.sound.play('snd_noise'); this.dark = this.actor(0, 0, 'spr_grillbyshadow', 9999).setAlpha(.8); this.wait('dark', 60);
    } else if (this.stage === 'dark' && this.frames >= 60) {
      this.mystery = w.sound.add('mus_mysteriousroom2', { loop: true }); this.mystery.play(); this.mystery.setVolume(.4);
      this.choice('* have you ever heard\n  of a talking flower?', ['Yes', 'No'], (c) => this.show(grillbyFlowerChoice(c), () => { this.dark.destroy(); this.dark = null; this.mystery.destroy(); this.mystery = null; if (w.grillbyMusic?.isPaused) w.grillbyMusic.resume(); this.wait('returnMusic', 50); }));
    } else if (this.stage === 'returnMusic' && this.frames >= 50) this.show(d.break, () => this.wait('billWait', 30));
    else if (this.stage === 'billWait' && this.frames >= 30) this.show(d.bill, () => this.choice("* it's just 10000G.", ['Yes', 'No'], () => this.show(d.tab, () => this.wait('leaveDown', 50))));
    else if (this.stage === 'leaveDown') {
      this.sans.y += 2; this.pose('spr_sans_d', Math.floor(this.frames * .25)); if (this.frames >= 50) this.wait('leaveLeft', 20);
    } else if (this.stage === 'leaveLeft') {
      this.sans.x -= 2; this.pose('spr_sans_l', Math.floor(this.frames * .25)); if (this.frames >= 20) this.wait('leavePause', 20);
    } else if (this.stage === 'leavePause' && this.frames >= 20) this.show(d.farewell, () => this.wait('leaveFinal', 20));
    else if (this.stage === 'leaveFinal') {
      this.sans.y += 2; this.pose('spr_sans_d', Math.floor(this.frames * .25));
      if (this.frames >= 20) { w.flags[89] = 2; this.sans.setVisible(false); this.wait('playerRise', 30); }
    } else if (this.stage === 'playerRise') {
      w.player.y += 1;
      if (this.frames >= 30) { this.grillbyNpcs.sansmode = true; this.grillbyNpcs.suspended = false; this.locked = false; this.wait('done'); w.release(); }
    }
  }
  destroy() { this.sans?.destroy(); this.counter?.destroy(); this.dark?.destroy(); this.mystery?.destroy(); this.whoopee?.destroy(); this.food?.forEach((e) => e.destroy()); if (this.grillbyNpcs) this.grillbyNpcs.suspended = false; }
}
