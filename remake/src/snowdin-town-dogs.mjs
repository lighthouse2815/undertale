import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';

// Các chó từGrillby raTown sau kếtthúc, GreaterDog và thànhviênAmalgamate.
export class SnowdinTownDogs {
  constructor(world) {
    this.world = world; this.text = world.dataSource.townDogDialogue; this.elapsed = 0; this.frames = 0; this.locked = false; this.stage = 'waiting'; this.dogs = [];
    const f = world.flags;
    for (const e of [...world.roomObjects]) {
      const name = e.item.ObjectName;
      if (!['obj_bigdog', 'obj_grillbynpc_mandog', 'obj_grillbynpc_womandog', 'obj_grillbynpc_doggo'].includes(name)) continue;
      const big = name === 'obj_bigdog', killed = f[big ? 54 : name.endsWith('doggo') ? 52 : 53] === 1;
      if (!f[7] || killed) { e.image.destroy(); world.roomObjects = world.roomObjects.filter((entry) => entry !== e); continue; }
      this.add(e, big ? 'big' : name.replace('obj_grillbynpc_', ''), big ? 'spr_bigdog_side' : e.object.Sprite);
      if (big) {
        const key = 'spr_amalgam_dognpc', sprite = world.dataSource.sprites.get(key), item = { ...e.item, X: e.item.X - 55, Y: e.item.Y + 4 };
        const image = world.add.image(item.X, item.Y, `${key}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height);
        this.add({ item, image, object: e.object, sprite }, 'amalgam', key);
      }
    }
  }
  add(e, name, key) {
    const w = this.world, sprite = w.dataSource.sprites.get(key), object = { ...e.object, Sprite: key };
    const entry = { ...e, sprite, object, name }; this.dogs.push(entry);
    e.image.setTexture(`${key}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(e.item.Y + sprite.MarginBottom - sprite.OriginY);
    // Hai instance obj_bigdog dùnghai sprite/maskriêng, khôngghi đèmetadata đối tượng dùngchung.
    const objects = new Map(w.dataSource.objects); objects.set(e.item.ObjectName, object);
    w.colliders.push(createCollider({ ...w.dataSource, objects }, e.item));
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  step() {
    this.frames++;
    if (this.locked) {
      if (this.stage === 'beforeBark' && this.frames >= 15) { this.world.sound.play('snd_bluh'); this.barking.image.setTexture(`${this.barking.object.Sprite}:${2 % this.barking.sprite.TextureCount}`); this.stage = 'barking'; this.frames = 0; }
      else if (this.stage === 'barking' && this.frames >= 35) { this.barking.image.setTexture(`${this.barking.object.Sprite}:0`); if (this.music?.isPaused) this.music.resume(); this.locked = false; this.stage = 'waiting'; this.world.release(); this.world.confirmPressed = this.world.menuPressed = false; }
    }
    for (const e of this.dogs) if (!['big', 'amalgam'].includes(e.name)) e.image.setTexture(`${e.object.Sprite}:${this.talking === e ? Math.floor(this.frames * .2) % e.sprite.TextureCount : 0}`);
  }
  interact() {
    const w = this.world, e = this.dogs.find((e) => inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } })); if (!e) return false;
    if (['big', 'amalgam'].includes(e.name)) {
      this.barking = e; this.locked = true; this.stage = 'beforeBark'; this.frames = 0; this.music = w.townMusic; this.music?.pause(); e.image.setTexture(`${e.object.Sprite}:1`); w.release();
    } else { this.talking = e; w.showDialogue(this.text[e.name], { onClose: () => { this.talking = null; } }); }
    return true;
  }
  destroy() { if (this.music === this.world.townMusic && this.music?.isPaused) this.music.resume(); this.dogs.forEach((e) => e.image.destroy()); }
}
