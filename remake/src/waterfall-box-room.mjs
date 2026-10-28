import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { showItemBox } from './box-road.mjs';
import boxData from './box-road.json' with { type: 'json' };

// Biển, BOX, hoa vọng âm và camera trong room_water3.
export class WaterfallBoxRoom {
  constructor(world) {
    this.world = world; world.flags[300] ??= 14;
    for (const e of world.roomObjects) if (['obj_sansbox', 'obj_sign_room', 'obj_echoflower'].includes(e.item.ObjectName)) {
      world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY);
    }
  }
  interact() {
    const w = this.world, target = w.roomObjects.find((e) => ['obj_sansbox', 'obj_sign_room', 'obj_echoflower', 'obj_readable_room4'].includes(e.item.ObjectName) && inInteractionRange(w, e));
    if (!target) return false;
    const name = target.item.ObjectName;
    if (name === 'obj_sansbox') showItemBox(w, boxData.box);
    else if (name === 'obj_sign_room') w.showDialogue(['* (This is a box.)', '* (You can put an item in\n  or take an item out.)', "* (Why would you, though???)\n* (You can't use items\n  when they're in the box!)", '* (Sincerely, a box hater.)']);
    else if (name === 'obj_echoflower') w.showDialogue([target.item.X < w.dataSource.room.Width / 2 ? '* Sitting behind rushing water...\n* It makes me feel relaxed.' : '* I swore I saw something...\n* Behind that rushing water...']);
    else w.showDialogue(["* Huh!?\n* There's a camera behind\n  the waterfall."]);
    return true;
  }
}
