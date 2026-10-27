import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { startSnowdinMusic, stopSnowdinMusic } from './snowdin-start.mjs';

// obj_pofftrigger/dogpoff: chui khỏi tuyết, nhóm26, liếm hoặc bỏ đi theo cờ54.
export class GreaterDogRoom {
  constructor(world) {
    this.world = world; this.text = world.dataSource.greaterDogRoomDialogue; this.elapsed = 0; this.frames = 0; this.locked = false; this.alarm = 0;
    this.stage = world.plot >= 64 ? 'done' : 'waiting'; this.music = startSnowdinMusic(world).music;
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_pofftrigger');
    this.dog = world.roomObjects.find((e) => e.item.ObjectName === 'obj_dogpoff');
    this.poffs = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_snowpoff').map((e) => ({ ...e, tt: 0 }));
    this.npc = world.roomObjects.find((e) => e.item.ObjectName === 'obj_icecap_npcr');
    if (this.npc) {
      if (world.plot <= 100 || world.flags[203]) this.remove(this.npc);
    }
    if (this.stage === 'done') this.remove(this.dog);
    this.sprite = 'spr_dogpoff'; this.index = this.speed = this.vx = 0;
    for (const e of world.roomObjects.filter((e) => ['obj_snowpoff', 'obj_smalldoghouse', 'obj_sign_room', 'obj_icecap_npcr'].includes(e.item.ObjectName))) { world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY); }
    this.dog?.image.setDepth(-1000);
  }
  remove(e) { if (!e) return; e.image.destroy(); this.world.roomObjects = this.world.roomObjects.filter((entry) => entry !== e); if (e === this.dog) this.dog = null; if (e === this.npc) this.npc = null; }
  wait(stage, frames) { this.stage = stage; this.alarm = frames; }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world; this.frames++; const fired = this.alarm > 0 && --this.alarm === 0;
    if (this.fading) { this.fadeVolume = Math.max(0, this.fadeVolume - .01); this.music.setVolume(this.fadeVolume); if (this.fadeVolume === 0) this.fading = false; }
    if (this.npc) this.npc.image.setTexture(`spr_icecapr_npc:${this.talking ? Math.floor(this.frames * .2) % this.npc.sprite.TextureCount : 0}`);
    if (this.dog) {
      this.dog.image.x += this.vx;
      const count = w.dataSource.sprites.get(this.sprite).TextureCount;
      this.index += this.speed;
      if (this.index >= count) {
        this.index %= count;
        if (this.stage === 'emerge') { this.index = count - 1; this.speed = 0; this.wait('beforeBattle', 60); }
        else if (this.stage === 'lick') { this.setSprite('spr_dogbuttwalk', 0); this.wait('beforeWalk', 40); }
      }
      const frame = Math.floor(this.index);
      this.dog.image.setTexture(`${this.sprite}:${frame}`);
      if (this.sprite === 'spr_dogpoff' && (this.index === 47 || this.index === 51)) w.sound.play('snd_pombark');
    }
    if (this.stage === 'battle' && w.plot === 60) {
      w.player.y = 140; w.plot = 61;
      if (w.flags[54] === 1) { this.remove(this.dog); this.finish(); }
      else this.wait(w.flags[54] === 3 ? 'beforeBored' : 'beforeLick', 30);
      return;
    }
    if (!fired) return;
    if (this.stage === 'beforeEmerge') { this.stage = 'emerge'; this.speed = .25; }
    else if (this.stage === 'beforeBattle') { w.flags[200] = 0; this.stage = 'battle'; w.release(); window.__remake.startBattle('greaterDog'); }
    else if (this.stage === 'beforeLick') { this.stage = 'lick'; this.setSprite('spr_doglick', .25); }
    else if (this.stage === 'beforeWalk') { this.vx = 2; this.speed = .25; this.wait('walk', 50); }
    else if (this.stage === 'beforeBored') { this.setSprite('spr_dogboredwalk', .5); this.vx = 2; this.wait('walk', 50); }
    else if (this.stage === 'walk') this.finish();
  }
  setSprite(key, speed) {
    this.sprite = key; this.index = 0; this.speed = speed;
    const s = this.world.dataSource.sprites.get(key);
    this.dog.image.setTexture(`${key}:0`).setOrigin(s.OriginX / s.Width, s.OriginY / s.Height);
  }
  finish() {
    this.stage = 'done'; this.locked = false; this.fading = false; this.world.plot = 65;
    stopSnowdinMusic(this.world); this.music = startSnowdinMusic(this.world, true).music;
    this.originalVolume = undefined; this.world.release(); this.world.confirmPressed = this.world.menuPressed = false;
  }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 20)) return false;
    this.locked = true; w.saveGame(true); w.release(); this.originalVolume = this.fadeVolume = this.music.volume; this.fading = true; this.wait('beforeEmerge', 20); return true;
  }
  interact() {
    const w = this.world;
    const e = w.roomObjects.find((e) => ['obj_snowpoff', 'obj_smalldoghouse', 'obj_sign_room', 'obj_icecap_npcr'].includes(e.item.ObjectName) && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!e) return false;
    let pages;
    if (e.item.ObjectName === 'obj_snowpoff') {
      const poff = this.poffs.find((p) => p.item === e.item); let tt = poff.tt;
      pages = [this.text.poffs[tt >= 7 ? w.flags[65] ? 7 : 8 : tt]];
      if (tt >= 7) { if (!w.flags[65]) { w.gold += 30; w.flags[65] = 1; } tt = 0; }
      for (const p of this.poffs) p.tt = tt + 1; poff.tt = tt;
    } else pages = this.text[e.item.ObjectName === 'obj_smalldoghouse' ? w.plot >= 64 ? 'houseAfter' : 'house' : e.item.ObjectName === 'obj_sign_room' ? 'sign' : w.flags[7] === 1 ? 'npcEnd' : 'npc'];
    this.talking = e === this.npc; w.showDialogue(pages, { onClose: () => { this.talking = false; } }); return true;
  }
  destroy() {
    if (this.originalVolume !== undefined && this.music === this.world.snowdinMusic && !this.music.pendingRemove) this.music.setVolume(this.originalVolume);
  }
}
