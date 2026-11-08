import { RuinsWave } from './ruins-waves.mjs';
import { touchesVulkinBullet } from './vulkin-lava-wave.mjs';
import { touchesTsunderplane } from './tsunderplane-planes.mjs';

export function loadPyropeBombAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const [key,count] of [['spr_bombd',2],['spr_bombexplosion',1],['spr_bombexplosionmask',0]]){
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for(let i=0;i<count;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  }
  if(!scene.cache.audio.exists('snd_impact'))scene.load.audio('snd_impact',new URL('sounds/snd_impact/snd_impact.wav',base).href);
}

// obj_bombgen/obj_bombbul/obj_blastbul, khung 19 và tọa độ 640×480.
export class PyropeBombWave extends RuinsWave{
  constructor(scene,{rate=40,population=1,damage=8,border={left:220,right:420,top:185,bottom:385}}={}){
    super(scene,'pyropeBomb');this.rate=rate;this.population=population;this.damage=damage;this.border=border;this.next=3;this.duration=180;
    this.clip=scene.add.graphics().fillStyle(0xffffff).fillRect(border.left/2,border.top/2,(border.right-border.left)/2,(border.bottom-border.top)/2).setVisible(false);this.mask=this.clip.createGeometryMask();
    scene.arena.setPosition(border.left/2,border.top/2).setSize((border.right-border.left)/2,(border.bottom-border.top)/2);scene.soul.setPosition(154.5,154.5);
  }
  spawnBomb(type=null){
    const b=this.border,x=(b.left+b.right)/2+50-Math.random()*100;type??=Math.floor(Math.random()*4);
    let y=b.top-20,vx=0,vy=0,ax=0,ay=0,angle=0;
    if(type===0||type===2){vx=(2+Math.random()*3)*(Math.random()<.5?-1:1);y=type===0?b.top-20:b.bottom+20;ay=type===0?.18:-.18;angle=type===2?180:0;}
    else{y=(b.top+b.bottom)/2+50-Math.random()*100;vy=(2+Math.random()*4)*(Math.random()<.5?-1:1);ax=type===1?.18:-.18;angle=type===1?-90:-270;}
    const bullet=this.add('spr_bombd',type===1?b.left-20:type===3?b.right+20:x,y,{vx,vy,ax,ay,type,bounce:0,flash:0,explodeAt:Infinity,animation:0,damage:this.damage,bomb:true});
    bullet.image.setOrigin(.5,25/40).setAngle(angle).setMask(this.mask);return bullet;
  }
  blast(x,y){
    const size=this.population>1?4.5:5,b=this.add('spr_bombexplosion',x,y,{size,maxSize:this.population>1?5.5:6.2,alpha:1,damage:this.damage,blast:true,startX:x,startY:y});
    b.image.setOrigin(.5,23/47).setScale(size/2).setMask(this.mask);this.scene.sound.play('snd_impact');return b;
  }
  step(){
    this.frames++;
    if(this.frames>=this.next){this.spawnBomb();this.next=this.frames+Math.max(1,Math.round(this.rate));}
    for(const b of [...this.bullets]){
      b.age++;
      if(b.bomb){
        if(this.frames>=b.explodeAt){this.blast(b.x,b.y);b.dead=true;}
        const edge=this.border,hit=b.type===0?b.y>edge.bottom-10:b.type===1?b.x>edge.right-10:b.type===2?b.y<edge.top+10:b.x<edge.left+10;
        if(hit){
          if(b.bounce){if(b.type===0||b.type===2){b.ay=0;b.vy=0;}else{b.ax=0;b.vx=0;}}
          else{if(b.type===0||b.type===2){b.y-=b.vy;b.vy=b.type===0?-1.5:1.5;}else{b.x-=b.vx;b.vx=b.type===1?-1.5:1.5;}b.bounce=1;}
        }
        if((b.type===0||b.type===2)&&(b.x>edge.right-15||b.x<edge.left+15))b.vx=-b.vx;
        if((b.type===1||b.type===3)&&(b.y>edge.bottom-15||b.y<edge.top+15))b.vy=-b.vy;
        if(b.bounce){b.flash=Math.min(14,b.flash+1);if(b.flash===14&&b.explodeAt===Infinity)b.explodeAt=this.frames+15;b.animation+=1/(3-b.flash/10);}
        b.vx+=b.ax;b.vy+=b.ay;const speed=Math.hypot(b.vx,b.vy);if(speed>0){const factor=Math.max(0,speed-.03)/speed;b.vx*=factor;b.vy*=factor;}
        b.x+=b.vx;b.y+=b.vy;b.image.setTexture(`spr_bombd:${Math.floor(b.animation)%2}`);
        if(!b.dead&&this.scene.invFrames<=0&&touchesVulkinBullet(this.scene,b)){this.scene.hurt(b.damage);b.dead=true;}
      }else{
        b.size+=.1;if(b.size>b.maxSize)b.alpha-=.2;b.x=b.startX+3-Math.random()*6;b.y=b.startY+3-Math.random()*6;
        b.image.setScale(b.size/2).setAlpha(Math.max(0,b.alpha));if(b.alpha<.06)b.dead=true;
        if(!b.dead&&this.scene.invFrames<=0&&touchesTsunderplane(this.scene,'spr_bombexplosionmask',b.x,b.y,b.size,b.size)){
          const hp=this.scene.hp,bonus=Number(hp>20)+[30,40,50,60,70,80,90].filter(n=>hp>=n).length;this.scene.hurt(b.damage+bonus);
        }
      }
      b.image.setPosition(b.x/2,b.y/2);if(b.dead)b.image.destroy();
    }
    this.bullets=this.bullets.filter(b=>!b.dead);return this.frames>=this.duration;
  }
  destroy(){super.destroy();this.mask.destroy();this.clip.destroy();}
}
