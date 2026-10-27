import { RuinsBattle } from './ruins-battle.mjs';
import { DoggoWave } from './doggo-wave.mjs';
import { DrakeWave } from './drake-waves.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';
import data from './doggo-battle.json' with { type: 'json' };

// Nhóm23: Doggo chỉ thấy chuyển động; Pet sau khi đứng yên qua kiếm xanh.
export class DoggoBattle extends RuinsBattle {
  constructor() { super('DoggoBattle'); }

  preload() {
    super.preload(); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries(data.sprites)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_plain')) {
      this.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href); this.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href);
    }
    if (!this.cache.audio.exists('snd_doghurt1')) this.load.audio('snd_doghurt1', new URL('sounds/snd_doghurt1/snd_doghurt1.wav', base).href);
  }

  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000'); return { battleDialogue: data };
  }

  async create() {
    await super.create(); if (window.__remake.phase === 'error') return;
    const old = this.onKeyDown; window.removeEventListener('keydown', old);
    this.onKeyDown = (event) => {
      if (this.mode === 'submenu' && this.kind === 'act' && event.code.startsWith('Arrow')) {
        if (!event.repeat && ['ArrowLeft', 'ArrowRight'].includes(event.code)) this.subIndex = event.code === 'ArrowRight' ? 1 : 0;
      } else old(event);
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  setupEnemy() {
    this.fieldMusic = pauseSnowdinMusicForBattle(this); this.populationFlag = 0; this.config = { ...this.config };
    this.enemy.setPosition(98, 14).setDepth(-10); this.mercyModifier = -15; this.excited = -1; this.pets = 0; this.headAlert = 0;
    this.enemyFrames = 0; this.enemyElapsed = 0; this.showingHurt = false; this.armsY = 10; this.bubbleAt = Infinity; this.bubbleKind = null;
    this.tail = this.add.image(98, 14, 'spr_movedogetail:0').setOrigin(0).setDepth(-9);
    this.body = this.add.image(98, 14, 'spr_movedogebody:0').setOrigin(0).setDepth(-8);
    this.head = this.add.image(98, 14, 'spr_movedogeheada:0').setOrigin(0).setDepth(-7);
    this.arms = this.add.image(98, 10, 'spr_movedogearms:0').setOrigin(0).setDepth(-6);
    this.enemyParts = [this.tail, this.body, this.head, this.arms];
  }

  choose(kind, items) { super.choose(kind, kind === 'mercy' ? ['Spare'] : items); }

  drawSubmenu() {
    if (this.kind !== 'act') { this.petLabel?.destroy(); this.petLabel = null; super.drawSubmenu(); return; }
    this.menu.setText(`${this.subIndex === 0 ? '>' : ' '} * Check`);
    this.petLabel ??= this.add.bitmapText(172, 133, 'fnt_maintext', '', 12);
    this.petLabel.setText(`${this.subIndex === 1 ? '>' : ' '} * Pet`);
  }

  update(time, delta) {
    this.enemyElapsed = Math.min(200, this.enemyElapsed + delta);
    while (this.enemyElapsed >= 1000 / 30) {
      this.enemyElapsed -= 1000 / 30; this.enemyFrames++;
      this.armsY += Math.sin(this.enemyFrames / 4.5) > 0 ? .4 : -.4;
      if (this.headAlert > 0) this.headAlert--;
      if (this.mode === 'soul' && this.headAlert > 1 && this.enemyFrames >= this.bubbleAt) this.tinySpeech();
    }
    super.update(time, delta);
  }

  animateEnemy() {
    if (this.mode === 'dead' || !this.head?.active || this.showingHurt) return;
    const alert = this.headAlert > 1, sprite = alert ? 'spr_movedogeheadb' : 'spr_movedogeheada';
    this.head.setTexture(`${sprite}:${Math.floor(this.enemyFrames * (alert ? .1 : .33335)) % data.sprites[sprite]}`);
    this.arms.y = this.armsY;
  }

  updateSubmenu() {
    if (!['actTarget', 'act'].includes(this.kind)) { super.updateSubmenu(); return; }
    this.drawSubmenu(); if (this.cancel) { this.petLabel?.destroy(); this.petLabel = null; this.toMenu(data.intro[0]); return; } if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') { this.choose('act', data.actions); return; }
    this.petLabel?.destroy(); this.petLabel = null;
    if (!this.subIndex) this.showPages(data.check, () => this.dummyTurn());
    else if (this.excited !== 0) this.showPages(data.suspicious, () => this.dummyTurn());
    else {
      this.previousScene.flags[139] = 1; this.mercyModifier = 1000;
      if (this.pets < 4) { this.pets++; this.headAlert = 999; }
      else this.headAlert = 3;
      this.showPages(data.pet, () => this.dummyTurn());
    }
  }

  useInventory() {
    if (this.previousScene.inventory[this.subIndex] !== 3) { super.useInventory(); return; }
    this.mercyModifier = 102; this.showPages(data.stick, () => this.dummyTurn());
  }

  dummyTurn() {
    this.showingHurt = false; this.enemyParts.forEach((part) => part.setVisible(true));
    this.command = Math.round(Math.random() * 100);
    let index = this.excited === 1 ? 1 : this.turn >= 1 && this.excited === 0 ? 2 : 0;
    if (this.mercyModifier > 100 && this.mercyModifier < 800) { index = 3; this.mercyModifier = 101; this.headAlert = 30000; this.bubbleKind = 'fetch'; }
    if (this.mercyModifier === 1000) {
      index = this.pets === 4 && this.headAlert <= 3 ? 8 : 3 + this.pets;
      this.mercyModifier = 999; this.config.def = index === 8 ? 0 : -90; this.bubbleKind = 'pet';
    }
    this.mode = 'speech'; this.message.setText(''); this.menu.setText(''); this.speechTime = 110 * 1000 / 30;
    this.speechBox = this.add.image(170.5, 40, 'spr_blconsm:0').setOrigin(0).setScale(.5);
    this.speechText = this.add.bitmapText(178, 45, 'fnt_plain:black', data.speech[index], 6);
    this.arena.setPosition(113.5, 125).setSize(90, 67.5); this.target.setVisible(false); this.bar.setVisible(false); this.soul.setVisible(false);
  }

  beginWave() {
    this.mode = 'soul'; this.soul.setVisible(true); this.soulElapsed = 0;
    if (this.command < 100) this.wave = new DoggoWave(this);
    else {
      this.wave = new DrakeWave(this, 100); this.wave.kind = 'claws'; this.wave.rate = 25;
      this.wave.border = { left: 227, right: 407, top: 250, bottom: 385 };
      this.wave.clip.clear().fillStyle(0xffffff).fillRect(113.5, 125, 90, 67.5);
      this.arena.setPosition(113.5, 125).setSize(90, 67.5); this.soul.setPosition(154.5, 155);
    }
    this.waveKind = this.wave.kind; this.bullets = this.wave.bullets;
    this.bubbleAt = this.enemyFrames + (this.bubbleKind ? 4 : Infinity);
  }

  detectMovement() {
    this.excited = 1; this.mercyModifier = -50; this.headAlert = 90;
    this.bubbleKind = 'moving'; this.bubbleAt = this.enemyFrames + 2;
  }

  tinySpeech() {
    this.clearTinySpeech(); const roll = Math.floor(Math.random() * 3), x = this.enemy.x, y = this.enemy.y;
    const [tx, ty] = roll === 0 ? [x - Math.random() * 33.5 - 20, y + Math.random() * 125 / 3]
      : roll === 1 ? [x + Math.random() * 67 / 3 + 50, y + Math.random() * 125 / 3] : [x + Math.random() * 67 - 33.5, y - 9];
    const index = this.bubbleKind === 'fetch' ? 0 : this.bubbleKind === 'moving' ? 4 : roll + 1;
    this.tinyBox = this.add.image(tx, ty, 'spr_blcontiny:0').setOrigin(0).setScale(.5).setDepth(-12);
    this.tinyText = this.add.bitmapText(tx + 7.5, ty + 5, 'fnt_plain:black', data.tiny[index], 6).setDepth(-11);
    this.bubbleAt = this.enemyFrames + (this.bubbleKind === 'pet' ? 8 + Math.round(Math.random() * 10) : 10 + Math.round(Math.random() * 20));
  }

  clearTinySpeech() { this.tinyBox?.destroy(); this.tinyText?.destroy(); }

  finishSoul() {
    if (this.wave.kind === 'blueSword' && !this.wave.hurted) this.excited = 0;
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.clearTinySpeech(); this.turn++;
    this.toMenu(data.idle[this.mercyModifier > 300 ? 3 : this.mercyModifier > 100 ? 2 : this.excited === 1 ? 1 : 0]);
    this.arena.setPosition(16, 125).setSize(285, 67.5);
  }

  updateFight(delta) {
    super.updateFight(delta);
    if (this.mode === 'pages' && this.damage !== undefined) { this.showingHurt = true; this.time.delayedCall(11 * 1000 / 30, () => this.sound.play('snd_doghurt1')); }
  }

  rewardGold() { return 30; }

  finishWith(outcome) {
    const world = this.previousScene;
    if (this.mercyModifier > 80 && this.mercyModifier < 400) world.flags[52] = 2;
    if (outcome === 'kill') world.flags[52] = 1; else world.flags[27] = 1;
    world.plot = 41; super.finishWith(outcome);
  }
}
