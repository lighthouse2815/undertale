import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';

const buttons=[['spr_neutralpbutton',43,58],['spr_leftpbutton',54,58],['spr_downpbutton',70,55],['spr_rightpbutton',81,58],['spr_uppbutton',97,55]];
const solutions=[[0,4,3,0,2,2,3],[0,4,3,0,2,0,2,3],[0,4,3,0,2,1,2,3]];
export class WaterfallPianoRoom {
  constructor(world) {
    this.world=world;this.elapsed=0;this.stage='idle';this.piano=world.roomObjects.find(e=>e.item.ObjectName==='obj_piano');this.signs=world.roomObjects.filter(e=>e.item.ObjectName==='obj_readable_room5');this.door=world.dataSource.room.GameObjects.find(e=>e.ObjectName==='obj_fakedoor');
    this.piano.image.setDepth(this.piano.item.Y+this.piano.sprite.Height);world.colliders.push(createCollider(world.dataSource,this.piano.item));
    this.quitIcon=world.add.image(44,27,'spr_pxquit:0').setOrigin(0).setScrollFactor(0).setDepth(10000);
    this.buttons=buttons.map(([key,x,y])=>world.add.image(x,y,`${key}:0`).setOrigin(0).setScrollFactor(0).setDepth(10000));
    if(world.flags[356]===1)this.openDoor(false);
  }
  interact() {
    const w=this.world,e=this.piano;
    if(inInteractionRange(w,{...e,item:{...e.item,X:e.item.X-e.sprite.OriginX,Y:e.item.Y-e.sprite.OriginY}})) {
      w.showChoice("* (There's a piano here.)\n* (Play it?)",['Yes','No'],choice=>{if(choice===0)this.start();});return true;
    }
    if(this.signs.some(e=>inInteractionRange(w,e))){w.showDialogue(['* A haunting song echoes\n  down the corridor...\n* Won\'t you play along?','* Only the first 8 are fine.']);return true;}
    return false;
  }
  start(){this.stage='playing';this.buffer=5;this.notes=[];this.highlights=[0,0,0,0,0];this.quitIcon.setTexture('spr_pxquit:1');this.world.release();this.world.confirmPressed=false;this.world.confirmWasDown=true;}
  quit(){if(this.stage!=='playing'||this.buffer>0)return;this.stage='idle';this.resetButtons();this.world.release();this.world.interactionCooldown=250;}
  resetButtons(){this.quitIcon.setTexture('spr_pxquit:0');for(const [i,button] of this.buttons.entries())button.setTexture(`${buttons[i][0]}:0`);}
  openDoor(animate){
    if(this.doorOpen){if(animate){this.stage='idle';this.world.release();this.world.interactionCooldown=250;}return;}this.doorOpen=true;const w=this.world,index=w.colliders.findIndex(c=>c.objectName==='obj_solidtall_2'&&c.rectangle.contains(this.door.X+10,this.door.Y+20));if(index>=0)w.colliders.splice(index,1);
    this.doorImage=w.add.image(this.door.X,this.door.Y,'spr_fakedoor:0').setOrigin(0).setDepth(-99999);
    if(animate){w.sound.play('snd_bluh');w.cameras.main.shake(1000/15,.006);this.stage='doorWait';this.timer=30;}
  }
  update(delta){
    this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;if(this.buffer>0)this.buffer--;if(this.stage==='winWait'&&--this.timer<=0){this.world.flags[356]=1;this.stage='beforeDoor';this.timer=30;}else if(this.stage==='beforeDoor'&&--this.timer<=0)this.openDoor(true);else if(this.stage==='doorWait'&&--this.timer<=0){this.stage='idle';this.world.release();this.world.interactionCooldown=250;}for(let i=0;i<5;i++)if(this.highlights?.[i]>0)this.highlights[i]--;}
    if(this.stage==='playing'){
      const w=this.world,input=d=>w.keys[d].isDown||[...w.touch.values()].some(p=>p.direction===d),num=input('left')?1:input('down')?2:input('right')?3:input('up')?4:0;
      if(this.buffer<=0&&w.justConfirmed()){w.sound.play(`mus_piano${num+1}`,{volume:.5,rate:1.13});this.notes.push(num);this.highlights[num]=6;
        if(solutions.some(sequence=>sequence.every((note,i)=>this.notes[this.notes.length-sequence.length+i]===note))){this.stage='winWait';this.timer=20;this.resetButtons();}}
      if(this.stage==='playing')for(const [i,button] of this.buttons.entries())button.setTexture(`${buttons[i][0]}:${this.highlights[i]>0?2:num===i?1:0}`);
    }
    return this.stage!=='idle';
  }
  destroy(){this.quitIcon.destroy();for(const button of this.buttons)button.destroy();this.doorImage?.destroy();}
}
