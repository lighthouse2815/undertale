// Quy tắc ACT, nhiệt và chọn generator của obj_pyrope nhóm 52.
export class PyropeRules{
  constructor(){this.heat=0;this.heatWave=0;this.attackPower=8;this.mercyModifier=20;this.lastAct=null;}
  act(action){
    if(!['check','heat','cool','invite'].includes(action))throw new Error(`ACT Pyrope không hợp lệ: ${action}`);
    this.lastAct=action;
    if(action==='cool'){
      this.heat=0;this.heatWave=0;if(this.attackPower>2)this.attackPower-=2;this.mercyModifier=-200;return 'cool';
    }
    if(action==='heat'){
      this.mercyModifier+=30;this.heat++;if(this.heat>1)this.mercyModifier=900;
      if(this.heat===1&&this.heatWave===0)this.heatWave=1;
      else if(this.heat>1&&this.heatWave>0&&this.heatWave<30)this.heatWave+=2;
      return this.heat===1?'heat':this.heat===2?'heatAgain':'heatMore';
    }
    return action;
  }
  speech(command){
    if(this.lastAct==='heat')return 'speechHeat';if(this.lastAct==='cool')return 'speechCool';if(this.lastAct==='invite')return 'speechInvite';
    return command>=100?'speechError':`speech${Math.floor(command/25)}`;
  }
  attack(command,population=1){
    const rope=command<50&&population===1;
    const rate=rope?9:40*(population===3?2.6:population===2?1.1:1);
    this.lastAct=null;return {kind:rope?'rope':'bombs',rate,duration:180,damage:this.attackPower};
  }
  status(command){if(this.heat>1)return 'idleHot';if(this.heat===1)return 'idleWarm';return `idle${command>=90?4:command>=75?3:command>=50?2:command>=25?1:0}`;}
  bonus(hp,maxHp){return this.mercyModifier>10&&hp===maxHp?45:0;}
}
