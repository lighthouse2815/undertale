import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { showSnowdinSave } from './snowdin-start.mjs';
import { showItemBox } from './box-road.mjs';
import boxData from './box-road.json' with { type: 'json' };

// Các đồ vật town, SAVE/BOX và hai đường hầm obj_teleigloo.
export class SnowdinTown {
  constructor(world) {
    this.world = world; this.text = world.dataSource.townDialogue; this.elapsed = 0; this.frames = 0; this.locked = false; this.stage = 'waiting'; this.xx = 1;
    world.flags[300] ??= 14;
    const f = world.flags, level = murderLevel(f);
    const key = f[7] === 1 ? 'mus_reunited' : f[222] && !f[27] ? 'mus_toomuch' : 'mus_town';
    const rate = key !== 'mus_town' ? 1 : f[222] && f[27] ? .5 : level >= 7 && !f[27] ? .25 : 1;
    if (!world.townMusic) { world.townMusic = world.sound.add(key, { loop: true, rate, volume: 1 }); world.townMusic.play(); }
    this.music = world.townMusic;
    this.star = world.roomObjects.find((e) => e.item.ObjectName === 'obj_savepoint');
    this.logo = world.roomObjects.find((e) => e.item.ObjectName === 'obj_snowdinlogo');
    if (level >= 12 && this.logo) { this.logo.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.logo); this.logo = null; }
    this.icecube = world.roomObjects.find((e) => e.item.ObjectName === 'obj_icecube_room');
    if (this.icecube) { if (f[7] === 1 || level >= 7) { this.icecube.image.destroy(); this.icecube = null; } else this.icecube.image.setDepth(-999989); }
    this.water = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_waterdivot_test').map((e) => ({ ...e, speed: .15 + Math.random() * .05, sine: Math.random() * 20, frame: 0 }));
    this.igloos = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_teleigloo').map((e) => ({ ...e, top: world.add.image(e.item.X, e.item.Y, 'spr_iglootop:0').setOrigin(0).setDepth(-10000) }));
    const solids = ['obj_sansbox', 'obj_papmailbox', 'obj_sansmailbox', 'obj_xmastree'];
    for (const e of world.roomObjects) {
      if (solids.includes(e.item.ObjectName)) world.colliders.push(createCollider(world.dataSource, e.item));
      if (solids.includes(e.item.ObjectName) || ['obj_snowdinlogo', 'obj_iceflower', 'obj_papshed', 'obj_paphouse', 'obj_teleigloo'].includes(e.item.ObjectName)) e.image?.setDepth(e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY - (e.item.ObjectName === 'obj_paphouse' ? 100 : 0));
    }
    for (const e of this.water) e.image.setDepth(-e.object.Depth);
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } return this.locked; }
  step() {
    const w = this.world; this.frames++;
    this.star.image.setTexture(`${this.star.object.Sprite}:${Math.floor(this.frames * .2) % this.star.sprite.TextureCount}`);
    for (const e of this.water) { e.image.x += 1.5 + Math.sin(e.sine++ / 6) * .2; if (e.image.x > w.dataSource.room.Width) e.image.x = 2300; e.frame = (e.frame + e.speed) % e.sprite.TextureCount; e.image.setTexture(`${e.object.Sprite}:${Math.floor(e.frame)}`); }
    if (this.icecube) { const e = this.icecube; e.image.x += 1.5; if (e.image.x > w.dataSource.room.Width) e.image.x = e.item.X - 60; e.image.setTexture(`${e.object.Sprite}:${Math.floor(this.frames * .1) % e.sprite.TextureCount}`); }
    if (this.locked) {
      if (this.xx < 15) this.xx += .5;
      w.player.y = -60;
      if (this.stage === 'east') {
        w.player.x = Math.ceil(w.player.x + this.xx); if (w.player.x >= 2100 && this.xx > 3) this.xx--;
        if (w.player.x >= 2335) this.finishTunnel(2336, 118);
      } else {
        w.player.x = Math.floor(w.player.x - this.xx); if (w.player.x <= 960 && this.xx > 3) this.xx--;
        if (w.player.x <= 734) this.finishTunnel(732, 106);
      }
      w.updateCamera();
    }
  }
  finishTunnel(x, y) { const w = this.world; w.player.setPosition(x, y).setTexture('spr_maincharad:0').setDepth(y + 30); w.player.facing = 'd'; w.release(); this.locked = false; this.xx = 1; this.stage = 'waiting'; }
  checkTrigger() {
    const w = this.world;
    if (this.locked || w.dialogue) return false;
    const e = this.igloos.find((e) => touchesObject(w, w.player, e.item)); if (!e) return false;
    this.locked = true; this.stage = e.item.X < 1000 ? 'east' : 'west'; w.sound.play('snd_escaped'); w.release(); return true;
  }
  interact() {
    const w = this.world, names = ['obj_savepoint', 'obj_sansbox', 'obj_snowdinlogo', 'obj_sign_room', 'obj_xmastree', 'obj_sansmailbox', 'obj_papmailbox', 'obj_readable_room2', 'obj_readable_room3', 'obj_readable_room4'];
    const e = w.roomObjects.find((e) => names.includes(e.item.ObjectName) && inInteractionRange(w, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } })); if (!e) return false;
    const name = e.item.ObjectName;
    if (name === 'obj_savepoint') showSnowdinSave(w, this.text);
    else if (name === 'obj_sansbox') showItemBox(w, boxData.box);
    else if (name === 'obj_papmailbox') w.showDialogue(this.text.papMailbox, { onClose: () => w.showChoice('* (Look inside?)', boxData.box.options, (choice) => w.showDialogue(choice ? this.text.papMailboxNo : this.text.papMailboxYes)) });
    else w.showDialogue(this.text[name === 'obj_snowdinlogo' ? 'logo' : name === 'obj_sign_room' ? 'sign' : name === 'obj_xmastree' ? murderLevel(w.flags) >= 7 ? 'treeMurder' : 'tree' : name === 'obj_sansmailbox' ? 'sansMailbox' : name === 'obj_readable_room2' ? 'shed' : name === 'obj_readable_room3' ? 'camera' : 'sansDoor']);
    return true;
  }
  destroy() { this.igloos.forEach((e) => e.top.destroy()); }
}
