import { inInteractionRange, touchesObject } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { addItem } from './inventory.mjs';
import { spawnStalkerFlowey, updateStalkerFlowey } from './stalker-flowey.mjs';

// Froggit nhỏ, cuộc gọi bánh của Toriel và Spider Bake Sale.
export class Ruins13Lesson {
  constructor(world) {
    this.world = world;
    this.text = world.dataSource.ruins13Dialogue;
    this.entries = world.roomObjects.filter(({ item }) => ['obj_smallfrog', 'obj_smallfrog_xadvice',
      'obj_readable_sign2', 'obj_readable_room1', 'obj_sign_room', 'obj_smallweb', 'obj_bigweb'].includes(item.ObjectName));
    this.entries = this.entries.filter((entry) => {
      const frog = entry.item.ObjectName.startsWith('obj_smallfrog');
      if (frog && (world.kills > 16 || (entry.item.ObjectName === 'obj_smallfrog_xadvice' && world.flags[25] > 5 && world.flags[7] !== 1))) {
        entry.image.destroy(); return false;
      }
      if (entry.object.Solid) world.colliders.push(createCollider(world.dataSource, entry.item));
      return true;
    });
    // Trigger không có ảnh, phải đọc từ dữ liệu phòng thay vì roomObjects.
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_torielcall5');
    this.called = world.plot > 11;
  }

  animate() {
    for (const entry of this.entries) if (entry.item.ObjectName.startsWith('obj_smallfrog')) {
      const frame = Math.floor(this.world.time.now * 3 / 1000) % entry.sprite.TextureCount;
      entry.image.setTexture(`spr_smallfrog:${frame}`);
    }
    updateStalkerFlowey(this.world, this.flowey);
  }

  update() {
    const world = this.world;
    if (this.called || !this.trigger || !touchesObject(world, world.player, this.trigger, 1, 400)) return false;
    this.called = true;
    world.sound.play('snd_phone');
    this.flowey = spawnStalkerFlowey(world, 140, 200);
    const pages = world.flags[6] === 1 ? this.text.callHard : this.text.call;
    world.showDialogue(pages.map((page) => page.text), {
      onPage: (index) => world.setDialoguePortrait(pages[index].portrait),
      onClose: () => { world.plot = 12; },
    });
    return true;
  }

  interact() {
    const world = this.world;
    const entry = this.entries.find((candidate) => inInteractionRange(world, candidate));
    if (!entry) return false;
    const name = entry.item.ObjectName;
    if (name === 'obj_smallweb' || name === 'obj_bigweb') this.buy(name === 'obj_smallweb');
    else if (name === 'obj_smallfrog_xadvice') {
      const lines = [...(world.flags[7] === 1 ? this.text.adviceEnd : this.text.advice)];
      world.showDialogue(lines, { onCancel: () => {
        if (world.dialogue.index > 1) {
          lines[4] = world.flags[7] === 1 ? this.text.skippedEnd : this.text.skipped;
          if (world.dialogue.index === 4) world.dialogueText.setText(lines[4]);
        }
      } });
    } else if (name === 'obj_smallfrog' && entry.item.X > 400) this.names();
    else world.showDialogue(name === 'obj_smallfrog' ? (world.flags[7] === 1 ? this.text.fullscreenEnd : this.text.fullscreen)
      : name === 'obj_readable_sign2' ? this.text.sign : name === 'obj_readable_room1' ? this.text.wall : this.text.bakesale.sign);
    return true;
  }

  names() {
    const world = this.world, text = this.text.names, preference = world.flags[22] ?? 0;
    if (world.flags[7] === 1) { world.showDialogue(text.end[preference]); return; }
    if (preference === 2) { world.showDialogue(text.pink); return; }
    if (preference === 1) {
      world.showDialogue(text.without, { onClose: () => world.showChoice('', ["It's great", 'Bring them back'], (choice) => {
        if (choice === 1) world.flags[22] = 2;
        world.showDialogue(choice === 0 ? text.great : text.restore);
      }) });
      return;
    }
    world.showDialogue(text.intro, { onClose: () => world.showChoice(text.question, ['Very helpful', "It's bad"], (choice) => {
      if (choice === 0) { world.showDialogue(text.helpful); return; }
      world.showDialogue(text.bad, { onClose: () => world.showChoice('', ['Keep yellow', 'No more yellow'], (remove) => {
        if (remove === 1) world.flags[22] = 1;
        world.showDialogue(remove === 0 ? text.keep : text.remove);
      }) });
    }) });
  }

  buy(small) {
    const world = this.world, text = this.text.bakesale[small ? 'small' : 'big'];
    const cost = small ? 7 : 18;
    world.showChoice(text.prompt, ['Yes', 'No'], (choice) => {
      let lines;
      if (choice === 1) lines = text.no;
      else if (world.gold < cost) lines = text.poor;
      else if (!addItem(world, small ? 7 : 10)) lines = text.full;
      else {
        world.gold -= cost;
        world.flags[59] = (world.flags[59] ?? 0) + cost;
        lines = text.success;
      }
      world.showDialogue(lines);
    });
  }

  destroy() { this.flowey?.destroy(); }
}
