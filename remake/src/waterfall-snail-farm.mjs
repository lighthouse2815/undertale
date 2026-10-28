import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';
import { murderLevel } from './route.mjs';

const words={
  worker:['* awkward...\n* i\'m working right now...','* i mean...','* welcome to blook family\n  snail farm...','* ... yeah.\n* i\'m the only employee.','* this place used to get a lot\n  of business...','* but our main customer\n  disappeared one day...',"* now it's just some hairy\n  guy that shows up once\n  a month..."],
  workerAgain:["* really, i'm working...\n* i don't want the boss\n  to get mad at me...","* especially since i'm my\n  own boss..."],
  workerFriend:['* hmmm... i should probably\n  try to make friends\n  with my neighbor',"* she's kind of scary, but\n  i feel like i'm always\n  too late to make friends...",'* i should at least try...'],
  long:['* Snail snail...\n* (A long journey extends\n  in front of you...)','* Snail snail...\n* (Reach far and stretch\n  beyond the horizons.)','* Snail snail.\n* (So snaileth Sam Byool.)'],
  longAgain:['* Snail snail.',"* (Good gosh, don't I look\n  like a perfectly normal\n  snail?)"],
  longEnd:['* Snail snail.\n* (You reached the end of\n  your extensive journey.)','* Snail snail.\n* (What a long trip! Remember\n  to stretch your muscles.)']
};

