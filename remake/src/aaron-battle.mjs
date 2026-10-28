import { MultiBattle } from './multi-battle.mjs';
import { RuinsBattle } from './ruins-battle.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { aaronAct, aaronStatus } from './aaron-act.mjs';
import { AaronWave, loadAaronWaveAssets } from './aaron-waves.mjs';

// Battlegroup 40: Aaron một mình, ACT/FIGHT/ITEM/MERCY và hai đợt đạn.
export class AaronBattle extends MultiBattle {
  constructor(key = 'AaronBattle') { super(key); }
  preload() {
    super.preload(); loadAaronWaveAssets(this); const base = new URL('../assets/', import.meta.url);
    for (const [key,count] of [['spr_aaron',2],['spr_aaronbody',1],['spr_blconsm',1]]) {
      if (!this.cache.json.exists(key)) this.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
      for (let i=0;i<count;i++) if (!this.textures.exists(`${key}:${i}`)) this.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
    }
    if (!this.cache.bitmapFont.exists('fnt_plain')) { this.load.json('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.json',base).href);this.load.image('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.png',base).href); }
    if (!this.cache.audio.exists('snd_hurtbuzz')) this.load.audio('snd_hurtbuzz',new URL('sounds/snd_hurtbuzz/snd_hurtbuzz.wav',base).href);
  }
  loadBattleData() {
    super.loadBattleData(); if (!this.cache.bitmapFont.exists('fnt_plain')) registerBitmapFont(this,'fnt_plain',{...this.cache.json.get('fnt_plain'),LineHeight:20});
    colorBitmapFont(this,'fnt_plain','black','#000000'); return { battleDialogue: { intro: ['* Aaron flexes in!'] } };
  }
  setupEnemy() {
    const w=this.previousScene, music=w.waterfallMusic; music?.pause();
    this.events.once('shutdown',()=>{if (music===w.waterfallMusic && music?.isPaused) music.resume();});
    this.populationFlag=204;this.labels=[];this.selected=0;this.enemy.setPosition(108,19).setVisible(false);
    this.body=this.add.image(108,19,'spr_aaronbody:0').setOrigin(0);this.enemyParts=[this.body];
    this.enemies=[{index:0,name:'Aaron',main:this.enemy,hp:98,maxHp:98,def:2,mercy:5,alive:true}];
    this.baseAttack=w.lv===20?99:8+w.lv*2;this.attackBonus=0;this.actState={heard:-1,flex:0,attack:this.baseAttack,monsterAttack:7,mercyModifier:5};this.animElapsed=0;this.animFrames=0;this.lastAction=null;
  }
  updateSubmenu() {
    this.drawSubmenu();if(this.cancel){this.clearLabels();this.toMenu('* Aaron flexes in!');return;}if(!this.confirmPressed)return;
    if(this.kind.endsWith('Target')){const kind=this.kind;this.selectTarget();this.clearLabels();if(kind==='fightTarget')this.startFight();else this.choose('act',['Check','Shoo','Flex']);}
    else if(this.kind==='act'){const action=['check','shoo','flex'][this.subIndex];this.clearLabels();this.act(action);}
    else if(this.kind==='item'){this.clearLabels();this.lastAction=null;this.useInventory();}
    else if(this.kind==='mercy'){this.clearLabels();if(this.subIndex===1)this.flee();else if(this.spareable())this.end('spare');else {this.lastAction=null;this.dummyTurn();}}
  }
  act(action) {
    const result=aaronAct(this.actState,action,this.previousScene.flags), enemy=this.enemies[0];this.lastAction=action;
    this.attackBonus=this.actState.attack-this.baseAttack;enemy.mercy=this.actState.mercyModifier;
    this.showPages(result.pages,()=>{if(result.leaves)this.end('spare');else this.dummyTurn();});
  }
  dummyTurn() {
    this.clearLabels();this.showingHurt=false;this.enemy.setVisible(false);this.body.setVisible(true);this.command=Math.round(Math.random()*100);
    const f=this.previousScene.flags, normal=['Come on\nin, the\nwater\'s\nfine ; )','No need\nfor a\nswimming\nsuit ; )','Edu-\ncation?\nHobby?\nTalent?','Whew,\nI\'m\nsweating\n; )'], eerie=['Don\'t\nget too\nclose\n; )','Sure\nisn\'t\ncreepy\nout ; )','I sure\ndo love\nmuscles\n; )',normal[3]];
    let line=(f[95]===1?eerie:normal)[Math.min(3,Math.floor(this.command/25))];
    if(this.actState.heard===3)line=this.actState.flex===1?'Flexing\ncontest?\nOK, flex\nmore ; )':'Nice!!\nI won\'t\nlose\ntho ; )';
    else if(this.actState.heard===1)line=['Fiesty,\nhuh?\n; )','Wow!\nSpunky!\nLove it\n; )',"You'll\nchange\nyour\nmind ; )"][Math.floor(Math.random()*3)];
    else if(this.actState.heard===9)line=f[95]===1?'... ; )':'CHECK\nall you\nwant ; )';
    this.mode='speech';this.message.setText('');this.menu.setText('');this.speechTime=110*1000/30;
    this.speechBox=this.add.image(155.5,6.5,'spr_blconsm:0').setOrigin(0).setScale(.5);this.speechText=this.add.bitmapText(163,12,'fnt_plain:black',line,6);this.soul.setVisible(false);this.target.setVisible(false);this.bar.setVisible(false);this.arena.setPosition(113.5,125).setSize(90,67.5);
  }
  beginWave() { this.wave=new AaronWave(this,this.command,{damage:this.actState.monsterAttack});this.bullets=this.wave.bullets;this.soulElapsed=0;this.mode='soul';this.soul.setVisible(true);this.actState.heard=-1; }
  finishSoul() { this.wave.destroy();this.bullets=[];this.soul.setVisible(false);this.turn++;this.toMenu(aaronStatus(this.command,this.previousScene.flags,this.actState.flex,this.enemyHp));this.arena.setPosition(16,125).setSize(285,67.5); }
  update(time,delta) { this.animElapsed=Math.min(200,this.animElapsed+delta);while(this.animElapsed>=1000/30){this.animElapsed-=1000/30;this.animFrames++;}super.update(time,delta); }
  animateEnemy() { if(this.body?.active&&!this.showingHurt)this.body.y=19+Math.sin(this.animFrames/30)*4.5; }
  hurtEnemy() { this.showingHurt=true;this.body.setVisible(false);this.enemy.setVisible(true).setTexture('spr_aaron:1');this.sound.play('snd_damage');this.time.delayedCall(11*1000/30,()=>this.sound.play('snd_hurtbuzz')); }
  removeEnemy(enemy,killed) { enemy.alive=false;this.pendingOutcome=killed?'kill':'spare'; }
  rewardGold(outcome) { const e=this.enemies[0];return (outcome==='kill'?25:Math.floor(25*(e.maxHp-e.hp)/e.maxHp))+(e.mercy>10&&e.hp===e.maxHp?30:0); }
  end(outcome=this.pendingOutcome) { this.clearLabels();RuinsBattle.prototype.end.call(this,outcome); }
}
