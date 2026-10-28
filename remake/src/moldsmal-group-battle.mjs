import { MultiBattle } from './multi-battle.mjs';
import { MoldsmalWave, loadMoldsmalWaveAssets } from './moldsmal-waves.mjs';
import { moldsmalAct, moldsmalStatus } from './moldsmal-act.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';

// Battlegroup 53: hai Moldsmal thường ở Waterfall.
export class MoldsmalGroupBattle extends MultiBattle {
  constructor() { super('MoldsmalGroupBattle'); }
  preload() {
    super.preload(); loadMoldsmalWaveAssets(this); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of [['spr_moldsmal', 2], ['spr_blconsm', 1]]) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_plain')) { this.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href); this.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href); }
  }
  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000'); return { battleDialogue: { intro: ['* You walk into Moldsmal.'] } };
  }
  setupEnemy() {
    const world = this.previousScene, music = world.waterfallMusic; music?.pause();
    this.events.once('shutdown', () => { if (music === world.waterfallMusic && music?.isPaused) music.resume(); });
    this.enemy.destroy(); this.labels = []; this.selected = 0; this.xpReward = 0; this.goldReward = 0; this.animElapsed = 0;
    this.enemies = [107, 209].map((x, index) => ({ index, name: 'Moldsmal', hp: 50, maxHp: 50, def: 0, mercy: 99, alive: true,
      x, y: 78, scale: 1, scaleValue: -.01, state: { heard: -1, monsterAttack: 7, mercyModifier: 99 },
      main: this.add.image(x, 78, 'spr_moldsmal:0').setOrigin(0).setScale(.5) }));
    this.enemy = this.enemies[0].main;
  }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu('* You walk into Moldsmal.'); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) { const kind = this.kind; this.selectTarget(); this.clearLabels(); if (kind === 'fightTarget') this.startFight(); else this.choose('act', ['Check', 'Imitate', 'Flirt']); }
    else if (this.kind === 'act') { const action = ['check', 'imitate', 'flirt'][this.subIndex]; this.clearLabels(); this.act(this.enemies[this.selected], action); }
    else if (this.kind === 'item') { this.clearLabels(); this.useInventory(); }
    else if (this.kind === 'mercy') {
      this.clearLabels(); if (this.subIndex === 1) { this.flee(); return; }
      for (const enemy of this.live().filter(e => this.spareable(e))) this.removeEnemy(enemy, false);
      if (!this.live().length) this.end(); else this.dummyTurn();
    }
  }
  act(enemy, action) {
    const line = moldsmalAct(enemy.state, action, this.previousScene.flags); enemy.mercy = enemy.state.mercyModifier;
    this.showPages([line], () => this.dummyTurn());
  }
  dummyTurn() {
    this.clearLabels(); this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 60 * 1000 / 30; this.speechBoxes = []; this.speechTexts = [];
    for (const enemy of this.live()) {
      enemy.hurt = false; enemy.main.setTexture('spr_moldsmal:0').setVisible(true); enemy.command = Math.round(Math.random() * 100);
      const line = enemy.command >= 75 ? '*Sexy\nwiggle*' : enemy.command >= 50 ? '*Slime\nsounds*' : enemy.command >= 25 ? 'Squorch\n...' : 'Burble\nburb...';
      this.speechBoxes.push(this.add.image(enemy.x + 47, 68, 'spr_blconsm:0').setOrigin(0).setScale(.5));
      this.speechTexts.push(this.add.bitmapText(enemy.x + 54.5, 73, 'fnt_plain:black', line, 6));
    }
    this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
  }
  update(time, delta) {
    this.animElapsed = Math.min(200, this.animElapsed + delta);
    while (this.animElapsed >= 1000 / 30) {
      this.animElapsed -= 1000 / 30;
      for (const enemy of this.enemies ?? []) {
        if (!enemy.alive) continue;
        if (enemy.scale < .9) enemy.scaleValue = .01; if (enemy.scale > 1.1) enemy.scaleValue = -.01;
        enemy.scale += enemy.scaleValue;
      }
    }
    if (this.mode === 'speech' && (this.speechTime <= delta || this.confirmPressed)) { this.speechBoxes.forEach(box => box.destroy()); this.speechTexts.forEach(text => text.destroy()); }
    super.update(time, delta);
  }
  animateEnemy() {
    for (const enemy of this.enemies ?? []) if (enemy.alive && !enemy.hurt) enemy.main.setScale(.5, enemy.scale / 2).setY(enemy.y - 51 * (enemy.scale - 1));
  }
  beginWave() { this.wave = new MoldsmalWave(this, this.live().map(e => e.command)); this.bullets = this.wave.bullets; this.mode = 'soul'; this.soulElapsed = 0; this.soul.setVisible(true); }
  finishSoul() {
    this.wave.destroy(); this.wave = null; this.bullets = []; this.soul.setVisible(false); this.turn++;
    let line = '* You walk into Moldsmal.'; for (const enemy of this.live()) { line = moldsmalStatus(enemy.command, enemy.hp); enemy.state.heard = -1; }
    this.toMenu(line); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  hurtEnemy(enemy) { enemy.hurt = true; enemy.main.setTexture('spr_moldsmal:1').setVisible(true); this.sound.play('snd_damage'); }
  removeEnemy(enemy, killed) {
    if (!enemy.alive) return;
    enemy.alive = false; enemy.main.setVisible(false);
    this.goldReward += (killed ? 3 : Math.floor(3 * (enemy.maxHp - enemy.hp) / enemy.maxHp)) + (enemy.mercy === 101 ? 1 : 0);
    const world = this.previousScene;
    if (killed) { this.xpReward += 3; world.kills++; world.flags[12] = 1; world.flags[204] = (world.flags[204] ?? 0) + 1; }
    else { world.flags[10] = 1; world.flags[23] = (world.flags[23] ?? 0) + 1; }
  }
  end() {
    this.clearLabels(); this.music.stop();
    let line = this.dialogue.win[0].replace(/\\\[1\]/g, String(this.xpReward)).replace(/\\\[2\]/g, String(this.goldReward));
    const world = this.previousScene;
    if (LEVEL_THRESHOLDS.filter(t => world.xp + this.xpReward >= t).length > world.lv) { line += this.dialogue.levelUp[0]; this.sound.play('snd_levelup'); }
    this.showPages([line], () => this.finishWith());
  }
  finishWith(outcome) {
    const world = this.previousScene;
    if (outcome === 'flee') { world.flags[11] = 1; world.flags[24] = (world.flags[24] ?? 0) + 1; }
    world.xp = Math.min(99999, world.xp + this.xpReward); world.gold += this.goldReward;
    world.lv = LEVEL_THRESHOLDS.filter(t => world.xp >= t).length; world.maxHp = world.lv === 20 ? 99 : 16 + world.lv * 4; this.finishBattle();
  }
}
