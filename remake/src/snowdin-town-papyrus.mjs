import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';

// obj_papyrus_houseoutside: dẫn gặp Papyrus/88=1, vòngchạy145-8-145 và chốt88=2.
export class SnowdinTownPapyrus {
  constructor(world) {
    this.world = world; this.text = world.dataSource.townPapyrusDialogue; this.elapsed = 0; this.frames = 0; this.total = 0; this.locked = false; this.stage = 'waiting'; this.mailTalked = this.shedRead = 0;
    const e = world.roomObjects.find((e) => e.item.ObjectName === 'obj_papyrus_houseoutside'), f = world.flags;
    const late = f[88] >= 4 && !f[7];
    if (f[67] === 1 || (f[88] ?? 0) !== 1 && !late || late && (world.plot <= 105 || f[354] === 2 && !f[389])) {
      e.image.destroy(); world.roomObjects = world.roomObjects.filter((entry) => entry !== e); return;
    }
    this.pap = e; this.late = late; this.key = 'spr_papyrus_dt'; this.index = 0;
    world.colliders.push(this.collider = createCollider(world.dataSource, e.item));
  }
  pose(key, frame = 0) {
    if (!this.pap?.image.active) return;
    const s = this.world.dataSource.sprites.get(key); this.key = key; this.index = frame % s.TextureCount;
    this.pap.image.setTexture(`${key}:${this.index}`).setDepth(this.pap.image.y + s.MarginBottom - s.OriginY);
  }
  show(key, next) {
    const w = this.world, pages = this.text[key]; this.talking = true;
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => { const p = pages[i]; w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_papyrus' ? 8 : 12); }, onClose: () => { this.talking = false; next?.(); } });
  }
  wait(stage) { this.stage = stage; this.frames = 0; }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  step() {
    this.frames++; this.total++;
    if (!this.pap?.image.active) return;
    const w = this.world, p = this.pap.image;
    if (this.stage === 'waiting') {
      if (this.late) this.pose(this.talking ? `spr_papyrus_${this.lateFacing ?? 'd'}t` : 'spr_papyrus_d', this.talking ? Math.floor(this.total * .2) : 0);
      else {
        const s = w.dataSource.sprites.get(this.key), ps = w.dataSource.sprites.get(w.player.texture.key.split(':')[0]);
        const dx = w.player.x + 10 - (p.x + s.Width / 2), dy = w.player.y + ps.MarginTop - (p.y + s.MarginTop);
        const facing = Math.abs(dx) >= Math.abs(dy) ? dx >= 0 ? 'r' : 'l' : dy >= 0 ? 'd' : 'u'; this.pose(`spr_papyrus_${facing}t`, this.talking ? Math.floor(this.total * .2) : 0);
      }
    } else if (this.stage === 'clearPath') {
      const s = w.dataSource.sprites.get(this.key);
      if (w.player.y + 19 <= p.y + s.MarginBottom && w.player.x < p.x + s.MarginRight) { w.player.y++; this.playerPose('d', .25); }
      else { this.playerPose('l', 0); this.wait('beforeRun'); }
    } else if (this.stage === 'beforeRun' && this.frames >= 20) this.wait('runLeft');
    else if (this.stage === 'runLeft') {
      p.x -= 5; this.pose('spr_papyrus_l', Math.floor(this.frames * .5));
      if (w.player.x > p.x + w.dataSource.sprites.get('spr_papyrus_l').MarginRight) { w.player.x -= 5; this.playerPose('l', .5); }
      if (this.frames >= 145) { this.playerPose('l', 0); this.wait('beforeDown'); }
    } else if (this.stage === 'beforeDown' && this.frames >= 6) { this.wait('down'); this.playerPose('d', 0); }
    else if (this.stage === 'down') { p.y += 4; this.pose('spr_papyrus_d', Math.floor(this.frames * .5)); if (this.frames >= 8) this.wait('turnRight'); }
    else if (this.stage === 'turnRight') {
      p.x += 5; this.pose('spr_papyrus_r', Math.floor(this.frames * .5));
      if (p.x + 1 > w.player.x + 19 + 10) { this.wait('runRight'); this.playerPose('r', .5); }
    } else if (this.stage === 'runRight') {
      p.x += 5; w.player.x += 5; this.pose('spr_papyrus_r', Math.floor(this.frames * .5)); this.playerPose('r', .5);
      if (this.frames >= 145) { this.pose('spr_papyrus_ut'); this.playerPose('u', 0); this.wait('beforeHouse'); }
    } else if (this.stage === 'beforeHouse' && this.frames >= 15) { this.wait('houseTalk'); this.show('myHouse', () => this.wait('enter')); }
    else if (this.stage === 'enter') { p.y -= 6; this.pose('spr_papyrus_u', Math.floor(this.frames * .25)); if (this.frames >= 7) this.finish(); }
    if (this.locked) w.updateCamera();
  }
  playerPose(direction, rate) { const w = this.world, s = w.dataSource.sprites.get(`spr_mainchara${direction}`); w.player.facing = direction; w.player.setTexture(`spr_mainchara${direction}:${rate ? Math.floor(this.total * rate) % s.TextureCount : 0}`).setDepth(w.player.y + 30); }
  finish() { const w = this.world; w.sound.play('mus_doorclose'); w.flags[88] = 2; this.pap.image.destroy(); w.roomObjects = w.roomObjects.filter((e) => e !== this.pap); this.pap = null; this.locked = false; this.stage = 'done'; w.release(); w.confirmPressed = w.menuPressed = false; }
  interact() {
    const w = this.world;
    const nearby = (e) => e && inInteractionRange(w, { ...e, item: { ...e.item, X: (e.image?.x ?? e.item.X) - e.sprite.OriginX, Y: (e.image?.y ?? e.item.Y) - e.sprite.OriginY } });
    const door = w.roomObjects.find((e) => e.item.ObjectName === 'obj_paphouse_entrance' && nearby(e));
    if (door && (w.flags[88] ?? 0) <= 1) { this.show(w.flags[88] === 1 ? w.flags[66] === 1 ? 'doorFlirt' : 'doorDate' : 'locked'); return true; }
    if (!this.pap) return false;
    if (nearby(this.pap)) {
      if (this.late) {
        this.lateFacing = { u: 'd', d: 'u', l: 'r', r: 'l' }[w.player.facing];
        let key = w.flags[354] === 0 || w.flags[354] === undefined ? 'late0' : w.flags[354] === 1 ? 'late1' : 'late';
        if (w.flags[389] >= 3) { key = w.plot > 175 ? 'late175' : 'lateUndyne'; if ([8, 9, 10].includes(w.flags[493])) key = `lateLetter${w.flags[493]}`; }
        this.show(key); return true;
      }
      this.locked = true; this.collider.disabled = true; this.wait('talking'); this.show(w.flags[66] === 1 ? 'introFlirt' : 'intro', () => this.wait('clearPath')); return true;
    }
    const e = w.roomObjects.find((e) => ['obj_papmailbox', 'obj_readable_room2'].includes(e.item.ObjectName) && nearby(e));
    if (!e) return false;
    if (e.item.ObjectName === 'obj_papmailbox') this.show(this.mailTalked++ ? 'mailboxAgain' : 'mailbox');
    else this.show(this.shedRead++ ? 'shedAgain' : w.flags[67] < 0 ? 'shedPunishment' : 'shed'); return true;
  }
}
