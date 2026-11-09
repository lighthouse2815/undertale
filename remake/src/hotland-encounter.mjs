import { murderLevel } from './route.mjs';

// Các nhóm và nhánh cạn dân số của obj_encount_fire1 ở room_fire5.
export class HotlandEncounter {
  constructor(world) {
    this.world=world;this.count=0;const flags=world.flags;flags[200]=205;
    this.empty=(flags[205]??0)>=40?1:0;
    this.disabled=flags[7]===1||flags[8]===1;
    this.steps=this.empty?20:this.threshold((flags[408]??0)===0?80:220,30);
  }
  threshold(base,spread){const remaining=40-(this.world.flags[205]??0);return (base+Math.round(Math.random()*spread))*Math.min(8,40/Math.max(1,remaining));}
  step(){
    const flags=this.world.flags;
    if(!this.empty&&(flags[205]??0)>=40&&flags[7]!==1&&flags[8]!==1){this.empty=1;this.disabled=false;this.count=0;this.steps=20;}
    if(!this.disabled)this.count++;
  }
  update(){
    const w=this.world;
    if(this.disabled||this.timer||this.count<=this.steps||window.__remake.phase!=='running'||w.dialogue)return;
    this.steps=this.empty===1?20:this.empty===2?6900:this.threshold(1040,680);this.count=0;w.flags[408]=(w.flags[408]??0)+1;
    const roll=Math.floor(Math.random()*15);
    const group=this.empty?'nobody':(['vulkin','tsunderplane','pyrope','hotlandGroup77','hotlandGroup78'][w.flags[408]-1]??(roll<6?'hotlandGroup77':roll<10?'hotlandGroup78':'tsunderplane'));
    if(this.empty===1){w.flags[224]=1;this.empty=2;return;}
    window.__remake.phase='encounter';w.sound.play('snd_b');
    const sprite=murderLevel(w.flags)>=8&&!w.flags[27]?'spr_exc_f':'spr_exc';
    this.icon=w.add.image(w.player.x,w.player.y-11,`${sprite}:0`).setOrigin(0).setDepth(w.player.depth);
    this.timer=w.time.delayedCall((15+Math.random()*5)*1000/30,()=>{
      this.icon.destroy();this.icon=null;this.timer=null;w.flags[201]=w.kills;
      for(const flag of [10,11,12,13])w.flags[flag]=0;
      w.saveGame(true);w.release();w.menuPressed=false;w.confirmPressed=false;
      window.__remake.phase='running';window.__remake.startBattle(group);
    });
  }
  destroy(){this.timer?.remove();this.icon?.destroy();}
}
