import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import flowerText from './waterfall-undyne-flower.json' with { type: 'json' };

export class WaterfallUndyneHall {
  constructor(world) {
    this.world = world; this.flower = world.roomObjects.find(e => e.item.ObjectName === 'obj_undyne_echoflower');
    this.flower.image.setDepth(this.flower.item.Y + this.flower.sprite.Height);
    world.colliders.push(createCollider(world.dataSource, this.flower.item));
    this.layers = world.children.list.filter(e => e.depth === -999900);
    this.blocker = world.colliders.find(e => e.objectName === 'obj_solidexwide' && e.x === 340 && e.y === 80);
    if (world.plot <= 117) this.halo = world.add.image(0, 0, 'spr_darkhalo_big:0').setOrigin(311 / 662, 231 / 502).setDepth(-100);
    this.refresh(); this.update();
  }
  refresh() {
    const open = this.world.plot > 117;
    for (const layer of this.layers) layer.setVisible(open);
    if (this.blocker) this.blocker.disabled = open;
  }
  update() {
    if (!this.halo) return;
    const w = this.world, p = w.player;
    this.halo.setPosition(p.x - 10, p.y - 5).setAlpha(Math.min(1, .5 + p.x / 1200));
    if (w.waterfallMusic) w.waterfallMusic.setVolume(Math.max(0, 1 - p.x / 600));
  }
  interact() {
    if (this.world.plot <= 117 || !inInteractionRange(this.world, this.flower)) return false;
    this.world.showDialogue(flowerText); return true;
  }
  destroy() { this.halo?.destroy(); }
}
