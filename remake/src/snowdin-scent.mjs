import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { colorBitmapFont } from './fonts.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';

// Hai nhà chó và biển đánh giá mùi ở nhánh room_tundra8A.
export class SnowdinScent {
  constructor(world) {
    this.world = world; this.text = world.dataSource.scentDialogue; this.labels = [];
    startSnowdinMusic(world);
    const sign = world.roomObjects.find((e) => e.item.ObjectName === 'obj_sign_room');
    world.colliders.push(createCollider(world.dataSource, sign.item));
    for (const e of world.roomObjects.filter((e) => ['obj_sign_room', 'obj_dogehouse', 'obj_dogehouseback'].includes(e.item.ObjectName))) {
      e.image.setDepth(e.item.Y + e.sprite.Height - (e.item.ObjectName === 'obj_dogehouseback' ? 10 : 0));
    }
  }

  clear() { this.labels.forEach((e) => e.destroy()); this.labels = []; }
  color(index) {
    this.clear();
    const word = [null, 'YELLOW', 'BLUE', 'GREEN'][index]; if (!word) return;
    const w = this.world, text = w.dialogueText, lines = text.text.split('\n'), row = lines.findIndex((line) => line.includes(word));
    const metrics = w.cache.bitmapFont.get('fnt_maintext').data;
    const width = (s) => [...s].reduce((sum, c) => sum + metrics.chars[c.codePointAt(0)].xAdvance, 0);
    const x = text.x + width(lines[row].split(word)[0]), y = text.y + row * metrics.lineHeight;
    const font = colorBitmapFont(w, 'fnt_maintext', [null, 'yellow', 'blue', 'red'][index], [null, '#ffff00', '#0000ff', '#ff0000'][index]);
    this.labels = [w.add.rectangle(x, y, width(word), metrics.lineHeight, 0).setOrigin(0).setDepth(100002),
      w.add.bitmapText(x, y, font, word, 12).setDepth(100003)];
    this.labels.forEach((e) => e.setScrollFactor(0));
  }

  interact() {
    const w = this.world, e = w.roomObjects.find((e) => ['obj_sign_room', 'obj_readable_room1', 'obj_readable_room2'].includes(e.item.ObjectName) && inInteractionRange(w, e));
    if (!e) return false;
    const sign = e.item.ObjectName === 'obj_sign_room';
    w.showDialogue(this.text[sign ? 'sign' : e.item.ObjectName === 'obj_readable_room1' ? 'left' : 'right'],
      { onPage: sign ? (i) => this.color(i) : undefined, onClose: () => this.clear() });
    return true;
  }

  destroy() { this.clear(); }
}
