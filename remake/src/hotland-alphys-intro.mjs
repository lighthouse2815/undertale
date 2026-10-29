import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import text from './hotland-alphys-intro.json' with { type: 'json' };

const range = (first, last) => Array.from({ length: last - first + 1 }, (_, i) => first + i);
const mettatonPoses = ['talk', 'wave', 'holdarm', 'clap', 'pointingup', 'cackle', 'silent', 'silent_behind'];

// obj_alphystrigger1: gặp Alphys, màn giới thiệu chương trình và hậu cảnh sau quiz.
export class HotlandAlphysIntro {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.locked = false; this.stage = world.plot > 125 || murderLevel(world.flags) >= 12 ? 'done' : 'waiting';
    this.trigger = world.dataSource.room.GameObjects.find(item => item.ObjectName === 'obj_alphystrigger1');
    this.slidingFrame = world.roomObjects.find(e => e.item.ObjectName === 'obj_slidingdoor'); this.slide = 0; this.slideDirection = 0;
    this.slidingFrame.image.setDepth(-100000); this.slidingPanel = this.sprite('spr_slidingdoor', 880, 40).setDepth(-100001);
    world.colliders.push(createCollider(world.dataSource, { ObjectName: 'obj_solidsmall', X: 888, Y: 80, ScaleX: 1, ScaleY: 1 }));
    this.hole = world.roomObjects.find(e => e.item.ObjectName === 'obj_mettwallhole'); this.hole.image.setDepth(-100000).setVisible(world.plot >= 126 || murderLevel(world.flags) >= 12);
    if (this.stage === 'waiting') this.darkness = this.sprite('spr_darkhalo_big', world.player.x - 10, world.player.y - 5).setAlpha(.5).setDepth(99000);
    this.confetti = [];
    const key = world.flags[7] === 1 ? 'mus_reunited' : world.plot > 125 && (world.flags[493] ?? 0) < 11 && murderLevel(world.flags) < 12 ? 'mus_lab' : 'mus_drone';
    world.labMusic = world.sound.add(key, { loop: true, volume: key === 'mus_drone' ? .5 : 1, rate: key === 'mus_drone' ? .5 : 1 }); world.labMusic.play();
  }
  sprite(key, x, y) { const d = this.world.dataSource.sprites.get(key); return this.world.add.image(x, y, `${key}:0`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height).setDepth(y + d.Height); }
  pose(actor, key, frame = 0) { const d = this.world.dataSource.sprites.get(key); actor.setTexture(`${key}:${Math.min(d.TextureCount - 1, Math.floor(frame) % d.TextureCount)}`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height); }
  wait(stage, frames = 0) { this.stage = stage; this.timer = frames; this.frame = 0; }
  door(open) { this.slideDirection = open ? 1 : -1; this.world.sound.play(open ? 'snd_elecdoor_open' : 'snd_elecdoor_close'); }
  say(ids, next, { alphys = true, emotion = 0, onPage } = {}) {
    const w = this.world, pages = ids.map(id => text[`obj_alphystrigger1_${id}`]); this.stage = 'dialogue'; this.emotion = emotion;
    w.showDialogue(pages.map(p => p.text), { portrait: alphys ? `spr_alphysface_${emotion}` : false, onPage: i => {
      const page = pages[i];
      if (alphys) { this.emotion = page.emotion ?? this.emotion; w.setDialoguePortrait(`spr_alphysface_${this.emotion}`); }
      if (this.mettaton && page.mettaton !== undefined) this.mettatonPose = `spr_mettaton_${mettatonPoses[page.mettaton]}`;
      onPage?.(i);
    }, onClose: () => this.wait(next) });
  }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 8)) return false;
    this.locked = true; w.release(); w.flags[20] = 0; this.cameraStart = w.cameras.main.scrollX;
    this.actor = this.sprite('spr_alphys_d', 890, 45).setDepth(-99999); this.actorPose = 'spr_alphys_d';
    this.musicFade = w.tweens.add({ targets: w.labMusic, volume: 0, duration: 1000 / 3 }); this.wait('pan', 50); return true;
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world; this.frames++;
    this.darkness?.setPosition(w.player.x - 10, w.player.y - 5);
    if (this.slideDirection) {
      this.slide = Math.max(0, Math.min(40, this.slide + this.slideDirection * 5)); this.slidingPanel.x = 880 + this.slide;
      if (this.slide === 0 || this.slide === 40) { this.slideDirection = 0; w.sound.play('snd_elecdoor_shut'); }
    }
    for (const belt of w.roomObjects.filter(e => e.item.ObjectName === 'obj_alphysconveyor')) {
      const key = 'spr_conveyorbelt_d_blue', count = w.dataSource.sprites.get(key).TextureCount;
      belt.image.setTexture(`${key}:${(belt.item.X < 550 ? this.frames : -this.frames % count + count) % count}`).setScale(1, 4.8).setDepth(-50000);
    }
    if (this.mettaton) this.pose(this.mettaton, this.mettatonPose ?? 'spr_mettaton_talk', this.frames * (this.stage === 'applause' ? .5 : .2));
    this.stepConfetti();
    if (!this.locked) return;
    if (this.stage === 'dialogue') {
      if (this.fidget) { if (this.frames % 9 === 0) this.actorPose = `spr_alphys_${['l','r','u','d'][Math.floor(Math.random() * 4)]}`; this.pose(this.actor, this.actorPose, this.frames * .334); }
      return;
    }
    this.frame++; this.timer--;
    if (this.stage === 'pan') {
      w.cameras.main.scrollX += 2;
      if (this.timer <= 0) this.wait('doorWait', 30);
    } else if (this.stage === 'doorWait' && this.timer <= 0) { this.door(true); this.wait('emergeWait', 15); }
    else if (this.stage === 'emergeWait' && this.timer <= 0) { this.actor.setDepth(this.actor.y + 34); this.wait('emerge'); }
    else if (this.stage === 'emerge') {
      this.actor.y += 2; this.actor.setDepth(this.actor.y + 34); this.pose(this.actor, 'spr_alphys_d', this.frame * .2);
      if (this.frame === 15) this.door(false);
      if (this.frame >= 15 && this.actor.y >= w.player.y - 4) { this.pose(this.actor, 'spr_alphys_d'); this.wait('lightsWait', 60); }
    } else if (this.stage === 'lightsWait' && this.timer <= 0) { w.sound.play('snd_noise'); this.darkness?.destroy(); this.darkness = null; this.wait('lookWait', 80); }
    else if (this.stage === 'lookWait' && this.timer <= 0) this.wait('walkLeft', 25);
    else if (this.stage === 'walkLeft') {
      this.actor.x -= 3; this.pose(this.actor, 'spr_alphys_l', this.frame * .2);
      if (this.timer <= 0) { this.pose(this.actor, 'spr_alphys_l'); this.exclamation = this.sprite('spr_exc', this.actor.x, this.actor.y - 6); w.sound.play('snd_b'); this.wait('surprised', 60); }
    } else if (this.stage === 'surprised' && this.timer <= 0) {
      this.exclamation.destroy(); this.exclamation = null; this.pose(this.actor, 'spr_alphys_freaked'); this.say([166], 'flustered', { emotion: 3 });
    } else if (this.stage === 'flustered') { this.fidget = true; this.say([175,176], 'calm'); }
    else if (this.stage === 'calm') { this.fidget = false; this.wait('calming', 100); }
    else if (this.stage === 'calming') {
      this.pose(this.actor, this.actorPose, this.frames * Math.max(0, .334 - this.frame * .0033));
      if (this.timer <= 0) { this.pose(this.actor, 'spr_alphys_lt'); this.wait('introduceWait', 50); }
    } else if (this.stage === 'introduceWait' && this.timer <= 0) {
      this.playLab(); const memory = Number(localStorage.getItem('undertale-remake-alphys-date') ?? 0) > 0;
      this.say([...range(224,231), memory ? 237 : 236, ...range(238,257)], 'musicFade');
    } else if (this.stage === 'musicFade') this.wait('fadeLab', 34);
    else if (this.stage === 'fadeLab') { w.labMusic.setVolume(Math.max(0, 1 - this.frame * .03)); if (this.timer <= 0) { w.labMusic.stop(); this.wait('firstSmash', 60); } }
    else if (this.stage === 'firstSmash' && this.timer <= 0) { this.smash(.25, 2); this.wait('firstReaction', 30); }
    else if (this.stage === 'firstReaction' && this.timer <= 0) this.say([288], 'secondSmashWait', { emotion: 1 });
    else if (this.stage === 'secondSmashWait') this.wait('secondSmash', 30);
    else if (this.stage === 'secondSmash' && this.timer <= 0) { this.smash(.4, 3); this.wait('secondReaction', 30); }
    else if (this.stage === 'secondReaction' && this.timer <= 0) this.say([312], 'smashRunWait');
    else if (this.stage === 'smashRunWait') { this.smashCount = 0; this.wait('smashRun', 30); }
    else if (this.stage === 'smashRun' && this.timer <= 0) {
      if (this.smashCount < 5) { this.smash(.5 + this.smashCount++ * .1, 4); this.wait('smashRun', 30); }
      else this.say([344], 'blastWait', { emotion: 3 });
    } else if (this.stage === 'blastWait') this.wait('blast', 20);
    else if (this.stage === 'blast' && this.timer <= 0) { w.sound.play('snd_laz'); this.white = w.add.rectangle(0,0,320,240,0xffffff).setOrigin(0).setScrollFactor(0).setDepth(99990).setAlpha(0); this.wait('white', 40); }
    else if (this.stage === 'white') { this.white.setAlpha(Math.min(1, this.frame / 12)); if (this.timer <= 0) { this.black = w.add.rectangle(0,0,320,240,0x000000).setOrigin(0).setScrollFactor(0).setDepth(99991).setAlpha(0); this.wait('black', 50); } }
    else if (this.stage === 'black') { this.black.setAlpha(Math.min(1, this.frame * .02)); if (this.timer <= 0) this.wait('revealWait', 30); }
    else if (this.stage === 'revealWait' && this.timer <= 0) {
      this.white.destroy(); this.white = null; w.player.y = this.actor.y = 120; w.player.facing = 'u'; w.player.setTexture('spr_maincharau:0'); this.pose(this.actor, 'spr_alphys_u');
      this.mettaton = this.sprite('spr_mettaton_talk', 760, 60).setDepth(99992); this.hole.image.setVisible(true);
      this.logo = this.sprite('spr_gameshowlogo', 720, -40).setDepth(99993); this.say([393,394], 'drumWait', { alphys: false });
    } else if (this.stage === 'drumWait') this.wait('drum', 20);
    else if (this.stage === 'drum' && this.timer <= 0) { w.sound.play('snd_drumroll'); this.wait('reveal', 50); }
    else if (this.stage === 'reveal' && this.timer <= 0) {
      w.sound.play('snd_bell'); this.black.destroy(); this.black = null;
      this.shadow = w.add.rectangle(0,0,320,240,0x000000).setOrigin(0).setScrollFactor(0).setDepth(99991); this.wait('announce', 30);
    } else if (this.stage === 'announce' && this.timer <= 0) this.say([441], 'showStart', { alphys: false });
    else if (this.stage === 'showStart') {
      w.sound.play('mus_mett_cheer'); this.showMusic = w.sound.add('mus_mtgameshow', { loop: true }); this.showMusic.play();
      this.shadow.setAlpha(.95); this.disco = [60,240].map(x => this.sprite('spr_discoball', w.cameras.main.scrollX + x, -37).setDepth(99993)); this.wait('showIn', 51);
    } else if (this.stage === 'showIn') {
      this.shadow.setAlpha(Math.max(.7, .95 - this.frame * .005)); this.logo.y = Math.min(0, this.logo.y + 1); this.addConfetti(2);
      for (const ball of this.disco) { ball.y = Math.min(0, ball.y + 1); this.pose(ball, 'spr_discoball', this.frames * .334); }
      if (this.timer <= 0) this.say([468,469], 'clapStart', { alphys: false });
    } else if (this.stage === 'clapStart') { w.sound.play('mus_mett_applause'); w.flags[20] = 3; this.mettatonPose = 'spr_mettaton_clap'; this.wait('applause', 90); }
    else if (this.stage === 'applause') { this.addConfetti(1, true); if (this.timer <= 0) { this.mettatonPose = 'spr_mettaton_talk'; this.say([493,494,495,496], 'lastDrum', { alphys: false }); } }
    else if (this.stage === 'lastDrum') { w.sound.play('snd_drumroll'); this.wait('threatWait', 60); }
    else if (this.stage === 'threatWait' && this.timer <= 0) { this.showMusic?.stop(); w.flags[20] = 5; this.mettatonPose = 'spr_mettaton_cackle'; this.say([514], 'startBattle', { alphys: false }); }
    else if (this.stage === 'startBattle') {
      this.clearShow(); this.wait('battle'); w.release(); window.__remake.startBattle('mettatonQuiz');
    } else if (this.stage === 'battle') { this.wait('afterBattle', 20); }
    else if (this.stage === 'afterBattle' && this.timer <= 0) { w.flags[462] = 0; this.pose(this.actor, 'spr_alphys_l'); this.say([566,567], 'returnCamera', { emotion: 1 }); }
    else if (this.stage === 'returnCamera') this.wait('panBack', 50);
    else if (this.stage === 'panBack') {
      w.cameras.main.scrollX = Math.max(this.cameraStart, w.cameras.main.scrollX - 2);
      if (this.timer <= 0) { this.playLab(); w.plot = 126; this.locked = false; this.stage = 'done'; w.release(); this.makeNpc(); }
    }
  }
  playLab() { const w = this.world; this.musicFade?.stop(); w.labMusic?.destroy(); w.labMusic = w.sound.add('mus_lab', { loop: true }); w.labMusic.play(); }
  smash(volume, height) {
    const w = this.world; w.sound.play('mus_mettsmash', { volume }); w.cameras.main.shake(1000 / 15, height / 320);
    this.bounces ??= [];
    for (const actor of [this.actor, w.player]) this.bounces.push(w.tweens.add({ targets: actor, y: actor.y - height, duration: 80, yoyo: true }));
  }
  addConfetti(count, contestant = false) {
    const w = this.world;
    for (let i = 0; i < count; i++) this.confetti.push({ image: this.sprite('spr_confetti', contestant ? w.player.x + Math.random() * 20 : w.cameras.main.scrollX + Math.random() * 320, -10).setDepth(99994).setTint(Math.floor(Math.random() * 0xffffff)), vx: (Math.random() - .5) * (contestant ? 2 : 6), vy: 2 + Math.random() * 3, age: 0 });
  }
  stepConfetti() {
    for (const p of this.confetti) { p.age++; p.image.x += p.vx + Math.sin(p.age / 3) * 2; p.image.y += p.vy; this.pose(p.image, 'spr_confetti', p.age * .2); if (p.age > 80) p.image.setAlpha(Math.max(0, (100 - p.age) / 20)); if (p.age >= 100) p.image.destroy(); }
    this.confetti = this.confetti.filter(p => p.image.active);
  }
  makeNpc() {
    const w = this.world, item = { ObjectName: 'obj_alphys_npc', X: this.actor.x, Y: this.actor.y, ScaleX: 1, ScaleY: 1 };
    const object = w.dataSource.objects.get(item.ObjectName), sprite = w.dataSource.sprites.get(object.Sprite);
    this.npc = { item, object, sprite, image: this.actor, interactable: true }; w.roomObjects.push(this.npc); w.colliders.push(createCollider(w.dataSource, item));
  }
  interact() {
    if (!this.npc || !inInteractionRange(this.world, this.npc)) return false;
    this.world.showDialogue([text.obj_alphys_npc_76.text, text.obj_alphys_npc_77.text], { portrait: 'spr_alphysface_8' }); return true;
  }
  clearShow() { for (const tween of this.bounces ?? []) tween.stop(); this.bounces = []; this.mettaton?.destroy(); this.mettaton = null; this.logo?.destroy(); this.logo = null; this.shadow?.destroy(); this.shadow = null; for (const ball of this.disco ?? []) ball.destroy(); this.disco = []; for (const p of this.confetti) p.image.destroy(); this.confetti = []; this.showMusic?.destroy(); this.showMusic = null; }
  destroy() { this.musicFade?.stop(); for (const tween of this.bounces ?? []) tween.stop(); this.clearShow(); this.actor?.destroy(); this.darkness?.destroy(); this.slidingPanel.destroy(); this.white?.destroy(); this.black?.destroy(); this.exclamation?.destroy(); }
}
