import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';

// obj_glowshroompuzzle: các lớp nền hiện dần khi tắt nấm.
export class WaterfallGlowshroomPuzzle {
  constructor(world) {
    this.world = world;
    const solved = world.flags[270] === 1 || world.plot > 117;
    this.mushrooms = world.roomObjects.filter(e => e.item.ObjectName === 'obj_glowshroom');
    this.layers = world.children.list.filter(image => image.depth <= -1000001 && image.depth >= -1000005);
    for (const mushroom of this.mushrooms) {
      mushroom.glow = !solved;
      mushroom.image.setDepth(mushroom.item.Y + mushroom.sprite.Height);
      world.colliders.push(createCollider(world.dataSource, mushroom.item));
    }
    this.refresh();
  }
  refresh() {
    const dark = this.mushrooms.filter(e => !e.glow).length;
    for (const mushroom of this.mushrooms) mushroom.image.setTexture(`spr_glowshroom:${mushroom.glow ? 1 : 0}`);
    for (const layer of this.layers) layer.setVisible(dark >= -layer.depth - 1000000);
    if (dark >= 4 && !this.world.flags[270]) this.world.flags[270] = 1;
  }
  interact() {
    const mushroom = this.mushrooms.find(e => inInteractionRange(this.world, e));
    if (!mushroom) return false;
    mushroom.glow = !mushroom.glow;
    if (!this.world.sound.getAllPlaying().some(sound => sound.key === 'snd_movemenu')) this.world.sound.play('snd_movemenu');
    this.refresh(); return true;
  }
}
