import { AaronBattle } from './aaron-battle.mjs';
import { RuinsBattle } from './ruins-battle.mjs';
import { TemmieLongWave, loadTemmieLongWaveAssets } from './temmie-long-wave.mjs';
import { TemmieHandWave, loadTemmieHandWaveAssets } from './temmie-hand-wave.mjs';

// Battlegroup 41: Temmie và Aaron được gọi đến khi chọn Flex.
export class TemmieBattle extends AaronBattle {
  constructor() { super('TemmieBattle'); }
  preload() {
    super.preload(); loadTemmieLongWaveAssets(this); loadTemmieHandWaveAssets(this);
    const base = new URL('../assets/', import.meta.url);
    for (const key of ['spr_tembattle', 'spr_tembody', 'spr_temface', 'spr_temsmug'])
      if (!this.textures.exists(`${key}:0`)) this.load.image(`${key}:0`, new URL(`sprites/${key}/${key}_0.png`, base).href);
  }
  loadBattleData() { super.loadBattleData(); return { battleDialogue: { intro: ['* Special enemy Temmie appears\n  here to defeat you!!'] } }; }
  setupEnemy() {
    const world = this.previousScene, music = world.waterfallMusic; music?.pause();
    this.events.once('shutdown', () => { if (music === world.waterfallMusic && music?.isPaused) music.resume(); });
    this.populationFlag = 204; this.labels = []; this.selected = 0; this.enemy.setPosition(108, 19).setVisible(false);
    this.body = this.add.image(108, 19, 'spr_tembody:0').setOrigin(0);
    this.face = this.add.image(119, 39, 'spr_temface:0').setOrigin(0); this.enemyParts = [this.body, this.face];
    this.enemies = [{ index: 0, name: 'Temmie', main: this.enemy, hp: 5, maxHp: 5, def: -20, mercy: -40, alive: true }];
    this.baseAttack = world.lv === 20 ? 99 : 8 + world.lv * 2; this.attackBonus = 0;
    this.actState = { heard: -1, attack: this.baseAttack, monsterAttack: 7 }; this.animElapsed = 0; this.animFrames = 0; this.temGold = 0; this.aaronPresent = false;
  }
  updateSubmenu() {
    if (this.aaronPresent) return super.updateSubmenu();
    this.drawSubmenu();
    if (this.cancel) { this.clearLabels(); this.menu.setPosition(32, 133); this.toMenu('* Special enemy Temmie appears\n  here to defeat you!!'); return; }
    if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) { const kind = this.kind; this.selectTarget(); this.clearLabels(); if (kind === 'fightTarget') this.startFight(); else this.choose('act', ['Check', 'Talk', 'Flex', 'Feed']); }
    else if (this.kind === 'act') { const action = ['check', 'talk', 'flex', 'feed'][this.subIndex]; this.clearLabels(); this.act(action); }
    else if (this.kind === 'feedConfirm') {
      const yes = this.subIndex === 0; this.clearLabels(); this.menu.setPosition(32, 133);
      if (yes) { this.previousScene.inventory.splice(this.previousScene.inventory.indexOf(22), 1); this.previousScene.flags[146] = 1; this.actState.heard = 6; this.dummyTurn(); }
      else { this.actState.heard = -1; this.music.pause(); this.body.setTexture('spr_temsmug:0'); this.face.setVisible(false); this.mode = 'temmieWait'; this.message.setText(''); this.menu.setText(''); this.time.delayedCall(190 * 1000 / 30, () => { if (this.mode !== 'temmieWait') return; this.music.resume(); this.body.setTexture('spr_tembody:0'); this.face.setVisible(true); this.dummyTurn(); }); }
    } else if (this.kind === 'item') { this.clearLabels(); this.useInventory(); }
    else if (this.kind === 'mercy') { this.clearLabels(); if (this.subIndex === 1) this.flee(); else if (this.spareable()) this.end('spare'); else this.dummyTurn(); }
  }
  act(action) {
    if (this.aaronPresent) return super.act(action);
    const state = this.actState, world = this.previousScene;
    if (action === 'feed' && world.inventory.includes(22)) { this.choose('feedConfirm', ['Yas', 'NO!!!!!!!']); this.menu.setPosition(32, 165); this.message.setText('   Give the Temmie Flakes?'); return; }
    const lines = { check: "* TEMMIE - RATED TEM OUTTA TEM\n* Loves to pet cute humans.\n* But you're allergic!", talk: '* You say hello to Temmie.', flex: '* You flex at Temmie...', feed: '* Temmie only wants the\n  Temmie Flakes.' };
    state.heard = { check: 9, talk: 4, flex: 3, feed: 1 }[action];
    if (action === 'talk') { world.flags[146] = 1; this.enemies[0].mercy = -10; }
    if (action === 'flex') { if (state.attack < 150) state.attack += 7; state.monsterAttack++; this.attackBonus = state.attack - this.baseAttack; }
    this.showPages([lines[action]], () => action === 'flex' ? this.flexSequence() : this.dummyTurn());
  }
  flexSequence() {
    const reply = this.previousScene.flags[95] === 1 ? 'Temmie,\nare you\nokay?\n; )' : 'Ooh, I\nhave to\ndisagree\n; )';
    this.showPages(['NO!!!!!\nmuscles\n......\nNOT CUTE', reply, 'NO!!!!!\n!!!!!!!'], () => {
      const tem = this.enemies[0]; this.temGold = Math.floor(50 * (tem.maxHp - tem.hp) / tem.maxHp) + (tem.hp === tem.maxHp ? 30 : 0);
      this.body.destroy(); this.face.destroy(); this.enemy.destroy();
      this.enemy = this.add.image(210, 19, 'spr_aaron:0').setOrigin(0).setScale(.5).setVisible(false);
      this.body = this.add.image(210, 19, 'spr_aaronbody:0').setOrigin(0); this.enemyParts = [this.body];
      this.enemies = [{ index: 0, name: 'Aaron', main: this.enemy, hp: 98, maxHp: 98, def: 2, mercy: 5, alive: true }];
      this.config = { ...this.config, name: 'Aaron', def: 2, xp: 52 }; this.enemyHp = this.enemyMaxHp = 98;
      this.actState = { heard: -1, flex: 2, attack: this.baseAttack + this.attackBonus, monsterAttack: 7, mercyModifier: 5 }; this.aaronPresent = true; this.dummyTurn();
    });
  }
  dummyTurn() {
    if (this.aaronPresent) return super.dummyTurn();
    this.clearLabels(); this.showingHurt = false; this.enemy.setVisible(false); this.body.setVisible(true); this.face.setVisible(true);
    this.command = Math.round(Math.random() * 100);
    let line = ['awwAwa\ncute!!\n(pets u)', 'OMG!!\nhumans\nTOO CUTE\n(dies)', "hOI!!!\ni'm\nTEMMIE!!", 'fhsdhjf\ndsfjsd\ndshjfsd'][Math.min(3, Math.floor(this.command / 25))];
    if (this.actState.heard === 1) line = 'NO!!!\nso\nhungr...\n(dies)';
    if (this.actState.heard === 4) line = "hOI!!!\ni'm\ntEMMIE!!";
    if (this.actState.heard === 6) { line = 'FOOB!!!'; this.enemies[0].mercy = 300; }
    this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 110 * 1000 / 30;
    this.speechBox = this.add.image(155.5, 6.5, 'spr_blconsm:0').setOrigin(0).setScale(.5); this.speechText = this.add.bitmapText(163, 12, 'fnt_plain:black', line, 6); this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
  }
  beginWave() { if (this.aaronPresent) return super.beginWave(); this.wave = this.command < 25 ? new TemmieHandWave(this, { damage: this.actState.monsterAttack }) : new TemmieLongWave(this); this.bullets = this.wave.bullets; this.soulElapsed = 0; this.mode = 'soul'; this.soul.setVisible(true); this.actState.heard = -1; }
  finishSoul() {
    if (this.aaronPresent) return super.finishSoul();
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++;
    let status = this.command >= 90 ? '* Smells like Temmie Flakes.' : this.command >= 83 ? '* Temmiy accidentally misspells\n  her own name.' : this.command >= 75 ? '* Temmie is doing her hairs.' : this.command >= 50 ? '* Temmie vibrates intensely.' : this.command >= 25 ? '* Temmie forgot her other\n  attack.' : '* Temmie is trying to glomp\n  you.';
    if (this.enemyHp < 3) status = "* How'd you do that?";
    this.toMenu(status); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  animateEnemy() { if (this.aaronPresent) return super.animateEnemy(); if (!this.showingHurt && this.body?.active) { const r = Math.min(1, .25 + this.animFrames * .005); this.body.setPosition(108 + Math.random() * r, 19 + Math.random() * r); this.face.setPosition(119 + Math.random() * r, 39 + Math.random() * r); } }
  hurtEnemy() { if (this.aaronPresent) return super.hurtEnemy(); this.showingHurt = true; this.body.setVisible(false); this.face.setVisible(false); this.enemy.setVisible(true); this.sound.play('snd_ehurt1'); }
  rewardGold(outcome) { if (this.aaronPresent) return this.temGold + super.rewardGold(outcome); const e = this.enemies[0]; return (outcome === 'kill' ? 50 : Math.floor(50 * (e.maxHp - e.hp) / e.maxHp)) + (e.mercy > 10 && e.hp === e.maxHp ? 30 : 0); }
  end(outcome = this.pendingOutcome) { this.clearLabels(); RuinsBattle.prototype.end.call(this, outcome); }
}
