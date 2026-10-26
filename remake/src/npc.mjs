export function touchesObject(world, actor, target, scaleX = 1, scaleY = 1) {
  const sprites = world.dataSource.sprites;
  const actorSprite = sprites.get(actor.texture.key.split(':')[0]);
  const object = world.dataSource.objects.get(target.ObjectName);
  const sprite = sprites.get(object.MaskSprite ?? object.Sprite);
  return actor.x + actorSprite.MarginRight >= target.X + sprite.MarginLeft * scaleX
    && actor.x + actorSprite.MarginLeft <= target.X + (sprite.MarginRight + 1) * scaleX - 1
    && actor.y + actorSprite.MarginBottom >= target.Y + sprite.MarginTop * scaleY
    && actor.y + actorSprite.MarginTop <= target.Y + (sprite.MarginBottom + 1) * scaleY - 1;
}

// path_start: tốc độ theo pixel mỗi frame 30 Hz, điểm có hệ số Speed riêng.
export function walkNpc(world, npc, name, { absolute = true, speed = 3, onComplete } = {}) {
  const points = world.dataSource.paths.get(name).Points;
  const offsetX = absolute ? 0 : npc.x - points[0].X;
  const offsetY = absolute ? 0 : npc.y - points[0].Y;
  let direction;
  if (absolute) npc.setPosition(points[0].X, points[0].Y);
  return world.tweens.chain({
    targets: npc,
    tweens: points.slice(1).map((point, index) => {
      const previous = points[index];
      const dx = point.X - previous.X, dy = point.Y - previous.Y;
      const facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u');
      return { x: point.X + offsetX, y: point.Y + offsetY,
        duration: Math.hypot(dx, dy) / (speed * 30 * point.Speed / 100) * 1000,
        onStart: () => { direction = facing; },
        onUpdate: () => {
          npc.setTexture(`spr_toriel_${facing}:${Math.floor(world.time.now / (1000 / 6)) % 4}`);
          npc.setDepth(npc.y + 8);
        } };
    }),
    onComplete: () => { npc.setTexture(`spr_toriel_${direction}:0`); onComplete?.(); },
  });
}
