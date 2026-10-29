import { MultiBattle } from './multi-battle.mjs';
import { fightInput } from './fight-input.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';
import { UndyneBossBody, loadUndyneBossBodyAssets } from './undyne-boss-body.mjs';
import { UndyneAttackTurn, loadUndyneAttackTurnAssets } from './undyne-attack-turn.mjs';
import { UndyneBattleRules } from './undyne-battle-rules.mjs';
import { undyneBattleAct, undyneBattleLines, undyneBattleSpeech, undyneBattleStatus } from './undyne-battle-dialogue.mjs';

// Battlegroup 47: scene trận Undyne thường.
export class UndyneBattle extends MultiBattle {
  constructor() { super('UndyneBattle'); }
  preload() {
    super.preload(); loadUndyneBossBodyAssets(this); loadUndyneAttackTurnAssets(this);
    const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of [['spr_undyneb_noanim', 1], ['spr_blconwdshrt', 1], ['spr_blconsm', 1], ['spr_undyneb_melt', 4]]) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    for (const key of ['mus_undyneboss', 'mus_endingexcerpt1', 'mus_endingexcerpt2']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.ogg`, base).href);
  }
  loadBattleData() { super.loadBattleData(); return { battleDialogue: { intro: undyneBattleLines([1310]) } }; }
  setupEnemy() {
    const w = this.previousScene; this.rules = new UndyneBattleRules();
    const entry = this.rules.enter({ flag99: w.flags[99] ?? 0, flag98: w.flags[98] ?? 0, hp: w.flags[351] ?? 1500 });
    w.flags[99] = entry.flag99; w.flags[351] = entry.hp; this.green = entry.green; this.mercied = 0;
    this.labels = []; this.selected = 0; this.wave = null; this.body = new UndyneBossBody(this); this.body.emotion = entry.emotion;
    this.bodyElapsed = 0; this.enemy.setVisible(false); this.enemyHp = entry.hp; this.enemyMaxHp = 1500;
    this.enemies = [{ index: 0, name: 'Undyne', main: this.enemy, hp: entry.hp, maxHp: 1500, def: 0, mercy: -9999999999, alive: true }];
    this.musicKey = 'mus_undyneboss'; this.status = undyneBattleLines([1310])[0];
    const oldMusic = w.waterfallMusic; oldMusic?.pause();
    this.events.once('shutdown', () => { this.body?.destroy(); this.body = null; if (oldMusic === w.waterfallMusic && oldMusic?.isPaused) oldMusic.resume(); });
  }
  update(time, delta) {
    if (window.__remake.phase !== 'battle' || window.__remake.scene !== this) return;
    this.bodyElapsed = Math.min(200, this.bodyElapsed + delta);
    while (this.bodyElapsed >= 1000 / 30) { this.bodyElapsed -= 1000 / 30; this.body?.step(); }
    super.update(time, delta);
  }
  animateEnemy() {}
  spareable() { return false; }
  choose(kind, items) { super.choose(kind, kind === 'mercy' && (this.green || this.rules.died) ? ['Spare'] : items); }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu(this.status); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) { const kind = this.kind; this.selectTarget(); this.clearLabels(); if (kind === 'fightTarget') this.startFight(); else this.choose('act', ['Check', 'Challenge', 'Plead']); }
    else if (this.kind === 'act') {
      const action = ['check', 'challenge', 'plead'][this.subIndex]; this.clearLabels();
      this.showPages(undyneBattleAct(this.rules, action, this.rules.died).lines, () => this.dummyTurn());
    } else if (this.kind === 'item') { this.clearLabels(); this.useInventory(); }
    else if (this.kind === 'mercy') {
      this.clearLabels();
      if (this.subIndex === 0) { this.mercied++; this.dummyTurn(); }
      else if (this.green || this.rules.died) this.dummyTurn();
      else { this.sound.play('snd_escaped'); this.finishWith('flee'); }
    }
  }
  updateFight(delta) {
    const enemy = this.enemies[0], hit = fightInput(this, delta, enemy.def); if (!hit) return;
    if (hit.miss) { this.showPages(['* MISS'], () => this.dummyTurn()); return; }
    this.damage = Math.ceil(hit.damage); enemy.hp = Math.max(0, enemy.hp - this.damage); this.enemyHp = enemy.hp; this.previousScene.flags[351] = enemy.hp;
    this.sound.play('snd_damage'); this.showPages([String(this.damage)], () => {
      if (enemy.hp <= 0 && this.rules.startDeath()) this.beginDeath(); else this.dummyTurn();
    });
  }
  bossPages(lines, after, longBubble = true) {
    const old = this.message; old.setVisible(false);
    const x = longBubble ? 195 : 227.5, y = longBubble ? 15 : 36;
    const bubble = this.add.image(x, y, longBubble ? 'spr_blconwdshrt:0' : 'spr_blconsm:0').setOrigin(0).setScale(.5);
    this.message = this.add.bitmapText(x + 7.5, y + 5, 'fnt_maintext', '', 9).setTint(0x000000).setMaxWidth(longBubble ? 110 : 44);
    this.showPages(lines, () => { bubble.destroy(); this.message.destroy(); this.message = old; old.setVisible(true); after(); });
  }
  dummyTurn() {
    this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
    const w = this.previousScene, enemy = this.enemies[0];
    const details = this.rules.prepareDialogue({ green: this.green, hp: enemy.hp, maxHp: enemy.maxHp, flag99: w.flags[99] });
    w.flags[99] = details.flag99; if (details.defense !== null) enemy.def = details.defense;
    this.command = Math.round(Math.random() * 100);
    const speech = undyneBattleSpeech({ order: this.rules.order, command: this.command, ...details, mercied: this.mercied, hitfirst: this.rules.hitfirst });
    if (this.rules.died && this.rules.order === -35) { this.finalDeath(); return; }
    this.bossPages(speech.lines, () => this.beginWave(), speech.longBubble);
  }
  beginWave() {
    const options = this.rules.prepareAttack({ green: this.green, command: this.command });
    this.status = undyneBattleStatus({ hp: this.enemies[0].hp, maxHp: this.enemies[0].maxHp, order: this.rules.order, command: this.command })?.line ?? this.status;
    if (options.kind === 'green') this.arena.setPosition(140, 100).setSize(40, 40);
    else if (options.kind === 'rising') this.arena.setPosition(142.5, 150).setSize(35, 42.5);
    else this.arena.setPosition(113.5, 100).setSize(90, 92.5);
    this.mode = 'soul'; this.wave = new UndyneAttackTurn(this, { ...options, onColorChange: green => { if (!green) this.arena.setPosition(113.5, 100).setSize(90, 92.5); }, onComplete: result => {
      this.green = this.rules.finishAttack(result); this.wave = null; this.soul.setVisible(false); this.turn++;
      this.arena.setPosition(16, 125).setSize(285, 67.5); this.toMenu(this.status);
    } });
  }
  updateSoul(delta) { this.wave.update(delta); }
  die() { this.body?.destroy(); this.body = null; super.die(); }
  beginDeath() {
    this.green = false; this.music.stop(); this.body.emotion = 7;
    this.bossPages(undyneBattleLines([1336,1337,1338,1339]), () => {
      this.mode = 'undyneWait'; this.time.delayedCall(60 * 1000 / 30, () => {
        this.body.emotion = 8;
        this.bossPages(undyneBattleLines([1365]), () => {
          this.melter = this.add.image(105, 10, 'spr_undyneb_melt:1').setOrigin(0).setAlpha(0).setDepth(25);
          const parts = this.body.parts; this.tweens.add({ targets: parts, alpha: 0, duration: 5 * 1000 / 30, onComplete: () => { this.body?.destroy(); this.body = null; } });
          this.tweens.add({ targets: this.melter, alpha: 1, duration: 5 * 1000 / 30 });
          this.music.destroy(); this.music = this.sound.add('mus_endingexcerpt1', { volume: 1 }); this.music.play();
          this.bossPages(undyneBattleLines([1386,1387,1388,1389,1390]), () => {
            this.mode = 'undyneWait'; this.time.delayedCall(30 * 1000 / 30, () => {
              this.bossPages(undyneBattleLines([1401,1402,1403]), () => {
                this.status = undyneBattleLines([1410])[0]; this.music.destroy();
                this.music = this.sound.add('mus_endingexcerpt2', { loop: true, volume: .5 }); this.music.play(); this.toMenu(this.status);
              });
            });
          });
        });
      });
    });
  }
  finalDeath() {
    this.clearLabels(); this.music.stop();
    this.bossPages(undyneBattleLines([1424,1425,1426,1427,1428,1429,1438,1439,1440,1449]), () => {
      const collapse = (ids, frame, after) => {
        if (frame !== null) this.melter.setTexture(`spr_undyneb_melt:${frame}`);
        this.bossPages(undyneBattleLines(ids), () => { this.mode = 'undyneWait'; this.time.delayedCall(120 * 1000 / 30, after); });
      };
      collapse([1460], 0, () => collapse([1470], 1, () => collapse([1480], 2, () => collapse([1490], 3, () => {
        const w = this.previousScene; w.kills++; w.xp += 500; w.flags[350] = 1; w.plot = 122;
        w.lv = LEVEL_THRESHOLDS.filter(threshold => w.xp >= threshold).length; w.maxHp = w.lv === 20 ? 99 : 16 + w.lv * 4;
        this.melter.destroy(); this.mode = 'undyneWait'; this.time.delayedCall(200 * 1000 / 30, () => this.finishBattle());
      }))));
    });
  }
}
