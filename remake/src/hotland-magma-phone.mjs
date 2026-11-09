import { touchesObject } from './npc.mjs';

// obj_phonecall_room ở room_fire6: cuộc gọi bị ngắt trước khi trả lời.
export class HotlandMagmaPhone {
  constructor(world){
    this.world=world;this.trigger=world.dataSource.room.GameObjects.find(e=>e.ObjectName==='obj_phonecall_room');this.done=world.plot>129;
  }
  checkTrigger(){
    const w=this.world;if(this.done||w.dialogue||!touchesObject(w,w.player,this.trigger,1,5))return false;
    this.done=true;w.plot=130;if(w.flags[367]===1)return false;
    w.sound.play('snd_phone');w.release();
    w.showDialogue(['* Ring... Ring...','* Click...?','* (Whoever was calling hung up\n  before you answered it.)'],{onClose:()=>w.release()});
    return true;
  }
}
