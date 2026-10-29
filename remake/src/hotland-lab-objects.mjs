import { inInteractionRange } from './npc.mjs';
import { addItem } from './inventory.mjs';
import { murderLevel } from './route.mjs';
import text from './hotland-lab-objects.json' with { type: 'json' };

// Đồ vật hai tầng lab và tủ Instant Noodles, SCR_TEXT 258/259, 643–648.
export class HotlandLabObjects {
  constructor(world) {
    this.world = world; this.upstairs = world.dataSource.name === 'room_fire_lab2';
    this.objects = world.roomObjects.filter(e => /^obj_readable_room[1-5]$/.test(e.item.ObjectName) || ['obj_dogfoodbag','obj_mettwallhole','obj_undynetrash','obj_napstafridge','obj_readable_room_editor'].includes(e.item.ObjectName));
    for (const e of this.objects) if (e.image && e.object.Depth > 0) e.image.setDepth(-e.object.Depth);
    // Create riêng của tủ tài liệu tầng trên mở rộng vùng đọc, không tạo thêm vật cản.
    this.objects = this.objects.map(e => e.item.CreationCodeEntry?.includes('6087') ? { ...e, item: { ...e.item, ScaleX: 6, ScaleY: 3 } } : e);
    if (this.upstairs && world.flags[7] !== 1 && (world.flags[493] ?? 0) >= 10) this.mettaton = world.add.image(400,80,'spr_mett_o_upperbody:0').setOrigin(0).setDepth(-300000);
  }
  show(keys) { const w = this.world; w.showDialogue(keys.map(key => text[key].replace(/\\\[C\]/g, w.game.registry.get('charname')))); }
  interact() {
    const w = this.world, e = this.objects.find(e => (e.item.ObjectName !== 'obj_mettwallhole' || e.image?.visible) && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!e) return false;
    const name = e.item.ObjectName, dark = w.plot < 126 && murderLevel(w.flags) < 12, genocide = murderLevel(w.flags) >= 12;
    if (this.upstairs) { this.readUpstairs(e); return true; }
    if (name === 'obj_napstafridge') {
      if (dark) this.show(['obj_napstafridge_100']);
      else if (w.flags[109] === 1) this.show(['SCR_TEXT_1242']);
      else w.showDialogue([text.SCR_TEXT_1237], { onClose: () => w.showChoice('* (Take a package of noodles?)', ['Take it','Leave it'], choice => {
        if (choice !== 0) { this.show(['SCR_TEXT_1265']); return; }
        if (addItem(w,36)) { w.flags[109] = 1; w.sound.play('snd_item'); this.show(['SCR_TEXT_1258']); }
        else this.show(['SCR_TEXT_1261']);
      }) });
    } else if (name === 'obj_dogfoodbag') {
      if (dark) this.show(['obj_dogfoodbag_68']);
      else if (w.kills > 20 && [52,53,54,55].every(flag => w.flags[flag] === 1)) this.show(['obj_dogfoodbag_63','obj_dogfoodbag_65']);
      else this.show([`obj_dogfoodbag_${w.kills === 0 ? 59 : 57}`]);
    } else if (name === 'obj_mettwallhole') this.show([`obj_mettwallhole_${genocide ? 61 : 58}`]);
    else if (name === 'obj_undynetrash') this.show((w.flags[493] ?? 0) >= 10 ? [91,92,93,94].map(n => `obj_undynetrash_${n}`) : [`obj_undynetrash_${dark ? 88 : 87}`]);
    else if (name === 'obj_readable_room1') this.show([`obj_readable_room1_${dark ? 293 : 292}`]);
    else if (name === 'obj_readable_room2') this.show([`obj_readable_room2_${dark ? 333 : 332}`]);
    else if (name === 'obj_readable_room3') this.show(dark ? ['obj_readable_room3_202'] : ['obj_readable_room3_200','obj_readable_room3_201']);
    else if (name === 'obj_readable_room4') this.show([`obj_readable_room4_${genocide ? 147 : w.plot < 126 ? 146 : 145}`]);
    else if (name === 'obj_readable_room5') this.show([`obj_readable_room5_${e.item.X > 828 && e.item.X < 868 && e.item.Y < 90 ? 177 : dark ? 93 : 92}`]);
    return true;
  }
  readUpstairs(e) {
    const w = this.world, name = e.item.ObjectName;
    if (name === 'obj_readable_room1') this.show(['obj_readable_room1_299']);
    else if (name === 'obj_readable_room3') this.show(['obj_readable_room3_207','obj_readable_room3_208']);
    else if (name === 'obj_readable_room_editor') {
      const code = e.item.CreationCodeEntry;
      this.show(code.includes('6085') ? ['room_fire_lab2_94'] : code.includes('6086') ? ['room_fire_lab2_95'] : code.includes('6087') ? ['room_fire_lab2_96_0','room_fire_lab2_96_1'] : [`room_fire_lab2_97_${w.flags[7] !== 1 && (w.flags[493] ?? 0) >= 10 ? 1 : 0}`]);
    } else if (name === 'obj_readable_room5' && e.item.X < 130) this.show(['obj_readable_room5_104','obj_readable_room5_105']);
    else if (name === 'obj_readable_room5' && e.item.X < 204 && e.item.X > 144) this.show(['obj_readable_room5_110','obj_readable_room5_111']);
    else if (name === 'obj_readable_room5' && e.item.X > 474 && e.item.X < 575) this.show(['obj_readable_room5_116']);
    else {
      const ids = name === 'obj_readable_room2' ? [3434,3435,3436] : name === 'obj_readable_room4' ? [3451,3452,3453] : [3469,3470,3471,3472];
      w.showChoice('* (All these books are labelled\n  Human History.)', ['Read one','Do not'], choice => this.show(choice === 0 ? ids.map(n => `SCR_TEXT_${n}`) : ['SCR_TEXT_3441']));
    }
  }
  destroy() { this.mettaton?.destroy(); }
}
