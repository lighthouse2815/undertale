import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { addItem } from './inventory.mjs';

export class WaterfallShoeRoom {
  constructor(world) {
    this.world = world; this.shrooms = world.roomObjects.filter(e => e.item.ObjectName === 'obj_glowshroom');
    this.shoes = world.roomObjects.find(e => e.item.ObjectName === 'obj_npc_room');
    for (const e of this.shrooms) { e.image.setDepth(e.item.Y + e.sprite.Height); world.colliders.push(createCollider(world.dataSource, e.item)); }
    if (world.flags[106] === 1) { this.shoes.image.destroy(); this.shoes = null; }
    else { const e = this.shoes; e.object = {...e.object, Sprite:'spr_balletshoes'}; e.sprite = world.dataSource.sprites.get('spr_balletshoes'); world.dataSource.objects.set(e.item.ObjectName,e.object); e.image.setVisible(false); world.colliders.push(createCollider(world.dataSource,e.item)); }
  }
  interact() {
    const w=this.world, e=[...this.shrooms,...(this.shoes ? [this.shoes] : [])].find(e => inInteractionRange(w, {...e,item:{...e.item,X:e.item.X-e.sprite.OriginX,Y:e.item.Y-e.sprite.OriginY}}));
    if (!e) return false;
    if (e !== this.shoes) { if (!w.sound.getAll('snd_movemenu').some(s => s.isPlaying)) w.sound.play('snd_movemenu'); e.image.setTexture(`spr_glowshroom:${e.image.texture.key.endsWith(':0') ? 1 : 0}`); return true; }
    w.showDialogue(["* (It's a pair of ballet shoes.)"], {onClose:() => w.showChoice('* (Will you take it?)',['Take it','Leave it'],choice => {
      if (choice !== 0) return;
      if (!addItem(w,25)) { w.showDialogue(["* (You're carrying too much.)"]); return; }
      w.flags[106]=1; w.showDialogue(['* (You got the Ballet Shoes.)'],{onClose:() => { const i=w.colliders.findIndex(c=>c.objectName==='obj_npc_room'); if(i>=0) w.colliders.splice(i,1); e.image.destroy(); this.shoes=null; }});
    })}); return true;
  }
}
