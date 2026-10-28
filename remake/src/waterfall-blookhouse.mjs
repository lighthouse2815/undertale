import { inInteractionRange, touchesObject } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { murderLevel } from './route.mjs';
import { WaterfallBlookHouseObjects } from './waterfall-blookhouse-objects.mjs';

// obj_napstablookdate: lời mời, sandwich và nằm nghe nhạc cùng Napstablook.
export class WaterfallBlookHouse {
  constructor(world){
    this.world=world;this.elapsed=0;this.stage='waiting';this.timer=0;this.trigger=world.dataSource.room.GameObjects.find(e=>e.ObjectName==='obj_napstablookdate');
    if(world.flags[7]!==1&&murderLevel(world.flags)<10){
      const item={ObjectName:'obj_napstablook_actor',X:210,Y:70,ScaleX:1,ScaleY:1},object=world.dataSource.objects.get(item.ObjectName),sprite=world.dataSource.sprites.get(object.Sprite);
      const image=world.add.image(item.X,item.Y,`${object.Sprite}:0`).setOrigin(0).setDepth(item.Y+sprite.MarginBottom);this.ghost={item,object,sprite,image};this.collider=createCollider(world.dataSource,item);world.colliders.push(this.collider);
    }else this.trigger=null;
    if((world.flags[93]??0)>0)this.trigger=null;
    this.objects=new WaterfallBlookHouseObjects(world,{ghost:this.ghost,onSandwich:()=>this.startSandwich()});
  }
  pose(direction){this.ghost.image.setTexture(`spr_napstablook_${direction}_headphone:0`);}
  checkTrigger(){const w=this.world;if(!this.trigger||w.dialogue||!touchesObject(w,w.player,this.trigger,4,1))return false;this.trigger=null;this.stage='greetWait';this.timer=70;w.release();return true;}
  interact(){
    const w=this.world,f=w.flags;if(this.ghost&&inInteractionRange(w,{...this.ghost,item:{...this.ghost.item,X:this.ghost.image.x,Y:this.ghost.image.y}})){
      let pages=f[458]===1?["* uhhhh...\n* i'm gonna keep working\n  on that mix cd."]:f[36]>0?['* uh, do you wanna...\n* listen to some tunes...','* or something...']:['* i\'m... working on a mix cd...\n* make yourself at home...?'];
      if(f[350]===1)pages=["* i've almost got a mix cd\n  finished for my scary\n  neighbor...",'* it\'s 74 minutes of people\n  screaming their signature\n  wrestling moves','* but they\'re all autotuned.\n* i hope she likes it'];
      if(f[93]===9)pages=['* oh..............'];
      if(f[94]===1)pages=["* oh... a classic spooktune...\n* they don't make songs like\n  this anymore..."];
      if(f[94]===2)pages=['* dang... that ambience...\n* it\'s like my whole body\n  is being spooked...'];
      if(f[94]===3)pages=["* oh, this one...\n* once you learn the lyrics\n  it's hard not to sing along...",'* ooo ooo oooo\n* ooo ooo oooo\n* oo oo ooo oo ooo'];
      w.showDialogue(pages);return true;
    }return this.objects.interact();
  }
  startSandwich(){if(!this.ghost||(this.world.flags[93]??0)>=2)return;this.stage='hungryWait';this.timer=20;this.world.release();this.pose('l');}
  createStars(){
    const w=this.world;this.starPhase=0;this.starRows=Array.from({length:240},(_,y)=>w.add.image(0,0,'spr_st:0').setOrigin(0).setCrop(0,y,320,1));
    this.stars=w.add.container(0,0,this.starRows).setScrollFactor(0).setDepth(99999).setAlpha(0);
  }
  animateStars(){if(!this.stars)return;this.starPhase++;for(const [y,row] of this.starRows.entries())row.x=Math.sin((this.starPhase+y+1)/38.25)*7;this.starPhase+=240;}
  update(delta){
    this.objects.update(delta);this.elapsed=Math.min(200,this.elapsed+delta);
    while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}
    if(this.ghost&&this.collider){const g=this.ghost;this.collider.x=g.image.x;this.collider.y=g.image.y;this.collider.rectangle.setPosition(g.image.x+g.sprite.MarginLeft-g.sprite.OriginX,g.image.y+g.sprite.MarginTop-g.sprite.OriginY);}
    return !['waiting','lying','done'].includes(this.stage);
  }
  step(){
    const w=this.world,p=w.player,g=this.ghost?.image;
    if(this.stage==='greetWait'&&--this.timer<=0){this.pose('d');this.stage='talk';w.flags[93]=1;const pages=w.flags[36]>0?['* oh...\n* you really came...',"* sorry, i...\n* wasn't expecting that.","* it's not much, but make\n  yourself at home."]:['* oh... hey... you...','* followed me...\n* into my house...','* ...\n* m-make yourself at home???'];w.showDialogue(pages,{onClose:()=>{this.stage='waiting';w.release();}});}
    else if(this.stage==='hungryWait'&&--this.timer<=0){this.stage='talk';w.showDialogue(['* oh... are you hungry...','* i can get you something\n  to eat...'],{onClose:()=>{this.stage='walkLeft';this.timer=30;}});}
    else if(this.stage==='walkLeft'){g.x-=2;if(--this.timer<=0){this.stage='playerDown';this.timer=10;}}
    else if(this.stage==='playerDown'){p.y+=3;if(--this.timer<=0){this.stage='pause';this.timer=26;}}
    else if(this.stage==='pause'&&--this.timer<=0){this.stage='ghostUp';this.timer=10;this.pose('u');}
    else if(this.stage==='ghostUp'){g.y-=2;if(--this.timer<=0){this.stage='sandwichWait';this.timer=60;this.pose('d');}}
    else if(this.stage==='sandwichWait'&&--this.timer<=0){this.stage='talk';w.showDialogue(['* this is a ghost sandwich...'],{onClose:()=>w.showChoice('* do you want to try it...',['Yes','No'],choice=>{
      const pages=choice===0?['* (You attempt to bite\n  into the ghost sandwich.)','* (You phase right through\n  it...)','* oh...','* nevermind...']:['* oh.....................\n  ....................\n  .................'];w.showDialogue(pages,{onClose:()=>{this.stage='mealWait';this.timer=90;}});
    })});}
    else if(this.stage==='mealWait'&&--this.timer<=0){this.stage='talk';w.showDialogue(['* after a great meal i like\n  to lie on the ground and\n  feel like garbage...','* it\'s a family tradition...'],{onClose:()=>w.showChoice('* do you want...\n* ... to join me...',['Yes','No'],choice=>{
      if(choice===0)w.showDialogue(['* okay...\n* follow my lead...'],{onClose:()=>{this.stage='lieWalk';this.timer=20;this.gx=g.x;this.gy=g.y;this.px=p.x;this.py=p.y;}});
      else{w.flags[93]=9;w.showDialogue(['* oh.....................\n  ....................\n  .................'],{onClose:()=>{this.stage='leaveUp';this.timer=10;}});}
    })});}
    else if(this.stage==='lieWalk'){const t=(21-this.timer)/20;g.setPosition(this.gx+(220-this.gx)*t,this.gy+(100-this.gy)*t);p.setPosition(this.px+(120-this.px)*t,this.py+(100-this.py)*t);if(--this.timer<=0){this.stage='lieWait';this.timer=45;}}
    else if(this.stage==='lieWait'&&--this.timer<=0){g.setTexture('spr_napstablook_grsm_headphones:0').y+=20;p.setVisible(false);this.lying=w.add.image(p.x,p.y,'spr_maincharar_liedown:0').setOrigin(0).setDepth(p.depth);this.stage='lieText';this.timer=30;}
    else if(this.stage==='lieText'&&--this.timer<=0){this.stage='talk';w.showDialogue(['* here we go...\n* you\'ll lie down as long\n  as you don\'t move.','* so... only move around when\n  you want to get up, i\n  guess.'],{onClose:()=>{this.stage='lying';this.timer=0;this.startX=p.x;this.startY=p.y;w.flags[17]=1;w.release();}});}
    else if(this.stage==='lying'){
      this.timer++;if(this.timer===230){this.objects.music?.pause();this.chords=w.sound.add('mus_napstachords',{loop:true,volume:.5,rate:.4});this.chords.play();}
      if(this.timer===300)this.createStars();
      if(this.stars){this.stars.alpha=Math.min(1,this.stars.alpha+.005);this.animateStars();}
      if(p.x!==this.startX||p.y!==this.startY){w.flags[458]=1;w.flags[17]=0;p.setPosition(this.startX,this.startY).setVisible(true);this.lying.destroy();this.lying=null;this.chords?.destroy();this.chords=null;this.objects.music?.resume();this.stage='getUp';this.timer=this.stars?90:30;w.release();}
    }
    else if(this.stage==='getUp'){if(this.stars){this.stars.alpha=Math.max(0,this.stars.alpha-1/90);this.animateStars();}if(--this.timer<=0){this.stars?.destroy();this.stars=null;this.starRows=null;g.y-=20;this.pose('l');this.stage='talk';w.showDialogue(['* well, that was nice...\n* thank you...'],{onClose:()=>{w.flags[93]=3;this.objects.cdBuffer=240;this.stage='done';w.release();}});}}
    else if(this.stage==='leaveUp'){g.y+=2;if(--this.timer<=0){this.stage='leaveRight';this.timer=150;this.pose('r');}}
    else if(this.stage==='leaveRight'){g.x+=2;if(--this.timer<=0){g.destroy();this.ghost=null;this.objects.ghost=null;if(this.collider)this.collider.disabled=true;this.stage='done';w.release();}}
  }
  destroy(){this.objects.destroy();this.chords?.destroy();this.lying?.destroy();this.stars?.destroy();this.ghost?.image.destroy();this.world.flags[17]=0;}
}
