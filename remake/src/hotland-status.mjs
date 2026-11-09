import { touchesObject } from './npc.mjs';

const statuses = [
  '* just realized i didn\'t watch\n  undyne fight the human v.v',
  '* well i know she\'s unbeatable\n  i\'ll ask her abt it later ^0.^0 ',
  '* for now i gotta call up the\n  human and guide them =^0.^0=',
];

// obj_notify_room: cờ 369 theo tiến trình bài đăng; cờ 368 tắt thông báo.
export class HotlandStatus {
  constructor(world) { this.world = world; this.elapsed = 0; this.triggers = world.dataSource.room.GameObjects.filter(e => e.ObjectName === 'obj_notify_room').map(item => ({ item, done: false, scaleY: item.CreationCodeEntry?.endsWith('_6145_Create') ? 3 : item.CreationCodeEntry?.endsWith('_6146_Create') ? 5 : 1 })); }
  checkTrigger() {
    const w = this.world; if (w.dialogue) return false;
    const trigger = this.triggers.find(e => !e.done && touchesObject(w, w.player, e.item, 1, e.scaleY)); if (!trigger) return false;
    trigger.done = true; const previous = w.flags[369] ?? 0;
    let pages;
    if (w.dataSource.name === 'room_fire5') {
      if (previous !== 4) return false;
      w.flags[369] = 5; pages = ['* gonna call them in a\n  minute!!! =^0.^0='];
    } else if (w.dataSource.name === 'room_fire6') {
      if (previous >= 7) return false;
      if (previous < 6) { w.flags[369] = 6; pages = ["* I HATE USING THE PHONE I DON'T\n  WANT TO DO THIS LMAO ^0.^0 "]; }
      else { w.flags[369] = 7; pages = ['* omg ive had my claw over\n  the last digit for 5 minutes', "* omg i'm just gonna do it\n* i'm just gonna call!!!!"]; }
    } else {
      if (previous > 3) return false;
      const step = previous < 2 ? 0 : previous === 2 ? 1 : 2; w.flags[369] = step + 2; pages = [statuses[step]];
    }
    if (w.flags[368] === 1) return false;
    w.sound.play('snd_textnoise'); w.release();
    this.note = w.add.image(w.player.x, w.player.y - 10, 'spr_musblc:0').setOrigin(0).setDepth(99999); this.noteTime = 30;
    pages[0] = '\n' + pages[0];
    w.showDialogue(pages, { onPage: index => this.title?.setVisible(index === 0), onClose: () => { this.title?.destroy(); this.title = null; this.note?.destroy(); this.note = null; } });
    this.title = w.add.bitmapText(w.dialogueText.x, w.dialogueText.y, 'fnt_maintext', 'ALPHYS updated status.', 12).setTint(0xffff00).setScrollFactor(0).setDepth(100002);
    return true;
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; if (this.note && --this.noteTime <= 0) { this.note.destroy(); this.note = null; } }
  }
  destroy() { this.note?.destroy(); this.title?.destroy(); }
}
