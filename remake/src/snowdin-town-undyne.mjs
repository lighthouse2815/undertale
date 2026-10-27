import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { addItem } from './inventory.mjs';

// obj_undyne_friendc tạiTown doPapyrus_room tạo sau389>=3; thư56/57 và lời chéo.
export class SnowdinTownUndyne {
  constructor(world) {
    this.world = world; this.text = world.dataSource.townUndyneDialogue; this.elapsed = 0; this.frames = 0; this.talked = 0;
    const p = world.snowdinTownPapyrus;
    if (!p.pap || !p.late || world.flags[389] < 3 || !world.flags[389]) return;
    const object = world.dataSource.objects.get('obj_undyne_friendc'), sprite = world.dataSource.sprites.get(object.Sprite);
    const item = { ObjectName: 'obj_undyne_friendc', X: p.pap.image.x - 34, Y: p.pap.image.y - 14, ScaleX: 1, ScaleY: 1 };
    this.actor = { item, object, sprite, image: world.add.image(item.X, item.Y, `${object.Sprite}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(item.Y + sprite.MarginBottom) };
    world.colliders.push(createCollider(world.dataSource, item)); world.flags[430] = world.flags[390] = 0;
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      if (this.actor) this.actor.image.setTexture(`spr_undyne_${this.facing ?? 'd'}t:${this.talking ? Math.floor(this.frames * .25) % this.world.dataSource.sprites.get(`spr_undyne_${this.facing ?? 'd'}t`).TextureCount : 0}`);
    }
  }
  show(key) {
    const w = this.world, pages = this.text[key]; this.talking = true;
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => { const p = pages[i]; w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_papyrus' ? 8 : 12); }, onClose: () => { this.talking = false; this.facing = 'd'; } });
  }
  interact() {
    if (!this.actor) return false;
    const w = this.world, f = w.flags;
    const near = (e) => inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } });
    if (near(this.actor)) {
      let key = this.talked ? 'repeat' : 'normal';
      if (f[493] === 9) { key = 'letter9'; if ([1, 2].includes(f[494])) { if (addItem(w, 57)) { key = 'ex'; f[494] = 3; } else key = 'exFull'; } }
      if (f[493] === 8) { if (addItem(w, 56)) { key = 'letter'; f[493] = 9; f[8] = 1; } else key = 'letterFull'; }
      this.talked++; this.facing = { u: 'd', d: 'u', l: 'r', r: 'l' }[w.player.facing]; this.show(key); return true;
    }
    const e = w.roomObjects.find((e) => ['obj_papmailbox', 'obj_readable_room2'].includes(e.item.ObjectName) && near(e));
    if (!e) return false;
    if (e.item.ObjectName === 'obj_papmailbox') { if (!w.inventory.some((id) => [56, 57].includes(id))) return false; this.show('mailbox'); w.snowdinTownPapyrus.mailTalked++; }
    else this.show(w.snowdinTownPapyrus.shedRead++ ? 'shedAgain' : f[67] < 0 ? 'shedPunishment' : 'shed');
    return true;
  }
}
