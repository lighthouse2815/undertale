import { inInteractionRange } from './npc.mjs';
import { addItem } from './inventory.mjs';
import { createCollider } from './movement.mjs';

// obj_candydish1 và SCR_TEXT 508/509.
export class CandyDish {
  constructor(world) {
    this.world = world;
    this.entry = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_candydish1');
    if (!world.colliders.some((body) => body.objectName === 'obj_candydish1')) world.colliders.push(createCollider(world.dataSource, this.entry.item));
    this.text = world.cache.json.get('inventory').candy;
    this.sync();
  }

  sync() {
    if ((this.world.flags[34] ?? 0) <= 3 || this.spilled) return;
    this.spilled = true;
    this.entry.image.setTexture('spr_candydish2:0');
    this.world.add.image(this.entry.item.X, this.entry.item.Y + 2, 'spr_candydish2:1').setOrigin(0).setDepth(-900000);
  }

  interact() {
    const world = this.world;
    if (!inInteractionRange(world, this.entry)) return;
    const taken = world.flags[34] ?? 0;
    if (taken >= 4) { world.showDialogue(this.text.empty); return; }
    world.showChoice(taken === 0 ? this.text.first : this.text.again, ['Yes', 'No'], (choice) => {
      if (choice === 1) { world.showDialogue(this.text.no); return; }
      if (!addItem(world, 1)) { world.showDialogue(this.text.full); return; }
      world.flags[34] = taken + 1;
      let lines = this.text.take[taken];
      if (world.flags[34] === 3 && world.flags[6] === 1) { lines = this.text.hard; world.flags[34] = 4; }
      this.sync(); world.showDialogue(lines);
    });
  }
}
