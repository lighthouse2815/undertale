import { RuinsWave } from './ruins-waves.mjs';
import { maskContains } from './collision-mask.mjs';

export function loadTsunderplanePlaneAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const key of ['spr_vertplane','spr_vertplanemask','spr_vertplanegreen','spr_incendiaryflame']){
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    if(key!=='spr_vertplanemask'&&!scene.textures.exists(`${key}:0`))scene.load.image(`${key}:0`,new URL(`sprites/${key}/${key}_0.png`,base).href);
    if(['spr_vertplanemask','spr_vertplanegreen'].includes(key)&&!scene.textures.exists(`${key}:mask`))scene.load.image(`${key}:mask`,new URL(`sprites/${key}/${key}_0.mask.png`,base).href);
  }
  for(const key of ['snd_bell','snd_dumbvictory'])if(!scene.cache.audio.exists(key))scene.load.audio(key,new URL(`sounds/${key}/${key}.wav`,base).href);
}

// obj_vertplanegen/obj_vertplanebullet, vùng xanh và lửa xả; tọa độ gốc 640×480.
export class TsunderplanePlanes extends RuinsWave {
  constructor(scene,rules,{green=false,rate=20,population=1,damage=8,border={left:237,right:397,top:250,bottom:385}}={}){
    super(scene,'tsunderplanes');this.rules=rules;this.green=green;this.rate=rate;this.population=population;this.damage=damage;this.border=border;this.next=5;this.duration=160;this.planes=[];
    this.clip=scene.add.graphics().fillStyle(0xffffff).fillRect(border.left/2,border.top/2,(border.right-border.left)/2,(border.bottom-border.top)/2).setVisible(false);this.mask=this.clip.createGeometryMask();
    scene.arena.setPosition(border.left/2,border.top/2).setSize((border.right-border.left)/2,(border.bottom-border.top)/2);scene.soul.setPosition(154.5,154.5);
  }
  spawnPlane(){
    const b=this.border,x=b.left+20+Math.random()*(b.right-b.left-70);
    const speed=(this.population>1?6+Math.random():7+Math.random()*2)/(this.green?1.3:1);
    const plane=this.add('spr_vertplane',x,50,{vy:speed,damage:this.damage,plane:true,off:0,nextExhaust:10});plane.image.setMask(this.mask);this.planes.push(plane);
    if(this.green){const scale=this.population>1?1.3:1;plane.green={x:x-(this.population>1?28:18),y:42,scale,image:this.scene.add.image(0,0,'spr_vertplanegreen:0').setOrigin(0).setScale(scale/2,.5).setMask(this.mask)};}
    return plane;
  }
  spawnExhaust(plane){
    plane.off=this.green?2:1-plane.off;
    const b=this.add('spr_incendiaryflame',plane.x+20,plane.y+10,{damage:this.damage,off:plane.off,exhaust:true});b.image.setMask(this.mask);
    if(plane.off===2){const angle=(60+Math.random()*60)*Math.PI/180;b.ax=.1*Math.cos(angle);b.ay=-.1*Math.sin(angle);}
    else {b.ax=plane.off===0?.1:-.1;b.ay=0;}
    return b;
  }
  touches(maskKey,x,y,sx=1,sy=1){
    const s=this.scene,data=s.cache.json.get(maskKey),hx=s.soul.x*2,hy=s.soul.y*2;
    for(let i=0;i<16;i++)for(let j=0;j<16;j++){
      if(!maskContains(s,'spr_heart:mask',i,j))continue;
      const px=Math.floor((hx+i-x)/sx+data.OriginX),py=Math.floor((hy+j-y)/sy+data.OriginY);
      if(px<data.MarginLeft||px>data.MarginRight||py<data.MarginTop||py>data.MarginBottom)continue;
      if(data.CollisionKind!=='Precise'||maskContains(s,`${maskKey}:mask`,px,py))return true;
    }
    return false;
  }
  step(){
    this.frames++;
    if(this.frames>=this.next){this.spawnPlane();this.next=this.frames+Math.max(1,Math.round(this.rate+(this.green?10:0)));}
    for(const b of this.bullets){
      b.age++;
      if(b.plane){
        if(b.age===b.nextExhaust){if(b.y>this.border.top-10)this.spawnExhaust(b);b.nextExhaust=b.age+Math.round((this.green?10:6)*(this.population>1?1.5:1));}
        b.y+=b.vy;if(b.y>this.border.bottom)b.dead=true;
        if(b.green){b.green.x=b.x-(this.population>1?28:18);b.green.y=b.y-8;b.green.image.setPosition(b.green.x/2,b.green.y/2);}
        if(!b.dead&&this.scene.invFrames<=0&&this.touches('spr_vertplanemask',b.x,b.y)){this.scene.hurt(b.damage);b.dead=true;}
        if(!b.dead&&b.green&&this.touches('spr_vertplanegreen',b.green.x,b.green.y,b.green.scale)){
          const sound=this.rules.approach(this.population);this.scene.sound.play(sound==='victory'?'snd_dumbvictory':'snd_bell');b.green.image.destroy();b.green=null;
        }
        if(b.dead&&b.green)b.green.image.destroy();
      }else{
        if(b.age===1&&b.off===2&&this.population>1)b.dead=true;
        if(b.age>1){b.vx+=b.ax;b.vy+=b.ay;}b.x+=b.vx;b.y+=b.vy;
        if(b.x<this.border.left||b.x>this.border.right||b.y<this.border.top||b.y>this.border.bottom)b.dead=true;
        if(!b.dead&&this.scene.invFrames<=0&&this.touches('spr_incendiaryflame',b.x,b.y)){this.scene.hurt(b.damage);b.dead=true;}
      }
      b.image.setPosition(b.x/2,b.y/2);if(b.dead)b.image.destroy();
    }
    this.bullets=this.bullets.filter(b=>!b.dead);this.planes=this.planes.filter(b=>!b.dead);return this.frames>=this.duration;
  }
  destroy(){for(const plane of this.planes)plane.green?.image.destroy();super.destroy();this.mask.destroy();this.clip.destroy();}
}
