import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';

// obj_undynetrigger_dry: Undyne đuổi tới Hotland rồi gục vì nóng.
export class HotlandUndyneCollapse {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.stage = world.plot <= 121 && !world.flags[350] ? 'waiting' : 'done';
    this.trigger = world.dataSource.room.GameObjects.find(item => item.ObjectName === 'obj_undynetrigger_dry');
    this.locked = false; this.walked = 0;
    this.cooler = world.roomObjects.find(entry => entry.item.ObjectName === 'obj_watercooler');
    this.water = this.sprite('spr_watercooler_water', this.cooler.item.X, this.cooler.item.Y).setDepth(this.cooler.image.depth + 1);
    this.updateCooler();
  }
  updateCooler() {
    const w = this.world, height = Math.max(0, 21 - (w.flags[440] ?? 0));
    this.water.setVisible(height > 0).setCrop(0, 23 - height, 19, height);
    const spills = w.flags[353] ?? 0;
    if (spills) {
      const frame = spills > 15 ? (w.flags[7] === 1 ? 3 : 2) : spills > 7 ? 1 : 0;
      if (!this.puddle) this.puddle = this.sprite('spr_coolerpuddle', 170, 60).setDepth(-900000);
      this.puddle.setTexture(`spr_coolerpuddle:${frame}`);
    }
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
    if (this.stage === 'pour') {
      const t = this.frame;
      if (t < 30) this.pourActor.setTexture(`spr_maincharal_water:${Math.floor(t / 3) % 2}`).setX(Math.max(this.pourX - 10, this.pourX - t));
      else {
        const frame = t < 120 ? 4 + Math.floor((t - 30) * .2) % 2 : Math.min(7, 4 + Math.floor((t - 120) * .2));
        this.pourActor.setTexture(`spr_mainchara_pourwater:${frame}`);
      }
      if (this.timer <= 0) {
        this.pourActor.destroy(); this.pourActor = null; w.player.setVisible(true); w.flags[366] = 0;
        this.wait('recoverRest1', 30);
      }
    } else if (this.stage === 'recoverRest1' && this.timer <= 0) this.wait('recoverShake1', 30);
    else if (this.stage === 'recoverShake1') {
      this.fallen.image.setPosition(this.fallen.item.X + (Math.random() - .5) * 2, this.fallen.item.Y + (Math.random() - .5) * 2);
      if (this.timer <= 0) { this.fallen.image.setPosition(this.fallen.item.X, this.fallen.item.Y); this.wait('recoverRest2', 60); }
    } else if (this.stage === 'recoverRest2' && this.timer <= 0) this.wait('recoverShake2', 40);
    else if (this.stage === 'recoverShake2') {
      this.fallen.image.setPosition(this.fallen.item.X + (Math.random() - .5) * 3, this.fallen.item.Y + (Math.random() - .5) * 3);
      if (this.timer <= 0) {
        w.sound.play('snd_noise'); this.fallen.image.setVisible(false);
        this.actor = this.sprite('spr_undyne_helmet_r', this.fallen.item.X - 10, this.fallen.item.Y);
        this.wait('lookRight', 90);
      }
    } else if (this.stage === 'lookRight' && this.timer <= 0) { this.actor.setTexture('spr_undyne_helmet_d:0'); this.wait('lookDown', 60); }
    else if (this.stage === 'lookDown' && this.timer <= 0) { this.actor.setTexture('spr_undyne_helmet_u:0'); this.wait('lookUp', 60); }
    else if (this.stage === 'lookUp' && this.timer <= 0) { this.actor.setTexture('spr_undyne_helmet_r:0'); this.wait('lookAgain', 90); }
    else if (this.stage === 'lookAgain' && this.timer <= 0) this.wait('leave', 100);
    else if (this.stage === 'leave') {
      this.actor.x--; this.actor.setTexture(`spr_undyne_helmet_l:${Math.floor(this.frame * .1) % 4}`);
      if (this.timer <= 0) {
        this.actor.destroy(); this.actor = null; this.fallen.image.destroy();
        w.roomObjects = w.roomObjects.filter(entry => entry !== this.fallen); w.colliders = w.colliders.filter(collider => collider !== this.collider);
        this.fallen = this.collider = null; w.flags[350] = 0; w.plot = 122; this.locked = false; this.stage = 'done';
      }
    } else if (this.stage === 'walk') {
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
    const w = this.world;
    const fallenTarget = this.fallen && { ...this.fallen, item: { ...this.fallen.item,
      X: this.fallen.item.X - this.fallen.sprite.OriginX, Y: this.fallen.item.Y - this.fallen.sprite.OriginY } };
    if (fallenTarget && inInteractionRange(w, fallenTarget)) {
      if (w.flags[366] !== 1) w.showDialogue(['* (She looks dry...)']);
      else w.showChoice('* (Give Undyne the water?)', ['Yes', 'No'], choice => {
        if (choice !== 0) return;
        this.locked = true; w.release(); this.pourX = w.player.x; w.player.setVisible(false);
        this.pourActor = this.sprite('spr_maincharal_water', w.player.x, w.player.y).setDepth(w.player.depth);
        this.wait('pour', 140);
      });
      return true;
    }
    if (!this.cooler || !inInteractionRange(w, this.cooler)) return false;
    if (w.flags[366] === 1) w.showChoice('* (Get rid of the water?)', ['Yes', 'No'], choice => {
      if (choice !== 0) return;
      w.flags[366] = 0; w.flags[353] = (w.flags[353] ?? 0) + 1;
      if (this.fallen) w.flags[441] = (w.flags[441] ?? 0) + 1;
      this.updateCooler(); w.showDialogue(['* (You pour the water on\n  the ground next to the\n  water cooler.)']);
    });
    else if ((w.flags[353] ?? 0) > 19) w.showDialogue([this.fallen ? "* (Sadistically, you've poured\n  out all the water right in\n  front of Undyne's eyes.)" : "* (There's no more water left\n  in the cooler.)"]);
    else w.showChoice('* (Take a cup of water?)', ['Yes', 'No'], choice => {
      if (choice !== 0) return;
      w.flags[366] = 1; w.flags[440] = (w.flags[440] ?? 0) + 1;
      this.updateCooler(); w.showDialogue(['* (You take a cup of water.)']);
    });
    return true;
  }
  destroy() { this.musicFade?.stop(); this.actor?.destroy(); this.pourActor?.destroy(); this.water?.destroy(); this.puddle?.destroy(); }
}
