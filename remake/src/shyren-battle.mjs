import { MultiBattle } from './multi-battle.mjs';
import { RuinsBattle } from './ruins-battle.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { shyrenAct, shyrenStatus } from './shyren-act.mjs';
import { ShyrenWave, loadShyrenWaveAssets } from './shyren-waves.mjs';

export class ShyrenBattle extends MultiBattle {
  constructor(){super('ShyrenBattle');}
  preload(){
    super.preload();loadShyrenWaveAssets(this);const base=new URL('../assets/',import.meta.url);
    for(const [key,count] of [['spr_shyren_hide',1],['spr_shyren_swim',4],['spr_shyren_sing',4],['spr_shyren_agent',2],['spr_blconsm',1]])for(let i=0;i<count;i++)if(!this.textures.exists(`${key}:${i}`))this.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
    if(!this.cache.bitmapFont.exists('fnt_plain')){this.load.json('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.json',base).href);this.load.image('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.png',base).href);}
  }
  loadBattleData(){super.loadBattleData();if(!this.cache.bitmapFont.exists('fnt_plain'))registerBitmapFont(this,'fnt_plain',{...this.cache.json.get('fnt_plain'),LineHeight:20});colorBitmapFont(this,'fnt_plain','black','#000000');return {battleDialogue:{intro:["* Shyren hides in the corner\n  but somehow encounters you\n  anyway."]}};}
  setupEnemy(){
    const w=this.previousScene,music=w.waterfallMusic;music?.pause();this.events.once('shutdown',()=>{if(music===w.waterfallMusic&&music?.isPaused)music.resume();});
    this.populationFlag=204;this.labels=[];this.selected=0;this.enemy.setPosition(109,18).setVisible(false);
    this.body=this.add.image(109,18,'spr_shyren_hide:0').setOrigin(0);this.agent=this.add.image(109,19.5,'spr_shyren_agent:0').setOrigin(0);this.enemyParts=[this.agent,this.body];
    this.enemies=[{index:0,name:'Shyren',main:this.enemy,hp:66,maxHp:66,def:2,mercy:5,alive:true}];this.actState={encourage:0,emotion:0,creep:0,mercyModifier:5,defense:2};this.animFrames=0;
  }
  updateSubmenu(){
    this.drawSubmenu();if(this.cancel){this.clearLabels();this.toMenu('* Shyren hums very faintly.');return;}if(!this.confirmPressed)return;
    if(this.kind.endsWith('Target')){const kind=this.kind;this.selectTarget();this.clearLabels();if(kind==='fightTarget')this.startFight();else this.choose('act',['Check','Hum','Smile','Conduct']);}
    else if(this.kind==='act'){const action=['check','hum','smile','conduct'][this.subIndex];this.clearLabels();this.act(action);}
    else if(this.kind==='item'){this.clearLabels();this.useInventory();}
    else if(this.kind==='mercy'){this.clearLabels();if(this.subIndex===1)this.flee();else if(this.spareable())this.end('spare');else this.dummyTurn();}
  }
  act(action){const pages=shyrenAct(this.actState,action),enemy=this.enemies[0];enemy.def=this.actState.defense;enemy.mercy=this.actState.mercyModifier;this.showPages(pages,()=>this.dummyTurn());}
  dummyTurn(){
    this.clearLabels();this.showingHurt=false;this.enemy.setVisible(false);this.body.setVisible(true);this.command=Math.round(Math.random()*100);
    const e=this.actState.encourage,line=e===0?(this.command<50?'....\n....\ntoot\n....':'....\n....\nhum hum'):['','si re,\nsi re\nsi mi\nsi mi','Si Fa\nSi Fa\nSo Fa So\nMi Re Re','Mi So\nMi So\nMi Si Mi\nLa Si So','(agg-\nressive\ntooting)','(final\ntoot)'][Math.min(e,5)];
    this.mode='speech';this.message.setText('');this.menu.setText('');this.speechTime=110*1000/30;this.speechBox=this.add.image(156,6,'spr_blconsm:0').setOrigin(0).setScale(.5);this.speechText=this.add.bitmapText(163,12,'fnt_plain:black',line,6);this.soul.setVisible(false);this.target.setVisible(false);this.bar.setVisible(false);this.arena.setPosition(113.5,125).setSize(90,67.5);
  }
  beginWave(){
    this.wave=new ShyrenWave(this,{encourage:this.actState.encourage,emotion:this.actState.emotion});this.bullets=this.wave.bullets;this.soulElapsed=0;this.mode='soul';this.soul.setVisible(true);
    if(this.actState.emotion===1){this.music.pause();this.sound.play('mus_singF');this.actState.emotion=2;}
  }
  finishSoul(){
    this.wave.destroy();this.bullets=[];this.soul.setVisible(false);this.music.resume();this.turn++;
    if(this.actState.encourage>=5){this.previousScene.flags[81]=2;this.end('spare');return;}
    this.toMenu(shyrenStatus(this.command,this.previousScene.flags,this.actState.encourage,this.enemyHp));this.arena.setPosition(16,125).setSize(285,67.5);
  }
  update(time,delta){super.update(time,delta);if(this.mode!=='dead'&&this.body?.active&&!this.showingHurt){this.animFrames+=delta*30/1000;const key=this.actState.emotion===0?'spr_shyren_hide':this.mode==='soul'?'spr_shyren_sing':'spr_shyren_swim',count=key==='spr_shyren_hide'?1:4;this.body.setTexture(`${key}:${Math.floor(this.animFrames*.2)%count}`).setY(18+Math.sin(this.animFrames/30)*2);}}
  hurtEnemy(enemy){this.showingHurt=true;this.body.setVisible(false);this.enemy.setTexture('spr_shyren:1').setVisible(true);}
  removeEnemy(enemy,killed){enemy.alive=false;this.pendingOutcome=killed?'kill':'spare';}
  rewardGold(outcome){const e=this.enemies[0];return (outcome==='kill'?25:Math.floor(25*(e.maxHp-e.hp)/e.maxHp))+(e.mercy>10&&e.hp===e.maxHp?30:0);}
  end(outcome=this.pendingOutcome){if(outcome==='kill')this.previousScene.flags[81]=1;else if(outcome==='spare')this.previousScene.flags[27]=1;this.clearLabels();RuinsBattle.prototype.end.call(this,outcome);}
}
