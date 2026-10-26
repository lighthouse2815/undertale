import { Geom } from '../vendor/phaser.esm.min.js';

// Tỉ lệ của hai vật cản dài được đặt trong Create của game gốc.
const scales = { obj_solidlong: [400, 1], obj_solidtall: [1, 400], obj_solidlongleft: [-400, 1], obj_plotwall1: [1, 400], obj_plotwall2: [1, 400], obj_plotwall3: [1, 400] };
export function createColliders(data) {
  const inherits = (name, target) => {
    for (let current = name; current; current = data.objects.get(current)?.ParentObject) if (current === target) return true;
    return false;
  };
  return data.room.GameObjects.filter((item) => inherits(item.ObjectName, 'obj_solidparent') || inherits(item.ObjectName, 'obj_diagoparent'))
    .map((item) => createCollider(data, item));
}

export function createCollider(data, item) {
  const object = data.objects.get(item.ObjectName);
  const name = object.MaskSprite ?? object.Sprite;
  const sprite = data.sprites.get(name);
  const [sx, sy] = scales[item.ObjectName] ?? [item.ScaleX, item.ScaleY];
  const x1 = item.X + (sprite.MarginLeft - sprite.OriginX) * sx;
  const x2 = item.X + (sprite.MarginRight + 1 - sprite.OriginX) * sx;
  const y1 = item.Y + (sprite.MarginTop - sprite.OriginY) * sy;
  const y2 = item.Y + (sprite.MarginBottom + 1 - sprite.OriginY) * sy;
  return { objectName: item.ObjectName, rectangle: new Geom.Rectangle(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1)),
    mask: sprite.CollisionKind === 'Precise' ? `${name}:mask` : null, sprite, x: item.X, y: item.Y, sx, sy };
}

export function blocked(scene, colliders, x, y) {
  // Mask của Frisk: phần chân, từ hàng 19 đến 29 trên sprite 20×30.
  const feet = new Geom.Rectangle(x, y + 19, 20, 11);
  return colliders.some((body) => {
    if (body.disabled) return false;
    if (!Geom.Rectangle.Overlaps(feet, body.rectangle)) return false;
    if (!body.mask) return true;
    for (let px = Math.max(Math.floor(feet.left), Math.floor(body.rectangle.left)); px < Math.min(feet.right, body.rectangle.right); px++) {
      for (let py = Math.max(Math.floor(feet.top), Math.floor(body.rectangle.top)); py < Math.min(feet.bottom, body.rectangle.bottom); py++) {
        const mx = Math.floor((px - body.x) / body.sx + body.sprite.OriginX);
        const my = Math.floor((py - body.y) / body.sy + body.sprite.OriginY);
        if (scene.textures.getPixelAlpha(mx, my, body.mask) > 0) return true;
      }
    }
    return false;
  });
}

export function movePlayer(scene, player, colliders, input) {
  const oldX = player.x, oldY = player.y;
  // Game gốc chạy 30 FPS, 3 pixel mỗi bước; giữ tốc độ độc lập FPS màn hình.
  for (const [direction, dx, dy] of [['left', -3, 0], ['right', 3, 0], ['up', 0, -3], ['down', 0, 3]]) {
    if (!input(direction)) continue;
    player.facing = { down: 'd', right: 'r', up: 'u', left: 'l' }[direction];
    const x = player.x + dx, y = player.y + dy;
    // Step gốc kích hoạt cửa trước pha va chạm tường. Nhiều cửa nằm ngay trên tường biên.
    if (scene.findDoor(x, y) || !blocked(scene, colliders, x, y)) player.setPosition(x, y);
  }
  const moved = player.x !== oldX || player.y !== oldY;
  player.frameIndex = moved ? (player.frameIndex + 0.2) % 4 : 0;
  player.setTexture(`spr_mainchara${player.facing}:${Math.floor(player.frameIndex)}`);
  player.setDepth(player.y + 30);
}
