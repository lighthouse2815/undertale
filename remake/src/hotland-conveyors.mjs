import { touchesObject } from './npc.mjs';

// Kích thước từ creation code 6089–6144 của room_fire5.
const scales = [
  [2,21],[2,21],[1,2],[1,3],[1,4],[3,1],[3,1],[3,1],
  [1,2],[1,4],[1,6],[3,1],[3,1],[3,1],[1,6],[1,4],[1,2],[3,1],[3,1],[3,1],
  [1,4],[1,6],[1,8],[3,1],[3,1],[3,1],[1,6],[1,5],[1,4],[1,3],[1,4],[1,5],
  [3,1],[3,1],[3,1],[1,8],[1,6],[1,4],[3,1],[3,1],[3,1],[1,2],[1,4],[1,6],
  [3,1],[3,1],[3,1],[1,6],[1,4],[1,2],[3,1],[3,1],[3,1],[1,3],[1,4],[1,5],
];

export class HotlandConveyors {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0;
    this.belts = world.roomObjects.filter(e => /^obj_conveyor[udlr]$/.test(e.item.ObjectName)).map(entry => {
      const id = Number(entry.item.CreationCodeEntry?.match(/_(\d+)_Create$/)?.[1]);
      const scale = scales[id - 6089];
      if (!scale) throw new Error(`Thiếu kích thước băng chuyền ${entry.item.InstanceID}`);
      const direction = entry.item.ObjectName.slice(-1), key = `spr_conveyorbelt_${'ud'.includes(direction) ? 'd' : 'r'}`;
      entry.image.setTexture(`${key}:0`).setOrigin(0).setScale(...scale).setDepth(-900000);
      return { ...entry, direction, key, scale };
    });
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frame++;
      for (const belt of this.belts) {
        const count = this.world.dataSource.sprites.get(belt.key).TextureCount;
        const frame = this.frame % count;
        belt.image.setTexture(`${belt.key}:${'ul'.includes(belt.direction) ? (count - frame) % count : frame}`);
      }
    }
  }
  step() {
    const w = this.world;
    if (w.dialogue) return;
    // Cùng hướng chỉ đẩy một lần, nhưng băng vuông góc có thể cùng tác động.
    const directions = new Set(this.belts.filter(b => touchesObject(w, w.player, b.item, ...b.scale)).map(b => b.direction));
    if (directions.has('u')) w.player.y -= 3;
    if (directions.has('d')) w.player.y += 3;
    if (directions.has('l')) w.player.x -= 3;
    if (directions.has('r')) w.player.x += 3;
  }
}
