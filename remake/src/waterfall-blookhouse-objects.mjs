import { inInteractionRange } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { murderLevel } from './route.mjs';

const cdNames=['Spooktunes','Spookwave','Ghouliday Music'];
const cdMusic=['mus_spoopy','mus_spoopy_wave','mus_spoopy_holiday'];

// Vật thể trong nhà Napstablook: ba đĩa dùng chung trạng thái phát nhạc.
export class WaterfallBlookHouseObjects {
  constructor(world,{ghost=null,onSandwich=()=>{}}={}){
    this.world=world;this.ghost=ghost;this.onSandwich=onSandwich;this.objects=world.roomObjects.filter(e=>['obj_napstablook_cd','obj_papcomputer','obj_napstafridge','obj_readable_room3'].includes(e.item.ObjectName));
    this.cds=this.objects.filter(e=>e.item.ObjectName==='obj_napstablook_cd');this.cdBuffer=0;this.music=null;world.flags[94]=0;
    for(const e of this.objects.filter(e=>['obj_napstablook_cd','obj_papcomputer','obj_napstafridge'].includes(e.item.ObjectName)))world.colliders.push(createCollider(world.dataSource,e.item));
    if(world.flags[7]!==1)this.play(0);
  }
  play(number){
    if(this.world.flags[7]===1)return;
    this.music?.destroy();this.music=null;this.world.flags[94]=number;
    const key=number?cdMusic[number-1]:'mus_napstahouse';this.music=this.world.sound.add(key,{loop:true,volume:1});this.music.play();
  }
  interact(){
    const w=this.world,e=this.objects.find(e=>inInteractionRange(w,e));if(!e)return false;
    if(e.item.ObjectName==='obj_papcomputer'){w.showDialogue(["* (The computer's internet\n  browser is opened to\n  a music-sharing forum.)"]);return true;}
    if(e.item.ObjectName==='obj_readable_room3'){w.showDialogue(this.ghost?['* oh... that\'s my tv...','* there\'s a show i like to\n  watch on it...\n* sometimes...']:['* (It\'s a spooky old TV.)\n* (Most of the buttons are\n  worn away...)','* (Though the channel changing\n  buttons look good as new.)']);return true;}
    if(e.item.ObjectName==='obj_napstafridge'){
      if(!this.ghost||murderLevel(w.flags)>=10){w.showDialogue(["* (It's merely a fridge.)"]);return true;}
      if((w.flags[93]??0)<2){this.onSandwich();return true;}
      w.showChoice('* (Look inside the fridge?)',['Open it','No'],choice=>{if(choice===0)w.showDialogue(["* (It's empty.)"]);});return true;
    }
    const index=this.cds.indexOf(e),number=index+1,playing=w.flags[94]===number;
    if(this.cdBuffer>0){w.showDialogue(['* (You still need to recover\n  after all that lying down.)']);return true;}
    w.showDialogue([`* (This CD is labelled\n  "${cdNames[index]}.")`],{onClose:()=>w.showChoice(playing?'* (This CD is playing.)\n* (Turn it off?)':'* (Play it?)',[playing?'Stop it':'Play it','No'],choice=>{
      if(choice!==0){if(!playing&&index===0)w.showDialogue(['* (Spooktunes are dead.)']);return;}
      this.play(playing?0:number);w.showDialogue([playing?'* (The CD stops moving.)':'* (You play the CD.)']);
    })});return true;
  }
  update(delta){this.cdBuffer=Math.max(0,this.cdBuffer-delta*30/1000);}
  destroy(){this.music?.destroy();this.music=null;this.world.flags[94]=0;}
}
