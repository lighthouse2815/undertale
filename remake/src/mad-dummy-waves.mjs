import {RuinsWave} from './ruins-waves.mjs';
import {MadDummyProjectile} from './mad-dummy-projectile.mjs';
import {MadDummyShot} from './mad-dummy-shot.mjs';
import {madDummyFirstHit} from './mad-dummy-dialogue.mjs';
import {maskContains} from './collision-mask.mjs';

export function loadMadDummyWaveAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const [key,count] of [['spr_dummybullet',4],['spr_dummybullet_red',4],['spr_dummybullet_shock',4],['spr_dummybullet_sad',4],['spr_dummybot',4],['spr_dummyshot',3],['spr_hotlandmissle',4],['spr_dummymissle_shot',7]]){
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for(let i=0;i<count;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  }
}

// obj_maddummy: đội hình theo con2 và HP; toạ độ gốc 640×480.
export class MadDummyWave extends RuinsWave {
  constructor(scene,{border={left:237,right:397,top:250,bottom:385},random=Math.random,onDummyHit=()=>{},onFirstHit=()=>{},onHelpersDismissal=()=>{},state=null,phase=0,hp=300,damage,type2=0}={}){
    if(state)({phase,hp,type2}=state.beginWave());
    damage ??= phase===0?0:7;
    super(scene,'madDummy');this.border=border;this.onDummyHit=onDummyHit;this.onFirstHit=onFirstHit;this.onHelpersDismissal=onHelpersDismissal;this.firstHitTimer=null;this.state=state;this.spawners=[];this.shots=[];this.phase=phase;this.damage=damage;
    const b=border,top=(offset)=>this.spawn(b.left+random()*(b.right-b.left)-20,b.top-offset,2);
    const bottom=(offset)=>this.spawn(b.left+30+random()*(b.right-b.left-70),b.bottom+offset+random()*10,3);
    if(phase===0){this.duration=360;for(const offset of [40,45,50,130,135,140,220,225,230])top(offset);for(let i=0;i<6;i++)for(const offset of [310,360,410])bottom(offset);}
    else if(phase===2){this.duration=260;for(const offset of [40,50,60,70,80])top(offset);for(const offset of [150,160,170,180,190])this.spawn(b.left-offset,b.top+random()*80,0);for(const offset of [270,280,290,300,310])this.spawn(b.right+offset,b.top+random()*80,1);for(let i=0;i<6;i++)for(const offset of [400,470,540])bottom(offset);}
    else if(phase===3&&hp>=255){this.duration=220;for(let g=1;g<=6;g++)this.spawn(b.left-50-g*5,b.top+100+random()*60,0);for(let g=1;g<=6;g++)this.spawn(b.right+150+g*5,b.top+random()*60,1);for(let g=1;g<=6;g++)this.spawn(b.left-150-g*5,b.top+random()*60,0);for(let g=1;g<=6;g++)this.spawn(b.right+50+g*5,b.top+100+random()*60,1);for(let i=0;i<6;i++)for(const offset of [270,310,360])bottom(offset);if(hp>=999){this.duration=160;for(let i=0;i<4;i++)for(const offset of [30,90,150,210])bottom(offset);}}
    else if(phase===3){this.duration=160;this.phase=hp<255?4:3;for(let i=0;i<4;i++)for(const offset of [30,90,150,210])bottom(offset);}
    else if(phase===5){
      const row=(side,pos,choice)=>{for(let i=0;i<7;i++)if(i!==choice&&i!==choice+1)this.spawn(side===2?b.left+10+i*25:pos,side===2?pos:b.bottom-25-i*25,side,1);};
      this.nextType=(type2+1)%4;
      if(type2===0){this.duration=175;row(2,b.top-50,Math.floor(random()*7));for(let i=0;i<4;i++)for(const offset of [170,180,190])bottom(offset);}
      else if(type2===1){this.duration=160;row(0,b.left-40,Math.floor(random()*4)+2);row(1,b.right+110,Math.floor(random()*4)+2);for(let i=0;i<4;i++)for(const offset of [160,170,180])bottom(offset);}
      else if(type2===2){this.duration=220;const choices=Array.from({length:3},()=>Math.floor(random()*3)+2);for(let i=0;i<7;i++)for(let j=0;j<3;j++)if(i!==choices[j]&&i!==choices[j]+1)this.spawn(b.left+10+i*25,b.top-[50,110,170][j],2,1);for(let i=0;i<4;i++)for(const offset of [260,270,280])bottom(offset);}
      else if(type2===3){this.duration=240;row(0,b.left-40,Math.floor(random()*4)+2);row(1,b.right+20,Math.floor(random()*4)+2);row(2,b.top-150,Math.floor(random()*7));for(let i=0;i<4;i++)for(const offset of [290,300,310])bottom(offset);}
      else throw new Error(`Loại đạn Mad Dummy không hợp lệ: ${type2}`);
    }
    else if(phase===7){this.duration=333;this.summonHelpers(random);}
    else if(phase===14){this.duration=180;this.phase=15;for(let i=0;i<5;i++)this.spawn(b.left+20+i*30,b.bottom+20,3,4);}
    else if(phase===15){this.duration=180;this.phase=16;for(let i=0;i<3;i++){this.spawn(b.left+20+i*60,b.bottom+20,3,4);this.spawn(b.left-40,b.top+30+i*60,0,4);this.spawn(b.right+20,b.top+30+i*60,1,4);}}
    else if(phase===16){this.duration=280;this.phase=17.5;for(let i=0;i<5;i++){this.spawn(b.left+180-i*40,b.bottom+20+i*10,3,4);this.spawn(b.left-110-i*10,b.top+150-i*30,0,4);this.spawn(b.left+20+i*40,b.top-200-i*10,2,4);this.spawn(b.right+280+i*10,b.top+30+i*30,1,4);}}
    else if(phase===17.5){this.duration=460;this.phase=17;for(const [side,x,choices] of [[0,b.left-60,3],[1,b.right+100,3],[0,b.left-240,3],[1,b.right+280,3],[0,b.left-440,2],[1,b.right+360,3]]){const choice=Math.floor(random()*choices)+2;for(let i=0;i<7;i++)if(i!==choice&&i!==choice+1)this.spawn(x,b.bottom-25-i*25,side,1);}this.spawn(b.left+170,b.bottom+60,3,4);this.spawn(b.left+100,b.top-360,2,4);for(let i=0;i<6;i++){this.spawn(b.left+20+i*30,b.bottom+690,3,4);this.spawn(b.left-700,b.top+30+i*30,0,4);this.spawn(b.right+690,b.top+30+i*30,1,4);}}
    else throw new Error(`Đội hình Mad Dummy chưa hỗ trợ: ${phase}`);
  }
  spawn(x,y,side,type=0,damage=this.damage){const actor=new MadDummyProjectile({x,y,side,type,damage}),image=this.scene.add.image(x/2,y/2,`${type===4?'spr_dummybot':'spr_dummybullet'}:${side}`).setOrigin(0).setScale(.5);this.spawners.push({actor,image});}
  summonHelpers(random=Math.random){const b=this.border;for(let i=0;i<8;i++){this.spawn(b.left+30+random()*(b.right-b.left-70),b.bottom+10+random()*10,3,2,1);this.spawn(b.left+30+random()*(b.right-b.left-70),b.top-40+random()*10,2,2,1);this.spawn(b.left-26-random()*10,b.bottom-25-random()*200,0,2,1);this.spawn(b.right+26+random()*10,b.bottom-25-random()*200,1,2,1);}this.duration=this.frames+333;}
  setHelpersMood(mood){if(!['shock','sad'].includes(mood))throw new Error(`Trạng thái Dummy không hợp lệ: ${mood}`);this.helpersMood=mood;if(mood==='sad')for(const e of this.spawners)if(e.actor.type===2)e.actor.scatter();}
  missileTouchesHeart(shot){
    const data=this.scene.cache.json.get('spr_hotlandmissle'),angle=shot.direction*Math.PI/180,extent=((data.MarginRight-data.MarginLeft+1)/2)*(Math.abs(Math.cos(angle))+Math.abs(Math.sin(angle))),hx=this.scene.soul.x*2,hy=this.scene.soul.y*2;
    for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(hx+x>=shot.x-extent&&hx+x<shot.x+extent&&hy+y>=shot.y-extent&&hy+y<shot.y+extent&&maskContains(this.scene,'spr_heart:mask',x,y))return true;
    return false;
  }
  step(){
    this.frames++;const s=this.scene,heart={x:s.soul.x*2,y:s.soul.y*2};
    if(this.firstHitTimer!==null&&--this.firstHitTimer===0){this.firstHitTimer=null;if(this.state?.phase===0){this.state.startFirstHitDialogue();this.onFirstHit(madDummyFirstHit());}}
    for(const entry of this.spawners){
      const result=entry.actor.step({border:this.border,heart}),sprite=entry.actor.type===2&&this.helpersMood?`spr_dummybullet_${this.helpersMood}`:entry.actor.type===4?'spr_dummybot':entry.actor.red?'spr_dummybullet_red':'spr_dummybullet';entry.image.setPosition(entry.actor.x/2,entry.actor.y/2).setTexture(`${sprite}:${entry.actor.side}`);if(s.invFrames<=0&&this.touchesHeart({x:entry.actor.x,y:entry.actor.y,sprite})){s.hurt(entry.actor.damage);entry.actor.dead=true;}
      if(result){const shot=new MadDummyShot(result),image=s.add.image(result.x/2,result.y/2,result.type==='missile'?'spr_dummymissle_shot:6':'spr_dummyshot:0').setOrigin(result.type==='missile'?.5:0).setScale(.5);this.shots.push({actor:shot,image});}
      if(entry.actor.dead)entry.image.destroy();
    }
    this.spawners=this.spawners.filter(e=>!e.actor.dead);
    for(const entry of this.shots){
      const shot=entry.actor;
      const hit=shot.step({heart,touchesHeart:()=>s.invFrames<=0&&(shot.type==='missile'?this.missileTouchesHeart(shot):this.touchesHeart({x:shot.x,y:shot.y,sprite:'spr_dummyshot'})),touchesDummy:()=>{const enemy=s.enemy,dx=enemy.x*2,dy=enemy.y*2,extent=shot.type==='missile'?3.5*(Math.abs(Math.cos(shot.direction*Math.PI/180))+Math.abs(Math.sin(shot.direction*Math.PI/180))):0;return shot.type==='missile'?shot.x+extent>=dx+5&&shot.x-extent<=dx+82&&shot.y+extent>=dy&&shot.y-extent<=dy+103:shot.x+12>=dx+5&&shot.x+8<=dx+82&&shot.y+12>=dy&&shot.y+8<=dy+103;},outside:()=>shot.x< -100||shot.x>740||shot.y< -100||shot.y>580});
      const key=shot.type==='missile'?(shot.explosion||shot.age<6?`spr_dummymissle_shot:${shot.explosion?Math.min(6,shot.explosion-1):6-shot.age}`:`spr_hotlandmissle:${shot.frame}`):`spr_dummyshot:${Math.floor(this.frames*.25)%3}`;entry.image.setPosition(shot.x/2,shot.y/2).setTexture(key).setAngle(shot.type==='missile'?shot.direction:0);
      if(hit?.type==='dummyHit'){const previous=this.state?.phase;if(previous===0)this.firstHitTimer=30;this.state?.hit();if(previous===5&&this.state.phase===6){this.duration+=80;this.onHelpersDismissal();}this.onDummyHit();}else if(hit?.type==='heartHit')s.hurt(hit.damage);
      if(shot.dead)entry.image.destroy();
    }
    this.shots=this.shots.filter(e=>!e.actor.dead);return this.frames>=this.duration&&this.firstHitTimer===null&&![1,6,7,8,9,10,11,12,13].includes(this.state?.phase);
  }
  destroy(){for(const e of [...this.spawners,...this.shots])e.image.destroy();this.spawners=[];this.shots=[];super.destroy();}
}
