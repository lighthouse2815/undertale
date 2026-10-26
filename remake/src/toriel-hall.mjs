import { blocked, createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';
import { startHouseMusic } from './house-music.mjs';

// obj_torieltrigger6, obj_torgen_house1, obj_stairstep và nhạc hai lớp trong sảnh.
export class TorielHall {
  constructor(world) {
    this.world = world; this.text = world.dataSource.hallDialogue; this.paths = []; this.npcs = [];
    this.stage = world.plot > 17 ? 'complete' : 'intro';
    this.busters = world.dataSource.room.GameObjects.filter((item) => item.ObjectName === 'obj_toribuster');
    this.steps = world.dataSource.room.GameObjects.filter((item) => item.ObjectName === 'obj_stairstep')
      .map((item) => ({ body: createCollider(world.dataSource, item), stepped: null }));
    for (const entry of world.roomObjects.filter(({ item }) => /^obj_(solidrailing|staircollission)/.test(item.ObjectName)))
      entry.image?.setDepth(entry.item.Y + entry.sprite.Height);
    if (this.stage === 'intro') this.introNpc = this.spawn(140, 120);
    if (world.flags[45] === 1) this.returnTimer = world.time.delayedCall(2 * 1000 / 30, () => {
      const npc = this.spawn(240, 70);
      this.walk(npc, world.plot < 19 ? 'path_torielwalkhouse2' : 'path_torielwalkhouse3');
      world.flags[45] = 0;
    });
    this.music = startHouseMusic(world);
  }

  spawn(x, y) {
    const npc = this.world.add.image(x, y, 'spr_toriel_d:0').setOrigin(0).setDepth(y + 53);
    this.npcs.push(npc); return npc;
  }

  walk(npc, name) {
    const path = walkNpc(this.world, npc, name, { absolute: false, speed: 4, onUpdate: () => {
      npc.setDepth(npc.y + 53);
      if (this.busters.some((item) => touchesObject(this.world, npc, item))) { path.stop(); npc.destroy(); }
    } });
    this.paths.push(path);
  }

  update() {
    if (this.stage !== 'intro') return false;
    const world = this.world, pages = world.flags[6] === 1 ? this.text.hard : this.text.intro;
    this.stage = 'greeting'; world.release();
    world.showDialogue(pages.map((page) => page.text), { portrait: pages[0].portrait,
      onPage: (index) => world.setDialoguePortrait(pages[index].portrait), onClose: () => {
        world.plot = 18; this.stage = 'complete'; this.walk(this.introNpc, 'path_walkright');
      } });
    return true;
  }

  step() {
    const player = this.world.player;
    for (const stair of this.steps) if (player.facing !== stair.stepped
      && ['l', 'r'].includes(player.facing) && blocked(this.world, [stair.body], player.x, player.y)) {
      player.y += player.facing === 'l' ? 1 : -1;
      stair.stepped = player.facing;
    }
    player.setDepth(player.y + 30);
  }

  interact() {
    const world = this.world;
    const sign = world.roomObjects.find((entry) => entry.item.ObjectName === 'obj_readable_room1' && inInteractionRange(world, entry));
    if (!sign) return false;
    world.showDialogue(this.text.books); return true;
  }

  destroy() { this.returnTimer?.remove(); for (const path of this.paths) path.stop(); }
}
