import { RuinsBattle } from './ruins-battle.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';

const intro='* Glad Dummy lets you go.';
const speech=['Thanks!','Thank\nyou!','Great\nwork!','Bravo!','OK!','...'];

// Battlegroup 93: hình nộm không tấn công và tự rời sau bảy lượt.
export class GladDummyBattle extends RuinsBattle {
  constructor(){super('GladDummyBattle');}
  preload(){
    super.preload();const base=new URL('../assets/',import.meta.url);
    for(const [key,count] of [['spr_dummybattle_glad',2],['spr_blconsm',1]])for(let i=0;i<count;i++)if(!this.textures.exists(`${key}:${i}`))this.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
    if(!this.cache.bitmapFont.exists('fnt_plain')){this.load.json('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.json',base).href);this.load.image('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.png',base).href);}
    if(!this.cache.audio.exists('mus_prebattle1'))this.load.audio('mus_prebattle1',new URL('sounds/mus_prebattle1/mus_prebattle1.ogg',base).href);
    if(!this.cache.audio.exists('snd_slidewhist'))this.load.audio('snd_slidewhist',new URL('sounds/snd_slidewhist/snd_slidewhist.wav',base).href);
  }
  loadBattleData(){super.loadBattleData();if(!this.cache.bitmapFont.exists('fnt_plain'))registerBitmapFont(this,'fnt_plain',{...this.cache.json.get('fnt_plain'),LineHeight:20});colorBitmapFont(this,'fnt_plain','black','#000000');return {battleDialogue:{intro:[intro]}};}
  setupEnemy(){
    const music=this.previousScene.waterfallMusic;music?.pause();this.events.once('shutdown',()=>{if(music===this.previousScene.waterfallMusic&&music?.isPaused)music.resume();});
    this.musicKey='mus_prebattle1';this.populationFlag=0;this.mercyModifier=99;this.enemy.setPosition(108,68).setTexture('spr_dummybattle_glad:0');
  }
  animateEnemy(){}
  updateMenu(){this.updateMenuText();if(!this.confirmPressed)return;this.sound.play('snd_select');if(this.menuIndex<2)this.choose(this.menuIndex?'actTarget':'fightTarget',['Glad Dummy']);else if(this.menuIndex===2)this.chooseInventory();else this.choose('mercy',['Spare']);}
  updateSubmenu(){
    this.drawSubmenu();if(this.cancel){this.toMenu(intro);return;}if(!this.confirmPressed)return;
    if(this.kind==='fightTarget')this.startFight();else if(this.kind==='actTarget')this.choose('act',['Check']);
    else if(this.kind==='act')this.showPages(['* GLAD DUMMY - ATK 0 DEF 0\n* Wipe that smile off your\n  face.'],()=>this.dummyTurn());
    else if(this.kind==='item')this.useInventory();else if(this.kind==='mercy')this.end('spare');
  }
  dummyTurn(){
    this.mode='speech';this.message.setText('');this.menu.setText('');this.target.setVisible(false);this.bar.setVisible(false);this.soul.setVisible(false);
    this.speechTime=80*1000/30;this.speechBox=this.add.image(157,68,'spr_blconsm:0').setOrigin(0).setScale(.5);this.speechText=this.add.bitmapText(165,73,'fnt_plain:black',speech[Math.min(this.turn,5)],6);
  }
  beginWave(){
    this.turn++;if(this.turn>6){this.showPages(['* Dummy tires of your\n  aimless shenanigans.'],()=>{this.mode='leaving';this.sound.play('snd_slidewhist');this.tweens.add({targets:this.enemy,y:260,duration:1600,onComplete:()=>this.end('leave')});});}
    else this.toMenu(Math.random()<.5?"* Dummy looks like it's\n  going to fall over.":'* Dummy stands around\n  absentmindedly.');
  }
  end(outcome){
    this.enemy.setVisible(false);this.music.stop();this.previousScene.flags[outcome==='kill'?252:27]=1;this.xpReward=0;this.goldReward=0;
    this.showPages(['* YOU WON!\n* You earned 0 XP and 0 gold.'],()=>this.finishWith(outcome));
  }
}
