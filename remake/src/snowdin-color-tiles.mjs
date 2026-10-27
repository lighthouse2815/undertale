import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startSnowdinMusic, stopSnowdinMusic } from './snowdin-start.mjs';

// obj_papyrus4/obj_specialtile: máy chọn ngẫu nhiên cuối cùng chỉ để lại đường màu hồng.
export class SnowdinColorTiles {
  constructor(world) {
    this.world = world; this.text = world.dataSource.colorTilesDialogue; this.elapsed = 0; this.frames = 0; this.total = 0; this.locked = false;
    this.murder = murderLevel(world.flags) >= 4 && !world.flags[27]; this.stage = world.plot >= 58 ? 'done' : 'waiting';
    this.trigger = { ...world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus4'), ScaleY: 999 };
    this.switch = world.roomObjects.find((e) => e.item.ObjectName === 'obj_switch');
    if (world.plot > 90) { this.switch.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.switch); this.switch = null; }
    else world.colliders.push(createCollider(world.dataSource, this.switch.item));
    this.tiles = world.dataSource.room.GameObjects.filter((e) => e.ObjectName === 'obj_specialtile').map((e) => { const g = Math.floor(120 + Math.random() * 128); return { x: e.X, y: e.Y, color: g * 0x010101 }; });
    this.floor = world.add.graphics().setDepth(-100000); this.draw();
    if (this.stage === 'waiting') { this.pap = this.actor(245, 74, 'spr_papyrus_dt'); this.sans = this.actor(245, 120, 'spr_sans_u'); }
    startSnowdinMusic(world);
  }
  actor(x, y, key) { const image = this.world.add.image(x, y, `${key}:0`).setOrigin(0); this.pose(image, key); return image; }
  pose(image, key, frame = 0) { image.setTexture(`${key}:${frame}`).setDepth(image.y + this.world.dataSource.sprites.get(key).Height); }
  entry(name, image) { const w = this.world, object = w.dataSource.objects.get(name); return { item: { ObjectName: name, X: image.x, Y: image.y, ScaleX: 1, ScaleY: 1 }, object, image, sprite: w.dataSource.sprites.get(object.Sprite) }; }
  draw() { this.floor.clear(); for (const t of this.tiles) this.floor.fillStyle(t.color).fillRect(t.x, t.y, 20, 20); }
  wait(stage) { this.stage = stage; this.frames = 0; }
  show(key, next, onPage) {
    const w = this.world, pages = this.text[key];
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => { const p = pages[i]; w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_papyrus' ? 8 : p.font === 'fnt_comicsans' ? 10 : 12); onPage?.(i); }, onClose: next });
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  ask(repeated = false) {
    this.show(repeated ? 'repeat' : 'rules', () => this.world.showChoice('* (Understand the explanation?)', repeated ? ['Yes', 'Even less'] : ['Of course', 'No'], (choice) => {
      if (!choice) this.show('ready', () => this.startSpin());
      else if (!repeated) this.ask(true);
      else this.show('refuse', () => this.leaveNote());
    }));
  }
  startSpin() {
    this.wait('spinning'); this.spinAlarm = 2; this.randofactor = 25; this.garfield = 30; this.finalrando = 0;
    this.papMusic.setVolume(.3); this.computer = this.world.sound.add('mus_computer', { loop: true, volume: .6, rate: .1 }); this.computer.play(); this.pose(this.pap, 'spr_papyrus_u');
  }
  spin() {
    if (--this.spinAlarm > 0) return;
    this.garfield = this.garfield / 1.02 - 1; this.randofactor /= 1.1;
    if (this.randofactor < 3) { this.randofactor = 3; this.finalrando++; }
    if (this.finalrando > 12) this.randofactor = 2;
    if (this.finalrando > 30) this.randofactor = 1;
    const palette = [0x0000ff, 0xffff00, 0x00ff00, 0x800080, 0xffa040, 0xff0000, 0xff6464];
    for (const t of this.tiles) t.color = palette[Math.floor(Math.random() * 7)];
    if (this.finalrando > 120) {
      this.randofactor = -1; for (const t of this.tiles) t.color = t.y < 120 || t.y >= 160 ? 0xff0000 : 0xff6464;
    } else this.computer.setRate(3 / ((this.garfield / 20) + 2.5));
    this.spinAlarm = Math.trunc(this.randofactor); this.draw();
  }
  leaveNote() {
    const w = this.world; this.note = this.actor(this.pap.x + 10, this.pap.y + 20, 'spr_notepaper'); this.noteBody = createCollider(w.dataSource, this.entry('obj_spagnot', this.note).item); w.colliders.push(this.noteBody);
    this.pose(this.pap, 'spr_papyrus_ut'); this.wait('noteWait');
  }
  finish() {
    const w = this.world; this.papMusic?.destroy(); this.papMusic = null; this.computer?.destroy(); this.computer = null;
    w.plot = 58; this.pap.destroy(); this.pose(this.sans, 'spr_sans_d'); this.sansBody = createCollider(w.dataSource, this.entry('obj_sans_room', this.sans).item); w.colliders.push(this.sansBody);
    if (w.flags[413] > 0 || w.flags[67] === 1 || w.plot > 200) { this.sans.destroy(); this.sansBody.disabled = true; }
    stopSnowdinMusic(w); w.snowdinMusic = w.sound.add('mus_snowy', { loop: true, volume: 1, rate: .95 }); w.snowdinMusic.play();
    this.locked = false; w.release(); this.wait('done');
  }
  step() {
    const w = this.world; this.frames++; this.total++;
    if (this.fadeMusic) { this.fadeVolume = Math.max(0, this.fadeVolume - .5); this.fadeMusic.setVolume(this.fadeVolume); if (!this.fadeVolume) { this.fadeMusic.destroy(); this.fadeMusic = null; } }
    if (this.alertFrames && --this.alertFrames === 0) this.alert?.destroy();
    if (this.walker?.active && this.walker.x < this.walkerStart + 93) {
      this.walker.x += this.walkerMoving ? 3 : 0; this.walker.setTexture(`spr_maincharar:${this.walkerMoving ? Math.floor(this.total * .25) % 2 : 0}`);
      if (this.walker.x >= this.walkerStart + 93) { this.walker.x = this.walkerStart + 93; this.walker.setTexture('spr_maincharar:0'); }
    }
    if (this.stage === 'notice' && this.frames >= 40) {
      if (!this.murder) { this.wait('explaining'); this.ask(); }
      else {
        this.wait('murderIntro'); w.player.setVisible(false); this.walkerStart = w.player.x; this.walker = this.actor(w.player.x, w.player.y, 'spr_maincharar');
        this.show('murderIntro', () => this.wait('murderWalk'), (i) => { if (i >= 2) this.walkerMoving = true; });
      }
    } else if (this.stage === 'murderWalk' && this.walker.x >= this.walkerStart + 93) {
      w.player.x = this.walker.x; w.player.facing = 'r'; w.player.setVisible(true); this.walker.destroy(); this.wait('murderTalk'); this.show('murderComplaint', () => this.leaveNote());
    } else if (this.stage === 'spinning') {
      if (this.randofactor !== -1) this.spin();
      if (this.frames < 60) this.pose(this.pap, 'spr_papyrus_u', Math.floor(this.total * .2) % 4);
      else {
        this.pose(this.pap, 'spr_papyrus_l');
        if (this.randofactor === -1) {
          for (let i = 0; i < 4; i++) for (const y of [80, 100, 160, 180]) w.colliders.push(createCollider(w.dataSource, { ObjectName: 'obj_solidwide', X: 80 + i * 40, Y: y, ScaleX: 1, ScaleY: 1 }));
          this.papMusic.destroy(); this.papMusic = null; this.computer.destroy(); this.computer = null; this.wait('spinWait');
        }
      }
    } else if (this.stage === 'spinWait' && this.frames >= 110) { this.spinningExit = true; this.pose(this.sans, 'spr_sans_u'); this.wait('papDown'); }
    else if (this.stage === 'noteWait' && this.frames >= 30) { this.spinningExit = false; this.pose(this.sans, 'spr_sans_u'); this.wait('papDown'); }
    else if (this.stage === 'papDown' && this.frames >= 10) this.wait('sansUp');
    else if (this.stage === 'sansUp' && this.frames >= 10) this.wait('bothWait');
    else if (this.stage === 'bothWait' && this.frames >= 20) this.wait('papRight');
    else if (this.stage === 'papRight' && this.frames >= 100) { this.finish(); return; }
    if (['papDown', 'sansUp', 'bothWait'].includes(this.stage)) {
      this.pap.y++; this.pose(this.pap, this.spinningExit ? 'spr_papyrus_spin' : 'spr_papyrus_d', Math.floor(this.total * .2) % 4);
      if (this.stage === 'sansUp') { this.sans.y += 2; this.pose(this.sans, 'spr_sans_u', Math.floor(this.total * .25) % 4); }
    }
    if (this.stage === 'papRight') { this.pap.x++; this.pose(this.pap, this.spinningExit ? 'spr_papyrus_spin' : 'spr_papyrus_r', Math.floor(this.total * .2) % 4); if (!this.spinningExit && this.papMusic) this.papMusic.setVolume(Math.max(0, this.papMusic.volume - .05)); }
  }
  checkTrigger(previous) {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 999)) return false;
    w.player.setPosition(previous.x, previous.y); w.release(); this.locked = true; this.pose(this.pap, 'spr_papyrus_lt'); this.pose(this.sans, 'spr_sans_l');
    this.fadeMusic = w.snowdinMusic; this.fadeVolume = this.fadeMusic?.volume ?? 0; w.snowdinMusic = null;
    this.papMusic = w.sound.add('mus_papyrus', { loop: true, volume: .6 }); this.papMusic.play();
    this.alert = this.actor(this.pap.x + 3, this.pap.y - 12, 'spr_exc'); this.alertFrames = 30; this.wait('notice'); return true;
  }
  interact() {
    const w = this.world;
    if (this.sans?.active && this.stage === 'done' && inInteractionRange(w, this.entry('obj_sans_room', this.sans))) { this.show(murderLevel(w.flags) >= 4 ? 'sansMurder' : 'sans'); return true; }
    if (this.note?.active && inInteractionRange(w, this.entry('obj_spagnot', this.note))) { this.show('note'); return true; }
    if (this.switch && inInteractionRange(w, { ...this.switch, item: { ...this.switch.item, X: this.switch.item.X - this.switch.sprite.OriginX, Y: this.switch.item.Y - this.switch.sprite.OriginY } })) { this.show('switch'); return true; }
    return false;
  }
  destroy() { this.fadeMusic?.destroy(); this.papMusic?.destroy(); this.computer?.destroy(); this.pap?.destroy(); this.sans?.destroy(); this.alert?.destroy(); this.note?.destroy(); this.walker?.destroy(); this.floor.destroy(); }
}
