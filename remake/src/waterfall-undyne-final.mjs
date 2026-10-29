import { createCollider } from './movement.mjs';
import { touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { undyneFinalEncounterLines, undyneFinalLines, undyneFinalSpeech } from './waterfall-undyne-final-dialogue.mjs';

// obj_undynetrigger_boss: cảnh đối mặt trước lần đấu đầu và điểm lưu sau cảnh.
export class WaterfallUndyneFinal {
  constructor(world, spawnName) {
    this.world = world; this.room = world.dataSource.name; this.spawnName = spawnName;
    this.stage = world.plot <= 120 ? 'waiting' : world.plot === 121 ? 'ready' : 'done'; this.locked = false; this.elapsed = 0; this.frame = 0; this.save = null; this.encounterEnabled = spawnName !== 'obj_markerB';
    if (this.room === 'room_water_undynefinal2') {
      const initial = world.roomObjects.find(entry => entry.item.ObjectName === 'obj_undynea_chaser');
      if (initial) { initial.image.destroy(); world.roomObjects = world.roomObjects.filter(entry => entry !== initial); }
      this.ice = world.roomObjects.find(entry => entry.item.ObjectName === 'obj_icegen_undynef2'); this.iceFrame = 0;
      this.ice?.image.setDepth(-1100000);
      if (this.ice && (world.flags[7] === 1 || murderLevel(world.flags) >= 7)) { this.ice.image.destroy(); world.roomObjects = world.roomObjects.filter(entry => entry !== this.ice); this.ice = null; }
      if (world.plot <= 121) {
        this.spawnChaser(140, world.player.y + (spawnName === 'obj_markerB' ? -100 : 100)); this.chaseDelay = 20; this.stage = 'chase';
        if (!world.waterfallMusic) { world.waterfallMusic = world.sound.add('mus_undynefast', { loop: true, volume: 1 }); world.waterfallMusic.play(); }
      } else { if (world.waterfallMusic?.key === 'mus_undynefast' && world.flags[7] !== 1) { world.waterfallMusic.destroy(); world.waterfallMusic = null; } world.flags[17] = 0; this.stage = 'done'; }
      return;
    }
    for (const glass of world.roomObjects.filter(e => e.item.ObjectName === 'obj_magicglass')) glass.image.setAlpha(0).setDepth(-700000);
    if (world.plot > 121 || world.plot === 121 && spawnName !== 'obj_markerB') this.spawnSave();
    if (world.plot === 121 && !world.waterfallMusic?.isPlaying) this.playTheme();
  }
  playTheme() {
    const w = this.world;
    if (w.waterfallMusic?.key === 'mus_undynetruetheme') return;
    w.waterfallMusic?.destroy(); w.waterfallMusic = w.sound.add('mus_undynetruetheme', { loop: true, volume: .9 }); w.waterfallMusic.play();
  }
  spawnSave() {
    if (this.save) return;
    const w = this.world, item = { ObjectName: 'obj_savepoint', X: 220, Y: 660, ScaleX: 1, ScaleY: 1 };
    const object = w.dataSource.objects.get(item.ObjectName), sprite = w.dataSource.sprites.get(object.Sprite);
    const image = w.add.image(item.X, item.Y, `${object.Sprite}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(item.Y + sprite.Height);
    this.save = { item, object, sprite, image, interactable: true }; w.roomObjects.push(this.save); this.saveCollider = createCollider(w.dataSource, item); w.colliders.push(this.saveCollider);
  }
  removeSave() {
    if (!this.save) return;
    this.save.image.destroy(); this.world.roomObjects = this.world.roomObjects.filter(entry => entry !== this.save);
    this.world.colliders = this.world.colliders.filter(collider => collider !== this.saveCollider); this.save = this.saveCollider = null;
  }
  checkTrigger() {
    const w = this.world;
    const trigger = { ObjectName: 'obj_undynetrigger_boss2', X: 100, Y: 520 };
    if (this.stage === 'ready' && this.encounterEnabled && !w.dialogue && touchesObject(w, w.player, trigger, 40, 1)) {
      this.locked = true; w.release(); this.dive = this.sprite('spr_undynedive', 150, w.cameras.main.scrollY - 230);
      this.stage = 'dialogue'; w.showDialogue(undyneFinalEncounterLines(w.flags[352] === 1), { portrait: 'spr_face_undyne1', onClose: () => this.wait('diveStart') }); return true;
    }
    if (this.stage !== 'waiting' || w.plot > 120 || w.dialogue || w.player.y >= 600) return false;
    this.locked = true; w.release(); this.originalY = w.player.y; w.player.x = Math.max(128, w.player.x);
    this.cameraStart = w.cameras.main.scrollY; this.lines = undyneFinalSpeech({ kills: w.kills, flags: w.flags, undyneKilledBefore: Number(localStorage.getItem('undertale-remake-undyne-kills') ?? 0) > 0 });
    this.actor = this.sprite('spr_undynea_starku', 137, 135); this.wait('fadeMusic', 33); return true;
  }
  sprite(key, x, y) { const d = this.world.dataSource.sprites.get(key); return this.world.add.image(x, y, `${key}:0`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height).setDepth(200); }
  pose(key, frame = 0) { const d = this.world.dataSource.sprites.get(key); this.actor.setTexture(`${key}:${Math.min(d.TextureCount - 1, Math.floor(frame))}`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height); }
  wait(stage, frames = 0) { this.stage = stage; this.timer = frames; this.frame = 0; }
  say(ids, next, { portrait = false, onPage } = {}) {
    this.stage = 'dialogue'; this.world.showDialogue(undyneFinalLines(ids), { portrait, onPage, onClose: () => this.wait(next) });
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world;
    this.updateGlass();
    if (this.ice) { this.iceFrame += .15; this.ice.image.x += 2; if (this.ice.image.x > w.dataSource.room.Width + 20) this.ice.image.x = -50; this.ice.image.setTexture(`spr_waterice:${Math.floor(this.iceFrame) % this.ice.sprite.TextureCount}`); }
    if (this.stage === 'chase') { this.stepChase(); return; }
    if (!this.locked || this.stage === 'dialogue') return;
    this.frame++; this.timer--;
    if (this.stage === 'diveStart') {
      w.waterfallMusic?.destroy(); w.waterfallMusic = w.sound.add('mus_undynefast', { loop: true, volume: 1 });
      this.wait('dive', 30); w.showDialogue(undyneFinalLines([116], true), { portrait: 'spr_face_undyne1' });
    } else if (this.stage === 'dive') {
      this.dive.y += 8; this.dive.setTexture(`spr_undynedive:${Math.floor(this.frame * .334) % 2}`);
      if (this.timer <= 0) { while (w.dialogue) w.advanceDialogue(); this.removeSave(); this.wait('battle'); w.release(); window.__remake.startBattle('undyne'); }
    } else if (this.stage === 'battle') {
      this.dive?.destroy(); this.dive = null;
      if (w.flags[350] === 1) { w.waterfallMusic?.destroy(); w.waterfallMusic = null; w.flags[17] = 0; w.plot = 122; this.locked = false; this.stage = 'done'; }
      else { this.spawnChaser(160, 620); this.wait('chaseReturn', 30); }
    } else if (this.stage === 'chaseBattle') {
      if (w.flags[350] === 1) { this.chaser?.destroy(); this.chaser = null; w.waterfallMusic?.destroy(); w.waterfallMusic = null; w.flags[17] = 0; w.plot = 122; this.locked = false; this.stage = 'done'; }
      else {
        const x = this.room === 'room_water_undynefinal2' ? 140 : 160;
        const y = this.room === 'room_water_undynefinal2' ? w.player.y + (this.spawnName === 'obj_markerB' ? -100 : 130) : w.player.y > 600 ? 500 : 640;
        this.spawnChaser(x, y); this.locked = false; this.stage = 'chase';
      }
    } else if (this.stage === 'chaseReturn') {
      this.stepChase();
      if (this.stage === 'chaseReturn' && this.timer <= 0) { if (w.waterfallMusic && !w.waterfallMusic.isPlaying) w.waterfallMusic.play(); w.flags[352] = 1; this.locked = false; this.stage = 'chase'; }
    } else if (this.stage === 'fadeMusic') {
      if (w.waterfallMusic) w.waterfallMusic.setVolume(Math.max(0, .9 * (1 - this.frame / 33)));
      if (this.timer <= 0) this.wait('panUp');
    } else if (this.stage === 'panUp') {
      w.cameras.main.scrollY = Math.max(80, w.cameras.main.scrollY - 4);
      if (w.cameras.main.scrollY <= 80) this.wait('introWait', 30);
    } else if (this.stage === 'introWait' && this.timer <= 0) {
      this.say(this.lines.intro, 'introEnd', { onPage: index => {
        const key = index >= 8 ? 'spr_undynea_l' : index >= 7 ? 'spr_undynea_d' : index >= 6 ? 'spr_undynea_l' : index >= 4 ? 'spr_undynea_d' : index >= 2 ? 'spr_undynea_r' : 'spr_undynea_starku'; this.pose(key);
      } });
    } else if (this.stage === 'introEnd') this.wait('bridgeWait', 60);
    else if (this.stage === 'bridgeWait' && this.timer <= 0) { this.bridgeIndex = 0; this.pose(w.flags[67] === 1 ? 'spr_undynea_starku' : 'spr_undynea_d'); this.say(this.lines.bridge[0], 'bridgeNext'); }
    else if (this.stage === 'bridgeNext') {
      this.bridgeIndex++;
      if (this.bridgeIndex < this.lines.bridge.length) { this.playTheme(); this.say(this.lines.bridge[this.bridgeIndex], 'bridgeNext'); }
      else if (w.flags[67] === 1) { this.pose('spr_undynea_d'); this.say(this.lines.speech, 'returnCamera'); }
      else { this.white = w.add.rectangle(0, 0, 320, 240, 0xffffff).setOrigin(0).setScrollFactor(0).setDepth(99999).setAlpha(0); this.wait('flashIn', 50); }
    } else if (this.stage === 'flashIn') {
      this.white.setAlpha(Math.min(1, this.frame / 50));
      if (this.timer <= 0) { this.actor.x += 3; this.pose('spr_undyne_eyeding'); w.cameras.main.scrollY = 60; this.wait('flashHold', 20); }
    } else if (this.stage === 'flashHold' && this.timer <= 0) this.wait('flashOut', 60);
    else if (this.stage === 'flashOut') {
      this.white.setAlpha(Math.max(0, 1 - this.frame * .05)); if (this.timer <= 0) { this.white.destroy(); this.white = null; this.wait('eye', 90); }
    } else if (this.stage === 'eye') {
      this.pose('spr_undyne_eyeding', Math.min(8, this.frame * .2)); if (this.frame === 20) w.sound.play('snd_bell');
      if (this.timer <= 0) { this.pose('spr_undyne_starkd_nomask'); w.player.setVisible(false); this.wait('speechWait', 2); }
    } else if (this.stage === 'speechWait' && this.timer <= 0) this.say(this.lines.speech, 'returnCamera', { portrait: 'spr_face_undyne1' });
    else if (this.stage === 'returnCamera') {
      w.player.y = this.originalY; w.player.setVisible(true); w.cameras.main.scrollY = Math.min(this.cameraStart, w.cameras.main.scrollY + 8);
      if (w.cameras.main.scrollY >= this.cameraStart) { w.plot = 121; this.playTheme(); this.spawnSave(); this.actor.destroy(); this.actor = null; this.locked = false; this.stage = 'ready'; }
    }
  }
  spawnChaser(x, y) {
    const w = this.world; this.chaser?.destroy(); this.chaser = this.sprite('spr_undyne_helmet_d', x, y);
    this.chaseFrames = 0; this.chaseFrame = 0; this.chaseDelay = 57; w.flags[17] = 1;
  }
  stepChase() {
    const w = this.world, c = this.chaser;
    if (!c?.active) return;
    this.chaseFrames++;
    if (this.chaseDelay > 0) this.chaseDelay--;
    else {
      const dx = w.player.x - 4 - c.x, dy = w.player.y - 20 - c.y, length = Math.hypot(dx, dy) || 1, speed = (w.flags[99] ?? 0) > 3 ? 4 : 5;
      c.x += dx / length * speed; c.y += dy / length * speed;
      const direction = Math.abs(dy) > Math.abs(dx) ? dy < 0 ? 'u' : 'd' : dx < 0 ? 'l' : 'r';
      const frame = Math.floor(this.chaseFrames * .2) % 4;
      c.setTexture(`spr_undyne_helmet_${direction}:${frame}`).setDepth(c.y + 54);
      if (frame !== this.chaseFrame && (frame === 1 || frame === 3)) w.sound.play('snd_undynestep');
      this.chaseFrame = frame;
    }
    const ps = w.dataSource.sprites.get(w.player.texture.key.split(':')[0]), cs = w.dataSource.sprites.get(c.texture.key.split(':')[0]);
    if (!w.dialogue && c.x + 6 <= w.player.x + ps.MarginRight && c.x + cs.Width - 6 >= w.player.x + ps.MarginLeft &&
      c.y + cs.Height - 20 <= w.player.y + ps.MarginBottom && c.y + cs.Height - 2 >= w.player.y + ps.MarginTop) {
      this.locked = true; this.wait('chaseBattle'); w.release(); window.__remake.startBattle('undyne');
    }
  }
  updateGlass() {
    const w = this.world;
    for (const glass of w.roomObjects.filter(e => e.item.ObjectName === 'obj_magicglass')) {
      glass.hold = (glass.hold ?? 0) - 1;
      if (glass.image.alpha > 0 && glass.hold < 0) glass.image.setAlpha(Math.max(0, glass.image.alpha - .1));
      if (this.chaser?.active && touchesObject(w, this.chaser, glass.item)) { glass.hold = 3; glass.image.setAlpha(Math.min(1, glass.image.alpha + .2)); }
    }
  }
  destroy() { this.actor?.destroy(); this.white?.destroy(); this.dive?.destroy(); if (this.chaser) { this.chaser.destroy(); this.world.flags[17] = 0; } }
}
