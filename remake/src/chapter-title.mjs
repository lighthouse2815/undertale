import { Scene } from '../vendor/phaser.esm.min.js';
import { registerBitmapFont } from './fonts.mjs';

// room_undertale: ba mốc 150 frame, không có phím bỏ qua trong bản gốc.
export class ChapterTitle extends Scene {
  constructor() { super('ChapterTitle'); }

  init({ world }) { this.world = world; }

  preload() {
    const base = new URL('../assets/', import.meta.url);
    if (!this.cache.bitmapFont.exists('fnt_main')) {
      this.load.json('fnt_main', new URL('fonts/fnt_main/fnt_main.json', base).href);
      this.load.image('fnt_main', new URL('fonts/fnt_main/fnt_main.png', base).href);
    }
    if (!this.cache.audio.exists('mus_intronoise')) this.load.audio('mus_intronoise', new URL('sounds/mus_intronoise/mus_intronoise.ogg', base).href);
    this.loadError = null;
    this.onLoadError = (file) => { this.loadError = new Error(`Không tải được tài nguyên ${file.key}.`); };
    this.load.on('loaderror', this.onLoadError);
    this.events.once('shutdown', () => this.load.off('loaderror', this.onLoadError));
  }

  create() {
    this.load.off('loaderror', this.onLoadError);
    if (this.loadError) { this.fail(this.loadError); return; }
    if (!this.cache.bitmapFont.exists('fnt_main')) registerBitmapFont(this, 'fnt_main', this.cache.json.get('fnt_main'));
    this.logo = this.add.image(0, 0, 'title').setOrigin(0);
    this.credit = this.add.bitmapText(90, 90, 'fnt_main', 'By Toby Fox', 24).setVisible(false);
    this.noise = this.sound.add('mus_intronoise'); this.noise.play();
    this.events.once('shutdown', () => this.noise.destroy());
    this.elapsed = 0; this.frames = 0; this.con = 0;
    Object.assign(window.__remake, { phase: 'chapterTitle', room: 'room_undertale', scene: this });
  }

  update(_time, delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
  }

  step() {
    if (this.con >= 3) return;
    if (++this.frames % 150) return;
    this.con++;
    this.logo.setVisible(false); this.credit.setVisible(this.con === 1);
    if (this.con < 3) this.noise.play();
    else this.enterSnowdin().catch((error) => this.fail(error));
  }

  async enterSnowdin() {
    const world = this.world;
    world.phone = [206]; world.player.facing = 'r';
    await world.openRoom('room_tundra1', 'obj_markerA');
    world.cameras.main.fadeIn(1000 / 30 / .08);
    world.scene.wake(); this.scene.stop();
  }

  fail(error) {
    Object.assign(window.__remake, { phase: 'error', error: error.message });
    const status = document.getElementById('status'); status.hidden = false; status.textContent = error.message;
    console.error(error);
  }
}
