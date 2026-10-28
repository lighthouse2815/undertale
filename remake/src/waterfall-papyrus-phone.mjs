import { waterfallPapyrusSecondCall } from './waterfall-papyrus-second-call.mjs';
import { touchesObject } from './npc.mjs';
import { waterfallPapyrusCall } from './waterfall-papyrus-call.mjs';

// obj_phonecall_room em room_water5 e SCR_TEXT 553–554.
export class WaterfallPapyrusPhone {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_phonecall_room');
    this.second = world.dataSource.name === 'room_water12';
    this.done = this.second ? (world.flags[354] ?? 0) > 0 : world.plot > 106;
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
    this.done = true;
    if (this.second) w.flags[354] = 1; else w.plot = 107;
    const [x,y] = this.second ? [380,40] : [40,340];
    this.flowey = w.add.image(x,y,'spr_floweysink:0').setOrigin(0).setDepth(y+25); this.floweyFrame = 0;
    if (w.flags[67] === 1) return false;
    w.sound.play('snd_phone'); w.release();
    if (this.second) { this.show(waterfallPapyrusSecondCall(w.flags), () => w.release()); return true; }
    w.flags[75] = w.armor;
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
