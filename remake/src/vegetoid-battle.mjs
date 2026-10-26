import { RuinsBattle } from './ruins-battle.mjs';
import { VegetoidWave } from './vegetoid-waves.mjs';

// Battlegroup 18: Vegetoid đơn, obj_vegetoid và ACT Devour/Dinner.
export class VegetoidBattle extends RuinsBattle {
  constructor() { super('VegetoidBattle'); }

  preload() {
    super.preload();
    const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries({ spr_vegetoid: 4, spr_vegetoidhurt: 1, spr_vegbullet: 6, spr_carrotbullet: 1, spr_carrotbullet_gr: 1 })) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
      if (!this.textures.exists(`${key}:mask`)) this.load.image(`${key}:mask`, new URL(`sprites/${key}/${key}_0.mask.png`, base).href);
    }
    for (const key of ['snd_heal_c', 'snd_swallow', 'snd_power']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
    if (!this.cache.json.exists('vegetoid-battle')) this.load.json('vegetoid-battle', new URL('./vegetoid-battle.json', import.meta.url).href);
  }

  loadBattleData() {
    super.loadBattleData();
    return { battleDialogue: this.cache.json.get('vegetoid-battle') };
  }

  setupEnemy() {
    this.enemy.setPosition(109, 68); this.mercyModifier = 7;
    this.ate = false; this.dinner = false; this.showingHurt = false; this.lastAct = null;
  }

  animateEnemy(time) {
    if (this.enemy.active && this.enemy.visible) this.enemy.setTexture(this.showingHurt ? 'spr_vegetoidhurt:0' : `spr_vegetoid:${Math.floor(time * 3 / 1000) % 4}`);
  }

  updateSubmenu() {
    if (this.kind !== 'actTarget' && this.kind !== 'act') {
      if (this.kind === 'mercy' && this.confirmPressed && this.subIndex === 0 && this.spareable()) this.previousScene.flags[134] = 1;
      super.updateSubmenu(); return;
    }
    this.drawSubmenu();
    if (this.cancel) { this.toMenu(this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') { this.choose('act', ['Check', 'Devour', 'Talk', 'Dinner']); return; }
    const act = this.subIndex; this.lastAct = act; this.dinner = act === 3;
    if (act === 2) this.dummyTurn();
    else if (act === 1) {
      const ready = this.enemyHp - (8 + this.previousScene.lv * 2) - this.previousScene.weaponStrength - this.mercyModifier < 8;
      if (ready) {
        this.hp = Math.min(this.maxHp, this.hp + 5); this.refreshHp(); this.showingHurt = true;
        this.sound.play('snd_swallow'); this.time.delayedCall(10 * 1000 / 30, () => this.sound.play('snd_power'));
      }
      this.showPages(this.text[ready ? 'devour' : 'devourFail'], () => ready ? this.end('devour') : this.dummyTurn());
    } else this.showPages(this.text[act === 0 ? 'check' : 'dinner'], () => this.dummyTurn());
  }

  dummyTurn() {
    this.showingHurt = false; this.command = Math.round(Math.random() * 100);
    this.dinner = this.kind === 'act' && this.lastAct === 3;
    const index = this.lastAct === 3 ? 6 : this.lastAct === 2 ? 5 : this.ate ? 4 : this.command < 25 ? 0 : this.command < 50 ? 1 : this.command < 75 ? 2 : 3;
    this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 75 * 1000 / 30;
    this.speechBox = this.add.rectangle(180, 45, 130, 72, 0xffffff).setOrigin(0);
    this.speechText = this.add.text(187, 49, this.text.speech[index], { color: '#000', fontSize: '9px', fontFamily: 'monospace', wordWrap: { width: 116 } });
    this.arena.setPosition(118.5, 125).setSize(80, 67.5); this.target.setVisible(false); this.bar.setVisible(false);
    this.soul.setTexture('spr_heart:0').setOrigin(0).setScale(.5).setPosition(154.5, 154.5).setVisible(false);
  }

  beginWave() {
    this.mode = 'soul'; this.soul.setVisible(true); this.soulElapsed = 0;
    this.waveKind = this.command < 50 ? 'carrots' : 'vegetables';
    this.wave = new VegetoidWave(this, this.waveKind, this.dinner); this.bullets = this.wave.bullets;
  }

  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++; this.lastAct = null; this.dinner = false;
    const index = this.enemyHp < this.enemyMaxHp / 3 ? 4 : this.command >= 90 ? 3 : this.command >= 70 ? 2 : this.command >= 30 ? 1 : 0;
    this.toMenu(this.text.idle[index]); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }

  updateFight(delta) { super.updateFight(delta); if (this.mode === 'pages' && this.damage !== undefined) this.showingHurt = true; }
  rewardGold(outcome) { return outcome === 'kill' ? 1 : Math.floor((this.enemyMaxHp - this.enemyHp) / this.enemyMaxHp) + (this.enemyHp === this.enemyMaxHp ? 4 : 0); }
}
