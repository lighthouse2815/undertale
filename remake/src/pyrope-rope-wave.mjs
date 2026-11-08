import { RuinsWave } from './ruins-waves.mjs';
import { touchesTsunderplane } from './tsunderplane-planes.mjs';

export function loadPyropeRopeAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const [key,count] of [['spr_ropebul',1],['spr_orangefire',8]]){
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for(let i=0;i<count;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
    if(key==='spr_orangefire'&&!scene.textures.exists(`${key}:mask`))scene.load.image(`${key}:mask`,new URL(`sprites/${key}/${key}_0.mask.png`,base).href);
  }
}

// obj_ropebulgen/obj_ropebul/obj_orangefire; lửa cam gây sát thương khi SOUL đứng yên.
export class PyropeRopeWave extends RuinsWave{
  constructor(scene,{damage=8,border={left:237,right:397,top:250,bottom:385}}={}){
    super(scene,'pyropeRope');this.damage=damage;this.border=border;this.next=10;this.duration=180;this.oldHeart={x:scene.soul.x*2,y:scene.soul.y*2};
    this.clip=scene.add.graphics().fillStyle(0xffffff).fillRect(border.left/2,border.top/2,(border.right-border.left)/2,(border.bottom-border.top)/2).setVisible(false);this.mask=this.clip.createGeometryMask();
    scene.arena.setPosition(border.left/2,border.top/2).setSize((border.right-border.left)/2,(border.bottom-border.top)/2);scene.soul.setPosition(154.5,154.5);this.oldHeart={x:309,y:309};
  }
  rope(x,y,root){const b=this.add('spr_ropebul',x,y,{vx:-4,vy:0,damage:this.damage,root,rope:true});b.image.setMask(this.mask);return b;}
  activate(root){
    const b=this.border;root.y=b.top-120+11+Math.random()*58;root.vy=(1+Math.random()*2)*(Math.random()<.5?1:-1);
    root.partner=this.rope(root.x,root.y+170,false);root.partner.vy=root.vy;
    root.fire=[];
    for(let i=0;i<3;i++){
      const flame=this.add('spr_orangefire',root.x,root.y+120+i*14,{damage:this.damage,fire:true,parent:root,offset:120+i*14,phase:Math.random()*40});flame.image.setMask(this.mask);root.fire.push(flame);
    }
  }
  step(){
    this.frames++;const hx=this.scene.soul.x*2,hy=this.scene.soul.y*2,still=hx===this.oldHeart.x&&hy===this.oldHeart.y;
    if(this.frames>=this.next){this.rope(this.border.right+10,this.border.top-100,true);this.next=this.frames+24;}
    for(const b of [...this.bullets]){
      b.age++;
      if(b.rope){
        if(b.root&&b.age===2)this.activate(b);
        const previousY=b.y;b.x+=b.vx;b.y+=b.vy;
        if(b.root&&b.age>1&&(b.y>this.border.top-50||b.y<this.border.top-110)){
          b.y=previousY;b.vy=-b.vy;if(b.partner&&!b.partner.dead){b.partner.y-=b.partner.vy;b.partner.vy=-b.partner.vy;}
        }
        if(b.x<this.border.left-20)b.dead=true;
        if(!b.dead&&this.scene.invFrames<=0&&touchesTsunderplane(this.scene,'spr_ropebul',b.x,b.y)){this.scene.hurt(b.damage);b.dead=true;}
      }else{
        if(b.parent.dead||!b.parent.image.active)b.dead=true;
        else{
          b.phase++;b.x=b.parent.x+Math.sin(b.phase/3)*2;b.y=b.parent.y+b.offset+Math.cos(b.phase/3)*2;
          b.image.setTexture(`spr_orangefire:${Math.floor(b.age*.2)%8}`);
          if(still&&this.scene.invFrames<=0&&touchesTsunderplane(this.scene,'spr_orangefire',b.x,b.y)){
            const hp=this.scene.hp,bonus=Number(hp>20)+[30,40,50,60,70,80,90].filter(n=>hp>=n).length;this.scene.hurt(b.damage+bonus);
          }
        }
      }
      b.image.setPosition(b.x/2,b.y/2);if(b.dead)b.image.destroy();
    }
    this.bullets=this.bullets.filter(b=>!b.dead);this.oldHeart={x:hx,y:hy};return this.frames>=this.duration;
  }
  destroy(){super.destroy();this.mask.destroy();this.clip.destroy();}
}
