import { RuinsBattle } from './ruins-battle.mjs';
import { LesserDogWave } from './lesser-dog-waves.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';
import data from './lesser-dog-battle.json' with { type: 'json' };

// Nhóm24: sáu ô ACT, cổ dài theo Pet, Stick và hai đợt né đạn.
export class LesserDogBattle extends RuinsBattle {
  constructor() { super('LesserDogBattle'); }

  preload() {
    super.preload(); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries(data.sprites)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.textures.exists('spr_whitespear:mask')) this.load.image('spr_whitespear:mask', new URL('sprites/spr_whitespear/spr_whitespear_0.mask.png', base).href);
    if (!this.cache.bitmapFont.exists('fnt_plain')) {
      this.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href); this.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href);
    }
    for (const key of ['snd_pombark', 'snd_doghurt1']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
  }

  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000'); return { battleDialogue: data };
  }

  async create() {
    await super.create(); if (window.__remake.phase === 'error') return;
    const old = this.onKeyDown;
    window.removeEventListener('keydown', old);
    this.onKeyDown = (event) => {
      if (this.mode === 'submenu' && this.kind === 'act' && event.code.startsWith('Arrow')) {
        if (event.repeat) return;
        const column = Math.floor(this.subIndex / 3), row = this.subIndex % 3;
        if (event.code === 'ArrowLeft') this.subIndex = row;
        if (event.code === 'ArrowRight') this.subIndex = 3 + row;
        if (event.code === 'ArrowUp') this.subIndex = column * 3 + Math.max(0, row - 1);
        if (event.code === 'ArrowDown') this.subIndex = column * 3 + Math.min(2, row + 1);
      } else old(event);
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  setupEnemy() {
    this.fieldMusic = pauseSnowdinMusicForBattle(this); this.populationFlag = 203; this.config = { ...this.config };
    this.enemy.setPosition(108, 19); this.mercyModifier = 0; this.showingHurt = false; this.lastAct = null;
    this.neck = this.add.graphics(); this.tail = this.add.image(107.5, 19, 'spr_lesserdogetail:0').setOrigin(0);
    this.head = this.add.image(108, 19, 'spr_lesserdogehead:0').setOrigin(0).setScale(.5);
    this.secondHead = this.add.image(206, 20, 'spr_lesserdogehead:0').setOrigin(0).setScale(-.5).setVisible(false);
    this.enemyParts = [this.tail, this.head, this.secondHead, this.neck]; this.animationElapsed = 0; this.headFrame = 0; this.tailFrame = 0; this.bodyFrame = 0;
    this.petLabels = [];
  }

  update(time, delta) {
    this.animationElapsed = Math.min(200, this.animationElapsed + delta);
    while (this.animationElapsed >= 1000 / 30) {
      this.animationElapsed -= 1000 / 30; this.headFrame = (this.headFrame + Math.min(.5, this.mercyModifier / 900)) % 2;
      this.tailFrame = (this.tailFrame + Math.min(2, this.mercyModifier / 400)) % 5; this.bodyFrame = (this.bodyFrame + .1) % 2;
    }
    super.update(time, delta);
  }

  animateEnemy() {
    if (this.mode === 'dead' || !this.enemy.active || !this.enemy.visible) return;
    this.enemy.setTexture(this.showingHurt ? 'spr_lesserdogehurt:0' : `spr_lesserdoge:${Math.floor(this.bodyFrame)}`);
    this.neck.clear(); if (this.showingHurt) { this.head.setVisible(false); this.secondHead.setVisible(false); return; }
    const mercy = this.mercyModifier, y = this.enemy.y - mercy / 8;
    this.head.setVisible(true).setPosition(this.enemy.x, y).setTexture(`spr_lesserdogehead:${Math.floor(this.headFrame)}`);
    this.tail.setPosition(this.enemy.x - .5, this.enemy.y).setTexture(`spr_lesserdogetail:${Math.floor(this.tailFrame)}`);
    this.neck.fillStyle(0xffffff).fillRect(this.enemy.x + 22, y + 39.5, 18.5, mercy / 8)
      .fillRect(this.enemy.x + 27, y + 39.5, 11, 9.5 + mercy / 8);
    this.secondHead.setVisible(mercy > 500);
    if (mercy > 500) {
      this.neck.fillRect(this.enemy.x + 58, -.5, 18, Math.max(0, ((mercy - 500) / 4 - 40) / 2));
      this.secondHead.setPosition(this.enemy.x + 98, (mercy - 500) / 8 + 20).setTexture(`spr_lesserdogehead:${Math.floor(this.headFrame)}`);
    }
  }

  drawSubmenu() {
    if (this.kind !== 'act') { this.petLabels?.forEach((label) => label.destroy()); this.petLabels = []; super.drawSubmenu(); return; }
    this.menu.setText('');
    if (!this.petLabels.length) this.petLabels = data.actions.map((_label, i) =>
      this.add.bitmapText(32 + Math.floor(i / 3) * 140, 133 + i % 3 * 16, 'fnt_maintext', '', 12));
    this.petLabels.forEach((label, i) => label.setText(`${i === this.subIndex ? '>' : ' '} * ${data.actions[i]}`));
  }

  updateSubmenu() {
    if (!['actTarget', 'act'].includes(this.kind)) { super.updateSubmenu(); return; }
    this.drawSubmenu();
    if (this.cancel) { this.clearPetMenu(); this.toMenu(data.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') { this.choose('act', data.actions); return; }
    this.lastAct = this.subIndex; this.clearPetMenu();
    if (!this.lastAct) this.showPages(data.check, () => this.dummyTurn());
    else {
      const value = this.mercyModifier;
      const thresholds = [0, 40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540, 590, 640, 900, 1640, 2190, 2240, 2640, 2690];
      let index = 0;
      for (let i = 1; i < thresholds.length; i++) if (i >= 18 ? value >= thresholds[i] : value > thresholds[i]) index = i;
      if (value > 100) this.previousScene.flags[141] = 1;
      this.mercyModifier += 50; this.showPages([data.pet[index]], () => this.dummyTurn());
    }
  }

  clearPetMenu() { this.petLabels.forEach((label) => label.destroy()); this.petLabels = []; }

  useInventory() {
    if (this.previousScene.inventory[this.subIndex] !== 3) { super.useInventory(); return; }
    if (this.mercyModifier < 60) this.mercyModifier = 102;
    this.showPages(data.stick, () => this.dummyTurn());
  }

  dummyTurn() {
    this.showingHurt = false; this.enemyParts.forEach((part) => part.setVisible(true)); this.command = this.turn === 0 ? 10 : this.turn === 1 ? 90 : Math.round(Math.random() * 100);
    let speech = data.speech[Math.min(3, Math.floor(this.command / 25))];
    if (this.mercyModifier === 102) { this.mercyModifier = 103; speech = data.speech[4]; }
    if (this.mercyModifier > 10) this.config.def = -100;
    const thresholds = [90, 190, 340, 390, 440, 490, 540, 590, 640, 690];
    for (const [i, threshold] of thresholds.entries()) if (this.mercyModifier > threshold) speech = data.speech[5 + i];
    this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 75 * 1000 / 30;
    const x = (216 + 104 - 8) / 2, y = 23;
    this.speechBox = this.add.image(x, y, 'spr_blconsm:0').setOrigin(0).setScale(.5);
    this.speechText = this.add.bitmapText(x + 12.5, y + 5, 'fnt_plain:black', speech, 6);
    this.arena.setPosition(113.5, 125).setSize(90, 67.5); this.target.setVisible(false); this.bar.setVisible(false); this.soul.setVisible(false);
  }

  beginWave() {
    this.mode = 'soul'; this.soul.setVisible(true); this.soulElapsed = 0;
    this.wave = new LesserDogWave(this, this.command, this.mercyModifier); this.waveKind = this.wave.kind; this.bullets = this.wave.bullets;
  }

  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++; this.lastAct = null;
    let index = this.command >= 85 ? 3 : this.command >= 60 ? 2 : this.command >= 30 ? 1 : 0;
    const thresholds = [40, 200, 400, 700, 1640, 1740, 2190, 2340, 2640];
    for (const [i, threshold] of thresholds.entries()) if (this.mercyModifier >= threshold) index = i + 4;
    if (this.enemyHp < 20) index = 13;
    this.toMenu(data.idle[index]); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }

  updateFight(delta) {
    super.updateFight(delta);
    if (this.mode === 'pages' && this.damage !== undefined) { this.showingHurt = true; this.time.delayedCall(11 * 1000 / 30, () => this.sound.play('snd_doghurt1')); }
  }

  rewardGold(outcome) {
    const mercy = this.mercyModifier;
    return (outcome === 'kill' ? 15 : Math.floor(15 * (this.enemyMaxHp - this.enemyHp) / this.enemyMaxHp))
      + (mercy > 99 ? 7 : 0) + (mercy > 500 ? 13 : 0) + (mercy > 2600 ? 40 : 0);
  }

  finishWith(outcome) {
    const flags = this.previousScene.flags;
    if (this.mercyModifier >= 150) flags[55] = 2;
    if (outcome === 'kill') flags[55] = 1; else flags[27] = 1;
    super.finishWith(outcome);
  }
}
