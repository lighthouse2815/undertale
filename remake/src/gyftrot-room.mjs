import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { SnowdinFallTransition } from './snowdin-fall-transition.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';

// iceexit_new: hai Sans ở hai phía, Gyftrot sau kết thúc và vách băng lấp lánh.
export class GyftrotRoom {
  constructor(world) {
    this.world = world; this.text = world.dataSource.gyftrotRoomDialogue; this.elapsed = 0; this.frames = 0; this.talking = null;
    this.talked = this.doubleTalked = this.npcTalked = 0; startSnowdinMusic(world); this.fall = new SnowdinFallTransition(world);
    const names = ['obj_sans_room', 'obj_doublesans', 'obj_gyftrotnpc'];
    for (const e of world.roomObjects.filter((e) => names.includes(e.item.ObjectName))) {
      const npc = e.item.ObjectName === 'obj_gyftrotnpc';
      if (npc ? world.plot <= 100 || world.flags[203] : world.plot > 64 || world.flags[413] > 0 || world.flags[67] === 1) {
        e.image.destroy(); world.roomObjects = world.roomObjects.filter((entry) => entry !== e);
      } else { world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.MarginBottom); }
    }
    this.sans = world.roomObjects.find((e) => e.item.ObjectName === 'obj_sans_room'); this.double = world.roomObjects.find((e) => e.item.ObjectName === 'obj_doublesans'); this.npc = world.roomObjects.find((e) => e.item.ObjectName === 'obj_gyftrotnpc');
    this.walls = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_icecavewall').map((e) => {
      e.image.setDepth(-900000); return { ...e, timer: Math.random() * 20, alpha: 0, type: 0, shine: world.add.image(e.item.X, e.item.Y, 'spr_icecavewall_2:0').setOrigin(0).setAlpha(0).setDepth(-900000) };
    });
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++; this.fall.step();
      if (this.npc) this.npc.image.setTexture(`${this.npc.object.Sprite}:${this.talking === this.npc ? Math.floor(this.frames * .2) % this.npc.sprite.TextureCount : 0}`);
      for (const wall of this.walls) {
        if (this.frames === 1 && wall.item.CreationCodeEntry) { wall.type = 1; wall.timer -= 40; wall.image.setTexture('spr_icecavewallb:0'); }
        const key = wall.type ? 'spr_icecavewall_2b' : 'spr_icecavewall_2';
        wall.timer++; const frame = Math.floor(Math.abs(Math.sin(wall.timer / 15) * 2.8)) % this.world.dataSource.sprites.get(key).TextureCount;
        wall.shine.setTexture(`${key}:${frame}`).setPosition(wall.item.X + Math.sin(wall.timer / 7), wall.item.Y + Math.cos(wall.timer / 8)).setAlpha(wall.alpha);
        if (wall.timer >= 100 && wall.timer < 150) wall.alpha += .02;
        if (wall.timer >= 300) { wall.alpha -= .02; if (wall.alpha <= 0) { wall.alpha = 0; wall.timer = 0; } }
      }
    }
    return this.fall.locked;
  }
  interact() {
    const w = this.world, e = [this.sans, this.double, this.npc].find((e) => e && inInteractionRange(w, e));
    if (!e) return false;
    const key = e === this.sans ? this.doubleTalked ? 'sansAgain' : 'sans' : e === this.double ? this.talked >= 2 ? 'doubleAgain' : 'double' : w.flags[7] === 1 ? 'npcEnd' : this.npcTalked ? 'npcAgain' : 'npc';
    if (e === this.sans) this.talked++; else if (e === this.double) this.doubleTalked++; else this.npcTalked++;
    const pages = this.text[key]; this.talking = e;
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => { const p = pages[i]; w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_comicsans' ? 10 : 12); }, onClose: () => { this.talking = null; } }); return true;
  }
  destroy() { this.walls.forEach((w) => w.shine.destroy()); }
}
