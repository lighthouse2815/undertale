import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// room_tundra_library: sáu cuốn sách và bốn cư dân, không tạo nhạc mới khi qua cửa.
export class SnowdinLibrary {
  constructor(world) {
    this.world = world; this.text = world.dataSource.libraryDialogue; this.elapsed = 0; this.frames = 0; this.talking = null;
    this.npcs = [];
    for (const e of [...world.roomObjects]) {
      const name = e.item.ObjectName;
      if (name.startsWith('obj_librarynpc_')) {
        if (murderLevel(world.flags) >= 7) { e.image.destroy(); world.roomObjects = world.roomObjects.filter((entry) => entry !== e); continue; }
        this.npcs.push(e); world.colliders.push(createCollider(world.dataSource, e.item));
      }
      if (e.image) e.image.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY);
    }
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.frames++; for (const e of this.npcs) e.image.setTexture(`${e.object.Sprite}:${e === this.talking ? Math.floor(this.frames * .2) % e.sprite.TextureCount : 0}`); }
  }
  interact() {
    const w = this.world, e = w.roomObjects.find((e) => (/^obj_readable_room[1-5]$/.test(e.item.ObjectName) || e.item.ObjectName === 'obj_readable_modernbook' || this.npcs.includes(e)) && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!e) return false;
    const name = e.item.ObjectName; let pages;
    if (name.startsWith('obj_librarynpc_')) {
      const key = name.replace('obj_librarynpc_', ''), data = this.text[key]; let branch = 'normal';
      if (key === 'jumbler') branch = (w.flags[58] ?? 0) === 0 ? 'jumble' : w.flags[58] === 1 ? 'crossword' : 'normal';
      if (w.plot >= 122) branch = 'late';
      if (w.flags[7] === 1) { if (key !== 'jumbler') branch = 'end'; else if ((w.flags[58] ?? 0) === 0) branch = 'endJumble'; else if (w.flags[58] === 1) branch = 'endCrossword'; }
      pages = data[branch]; this.talking = e;
    } else pages = this.text[name === 'obj_readable_modernbook' ? murderLevel(w.flags) >= 7 ? 'modernMurder' : 'modern' : name.replace('obj_readable_', '')];
    w.showDialogue(pages, { onClose: () => { this.talking = null; } }); return true;
  }
}
