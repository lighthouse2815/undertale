import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// room_water_savepoint1: chuột, hoa vọng âm và miếng phô mai trong tinh thể.
export class WaterfallCrystalRoom {
  constructor(world) {
    this.world = world; this.flower = world.roomObjects.find(e => e.item.ObjectName === 'obj_echoflower');
    this.mouse = world.roomObjects.find(e => e.item.ObjectName === 'obj_mousehole');
    this.table = world.roomObjects.find(e => e.item.ObjectName === 'obj_npc_room');
    this.table.object = { ...this.table.object, Sprite: 'spr_crystaltable' }; this.table.sprite = world.dataSource.sprites.get('spr_crystaltable');
    world.dataSource.objects.set('obj_npc_room', this.table.object);
    this.table.image.setTexture('spr_crystaltable:0').setOrigin(0).setDepth(this.table.item.Y + this.table.sprite.Height);
    for (const entry of [this.table, this.flower]) world.colliders.push(createCollider(world.dataSource, entry.item));
    this.flower.image.setDepth(this.flower.item.Y + this.flower.sprite.MarginBottom - this.flower.sprite.OriginY);
    if (!world.townMusic && !world.waterfallMusic && world.flags[7] !== 1 && !world.flags[94]) {
      const bleak = world.flags[223] && !world.flags[27], key = bleak ? 'mus_toomuch' : 'mus_waterquiet';
      const music = world.waterfallMusic = world.sound.add(key, { loop: true, volume: bleak ? 1 : .8 });
      music.play(); music.setRate(bleak ? 1 : murderLevel(world.flags) >= 8 && !world.flags[27] ? .5 : .9);
    }
  }
  interact() {
    const w = this.world;
    if (inInteractionRange(w, this.mouse)) { if (!w.sound.isPlaying('snd_movemenu')) w.sound.play('snd_movemenu'); return true; }
    if (inInteractionRange(w, this.table)) {
      w.showDialogue(w.flags[7] === 1 ? ['* (Seems like the mouse has\n  freed some of the cheese\n  from the crystal somehow.)'] : ['* This cheese has been here so\n  long, a magical crystal has\n  grown around it.', "* It's stuck to the table..."]); return true;
    }
    const f = this.flower;
    if (inInteractionRange(w, { ...f, item: { ...f.item, X: f.item.X - f.sprite.OriginX, Y: f.item.Y - f.sprite.OriginY } })) {
      w.showDialogue([murderLevel(w.flags) >= 8 ? "* (It's strangely silent.)" : '* Squeak.']); return true;
    }
    return false;
  }
}
