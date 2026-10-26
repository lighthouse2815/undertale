import { touchesObject, walkNpc } from './npc.mjs';

// Chuyển obj_torieltrigger1, obj_floorswitch1 và obj_wallswitchcut1 sang JavaScript.
export class RuinsTutorial {
  constructor(world) {
    this.world = world;
    this.stage = world.plot > 2 ? 'complete' : 'waiting';
    this.gateOpen = world.plot > 2;
    this.locked = false;
    this.timers = [];
    this.npc = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_toroverworld3')?.image;
    this.gate = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_ruinsdoor1')?.image;
    this.switches = world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_floorswitch1');
    this.wallSwitch = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_wallswitchcut1');
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_torieltrigger1');
    this.buster = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_toribuster');
  }

  update() {
    const world = this.world;
    for (const entry of this.switches) {
      if (entry.on) continue;
      if (touchesObject(world, world.player, entry.item) || (this.npc?.active && touchesObject(world, this.npc, entry.item))) {
        entry.on = true;
        entry.image.setTexture('spr_groundswitch1:1');
        world.sound.play('snd_noise');
      }
    }
    if (this.stage === 'waiting' && touchesObject(world, world.player, this.trigger, 50)) {
      this.stage = 'welcome'; this.locked = true;
      world.showDialogue(world.dataSource.tutorialDialogue.welcome, { portrait: true, onClose: () => this.demonstrate() });
    }
    if (this.stage === 'complete' && this.npc?.active && Math.abs(world.player.y - this.npc.y) < 50) {
      this.stage = 'leaving';
      this.chain = walkNpc(world, this.npc, 'path_walkup', { absolute: false, onComplete: () => { this.npc.destroy(); } });
    }
    if (this.stage === 'leaving' && this.npc?.active && touchesObject(world, this.npc, this.buster)) {
      this.chain.stop(); this.npc.destroy();
    }
    return this.locked;
  }

  demonstrate() {
    this.stage = 'demonstrating';
    this.chain = walkNpc(this.world, this.npc, 'path_torielwalk2', { onComplete: () => {
      this.wallSwitch.on = true;
      this.wallSwitch.image.setTexture('spr_switch:1');
      this.world.sound.play('snd_noise');
      this.gateOpen = true;
      this.gate.destroy();
      this.npc.setTexture('spr_toriel_u:0');
      this.timers.push(this.world.time.delayedCall(20 * 1000 / 30, () => {
        this.stage = 'returning';
        this.chain = walkNpc(this.world, this.npc, 'path_torielwalk2_2', { onComplete: () => { this.npc.setTexture('spr_toriel_d:0'); } });
        this.timers.push(this.world.time.delayedCall(40 * 1000 / 30, () => {
          this.stage = 'explanation';
          this.world.showDialogue(this.world.dataSource.tutorialDialogue.explanation, { portrait: true, onClose: () => {
            this.world.plot = 3;
            this.stage = 'complete'; this.locked = false;
          } });
        }));
      }));
    } });
  }

  destroy() {
    this.chain?.stop();
    for (const timer of this.timers) timer.remove();
  }
}
