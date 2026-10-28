import { touchesObject } from './npc.mjs';
import { waterfallPapyrusCall } from './waterfall-papyrus-call.mjs';

// obj_phonecall_room em room_water5 e SCR_TEXT 553–554.
export class WaterfallPapyrusPhone {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_phonecall_room');
    this.done = world.plot > 106;
  }
  show(pages, next) {
    const w = this.world;
    w.showDialogue(pages.map((p) => p.text), { onPage: (i) => {
      const p = pages[i]; w.setDialoguePortrait(p.papyrus ? 'spr_face_papyrus' : false);
      w.dialogueText.setFont(p.papyrus ? 'fnt_papyrus' : 'fnt_maintext', p.papyrus ? 8 : 12);
    }, onClose: next });
  }
  checkTrigger() {
    const w = this.world;
    if (this.done || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 5)) return false;
    this.done = true; w.plot = 107; this.flowey = w.add.image(40,340,'spr_floweysink:0').setOrigin(0).setDepth(365); this.floweyFrame = 0;
    if (w.flags[67] === 1) return false;
    w.flags[75] = w.armor; w.sound.play('snd_phone'); w.release();
    this.show(waterfallPapyrusCall(w.armor), () => w.showChoice('* (What will you say?)', ['Yes','No'], (choice) => {
      w.flags[76] = choice; this.show(waterfallPapyrusCall(w.armor, choice), () => w.release());
    })); return true;
  }
  update(delta) {
    this.elapsed = Math.min(200,this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
  }
  step() {
    if (!this.flowey?.active) return;
    const w = this.world, c = w.cameras.main;
    if (this.floweyFrame || this.flowey.x > c.scrollX - 37 && this.flowey.x < c.scrollX + 357 && this.flowey.y > c.scrollY - 18 && this.flowey.y < c.scrollY + 258) {
      this.floweyFrame += .5;
      if (this.floweyFrame >= 6) { this.flowey.destroy(); w.flags[9] = (w.flags[9] ?? 0) + 1; }
      else this.flowey.setTexture(`spr_floweysink:${Math.floor(this.floweyFrame)}`);
    }
  }
  destroy() { this.flowey?.destroy(); }
}
