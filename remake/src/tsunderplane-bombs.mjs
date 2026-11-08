import { RuinsWave } from './ruins-waves.mjs';
import { touchesTsunderplane } from './tsunderplane-planes.mjs';

export function loadTsunderplaneBombAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const [key,count] of [['spr_sideplanebullet',2],['spr_incendiarybomb',1],['spr_incendiaryflame',1]]){
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for(let i=0;i<count;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  }
}

// obj_incendiarygen: máy bay ngang thả bom tạo cột lửa 12 đoạn.
export class TsunderplaneBombs extends RuinsWave{
  constructor(scene,{rate=30,population=1,damage=8,border={left:237,right:397,top:250,bottom:385}}={}){
    super(scene,'tsunderbombs');this.rate=rate;this.population=population;this.damage=damage;this.border=border;this.next=2;this.duration=160;
    this.clip=scene.add.graphics().fillStyle(0xffffff).fillRect(border.left/2,border.top/2,(border.right-border.left)/2,(border.bottom-border.top)/2).setVisible(false);this.mask=this.clip.createGeometryMask();
    scene.arena.setPosition(border.left/2,border.top/2).setSize((border.right-border.left)/2,(border.bottom-border.top)/2);scene.soul.setPosition(154.5,154.5);
  }
  spawnPlane(){
    const y=190+Math.random()*40,speed=6+Math.random()*2,left=Math.random()<.5;
    const b=this.add('spr_sideplanebullet',left?this.border.right+40:this.border.left-40,y,{vx:left?-speed:speed,damage:this.damage,plane:true,nextBomb:10});
    b.image.setTexture(`spr_sideplanebullet:${left?1:0}`).setMask(this.mask);return b;
  }
  spawnBomb(x,y){
    const speed=(.1+Math.random()*4)*(Math.random()<.5?-1:1);
    const b=this.add('spr_incendiarybomb',x,y,{vx:speed,vy:0,damage:this.damage,bomb:true});b.image.setMask(this.mask);return b;
  }
  spawnFlame(x,y,vx,number){
    const b=this.add('spr_incendiaryflame',x,y,{vx,damage:this.damage,flame:true,number,alpha:1});b.image.setMask(this.mask);return b;
  }
  step(){
    this.frames++;
    if(this.frames>=this.next){this.spawnPlane();this.next=this.frames+Math.max(1,Math.round(this.rate));}
    for(const b of [...this.bullets]){
      b.age++;
      if(b.plane){
        if(b.age===b.nextBomb){this.spawnBomb(b.x+15,b.y+10);b.nextBomb+=this.population>1?18:12;}
        b.x+=b.vx;if(Math.abs(b.x-this.scene.soul.x*2)>400)b.dead=true;
      }else if(b.bomb){
        if(b.x>this.border.left&&b.x<this.border.right&&b.y>=this.border.bottom-20&&b.y<this.border.bottom){this.spawnFlame(b.x,b.y,b.vx,1);b.dead=true;}
        else {b.vy+=.1;b.x+=b.vx;b.y+=b.vy;}
      }else{
        if(b.age===1&&b.number<12)this.spawnFlame(b.x+Math.random()*8-4,b.y-18,b.vx,b.number+1);
        b.x+=b.vx;if(b.age>10){b.alpha-=.1;b.image.setAlpha(Math.max(0,b.alpha));if(b.alpha<=0)b.dead=true;}
      }
      if(!b.dead&&this.scene.invFrames<=0&&(!b.flame||b.alpha>=.9)&&touchesTsunderplane(this.scene,b.sprite,b.x,b.y)){
        const hp=this.scene.hp,bonus=b.flame?Number(hp>20)+[30,40,50,60,70,80,90].filter(n=>hp>=n).length:0;
        this.scene.hurt(b.damage+bonus);if(!b.flame)b.dead=true;
      }
      if(b.x<-100||b.x>740||b.y>580)b.dead=true;
      b.image.setPosition(b.x/2,b.y/2);if(b.dead)b.image.destroy();
    }
    this.bullets=this.bullets.filter(b=>!b.dead);return this.frames>=this.duration;
  }
  destroy(){super.destroy();this.mask.destroy();this.clip.destroy();}
}
