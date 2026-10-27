import { RuinsBattle } from './ruins-battle.mjs';
import { DrakeWave } from './drake-waves.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import data from './drake-battle.json' with { type: 'json' };

// Nhóm 30: Snowdrake/Chilldrake đơn; dùng lại menu, ITEM, FIGHT và Game Over.
export class DrakeBattle extends RuinsBattle {
  constructor() { super('DrakeBattle'); }

  preload() {
    super.preload();
    const base = new URL('../assets/', import.meta.url);
    // Các số khung lấy từ metadata gốc; toàn bộ dữ liệu lời thoại nằm trong JSON riêng.
    for (const [key, count] of Object.entries(data.sprites)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.audio.exists('snd_hurtdragon')) this.load.audio('snd_hurtdragon', new URL('sounds/snd_hurtdragon/snd_hurtdragon.wav', base).href);
    if (!this.cache.bitmapFont.exists('fnt_plain')) {
      this.load.json('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.json', base).href);
      this.load.image('fnt_plain', new URL('fonts/fnt_plain/fnt_plain.png', base).href);
    }
  }

  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this, 'fnt_plain', { ...this.cache.json.get('fnt_plain'), LineHeight: 20 });
    colorBitmapFont(this, 'fnt_plain', 'black', '#000000');
    return { battleDialogue: data[this.monster] };
  }

  setupEnemy() {
    this.fieldMusic = this.previousScene.snowdinMusic;
    this.fieldMusic?.pause();
    this.events.once('shutdown', () => {
      if (this.fieldMusic !== this.previousScene.snowdinMusic || this.fieldMusic?.pendingRemove) return;
      if (this.fieldMusic?.isPaused) this.fieldMusic.resume();
      else if (this.fieldMusic && !this.fieldMusic.isPlaying) this.fieldMusic.play();
    });
    this.enemy.setPosition(108, 19).setVisible(false); this.chill = this.monster === 'chilldrake';
    this.populationFlag = 203; this.mercyModifier = 5; this.jokeTold = false; this.lastAct = null; this.showingHurt = false;
    this.bobY = 19; this.bobAcceleration = .4; this.bobDown = true; this.bobFrames = 0; this.bobElapsed = 0;
    this.legs = this.add.image(108, 19, 'spr_snowdrake_legs:0').setOrigin(0);
    this.body = this.add.image(108, 19, 'spr_snowdrake_body:0').setOrigin(0);
    this.head = this.add.image(108, 19, 'spr_snowdrake_head:0').setOrigin(0);
    this.enemyParts = [this.legs, this.body, this.head];
    if (this.chill) { this.glasses = this.add.image(108, 19, 'spr_chillglasses:0').setOrigin(0); this.enemyParts.push(this.glasses); }
  }

  update(time, delta) {
    this.bobElapsed = Math.min(200, this.bobElapsed + delta);
    while (this.bobElapsed >= 1000 / 30) {
      this.bobElapsed -= 1000 / 30; this.bobFrames++;
      if (this.bobDown) { this.bobY += this.bobAcceleration / 4; this.bobAcceleration += .05; if (this.bobAcceleration >= 1) this.bobDown = false; }
      if (!this.bobDown) { this.bobY += this.bobAcceleration / 4; this.bobAcceleration -= .05; if (this.bobAcceleration <= -1) this.bobDown = true; }
    }
    super.update(time, delta);
  }

  animateEnemy() {
    if (this.mode === 'dead' || !this.head?.active) return;
    if (this.showingHurt) return;
    this.head.setY(this.bobY).setTexture(`spr_snowdrake_head:${Math.floor(this.bobFrames * .1) % 20}`);
    this.body.y = 19 + (this.bobY - 19) / 3;
    if (this.glasses) this.glasses.y = this.bobY;
  }

  updateSubmenu() {
    if (!['actTarget', 'act'].includes(this.kind)) { super.updateSubmenu(); return; }
    this.drawSubmenu();
    if (this.cancel) { this.toMenu(this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') { this.choose('act', this.text.actions); return; }
    this.lastAct = this.subIndex;
    let key = 'check';
    if (this.lastAct === 1) {
      this.heckleRoll = Math.floor(Math.random() * 6); this.mercyModifier = -10;
      key = this.chill || this.heckleRoll <= 2 ? 'heckle' : this.heckleRoll <= 4 ? 'heckleAgain' : 'heckleLeave';
      if (!this.chill && this.heckleRoll === 5) this.mercyModifier = 222;
    } else if (this.lastAct === 2) {
      this.mercyModifier = this.jokeTold ? 80 : -4; key = this.jokeTold ? 'laugh' : 'laughEarly';
      if (this.jokeTold && !this.chill) this.previousScene.flags[136] = 1;
    } else if (this.lastAct === 3) key = 'joke';
    this.showPages(this.text[key], () => this.mercyModifier === 222 ? this.end('spare') : this.dummyTurn());
  }

  dummyTurn() {
    this.showingHurt = false; this.enemy.setVisible(false); this.enemyParts.forEach((part) => part.setVisible(true));
    this.command = Math.round(Math.random() * 100);
    const random = Math.floor(Math.random() * 3), spoken = this.jokeTold;
    let speech;
    if (this.lastAct === 2) {
      speech = !spoken ? this.text.speechEarly[0] : !this.chill && !this.previousScene.flags[57] ? this.text.speechFirstLaugh[0] : this.text.speechLaugh[random];
      if (spoken && !this.chill) this.previousScene.flags[57] = 1;
    } else if (this.lastAct === 1) { speech = this.text.speechHeckle[random]; this.jokeTold = false; }
    else if (this.lastAct === 3) speech = this.text.speechJoke[random];
    else {
      const index = this.chill ? Math.min(3, Math.floor(this.command / 25))
        : this.command >= 90 ? 6 : this.command >= 80 ? 5 : this.command >= 66 ? 4 : this.command >= 42 ? 3 : this.command >= 28 ? 2 : this.command >= 14 ? 1 : 0;
      speech = this.text.speech[index]; this.jokeTold = true;
    }
    this.mode = 'speech'; this.message.setText(''); this.menu.setText('');
    this.speechTime = (this.lastAct === 2 ? 108 : 110) * 1000 / 30;
    this.speechBox = this.add.image(180.5, 45, 'spr_blconsm:0').setOrigin(0).setScale(.5);
    // Typer 2/shake 43 cộng 10 pixel gốc vào x trong obj_base_writer.Draw.
    this.speechText = this.add.bitmapText(193, 50, 'fnt_plain:black', speech, 6);
    this.arena.setPosition(113.5, 125).setSize(90, 67.5); this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
  }

  beginWave() {
    this.mode = 'soul'; this.soul.setVisible(true); this.soulElapsed = 0;
    this.wave = new DrakeWave(this, this.command, this.chill); this.waveKind = this.wave.rotating ? 'rotatingClaws' : 'straightClaws'; this.bullets = this.wave.bullets;
  }

  finishSoul() {
    this.wave.destroy(); this.bullets = []; this.soul.setVisible(false); this.turn++; this.lastAct = null;
    const index = this.chill ? this.command >= 90 ? 4 : this.command >= 70 ? 3 : this.command >= 50 ? 2 : this.command >= 25 ? 1 : 0
      : this.command >= 80 ? 4 : this.command >= 60 ? 3 : this.command >= 40 ? 2 : this.command >= 25 ? 1 : 0;
    let idle = this.text.idle[index];
    if (this.mercyModifier === 80) idle = this.text.idle[5];
    if (this.mercyModifier === 200) idle = this.text.idle[6];
    if (this.mercyModifier === -35) idle = this.text.idle[7];
    if (this.mercyModifier < -10) idle = this.text.idle[8];
    if (this.enemyHp < 20) idle = this.text.idle[9];
    this.toMenu(idle); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }

  updateFight(delta) {
    super.updateFight(delta);
    if (this.mode === 'pages' && this.damage !== undefined) {
      this.showingHurt = true;
      this.time.delayedCall(11 * 1000 / 30, () => this.sound.play('snd_hurtdragon'));
    }
  }

  end(outcome) {
    if (outcome === 'kill' && !this.chill) this.previousScene.flags[57] = 2;
    super.end(outcome);
  }

  rewardGold(outcome) {
    return (outcome === 'kill' ? 18 : Math.floor(18 * (this.enemyMaxHp - this.enemyHp) / this.enemyMaxHp))
      + (this.mercyModifier > 10 && this.enemyHp === this.enemyMaxHp ? this.chill ? 10 : 12 : 0);
  }

}
