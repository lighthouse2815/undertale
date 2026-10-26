// obj_stalkerflowey: đợi lọt vào camera, rồi chìm xuống với tốc độ 0,5/frame.
export function spawnStalkerFlowey(world, x, y) {
  const sprite = world.add.sprite(x, y, 'spr_floweysink:0').setOrigin(0).setDepth(y);
  const key = 'flowey-stalker-sink';
  if (!world.anims.exists(key)) world.anims.create({ key, frameRate: 15,
    frames: Array.from({ length: world.dataSource.sprites.get('spr_floweysink').TextureCount }, (_, i) => ({ key: `spr_floweysink:${i}` })) });
  sprite.once('animationcomplete', () => {
    world.flags[9] = (world.flags[9] ?? 0) + 1;
    sprite.destroy();
  });
  return sprite;
}

export function updateStalkerFlowey(world, sprite) {
  if (!sprite?.active || sprite.anims.isPlaying) return;
  const camera = world.cameras.main;
  if (sprite.x > camera.scrollX - 37 && sprite.x < camera.scrollX + camera.width + 37
    && sprite.y > camera.scrollY - 18 && sprite.y < camera.scrollY + camera.height + 18) sprite.play('flowey-stalker-sink');
}
