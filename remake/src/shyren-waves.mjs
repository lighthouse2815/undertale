import { RuinsWave } from './ruins-waves.mjs';

export function loadShyrenWaveAssets(scene) {
  const base=new URL('../assets/',import.meta.url), key='spr_musbul_1';
  if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
  for(let i=0;i<4;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  for(const sound of [...[1,2,3].map(i=>`mus_badnote${i}`),...[1,2,3,4,5,6].map(i=>`mus_note${i}`),'mus_singF','mus_singG'])if(!scene.cache.audio.exists(sound))scene.load.audio(sound,new URL(`sounds/${sound}/${sound}.wav`,base).href);
}

// obj_musbulgen và blt_musbul1, tọa độ gốc 640×480.
export class ShyrenWave extends RuinsWave {
  constructor(scene,{encourage=0,emotion=0}={}) {
    super(scene,'shyren');this.encourage=encourage===5?6:encourage;this.emotion=emotion;this.duration=this.encourage>=5?310:124;
    this.rate=emotion===1?Math.max(1,Math.trunc(8-this.encourage/1.5)):50;this.next=this.rate;this.notes=0;
    const b=this.border={left:227,right:407,top:250,bottom:385};
    scene.arena.setPosition(b.left/2,b.top/2).setSize((b.right-b.left)/2,(b.bottom-b.top)/2);scene.soul.setPosition(154.5,158.75);
  }
  spawn() {
    const emotion=this.emotion>0, angle=(250+Math.random()*60)*Math.PI/180, speed=emotion?7:4, choices=[0,45,90,45,180];
    const bullet=this.add('spr_musbul_1',254,98,{vx:Math.cos(angle)*speed,vy:-Math.sin(angle)*speed,detune:emotion?2:3,dspeed:emotion?12:1,siner:Math.random()*100,gravityAt:40+Math.floor(Math.random()*20),gravityAngle:choices[Math.floor(Math.random()*choices.length)]*Math.PI/180,damage:7});
    const number=emotion?Math.floor(Math.random()*6)+1:Math.floor(Math.random()*3)+1;
    this.scene.sound.play(`${emotion?'mus_note':'mus_badnote'}${number}`,{volume:emotion?1:.5,rate:emotion?1:.7});
    this.notes++;if(this.notes===12)this.scene.sound.play('mus_singG');if(this.notes===24){this.scene.sound.play('mus_singF');this.notes=0;}
    return bullet;
  }
  step() {
    this.frames++;
    if(this.frames>=this.next && !(this.encourage>=6 && this.frames>=this.duration-40)){this.spawn();this.next+=this.rate;}
    for(const b of this.bullets){
      b.age++;b.siner++;b.x+=Math.sin(b.siner*b.dspeed/10)*b.detune;
      if(b.age>=b.gravityAt){b.vx+=.1*Math.cos(b.gravityAngle);b.vy-=.1*Math.sin(b.gravityAngle);}
      b.x+=b.vx;b.y+=b.vy;b.image.setPosition(b.x/2,b.y/2).setTexture(`spr_musbul_1:${Math.floor(b.age*.2)%4}`);
      if(this.scene.invFrames<=0&&this.touchesHeart(b))this.scene.hurt(b.damage);
      if(b.x < -24 || b.x > 640 || b.y < -24 || b.y > 480){b.dead=true;b.image.destroy();}
    }
    this.bullets=this.bullets.filter(b=>!b.dead);return this.frames>=this.duration;
  }
}
