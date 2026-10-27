import { MultiBattle } from './multi-battle.mjs';
import { RuinsBattle } from './ruins-battle.mjs';
import { GyftrotWave, loadGyftrotWaveAssets } from './gyftrot-waves.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import data from './gyftrot-battle.json' with { type: 'json' };

// Battlegroup28: dùng chung ACT2×2/FIGHT/ITEM/MERCY, giữ riêng trạng thái quà của Gyftrot.
export class GyftrotBattle extends MultiBattle {
  constructor() { super('GyftrotBattle'); }
  preload() {
    super.preload(); loadGyftrotWaveAssets(this); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries(data.sprites)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_plain')) { this.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href); this.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href); }
  }
  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000'); return { battleDialogue: data };
  }
  setupEnemy() {
    pauseSnowdinMusicForBattle(this); this.ended = false; this.populationFlag = 203; this.labels = []; this.selected = 0;
    this.enemy.setPosition(104, 19).setVisible(false); this.enemyParts = []; this.gifts = []; this.clouds = [];
    this.enemies = [{ index: 0, name: 'Gyftrot', main: this.enemy, hp: 114, maxHp: 114, def: 3, mercy: -5, alive: true }];
    this.giftTypes = Array.from({ length: 3 }, () => Math.floor(Math.random() * 7));
    const g = this.giftTypes; if (g[1] === g[0]) g[1]++; if (g[2] === g[0]) g[2]++; if (g[2] === g[1]) g[2] = 0; if (g[2] === g[0]) g[2]++;
    this.itemgone = 0; this.googly = false; this.giftgiven = 0; this.betray = false; this.ung = false; this.lastAction = null;
    this.body = this.part('spr_gyftrotbody', 104, 19, -10); this.head = this.part('spr_gyftrothead', 104, 19, -9); this.mouth = this.part('spr_gyftrotmouth', 129, 67, -8);
    this.giftTypes.forEach((frame) => this.gifts.push(this.gift(frame)));
    this.animElapsed = 0; this.frames = 0; this.headX = 104; this.headVelocity = 0; this.headMoveAt = 45; this.blinkAt = 40 + Math.trunc(Math.random() * 60); this.mouthAt = 20; this.mouthFrame = 0; this.mouthPhase = 'opening'; this.blinkFrame = 0; this.blinkEnd = this.headStopAt = Infinity; this.googleImage = this.receivedGift = null;
    this.events.once('shutdown', () => this.clouds.forEach((e) => e.image.destroy()));
  }
  part(key, x, y, depth) { const image = this.add.image(x, y, `${key}:0`).setOrigin(0).setDepth(depth); this.enemyParts.push(image); return image; }
  gift(frame) { return this.part('spr_gyfgift', 104, 19, frame === 1 || frame === 7 ? -9 : -6).setTexture(`spr_gyfgift:${frame}`); }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu(data.intro[0]); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) { const kind = this.kind; this.selectTarget(); this.clearLabels(); if (kind === 'fightTarget') this.startFight(); else this.choose('act', data.actions); }
    else if (this.kind === 'act') { const choice = this.subIndex; this.clearLabels(); this.act(choice); }
    else if (this.kind === 'item') { this.clearLabels(); this.lastAction = null; this.useInventory(); }
    else if (this.kind === 'mercy') { this.clearLabels(); if (this.subIndex === 1) this.flee(); else if (this.spareable()) this.end('spare'); else { this.lastAction = null; this.dummyTurn(); } }
  }
  act(choice) {
    const e = this.enemies[0], w = this.previousScene; this.lastAction = choice; let lines;
    if (choice === 0) lines = data.check;
    if (choice === 1) {
      lines = this.googly ? data.ungoogle : this.itemgone < 3 ? [data.undecorate[this.giftTypes[this.itemgone]]] : data.undecorateEmpty;
      if (this.itemgone === 3) e.mercy = 180;
      if (this.googly) { this.googly = false; this.ung = true; this.googleImage.destroy(); }
      else if (this.itemgone < 3) this.gifts[this.itemgone++].destroy();
      if (e.mercy < 150) { if (this.itemgone > 0 && e.mercy < 100) e.mercy = 10; if (this.itemgone > 2) { e.mercy = 160; w.flags[138] = 1; } }
    }
    if (choice === 2) { lines = this.googly ? data.decorateAgain : data.decorate; if (!this.googly) { this.googly = true; this.googleImage = this.gift(8); } }
    if (choice === 3) {
      if (!this.giftgiven && !this.googly && this.itemgone > 0 && !this.betray) {
        this.receivedGift = this.gift(9);
        if (!w.gold) { this.giftgiven = 2; lines = data.giftFree; }
        else { this.giftgiven = 1; lines = w.gold >= 35 ? data.gift35 : data.giftRest; w.gold = Math.max(0, w.gold - 35); }
        e.mercy = 140;
      } else lines = this.giftgiven === 1 ? data.giftAgain : this.giftgiven === 2 ? data.giftFreeAgain : data.giftFail;
    }
    this.showPages(lines, () => this.dummyTurn());
  }
  dummyTurn() {
    const e = this.enemies[0], w = this.previousScene; this.clearLabels(); this.showingHurt = false; this.enemy.setVisible(false); this.enemyParts.filter((p) => p.active).forEach((p) => p.setVisible(true));
    this.command = Math.round(Math.random() * 100); let line = data.speech[Math.min(4, Math.floor(this.command / 20))];
    if (e.mercy > 90) { line = data.speechThanks[0]; e.def = -100; this.config = { ...this.config, def: -100 }; }
    if (this.lastAction === 3) {
      if (this.giftgiven) line = data.speechGift[this.giftgiven - 1];
      if (this.googly) line = data.speechGift[2]; if (this.betray) line = data.speechGift[3]; if (!this.itemgone) line = data.speechGift[4];
    }
    if (this.lastAction === 2) { w.flags[74] = 1; this.betray ||= this.itemgone > 0 || this.giftgiven > 0; line = data.speechDecorate[this.betray ? 1 : 0]; e.mercy = -20; }
    if (this.lastAction === 1) {
      if (this.itemgone === 1 || this.itemgone === 2) { e.mercy = 10; line = data.speechUndecorate[0]; }
      if (e.mercy > 170) line = data.speechUndecorate[1]; else if (this.itemgone === 3) { e.mercy = 200; line = data.speechUndecorate[2]; }
      if (this.ung) line = data.speechUndecorate[3]; this.ung = false;
    }
    this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 110 * 1000 / 30;
    this.speechBox = this.add.image(206.5, 45, 'spr_blconsm:0').setOrigin(0).setScale(.5);
    this.speechText = this.add.bitmapText(219, 50, 'fnt_plain:black', line, 6); this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
    this.arena.setPosition(113.5, 125).setSize(90, 67.5);
  }
  beginWave() { const e = this.enemies[0]; this.wave = new GyftrotWave(this, this.command, { mercy: e.mercy, hardmode: this.previousScene.flags[6] === 1 }); this.bullets = this.wave.bullets; this.soulElapsed = 0; this.mode = 'soul'; this.soul.setVisible(true); this.lastAction = null; }
  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++;
    let index = this.command >= 80 ? 4 : this.command >= 60 ? 3 : this.command >= 40 ? 2 : this.command >= 25 ? 1 : 0;
    if (this.giftgiven) index = this.giftgiven + 4; if (this.googly) index = 7; if (this.itemgone === 1 || this.itemgone === 2) index = 8; if (this.itemgone === 3) index = 9; if (this.betray) index = 10; if (this.enemyHp < 30) index = 11;
    this.toMenu(data.idle[index]); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  update(time, delta) {
    this.animElapsed = Math.min(200, this.animElapsed + delta);
    while (this.animElapsed >= 1000 / 30 && this.mode !== 'dead') { this.animElapsed -= 1000 / 30; this.frames++; this.stepParts(); }
    super.update(time, delta);
  }
  stepParts() {
    if (this.ended) return;
    const n = this.frames;
    if (n >= this.headMoveAt) { this.headVelocity = this.headX > 108 ? -.5 : .5; this.headStopAt = n + Math.trunc(8 + Math.random() * 10); this.headMoveAt = Infinity; }
    if (n >= this.headStopAt) { this.headVelocity = 0; this.headStopAt = Infinity; this.headMoveAt = n + Math.trunc(40 + Math.random() * 20); }
    this.headX += this.headVelocity;
    if (n >= this.blinkAt) { this.blinkFrame = 1; this.blinkEnd = n + 8; this.blinkAt = Infinity; }
    if (n >= this.blinkEnd) { this.blinkFrame = 0; this.blinkAt = n + Math.trunc(60 + Math.random() * 60); this.blinkEnd = Infinity; }
    if (n >= this.mouthAt) {
      if (this.mouthPhase === 'closing') {
        this.mouthFrame--; if (this.mouthFrame <= 0) { this.mouthPhase = 'opening'; this.mouthAt = n + Math.trunc(45 + Math.random() * 60); } else this.mouthAt = n + 3;
      } else if (this.mouthPhase === 'holding') {
        const image = this.add.image(this.headX + 45, 90, 'spr_gyftcloud:0').setOrigin(0).setScale(.05).setAlpha(.7).setAngle(-Math.random() * 360).setDepth(-7);
        this.clouds.push({ image, vx: .5 - Math.random(), vy: 3 + Math.random() * .5, scale: .1, alpha: .7 }); this.mouthPhase = 'closing'; this.mouthAt = n + 25;
      } else if (this.mouthFrame < 4) { this.mouthFrame++; this.mouthAt = n + 3; }
      else { this.mouthPhase = 'holding'; this.mouthAt = n + 25; }
    }
    for (const c of this.clouds) {
      const speed = Math.hypot(c.vx, c.vy), scale = speed ? Math.max(0, speed - .15) / speed : 0; c.vx *= scale; c.vy *= scale; c.image.x += c.vx / 2; c.image.y += c.vy / 2;
      c.scale += 1 / (4 + c.scale * 8); c.image.setScale(c.scale / 2).setAngle(c.image.angle - (Math.hypot(c.vx, c.vy) + 1));
      if (Math.hypot(c.vx, c.vy) < .5) c.alpha -= .03; c.image.setAlpha(Math.max(0, c.alpha)); if (c.alpha < .1) c.image.destroy();
    }
    this.clouds = this.clouds.filter((c) => c.image.active);
  }
  animateEnemy() {
    if (this.mode === 'dead' || this.showingHurt || !this.head?.active) return;
    this.head.setX(this.headX).setTexture(`spr_gyftrothead:${this.blinkFrame ?? 0}`); this.mouth.setX(this.headX + 25).setTexture(`spr_gyftrotmouth:${this.mouthFrame}`);
    for (let i = 0; i < this.gifts.length; i++) if (this.gifts[i].active && ![1, 7].includes(this.giftTypes[i])) this.gifts[i].x = this.headX;
    if (this.googleImage?.active) this.googleImage.x = this.headX;
  }
  hurtEnemy() { this.showingHurt = true; this.enemy.setVisible(true).setTexture('spr_gyftrot:1'); this.enemyParts.filter((p) => p.active).forEach((p) => p.setVisible(false)); this.sound.play('snd_damage'); this.time.delayedCall(11 * 1000 / 30, () => this.sound.play('snd_ehurt1')); }
  removeEnemy(enemy, killed) { enemy.alive = false; this.pendingOutcome = killed ? 'kill' : 'spare'; }
  rewardGold(outcome) {
    const e = this.enemies[0], base = this.giftgiven === 2 ? 80 : 30;
    const bonus = this.giftgiven === 2 ? 75 : this.giftgiven === 1 ? 0 : e.mercy > 10 && e.hp === e.maxHp ? 20 : 0;
    return bonus + (outcome === 'kill' ? base : Math.floor(base * (e.maxHp - e.hp) / e.maxHp));
  }
  end(outcome = this.pendingOutcome) { this.ended = true; this.clearLabels(); this.clouds.forEach((c) => c.image.destroy()); this.clouds = []; RuinsBattle.prototype.end.call(this, outcome); }
}
