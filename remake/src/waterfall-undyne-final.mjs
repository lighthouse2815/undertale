import { createCollider } from './movement.mjs';
import { undyneFinalLines, undyneFinalSpeech } from './waterfall-undyne-final-dialogue.mjs';

// obj_undynetrigger_boss: cảnh đối mặt trước lần đấu đầu và điểm lưu sau cảnh.
export class WaterfallUndyneFinal {
  constructor(world, spawnName) {
    this.world = world; this.stage = 'waiting'; this.locked = false; this.elapsed = 0; this.frame = 0; this.save = null;
    for (const glass of world.roomObjects.filter(e => e.item.ObjectName === 'obj_magicglass')) glass.image.setAlpha(0);
    if (world.plot > 121 || world.plot === 121 && spawnName !== 'obj_markerB') this.spawnSave();
    if (world.plot === 121) this.playTheme();
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
    this.save = { item, object, sprite, image, interactable: true }; w.roomObjects.push(this.save); w.colliders.push(createCollider(w.dataSource, item));
  }
  checkTrigger() {
    const w = this.world;
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
    if (!this.locked || this.stage === 'dialogue') return;
    this.frame++; this.timer--;
    if (this.stage === 'fadeMusic') {
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
      if (w.cameras.main.scrollY >= this.cameraStart) { w.plot = 121; this.playTheme(); this.spawnSave(); this.actor.destroy(); this.actor = null; this.locked = false; this.stage = 'done'; }
    }
  }
  destroy() { this.actor?.destroy(); this.white?.destroy(); }
}
