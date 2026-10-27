import { murderLevel } from './route.mjs';

// obj_encounterer_tundra1/jerry, scr_steps và obj_battleblcon.
export class SnowdinEncounter {
  constructor(world, spawnName = 'obj_mainchara') {
    this.world = world; this.count = 0; this.empty = 0;
    this.jerry = world.dataSource?.room.GameObjects.some((e) => e.ObjectName === 'obj_encounterer_jerry') ?? false;
    this.gyftrot = world.dataSource?.room.GameObjects.some((e) => e.ObjectName === 'obj_encoutnerer_gyftrot') ?? false;
    this.steps = this.threshold(this.gyftrot ? spawnName === 'obj_markerA' ? 160 : 300 : this.jerry && world.dataSource.name === 'room_tundra_snowpuzz' && world.flags[64] ? 220 : 120, 30);
    this.disabled = (!world.flags[203] && world.plot > 100) || (this.jerry && world.dataSource.name === 'room_tundra_dangerbridge' && world.plot < 67);
  }

  threshold(base, spread) {
    const flags = this.world.flags; flags[200] = 203;
    const left = 16 - (flags[203] ?? 0);
    if (left > 0) return (base + Math.round(Math.random() * spread)) * Math.min(8, 16 / left);
    if (this.empty < 2) { this.empty = 1; return 20; }
    return (base + Math.round(spread / 2)) * 5;
  }

  step() { if (!this.disabled) this.count++; }

  select() {
    const world = this.world, flags = world.flags;
    if (this.jerry || this.gyftrot) {
      let group = Math.round(Math.random() * 15) > 8 ? 36 : 35;
      if (this.gyftrot) group = 28;
      if ((flags[70] ?? 0) < 3) { group = 24; flags[70] = 4; }
      if (this.empty) group = 19;
      return group === 24 ? 'lesserDog' : group === 19 ? 'nobody' : group === 28 ? 'gyftrot' : `snowdinGroup${group}`;
    }
    let group = Math.floor(Math.random() * 15) < 8 ? 30 : 32;
    const seen = flags[70] ?? 0;
    if (seen === 0) group = 30;
    if (seen === 1) group = 32;
    if (seen === 2) {
      if (world.plot < 42) group = Math.random() < .5 ? 30 : 32;
      if (world.plot >= 42 || murderLevel(flags) >= 2) { group = 24; flags[70] = 4; }
    }
    if (seen < 2) flags[70] = seen + 1;
    if (this.empty) group = 19;
    return group === 24 ? 'lesserDog' : group === 32 ? 'icecap' : group === 19 ? 'nobody' : flags[57] === 2 ? 'chilldrake' : 'snowdrake';
  }

  update() {
    const world = this.world;
    if (this.disabled || window.__remake.phase !== 'running' || world.dialogue || this.count <= this.steps || this.timer) return;
    this.steps = this.jerry || this.gyftrot ? this.threshold(840, 680) : this.threshold(140, 280); this.count = 0;
    const config = this.select();
    // Lần đầu cạn dân số chỉ đặt cờ; lần kích hoạt kế mới vào nhóm19.
    if (this.empty === 1) { world.flags[222] = 1; this.empty = 2; return; }
    window.__remake.phase = 'encounter'; world.sound.play('snd_b');
    const sprite = murderLevel(world.flags) >= 8 && !world.flags[27] ? 'spr_exc_f' : 'spr_exc';
    this.icon = world.add.image(world.player.x, world.player.y - 11, `${sprite}:0`).setOrigin(0).setDepth(world.player.depth);
    this.timer = world.time.delayedCall((15 + Math.random() * 5) * 1000 / 30, () => {
      this.icon.destroy(); this.icon = null; this.timer = null;
      world.flags[201] = world.kills;
      for (const flag of [10, 11, 12, 13]) world.flags[flag] = 0;
      world.saveGame(true); world.release(); world.menuPressed = false; world.confirmPressed = false;
      window.__remake.phase = 'running'; window.__remake.startBattle(config);
    });
  }

  destroy() { this.timer?.remove(); this.icon?.destroy(); }
}
