import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// room_tundra8: Sans bán fried snow, snowdecahedron/camera và Chilldrake sau kết thúc.
export class SnowdinPark {
  constructor(world) {
    this.world = world; this.text = world.dataSource.parkDialogue;
    const f = world.flags;
    this.murder = murderLevel(f) >= 3 && !f[27] || f[203] >= 16;
    this.sans = world.roomObjects.find((e) => e.item.ObjectName === 'obj_sans_room');
    this.chill = world.roomObjects.find((e) => e.item.ObjectName === 'obj_chilldrakenpc');
    if (world.plot >= 46 || f[413] > 0 || f[67] === 1 || murderLevel(f) >= 2 && !f[27] || f[203] >= 16) {
      this.sans.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.sans); this.sans = null;
    }
    if (world.plot <= 100 || f[203]) {
      this.chill.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.chill); this.chill = null;
    }
    for (const e of world.roomObjects.filter((e) => ['obj_sans_room', 'obj_snowdecahedron', 'obj_chilldrakenpc'].includes(e.item.ObjectName))) {
      world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.Height);
    }
  }

  show(pages, next) {
    const w = this.world;
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => {
      w.setDialoguePortrait(pages[i].portrait); w.dialogueText.setFont(pages[i].font, pages[i].font === 'fnt_comicsans' ? 10 : 12);
    }, onClose: next });
  }

  offer(index) {
    const w = this.world, page = this.text.offers[index];
    w.showChoice(page.text, ['Buy', 'No'], (choice) => {
      if (choice === 1) this.show(this.text.no[index]);
      else if (index < 3) this.offer(index + 1);
      else this.show(w.gold >= 50000 ? this.text.rich : this.text.poor);
    });
    w.setDialoguePortrait(page.portrait); w.dialogueText.setFont('fnt_comicsans', 10);
    w.choiceUi.slice(1).forEach((label) => label.setFont('fnt_comicsans', 10));
  }

  interact() {
    const w = this.world;
    const e = w.roomObjects.find((e) => ['obj_sans_room', 'obj_chilldrakenpc', 'obj_snowdecahedron', 'obj_readable_room3'].includes(e.item.ObjectName)
      && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!e) return false;
    const name = e.item.ObjectName;
    if (name === 'obj_sans_room') this.show(this.text.sans, () => this.offer(0));
    else this.show(name === 'obj_chilldrakenpc' ? w.flags[7] === 1 ? this.text.chillEnd : this.text.chill
      : name === 'obj_snowdecahedron' ? this.murder ? this.text.snowball : this.text.decahedron : this.text.camera);
    return true;
  }
}
