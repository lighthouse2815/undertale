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
    this.add.text(160, 18, 'BATTLE', { fontFamily: 'monospace', fontSize: '12px', color: '#fff' }).setOrigin(.5);
    this.enemy = this.add.image(160, 56, 'battle-dummy').setScale(.55);
    this.add.text(160, 88, '* Dummy', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' }).setOrigin(.5);
    this.arena = this.add.rectangle(40, 100, 240, 100, 0x000000).setOrigin(0).setStrokeStyle(2, 0xffffff);
    this.soul = this.add.image(160, 150, 'battle-heart').setScale(.55);
    this.hp = 20;
    this.hpText = this.add.text(40, 214, 'HP 20 / 20', { fontFamily: 'monospace', fontSize: '9px', color: '#fff' });
    this.menu = this.add.text(40, 228, 'FIGHT     ACT      ITEM     MERCY', { fontFamily: 'monospace', fontSize: '8px', color: '#fff' });
    this.help = this.add.text(160, 245, 'Z chọn · X quay lại · mũi tên di chuyển', { fontFamily: 'monospace', fontSize: '7px', color: '#aaa' }).setOrigin(.5);
    this.menuIndex = 0;
    this.mode = 'menu';
    this.bullets = [];
    this.elapsed = 0;
    this.confirm = false;
    this.confirmPressed = false;
    this.keys = this.input.keyboard.createCursorKeys();
    this.onKeyDown = (event) => {
      if (event.code === 'KeyZ') { this.confirm = true; this.confirmPressed = true; }
      if (event.code === 'KeyX') this.cancel = true;
    };
    this.onKeyUp = (event) => { if (event.code === 'KeyZ') this.confirm = false; };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    state.phase = 'battle'; state.room = 'battle_dummy'; state.scene = this;
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
    });
  }

  update(_time, delta) {
    if (this.mode === 'menu') this.updateMenu();
    else if (this.mode === 'soul') this.updateSoul(delta);
    this.confirmPressed = false;
    this.cancel = false;
  }

  updateMenu() {
    if (this.keys.left.isDown) this.menuIndex = Math.max(0, this.menuIndex - 1);
    if (this.keys.right.isDown) this.menuIndex = Math.min(3, this.menuIndex + 1);
    if (this.confirmPressed) {
      if (this.menuIndex === 0) this.startSoul();
      else if (this.menuIndex === 3) this.finishBattle();
    }
    const labels = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];
    this.menu.setText(labels.map((label, index) => index === this.menuIndex ? `[${label}]` : ` ${label} `).join('   '));
    if (this.cancel) this.finishBattle();
  }

  startSoul() {
    this.mode = 'soul';
    this.soul.setVisible(true);
    this.help.setText('Né đạn trong hộp · Z kết thúc lượt');
    this.spawnBullet();
  }

  updateSoul(delta) {
    const speed = 1.8 * Math.min(delta, 50);
    const dx = (this.keys.right.isDown ? 1 : 0) - (this.keys.left.isDown ? 1 : 0);
    const dy = (this.keys.down.isDown ? 1 : 0) - (this.keys.up.isDown ? 1 : 0);
    this.soul.x = Math.max(48, Math.min(272, this.soul.x + dx * speed));
    this.soul.y = Math.max(108, Math.min(192, this.soul.y + dy * speed));
    this.elapsed += delta;
    if (this.elapsed > 850) { this.elapsed = 0; this.spawnBullet(); }
    for (const bullet of this.bullets) {
      bullet.y += bullet.speed * delta / 16;
      if (Math.abs(bullet.x - this.soul.x) < 8 && Math.abs(bullet.y - this.soul.y) < 8) {
        this.hp = Math.max(0, this.hp - 1);
        this.hpText.setText(`HP ${this.hp} / 20`);
        bullet.destroy(); bullet.dead = true;
      }
      if (bullet.y > 205) { bullet.destroy(); bullet.dead = true; }
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    if (this.confirmPressed || this.cancel) this.finishSoul();
  }

  spawnBullet() {
    const bullet = this.add.rectangle(48 + Math.random() * 224, 105, 5, 5, 0xffffff);
    bullet.speed = 1.5 + Math.random();
    this.bullets.push(bullet);
  }

  finishSoul() {
    for (const bullet of this.bullets) bullet.destroy();
    this.bullets = [];
    this.mode = 'menu';
    this.help.setText('Z chọn · X quay lại · mũi tên di chuyển');
  }

  finishBattle() {
    this.scene.stop();
    this.scene.start('World');
  }
}
