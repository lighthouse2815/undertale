import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { addItem } from './inventory.mjs';

export class WaterfallNiceCreamRoom {
  constructor(world) {
    this.world = world; this.shrooms = world.roomObjects.filter(e => e.item.ObjectName === 'obj_glowshroom');
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room1');
    this.box = world.roomObjects.find(e => e.item.ObjectName === 'obj_npc_room');
    const e=this.box; e.item={...e.item,X:e.item.X+10,Y:e.item.Y+20}; e.object={...e.object,Sprite:'spr_chestbox'}; e.sprite=world.dataSource.sprites.get('spr_chestbox'); world.dataSource.objects.set(e.item.ObjectName,e.object);
    e.image.setPosition(e.item.X,e.item.Y).setTexture('spr_chestbox:0').setOrigin(0).setDepth(e.item.Y+e.sprite.Height);
    for (const item of [...this.shrooms,this.box]) { item.image.setDepth(item.item.Y+item.sprite.Height); world.colliders.push(createCollider(world.dataSource,item.item)); }
  }
  interact() {
    const w=this.world, reachable=e=>inInteractionRange(w,{...e,item:{...e.item,X:e.item.X-e.sprite.OriginX,Y:e.item.Y-e.sprite.OriginY}});
    const shroom=this.shrooms.find(reachable);
    if (shroom) { if (!w.sound.getAll('snd_movemenu').some(s=>s.isPlaying)) w.sound.play('snd_movemenu'); shroom.image.setTexture(`spr_glowshroom:${shroom.image.texture.key.endsWith(':0')?1:0}`); return true; }
    if (this.signs.some(reachable)) { w.showDialogue(['* The ancient glyphs have been\n  painted over with a list of\n  21 different flavors.']); return true; }
    if (!reachable(this.box)) return false;
    const n=w.flags[80]??0;
    if (!n) { w.showDialogue(["* (It's a box for storing Punch\n  Cards.)\n* (It's empty right now.)"]); return true; }
    const description=n>12?'* (The box is overstuffed with\n  cards.)':n>6?`* (A house made of ${n} cards\n  sits in the box.)`:n>4?`* (There's a smiley face made\n  of ${n} cards in the box.)`:n>2?`* (Two bugs in the box are\n  playing a ${n}-card game.)`:`* (The box contains ${n} cards.)`;
    w.showDialogue([description],{onClose:()=>w.showChoice('* (Take a card?)',['Take','Leave'],choice=>{
      if (choice!==0) return;
      if (!addItem(w,26)) { w.showDialogue(["* (You're carrying too much.)"]); return; }
      w.flags[80]=n-1;
      const prefix=n>12?'':n>6?'* (The house collapses.)\n':n>4?'* (Happiness is fleeting.)\n':n>2?'* (All games must end one day.)\n':'';
      w.showDialogue([prefix+'* (You got a Punch Card.)']);
    })}); return true;
  }
}
