import { touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { madDummyIntro, madDummyAfter } from './mad-dummy-dialogue.mjs';

// obj_dummytrigger: lời mở đầu, hai trận và hậu cảnh ở khu rác.
export class WaterfallDummyEncounter {
  constructor(world){
    this.world=world;this.stage='idle';this.elapsed=0;this.timer=0;this.frames=0;this.violent=murderLevel(world.flags)>=9&&!world.flags[27];
    this.trigger=world.plot<=115?world.dataSource.room.GameObjects.find(e=>e.ObjectName==='obj_dummytrigger'):null;
    this.dummy=world.waterfallTrashObjects.objects.find(e=>e.item.ObjectName==='obj_damndummy');
  }
  checkTrigger(){
    const w=this.world;if(!this.trigger||w.dialogue||!touchesObject(w,w.player,this.trigger,100,1))return false;
    this.trigger=null;this.stage='wait';this.timer=30;this.startView=w.cameras.main.scrollY;w.release();w.waterfallMusic?.pause();return true;
  }
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30&&window.__remake.phase==='running'){this.elapsed-=1000/30;this.step();}return this.stage!=='idle'&&this.stage!=='done';}
  pose(key){this.dummy.image.setTexture(`${key}:0`).setOrigin(0);}
  step(){
    const w=this.world,c=w.cameras.main,d=this.dummy?.image;this.frames++;
    if(d?.texture.key.startsWith('spr_dummymad_toot:'))d.setTexture(`spr_dummymad_toot:${Math.floor(this.frames*.45)%4}`);
    if(this.stage==='wait'&&--this.timer<=0){this.stage='pan';w.player.facing='d';w.player.setTexture('spr_maincharad:0');}
    else if(this.stage==='pan'){c.scrollY+=1;if(c.scrollY>this.startView+60){this.stage='panWait';this.timer=20;}}
    else if(this.stage==='panWait'&&--this.timer<=0){this.stage='zoom';this.timer=10;this.panView=c.scrollY;}
    else if(this.stage==='zoom'){const t=(11-this.timer)/10;c.setZoom(1+t).centerOn(160+(210-160)*t,this.panView+120+(252-(this.panView+120))*t);if(--this.timer<=0){this.stage='zoomWait';this.timer=10;}}
    else if(this.stage==='zoomWait'&&--this.timer<=0){this.pose('spr_dummymad');w.sound.play('mus_dununnn',{volume:.8});this.stage='shock';this.timer=60;}
    else if(this.stage==='shock'&&--this.timer<=0){this.stage='shake';this.timer=30;}
    else if(this.stage==='shake'){d.setPosition(200+Math.random()*4-2,240+Math.random()*4-2);if(--this.timer<=0){d.setPosition(200,240);this.hole=w.add.image(210,272,'spr_centeredhole:0').setDepth(d.depth-1);this.stage='rise';this.timer=10;}}
    else if(this.stage==='rise'){d.y-=1;if(--this.timer<=0){this.stage='zoomOut';this.timer=14;}}
    else if(this.stage==='zoomOut'){const t=(15-this.timer)/14;c.setZoom(2-t).centerOn(210+(160-210)*t,252+(this.panView+120-252)*t);if(--this.timer<=0){c.setZoom(1);c.setScroll(0,this.panView);this.stage='shakeAgain';this.timer=25;}}
    else if(this.stage==='shakeAgain'){d.x=200+Math.random()*4-2;if(--this.timer<=0){d.x=200;this.stage='panUp';}}
    else if(this.stage==='panUp'){c.scrollY-=6;if(c.scrollY<=Math.max(0,this.startView-20)){this.stage='panUpWait';this.timer=10;}}
    else if(this.stage==='panUpWait'&&--this.timer<=0){d.setPosition(180,70);this.hole?.setPosition(190,112);w.player.facing='u';w.player.setTexture('spr_maincharau:0');this.stage='faceWait';this.timer=16;}
    else if(this.stage==='faceWait'&&--this.timer<=0){
      this.stage='intro';this.preMusic=w.sound.add('mus_predummy',{loop:true,volume:.8});this.preMusic.play();
      w.showDialogue(madDummyIntro(w.flags),{onPage:i=>{if(this.violent&&i===7)this.pose('spr_dummymad_toot');},onClose:()=>this.finishIntro()});
    }
    else if(this.stage==='normalWait'&&--this.timer<=0)this.startBattle('madDummy');
    else if(this.stage==='surpriseWait'&&--this.timer<=0){this.stage='surpriseText';w.showDialogue(['* ...?','* This...\n* This feeling...?'],{onClose:()=>{this.pose('spr_dummyglad');this.stage='gladText';w.showDialogue(['* Eureka.\n* Eureka!\n* EUREKA!','* Human.\n* That moment of unbridled\n  emotion.','* It allowed me to finally\n  fuse with my body!',"* I'm fully corporeal now!\n* My lifelong dream, realized!",'* In return, I guess I\n  won\'t stomp you.',"* How's that sound?"],{onClose:()=>this.startBattle('gladDummy')});}});}
    else if(this.stage==='battle'){
      if(this.violent){this.removeDummy();w.plot=117;this.stage='done';w.updateCamera();w.release();}
      else{this.pose('spr_napstablook_d');this.stage='afterWait';this.timer=15;w.updateCamera();}
    }
    else if(this.stage==='afterWait'&&--this.timer<=0){this.stage='afterText';w.plot=116;w.showDialogue(madDummyAfter(w.flags),{onClose:()=>{this.stage='afterFade';this.timer=30;}});}
    else if(this.stage==='afterFade'){d.y-=3;d.setAlpha(Math.max(0,d.alpha-.04));if(--this.timer<=0){this.removeDummy();this.stage='done';w.release();}}
  }
  finishIntro(){
    const w=this.world;this.preMusic?.destroy();this.preMusic=null;w.sound.play('snd_break2');this.pose('spr_dummymad_toot');
    if(this.violent){w.cameras.main.flash(100,255,255,255);this.pose('spr_dummysurprise');this.stage='surpriseWait';this.timer=45;}
    else{this.stage='normalWait';this.timer=30;}
  }
  startBattle(kind){this.stage='battle';this.world.release();window.__remake.startBattle(kind);}
  removeDummy(){
    const w=this.world;this.dummy?.image.destroy();this.hole?.destroy();this.hole=null;
    w.waterfallTrashObjects.objects=w.waterfallTrashObjects.objects.filter(e=>e!==this.dummy);w.colliders=w.colliders.filter(c=>c.objectName!=='obj_damndummy');this.dummy=null;
  }
  destroy(){this.preMusic?.destroy();this.hole?.destroy();this.world.cameras.main.setZoom(1);}
}
