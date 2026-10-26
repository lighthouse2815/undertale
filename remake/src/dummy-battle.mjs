import { Battle } from './battle.mjs';
import { loadRoom } from './room-assets.mjs';
import { itemAction, itemNames } from './inventory.mjs';

// obj_dummymonster: không có đạn, chỉ Check/Talk và các kết thúc hướng dẫn.
export class DummyBattle extends Battle {
  constructor(key = 'DummyBattle', roomName = 'room_ruins4') { super(key); this.assetRoom = roomName; }

  async create() {
    try {
      this.buttons = null; this.kind = null;
      const data = await loadRoom(this, this.assetRoom);
      this.battleData = data;
      this.text = data.dummyDialogue ?? { ...data.spikeDialogue, intro: data.spikeDialogue.battleIntro };
      super.create();
      this.title.setVisible(false); this.enemyName.setVisible(false);
      this.enemy.setTexture(`${this.config.asset}:0`).setPosition(108, 68).setOrigin(0).setScale(.5);
      this.arena.setPosition(16, 125).setSize(285, 67.5);
      this.soul.setVisible(false); this.help.setVisible(false); this.enemyHpText.setVisible(false);
      this.hpText.setText(`${this.previousScene.game.registry.get('charname')}  LV ${this.previousScene.lv}     HP ${this.hp}/${this.maxHp}`)
        .setPosition(16, 199).setFontSize(8);
      this.menu.destroy(); this.message.destroy();
      this.menu = this.add.bitmapText(32, 133, 'fnt_maintext', '', 12);
      this.message = this.add.bitmapText(24, 133, 'fnt_maintext', this.text.intro[0], 12).setMaxWidth(268);
      this.buttons = ['spr_fightbt', 'spr_talkbt', 'spr_itembt', 'spr_sparebt'].map((key, i) =>
        this.add.image(16 + i * 77, 216, `${key}:0`).setScale(.5).setOrigin(0));
      this.target = this.add.image(19, 128, 'spr_target:0').setScale(.5).setOrigin(0).setVisible(false);
      this.bar = this.add.image(11, 128, 'spr_targetchoice:0').setScale(.5).setOrigin(0).setVisible(false);
      this.turn = 0; this.outcome = null;
      window.__remake.room = 'battle_dummy';
      this.updateMenuText();
    } catch (error) {
      window.__remake.phase = 'error'; window.__remake.error = error.message;
      const status = document.getElementById('status'); status.hidden = false; status.textContent = error.message;
      console.error(error);
    }
  }

  update(_time, delta) {
    if (window.__remake.phase !== 'battle' || window.__remake.scene !== this) return;
    if (this.mode === 'menu') this.updateMenu();
    else if (this.mode === 'submenu') this.updateSubmenu();
    else if (this.mode === 'fight') this.updateFight(delta);
    else if (this.mode === 'pages' && this.confirmPressed) {
      this.pageIndex++;
      if (this.pageIndex < this.pages.length) this.message.setText(this.pages[this.pageIndex]);
      else this.afterPages();
    } else if (this.mode === 'dummyTurn') {
      this.turnTime -= delta;
      if (this.confirmPressed && this.turnTime > 5 * 1000 / 30) this.turnTime = 2 * 1000 / 30;
      if (this.turnTime <= 0) {
        this.soul.setVisible(false);
        this.turn++;
        if (this.turn > 7) this.showPages(this.text.bored, () => {
          this.sound.play('snd_slidewhist');
          this.mode = 'leaving';
          this.tweens.add({ targets: this.enemy, y: -110, duration: 1800, onComplete: () => this.end('bored') });
        });
        else this.toMenu(this.text.idle[Math.random() < .5 ? 0 : 1]);
      }
    }
    this.confirmPressed = false; this.cancel = false;
  }

  updateMenuText() {
    if (!this.buttons) return;
    for (let i = 0; i < this.buttons.length; i++) this.buttons[i].setTexture(`${['spr_fightbt', 'spr_talkbt', 'spr_itembt', 'spr_sparebt'][i]}:${i === this.menuIndex ? 1 : 0}`);
  }

  updateMenu() {
    this.updateMenuText();
    if (!this.confirmPressed) return;
    this.sound.play('snd_select');
    if (this.menuIndex === 0 || this.menuIndex === 1) this.choose(this.menuIndex === 0 ? 'fightTarget' : 'actTarget', ['Dummy']);
    else if (this.menuIndex === 3) this.choose('mercy', ['Spare', 'Flee']);
    else if (this.menuIndex === 2) this.chooseInventory();
  }

  choose(kind, items) {
    this.kind = kind; this.submenu = items; this.subIndex = 0; this.mode = 'submenu';
    this.message.setText(''); this.drawSubmenu();
  }

