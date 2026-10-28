import waterfallText from './waterfall-nice-cream.json' with { type: 'json' };
import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { addItem } from './inventory.mjs';

// obj_nicecreamguy tại Snowdin, SCR_TEXT230/231. Waterfall/Hotland chuyển riêng.
export class NiceCream {
  constructor(world) {
    this.world = world; this.waterfall = world.dataSource.name === 'room_water_nicecream'; this.text = world.dataSource.niceCreamDialogue; this.elapsed = 0; this.frames = 0; this.stage = 'idle'; this.locked = false; this.display = [];
    this.entry = world.roomObjects.find((e) => e.item.ObjectName === 'obj_nicecreamguy');
    const f = world.flags;
    if ((world.plot >= (this.waterfall ? 121 : 101)) || murderLevel(f) >= 3 && !f[27] || f[203] >= 16) {
      this.entry.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.entry); this.entry = null; return;
    }
    this.pose((this.waterfall ? f[79] : f[60]) > 0 ? 'spr_icecreamguy_happy' : 'spr_icecreamguy_sad');
    world.colliders.push(createCollider(world.dataSource, this.entry.item));
  }

  pose(key) { this.sprite = key; this.entry.image.setTexture(`${key}:0`).setDepth(this.entry.item.Y + this.entry.sprite.Height); }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      if (this.entry) this.entry.image.setTexture(`${this.sprite}:${this.world.dialogue ? Math.floor(this.frames * .2) % this.world.dataSource.sprites.get(this.sprite).TextureCount : 0}`);
      if (this.stage === 'turning' && this.frames > 30) {
        this.pose('spr_icecreamguy_happy'); this.stage = 'talking';
        this.world.showDialogue(this.waterfall ? waterfallText.customer : this.text.customer, { onClose: () => { this.world.flags[60] = 1; if (this.waterfall) this.world.flags[79] = 8; this.offer(); } });
      }
    }
    if (this.display.length) this.refreshDisplay();
    return this.locked;
  }

  showDisplay() {
    const w = this.world;
    this.display = [w.add.rectangle(204, 92, 100, 53, 0xffffff).setOrigin(0), w.add.rectangle(207, 95, 94, 47, 0x000000).setOrigin(0),
      w.add.bitmapText(218, 100, 'fnt_maintext', '', 12), w.add.bitmapText(218, 120, 'fnt_maintext', '', 12)];
    this.display.forEach((child) => child.setScrollFactor(0).setDepth(100003)); this.refreshDisplay();
  }

  refreshDisplay() {
    const w = this.world;
    this.display[2].setText(this.text.gold.replace(/\\\[G\]/g, String(w.gold)));
    this.display[3].setText(this.text.space.replace(/\\\[1\]/g, String(w.inventory.length)));
  }

  offer() {
    if (this.waterfall) { this.offerWaterfall(); return; }
    const w = this.world, t = this.text; this.stage = 'talking';
    this.showDisplay();
    w.showDialogue(w.flags[60] < 5 ? t.offer : t.offerAgain, { onClose: () => w.showChoice(t.prompt, ['Yes', 'No'], (choice) => {
      let lines;
      if (choice === 1) lines = t.no;
      else if (w.gold < 15) lines = t.poor;
      else if (!addItem(w, 17)) lines = t.full;
      else { w.gold -= 15; w.flags[60] = (w.flags[60] ?? 0) + 15; lines = t.buy; }
      this.refreshDisplay(); w.showDialogue(lines, { onClose: () => this.close() });
    }) });
  }

  offerWaterfall() {
    const w=this.world, t=waterfallText, cards=w.inventory.filter(id=>id===26).length, discount=w.flags[85]===1, price=discount?15:25;
    const lines=cards>=3?t.redeem:discount?(w.flags[60]<5?t.umbrella:t.umbrellaAgain):(w.flags[60]<5?t.offer:t.offerAgain);
    const prompt=cards>=3?"* It's free!":discount?'* Discount Ice Cream! 15G!':'* Now just 25G!';
    this.stage='talking'; this.showDisplay();
    w.showDialogue(lines,{onClose:()=>w.showChoice(prompt,['Yes','No'],choice=>{
      let result;
      if (choice===1) result=t.no;
      else if (cards>=3) { let left=3; w.inventory=w.inventory.filter(id=>id===26 && left>0 ? (--left,false) : true); addItem(w,17); result=t.free; }
      else if (w.gold<price) result=discount?t.poorDiscount:t.poor;
      else if (!addItem(w,17)) result=t.full;
      else { w.gold-=price; w.flags[60]=(w.flags[60]??0)+price; w.flags[80]=(w.flags[80]??0)+1; result=t.buy; }
      this.refreshDisplay(); w.showDialogue(result,{onClose:()=>this.close()});
    })});
  }

  close() { this.display.forEach((child) => child.destroy()); this.display = []; this.locked = false; this.stage = 'idle'; this.world.release(); this.world.confirmPressed = false; }

  interact() {
    const w = this.world;
    if (!this.entry || !inInteractionRange(w, this.entry)) return false;
    this.locked = true;
    if (!(this.waterfall ? w.flags[79] : w.flags[60])) w.showDialogue(this.waterfall ? waterfallText.intro : this.text.intro, { onClose: () => { this.pose('spr_icecreamguy_anim'); this.stage = 'turning'; this.frames = 0; } });
    else this.offer();
    return true;
  }

  destroy() { this.display.forEach((child) => child.destroy()); this.display = []; }
}
