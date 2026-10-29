import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

// obj_royal_rabbitbounce: hai lính gác thang máy hoặc hàng rào tuyến giết.
export class HotlandLabGuards {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.talks = 0;
    this.rabbit = world.roomObjects.find(entry => entry.item.ObjectName === 'obj_royal_rabbitbounce');
    if (!this.rabbit) return;
    const removed = murderLevel(world.flags) >= 12 || world.plot >= 136 || world.flags[402] === 1;
    if (removed) {
      this.rabbit.image.destroy(); world.roomObjects = world.roomObjects.filter(entry => entry !== this.rabbit); this.rabbit = null;
      if (murderLevel(world.flags) >= 12 && world.plot < 185) this.makeField();
      return;
    }
    const sprite = world.dataSource.sprites.get('spr_royalguard_dragon_d');
    this.dragon = world.add.image(this.rabbit.item.X + 23, this.rabbit.item.Y, 'spr_royalguard_dragon_d:0')
      .setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(this.rabbit.item.Y + sprite.Height);
    const item = { ObjectName: 'obj_solidexwide', X: this.rabbit.item.X - 17, Y: this.rabbit.item.Y + 25, ScaleX: 1, ScaleY: 1 };
    world.colliders.push(createCollider(world.dataSource, item));
  }
  makeField() {
    const w = this.world; this.field = { ObjectName: 'obj_kitchenforcefield', X: 180, Y: 60, ScaleX: 3, ScaleY: 1 };
    this.fieldCollider = createCollider(w.dataSource, { ObjectName: 'obj_solidsmall', X: 180, Y: 60, ScaleX: 3, ScaleY: 1 }); w.colliders.push(this.fieldCollider);
    this.fieldImages = [w.add.image(180, 60, 'spr_forcefield_right:0').setOrigin(0), w.add.image(220, 60, 'spr_forcefield_right_middle:0').setOrigin(1, 0).setFlipX(true), w.add.image(240, 60, 'spr_forcefield_right:0').setOrigin(1, 0).setFlipX(true)];
    for (const image of this.fieldImages) image.setDepth(-900000);
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frames++;
      if (this.rabbit) {
        const phase = this.talking ? this.frames / 3 : 0;
        this.rabbit.image.setScale(1 - Math.sin(phase) * .05, 1 + Math.sin(phase) * .1);
        this.rabbit.image.y = this.rabbit.item.Y + (this.talking ? Math.sin(phase) * -1.8 : 0);
      }
      if (this.fieldImages) {
        const w = this.world, distance = Math.hypot(w.player.x - 180, w.player.y - 60);
        const alpha = 1 - (Math.max(10, Math.min(40, distance)) - 10) / 30, frame = Math.floor(this.frames / 3) % 4;
        this.fieldImages.forEach((image, i) => image.setAlpha(alpha).setTexture(`${i === 1 ? 'spr_forcefield_right_middle' : 'spr_forcefield_right'}:${frame}`));
      }
    }
  }
  interact() {
    const w = this.world;
    if (this.field) {
      const entry = { item: this.field, object: w.dataSource.objects.get(this.field.ObjectName), sprite: w.dataSource.sprites.get('spr_event') };
      if (inInteractionRange(w, entry)) { w.showDialogue(["* (It's a forcefield.)"]); return true; }
    }
    const rabbitTarget = this.rabbit && { ...this.rabbit, item: { ...this.rabbit.item,
      X: this.rabbit.item.X - this.rabbit.sprite.OriginX, Y: this.rabbit.item.Y - this.rabbit.sprite.OriginY } };
    if (!rabbitTarget || !inInteractionRange(w, rabbitTarget)) return false;
    const lines = this.talks === 0 ? ['* Sorry... UNDYNE, like, told\n  us there was totally a\n  human in the area.', '* So, like, us Royal Guards are\n  blocking off the elevators\n  for now.', "* Ngah! Even if the elevators\n  aren't working anyway, we'll\n  do our best, Ms. UNDYNE!"]
      : this.talks === 1 ? ["* Like, NO WAY you're getting\n  by us.", '* But, between you and me...\n* I think you could go through\n  that creepy lab over there.', '* Between you, me, and my\n  bro here, I mean.', '* I tell him ALL my secrets.']
        : ['* Hey!\n* No loitering!', "* Like, just kidding.\n* I don't care.\n* Like, loiter your heart out."];
    this.talks++; this.talking = true; w.showDialogue(lines, { onClose: () => { this.talking = false; } }); return true;
  }
  destroy() { this.dragon?.destroy(); for (const image of this.fieldImages ?? []) image.destroy(); }
}
