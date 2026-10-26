import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';
import { createCollider } from './movement.mjs';

// obj_toroverworld7, obj_torieltrigger4, obj_tordogcall và obj_stalkerflowey.
export class CorridorLesson {
  constructor(world) {
    this.world = world;
    this.text = world.dataSource.corridorDialogue;
    this.runner = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_toroverworld7');
    this.entry = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_torinteractable6');
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_torieltrigger4');
    this.npcBody = world.colliders.find((body) => body.objectName === 'obj_torinteractable6');
    if (this.npcBody) this.npcBody.disabled = !this.entry;
    this.stage = this.runner ? 'intro' : this.entry ? 'waiting' : 'complete';
    this.locked = false;
    this.dogFrames = null;
    this.elapsed = 0;
  }

  update(delta) {
    const world = this.world;
    this.updateFlowey();
    if (this.stage === 'intro') {
      this.stage = 'explaining';
      world.showDialogue(this.text.intro, { portrait: 'spr_face_torieltalk', onClose: () => this.departIntro() });
      return true;
    }
    if (this.locked || world.dialogue) return true;
    if (this.checkTrigger()) return true;
    if (this.dogFrames !== null) {
      this.elapsed += delta;
      while (this.elapsed >= 1000 / 30) {
        this.elapsed -= 1000 / 30;
        this.dogFrames += 1;
        const index = this.dogFrames / 6000 - 1;
        if (Number.isInteger(index) && index >= 0 && index < this.text.dogCalls.length) {
          this.call(index);
          break;
        }
      }
    }
    return Boolean(world.dialogue);
  }

  departIntro() {
    const world = this.world, npc = this.runner.image;
    world.plot = 8.5; this.stage = 'waiting';
    this.wall = createCollider(world.dataSource, { ObjectName: 'obj_plotwall3', X: 7, Y: 0 });
    world.colliders.push(this.wall);
    this.introPath = walkNpc(world, npc, 'path_walkright', { absolute: false, speed: 4, frameRate: 9, onComplete: () => {
      // path_action_continue: tiếp tục cùng hướng sau điểm cuối đến ngoài phòng.
      const outside = world.dataSource.room.Width + npc.width;
      this.introExit = world.tweens.add({ targets: npc, x: outside, duration: (outside - npc.x) / (4 * 30) * 1000,
        onUpdate: () => npc.setTexture(`spr_toriel_r:${Math.floor(world.time.now / (1000 / 9)) % 4}`),
        onComplete: () => npc.destroy() });
    } });
  }

  checkTrigger(previous) {
    const world = this.world;
    if (this.stage !== 'waiting' || world.dialogue || !touchesObject(world, world.player, this.trigger, 1, 50)) return false;
    if (previous) world.player.setPosition(previous.x, previous.y);
    world.plot = 9; this.stage = 'returning'; this.locked = true;
    if (this.wall) this.wall.disabled = true;
    if (this.npcBody) this.npcBody.disabled = true;
    this.returnPath = walkNpc(world, this.entry.image, 'path_torielwalk6', { absolute: false, onComplete: () => this.givePhone() });
    return true;
  }

  interact() {
    if (this.stage === 'waiting' && inInteractionRange(this.world, this.entry)) this.world.showDialogue(this.text.peek);
  }

  givePhone() {
    const world = this.world, npc = this.entry.image;
    npc.setTexture('spr_toriel_lt:0');
    this.stage = 'phone'; world.phone = [201, 203, 204, 205];
    this.flowey = world.add.sprite(160, 100, 'spr_floweysink:0').setOrigin(0).setDepth(100);
    if (!world.anims.exists('flowey-corridor-sink')) world.anims.create({ key: 'flowey-corridor-sink', frameRate: 15,
      frames: Array.from({ length: world.dataSource.sprites.get('spr_floweysink').TextureCount }, (_, i) => ({ key: `spr_floweysink:${i}` })) });
    this.flowey.once('animationcomplete', () => {
      world.flags[9] = (world.flags[9] ?? 0) + 1;
      this.flowey.destroy(); this.flowey = null;
    });
    world.showDialogue(this.text.phone, { portrait: true, onClose: () => {
      this.stage = 'complete'; this.locked = false; this.dogFrames = 0;
      this.leavePath = walkNpc(world, npc, 'path_walkright', { absolute: false, onComplete: () => npc.destroy() });
      world.saveGame(true);
    } });
  }

  updateFlowey() {
    if (!this.flowey || this.flowey.anims.isPlaying) return;
    const camera = this.world.cameras.main;
    if (this.flowey.x > camera.scrollX - 37 && this.flowey.x < camera.scrollX + camera.width + 37
      && this.flowey.y > camera.scrollY - 18 && this.flowey.y < camera.scrollY + camera.height + 18) {
      this.flowey.play('flowey-corridor-sink');
    }
  }

  call(index) {
    const world = this.world;
    world.sound.play('snd_phone');
    if (index >= 2) world.flags[37] = 1;
    if (index === 6) this.dogFrames = 910 * 40;
    world.showDialogue(this.text.dogCalls[index], { onPage: (page) => {
      if (index === 2 && (page === 4 || page === 5)) world.sound.play('snd_pombark');
    } });
  }

  destroy() {
    for (const tween of [this.introPath, this.introExit, this.returnPath, this.leavePath]) tween?.stop();
    this.flowey?.destroy();
  }
}
