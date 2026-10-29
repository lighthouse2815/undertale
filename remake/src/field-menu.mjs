import { Scene } from '../vendor/phaser.esm.min.js';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { callToriel } from './phone.mjs';
import { itemAction, itemNames } from './inventory.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';

// obj_overworldcontroller: menuno 0 (chính), 2 (STAT), 3 (CELL).
export class FieldMenu extends Scene {
  constructor() { super('FieldMenu'); }

  preload() {
    const base = new URL('../assets/', import.meta.url);
    this.loadError = null;
    this.onLoadError = (file) => { this.loadError = new Error(`Không tải được tài nguyên ${file.key}.`); };
    this.load.on('loaderror', this.onLoadError);
    this.events.once('shutdown', () => this.load.off('loaderror', this.onLoadError));
    for (const key of ['fnt_maintext', 'fnt_small']) if (!this.cache.bitmapFont.exists(key)) {
      this.load.json(key, new URL(`fonts/${key}/${key}.json`, base).href);
      this.load.image(key, new URL(`fonts/${key}/${key}.png`, base).href);
    }
    for (const key of ['spr_heartsmall', 'spr_face_torielhappytalk', 'spr_face_torieltalkside', 'spr_face_torielembarrassed', 'spr_punchcard']) {
      if (!this.textures.exists(`${key}:0`)) this.load.image(`${key}:0`, new URL(`sprites/${key}/${key}_0.png`, base).href);
    }
    for (const key of ['snd_squeak', 'snd_select', 'snd_phone', 'snd_power', 'snd_swallow', 'snd_spooky', 'snd_item', 'snd_dogresidue', 'snd_speedup', 'snd_dimbox']) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
    if (!this.cache.json.exists('inventory')) this.load.json('inventory', new URL('./inventory.json', import.meta.url).href);
    if (!this.cache.json.exists('phone-dialogue')) this.load.json('phone-dialogue', new URL('./phone.json', import.meta.url).href);
  }

  create() {
    const state = window.__remake;
    this.load.off('loaderror', this.onLoadError);
    if (this.loadError) {
      state.error = this.loadError.message; state.phase = 'error';
      const status = document.getElementById('status'); status.hidden = false; status.textContent = state.error;
      return;
    }
    for (const key of ['fnt_maintext', 'fnt_small']) if (!this.cache.bitmapFont.exists(key)) registerBitmapFont(this, key, this.cache.json.get(key));
    colorBitmapFont(this, 'fnt_maintext', 'yellow', '#ffff00');
    colorBitmapFont(this, 'fnt_maintext', 'gray', '#808080');
    this.world = this.game.scene.getScene('World');
    this.text = this.cache.json.get('phone-dialogue');
    this.items = this.cache.json.get('inventory');
    this.itemSelection = 0; this.actionSelection = 0;
    this.mode = 'main'; this.selection = this.world.menuSelection ?? 0; this.phoneSelection = 0;
    if (!this.world.phone.length && this.selection === 2) this.selection = 1;
    this.sound.play('snd_squeak');
    this.draw();
    this.onKey = (event) => { if (!event.repeat) this.key(event.code); };
    window.addEventListener('keydown', this.onKey);
    this.events.once('shutdown', () => window.removeEventListener('keydown', this.onKey));
    state.phase = 'menu'; state.scene = this;
  }

  label(x, y, text, font = 'fnt_maintext', size = 12) { return this.add.bitmapText(x, y, font, text, size); }

  box(x, y, width, height) {
    this.add.rectangle(x, y, width, height, 0xffffff).setOrigin(0);
    this.add.rectangle(x + 3, y + 3, width - 6, height - 6, 0x000000).setOrigin(0);
  }

  draw() {
    this.children.removeAll(true);
    const world = this.world;
    const headerY = world.player.y - world.cameras.main.scrollY > 130 ? 145 : 10;
    this.box(16, 16 + headerY, 70, 54); this.box(16, 84, 70, 73);
    this.label(23, 20 + headerY, this.game.registry.get('charname'));
    for (const [index, [name, value]] of [['LV', world.lv], ['HP', `${world.hp}/${world.maxHp}`], ['G', world.gold]].entries()) {
      this.label(23, 40 + headerY + index * 9, name, 'fnt_small', 6);
      this.label(41, 40 + headerY + index * 9, String(value), 'fnt_small', 6);
    }
    this.label(42, 94, this.text.labels.field_menu_item, world.inventory.length ? 'fnt_maintext' : 'fnt_maintext:gray');
    this.label(42, 112, this.text.labels.field_menu_stat);
    if (world.phone.length) this.label(42, 130, this.text.labels.field_menu_cell);
    if (this.mode === 'main') this.heart = this.add.image(28, 98 + 18 * this.selection, 'spr_heartsmall:0').setOrigin(0);
    if (this.mode === 'phone') {
      this.box(94, 26, 172, 134);
      for (const [index, id] of world.phone.entries()) this.label(116, 40 + index * 16, this.text.phoneNames[id]);
      this.heart = this.add.image(104, 44 + 16 * this.phoneSelection, 'spr_heartsmall:0').setOrigin(0);
    }
    if (['items', 'action'].includes(this.mode)) {
      this.box(94, 26, 172, 180);
      for (const [index, name] of itemNames(world, this.items).entries()) this.label(116, 40 + index * 16, name);
      for (const [index, x] of [116, 164, 221].entries()) this.label(x, 180, this.items.actions[index]);
      this.heart = this.add.image(this.mode === 'items' ? 104 : [104, 152, 209][this.actionSelection],
        this.mode === 'items' ? 44 + 16 * this.itemSelection : 184, 'spr_heartsmall:0').setOrigin(0);
    }
    if (this.mode === 'stat') this.drawStats();
  }

