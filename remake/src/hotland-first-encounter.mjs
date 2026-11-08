import { murderLevel } from './route.mjs';

// Lần đầu của obj_encount_fire1 ở room_fire5: nhóm 51 (Vulkin).
export class HotlandFirstEncounter {
  constructor(world) {
    this.world=world;this.count=0;const flags=world.flags;flags[200]=205;
    this.disabled=flags[7]===1||flags[8]===1||(flags[408]??0)>0||(flags[205]??0)>=40;
    const remaining=40-(flags[205]??0);
    this.steps=(80+Math.round(Math.random()*30))*Math.min(8,40/Math.max(1,remaining));
  }
  step(){if(!this.disabled)this.count++;}
  update(){
    const w=this.world;
    if(this.disabled||this.timer||this.count<=this.steps||window.__remake.phase!=='running'||w.dialogue)return;
    this.disabled=true;w.flags[408]=1;window.__remake.phase='encounter';w.sound.play('snd_b');
    const sprite=murderLevel(w.flags)>=8&&!w.flags[27]?'spr_exc_f':'spr_exc';
    this.icon=w.add.image(w.player.x,w.player.y-11,`${sprite}:0`).setOrigin(0).setDepth(w.player.depth);
    this.timer=w.time.delayedCall((15+Math.random()*5)*1000/30,()=>{
      this.icon.destroy();this.icon=null;this.timer=null;w.flags[201]=w.kills;
      for(const flag of [10,11,12,13])w.flags[flag]=0;
      w.saveGame(true);w.release();w.menuPressed=false;w.confirmPressed=false;
      window.__remake.phase='running';window.__remake.startBattle('vulkin');
    });
  }
  destroy(){this.timer?.remove();this.icon?.destroy();}
}
