import { inInteractionRange, touchesObject } from './npc.mjs';
import { createCollider } from './movement.mjs';

const COLORS = { obj_redswitch_1: 0, obj_blueswitch_1: 1, obj_greenswitch_1: 2 };
const SOLUTIONS = { room_ruins15B: [1, 14], room_ruins15C: [0, 15], room_ruins15D: [2, 16] };

// obj_*switch_1, SCR_TEXT 519–522: cùng một phòng nhìn từ bốn phía.
export class RuinsPerspective {
  constructor(world) {
    this.world = world; this.text = world.dataSource.perspectiveDialogue;
    this.solution = SOLUTIONS[world.dataSource.name]; this.stage = 'idle'; this.elapsed = 0;
    this.switches = world.roomObjects.filter(({ item }) => item.ObjectName in COLORS);
    for (const entry of this.switches) {
      entry.image.setTexture(`spr_colorswitch:${COLORS[entry.item.ObjectName]}`).setDepth(entry.item.Y + entry.sprite.Height);
      world.colliders.push(createCollider(world.dataSource, entry.item));
    }
    for (const pillar of world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_pillar_1'))
      pillar.image.setDepth(pillar.item.Y + pillar.sprite.Height);
    this.wall = world.colliders.find((body) => body.objectName === 'obj_plotwall_room');
    if (this.wall) {
      const item = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_plotwall_room');
      Object.assign(this.wall, createCollider(world.dataSource, { ...item,
        ScaleX: world.dataSource.name === 'room_ruins15C' ? 400 : 1,
        ScaleY: world.dataSource.name === 'room_ruins15C' ? 1 : 400 }));
    }
    this.help = world.flags[51] === 2 ? world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_switchhelptrigger') : null;
    this.syncSpikes();
  }

  syncSpikes() {
    const world = this.world, open = this.solution && world.plot >= this.solution[1];
    if (this.wall) this.wall.disabled = Boolean(open);
    for (const entry of world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room')) {
      const gated = this.solution && (world.dataSource.name === 'room_ruins15B' ? entry.item.X < 60
        : world.dataSource.name === 'room_ruins15C' ? entry.item.X < 160 : entry.item.X > 320);
      entry.image.setTexture(`spr_spiketile:${Number(gated ? Boolean(open) : world.plot > 0)}`);
    }
  }

  checkTrigger(previous) {
    const world = this.world;
    if (!this.help || !touchesObject(world, world.player, this.help, 100, 1)) return false;
    if (previous) world.player.setPosition(previous.x, previous.y);
    this.help = null;
    world.showDialogue(this.text.help, { onClose: () => { world.flags[51] = (world.flags[51] ?? 0) + 1; } });
    return true;
  }

  interact() {
    const world = this.world;
    const sign = world.roomObjects.find((entry) => entry.item.ObjectName === 'obj_readable_room1' && inInteractionRange(world, entry));
    if (sign) { world.showDialogue(this.text.signs[world.dataSource.name]); return true; }
    const entry = this.switches.find((entry) => inInteractionRange(world, entry));
    if (!entry) return false;
    const color = COLORS[entry.item.ObjectName];
    // Công tắc sai làm rơi ngay khi tương tác, không hỏi Yes/No.
    if (this.solution && color !== this.solution[0]) { this.startFall(color); return true; }
    world.showChoice(this.text.prompt, ['Yes', 'No'], (choice) => {
      world.flags[43] = (world.flags[43] ?? 0) + 1;
      if (this.solution) {
        if (choice !== 0) return;
        if (world.plot < this.solution[1]) { world.plot = this.solution[1]; world.sound.play('snd_switchpull_n'); this.syncSpikes(); }
        world.showDialogue(this.text.click);
      } else if (world.flags[43] > 25) world.showDialogue(this.text.attention);
      else if (choice === 0) world.showDialogue(this.text.nothing);
    });
    return true;
  }

  startFall(color) {
    const world = this.world;
    if (world.dataSource.name === 'room_ruins15B') world.flags[51] = (world.flags[51] ?? 0) + 1;
    if (color === 0) world.sound.play('snd_noise');
    this.mark = world.add.image(world.player.x, world.player.y + 20, 'spr_hole:0').setOrigin(0).setDepth(-70000);
    this.frames = 0; this.elapsed = 0; this.stage = 'waiting'; world.release();
  }

  update(delta) {
    if (this.stage === 'idle') return false;
    const world = this.world, player = world.player;
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      if (this.frames === 30) {
        this.stage = 'falling'; player.setAlpha(.5); world.sound.play('snd_fall2'); world.cameras.main.fadeOut(13 * 1000 / 30);
      } else if (this.frames > 30) {
        player.y += 5; player.setDepth(player.y + 30);
      }
      if (this.frames >= 30 && (this.frames - 30) % 4 === 0) {
        player.facing = { d: 'r', r: 'u', u: 'l', l: 'd' }[player.facing];
        player.setTexture(`spr_mainchara${player.facing}:0`);
      }
      if (this.frames === 50) { this.stage = 'leaving'; world.transitionRoom('room_ruins15E', 'obj_markerX', 0); break; }
    }
    world.updateCamera();
    return true;
  }

  destroy() { this.mark?.destroy(); if (this.world.player?.active) this.world.player.setAlpha(1); }
}
