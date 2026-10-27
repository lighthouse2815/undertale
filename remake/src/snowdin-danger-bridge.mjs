import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startSnowdinMusic, stopSnowdinMusic } from './snowdin-start.mjs';

// obj_papyrus7: cầu bẫy, camera120px, hủy bẫy và cuộc nói chuyện Sans sau cảnh.
export class SnowdinDangerBridge {
  constructor(world) {
    this.world = world; this.text = world.dataSource.dangerBridgeDialogue; this.elapsed = 0; this.frames = 0; this.total = 0; this.locked = false; this.traps = [];
    this.murder = murderLevel(world.flags) >= 5 && !world.flags[27]; this.stage = world.plot > 66 ? 'done' : 'waiting';
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus7'); startSnowdinMusic(world);
    if (this.stage === 'waiting') { this.pap = this.actor(820, 90, 'spr_papyrus_lt'); this.sans = this.actor(820, 60, 'spr_sans_d'); this.papDir = 'l'; this.sansDir = 'd'; }
    // Sans được tạo ở cuối cảnh, không có instance trong dữ liệu phòng khi quay lại.
  }
  actor(x, y, key, depth) { const s = this.world.dataSource.sprites.get(key); return this.world.add.image(x, y, `${key}:0`).setOrigin(s.OriginX / s.Width, s.OriginY / s.Height).setDepth(depth ?? y + s.Height); }
  pose(image, key, frame = 0) { image.setTexture(`${key}:${frame % this.world.dataSource.sprites.get(key).TextureCount}`).setDepth(image.y + this.world.dataSource.sprites.get(key).Height); }
  wait(stage, duration = 0) { this.stage = stage; this.frames = 0; this.duration = duration; }
  show(key, next) {
    const w = this.world, pages = this.text[key]; this.wait('talking');
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => {
      const p = pages[i]; this.talking = p.font === 'fnt_papyrus' ? 'pap' : 'sans';
      w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_papyrus' ? 8 : p.font === 'fnt_comicsans' ? 10 : 12);
    }, onClose: () => { this.talking = null; next?.(); } });
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  deploy() {
    const x = this.trigger.X;
    this.traps = [
      { key: 'spr_dtrapcannon', x: x + 170, y: 240, vy: -.7, depth: -4000 },
      { key: 'spr_dtrapspear', x: x + 100, y: 310, vy: -.9, sy: -1, depth: -4000 },
      { key: 'spr_dtrapspear', x: x + 100, y: -60, vy: .9 },
      { key: 'spr_dtrapmace', x: x + 20, y: -100, vy: 1.2 },
      { key: 'spr_dtrapdog', x: x + 170, y: -90, vy: 1.2, rate: .1 },
      { key: 'spr_dtrapfire', x: x + 20, y: 240, vy: -2, rate: .3334, stop: 42, depth: -900000 },
    ].map((t) => ({ ...t, age: 0, image: this.actor(t.x, t.y, t.key, t.depth ?? 0).setScale(1, t.sy ?? 1) }));
    this.wait('deploy', 60);
  }
  step() {
    const w = this.world; this.frames++; this.total++;
    if (this.fadeMusic && !this.fadeMusic.pendingRemove) {
      this.fadeVolume = Math.max(0, this.fadeVolume - .5); this.fadeMusic.setVolume(this.fadeVolume);
      if (this.fadeVolume === 0) { this.fadeMusic.destroy(); this.fadeMusic = null; }
    }
    if (this.fadePap && this.papMusic) { this.papVolume = Math.max(0, this.papVolume - .1); this.papMusic.setVolume(this.papVolume); }
    if (this.icon && --this.iconLife <= 0) { this.icon.destroy(); this.icon = null; }
    for (const t of this.traps) {
      t.age++; if (t.stop && t.age > t.stop) t.vy = 0;
      t.image.y += t.vy; const n = w.dataSource.sprites.get(t.key).TextureCount;
      t.image.setTexture(`${t.key}:${Math.floor(t.age * (t.rate ?? 0)) % n}`);
      if (t.remove && t.age >= t.remove) t.image.destroy();
    }
    this.traps = this.traps.filter((t) => t.image.active);
    if (this.pap?.active) { if (this.papWalking) this.pap.x += 4; this.pose(this.pap, `spr_papyrus_${this.papDir}${this.papWalking ? '' : 't'}`, this.talking === 'pap' || this.papWalking ? Math.floor(this.total * .2) : 0); }
    if (this.sans?.active) this.pose(this.sans, `spr_sans_${this.sansDir}`, this.talking === 'sans' ? Math.floor(this.total * .334) % 4 : 0);
    if (this.flowey?.active) {
      const c = w.cameras.main;
      if (this.floweyFrame || this.flowey.x > c.scrollX - 37 && this.flowey.x < c.scrollX + 357) {
        this.floweyFrame += .5;
        if (this.floweyFrame >= 6) { this.flowey.destroy(); w.flags[9] = (w.flags[9] ?? 0) + 1; }
        else this.flowey.setTexture(`spr_floweysink:${Math.floor(this.floweyFrame)}`);
      }
    }
    if (this.stage === 'pan') {
      w.cameras.main.scrollX = Math.min(this.camera + 120, w.cameras.main.scrollX + 3);
      if (w.cameras.main.scrollX >= this.camera + 119) this.notice('introNotice');
    } else if (this.stage === 'introNotice' && this.frames >= 40) this.show('intro', () => this.deploy());
    else if (this.stage === 'deploy' && this.frames >= 60) { for (const t of this.traps) if (t.key !== 'spr_dtrapfire') t.vy = 0; this.wait('deployed', 30); }
    else if (this.stage === 'deployed' && this.frames >= 30) this.show('rules', () => this.wait('firstPause', 120));
    else if (this.stage === 'firstPause' && this.frames >= 120) {
      this.papDir = 'r'; this.sansDir = 'd'; this.show('pause', () => { this.papDir = this.sansDir = 'l'; this.wait('secondPause', 120); });
    } else if (this.stage === 'secondPause' && this.frames >= 120) this.show(this.murder ? 'cancelMurder' : 'cancel', () => {
      this.traps.forEach((t, i) => { t.vy = i < 2 || i === 5 ? 2 : -2; t.stop = 0; if (i === 5) { t.age = 0; t.remove = 80; } }); this.wait('retract', 60);
    });
    else if (this.stage === 'retract' && this.frames >= 60) {
      this.traps.forEach((t) => { if (t.key !== 'spr_dtrapfire') t.image.destroy(); }); this.traps = this.traps.filter((t) => t.image.active);
      this.papDir = 'r'; this.show('bye', () => this.notice('lastNotice'));
    } else if (this.stage === 'lastNotice' && this.frames >= 40) { this.papDir = 'l'; this.show(this.murder ? 'lastMurder' : 'last', () => { this.papDir = 'r'; this.papWalking = true; this.fadePap = true; this.wait('depart', 30); }); }
    else if (this.stage === 'depart' && this.frames >= 30) this.wait('panBack');
    else if (this.stage === 'panBack') { w.cameras.main.scrollX = Math.max(this.camera, w.cameras.main.scrollX - 3); if (w.cameras.main.scrollX <= this.camera) this.finish(); }
  }
  notice(stage) { this.icon?.destroy(); this.icon = this.actor(this.pap.x + 3, this.pap.y - 12, 'spr_exc', 9999); this.iconLife = 30; this.wait(stage, 40); }
  finish() {
    const w = this.world; this.papMusic?.destroy(); this.papMusic = null; this.pap.destroy(); this.sansDir = 'd'; this.pose(this.sans, 'spr_sans_d');
    w.plot = 67; this.locked = false; this.wait('done'); this.flowey = this.actor(80, 120, 'spr_floweysink'); this.floweyFrame = 0;
    stopSnowdinMusic(w); w.snowdinMusic = w.sound.add('mus_snowy', { loop: true, rate: .95, volume: 1 }); w.snowdinMusic.play();
    if (w.flags[413] > 0 || w.flags[67] === 1 || w.plot > 200) this.sans.destroy();
    else { const item = { ObjectName: 'obj_sans_room', X: this.sans.x, Y: this.sans.y, ScaleX: 1, ScaleY: 1 }; this.sansEntry = { item, object: w.dataSource.objects.get('obj_sans_room'), sprite: w.dataSource.sprites.get('spr_sans_d'), image: this.sans }; w.colliders.push(createCollider(w.dataSource, item)); }
    w.release(); w.confirmPressed = w.menuPressed = false;
  }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 999)) return false;
    this.locked = true; w.release(); this.camera = w.cameras.main.scrollX; this.papDir = this.sansDir = 'l';
    this.fadeMusic = w.snowdinMusic; this.fadeVolume = this.fadeMusic.volume; w.snowdinMusic = null;
    this.papVolume = .6; this.papMusic = w.sound.add('mus_papyrus', { loop: true, volume: .6 }); this.papMusic.play(); this.wait('pan'); return true;
  }
  interact() {
    const w = this.world;
    if (this.sansEntry && inInteractionRange(w, this.sansEntry)) { this.show(this.murder ? 'sansMurder' : Number(localStorage.getItem('undertale-remake-papyrus-kills') ?? 0) > 0 ? 'sansMemory' : 'sans', () => this.wait('done')); return true; }
    if (w.roomObjects.some((e) => e.item.ObjectName === 'obj_readable_room3' && inInteractionRange(w, e))) { w.showDialogue(this.text.camera.map((p) => p.text)); return true; }
    return false;
  }
  destroy() { this.fadeMusic?.destroy(); this.papMusic?.destroy(); this.icon?.destroy(); this.pap?.destroy(); this.sans?.destroy(); this.flowey?.destroy(); this.traps.forEach((t) => t.image.destroy()); }
}
