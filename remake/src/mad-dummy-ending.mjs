// obj_maddummy con2 18–40: dao, nước mắt và Napstablook.
export class MadDummyEnding {
  constructor(scene){this.scene=scene;this.state=scene.dummyState;this.stage='first';this.timer=0;this.tears=[];this.knife=null;this.ghost=null;
    scene.showOverlay(['(N... no way!)','(These guys are\neven WORSE than\nthe other guys!)','Who cares.\nWho cares!\nWHO CARES!!',"I DON'T NEED\nFRIENDS!!!"],{onClose:()=>this.makeKnife()});
  }
  makeKnife(){const s=this.scene;this.state.phase=20;this.stage='knifeWait';this.timer=40;this.knife={x:s.enemy.x*2-50,y:s.enemy.y*2,alpha:0,angle:180,increase:16,vx:0,vy:0,image:s.add.image(0,0,'spr_dummyknife:0').setScale(.5).setAlpha(0)};s.sound.play('snd_bell');}
  launchKnife(){const s=this.scene,k=this.knife,dx=s.soul.x*2+10-k.x,dy=s.soul.y*2+10-k.y,length=Math.hypot(dx,dy)||1;k.vx=dx/length*9;k.vy=dy/length*9;k.angle=Math.atan2(-dy,dx)*180/Math.PI;this.stage='knifeFlight';this.state.phase=23;this.timer=90;s.sound.play('snd_arrow');}
  rain(){
    const s=this.scene;this.state.phase=28;this.stage='rain';
    for(let i=0;i<23;i++){const x=s.enemy.x*2+10+Math.random()*20,y=-10-Math.random()*1100,scale=1+Math.random();this.tears.push({x,y,vx:(Math.random()*6-2)/4,scale,image:s.add.image(x/2,y/2,'spr_teardrop:0').setOrigin(0).setScale(scale/2)});}
  }
  hit(){
    const s=this.scene;this.state.hit();this.stage='hitWait';this.timer=60;s.clearOverlay();s.music.stop();s.sound.play('snd_damage');
  }
  step(){
    const s=this.scene,k=this.knife;
    if(k){
      if(k.alpha<1){k.alpha=Math.min(1,k.alpha+.12);k.angle+=k.increase;k.increase-=2;}
      k.x+=k.vx;k.y+=k.vy;k.image.setPosition(k.x/2,k.y/2).setAlpha(k.alpha).setAngle(-k.angle);
      if(s.invFrames<=0&&s.wave.touchesHeart({x:k.x-30,y:k.y-30,sprite:'spr_dummyknife'})){s.hurt(9);k.image.destroy();this.knife=null;}
      else if(k.x< -60||k.x>700||k.y< -60||k.y>540){k.image.destroy();this.knife=null;}
    }
    for(const tear of this.tears){tear.x+=tear.vx;tear.y+=6;tear.image.setPosition(tear.x/2,tear.y/2);if(this.stage==='rain'&&tear.x+12*tear.scale>=s.enemy.x*2+5&&tear.x<=s.enemy.x*2+82&&tear.y+13*tear.scale>=s.enemy.y*2&&tear.y<=s.enemy.y*2+103)this.hit();}
    if(this.stage==='knifeWait'&&--this.timer<=0){this.state.phase=22;this.stage='knifeSpeech';s.showOverlay(["I'VE GOT\nKNIVES!!!"],{onClose:()=>this.launchKnife()});}
    else if(this.stage==='knifeFlight'&&--this.timer<=0){this.state.phase=25;this.stage='emptyWait';this.timer=30;}
    else if(this.stage==='emptyWait'&&--this.timer<=0){this.state.phase=27;this.stage='emptySpeech';s.showOverlay(["I'm...",'Out of knives.',"BUT IT DOESN'T\nMATTER!!!","YOU CAN'T HURT\nME AND I CAN'T\nHURT YOU!","YOU'LL BE STUCK\nFIGHTING ME...",'Forever.','Forever!','FOREVER!!!!','AHAHAHAHAHAHAHAHAHAHAHAHA', 'AHAHAHAHAHAHAHAHAHAHAHAHA', 'AHAHAHAHAHAHAHAHAHAHAHAHA', 'AHAHAHAHAHAHAHAHAHAHAHAHA'],{onPage:index=>{if(index===9)this.rain();}});}
    else if(this.stage==='hitWait'&&--this.timer<=0){this.state.phase=31;this.stage='hitSpeech';s.showOverlay(['Wh...\nWhat the heck is\nthis!?','Ergh!\nAcid rain!?!',"Oh, FORGET IT!\nI'm outta here!"],{onClose:()=>{this.tears.forEach(t=>t.image.destroy());this.tears=[];s.sound.play('snd_slidewhist');this.state.phase=32;this.stage='leave';this.timer=120;}});}
    else if(this.stage==='leave'){s.enemy.x+=2;if(--this.timer<=0){this.state.phase=34;this.stage='ghostEnter';this.ghost=s.add.image(125,-100,'spr_napstabattle_leg:0').setOrigin(0).setAlpha(0);s.enemyParts.forEach(p=>p.setVisible(false));}}
    else if(this.stage==='ghostEnter'){this.ghost.y+=2;this.ghost.alpha=Math.min(1,this.ghost.alpha+.025);if(this.ghost.y>7){this.state.phase=35;this.stage='ghostWait';this.timer=30;}}
    else if(this.stage==='ghostWait'&&--this.timer<=0){this.state.phase=37;this.stage='ghostSpeech';const common=['... sorry, i\ninterrupted you,\ndidn\'t i?','as soon as i came\nover, your friend\nimmediately left...','oh no...\nyou guys looked\nlike you were having\nfun...'];const end=(s.previousScene.flags[36]??0)===0?["oh wait... didn't you\nattack me before...", "uhhh...\nthat's awkward.",'sorry.\nhave a nice day.']:['oh no...\ni just wanted to\nsay hi...','oh no................................'];s.showOverlay([...common,...end],{onPage:index=>{if(index>=4)this.ghost.setAlpha(Math.max(0,this.ghost.alpha-.3));},onClose:()=>{this.state.phase=38;this.stage='endWait';this.timer=60;}});}
    else if(this.stage==='endWait'&&--this.timer<=0){this.state.phase=40;this.stage='done';this.destroy();s.finishBattle();}
  }
  destroy(){this.knife?.image.destroy();this.knife=null;this.tears.forEach(t=>t.image.destroy());this.tears=[];this.ghost?.destroy();this.ghost=null;}
}
