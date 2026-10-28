import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// Snowed Inn: lựa chọn ngủ, phòng trên, bản giao hưởng ngáy và hồi HP quá giới hạn.
export class SnowdinInn {
  constructor(world) {
    this.world = world; this.text = world.dataSource.innDialogue; this.elapsed = 0; this.frames = 0; this.locked = false; this.stage = 'waiting'; this.talking = false;
    const f = world.flags;
    if (!world.townMusic) {
      const level = murderLevel(f), key = f[7] === 1 ? 'mus_reunited' : f[222] && !f[27] ? 'mus_toomuch' : 'mus_town';
      const rate = key !== 'mus_town' ? 1 : f[222] && f[27] ? .5 : level >= 7 && !f[27] ? .25 : 1;
      world.townMusic = world.sound.add(key, { loop: true, rate }); world.townMusic.play();
    }
    this.music = world.townMusic; this.innkeeper = world.roomObjects.find((e) => e.item.ObjectName === 'obj_townnpc_innlady');
    if (murderLevel(f) >= 7) { this.innkeeper.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.innkeeper); this.innkeeper = null; }
    else { world.colliders.push(createCollider(world.dataSource, this.innkeeper.item)); this.innkeeper.image.setDepth(this.innkeeper.item.Y + this.innkeeper.sprite.MarginBottom - this.innkeeper.sprite.OriginY); }
    if (f[73] === 1) { this.locked = true; this.stage = 'wake'; }
  }
  show(pages, next) { this.talking = true; this.world.showDialogue(pages, { onClose: () => { this.talking = false; next?.(); } }); }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world; this.frames++;
    if (this.innkeeper) this.innkeeper.image.setTexture(`${this.innkeeper.object.Sprite}:${this.talking ? Math.floor(this.frames * .2) % this.innkeeper.sprite.TextureCount : 0}`);
    if (this.stage === 'wake' && this.frames >= 15) {
      w.hp = Math.max(w.hp, w.maxHp); w.hp = ({ 20: 30, 24: 32, 28: 34, 32: 36, 36: 38 })[w.hp] ?? w.hp;
      this.stage = 'wakeTalk'; this.show([...this.text.returned, ...(w.flags[72] === 1 ? this.text.returnPaid : w.flags[72] === 2 ? this.text.returnFree : [])], () => { w.flags[73] = 0; this.stage = 'waiting'; this.locked = false; w.release(); });
    } else if (this.stage === 'beforeSleep' && this.frames >= 20) {
      this.stage = 'transition'; // innevent1 khóa tương tác trước Create của Frisk, nên dùng vị trí mặc định đã căn lưới.
      w.transitionRoom('room_tundra_inn_2f', 'obj_mainchara', 13 * 1000 / 30);
    } else if (this.stage === 'beforeSleep') this.music.setVolume(Math.max(0, 1 - this.frames * .05));
  }
  interact() {
    const w = this.world, near = (e) => e && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } });
    if (near(this.innkeeper)) {
      if (w.flags[7] === 1) { this.show(w.flags[72] === 2 ? this.text.endFree : this.text.end); return true; }
      const free = w.flags[72] === 2;
      this.show(free ? this.text.introFree : this.text.intro, () => w.showChoice(free ? '* How about it?' : '* One night is 80G.', ['Stay', 'Leave'], (choice) => {
        if (choice) { this.show(this.text.leave); return; }
        let pages = this.text.error, sleep = false;
        if (w.flags[72] === 2) { pages = this.text.keyFree; sleep = true; }
        else if (w.gold < 80 && !w.flags[72]) { pages = this.text.poor; w.flags[72] = 2; sleep = true; }
        else if (w.gold >= 80 && (!w.flags[72] || w.flags[72] === 1)) { pages = this.text.key; w.flags[72] = 1; sleep = true; }
        else if (w.gold < 80 && w.flags[72] === 1) pages = this.text.noMoney;
        this.show(pages, () => { if (sleep) { this.locked = true; this.stage = 'beforeSleep'; this.frames = 0; w.release(); } });
      })); return true;
    }
    const sign = w.roomObjects.find((e) => e.item.ObjectName === 'obj_readable_room1' && near(e));
    if (!sign) return false;
    this.show(murderLevel(w.flags) >= 7 ? this.text.signMurder : w.flags[7] === 1 ? this.text.signEnd : this.text.sign); return true;
  }
}

// obj_innevent1: ngáy 880 frame hoặc xác nhận sau khi âm lượng vượt .6.
export class SnowdinInnSleep {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.volume = 0; this.stage = 'start'; this.locked = true; this.zzz = [];
    world.flags[73] = 1; this.music = world.sound.add('mus_snoresymphony', { volume: .2 });
    this.snoozers = world.dataSource.room.GameObjects.filter((e) => e.ObjectName === 'obj_snoozer').map((item, i) => ({ item, next: [150, 57, 97][i], remaining: 0, vx: 0 }));
    this.shade = world.add.rectangle(0, 0, world.dataSource.room.Width, world.dataSource.room.Height, 0x000000, .5).setOrigin(0).setDepth(99999);
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    if (this.stage === 'fadeIn' && this.volume > .6 && this.world.justConfirmed()) this.stage = 'fadeOut';
    return this.locked;
  }
  step() {
    const w = this.world; this.frames++;
    if (this.frames === 10) { this.music.play(); this.stage = 'fadeIn'; }
    if (this.stage === 'fadeIn') { this.volume = Math.min(.9, this.volume + .01); this.music.setVolume(this.volume); if (this.frames >= 880) this.stage = 'fadeOut'; }
    else if (this.stage === 'fadeOut') { this.volume = Math.max(0, this.volume - .02); this.music.setVolume(this.volume); if (this.volume < .02) { this.volume = 0; this.stage = 'returnWait'; this.returnFrame = this.frames + 10; } }
    else if (this.stage === 'returnWait' && this.frames >= this.returnFrame) { this.stage = 'transition'; w.transitionRoom('room_tundra_inn', 'obj_markerB', 13 * 1000 / 30); }
    for (const s of this.snoozers) if (this.frames >= s.next) {
      if (!s.remaining) { s.remaining = 3; s.vx = Math.random() - .5; }
      const image = w.add.image(s.item.X, s.item.Y, 'spr_zzz:0').setOrigin(0).setAlpha(.2).setDepth(-this.world.dataSource.objects.get('obj_zzz').Depth);
      this.zzz.push({ image, age: 0, vx: s.vx }); s.remaining--; s.next = this.frames + (s.remaining ? 20 : 60);
    }
    for (const z of this.zzz) {
      z.age++; z.image.x += z.vx + Math.sin(z.age / 8) * .5; z.vx = Math.sign(z.vx) * Math.max(0, Math.abs(z.vx) - .01); z.image.y--;
      z.image.setTexture(`spr_zzz:${Math.min(2, Math.floor(z.age * .1))}`).setAlpha(z.age < 40 ? Math.min(1, .2 + z.age * .05) : z.age > 50 ? Math.max(0, 1 - (z.age - 50) * .05) : 1);
      if (z.image.alpha <= 0) z.image.destroy();
    }
    this.zzz = this.zzz.filter((z) => z.image.active);
  }
  destroy() { this.music.destroy(); this.shade.destroy(); this.zzz.forEach((z) => z.image.destroy()); }
}
