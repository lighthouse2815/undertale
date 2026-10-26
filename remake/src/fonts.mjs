export function registerBitmapFont(scene, key, font) {
  // Chuyển metric font GameMaker sang dữ liệu BitmapText của Phaser; giữ atlas gốc.
  const { width, height } = scene.textures.get(key).getSourceImage();
  const chars = Object.fromEntries(font.Glyphs.map((glyph) => [glyph.C, {
    x: glyph.X, y: glyph.Y, width: glyph.W, height: glyph.H,
    centerX: Math.floor(glyph.W / 2), centerY: Math.floor(glyph.H / 2),
    xOffset: glyph.O, yOffset: 0, xAdvance: glyph.S, data: {}, kerning: {},
    u0: glyph.X / width, v0: glyph.Y / height,
    u1: (glyph.X + glyph.W) / width, v1: (glyph.Y + glyph.H) / height,
  }]));
  scene.cache.bitmapFont.add(key, { texture: key, frame: null,
    data: { font: key, size: font.EmSize, lineHeight: font.LineHeight || 16, chars } });
}

export function colorBitmapFont(scene, key, name, color) {
  const colorKey = `${key}:${name}`;
  if (scene.cache.bitmapFont.exists(colorKey)) return colorKey;
  const { width, height } = scene.textures.get(key).getSourceImage();
  // BitmapText của Phaser Canvas không hỗ trợ tint; nhuộm atlas một lần, dùng lại cache.
  const canvas = scene.textures.createCanvas(colorKey, width, height);
  canvas.context.drawImage(scene.textures.get(key).getSourceImage(), 0, 0);
  canvas.context.globalCompositeOperation = 'source-in';
  canvas.context.fillStyle = color;
  canvas.context.fillRect(0, 0, width, height);
  canvas.refresh();
  scene.cache.bitmapFont.add(colorKey, { texture: colorKey, frame: null,
    data: scene.cache.bitmapFont.get(key).data });
  return colorKey;
}
