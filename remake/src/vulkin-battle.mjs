import { RuinsBattle } from './ruins-battle.mjs';
import { fightInput } from './fight-input.mjs';
import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';
import { VulkinRules } from './vulkin-rules.mjs';
import { VulkinBody, loadVulkinBodyAssets } from './vulkin-body.mjs';
import { VulkinLavaWave, loadVulkinLavaAssets } from './vulkin-lava-wave.mjs';
import { VulkinCloudWave, loadVulkinCloudAssets } from './vulkin-cloud-wave.mjs';
import dialogue from './vulkin-dialogue.json' with { type: 'json' };

// Battlegroup 51: Vulkin một mình.
export class VulkinBattle extends RuinsBattle {
  constructor(){super('VulkinBattle');}
  preload() {
    super.preload();loadVulkinBodyAssets(this);loadVulkinLavaAssets(this);loadVulkinCloudAssets(this);
    const base=new URL('../assets/',import.meta.url);
    for(const key of ['spr_vulkinhurt','spr_blconsm'])if(!this.textures.exists(`${key}:0`))this.load.image(`${key}:0`,new URL(`sprites/${key}/${key}_0.png`,base).href);
    if(!this.cache.bitmapFont.exists('fnt_plain')){this.load.json('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.json',base).href);this.load.image('fnt_plain',new URL('fonts/fnt_plain/fnt_plain.png',base).href);}
    if(!this.cache.audio.exists('snd_vulkinhurt'))this.load.audio('snd_vulkinhurt',new URL('sounds/snd_vulkinhurt/snd_vulkinhurt.wav',base).href);
  }
  loadBattleData(){super.loadBattleData();if(!this.cache.bitmapFont.exists('fnt_plain'))registerBitmapFont(this,'fnt_plain',{...this.cache.json.get('fnt_plain'),LineHeight:20});colorBitmapFont(this,'fnt_plain','black','#000000');return {battleDialogue:dialogue};}
  setupEnemy(){
    const w=this.previousScene,music=w.hotlandMusic;music?.pause();
    this.events.once('shutdown',()=>{this.body?.destroy();if(music===w.hotlandMusic&&music?.isPaused)music.resume();});
    this.populationFlag=205;this.rules=new VulkinRules();this.mercyModifier=this.rules.mercyModifier;this.defense=w.lv===20?99:9+Math.ceil(w.lv/4);
    this.enemy.setPosition(53,62.5).setVisible(false);this.body=new VulkinBody(this);this.bodyElapsed=0;this.command=0;
  }
  update(time,delta){
    if(window.__remake.phase!=='battle'||window.__remake.scene!==this)return;
    this.bodyElapsed=Math.min(200,this.bodyElapsed+delta);
    while(this.bodyElapsed>=1000/30){this.bodyElapsed-=1000/30;if(this.body?.body.active)this.body.step();}
    super.update(time,delta);
  }
  animateEnemy(){}
  updateSubmenu(){
    if(!['actTarget','act'].includes(this.kind)){super.updateSubmenu();return;}
    this.drawSubmenu();if(this.cancel){this.toMenu(this.text.intro[0]);return;}if(!this.confirmPressed)return;
    if(this.kind==='actTarget'){this.choose('act',this.text.actions);return;}
    const action=['check','encourage','criticize','hug'][this.subIndex],result=this.rules.act(action,this.defense);
    this.defense=result.defense;this.mercyModifier=this.rules.mercyModifier;this.showPages(this.text[result.text],()=>this.dummyTurn());
  }
  dummyTurn(){
    this.body.pause=0;this.command=Math.round(Math.random()*100);
    const action=this.rules.lastAct;this.body.face=action==='encourage'?'spr_vulkinface3':action==='criticize'?'spr_vulkinface2':action==='hug'?'spr_vulkinface4':'spr_vulkinface';
    const key=this.rules.speech({hp:this.hp,maxHp:this.maxHp,command:this.command});
    this.mode='speech';this.message.setText('');this.menu.setText('');this.speechTime=110*1000/30;
    this.speechBox=this.add.image(103,62.5,'spr_blconsm:0').setOrigin(0).setScale(.5);this.speechText=this.add.bitmapText(110.5,67.5,'fnt_plain:black',this.text[key],6);
    this.target.setVisible(false);this.bar.setVisible(false);this.soul.setVisible(false);this.arena.setPosition(118.5,125).setSize(80,67.5);
  }
  beginWave(){
    const attack=this.rules.attack({hp:this.hp,maxHp:this.maxHp});
    if(attack.kind==='none'){this.finishTurn();return;}
    this.mode='soul';this.soul.setVisible(true);this.soulElapsed=0;
    this.wave=attack.kind==='lava'?new VulkinLavaWave(this,{rate:attack.rate}):new VulkinCloudWave(this,{rate:attack.rate});this.bullets=this.wave.bullets;
  }
  finishSoul(){this.wave.destroy();this.wave=null;this.finishTurn();}
  finishTurn(){
    this.bullets=[];this.soul.setVisible(false);this.turn++;
    const r=this.rules, status=r.criticized>1?this.text.idleCriticizeAgain:r.criticized?this.text.idleCriticize:r.encouraged?this.text.idleEncourage:r.hugged?this.text.idleHug:this.text.idle[this.command>=90?4:this.command>=75?3:this.command>=50?2:this.command>=25?1:0];
    this.toMenu(status);this.arena.setPosition(16,125).setSize(285,67.5);
  }
  hurt(damage){
    if(this.invFrames>0)return;
    this.hp=Math.max(0,this.hp-Math.max(1,Math.round(damage-(this.defense+this.previousScene.armorDefense)/5)));
    this.invFrames=30+(this.previousScene.armor===44?30:this.previousScene.armor===64?15:0)+(this.previousScene.weapon===45?15:0);this.sound.play('snd_hurt1');this.cameras.main.shake(1000/15,.006);this.refreshHp();
  }
  updateFight(delta){
    const hit=fightInput(this,delta,this.config.def);if(!hit)return;
    if(hit.miss){this.damage=undefined;this.showPages(['* MISS'],()=>this.dummyTurn());return;}
    this.damage=hit.damage;this.enemyHp=Math.max(0,this.enemyHp-this.damage);this.body.pause=1;this.sound.play('snd_damage');this.time.delayedCall(11*1000/30,()=>this.sound.play('snd_vulkinhurt'));
    this.showPages([String(this.damage)],()=>{if(this.enemyHp===0)this.end('kill');else this.dummyTurn();});
  }
  rewardGold(outcome){return (outcome==='kill'?50:Math.floor(50*(this.enemyMaxHp-this.enemyHp)/this.enemyMaxHp))+this.rules.bonus(this.enemyHp,this.enemyMaxHp);}
  end(outcome){
    if(this.rules.bonus(this.enemyHp,this.enemyMaxHp))this.previousScene.flags[148]=1;
    this.body.pause=1;for(const p of [this.body.back,this.body.body,this.body.lava,this.body.head,this.body.front])p.setVisible(false);for(const s of this.body.smoke)s.image.setVisible(false);
    super.end(outcome);
  }
}
