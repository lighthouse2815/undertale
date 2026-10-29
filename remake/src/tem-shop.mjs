import { WaterfallShop } from './waterfall-shop.mjs';
import { registerBitmapFont } from './fonts.mjs';
import { addItem } from './inventory.mjs';
import { murderLevel } from './route.mjs';
import { startTemVillageMusic } from './waterfall-tem-village.mjs';
import { temArmorPrice, temFirstOffer, temSecondOffer, temSellValue } from './tem-shop-rules.mjs';
import data from './tem-shop-dialogue.json' with { type: 'json' };
import inventory from './inventory.json' with { type: 'json' };

const lines = (...ids) => ids.map(id => data[`obj_shop5_${id}`]);

// obj_shop5: mua, bán, trả tiền học và thương lượng giá.
export class TemShop extends WaterfallShop {
  constructor() { super('TemShop'); }
  preload() {
    const base = new URL('../assets/', import.meta.url);
    if (!this.textures.exists('bg_temshop')) this.load.image('bg_temshop', new URL('backgrounds/bg_temshop/bg_temshop.png', base).href);
    for (const [key, count] of [['spr_5_tembody', 1], ['spr_5_tembrows', 1], ['spr_5_eyes1', 2], ['spr_5_mouth1', 2], ['spr_5_coffeeline', 2], ['spr_heartsmall', 1]]) {
      for (let i = 0; i < count; i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_maintext')) { this.load.json('fnt_maintext', new URL('fonts/fnt_maintext/fnt_maintext.json', base).href); this.load.image('fnt_maintext', new URL('fonts/fnt_maintext/fnt_maintext.png', base).href); }
    for (const [key, ext] of [['mus_temshop', 'ogg'], ['snd_buyitem', 'wav'], ['snd_select', 'wav']]) if (!this.cache.audio.exists(key)) this.load.audio(key, new URL(`sounds/${key}/${key}.${ext}`, base).href);
    this.assetError = null; this.onAssetError = file => { this.assetError = new Error(`Không tải được tài nguyên ${file.key}.`); };
    this.load.on('loaderror', this.onAssetError); this.events.once('shutdown', () => this.load.off('loaderror', this.onAssetError));
  }
  create() {
    if (this.assetError) { Object.assign(window.__remake, { phase: 'error', error: this.assetError.message }); return; }
    if (!this.cache.bitmapFont.exists('fnt_maintext')) registerBitmapFont(this, 'fnt_maintext', this.cache.json.get('fnt_maintext'));
    this.world = this.game.scene.getScene('World'); this.violent = murderLevel(this.world.flags) >= 10; this.deaths = Number(localStorage.getItem('undertale-remake-deaths') ?? 0);
    this.music = null; this.mode = 'main'; this.selection = 0; this.selected = 0; this.side = 0; this.pages = null; this.pageIndex = 0; this.speakingTime = 0; this.animationElapsed = 0; this.animationFrame = 0; this.special = 0;
    if (this.world.flags[7] !== 1) { this.music = this.sound.add('mus_temshop', { loop: true, volume: .5, rate: this.violent ? .5 : 1 }); this.music.play(); }
    this.events.once('shutdown', () => this.music?.destroy()); this.onKey = event => { if (!event.repeat) this.key(event.code); };
    window.addEventListener('keydown', this.onKey); this.events.once('shutdown', () => window.removeEventListener('keydown', this.onKey));
    Object.assign(window.__remake, { phase: 'shop', room: 'room_shop5', scene: this }); this.draw();
  }
  price(index) { return [3, 1, 20, this.violent || !this.world.flags[276] ? 1000 : temArmorPrice(this.deaths)][index]; }
  itemName(index) { const suffix = ['22a', '22b', '22c', this.violent ? '22d' : this.world.flags[276] ? '64' : 'college'][index]; return data[`shop5_itemname_${suffix}`]; }
  itemInfo(index) { const suffix = ['22a', '22b', '22c', this.violent ? '22d' : this.world.flags[276] ? '64' : 'college'][index]; return data[`shop5_itemdesc_${suffix}`]; }
  draw() {
    this.children.removeAll(true); const w = this.world;
    this.add.image(0, 0, 'bg_temshop').setOrigin(0);
    this.parts = [['spr_5_coffeeline', 178, 62], ['spr_5_tembody', 99, 1], ['spr_5_tembrows', 138, 32], ['spr_5_eyes1', 139, 40], ['spr_5_mouth1', 141, 48]].map(([key, x, y]) => this.add.image(x, y, `${key}:0`).setOrigin(0));
    const divided = !['pages', 'sell', 'sellConfirm', 'college'].includes(this.mode);
    this.box(0, 120, 320, 120); if (divided) this.add.rectangle(210, 124, 4, 112, 0xffffff).setOrigin(0);
    if (this.mode === 'main') {
      this.text(10, 129, data.obj_shop5_343); ['Buy', 'Sell', 'Talk', 'Exit'].forEach((label, i) => this.text(240, 130 + i * 20, label)); this.add.image(225, 134 + this.selection * 20, 'spr_heartsmall:0').setOrigin(0);
    } else if (this.mode === 'buy' || this.mode === 'confirm') {
      for (let i = 0; i < 4; i++) { const label = this.text(30, 130 + i * 20, `${this.price(i)}G - ${this.itemName(i)}`); if (label.width > 174) label.setScale(174 / label.width, 1); }
      this.text(30, 210, 'Exit'); this.add.image(15, 134 + this.selection * 20, 'spr_heartsmall:0').setOrigin(0);
      if (this.selection < 4) { this.box(0, 53, 210, 67); this.text(10, 58, this.itemInfo(this.selection)); }
      if (this.mode === 'buy') this.text(216, 130, data[`obj_shop5_${405 + this.side}`]);
      else { this.text(216, 130, `Buy for\n${this.price(this.selection)}G ?\n\n  Yaya\n  NO!!!`); this.add.image(215, 174 + this.selected * 15, 'spr_heartsmall:0').setOrigin(0); }
    } else if (this.mode === 'talk') {
      [data.shop5_talk1_title, data[`shop5_talk2${w.flags[276] ? 'b' : 'a'}_title`], data.shop5_talk3_title, data.shop5_talk4_title, 'Exit'].forEach((label, i) => this.text(30, 130 + i * 20, label));
      this.add.image(15, 134 + this.selection * 20, 'spr_heartsmall:0').setOrigin(0); this.text(216, 130, data.obj_shop5_491);
    } else if (this.mode === 'pages') this.text(10, 128, this.pages[this.pageIndex]);
    else if (this.mode === 'sell') {
      w.inventory.forEach((id, i) => { const x = i % 2 ? 155 : 15, y = 130 + Math.floor(i / 2) * 20, price = temSellValue(id), name = inventory.items[id]?.battleName ?? inventory.items[id]?.name ?? String(id); const label = this.text(x + 15, y, `${price < 0 ? 'NO!' : `${price}G`} - ${name}`); if (label.width > 130) label.setScale(130 / label.width, 1); });
      this.text(30, 210, 'Exit'); const i = this.selection; this.add.image(i === 8 ? 15 : i % 2 ? 155 : 15, i === 8 ? 214 : 134 + Math.floor(i / 2) * 20, 'spr_heartsmall:0').setOrigin(0);
    } else if (this.mode === 'sellConfirm') {
      const id = w.inventory[this.selection], name = inventory.items[id]?.battleName ?? inventory.items[id]?.name ?? String(id);
      this.text(12, 145, `tem buy ${name} for... ${this.offer}G!!!`); this.text(80, 180, 'yayA!'); this.text(190, 180, 'NO!!!'); this.add.image(65 + this.selected * 110, 184, 'spr_heartsmall:0').setOrigin(0);
    }
    if (divided || this.mode === 'sell' || this.mode === 'sellConfirm') { this.text(230, 210, `${w.gold}G`); if (divided) this.text(280, 210, `${w.inventory.length}/8`); }
    this.animateKeeper();
  }
  update(_time, delta) {
    if (window.__remake.phase !== 'shop' || window.__remake.scene !== this) return;
    this.animationElapsed = Math.min(200, this.animationElapsed + delta);
    while (this.animationElapsed >= 1000 / 30) { this.animationElapsed -= 1000 / 30; this.animationFrame++; }
    this.animateKeeper();
  }
  animateKeeper() { if (!this.parts) return; this.parts[0].setTexture(`spr_5_coffeeline:${Math.floor(this.animationFrame / 8) % 2}`).y = 62 + Math.sin(this.animationFrame / 4) * 1.5; }
  talk(index) {
    const f = this.world.flags; let pages;
    if (index === 0) pages = lines(544, 545);
    else if (index === 1 && !f[276]) pages = lines(549, 550);
    else if (index === 1) pages = this.deaths > 18 ? [...lines(554, 555, 556, 557, 558, 564, 565)] : lines(554, 555, 556, 557, 558, 559, 560);
    else if (index === 2) pages = lines(f[276] ? 579 : 575);
    else pages = lines(584);
    this.show(pages, () => { this.mode = 'talk'; this.selection = index; });
  }
  beginCollege() {
    this.world.gold -= 1000;
    this.show(lines(633, 634, 635), () => {
      this.mode = 'college'; this.music?.pause(); this.time.delayedCall(120 * 1000 / 30, () => {
        this.world.flags[276] = 1;
        this.time.delayedCall(120 * 1000 / 30, () => { if (this.music?.isPaused) this.music.resume(); this.show(lines(672, 673), () => { this.mode = 'main'; this.selection = 0; }); this.draw(); });
      });
    });
  }
  selectSell() {
    const w = this.world, id = w.inventory[this.selection], value = temSellValue(id); if (!(value > 0)) return;
    this.offer = value; this.selected = 0; this.special = 0;
    const special = (w.flags[265] ?? 0) <= 1 || id === 22 && !w.flags[266];
    if (!special) { this.mode = 'sellConfirm'; return; }
    if (id === 22 && !w.flags[266]) w.flags[266] = 1;
    w.flags[265] = 9; this.special = 1; this.offer = temFirstOffer(value);
    const name = inventory.items[id]?.battleName ?? inventory.items[id]?.name ?? String(id);
    const pages = lines(589, 590, w.flags[276] ? 594 : 591, 596).map(line => line.replace(/\\\[1\]/g, name));
    this.show(pages, () => { this.mode = 'sellConfirm'; });
  }
  refuseSell() {
    if (this.special === 1) { this.special = 2; this.offer = temSecondOffer(this.offer); this.show(lines(601, 602), () => { this.mode = 'sellConfirm'; this.selected = 0; }); }
    else if (this.special === 2) this.show(lines(this.world.flags[276] ? 611 : 607), () => { this.mode = 'sell'; });
    else this.mode = 'sell';
  }
  key(code) {
    if (this.mode === 'college') return;
    const cancel = ['KeyX', 'Escape', 'ShiftLeft', 'ShiftRight'].includes(code), confirm = ['KeyZ', 'Enter'].includes(code);
    if (this.mode === 'pages') { if (confirm) this.nextPage(); if (window.__remake.scene === this) this.draw(); return; }
    if (this.mode === 'sellConfirm') {
      if (['ArrowLeft', 'ArrowRight'].includes(code)) this.selected = 1 - this.selected;
      if (cancel || confirm && this.selected === 1) this.refuseSell();
      else if (confirm) { const w = this.world, id = w.inventory[this.selection]; if (id !== 22) w.flags[265] = (w.flags[265] ?? 0) - 1; w.gold += this.offer; w.inventory.splice(this.selection, 1); this.sound.play('snd_buyitem'); this.mode = w.inventory.length ? 'sell' : 'main'; this.selection = Math.min(this.selection, Math.max(0, w.inventory.length - 1)); }
      this.draw(); return;
    }
    if (this.mode === 'sell' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) {
      const count = this.world.inventory.length, positions = [...Array(count).keys(), 8], current = this.selection;
      let next = current;
      if (code === 'ArrowLeft' && current < 8 && current % 2) next--;
      if (code === 'ArrowRight' && current < 8 && current % 2 === 0 && current + 1 < count) next++;
      if (code === 'ArrowDown') next = current === 8 ? 0 : current + 2 < count ? current + 2 : 8;
      if (code === 'ArrowUp') next = current === 8 ? Math.max(0, count - 1) : current >= 2 ? current - 2 : 8;
      this.selection = positions.includes(next) ? next : 8; this.draw(); return;
    }
    if (['ArrowUp', 'ArrowDown'].includes(code) && this.mode !== 'sell') {
      const max = this.mode === 'main' ? 3 : this.mode === 'confirm' ? 1 : 4, delta = code === 'ArrowDown' ? 1 : -1;
      if (this.mode === 'confirm') this.selected = (this.selected + delta + 2) % 2; else this.selection = (this.selection + delta + max + 1) % (max + 1);
      this.draw(); return;
    }
    if (cancel) { if (this.mode === 'confirm') { this.mode = 'buy'; this.side = 2; } else if (['buy', 'talk', 'sell'].includes(this.mode)) { this.mode = 'main'; this.selection = 0; } this.draw(); return; }
    if (!confirm) return;
    if (this.mode === 'main') {
      const index = this.selection; this.selection = 0;
      if (index === 0) { this.mode = 'buy'; this.side = 0; }
      else if (index === 1) { if (this.world.inventory.length) this.mode = 'sell'; else this.show(lines(536), () => { this.mode = 'main'; }); }
      else if (index === 2) this.mode = 'talk'; else this.show(lines(540), () => this.leave());
    } else if (this.mode === 'buy') { if (this.selection === 4) { this.mode = 'main'; this.selection = 0; } else { this.mode = 'confirm'; this.selected = 0; } }
    else if (this.mode === 'confirm') {
      if (this.selected === 1) this.side = 2;
      else if (this.world.gold < this.price(this.selection)) this.side = 3;
      else if (this.selection === 3 && !this.violent && !this.world.flags[276]) { this.beginCollege(); this.draw(); return; }
      else if (!addItem(this.world, this.selection === 3 && !this.violent ? 64 : 22)) this.side = 4;
      else { this.world.gold -= this.price(this.selection); this.sound.play('snd_buyitem'); this.side = 1; }
      this.mode = 'buy';
    } else if (this.mode === 'talk') { if (this.selection === 4) { this.mode = 'main'; this.selection = 0; } else this.talk(this.selection); }
    else if (this.mode === 'sell') { if (this.selection === 8) { this.mode = 'main'; this.selection = 0; } else this.selectSell(); }
    if (window.__remake.scene === this) this.draw();
  }
  leave() {
    const w = this.world; this.scene.stop(); this.scene.resume('World'); w.player.setPosition(330, 152); w.player.facing = 'd'; w.player.setTexture('spr_maincharad:0'); w.updateCamera(); w.release(); w.confirmDown = false; w.confirmPressed = false; w.confirmWasDown = false; w.interactionCooldown = 250;
    Object.assign(window.__remake, { phase: 'running', room: 'room_water_temvillage', scene: w }); startTemVillageMusic(w); w.cameras.main.fadeIn(13 * 1000 / 30);
  }
}
