import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { addItem } from './inventory.mjs';

// room_ruins14: công tắc dưới hố, Ribbon, lần gặp lại ma và Vegetoid ngoài trận.
export class Ruins14Lesson {
  constructor(world) {
    this.world = world; this.text = world.dataSource.ruins14Dialogue; this.locked = false;
    this.entries = world.roomObjects.filter(({ item }) => ['obj_ribbon_pickup', 'obj_napstablook2', 'obj_vegetoid_overworld'].includes(item.ObjectName));
    for (const entry of this.entries) {
      const name = entry.item.ObjectName;
      entry.image.setDepth(entry.item.Y + entry.sprite.Height);
      entry.body = createCollider(world.dataSource, entry.item); world.colliders.push(entry.body);
      if (name === 'obj_ribbon_pickup' && world.flags[100] === 1
        || name === 'obj_napstablook2' && (world.flags[36] !== 1 || world.flags[202] > 15 || world.flags[7] === 1)
        || name === 'obj_vegetoid_overworld' && (world.flags[202] > 11 || world.flags[7] === 1)) this.remove(entry);
    }
    this.button = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_plotswitch3');
    this.wall = world.colliders.find((body) => body.objectName === 'obj_plotwall6');
    this.syncSwitch();
  }

  remove(entry) {
    entry.removed = true; entry.body.disabled = true; entry.image.destroy();
    this.world.roomObjects = this.world.roomObjects.filter((candidate) => candidate !== entry);
  }

  syncSwitch() {
    const open = this.world.plot > 12;
    this.wall.disabled = open; this.button.image.setTexture(`spr_switch:${Number(open)}`);
    for (const spike of this.world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room'))
      spike.image.setTexture(`spr_spiketile:${Number(open)}`);
  }

  update() { return this.locked; }

  interact() {
    const world = this.world;
    const sign = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_readable_room1');
    if (sign && inInteractionRange(world, sign)) { world.showDialogue(this.text.sign); return true; }
    if (inInteractionRange(world, this.button)) {
      if (world.plot <= 12) {
        world.plot = 13; this.syncSwitch(); this.locked = true;
        world.sound.play('snd_screenshake');
        const camera = world.cameras.main, originalX = camera.scrollX;
        let offset = 4;
        this.shakeTimer = world.time.addEvent({ delay: 1000 / 30, loop: true, callback: () => {
          camera.scrollX += offset;
          if (offset < 0) offset++;
          offset = -offset;
          if (offset === 0) { this.shakeTimer.remove(); camera.scrollX = originalX; this.locked = false; }
          else this.shakeTimer.delay = 2 * 1000 / 30;
        } });
      }
      return true;
    }
    const entry = this.entries.find((entry) => !entry.removed && !entry.fading && inInteractionRange(world, entry));
    if (!entry) return false;
    if (entry.item.ObjectName === 'obj_ribbon_pickup') {
      const received = addItem(world, 12);
      if (received) world.flags[100] = 1;
      world.showDialogue(this.text[received ? 'ribbon' : 'full'], { onClose: () => { if (received) this.remove(entry); } });
    } else if (entry.item.ObjectName === 'obj_napstablook2') {
      world.showDialogue(this.text.nap, { onClose: () => {
        entry.fading = true;
        this.fade = world.tweens.add({ targets: entry.image, alpha: 0, duration: 18 * 1000 / 30,
          onComplete: () => { world.flags[36] = 2; this.remove(entry); this.fade = null; } });
      } });
    } else {
      // Hard Mode dùng Parsnik (nhóm 122), chưa chuyển; không thay bằng trận thường.
      if (world.flags[6] === 1) return false;
      this.locked = true; entry.image.setTexture('spr_vegetableoutside:1'); world.sound.play('snd_b');
      this.battleTimer = world.time.delayedCall(25 * 1000 / 30, () => {
        world.flags[200] = 202;
        for (const flag of [10, 11, 12, 13]) world.flags[flag] = 0;
        this.remove(entry); this.locked = false; world.release(); window.__remake.startBattle('vegetoid');
      });
    }
    return true;
  }

  destroy() { this.shakeTimer?.remove(); this.battleTimer?.remove(); this.fade?.stop(); }
}
