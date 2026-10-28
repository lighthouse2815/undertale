import { Scene } from '../vendor/phaser.esm.min.js';
import { itemAction, itemNames } from './inventory.mjs';
import { loadGloveAssets } from './fight-input.mjs';

const getState = () => window.__remake;
export const BATTLE_CONFIGS = {
  dummy: { name: 'Dummy', asset: 'spr_dummybattle', hp: 15, def: -5 },
  tutorialFroggit: { name: 'Froggit', asset: 'spr_froggit', hp: 20, def: 1 },
  froggit: { name: 'Froggit', asset: 'spr_froggit', hp: 30, def: 4, xp: 3 },
  whimsun: { name: 'Whimsun', asset: 'spr_whimsun', hp: 10, def: 0, xp: 2 },
  vegetoid: { name: 'Vegetoid', asset: 'spr_vegetoid', hp: 72, def: 0, xp: 6 },
  napstablook: { name: 'Napstablook', asset: 'spr_napstabattle', hp: 88, def: 4, xp: 0 },
  toriel: { name: 'Toriel', asset: 'spr_torielboss', hp: 440, def: 1, xp: 150 },
  snowdrake: { name: 'Snowdrake', asset: 'spr_snowdrake', hp: 74, def: 2, xp: 22 },
  chilldrake: { name: 'Chilldrake', asset: 'spr_snowdrake', hp: 74, def: 2, xp: 22 },
  icecap: { name: 'Ice Cap', asset: 'spr_icecap', hp: 48, def: 0, xp: 17 },
  ice: { name: 'Ice', asset: 'spr_icecube', hp: 48, def: -100, xp: 25 },
  lesserDog: { name: 'Lesser Dog', asset: 'spr_lesserdoge', hp: 60, def: 0, xp: 18 },
  snowdinGroup35: { name: 'Ice Cap', asset: 'spr_icecap', hp: 48, def: 0, xp: 17 },
  snowdinGroup36: { name: 'Ice Cap', asset: 'spr_icecap', hp: 48, def: 0, xp: 17 },
  dogi: { name: 'Dogamy', asset: 'spr_mandoge', hp: 108, def: 4, xp: 30 },
  papyrus: { name: 'Papyrus', asset: 'spr_papyrusboss', hp: 680, def: 2, xp: 200 },
  greaterDog: { name: 'Greater Dog', asset: 'spr_greatdog', hp: 105, def: 4, xp: 80 },
  shyren: { name: 'Shyren', asset: 'spr_shyren', hp: 66, def: 2, xp: 52 },
  madDummy: { name: 'Mad Dummy', asset: 'spr_dummybattle', hp: 200, def: -40, xp: 0 },
  gladDummy: { name: 'Glad Dummy', asset: 'spr_dummybattle_glad', hp: 5, def: -5, xp: 0 },
  temmie: { name: 'Temmie', asset: 'spr_tembattle', hp: 5, def: -20, xp: 40 },
  aaron: { name: 'Aaron', asset: 'spr_aaron', hp: 98, def: 2, xp: 52 },
  woshua: { name: 'Woshua', asset: 'spr_woshua', hp: 70, def: 1, xp: 52 },
  moldbyggGroup55: { name: 'Woshua', asset: 'spr_woshua', hp: 70, def: 1, xp: 52 },
  moldbyggGroup42: { name: 'Moldsmal', asset: 'spr_moldsmal', hp: 50, def: 0, xp: 3 },
  moldsmalGroup53: { name: 'Moldsmal', asset: 'spr_moldsmal', hp: 50, def: 0, xp: 3 },
  waterfallGroup54: { name: 'Woshua', asset: 'spr_woshua', hp: 70, def: 1, xp: 52 },
  undyneQuick: { name: '', asset: 'spr_froggit', hp: 0, def: 0, xp: 0 },
  gyftrot: { name: 'Gyftrot', asset: 'spr_gyftrot', hp: 114, def: 3, xp: 35 },
  doggo: { name: 'Doggo', asset: 'spr_movedoge', hp: 70, def: 1, xp: 30 },
  nobody: { name: '', asset: 'spr_froggit', hp: 0, def: 0, xp: 0 },
};

