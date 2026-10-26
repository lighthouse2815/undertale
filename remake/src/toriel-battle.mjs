import { HardModeEnd } from './hard-mode-end.mjs';
import hardData from './hard-mode-end.json' with { type: 'json' };
import { RuinsBattle } from './ruins-battle.mjs';
import { TorielWave } from './toriel-waves.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';
import data from './toriel-battle.json' with { type: 'json' };

// Battlegroup 22/obj_torielboss: Check/Talk, MERCY liên tiếp và FIGHT.
export class TorielBattle extends RuinsBattle {
  constructor() { super('TorielBattle'); }

  preload() {
    super.preload();
    const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries({ ...data.sprites, ...hardData.sprites })) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
      if (['spr_firebullet', 'spr_handbullet'].includes(key) && !this.textures.exists(`${key}:mask`)) this.load.image(`${key}:mask`, new URL(`sprites/${key}/${key}_0.mask.png`, base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_plain')) {
      this.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href);
      this.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href);
    }
    for (const key of ['path_hand1', 'path_hand2']) if (!this.cache.json.exists(key)) this.load.json(key, new URL(`paths/${key}.json`, base).href);
    for (const key of ['snd_noise']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
    for (const key of ['mus_dogsong', 'mus_mode', 'mus_intronoise']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.ogg`, base).href);
    if (!this.cache.audio.exists('mus_boss1')) this.load.audio('mus_boss1', new URL('sounds/mus_boss1/mus_boss1.ogg', base).href);
  }

  async create() { await super.create(); if (this.music) this.music.setVolume(1); }

  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000'); colorBitmapFont(this, 'fnt_maintext', 'red', '#ff0000');
    return { battleDialogue: data };
  }

  update(time, delta) {
    if (this.hardEnding) { this.hardEnding.update(delta); return; }
    super.update(time, delta);
  }

  setupEnemy() {
    this.hardEnding = null;
    this.musicKey = 'mus_boss1'; this.enemy.setPosition(125, 21).setScale(1);
    this.conversation = 0; this.talkCount = 0; this.lastHp = this.enemyHp; this.lastAction = null;
    this.mercyModifier = -20000; this.enemySprite = 'spr_torielboss'; this.defense = this.previousScene.flags[202] >= 20 ? -9999 : 1;
  }

  animateEnemy() {
    if (this.hardEnding) return;
    if (this.enemy.active && this.mode !== 'dead') {
      const sprite = this.killDialogue && this.mode === 'pages' ? this.text.deathSprites[this.killDialogue][this.pageIndex] : this.enemySprite;
      this.enemy.setTexture(`${sprite}:0`);
    }
  }
  spareable() { return false; } // mercymod -20000: không hiện tên vàng; kết thúc qua conversation 25.

  updateSubmenu() {
    this.drawSubmenu();
    if (this.cancel) { this.toMenu(this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') { this.choose('act', ['Check', 'Talk']); return; }
    if (this.kind === 'act') {
      this.lastAction = 'act';
      let lines = this.text.check;
      if (this.subIndex === 1) {
        this.talkCount++;
        const memory = Number(localStorage.getItem('undertale-remake-toriel-kills') ?? 0) > 0;
        lines = this.previousScene.flags[202] >= 20 ? this.text.talkKill : memory
          ? this.talkCount === 1 ? this.text.talkMemory : this.text.talkMemoryRepeat : [this.text.talk[Math.min(2, this.talkCount - 1)]];
      }
      this.showPages(lines, () => this.dummyTurn()); return;
    }
    if (this.kind === 'mercy' && this.subIndex === 0) { this.lastAction = 'spare'; this.dummyTurn(); return; }
    if (this.kind === 'mercy') { this.lastAction = 'flee'; super.updateSubmenu(); return; }
    if (this.kind === 'fightTarget') { this.lastAction = 'fight'; this.startFight(); return; }
    if (this.kind === 'item') { this.lastAction = 'item'; this.useInventory(); }
  }

  dummyTurn() {
    const unchanged = this.enemyHp === this.lastHp;
    if (this.lastAction === 'spare' && unchanged) this.conversation++;
    this.lastHp = this.enemyHp;
    if (this.conversation === 25) {
      this.music.stop(); this.enemySprite = 'spr_torielboss_neutral';
      this.showBossPages(this.text.spared, () => this.finishToriel('spare')); return;
    }
    if (this.conversation >= 14) this.music.stop();
    const sprites = { 10: 'spr_torielboss_side', 12: 'spr_torielboss_side', 13: 'spr_torielboss_sidesad',
      14: 'spr_torielboss_sad', 16: 'spr_torielboss_sadhappy', 19: 'spr_torielboss_sad',
      20: 'spr_torielboss_sidesad', 21: 'spr_torielboss_sidesad2', 22: 'spr_torielboss_sidesadhappy', 24: 'spr_torielboss_sidesad' };
    if (sprites[this.conversation]) this.enemySprite = sprites[this.conversation];
    this.command = Math.round(Math.random() * 100);
    this.mode = 'speech'; this.message.setText(''); this.menu.setText('');
    const spoken = this.lastAction === 'spare' && unchanged;
    this.speechTime = (spoken ? this.conversation > 13 ? 485 : 85 : 15) * 1000 / 30;
    if (spoken) {
      const wide = this.conversation > 13, x = wide ? 198.5 : 207.5, y = wide ? 37 : 33;
      this.speechBox = this.add.image(x, y, `${wide ? 'spr_blconwdshrt' : 'spr_blconsm'}:0`).setOrigin(0).setScale(.5);
      this.speechText = this.add.bitmapText(x + (wide ? 18 : 7.5), y + 5, 'fnt_plain:black', this.text.spareSpeech[this.conversation - 1], 6);
    }
    this.target.setVisible(false); this.bar.setVisible(false); this.soul.setVisible(false);
  }

  beginWave() {
    this.speechBox = null; this.speechText = null;
    this.mode = 'soul'; this.soul.setVisible(true); this.soulElapsed = 0;
    this.wave = new TorielWave(this, this.command, { hard: this.previousScene.flags[6] === 1, conversation: this.conversation });
    this.waveKind = this.wave.kind; this.bullets = this.wave.bullets;
    if (this.hp <= 2 && this.enemyHp > 150) this.defense = -15;
    if (this.conversation > 13) this.defense = -2000;
  }

  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++;
    const i = this.conversation > 13 ? 4 : this.command >= 90 ? 3 : this.command >= 70 ? 2 : this.command >= 30 ? 1 : 0;
    this.toMenu(this.text.idle[i]); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }

  updateFight(delta) {
    this.attackX += this.attackSpeed * delta; this.bar.x = this.attackX;
    if (this.attackX > 300) { this.damage = 0; this.showPages(['* MISS'], () => { this.lastAction = 'spare'; this.dummyTurn(); }); return; }
    if (!this.confirmPressed) return;
    const distance = Math.abs(this.attackX + 3.5 - 159.5) * 2 || 1;
    const base = 8 + this.previousScene.lv * 2 + (this.previousScene.weaponStrength ?? 0) - this.defense + Math.random() * 2;
    this.damage = Math.round(base * (distance <= 12 ? 2.2 : (562 - distance) / 562 * 2));
    this.enemyHp = Math.max(0, this.enemyHp - this.damage);
    if (this.conversation < 4) this.conversation = 0;
    this.enemySprite = this.previousScene.flags[202] >= 20 || this.damage > 100 && this.conversation > 13 ? 'spr_torielboss_murdered'
      : this.damage > 100 ? 'spr_torielboss_reallyhurt' : 'spr_torielboss_hurt';
    if (this.damage > 100) this.music.setVolume(0);
    this.sound.play('snd_damage');
    this.showPages([String(this.damage)], () => {
      if (this.enemyHp <= 150) this.defense = -140;
      if (this.enemyHp === 0) this.end('kill');
      else { this.enemySprite = this.hp <= 2 ? 'spr_torielboss_side' : 'spr_torielboss'; this.dummyTurn(); }
    });
  }

  end() {
    this.music.stop();
    const betrayal = this.conversation > 13, murder = this.previousScene.flags[202] >= 20;
    this.enemySprite = betrayal || murder ? 'spr_torielboss_murdered' : 'spr_torielboss_kneel';
    this.killDialogue = betrayal ? 'betrayal' : murder ? 'killedMurder' : 'killed';
    this.showBossPages(this.text[this.killDialogue], () => this.breakSoul());
  }

  showBossPages(lines, after) {
    const message = this.message; message.setVisible(false);
    const balloon = this.add.image(198.5, 37, 'spr_blconwdshrt:0').setOrigin(0).setScale(.5);
    this.message = this.add.bitmapText(216.5, 42, 'fnt_plain:black', '', 6);
    this.showPages(lines, () => {
      balloon.destroy(); this.message.destroy(); this.message = message; message.setVisible(true); after();
    });
  }

  breakSoul() {
    if (this.previousScene.flags[6] === 1) { this.beginHardEnding(true); return; }
    this.killDialogue = null; this.mode = 'dying'; this.message.setText(''); this.enemy.setVisible(false);
    const x = this.soul.x, y = this.enemy.y + 28;
    this.torielHeart = this.add.image(x, y, 'spr_torheart:0').setOrigin(0).setScale(.5).setAlpha(0);
    this.tweens.add({ targets: this.torielHeart, alpha: 1, duration: 5000 });
    this.time.delayedCall(6000, () => {
      this.torielHeart.setTexture('spr_torheartbreak:0'); this.torielHeart.x -= 1; this.sound.play('snd_break1');
    });
    this.time.delayedCall(6000 + 40 * 1000 / 30, () => {
      this.torielHeart.destroy(); this.sound.play('snd_break2');
      for (const [dx, dy] of [[-2, 0], [0, 3], [2, 6], [8, 0], [10, 3], [12, 6]]) {
        const shard = this.add.image(x + dx / 2, y + dy / 2, 'spr_theartshards:0').setOrigin(0).setScale(.5);
        const angle = Math.random() * Math.PI * 2, vx = Math.cos(angle) * 3.5, vy = Math.sin(angle) * 3.5;
        this.tweens.addCounter({ from: 0, to: 180, duration: 6000, onUpdate: (tween) => {
          const frame = tween.getValue(); shard.setPosition(x + dx / 2 + vx * frame, y + dy / 2 + vy * frame + .05 * frame * frame);
          shard.setTexture(`spr_theartshards:${Math.floor(frame * .25) % this.text.sprites.spr_theartshards}`);
        }, onComplete: () => shard.destroy() });
      }
    });
    this.time.delayedCall(6000 + 220 * 1000 / 30, () => {
      this.cameras.main.once('camerafadeoutcomplete', () => this.finishToriel('kill'));
      this.cameras.main.fadeOut(20 * 1000 / 30);
    });
  }

  beginHardEnding(killed) {
    this.mode = 'hardEnding'; this.killDialogue = null; this.hardEnding = new HardModeEnd(this, killed);
    this.events.once('shutdown', () => this.hardEnding?.destroy());
  }

  finishToriel(outcome) {
    if (outcome === 'spare' && this.previousScene.flags[6] === 1) {
      this.previousScene.flags[45] = 5; this.previousScene.flags[27] = 1;
      localStorage.setItem('undertale-remake-toriel-spares', String(Number(localStorage.getItem('undertale-remake-toriel-spares') ?? 0) + 1));
      this.beginHardEnding(false); return;
    }
    const world = this.previousScene;
    if (outcome === 'kill') {
      world.flags[45] = 4; world.flags[12] = 1; world.kills++; world.flags[202] = (world.flags[202] ?? 0) + 1;
      world.xp += 150; world.lv = LEVEL_THRESHOLDS.filter((threshold) => world.xp >= threshold).length;
      world.maxHp = world.lv === 20 ? 99 : 16 + world.lv * 4;
      localStorage.setItem('undertale-remake-toriel-kills', String(Number(localStorage.getItem('undertale-remake-toriel-kills') ?? 0) + 1));
    } else {
      world.flags[45] = 5; world.flags[27] = 1;
      localStorage.setItem('undertale-remake-toriel-spares', String(Number(localStorage.getItem('undertale-remake-toriel-spares') ?? 0) + 1));
    }
    this.outcome = outcome; this.finishBattle();
  }

  finishWith(outcome) { if (outcome === 'flee') super.finishWith(outcome); else this.finishToriel(outcome); }
}
