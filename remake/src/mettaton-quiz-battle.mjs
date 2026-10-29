import { RuinsBattle } from './ruins-battle.mjs';
import { fightInput } from './fight-input.mjs';
import text from './mettaton-quiz.json' with { type: 'json' };

const SPRITES = { spr_mettatonb: 1, spr_mettatonb_arms1: 2, spr_mettatonb_arms2: 2, spr_mettatonb_arms3: 2, spr_mettatonb_arms4: 1,
  spr_mettatonb_armsin: 6, spr_mettatonb_rocketoff: 2, spr_mettatonb_shirt: 1, spr_flyjar: 1, spr_jarfly: 1,
  spr_abutton: 1, spr_bbutton: 1, spr_cbutton: 1, spr_dbutton: 1, spr_alphyshelper: 1, spr_alphyshelper_lookup: 1,
  spr_alphyshelper_a: 2, spr_alphyshelper_b: 2, spr_alphyshelper_c: 2, spr_alphyshelper_d: 2, spr_alphyshelper_confused: 1,
  spr_alphyshelper_thumbsup: 2, spr_alphyshelper_shock: 2, spr_alphyshelper_tooexcited: 2, spr_alphyshelper_excited2: 1,
  spr_alphyshelper_shock2: 2, spr_alphyshelper_shockembarrass: 1, spr_alphyshelper_embarrass: 1, spr_alphyshelper_shakehead: 2 };
const correct = [3, 2, 1, 3, 0, 3, 5, 2, 5, 6], delays = [80, 60, 60, 90, 60, 60, 30, 45, 200, 70];
const lines = (prefix, ids) => ids.map(id => text[`${prefix}_${id}`]);
const range = (first, last) => Array.from({ length: last - first + 1 }, (_, i) => first + i);

