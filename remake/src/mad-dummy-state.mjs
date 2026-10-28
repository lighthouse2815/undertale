// Các mốc HP riêng của obj_maddummy; HP này khác monsterhp hiển thị.
export class MadDummyState {
  constructor(){this.hp=300;this.phase=0;this.type2=0;}
  hit(){
    this.hp--;
    if(this.hp<275&&this.phase<3)this.phase=3;
    if(this.hp<=195&&this.phase===5)this.phase=6;
    if(this.phase===14)this.phase=15;
    else if(this.phase===28)this.phase=29;
    return this.phase;
  }
  beginWave(){
    if(this.phase>0)this.hp-=5;
    const wave={phase:this.phase,hp:this.hp,type2:this.type2};
    if(this.phase===3&&this.hp<255)this.phase=5;
    else if(this.phase===5)this.type2=(this.type2+1)%4;
    else if(this.phase===14)this.phase=15;
    else if(this.phase===15)this.phase=16;
    else if(this.phase===16)this.phase=17.5;
    else if(this.phase===17.5)this.phase=17;
    return wave;
  }
  finishFirstHitDialogue(){if(this.phase===1)this.phase=2;}
  startFirstHitDialogue(){if(this.phase===0)this.phase=1;}
}
