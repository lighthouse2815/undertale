import {RuinsWave} from './ruins-waves.mjs';
import {MadDummyProjectile} from './mad-dummy-projectile.mjs';
import {MadDummyShot} from './mad-dummy-shot.mjs';

export function loadMadDummyWaveAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const [key,count] of [['spr_dummybullet',4],['spr_dummyshot',3]]){
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for(let i=0;i<count;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  }
}

// obj_maddummy: đội hình theo con2 và HP; toạ độ gốc 640×480.
export class MadDummyWave extends RuinsWave {
  constructor(scene,{border={left:237,right:397,top:250,bottom:385},random=Math.random,onDummyHit=()=>{},phase=0,hp=300,damage=0}={}){
    super(scene,'madDummy');this.border=border;this.onDummyHit=onDummyHit;this.spawners=[];this.shots=[];this.phase=phase;this.damage=damage;
    const b=border,top=(offset)=>this.spawn(b.left+random()*(b.right-b.left)-20,b.top-offset,2);
    const bottom=(offset)=>this.spawn(b.left+30+random()*(b.right-b.left-70),b.bottom+offset+random()*10,3);
    if(phase===0){this.duration=360;for(const offset of [40,45,50,130,135,140,220,225,230])top(offset);for(let i=0;i<6;i++)for(const offset of [310,360,410])bottom(offset);}
    else if(phase===2){this.duration=260;for(const offset of [40,50,60,70,80])top(offset);for(const offset of [150,160,170,180,190])this.spawn(b.left-offset,b.top+random()*80,0);for(const offset of [270,280,290,300,310])this.spawn(b.right+offset,b.top+random()*80,1);for(let i=0;i<6;i++)for(const offset of [400,470,540])bottom(offset);}
    else if(phase===3&&hp>=255){this.duration=220;for(let g=1;g<=6;g++)this.spawn(b.left-50-g*5,b.top+100+random()*60,0);for(let g=1;g<=6;g++)this.spawn(b.right+150+g*5,b.top+random()*60,1);for(let g=1;g<=6;g++)this.spawn(b.left-150-g*5,b.top+random()*60,0);for(let g=1;g<=6;g++)this.spawn(b.right+50+g*5,b.top+100+random()*60,1);for(let i=0;i<6;i++)for(const offset of [270,310,360])bottom(offset);if(hp>=999){this.duration=160;for(let i=0;i<4;i++)for(const offset of [30,90,150,210])bottom(offset);}}
    else if(phase===3){this.duration=160;this.phase=hp<255?4:3;for(let i=0;i<4;i++)for(const offset of [30,90,150,210])bottom(offset);}
    else throw new Error(`Đội hình Mad Dummy chưa hỗ trợ: ${phase}`);
  }
  spawn(x,y,side){const actor=new MadDummyProjectile({x,y,side,damage:this.damage}),image=this.scene.add.image(x/2,y/2,`spr_dummybullet:${side}`).setOrigin(0).setScale(.5);this.spawners.push({actor,image});}
  step(){
    this.frames++;const s=this.scene,heart={x:s.soul.x*2,y:s.soul.y*2};
    for(const entry of this.spawners){
      const result=entry.actor.step({border:this.border,heart});entry.image.setPosition(entry.actor.x/2,entry.actor.y/2);
      if(result){const shot=new MadDummyShot(result),image=s.add.image(result.x/2,result.y/2,'spr_dummyshot:0').setOrigin(0).setScale(.5);this.shots.push({actor:shot,image});}
      if(entry.actor.dead)entry.image.destroy();
    }
    this.spawners=this.spawners.filter(e=>!e.actor.dead);
    for(const entry of this.shots){
      const shot=entry.actor;
      const hit=shot.step({heart,touchesHeart:()=>s.invFrames<=0&&this.touchesHeart({x:shot.x,y:shot.y,sprite:'spr_dummyshot'}),touchesDummy:()=>{const enemy=s.enemy,dx=enemy.x*2,dy=enemy.y*2;return shot.x+12>=dx+5&&shot.x+8<=dx+82&&shot.y+12>=dy&&shot.y+8<=dy+103;},outside:()=>shot.x< -100||shot.x>740||shot.y< -100||shot.y>580});
      entry.image.setPosition(shot.x/2,shot.y/2).setTexture(`spr_dummyshot:${Math.floor(this.frames*.25)%3}`);
      if(hit?.type==='dummyHit')this.onDummyHit();else if(hit?.type==='heartHit')s.hurt(hit.damage);
      if(shot.dead)entry.image.destroy();
    }
    this.shots=this.shots.filter(e=>!e.actor.dead);return this.frames>=this.duration;
  }
  destroy(){for(const e of [...this.spawners,...this.shots])e.image.destroy();this.spawners=[];this.shots=[];super.destroy();}
}
