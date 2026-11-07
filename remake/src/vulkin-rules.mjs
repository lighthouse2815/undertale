// Quy tắc obj_vulkin, nhóm 51; scene chiến đấu xử lý vẽ và đạn.
export class VulkinRules {
  constructor() {
    this.mercyModifier = -40; this.encouraged = 0; this.criticized = 0; this.hugged = 0; this.lastAct = null;
  }

  act(action, defense) {
    this.lastAct = action;
    if (action === 'check') return { text: 'check', defense };
    if (action === 'criticize') {
      const text = this.criticized === 1 ? 'criticizeAgain' : 'criticize';
      this.criticized++; this.encouraged = 0; this.hugged = 0; this.mercyModifier = -200;
      return { text, defense };
    }
    if (action === 'encourage') {
      this.encouraged++; this.criticized = 0; this.hugged = 0; this.mercyModifier = 100;
      return { text: 'encourage', defense };
    }
    if (action === 'hug') {
      this.hugged++; this.encouraged = 0; this.criticized = 0; this.mercyModifier = 100;
      return { text: defense >= 5 ? 'hugDefense' : 'hug', defense: defense >= 5 ? defense - 5 : defense };
    }
    throw new Error(`ACT Vulkin không hợp lệ: ${action}`);
  }

  speech({ hp, maxHp, command }) {
    if (this.lastAct === 'encourage') return 'speechEncourage';
    if (this.lastAct === 'criticize') return this.criticized === 2 ? 'speechCriticizeAgain' : 'speechCriticize';
    if (this.lastAct === 'hug') return this.hugged === 3 ? 'speechHugThird' : this.hugged === 2 ? 'speechHugAgain' : 'speechHug';
    const side = command < 50 ? 0 : 1;
    if (this.encouraged) return `speechEncouraged${side}`;
    if (this.hugged) return `speechHugged${side}`;
    if (this.criticized) return `speechCriticized${side}`;
    return `speech${hp < maxHp ? 'Hurt' : 'Full'}${side}`;
  }

  attack({ hp, maxHp, population = 1 }) {
    const lava = this.lastAct === 'encourage' || hp < maxHp;
    let rate = lava ? 7 * (population === 3 ? 2.4 : population === 2 ? 1.7 : 1) : 9;
    if (this.encouraged) rate -= lava ? 2 : 4;
    if (!lava) rate *= population === 3 ? 2.6 : population === 2 ? 1.7 : 1;
    const kind = this.criticized ? 'none' : lava ? 'lava' : 'cloud';
    this.lastAct = null;
    return { kind, rate, duration: kind === 'none' && population === 1 ? 0 : 160 };
  }

  bonus(enemyHp, maxEnemyHp) { return this.mercyModifier > 10 && enemyHp === maxEnemyHp ? 40 : 0; }
}
