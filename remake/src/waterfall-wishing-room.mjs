import { WaterfallStarViewer } from './waterfall-star-viewer.mjs';
import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// obj_echoflower, kính thiên văn và bảng chỉ đường trong room_water6.
export class WaterfallWishingRoom {
  constructor(world) {
    this.world = world; this.viewer = new WaterfallStarViewer(world);
    this.flowers = world.roomObjects.filter(e => e.item.ObjectName === 'obj_echoflower');
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room3');
    this.telescope = world.roomObjects.find(e => e.item.ObjectName === 'obj_telescope');
    this.door = world.roomObjects.find(e => e.item.ObjectName === 'obj_fakedoor');
    world.colliders.push(createCollider(world.dataSource, this.telescope.item));
    for (const flower of this.flowers) {
      world.colliders.push(createCollider(world.dataSource, flower.item));
      flower.image.setDepth(flower.item.Y + flower.sprite.MarginBottom - flower.sprite.OriginY);
    }
    if (murderLevel(world.flags) >= 8 && !world.flags[27]) world.plot = Math.max(world.plot, 108);
    if (world.plot > 107) this.openDoor(false);
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
    if (inInteractionRange(world, { ...this.telescope, item: { ...this.telescope.item, X: this.telescope.item.X - this.telescope.sprite.OriginX, Y: this.telescope.item.Y - this.telescope.sprite.OriginY } })) {
      world.showChoice('* (Look through the telescope?)', ['Yes', 'No'], choice => { if (choice === 0) this.openViewer(); }); return true;
    }
    if (!this.doorOpen && world.plot < 108 && inInteractionRange(world, this.door)) { this.openDoor(true); world.plot = 108; return true; }
    if (this.signs.some(e => inInteractionRange(world, e))) { world.showDialogue(['* WISHING ROOM']); return true; }
    return false;
  }
  openDoor(animate) {
    const world = this.world, door = this.door; this.doorOpen = true;
    const index = world.colliders.findIndex(c => c.objectName === 'obj_solidtall_2' && c.rectangle.contains(door.item.X + 10, door.item.Y + 20));
    if (index >= 0) world.colliders.splice(index, 1);
    door.image = world.add.image(door.item.X, door.item.Y, 'spr_fakedoor:0').setOrigin(0).setDepth(door.item.Depth ?? door.item.Y);
    if (animate) { this.doorFrames = 30; this.doorElapsed = 0; world.release(); world.sound.play('snd_bluh'); world.cameras.main.shake(1000 / 15, .006); }
  }
  get view() { return this.viewer.view; }
  openViewer() { this.viewer.openViewer(); }
  closeViewer() { this.viewer.closeViewer(); }
  update(delta) {
    if (this.doorFrames > 0) { this.doorElapsed += delta; while (this.doorElapsed >= 1000 / 30 && this.doorFrames > 0) { this.doorElapsed -= 1000 / 30; this.doorFrames--; } return true; }
    return this.viewer.update(delta);
  }
  destroy() { this.viewer.destroy(); }
}
