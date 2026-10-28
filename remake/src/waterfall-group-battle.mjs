import { MultiBattle } from './multi-battle.mjs';
import { WoshuaBattle } from './woshua-battle.mjs';
import { loadAaronWaveAssets, AaronWave } from './aaron-waves.mjs';
import { WoshuaSpiral } from './woshua-spiral.mjs';
import { WoshuaSoap } from './woshua-soap.mjs';
import { aaronAct, aaronStatus } from './aaron-act.mjs';
import { woshuaAct, woshuaStatus } from './woshua-act.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';

// Battlegroup 54: Woshua và Aaron cùng tấn công.
export class WaterfallGroupBattle extends MultiBattle {
  constructor() { super('WaterfallGroupBattle'); }
  preload() {
    WoshuaBattle.prototype.preload.call(this); loadAaronWaveAssets(this); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of [['spr_aaron', 2], ['spr_aaronbody', 1]]) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.audio.exists('snd_hurtbuzz')) this.load.audio('snd_hurtbuzz', new URL('sounds/snd_hurtbuzz/snd_hurtbuzz.wav', base).href);
  }
  loadBattleData() { WoshuaBattle.prototype.loadBattleData.call(this); return { battleDialogue: { intro: ['* Woshua and Aaron appear.'] } }; }
  setupEnemy() {
    const world = this.previousScene, music = world.waterfallMusic; music?.pause();
    this.events.once('shutdown', () => { if (music === world.waterfallMusic && music?.isPaused) music.resume(); });
    this.enemy.destroy(); this.labels = []; this.selected = 0; this.xpReward = 0; this.goldReward = 0; this.animElapsed = 0; this.frames = 0;
    this.baseAttack = world.lv === 20 ? 99 : 8 + world.lv * 2; this.attackBonus = 0;
    const wosh = { index: 0, type: 'woshua', name: 'Woshua', hp: 70, maxHp: 70, def: 1, mercy: 5, alive: true, x: 58, y: 68,
      state: { heard: -1, slime: 0, clean: 0, mercyModifier: 5, dirtyJoke: 0, monsterAttack: 7 } };
    const aaron = { index: 1, type: 'aaron', name: 'Aaron', hp: 98, maxHp: 98, def: 2, mercy: 5, alive: true, x: 159, y: 19,
      state: { heard: -1, flex: 0, attack: this.baseAttack, monsterAttack: 7, mercyModifier: 5 } };
    wosh.main = this.add.image(wosh.x, wosh.y, 'spr_woshua:0').setOrigin(0).setScale(.5).setVisible(false);
    const part = (key, x, y) => this.add.image(x, y, `${key}:0`).setOrigin(0);
    wosh.hanger = part('spr_woshhanger', 58, 68); wosh.duck = part('spr_woshduck', 81, 77);
    wosh.water1 = part('spr_woshwater', 78, 85).setCrop(0, 0, 16, 28); wosh.water2 = part('spr_woshwater', 78, 85).setCrop(0, 0, 16, 28);
    wosh.body = part('spr_woshbody', 58, 68); wosh.tail = part('spr_woshtail', 102, 93); wosh.head = part('spr_woshhead', 58, 85); wosh.face = part('spr_woshface', 58, 85);
    wosh.parts = [wosh.hanger, wosh.duck, wosh.water1, wosh.water2, wosh.body, wosh.tail, wosh.head, wosh.face];
    aaron.main = this.add.image(159, 19, 'spr_aaron:0').setOrigin(0).setScale(.5).setVisible(false);
    aaron.body = part('spr_aaronbody', 159, 19); aaron.parts = [aaron.body];
    this.enemies = [wosh, aaron]; this.enemy = wosh.main;
  }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu('* Woshua and Aaron appear.'); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) {
      const kind = this.kind, enemy = this.selectTarget(); this.clearLabels();
      if (kind === 'fightTarget') this.startFight(); else this.choose('act', enemy.type === 'woshua' ? ['Check', 'Touch', 'Clean', 'Joke'] : ['Check', 'Shoo', 'Flex']);
    } else if (this.kind === 'act') {
      const enemy = this.enemies[this.selected], action = (enemy.type === 'woshua' ? ['check', 'touch', 'clean', 'joke'] : ['check', 'shoo', 'flex'])[this.subIndex];
      this.clearLabels(); this.act(enemy, action);
    } else if (this.kind === 'item') { this.clearLabels(); this.useInventory(); }
    else if (this.kind === 'mercy') {
      this.clearLabels(); if (this.subIndex === 1) { this.flee(); return; }
      for (const enemy of this.live().filter(e => this.spareable(e))) this.removeEnemy(enemy, false);
      if (!this.live().length) this.end(); else this.dummyTurn();
    }
  }
  act(enemy, action) {
    const aaron = this.enemies[1];
    const result = enemy.type === 'woshua' ? woshuaAct(enemy.state, action, { aaron: aaron.alive ? aaron.state : null }) : aaronAct(enemy.state, action, this.previousScene.flags);
    this.attackBonus = aaron.state.attack - this.baseAttack;
    for (const e of this.live()) e.mercy = e.state.mercyModifier;
    this.showPages(result.pages, () => { if (result.leaves) this.removeEnemy(enemy, false); if (!this.live().length) this.end(); else this.dummyTurn(); });
  }
  speech(enemy) {
    const state = enemy.state, command = enemy.command;
    if (enemy.type === 'woshua') {
      if (state.heard === 3) return 'Green\nmeans\nclean'; if (state.heard === 1) return state.clean === 2 ? 'Fresh!' : 'Yuck!'; if (state.heard === 4) return "NO. THAT\nJOKE'S\nTOO...\nDIRTY";
      if (command >= 75) { const line = enemy.dub ? 'Oops, I\nmeant...\nscrub a\nsub-SUBS' : 'Scrub a\ndub-dubs'; enemy.dub = true; return line; }
      if (command >= 50) return 'Out!!!\nDarned\nspot'; if (command >= 25) return this.previousScene.kills ? 'Your\nSOUL\nis\nunclean' : '*whistle\nas it\ncleans*';
      const part = command < 5 ? 'face' : command < 10 ? 'teeth\nand eyes' : command < 15 ? 'leg' : command < 20 ? 'SOUL' : 'hand'; return `Wosh u\n${part}`;
    }
    if (state.heard === 12) return 'Ha, nice.\nMy kind\nof humor\n; )';
    if (state.heard === 3) return state.flex === 1 ? 'Flexing\ncontest?\nOK, flex\nmore ; )' : "Nice!!\nI won't\nlose\ntho ; )";
    if (state.heard === 1) return 'Fiesty,\nhuh?\n; )'; if (state.heard === 9) return this.previousScene.flags[95] === 1 ? '... ; )' : 'CHECK\nall you\nwant ; )';
    const normal = ["Come on\nin, the\nwater's\nfine ; )", 'No need\nfor a\nswimming\nsuit ; )', 'Edu-\ncation?\nHobby?\nTalent?', "Whew,\nI'm\nsweating\n; )"];
    const eerie = ["Don't\nget too\nclose\n; )", "Sure\nisn't\ncreepy\nout ; )", 'I sure\ndo love\nmuscles\n; )', normal[3]];
    return (this.previousScene.flags[95] === 1 ? eerie : normal)[Math.min(3, Math.floor(command / 25))];
  }
  dummyTurn() {
    this.clearLabels(); this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 110 * 1000 / 30; this.speechBoxes = []; this.speechTexts = [];
    for (const enemy of this.live()) {
      enemy.hurt = false; enemy.main.setVisible(false); enemy.parts.forEach(p => p.setVisible(true)); enemy.command = Math.round(Math.random() * 100);
      const x = enemy.x + 47.5, y = enemy.y - 12.5;
      this.speechBoxes.push(this.add.image(x, y, 'spr_blconsm:0').setOrigin(0).setScale(.5));
      this.speechTexts.push(this.add.bitmapText(x + 7.5, y + 5, 'fnt_plain:black', this.speech(enemy), 6));
    }
    this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
  }
  update(time, delta) {
    this.animElapsed = Math.min(200, this.animElapsed + delta); while (this.animElapsed >= 1000 / 30) { this.animElapsed -= 1000 / 30; this.frames++; }
    if (this.mode === 'speech' && (this.speechTime <= delta || this.confirmPressed)) { this.speechBoxes.forEach(p => p.destroy()); this.speechTexts.forEach(p => p.destroy()); }
    super.update(time, delta);
  }
  animateEnemy() {
    const [wosh, aaron] = this.enemies ?? [];
    if (wosh?.alive && !wosh.hurt) { wosh.tail.setTexture(`spr_woshtail:${Math.floor(this.frames * .2) % 10}`); const offset = Math.sin(this.frames * .1) * 2; wosh.water1.x = 78 - offset; wosh.water2.x = 78 + offset; }
    if (aaron?.alive && !aaron.hurt) aaron.body.y = 19 + Math.sin(this.frames / 30) * 4.5;
  }
  beginWave() {
    const live = this.live(), count = live.length, waves = [];
    for (const enemy of live) {
      if (enemy.type === 'aaron') waves.push(new AaronWave(this, enemy.command, { population: count, damage: enemy.state.monsterAttack }));
      else waves.push(enemy.command < 50 || enemy.state.clean === 1 || enemy.state.clean === 3 ? new WoshuaSpiral(this, enemy.state, enemy.command, count) : new WoshuaSoap(this, enemy.state, enemy.command, count));
      enemy.state.heard = -1;
    }
    let frame = 0; const duration = live.some(e => e.type === 'aaron') ? 160 : waves[0].duration;
    this.wave = { bullets: [], step() { for (const wave of waves) wave.step(); this.bullets = waves.flatMap(wave => wave.bullets); return ++frame >= duration; }, destroy() { for (const wave of waves) wave.destroy(); } };
    this.bullets = []; this.mode = 'soul'; this.soulElapsed = 0; this.soul.setVisible(true);
  }
  finishSoul() {
    this.wave.destroy(); this.wave = null; this.bullets = []; this.soul.setVisible(false); this.turn++; let line = '* Woshua and Aaron appear.';
    for (const enemy of this.live()) { enemy.mercy = enemy.state.mercyModifier; line = enemy.type === 'woshua' ? woshuaStatus(enemy.command, enemy.hp) : aaronStatus(enemy.command, this.previousScene.flags, enemy.state.flex, enemy.hp); }
    this.toMenu(line); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  hurtEnemy(enemy) { enemy.hurt = true; enemy.parts.forEach(p => p.setVisible(false)); enemy.main.setTexture(`spr_${enemy.type}:1`).setVisible(true); this.sound.play('snd_damage'); this.time.delayedCall(11 * 1000 / 30, () => this.sound.play(enemy.type === 'aaron' ? 'snd_hurtbuzz' : 'snd_ehurt1')); }
  removeEnemy(enemy, killed) {
    if (!enemy.alive) return; enemy.alive = false; enemy.main.setVisible(false); enemy.parts.forEach(p => p.setVisible(false));
    this.goldReward += killed ? 25 : Math.floor(25 * (enemy.maxHp - enemy.hp) / enemy.maxHp);
    if (enemy.mercy > 10 && enemy.hp === enemy.maxHp) { this.goldReward += enemy.type === 'aaron' ? 30 : 25; if (enemy.type === 'woshua') this.previousScene.flags[145] = 1; }
    const world = this.previousScene;
    if (killed) { this.xpReward += 52; world.kills++; world.flags[12] = 1; world.flags[204] = (world.flags[204] ?? 0) + 1; }
    else { world.flags[10] = 1; world.flags[23] = (world.flags[23] ?? 0) + 1; }
  }
  end() {
    this.clearLabels(); this.music.stop(); let line = this.dialogue.win[0].replace(/\\\[1\]/g, String(this.xpReward)).replace(/\\\[2\]/g, String(this.goldReward)); const world = this.previousScene;
    if (LEVEL_THRESHOLDS.filter(t => world.xp + this.xpReward >= t).length > world.lv) { line += this.dialogue.levelUp[0]; this.sound.play('snd_levelup'); }
    this.showPages([line], () => this.finishWith());
  }
  finishWith(outcome) {
    const world = this.previousScene; if (outcome === 'flee') { world.flags[11] = 1; world.flags[24] = (world.flags[24] ?? 0) + 1; }
    world.xp = Math.min(99999, world.xp + this.xpReward); world.gold += this.goldReward;
    world.lv = LEVEL_THRESHOLDS.filter(t => world.xp >= t).length; world.maxHp = world.lv === 20 ? 99 : 16 + world.lv * 4; this.finishBattle();
  }
}
