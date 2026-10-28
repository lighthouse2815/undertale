import { MoldbyggGroupBattle } from './moldbygg-group-battle.mjs';
import { WaterfallGroupBattle } from './waterfall-group-battle.mjs';
import { WoshuaBattle } from './woshua-battle.mjs';
import { WoshuaSpiral } from './woshua-spiral.mjs';
import { WoshuaSoap } from './woshua-soap.mjs';
import { woshuaAct, woshuaStatus } from './woshua-act.mjs';
import { MoldbyggWave } from './moldbygg-waves.mjs';

// Battlegroup 55: Woshua và Moldbygg đã hiện hình từ đầu.
export class WoshuaMoldbyggBattle extends MoldbyggGroupBattle {
  constructor() { super('WoshuaMoldbyggBattle'); }
  preload() { super.preload(); WoshuaBattle.prototype.preload.call(this); }
  loadBattleData() { super.loadBattleData(); return { battleDialogue: { intro: ['* Moldbygg and Woshua appear.'] } }; }
  setupEnemy() {
    WaterfallGroupBattle.prototype.setupEnemy.call(this); const old = this.enemies[1]; old.main.destroy(); old.parts.forEach(part => part.destroy());
    const enemy = { index: 1, type: 'moldbygg', name: 'Moldsmal', hp: 70, maxHp: 70, def: 4, mercy: -40, alive: true, x: 159, y: 78, stage: 0, parts: [], state: { heard: -1, mercyModifier: -40, monsterAttack: 7 }, main: this.add.image(159, 78, 'spr_moldsmal:0').setOrigin(0).setScale(.5) };
    this.enemies[1] = enemy; this.visualFrames = 0; this.visualElapsed = 0; this.reveal(enemy);
  }
  choices(enemy) { return enemy.type === 'woshua' ? ['Check', 'Touch', 'Clean', 'Joke'] : super.choices(enemy); }
  act(enemy, action) {
    if (enemy.type !== 'woshua') {
      if (action === 'Hug') { const woshua = this.enemies[0]; if (woshua.alive) { woshua.state.slime = 1; woshua.state.clean = 0; } }
      return super.act(enemy, action);
    }
    const result = woshuaAct(enemy.state, action.toLowerCase()); enemy.mercy = enemy.state.mercyModifier;
    this.showPages(result.pages, () => { if (result.leaves) this.removeEnemy(enemy, false); if (!this.live().length) this.end(); else this.dummyTurn(); });
  }
  dummyTurn() {
    this.clearLabels(); this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 110 * 1000 / 30; this.speechBoxes = []; this.speechTexts = [];
    for (const enemy of this.live()) {
      enemy.hurt = false; enemy.main.setVisible(false); enemy.parts.forEach(p => p.setVisible(true)); enemy.command = Math.round(Math.random() * 100);
      const line = enemy.type === 'woshua' ? WaterfallGroupBattle.prototype.speech.call(this, enemy) : ['Guoooh!', 'Roar.', '*Slime\nsounds*', '*Chaste\nwiggle*'][Math.min(3, Math.floor(enemy.command / 25))];
      const x = enemy.x + 47.5, y = enemy.y - 12.5; this.speechBoxes.push(this.add.image(x, y, 'spr_blconsm:0').setOrigin(0).setScale(.5)); this.speechTexts.push(this.add.bitmapText(x + 7.5, y + 5, 'fnt_plain:black', line, 6));
    }
    this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
  }
  animateEnemy() {
    const w = this.enemies?.[0], e = this.enemies?.[1];
    if (w?.alive && !w.hurt) { w.tail.setTexture(`spr_woshtail:${Math.floor(this.visualFrames * .2) % 10}`); const offset = Math.sin(this.visualFrames * .1) * 2; w.water1.x = 78 - offset; w.water2.x = 78 + offset; }
    if (!e?.alive || e.hurt) return;
    e.revealFrames = Math.min(28, this.visualFrames - e.revealStart); const progress = e.revealFrames / 28;
    e.top.setPosition(e.x + Math.cos(this.visualFrames / 10) * 2, e.y - progress * 56).setCrop(0, 0, 50, Math.min(100, 50 + e.revealFrames * 2));
    e.parts.slice(0, 4).forEach((part, i) => part.setPosition(e.x + Math.sin((this.visualFrames + i * 15) / 10) * 4, e.y + 85 - i * 15 - progress * 56).setVisible(progress === 1 || part.y < 115));
  }
  beginWave() {
    const live = this.live(), count = live.length, waves = [];
    for (const e of live) {
      if (e.type === 'moldbygg') waves.push(new MoldbyggWave(this, e.command, { population: count }));
      else waves.push(e.command < 50 || e.state.clean === 1 || e.state.clean === 3 ? new WoshuaSpiral(this, e.state, e.command, count) : new WoshuaSoap(this, e.state, e.command, count));
      e.state.heard = -1;
    }
    let frame = 0; const duration = live.some(e => e.type === 'moldbygg') ? 180 : waves[0].duration;
    this.wave = { bullets: [], step() { for (const wave of waves) wave.step(); this.bullets = waves.flatMap(wave => wave.bullets); return ++frame >= duration; }, destroy() { for (const wave of waves) wave.destroy(); } };
    this.bullets = []; this.mode = 'soul'; this.soulElapsed = 0; this.soul.setVisible(true);
  }
  finishSoul() {
    super.finishSoul(); const w = this.enemies[0]; if (w.alive && !this.enemies[1].alive) this.message.setText(woshuaStatus(w.command, w.hp));
    if (w.alive) w.mercy = w.state.mercyModifier;
  }
  hurtEnemy(enemy) { if (enemy.type === 'woshua') return WaterfallGroupBattle.prototype.hurtEnemy.call(this, enemy); return super.hurtEnemy(enemy); }
  removeEnemy(enemy, killed) { if (enemy.type === 'woshua') return WaterfallGroupBattle.prototype.removeEnemy.call(this, enemy, killed); return super.removeEnemy(enemy, killed); }
}
