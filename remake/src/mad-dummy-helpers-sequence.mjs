// obj_maddummy con2 6–14: gọi trợ thủ, sa thải và giới thiệu robot.
export class MadDummyHelpersSequence {
  constructor({state,wave,show,returnToStart}){
    this.state=state;this.wave=wave;this.show=show;this.returnToStart=returnToStart;this.stage='return';this.timer=0;
  }
  step(){
    if(this.stage==='return'){
      if(!this.returnToStart())return;
      this.state.phase=7;this.stage='calling';
      this.show(['HEY GUYS!'],{onClose:()=>{this.wave.summonHelpers();this.state.phase=8;this.stage='waiting';this.timer=30;}});
    }else if(this.stage==='waiting'&&--this.timer<=0){
      this.state.phase=10;this.stage='firing';
      this.show(['Dummies.\nDummies!\nDUMMIES!','Remember how I\nsaid NOT to\nshoot at me?','Well...','FAILURES!\nYOU\'RE FIRED!\nYOU\'RE ALL BEING\nREPLACED!!!'],{
        onPage:index=>{if(index===3)this.wave.setHelpersMood('shock');},
        onClose:()=>{this.wave.setHelpersMood('sad');this.state.phase=11;this.stage='leaving';this.timer=40;}
      });
    }else if(this.stage==='leaving'&&--this.timer<=0){
      this.state.phase=13;this.stage='robots';this.wave.duration=this.wave.frames+10;
      this.show(['Hahaha.\nHahaha!\nHAHAHA!',"Now you'll see\nmy true power:","Relying on people\nthat aren't garbage!"],{onClose:()=>{this.state.phase=14;this.stage='done';}});
    }
  }
}
