import { inInteractionRange } from './npc.mjs';

// room_tundra_sansbasement: ngănkéo279/7, huyhiệu, bảnsơđồ vàmáyphủbạt.
export class SansBasement {
  constructor(world) {
    this.world = world; this.text = world.dataSource.sansBasementDialogue;
    if (world.flags[7] === 1) {
      if (!world.townMusic) { world.townMusic = world.sound.add('mus_reunited', { loop: true }); world.townMusic.play(); }
      this.music = world.townMusic;
    } else if (world.flags[67] !== 1) { this.music = world.sound.add('mus_sansdate', { loop: true, volume: .9, rate: .8 }); this.music.play(); }
  }
  interact() {
    const w = this.world, e = w.roomObjects.find((e) => /^obj_readable_room[1-4]$/.test(e.item.ObjectName) && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!e) return false;
    const key = e.item.ObjectName === 'obj_readable_room1' ? w.flags[279] === 1 ? 'drawerFriends' : w.flags[7] === 1 ? 'drawerEnd' : 'drawer' : e.item.ObjectName === 'obj_readable_room2' ? 'badge' : e.item.ObjectName === 'obj_readable_room3' ? 'blueprints' : 'machine';
    w.showDialogue(this.text[key]); return true;
  }
  destroy() { if (this.music !== this.world.townMusic) this.music?.destroy(); }
}
