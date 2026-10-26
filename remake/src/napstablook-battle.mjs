import { RuinsBattle } from './ruins-battle.mjs';
import { NapstablookWave } from './napstablook-waves.mjs';

// Battlegroup 20, obj_napstablook: mercymod, ACT và kết thúc riêng của ma.
export class NapstablookBattle extends RuinsBattle {
  constructor() { super('NapstablookBattle'); this.musicKey = 'mus_ghostbattle'; }

  preload() {
    super.preload();
    const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries({ spr_napstabattle: 2, spr_blookhat: 6, spr_teardrop: 1,
      spr_streambullet: 2, spr_bulletNapstaSad: 1 })) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`))
        this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
      if (!this.textures.exists(`${key}:mask`)) this.load.image(`${key}:mask`, new URL(`sprites/${key}/${key}_0.mask.png`, base).href);
    }
    if (!this.textures.exists('spr_streambullet:mask:1')) this.load.image('spr_streambullet:mask:1', new URL('sprites/spr_streambullet/spr_streambullet_1.mask.png', base).href);
    if (!this.cache.audio.exists('mus_ghostbattle')) this.load.audio('mus_ghostbattle', new URL('sounds/mus_ghostbattle/mus_ghostbattle.ogg', base).href);
    if (!this.cache.json.exists('napstablook-battle')) this.load.json('napstablook-battle', new URL('./napstablook-battle.json', import.meta.url).href);
  }

  loadBattleData() {
    super.loadBattleData();
    const text = this.cache.json.get('napstablook-battle');
    return { battleDialogue: { ...text, intro: this.game.scene.getScene('World').flags[6] === 1 ? text.hardIntro : text.intro } };
  }

  setupEnemy() {
    this.enemy.setPosition(133, 53).setScale(1);
    this.mercyModifier = -400; this.lastAct = null;
    this.hat = this.add.image(150, 38, 'spr_blookhat:0').setOrigin(0).setVisible(false);
  }

  animateEnemy(time) {
    if (this.enemy.visible && this.enemy.active) this.enemy.setTexture(`spr_napstabattle:${Math.floor(time / (1000 / 6)) % 2}`);
  }

  updateSubmenu() {
    if (this.kind !== 'actTarget' && this.kind !== 'act') { super.updateSubmenu(); return; }
    this.drawSubmenu();
    if (this.cancel) { this.toMenu(this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') { this.choose('act', ['Check', 'Threat', 'Cheer', 'Flirt']); return; }
    const act = this.subIndex;
    this.lastAct = act;
    if (act === 3 || act === 2 && this.mercyModifier === -50) {
      if (this.mercyModifier === -50) {
        this.music.stop(); this.speak(this.text.speech[act === 3 ? 10 : 11], () => this.finishWith('cheered'));
      } else this.dummyTurn();
      return;
    }
    let lines;
    if (act === 0) lines = this.previousScene.flags[6] === 1 ? this.text.hardCheck : this.text.check;
    else if (act === 1) lines = this.text.threat;
    else {
      const index = this.mercyModifier < -400 ? 0 : this.mercyModifier === -400 ? 1 : this.mercyModifier === -300 ? 2 : 3;
      lines = [this.text.cheer[index]]; this.mercyModifier += 100;
    }
    this.showPages(lines, () => this.dummyTurn());
  }

  speak(line, after, duration = 75 * 1000 / 30) {
    this.mode = 'napSpeech'; this.speechTime = duration; this.afterSpeech = after;
    this.message.setText(''); this.menu.setText('');
    this.speechBox?.destroy(); this.speechText?.destroy();
    this.speechBox = this.add.rectangle(202, 45, 112, 72, 0xffffff).setOrigin(0);
    this.speechText = this.add.text(209, 49, line, { color: '#000', fontSize: '9px', fontFamily: 'monospace', wordWrap: { width: 100 } });
  }

  update(time, delta) {
    if (this.mode === 'napSpeech') {
      this.speechTime -= delta;
      if (this.speechTime <= 0 || this.confirmPressed) {
        this.speechBox.destroy(); this.speechText.destroy(); this.afterSpeech();
      }
      this.animateEnemy(time); this.confirmPressed = false; this.cancel = false;
      return;
    }
    super.update(time, delta);
  }

  dummyTurn() {
    this.command = Math.round(Math.random() * 100);
    let speech = this.text.speech[this.command < 40 ? 0 : this.command < 66 ? 1 : 2];
    if (this.lastAct === 0) speech = this.text.speech[3];
    if (this.lastAct === 1) speech = this.text.speech[4];
    if (this.lastAct === 3) speech = this.text.speech[5];
    if (this.lastAct === 2) speech = this.text.speech[this.mercyModifier > -200 ? 8 : this.mercyModifier > -300 ? 7 : 6];
    // ITEM/Check/Threat/FIGHT sau màn mũ làm mất sự tự tin; Spare không làm vậy.
    if (this.mercyModifier === -50 && this.lastAct !== 2 && this.lastAct !== 3 && this.kind !== 'mercy') {
      this.mercyModifier = -1200; this.hat.setVisible(false); speech = this.text.speech[9];
    }
    const left = this.turn === 1 ? 96 : 118.5, width = this.turn === 1 ? 125 : 80;
    this.arena.setPosition(left, 125).setSize(width, 67.5);
    this.soul.setTexture('spr_heart:0').setOrigin(0).setScale(.5).setPosition(154.5, 154.5).setVisible(false);
    this.target.setVisible(false); this.bar.setVisible(false);
    this.speak(speech, () => this.beginWave());
  }

  beginWave() {
    this.mode = 'soul'; this.soul.setVisible(true); this.soulElapsed = 0;
    this.waveKind = this.mercyModifier === -100 ? 'hat' : this.turn === 1 ? 'sad' : this.command <= 50 ? 'tears' : 'stream';
    this.wave = new NapstablookWave(this, this.waveKind); this.bullets = this.wave.bullets;
  }

  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++; this.lastAct = null;
    const i = this.command >= 90 ? 3 : this.command >= 70 ? 2 : this.command >= 30 ? 1 : 0;
    this.toMenu(this.mercyModifier === -50 ? this.text.hatWaiting : this.text.idle[this.mercyModifier > -290 ? 5 : this.mercyModifier > -400 ? 4 : i]);
    this.arena.setPosition(16, 125).setSize(285, 67.5);
  }

  end(outcome) {
    if (outcome !== 'kill') { this.finishWith(outcome); return; }
    // HP về 0 chỉ là giả vờ: không cộng EXP/GOLD/kill, cũng không trừ EXP.
    this.previousScene.plot = 11;
    this.enemy.setTexture('spr_napstabattle:0').setVisible(true);
    this.showPages(this.text.beaten, () => {
      this.mode = 'leaving';
      this.tweens.add({ targets: [this.enemy, this.hat], alpha: 0, duration: 18 * 1000 / 30, onComplete: () => {
        this.music.stop(); this.showPages(this.text.win, () => this.finishWith('beaten'));
      } });
    });
  }

  finishWith(outcome) {
    const world = this.previousScene;
    if (outcome === 'flee') { world.flags[11] = 1; world.flags[24] = (world.flags[24] ?? 0) + 1; }
    else {
      world.flags[23] = (world.flags[23] ?? 0) + 1;
      if (outcome === 'cheered') world.plot = 10.3;
    }
    this.finishBattle();
  }
}
