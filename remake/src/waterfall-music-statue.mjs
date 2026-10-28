import {createCollider} from './movement.mjs';
import {inInteractionRange} from './npc.mjs';

export class WaterfallMusicStatue {
  constructor(world){
    this.world=world;this.elapsed=0;this.frames=0;this.statue=world.roomObjects.find(e=>e.item.ObjectName==='obj_musicstatue');this.clue=world.roomObjects.find(e=>e.item.ObjectName==='obj_pianosolution');
    world.colliders.push(createCollider(world.dataSource,this.statue.item));this.statue.image.setDepth(this.statue.item.Y+this.statue.sprite.Height);
    this.shadow=world.add.image(0,0,'spr_statueshadow:0').setOrigin(0).setAlpha(.4).setDepth(-1000);
    this.light=world.add.image(0,0,'spr_statuelight:0').setOrigin(0).setAlpha(.1).setDepth(-1000);
    this.clue.image.setVisible(false).setAlpha(0).setDepth(-this.clue.object.Depth);
    if(world.flags[7]!==1){this.rain=world.sound.add('mus_rain_deep',{loop:true,volume:.5,rate:.9});this.rain.play();}
    if(world.flags[86]===1)this.startMusic();
  }
  startMusic(){if(this.music)return;this.statue.image.setTexture('spr_statue:1');this.music=this.world.sound.add('mus_musicbox',{loop:true,volume:.25,rate:.9});this.music.play();}
  interact(){
    const w=this.world,e=this.statue;if(!inInteractionRange(w,e))return false;
    if(w.flags[7]===1&&w.flags[85]===1&&!w.flags[86])w.showDialogue(['* (No point in giving it an\n  umbrella now.)']);
    else if(w.flags[86]===1)w.showDialogue(["* (The music continues, and\n  doesn't stop.)"]);
    else if(w.flags[85]===1)w.showChoice('* (Put the umbrella on the\n  statue?)',['Yes','Do not'],choice=>{if(choice!==0)return;w.flags[85]=0;w.flags[86]=1;this.startMusic();w.showDialogue(['* (You place the umbrella\n  atop the statue.)','* (Inside the statue, a music\n  box begins to play...)']);});
    else w.showDialogue(["* (It's a statue.)\n* (The structures at its\n  feet seem dry.)"]);
    return true;
  }
  update(delta){
    this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}
  }
  step(){
    if(!this.music)return;this.frames++;const w=this.world,e=this.statue,p=w.player;
    const left=e.item.X+e.sprite.MarginLeft,top=e.item.Y+e.sprite.MarginTop,right=e.item.X+e.sprite.MarginRight,bottom=e.item.Y+e.sprite.MarginBottom;
    const dx=Math.max(left-p.x,0,p.x-right),dy=Math.max(top-p.y,0,p.y-bottom),dist=Math.hypot(dx,dy);
    if(dist<76)this.music.setVolume((100-dist)/100);
    if(this.frames>=450){const alpha=Math.min(1,(this.frames-449)*.005)*Math.abs(Math.sin(this.frames/60))*.8*Math.max(0,(100-dist)/100);
      this.clue.image.setVisible(true).setAlpha(alpha).setPosition(this.clue.item.X+Math.sin(this.frames/20)*3,this.clue.item.Y+Math.cos(this.frames/33)*2).setTexture(`spr_pianosolution:${Math.floor((this.frames-449)*.06)%this.clue.sprite.TextureCount}`);}
  }
  destroy(){this.rain?.destroy();this.music?.destroy();this.shadow.destroy();this.light.destroy();}
}
