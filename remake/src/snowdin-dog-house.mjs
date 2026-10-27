import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { startSnowdinMusic, showSnowdinSave } from './snowdin-start.mjs';

// room_tundra_lesserdog: các tác phẩm tuyết thay đổi theo kết quả trận Lesser Dog/cờ55.
export class SnowdinDogHouse {
  constructor(world) {
    this.world = world; this.text = world.dataSource.dogHouseDialogue; this.elapsed = 0; this.frames = 0; this.talking = false;
    this.star = world.roomObjects.find((e) => e.item.ObjectName === 'obj_savepoint'); startSnowdinMusic(world);
    const state = world.flags[55] ?? 0;
    for (const e of [...world.roomObjects]) {
      const name = e.item.ObjectName, pillar = name.startsWith('obj_dogpillar'), neck = name.startsWith('obj_dogneck');
      if ((state === 0 || state === 1) && (neck || pillar && name !== 'obj_dogpillar2') || state === 1 && name === 'obj_dogroom_npc') {
        e.image.destroy(); world.roomObjects = world.roomObjects.filter((entry) => entry !== e); continue;
      }
      if (name === 'obj_dogpillar2' && (state === 1 || state === 0 && world.plot < 67)) {
        const key = state === 1 ? 'spr_dogmush' : 'spr_lessdogsnow'; e.variant = state === 1 ? 'mush' : 'dog';
        e.object = { ...e.object, Sprite: key }; world.dataSource.objects.set(name, e.object); e.sprite = world.dataSource.sprites.get(key);
        e.item = { ...e.item, Y: e.item.Y + (state === 1 ? 20 : 30) };
        e.image.setTexture(`${key}:0`).setPosition(e.item.X, e.item.Y).setOrigin(e.sprite.OriginX / e.sprite.Width, e.sprite.OriginY / e.sprite.Height);
      }
      if (pillar || neck || ['obj_dogroom_npc', 'obj_sign_room'].includes(name)) world.colliders.push(createCollider(world.dataSource, e.item));
      e.image?.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY - (name === 'obj_dogehouseback' ? 10 : 0));
    }
    this.sculptures = world.roomObjects.filter((e) => /^obj_dog(pillar|neck)/.test(e.item.ObjectName)); this.npc = world.roomObjects.find((e) => e.item.ObjectName === 'obj_dogroom_npc');
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      this.star.image.setTexture(`${this.star.object.Sprite}:${Math.floor(this.frames * .2) % this.star.sprite.TextureCount}`);
      if (this.npc) this.npc.image.setTexture(`${this.npc.object.Sprite}:${this.talking ? Math.floor(this.frames * .2) % this.npc.sprite.TextureCount : 0}`);
    }
  }
  interact() {
    const w = this.world, names = ['obj_savepoint', 'obj_dogroom_npc', 'obj_sign_room', 'obj_readable_room1', 'obj_readable_room3'];
    const e = w.roomObjects.find((e) => (names.includes(e.item.ObjectName) || this.sculptures.includes(e)) && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!e) return false;
    const name = e.item.ObjectName;
    if (name === 'obj_savepoint') showSnowdinSave(w, { ...this.text, save: w.flags[55] === 1 ? this.text.saveMush : this.text.save });
    else {
      const key = name.startsWith('obj_dogpillar') ? e.variant ?? 'pillar' : name.startsWith('obj_dogneck') ? 'neck'
        : name === 'obj_sign_room' ? 'sign' : name === 'obj_readable_room1' ? 'house' : name === 'obj_readable_room3' ? 'camera'
          : w.flags[7] === 1 ? 'npcEnd' : w.flags[55] === 2 ? 'npcSculpt' : w.plot < 67 ? 'npcBefore' : 'npcGone';
      this.talking = e === this.npc; w.showDialogue(this.text[key], { onClose: () => { this.talking = false; } });
    }
    return true;
  }
}