  drawSubmenu() { this.menu.setText(this.submenu.map((label, i) => `${i === this.subIndex ? '>' : ' '} * ${label}`).join('\n')); }

  updateSubmenu() {
    this.drawSubmenu();
    if (this.cancel) { this.toMenu(this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'item') this.useInventory();
    else if (this.kind === 'fightTarget') this.startFight();
    else if (this.kind === 'actTarget') this.choose('act', ['Check', 'Talk']);
    else if (this.kind === 'act') {
      if (this.subIndex === 0) this.showPages(this.text.check, () => this.dummyTurn());
      else this.showPages(this.text.talk, () => this.end('talk'));
    } else if (this.kind === 'mercy') {
      if (this.subIndex === 0) this.dummyTurn(); // mercymod -99: Dummy không nhận Spare.
      else {
        const hardMode = this.previousScene.game.registry.get('charname')?.toLowerCase() === 'frisk';
        const runValue = hardMode && this.turn === 0 ? 0 : Math.random() * 100 + 10 * (this.turn - (hardMode ? 1 : 0));
        if (!hardMode && (this.previousScene.armor ?? 4) === 4) {
          // Bandage mặc định (armor 4) bảo đảm trốn được trong tuyến thường.
          this.sound.play('snd_escaped'); this.showPages(this.text.escaped, () => this.finishWith('flee'));
        } else if (runValue > 50) {
          this.sound.play('snd_escaped'); this.showPages(this.text.escaped, () => this.finishWith('flee'));
        } else this.dummyTurn();
      }
    }
  }

  chooseInventory() {
    if (this.previousScene.inventory.length) this.choose('item', itemNames(this.previousScene, this.cache.json.get('inventory'), true));
  }

  useInventory() {
    const lines = itemAction(this.previousScene, this.subIndex, 'use', this.cache.json.get('inventory'), { scene: this, health: this });
    this.hpText.setText(`${this.previousScene.game.registry.get('charname')}  LV ${this.previousScene.lv}     HP ${this.hp}/${this.maxHp}`);
    this.showPages(lines, () => this.dummyTurn());
  }

  toMenu(text) {
    this.mode = 'menu'; this.menu.setText(''); this.message.setText(text);
    this.target.setVisible(false); this.bar.setVisible(false); this.updateMenuText();
  }

  showPages(lines, after) {
    this.mode = 'pages'; this.pages = lines; this.pageIndex = 0; this.afterPages = after;
    this.menu.setText(''); this.message.setText(lines[0]);
    this.target.setVisible(false); this.bar.setVisible(false);
  }

  dummyTurn() {
    this.mode = 'dummyTurn'; this.turnTime = 80 * 1000 / 30;
    this.menu.setText(''); this.message.setText(this.text.speech[0]);
    this.soul.setPosition(160, 170).setVisible(true);
    this.target.setVisible(false); this.bar.setVisible(false);
  }

  startFight() {
    this.mode = 'fight'; this.attackX = 11; this.attackSpeed = (11 + Math.random() * 2) * .5 * 30 / 1000;
    this.menu.setText(''); this.message.setText(''); this.target.setVisible(true); this.bar.setPosition(this.attackX, 128).setVisible(true);
  }

  updateFight(delta) {
    this.attackX += this.attackSpeed * delta; this.bar.x = this.attackX;
    if (this.attackX > 300) { this.showPages(['* MISS'], () => this.dummyTurn()); return; }
    if (!this.confirmPressed) return;
    const distance = Math.abs((this.attackX + 3.5) - (19 + 140.5)) * 2 || 1;
    const base = (8 + this.previousScene.lv * 2) + (this.previousScene.weaponStrength ?? 0) - this.config.def + Math.random() * 2;
    this.damage = Math.round(base * (distance <= 12 ? 2.2 : (562 - distance) / 562 * 2));
    this.enemyHp = Math.max(0, this.enemyHp - this.damage);
    this.enemy.setTexture(`${this.config.asset}:1`); this.sound.play('snd_damage');
    this.showPages([String(this.damage)], () => {
      this.enemy.setTexture(`${this.config.asset}:0`);
      if (this.enemyHp === 0) { this.enemy.setVisible(false); this.end('kill'); }
      else this.dummyTurn();
    });
  }

  end(outcome) { this.showPages(['* YOU WON!\n* You earned 0 XP and 0 gold.'], () => this.finishWith(outcome)); }

  finishWith(outcome) {
    this.outcome = outcome;
    const world = this.previousScene;
    world.flags ??= {};
    world.flags[{ talk: 10, flee: 11, kill: 12, bored: 13 }[outcome]] = 1;
    if (outcome !== 'flee') world.flags[14] = { talk: 2, kill: 1, bored: 3 }[outcome];
    if (outcome === 'kill') world.dummyLesson?.removeDummy();
    this.finishBattle();
  }
}
