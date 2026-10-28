import { MultiBattle } from './multi-battle.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { murderLevel } from './route.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';
import { pauseSnowdinMusicForBattle } from './snowdin-start.mjs';
import { PapyrusBones, loadPapyrusBoneAssets } from './papyrus-bones.mjs';
import { PapyrusBlueAttack } from './papyrus-blue-attack.mjs';
import { PapyrusSpecialIntro, loadPapyrusSpecialAssets } from './papyrus-special-intro.mjs';
import { PapyrusRegularAttack, loadPapyrusRegularAssets } from './papyrus-regular-attack.mjs';
import { PapyrusCapture } from './papyrus-capture.mjs';
import { papyrusAct, papyrusTurnStatus, preparePapyrusTurn } from './papyrus-turn.mjs';

const INTRO = '* Papyrus blocks the way!';
const PITY = [" WELL...! *HUFF*\n IT'S CLEAR...\n YOU CAN'T! *HUFF*\n DEFEAT ME!!!", ' YEAH!!!\n I CAN SEE YOU\n SHAKING IN YOUR\n BOOTS!!!', ' THEREFORE I, THE\n GREAT PAPYRUS,\n ELECT TO GRANT\n YOU PITY!!', ' I WILL SPARE YOU,\n HUMAN!!!', " NOW'S YOUR CHANCE\n TO ACCEPT MY\n MERCY."];

