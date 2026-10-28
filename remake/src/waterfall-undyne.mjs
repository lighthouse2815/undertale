import { touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { waterfallUndyneReport, waterfallUndyneReportEnd, waterfallUndyneKid } from './waterfall-undyne-dialogue.mjs';

// obj_undyne1: Papyrus báo cáo, Undyne phát hiện Frisk và Monster Kid đuổi theo.
export class WaterfallUndyne {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.locked = false; this.stage = world.plot > 105 ? 'done' : 'waiting';
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_undyne1');
    if (this.stage === 'done') return;
    this.kid = this.actor(260, 275, 'spr_mkid_r'); this.undyne = this.actor(260, 100, 'spr_undynea_starku');
    this.undyneShadow = this.actor(260, 100, 'spr_undyne_shad', this.undyne.depth - 1);
    this.papyrus = this.actor(60, 110, 'spr_papyrus_r_stark'); this.papyrus.setVisible(world.flags[67] !== 1);
    world.flags[20] = 1;
  }
  actor(x, y, key, depth) { const w = this.world, s = w.dataSource.sprites.get(key); return w.add.image(x, y, `${key}:0`).setOrigin(s.OriginX / s.Width, s.OriginY / s.Height).setDepth(depth ?? y + s.Height); }
  pose(image, key, frame = 0) { const s = this.world.dataSource.sprites.get(key); image.setTexture(`${key}:${frame % s.TextureCount}`).setDepth(image.y + s.Height); }
  wait(stage, duration = 0) { this.stage = stage; this.frames = 0; this.duration = duration; }
  show(pages, next, papyrus = false) {
    const w = this.world; this.wait('talking');
    w.showDialogue(pages.map((p) => p.text), { onPage: (i) => {
      if (papyrus) { w.dialogueText.setFont('fnt_papyrus', 8); if ((i === 12 || i === 13) && this.papyrus.x < this.papTalkX + 60) this.papyrus.x++; }
    }, onClose: next });
    if (papyrus) { w.dialogueBox.y = 160; w.dialogueText.y = 168; }
  }
  checkTrigger() {
    const w = this.world; if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 999)) return false;
    this.locked = true; w.player.x -= 3; this.originY = w.cameras.main.scrollY; w.release();
    this.fadeMusic = w.waterfallMusic; w.waterfallMusic = null; this.wait('start', 10); return true;
  }
  checkWalk(previous) {
    const w = this.world, p = w.player;
    if (this.stage === 'watch' && (p.x !== previous.x || p.y !== previous.y)) {
      this.walkCount = (this.walkCount ?? 0) + 1; if (this.walkCount > 5) { p.setPosition(previous.x, previous.y); this.locked = true; w.release(); this.wait('noticePause', 4); return true; }
    }
    if (this.stage === 'escape' && ((p.x <= 80 && p.x + 19 >= 60) || (p.x <= 440 && p.x + 19 >= 430))) {
      this.locked = true; w.release(); this.left = p.x < 200; this.kid.y = p.y > 276 ? 260 : 286; this.up = p.y <= 276;
      this.wait('kidRun', this.left ? 36 : 28); return true;
    }
    return false;
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  step() {
    if (this.stage === 'done' || this.stage === 'waiting') return;
    const w = this.world, camera = w.cameras.main; this.frames++;
    if (this.fadeMusic) { this.fadeMusic.setVolume(Math.max(0, this.fadeMusic.volume - .02)); if (this.fadeMusic.volume <= .01) { this.fadeMusic.destroy(); this.fadeMusic = null; } }
    if (this.undyneShadow?.active && this.undyne?.active) this.undyneShadow.setPosition(this.undyne.x, this.undyne.y).setDepth(this.undyne.depth - 1).setAlpha(this.undyne.alpha);
    if (this.stage === 'start' && this.frames >= 10) this.wait('panUp');
    else if (this.stage === 'panUp') {
      camera.scrollY = Math.max(80, camera.scrollY - 2);
      if (camera.scrollY <= 80) { if (w.flags[67] === 1) { this.playScary(); this.wait('noPapyrus', 240); } else this.wait('papEnter', 50); }
    } else if (this.stage === 'papEnter') {
      this.papyrus.x += 2; this.pose(this.papyrus, 'spr_papyrus_r_stark', Math.floor(this.frames * .25));
      if (this.frames >= 50) { this.pose(this.papyrus, 'spr_papyrus_r_stark'); this.wait('reportPause', 40); }
    } else if (this.stage === 'reportPause' && this.frames >= 40) { this.playScary(); this.papTalkX = this.papyrus.x; this.show(waterfallUndyneReport, () => { this.pose(this.undyne, 'spr_undynea_starkl'); this.wait('papBack', 40); }, true); }
    else if (this.stage === 'papBack') { this.papyrus.x -= .5; this.pose(this.papyrus, 'spr_papyrus_l_stark', Math.floor(this.frames * .25)); if (this.frames >= 40) this.wait('reportEndPause', 90); }
    else if (this.stage === 'reportEndPause' && this.frames >= 90) this.show(waterfallUndyneReportEnd, () => { w.flags[20] = 3; this.wait('panDown'); }, true);
    else if (this.stage === 'noPapyrus' && this.frames >= 240) this.wait('panDown');
    else if (this.stage === 'panDown') {
      if (this.papyrus.visible) { this.papyrus.x -= 3; this.pose(this.papyrus, 'spr_papyrus_l_stark', Math.floor(this.frames * .25)); }
      if (this.music) this.music.setVolume(Math.max(0, this.music.volume - .02));
      camera.scrollY = Math.min(this.originY, camera.scrollY + 2);
      if (camera.scrollY >= this.originY) { this.music?.destroy(); this.music = null; this.locked = false; this.wait('watch'); w.release(); }
    } else if (this.stage === 'noticePause' && this.frames >= 4) this.wait('noticePan');
    else if (this.stage === 'noticePan') {
      camera.scrollY = Math.max(80, camera.scrollY - 10);
      if (camera.scrollY <= 80) { this.pose(this.undyne, 'spr_undyne_starkd'); this.icon = this.actor(this.undyne.x + 10, this.undyne.y - 10, 'spr_exc', 9999); w.sound.play('snd_b'); this.wait('notice', 20); }
    } else if (this.stage === 'notice' && this.frames >= 20) { this.icon.destroy(); this.icon = null; this.music = w.sound.add('mus_undynetheme', { loop: true }); this.music.play(); this.wait('noticeWait', 20); }
    else if (this.stage === 'noticeWait' && this.frames >= 20) this.wait('approach1', 30);
    else if (this.stage === 'approach1') { this.undyne.y += .5; this.pose(this.undyne, 'spr_undyne_starkd', Math.floor(this.frames * .2)); if (this.frames >= 30) this.wait('approachPause', 50); }
    else if (this.stage === 'approachPause' && this.frames >= 50) this.wait('approach2', 20);
    else if (this.stage === 'approach2') { this.undyne.y += .5; this.pose(this.undyne, 'spr_undyne_starkd', Math.floor(this.frames * .2)); if (this.frames >= 20) this.wait('throwWait', 60); }
    else if (this.stage === 'throwWait' && this.frames >= 60) this.wait('throw', 27);
    else if (this.stage === 'throw') { this.pose(this.undyne, 'spr_undyne_throw', Math.min(9, Math.floor(this.frames / 3))); if (this.frames >= 27) this.wait('aim', 100); }
    else if (this.stage === 'aim' && this.frames >= 100) this.wait('aimFinish', 86);
    else if (this.stage === 'aimFinish') { this.pose(this.undyne, 'spr_undyne_throw', Math.min(13, 10 + Math.floor(this.frames * .035))); if (this.frames >= 86) this.wait('aimHold', 30); }
    else if (this.stage === 'aimHold' && this.frames >= 30) this.wait('lower', 16);
    else if (this.stage === 'lower') { this.pose(this.undyne, 'spr_undyne_throw', Math.max(1, 9 - Math.floor(this.frames * .5))); if (this.frames >= 16) { this.pose(this.undyne, 'spr_undyne_starkd'); this.wait('withdrawWait', 60); } }
    else if (this.stage === 'withdrawWait' && this.frames >= 60) this.wait('withdraw', 20);
    else if (this.stage === 'withdraw') { this.undyne.y -= 2; this.pose(this.undyne, 'spr_undyne_starkd', Math.floor(this.frames * .2)); if (this.frames >= 20) this.wait('vanishWait', 60); }
    else if (this.stage === 'vanishWait' && this.frames >= 60) { this.eye = this.actor(this.undyne.x, this.undyne.y, 'spr_undyne_starkeye'); w.sound.play('snd_undynedis'); this.wait('vanish'); }
    else if (this.stage === 'vanish') { this.undyne.alpha = Math.max(0, this.undyne.alpha - .02); if (!this.undyne.alpha) this.wait('eyeFade'); }
    else if (this.stage === 'eyeFade') { this.eye.alpha = Math.max(0, this.eye.alpha - .02); if (!this.eye.alpha) this.wait('returnCamera'); }
    else if (this.stage === 'returnCamera') { camera.scrollY = Math.min(this.originY, camera.scrollY + 2); if (camera.scrollY >= this.originY) { w.waterfallGrass?.disableStark(); this.locked = false; this.wait('escape'); w.release(); } }
    else if (this.stage === 'kidRun') { this.kid.x += this.left ? -4 : 4; this.pose(this.kid, this.left ? 'spr_mkid_l' : 'spr_mkid_r', Math.floor(this.frames * .2)); if (this.frames >= this.duration) this.wait('kidPause', 20); }
    else if (this.stage === 'kidPause' && this.frames >= 20) { this.pose(this.kid, this.left ? 'spr_mkid_r' : 'spr_mkid_l'); this.wait('kidTurn', 20); }
    else if (this.stage === 'kidTurn' && this.frames >= 20) { this.pose(this.kid, this.up ? 'spr_mkid_u' : 'spr_mkid_d'); this.wait('kidTalkWait', 20); }
    else if (this.stage === 'kidTalkWait' && this.frames >= 20) this.show(waterfallUndyneKid(w.flags[67] === 1), () => this.wait('kidDepart', this.left ? 6 : 16));
    else if (this.stage === 'kidDepart') { this.kid.x += 6; this.pose(this.kid, 'spr_mkid_r', Math.floor(this.frames * .3)); if (this.frames >= this.duration) this.wait('kidTrip', 60); }
    else if (this.stage === 'kidTrip') { this.pose(this.kid, 'spr_mkid_trip_r', Math.min(19, Math.floor(this.frames / 3))); if (this.frames >= 60) { this.kid.x += 13; this.wait('kidRest', 15); } }
    else if (this.stage === 'kidRest' && this.frames >= 15) this.wait('kidExit', 30);
    else if (this.stage === 'kidExit') { this.kid.x += 4; this.pose(this.kid, 'spr_mkid_r', Math.floor(this.frames * .25)); if (this.frames >= 30) this.finish(); }
  }
  playScary() { this.music = this.world.sound.add('mus_undynescary', { loop: true }); this.music.play(); }
  finish() {
    const w = this.world; this.music?.destroy(); this.music = null;
    if (!w.townMusic) { w.waterfallMusic = w.sound.add('mus_waterfall', { loop: true, rate: murderLevel(w.flags) >= 8 && !w.flags[27] ? .15 : 1 }); w.waterfallMusic.play(); w.waterfallMusic.setVolume(.8); }
    w.plot = 106; this.locked = false; this.wait('done'); this.kid?.destroy(); this.undyne?.destroy(); this.undyneShadow?.destroy(); this.papyrus?.destroy(); this.eye?.destroy(); w.release();
  }
  destroy() { this.fadeMusic?.destroy(); this.music?.destroy(); this.icon?.destroy(); this.kid?.destroy(); this.undyne?.destroy(); this.undyneShadow?.destroy(); this.papyrus?.destroy(); this.eye?.destroy(); }
}
