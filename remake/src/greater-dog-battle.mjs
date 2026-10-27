import { MultiBattle } from './multi-battle.mjs';
import { RuinsBattle } from './ruins-battle.mjs';
import { GreaterDogWave, loadGreaterDogWaveAssets } from './greater-dog-waves.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';
import data from './greater-dog-battle.json' with { type: 'json' };

// Battlegroup26: GreaterDog105HP, Ignore/Beckon/Pet/Play, Stick và cờ54 cho hậu cảnh.
export class GreaterDogBattle extends MultiBattle {
  constructor() { super('GreaterDogBattle'); this.musicKey = 'mus_dogsong'; }
  preload() {
    super.preload(); loadGreaterDogWaveAssets(this); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries(data.sprites)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.audio.exists('mus_dogsong')) this.load.audio('mus_dogsong', new URL('sounds/mus_dogsong/mus_dogsong.ogg', base).href);
  }
  loadBattleData() { super.loadBattleData(); return { battleDialogue: data }; }
  async create() { await super.create(); if (window.__remake.phase !== 'battle') return; this.music.setRate(.95).setVolume(.7); }
  setupEnemy() {
    pauseSnowdinMusicForBattle(this); this.populationFlag = 0; this.labels = []; this.selected = 0; this.dogignore = 0; this.close = false; this.pet = 0; this.soulSpeed = 4; this.enemyFrames = 0; this.animElapsed = 0; this.ended = this.showingHurt = false;
    this.enemy.setPosition(104, 19).setVisible(false); this.enemies = [{ index: 0, name: 'Greater Dog', main: this.enemy, hp: 105, maxHp: 105, def: 4, mercy: -25, alive: true }];
    this.body = this.add.image(104, 19, 'spr_greatdog_n:0').setOrigin(0); this.enemyParts = [this.body];
    this.clip = this.add.graphics().fillStyle(0xffffff).fillRect(0, 0, 320, 125).setVisible(false); this.mask = this.clip.createGeometryMask(); this.body.setMask(this.mask);
    this.events.once('shutdown', () => { this.mask.destroy(); this.clip.destroy(); });
  }
  choose(kind, items) { super.choose(kind, kind === 'mercy' ? ['Spare'] : items); }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu(data.intro[0]); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) { const kind = this.kind; this.selectTarget(); this.clearLabels(); if (kind === 'fightTarget') this.startFight(); else this.choose('act', data.actions); }
    else if (this.kind === 'act') { const choice = this.subIndex; this.clearLabels(); this.act(choice); }
    else if (this.kind === 'item') { this.clearLabels(); this.useInventory(); }
    else if (this.kind === 'mercy') { this.clearLabels(); if (this.spareable()) this.end('spare'); else this.dummyTurn(); }
  }
  act(choice) {
    const e = this.enemies[0]; let key = 'check';
    if (choice === 1) { key = this.close ? 'beckonAgain' : 'beckon'; this.close = true; }
    if (choice === 2) { this.dogignore = Math.min(4, this.dogignore + 1); this.close = true; key = this.dogignore === 4 ? 'ignoreEnd' : 'ignore'; }
    if (this.pet > 0) e.def = -20; // Step gốc đổi DEF trước khi xử lý Pet của lượt này.
    if (choice === 3) {
      key = !this.close ? 'petFar' : ['petFirst', 'petExcited', 'petSlow', 'petFull', 'petAgain'][this.pet];
      if (this.close && this.pet === 0) this.pet = 1;
      else if (this.pet === 2) { this.pet = 3; this.soulSpeed = 3; }
      else if (this.pet === 3) { this.pet = 4; this.soulSpeed = 4; e.mercy = 9999; this.previousScene.flags[142] = 1; }
    }
    if (choice === 4) { key = this.pet === 0 ? 'playEarly' : this.pet === 1 ? 'play' : 'playAgain'; if (this.pet === 1) this.pet = 2; }
    this.showPages(data[key], () => { if (this.dogignore === 4) { e.mercy = 6666; this.previousScene.flags[54] = 3; this.end('spare'); } else this.dummyTurn(); });
  }
  useInventory() {
    if (this.previousScene.inventory[this.subIndex] !== 3) { super.useInventory(); return; }
    this.enemies[0].mercy = 250; this.showPages(data.stick, () => this.dummyTurn());
  }
  dummyTurn() { this.showingHurt = false; this.enemy.setVisible(false); this.body.setVisible(true); this.command = Math.round(Math.random() * 100); this.mode = 'speech'; this.speechTime = 15 * 1000 / 30; this.message.setText(''); this.menu.setText(''); this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false); this.arena.setPosition(113.5, 125).setSize(90, 67.5); }
  beginWave() { this.wave = new GreaterDogWave(this, this.command); this.bullets = this.wave.bullets; this.mode = 'soul'; this.soulElapsed = 0; this.soul.setVisible(true); }
  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++;
    let i = this.command >= 90 ? 2 : this.command >= 45 ? 1 : 0; if (this.close) i = 3; if (this.dogignore) i = 4; if (this.dogignore > 2) i = 5; if (this.pet) i = 5 + this.pet; if (this.enemyHp < 30) i = 10;
    this.toMenu(data.idle[i]); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  update(time, delta) {
    this.animElapsed = Math.min(200, this.animElapsed + delta); while (this.animElapsed >= 1000 / 30) { this.animElapsed -= 1000 / 30; this.enemyFrames++; } super.update(time, delta);
  }
  animateEnemy() {
    if (this.mode === 'dead' || this.showingHurt || this.ended || !this.body?.active) return;
    const scale = 1 + this.dogignore * .5;
    const x = this.dogignore === 1 ? 74 : this.dogignore === 2 ? 54 : this.dogignore >= 3 ? 104 - 250 / 3 : 104;
    const y = this.dogignore === 1 ? 34 : this.dogignore === 2 ? 54 : this.dogignore >= 3 ? this.arena.y - 42.5 : 19;
    this.body.setPosition(x + (this.dogignore >= 3 ? scale : 0), y).setScale(scale).setTexture(`spr_greatdog_n:${Math.floor(this.enemyFrames * .1) % 2}`);
    this.body.setCrop(this.dogignore >= 3 ? 43 : 0, 0, this.dogignore >= 3 ? 17 : 100, Math.max(0, (125 - y) / scale));
  }
  hurtEnemy() { this.dogignore = 0; this.showingHurt = true; this.body.setVisible(false); this.enemy.setVisible(true).setTexture('spr_greatdog:1'); this.sound.play('snd_damage'); this.time.delayedCall(11 * 1000 / 30, () => this.sound.play('snd_ehurt1')); }
  removeEnemy(enemy, killed) { enemy.alive = false; this.pendingOutcome = killed ? 'kill' : 'spare'; }
  rewardGold(outcome) { const e = this.enemies[0]; return (e.mercy > 10 && e.hp === e.maxHp ? 40 : 0) + (outcome === 'kill' ? 60 : Math.floor(60 * (e.maxHp - e.hp) / e.maxHp)); }
  end(outcome = this.pendingOutcome) {
    this.ended = true; this.clearLabels(); const w = this.previousScene;
    if (this.enemies[0].mercy === 250) w.flags[54] = 2; if (outcome === 'kill') w.flags[54] = 1; else w.flags[27] = 1; w.plot = 60;
    RuinsBattle.prototype.end.call(this, outcome);
  }
}
