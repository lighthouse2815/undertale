// Quy tắc lượt của Undyne thường; scene chịu trách nhiệm lời thoại và chuyển cảnh.
export class UndyneBattleRules {
  constructor() {
    this.order = 1; this.lesson = 1; this.rating = 16; this.ratingb = 0; this.berserk = false; this.hitfirst = 0; this.lastShieldHits = 0;
  }
  prepareDialogue({ green, hp, maxHp, flag99 = 0 }) {
    let damageCause = 0;
    if (green) {
      if (hp < maxHp * .75 && this.lesson < 5) { this.lesson = 6; this.order = 6; damageCause = 1; }
      if (hp < maxHp * .5 && this.lesson < 11) { this.lesson = 11; this.order = 12; damageCause = 2; }
      if (hp < maxHp * .2 && this.lesson < 20) { this.lesson = 20; this.order = 22; damageCause = 3; this.rating += 2; }
    }
    if (this.order === 12 && flag99 < 2) flag99 = 2;
    if (this.order === 22 && flag99 < 3) flag99 = 3;
    let earlyReaction = 0;
    if (this.order === 2 && this.lastShieldHits > 0 && this.hitfirst < 4) {
      earlyReaction = ++this.hitfirst;
      if (earlyReaction === 4) { this.rating = 6; this.berserk = true; this.order = 12; this.lesson = 11; }
      else { this.order = 1; this.lesson = 1; }
    }
    return { damageCause, flag99, earlyReaction };
  }
  prepareAttack({ green, command }) {
    const lesson = this.lesson;
    let kind = 'green', firingRate = 15;
    if (!green) {
      kind = command <= 50 ? 'follow' : 'rising';
      this.ratingb = Math.min(9, this.ratingb + 1);
      firingRate = (kind === 'follow' ? 19 : 23) - this.ratingb;
      this.lesson--;
    }
    this.order++; this.lesson++;
    return { kind, lesson, rating: this.rating, firingRate, order: this.order };
  }
  finishAttack(hits) {
    this.lastShieldHits = hits;
    if (hits > 0) {
      this.rating += hits === 1 ? 1 : 2;
      if (this.berserk) this.rating--;
    } else {
      if (this.rating >= 10 && this.lesson > 5) this.rating -= 2;
      else if (this.rating > 8) this.rating--;
      if (this.berserk && this.rating > 6) this.rating--;
    }
  }
  challenge() {
    const next = { 8: 7, 9: 8, 10: 9, 11: 10, 12: 10, 13: 11, 14: 11, 15: 12, 16: 12 }[this.rating];
    if (next === undefined) return false;
    this.rating = next;
    if (this.ratingb < 6) this.ratingb++;
    return true;
  }
  plead() {
    const nextB = { 7: 6, 8: 7, 9: 7 }[this.ratingb];
    const next = { 7: 9, 8: 10, 9: 10 }[this.rating];
    if (nextB !== undefined) this.ratingb = nextB;
    if (next !== undefined) this.rating = next;
    return next !== undefined || nextB !== undefined;
  }
}
