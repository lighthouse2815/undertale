import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { addItem } from './inventory.mjs';

// room_ruins17/18OLD: Froggit nói về Toriel và nhặt Toy Knife (SCR_TEXT 523).
export class RuinsOutlook {
  constructor(world) {
    this.world = world; this.text = world.dataSource.outlookDialogue;
    this.entry = world.roomObjects.find(({ item }) => ['obj_smallfrog', 'obj_knife_pickup'].includes(item.ObjectName));
    this.frog = this.entry.item.ObjectName === 'obj_smallfrog';
    this.body = createCollider(world.dataSource, this.entry.item); world.colliders.push(this.body);
    this.entry.image.setDepth(this.entry.item.Y + this.entry.sprite.Height);
    if (this.frog ? world.kills > 0 : world.flags[102] === 1) this.remove();
  }

  remove() {
    this.body.disabled = true; this.entry.image.destroy();
    this.world.roomObjects = this.world.roomObjects.filter((entry) => entry !== this.entry);
    this.entry = null;
  }

  animate() {
    if (!this.frog || !this.entry) return;
    if (this.world.kills > 0) { this.remove(); return; }
    this.entry.image.setTexture(`spr_smallfrog:${Math.floor(this.world.time.now * 3 / 1000) % this.entry.sprite.TextureCount}`);
  }

  interact() {
    const world = this.world;
    if (!this.entry || !inInteractionRange(world, this.entry)) return false;
    if (this.frog) world.showDialogue(this.text[world.flags[6] === 1 ? 'frogHard' : world.flags[7] === 1 ? 'frogEnd' : 'frog']);
    else {
      const received = addItem(world, 13);
      if (received) world.flags[102] = 1;
      world.showDialogue(this.text[received ? 'knife' : 'full'], { onClose: () => { if (received) this.remove(); } });
    }
    return true;
  }
}
