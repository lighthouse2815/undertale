import { murderLevel } from './route.mjs';

// room_water1: dòng nước đổi hướng, băng trôi và thác phía trước.
export class WaterfallEntrance {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0;
    this.water = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_waterdivot_test').map((e) => {
      e.image.setDepth(-e.object.Depth);
      return { ...e, startY: e.image.y, speed: .15 + Math.random() * .05, sine: Math.random() * 20, frame: 0, vx: 1.5, vy: 0, moved: false };
    });
    this.ice = world.roomObjects.find((e) => e.item.ObjectName === 'obj_icecube_water1');
    if (this.ice && (world.flags[7] === 1 || murderLevel(world.flags) >= 7)) { this.ice.image.destroy(); this.ice = null; }
    if (this.ice) { this.ice.image.setPosition(-48, 48).setDepth(-this.ice.object.Depth); this.iceFrame = 0; }
    this.falls = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_foreground_waterfall').map((e) => {
      e.image.destroy();
      return { x: e.item.X, y: e.item.Y, images: Array.from({ length: 20 }, () => world.add.image(e.item.X, e.item.Y, `${e.object.Sprite}:0`).setOrigin(0).setScale(2).setAlpha(.2).setDepth(-e.object.Depth)) };
    });
    if (!world.townMusic && !world.waterfallMusic) { world.waterfallMusic = world.sound.add('mus_ambientwater', { loop: true, volume: .8 }); world.waterfallMusic.once('play', () => world.waterfallMusic?.setVolume(.8)); world.waterfallMusic.play(); world.waterfallMusic.setVolume(.8); }
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } }
  step() {
    const w = this.world; this.frames++;
    for (const e of this.water) {
      e.image.x += e.vx + Math.sin(e.sine++ / 6) * .2; e.image.y += e.vy;
      if (e.image.x > w.dataSource.room.Width) e.image.x = -10;
      if (!e.moved && ((e.image.y <= 50 && e.image.x >= 460) || (e.image.y <= 70 && e.image.x >= 480) || (e.image.y <= 90 && e.image.x >= 500))) { e.vy = -e.vx; e.vx = 0; e.moved = true; }
      if (e.image.y <= -15) { e.moved = false; e.image.setPosition(-10, e.startY); e.vx = 1.5; e.vy = 0; }
      e.frame = (e.frame + e.speed) % e.sprite.TextureCount; e.image.setTexture(`${e.object.Sprite}:${Math.floor(e.frame)}`);
    }
    if (this.ice) {
      const e = this.ice; if (e.image.x < 464) e.image.x = Math.min(464, e.image.x + 1.5); else e.image.y -= 1.5;
      if (e.image.y <= -64) e.image.setPosition(-48, 48);
      this.iceFrame = (this.iceFrame + .1) % e.sprite.TextureCount; e.image.setTexture(`${e.object.Sprite}:${Math.floor(this.iceFrame)}`);
    }
    const camera = Math.max(0, Math.min(w.dataSource.room.Width - 320, w.cameras.main.scrollX)), anim = (this.frames * 3) % 180;
    for (const fall of this.falls) fall.images.forEach((image, i) => image.setPosition(fall.x - camera * .5, -210 + fall.y + i * 30 + anim));
  }
  destroy() { for (const fall of this.falls) fall.images.forEach((image) => image.destroy()); }
}
