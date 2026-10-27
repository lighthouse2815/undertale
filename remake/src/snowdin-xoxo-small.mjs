import { createCollider } from './movement.mjs';
import { touchesObject, inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';

// room_tundra_xoxosmall: hai ô X/O, nút kiểm tra và câu hỏi spaghetti của Papyrus6.
export class SnowdinXoxoSmall {
  constructor(world) {
    this.world = world; this.text = world.dataSource.xoxoSmallDialogue; this.elapsed = 0; this.frames = 0; this.total = 0; this.locked = false;
    startSnowdinMusic(world);
    const murder = murderLevel(world.flags) >= 4 && !world.flags[27];
    if (murder) { if (world.plot < 57) world.plot = 57; world.flags[62] = 1; }
    this.stage = world.flags[62] > 0 ? 'done' : 'waiting';
    this.tiles = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_xoxo').map((e) => ({ ...e, frame: 0, touched: false }));
    this.button = world.roomObjects.find((e) => e.item.ObjectName === 'obj_xoxocontroller1'); this.button.image.setDepth(-100000); this.buttonAlarm = 0;
    this.sign = world.roomObjects.find((e) => e.item.ObjectName === 'obj_sign_room'); world.colliders.push(createCollider(world.dataSource, this.sign.item)); this.sign.image.setDepth(this.sign.item.Y + this.sign.sprite.Height);
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus6');
    this.wall = world.colliders.find((e) => e.objectName === 'obj_plotwall_room');
    Object.assign(this.wall, createCollider(world.dataSource, { ...world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_plotwall_room'), ScaleY: 400 }));
    this.tiles.forEach((e) => e.image.setDepth(-100000)); this.victory = false; this.sync();
    if (this.stage === 'waiting') this.pap = world.add.image(450, 90, 'spr_papyrus_rt:0').setOrigin(0).setDepth(134);
  }
  pose(key, frame = 0) { this.pap.setTexture(`${key}:${frame}`).setDepth(this.pap.y + 44); }
  sync() {
    this.wall.disabled = this.world.plot > 52;
    for (const e of this.world.roomObjects.filter((e) => e.item.ObjectName === 'obj_spikes_room')) e.image.setTexture(`${e.object.Sprite}:${this.wall.disabled ? 1 : 0}`);
    this.tiles.forEach((e) => e.image.setTexture(`spr_xoxo:${e.frame}`));
  }
  show(key, next) {
    const w = this.world, pages = this.text[key]; this.stage = 'talking';
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => { w.setDialoguePortrait(pages[i].portrait); w.dialogueText.setFont('fnt_papyrus', 8); }, onClose: next });
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world, p = w.player; this.frames++; this.total++;
    if (this.buttonAlarm && --this.buttonAlarm === 0) this.button.image.setTexture('spr_groundswitch1:0');
    if (this.alertFrames && --this.alertFrames === 0) this.alert?.destroy();
    for (const tile of this.tiles) {
      const x = tile.item.X + 10, top = tile.item.Y + 3, bottom = tile.item.Y + 12;
      const contact = p.x <= x && p.x + 19 >= x && p.y + 19 <= bottom && p.y + 29 >= top;
      if (contact && !tile.touched) {
        tile.touched = true;
        if (tile.frame < 2) { tile.frame++; w.sound.play('snd_instanoise'); if (tile.frame === 2) this.victory = false; }
      }
      if (!contact) tile.touched = false;
    }
    if (this.tiles.every((tile) => tile.frame === 1)) this.victory = true;
    if (touchesObject(w, p, this.button.item)) {
      if (w.plot < 53) {
        if (this.victory) { w.plot = 53; this.tiles.forEach((tile) => { tile.frame = 3; }); }
        else { this.tiles.forEach((tile) => { tile.frame = 0; }); this.victory = false; }
      }
      if (!this.buttonAlarm) w.sound.play('snd_switchpull_n');
      this.button.image.setTexture('spr_groundswitch1:1'); this.buttonAlarm = 3;
    }
    this.sync();
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
