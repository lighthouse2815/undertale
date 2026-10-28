import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { findWaterfallBridge, waterfallBridgeSeeds, releaseWaterfallSeed, advanceWaterfallSeed } from './waterfall-bridge.mjs';

// obj_waterboardpuzzle1, obj_waterboard và obj_bellblossom tại room_water5.
export class WaterfallBridgeRoom {
  constructor(world, entrance) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.locked = false; this.carried = null; this.won = false; this.resetStage = null;
    const f = world.flags;
    if (murderLevel(f) >= 8 && !f[27]) { world.plot = Math.max(world.plot, 107); f[386] ||= 1; }
    this.water = world.dataSource.room.GameObjects.filter((e) => e.ObjectName === 'obj_waterspot');
    this.stops = world.dataSource.room.GameObjects.filter((e) => e.ObjectName === 'obj_waterstop');
    this.boards = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_waterboard').map((e) => ({ ...e, x: e.item.X, y: e.item.Y, startX: e.item.X, startY: e.item.Y, using: 0 }));
    this.fixed = waterfallBridgeSeeds(entrance === 'obj_markerB' ? 2 : 1, world.plot).map(({x,y}) => {
      const image = world.add.image(x, y, 'spr_bridgeseed:6').setOrigin(0).setDepth(-850000); const seed = {x,y,image}; this.openTile(seed); return seed;
    });
    this.bell = world.roomObjects.find((e) => e.item.ObjectName === 'obj_bellblossom');
    this.shrooms = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_glowshroom');
    this.docks = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_dockanim');
  }
  openTile(seed) {
    const w = this.world, i = w.colliders.findIndex((c) => c.rectangle.contains(seed.x + 10, seed.y + 10));
    if (i >= 0) { seed.removed = w.colliders.splice(i, 1)[0]; }
  }
  point(items, x, y) { return items.some((e) => x >= e.X && x < e.X + 20 && y >= e.Y && y < e.Y + 20); }
  occupied(x, y, skip, direction) {
    return this.boards.some((b) => b !== skip && x >= b.x && x < b.x + 20 && y >= b.y && y < b.y + 20)
      || direction !== 'u' && this.fixed.some((b) => x >= b.x && x < b.x + 20 && y >= b.y && y < b.y + 20);
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  step() {
    const w = this.world; this.frames++;
    for (const e of this.docks) e.image.setTexture(`${e.object.Sprite}:${Math.floor(this.frames * .2) % e.sprite.TextureCount}`);
    if (this.carried) { this.carried.x = w.player.x; this.carried.y = w.player.y - 10; }
    for (const b of this.boards) {
      if (b.using === 2) advanceWaterfallSeed(b, (x,y) => this.point(this.stops,x,y) || this.occupied(x,y,b));
      if (b.using === 6) { b.animation = (b.animation ?? 0) + .17; b.image.setTexture(`spr_bridgeseed:${Math.min(6,Math.floor(b.animation))}`); if (b.animation >= 5.1) { b.using = 99; b.image.setTexture('spr_bridgeseed:6'); this.openTile(b); } }
      b.image.setPosition(b.x,b.y).setDepth(b.using === 1 ? w.player.depth + 2 : -800000);
    }
    if (!this.won) { const bridge = findWaterfallBridge(this.boards); if (bridge.length) { this.won = true; for (const b of bridge) { b.using = 6; b.animation = 0; } } }
    if (this.resetStage) {
      this.resetFrames++;
      if (this.resetStage === 'out') {
        for (const b of this.boards) b.image.setAlpha(Math.max(0, 1 - this.resetFrames * .08));
        if (this.resetFrames >= 15) { for (const b of this.boards) { if (b.removed) w.colliders.push(b.removed); b.removed = null; b.x = b.startX; b.y = b.startY; b.using = 0; b.image.setTexture('spr_bridgeseed:0'); } this.carried = null; this.won = false; this.resetFrames = 0; this.resetStage = 'in'; }
      } else {
        for (const b of this.boards) b.image.setAlpha(Math.min(1, this.resetFrames * .08));
        if (this.resetFrames >= 15) { this.resetStage = null; this.locked = false; this.bell.image.setTexture(`${this.bell.object.Sprite}:0`); w.release(); }
      }
    }
  }
  interact() {
    const w = this.world;
    if (this.carried) {
      const b = this.carried, placed = releaseWaterfallSeed(w.player, w.player.facing, (x,y,direction) => this.occupied(x,y,b,direction), (x,y) => this.point(this.water,x,y));
      if (placed) { Object.assign(b, placed); this.carried = null; }
      return true;
    }
    const board = this.boards.find((b) => b.using === 0 && inInteractionRange(w, { ...b, item: { ...b.item, X: b.x, Y: b.y } }));
    if (board) { board.using = 1; this.carried = board; w.sound.play('snd_movemenu'); return true; }
    if (inInteractionRange(w, this.bell)) { w.sound.play('snd_bell'); this.bell.image.setTexture(`${this.bell.object.Sprite}:1`); this.locked = true; this.resetStage = 'out'; this.resetFrames = 0; w.release(); return true; }
    const mushroom = this.shrooms.find((e) => inInteractionRange(w,e));
    if (mushroom) { w.sound.play('snd_movemenu'); mushroom.image.setTexture(`${mushroom.object.Sprite}:${mushroom.image.texture.key.endsWith(':0') ? 1 : 0}`); return true; }
    const sign = w.roomObjects.find((e) => ['obj_sign_room','obj_readable_room3'].includes(e.item.ObjectName) && inInteractionRange(w,e));
    if (sign) { w.showDialogue(sign.item.ObjectName === 'obj_sign_room' ? ['* Congratulations!', '* You failed the puzzle!'] : ['* If an error is made, the Bell\n  Blossom can call Bridge Seeds\n  back to where they started.']); return true; }
    return false;
  }
  destroy() { this.fixed.forEach((b) => b.image.destroy()); }
}
