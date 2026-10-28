import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// obj_echoflower, kính thiên văn và bảng chỉ đường trong room_water6.
export class WaterfallWishingRoom {
  constructor(world) {
    this.world = world;
    this.flowers = world.roomObjects.filter(e => e.item.ObjectName === 'obj_echoflower');
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room3');
    this.telescope = world.roomObjects.find(e => e.item.ObjectName === 'obj_telescope');
    world.colliders.push(createCollider(world.dataSource, this.telescope.item));
    for (const flower of this.flowers) {
      world.colliders.push(createCollider(world.dataSource, flower.item));
      flower.image.setDepth(flower.item.Y + flower.sprite.MarginBottom - flower.sprite.OriginY);
    }
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
    if (this.signs.some(e => inInteractionRange(world, e))) { world.showDialogue(['* WISHING ROOM']); return true; }
    return false;
  }
  openViewer() {
    const world = this.world, music = world.waterfallMusic ?? world.townMusic;
    this.view = { x: 0, y: 0, frames: 0, elapsed: 0, music, volume: music?.volume };
    music?.setVolume(music.volume / 2); world.release();
    this.view.pattern = world.add.image(0, 0, 'spr_starpattern:0').setOrigin(0).setScrollFactor(0).setDepth(100001);
    this.view.lens = world.add.image(0, 0, 'spr_starcheckeredit:0').setOrigin(0).setScrollFactor(0).setDepth(100002);
    this.view.cover = world.add.graphics().setScrollFactor(0).setDepth(100003);
    this.drawViewer();
  }
  drawViewer() {
    const v = this.view, left = v.x + 120, top = v.y + 85, right = v.x + 201, bottom = v.y + 156;
    v.lens.setPosition(v.x, v.y); v.cover.clear().fillStyle(0x000000).fillRect(0, 0, 320, top).fillRect(0, bottom, 320, 240 - bottom).fillRect(0, top, left, bottom - top).fillRect(right, top, 320 - right, bottom - top);
  }
  update(delta) {
    const v = this.view; if (!v) return false; const world = this.world;
    v.elapsed = Math.min(200, v.elapsed + delta);
    while (v.elapsed >= 1000 / 30) {
      v.elapsed -= 1000 / 30; v.frames++;
      const input = direction => world.keys[direction].isDown || [...world.touch.values()].some(pointer => pointer.direction === direction);
      v.x = Math.max(-120, Math.min(119, v.x + (input('right') ? 4 : 0) - (input('left') ? 4 : 0)));
      v.y = Math.max(-85, Math.min(84, v.y + (input('down') ? 4 : 0) - (input('up') ? 4 : 0)));
      v.pattern.setTexture(`spr_starpattern:${Math.floor(v.frames * .2) % 4}`); this.drawViewer();
    }
    if (v.frames >= 2 && world.justConfirmed()) this.closeViewer();
    return true;
  }
  closeViewer() {
    const v = this.view; if (!v || v.frames < 2) return;
    v.pattern.destroy(); v.lens.destroy(); v.cover.destroy(); if (v.music && !v.music.pendingRemove) v.music.setVolume(v.volume);
    this.view = null; this.world.release(); this.world.interactionCooldown = 250;
  }
  destroy() { if (this.view) { this.view.frames = Math.max(2, this.view.frames); this.closeViewer(); } }
}
