import { blocked, createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';
import { murderLevel } from './route.mjs';

// room_tundra6: obj_iceevent User9/Alarm0 và lời Sans về đòn xanh.
export class SnowdinIce {
  constructor(world) {
    this.world = world; this.text = world.dataSource.iceDialogue; this.active = false; this.remaining = 0; this.vx = this.vy = 0; this.talked = 0;
    this.tiles = world.dataSource.room.GameObjects.filter((e) => ['obj_iceevent', 'obj_iceeventx4'].includes(e.ObjectName))
      .map((e) => e.ObjectName === 'obj_iceeventx4' ? { ...e, ScaleX: 2, ScaleY: 2 } : e);
    startSnowdinMusic(world);
    if (world.dataSource.name !== 'room_tundra6') return;
    this.sans = world.roomObjects.find((e) => e.item.ObjectName === 'obj_sans_room');
    const f = world.flags;
    if (world.plot >= 43 || f[413] > 0 || f[67] === 1 || (murderLevel(f) >= 2 && !f[27]) || f[203] >= 16) {
      this.sans.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.sans); this.sans = null;
    }
    for (const e of world.roomObjects.filter((e) => ['obj_sign_room', 'obj_sans_room'].includes(e.item.ObjectName))) {
      world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.Height);
    }
  }

  // Được gọi một lần mỗi frame30Hz trước bước đi thường.
  slide() {
    if (!this.active) return false;
    if (--this.remaining === 0) { this.active = false; this.vx = this.vy = 0; return false; }
    const w = this.world, p = w.player;
    for (const [dx, dy] of [[this.vx, 0], [0, this.vy]]) {
      if (!dx && !dy) continue;
      const x = p.x + dx, y = p.y + dy;
      if (w.findDoor(x, y) || !blocked(w, w.colliders, x, y)) p.setPosition(x, y);
    }
    p.frameIndex = 0; p.setTexture(`spr_mainchara${p.facing}:0`).setDepth(p.y + 30);
    return true;
  }

  contact(previous, input) {
    const w = this.world, p = w.player;
    if (!this.tiles.some((tile) => touchesObject(w, p, tile, tile.ScaleX, tile.ScaleY))) return;
    if (!this.active) {
      p.setPosition(previous.x, previous.y);
      this.vx = input('left') ? -3 : input('right') ? 3 : 0;
      this.vy = input('down') ? 3 : input('up') ? -3 : 0;
      this.active = true;
    }
    this.remaining = 3; p.frameIndex = 0; p.setTexture(`spr_mainchara${p.facing}:0`);
  }

  interact() {
    if (!this.text) return false;
    const w = this.world;
    const e = w.roomObjects.find((e) => ['obj_sign_room', 'obj_sans_room'].includes(e.item.ObjectName) && inInteractionRange(w, e));
    if (!e) return false;
    if (e.item.ObjectName === 'obj_sign_room') w.showDialogue(this.text.sign);
    else w.showDialogue(this.talked++ ? this.text.sansAgain : this.text.sans, { portrait: 'spr_face_sans', onPage: () => w.dialogueText.setFont('fnt_comicsans', 10) });
    return true;
  }
}
