import { RuinsBattle } from './ruins-battle.mjs';
import { fightInput } from './fight-input.mjs';

// Điều khiển mục tiêu/ACT/FIGHT dùng chung cho trận nhiều quái; hành vi từng nhóm nằm ở scene con.
export class MultiBattle extends RuinsBattle {
  async create() {
    await super.create(); if (window.__remake.phase === 'error') return;
    const old = this.onKeyDown; window.removeEventListener('keydown', old);
    this.onKeyDown = (event) => {
      if (this.mode === 'submenu' && this.kind === 'act' && event.code.startsWith('Arrow')) {
        if (event.repeat) return;
        const rows = Math.max(1, Math.ceil(this.submenu.length / 2)), row = this.subIndex % rows, column = Math.floor(this.subIndex / rows);
        if (event.code === 'ArrowLeft') this.subIndex = row;
        if (event.code === 'ArrowRight') this.subIndex = Math.min(this.submenu.length - 1, row + rows);
        if (event.code === 'ArrowUp') this.subIndex = Math.max(column * rows, this.subIndex - 1);
        if (event.code === 'ArrowDown') this.subIndex = Math.min(this.submenu.length - 1, column * rows + Math.min(rows - 1, row + 1));
      } else old(event);
    };
    window.addEventListener('keydown', this.onKeyDown);
  }
  live() { return this.enemies.filter((enemy) => enemy.alive && !enemy.away); }
  spareable(enemy = this.enemies?.[this.selected]) {
    const w = this.previousScene;
    return !!enemy?.alive && !enemy.away && enemy.hp - (w.lv === 20 ? 99 : 8 + w.lv * 2) - w.weaponStrength - (this.attackBonus ?? 0) - (this.cardAttackBonus ?? 0) + enemy.def - enemy.mercy < 0;
  }
  clearLabels() { this.labels.forEach((label) => label.destroy()); this.labels = []; this.labelsKind = null; }
  choose(kind, items) {
    this.clearLabels();
    if (kind.endsWith('Target')) { this.targetOptions = this.live(); items = this.targetOptions.map((enemy) => enemy.name); }
    super.choose(kind, items);
  }
  drawSubmenu() {
    if (!['act', 'actTarget', 'fightTarget', 'mercy'].includes(this.kind)) { super.drawSubmenu(); return; }
    this.menu.setText(''); const act = this.kind === 'act', mercy = this.kind === 'mercy', rows = Math.max(1, Math.ceil(this.submenu.length / 2));
    if (this.labelsKind !== this.kind) {
      this.clearLabels(); this.labelsKind = this.kind;
      this.labels = this.submenu.map((_, i) => this.add.bitmapText(act && i >= rows ? 172 : 32, 133 + (act ? i % rows : i) * 16, 'fnt_maintext', '', 12));
    }
    for (const [i, label] of this.labels.entries()) {
      label.setText(`${this.subIndex === i ? '>' : ' '} * ${this.submenu[i]}`);
      const yellow = !act && (mercy ? i === 0 && this.live().some((enemy) => this.spareable(enemy)) : this.spareable(this.targetOptions[i]));
      const preference = this.previousScene.flags[22];
      label.setFont(yellow && preference !== 1 ? `fnt_maintext:${preference === 2 ? 'pink' : 'yellow'}` : 'fnt_maintext');
    }
  }
  selectTarget() {
    const enemy = this.targetOptions[this.subIndex]; this.selected = enemy.index; this.enemy = enemy.main;
    this.enemyHp = enemy.hp; this.enemyMaxHp = enemy.maxHp ?? enemy.hp; this.config = { ...this.config, def: enemy.def };
    return enemy;
  }
  updateFight(delta) {
    const enemy = this.enemies[this.selected], hit = fightInput(this, delta, enemy.def); if (!hit) return;
    if (hit.miss) { this.damage = 0; this.showPages(['* MISS'], () => this.dummyTurn()); return; }
    this.damage = Math.ceil(hit.damage / (enemy.damageDivisor ?? 1)); enemy.hp = Math.max(0, enemy.hp - this.damage); this.enemyHp = enemy.hp;
    this.hurtEnemy(enemy); this.showPages([String(this.damage)], () => {
      if (!enemy.hp) this.removeEnemy(enemy, true);
      if (!this.live().length) this.end(); else this.dummyTurn();
    });
  }
}
