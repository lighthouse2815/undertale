import { RuinsBattle } from './ruins-battle.mjs';
import { UndyneQuickWave, loadUndyneQuickWaveAssets } from './undyne-quick-wave.mjs';

// room_fastbattle, loại giáo của cuộc truy đuổi đầu tiên.
export class UndyneQuickBattle extends RuinsBattle {
  constructor() { super('UndyneQuickBattle'); }
  preload() { super.preload(); loadUndyneQuickWaveAssets(this); }
  loadBattleData() { super.loadBattleData(); return { battleDialogue: { intro: [''] } }; }
  setupEnemy() { this.enemy.setVisible(false); }
  async create() {
    await super.create(); if (window.__remake.phase === 'error') return;
    this.music.stop(); this.enemy.setVisible(false); this.message.setVisible(false); this.menu.setVisible(false); this.hpText.setVisible(false);
    this.buttons.forEach(button => button.setVisible(false)); this.target.setVisible(false); this.bar.setVisible(false);
    this.wave = new UndyneQuickWave(this); this.bullets = this.wave.bullets; this.soulElapsed = 0; this.mode = 'soul'; this.soul.setVisible(true);
  }
  animateEnemy() {}
  finishSoul() { this.mode = 'finished'; this.wave.destroy(); this.wave = null; this.bullets = []; this.invFrames = 0; this.finishBattle(); }
}
