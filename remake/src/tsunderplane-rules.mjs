// Quy tắc ACT và vùng tiếp cận của obj_tsunderplane, battlegroup 50.
export class TsunderplaneRules {
  constructor(){this.graze=0;this.mercyModifier=5;this.defense=6;this.lastAct=null;}
  act(action,random=Math.random()){
    if(!['check','approach','flirt'].includes(action))throw new Error(`ACT Tsunderplane không hợp lệ: ${action}`);
    this.lastAct=action;
    return action==='flirt'?`flirt${Math.min(4,Math.floor(random*5))}`:action;
  }
  approach(population=1){
    this.graze+=population>1?1.5:1;
    if(this.graze>3)this.mercyModifier=30;
    if(this.graze>=4){this.mercyModifier=100;this.defense=-99;}
    return this.graze>=4?'victory':'bell';
  }
  speech(command){
    const close=this.graze>=5;
    if(this.lastAct==='approach')return close?'speechApproachClose':'speechApproach';
    if(this.lastAct==='flirt')return close?'speechFlirtClose':'speechFlirt';
    if(this.lastAct==='check')return close?'speechCheckClose':'speechCheck';
    if(close)return command<50?'speechClose0':'speechClose1';
    return `speech${Math.min(3,Math.floor(command/25))}`;
  }
  attack(command,population=1){
    const green=this.lastAct==='approach',plane=command<=50||green;
    const rate=plane?20*(population===3?2.4:population===2?1.7:1):30*(population===3?2.2:population===2?1.5:1);
    this.lastAct=null;return {kind:plane?'planes':'bombs',green,rate,duration:160};
  }
  status(command,hp){
    if(hp<30)return 'idleHurt';
    if(this.mercyModifier>60)return 'idleShy';
    return `idle${command>=90?4:command>=75?3:command>=50?2:command>=25?1:0}`;
  }
  bonus(hp,maxHp){return this.mercyModifier>10&&hp===maxHp?60:0;}
}
