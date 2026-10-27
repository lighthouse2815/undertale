import { SnowdinXoxoPuzzle } from './snowdin-xoxo-puzzle.mjs';
import { touchesObject, inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// room_tundra_xoxosmall: hai ô X/O, nút kiểm tra và câu hỏi spaghetti của Papyrus6.
export class SnowdinXoxoSmall extends SnowdinXoxoPuzzle {
  constructor(world) {
    super(world, 53); this.text = world.dataSource.xoxoSmallDialogue;
    if (murderLevel(world.flags) >= 4 && !world.flags[27]) world.flags[62] = 1;
    this.stage = world.flags[62] > 0 ? 'done' : 'waiting';
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus6');
    if (this.stage === 'waiting') this.pap = world.add.image(450, 90, 'spr_papyrus_rt:0').setOrigin(0).setDepth(134);
  }
  pose(key, frame = 0) { this.pap.setTexture(`${key}:${frame}`).setDepth(this.pap.y + 44); }
  show(key, next) {
    const w = this.world, pages = this.text[key]; this.stage = 'talking';
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => { w.setDialoguePortrait(pages[i].portrait); w.dialogueText.setFont('fnt_papyrus', 8); }, onClose: next });
  }
  step() {
    this.stepPuzzle(); const w = this.world;
    if (this.alertFrames && --this.alertFrames === 0) this.alert?.destroy();
    if (this.stage === 'notice' && this.frames >= 20) this.show('intro', () => {
      w.showChoice('* (What do you tell Papyrus\n  about his spaghetti?)', ['Ate it', 'Left it'], (choice) => {
        w.flags[62] = choice + 1;
        this.show(choice ? 'left' : 'ate', () => { this.stage = 'leaving'; this.locked = false; w.release(); w.confirmPressed = false; });
      });
    });
    if (this.stage === 'leaving' && this.pap?.active) {
      this.pap.x += 4; this.pose('spr_papyrus_r', Math.floor(this.total * .2) % 4);
      if (this.pap.x > w.dataSource.room.Width + 27) { this.pap.destroy(); this.stage = 'done'; }
    }
  }
  checkTrigger(previous) {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 999)) return false;
    w.player.setPosition(previous.x, previous.y); w.release(); this.pose('spr_papyrus_lt'); this.locked = true; this.stage = 'notice'; this.frames = 0;
    this.alert = w.add.image(this.pap.x + 3, this.pap.y - 12, 'spr_exc:0').setOrigin(0).setDepth(1000); this.alertFrames = 30; return true;
  }
  interact() { if (!inInteractionRange(this.world, this.sign)) return false; this.world.showDialogue(this.text.sign); return true; }
  destroy() { this.alert?.destroy(); this.pap?.destroy(); }
}
