import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';

// obj_undynetrigger_dry: Undyne đuổi tới Hotland rồi gục vì nóng.
export class HotlandUndyneCollapse {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.stage = world.plot <= 121 && !world.flags[350] ? 'waiting' : 'done';
    this.trigger = world.dataSource.room.GameObjects.find(item => item.ObjectName === 'obj_undynetrigger_dry');
    this.locked = false; this.walked = 0;
  }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 100)) return false;
    this.locked = true; w.release();
    if (w.waterfallMusic) this.musicFade = w.tweens.add({ targets: w.waterfallMusic, volume: 0, duration: 1000 / 3 });
    this.actor = this.sprite('spr_undyne_helmet_r', -40, 60); this.wait('walk', 20); return true;
  }
  sprite(key, x, y) {
    const d = this.world.dataSource.sprites.get(key);
    return this.world.add.image(x, y, `${key}:0`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height).setDepth(y + d.Height);
  }
  wait(stage, frames) { this.stage = stage; this.timer = frames; this.frame = 0; }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    if (!this.locked || this.stage === 'dialogue') return;
    const w = this.world; this.frame++; this.timer--;
    if (this.stage === 'walk') {
      this.actor.x++; this.actor.setTexture(`spr_undyne_helmet_r:${Math.floor(this.frame * (this.walked ? .2 : .1)) % 4}`);
      if (this.timer <= 0) { this.actor.setTexture('spr_undyne_helmet_r:0'); this.wait('rest', 40); }
    } else if (this.stage === 'rest' && this.timer <= 0) {
      if (++this.walked < 3) this.wait('walk', 20);
      else {
        this.stage = 'dialogue'; w.showDialogue(['* Armor... so... hot...', "* But I can't...\n* Give up..."], { portrait: 'spr_face_undyne1', onClose: () => this.wait('lastWalk', 40) });
      }
    } else if (this.stage === 'lastWalk') {
      this.actor.x += .5; this.actor.setTexture(`spr_undyne_helmet_r:${Math.floor(this.frame * .1) % 4}`);
      if (this.timer <= 0) { this.actor.setTexture('spr_undyne_helmet_r:0'); this.wait('lastRest', 60); }
    } else if (this.stage === 'lastRest' && this.timer <= 0) {
      w.sound.play('snd_noise'); const x = this.actor.x, y = this.actor.y; this.actor.destroy(); this.actor = null;
      const item = { ObjectName: 'obj_undynefall', X: x, Y: y, ScaleX: 1, ScaleY: 1 };
      const object = w.dataSource.objects.get(item.ObjectName), sprite = w.dataSource.sprites.get(object.Sprite);
      this.fallen = { item, object, sprite, image: this.sprite(object.Sprite, x, y), interactable: true };
      w.roomObjects.push(this.fallen); this.collider = createCollider(w.dataSource, item); w.colliders.push(this.collider);
      w.flags[17] = 0; w.flags[350] = 2; w.plot = 122; this.musicFade?.stop(); w.waterfallMusic?.destroy(); w.waterfallMusic = null;
      this.stage = 'done'; this.locked = false;
    }
  }
  interact() {
    if (!this.fallen || !inInteractionRange(this.world, this.fallen)) return false;
    this.world.showDialogue(['* (She looks dry...)']); return true;
  }
  destroy() { this.musicFade?.stop(); this.actor?.destroy(); }
}
