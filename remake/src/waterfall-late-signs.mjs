import { inInteractionRange } from './npc.mjs';
import signs from './waterfall-late-signs.json' with { type: 'json' };

export class WaterfallLateSigns {
  constructor(world) {
    this.world = world;
    this.signs = world.roomObjects.filter(entry => signs[entry.item.ObjectName]);
  }
  interact() {
    const entry = this.signs.find(sign => inInteractionRange(this.world, sign));
    if (!entry) return false;
    this.world.showDialogue(signs[entry.item.ObjectName]);
    return true;
  }
}
