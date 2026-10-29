const PARTS = [
  ['face', 80, 0, 9], ['hair', 4, -4, 4], ['armor', 52, 56, 1],
  ['rightarm', 148, 78, 1], ['pants', 78, 120, 1], ['leftarm', 82, 66, 1], ['legs', 78, 154, 2],
];

export function loadUndyneBossBodyAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const [part, , , count] of PARTS) {
    const key = `spr_undyneb_${part}`;
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < count; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
}

// Chuyển động nghỉ của obj_undyneb_body; tọa độ scene bằng một nửa tọa độ game gốc.
export class UndyneBossBody {
  constructor(scene, x = 105, y = 10) {
    this.scene = scene; this.x = x; this.y = y; this.siner = 0; this.frame = 0; this.emotion = 0;
    this.parts = PARTS.map(([part, dx, dy], index) => {
      const key = `spr_undyneb_${part}`, meta = scene.cache.json.get(key);
      return scene.add.image(x + dx / 2, y + dy / 2, `${key}:0`).setOrigin(meta.OriginX / meta.Width, meta.OriginY / meta.Height).setDepth(30 - index);
    });
  }
  step() {
    this.frame++; this.siner += 1.2;
    const slow = Math.sin(this.siner / 6), fast = Math.sin(this.siner / 3), [head, hair, armor, right, pants, left, legs] = this.parts;
    head.setPosition(this.x + 40, this.y + slow).setTexture(`spr_undyneb_face:${this.emotion}`);
    hair.setPosition(this.x + 2, this.y - 2 + slow * 2).setTexture(`spr_undyneb_hair:${Math.floor(this.frame / 4) % 4}`);
    armor.setPosition(this.x + 26, this.y + 28 + slow * 2);
    right.setPosition(this.x + 74 - fast, this.y + 39 + slow * 3 + fast);
    pants.setPosition(this.x + 39, this.y + 60 + slow);
    left.setPosition(this.x + 41 + slow * 2.5, this.y + 33 + slow * 2.5);
    legs.setPosition(this.x + 39, this.y + 77);
  }
  destroy() { this.parts.forEach(part => part.destroy()); }
}
