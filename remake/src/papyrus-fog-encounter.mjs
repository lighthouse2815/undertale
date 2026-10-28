import { touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { papyrusFogIntro, papyrusFogOffer, papyrusFogAfter, papyrusFogMurderSpeech } from './papyrus-fog-dialogue.mjs';

// obj_papyrus8: cuộc gặp, trận đấu và hậu quả tại phòng sương.
export class PapyrusFogEncounter {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.locked = false;
    this.stage = world.plot > 100 ? 'done' : 'waiting';
    this.murder = murderLevel(world.flags) >= 7 && !world.flags[27];
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus8');
    if (this.stage === 'waiting') world.flags[68] = 0;
  }
  actor(x, y, key, depth = -900) {
    const w = this.world, s = w.dataSource.sprites.get(key);
    return w.add.image(x, y, `${key}:0`).setOrigin(s.OriginX / s.Width, s.OriginY / s.Height).setDepth(depth);
  }
  wait(stage, duration = 0) { this.stage = stage; this.frames = 0; this.duration = duration; }
  show(pages, next) {
    const w = this.world; this.wait('talking');
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => {
      const p = pages[i]; w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_papyrus' ? 8 : 12);
      if (this.pap && this.stage === 'talking' && this.shadow) this.pap.setTexture(`spr_papyrus_shadow${i > 14 && i < 18 ? 'r' : 'l'}:0`);
    }, onClose: next });
  }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 999)) return false;
    this.locked = true; w.release(); w.player.y = 120; w.hp = w.maxHp; this.camera = w.cameras.main.scrollX; this.startX = w.player.x;
    this.pap = this.actor(w.player.x + 200, 110, 'spr_papyrus_lt');
    this.music = w.townMusic; w.townMusic = null; this.fadeMusic = true;
    this.wait('pan'); return true;
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world; this.frames++;
    if (this.fadeMusic && this.music) {
      this.music.setVolume(Math.max(0, this.music.volume - .01));
      if (!this.music.volume) { this.music.destroy(); this.music = null; this.fadeMusic = false; }
    }
    if (this.stage === 'pan') {
      w.cameras.main.scrollX = Math.min(this.camera + 100, w.cameras.main.scrollX + 3);
      if (w.cameras.main.scrollX >= this.camera + 100) {
        this.chara = this.actor(w.player.x, 120, 'spr_maincharar_shadow').setAlpha(0); w.player.setVisible(false);
        this.pap.setTexture('spr_papyrus_shadowl:0').setAlpha(0); this.shadow = true; this.wait('charaFade');
      }
    } else if (this.stage === 'charaFade') {
      this.chara.alpha = Math.min(.9, this.chara.alpha + .01); if (this.chara.alpha >= .9) this.wait('papFade');
    } else if (this.stage === 'papFade') {
      this.pap.alpha = Math.min(.9, this.pap.alpha + .01); if (this.pap.alpha >= .9) this.wait('introWait', 40);
    } else if (this.stage === 'introWait' && this.frames >= this.duration) this.intro();
    else if (this.stage === 'murderWalk') {
      this.chara.x += 2;
      if (this.frames >= this.duration) this.wait('murderPause', 30);
    } else if (this.stage === 'murderPause' && this.frames >= this.duration) {
      const index = this.murderIndex++; this.show(papyrusFogMurderSpeech[index], () => index === 2 ? this.beforeBattle() : this.wait('murderWalk', index === 0 ? 15 : 30));
    } else if (this.stage === 'beforeBattle' && this.frames >= this.duration) {
      w.player.x = this.chara.x; w.flags[200] = 0; w.snowdinFog.frozen = true; this.wait('battle'); w.release(); window.__remake.startBattle('papyrus');
    } else if (this.stage === 'battle' && w.flags[68] === 1) this.afterBattle();
    else if (this.stage === 'afterWait' && this.frames >= this.duration) this.wait('shadowsOut');
    else if (this.stage === 'shadowsOut') {
      this.chara.alpha = Math.max(0, this.chara.alpha - .03); this.pap.alpha = Math.max(0, this.pap.alpha - .03);
      if (this.chara.alpha <= .03) { this.chara.destroy(); this.chara = null; w.player.setVisible(true); this.shadow = false; if (w.flags[67] !== 1) this.pap.setTexture('spr_papyrus_rt:0').setAlpha(1).setDepth(-1100); this.wait('fogOut'); }
    } else if (this.stage === 'fogOut') {
      w.snowdinFog.alpha = Math.max(0, w.snowdinFog.alpha - .02);
      if (!w.snowdinFog.alpha) { if (!this.murder) w.flags[27] = 1; this.wait(w.flags[67] === 1 ? 'panBack' : 'afterPause', 30); }
    } else if (this.stage === 'afterPause' && this.frames >= this.duration) this.afterSpeech();
    else if (this.stage === 'depart') {
      this.pap.x -= 3.5;
      const count = w.dataSource.sprites.get('spr_papyrus_l').TextureCount;
      this.pap.setTexture(`spr_papyrus_l:${Math.floor(this.frames * .5) % count}`);
      if (this.frames >= 90) this.wait('panBack');
    } else if (this.stage === 'panBack') {
      w.cameras.main.scrollX = Math.max(this.camera, w.cameras.main.scrollX - 3);
      if (w.cameras.main.scrollX <= this.camera) { w.plot = 101; this.locked = false; this.wait('done'); this.pap?.destroy(); this.pap = null; this.music?.destroy(); this.music = null; w.release(); }
    }
  }
  intro() {
    const w = this.world, memory = Number(localStorage.getItem('undertale-remake-papyrus-spares') ?? 0), result = papyrusFogIntro(w.flags, memory, this.murder);
    this.show(result.pages, () => {
      if (result.murder) { this.music = w.sound.add('mus_papyrusboss', { loop: true, volume: .8, rate: .2 }); this.music.play(); this.murderIndex = 0; this.wait('murderWalk', 15); }
      else if (result.offer) {
        this.wait('choice'); w.showChoice('* (Fight Papyrus?)', ['Yes', 'No'], (choice) => {
          const offer = papyrusFogOffer(choice); this.show(offer.pages, () => {
            if (offer.fight) this.beforeBattle();
            else { w.flags[67] = 0; w.flags[68] = 1; w.snowdinFog.frozen = true; this.wait('battle'); }
          });
        });
      } else this.beforeBattle();
    });
  }
  beforeBattle() {
    const w = this.world; if (this.music) { this.music.destroy(); this.music = null; } this.fadeMusic = false;
    w.sound.play('snd_break2'); this.wait('beforeBattle', 40);
  }
  afterBattle() {
    const w = this.world; w.player.x = this.chara.x = this.startX; // chara.xstart trong mã gốc.
    if (w.flags[67] < 0) { this.wait('transition'); w.transitionRoom('room_tundra_garage', 'obj_mainchara', 14 * 1000 / 30); return; }
    if (w.flags[67] === 1) this.pap.setAlpha(0);
    this.wait('afterWait', 15);
  }
  afterSpeech() {
    const w = this.world, result = papyrusFogAfter(w.flags, this.murder);
    localStorage.setItem('undertale-remake-papyrus-spares', String(Number(localStorage.getItem('undertale-remake-papyrus-spares') ?? 0) + 1));
    this.show(result.intro, () => {
      const continueSpeech = () => { this.music = w.sound.add('mus_papyrus', { loop: true, volume: .5 }); this.music.play();
        this.show(result.king, () => { w.flags[88] = 1; this.show(result.friends, () => this.wait('depart')); }); };
      if (!result.choice) { continueSpeech(); return; }
      this.wait('choice'); w.showChoice('* (What should you say?)', ["Let's be\nfriends", 'What a\nloser'], (choice) => this.show(result.answer(choice), continueSpeech));
    });
  }
  destroy() { this.music?.destroy(); this.chara?.destroy(); this.pap?.destroy(); }
}
