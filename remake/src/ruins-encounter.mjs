// obj_encounter_ruins1, scr_steps và obj_battleblcon.
export class RuinsEncounter {
  constructor(world) {
    this.world = world; this.count = 0; this.empty = 0;
    this.steps = this.threshold(80, 40);
  }

  threshold(base, spread) {
    const world = this.world;
    world.flags[200] = 202;
    const left = 20 - (world.flags[202] ?? 0);
    if (left > 0) return (base + Math.round(Math.random() * spread)) * Math.min(8, 20 / left);
    if (this.empty < 2) { this.empty = 1; return 20; }
    return (base + Math.round(spread / 2)) * 5;
  }

  step() { this.count++; }

  update() {
    const world = this.world;
    // Các nhóm quái Hard Mode 120/125/126 sẽ được chuyển riêng cùng hệ thống nhiều quái.
    if (world.flags[6] === 1 || world.dialogue || this.count <= this.steps || this.timer) return;
    this.steps = this.threshold(190, 80); this.count = 0;
    const config = this.empty ? 'nobody' : Math.random() * 2 <= 1 ? 'froggit' : 'whimsun';
    if (this.empty === 1) this.empty = 2;
    world.flags[201] = world.kills;
    for (const flag of [10, 11, 12, 13]) world.flags[flag] = 0;
    window.__remake.phase = 'encounter';
    world.sound.play('snd_b');
    const icon = world.add.image(world.player.x, world.player.y - 11, 'spr_exc:0').setOrigin(0).setDepth(10000);
    this.timer = world.time.delayedCall((15 + Math.random() * 5) * 1000 / 30, () => {
      icon.destroy(); this.timer = null;
      window.__remake.phase = 'running'; window.__remake.startBattle(config);
    });
  }

  destroy() { this.timer?.remove(); }
}
