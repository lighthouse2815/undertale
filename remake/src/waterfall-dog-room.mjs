import {createCollider} from './movement.mjs';
import {inInteractionRange} from './npc.mjs';
import {addItem} from './inventory.mjs';

export class WaterfallDogRoom {
  constructor(world){
    this.world=world;this.elapsed=0;this.stage='idle';this.pendant=world.roomObjects.find(e=>e.item.ObjectName==='obj_rarependant');
    if(world.flags[7]===1)world.flags[107]=1;
    if(world.flags[107]===1)this.pendant.image.setTexture('spr_magicpendant:1');
    world.colliders.push(createCollider(world.dataSource,this.pendant.item));this.pendant.image.setDepth(this.pendant.item.Y+this.pendant.sprite.Height);
  }
  interact(){
    const w=this.world,e=this.pendant;if(this.stage!=='idle'||!inInteractionRange(w,e))return false;
    if(w.flags[107]===1){w.showDialogue(['* (The artifact is gone.)']);return true;}
    w.showDialogue(["* (It's a legendary artifact.)"],{onClose:()=>w.showChoice('* (Will you take it?)',['Take it','Leave it'],choice=>{
      if(choice!==0)return;
      const line=w.inventory.includes(27)?'* (You\'re carrying too many\n  dogs.)':w.inventory.length>=8?"* (You're carrying too much.)":'* (This will never happen.)';
      if(!w.inventory.includes(27)&&w.inventory.length<8)w.flags[107]=1;w.showDialogue([line]);
    })});return true;
  }
  deploy(){
    if(this.stage!=='idle'||this.world.flags[107]===1)return;
    const w=this.world;w.release();this.music=w.waterfallMusic??w.townMusic;this.music?.pause();w.sound.play('snd_grab');
    const left=w.player.facing==='l';this.dog=w.add.image(w.player.x+(left?-30:30),w.player.y+10,`spr_tobdog${left?'l':'r'}:0`).setOrigin(0).setDepth(w.player.y+30);
    this.stage='wait';this.timer=30;this.frames=0;
  }
  update(delta){
    const w=this.world;if(w.flags[107]!==1&&w.flags[107]!==2&&!w.inventory.includes(27)&&addItem(w,27))w.flags[107]=2;
    this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}return this.stage!=='idle';
  }
  step(){
    if(this.stage==='idle'||this.stage==='talk')return;this.frames++;const w=this.world;
    if(this.stage==='approach'){
      const dx=this.pendant.item.X-4-this.dog.x,dy=this.pendant.item.Y-5-this.dog.y,dist=Math.hypot(dx,dy);
      if(dist<2){this.stage='absorbWait';this.timer=30;}else{this.dog.x+=dx/dist*2;this.dog.y+=dy/dist*2;this.dog.setTexture(`spr_tobdog${dx<0?'l':'r'}:${Math.floor(this.frames*.25)%2}`);}
    }else if(this.stage==='leave'){this.dog.x+=1.94;this.dog.y+=.49;}
    if(this.stage==='wait'&&--this.timer<=0){this.song=w.sound.add('mus_dogsong',{loop:true});this.song.play();this.stage='approach';}
    else if(this.stage==='absorbWait'&&--this.timer<=0){this.stage='talk';this.pendant.image.setTexture('spr_magicpendant:1');w.showDialogue(['* (The dog absorbs the\n  artifact.)'],{onClose:()=>{this.stage='leave';this.timer=90;}});}
    else if(this.stage==='leave'&&--this.timer<=0){addItem(w,29+Math.floor(Math.random()*5));w.flags[107]=1;this.song?.destroy();this.song=null;this.music?.resume();this.dog.destroy();this.dog=null;this.stage='idle';w.release();}
  }
  destroy(){if(this.world.flags[107]===2){this.world.inventory=this.world.inventory.filter(id=>id!==27);this.world.flags[107]=0;}this.song?.destroy();this.dog?.destroy();}
}
