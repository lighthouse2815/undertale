import { Scene } from '../vendor/phaser.esm.min.js';

const getState = () => window.__remake;

export class Battle extends Scene {
  constructor() { super('Battle'); }

  preload() {
    this.load.image('battle-heart', new URL('../assets/sprites/spr_heart/spr_heart_0.png', import.meta.url).href);
    this.load.image('battle-dummy', new URL('../assets/sprites/spr_dummybattle/spr_dummybattle_0.png', import.meta.url).href);
  }

  create() {
    const state = getState();
    this.previousScene = this.game.scene.getScenes(true).find((scene) => scene.scene.key === 'World');
    this.cameras.main.setBackgroundColor('#000');
    this.add.text(160, 12, 'BATTLE', { fontFamily: 'monospace', fontSize: '12px', color: '#fff' }).setOrigin(.5);
    this.enemy = this.add.image(160, 52, 'battle-dummy').setScale(.55);
    this.add.text(160, 84, '* Dummy', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' }).setOrigin(.5);
    this.add.rectangle(40, 96, 240, 100, 0x000000).setOrigin(0).setStrokeStyle(2, 0xffffff);
    this.soul = this.add.image(160, 146, 'battle-heart').setScale(.55);
    this.hp = 20; this.maxHp = 20; this.enemyHp = 10; this.enemyMaxHp = 10;
    this.hpText = this.add.text(40, 210, 'HP 20 / 20', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' });
    this.enemyHpText = this.add.text(200, 210, '10 / 10', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' });
    this.menu = this.add.text(40, 224, '', { fontFamily: 'monospace', fontSize: '8px', color: '#fff' });
    this.message = this.add.text(40, 176, '', { fontFamily: 'monospace', fontSize: '8px', color: '#fff', lineSpacing: 2 });
    this.help = this.add.text(160, 238, 'Z chọn · X quay lại · mũi tên di chuyển', { fontFamily: 'monospace', fontSize: '6px', color: '#aaa' }).setOrigin(.5);
    this.menuIndex = 0; this.subIndex = 0; this.mode = 'menu'; this.submenu = [];
    this.bullets = []; this.elapsed = 0; this.messageTimer = 0; this.mercyReady = false;
    this.confirmPressed = false; this.confirm = false; this.cancel = false;
    this.keys = this.input.keyboard.createCursorKeys(); this.lastMenuMove = 0;
    this.onKeyDown = (event) => {
      if (event.code === 'KeyZ') { this.confirm = true; this.confirmPressed = true; }
      if (event.code === 'KeyX' || event.code === 'Escape') this.cancel = true;
      if (this.mode === 'menu' && event.code === 'ArrowRight') this.menuIndex = Math.min(3, this.menuIndex + 1);
      if (this.mode === 'menu' && event.code === 'ArrowLeft') this.menuIndex = Math.max(0, this.menuIndex - 1);
      if (this.mode === 'submenu' && event.code === 'ArrowDown') this.subIndex = Math.min(this.submenu.length - 1, this.subIndex + 1);
      if (this.mode === 'submenu' && event.code === 'ArrowUp') this.subIndex = Math.max(0, this.subIndex - 1);
    };
    this.onKeyUp = (event) => { if (event.code === 'KeyZ') this.confirm = false; };
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
      else if (this.menuIndex === 2) this.openSubmenu(['Monster Candy']);
      else if (this.mercyReady) this.showResult('You spared the Dummy.');
      else this.queueEnemyTurn('The Dummy does not want to be spared.');
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
      if (this.menuIndex === 1) this.queueEnemyTurn(this.subIndex === 0 ? '* Dummy - ATK 0 DEF 0.\n  It is just a dummy.' : '* You talk to the dummy.');
      else { this.hp = Math.min(this.maxHp, this.hp + 10); this.hpText.setText(`HP ${this.hp} / ${this.maxHp}`); this.queueEnemyTurn('* You eat the Monster Candy.'); }
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
  finishBattle() { this.scene.stop(); this.scene.start('World'); }
}
