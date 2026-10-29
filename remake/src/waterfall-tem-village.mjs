import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { showItemBox } from './box-road.mjs';
import boxText from './box-road.json' with { type: 'json' };
import dialogue from './waterfall-tem-village.json' with { type: 'json' };

export class WaterfallTemVillage {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0; this.locked = false; this.judgeTalked = 0;
    world.flags[270] ||= 1; world.flags[300] ??= 14;
    this.box = world.roomObjects.find(e => e.item.ObjectName === 'obj_sansbox');
    this.tems = world.roomObjects.filter(e => e.item.ObjectName === 'obj_temnpc');
    this.egg = world.roomObjects.find(e => e.item.ObjectName === 'obj_npc_room');
    this.hive = world.roomObjects.find(e => e.item.ObjectName === 'obj_hivestem');
    this.judge = world.roomObjects.find(e => e.item.ObjectName === 'obj_judgeshroom');
    this.signs = world.roomObjects.filter(e => ['obj_sign_room', 'obj_readable_room1', 'obj_readable_room2', 'obj_readable_room3'].includes(e.item.ObjectName));
    if (murderLevel(world.flags) >= 10) {
      for (const e of [...this.tems, this.egg, this.hive, this.judge]) e.image.destroy();
      this.tems = []; this.egg = this.hive = this.judge = null;
    } else {
      this.egg.object = { ...this.egg.object, Sprite: 'spr_temmie_egg' }; world.dataSource.objects.set('obj_npc_room', this.egg.object);
      this.egg.sprite = world.dataSource.sprites.get('spr_temmie_egg'); this.egg.image.setTexture('spr_temmie_egg:0');
      if (world.flags[269] === 1) this.hive.image.setTexture('spr_temmie_hivetalk:0');
      for (const e of [...this.tems, this.egg, this.hive, this.judge]) { e.image.setDepth(e.item.Y + e.sprite.Height); world.colliders.push(createCollider(world.dataSource, e.item)); }
    }
    world.colliders.push(createCollider(world.dataSource, this.box.item));
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    this.frame++;
    if (!this.stage) return;
    if (this.stage === 'dancePrep') this.judge.image.setTexture(`spr_mushroomdance_prep:${Math.min(3, Math.floor((16 - this.timer) / 4))}`);
    if (this.stage === 'dance') { this.judge.image.x = this.judge.item.X + Math.sin(this.frame / 6) * 2; this.judge.image.setTexture(`spr_mushroomdance_mid:${Math.floor(this.frame * .2) % this.world.dataSource.sprites.get('spr_mushroomdance_mid').TextureCount}`); return; }
    if (--this.timer > 0) return;
    const w = this.world;
    switch (this.stage) {
      case 'dancePrep':
        this.judge.image.setTexture('spr_mushroomdance_mid:0'); this.danceSound = w.sound.add('snd_mushroomdance', { loop: true }); this.danceSound.play(); this.stage = 'dance';
        w.showDialogue(dialogue.dance, { onClose: () => { this.danceSound.destroy(); this.danceSound = null; this.judge.image.setPosition(this.judge.item.X, this.judge.item.Y).setTexture('spr_mushroomdance_end:0'); this.stage = 'danceEnd1'; this.timer = 40; } }); break;
      case 'danceEnd1': this.judge.image.setTexture('spr_mushroomdance_end:1'); this.stage = 'danceEnd2'; this.timer = 1; break;
      case 'danceEnd2': this.judge.image.setTexture('spr_mushroomdance_end:2'); this.stage = 'danceEnd3'; this.timer = 40; break;
      case 'danceEnd3': {
        const key = w.flags[7] === 1 ? 'danceending' : w.kills > 0 ? this.judgeTalked ? 'dancekillrepeat' : 'dancekill' : this.judgeTalked ? 'dancerepeat' : 'dancefirst';
        this.stage = 'dialogue'; w.showDialogue(dialogue[key], { onClose: () => { this.judgeTalked++; this.judge.image.setTexture('spr_mushroomdance_prep:0'); this.end(); } }); break;
      }
      case 'hiveWait': this.stage = 'hive1'; this.timer = 30; this.hive.image.setTexture('spr_temmie_hive:1'); w.sound.play('snd_movemenu'); break;
      case 'hive1': this.stage = 'hive2'; this.timer = 30; this.hive.image.setTexture('spr_temmie_hive:2'); w.sound.play('snd_movemenu'); break;
      case 'hive2': this.stage = 'hive3'; this.timer = 30; this.hive.image.setTexture('spr_temmie_hive:3'); w.sound.play('snd_movemenu'); break;
      case 'hive3': this.stage = 'hiveEnd'; this.timer = 45; this.hive.image.setTexture('spr_temmie_hivetalk:0'); w.sound.play('snd_movemenu'); break;
      case 'hiveEnd': w.flags[269] = 1; this.end(); break;
    }
  }
  end() { this.stage = null; this.locked = false; if (this.world.waterfallMusic?.isPaused) this.world.waterfallMusic.resume(); this.world.release(); }
  interact() {
    const w = this.world, target = [...this.tems, this.egg, this.hive, this.judge, this.box, ...this.signs].filter(Boolean).find(e => inInteractionRange(w, e));
    if (!target) return false;
    if (target === this.box) { showItemBox(w, boxText.box); return true; }
    if (target === this.judge) {
      this.locked = true; w.release(); w.waterfallMusic?.pause(); this.stage = 'dancePrep'; this.timer = 16; return true;
    }
    if (target === this.hive) {
      if (w.flags[269] === 1) w.showDialogue(dialogue.hive);
      else { this.locked = true; w.release(); w.showDialogue(dialogue.hivefirst, { onClose: () => { w.waterfallMusic?.pause(); this.stage = 'hiveWait'; this.timer = 45; } }); }
      return true;
    }
    if (target === this.egg) { w.showDialogue(dialogue.egg); return true; }
    if (this.tems.includes(target)) {
      const x = target.item.X, index = x > 440 ? 4 : x > 360 ? 3 : x > 220 ? 2 : x > 190 ? 1 : 0;
      w.showDialogue(dialogue[`${w.flags[7] === 1 ? 'end' : 'tem'}${index}`]); return true;
    }
    const name = target.item.ObjectName, key = name === 'obj_sign_room' ? target.item.X > 330 ? 'sign3' : target.item.X > 270 ? 'sign2' : 'sign1' : name === 'obj_readable_room2' && w.flags[7] === 1 ? 'read2end' : name.replace('obj_readable_room', 'read');
    w.showDialogue(dialogue[key]); return true;
  }
  destroy() { this.danceSound?.destroy(); }
}
