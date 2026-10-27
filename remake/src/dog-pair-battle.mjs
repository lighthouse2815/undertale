import { MultiBattle } from './multi-battle.mjs';
import { DogPairWave, loadDogPairWaveAssets } from './dog-pair-waves.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';
import data from './dog-pair-battle.json' with { type: 'json' };

// Nhóm25: hai HP/DEF/mục tiêu độc lập, ngửi/lăn/vuốt ve liên quan giữa đôi chó.
export class DogPairBattle extends MultiBattle {
  constructor() { super('DogPairBattle'); }
  preload() {
    super.preload(); loadDogPairWaveAssets(this); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries(data.sprites)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_plain')) {
      this.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href); this.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href);
    }
  }
  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000'); return { battleDialogue: data };
  }
  setupEnemy() {
    pauseSnowdinMusicForBattle(this); this.populationFlag = 0; this.selected = 0; this.elapsedDogs = 0; this.dogFrames = 0;
    this.enemy.destroy(); this.xpReward = this.goldReward = 0; this.lastAction = null; this.labels = [];
    this.enemies = this.dogs = data.dogs.map((d, i) => ({ ...d, index: i, hp: 108, maxHp: 108, def: 4, mercy: -999, smell: 0, alive: true,
      main: this.add.image(104, 19, `${d.sprite}:0`).setOrigin(0).setScale(.5).setDepth(-10).setVisible(false),
      bodyImage: this.add.image(104, 19, `${d.body}:0`).setOrigin(0).setDepth(-10),
      axeImage: this.add.image(104, 19, `${d.axe}:0`).setOrigin(0).setDepth(-9) }));
    this.enemy = this.dogs[0].main;
  }
  choose(kind, items) { super.choose(kind, kind === 'mercy' ? ['Spare'] : items); }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu(data.intro[0]); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) {
      const kind = this.kind; this.selectTarget();
      if (kind === 'actTarget') this.choose('act', ['Check', 'Re-sniff', 'Pet', 'Roll Around']);
      else { this.clearLabels(); this.startFight(); }
    } else if (this.kind === 'act') { const action = [0, 1, 3, 4][this.subIndex]; this.clearLabels(); this.act(action); }
    else if (this.kind === 'mercy') {
      for (const d of this.live().filter((d) => this.spareable(d))) this.removeEnemy(d, false);
      if (!this.live().length) this.end(); else this.dummyTurn();
    } else if (this.kind === 'item') this.useInventory();
  }
  act(action) {
    const d = this.dogs[this.selected], both = this.live().length > 1; let lines;
    this.lastAction = { target: d.index, action };
    if (action === 0) lines = d.check;
    if (action === 1) {
      lines = both ? d.sniff[Math.min(d.smell, 2)] : d.sniffAlone;
      if (d.smell === 1) this.live().forEach((dog) => { dog.smell = 2; });
    }
    if (action === 3) {
      lines = !both ? d.petAlone : d.smell < 2 ? d.petFail : d.pet;
      if (both && d.smell >= 2) { d.smell = 3; if (this.live().every((dog) => dog.smell === 3)) { this.live().forEach((dog) => { dog.mercy = 999; }); this.previousScene.flags[140] = 1; } }
    }
    if (action === 4) { lines = d.roll; if (!d.smell) this.live().forEach((dog) => { dog.smell = 1; }); }
    this.showPages(lines, () => this.dummyTurn());
  }
  useInventory() {
    if (this.previousScene.inventory[this.subIndex] !== 3) { super.useInventory(); return; }
    const both = this.live().length > 1; this.live().forEach((dog) => { dog.mercy = both ? 102 : -9999; });
    this.lastAction = null; this.showPages(both ? data.stick : data.stickAlone, () => this.dummyTurn());
  }
  speech(dog, command) {
    const both = this.live().length > 1, action = this.lastAction;
    let key = dog.index === 0 ? [251, 252, 253, 254][Math.min(3, Math.floor(command / 25))] : [247, 248, 249, 250][Math.min(3, Math.floor(command / 25))];
    if (both && action?.action === 1) key = dog.index ? dog.smell > 0 ? 257 : 256 : dog.smell > 0 ? 260 : 259;
    if (both && action?.action === 3) key = dog.index === 0 ? action.target === 0 ? dog.smell < 2 ? 264 : 267 : dog.smell < 2 ? 272 : 273
      : action.target === 1 ? dog.smell < 2 ? 261 : 264 : dog.smell < 2 ? 269 : 270;
    if (!both) key = dog.index ? [276, 277, 278][command < 33 ? 0 : command < 66 ? 1 : 2] : command < 50 ? 280 : 281;
    return dog.speech[key];
  }
  dummyTurn() {
    this.clearLabels(); const live = this.live(); if (!live.length) { this.end(); return; }
    if (live.length === 1) { live[0].def = live[0].index ? -8 : -30; live[0].mercy = -1000; }
    this.command = Math.round(Math.random() * 100); this.womanCommand = Math.round(Math.random() * 100);
    this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 120 * 1000 / 30;
    this.speechBoxes = []; this.speechTexts = [];
    for (const d of live) {
      d.main.setVisible(false); d.bodyImage.setVisible(true); d.axeImage.setVisible(true);
      const x = d.index ? 216 : 42.5;
      this.speechBoxes.push(this.add.image(x, 45, d.index ? 'spr_blconsm:0' : 'spr_blconsm2:0').setOrigin(0).setScale(.5));
      this.speechTexts.push(this.add.bitmapText(x + 7.5, 50, 'fnt_plain:black', this.speech(d, d.index && live.length === 1 ? this.womanCommand : this.command), 6));
    }
    this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
  }
  update(time, delta) {
    this.elapsedDogs = Math.min(200, this.elapsedDogs + delta);
    while (this.elapsedDogs >= 1000 / 30) { this.elapsedDogs -= 1000 / 30; this.dogFrames++; }
    if (this.mode === 'speech' && (this.speechTime <= delta || this.confirmPressed)) { this.speechBoxes.forEach((e) => e.destroy()); this.speechTexts.forEach((e) => e.destroy()); }
    super.update(time, delta);
  }
  animateEnemy() {
    if (!this.dogs || this.mode === 'dead') return;
    const live = this.live();
    for (const d of live) d.bodyImage.setTexture(`${d.body}:${live.length > 1 ? Math.floor(this.dogFrames * .125) % 11 : 0}`).setDepth(Math.floor(this.dogFrames * .125) % 11 ? -10 : -9);
  }
  beginWave() {
    const live = this.live(); this.wave = new DogPairWave(this, this.command, live.length === 1 ? live[0].index ? 'dogaressa' : 'dogamy' : null);
    this.bullets = this.wave.bullets; this.soul.setVisible(true); this.soulElapsed = 0; this.mode = 'soul';
  }
  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++; this.lastAction = null;
    const woman = this.dogs[1]; let line = data.idleMan[0];
    if (woman.alive) {
      let i = Math.min(3, Math.floor(this.womanCommand / 25)); if (woman.smell === 1) i = 4; if (woman.smell === 2) i = 5;
      if (woman.mercy > 100) i = 6; if (woman.mercy > 900) i = 7; if (this.live().length === 1) i = 8; line = data.idleWoman[i];
    }
    this.toMenu(line); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  hurtEnemy(dog) {
    dog.bodyImage.setVisible(false); dog.axeImage.setVisible(false); dog.main.setTexture(`${dog.sprite}:1`).setVisible(true); this.sound.play('snd_damage');
    this.time.delayedCall(11 * 1000 / 30, () => this.sound.play('snd_ehurt1'));
  }
  removeEnemy(dog, killed) {
    if (!dog.alive) return;
    dog.alive = false; dog.main.setVisible(false); dog.bodyImage.destroy(); dog.axeImage.destroy(); const w = this.previousScene;
    this.goldReward += killed ? 25 : Math.floor(25 * (108 - dog.hp) / 108) + (dog.mercy > 10 && dog.hp === 108 ? dog.index ? 10 : 30 : 0);
    if (killed) { this.xpReward += 30; w.kills++; w.flags[12] = 1; }
    else { w.flags[10] = 1; w.flags[23] = (w.flags[23] ?? 0) + 1; }
    if (!dog.index) {
      if (dog.mercy > 80 && dog.mercy < 400) w.flags[53] = 2;
      if (killed) w.flags[53] = 1; else w.flags[27] = 1;
      w.plot = 50;
    }
  }
  end() {
    const w = this.previousScene; this.clearLabels(); this.music.stop();
    let line = this.dialogue.win[0].replace(/\\\[1\]/g, String(this.xpReward)).replace(/\\\[2\]/g, String(this.goldReward));
    if (LEVEL_THRESHOLDS.filter((t) => w.xp + this.xpReward >= t).length > w.lv) { line += this.dialogue.levelUp[0]; this.sound.play('snd_levelup'); }
    this.showPages([line], () => this.finishWith());
  }
  finishWith() {
    const w = this.previousScene; w.xp = Math.min(99999, w.xp + this.xpReward); w.gold += this.goldReward;
    w.lv = LEVEL_THRESHOLDS.filter((t) => w.xp >= t).length; w.maxHp = w.lv === 20 ? 99 : 16 + w.lv * 4; this.finishBattle();
  }
}
