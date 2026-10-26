import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';
import { createCollider } from './movement.mjs';

// obj_toroverworld5/6, obj_torinteractable5 và obj_torhandhold1.
export class SpikeGuide {
  constructor(world) {
    this.world = world;
    this.text = world.dataSource.spikeDialogue;
    this.entry = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_toroverworld5');
    this.stage = this.entry ? 'intro' : 'complete';
    this.locked = false;
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_encountertrigger1');
    this.tiles = world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spiketile1');
    this.wall = world.colliders.find((body) => body.objectName === 'obj_plotwall2');
    this.wall.disabled = world.plot > 7;
  }

  updateMotion(delta) {
    const world = this.world;
    for (const entry of this.tiles) {
      const contact = (this.stage !== 'escort' && touchesObject(world, world.player, entry.item))
        || (this.stage === 'following' && touchesObject(world, this.entry.image, entry.item));
      if (contact) entry.until = world.time.now + 6 * 1000 / 30;
      entry.image.setTexture(`spr_spiketile:${entry.until > world.time.now ? 1 : 0}`);
    }
    if (this.stage === 'following') {
      const npc = this.entry.image;
      if (world.player.x < npc.x - 40) {
        if (!this.waiting) { this.waitTime = 1000; this.waiting = true; }
      } else {
        this.waitTime = 24 * 1000 / 30;
        this.chain.timeScale = world.player.x > npc.x - 10 ? 5 : world.player.x > npc.x - 25 ? 3 : 2;
      }
      this.waitTime -= delta;
      // Giữ điều kiện y/x trong Alarm_5 gốc, kể cả khi nó có vẻ khác thường.
      if (this.waitTime <= 0 && world.player.y < npc.x - 40) {
        this.chain.timeScale = 0; npc.setTexture('spr_toriel_l:0'); this.waiting = false;
      }
    }
  }

  update(delta) {
    const world = this.world;
    this.updateMotion(delta);
    if (this.stage === 'intro' && !world.dialogue) {
      this.stage = 'explaining';
      world.showDialogue(this.text.intro, { portrait: true, onClose: () => this.follow() });
    }
    if (!this.locked && !world.dialogue && world.flags[30] !== 1 && touchesObject(world, world.player, this.trigger, 1, 50)) {
      world.flags[30] = 1;
      window.__remake.startBattle('tutorialFroggit');
      return true;
    }
    return this.locked;
  }

  follow() {
    this.stage = 'following'; this.waiting = false; this.waitTime = Infinity;
    this.chain = walkNpc(this.world, this.entry.image, 'path_torielwalk5', { speed: 1, onComplete: () => {
      this.stage = 'waiting';
      this.entry.item = { ...this.entry.item, ObjectName: 'obj_torinteractable5', X: this.entry.image.x, Y: this.entry.image.y };
      this.entry.object = this.world.dataSource.objects.get('obj_torinteractable5');
      this.entry.image.setTexture('spr_toriel_r:0');
      this.npcBody = createCollider(this.world.dataSource, this.entry.item);
      this.world.colliders.push(this.npcBody);
    } });
    this.chain.timeScale = 0;
  }

  interact() {
    const world = this.world;
    if (this.stage === 'waiting' && inInteractionRange(world, this.entry)) {
      world.showDialogue(this.text.ask, { portrait: 'spr_face_torieltalk', onClose: () => this.escort() });
      return;
    }
    const sign = world.roomObjects.find((entry) => entry.item.ObjectName === 'obj_readable_room1' && inInteractionRange(world, entry));
    if (sign) world.showDialogue(this.text.sign);
  }

  escort() {
    const world = this.world, npc = this.entry.image;
    this.stage = 'escort'; this.locked = true; world.plot = 7.5;
    this.wall.disabled = true; this.npcBody.disabled = true;
    npc.x -= 12;
    world.player.setVisible(false); world.player.y = npc.y + 28;
    const playerX = world.player.x, playerY = world.player.y, npcX = npc.x, npcY = npc.y;
    this.chain = walkNpc(world, npc, 'path_torielwalk5_2', { absolute: false, speed: 1,
      sprites: { r: 'spr_toriel_handhold_r', u: 'spr_toriel_handhold_u', d: 'spr_toriel_handhold_d', l: 'spr_toriel_l' },
      onUpdate: () => {
        world.player.setPosition(playerX + npc.x - npcX, playerY + npc.y - npcY);
        world.updateCamera();
      },
      onComplete: () => {
        world.player.setPosition(playerX + npc.x - npcX, playerY + npc.y - npcY).setVisible(true);
        npc.x += 12; npc.setTexture('spr_toriel_l:0'); this.stage = 'arrival';
        this.timer = world.time.delayedCall(2 * 1000 / 30, () => world.showDialogue(this.text.end, { portrait: true, onClose: () => {
          world.plot = 8; this.stage = 'leaving'; this.locked = false;
          this.chain = walkNpc(world, npc, 'path_walkright', { absolute: false, onComplete: () => {
            npc.destroy(); this.stage = 'complete';
          } });
        } }));
      } });
  }

  destroy() { this.chain?.stop(); this.timer?.remove(); }
}
