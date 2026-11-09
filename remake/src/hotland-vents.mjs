import { touchesObject } from './npc.mjs';

// obj_bounceright và các hướng con ở phòng dung nham, chạy theo nhịp 30 FPS.
export class HotlandVents {
  constructor(world){
    this.world=world;this.elapsed=0;this.frame=0;this.active=null;this.chain=0;this.particles=[];
    this.vents=world.roomObjects.filter(e=>/^obj_bounce(right|left|up|down)$/.test(e.item.ObjectName)).map(e=>({...e,direction:e.item.ObjectName.slice(10)}));
  }
  checkTrigger(exclude=null){
    const w=this.world;if(this.active||w.dialogue)return false;
    const vent=this.vents.find(e=>e!==exclude&&touchesObject(w,w.player,e.item));if(!vent)return false;
    this.active={vent,stage:this.chain?'launch':'align',frame:0,vy:10};this.chain=0;w.release();return true;
  }
  update(delta){
    const locked=!!this.active;this.elapsed=Math.min(200,this.elapsed+delta);
    while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}
    if(locked||this.active)this.world.updateCamera();
    return locked||!!this.active;
  }
  steam(vent,flight=false){
    const {X:x,Y:y}=vent.item,angle=flight?({right:45,left:135,up:90,down:180}[vent.direction]):80+Math.random()*20;
    const speed=flight?(vent.direction==='down'?2:7):3,radians=angle*Math.PI/180;
    const image=this.world.add.image(x+10,y+10,'spr_bouncersteam:0').setScale(.4).setAngle(Math.random()*360).setDepth(-500);
    this.particles.push({image,vx:Math.cos(radians)*speed,vy:-Math.sin(radians)*speed,scale:.4,alpha:1});
  }
  step(){
    const w=this.world;this.frame++;
    for(const vent of this.vents){vent.image.setTexture(`${vent.object.Sprite}:${Math.floor(this.frame*.2)%4}`);if(this.frame%10===1&&this.active?.vent!==vent)this.steam(vent);}
    for(const p of this.particles){p.image.x+=p.vx;p.image.y+=p.vy;p.vx*=.97;p.vy*=.97;p.scale+=.08;p.alpha-=.07;p.image.setScale(p.scale).setAlpha(Math.max(0,p.alpha)).setAngle(p.image.angle+6);if(p.alpha<.1)p.image.destroy();}
    this.particles=this.particles.filter(p=>p.image.active);
    if(!this.active){if(this.chain>0)this.chain--;return;}
    const a=this.active,vent=a.vent,p=w.player;a.frame++;
    if(a.stage==='align'){
      const factor=Math.min(1,a.frame/3);p.x+=(vent.item.X-p.x)*factor;p.y+=(vent.item.Y-15-p.y)*factor;
      if(a.frame>=5){a.stage='charge';a.frame=0;p.facing={right:'r',left:'l',up:'u',down:'d'}[vent.direction];p.setTexture(`spr_mainchara${p.facing}:0`);}
    }else if(a.stage==='charge'){
      if(a.frame>=10){a.stage='launch';a.frame=0;}
    }else if(a.stage==='launch'){
      w.sound.play('snd_vaporized');a.stage='flight';a.frame=0;
    }else if(a.stage==='flight'){
      const [dx,dy]=({right:[6,0],left:[-6,0],up:[0,-6],down:[0,6]})[vent.direction];
      p.x+=dx;p.y+=dy;a.vy-=.95;p.y-=a.vy;this.steam(vent,true);
      if(a.frame%4===2){const directions=['d','r','u','l'];p.facing=directions[(directions.indexOf(p.facing)+1)%4];p.setTexture(`spr_mainchara${p.facing}:0`);}
      if(a.frame>=20){p.y=Math.floor(p.y);if(dx)p.y=vent.item.Y-15;this.active=null;this.chain=3;this.checkTrigger(vent);}
    }
    p.setDepth(p.y+30);
  }
  destroy(){for(const p of this.particles)p.image.destroy();this.particles=[];}
}
