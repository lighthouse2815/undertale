import { RuinsWave } from './ruins-waves.mjs';

export function loadTemmieLongWaveAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const key of ['spr_temfront','spr_temback','spr_temfoot'])if(!scene.textures.exists(`${key}:0`))scene.load.image(`${key}:0`,new URL(`sprites/${key}/${key}_0.png`,base).href);
}

// obj_maintem / obj_temleg: thân dài đuổi SOUL và bốn chân dao động.
export class TemmieLongWave extends RuinsWave {
  constructor(scene,{random=Math.random}={}){
    super(scene,'temmieLong');this.duration=160;this.border={left:147,right:487,top:200,bottom:385};
    const b=this.border;scene.arena.setPosition(b.left/2,b.top/2).setSize((b.right-b.left)/2,(b.bottom-b.top)/2);scene.soul.setPosition(154.5,142.5);
    this.x=b.left+80+random()*20;this.y=b.top;this.speed=0;this.siner=0;
    this.legs=[20,30,105,115].map((offset,i)=>({x:this.x+offset,y:this.y+86,speed:0,siner:i%2?2*Math.PI:0,height:i===0?86:60,damage:i===0?7:0}));
    this.body=scene.add.graphics();this.back=scene.add.image(0,0,'spr_temback:0').setOrigin(0).setScale(.5);this.front=scene.add.image(0,0,'spr_temfront:0').setOrigin(0).setScale(.5);
    this.feet=this.legs.map(()=>scene.add.image(0,0,'spr_temfoot:0').setOrigin(0).setScale(.5));this.draw();
  }
  overlaps(left,top,right,bottom){const h=this.scene.soul,x=h.x*2,y=h.y*2;return x<=right&&x+15>=left&&y<=bottom&&y+15>=top;}
  step(){
    this.frames++;const heart=this.scene.soul.x*2+8,center=(this.legs[0].x+this.legs[3].x)/2;let adjustment=0;if(heart<=center)adjustment-=.15;if(heart>=center)adjustment+=.15;
    this.siner++;let wave=Math.sin(this.siner/10)*.1;if(Math.abs(this.speed)<.4){this.siner++;wave*=1.5;}this.speed+=adjustment+wave;this.x+=this.speed;
    for(const leg of this.legs){leg.speed+=adjustment+wave;leg.x+=leg.speed;leg.siner-=leg.speed;}
    this.draw();return this.frames>=this.duration;
  }
  draw(){
    const scene=this.scene,x=this.x,y=this.y;this.front.setPosition(x/2,y/2);this.back.setPosition((x+115)/2,y/2);
    this.body.clear().fillStyle(0xffffff).fillRect((x+48)/2,(y+36)/2,67/2,26/2);
    if(scene.invFrames<=0&&this.overlaps(x+13,y+36,x+115,y+63))scene.hurt(10);
    for(const [i,leg] of this.legs.entries()){
      const dx=Math.sin(leg.siner/4)*4,dy=Math.cos(leg.siner/4)*4,left=leg.x+dx,top=y+56,bottom=leg.y+leg.height+dy;
      this.body.fillRect(left/2,top/2,2,(bottom-top)/2);this.feet[i].setPosition((left-5)/2,bottom/2);
      if(scene.invFrames<=0&&this.overlaps(left,top,left+4,bottom))scene.hurt(leg.damage);
    }
  }
  destroy(){this.body.destroy();this.front.destroy();this.back.destroy();for(const foot of this.feet)foot.destroy();super.destroy();}
}
