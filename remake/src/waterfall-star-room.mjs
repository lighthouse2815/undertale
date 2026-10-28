import { WaterfallStarViewer } from './waterfall-star-viewer.mjs';
import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { startWaterfallQuietMusic } from './waterfall-music.mjs';
import data from './waterfall-star-dialogue.json' with { type: 'json' };
import { showItemBox } from './box-road.mjs';
import boxData from './box-road.json' with { type: 'json' };

// room_water11: Tonsil, bảng đá và kính thiên văn lạ.
export class WaterfallStarRoom {
  constructor(world) {
    this.world = world; this.starElapsed=0; this.stars=world.roomObjects.filter(e=>e.item.ObjectName==='obj_cosmetic_glowstar').map(e=>{e.image.setDepth(-e.object.Depth);return {...e,frame:e.item.ImageIndex??0,speed:.2+Math.random()*.1};}); this.viewer = new WaterfallStarViewer(world, 'spr_starcheckeredit2');
    this.sans = world.roomObjects.find(e => e.item.ObjectName === 'obj_sans_room');
    if (this.sans && (world.flags[413] > 0 || world.flags[67] === 1 || world.plot > 200)) { this.sans.image.destroy(); this.sans = null; }
    if (this.sans) { this.sans.image.setDepth(this.sans.item.Y + this.sans.sprite.MarginBottom - this.sans.sprite.OriginY); world.colliders.push(createCollider(world.dataSource, this.sans.item)); }
    this.npc = world.roomObjects.find(e => e.item.ObjectName === 'obj_npc_room');
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room2');
    this.telescope = world.roomObjects.find(e => e.item.ObjectName === 'obj_telescope');
    this.box = world.roomObjects.find(e => e.item.ObjectName === 'obj_sansbox'); world.flags[300] ??= 14;
    if (this.npc) {
      this.npc.item = { ...this.npc.item, Y: this.npc.item.Y + 10 }; this.npc.object = { ...this.npc.object, Sprite: 'spr_tonsildude' }; this.npc.sprite = world.dataSource.sprites.get('spr_tonsildude');
      world.dataSource.objects.set('obj_npc_room', this.npc.object); this.npc.image.setPosition(this.npc.item.X, this.npc.item.Y).setTexture('spr_tonsildude:0').setOrigin(0).setDepth(this.npc.item.Y + this.npc.sprite.Height);
      world.colliders.push(createCollider(world.dataSource, this.npc.item));
    }
    for (const e of [this.telescope, this.box]) world.colliders.push(createCollider(world.dataSource, e.item)); startWaterfallQuietMusic(world);
  }
  update(delta) {
    this.starElapsed=Math.min(200,this.starElapsed+delta);
    while(this.starElapsed>=1000/30) { this.starElapsed-=1000/30; for(const e of this.stars) { e.frame=(e.frame+e.speed)%e.sprite.TextureCount; e.image.setTexture(`${e.object.Sprite}:${Math.floor(e.frame)}`); } }
    return this.viewer.update(delta);
  }
  closeViewer() { this.viewer.closeViewer(); }
  destroy() { this.viewer.destroy(); }
  interact() {
    const w = this.world;
    if (this.sans && inInteractionRange(w, { ...this.sans, item: { ...this.sans.item, X: this.sans.item.X - this.sans.sprite.OriginX, Y: this.sans.item.Y - this.sans.sprite.OriginY } })) {
      const show = (lines, onClose) => w.showDialogue(lines, { portrait: 'spr_face_sans', onPage: () => w.dialogueText.setFont('fnt_comicsans', 10), onClose });
      if (w.flags[85] === 1) show(['* dang, i wish i brought\n  a parasol.', "* i'm getting a nasty burn\n  from all this sun."]);
      else if (w.player.pranked) show(["* huh?\n* you aren't satisfied?", "* don't worry.", "* i'll give you a\n  full refund."]);
      else show(["* i'm thinking about\n  getting into the\n  telescope business.", "* it's normally 50000G\n  to use this premium\n  telescope...", '* but...\n* since i know you,\n  you can use it for free.', '* howzabout it?'], () => w.showChoice('* (Use the telescope?)', ['Yes', 'No'], choice => {
        if (choice === 0) { w.player.pranked = true; this.viewer.openViewer(); }
        else show(['* well, come back\n  whenever you want.']);
      }));
      return true;
    }
    if (inInteractionRange(w, this.box)) { showItemBox(w, boxData.box); return true; }
    if (this.npc && inInteractionRange(w, this.npc)) {
      let ids = [300, 301, 302, 303, 304, 305];
      if (w.flags[85] === 1) ids = [308];
      if (w.flags[7] === 1) ids = [313, 314];
      if (w.flags[350] === 1) ids = [319, 320];
      w.showDialogue(ids.map(id => data[`obj_npc_room_${id}`])); return true;
    }
    const e = this.telescope;
    if (inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } })) { w.showDialogue([data.obj_telescope_75]); return true; }
    if (this.signs.some(e => inInteractionRange(w, e))) { w.showDialogue([data.obj_readable_room2_569, data.obj_readable_room2_570]); return true; }
    return false;
  }
}
