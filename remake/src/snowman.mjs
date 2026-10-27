import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';
import { murderLevel } from './route.mjs';
import { addItem } from './inventory.mjs';

// obj_nicesnowman/SCR_TEXT226–227: mảnh tuyết và các nhánh trước/sau kết thúc.
export class Snowman {
  constructor(world) {
    this.world = world; this.text = world.dataSource.snowmanDialogue;
    this.entry = world.roomObjects.find((e) => e.item.ObjectName === 'obj_nicesnowman');
    startSnowdinMusic(world); this.refresh();
  }

  refresh() {
    const w = this.world, e = this.entry, taken = w.flags[253] ?? 0, name = taken ? 'spr_sadsnowman_d1' : 'spr_sadsnowman';
    e.object = { ...e.object, Sprite: name }; e.sprite = w.dataSource.sprites.get(name);
    w.dataSource.objects.set(e.item.ObjectName, e.object);
    e.image.setTexture(`${name}:${taken ? Math.min(2, taken - 1) : 0}`).setDepth(e.item.Y + e.sprite.Height);
    w.colliders = w.colliders.filter((c) => c.objectName !== e.item.ObjectName);
    w.colliders.push(createCollider(w.dataSource, e.item));
  }

  hasPiece() {
    const w = this.world;
    return w.inventory.includes(16) || [300, 312].some((base) => Array.from({ length: 11 }, (_, i) => w.flags[base + i]).includes(16));
  }

  interact() {
    const w = this.world, f = w.flags, t = this.text;
    if (!inInteractionRange(w, this.entry)) return false;
    if (murderLevel(f) >= 2) {
      const taken = f[253] ?? 0;
      if (taken <= 2 && !addItem(w, 16)) w.showDialogue(t.murderFull);
      else w.showDialogue(t.murder[Math.min(3, taken)], { onClose: () => { f[253] = taken + 1; this.refresh(); } });
      return true;
    }
    const state = f[56] ?? 0;
    if (f[7] === 1) {
      w.showDialogue(state === 4 || state === 5 ? t.endAte : state === 1 || state === 2 ? this.hasPiece() ? t.endKept : t.endLost : t.endNever);
    } else if (state === 5) w.showDialogue(t.ateAgain);
    else if (state === 4) { f[56] = 5; w.showDialogue(t.ate); }
    else if (state === 2) w.showDialogue(this.hasPiece() ? t.twice : t.empty);
    else if (state === 1) {
      if (this.hasPiece()) w.showDialogue(t.given);
      else if (addItem(w, 16)) { f[56] = 2; w.showDialogue([...t.given, ...t.lost, ...t.replacement]); }
      else w.showDialogue([...t.given, ...t.lost, ...t.lostFull]);
    } else w.showDialogue(t.intro, { onClose: () => w.showChoice(t.prompt, ['Yes', 'No'], (choice) => {
      if (choice === 1) w.showDialogue(t.no);
      else if (addItem(w, 16)) { f[56] = 1; w.showDialogue(t.yes); }
      else w.showDialogue(t.full);
    }) });
    return true;
  }
}
