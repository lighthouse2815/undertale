import { MultiBattle } from './multi-battle.mjs';
import { RuinsBattle } from './ruins-battle.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { woshuaAct, woshuaStatus } from './woshua-act.mjs';
import { WoshuaSpiral, loadWoshuaSpiralAssets } from './woshua-spiral.mjs';
import { WoshuaSoap, loadWoshuaSoapAssets } from './woshua-soap.mjs';

// Battlegroup 43: Woshua một mình.
export class WoshuaBattle extends MultiBattle {
  constructor() { super('WoshuaBattle'); }
  preload() {
    super.preload(); loadWoshuaSpiralAssets(this); loadWoshuaSoapAssets(this);
    const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries({ spr_woshua: 3, spr_woshbody: 1, spr_woshduck: 2, spr_woshwater: 1, spr_woshhanger: 1, spr_woshhead: 1, spr_woshface: 1, spr_woshtail: 10, spr_blconsm: 1 })) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_plain')) { this.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href); this.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href); }
  }
  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000');
    return { battleDialogue: { intro: ['* Woshua shuffles up.'] } };
  }
  setupEnemy() {
    const world = this.previousScene, music = world.waterfallMusic; music?.pause();
    this.events.once('shutdown', () => { if (music === world.waterfallMusic && music?.isPaused) music.resume(); });
    this.populationFlag = 204; this.labels = []; this.selected = 0; this.enemy.setPosition(57, 68).setVisible(false);
    const add = (key, x, y) => this.add.image(x, y, `${key}:0`).setOrigin(0);
    this.hanger = add('spr_woshhanger', 57, 68); this.duck = add('spr_woshduck', 80, 77);
    this.water1 = add('spr_woshwater', 77, 85).setCrop(0, 0, 16, 28); this.water2 = add('spr_woshwater', 77, 85).setCrop(0, 0, 16, 28);
    this.body = add('spr_woshbody', 57, 68); this.tail = add('spr_woshtail', 101, 93);
    this.head = add('spr_woshhead', 57, 85); this.face = add('spr_woshface', 57, 85);
    this.enemyParts = [this.hanger, this.duck, this.water1, this.water2, this.body, this.tail, this.head, this.face];
    this.enemies = [{ index: 0, name: 'Woshua', main: this.enemy, hp: 70, maxHp: 70, def: 1, mercy: 5, alive: true }];
    this.actState = { heard: -1, slime: 0, clean: 0, mercyModifier: 5, dirtyJoke: 0, monsterAttack: 7 };
    this.animElapsed = 0; this.animFrames = 0; this.fy = 0; this.hy = 34; this.fu = 1; this.ducky = 18; this.waterxx = 0; this.wu = 1; this.dub = false;
  }
  updateSubmenu() {
    this.drawSubmenu();
    if (this.cancel) { this.clearLabels(); this.toMenu('* Woshua shuffles up.'); return; }
    if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) { const kind = this.kind; this.selectTarget(); this.clearLabels(); if (kind === 'fightTarget') this.startFight(); else this.choose('act', ['Check', 'Touch', 'Clean', 'Joke']); }
    else if (this.kind === 'act') { const action = ['check', 'touch', 'clean', 'joke'][this.subIndex]; this.clearLabels(); this.act(action); }
    else if (this.kind === 'item') { this.clearLabels(); this.useInventory(); }
    else if (this.kind === 'mercy') { this.clearLabels(); if (this.subIndex === 1) this.flee(); else if (this.spareable()) this.end('spare'); else this.dummyTurn(); }
  }
  act(action) {
    const result = woshuaAct(this.actState, action); this.enemies[0].mercy = this.actState.mercyModifier;
    this.showPages(result.pages, () => { if (result.leaves) this.end('spare'); else this.dummyTurn(); });
  }
  dummyTurn() {
    this.clearLabels(); this.showingHurt = false; this.enemy.setVisible(false); for (const part of this.enemyParts) part.setVisible(true);
    this.command = Math.round(Math.random() * 100);
    const bodypart = this.command < 5 ? 'face' : this.command < 10 ? 'teeth\nand eyes' : this.command < 15 ? 'leg' : this.command < 20 ? 'SOUL' : 'hand';
    let line = `Wosh u\n${bodypart}`;
    if (this.command >= 25) line = this.previousScene.kills ? 'Your\nSOUL\nis\nunclean' : '*whistle\nas it\ncleans*';
    if (this.command >= 50) line = 'Out!!!\nDarned\nspot';
    if (this.command >= 75) { line = this.dub ? 'Oops, I\nmeant...\nscrub a\nsub-SUBS' : 'Scrub a\ndub-dubs'; this.dub = true; }
    if (this.actState.heard === 3) line = 'Green\nmeans\nclean';
    else if (this.actState.heard === 1) line = this.actState.clean === 2 ? 'Fresh!' : 'Yuck!';
    else if (this.actState.heard === 4) line = "NO. THAT\nJOKE'S\nTOO...\nDIRTY";
    this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 110 * 1000 / 30;
    this.speechBox = this.add.image(104.5, 55.5, 'spr_blconsm:0').setOrigin(0).setScale(.5);
    this.speechText = this.add.bitmapText(112, 61, 'fnt_plain:black', line, 6);
    this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false); this.arena.setPosition(113.5, 125).setSize(90, 67.5);
  }
  beginWave() {
    const spiral = this.command < 50 || this.actState.clean === 1 || this.actState.clean === 3;
    this.wave = spiral ? new WoshuaSpiral(this, this.actState, this.command) : new WoshuaSoap(this, this.actState, this.command);
    this.bullets = this.wave.bullets; this.soulElapsed = 0; this.mode = 'soul'; this.soul.setVisible(true); this.actState.heard = -1;
  }
  finishSoul() {
    this.wave.destroy(); this.wave = null; this.bullets = []; this.enemies[0].mercy = this.actState.mercyModifier;
    this.soul.setVisible(false); this.turn++; this.toMenu(woshuaStatus(this.command, this.enemyHp)); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  update(time, delta) {
    this.animElapsed = Math.min(200, this.animElapsed + delta);
    while (this.animElapsed >= 1000 / 30) {
      this.animElapsed -= 1000 / 30; this.animFrames++;
      if (this.animFrames % 5 === 0) {
        this.fy += this.fu; this.hy -= this.fu / 2;
        if (this.fy > 3) this.fu = -2; if (this.fy < -6) this.fu = 2;
        this.waterxx += this.wu; if (this.waterxx > 15) this.wu = -1; if (this.waterxx < 1) this.wu = 1; this.ducky -= this.wu;
      }
    }
    super.update(time, delta);
  }
  animateEnemy() {
    if (!this.body?.active || this.showingHurt) return;
    this.duck.y = 68 + this.ducky / 2; this.head.y = 68 + this.hy / 2; this.face.y = 68 + (this.hy + this.fy) / 2;
    const offset = Math.sin(this.animFrames * .1) * 2; this.water1.x = 77 - offset; this.water2.x = 77 + offset;
    this.tail.setTexture(`spr_woshtail:${Math.floor(this.animFrames * .2) % 10}`);
  }
  hurtEnemy() { this.showingHurt = true; for (const part of this.enemyParts) part.setVisible(false); this.enemy.setVisible(true).setTexture('spr_woshua:1'); this.sound.play('snd_damage'); this.time.delayedCall(11 * 1000 / 30, () => this.sound.play('snd_ehurt1')); }
  removeEnemy(enemy, killed) { enemy.alive = false; this.pendingOutcome = killed ? 'kill' : 'spare'; }
  rewardGold(outcome) { const enemy = this.enemies[0]; return (outcome === 'kill' ? 25 : Math.floor(25 * (enemy.maxHp - enemy.hp) / enemy.maxHp)) + (enemy.mercy > 10 && enemy.hp === enemy.maxHp ? 25 : 0); }
  end(outcome = this.pendingOutcome) {
    const enemy = this.enemies[0]; if (enemy.mercy > 10 && enemy.hp === enemy.maxHp) this.previousScene.flags[145] = 1;
    this.clearLabels(); RuinsBattle.prototype.end.call(this, outcome);
  }
}
