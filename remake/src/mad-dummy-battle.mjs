import { RuinsBattle } from './ruins-battle.mjs';
import { fightInput } from './fight-input.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { madDummyAct } from './mad-dummy-act.mjs';
import { MadDummyState } from './mad-dummy-state.mjs';
import { MadDummyWave, loadMadDummyWaveAssets } from './mad-dummy-waves.mjs';
import { MadDummyHelpersSequence } from './mad-dummy-helpers-sequence.mjs';

const intro = '* Mad Dummy blocks the way!';
const speech = ['Foolish.\nFoolish!\nFOOLISH!', 'Futile.\nFutile!\nFUTILE!', 'Pitiful.\nPitiful!\nPITIFUL!', 'Feeble.\nFeeble!\nFEEBLE!'];
const story = ["I'll defeat you and\ntake your SOUL!", "I'll use your SOUL\nto cross the barrier!", "I'll stand in the\nwindow of a fancy\nstore!", 'THEN EVERYTHING I\nWANT WILL BE MINE!', "Huh?\nYeah, I guess\nthat'll avenge my\ncousin.", 'What was their name\nagain...?', 'Whatever.\nWhatever!\nWHATEVER!!'];
const robotSpeech = {14:'DUMMY\nBOTS!\nMAGIC\nMISSILE!',15:'DUMMY\nBOTS!\nTRY\nAGAIN!',16:"DUMMY\nBOTS!\nYou're\nawful???",17.5:'DUMMY\nBOTS!\nFINAL\nATTACK!'};
const status = ['* Mad Dummy is doing an armless\n  ska dance.', '* Mad Dummy is bossing around\n  its bullets.', '* Mad Dummy glares into a\n  mirror, then turns to you\n  with the same expression.', '* Mad Dummy is hopping mad.', '* Smells like a clothing\n  store.'];

