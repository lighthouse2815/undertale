import { RuinsBattle } from './ruins-battle.mjs';
import { BATTLE_CONFIGS } from './battle.mjs';
import { IceCapWave } from './icecap-waves.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';
import data from './icecap-battle.json' with { type: 'json' };

export function loadIceCapAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const [key, count] of Object.entries(data.sprites)) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < count; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    if (['spr_iciclebullet', 'spr_hatbullet'].includes(key)) for (let frame = 0; frame < (key === 'spr_iciclebullet' ? 2 : 1); frame++) {
      const maskKey = `${key}:mask${frame ? `:${frame}` : ''}`;
      if (!scene.textures.exists(maskKey)) scene.load.image(maskKey, new URL(`sprites/${key}/${key}_${frame}.mask.png`, base).href);
    }
  }
  if (!scene.cache.bitmapFont.exists('fnt_plain')) {
    scene.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href);
    scene.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href);
  }
}

// Nhóm 32: lấy mũ chuyển Ice Cap thành Ice với HP/DEF/EXP riêng của monstertype20.
export class IceCapBattle extends RuinsBattle {
  constructor() { super('IceCapBattle'); }

  preload() { super.preload(); loadIceCapAssets(this); }

  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000'); return { battleDialogue: data[this.monster] };
  }

  setupEnemy() {
    this.fieldMusic = pauseSnowdinMusicForBattle(this); this.populationFlag = 203;
    this.enemy.setPosition(108, 19); this.mercyModifier = this.monster === 'ice' ? 100 : 10;
    this.ignored = 0; this.happy = false; this.showingHurt = false; this.lastAct = null; this.transformedGold = 0;
  }

  animateEnemy(time) {
    if (this.mode === 'dead' || !this.enemy.active || !this.enemy.visible) return;
    const sprite = this.monster === 'ice' ? this.showingHurt ? 'spr_icecubehurt' : 'spr_icecube' : this.showingHurt ? 'spr_icecaphurt' : 'spr_icecap';
    this.enemy.setTexture(`${sprite}:${sprite === 'spr_icecap' ? Math.floor(time * .003) % 4 : 0}`);
  }

  updateSubmenu() {
    if (!['actTarget', 'act'].includes(this.kind)) { super.updateSubmenu(); return; }
    this.drawSubmenu(); if (this.cancel) { this.toMenu(this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') { this.choose('act', this.text.actions); return; }
    this.lastAct = this.subIndex;
    if (this.monster === 'ice') {
      const key = this.lastAct === 1 ? 'compliment' : 'check';
      if (this.lastAct === 1) { this.happy = true; this.previousScene.flags[137] = 1; }
      this.showPages(this.text[key], () => this.dummyTurn()); return;
    }
    let key = 'check', stolen = false;
    if (this.lastAct === 1) key = this.ignored > 0 ? 'ignoreAgain' : 'ignore';
    if (this.lastAct === 2) key = 'compliment';
    if (this.lastAct === 3) { stolen = this.spareable(); key = stolen ? 'steal' : 'stealFail'; }
    const pages = this.text[key];
    if (stolen) {
      this.transformedGold = this.mercyModifier > 10 && this.enemyHp === this.enemyMaxHp ? 13 : 0;
      this.config = BATTLE_CONFIGS.ice; this.monster = 'ice'; this.text = data.ice;
      this.enemyHp = this.enemyMaxHp = 48; this.mercyModifier = 100; this.happy = false; this.lastAct = null;
      this.enemy.setTexture('spr_icecube:0');
      window.__remake.room = 'battle_ice';
    }
    this.showPages(pages, () => this.dummyTurn());
  }

  dummyTurn() {
    this.showingHurt = false; this.command = Math.round(Math.random() * 100);
    const random = Math.floor(Math.random() * 3); let speech;
    if (this.monster === 'ice') speech = this.text[this.happy ? 'speechHappy' : 'speech'][Math.min(3, Math.floor(this.command / 25))];
    else if (this.lastAct === 1) {
      if (this.ignored > 0) { speech = this.text.speechIgnoreAgain[random]; this.ignored = 2; this.mercyModifier = 300; }
      else { speech = this.text.speechIgnore[random === 2 ? 1 : 0]; this.ignored = 1; }
    } else if (this.lastAct === 2) speech = this.text.speechCompliment[random];
    else if (this.lastAct === 3) speech = this.text.speechSteal[random === 0 ? 0 : 1];
    else speech = this.text.speech[Math.min(4, Math.floor(this.command / 20))];
    this.mode = 'speech'; this.menu.setText(''); this.message.setText(''); this.speechTime = 75 * 1000 / 30;
    const x = (216 + 106 - 8) / 2, y = this.monster === 'ice' ? 44 : 19;
    this.speechBox = this.add.image(x, y, 'spr_blconsm:0').setOrigin(0).setScale(.5);
    this.speechText = this.add.bitmapText(x + 12.5, y + 5, 'fnt_plain:black', speech, 6);
    this.target.setVisible(false); this.bar.setVisible(false); this.soul.setVisible(false);
    this.arena.setPosition(118.5, 125).setSize(80, 67.5);
  }

  beginWave() {
    this.mode = 'soul'; this.soul.setVisible(true); this.soulElapsed = 0;
    this.wave = new IceCapWave(this, this.command, this.monster === 'ice'); this.waveKind = this.wave.kind; this.bullets = this.wave.bullets;
  }

  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++; this.lastAct = null;
    let idle;
    if (this.monster === 'ice') idle = this.text.idle[this.enemyHp < 16 ? 3 : this.happy ? 2 : this.command >= 90 ? 1 : 0];
    else idle = this.text.idle[this.enemyHp < 16 ? 7 : this.ignored > 1 ? 6 : this.ignored === 1 ? 5 : this.command >= 90 ? 4 : this.command >= 75 ? 3 : this.command >= 50 ? 2 : this.command >= 25 ? 1 : 0];
    this.toMenu(idle); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }

  updateFight(delta) { super.updateFight(delta); if (this.mode === 'pages' && this.damage !== undefined) this.showingHurt = true; }

  rewardGold(outcome) {
    const ice = this.monster === 'ice', reward = ice ? 40 : 17;
    const base = this.transformedGold + (outcome === 'kill' ? reward : Math.floor(reward * (this.enemyMaxHp - this.enemyHp) / this.enemyMaxHp));
    if (this.enemyHp !== this.enemyMaxHp) return base;
    if (ice) return base + (this.mercyModifier > 10 ? 7 : 0) + (this.mercyModifier > 40 ? 15 : 0);
    return base + (outcome !== 'kill' && this.mercyModifier > 10 ? 13 : 0);
  }
}
