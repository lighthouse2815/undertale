import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { startSnowdinMusic, showSnowdinSave } from './snowdin-start.mjs';

// Phòng spaghetti: SAVE, lỗ chuột, microwave, đĩa và lời nhắn Papyrus.
export class SnowdinSpaghetti {
  constructor(world) {
    this.world = world; this.text = world.dataSource.spaghettiDialogue; this.elapsed = 0; this.frames = 0;
    this.star = world.roomObjects.find((e) => e.item.ObjectName === 'obj_savepoint');
    startSnowdinMusic(world);
    for (const e of world.roomObjects.filter((e) => ['obj_spaghetti', 'obj_microwave', 'obj_spagnot'].includes(e.item.ObjectName))) {
      world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.Height);
    }
  }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      this.star.image.setTexture(`${this.star.object.Sprite}:${Math.floor(this.frames * .2) % this.star.sprite.TextureCount}`);
    }
  }

  interact() {
    const w = this.world, e = w.roomObjects.find((e) => ['obj_savepoint', 'obj_spaghetti', 'obj_microwave', 'obj_spagnot', 'obj_mousehole'].includes(e.item.ObjectName) && inInteractionRange(w, e));
    if (!e) return false;
    const name = e.item.ObjectName;
    if (name === 'obj_mousehole') { if (!w.sound.isPlaying('snd_movemenu')) w.sound.play('snd_movemenu'); }
    else if (name === 'obj_savepoint') showSnowdinSave(w, this.text);
    else if (name === 'obj_spagnot') {
      const pages = this.text[w.flags[7] === 1 ? 'noteEnd' : 'note'];
      w.showDialogue(pages.map((p) => p.text), { onPage: (i) => w.dialogueText.setFont(pages[i].font, pages[i].font === 'fnt_papyrus' ? 8 : 12) });
    } else w.showDialogue(this.text[name === 'obj_microwave' ? 'microwave' : w.flags[7] === 1 ? 'spaghettiEnd' : 'spaghetti']);
    return true;
  }
}
