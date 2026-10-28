import { MoldsmalGroupBattle } from './moldsmal-group-battle.mjs';
import { MoldsmalWave } from './moldsmal-waves.mjs';
import { MoldbyggWave, loadMoldbyggWaveAssets } from './moldbygg-waves.mjs';
import { moldsmalAct, moldsmalStatus } from './moldsmal-act.mjs';

// Battlegroup 42: một Moldsmal thường và một Moldbygg giả dạng.
export class MoldbyggGroupBattle extends MoldsmalGroupBattle {
  constructor(key = 'MoldbyggGroupBattle') { super(key); }
  preload() {
    super.preload(); loadMoldbyggWaveAssets(this); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of [['spr_moldsmalx_up', 2], ['spr_moldsmalx_part', 1]]) {
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
  }
  setupEnemy() {
    super.setupEnemy();
    for (const [i, enemy] of this.enemies.entries()) { enemy.x = i ? 158 : 57; enemy.main.setPosition(enemy.x, 78); }
    const enemy = this.enemies[1]; Object.assign(enemy, { type: 'moldbygg', hp: 70, maxHp: 70, def: 4, mercy: -40, stage: 0 });
    enemy.state.mercyModifier = -40; enemy.parts = []; enemy.revealFrames = 0; this.visualFrames = 0; this.visualElapsed = 0;
  }
  choices(enemy) { return enemy.type === 'moldbygg' && enemy.stage ? ['Check', 'Hug', 'Lie Down', 'Unhug'] : ['Check', 'Flirt', 'Imitate']; }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu('* You walk into Moldsmal.'); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) { const kind = this.kind, enemy = this.selectTarget(); this.clearLabels(); if (kind === 'fightTarget') this.startFight(); else this.choose('act', this.choices(enemy)); }
    else if (this.kind === 'act') { const enemy = this.enemies[this.selected], action = this.choices(enemy)[this.subIndex]; this.clearLabels(); this.act(enemy, action); }
    else if (this.kind === 'item') { this.clearLabels(); this.useInventory(); }
    else if (this.kind === 'mercy') { this.clearLabels(); if (this.subIndex === 1) { this.flee(); return; } for (const enemy of this.live().filter(e => this.spareable(e))) this.removeEnemy(enemy, false); if (!this.live().length) this.end(); else this.dummyTurn(); }
  }
  act(enemy, action) {
    if (enemy.type !== 'moldbygg') { const line = moldsmalAct(enemy.state, action.toLowerCase(), this.previousScene.flags); enemy.mercy = enemy.state.mercyModifier; this.showPages([line], () => this.dummyTurn()); return; }
    let line;
    if (!enemy.stage) {
      line = action === 'Check' ? "* MOLDSMAL? - ATK 6 DEF 0\n* It's a slime mold...?" : action === 'Flirt' ? '* You wiggle your hips.\n* Suddenly...!' : '* You approach Moldsmal.\n* Suddenly...!';
      enemy.state.heard = action === 'Flirt' ? 1 : action === 'Imitate' ? 3 : 0;
    } else {
      const lines = { Check: '* MOLDBYGG - ATK 18 DEF 18\n* One size greater than\n  Moldaverage.', Hug: '* You hug Moldbygg.\n* Gross slime covers you.\n* Your SPEED decreased.', 'Lie Down': '* You lie down.\n* Moldbygg lies down too.\n* Moldbygg understands life now.', Unhug: "* You don't hug Moldbygg.\n* It appreciates your respect\n  of its boundaries." };
      line = lines[action]; if (action === 'Hug' && this.soulSpeed > 3) this.soulSpeed--; if (action === 'Unhug') { enemy.mercy = enemy.state.mercyModifier = 200; this.previousScene.flags[144] = 1; }
    }
    this.showPages([line], () => this.dummyTurn());
  }
  reveal(enemy) {
    if (enemy.stage) return; enemy.stage = 1; enemy.name = 'Moldbygg'; enemy.revealFrames = 0; enemy.revealStart = this.visualFrames; enemy.main.setVisible(false);
    enemy.parts = Array.from({ length: 4 }, (_, i) => this.add.image(enemy.x, enemy.y + 85 - i * 15, 'spr_moldsmalx_part:0').setOrigin(0));
    enemy.top = this.add.image(enemy.x, enemy.y, 'spr_moldsmalx_up:0').setOrigin(0); enemy.parts.push(enemy.top);
  }
  dummyTurn() {
    this.clearLabels(); this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 60 * 1000 / 30; this.speechBoxes = []; this.speechTexts = [];
    for (const enemy of this.live()) {
      enemy.hurt = false; enemy.command = Math.round(Math.random() * 100);
      let line;
      if (enemy.type === 'moldbygg') {
        const revealed = !enemy.stage && [1, 3].includes(enemy.state.heard); if (revealed) this.reveal(enemy);
        line = !enemy.stage ? '...' : revealed ? 'Guoooh!' : ['Guoooh!', 'Roar.', '*Slime\nsounds*', '*Chaste\nwiggle*'][Math.min(3, Math.floor(enemy.command / 25))];
        enemy.main.setVisible(!enemy.stage); enemy.parts.forEach(part => part.setVisible(!!enemy.stage));
      } else { enemy.main.setTexture('spr_moldsmal:0').setVisible(true); line = enemy.command >= 75 ? '*Sexy\nwiggle*' : enemy.command >= 50 ? '*Slime\nsounds*' : enemy.command >= 25 ? 'Squorch\n...' : 'Burble\nburb...'; }
      this.speechBoxes.push(this.add.image(enemy.x + 47, 68, 'spr_blconsm:0').setOrigin(0).setScale(.5)); this.speechTexts.push(this.add.bitmapText(enemy.x + 54.5, 73, 'fnt_plain:black', line, 6)); enemy.state.heard = -1;
    }
    this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
  }
  update(time, delta) { this.visualElapsed = Math.min(200, this.visualElapsed + delta); while (this.visualElapsed >= 1000 / 30) { this.visualElapsed -= 1000 / 30; this.visualFrames++; } super.update(time, delta); }
  animateEnemy() {
    for (const enemy of this.enemies ?? []) {
      if (!enemy.alive || enemy.hurt) continue;
      if (enemy.type !== 'moldbygg') { enemy.main.setScale(.5, enemy.scale / 2).setY(enemy.y - 51 * (enemy.scale - 1)); continue; }
      if (!enemy.stage) continue;
      enemy.revealFrames = Math.min(28, this.visualFrames - enemy.revealStart); const progress = enemy.revealFrames / 28, height = Math.min(100, 50 + enemy.revealFrames * 2);
      enemy.top.setPosition(enemy.x + Math.cos(this.visualFrames / 10) * 2, enemy.y - progress * 56).setCrop(0, 0, 50, height);
      enemy.parts.slice(0, 4).forEach((part, i) => part.setPosition(enemy.x + Math.sin((this.visualFrames + i * 15) / 10) * 4, enemy.y + 85 - i * 15 - progress * 56).setVisible(progress === 1 || part.y < 115));
    }
  }
  beginWave() {
    const live = this.live(), waves = [];
    for (const enemy of live) {
      if (enemy.type === 'moldbygg' && enemy.stage) waves.push(new MoldbyggWave(this, enemy.command, { population: live.length }));
      else { const wave = new MoldsmalWave(this, [enemy.command]); if (enemy.type === 'moldbygg') wave.generators[0].rate = live.length > 1 ? 135 : 90; else wave.generators[0].rate = Math.trunc(wave.generators[0].rate * (live.length > 1 ? 1.5 : 1)); waves.push(wave); }
    }
    let frame = 0; const duration = live.some(e => e.type === 'moldbygg' && e.stage) ? 180 : live.some(e => e.type !== 'moldbygg') ? 120 : 10;
    this.wave = { bullets: [], step() { for (const wave of waves) wave.step(); this.bullets = waves.flatMap(wave => wave.bullets); return ++frame >= duration; }, destroy() { for (const wave of waves) wave.destroy(); } };
    this.bullets = []; this.mode = 'soul'; this.soulElapsed = 0; this.soul.setVisible(true);
  }
  finishSoul() {
    this.wave.destroy(); this.wave = null; this.bullets = []; this.soul.setVisible(false); this.turn++; let line = '* You walk into Moldsmal.';
    for (const e of this.live()) if (e.type !== 'moldbygg') line = moldsmalStatus(e.command, e.hp); else if (!e.stage) line = e.hp < 15 ? '* Quite impossible.' : e.command >= 90 ? '* Smells like a bait shop.' : e.command >= 70 ? '* Moldsmal is having quiet\n  time.' : e.command >= 30 ? '* Moldsmal is very normal.' : '* Moldsmal sits motionless.'; else line = e.hp < 30 ? '* Moldbygg has seen better days.' : e.mercy > 100 ? '* Moldbygg seems comfortable\n  with your presence.' : e.command >= 90 ? '* Smells like a bait shop.' : e.command >= 70 ? '* Moldbygg mills about in the\n  corner.' : e.command >= 30 ? '* Moldbygg gyrates reservedly.' : '* Moldbygg needs some distance.';
    this.toMenu(line); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  hurtEnemy(enemy) { if (enemy.type === 'moldbygg') { this.reveal(enemy); enemy.parts.forEach(p => p.setVisible(false)); } super.hurtEnemy(enemy); }
  removeEnemy(enemy, killed) {
    if (enemy.type !== 'moldbygg') return super.removeEnemy(enemy, killed);
    if (!enemy.alive) return; enemy.alive = false; enemy.main.setVisible(false); enemy.parts.forEach(p => p.setVisible(false));
    this.goldReward += (killed ? 30 : Math.floor(30 * (enemy.maxHp - enemy.hp) / enemy.maxHp)) + (enemy.mercy > 100 ? 20 : 0);
    const world = this.previousScene; if (killed) { this.xpReward += 46; world.kills++; world.flags[12] = 1; world.flags[204] = (world.flags[204] ?? 0) + 1; } else { world.flags[10] = 1; world.flags[23] = (world.flags[23] ?? 0) + 1; }
  }
}
