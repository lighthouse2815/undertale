import { MultiBattle } from './multi-battle.mjs';
import { VulkinBattle } from './vulkin-battle.mjs';
import { VulkinRules } from './vulkin-rules.mjs';
import { VulkinBody } from './vulkin-body.mjs';
import { VulkinLavaWave } from './vulkin-lava-wave.mjs';
import { VulkinCloudWave } from './vulkin-cloud-wave.mjs';
import { TsunderplaneRules } from './tsunderplane-rules.mjs';
import { TsunderplaneBody, loadTsunderplaneBodyAssets } from './tsunderplane-body.mjs';
import { TsunderplanePlanes, loadTsunderplanePlaneAssets } from './tsunderplane-planes.mjs';
import { TsunderplaneBombs, loadTsunderplaneBombAssets } from './tsunderplane-bombs.mjs';
import { LEVEL_THRESHOLDS } from './levels.mjs';
import vulkin from './vulkin-dialogue.json' with {type:'json'};
import plane from './tsunderplane-dialogue.json' with {type:'json'};

const intro="* Tsunderplane attacks!\n* Not because it's jealous Vulkin\n  is paying attention to you!";

// Battlegroup 77: Tsunderplane và Vulkin cùng tấn công.
export class HotlandGroup77Battle extends MultiBattle{
  constructor(){super('HotlandGroup77Battle');}
  preload(){VulkinBattle.prototype.preload.call(this);loadTsunderplaneBodyAssets(this);loadTsunderplanePlaneAssets(this);loadTsunderplaneBombAssets(this);}
  loadBattleData(){VulkinBattle.prototype.loadBattleData.call(this);return {battleDialogue:{intro:[intro]}};}
  setupEnemy(){
    const w=this.previousScene,music=w.hotlandMusic;music?.pause();
    this.events.once('shutdown',()=>{for(const e of this.enemies??[])e.body.destroy();if(music===w.hotlandMusic&&music?.isPaused)music.resume();});
    this.enemy.destroy();this.labels=[];this.selected=0;this.xpReward=0;this.goldReward=0;this.animElapsed=0;
    this.defense=w.lv===20?99:9+Math.ceil(w.lv/4);this.baseAttack=w.lv===20?99:8+w.lv*2;this.attackBonus=0;
    const p={index:0,type:'plane',name:'Tsunderplane',hp:80,maxHp:80,def:6,mercy:5,alive:true,x:23,y:18,rules:new TsunderplaneRules()};
    const v={index:1,type:'vulkin',name:'Vulkin',hp:20,maxHp:20,def:-10,mercy:-40,alive:true,x:153,y:62.5,rules:new VulkinRules(),special:false};
    p.main=this.add.image(p.x,p.y,'spr_tsunderplane:0').setOrigin(0).setScale(.5).setVisible(false);p.body=new TsunderplaneBody(this,p.rules,p.x,p.y);
    v.main=this.add.image(v.x,v.y,'spr_vulkinhurt:0').setOrigin(0).setScale(.5).setVisible(false);v.body=new VulkinBody(this,v.x,v.y);
    this.enemies=[p,v];this.enemy=p.main;
  }
  updateSubmenu(){
    this.drawSubmenu();if(this.cancel){this.clearLabels();this.toMenu(intro);return;}if(!this.confirmPressed)return;
    if(this.kind.endsWith('Target')){const kind=this.kind,e=this.selectTarget();this.clearLabels();if(kind==='fightTarget')this.startFight();else this.choose('act',e.type==='plane'?plane.actions:vulkin.actions);}
    else if(this.kind==='act'){
      const e=this.enemies[this.selected],action=(e.type==='plane'?['check','approach','flirt']:['check','encourage','criticize','hug'])[this.subIndex];
      this.clearLabels();let key;if(e.type==='plane')key=e.rules.act(action);else{const result=e.rules.act(action,this.defense);key=result.text;this.defense=result.defense;}
      e.mercy=e.rules.mercyModifier;this.showPages((e.type==='plane'?plane:vulkin)[key],()=>this.dummyTurn());
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
      e.command=Math.round(Math.random()*100);let line,x,y;
      if(e.type==='plane'){e.body.hurt=false;line=plane[e.rules.speech(e.command)];x=e.x+77.5;y=e.y-12.5;}
      else{e.body.pause=0;const action=e.rules.lastAct;e.body.face=action==='encourage'?'spr_vulkinface3':action==='criticize'?'spr_vulkinface2':action==='hug'?'spr_vulkinface4':'spr_vulkinface';line=vulkin[e.rules.speech({hp:this.hp,maxHp:this.maxHp,command:e.command})];x=e.x+50;y=e.y;}
      this.speechBoxes.push(this.add.image(x,y,'spr_blconsm:0').setOrigin(0).setScale(.5));this.speechTexts.push(this.add.bitmapText(x+7.5,y+5,'fnt_plain:black',line,6));
    }
    this.soul.setVisible(false);this.target.setVisible(false);this.bar.setVisible(false);
  }
  update(time,delta){
    this.animElapsed=Math.min(200,this.animElapsed+delta);while(this.animElapsed>=1000/30){this.animElapsed-=1000/30;for(const e of this.live())e.body.step();}
    if(this.mode==='speech'&&(this.speechTime<=delta||this.confirmPressed)){this.speechBoxes.forEach(p=>p.destroy());this.speechTexts.forEach(p=>p.destroy());}
    super.update(time,delta);
  }
  animateEnemy(){}
  beginWave(){
    const live=this.live(),population=live.length,waves=[];
    for(const e of live){
      if(e.type==='plane'){
        const a=e.rules.attack(e.command,population);
        waves.push(a.kind==='planes'?new TsunderplanePlanes(this,e.rules,{green:a.green,rate:a.rate,population}):new TsunderplaneBombs(this,{rate:a.rate,population}));
      }else{
        const a=e.rules.attack({hp:this.hp,maxHp:this.maxHp,population});
        if(a.kind==='lava')waves.push(new VulkinLavaWave(this,{rate:a.rate}));else if(a.kind==='cloud')waves.push(new VulkinCloudWave(this,{rate:a.rate}));
      }
    }
    if(!waves.length){this.finishTurn();return;}
    let frame=0;this.wave={waves,bullets:[],step(){for(const w of waves)w.step();this.bullets=waves.flatMap(w=>w.bullets);return ++frame>=160;},destroy(){for(const w of waves)w.destroy();}};
    this.bullets=[];this.mode='soul';this.soulElapsed=0;this.soul.setVisible(true);
  }
  finishSoul(){this.wave.destroy();this.wave=null;this.finishTurn();}
  finishTurn(){
    this.bullets=[];this.soul.setVisible(false);this.turn++;let line=intro;
    for(const e of this.live()){
      e.mercy=e.rules.mercyModifier;if(e.type==='plane'){e.def=e.rules.defense;line=plane[e.rules.status(e.command,e.hp)];}
      else{const r=e.rules;line=e.special?'* Vulkin reassures you the\n  plane turning tiny is, like,\n  completely intentional.':r.criticized>1?vulkin.idleCriticizeAgain:r.criticized?vulkin.idleCriticize:r.encouraged?vulkin.idleEncourage:r.hugged?vulkin.idleHug:vulkin.idle[e.command>=90?4:e.command>=75?3:e.command>=50?2:e.command>=25?1:0];e.special=false;}
    }
    this.toMenu(line);this.arena.setPosition(16,125).setSize(285,67.5);
  }
  hurt(damage){
    if(this.invFrames>0)return;this.hp=Math.max(0,this.hp-Math.max(1,Math.round(damage-(this.defense+this.previousScene.armorDefense)/5)));
    this.invFrames=30+(this.previousScene.armor===44?30:this.previousScene.armor===64?15:0)+(this.previousScene.weapon===45?15:0);this.sound.play('snd_hurt1');this.cameras.main.shake(1000/15,.006);this.refreshHp();
  }
  hurtEnemy(e){if(e.type==='plane')e.body.hurt=true;else e.body.pause=1;this.sound.play('snd_damage');this.time.delayedCall(11*1000/30,()=>this.sound.play(e.type==='plane'?'snd_ehurt1':'snd_vulkinhurt'));}
  removeEnemy(e,killed){
    if(!e.alive)return;e.alive=false;e.main.setVisible(false);
    const parts=e.type==='plane'?[e.body.plane,e.body.hat,e.body.blush]:[e.body.back,e.body.body,e.body.lava,e.body.head,e.body.front];
    for(const p of parts)p.setVisible(false);for(const p of e.body.smoke)p.image.setVisible(false);
    const reward=e.type==='plane'?45:50,bonus=e.rules.bonus(e.hp,e.maxHp),w=this.previousScene;
    this.goldReward+=(killed?reward:Math.floor(reward*(e.maxHp-e.hp)/e.maxHp))+bonus;
    if(bonus)w.flags[e.type==='plane'?149:148]=1;
    if(killed){this.xpReward+=e.type==='plane'?95:70;w.kills++;w.flags[12]=1;w.flags[205]=(w.flags[205]??0)+1;}
    else{w.flags[10]=1;w.flags[23]=(w.flags[23]??0)+1;if(e.type==='plane'&&this.enemies[1].alive)this.enemies[1].special=true;}
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
