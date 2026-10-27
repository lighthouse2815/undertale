import { MultiBattle } from './multi-battle.mjs';
import { BATTLE_CONFIGS } from './battle.mjs';
import { SnowdinGroupWave, loadSnowdinGroupWaveAssets } from './snowdin-group-waves.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';
import data from './snowdin-group.json' with { type: 'json' };
import iceText from './icecap-battle.json' with { type: 'json' };
import drakeText from './drake-battle.json' with { type: 'json' };

// Nhóm35/36: Ice Cap + Jerry, thêm Snowdrake/Chilldrake trong cùng một trận.
export class SnowdinGroupBattle extends MultiBattle {
  constructor() { super('SnowdinGroupBattle'); }
  preload() {
    super.preload(); loadSnowdinGroupWaveAssets(this); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries(data.sprites)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
  }
  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000');
    const group = this.monster === 'snowdinGroup36';
    return { battleDialogue: { intro: data[group ? this.game.scene.getScene('World').flags[57] === 2 ? 'intro36Chill' : 'intro36' : 'intro35'] } };
  }
  setupEnemy() {
    pauseSnowdinMusicForBattle(this); this.enemy.destroy(); this.labels = []; this.selected = 0; this.xpReward = this.goldReward = 0;
    this.lastAction = null; this.frames = 0; this.animElapsed = 0;
    const types = ['icecap', 'jerry']; if (this.monster === 'snowdinGroup36') types.push(this.previousScene.flags[57] === 2 ? 'chilldrake' : 'snowdrake');
    this.enemies = types.map((type, index) => {
      const config = type === 'jerry' ? { name: 'Jerry', hp: 80, def: 8, asset: 'spr_jerry', xp: 1 } : BATTLE_CONFIGS[type];
      const x = index === 0 ? 7.5 : index === 1 ? 108 : 194, y = index === 1 ? 63.5 : 19;
      const e = { ...config, maxHp: config.hp, index, type, x, y, alive: true, away: false, mercy: type === 'jerry' ? 65 : type === 'icecap' ? 10 : 5,
        ignored: 0, jokeTold: false, happy: false, heard: -1, damageDivisor: type === 'jerry' ? 5 : 1, parts: [] };
      e.main = this.add.image(x, y, `${config.asset}:0`).setOrigin(0).setScale(.5);
      if (type.includes('drake')) {
        e.parts = ['spr_snowdrake_legs', 'spr_snowdrake_body', 'spr_snowdrake_head', ...(type === 'chilldrake' ? ['spr_chillglasses'] : [])].map((key) => this.add.image(x, y, `${key}:0`).setOrigin(0));
        e.main.setVisible(false); e.bobY = y; e.bobAcceleration = .4; e.bobDown = true;
      }
      return e;
    });
    this.enemy = this.enemies[0].main;
  }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu(this.text.intro[0]); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) {
      const kind = this.kind, e = this.selectTarget(); this.clearLabels();
      if (kind === 'fightTarget') this.startFight();
      else this.choose('act', e.type === 'jerry' ? ['Check', 'Ditch'] : e.type === 'icecap' ? ['Check', 'Ignore', 'Compliment', 'Steal']
        : e.type === 'ice' ? ['Check', 'Compliment'] : e.type === 'chilldrake' ? ['Check', 'Clash', 'Agree', 'Joke'] : ['Check', 'Heckle', 'Laugh', 'Joke']);
    } else if (this.kind === 'act') { const choice = this.subIndex; this.clearLabels(); this.act(this.enemies[this.selected], choice); }
    else if (this.kind === 'item') { this.clearLabels(); this.lastAction = null; this.useInventory(); }
    else if (this.kind === 'mercy') {
      this.clearLabels();
      if (this.subIndex === 1) { this.flee(); return; }
      this.live().filter((e) => this.spareable(e)).forEach((e) => this.removeEnemy(e, false));
      if (!this.live().length) this.end(); else { this.lastAction = null; this.dummyTurn(); }
    }
  }
  act(e, choice) {
    e.heard = choice; this.lastAction = { target: e.index, choice }; let lines;
    if (e.type === 'jerry') {
      lines = data.jerry[choice ? 'ditch' : 'check'];
      if (choice) { e.away = true; e.ditchedAt = this.turn; }
    } else if (e.type === 'icecap' || e.type === 'ice') {
      const text = iceText[e.type]; let key = 'check';
      if (e.type === 'ice') { if (choice === 1) { key = 'compliment'; e.happy = true; this.previousScene.flags[137] = 1; } }
      else {
        if (choice === 1) key = e.ignored ? 'ignoreAgain' : 'ignore';
        if (choice === 2) key = 'compliment';
        if (choice === 3) {
          key = this.spareable(e) ? 'steal' : 'stealFail';
          if (key === 'steal') {
            if (e.mercy > 10 && e.hp === e.maxHp) this.goldReward += 13;
            Object.assign(e, BATTLE_CONFIGS.ice, { type: 'ice', maxHp: 48, mercy: 100, happy: false, heard: -1 }); e.main.setTexture('spr_icecube:0');
          }
        }
      }
      lines = text[key];
    } else {
      const text = drakeText[e.type], chill = e.type === 'chilldrake'; let key = 'check';
      if (choice === 1) { const roll = Math.floor(Math.random() * 6); e.mercy = -10; key = chill || roll < 3 ? 'heckle' : roll < 5 ? 'heckleAgain' : 'heckleLeave'; if (!chill && roll === 5) e.mercy = 222; }
      if (choice === 2) { e.mercy = e.jokeTold ? 80 : -4; key = e.jokeTold ? 'laugh' : 'laughEarly'; if (e.jokeTold && !chill) this.previousScene.flags[136] = 1; }
      lines = text[key];
      if (choice === 3) {
        lines = this.live().length > 1 ? data[chill ? 'jokeGroupChill' : 'jokeGroup'] : text.joke;
        if (this.live().length > 1) { this.live().forEach((other) => { other.heard = 20; }); e.heard = 19; }
      }
    }
    this.showPages(lines, () => { if (e.mercy === 222) this.removeEnemy(e, false); if (!this.live().length) this.end(); else this.dummyTurn(); });
  }
  speech(e) {
    const text = iceText[e.type] ?? drakeText[e.type], n = Math.floor(Math.random() * 3), command = e.command;
    if (e.heard === 20) { e.mercy = 200; return e.type === 'jerry' ? data.jerry.speechJoke[n] : data.speechJoke[e.type][n]; }
    if (e.heard === 19) { e.mercy = -25; return data.speechJoke[e.type][n]; }
    if (e.type === 'jerry') {
      let i = Math.min(4, Math.floor(command / 20)); if (this.live().length === 1) { i = command > 80 ? 4 : command > 60 ? 3 : command > 40 ? 2 : command > 20 ? 1 : 0; return command === 0 ? data.jerry.speech[0] : data.jerry.speechAlone[i]; }
      return data.jerry.speech[i];
    }
    if (e.type === 'ice') return text[e.happy ? 'speechHappy' : 'speech'][Math.min(3, Math.floor(command / 25))];
    if (e.type === 'icecap') {
      if (e.heard === 1) {
        if (e.ignored) { e.ignored = 2; e.mercy = 300; return text.speechIgnoreAgain[n]; }
        e.ignored = 1; return text.speechIgnore[n === 2 ? 1 : 0];
      }
      if (e.heard === 2) return text.speechCompliment[n];
      if (e.heard === 3) return text.speechSteal[n === 0 ? 0 : 1];
      return text.speech[command >= 80 ? 4 : Math.floor(command / 20)];
    }
    const chill = e.type === 'chilldrake';
    if (e.mercy === -25 && this.live().length === 1) e.mercy = 0;
    if (e.heard === 2) {
      const spoken = e.jokeTold;
      const result = !spoken ? text.speechEarly[0] : !chill && !this.previousScene.flags[57] ? text.speechFirstLaugh[0] : text.speechLaugh[n];
      if (spoken && !chill) this.previousScene.flags[57] = 1;
      return result;
    }
    if (e.heard === 1) { e.jokeTold = false; return text.speechHeckle[n]; }
    if (e.heard === 3) return text.speechJoke[n];
    if (!chill && e.mercy === -25) return data.speechSulking[n];
    if (e.mercy !== -25) e.jokeTold = true;
    return text.speech[chill ? Math.min(3, Math.floor(command / 25)) : command >= 90 ? 6 : command >= 80 ? 5 : command >= 66 ? 4 : command >= 42 ? 3 : command >= 28 ? 2 : command >= 14 ? 1 : 0];
  }
  dummyTurn() {
    this.clearLabels();
    const jerry = this.enemies.find((e) => e.type === 'jerry');
    if (jerry.alive && jerry.away && this.turn - jerry.ditchedAt >= 2 && this.live().length) jerry.away = false;
    if (!this.live().length) { this.end(); return; }
    this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 0; this.speechBoxes = []; this.speechTexts = [];
    for (const e of this.live()) {
      e.hurt = false; e.main.setVisible(!e.parts.length); e.parts.forEach((p) => p.setVisible(true)); e.command = Math.round(Math.random() * 100);
      this.speechTime = Math.max(this.speechTime, (e.type === 'jerry' ? 100 : e.type === 'icecap' || e.type === 'ice' ? 75 : e.heard === 2 ? 108 : 110) * 1000 / 30);
      const bubble = e.type === 'jerry' ? [e.x - 4, 13.5, 'spr_blconabove'] : e.type === 'icecap' || e.type === 'ice' ? [e.x + 49, e.y + (e.type === 'ice' ? 25 : 0), 'spr_blconsm'] : [e.x + 72.5, e.y + 26, 'spr_blconsm'];
      this.speechBoxes.push(this.add.image(bubble[0], bubble[1], `${bubble[2]}:0`).setOrigin(0).setScale(.5));
      this.speechTexts.push(this.add.bitmapText(bubble[0] + 12.5, bubble[1] + 5, 'fnt_plain:black', this.speech(e), 6));
    }
    this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
  }
  update(time, delta) {
    this.animElapsed = Math.min(200, this.animElapsed + delta);
    while (this.animElapsed >= 1000 / 30) {
      this.animElapsed -= 1000 / 30; this.frames++;
      for (const e of this.enemies ?? []) {
        if (!e.alive) continue;
        if (e.type.includes('drake')) {
          if (e.bobDown) { e.bobY += e.bobAcceleration / 4; e.bobAcceleration += .05; if (e.bobAcceleration >= 1) e.bobDown = false; }
          if (!e.bobDown) { e.bobY += e.bobAcceleration / 4; e.bobAcceleration -= .05; if (e.bobAcceleration <= -1) e.bobDown = true; }
        }
        if (e.type === 'jerry') e.main.setAlpha(e.away ? Math.max(0, e.main.alpha - .05) : Math.min(1, e.main.alpha + .05));
      }
    }
    if (this.mode === 'speech' && (this.speechTime <= delta || this.confirmPressed)) { this.speechBoxes.forEach((p) => p.destroy()); this.speechTexts.forEach((p) => p.destroy()); }
    super.update(time, delta);
  }
  animateEnemy(time) {
    if (this.mode === 'dead') return;
    for (const e of this.enemies ?? []) {
      if (!e.alive || e.hurt) continue;
      if (e.parts.length) {
        e.parts[2].setY(e.bobY).setTexture(`spr_snowdrake_head:${Math.floor(this.frames * .1) % 20}`); e.parts[1].y = e.y + (e.bobY - e.y) / 3;
        if (e.parts[3]) e.parts[3].y = e.bobY;
      } else e.main.setTexture(`${e.asset}:${Math.floor(time * (e.type === 'jerry' ? .003 : e.type === 'icecap' ? .003 : 0)) % this.cache.json.get(e.asset).TextureCount}`);
    }
  }
  beginWave() { this.wave = new SnowdinGroupWave(this, this.enemies); this.bullets = this.wave.bullets; this.mode = 'soul'; this.soulElapsed = 0; this.soul.setVisible(true); }
  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++;
    const jerry = this.enemies.find((e) => e.type === 'jerry'); let line = this.text.intro[0];
    // Idle gốc bị instance sinh sau ghi đè; Jerry có lời biến mất/trở lại riêng.
    for (const e of this.live()) {
      if (e.type === 'jerry') { const i = e.hp < e.maxHp / 3 ? 5 : e.command >= 90 ? 4 : Math.floor(e.command / 25); line = data.jerry.idle[i]; }
      else if (e.type === 'icecap') line = iceText.icecap.idle[e.hp < 16 ? 7 : e.ignored > 1 ? 6 : e.ignored === 1 ? 5 : e.command >= 90 ? 4 : e.command >= 75 ? 3 : e.command >= 50 ? 2 : e.command >= 25 ? 1 : 0];
      else if (e.type === 'ice') line = iceText.ice.idle[e.hp < 16 ? 3 : e.happy ? 2 : e.command >= 90 ? 1 : 0];
      else {
        const i = e.type === 'chilldrake' ? e.command >= 90 ? 4 : e.command >= 70 ? 3 : e.command >= 50 ? 2 : e.command >= 25 ? 1 : 0 : e.command >= 80 ? 4 : e.command >= 60 ? 3 : e.command >= 40 ? 2 : e.command >= 25 ? 1 : 0;
        line = drakeText[e.type].idle[e.hp < 20 ? 9 : e.mercy < -10 && e.mercy !== -25 ? 8 : e.mercy === -25 ? 8 : e.mercy === 200 ? 6 : e.mercy === 80 ? 5 : i];
      }
    }
    if (jerry.alive && jerry.away && this.turn - jerry.ditchedAt === 1) line = data.jerry.idle[6];
    if (jerry.alive && !jerry.away && this.turn - jerry.ditchedAt === 3) line = data.jerry.idle[7];
    this.enemies.forEach((e) => { e.heard = -1; }); this.lastAction = null; this.toMenu(line); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  hurtEnemy(e) {
    e.hurt = true; e.parts.forEach((p) => p.setVisible(false));
    const key = e.type === 'jerry' ? 'spr_jerryhurt' : e.type === 'icecap' ? 'spr_icecaphurt' : e.type === 'ice' ? 'spr_icecubehurt' : 'spr_snowdrake';
    e.main.setTexture(`${key}:${e.parts.length ? 1 : 0}`).setVisible(true); this.sound.play('snd_damage');
    if (e.parts.length) this.time.delayedCall(11 * 1000 / 30, () => this.sound.play('snd_hurtdragon'));
  }
  removeEnemy(e, killed) {
    if (!e.alive) return;
    e.alive = false; e.main.setVisible(false); e.parts.forEach((p) => p.destroy()); const w = this.previousScene;
    const base = e.type === 'jerry' ? 55 : e.type === 'icecap' ? 17 : e.type === 'ice' ? 40 : 18;
    this.goldReward += killed ? base : Math.floor(base * (e.maxHp - e.hp) / e.maxHp);
    if (e.hp === e.maxHp && e.mercy > 10) this.goldReward += e.type === 'icecap' ? killed ? 0 : 13 : e.type === 'ice' ? 7 + (e.mercy > 40 ? 15 : 0) : e.type === 'snowdrake' ? 12 : e.type === 'chilldrake' ? 10 : 0;
    if (killed) { this.xpReward += e.xp; w.kills++; w.flags[12] = 1; if (e.type === 'snowdrake') w.flags[57] = 2; }
    else { w.flags[10] = 1; w.flags[23] = (w.flags[23] ?? 0) + 1; }
  }
  end() {
    this.clearLabels(); this.music.stop();
    let line = this.dialogue.win[0].replace(/\\\[1\]/g, String(this.xpReward)).replace(/\\\[2\]/g, String(this.goldReward));
    const w = this.previousScene;
    if (LEVEL_THRESHOLDS.filter((t) => w.xp + this.xpReward >= t).length > w.lv) { line += this.dialogue.levelUp[0]; this.sound.play('snd_levelup'); }
    this.showPages([line], () => this.finishWith());
  }
  finishWith(outcome) {
    const w = this.previousScene;
    if (outcome === 'flee') { w.flags[11] = 1; w.flags[24] = (w.flags[24] ?? 0) + 1; }
    w.xp = Math.min(99999, w.xp + this.xpReward); w.gold += this.goldReward;
    if (w.flags[200]) w.flags[w.flags[200]] = (w.flags[w.flags[200]] ?? 0) + w.kills - (w.flags[201] ?? w.kills);
    w.lv = LEVEL_THRESHOLDS.filter((t) => w.xp >= t).length; w.maxHp = w.lv === 20 ? 99 : 16 + w.lv * 4; this.finishBattle();
  }
  flee() {
    const w = this.previousScene, hard = w.flags[6] === 1;
    const value = !hard && w.armor === 4 ? 100 : hard && this.turn === 0 ? 0 : Math.random() * 100 + 10 * (this.turn - (hard ? 1 : 0));
    if (value > 50) { this.sound.play('snd_escaped'); const n = Math.round(Math.random() * 20); this.showPages([this.dialogue.escaped[n <= 1 ? 0 : n === 2 ? 1 : n === 3 ? 3 : 2]], () => this.finishWith('flee')); }
    else this.dummyTurn();
  }
}