// Battlegroup 45: HP của hình nộm do đạn tự bắn trúng, tách khỏi HP trên giao diện.
export class MadDummyBattle extends RuinsBattle {
  constructor(){super('MadDummyBattle');}
  preload(){
    super.preload();loadMadDummyWaveAssets(this);const base=new URL('../assets/',import.meta.url);
    for(const [key,count] of [['spr_dummybattle',2],['spr_maddum_base',1],['spr_maddum_torso',1],['spr_maddum_leg',1],['spr_maddum_head',4],['spr_blconwd',1],['spr_blconsm',1]])
      for(let i=0;i<count;i++)if(!this.textures.exists(`${key}:${i}`))this.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
    if(!this.cache.bitmapFont.exists('fnt_plain')){this.load.json('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.json',base).href);this.load.image('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.png',base).href);}
    if(!this.cache.audio.exists('mus_dummybattle'))this.load.audio('mus_dummybattle',new URL('sounds/mus_dummybattle/mus_dummybattle.ogg',base).href);
  }
  loadBattleData(){
    super.loadBattleData();if(!this.cache.bitmapFont.exists('fnt_plain'))registerBitmapFont(this,'fnt_plain',{...this.cache.json.get('fnt_plain'),LineHeight:20});colorBitmapFont(this,'fnt_plain','black','#000000');
    return {battleDialogue:{intro:[intro]}};
  }
  setupEnemy(){
    const music=this.previousScene.waterfallMusic;music?.pause();this.events.once('shutdown',()=>{if(music===this.previousScene.waterfallMusic&&music?.isPaused)music.resume();});
    this.musicKey='mus_dummybattle';this.dummyState=new MadDummyState();this.storyTurn=0;this.attacked=false;this.face=0;this.anim=0;
    this.enemy.setPosition(135,40).setVisible(false);
    this.enemyParts=['spr_maddum_base','spr_maddum_torso','spr_maddum_leg','spr_maddum_head'].map(key=>this.add.image(0,0,`${key}:0`));
    this.events.once('shutdown',()=>this.clearOverlay());this.drawDummy();
  }
  spareable(){return false;}
  updateMenu(){
    this.updateMenuText();if(!this.confirmPressed)return;this.sound.play('snd_select');
    if(this.menuIndex<2)this.choose(this.menuIndex?'actTarget':'fightTarget',['Mad Dummy']);
    else if(this.menuIndex===2)this.chooseInventory();else this.choose('mercy',['Spare']);
  }
  updateSubmenu(){
    this.drawSubmenu();if(this.cancel){this.toMenu(intro);return;}if(!this.confirmPressed)return;
    if(this.kind==='fightTarget')this.startFight();
    else if(this.kind==='actTarget')this.choose('act',['Check','Talk']);
    else if(this.kind==='act')this.showPages(madDummyAct(this.previousScene.flags,this.subIndex?'talk':'check'),()=>this.dummyTurn());
    else if(this.kind==='item')this.useInventory();else if(this.kind==='mercy')this.dummyTurn();
  }
  updateFight(delta){
    const hit=fightInput(this,delta,this.config.def);if(!hit)return;
    if(hit.miss){this.showPages(['* MISS'],()=>this.dummyTurn());return;}
    this.sound.play('snd_damage');this.showPages(['0'],()=>{
      if(!this.attacked){this.attacked=true;this.showPages(['Foolish.\nFoolish!\nFOOLISH!',"Even if you attack\nmy vessel, you'll\nNEVER hurt me!", "I'm still\nincorporeal, you\nDUMMY!!!"],()=>this.dummyTurn());}
      else this.dummyTurn();
    });
  }
  dummyTurn(){
    this.mode='speech';this.message.setText('');this.menu.setText('');this.target.setVisible(false);this.bar.setVisible(false);
    this.command=Math.round(Math.random()*100);const phase=this.dummyState.phase;
    const line=robotSpeech[phase]??(this.storyTurn>0&&this.storyTurn<=7?story[this.storyTurn-1]:speech[Math.min(3,Math.floor(this.command/25))]);this.storyTurn++;
    this.speechTime=130*1000/30;this.speechBox=this.add.image(182.5,27.5,phase>=14?'spr_blconsm:0':'spr_blconwd:0').setOrigin(0).setScale(.5);
    this.speechText=this.add.bitmapText(190,33,'fnt_plain:black',line,6);this.arena.setPosition(118.5,125).setSize(80,67.5);
    this.soul.setTexture('spr_heart:0').setOrigin(0).setScale(.5).setPosition(154.5,155).setVisible(false);
  }
  beginWave(){
    this.mode='soul';this.soul.setVisible(true);this.soulElapsed=0;
    this.wave=new MadDummyWave(this,{state:this.dummyState,onFirstHit:pages=>this.showOverlay(pages,{onClose:()=>this.dummyState.finishFirstHitDialogue()}),onHelpersDismissal:()=>{
      this.helpersElapsed=0;
      this.helpers=new MadDummyHelpersSequence({state:this.dummyState,wave:this.wave,show:(pages,options)=>this.showOverlay(pages,options),returnToStart:()=>Math.abs(this.enemy.x-135)<1&&Math.abs(this.enemy.y-40)<1});
    }});this.bullets=this.wave.bullets;
  }
  finishSoul(){
    this.wave.destroy();this.wave=null;this.helpers=null;this.bullets=[];this.soul.setVisible(false);this.turn++;
    const phase=this.dummyState.phase;this.toMenu(phase===2?'* Mad Dummy is looking\n  nervous.':phase===5?'* Mad Dummy is getting cotton\n  all over the dialogue box.':phase>=14?'* Mechanical whirrs fill\n  the room.':status[Math.min(4,Math.floor(this.command/20))]);
    this.arena.setPosition(16,125).setSize(285,67.5);
  }
  showOverlay(pages,{onClose=()=>{},onPage=()=>{}}={}){
    this.clearOverlay();this.overlay={pages,index:0,onClose,onPage,box:this.add.image(185,40,'spr_blconwd:0').setOrigin(0).setScale(.5),text:this.add.bitmapText(197,45,'fnt_plain:black',pages[0],6)};
  }
  clearOverlay(){if(!this.overlay)return;this.overlay.box.destroy();this.overlay.text.destroy();this.overlay=null;}
  advanceOverlay(){const o=this.overlay;if(!o)return;if(++o.index<o.pages.length){o.text.setText(o.pages[o.index]);o.onPage(o.index);}else{this.clearOverlay();o.onClose();}}
  drawDummy(){
    const [base,torso,leg,head]=this.enemyParts,x=this.enemy.x+25,y=this.enemy.y+5,rot=Math.sin(this.anim/6)*3;
    base.setPosition(x+2.5,y+37.5).setAngle(-rot);torso.setPosition(x,y+17.5+rot/8).setAngle(rot/2);leg.setPosition(x+2.5,y+32.5).setAngle(rot/3);head.setPosition(x-rot/6,y+rot/6).setAngle(rot).setTexture(`spr_maddum_head:${this.face}`);
  }
  animateEnemy(){}
  update(time,delta){
    const advance=this.mode==='soul'&&this.overlay&&this.confirmPressed;super.update(time,delta);
    if(advance)this.advanceOverlay();
    if(this.mode==='soul'&&this.helpers){this.helpersElapsed=Math.min(200,this.helpersElapsed+delta);while(this.helpersElapsed>=1000/30){this.helpersElapsed-=1000/30;this.enemy.x+=(135-this.enemy.x)*.25;this.enemy.y+=(40-this.enemy.y)*.25;this.helpers.step();}}
    if(this.mode!=='dead'&&this.enemyParts?.length){this.anim+=delta*30/1000;this.drawDummy();}
  }
}
