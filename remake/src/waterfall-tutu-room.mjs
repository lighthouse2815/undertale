import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { addItem } from './inventory.mjs';

// room_water3A: hai nấm phát sáng và Old Tutu.
export class WaterfallTutuRoom {
  constructor(world) {
    this.world = world; this.shrooms = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_glowshroom');
    this.tutu = world.roomObjects.find((e) => e.item.ObjectName === 'obj_npc_room');
    for (const e of this.shrooms) { e.image.setDepth(e.item.Y + e.sprite.Height); world.colliders.push(createCollider(world.dataSource, e.item)); }
    if (world.flags[105] === 1) { this.tutu.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.tutu); this.tutu = null; }
    else {
      const e = this.tutu; e.object = { ...e.object, Sprite: 'spr_tutu' }; e.sprite = world.dataSource.sprites.get('spr_tutu');
      world.dataSource.objects.set(e.item.ObjectName, e.object); e.image.setTexture('spr_tutu:0').setOrigin(e.sprite.OriginX / e.sprite.Width, e.sprite.OriginY / e.sprite.Height).setDepth(e.item.Y + e.sprite.Height);
      world.colliders.push(createCollider(world.dataSource, e.item));
    }
  }
  interact() {
    const w = this.world, e = [...this.shrooms, ...(this.tutu ? [this.tutu] : [])].find((entry) => inInteractionRange(w, { ...entry, item: { ...entry.item, X: entry.item.X - entry.sprite.OriginX, Y: entry.item.Y - entry.sprite.OriginY } }));
    if (!e) return false;
    if (e !== this.tutu) { if (!w.sound.getAll('snd_movemenu').some((sound) => sound.isPlaying)) w.sound.play('snd_movemenu'); e.image.setTexture(`spr_glowshroom:${e.image.texture.key.endsWith(':0') ? 1 : 0}`); return true; }
    w.showDialogue(["* (There's a tutu lying on\n  the ground here.)"], { onClose: () => w.showChoice('* (Will you take it?)', ['Take it', 'Leave it'], (choice) => {
      if (choice !== 0) return;
      if (!addItem(w, 24)) { w.showDialogue(["* (You're carrying too much.)"]); return; }
      w.flags[105] = 1; w.showDialogue(['* (You got the Old Tutu.)'], { onClose: () => {
        const collider = w.colliders.findIndex((c) => c.objectName === 'obj_npc_room'); if (collider >= 0) w.colliders.splice(collider, 1);
        e.image.destroy(); w.roomObjects = w.roomObjects.filter((entry) => entry !== e); this.tutu = null;
      } });
    }) }); return true;
  }
}
