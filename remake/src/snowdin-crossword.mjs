import { blocked, createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startSnowdinMusic, stopSnowdinMusic } from './snowdin-start.mjs';

// obj_papyrus3/obj_crossword: xem word search rồi chọn Jumble hoặc Crossword.
export class SnowdinCrossword {
  constructor(world) {
    this.world = world; this.text = world.dataSource.crosswordDialogue; this.elapsed = 0; this.frames = 0; this.total = 0; this.locked = false;
    this.stage = world.plot >= 46 ? 'done' : 'waiting'; this.murder = murderLevel(world.flags) >= 3;
    this.trigger = { ...world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus3') };
    this.paper = world.roomObjects.find((e) => e.item.ObjectName === 'obj_crossword');
    world.colliders.push(createCollider(world.dataSource, this.paper.item)); this.paper.image.setDepth(0);
    const fun = Number(localStorage.getItem('undertale-remake-fun') ?? 0);
    this.nightmare = [56, 57].includes(world.flags[5]) && [56, 57].includes(fun);
    this.cancel = () => { if (this.stage === 'sheet' && this.frames >= 11) this.closeSheet(); };
    for (const name of ['keydown-X', 'keydown-SHIFT']) world.input.keyboard.on(name, this.cancel);
    if (this.stage === 'waiting') {
      this.sans = this.actor(240, 94, 'spr_sans_d'); this.pap = this.actor(240, 120, 'spr_papyrus_ut');
    }
    Object.assign(this, startSnowdinMusic(world));
  }

  actor(x, y, key) { const d = this.world.dataSource.sprites.get(key); return this.world.add.image(x, y, `${key}:0`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height).setDepth(y + d.Height); }
  pose(actor, key, frame = 0) { const d = this.world.dataSource.sprites.get(key); actor.setTexture(`${key}:${frame}`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height).setDepth(actor.y + d.Height); }
  wait(stage) { this.stage = stage; this.frames = 0; }
  show(key, next) {
    const w = this.world, pages = this.text[key]; this.stage = 'talking';
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => {
      const p = pages[i]; w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_papyrus' ? 8 : 10);
    }, onClose: next });
  }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    if (this.stage === 'sheet' && this.world.justConfirmed() && this.frames >= 11) { this.closeSheet(); return true; }
    return this.locked;
  }

  step() {
    const w = this.world; this.frames++; this.total++;
    if (this.alertFrames && --this.alertFrames === 0) this.alert?.destroy();
    if (this.fadeOut) this.music.setVolume(Math.max(0, this.music.volume - this.fadeOut));
    if (this.stage === 'sheet' && this.frames === 1) this.sheet = w.add.image(20, 20, `spr_wordsearch:${this.nightmare ? 1 : 0}`).setOrigin(0).setScrollFactor(0).setDepth(100010);
    if (this.stage === 'notice' && this.frames >= 45) {
      this.pose(this.pap, 'spr_papyrus_lt_mad');
      this.show(this.murder ? 'explainMurder' : 'explain', () => {
        const item = { ObjectName: 'obj_puzzlewall2', X: 10, Y: 0, ScaleX: 1, ScaleY: 999 };
        this.wall = createCollider(w.dataSource, item); w.colliders.push(this.wall);
        this.pose(this.pap, 'spr_papyrus_lt'); this.pose(this.sans, 'spr_sans_l');
        this.trigger.X = 220; this.stage = 'explore'; this.locked = false;
      });
    } else if (this.stage === 'leaving') {
      this.pap.x += 5; this.pose(this.pap, 'spr_papyrus_r', Math.floor(this.frames * .25) % 4);
      if (this.frames >= 30) this.finish();
    }
  }

  debate() {
    const w = this.world, read = !!w.flags[254];
    if (this.murder) this.show(read ? 'murderRead' : 'murderSkipped', () => this.leave());
    else this.show(read ? 'debate' : 'debateSkipped', () => {
      w.showChoice('* (Which is harder?)', ['Jumble', 'Crossword'], (choice) => {
        w.flags[58] = choice; this.show(choice ? 'crossword' : 'jumble', () => this.leave());
      });
    });
  }

  leave() { this.fadeOut = .05; this.wait('leaving'); }
  finish() {
    const w = this.world; stopSnowdinMusic(w); this.fadeOut = 0;
    this.music = w.snowdinMusic = w.sound.add('mus_snowy', { loop: true, rate: .95 }); this.music.play();
    w.plot = 47; this.removeWall(); this.stage = 'done'; this.locked = false;
    if (!w.flags[413] && w.flags[67] !== 1) {
      const item = { ObjectName: 'obj_sans_room', X: this.sans.x, Y: this.sans.y, ScaleX: 1, ScaleY: 1 };
      const object = w.dataSource.objects.get(item.ObjectName), sprite = w.dataSource.sprites.get(object.Sprite);
      this.sansEntry = { item, object, sprite, image: this.sans }; w.roomObjects.push(this.sansEntry);
      w.colliders.push(createCollider(w.dataSource, item)); this.pose(this.sans, 'spr_sans_d');
    } else this.sans.destroy();
    this.pap.destroy(); w.release(); w.confirmPressed = false; w.menuPressed = false;
  }

  checkTrigger() {
    const w = this.world;
    if (this.locked || w.dialogue || !['waiting', 'explore'].includes(this.stage)) return false;
    if (this.stage === 'explore' && (w.keys.left.isDown || [...w.touch.values()].some((p) => p.direction === 'left')) && blocked(w, [this.wall], w.player.x - 3, w.player.y)) {
      w.player.x += 4; w.player.facing = 'r'; w.player.setTexture('spr_maincharar:0'); w.release(); this.locked = true;
      this.show('escape', () => { this.stage = 'explore'; this.locked = false; }); return true;
    }
    if (!touchesObject(w, w.player, this.trigger, 1, 999)) return false;
    this.locked = true; w.release();
    if (this.stage === 'waiting') {
      stopSnowdinMusic(w); this.music = w.snowdinMusic = w.sound.add('mus_papyrus', { loop: true, volume: .6 }); this.music.play();
      this.pose(this.pap, 'spr_papyrus_lt'); this.pose(this.sans, 'spr_sans_l');
      this.show('intro', () => {
        this.alert = this.actor(this.pap.x + 3, this.pap.y - 12, 'spr_exc').setDepth(1000); this.alertFrames = 30; this.wait('notice');
      });
    } else this.debate();
    return true;
  }

  closeSheet() { this.sheet?.destroy(); this.stage = this.beforeSheet; this.locked = false; this.world.release(); this.world.confirmPressed = false; }
  interact() {
    const w = this.world;
    if (inInteractionRange(w, this.paper)) {
      w.flags[254] = 1; this.beforeSheet = this.stage; this.wait('sheet'); this.locked = true; w.release(); return true;
    }
    if (!this.sansEntry || !inInteractionRange(w, this.sansEntry)) return false;
    this.show(murderLevel(w.flags) >= 3 ? w.flags[254] ? 'sansMurderRead' : 'sansMurderSkipped' : w.flags[58] ? 'sansCrossword' : 'sansJumble', () => { this.stage = 'done'; });
    return true;
  }

  removeWall() { this.world.colliders = this.world.colliders.filter((c) => c !== this.wall); this.wall = null; }
  destroy() {
    this.sheet?.destroy(); this.alert?.destroy(); this.removeWall();
    for (const name of ['keydown-X', 'keydown-SHIFT']) this.world.input.keyboard.off(name, this.cancel);
  }
}
