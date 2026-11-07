import { RuinsWave } from './ruins-waves.mjs';
import { touchesVulkinBullet } from './vulkin-lava-wave.mjs';

export function loadVulkinCloudAssets(scene) {
  const base=new URL('../assets/',import.meta.url);
  for (const key of ['spr_vulkincloudbul','spr_vulkinlightning']) {
    if (!scene.cache.json.exists(key)) scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    if (!scene.textures.exists(`${key}:0`)) scene.load.image(`${key}:0`,new URL(`sprites/${key}/${key}_0.png`,base).href);
  }
}

// obj_vulkincloudbul và obj_vulkinlightning; góc/vận tốc gốc ở 640×480.
export class VulkinCloudWave extends RuinsWave {
  constructor(scene,{rate=9,border={left:237,right:397,top:250,bottom:385}}={}) {
    super(scene,'vulkinCloud'); this.border=border; this.rate=rate; this.duration=160; this.savedSpeed=scene.soulSpeed ?? 4;
    this.firing=2; this.nextCycle=2; this.nextBurst=Infinity; this.shots=0;
    this.cloud=this.add('spr_vulkincloudbul',(border.left+border.right)/2-30,border.top+2,{vx:0,vy:0,damage:1,cloud:true});
    this.clip=scene.add.graphics().fillStyle(0xffffff).fillRect(border.left/2,border.top/2,(border.right-border.left)/2,(border.bottom-border.top)/2).setVisible(false);
    this.mask=this.clip.createGeometryMask(); this.cloud.image.setMask(this.mask);
    scene.arena.setPosition(border.left/2,border.top/2).setSize((border.right-border.left)/2,(border.bottom-border.top)/2); scene.soul.setPosition(154.5,154.5);
  }
  burst() {
    const cloud=this.cloud, sx=cloud.x+30, sy=cloud.y+30;
    const toward=Math.atan2(-(this.scene.soul.y*2+10-sy),this.scene.soul.x*2+10-sx)*180/Math.PI;
    const random=Math.floor(Math.random()*30); cloud.vx=0; cloud.vy=0;
    for(let i=0;i<7;i++) {
      const angle=(toward-110+random+i*30)*Math.PI/180;
      const bullet=this.add('spr_vulkinlightning',sx,sy,{angle,speed:1,damage:7,cloud:false});
      bullet.image.setOrigin(.5).setMask(this.mask);
    }
    this.shots++;
    if(this.shots<5) this.nextBurst=this.frames+Math.max(1,Math.round(this.rate));
    else { const angle=(toward-110-Math.random()*50)*Math.PI/180; cloud.vx=2*Math.cos(angle); cloud.vy=-2*Math.sin(angle); this.nextBurst=Infinity; }
  }
  step() {
    this.frames++;
    if(this.frames===this.nextCycle) {
      this.firing++; this.nextCycle=this.frames+15;
      if(this.firing>3) { this.firing=0; this.shots=0; this.nextBurst=this.frames+2; }
    }
    if(this.frames===this.nextBurst) this.burst();
    for(const b of this.bullets) {
      b.age++;
      if(!b.cloud) {
        b.speed += this.rate>12?.07:this.rate>9?.1:.15;
        b.vx=b.speed*Math.cos(b.angle); b.vy=-b.speed*Math.sin(b.angle); b.image.setRotation(-b.angle);
      }
      b.x+=b.vx; b.y+=b.vy;
      if(b.cloud) {
        const edge=this.border;
        if(b.x<edge.left+4){b.x+=4;b.vx=0;} if(b.y<edge.top+4){b.y+=4;b.vy=0;}
        if(b.x>edge.right-4){b.x-=4;b.vx=0;} if(b.y>edge.bottom-4){b.y-=4;b.vy=0;}
      } else if(b.x<this.border.left || b.x>this.border.right || b.y<this.border.top || b.y>this.border.bottom) b.dead=true;
      b.image.setPosition(b.x/2,b.y/2);
      if(!b.dead && touchesVulkinBullet(this.scene,b)) {
        if(!b.cloud) { if(this.scene.soulSpeed<8)this.scene.soulSpeed+=2; b.dead=true; }
        if(this.scene.invFrames<=0) {
          const hp=this.scene.hp, bonus=Number(hp>20)+[30,40,50,60,70,80,90].filter(n=>hp>=n).length;
          this.scene.hurt(b.damage+bonus);
        }
      }
      if(b.dead) b.image.destroy();
    }
    this.bullets=this.bullets.filter(b=>!b.dead); return this.frames>=this.duration;
  }
  destroy() { super.destroy(); this.scene.soulSpeed=this.savedSpeed; this.mask.destroy(); this.clip.destroy(); }
}
