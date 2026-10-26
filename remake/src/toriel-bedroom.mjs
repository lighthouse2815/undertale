import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { startHouseMusic, mixHouseMusic } from './house-music.mjs';

// Nhật ký và đồ vật trong room_torielroom; cờ 50 đổi lời cây ngoài hành lang.
export class TorielBedroom {
  constructor(world) {
    this.world = world; this.text = world.dataSource.torielBedroomDialogue;
    this.music = startHouseMusic(world); this.elapsed = 0; this.socksRead = false;
    for (const entry of world.roomObjects) {
      if (entry.item.ObjectName === 'obj_sockdrawer') entry.item = { ...entry.item, ScaleX: 2 };
      if (['obj_cactus', 'obj_smallchair'].includes(entry.item.ObjectName)) {
        entry.body = createCollider(world.dataSource, entry.item); world.colliders.push(entry.body);
        entry.image.setDepth(entry.item.Y + entry.sprite.MarginBottom);
      }
    }
  }

  update(delta) {
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; mixHouseMusic(this.world, this.music, [1, .001]);
    }
  }

  interact() {
    const world = this.world;
    const entry = world.roomObjects.find((entry) => /^(obj_readable_room[1-3]|obj_sockdrawer|obj_cactus|obj_smallchair)$/.test(entry.item.ObjectName)
      && inInteractionRange(world, entry));
    if (!entry) return false;
    const name = entry.item.ObjectName, ending = world.flags[7] === 1;
    let key;
    if (name === 'obj_readable_room1') {
      world.showChoice(this.text.diary[0], ['Yes', 'No'], (choice) => {
        if (choice === 0) world.showDialogue(this.text.passage);
      });
      return true;
    }
    if (name === 'obj_sockdrawer') {
      if (world.plot === 0) return false;
      key = this.socksRead ? 'socksRepeat' : 'socks'; this.socksRead = true;
    } else if (name === 'obj_readable_room2') {
      key = entry.item.X > 90 ? 'plants' : 'bucket';
      if (key === 'plants') world.flags[50] = 1;
    } else if (name === 'obj_readable_room3') key = ending ? 'bedEnd' : 'bed';
    else if (name === 'obj_cactus') key = ending ? 'cactusEnd' : 'cactus';
    else key = ending ? 'chairEnd' : 'chair';
    world.showDialogue(this.text[key]); return true;
  }
}
