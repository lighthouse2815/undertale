import { blocked, createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';
import { startSnowdinMusic, stopSnowdinMusic } from './snowdin-start.mjs';
import { murderLevel } from './route.mjs';

// obj_papyrus2: mê cung điện vô hình, quả cầu và nhánh đi thẳng trên tuyến giết.
export class ElectricMaze {
  constructor(world) {
    this.world = world; this.text = world.dataSource.mazeDialogue; this.elapsed = 0; this.frames = 0; this.total = 0; this.locked = false;
    this.stage = world.plot >= 43 ? 'done' : 'waiting'; this.footsteps = []; this.orb = null;
    this.murder = murderLevel(world.flags) >= 3 && !world.flags[27]; this.met = Number(localStorage.getItem('undertale-remake-papyrus-meetings') ?? 0);
    this.trigger = { ...world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus2') };
    this.shock = createCollider(world.dataSource, world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_shockblock'));
    Object.assign(this, startSnowdinMusic(world));
    if (this.stage === 'waiting') {
      this.sans = this.actor(240, 74, 'spr_sans_d'); this.pap = this.actor(240, 100, 'spr_papyrus_ut');
    }
  }

  actor(x, y, key) { const d = this.world.dataSource.sprites.get(key); return this.world.add.image(x, y, `${key}:0`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height).setDepth(y + d.Height); }
  pose(actor, key, frame = 0) { const d = this.world.dataSource.sprites.get(key); actor.setTexture(`${key}:${frame}`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height).setDepth(actor.y + d.Height); }
  wait(stage, duration) { this.stage = stage; this.frames = 0; this.duration = duration; }
  show(key, next, onPage) {
    const w = this.world, pages = this.text[key]; this.stage = 'talking';
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => {
      const p = pages[i]; w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_papyrus' ? 8 : 10); onPage?.(i);
    }, onClose: next });
  }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }

  step() {
    const w = this.world; this.frames++; this.total++;
    if (this.alertFrames && --this.alertFrames === 0) this.alert?.destroy();
    if (this.fadeOut) this.music.setVolume(Math.max(0, this.music.volume - this.fadeOut));
    if (this.papSpeed) { this.pap.x += this.papSpeed; this.pose(this.pap, this.murder ? 'spr_papyrus_r' : 'spr_papyrus_l', Math.floor(this.total * .2) % 4); }
    if (this.fake?.active && this.fakeMoving) {
      this.fake.x = Math.min(this.fakeTarget, this.fake.x + 3);
      this.fake.setTexture(`spr_maincharar:${this.fake.x < this.fakeTarget ? Math.floor(this.total * .25) % 2 : 0}`);
      if (this.fake.x >= this.fakeTarget) this.fakeMoving = false;
    }
    this.stepOrb();
    if (this.stage === 'notice' && this.frames >= this.duration) {
      if (this.murder) this.beginMurder();
      else this.show(this.met > 1 ? 'explainAgain' : 'explain', () => {
        this.pose(this.pap, 'spr_papyrus_lt'); this.pose(this.sans, 'spr_sans_l');
        const item = { ObjectName: 'obj_puzzlewall1', X: 10, Y: 0, ScaleX: 1, ScaleY: 999 };
        this.wall = createCollider(w.dataSource, item); w.colliders.push(this.wall);
        this.trigger.X += 20; this.locked = false; this.stage = 'tryFirst';
      }, (i) => { if (i > 7) this.pose(this.pap, 'spr_papyrus_orb', Math.floor(this.total * .2) % 2); });
    } else if (this.stage === 'papShock') {
      this.pap.setPosition(240 + Math.floor(Math.random() * 6) - 2, 100 + Math.floor(Math.random() * 6) - 2);
      this.pose(this.pap, 'spr_papyrus_electrocute', Math.floor(this.total * .5) % 2);
      if (this.frames >= 30) { this.pap.setPosition(240, 100); this.pose(this.pap, 'spr_papyrus_toasted'); this.wait('toasted', 60); }
    } else if (this.stage === 'toasted') {
      this.pose(this.pap, 'spr_papyrus_toasted', Math.floor(this.total * .2) % 2);
      if (this.frames >= 60) {
        this.pose(this.sans, 'spr_sans_d'); this.pose(this.pap, 'spr_papyrus_mad1');
        this.show('angry', () => { this.pose(this.pap, 'spr_papyrus_ut'); this.show('orbHint', () => { this.pose(this.pap, 'spr_papyrus_lt'); this.show('okay', () => this.walkToHuman()); }); });
      }
    } else if (this.stage === 'walkToHuman') {
      if ((this.frames % 8 === 2 || this.frames % 8 === 6) && this.pap.x < 230) this.footsteps.push(this.actor(this.pap.x, this.pap.y, 'spr_papyrus_steps').setDepth(-90000));
    } else if (this.stage === 'toss' && this.frames >= 30) {
      this.stage = 'walkBack'; this.path = this.walk('path_papyrus1A', 5, () => {
        this.pose(this.pap, 'spr_papyrus_lt'); this.show('try', () => { this.trigger.X = 248; this.stage = 'tryMaze'; this.locked = false; });
      });
    } else if (this.stage === 'playerShock') {
      w.player.setPosition(this.memory.x + Math.floor(Math.random() * 5) - 2, this.memory.y + Math.floor(Math.random() * 5) - 2);
      if (this.frames >= 15) {
        w.player.setPosition(this.memory.x, this.memory.y > 134 && this.memory.x < 145 ? 134 : this.memory.y);
        w.sound.stopByKey('snd_shock'); this.stage = 'tryMaze'; this.locked = false;
      }
    } else if (this.stage === 'murderWalk1' && !this.fakeMoving) this.wait('murderWait1', 50);
    else if (this.stage === 'murderWait1' && this.frames >= 50) {
      this.show('murderSecond', () => this.wait('murderWalk2', 0), (i) => { if (i === 4) { this.fakeMoving = true; this.fakeTarget = 220; } });
    } else if (this.stage === 'murderWalk2' && !this.fakeMoving) this.wait('murderWait2', 50);
    else if (this.stage === 'murderWait2' && this.frames >= 50) {
      w.flags[291] = 1; this.pose(this.pap, 'spr_papyrus_dt'); this.pose(this.sans, 'spr_sans_d'); this.show('murderEnd', () => this.leave());
    } else if (this.stage === 'leaving' && this.frames >= 30) this.finish();
  }

  walk(name, speed, onComplete) {
    return walkNpc(this.world, this.pap, name, { speed, sprites: { d: 'spr_papyrus_d', u: 'spr_papyrus_u', l: 'spr_papyrus_l', r: 'spr_papyrus_r' }, onComplete });
  }

  walkToHuman() {
    this.pose(this.sans, 'spr_sans_l'); this.wait('walkToHuman', 0);
    this.path = this.walk('path_papyrus1', 2, () => {
      this.pose(this.pap, 'spr_papyrus_orb'); this.show('hold', () => {
        this.pose(this.pap, 'spr_papyrus_orbtoss'); this.orb = this.actor(this.pap.x + 1, this.pap.y + 1, 'spr_orb');
        this.orbVy = -4; this.orbWait = 0; this.onHead = false; this.wait('toss', 30);
      });
    });
  }

  stepOrb() {
    if (!this.orb?.active) return;
    const p = this.world.player;
    if (this.onHead) this.orb.setPosition(p.x + 7, p.y - 3);
    else {
      if (this.orbWait) {
        if (--this.orbWait === 0) { this.orbVy = 3; this.orb.x = p.x + 7; }
      }
      this.orb.y += this.orbVy;
      if (this.orb.y < -this.orb.height && !this.orbWait && this.orbVy < 0) this.orbWait = 10;
      if (this.orbVy > 0 && this.orb.y >= p.y - 3) { this.onHead = true; this.orb.setPosition(p.x + 7, p.y - 3); }
    }
  }

  beginMurder() {
    const w = this.world; this.fake = this.actor(w.player.x, w.player.y, 'spr_maincharar'); w.player.setVisible(false);
    this.show('murderFirst', () => this.wait('murderWalk1', 0), (i) => { if (i === 4) { this.fakeMoving = true; this.fakeTarget = 160; } });
  }

  leave() { this.orb?.destroy(); this.shock = null; this.papSpeed = 5; this.fadeOut = .05; this.wait('leaving', 30); }

  finish() {
    const w = this.world;
    if (this.fake?.active) { w.player.setPosition(this.fake.x, this.fake.y).setVisible(true); w.player.facing = 'd'; w.player.setTexture('spr_maincharad:0'); this.fake.destroy(); }
    stopSnowdinMusic(w); this.fadeOut = 0; this.music = w.snowdinMusic = w.sound.add('mus_snowy', { loop: true, rate: this.murder ? .5 : .95 }); this.music.play();
    w.plot = 43; this.papSpeed = 0; this.pap.destroy(); this.sans.destroy(); this.removeWall(); this.locked = false; this.stage = 'done';
    const f = w.flags;
    if (!f[413] && f[67] !== 1 && w.plot <= 200) {
      const item = { ObjectName: 'obj_sans_room', X: 240, Y: 74, ScaleX: 1, ScaleY: 1 };
      this.sans = this.actor(240, 74, 'spr_sans_d'); this.sansEntry = { item, object: w.dataSource.objects.get(item.ObjectName), sprite: w.dataSource.sprites.get('spr_sans_d') };
      this.sansCollider = createCollider(w.dataSource, item); w.colliders.push(this.sansCollider);
    }
    w.release(); w.confirmPressed = false; w.menuPressed = false;
  }

  removeWall() { this.world.colliders = this.world.colliders.filter((c) => c !== this.wall); this.wall = null; }

  checkTrigger(previous) {
    const w = this.world;
    if (this.locked || w.dialogue) return false;
    if (['waiting', 'tryFirst', 'tryMaze'].includes(this.stage) && touchesObject(w, w.player, this.trigger, 1, 999)) {
      this.locked = true; w.release();
      if (this.stage === 'waiting') {
        stopSnowdinMusic(w); this.music = w.snowdinMusic = w.sound.add('mus_papyrus', { loop: true, volume: .6 }); this.music.play();
        this.show(this.met > 1 ? 'introAgain' : 'intro', () => {
          this.pose(this.pap, 'spr_papyrus_lt'); this.pose(this.sans, 'spr_sans_l');
          this.alert = this.actor(this.pap.x + 3, this.pap.y - 12, 'spr_exc').setDepth(1000); this.alertFrames = 30; this.wait('notice', 45);
        });
      } else if (this.stage === 'tryFirst') { w.player.setPosition(previous.x, previous.y); w.sound.play('snd_shock'); this.wait('papShock', 30); }
      else { this.pose(this.pap, 'spr_papyrus_dt'); this.pose(this.sans, 'spr_sans_d'); this.show('solved', () => this.leave()); }
      return true;
    }
    if (this.stage === 'tryMaze' && this.shock && blocked(w, [this.shock], w.player.x, w.player.y)) {
      if (w.player.x < 150 && w.player.y > 135) w.player.y = 135;
      if (w.player.x < 84) w.player.x = 84;
      if (w.player.x < 108 && w.player.y < 102) w.player.y = 102;
      if (this.onHead) { this.memory = { ...previous }; this.locked = true; w.release(); w.sound.play('snd_shock'); this.wait('playerShock', 15); }
      else w.player.setPosition(previous.x, previous.y);
      return true;
    }
    return false;
  }

  interact() {
    if (!this.sansEntry || !inInteractionRange(this.world, this.sansEntry)) return false;
    this.show(murderLevel(this.world.flags) >= 3 && !this.world.flags[27] ? 'sansMurder' : 'sans', () => { this.stage = 'done'; }); return true;
  }

  destroy() { this.path?.stop(); this.alert?.destroy(); this.orb?.destroy(); this.fake?.destroy(); this.world.player?.setVisible(true); this.removeWall(); }
}
