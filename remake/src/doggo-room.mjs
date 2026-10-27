import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';
import { murderLevel } from './route.mjs';

// room_tundra5: Doggo trồi lên, trận23, hậu cảnh, chuông và đồ vật.
export class DoggoRoom {
  constructor(world) {
    this.world = world; this.text = world.dataSource.doggoDialogue; this.elapsed = 0; this.frames = 0; this.total = 0;
    this.stage = world.plot >= 42 ? 'done' : 'waiting'; this.locked = false; this.rings = 0; this.echoAt = Infinity;
    Object.assign(this, startSnowdinMusic(world));
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_dogetrigger1');
    this.trigger = { ...this.trigger, X: this.trigger.X - 2 };
    const house = world.roomObjects.find((e) => e.item.ObjectName === 'obj_dogehouse');
    const back = world.roomObjects.find((e) => e.item.ObjectName === 'obj_dogehouseback');
    house.image.setDepth(house.item.Y + house.sprite.Height); back.image.setDepth(back.item.Y + back.sprite.Height - 1);
    this.clip = world.add.graphics().fillStyle(0xffffff).fillRect(0, 0, world.dataSource.room.Width, house.item.Y + 62).setVisible(false);
    this.mask = this.clip.createGeometryMask();
    this.dog = world.add.image(this.trigger.X, 140, 'spr_movedoge_o:0').setOrigin(0).setDepth(1000).setMask(this.mask).setVisible(false);
    this.bell = world.roomObjects.find((e) => e.item.ObjectName === 'obj_dogringbell');
    this.treat = world.roomObjects.find((e) => e.item.ObjectName === 'obj_dogtreat');
    if (world.flags[7] === 1) { this.treat.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.treat); this.treat = null; }
    this.note = null;
    if (world.plot >= 64) {
      const item = { ObjectName: 'obj_spagnot', X: this.bell.item.X, Y: this.bell.item.Y, ScaleX: 1, ScaleY: 1 };
      const object = world.dataSource.objects.get(item.ObjectName), sprite = world.dataSource.sprites.get(object.Sprite);
      const image = world.add.image(item.X, item.Y, `${object.Sprite}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(item.Y + sprite.Height);
      this.note = { item, object, sprite, image }; world.roomObjects.push(this.note); world.colliders.push(createCollider(world.dataSource, item));
    }
    if (world.flags[52] === 1 || this.note) { world.roomObjects = world.roomObjects.filter((e) => e !== this.bell); this.bell = null; }
    for (const e of world.roomObjects.filter((e) => ['obj_sign_room', 'obj_dogtreat'].includes(e.item.ObjectName))) {
      world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.Height);
    }
  }

  wait(stage, duration) { this.stage = stage; this.frames = 0; this.duration = duration; }
  show(lines, next) { this.stage = 'talking'; this.world.showDialogue(lines, { onClose: next }); }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }

  step() {
    const world = this.world; this.frames++; this.total++;
    this.dog.setTexture(`spr_movedoge_o:${Math.floor(this.total * .1) % 2}`);
    if (this.total === this.echoAt) { world.sound.stopByKey('snd_bell'); world.sound.play('snd_bell'); }
    if (this.stage === 'emerging' || this.stage === 'bellEmerging') {
      this.dog.y = Math.max(120, this.dog.y - .5);
      if (this.dog.y === 120) this.wait(this.stage === 'emerging' ? 'introWait' : 'bellWait', 20);
    } else if (this.stage === 'introWait' && this.frames >= this.duration) {
      this.show(murderLevel(world.flags) >= 2 ? this.text.introMurder : this.text.intro, () => {
        world.flags[200] = 0; world.flags[201] = world.kills;
        for (const f of [10, 11, 12, 13]) world.flags[f] = 0;
        world.saveGame(true); world.release(); this.stage = 'battle'; window.__remake.startBattle('doggo');
      });
    } else if (this.stage === 'battle' && world.plot === 41) {
      this.music.pause(); this.wait('afterBattle', 11);
    } else if (this.stage === 'afterBattle' && this.frames >= this.duration) {
      if (this.music.isPaused) this.music.resume(); else if (!this.music.isPlaying) this.music.play();
      if (world.flags[52] === 1) {
        if (this.bell) { world.roomObjects = world.roomObjects.filter((e) => e !== this.bell); this.bell = null; }
        this.finish();
      } else this.show(world.flags[52] === 2 ? this.text.fetch : this.text.pet, () => this.wait('retreating', 20));
    } else if (this.stage === 'retreating' || this.stage === 'bellRetreating') {
      this.dog.y += 1;
      if (this.frames >= this.duration) {
        if (this.stage === 'retreating') this.finish();
        else { this.dog.setVisible(false).setY(140); this.stage = 'done'; this.locked = false; world.release(); world.confirmPressed = false; }
      }
    } else if (this.stage === 'bellWait' && this.frames >= this.duration) {
      const line = this.text.bell[Math.min(5, this.rings++)]; this.show([line], () => this.wait('bellRetreating', 20));
    }
  }

  finish() {
    const world = this.world; this.dog.setVisible(false); this.stage = 'done'; this.locked = false; world.plot = 42;
    world.release(); world.confirmPressed = false; world.menuPressed = false;
  }

  checkTrigger() {
    const world = this.world;
    if (this.stage !== 'waiting' || world.dialogue || !touchesObject(world, world.player, this.trigger, 1, 9999)) return false;
    this.locked = true; this.music.pause(); world.release(); this.dog.setPosition(this.trigger.X, 140).setVisible(true);
    this.wait('emerging', 0); return true;
  }

  interact() {
    const world = this.world;
    const target = world.roomObjects.find((e) => ['obj_sign_room', 'obj_dogtreat', 'obj_dogringbell', 'obj_spagnot'].includes(e.item.ObjectName) && inInteractionRange(world, e));
    if (!target) return false;
    const name = target.item.ObjectName;
    if (name === 'obj_dogringbell') {
      if (world.plot < 42) return true;
      this.locked = true; world.release(); world.sound.play('snd_bell'); this.echoAt = this.total + 12;
      this.dog.setPosition(target.item.X, 150).setVisible(true); this.wait('bellEmerging', 0);
    } else world.showDialogue(name === 'obj_sign_room' ? this.text.sign : name === 'obj_dogtreat' ? this.text.treat : this.text.note);
    return true;
  }

  destroy() {
    this.dog.destroy(); this.mask.destroy(); this.clip.destroy();
    if (this.music === this.world.snowdinMusic && this.music?.isPaused) this.music.resume();
  }
}