  drawStats() {
    const world = this.world;
    this.box(94, 26, 172, 208);
    const format = (key, ...args) => this.text.labels[`stat_menu_${key}`].replace(/\\\[([12CG])\]/g,
      (_match, variable) => variable === 'C' ? this.game.registry.get('charname') : variable === 'G' ? String(world.gold) : String(args[Number(variable) - 1]));
    const at = world.lv === 20 ? 89 : world.lv * 2 - 2;
    const df = world.lv === 20 ? 89 : Math.ceil(world.lv / 4) - 1;
    const next = world.lv >= 20 ? 0 : LEVEL_THRESHOLDS[world.lv] - world.xp;
    this.statValues = { at, df, xp: world.xp, next, hp: world.hp, maxHp: world.maxHp, gold: world.gold };
    for (const [key, x, y, args] of [
      ['name', 108, 42, []], ['lv', 108, 72, [world.lv]], ['hp', 108, 88, [world.hp, world.maxHp]],
      ['at', 108, 120, [at, world.weaponStrength]], ['df', 108, 136, [df, world.armorDefense]], ['exp', 192, 120, [world.xp]], ['next', 192, 136, [next]],
      ['weapon', 108, 166, [this.items.items[world.weapon].name]], ['armor', 108, 182, [this.items.items[world.armor].name]], ['gold', 108, 202, []],
    ]) this.label(x, y, format(key, ...args));
    if (world.kills > 20) this.label(192, 202, format('kills', world.kills));
  }

  key(code) {
    if (this.mode === 'card') { if (this.time.now >= this.cardReadyAt && ['KeyZ','Enter','KeyX','ShiftLeft','ShiftRight'].includes(code)) this.close(); return; }
    const cancel = ['KeyX', 'ShiftLeft', 'ShiftRight'].includes(code);
    const menu = ['KeyC', 'ControlLeft', 'ControlRight'].includes(code);
    if (cancel || (menu && this.mode === 'main')) {
      if (this.mode === 'main') this.close();
      else { this.mode = this.mode === 'action' ? 'items' : 'main'; this.draw(); }
    } else if (['ArrowUp', 'ArrowDown'].includes(code)) {
      const direction = code === 'ArrowUp' ? -1 : 1;
      if (this.mode === 'main') {
        const next = Math.max(0, Math.min(this.world.phone.length ? 2 : 1, this.selection + direction));
        if (next !== this.selection) { this.selection = next; this.sound.play('snd_squeak'); this.draw(); }
      } else if (['phone', 'items'].includes(this.mode)) {
        const field = this.mode === 'phone' ? 'phoneSelection' : 'itemSelection';
        const count = this.mode === 'phone' ? this.world.phone.length : this.world.inventory.length;
        const next = Math.max(0, Math.min(count - 1, this[field] + direction));
        if (next !== this[field]) { this[field] = next; this.sound.play('snd_squeak'); this.draw(); }
      }
    } else if (['ArrowLeft', 'ArrowRight'].includes(code) && this.mode === 'action') {
      const next = Math.max(0, Math.min(2, this.actionSelection + (code === 'ArrowLeft' ? -1 : 1)));
      if (next !== this.actionSelection) { this.actionSelection = next; this.sound.play('snd_squeak'); this.draw(); }
    } else if (['KeyZ', 'Enter'].includes(code)) {
      if (this.mode === 'phone') {
        const id = this.world.phone[this.phoneSelection];
        this.close();
        if (id === 220 || id === 221) {
          if (this.world.dataSource.name === 'room_water_dogroom') this.world.showDialogue([this.text.boxUnavailable]);
          else {
            this.world.phone.splice(this.world.phone.indexOf(id), 1); this.world.phone.unshift(id);
            this.sound.play('snd_dimbox'); this.world.scene.launch('ItemBox', { boxBase: id === 220 ? 300 : 312 });
            window.__remake.phase = 'loadingBox';
          }
        } else callToriel(this.world, id, this.text);
      } else if (this.mode === 'action') {
        const action = ['use', 'info', 'drop'][this.actionSelection];
        const id = this.world.inventory[this.itemSelection];
        const portrait = [56, 57].includes(id) && this.world.snowdinTownUndyne?.actor && (action === 'use' || id === 56 && action === 'drop') ? 'spr_face_undyne1' : false;
        if (id === 26 && action === 'use') { this.mode = 'card'; this.cardReadyAt = this.time.now + 200; this.children.removeAll(true); this.add.image(0,0,'spr_punchcard:0').setOrigin(0); return; }
        this.close(); this.world.showDialogue(itemAction(this.world, this.itemSelection, action, this.items), { portrait, onClose: id === 27 && action === 'use' ? () => this.world.waterfallDogRoom?.deploy() : undefined });
      } else if (this.mode === 'items') {
        this.mode = 'action'; this.actionSelection = 0; this.sound.play('snd_select'); this.draw();
      } else if (this.mode === 'main' && (this.selection !== 0 || this.world.inventory.length)) {
        this.mode = ['items', 'stat', 'phone'][this.selection]; this.phoneSelection = 0; this.itemSelection = 0;
        this.sound.play('snd_select'); this.draw();
      }
    }
  }

  close() {
    this.world.menuSelection = this.selection;
    this.world.release();
    this.world.confirmDown = false; this.world.confirmPressed = false; this.world.confirmWasDown = false;
    this.world.menuPressed = false; this.world.interactionCooldown = 250;
    this.scene.stop();
    window.__remake.phase = 'running'; window.__remake.scene = this.world;
  }
}