export class Battle extends Scene {
  constructor(key = 'Battle') { super(key); }

  preload() {
    loadGloveAssets(this);
    if (this.game.scene.getScene('World').inventory.length) {
      if (!this.cache.json.exists('inventory')) this.load.json('inventory', new URL('./inventory.json', import.meta.url).href);
      for (const key of ['snd_power', 'snd_swallow', 'snd_spooky', 'snd_item', 'snd_dogresidue', 'snd_tearcard', 'snd_speedup']) if (!this.cache.audio.exists(key))
        this.load.audio(key, new URL(`../assets/sounds/${key}/${key}.wav`, import.meta.url).href);
    }
    this.load.image('battle-heart', new URL('../assets/sprites/spr_heart/spr_heart_0.png', import.meta.url).href);
    const key = this.game.registry.get('battleConfig') ?? 'dummy';
    const config = BATTLE_CONFIGS[key] ?? BATTLE_CONFIGS.dummy;
    this.load.image(`battle:${config.asset}`, new URL(`../assets/sprites/${config.asset}/${config.asset}_0.png`, import.meta.url).href);
  }

  create() {
    this.cardAttackBonus = 0;
    this.events.once('shutdown', () => { this.previousScene.flags[78] = 0; });
    const state = getState();
    this.config = BATTLE_CONFIGS[this.game.registry.get('battleConfig')] ?? BATTLE_CONFIGS.dummy;
    this.previousScene = this.game.scene.getScene('World');
    this.cameras.main.setBackgroundColor('#000');
    this.title = this.add.text(160, 12, 'BATTLE', { fontFamily: 'monospace', fontSize: '12px', color: '#fff' }).setOrigin(.5);
    this.enemy = this.add.image(160, 52, `battle:${this.config.asset}`).setScale(this.config.asset === 'spr_froggit' ? .55 : .65);
    this.enemyName = this.add.text(160, 84, `* ${this.config.name}`, { fontFamily: 'monospace', fontSize: '9px', color: '#fff' }).setOrigin(.5);
    this.arena = this.add.rectangle(40, 96, 240, 100, 0x000000).setOrigin(0).setStrokeStyle(2, 0xffffff);
    this.soul = this.add.image(160, 146, 'battle-heart').setScale(.55);
    this.hp = this.previousScene?.hp ?? 20; this.maxHp = this.previousScene?.maxHp ?? 20; this.enemyHp = this.config.hp; this.enemyMaxHp = this.config.hp;
    this.hpText = this.add.text(40, 210, `HP ${this.hp} / ${this.maxHp}`, { fontFamily: 'monospace', fontSize: '9px', color: '#fff' });
    this.enemyHpText = this.add.text(200, 210, `${this.enemyHp} / ${this.enemyMaxHp}`, { fontFamily: 'monospace', fontSize: '9px', color: '#fff' });
    this.menu = this.add.text(40, 224, '', { fontFamily: 'monospace', fontSize: '8px', color: '#fff' });
    this.message = this.add.text(40, 176, '', { fontFamily: 'monospace', fontSize: '8px', color: '#fff', lineSpacing: 2 });
    this.help = this.add.text(160, 238, 'Z chọn · X quay lại · mũi tên di chuyển', { fontFamily: 'monospace', fontSize: '6px', color: '#aaa' }).setOrigin(.5);
    this.menuIndex = 0; this.subIndex = 0; this.mode = 'menu'; this.submenu = [];
    this.bullets = []; this.elapsed = 0; this.messageTimer = 0; this.mercyReady = false;
    this.confirmPressed = false; this.confirm = false; this.cancel = false;
    this.keys = this.input.keyboard.createCursorKeys(); this.lastMenuMove = 0;
    this.onKeyDown = (event) => {
      if (event.repeat) return;
      if (['KeyZ', 'Enter'].includes(event.code)) { this.confirm = true; this.confirmPressed = true; }
      if (['KeyX', 'ShiftLeft', 'ShiftRight', 'Escape'].includes(event.code)) this.cancel = true;
      if (this.mode === 'menu' && event.code === 'ArrowRight') this.menuIndex = Math.min(3, this.menuIndex + 1);
      if (this.mode === 'menu' && event.code === 'ArrowLeft') this.menuIndex = Math.max(0, this.menuIndex - 1);
      if (this.mode === 'submenu' && event.code === 'ArrowDown') this.subIndex = Math.min(this.submenu.length - 1, this.subIndex + 1);
      if (this.mode === 'submenu' && event.code === 'ArrowUp') this.subIndex = Math.max(0, this.subIndex - 1);
    };
    this.onKeyUp = (event) => { if (['KeyZ', 'Enter'].includes(event.code)) this.confirm = false; };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    state.phase = 'battle'; state.room = 'battle_dummy'; state.scene = this;
    this.updateMenuText();
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
    });
  }

  update(_time, delta) {
    if (this.mode === 'menu') this.updateMenu(delta);
    else if (this.mode === 'submenu') this.updateSubmenu(delta);
    else if (this.mode === 'fight') this.updateFight(delta);
    else if (this.mode === 'soul') this.updateSoul(delta);
    else if (this.mode === 'message') this.updateMessage(delta);
    else if (this.mode === 'result' && this.confirmPressed) this.finishBattle();
    this.confirmPressed = false; this.cancel = false;
  }

  updateMenu(delta) {
    this.lastMenuMove -= delta;
    if (this.lastMenuMove <= 0) {
      if (this.keys.left.isDown) { this.menuIndex = Math.max(0, this.menuIndex - 1); this.lastMenuMove = 160; }
      if (this.keys.right.isDown) { this.menuIndex = Math.min(3, this.menuIndex + 1); this.lastMenuMove = 160; }
    }
    if (this.confirmPressed) {
      if (this.menuIndex === 0) this.startFight();
      else if (this.menuIndex === 1) this.openSubmenu(['Check', 'Talk']);
      else if (this.menuIndex === 2) {
        if (this.previousScene.inventory.length) this.openSubmenu(itemNames(this.previousScene, this.cache.json.get('inventory'), true));
      }
      else if (this.mercyReady) this.showResult(`You spared the ${this.config.name}.`);
      else this.queueEnemyTurn(`The ${this.config.name} does not want to be spared.`);
    }
    if (this.cancel) this.finishBattle();
    this.updateMenuText();
  }

  updateMenuText() {
    const labels = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];
    this.menu.setText(labels.map((label, index) => index === this.menuIndex ? `[${label}]` : ` ${label} `).join('   '));
  }

  openSubmenu(items) { this.submenu = items; this.subIndex = 0; this.mode = 'submenu'; this.menu.setText(this.submenu.map((item, i) => i === this.subIndex ? `>${item}` : ` ${item}`).join('\n')); }

  updateSubmenu(delta) {
    this.lastMenuMove -= delta;
    if (this.lastMenuMove <= 0) {
      if (this.keys.up.isDown) { this.subIndex = Math.max(0, this.subIndex - 1); this.lastMenuMove = 160; }
      if (this.keys.down.isDown) { this.subIndex = Math.min(this.submenu.length - 1, this.subIndex + 1); this.lastMenuMove = 160; }
    }
    if (this.confirmPressed) {
      if (this.menuIndex === 1) {
        if (this.subIndex === 1) this.mercyReady = true;
        this.queueEnemyTurn(this.subIndex === 0 ? this.config.check : this.config.talk);
      }
      else {
        const lines = itemAction(this.previousScene, this.subIndex, 'use', this.cache.json.get('inventory'), { scene: this, health: this });
        this.hpText.setText(`HP ${this.hp} / ${this.maxHp}`); this.queueEnemyTurn(lines.join('\n'));
      }
    }
    if (this.cancel) { this.mode = 'menu'; this.updateMenuText(); }
    this.menu.setText(this.submenu.map((item, i) => i === this.subIndex ? `>${item}` : ` ${item}`).join('\n'));
  }

  startFight() { this.mode = 'fight'; this.attackX = 48; this.attackDirection = 1; this.help.setText('Z dừng thanh đánh'); this.message.setText(''); }

  updateFight(delta) {
    this.attackX += this.attackDirection * delta * .22;
    if (this.attackX > 272 || this.attackX < 48) this.attackDirection *= -1;
    this.message.setText(`FIGHT  ${'|'.repeat(Math.max(0, Math.round((this.attackX - 48) / 16)))}+`);
    if (this.confirmPressed) {
      const damage = Math.max(1, Math.round(7 - Math.abs(this.attackX - 160) / 25));
      this.enemyHp = Math.max(0, this.enemyHp - damage); this.enemyHpText.setText(`${this.enemyHp} / ${this.enemyMaxHp}`);
      if (this.enemyHp === 0) this.showResult('You defeated the Dummy.'); else this.queueEnemyTurn(`You dealt ${damage} damage.`);
    }
    if (this.cancel) { this.mode = 'menu'; this.updateMenuText(); }
  }

  startSoul() { this.mode = 'soul'; this.soul.setVisible(true); this.elapsed = 0; this.help.setText('Né đạn trong hộp · Z kết thúc lượt'); this.spawnBullet(); }

  updateSoul(delta) {
    const speed = 1.8 * Math.min(delta, 50);
    const dx = (this.keys.right.isDown ? 1 : 0) - (this.keys.left.isDown ? 1 : 0);
    const dy = (this.keys.down.isDown ? 1 : 0) - (this.keys.up.isDown ? 1 : 0);
    this.soul.x = Math.max(48, Math.min(272, this.soul.x + dx * speed));
    this.soul.y = Math.max(104, Math.min(188, this.soul.y + dy * speed));
    this.elapsed += delta;
    if (this.elapsed > 850) { this.elapsed = 0; this.spawnBullet(); }
    for (const bullet of this.bullets) {
      bullet.y += bullet.speed * delta / 16;
      if (Math.abs(bullet.x - this.soul.x) < 8 && Math.abs(bullet.y - this.soul.y) < 8) {
        this.hp = Math.max(0, this.hp - 1); this.hpText.setText(`HP ${this.hp} / ${this.maxHp}`); bullet.destroy(); bullet.dead = true;
      }
      if (bullet.y > 205) { bullet.destroy(); bullet.dead = true; }
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    if (this.confirmPressed || this.cancel) this.finishSoul();
  }

  spawnBullet() { const bullet = this.add.rectangle(48 + Math.random() * 224, 104, 5, 5, 0xffffff); bullet.speed = 1.5 + Math.random(); this.bullets.push(bullet); }

  finishSoul() { for (const bullet of this.bullets) bullet.destroy(); this.bullets = []; this.mode = 'menu'; this.help.setText('Z chọn · X quay lại · mũi tên di chuyển'); this.updateMenuText(); }

  queueEnemyTurn(text) { this.message.setText(text); this.mode = 'message'; this.messageTimer = 650; }
  updateMessage(delta) { this.messageTimer -= delta; if (this.messageTimer <= 0) this.startSoul(); }
  showResult(text) { this.mode = 'result'; this.message.setText(`${text}\n\nZ tiếp tục`); this.help.setText(''); }
  finishBattle() {
    if (this.previousScene) this.previousScene.hp = this.hp;
    this.scene.stop(); this.scene.resume('World');
    const state = getState(); state.phase = 'running'; state.room = this.previousScene?.dataSource?.name ?? 'room_area1'; state.scene = this.previousScene;
    if (this.previousScene) {
      this.previousScene.confirmPressed = false;
      this.previousScene.confirmDown = false;
      this.previousScene.confirmWasDown = false;
    }
  }
}
