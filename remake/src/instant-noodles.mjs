import text from './instant-noodles.json' with { type: 'json' };

// obj_instantnoodleitem: typer 1, mỗi ký tự một frame; ^n đợi n*10 frame.
export class InstantNoodles {
  constructor(scene) {
    this.scene = scene; this.world = scene.previousScene; this.page = 0; this.index = 0; this.content = ''; this.delay = 1; this.elapsed = 0; this.ready = false;
    this.world.inventory.splice(scene.subIndex, 1); this.world.flags[21] = 1;
    scene.mode = 'noodles'; scene.menu.setText(''); scene.message.setText(''); scene.target.setVisible(false); scene.bar.setVisible(false);
    scene.events.once('shutdown', () => this.destroy());
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30 && !this.ready) { this.elapsed -= 1000 / 30; this.step(); }
    if (this.ready && this.scene.confirmPressed) this.advance();
  }
  step() {
    if (this.ready || --this.delay > 0) return;
    const source = text.pages[this.page]; this.delay = 1;
    if (this.index >= source.length) { this.ready = true; return; }
    let ch = source[this.index++];
    while (ch === '^' || ch === '&') {
      if (ch === '^') { this.delay = Number(source[this.index++]) * 10; }
      else this.content += '\n';
      ch = source[this.index++];
    }
    if (ch) this.content += ch;
    this.scene.message.setText(this.content);
  }
  advance() {
    if (!this.ready) return;
    this.page++;
    if (this.page === 3 && this.scene.music?.isPlaying) { this.pausedMusic = this.scene.music; this.pausedMusic.pause(); }
    if (this.page < text.pages.length) { this.index = 0; this.content = ''; this.ready = false; this.delay = 1; this.elapsed = 0; this.scene.message.setText(''); return; }
    this.destroy(); this.scene.noodles = null;
    const s = this.scene, data = s.cache.json.get('inventory');
    if (s.hp < s.maxHp) s.hp = Math.min(s.maxHp, s.hp + 4);
    this.world.flags[260] = 1; s.hpText.setText(`${this.world.game.registry.get('charname')}  LV ${this.world.lv}     HP ${s.hp}/${s.maxHp}`);
    s.sound.play('snd_swallow'); s.time.delayedCall(10 * 1000 / 30, () => s.sound.play('snd_power'));
    s.showPages([text.ate + ' \n' + (s.hp >= s.maxHp ? data.maxed : data.recover.replace(/\\\[1\]/g, '4'))], () => s.dummyTurn());
  }
  destroy() { this.world.flags[21] = 0; if (this.pausedMusic === this.scene.music && this.pausedMusic?.isPaused) this.pausedMusic.resume(); this.pausedMusic = null; }
}
