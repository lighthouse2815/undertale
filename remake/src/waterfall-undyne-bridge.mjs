import { createCollider } from './movement.mjs';
import { UndyneBridgeSpears } from './undyne-bridge-spears.mjs';

// obj_undyneencounter3, obj_speartilefake và obj_speartilegen.
export class WaterfallUndyneBridge {
  constructor(world){
    this.world=world;this.elapsed=0;this.frames=0;this.stage=world.plot<114?'waiting':'done';this.fake=[];this.barriers=[];this.fixed=[];this.xhome=300;this.yhome=140;this.route=0;
    if(this.stage==='done')return;
    this.undyne=world.add.image(300,140,'spr_undyne_starkd:0').setOrigin(0).setAlpha(0).setDepth(-1000090);
    this.shadow=world.add.image(300,140,'spr_undyne_shad:0').setOrigin(0).setAlpha(0).setDepth(-1000091);
  }
  wait(stage,frames){this.stage=stage;this.frames=0;this.duration=frames;}
  checkTrigger(){
    const w=this.world;if(this.stage!=='waiting'||w.player.x<=280||w.dialogue)return false;
    w.release();this.wait('warning',260);
    const points=[[340,80,30],[240,60,80],[260,100,130],[300,60,200],[320,80,203],[240,80,206],[300,80,209],[260,80,212],[300,100,215],[320,60,218],[260,60,221]];
    this.fake=points.map(([x,y,delay])=>({delay,image:w.add.image(x,y,'spr_tilespear:0').setOrigin(0).setAlpha(0).setDepth(y+20)}));return true;
  }
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}return ['warning','fakeFade','revealWait','reveal','approach'].includes(this.stage);}
  step(){
    const w=this.world;this.frames++;
    const mix=w.waterfallRainMix;if(mix&&w.waterfallRain&&w.waterfallRainLight){mix.deep=Math.max(0,mix.deep-.02);mix.normal=Math.max(0,mix.normal-.02);w.waterfallRain.setVolume(mix.deep);w.waterfallRainLight.setVolume(mix.normal);if(mix.deep<.1&&mix.normal<.1){w.waterfallRain.destroy();w.waterfallRainLight.destroy();w.waterfallRain=null;w.waterfallRainLight=null;w.waterfallRainMix=null;}}
    if(this.stage==='warning'){
      for(const f of this.fake)if(this.frames>=f.delay){if(this.frames===f.delay)w.sound.play('snd_spearappear');f.image.alpha=Math.min(1,f.image.alpha+.07);}
      if(this.frames>=this.duration){w.sound.play('snd_spearrise');w.sound.play('snd_impact');w.cameras.main.shake(1000/10,.012);for(const f of this.fake)f.image.setTexture('spr_tilespear:3');this.wait('fakeFade',30);}
    }else if(this.stage==='fakeFade'){
      if(this.frames>20)for(const f of this.fake)f.image.alpha=Math.max(0,f.image.alpha-.1);
      if(this.frames>=this.duration){for(const f of this.fake)f.image.destroy();this.fake=[];for(let i=0;i<3;i++){const body=createCollider(w.dataSource,{ObjectName:'obj_solidsmall',X:40,Y:80+i*20,ScaleX:1,ScaleY:1});this.barriers.push(body);w.colliders.push(body);}for(let i=0;i<5;i++)this.fixed.push(w.add.image(50-i*2,100-i*12,'spr_tilespear:3').setOrigin(0).setDepth(500));this.wait('revealWait',20);}
    }else if(this.stage==='revealWait'&&this.frames>=this.duration){w.sound.play('mus_fearsting');this.wait('reveal',30);}
    else if(this.stage==='reveal'){
      this.undyne.alpha=Math.min(1,this.undyne.alpha+.05);
      if(this.frames>=this.duration){this.music=w.sound.add('mus_undynefast',{loop:true});this.music.play();w.flags[17]=1;this.wait('approach',6);}
    }else if(this.stage==='approach'){
      this.yhome+=4;this.undyne.setTexture(`spr_undyne_starkd:${Math.floor(this.frames*.25)%4}`);
      if(this.frames>=this.duration){this.tiles=new UndyneBridgeSpears(w);this.wait('chase',0);}
    }else if(this.stage==='chase'){
      this.moveActor();this.shadow.alpha=Math.min(1,this.shadow.alpha+.1);
      this.tiles.step();
    }
    if(this.undyne){const c=w.cameras.main;this.undyne.setPosition(this.xhome+Math.floor(Math.max(0,c.scrollX)*.2),this.yhome+Math.floor(Math.max(0,c.scrollY)*.2));this.shadow.setPosition(this.undyne.x,this.undyne.y);}
  }
  moveActor(){
    const p=this.world.player,u=this.undyne;let dx=0,dy=0;
    if(this.route===0){if(p.x>u.x+40&&this.xhome<1110)dx=3;else if(p.x<u.x-40)dx=-3;if(this.xhome>=1110){this.xhome=1109;this.yhome=161;this.route=1;}}
    else if(this.route===1){if(p.y>u.y+60&&this.yhome<550)dy=3;else if(p.y<u.y-60&&this.yhome>160)dy=-3;if(this.yhome>=550){this.yhome=550;this.xhome=1109;this.route=2;}else if(this.yhome<=160&&p.x<u.x-60){this.xhome=1109;this.route=0;}}
    else if(this.route===2||this.route===4){if(p.x>u.x+40&&this.xhome<1110)dx=3;else if(p.x<u.x-20&&this.xhome>800)dx=-3;if(this.route===2&&this.xhome<=800){this.xhome=800;this.yhome=551;this.route=3;}else if(this.route===2&&this.xhome>=1110){this.yhome=549;this.route=1;}else if(this.route===4&&this.xhome<=800&&p.y<u.y-10){this.yhome=799;this.route=3;}}
    else if(this.route===3){if(p.y>u.y+60&&this.yhome>550)dy=3;else if(p.y<u.y-10&&this.yhome<800)dy=-3;if(this.yhome<=550&&p.x>u.x+60){this.yhome=551;this.xhome=801;this.route=2;}else if(this.yhome>=800&&p.x>u.x+40){this.xhome=801;this.route=4;}}
    this.xhome+=dx;this.yhome+=dy;this.undyne.setTexture(`spr_undyne_starkd:${dx||dy?Math.floor(this.frames*.2)%4:0}`);
  }
  destroy(){this.music?.destroy();this.undyne?.destroy();this.shadow?.destroy();for(const f of this.fake)f.image.destroy();for(const image of this.fixed)image.destroy();this.tiles?.destroy();}
}