// obj_napstablook_farm2: chạy 30 Hz, nhịp cổ vũ và ba kết quả Thundersnail.
export class WaterfallSnailFarm {
  constructor(world){
    this.world=world;this.elapsed=0;this.frames=0;this.stage='idle';this.talked={};this.racers=[];const murder=murderLevel(world.flags),end=world.flags[7]===1;
    this.entries=world.roomObjects.filter(e=>['obj_napstablook_farm1','obj_napstablook_farm2','obj_npc_room','obj_snail3','obj_snailguy','obj_longsnail'].includes(e.item.ObjectName));
    this.entries=this.entries.filter(e=>{const n=e.item.ObjectName,hidden=(n==='obj_npc_room'&&murder>=9)||(n==='obj_longsnail'&&murder>=8)||(['obj_snail3','obj_snailguy'].includes(n)&&murder>=10)||(['obj_napstablook_farm1','obj_napstablook_farm2'].includes(n)&&(end||murder>=10));if(hidden)e.image.destroy();return !hidden;});
    for(const e of this.entries){if(e.item.ObjectName==='obj_npc_room'){e.object={...e.object,Sprite:'spr_snailr'};e.sprite=world.dataSource.sprites.get('spr_snailr');e.image.setTexture('spr_snailr:0').setOrigin(0);world.dataSource.objects.set(e.item.ObjectName,e.object);}e.image.setDepth(e.item.Y+e.sprite.MarginBottom-e.sprite.OriginY);world.colliders.push(createCollider(world.dataSource,e.item));}
    if(murder<10)for(const [i,key] of ['spr_snailyellow','spr_snailred','spr_snailblue'].entries())this.racers.push({key,baseKey:key,x:690,y:70+i*30,speed:0,image:world.add.image(690,70+i*30,`${key}:0`).setOrigin(0).setDepth(-4000)});
    if(!world.townMusic&&!world.waterfallMusic&&world.flags[67]!==1){world.waterfallMusic=world.sound.add('mus_muscle',{loop:true,volume:1});world.waterfallMusic.play();}
  }
  interact(){
    const w=this.world,e=this.entries.find(e=>inInteractionRange(w,e));if(!e)return false;const n=e.item.ObjectName,count=this.talked[n]??0;this.talked[n]=count+1;
    if(n==='obj_napstablook_farm2'){this.offer();return true;}
    let lines=n==='obj_napstablook_farm1'?w.flags[350]===1?words.workerFriend:count?words.workerAgain:words.worker:n==='obj_longsnail'?w.flags[7]===1?words.longEnd:count?words.longAgain:words.long:n==='obj_snailguy'?w.flags[7]===1?['* The housing market will\n  probably crash now.','* But you know, home\n  is where the heart is.']:["* I've been long overdue for\n  a second house..."]:n==='obj_snail3'?[w.flags[7]===1?'* (Using its money, the\n  snail bought a hat.)':'* (This snail is counting dollar\n  bills.)']:w.flags[7]===1?["* (It's a snail.)",'* (You wonder if Toriel has\n  seen it.)']:["* (It's a snail.)","* (For some reason, you can't\n  help but wonder what it\n  tastes like...)"];
    w.showDialogue(lines);return true;
  }
  offer(){const w=this.world;w.showDialogue(['* do you want to play a game?\n* it\'s called thundersnail.','* the snails will race, and if\n  the yellow snail wins, you\n  win.'],{onClose:()=>w.showChoice('* it\'s 10G to play.',['Play','No'],choice=>{
    if(choice!==0){w.showDialogue(['* oh...........']);return;}
    const gold=w.gold,pages=gold===0?["* um...\n* you don't have any money?","* n-no, you can still play,\n  don't worry about it..."]:gold<10?["* um... that's less than 10G.","* but since you're my only\n  real customer, i guess i'll\n  just take what you have..."]:[];
    w.gold=Math.max(0,gold-10);pages.push('* okay...\n* press Z repeatedly to\n  encourage your snail.','* ready?');this.stage='instructions';w.showDialogue(pages,{onClose:()=>{this.stage='countdown';this.timer=45;this.notice=w.add.bitmapText(60,20,'fnt_maintext','3...',12).setScrollFactor(0).setDepth(100001).setTint(0xff0000);w.release();}});
  })});}
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);const pressed=this.stage==='racing'&&this.world.justConfirmed();while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step(pressed&&this.elapsed<1000/30);}for(const e of this.entries.filter(e=>e.item.ObjectName.startsWith('obj_napstablook_farm'))){const distance=Math.hypot(e.image.x-this.world.player.x,e.image.y-this.world.player.y);e.image.setAlpha(distance<60?Math.min(1,5/(distance+2)):0);}return ['instructions','countdown','racing','resultWait','result'].includes(this.stage);}
  step(pressed=false){
    this.frames++;const w=this.world;
    if(this.stage==='countdown'){this.timer--;this.notice?.setText(this.timer>30?'3...':this.timer>15?'2...':'1...');if(this.timer<=0){this.notice?.destroy();this.notice=null;this.stage='racing';this.base=-.13;this.encouragement=0;this.buffer=0;this.sad=0;this.won=0;this.racers[0].speed=this.base;this.racers[1].speed=-.18;this.racers[2].speed=-.17;w.waterfallMusic?.pause();this.raceMusic=w.sound.add('mus_race',{loop:true});this.raceMusic.play();}}
    else if(this.stage==='racing'){
      const [yellow,red,blue]=this.racers;
      if(pressed&&this.buffer<=15){yellow.speed=0;this.encouragement++;this.buffer=11+Math.random()*8;w.sound.play('snd_b');}
      if(this.buffer<=0&&this.encouragement){if(this.encouragement===1&&!this.sad)this.base-=.01;else if(this.encouragement>=3)this.base+=.01*this.encouragement;yellow.speed=this.base;this.encouragement=0;}
      if(yellow.speed>0||this.encouragement>30){if(yellow.speed>0||this.encouragement>90){red.speed=-.4;blue.speed=-.44;}this.sad=Math.max(this.sad,this.encouragement>50?2:1);yellow.key=this.encouragement>70?'spr_snailyellow_hopeless3':this.sad===2?'spr_snailyellow_hopeless2':'spr_snailyellow_hopeless';yellow.speed=0;}
      this.buffer--;for(const s of this.racers){s.x+=s.speed;s.image.setPosition(s.x,s.y);s.image.setTexture(`${s.key}:${Math.floor(this.frames*.25)%(s.key==='spr_snailyellow_hopeless3'?4:2)}`);}
      if(yellow.x<490)this.won=1;
      if(yellow.x<480||red.x<480||blue.x<480){if((red.x<480||blue.x<480)&&this.won)this.won=2;this.stage='resultWait';this.timer=30;this.raceMusic.destroy();this.raceMusic=null;w.waterfallMusic?.resume();}
    }else if(this.stage==='resultWait'&&--this.timer<=0){this.stage='result';const pages=this.won===1?['* you won... congratulations.','* as a prize, you get 9G.','* sorry... we have to make\n  a profit somehow...']:this.won===2?['* your snail lost by a\n  thin margin.','* actually, the snail is\n  under the false belief\n  that it won...','* oh no... the snail is looking\n  over here...',"* here, i'll give you some\n  money...\n* act like you won...",'* (You got 30G.)']:this.sad?['* oh.......\n* looks like you encouraged\n  your snail too much...','* all that pressure to\n  succeed...\n* really got to her...','* oh........']:['* oh........\n* you both tried your best...','* but the snail looks\n  discouraged...',"* her best wasn't good\n  enough...",'* oh..........'];w.gold+=this.won===1?9:this.won===2?30:0;w.showDialogue(pages,{onClose:()=>{this.stage='reset';w.release();}});
    }else if(this.stage==='reset'){let done=true;for(const s of this.racers){s.key=s.baseKey;s.x=Math.min(690,s.x+4);s.image.setPosition(s.x,s.y).setTexture(`${s.key}:${s.x===690?0:Math.floor(this.frames*.334)%2}`);if(s.x<690)done=false;}if(done)this.stage='idle';}
  }
  destroy(){this.notice?.destroy();this.raceMusic?.destroy();this.racers.forEach(s=>s.image.destroy());}
}
