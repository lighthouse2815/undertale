import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';
import { createCollider } from './movement.mjs';

// obj_torieltrigger5: gọi Frisk, path 19, điện thoại, path tương đối 19_3 rồi 19_4.
export class RuinsHome {
  constructor(world) {
    this.world = world; this.text = world.dataSource.homeDialogue;
    this.stage = world.plot > 16 ? 'complete' : 'waiting'; this.locked = false; this.elapsed = 0;
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_torieltrigger5');
    this.tree = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_nastytree');
    this.bottom = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_nastrytree_bottom');
    world.colliders.push(createCollider(world.dataSource, this.tree.item));
    this.tree.image.setDepth(this.tree.item.Y + this.tree.sprite.Height);
    this.bottom.image.setDepth(-99999);
    this.music = world.sound.add(world.flags[7] === 1 ? 'mus_reunited' : world.flags[221] ? 'mus_toomuch' : 'mus_ruins', { loop: true, volume: 1 }); this.music.play();
    this.buster = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_toribuster');
  }

  say(pages, onClose) {
    this.world.showDialogue(pages.map((page) => page.text), { portrait: pages[0].portrait,
      onPage: (index) => this.world.setDialoguePortrait(pages[index].portrait), onClose });
  }

  checkTrigger() {
    const world = this.world;
    if (this.stage !== 'waiting' || world.dialogue || !touchesObject(world, world.player, this.trigger, 50, 1)) return false;
    this.stage = 'calling'; this.locked = true; world.release();
    this.npc = world.add.image(140, 240, 'spr_toriel_d:0').setOrigin(0).setDepth(293);
    this.fadeFrames = 0;
    this.say(this.text.intro, () => {
      this.stage = 'walking';
      this.path = walkNpc(world, this.npc, 'path_torielwalk19', { speed: 3,
        onUpdate: (npc) => npc.setDepth(npc.y + 53), onComplete: () => {
        this.stage = 'phone'; this.phoneFrames = 0;
        this.npc.setTexture('spr_toriel_d_phone:0'); world.sound.play('snd_phone');
      } });
    });
    return true;
  }

  update(delta) {
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30;
      if (this.fadeFrames !== undefined && this.fadeFrames < 50) this.music.setVolume(Math.max(0, 1 - ++this.fadeFrames * .02));
      if (this.stage === 'phone') {
        this.phoneFrames++;
        if (this.phoneFrames === 30) this.exc = this.world.add.image(210, 340, 'spr_exc:0').setOrigin(0).setDepth(99999);
        if (this.phoneFrames === 60) {
          this.exc.destroy(); this.exc = null; this.stage = 'approaching';
          this.npc.setTexture('spr_toriel_d:0');
          this.path = walkNpc(this.world, this.npc, 'path_torielwalk19_3', { absolute: false, speed: 5,
            onUpdate: (npc) => npc.setDepth(npc.y + 53),
            onComplete: () => this.greet() });
        }
      } else if (this.stage === 'leaving' && this.locked) {
        this.leaveFrames++;
        this.torielMusic.setVolume(Math.max(0, .8 - this.leaveFrames * .04));
        this.music.setVolume(Math.min(.9, this.leaveFrames * .06));
        if (this.leaveFrames === 18) { this.torielMusic.destroy(); this.torielMusic = null; this.locked = false; }
      }
    }
    return this.locked || this.checkTrigger();
  }

  greet() {
    const world = this.world;
    this.stage = 'greeting'; this.music.pause();
    this.torielMusic = world.sound.add('mus_toriel', { loop: true, volume: .7, rate: .86 }); this.torielMusic.play();
    const health = world.hp < 4 ? 'critical' : world.hp < world.maxHp ? 'hurt' : 'full';
    const pages = [this.text.greeting, this.text[health], ...this.text.follow];
    world.hp = world.maxHp;
    this.npc.setTexture('spr_toriel_d:0');
    this.say(pages, () => {
      world.plot = 17; this.stage = 'leaving'; this.leaveFrames = 0; this.music.resume();
      this.path = walkNpc(world, this.npc, 'path_torielwalk19_4', { absolute: false, speed: 4,
        onUpdate: (npc) => {
          npc.setDepth(npc.y + 53);
          if (touchesObject(world, npc, this.buster)) { this.path.stop(); npc.destroy(); this.stage = 'complete'; }
        } });
    });
  }

  interact() {
    const world = this.world;
    if (inInteractionRange(world, this.tree)) {
      world.showDialogue(world.flags[7] === 1 ? this.text.treeEnd : this.text.tree); return true;
    }
    if (inInteractionRange(world, this.bottom)) { world.showDialogue(this.text.tree); return true; }
    return false;
  }

  get saveDialogue() { return this.world.flags[202] >= 20 ? this.text.emptySave : this.text.save; }

  destroy() { this.path?.stop(); this.music.destroy(); this.torielMusic?.destroy(); this.exc?.destroy(); }
}
