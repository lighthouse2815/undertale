import { DummyBattle } from './dummy-battle.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';
import { RuinsWave } from './ruins-waves.mjs';
import { readSave } from './save.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';

const SPRITES = { spr_froggit: 4, spr_froghead: 2, spr_froglegs: 2, spr_whimsun: 2, spr_whimsunhurt: 1,
  spr_flybullet: 2, spr_smallfrogbullet: 2, spr_butterflybllt: 2, spr_heart: 2, spr_heartbreak: 1,
  spr_heartshards: 4, spr_gameoverbg: 1, spr_target: 1, spr_targetchoice: 2,
  spr_fightbt: 2, spr_talkbt: 2, spr_itembt: 2, spr_sparebt: 2 };

// Trận đơn battlegroup 4/5: obj_froggit/obj_whimsun và các đợt né đạn gốc.
export class RuinsBattle extends DummyBattle {
  constructor(key = 'RuinsBattle') { super(key); }

  preload() {
    super.preload();
    this.assetError = null;
    this.onAssetError = (file) => { this.assetError = new Error(`Không tải được tài nguyên ${file.key}.`); };
    this.load.on('loaderror', this.onAssetError);
    this.events.once('shutdown', () => this.load.off('loaderror', this.onAssetError));
    const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries(SPRITES)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    for (const key of ['spr_heart', 'spr_smallfrogbullet']) if (!this.textures.exists(`${key}:mask`)) this.load.image(`${key}:mask`, new URL(`sprites/${key}/${key}_0.mask.png`, base).href);
    for (const key of ['path_froghead', 'path_whimsun']) if (!this.cache.json.exists(key)) this.load.json(key, new URL(`paths/${key}.json`, base).href);
    if (!this.cache.bitmapFont.exists('fnt_maintext')) {
      this.load.json('fnt_maintext', new URL('fonts/fnt_maintext/fnt_maintext.json', base).href);
      this.load.image('fnt_maintext', new URL('fonts/fnt_maintext/fnt_maintext.png', base).href);
    }
    for (const key of ['snd_select', 'snd_damage', 'snd_ehurt1', 'snd_hurt1', 'snd_escaped', 'snd_levelup', 'snd_break1', 'snd_break2'])
      if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
    for (const key of ['mus_battle1', 'mus_gameover']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.ogg`, base).href);
    if (!this.cache.json.exists('ruins-battle')) this.load.json('ruins-battle', new URL('./ruins-battle.json', import.meta.url).href);
  }

  loadBattleData() {
    this.load.off('loaderror', this.onAssetError);
    if (this.assetError) throw this.assetError;
    if (!this.cache.bitmapFont.exists('fnt_maintext')) registerBitmapFont(this, 'fnt_maintext', this.cache.json.get('fnt_maintext'));
    colorBitmapFont(this, 'fnt_maintext', 'yellow', '#ffff00');
    colorBitmapFont(this, 'fnt_maintext', 'pink', '#ffbbd4');
    this.monster = this.game.registry.get('battleConfig');
    this.dialogue = this.cache.json.get('ruins-battle');
    return { battleDialogue: this.monster === 'nobody' ? { intro: this.dialogue.empty } : this.dialogue[this.monster] };
  }

  async create() {
    await super.create();
    if (window.__remake.phase === 'error') return;
    this.invFrames = 0; this.soulElapsed = 0; this.pendingOutcome = null; this.mercyModifier = this.monster === 'froggit' ? 3 : 99;
    this.previousScene.flags[30] = this.monster === 'froggit' ? 1 : this.previousScene.flags[30] ?? 0;
    this.enemyParts = [];
    this.setupEnemy();
    this.music = this.sound.add(this.musicKey ?? 'mus_battle1', { loop: true, volume: .5 }); this.music.play();
    this.events.once('shutdown', () => { this.music?.destroy(); this.wave?.destroy(); });
    window.__remake.room = `battle_${this.monster}`;
    if (this.monster === 'nobody') {
      if (this.previousScene.snowdinMusic) pauseSnowdinMusicForBattle(this);
      this.enemy.setVisible(false); this.soul.setVisible(false); this.music.stop();
      this.showPages(this.dialogue.empty, () => this.finishBattle());
    }
  }

  setupEnemy() {
    this.enemy.setPosition(this.monster === 'froggit' ? 108 : 107, this.monster === 'froggit' ? 68 : 8);
    if (this.monster === 'froggit') {
      this.enemy.setOrigin(2 / 112);
      this.enemyParts = ['spr_froghead', 'spr_froglegs'].map((key) => this.add.image(108, 68, `${key}:0`).setOrigin(0).setScale(.5));
    }
    this.animatePath(this.monster === 'froggit' ? this.enemyParts[0] : this.enemy,
      this.monster === 'froggit' ? 'path_froghead' : 'path_whimsun');
  }

  animatePath(npc, name) {
    const points = this.cache.json.get(name).Points, x = npc.x, y = npc.y;
    this.enemyMotion = this.tweens.chain({ targets: npc, loop: -1, onLoop: () => npc.setPosition(x, y),
      tweens: points.slice(1).map((point, i) => ({ x: x + (point.X - points[0].X) / 2, y: y + (point.Y - points[0].Y) / 2,
        duration: Math.hypot(point.X - points[i].X, point.Y - points[i].Y) / (.5 * 30 * point.Speed / 100) * 1000 })) });
  }

  update(time, delta) {
    if (window.__remake.phase !== 'battle' || window.__remake.scene !== this) return;
    if (this.mode === 'soul') this.updateSoul(delta);
    else if (this.mode === 'speech') {
      this.speechTime -= delta;
      if (this.speechTime <= 0 || this.confirmPressed) { this.speechBox?.destroy(); this.speechText?.destroy(); this.beginWave(); }
    } else if (this.mode === 'dead') {
      if (this.confirmPressed && this.deathReady) {
        if (this.deathIndex < this.deathLines.length - 1) this.deathText.setText(this.deathLines[++this.deathIndex]);
        else this.retry();
      }
    } else super.update(time, delta);
    if (this.mode !== 'dead' && this.mode !== 'fight') this.animateEnemy(time);
    this.confirmPressed = false; this.cancel = false;
  }

  animateEnemy(time) {
    if (this.monster === 'froggit') for (const [i, part] of this.enemyParts.entries()) part.setTexture(`${i ? 'spr_froglegs' : 'spr_froghead'}:${Math.floor(time / (1000 / (i ? 1.2 : .6))) % 2}`);
    else if (this.enemy.visible) this.enemy.setTexture(`spr_whimsun:${Math.floor(time / (1000 / 3)) % 2}`);
  }

  updateMenu() {
    this.updateMenuText();
    if (!this.confirmPressed) return;
    this.sound.play('snd_select');
    if (this.menuIndex < 2) this.choose(this.menuIndex ? 'actTarget' : 'fightTarget', [this.config.name]);
    else if (this.menuIndex === 2) this.chooseInventory();
    else this.choose('mercy', ['Spare', 'Flee']);
  }

  spareable() { return this.enemyHp - (this.previousScene.lv === 20 ? 99 : 8 + this.previousScene.lv * 2) - this.previousScene.weaponStrength + this.config.def - this.mercyModifier < 0; }

  drawSubmenu() {
    super.drawSubmenu();
    const yellow = (this.kind === 'mercy' || this.kind === 'fightTarget' || this.kind === 'actTarget') && this.spareable();
    const preference = this.previousScene.flags[22] ?? 0;
    this.menu.setFont(yellow && preference !== 1 ? `fnt_maintext:${preference === 2 ? 'pink' : 'yellow'}` : 'fnt_maintext');
  }

  updateSubmenu() {
    this.drawSubmenu();
    if (this.cancel) { this.toMenu(this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') this.choose('act', this.monster === 'froggit' ? ['Check', 'Compliment', 'Threat'] : ['Check', 'Console', 'Terrorize']);
    else if (this.kind === 'act') {
      const choice = this.subIndex;
      if (choice > 0) this.mercyModifier = this.monster === 'froggit' ? 30 : choice === 2 ? 101 : 99;
      if (choice === 1) this.previousScene.flags[this.monster === 'froggit' ? 130 : 131] = 1;
      const key = choice === 0 ? 'check' : choice === 1 ? 'act3' : 'act1';
      this.lastAct = choice;
      this.showPages(this.text[key], () => this.monster === 'whimsun' && choice === 1 ? this.end('spare') : this.dummyTurn());
    } else if (this.kind === 'mercy') {
      if (this.subIndex === 0) { if (this.spareable()) this.end('spare'); else this.dummyTurn(); }
      else {
        const hard = this.previousScene.flags[6] === 1;
        const value = !hard && this.previousScene.armor === 4 ? 100 : hard && this.turn === 0 ? 0 : Math.random() * 100 + 10 * (this.turn - (hard ? 1 : 0));
        if (value > 50) {
          this.sound.play('snd_escaped'); const random = Math.round(Math.random() * 20);
          this.showPages([this.dialogue.escaped[random <= 1 ? 0 : random === 2 ? 1 : random === 3 ? 3 : 2]], () => this.finishWith('flee'));
        } else this.dummyTurn();
      }
    } else if (this.kind === 'fightTarget') this.startFight();
    else if (this.kind === 'item') this.useInventory();
  }

  dummyTurn() {
    for (const part of this.enemyParts) part.setVisible(true);
    this.mode = 'speech'; this.message.setText(''); this.menu.setText('');
    this.command = Math.round(Math.random() * 100);
    const index = this.command < 30 ? 0 : this.command < 50 ? 1 : this.command < 80 ? 2 : 3;
    const speech = this.lastAct > 0 ? this.text.speech[this.monster === 'froggit' && this.lastAct === 2 ? 5 : 4] : this.text.speech[index];
    this.speechTime = (this.monster === 'froggit' && this.lastAct === 2 ? 108 : 60) * 1000 / 30;
    this.speechBox = this.add.rectangle(185, 45, 125, 60, 0xffffff).setOrigin(0);
    this.speechText = this.add.text(191, 49, speech, { color: '#000', fontSize: '9px', fontFamily: 'monospace', wordWrap: { width: 111 } });
    this.arena.setPosition(118.5, 125).setSize(80, 67.5); this.target.setVisible(false); this.bar.setVisible(false);
    this.soul.setTexture('spr_heart:0').setOrigin(0).setScale(.5).setPosition(154.5, 155).setVisible(false);
  }

  beginWave() {
    this.mode = 'soul'; this.soul.setVisible(true); this.soulElapsed = 0;
    this.waveKind = this.monster === 'froggit' ? this.command <= 40 ? 'leap' : 'flies' : this.command <= 50 ? 'circle' : 'columns';
    this.wave = new RuinsWave(this, this.waveKind); this.bullets = this.wave.bullets;
  }

  updateSoul(delta) {
    this.soulElapsed = Math.min(200, this.soulElapsed + delta);
    while (this.soulElapsed >= 1000 / 30 && this.mode === 'soul') {
      this.soulElapsed -= 1000 / 30; this.invFrames--;
      const speed = this.keys.shift.isDown ? 1 : 2;
      const input = (name) => this.keys[name].isDown || [...this.previousScene.touch.values()].some((pointer) => pointer.direction === name);
      this.soul.x = Math.max(this.arena.x + 2, Math.min(this.arena.x + this.arena.width - 8, this.soul.x + (input('right') ? speed : 0) - (input('left') ? speed : 0)));
      this.soul.y = Math.max(this.arena.y + 2, Math.min(this.arena.y + this.arena.height - 8, this.soul.y + (input('down') ? speed : 0) - (input('up') ? speed : 0)));
      const done = this.wave.step(); this.bullets = this.wave.bullets;
      this.soul.setTexture(`spr_heart:${this.invFrames > 0 ? Math.floor(this.invFrames * .5) % 2 : 0}`);
      if (this.hp <= 0) { this.die(); break; }
      if (done) this.finishSoul();
    }
  }

  hurt(damage) {
    if (this.invFrames > 0) return;
    const df = this.previousScene.lv === 20 ? 99 : 9 + Math.ceil(this.previousScene.lv / 4);
    this.hp = Math.max(0, this.hp - Math.max(1, Math.round(damage - (df + this.previousScene.armorDefense) / 5)));
    this.invFrames = 30; this.sound.play('snd_hurt1'); this.cameras.main.shake(1000 / 15, .006); this.refreshHp();
  }

  refreshHp() { this.hpText.setText(`${this.previousScene.game.registry.get('charname')}  LV ${this.previousScene.lv}     HP ${this.hp}/${this.maxHp}`); }

  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++; this.lastAct = 0;
    const i = this.command >= (this.monster === 'froggit' ? 80 : 90) ? 3 : this.command >= (this.monster === 'froggit' ? 60 : 70) ? 2 : this.command >= 30 ? 1 : 0;
    let status = this.text.idle[i];
    if (this.mercyModifier > (this.monster === 'froggit' ? 5 : 100)) status = this.text.idle[4];
    if (this.enemyHp < (this.monster === 'froggit' ? 5 : this.enemyMaxHp)) status = this.text.idle[5];
    this.toMenu(status); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }

  updateFight(delta) {
    super.updateFight(delta);
    if (this.mode === 'pages' && this.damage !== undefined) for (const part of this.enemyParts) part.setVisible(false);
  }

  end(outcome) {
    this.pendingOutcome = outcome; this.enemy.setVisible(false); for (const part of this.enemyParts) part.setVisible(false);
    const world = this.previousScene;
    this.xpReward = outcome === 'kill' ? this.config.xp : 0;
    this.goldReward = this.rewardGold(outcome);
    let line = this.dialogue.win[0].replace(/\\\[1\]/g, String(this.xpReward)).replace(/\\\[2\]/g, String(this.goldReward));
    if (LEVEL_THRESHOLDS.filter((threshold) => world.xp + this.xpReward >= threshold).length > world.lv) { line += this.dialogue.levelUp[0]; this.sound.play('snd_levelup'); }
    this.music.stop(); this.showPages([line], () => this.finishWith(outcome));
  }

  rewardGold(outcome) {
    return outcome === 'kill' ? 2 : Math.floor(2 * (this.enemyMaxHp - this.enemyHp) / this.enemyMaxHp)
      + (this.monster === 'froggit' ? Number(this.mercyModifier === 30 && this.enemyHp === this.enemyMaxHp) * 2 : Number(this.mercyModifier === 101) * 2);
  }

  finishWith(outcome) {
    const world = this.previousScene;
    if (outcome === 'flee') { world.flags[11] = 1; world.flags[24] = (world.flags[24] ?? 0) + 1; }
    else {
      world.xp = Math.min(99999, world.xp + this.xpReward); world.gold += this.goldReward;
      if (outcome === 'kill') {
        world.kills++; world.flags[12] = 1;
        const populationFlag = this.populationFlag ?? 202;
        if (populationFlag) world.flags[populationFlag] = (world.flags[populationFlag] ?? 0) + 1;
      }
      else { world.flags[10] = 1; world.flags[23] = (world.flags[23] ?? 0) + 1; }
      world.lv = LEVEL_THRESHOLDS.filter((threshold) => world.xp >= threshold).length;
      world.maxHp = world.lv === 20 ? 99 : 16 + world.lv * 4;
    }
    this.finishBattle();
  }

  die() {
    this.mode = 'dead'; this.wave.destroy(); this.music.stop(); this.sound.stopAll();
    const x = this.soul.x, y = this.soul.y; this.children.removeAll(true); this.enemyParts = []; this.enemyMotion?.stop();
    this.cameras.main.resetFX();
    const heart = this.add.image(x, y, 'spr_heart:0').setScale(.5).setOrigin(0);
    this.deathReady = false;
    this.time.delayedCall(20 * 1000 / 30, () => { heart.setTexture('spr_heartbreak:0'); heart.x -= 1; this.sound.play('snd_break1'); });
    this.time.delayedCall(60 * 1000 / 30, () => {
      heart.destroy(); this.sound.play('snd_break2');
      for (const [dx, dy] of [[-2, 0], [0, 3], [2, 6], [8, 0], [10, 3], [12, 6]]) {
        const shard = this.add.image(x + dx / 2, y + dy / 2, 'spr_heartshards:0').setScale(.5).setOrigin(0);
        const angle = Math.random() * Math.PI * 2; shard.vx = Math.cos(angle) * 3.5; shard.vy = -Math.sin(angle) * 3.5;
        this.tweens.addCounter({ from: 0, to: 50, duration: 50 * 1000 / 30, onUpdate: (tween) => {
          const frame = tween.getValue(); shard.setPosition(x + dx / 2 + shard.vx * frame, y + dy / 2 + shard.vy * frame + .05 * frame * frame);
          shard.setTexture(`spr_heartshards:${Math.floor(frame * .25) % 4}`);
        }, onComplete: () => shard.destroy() });
      }
    });
    this.time.delayedCall(110 * 1000 / 30, () => {
      this.music.destroy(); this.music = this.sound.add('mus_gameover', { loop: true }); this.music.play();
      this.add.image(0, 0, 'spr_gameoverbg:0').setOrigin(0).setScale(.5).setAlpha(0);
      this.tweens.add({ targets: this.children.list[this.children.list.length - 1], alpha: 1, duration: 50 * 1000 / 30 });
    });
    this.time.delayedCall(190 * 1000 / 30, () => {
      const deaths = Number(localStorage.getItem('undertale-remake-deaths') ?? 0);
      localStorage.setItem('undertale-remake-deaths', String(deaths + 1));
      this.deathLines = this.dialogue.death[deaths === 0 ? 0 : 1 + Math.floor(Math.random() * 5)].map((line) => line.replace(/\\\[C\]/g, this.game.registry.get('charname')));
      this.deathIndex = 0; this.deathReady = true;
      this.deathText = this.add.bitmapText(50, 150, 'fnt_maintext', this.deathLines[0], 12).setMaxWidth(250);
    });
  }

  async retry() {
    this.deathReady = false;
    const world = this.previousScene;
    const restored = readSave(true) ? await world.restoreGame(true) : await world.restoreGame();
    if (restored) { this.hp = world.maxHp; this.maxHp = world.maxHp; this.finishBattle(); }
    else { this.scene.stop(); world.scene.stop(); this.scene.start('Title'); }
  }
}
