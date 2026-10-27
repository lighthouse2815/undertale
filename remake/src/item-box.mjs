import { Scene } from '../vendor/phaser.esm.min.js';
import { registerBitmapFont } from './fonts.mjs';

// obj_itemswapper: 8 ô mang theo, 10 ô BOX tại flag 300–309 (chung với SAVE).
export class ItemBox extends Scene {
  constructor() { super('ItemBox'); }

  preload() {
    const base = new URL('../assets/', import.meta.url);
    if (!this.cache.bitmapFont.exists('fnt_maintext')) {
      this.load.json('fnt_maintext', new URL('fonts/fnt_maintext/fnt_maintext.json', base).href);
      this.load.image('fnt_maintext', new URL('fonts/fnt_maintext/fnt_maintext.png', base).href);
    }
    if (!this.textures.exists('spr_heartsmall:0')) this.load.image('spr_heartsmall:0', new URL('sprites/spr_heartsmall/spr_heartsmall_0.png', base).href);
    if (!this.cache.json.exists('inventory')) this.load.json('inventory', new URL('./inventory.json', import.meta.url).href);
    if (!this.cache.json.exists('box-road')) this.load.json('box-road', new URL('./box-road.json', import.meta.url).href);
    this.loadError = null; this.onLoadError = (file) => { this.loadError = new Error(`Không tải được tài nguyên ${file.key}.`); };
    this.load.on('loaderror', this.onLoadError);
    this.events.once('shutdown', () => this.load.off('loaderror', this.onLoadError));
  }

  create() {
    this.load.off('loaderror', this.onLoadError);
    if (this.loadError) {
      Object.assign(window.__remake, { phase: 'error', error: this.loadError.message });
      const status = document.getElementById('status'); status.hidden = false; status.textContent = this.loadError.message; return;
    }
    if (!this.cache.bitmapFont.exists('fnt_maintext')) registerBitmapFont(this, 'fnt_maintext', this.cache.json.get('fnt_maintext'));
    this.world = this.game.scene.getScene('World'); this.column = 0; this.row = 0;
    this.items = this.cache.json.get('inventory').items; this.text = this.cache.json.get('box-road').box;
    this.readyAt = this.time.now + 7 * 1000 / 30; this.visibleAt = this.time.now + 4 * 1000 / 30;
    this.onKey = (event) => { if (!event.repeat && this.time.now >= this.visibleAt) this.key(event.code); };
    window.addEventListener('keydown', this.onKey);
    this.events.once('shutdown', () => window.removeEventListener('keydown', this.onKey));
    this.time.delayedCall(4 * 1000 / 30, () => this.draw());
    Object.assign(window.__remake, { phase: 'itemBox', scene: this });
  }

  draw() {
    this.children.removeAll(true);
    this.add.rectangle(8, 8, 304, 220, 0xffffff).setOrigin(0);
    this.add.rectangle(11, 11, 298, 214, 0x000000).setOrigin(0);
    this.add.bitmapText(84, 15, 'fnt_maintext', this.text.inventory, 12).setOrigin(.5, 0);
    this.add.bitmapText(235, 15, 'fnt_maintext', this.text.title, 12).setOrigin(.5, 0);
    this.add.rectangle(160, 46, 2, 150, 0xffffff).setOrigin(0);
    for (const column of [0, 1]) for (let row = 0; row < (column ? 10 : 8); row++) {
      const id = column ? this.world.flags[300 + row] : this.world.inventory[row];
      const x = column ? 185 : 34, y = 36 + row * 16;
      if (id) this.add.bitmapText(x, y, 'fnt_maintext', this.items[id].name, 12);
      else this.add.rectangle(x + 5, y + 10, 90, 1, 0xff0000).setOrigin(0);
    }
    this.add.bitmapText(100, 203, 'fnt_maintext', this.text.close, 12);
    this.add.image(this.column ? 171 : 20, 41 + this.row * 16, 'spr_heartsmall:0').setOrigin(0);
  }

  key(code) {
    if (['KeyX', 'ShiftLeft', 'ShiftRight'].includes(code)) { this.close(); return; }
    if (code === 'ArrowRight') this.column = 1;
    if (code === 'ArrowLeft') { this.column = 0; this.row = Math.min(7, this.row); }
    if (code === 'ArrowUp') this.row = Math.max(0, this.row - 1);
    if (code === 'ArrowDown') this.row = Math.min(this.column ? 9 : 7, this.row + 1);
    if (['KeyZ', 'Enter'].includes(code) && this.time.now >= this.readyAt) this.transfer();
    this.draw();
  }

  transfer() {
    const world = this.world;
    if (this.column === 0) {
      const id = world.inventory[this.row]; if (!id) return;
      const slot = Array.from({ length: 10 }, (_, i) => i).find((i) => !world.flags[300 + i]);
      if (slot === undefined) return;
      world.flags[300 + slot] = id; world.inventory.splice(this.row, 1);
    } else {
      const id = world.flags[300 + this.row]; if (!id || world.inventory.length >= 8) return;
      world.inventory.push(id);
      for (let i = this.row; i < 9; i++) world.flags[300 + i] = world.flags[301 + i] ?? 0;
      world.flags[309] = 0;
    }
  }

  close() {
    this.world.release(); this.world.confirmDown = false; this.world.confirmPressed = false; this.world.confirmWasDown = false;
    this.world.interactionCooldown = 250; this.scene.stop();
    Object.assign(window.__remake, { phase: 'running', scene: this.world });
  }
}
