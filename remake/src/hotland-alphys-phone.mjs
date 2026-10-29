import { createCollider } from './movement.mjs';
import { touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import text from './hotland-alphys-phone.json' with { type: 'json' };

// obj_alphystrigger2: Alphys sửa điện thoại rồi đi vào phòng tắm.
export class HotlandAlphysPhone {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0; this.locked = false;
    this.stage = world.plot > 126 || murderLevel(world.flags) >= 12 ? 'done' : 'waiting';
    this.triggers = world.dataSource.room.GameObjects.filter(item => item.ObjectName === 'obj_alphystrigger2');
  }
  checkTrigger() {
    const w = this.world, intro = w.hotlandAlphysIntro;
    if (this.stage !== 'waiting' || w.plot !== 126 || intro.locked || !intro.npc || w.dialogue || !this.triggers.some(item => touchesObject(w, w.player, item, 1, 7))) return false;
    this.locked = true; w.release(); this.actor = intro.actor;
    w.colliders = w.colliders.filter(c => c !== intro.npcCollider); intro.npcCollider = null;
    this.facePlayer(); this.say([87], 'approachY', 3); return true;
  }
  wait(stage, frames = 0) { this.stage = stage; this.timer = frames; this.frame = 0; }
  say(ids, next, emotion = this.emotion ?? 0) {
    const w = this.world, pages = ids.map(id => text[`obj_alphystrigger2_${id}`]); this.stage = 'dialogue'; this.emotion = emotion;
    w.showDialogue(pages.map(p => p.text), { portrait: `spr_alphysface_${emotion}`, onPage: i => {
      this.emotion = pages[i].emotion ?? this.emotion; w.setDialoguePortrait(`spr_alphysface_${this.emotion}`);
      if (ids[i] === 232) w.hotlandAlphysIntro.door(true);
    }, onClose: () => this.wait(next) });
  }
  pose(direction, walking = false, speed = .334) {
    this.world.hotlandAlphysIntro.pose(this.actor, `spr_alphys_${direction}`, walking ? this.frame * speed : 0);
    this.actor.setDepth(this.actor.y + 34);
  }
  facePlayer() { this.pose(this.world.player.x > this.actor.x ? 'r' : 'l'); }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    if (!this.locked || this.stage === 'dialogue') return;
    const w = this.world; this.frame++; this.timer--;
    if (this.stage === 'approachY') {
      w.player.facing = w.player.x > this.actor.x ? 'l' : 'r'; w.player.setTexture(`spr_mainchara${w.player.facing}:0`);
      const dy = w.player.y - this.actor.y;
      if (Math.abs(dy) <= 3) this.wait('approachX');
      else { this.actor.y += Math.sign(dy) * 3; this.pose(dy > 0 ? 'd' : 'u', true); }
    } else if (this.stage === 'approachX') {
      const dx = w.player.x + 10 - this.actor.x - 14.5;
      if (Math.abs(dx) < 30) { this.facePlayer(); this.wait('offerWait', 20); }
      else { this.actor.x += Math.sign(dx) * 3; this.pose(dx > 0 ? 'r' : 'l', true); }
    } else if (this.stage === 'offerWait' && this.timer <= 0) this.say([146,147], 'inspectWait');
    else if (this.stage === 'inspectWait') this.wait('exclaim', 15);
    else if (this.stage === 'exclaim' && this.timer <= 0) {
      this.exclamation = w.hotlandAlphysIntro.sprite('spr_exc', this.actor.x + 8, this.actor.y - 5); w.sound.play('snd_b'); this.wait('inspect', 30);
    } else if (this.stage === 'inspect' && this.timer <= 0) { this.exclamation.destroy(); this.exclamation = null; this.say([169,170,171], 'runOff'); }
    else if (this.stage === 'runOff') {
      this.runDirection ??= this.actor.x < w.player.x ? -1 : 1;
      this.actor.x += this.runDirection * 6; this.pose(this.runDirection > 0 ? 'r' : 'l', true, .5);
      if (this.actor.x < w.cameras.main.scrollX - 30 || this.actor.x > w.cameras.main.scrollX + 350) {
        this.pausedMusic = w.labMusic; this.pausedMusic?.pause();
        this.fixSound = w.sound.add('mus_alphysfix', { volume: .8 }); this.fixSound.play(); this.wait('fixing', 100);
      }
    } else if (this.stage === 'fixing' && this.timer <= 0) {
      this.fixSound.destroy(); this.fixSound = null; this.resumeMusic(); this.wait('return');
    } else if (this.stage === 'return') {
      const dx = w.player.x + 10 - this.actor.x - 14.5;
      if (Math.abs(dx) < 30) { this.facePlayer(); this.wait('upgradeWait', 20); }
      else { this.actor.x += Math.sign(dx) * 6; this.pose(dx > 0 ? 'r' : 'l', true, .5); }
    } else if (this.stage === 'upgradeWait' && this.timer <= 0) {
      for (const id of [220,221]) if (!w.phone.includes(id) && w.phone.length < 8) w.phone.push(id);
      this.say(Array.from({ length: 12 }, (_, i) => 221 + i), 'walkToDoor', 0);
    } else if (this.stage === 'walkToDoor') {
      const dx = 890 - this.actor.x;
      if (Math.abs(dx) <= 6) { this.actor.x = 890; w.hotlandAlphysIntro.door(true); this.wait('enterDoor'); }
      else { this.actor.x += Math.sign(dx) * 6; this.pose(dx > 0 ? 'r' : 'l', true, .5); }
    } else if (this.stage === 'enterDoor') {
      this.actor.y -= 6; this.pose('u', true, .5);
      if (this.actor.y < 100 && !this.doorClosing) { this.doorClosing = true; this.actor.setDepth(-99999); w.hotlandAlphysIntro.door(false); }
      if (this.actor.y < 66) {
        this.actor.y = 65; this.pose('d'); this.actor.setDepth(-99999);
        const npc = w.hotlandAlphysIntro.npc; npc.item.X = this.actor.x; npc.item.Y = this.actor.y;
        w.hotlandAlphysIntro.npcCollider = createCollider(w.dataSource, npc.item); w.colliders.push(w.hotlandAlphysIntro.npcCollider);
        w.plot = 127; this.locked = false; this.stage = 'done'; w.release();
      }
    }
  }
  resumeMusic() { if (this.pausedMusic === this.world.labMusic && this.pausedMusic?.isPaused) this.pausedMusic.resume(); this.pausedMusic = null; }
  destroy() { this.fixSound?.destroy(); this.exclamation?.destroy(); this.resumeMusic(); }
}
