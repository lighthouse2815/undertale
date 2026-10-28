import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { addItem } from './inventory.mjs';

// obj_npc_room và hoa vọng âm ở room_water5A.
export class WaterfallQuicheRoom {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0;
    this.bench = world.roomObjects.find((e) => e.item.ObjectName === 'obj_npc_room');
    this.bench.object = { ...this.bench.object, Sprite: 'spr_bench' }; this.bench.sprite = world.dataSource.sprites.get('spr_bench');
    world.dataSource.objects.set('obj_npc_room', this.bench.object);
    this.bench.image.setTexture('spr_bench:0').setOrigin(this.bench.sprite.OriginX / this.bench.sprite.Width, this.bench.sprite.OriginY / this.bench.sprite.Height).setDepth(this.bench.item.Y + this.bench.sprite.Height);
    this.flower = world.roomObjects.find((e) => e.item.ObjectName === 'obj_echoflower');
    this.docks = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_dockanim');
    for (const e of [this.bench, this.flower]) world.colliders.push(createCollider(world.dataSource, e.item));
    this.flower.image.setDepth(this.flower.item.Y + this.flower.sprite.MarginBottom - this.flower.sprite.OriginY);
  }
  update(delta) {
    this.elapsed = Math.min(200,this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.frames++; for (const e of this.docks) e.image.setTexture(`${e.object.Sprite}:${Math.floor(this.frames * .2) % e.sprite.TextureCount}`); }
  }
  interact() {
    const w = this.world;
    const target = [this.bench, this.flower].find((e) => inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!target) return false;
    if (target === this.flower) { w.showDialogue(["* I just wasn't ready for\n  the responsibility."]); return true; }
    if (w.flags[104] === 1) { w.showDialogue(["* It's just a bench."]); return true; }
    w.showDialogue(["* (There's a lone quiche\n  sitting underneath\n  this bench.)"], { onClose: () => w.showChoice('* (Will you take it?)', ['Take it','Leave it'], (choice) => {
      if (choice !== 0) { w.showDialogue(['* (The quiche was left all\n  alone...)']); return; }
      if (!addItem(w,23)) { w.showDialogue(["* (You're carrying too much.)", "* (You aren't ready for the\n  responsibility.)"]); return; }
      w.flags[104] = 1; w.showDialogue(['* (You got the Abandoned\n  Quiche.)']);
    }) }); return true;
  }
}
