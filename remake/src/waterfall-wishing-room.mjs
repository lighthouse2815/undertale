import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// obj_echoflower và bảng chỉ đường trong room_water6.
export class WaterfallWishingRoom {
  constructor(world) {
    this.world = world;
    this.flowers = world.roomObjects.filter(e => e.item.ObjectName === 'obj_echoflower');
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room3');
    for (const flower of this.flowers) {
      world.colliders.push(createCollider(world.dataSource, flower.item));
      flower.image.setDepth(flower.item.Y + flower.sprite.MarginBottom - flower.sprite.OriginY);
    }
  }
  flowerText(x) {
    const flags = this.world.flags;
    if (murderLevel(flags) >= 8 || flags[350] === 1) return ["* (It's strangely silent.)"];
    if (x > 620) return ["* Ah... seems my horoscope is\n  the same as last week's..."];
    if (x > 380) return ['* I wish my sister and I will\n  see the real stars someday...'];
    if (x > 280) return ["* C'mon, sis!\n* Make a wish!"];
    if (x > 180) return ["* Thousands of people wishing\n  together can't be wrong!", '* The king will prove that.'];
    return ['* A long time ago, monsters would\n  whisper their wishes to the\n  stars in the sky.', '* If you hoped with all your\n  heart, your wish would come\n  true.', '* Now, all we have are these\n  sparkling stones on the\n  ceiling...'];
  }
  interact() {
    const world = this.world;
    const flower = this.flowers.find(e => inInteractionRange(world, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (flower) { world.showDialogue(this.flowerText(flower.item.X)); return true; }
    if (this.signs.some(e => inInteractionRange(world, e))) { world.showDialogue(['* WISHING ROOM']); return true; }
    return false;
  }
}
