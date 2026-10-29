import { touchesObject } from './npc.mjs';

// obj_inwaterspot và obj_indryspot đổi trạng thái khi chân chạm hai mép nước.
export class WaterfallShallowWater {
  constructor(world) {
    this.world = world; this.inWater = false; this.lastSplash = -1; this.frames = 0;
    this.spots = world.dataSource.room.GameObjects.filter(e => e.ObjectName === 'obj_inwaterspot')
      .map(item => ({ item: { ...item, Y: item.Y - 4 }, active: false, entered: false }));
    this.drySpots = world.dataSource.room.GameObjects.filter(e => e.ObjectName === 'obj_indryspot')
      .map(item => ({ ...item, Y: item.Y - 4 }));
    this.ripple = world.add.image(0, 0, 'spr_waterripple:0').setOrigin(0).setVisible(false);
  }
  step() {
    const w = this.world, player = w.player; this.frames++;
    for (const spot of this.spots) {
      if (this.frames === 10 && spot.entered && spot.active && this.inWater) w.sound.play('snd_noise');
      spot.entered = false;
      if (touchesObject(w, player, spot.item)) {
        if (!this.inWater) { this.inWater = true; spot.entered = true; }
        spot.active = true;
      }
    }
    if (this.drySpots.some(item => touchesObject(w, player, item))) this.inWater = false;
    const sprite = w.dataSource.sprites.get(player.texture.key.split(':')[0]);
    if (this.inWater) {
      player.setCrop(0, 0, sprite.Width, sprite.Height - 5).setOrigin(sprite.OriginX / sprite.Width, (sprite.OriginY - 5) / sprite.Height);
      this.ripple.setVisible(true).setPosition(player.x, player.y).setDepth(player.depth + 1);
      const frame = Math.floor(player.frameIndex ?? 0);
      if ((frame === 1 || frame === 3) && this.lastSplash !== frame) w.sound.play('snd_splash');
      this.lastSplash = frame;
    } else {
      player.setCrop().setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height);
      this.ripple.setVisible(false); this.lastSplash = -1;
    }
  }
  destroy() { this.ripple.destroy(); }
}
