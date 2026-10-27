import { Geom } from '../vendor/phaser.esm.min.js';
import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';

// Công tắc, tuyết bị gạt bằng chân và đồ vật room_tundra_snowpuzz.
export class SnowdinSnowpuzz {
  constructor(world) {
    this.world = world; this.text = world.dataSource.snowpuzzDialogue; this.signRead = 0; this.talking = false;
    startSnowdinMusic(world);
    if (murderLevel(world.flags) >= 3) {
      if (!world.flags[64]) world.flags[64] = 1;
      if (world.plot <= 48) world.plot = 49;
    }
    const item = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_plotwall_room');
    this.wall = createCollider(world.dataSource, { ...item, ScaleY: 400 }); world.colliders.push(this.wall);
    this.npc = world.roomObjects.find((e) => e.item.ObjectName === 'obj_icecap_npcg');
    if (world.plot <= 100 || world.flags[203]) { this.npc.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.npc); this.npc = null; }
    for (const e of world.roomObjects.filter((e) => ['obj_sign_room', 'obj_icecap_npcg'].includes(e.item.ObjectName))) {
      world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.Height);
    }
    this.flakes = world.dataSource.room.GameObjects.filter((e) => e.ObjectName === 'obj_snowfloor').flatMap((e) => {
      world.roomObjects.find((o) => o.item === e)?.image.destroy();
      return Array.from({ length: 25 }, (_, i) => ({ x: e.X + 2.2 + i % 5 * 4 - (i % 5 === 4 ? .2 : 0), y: e.Y + 1 + Math.floor(i / 5) * 4, motion: 1 }));
    });
    this.snow = world.add.graphics().setDepth(-100000); this.drawSnow(); this.sync();
  }

  sync() {
    this.wall.disabled = this.world.plot > 48;
    for (const e of this.world.roomObjects.filter((e) => e.item.ObjectName === 'obj_spikes_room')) e.image.setTexture(`${e.object.Sprite}:${this.wall.disabled ? 1 : 0}`);
  }
  drawSnow() { this.snow.clear().fillStyle(0xffffff); for (const f of this.flakes) this.snow.fillCircle(f.x, f.y, 2.8); }
  stepSnow(previous) {
    const w = this.world, p = w.player, feet = new Geom.Rectangle(p.x, p.y + 19, 20, 11), moving = p.x !== previous.x || p.y !== previous.y;
    for (const f of this.flakes) {
      if (Geom.Intersects.CircleToRectangle(new Geom.Circle(f.x, f.y, 2), feet)) f.motion = Math.floor(Math.random() * 4) + 2;
      if (f.motion > 1) {
        if (moving) {
          if (!w.flags[64]) w.flags[64] = -1;
          if (feet.left > f.x) f.x -= f.motion;
          if (feet.right - 1 < f.x) f.x += f.motion;
          if (feet.top > f.y) f.y -= f.motion;
          if (feet.bottom - 1 < f.y) f.y += f.motion;
          f.x += (Math.random() * f.motion - f.motion / 2) / 2;
          f.y += (Math.random() * f.motion - f.motion / 2) / 2;
        }
        f.motion--;
      }
    }
    this.drawSnow();
  }
  update() {
    if (this.npc) this.npc.image.setTexture(`${this.npc.object.Sprite}:${this.talking ? Math.floor(this.world.time.now * 6 / 1000) % this.npc.sprite.TextureCount : 0}`);
  }

  interact() {
    const w = this.world, e = w.roomObjects.find((e) => ['obj_readable_room1', 'obj_readable_room3', 'obj_sign_room', 'obj_icecap_npcg'].includes(e.item.ObjectName) && inInteractionRange(w, e));
    if (!e) return false;
    let key;
    if (e.item.ObjectName === 'obj_readable_room1') {
      key = murderLevel(w.flags) >= 3 ? 'switchMurder' : w.plot > 48 ? 'switchAgain' : 'switch';
      if (!w.flags[64]) w.flags[64] = 1;
      if (w.plot <= 48) w.plot = 49;
      this.sync();
    } else if (e.item.ObjectName === 'obj_sign_room') key = this.signRead++ === 1 ? 'signAgain' : 'sign';
    else if (e.item.ObjectName === 'obj_readable_room3') key = 'camera';
    else { this.talking = true; key = w.flags[7] === 1 ? 'icecapEnd' : 'icecap'; }
    w.showDialogue(this.text[key], { onClose: () => { this.talking = false; } }); return true;
  }
}
