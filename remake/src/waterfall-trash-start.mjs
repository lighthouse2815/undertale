import { inInteractionRange } from './npc.mjs';
import { startWaterfallMusic } from './waterfall-music.mjs';

// obj_wakeupchara và các đống rác ở điểm rơi Waterfall.
export class WaterfallTrashStart {
  constructor(world){
    this.world=world;this.elapsed=0;this.stage=world.dataSource.name==='room_water_trashzone1'&&world.plot<114?'lying':'done';this.timer=60;this.talked=0;
    this.piles=world.roomObjects.filter(e=>e.item.ObjectName==='obj_garbagepile');
    const donation=world.roomObjects.find(e=>e.item.ObjectName==='obj_npc_room');donation?.image?.destroy();
    if(this.stage==='lying'){world.flags[17]=0;world.player.setAngle(-90);world.player.y+=10;world.player.facing='d';}
    if(world.flags[7]!==1)startWaterfallMusic(world,true);
  }
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}return this.stage!=='done';}
  step(){
    const w=this.world,p=w.player;
    if(this.stage==='lying'&&--this.timer<=0){this.stage='pause';this.timer=10;}
    else if(this.stage==='pause'&&--this.timer<=0)this.stage='rising';
    else if(this.stage==='rising'){p.angle+=18;p.y-=4;p.x-=8;if(p.angle>=-1){p.angle=0;w.plot=115;this.stage='done';}}
  }
  interact(){
    if(!this.piles.some(e=>inInteractionRange(this.world,e)))return false;
    const lines=['* (Piles of garbage.)\n* (There are quite a few\n  brands you recognize.)',this.world.flags[22]>0?'* (There\'s a pile of yellow names\n  in the trash pile.)':'* (Just garbage.)','* (Garbage.)','* (A trash heap.)','* (Your persistent garbage\n  habit shows no signs\n  of payoff.)','* (Trash.)'];
    this.world.showDialogue([lines[Math.min(this.talked,5)]]);this.talked++;return true;
  }
}
