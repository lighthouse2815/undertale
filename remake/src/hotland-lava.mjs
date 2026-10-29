// obj_hotlandparalava và obj_hotlandrock_bg.
export class HotlandLava {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0;
    const { Width: width, Height: height } = world.dataSource.room;
    const original = world.roomObjects.find(entry => entry.item.ObjectName === 'obj_hotlandparalava');
    if (original) { original.image.destroy(); world.roomObjects = world.roomObjects.filter(entry => entry !== original); }
    this.shade = world.add.graphics().setDepth(-2000000);
    this.bands = [
      [80, .25, .5], [68, .5, .75], [54, .8, 1], [38, .9, 1], [20, 1, 1],
    ].map(([y, speed, alpha], i) => ({ speed, image: world.add.tileSprite(0, height - y, width, 20, 'spr_hotlandlava:0').setOrigin(0).setDepth(-1100000 + i).setAlpha(alpha) }));
    this.drawShade();
  }
  drawShade() {
    const { Width: width, Height: height } = this.world.dataSource.room, count = height / 40;
    this.shade.clear().fillStyle(0x000000, .3 + Math.sin(this.frame / 15) * .1).fillRect(-10, -10, width + 20, height + 20);
    for (let i = 0; i < count; i++) this.shade.fillStyle(0x000000, i / count).fillRect(-10, i * 40, width + 20, 40);
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frame++;
      for (const band of this.bands) band.image.tilePositionX = (band.image.tilePositionX - band.speed + 20) % 20;
      this.drawShade();
    }
  }
  destroy() { this.shade.destroy(); for (const band of this.bands) band.image.destroy(); }
}
