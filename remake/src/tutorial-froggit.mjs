import { DummyBattle } from './dummy-battle.mjs';

import { LEVEL_THRESHOLDS } from './levels.mjs';

// Trận battlegroup 3 dùng cùng menu hướng dẫn; obj_fakefroggit gọi Toriel sau hành động đầu.
export class TutorialFroggit extends DummyBattle {
  constructor() { super('TutorialFroggit', 'room_ruins5'); }

  async create() {
    await super.create();
    if (window.__remake.phase === 'error') return;
    this.enemy.setOrigin(2 / 112);
    this.head = this.add.image(108, 68, 'spr_froghead:0').setOrigin(0).setScale(.5);
    this.legs = this.add.image(108, 68, 'spr_froglegs:0').setOrigin(0).setScale(.5);
    this.headMotion = this.tweens.chain({ targets: this.head, loop: -1,
      onLoop: () => this.head.setPosition(108, 68),
      tweens: this.battleData.paths.get('path_froghead').Points.slice(1).map((point, index, points) => {
        const previous = index ? points[index - 1] : { X: 264, Y: 300 };
        return { x: 108 + (point.X - 264) / 2, y: 68 + (point.Y - 300) / 2,
          duration: Math.hypot(point.X - previous.X, point.Y - previous.Y) / (0.5 * 30) * 1000 };
      }) });
    this.toriel = this.add.image(340, 22, 'spr_torieldisapprove:0').setOrigin(0).setVisible(false);
    this.mercyModifier = 3; this.goldReward = 0; this.xpReward = 0;
    window.__remake.room = 'battle_tutorial_froggit';
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.mode !== 'fight' && this.head?.active && this.head.visible) {
      this.head.setTexture(`spr_froghead:${Math.floor(time / (1000 / .6)) % 2}`);
      this.legs.setTexture(`spr_froglegs:${Math.floor(time / (1000 / 1.2)) % 2}`);
    }
  }

  updateMenu() {
    this.updateMenuText();
    if (!this.confirmPressed) return;
    this.sound.play('snd_select');
    if (this.menuIndex < 2) this.choose(this.menuIndex ? 'actTarget' : 'fightTarget', ['Froggit']);
    else if (this.menuIndex === 3) this.choose('mercy', ['Spare', 'Flee']);
    else if (this.menuIndex === 2) this.chooseInventory();
  }

  updateSubmenu() {
    this.drawSubmenu();
    if (this.cancel) { this.toMenu(this.text.intro[0]); return; }
    if (!this.confirmPressed) return;
    if (this.kind === 'item') this.useInventory();
    else if (this.kind === 'actTarget') this.choose('act', ['Check', 'Compliment', 'Threat']);
    else if (this.kind === 'act') {
      if (this.subIndex !== 0) this.mercyModifier = 30;
      this.showPages(this.text[['check', 'compliment', 'threaten'][this.subIndex]], () => this.dummyTurn());
    } else if (this.kind === 'fightTarget') this.startFight();
    else if (this.kind === 'mercy') {
      if (this.subIndex === 1) {
        const world = this.previousScene;
        const hard = world.game.registry.get('charname')?.toLowerCase() === 'frisk';
        if ((!hard && (world.armor ?? 4) === 4) || (!hard && Math.random() * 100 > 50)) {
          this.sound.play('snd_escaped'); this.showPages(this.text.escaped, () => this.finishWith('flee'));
        } else this.dummyTurn();
      } else if (this.enemyHp - (8 + this.previousScene.lv * 2) - (this.previousScene.weaponStrength ?? 0) + 1 - this.mercyModifier < 0) {
        this.end('spare');
      } else this.dummyTurn();
    }
  }

  updateFight(delta) {
    super.updateFight(delta);
    if (this.mode === 'pages' && this.damage !== undefined) {
      this.head.setVisible(false); this.legs.setVisible(false);
    }
  }

  dummyTurn() {
    this.mode = 'intervention'; this.menu.setText(''); this.message.setText('');
    this.target.setVisible(false); this.bar.setVisible(false);
    this.head.setVisible(true); this.legs.setVisible(true); this.enemy.setTexture('spr_froggit:0');
    this.toriel.setVisible(true);
    this.tweens.add({ targets: this.toriel, x: 240, duration: 100 / 105 * 1000 });
    this.time.delayedCall(40 * 1000 / 30, () => {
      this.head.setVisible(false); this.legs.setVisible(false); this.enemy.setTexture('spr_froggit:2');
      this.time.delayedCall(30 * 1000 / 30, () => {
        this.enemy.setTexture('spr_froggit:3');
        this.tweens.add({ targets: this.enemy, x: -60, duration: (108 + 56) / 60 * 1000, onComplete: () => {
          this.toriel.setTexture('spr_torieldisapprove:1'); this.end('scared');
        } });
      });
    });
  }

  end(outcome) {
    this.pendingOutcome = outcome;
    this.head.setVisible(false); this.legs.setVisible(false); this.enemy.setVisible(false);
    this.xpReward = outcome === 'kill' ? 10 : 0;
    this.goldReward = outcome === 'kill' ? 20 : Math.floor(20 * (20 - this.enemyHp) / 20) + (this.mercyModifier === 30 && this.enemyHp === 20 ? 2 : 0);
    let line = this.text.win[0].replace(/\\+\[1\]/g, String(this.xpReward)).replace(/\\+\[2\]/g, String(this.goldReward));
    if (LEVEL_THRESHOLDS.filter((threshold) => (this.previousScene.xp ?? 0) + this.xpReward >= threshold).length > this.previousScene.lv) line += this.text.levelUp[0];
    this.showPages([line], () => this.finishWith(outcome));
  }

  finishWith(outcome) {
    const world = this.previousScene;
    if (outcome === 'flee') world.flags[11] = 1;
    else {
      world.xp = (world.xp ?? 0) + this.xpReward;
      world.gold = (world.gold ?? 0) + this.goldReward;
      if (outcome === 'kill') { world.kills = (world.kills ?? 0) + 1; world.flags[12] = 1; }
      else { world.flags[10] = 1; world.flags[23] = (world.flags[23] ?? 0) + 1; }
      world.lv = LEVEL_THRESHOLDS.filter((threshold) => world.xp >= threshold).length;
      world.xp = Math.min(99999, world.xp);
      world.maxHp = world.lv === 20 ? 99 : 16 + world.lv * 4;
    }
    world.flags[30] = 1;
    this.finishBattle();
  }
}
