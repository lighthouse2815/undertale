import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';
import spaghetti from './snowdin-spaghetti.json' with { type: 'json' };

// Phòng giam của Papyrus sau khi bị bắt, cùng cửa thoát sang thị trấn.
export class PapyrusGarage {
  constructor(world) {
    this.world = world;
    for (const e of world.roomObjects.filter((item) => ['obj_dogfood', 'obj_doggiebed', 'obj_spagnot', 'obj_chewtoy'].includes(item.item.ObjectName))) {
      world.colliders.push(createCollider(world.dataSource, e.item)); e.image.setDepth(e.item.Y + e.sprite.Height);
    }
  }
  interact() {
    const w = this.world, e = w.roomObjects.find((item) => ['obj_dogfood', 'obj_doggiebed', 'obj_spagnot', 'obj_chewtoy'].includes(item.item.ObjectName) && inInteractionRange(w, item));
    if (!e) return false;
    const flag = w.flags[67] ?? 0;
    if (e.item.ObjectName === 'obj_spagnot') {
      if (flag === 0) { w.showDialogue(["WHAT!?\nTHAT'S IMPOSSIBLE."]); return true; }
      const pages = [spaghetti.note[0], ...(flag === -1 ? [
        'SORRY, I HAVE TO LOCK\nYOU IN THE GUEST ROOM\nUNTIL UNDYNE ARRIVES.', 'FEEL FREE TO MAKE\nYOURSELF AT HOME!!!', 'REFRESHMENTS AND\nACCOMODATIONS HAVE\nBEEN PROVIDED.', ' \n - NYEHFULLY YOURS,\n        PAPYRUS'
      ] : flag === -2 ? ['PLEASE ASK BEFORE\nYOU ESCAPE!!!', 'WHEN YOU WENT\nMISSING I GOT\nWORRIED SICK!!!', '  - SLIGHTLY\n  BONETROUSLED,\n  PAPYRUS'] : flag === -3 ? ["IF YOU'RE JUST\nLOOKING FOR A\nPLACE TO STAY...", "JUST ASK!!!\nYOU DON'T NEED\nTO FIGHT ME!!!", ' \n - YOUR HOST,\n   PAPYRUS'] : (w.flags[7] === 1 ? spaghetti.noteEnd : spaghetti.note).slice(1).map((p) => p.text))];
      const lines = pages.map((p) => typeof p === 'string' ? p : p.text);
      w.showDialogue(lines, { onPage: (i) => w.dialogueText.setFont(i === 0 ? 'fnt_maintext' : 'fnt_papyrus', i === 0 ? 12 : 8) });
    } else {
      const pages = e.item.ObjectName === 'obj_dogfood' ? [flag < -1 ? "* (There's a hot dog cut up\n  into the kibble.)" : "* (Unfortunately, it's just\n  dry food.)"] : e.item.ObjectName === 'obj_doggiebed' ? ["* (It's too small to sleep\n  on.)"] : ["* (It's a squeaky chew toy.)"];
      w.showDialogue(pages);
    }
    return true;
  }
}