// Battlegroup 27: điều phối ACT, các đợt xương và trạng thái bị bắt.
export class PapyrusBattle extends MultiBattle {
  constructor() { super('PapyrusBattle'); }
  preload() {
    super.preload(); loadPapyrusBoneAssets(this); loadPapyrusSpecialAssets(this); loadPapyrusRegularAssets(this);
    const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of [['spr_papyrusboss', 2], ['spr_papyrusboss_anim', 1], ['spr_papyrusboss_head', 1], ['spr_papyrusboss_body', 1], ['spr_blconwdshrt', 1]]) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_papyrus')) { this.load.json('fnt_papyrus', new URL('fonts/fnt_papyrus/fnt_papyrus.json', base).href); this.load.image('fnt_papyrus', new URL('fonts/fnt_papyrus/fnt_papyrus.png', base).href); }
    for (const key of ['snd_bell', 'snd_txtasg', 'snd_txtpap']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
    for (const key of ['mus_papyrus', 'mus_papyrusboss']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.ogg`, base).href);
  }
  loadBattleData() {
    super.loadBattleData();
    if (!this.cache.bitmapFont.exists('fnt_papyrus')) registerBitmapFont(this, 'fnt_papyrus', this.cache.json.get('fnt_papyrus'));
    colorBitmapFont(this, 'fnt_papyrus', 'black', '#000000');
    return { battleDialogue: { intro: [INTRO] } };
  }
  setupEnemy() {
    pauseSnowdinMusicForBattle(this); const w = this.previousScene, flag = w.flags[67] ?? 0;
    this.musicKey = flag < 0 ? 'mus_papyrusboss' : 'mus_papyrus'; this.musicVolume = murderLevel(w.flags) >= 7 ? 0 : flag < 0 ? .9 : .5;
    this.murder = murderLevel(w.flags) >= 7; this.truefight = flag < 0; this.conversation = Number(this.truefight);
    this.soulColor = this.truefight ? 'blue' : null;
    w.flags[67] = flag === -2 ? -3 : flag === -1 ? -2 : flag === 0 ? -1 : flag; w.flags[68] = 1; if (this.murder) w.flags[290] = 1;
    this.labels = []; this.selected = 0; this.wave = null; this.blueAttack = false; this.captureFinished = false; this.speechWaveElapsed = 0;
    this.fighto = -1; this.xfight = 0; this.heard = -1; this.talked = 0; this.insult = 0; this.hotcha = 0; this.flirt2 = 0; this.xxtalk = 0;
    this.hearthp = this.hearthp2 = this.hp; this.prevHp = 680; this.mercy = this.murder ? 8000 : 0; this.status = INTRO;
    this.enemy.setPosition(125, 21).setScale(.5).setVisible(false);
    this.body = this.add.image(125, 21, 'spr_papyrusboss_anim:0').setOrigin(0); this.enemyParts = [this.body];
    this.enemies = [{ index: 0, name: 'Papyrus', main: this.enemy, hp: 680, maxHp: 680, def: this.murder ? -20000 : 2, mercy: this.mercy, alive: true }];
  }
  async create() { await super.create(); if (this.music) this.music.setVolume(this.musicVolume); }
  update(time, delta) {
    if (this.mode === 'pages' && (this.wave instanceof PapyrusBlueAttack || this.wave instanceof PapyrusSpecialIntro || this.wave instanceof PapyrusCapture)) {
      this.speechWaveElapsed = Math.min(200, (this.speechWaveElapsed ?? 0) + delta);
      while (this.speechWaveElapsed >= 1000 / 30 && this.mode === 'pages') { this.speechWaveElapsed -= 1000 / 30; this.wave.step(); }
    } else this.speechWaveElapsed = 0;
    super.update(time, delta);
  }
  animateEnemy() {}
  choose(kind, items) { super.choose(kind, kind === 'mercy' ? ['Spare'] : items); }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.clearLabels(); this.toMenu(this.status); return; } if (!this.confirmPressed) return;
    if (this.kind.endsWith('Target')) { const kind = this.kind; this.selectTarget(); this.clearLabels(); if (kind === 'fightTarget') this.startFight(); else this.choose('act', ['Check', 'Insult', 'Flirt']); }
    else if (this.kind === 'act') { const name = ['check', 'insult', 'flirt'][this.subIndex]; this.clearLabels(); this.act(name); }
    else if (this.kind === 'flirtChoice') { const result = papyrusAct(this, 'flirtChoice', this.subIndex); this.bossPages(result.text, () => this.dummyTurn()); }
    else if (this.kind === 'item') { this.clearLabels(); this.useInventory(); }
    else if (this.kind === 'mercy') { this.clearLabels(); if (this.spareable()) this.end('spare'); else this.dummyTurn(); }
  }
  act(name) {
    const result = papyrusAct(this, name), next = () => result.choice ? this.choose('flirtChoice', ['I can make spaghetti', 'I have zero redeeming qualities']) : this.dummyTurn();
    if (result.speaker === 'papyrus') this.bossPages(result.text, next); else this.showPages(result.text, next);
  }
  bossPages(lines, after) {
    const message = this.message; message.setVisible(false);
    const balloon = this.add.image(197.5, 47, 'spr_blconwdshrt:0').setOrigin(0).setScale(.5);
    this.message = this.add.bitmapText(210, 52, 'fnt_papyrus:black', '', 8);
    this.showPages(lines, () => { balloon.destroy(); this.message.destroy(); this.message = message; message.setVisible(true); after(); });
  }
  dummyTurn() {
    this.body.setVisible(true); this.enemy.setVisible(false); this.soul.setVisible(false); this.target.setVisible(false); this.bar.setVisible(false);
    const selected = preparePapyrusTurn(this, Math.round(Math.random() * 100)); this.blueAttack = selected.blueAttack;
    this.soul.setTexture('spr_heart:0').setOrigin(0).setScale(.5).setPosition(154.5, 154.5);
    this.arena.setPosition(96, 125).setSize(125, 67.5);
    this.bossPages(selected.speech, () => this.beginWave());
  }
  beginWave() {
    this.mode = 'soul'; this.soulElapsed = 0; this.soul.setVisible(true); this.hearthp = this.hp; this.heard = -1; this.talked = 0;
    if (this.blueAttack) this.wave = new PapyrusBlueAttack(this, (close) => this.bossPages([" YOU'RE BLUE NOW.", " THAT'S MY ATTACK!", ' NYEH HEH HEH\n HEH HEH HEH\n HEH HEH HEH!!!'], () => { close(); this.mode = 'soul'; }));
    else if (!this.truefight) { this.wave = new PapyrusBones(this, { firstWave: true, fighto: this.fighto }); if (this.murder) this.wave.duration = 2; }
    else if (this.fighto === 14 && this.xfight > 3) this.wave = new PapyrusSpecialIntro(this, (pages, close) => this.bossPages(pages, () => { close(); this.mode = 'soul'; }));
    else if (this.fighto === 15) { this.wave = new PapyrusRegularAttack(this); this.fighto = 16; }
    else if (this.fighto >= 16) { this.soulMovement = 1; this.wave = new PapyrusBones(this, { fighto: 16 }); this.wave.duration = 4; }
    else {
      const requested = this.fighto, previous = this.xfight;
      this.wave = new PapyrusBones(this, { turn: requested, xfight: previous, command: this.command });
      if (requested === 14) this.xfight++; else this.fighto++;
      // Step gốc đặt fighto về 14 sau mỗi đợt được chọn lại trong vòng lặp.
      if (this.xfight > 0) this.fighto = 14;
    }
    this.bullets = this.wave.bullets; this.status = papyrusTurnStatus(this, this.command);
  }
  updateSoul(delta) {
    super.updateSoul(delta);
    if (this.wave?.captured && this.mode === 'soul') {
      this.wave.destroy(); this.captureFinished = false;
      this.wave = new PapyrusCapture(this, (pages, close) => this.bossPages(pages, () => { close(); this.mode = 'soul'; }), () => { this.captureFinished = true; }); this.bullets = [];
    }
  }
  finishSoul() {
    const wave = this.wave; wave.destroy(); this.wave = null; this.bullets = []; this.soul.setVisible(false); this.hearthp2 = this.hp; this.turn++;
    if (wave instanceof PapyrusCapture && this.captureFinished) { this.finishBattle(); return; }
    if (wave instanceof PapyrusBlueAttack) {
      this.truefight = true; this.soulColor = 'blue'; this.music.destroy(); this.music = this.sound.add('mus_papyrusboss', { loop: true, volume: .8 }); this.music.play(); this.status = "* You're blue now.";
    } else if (wave instanceof PapyrusSpecialIntro) { this.fighto = 15; this.xfight = 0; this.status = '* Papyrus is getting ready\n  for a regular attack.'; }
    else if (wave instanceof PapyrusRegularAttack) {
      this.bossPages(PITY, () => { this.music.stop(); this.mercy = 8000; this.enemies[0].mercy = 8000; this.enemies[0].def = -this.enemyHp * 2; this.status = '* Papyrus is sparing you.'; this.toMenu(this.status); this.arena.setPosition(16, 125).setSize(285, 67.5); }); return;
    }
    this.toMenu(this.status); this.arena.setPosition(16, 125).setSize(285, 67.5);
  }
  hurtEnemy() { this.prevHp = this.enemyHp + this.damage; this.body.setVisible(false); this.enemy.setVisible(true).setTexture('spr_papyrusboss:1'); this.sound.play('snd_damage'); }
  removeEnemy(enemy) { enemy.alive = false; }
  end(outcome) {
    this.clearLabels(); this.music.stop();
    if (outcome === 'spare') { this.finishPapyrus(false); return; }
    this.mode = 'papyrusDeath'; this.enemy.setVisible(false); this.body.setVisible(false);
    const head = this.add.image(145.5, 21, 'spr_papyrusboss_head:0').setOrigin(2 / 44, 2 / 70).setScale(.5);
    const body = this.add.image(125, 21, 'spr_papyrusboss_body:0').setOrigin(0).setScale(.5);
    localStorage.setItem('undertale-remake-papyrus-kills', String(Number(localStorage.getItem('undertale-remake-papyrus-kills') ?? 0) + 1));
    this.time.delayedCall(30 * 1000 / 30, () => {
      this.tweens.add({ targets: head, x: head.x + 22, y: head.y + 35, duration: 32 * 1000 / 30, ease: 'Quad.easeIn' });
      this.time.delayedCall(60 * 1000 / 30, () => this.bossPages([this.murder ? " W-WELL, THAT'S\n NOT WHAT I\n EXPECTED..." : ' ALAS, POOR\n PAPYRUS!'], () => {
        body.destroy(); this.time.delayedCall(30 * 1000 / 30, () => {
          this.tweens.add({ targets: head, y: head.y + 32.5, duration: 30 * 1000 / 30, ease: 'Quad.easeIn' });
          this.time.delayedCall(80 * 1000 / 30, () => this.bossPages(this.murder ? [' BUT...', ' ST... STILL!\n I BELIEVE IN\n YOU!', ' YOU CAN DO A\n LITTLE BETTER!', " EVEN IF YOU\n DON'T THINK SO!", ' I...\n I PROMISE...'] : [' WELL, AT LEAST I\n STILL HAVE MY\n HEAD!'], () => {
            this.time.delayedCall(100 * 1000 / 30, () => { head.destroy(); this.previousScene.xp += 200; this.previousScene.kills++; this.time.delayedCall(150 * 1000 / 30, () => this.finishPapyrus(true)); });
          }));
        });
      }));
    });
  }
  finishPapyrus(killed) {
    const w = this.previousScene; w.flags[67] = Number(killed); w.plot = 100;
    w.lv = LEVEL_THRESHOLDS.filter((threshold) => w.xp >= threshold).length; w.maxHp = w.lv === 20 ? 99 : 16 + w.lv * 4;
    this.mode = 'papyrusEnd'; this.cameras.main.fadeOut(13 * 1000 / 30); this.time.delayedCall(45 * 1000 / 30, () => this.finishBattle());
  }
}
