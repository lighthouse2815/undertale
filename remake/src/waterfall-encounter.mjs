import { murderLevel } from './route.mjs';

// obj_encounterer_water1, scr_steps và obj_battleblcon tại room_water5.
export class WaterfallEncounter {
  constructor(world, spawnName = 'obj_mainchara') {
    this.world = world; this.count = 0; this.empty = 0;
    this.firstEntrance = world.dataSource.name === 'room_water5' && !(world.flags[357] ?? 0) && spawnName === 'obj_markerA';
    const base = world.dataSource.name === 'room_water5' ? this.firstEntrance ? 20 : 340 : world.dataSource.name === 'room_water6' ? 110 : 360;
    this.steps = this.threshold(base, 30);
    this.disabled = !(world.flags[204] ?? 0) && world.plot > 121;
  }
  threshold(base, spread) {
    const flags = this.world.flags; flags[200] = 204; const left = 18 - (flags[204] ?? 0);
    if (left > 0) return (base + Math.round(Math.random() * spread)) * Math.min(8, 18 / left);
    if (this.empty < 2) { this.empty = 1; return 20; }
    return (base + Math.round(spread / 2)) * 5;
  }
  step() { if (!this.disabled) this.count++; }
  select() {
    const flags = this.world.flags, roll = Math.floor(Math.random() * 15), seen = flags[357] ?? 0;
    let group = roll < 4 ? 'waterfallGroup54' : roll < 7 ? 'aaron' : roll < 11 ? 'moldsmalGroup53' : 'woshua';
    if (seen === 0) group = 'aaron'; else if (seen === 1) group = 'woshua'; else if (seen === 2) group = 'moldsmalGroup53';
    flags[357] = seen + 1; return this.empty ? 'nobody' : group;
  }
  update() {
    const world = this.world;
    if (this.disabled || window.__remake.phase !== 'running' || world.dialogue || this.count <= this.steps || this.timer) return;
    this.steps = this.threshold(world.dataSource.name === 'room_water6' ? 1040 : 340, 380); this.count = 0;
    const config = this.select();
    if (this.empty === 1) { world.flags[223] = 1; this.empty = 2; return; }
    window.__remake.phase = 'encounter'; world.sound.play('snd_b');
    const sprite = murderLevel(world.flags) >= 8 && !world.flags[27] ? 'spr_exc_f' : 'spr_exc';
    this.icon = world.add.image(world.player.x, world.player.y - 11, `${sprite}:0`).setOrigin(0).setDepth(world.player.depth);
    this.timer = world.time.delayedCall((15 + Math.random() * 5) * 1000 / 30, () => {
      this.icon.destroy(); this.icon = null; this.timer = null;
      world.flags[201] = world.kills; for (const flag of [10, 11, 12, 13]) world.flags[flag] = 0;
      world.saveGame(true); world.release(); world.menuPressed = false; world.confirmPressed = false;
      if (this.firstEntrance) this.disabled = true;
      window.__remake.phase = 'running'; window.__remake.startBattle(config);
    });
  }
  destroy() { this.timer?.remove(); this.icon?.destroy(); }
}
