import { Curves } from '../vendor/phaser.esm.min.js';
import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { addItem } from './inventory.mjs';
import { startHouseMusic, mixHouseMusic } from './house-music.mjs';

// obj_asrielbed, obj_asriellamp, obj_pie_pickup: ngủ, mơ và bánh trên sàn.
export class ChildBedroom {
  constructor(world) {
    this.world = world; this.text = world.dataSource.childDialogue; this.stage = 'idle'; this.elapsed = 0;
    this.locked = false; this.ideal = [1, .001]; this.music = startHouseMusic(world);
    this.bright = world.children.list.find((entry) => entry.texture?.key === 'bg_asrielroom');
    this.dark = world.add.image(40, 40, 'bg_asrielroomdark').setOrigin(0).setDepth(-1999999).setVisible(false);
    this.cover = world.add.image(194, 112, 'bg_asrieldark2').setOrigin(0).setDepth(90000).setVisible(false);
    this.black = world.add.rectangle(0, 0, 320, 240, 0x000000).setOrigin(0).setScrollFactor(0).setDepth(99999).setAlpha(0);
    this.bed = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_asrielbed');
    this.bed = { ...this.bed, item: { ...this.bed.item, ScaleY: 1.5 } };
    this.lamp = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_asriellamp');
    this.pie = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_pie_pickup');
    this.pie.body = createCollider(world.dataSource, this.pie.item); world.colliders.push(this.pie.body);
    this.pie.image.setDepth(this.pie.item.Y + this.pie.sprite.Height);
    if (world.flags[103] !== 1) this.removePie();
  }

  removePie() {
    this.pie.body.disabled = true; this.pie.image.destroy();
    this.world.roomObjects = this.world.roomObjects.filter((entry) => entry !== this.pie);
  }

  addPie() {
    if (this.pie.image.active) return;
    const world = this.world;
    this.pie = { ...this.pie, image: world.add.image(142, 132, 'spr_pieslice:0').setOrigin(0).setDepth(146),
      body: createCollider(world.dataSource, this.pie.item) };
    world.roomObjects.push(this.pie); world.colliders.push(this.pie.body);
  }

  setDark(dark, cover = false) {
    this.isDark = dark; this.dark.setVisible(dark); this.bright.setVisible(!dark); this.cover.setVisible(cover);
    this.ideal = dark ? [0, 1] : [1, 0];
  }

  path(name, speed, after) {
    const points = this.world.dataSource.paths.get(name).Points, player = this.world.player;
    this.curve = new Curves.Spline(points.map((point) => [player.x + point.X - points[0].X, player.y + point.Y - points[0].Y]));
    this.distance = 0; this.pathSpeed = speed; this.pathLength = this.curve.getLength(); this.afterMotion = after;
  }

  update(delta) {
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; mixHouseMusic(this.world, this.music, this.ideal);
      if (this.curve) {
        this.distance = Math.min(this.pathLength, this.distance + this.pathSpeed);
        const point = this.curve.getPointAt(this.distance / this.pathLength);
        this.world.player.setPosition(point.x, point.y).setDepth(point.y + 30);
        if (this.distance === this.pathLength) { this.curve = null; this.afterMotion(); }
      } else if (this.stage === 'asleep') {
        if (++this.frames === 60) {
          if (this.world.plot >= 24) {
            this.stage = 'dream'; this.ideal = [0, 0];
            const lines = this.world.flags[7] === 1 ? this.text.dreamEnd : this.text.dream;
            this.world.showDialogue(lines.map((line) => line.replace('\\[C]', this.world.game.registry.get('charname'))), { onClose: () => this.wake() });
          } else this.wake();
        }
      } else if (this.stage === 'waking' && ++this.frames === 60) {
        this.stage = 'unbed'; this.path('path_unbed', 2, () => {
          this.stage = 'idle'; this.locked = false; this.cover.setVisible(false);
          // Không để phím xác nhận dùng để đóng menu/thoại bị phát lại sau khi thức dậy.
          this.world.confirmPressed = false; this.world.confirmWasDown = this.world.confirmDown;
        });
      }
    }
    return this.locked;
  }

  sleep() {
    const world = this.world; world.release(); world.sound.play('snd_noise');
    this.stage = 'jumping'; this.locked = true; world.player.facing = 'u'; world.player.setTexture('spr_maincharau:0');
    this.path('path_bedjump', 3, () => {
      this.stage = 'asleep'; this.frames = 0;
      this.fade = world.tweens.add({ targets: this.black, alpha: 1, duration: 13 * 1000 / 30 });
    });
  }

  wake() {
    const world = this.world;
    this.stage = 'waking'; this.frames = 0; this.setDark(true, world.plot < 20);
    world.player.setPosition(200, 104).setTexture('spr_maincharal:0'); world.player.facing = 'l'; world.hp = world.maxHp;
    if ((world.flags[103] ?? 0) === 0 && world.plot < 20) { world.flags[103] = 1; this.addPie(); }
    this.fade = world.tweens.add({ targets: this.black, alpha: 0, duration: 13 * 1000 / 30 });
  }

  interact() {
    const world = this.world;
    if (world.plot !== 0 && inInteractionRange(world, this.bed)) { this.sleep(); return true; }
    if (world.plot !== 0 && inInteractionRange(world, this.lamp)) { world.sound.play('snd_noise'); this.setDark(!this.isDark); return true; }
    if (this.pie.image.active && inInteractionRange(world, this.pie)) {
      const received = addItem(world, world.flags[6] === 1 ? 63 : 11);
      if (received) world.flags[103] = 2;
      world.showDialogue(received ? world.flags[6] === 1 ? this.text.snail : this.text.pie : this.text.full,
        { onClose: () => { if (received) this.removePie(); } });
      return true;
    }
    const entry = world.roomObjects.find((entry) => /^obj_readable_room[1-3]$/.test(entry.item.ObjectName) && inInteractionRange(world, entry));
    if (!entry) return false;
    const key = entry.item.ObjectName.endsWith('1') ? 'toys' : entry.item.ObjectName.endsWith('2')
      ? world.flags[7] === 1 ? 'frameEnd' : 'frame' : 'shoes';
    world.showDialogue(this.text[key]);
    return true;
  }

  destroy() { this.fade?.stop(); this.curve = null; }
}