// Battlegroup 48, obj_questionasker: câu hỏi và đáp án chọn bằng va chạm SOUL.
export class MettatonQuizBattle extends RuinsBattle {
  constructor() { super('MettatonQuizBattle'); this.musicKey = 'mus_mettatonbattle'; }
  preload() {
    super.preload(); const base = new URL('../assets/', import.meta.url);
    for (const [key, count] of Object.entries(SPRITES)) {
      if (!this.cache.json.exists(key)) this.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    for (const key of ['snd_shock', 'snd_dumbvictory', 'snd_wrongvictory', 'snd_bell']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
    if (!this.cache.audio.exists(this.musicKey)) this.load.audio(this.musicKey, new URL(`sounds/${this.musicKey}/${this.musicKey}.ogg`, base).href);
  }
  loadBattleData() { super.loadBattleData(); return { battleDialogue: { intro: [text.scr_battlegroup_687] } }; }
  setupEnemy() {
    this.q = 0; this.quizElapsed = 0; this.quizFrames = 0; this.extraLetters = 0; this.quizObjects = [];
    this.enemy.setVisible(false); this.body = this.sprite('spr_mettatonb', 158, 95); this.arms = this.sprite('spr_mettatonb_arms2', 158, 95);
    this.helper = this.sprite('spr_alphyshelper', 206, 63); this.helperPose = 'spr_alphyshelper'; this.armPose = 'spr_mettatonb_arms2';
    this.bodyX = 158; this.bodyAngle = 0; this.bodySine = 0;
    this.previousScene.hotlandMusic?.pause();
    this.events.once('shutdown', () => { if (this.previousScene.hotlandMusic?.isPaused) this.previousScene.hotlandMusic.resume(); });
  }
  async create() { await super.create(); if (window.__remake.phase !== 'error') this.music.setVolume(.9); }
  sprite(key, x, y) { const d = this.cache.json.get(key); return this.add.image(x, y, `${key}:0`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height); }
  pose(image, key, frame = 0) {
    const d = this.cache.json.get(key); image.setTexture(`${key}:${Math.floor(frame) % d.TextureCount}`).setOrigin(d.OriginX / d.Width, d.OriginY / d.Height);
  }
  animateEnemy() {}
  spareable() { return false; }
  choose(kind, items) { super.choose(kind, kind === 'mercy' ? ['Spare'] : items); }
  updateSubmenu() {
    this.drawSubmenu(); if (this.cancel) { this.toMenu(this.q ? text.obj_questionasker_176 : this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'actTarget') this.choose('act', ['Check', 'Cry']);
    else if (this.kind === 'act') this.showPages(lines('obj_mettatonb_quiz', [this.subIndex ? 524 : 514]), () => this.dummyTurn());
    else if (this.kind === 'fightTarget') this.startFight();
    else if (this.kind === 'item') this.useInventory();
    else if (this.kind === 'mercy') this.dummyTurn();
  }
  updateFight(delta) {
    const hit = fightInput(this, delta, 999); if (!hit) return;
    this.damage = hit.miss ? undefined : 0;
    if (!hit.miss) this.sound.play('snd_damage');
    this.showPages([hit.miss ? '* MISS' : '0'], () => this.dummyTurn());
  }
  bossPages(pages, after, alphys = false) {
    const original = this.message; original.setVisible(false); this.menu.setText('');
    const x = alphys ? 140 : 95, width = alphys ? 165 : 215;
    const bubble = this.add.rectangle(x, 7, width, 106, 0xffffff).setOrigin(0).setDepth(20);
    this.message = this.add.bitmapText(x + 6, 12, 'fnt_maintext', '', 10).setTint(0x000000).setDepth(21).setMaxWidth(width - 12);
    this.showPages(pages, () => { bubble.destroy(); this.message.destroy(); this.message = original; original.setVisible(true); after(); });
  }
  dummyTurn() {
    const speech = [255, 258, 262, 266, 270, 274, 278, 282, 286];
    this.soul.setVisible(false); this.helperPose = 'spr_alphyshelper_lookup';
    if (this.q < speech.length) this.bossPages(lines('obj_mettatonb_quiz', [speech[this.q]]), () => this.beginQuestion(this.q + 1));
    else this.beginQuestion(this.q + 1);
  }
  clearQuiz() { for (const object of this.quizObjects) object.destroy(); this.quizObjects = []; this.answers = []; this.jar = this.zoom = null; this.flies = []; }
  beginQuestion(q) {
    this.clearQuiz(); this.q = q; this.mode = 'quiz'; this.phase = 'waiting'; this.quizTimer = 300; this.questionFrame = 0; this.answer = -1;
    this.waitFrames = delays[q - 1]; this.extraLetters = 0; this.armPose = 'spr_mettatonb_arms1'; this.helperPose = 'spr_alphyshelper_lookup';
    this.message.setText(''); this.menu.setText(''); this.target.setVisible(false); this.bar.setVisible(false);
    this.soul.setPosition(154.5, 155).setVisible(true); this.questionCorrect = correct[q - 1];
    const header = this.add.bitmapText(q === 4 ? 85 : 102.5, q === 4 ? 10 : 25, 'fnt_maintext', text[`mettquiz_q${q}_text`], q === 4 ? 6 : 12).setMaxWidth(q === 4 ? 230 : 215);
    if (q === 4) header.setAngle(-6); this.quizObjects.push(header);
    this.timerLabel = this.add.bitmapText(150, 130, 'fnt_maintext', '', 12).setTint(0xff0000); this.quizObjects.push(this.timerLabel);
    if (q !== 9) for (let i = 0; i < 4; i++) {
      const x = i % 2 ? 180 : 120, y = i < 2 ? 130 : 170;
      const button = this.sprite(`spr_${'abcd'[i]}button`, x, y).setScale(.5).setVisible(false);
      const label = this.add.bitmapText(i % 2 ? x + 30 : x - 10, y, 'fnt_maintext', q === 8 ? '' : text[`mettquiz_q${q}_a${i + 1}`], 12).setVisible(false);
      if (!(i % 2)) label.setOrigin(1, 0);
      if (label.width > 80) label.setScale(80 / label.width, 1);
      this.answers.push({ button, label, x, y }); this.quizObjects.push(button, label);
    }
    if (q === 5) {
      this.jar = this.sprite('spr_flyjar', 140, 60).setScale(1.5).setAlpha(0); this.quizObjects.push(this.jar);
      this.flies = Array.from({ length: 54 }, () => ({ image: this.sprite('spr_jarfly', 155, 75).setAlpha(0), vx: (Math.random() - .5) / 2, vy: (Math.random() - .5) / 2, phase: Math.random() * 12 }));
      for (const fly of this.flies) this.quizObjects.push(fly.image);
    }
    if (q === 6) { this.zoom = this.sprite('spr_mettatonb_shirt', 125, 60).setScale(2).setCrop(33, 51, 20, 15); this.quizObjects.push(this.zoom); }
    if (q === 8) { this.letters = this.add.bitmapText(215.5, 41, 'fnt_maintext', '', 12).setMaxWidth(100); this.quizObjects.push(this.letters); }
  }
  update(time, delta) {
    if (window.__remake.phase !== 'battle' || window.__remake.scene !== this) return;
    this.quizElapsed = Math.min(200, this.quizElapsed + delta);
    while (this.quizElapsed >= 1000 / 30) { this.quizElapsed -= 1000 / 30; this.stepQuiz(); }
    if (!['quiz', 'quizResult', 'quizExit'].includes(this.mode)) super.update(time, delta);
    else { this.confirmPressed = false; this.cancel = false; }
  }
  stepQuiz() {
    this.quizFrames++;
    if (this.mode !== 'quizExit') {
      const target = ['quiz', 'quizResult'].includes(this.mode) ? 55 : 158;
      this.bodyX += Math.max(-10, Math.min(10, target - this.bodyX));
      this.bodySine += Math.sin(this.quizFrames / 3) * 2; this.bodyAngle += this.bodySine;
      this.body.setPosition(this.bodyX + this.bodySine / 2, 95).setAngle(this.bodyAngle);
      this.arms.setPosition(this.body.x, 95 - Math.sin(this.quizFrames / 4) * 2.5).setAngle(this.bodyAngle);
      this.pose(this.arms, this.armPose, this.quizFrames / 6);
    }
    this.pose(this.helper, this.helperPose, this.quizFrames * .08);
    if (this.mode === 'quizExit') { this.stepExit(); return; }
    if (this.mode === 'quizResult') { this.stepResult(); return; }
    if (this.mode !== 'quiz') return;
    this.questionFrame++;
    if (this.q === 9 && this.questionFrame > 60) { this.animeInterruption(); return; }
    if (this.q === 5) {
      const a = Math.min(1, this.questionFrame * .02); this.jar.setAlpha(a);
      for (const fly of this.flies) {
        fly.phase++; fly.image.setAlpha(a); fly.image.x += fly.vx + Math.sin(fly.phase / 4) / 4; fly.image.y += fly.vy + Math.cos(fly.phase / 4) / 4;
        if (fly.image.x < 142 || fly.image.x > 168) fly.vx = -fly.vx;
        if (fly.image.y < 60 || fly.image.y > 98) fly.vy = -fly.vy;
      }
    }
    if (this.phase === 'waiting' && --this.waitFrames <= 0) { this.phase = 'answer'; for (const { button, label } of this.answers) { button.setVisible(true); label.setVisible(true); } }
    if (this.phase !== 'answer') return;
    if (this.q !== 10) this.quizTimer += this.q === 7 ? 1 : -1;
    if (this.q !== 10) this.timerLabel.setText(String(Math.ceil(this.quizTimer / 10)));
    if (this.q === 7) this.helperPose = 'spr_alphyshelper_confused';
    else if (this.quizTimer < 280 && this.q < 9) this.helperPose = `spr_alphyshelper_${'abcd'[this.questionCorrect]}`;
    if (this.q === 8) {
      if (this.quizTimer % 2 === 0) this.extraLetters++;
      this.letters.setText('n'.repeat(this.extraLetters));
      this.answers.forEach(({ label }, i) => label.setText(String(this.extraLetters + [11, 6, 8, 10][i])));
    }
    const input = name => this.keys[name].isDown || [...this.previousScene.touch.values()].some(pointer => pointer.direction === name);
    const speed = this.keys.shift.isDown ? .5 : 2;
    this.soul.x = Math.max(18, Math.min(293, this.soul.x + (input('right') ? speed : 0) - (input('left') ? speed : 0)));
    this.soul.y = Math.max(127, Math.min(184, this.soul.y + (input('down') ? speed : 0) - (input('up') ? speed : 0)));
    const index = this.answers.findIndex(({ x, y }) => this.soul.x + 8 > x && this.soul.x < x + 20 && this.soul.y + 8 > y && this.soul.y < y + 20);
    if (index >= 0) this.answerQuestion(index);
    else if (this.quizTimer <= 0) this.answerQuestion(-1);
  }
  answerQuestion(index) {
    if (this.mode !== 'quiz' || this.phase !== 'answer') return;
    this.answer = this.q === 7 && index >= 0 ? 5 : index; this.wrong = this.q !== 10 && this.answer !== this.questionCorrect;
    this.mode = 'quizResult'; this.resultFrame = 0; this.soul.setVisible(false); this.timerLabel.setText('');
    for (const [i, { button, label }] of this.answers.entries()) { button.setVisible(false); label.setTint(i === index ? this.wrong ? 0xff0000 : 0x00ff00 : 0xffff00); }
    if (this.q === 10) { this.sound.play('snd_bell'); return; }
    this.armPose = this.wrong ? 'spr_mettatonb_arms4' : 'spr_mettatonb_arms3';
    this.helperPose = this.q === 7 && !this.wrong ? 'spr_alphyshelper_confused' : this.wrong ? 'spr_alphyshelper_shock' : 'spr_alphyshelper_thumbsup';
    this.sound.play(this.wrong ? 'snd_shock' : this.q === 7 ? 'snd_wrongvictory' : 'snd_dumbvictory');
    const id = this.wrong ? [130, 132, 134, 136, 138, 140, 142, 144][this.q - 1] : 151 + (this.q - 1) * 2;
    this.reaction = this.add.bitmapText(102, 40, 'fnt_maintext', text[`obj_questionasker_${id}`], 12).setMaxWidth(210); this.quizObjects.push(this.reaction);
  }
  stepResult() {
    this.resultFrame++;
    if (this.q === 10) { if (this.resultFrame >= 30) this.finalAnswer(); return; }
    if (this.wrong && this.resultFrame === 44) {
      this.hp = Math.max(1, this.hp - Math.ceil(this.hp / 2)); this.refreshHp(); this.sound.play('snd_hurt1'); this.cameras.main.shake(100, .006);
      if (this.hp <= 1) this.q = 8;
    }
    if (this.resultFrame >= 70) { this.clearQuiz(); this.turn++; this.helperPose = 'spr_alphyshelper'; this.armPose = 'spr_mettatonb_arms2'; this.toMenu(text.obj_questionasker_176); }
  }
  animeInterruption() {
    this.clearQuiz(); this.soul.setVisible(false); this.helperPose = 'spr_alphyshelper_tooexcited';
    this.bossPages(lines('obj_questionasker', range(538, 543)), () => {
      this.helperPose = 'spr_alphyshelper_excited2';
      this.bossPages(lines('obj_questionasker', range(566, 570)), () => { this.helperPose = 'spr_alphyshelper_shock2'; this.beginQuestion(10); });
    }, true);
  }
  finalAnswer() {
    this.clearQuiz(); this.helperPose = this.answer === 2 ? 'spr_alphyshelper_confused' : this.answer === 3 ? 'spr_alphyshelper_thumbsup' : 'spr_alphyshelper_shockembarrass';
    const ids = this.answer === 0 ? [...range(607, 610), ...range(613, 616)] : this.answer === 1 ? range(624, 634) : this.answer === 2 ? range(642, 651) : range(657, 666);
    this.bossPages(lines('obj_questionasker', ids), () => {
      if (this.answer !== 3) { this.outro(); return; }
      this.helperPose = 'spr_alphyshelper';
      this.bossPages(lines('obj_questionasker', range(691, 693)), () => {
        this.helperPose = 'spr_alphyshelper_embarrass';
        this.bossPages(lines('obj_questionasker', range(704, 707)), () => {
          this.music.pause(); this.mode = 'quizExit'; this.exitStage = 'silence'; this.exitTimer = 150;
        });
      }, true);
    });
  }
  outro() { this.armPose = 'spr_mettatonb_arms2'; this.helperPose = 'spr_alphyshelper'; this.bossPages(lines('obj_questionasker', range(745, 755)), () => { this.mode = 'quizExit'; this.exitStage = 'arms'; this.exitTimer = 30; }); }
  stepExit() {
    this.exitTimer--;
    if (this.exitStage === 'silence' && this.exitTimer <= 0) { this.music.resume(); this.bossPages(lines('obj_questionasker', [725]), () => this.outro()); }
    else if (this.exitStage === 'arms') { this.arms.setVisible(false); this.pose(this.body, 'spr_mettatonb_armsin', (30 - this.exitTimer) * .25); if (this.exitTimer <= 0) { this.exitStage = 'rocket'; this.exitTimer = 60; this.rocketSpeed = 0; } }
    else if (this.exitStage === 'rocket') {
      this.rocketSpeed -= .2; this.body.y += this.rocketSpeed; this.pose(this.body, 'spr_mettatonb_rocketoff', this.quizFrames * .334);
      if (this.exitTimer <= 0) { this.previousScene.flags[20] = 0; this.finishBattle(); }
    }
  }
}
