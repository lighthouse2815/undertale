import { touchesObject, walkNpc } from './npc.mjs';

export const BASEMENT_ROOMS = ['room_basement1', 'room_basement2', 'room_basement3'];
export function stopBasementMusic(world) { world.basementMusic?.destroy(); world.basementMusic = null; }

// obj_torieltrigger8–11: đưa về trên lầu và ba lời cảnh báo trước cửa Ruins.
export class TorielBasement {
  constructor(world) {
    this.world = world; this.text = world.dataSource.basementDialogue; this.stage = 'waiting'; this.locked = false;
    const name = world.dataSource.name;
    const stairs = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_downstairs');
    stairs?.image.setDepth(-stairs.object.Depth);
    this.early = name === 'room_basement1' && world.plot < 20;
    this.requiredPlot = { room_basement1: 21, room_basement2: 22, room_basement3: 23 }[name];
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === `obj_torieltrigger${this.early ? 8 : this.requiredPlot - 12}`);
    if (!this.early && world.plot === this.requiredPlot) this.spawnTimer = world.time.delayedCall(2 * 1000 / 30, () => {
      this.npc = world.add.image(name === 'room_basement3' ? 140 : 370, 90,
        `spr_toriel_${name === 'room_basement3' ? 'u' : 'd'}:0`).setOrigin(0).setDepth(143);
    });
    const key = world.flags[7] === 1 ? 'mus_reunited' : 'mus_intronoise', rate = key === 'mus_intronoise' ? .3 : 1;
    if (world.basementMusic?.key !== key || world.basementMusic.pendingRemove) {
      stopBasementMusic(world);
      world.basementMusic = world.sound.add(key, { loop: true, volume: key === 'mus_intronoise' ? .4 : 1, rate });
      world.basementMusic.play();
    }
    this.music = world.basementMusic;
  }

  update() { return this.locked; }

  checkTrigger(previous) {
    const world = this.world;
    if (this.stage !== 'waiting' || !this.trigger || world.dialogue
      || !this.early && (world.plot !== this.requiredPlot || !this.npc?.active)
      || !touchesObject(world, world.player, this.trigger, 1, 100)) return false;
    world.player.setPosition(previous.x, previous.y); world.release(); this.locked = true; this.stage = 'warning';
    if (this.early) {
      this.npc = world.add.image(60, 95, 'spr_toriel_r:0').setOrigin(0).setDepth(148);
      this.path = walkNpc(world, this.npc, 'path_torielwalkbasement1', { absolute: false, speed: 5, onComplete: () => {
        const count = (world.flags[44] ?? 0) + 1; world.flags[44] = world.plot < 19 ? 0 : count; world.flags[45] = 1;
        world.showDialogue(world.plot < 19 ? this.text.beforeRoom : [this.text.early[Math.min(9, count - 1)]],
          { portrait: 'spr_face_torieltalk', onClose: () => this.returnUpstairs() });
      } });
    } else {
      const key = { 21: 'first', 22: 'second', 23: 'third' }[this.requiredPlot];
      world.showDialogue(this.text[key], { portrait: this.requiredPlot === 21 ? 'spr_face_torieltalk' : 'spr_face_torielcold', onClose: () => {
        world.plot = this.requiredPlot + 1; this.stage = 'leaving'; this.locked = false;
        this.path = walkNpc(world, this.npc, this.requiredPlot === 23 ? 'path_walkup' : 'path_walkright', {
          absolute: false, speed: 4, onComplete: () => { this.npc.destroy(); this.stage = 'complete'; } });
      } });
    }
    return true;
  }

  returnUpstairs() {
    const world = this.world, player = world.player;
    player.y = 128; player.setVisible(false); this.stage = 'returning';
    const offset = { x: player.x - this.npc.x, y: player.y - this.npc.y };
    this.path = walkNpc(world, this.npc, 'path_torielwalkbasement2', { absolute: false, speed: 5,
      sprites: { l: 'spr_toriel_handhold_l', u: 'spr_toriel_handhold_l' }, onUpdate: (npc) => {
        npc.setDepth(npc.y + 53); player.setPosition(npc.x + offset.x, npc.y + offset.y); world.updateCamera();
        const door = world.findDoor(player.x, player.y);
        if (door && window.__remake.phase === 'running') world.transitionRoom(door.destination, door.marker, door.duration);
      } });
  }

  destroy() { this.spawnTimer?.remove(); this.path?.stop(); this.world.player?.setVisible(true); }
}
