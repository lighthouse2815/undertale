import data from './hard-mode-end.json' with { type: 'json' };

// obj_torboss_2ndtime: đoạn kết Hard Mode, chó/Toriel/Flowey và màn đen cuối.
export class HardModeEnd {
  constructor(scene, killed) {
    this.scene = scene; this.frames = 0; this.elapsed = 0; this.index = 0; this.emotion = 0;
    scene.music.stop(); scene.soul.setVisible(false); scene.target.setVisible(false); scene.bar.setVisible(false);
    scene.buttons.forEach((image) => image.setVisible(false)); scene.arena.setVisible(false); scene.hpText.setVisible(false);
    scene.message.setText(''); scene.menu.setText(''); scene.enemy.setTexture(killed ? 'spr_torielboss_kneel:0' : 'spr_torielboss_side:0');
    this.toriel = scene.enemy; this.torielFace = scene.add.image(149, killed ? 50 : 25, 'spr_torweird:0').setOrigin(0);
    this.dog = scene.add.image(320, 120, 'spr_tobdogl:0').setOrigin(0); this.dog.y -= scene.cache.json.get('spr_tobdogl').Height;
    this.dogVelocity = -1; this.dogTalking = false;
    this.music = scene.sound.add('mus_dogsong', { loop: true, volume: .6 }); this.music.play(); scene.previousScene.flags[20] = 0;
    this.stage = 'dogEntering';
    this.steps = [
      { wait: 50 }, { speaker: 'dog', text: 153, complete: true }, { wait: 20 },
      { speaker: 'toriel', text: 175 }, { speaker: 'dog', text: 192 }, { speaker: 'toriel', text: 211, flag: 1 }, { speaker: 'dog', text: 224 },
      { wait: 50 }, { wait: 50, side: true }, { speaker: 'dog', text: 264, flag: 0 }, { speaker: 'toriel', text: 280 },
      { speaker: 'dog', text: 293 }, { speaker: 'toriel', text: 308 }, { speaker: 'dog', text: 324 },
      { wait: 90 }, { wait: 180, torielVelocity: -1.5 }, { speaker: 'dog', text: 360 },
      { speaker: 'toriel', text: 377, dogVelocity: -2 }, { speaker: 'dog', text: 400 }, { speaker: 'toriel', text: 415 }, { speaker: 'dog', text: 429 },
      { wait: 210, silence: true, dogVelocity: -2, exiting: true },
      { wait: 90, title: 1 }, { wait: 90, title: 2 }, { wait: 90, title: 3 }, { wait: 90, title: 4 }, { wait: 600, title: 5 },
      { wait: 90, flower: 'rise' }, { speaker: 'flowey', text: 512 }, { wait: 150 }, { speaker: 'flowey', text: 544 },
      { speaker: 'toriel', text: 558 }, { wait: 30 }, { speaker: 'flowey', text: 578 }, { speaker: 'dog', text: 595 },
      { wait: 120 }, { wait: 180, flower: 'sink' }, { wait: 181, fade: true },
    ];
  }

  next() {
    this.closeSpeech();
    const scene = this.scene, step = this.steps[this.index++];
    if (!step) {
      scene.children.removeAll(true); this.stage = 'complete'; window.__remake.phase = 'hardEnd'; window.__remake.room = 'room_emptyblack'; return;
    }
    if (step.side) { this.toriel.setTexture('spr_torielside1:0'); this.torielFace.y = this.toriel.y + 4; }
    if (step.complete) localStorage.setItem('undertale-remake-hard-complete', '1');
    if (step.flag !== undefined) scene.previousScene.flags[20] = step.flag;
    if (step.dogVelocity !== undefined) this.dogVelocity = step.dogVelocity;
    if (step.torielVelocity !== undefined) this.torielVelocity = step.torielVelocity;
    if (step.exiting) this.dogExiting = true;
    if (step.silence) this.music.stop();
    if (step.title) this.drawTitle(step.title);
    if (step.flower) {
      this.flowerStage = step.flower; this.flowerFrame = step.flower === 'rise' ? 0 : 8;
      if (!this.flower) {
        this.flower = scene.add.image(140, 170, 'spr_flowey_riseanim:0').setOrigin(0).setDepth(50000);
        this.flowerFace = scene.add.image(140, 170, 'spr_floweyface_l3:0').setOrigin(0).setDepth(50001).setVisible(false);
      }
    }
    if (step.fade) { this.fade = scene.add.rectangle(0, 0, 320, 240, 0).setOrigin(0).setDepth(99999).setAlpha(0); }
    this.wait = step.wait ?? 0; this.stage = this.wait ? 'waiting' : 'speech';
    if (step.text) {
      this.speaker = step.speaker; this.pages = data.speech[step.text]; this.pageIndex = 0; this.dogTalking = step.speaker === 'dog';
      const x = step.speaker === 'toriel' ? this.toriel.x < 0 ? 0 : 185 : step.speaker === 'flowey' ? 185 : this.dog.x < 180 ? 115 : 200;
      const y = step.speaker === 'flowey' ? 150 : step.speaker === 'dog' ? Math.max(0, this.dog.y - 60) : 40;
      this.box = scene.add.image(x, y, `${step.speaker === 'dog' ? 'spr_blconabove' : 'spr_blconwdshrt'}:0`).setOrigin(0).setScale(.5).setDepth(60000);
      this.writer = scene.add.bitmapText(x + (step.speaker === 'dog' ? 8 : 18), y + 5, 'fnt_plain:black', '', 6).setDepth(60001);
      this.showPage();
    }
  }

