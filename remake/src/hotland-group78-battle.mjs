import { MultiBattle } from './multi-battle.mjs';
import { PyropeBattle } from './pyrope-battle.mjs';
import { PyropeRules } from './pyrope-rules.mjs';
import { PyropeBody } from './pyrope-body.mjs';
import { PyropeHeatWave } from './pyrope-heat-wave.mjs';
import { PyropeRopeWave } from './pyrope-rope-wave.mjs';
import { PyropeBombWave } from './pyrope-bomb-wave.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';
import data from './pyrope-dialogue.json' with {type:'json'};

const intro='* The rare and threatening\n  Double Davis.';

// Battlegroup 78: hai Pyrope cùng nhận Heat Up/Cool Down.
export class HotlandGroup78Battle extends MultiBattle{
  constructor(){super('HotlandGroup78Battle');}
  preload(){PyropeBattle.prototype.preload.call(this);}
  loadBattleData(){PyropeBattle.prototype.loadBattleData.call(this);return {battleDialogue:{intro:[intro]}};}
  setupEnemy(){
    const w=this.previousScene,music=w.hotlandMusic;music?.pause();
    this.events.once('shutdown',()=>{this.heatEffect?.destroy();for(const e of this.enemies??[])e.body.destroy();if(music===w.hotlandMusic&&music?.isPaused)music.resume();});
    this.enemy.destroy();this.labels=[];this.selected=0;this.xpReward=0;this.goldReward=0;this.animElapsed=0;this.heatState={heatWave:0};this.heatEffect=new PyropeHeatWave(this,this.heatState);
    this.enemies=[0,1].map(index=>{
      const x=index?153:53,y=5,e={index,type:'pyrope',name:'Pyrope',hp:110,maxHp:110,def:1,mercy:20,alive:true,x,y,rules:new PyropeRules()};
      e.main=this.add.image(x,y,'spr_pyropehurt:0').setOrigin(0).setScale(.5).setVisible(false);e.body=new PyropeBody(this,x+4,y+54);return e;
    });this.enemy=this.enemies[0].main;
  }
  updateSubmenu(){
    this.drawSubmenu();if(this.cancel){this.clearLabels();this.toMenu(intro);return;}if(!this.confirmPressed)return;
    if(this.kind.endsWith('Target')){const kind=this.kind,e=this.selectTarget();this.clearLabels();if(kind==='fightTarget')this.startFight();else this.choose('act',data.actions);}
    else if(this.kind==='act'){
      const e=this.enemies[this.selected],action=['check','heat','cool','invite'][this.subIndex];this.clearLabels();
      const key=e.rules.act(action);
      if(action==='heat'||action==='cool')for(const other of this.live())if(other!==e)other.rules.act(action);
      if(action==='heat'||action==='cool')this.heatState.heatWave=e.rules.heatWave;
      for(const other of this.live())other.mercy=other.rules.mercyModifier;
      this.showPages(data[key],()=>this.dummyTurn());
    }else if(this.kind==='item'){this.clearLabels();this.useInventory();}
    else if(this.kind==='mercy'){
      this.clearLabels();if(this.subIndex===1){this.flee();return;}
      for(const e of this.live().filter(e=>this.spareable(e)))this.removeEnemy(e,false);
      if(!this.live().length)this.end();else this.dummyTurn();
    }
  }
  dummyTurn(){
    this.clearLabels();this.mode='speech';this.message.setText('');this.menu.setText('');this.speechTime=110*1000/30;this.speechBoxes=[];this.speechTexts=[];
    for(const e of this.live()){
      e.body.hurt=false;e.command=Math.round(Math.random()*100);const line=data[e.rules.speech(e.command)],x=e.x+55,y=e.y;
      this.speechBoxes.push(this.add.image(x,y,'spr_blconsm:0').setOrigin(0).setScale(.5));this.speechTexts.push(this.add.bitmapText(x+7.5,y+5,'fnt_plain:black',line,6));
    }
    this.soul.setVisible(false);this.target.setVisible(false);this.bar.setVisible(false);
  }
  update(time,delta){
    if(window.__remake.phase!=='battle'||window.__remake.scene!==this)return;
    this.animElapsed=Math.min(200,this.animElapsed+delta);while(this.animElapsed>=1000/30){this.animElapsed-=1000/30;for(const e of this.live())e.body.step();this.heatEffect.step();}
    if(this.mode==='speech'&&(this.speechTime<=delta||this.confirmPressed)){this.speechBoxes.forEach(p=>p.destroy());this.speechTexts.forEach(p=>p.destroy());}
    super.update(time,delta);
  }
  animateEnemy(){}
  beginWave(){
    const live=this.live(),population=live.length,waves=live.map(e=>{
      const a=e.rules.attack(e.command,population);
      return a.kind==='rope'?new PyropeRopeWave(this,{damage:a.damage}):new PyropeBombWave(this,{rate:a.rate,population,damage:a.damage});
    });
    let frame=0;this.wave={waves,bullets:[],step(){for(const w of waves)w.step();this.bullets=waves.flatMap(w=>w.bullets);return ++frame>=180;},destroy(){for(const w of waves)w.destroy();}};
    this.bullets=[];this.mode='soul';this.soulElapsed=0;this.soul.setVisible(true);
  }
  finishSoul(){
    this.wave.destroy();this.wave=null;this.bullets=[];this.soul.setVisible(false);this.turn++;let line=intro;
    for(const e of this.live()){e.mercy=e.rules.mercyModifier;line=data[e.rules.status(e.command)];}
    this.toMenu(line);this.arena.setPosition(16,125).setSize(285,67.5);
  }
  hurtEnemy(e){e.body.hurt=true;this.sound.play('snd_damage');this.time.delayedCall(11*1000/30,()=>this.sound.play('snd_ehurt1'));}
  removeEnemy(e,killed){
    if(!e.alive)return;e.alive=false;e.main.setVisible(false);for(const p of [e.body.left,e.body.right,...e.body.segments,e.body.head])p.setVisible(false);
    const bonus=e.rules.bonus(e.hp,e.maxHp),w=this.previousScene;this.goldReward+=(killed?40:Math.floor(40*(e.maxHp-e.hp)/e.maxHp))+bonus;
    if(bonus)w.flags[150]=1;
    if(killed){this.xpReward+=80;w.kills++;w.flags[12]=1;w.flags[205]=(w.flags[205]??0)+1;}
    else{w.flags[10]=1;w.flags[23]=(w.flags[23]??0)+1;}
  }
  end(){
    this.clearLabels();this.music.stop();let line=this.dialogue.win[0].replace(/\\\[1\]/g,String(this.xpReward)).replace(/\\\[2\]/g,String(this.goldReward));const w=this.previousScene;
    if(LEVEL_THRESHOLDS.filter(t=>w.xp+this.xpReward>=t).length>w.lv){line+=this.dialogue.levelUp[0];this.sound.play('snd_levelup');}
    this.showPages([line],()=>this.finishWith());
  }
  finishWith(outcome){
    const w=this.previousScene;if(outcome==='flee'){w.flags[11]=1;w.flags[24]=(w.flags[24]??0)+1;}
    w.xp=Math.min(99999,w.xp+this.xpReward);w.gold+=this.goldReward;w.lv=LEVEL_THRESHOLDS.filter(t=>w.xp>=t).length;w.maxHp=w.lv===20?99:16+w.lv*4;this.finishBattle();
  }
}
