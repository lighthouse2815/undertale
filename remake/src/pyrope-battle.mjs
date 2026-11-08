import { RuinsBattle } from './ruins-battle.mjs';
import { fightInput } from './fight-input.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { PyropeRules } from './pyrope-rules.mjs';
import { PyropeHeatWave } from './pyrope-heat-wave.mjs';
import { PyropeBody, loadPyropeBodyAssets } from './pyrope-body.mjs';
import { PyropeRopeWave, loadPyropeRopeAssets } from './pyrope-rope-wave.mjs';
import { PyropeBombWave, loadPyropeBombAssets } from './pyrope-bomb-wave.mjs';
import dialogue from './pyrope-dialogue.json' with {type:'json'};

// Battlegroup 52: Pyrope một mình.
export class PyropeBattle extends RuinsBattle{
  constructor(){super('PyropeBattle');}
  preload(){
    super.preload();loadPyropeBodyAssets(this);loadPyropeRopeAssets(this);loadPyropeBombAssets(this);
    const base=new URL('../assets/',import.meta.url);
    for(const key of ['spr_pyropehurt','spr_blconsm'])if(!this.textures.exists(`${key}:0`))this.load.image(`${key}:0`,new URL(`sprites/${key}/${key}_0.png`,base).href);
    if(!this.cache.bitmapFont.exists('fnt_plain')){this.load.json('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.json',base).href);this.load.image('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.png',base).href);}
  }
  loadBattleData(){super.loadBattleData();if(!this.cache.bitmapFont.exists('fnt_plain'))registerBitmapFont(this,'fnt_plain',{...this.cache.json.get('fnt_plain'),LineHeight:20});colorBitmapFont(this,'fnt_plain','black','#000000');return {battleDialogue:dialogue};}
  setupEnemy(){
    const w=this.previousScene,music=w.hotlandMusic;music?.pause();this.events.once('shutdown',()=>{this.heatEffect?.destroy();this.body?.destroy();if(music===w.hotlandMusic&&music?.isPaused)music.resume();});
    this.populationFlag=205;this.rules=new PyropeRules();this.mercyModifier=this.rules.mercyModifier;this.enemy.setPosition(54,3.5).setVisible(false);
    this.body=new PyropeBody(this);this.heatEffect=new PyropeHeatWave(this,this.rules);this.bodyElapsed=0;this.bodyEnded=false;this.command=0;
  }
  update(time,delta){if(window.__remake.phase!=='battle'||window.__remake.scene!==this)return;this.bodyElapsed=Math.min(200,this.bodyElapsed+delta);while(this.bodyElapsed>=1000/30){this.bodyElapsed-=1000/30;if(!this.bodyEnded&&this.body?.head.active)this.body.step();this.heatEffect.step();}super.update(time,delta);}
  animateEnemy(){}
  updateSubmenu(){
    if(!['actTarget','act'].includes(this.kind)){super.updateSubmenu();return;}
    this.drawSubmenu();if(this.cancel){this.toMenu(this.text.intro[0]);return;}if(!this.confirmPressed)return;
    if(this.kind==='actTarget'){this.choose('act',this.text.actions);return;}
    const action=['check','heat','cool','invite'][this.subIndex],key=this.rules.act(action);this.mercyModifier=this.rules.mercyModifier;this.showPages(this.text[key],()=>this.dummyTurn());
  }
  dummyTurn(){
    this.body.hurt=false;this.command=Math.round(Math.random()*100);const line=this.text[this.rules.speech(this.command)];
    this.mode='speech';this.message.setText('');this.menu.setText('');this.speechTime=110*1000/30;
    this.speechBox=this.add.image(109,3.5,'spr_blconsm:0').setOrigin(0).setScale(.5);this.speechText=this.add.bitmapText(116.5,8.5,'fnt_plain:black',line,6);
    this.target.setVisible(false);this.bar.setVisible(false);this.soul.setVisible(false);this.arena.setPosition(118.5,125).setSize(80,67.5);
  }
  beginWave(){
    const attack=this.rules.attack(this.command);this.mode='soul';this.soul.setVisible(true);this.soulElapsed=0;
    this.wave=attack.kind==='rope'?new PyropeRopeWave(this,{damage:attack.damage}):new PyropeBombWave(this,{rate:attack.rate,damage:attack.damage});this.bullets=this.wave.bullets;
  }
  finishSoul(){this.wave.destroy();this.wave=null;this.bullets=[];this.soul.setVisible(false);this.turn++;this.toMenu(this.text[this.rules.status(this.command)]);this.arena.setPosition(16,125).setSize(285,67.5);}
  updateFight(delta){
    const hit=fightInput(this,delta,this.config.def);if(!hit)return;
    if(hit.miss){this.damage=undefined;this.showPages(['* MISS'],()=>this.dummyTurn());return;}
    this.damage=hit.damage;this.enemyHp=Math.max(0,this.enemyHp-this.damage);this.body.hurt=true;this.sound.play('snd_damage');this.time.delayedCall(11*1000/30,()=>this.sound.play('snd_ehurt1'));
    this.showPages([String(this.damage)],()=>{if(this.enemyHp===0)this.end('kill');else this.dummyTurn();});
  }
  rewardGold(outcome){return (outcome==='kill'?40:Math.floor(40*(this.enemyMaxHp-this.enemyHp)/this.enemyMaxHp))+this.rules.bonus(this.enemyHp,this.enemyMaxHp);}
  end(outcome){
    if(this.rules.bonus(this.enemyHp,this.enemyMaxHp))this.previousScene.flags[150]=1;
    for(const p of [this.body.left,this.body.right,...this.body.segments,this.body.head])p.setVisible(false);this.bodyEnded=true;super.end(outcome);
  }
}