  showPage() {
    const page = this.pages[this.pageIndex]; this.writer.setText(page.text);
    if (page.emotion !== null) this.emotion = page.emotion;
    if (this.speaker === 'flowey') this.flowerFace.setTexture(`spr_floweyface_l3:${this.emotion}`).setVisible(true);
    else this.torielFace.setTexture(`spr_torweird:${Math.min(data.sprites.spr_torweird - 1, this.emotion)}`);
  }
  closeSpeech() { this.box?.destroy(); this.writer?.destroy(); this.box = null; this.writer = null; this.dogTalking = false; }

  drawTitle(stage) {
    const scene = this.scene;
    if (stage === 1) {
      this.black = scene.add.rectangle(0, 0, 320, 240, 0).setOrigin(0).setDepth(40000);
      scene.add.image(0, -30, 'spr_undertaletitle:0').setOrigin(0).setDepth(40001);
      scene.sound.play('mus_intronoise');
    } else {
      scene.sound.play('mus_mode', { volume: 1 - stage * .1, rate: [0, 0, 1, 1.2, 1.6, 2.2][stage] });
      const label = scene.add.bitmapText(160, [0, 0, 70, 115, 135, 152.5][stage], `fnt_maintext:${stage === 2 ? 'red' : 'yellow'}`, data.title[stage - 2], [0, 0, 36, 18, 12, 6][stage]).setOrigin(.5, 0).setDepth(40002);
      if (stage === 2) label.setAngle(20);
    }
  }

  step() {
    this.frames++;
    this.dog.x += this.dogVelocity;
    if (this.torielVelocity) { this.toriel.x += this.torielVelocity; this.torielFace.x = this.toriel.x + 24; }
    if (this.stage === 'dogEntering' && this.dog.x < 240) { this.dogVelocity = 0; this.dog.setTexture('spr_tobdogl_talk:0'); this.next(); }
    if (!this.dogExiting && this.dog.x <= 160) this.dogVelocity = 0;
    const dogSprite = this.dogVelocity ? 'spr_tobdogl' : 'spr_tobdogl_talk';
    this.dog.setTexture(`${dogSprite}:${this.dogVelocity || this.dogTalking ? Math.floor(this.frames * .2) % data.sprites[dogSprite] : 0}`);
    if (this.flowerStage === 'rise') {
      this.flowerFrame = Math.min(8, this.flowerFrame + .5); this.flower.setTexture(`spr_flowey_riseanim:${Math.floor(this.flowerFrame)}`);
      if (this.flowerFrame === 8) { this.flowerStage = 'idle'; this.flowerFace.setVisible(true); }
    } else if (this.flowerStage === 'sink') {
      this.flowerFrame = Math.max(0, this.flowerFrame - .5); this.flowerFace.setVisible(false);
      this.flower.setTexture(`spr_flowey_riseanim:${Math.floor(this.flowerFrame)}`);
      if (this.flowerFrame === 0) { this.flowerStage = 'gone'; this.flower.setVisible(false); }
    }
    if (this.fade) this.fade.alpha = Math.min(1, this.fade.alpha + .01);
    if (this.stage === 'waiting' && --this.wait <= 0) this.next();
  }

  update(delta) {
    if (this.stage === 'speech' && this.scene.confirmPressed) {
      if (++this.pageIndex < this.pages.length) this.showPage(); else this.next();
    }
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30 && this.stage !== 'complete') { this.elapsed -= 1000 / 30; this.step(); }
    this.scene.confirmPressed = false; this.scene.cancel = false;
  }
  destroy() { this.music.destroy(); this.closeSpeech(); }
}
