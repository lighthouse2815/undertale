import { RuinsWave } from './ruins-waves.mjs';

export function loadTemmieHandWaveAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  if(!scene.textures.exists('spr_temhand:0'))scene.load.image('spr_temhand:0',new URL('sprites/spr_temhand/spr_temhand_0.png',base).href);
}

// blt_temhand: các đoạn vẽ liên tiếp, đổi hướng theo SOUL rồi rút về.
export class TemmieHandWave extends RuinsWave {
  constructor(scene,{random=Math.random,damage=7,x=240,y=134}={}){
    super(scene,'temmieHand');this.duration=200;this.random=random;this.damage=damage;this.x=x;this.y=y;this.startY=y;this.speed=4;this.direction=270;this.segment=0;this.retreat=false;
    this.sections=Array.from({length:10},()=>({x1:0,y1:0,x2:0,y2:0,direction:0}));Object.assign(this.sections[0],{x1:x,y1:y,x2:x+10,y2:y+10,direction:270});this.alarm=20+random()*20;
    const b={left:227,right:407,top:250,bottom:385};scene.arena.setPosition(b.left/2,b.top/2).setSize((b.right-b.left)/2,(b.bottom-b.top)/2);scene.soul.setPosition(154.5,155);
    this.lines=scene.add.graphics();this.hand=scene.add.image(x/2,y/2,'spr_temhand:0').setOrigin(0).setScale(.5);
  }
  turn(){
    if(this.segment>=8){this.retreat=true;this.speed=12;return;}
    const prev=this.sections[this.segment],next=this.sections[++this.segment];next.x1=this.x;next.y1=this.y;
    const dx=this.x-(this.scene.soul.x*2+6),dy=this.y-(this.scene.soul.y*2+6);let dir=Math.abs(dx)-Math.abs(dy)<=0?(dy>=0?90:270):(dx>=0?180:0);
    if(Math.abs(dir-prev.direction)===180)dir-=90;next.direction=dir;this.direction=(dir+360)%360;
    if(dir===prev.direction){next.x1=0;this.segment--;}
    else if(dir===90&&prev.direction===180)prev.x2=this.x;
    else if(dir===180&&prev.direction===90)prev.y2=this.y;
    this.alarm=60+this.random()*20;
  }
  retract(){
    const current=this.sections[this.segment];this.direction=(current.direction-180+360)%360;this.speed=12;let reached=false;
    if(this.direction===0)reached=this.x>=current.x1-6;
    else if(this.direction===180||this.direction===-180)reached=this.x<=current.x1+6;
    else if(this.direction===270||this.direction===-90)reached=this.y>=current.y1-6;
    else if(this.direction===90)reached=this.y<=current.y1+6;
    if(reached&&this.segment>0){current.x1=0;this.segment--;const previous=this.sections[this.segment];
      if(this.direction===0){this.x=previous.x2-22;this.y+=4;}
      else if(this.direction===180||this.direction===-180)this.x=previous.x2+2;
      else if(this.direction===270||this.direction===-90)this.y=previous.y2-22;
      else{this.x+=4;this.y=previous.y2+2;}}
  }
  step(){
    this.frames++;
    if(this.retreat)this.retract();else if(--this.alarm<=0)this.turn();
    const angle=this.direction*Math.PI/180;this.x+=Math.cos(angle)*this.speed;this.y-=Math.sin(angle)*this.speed;
    const current=this.sections[this.segment];current.x2=this.x+10;current.y2=this.y+10;
    if(!this.retreat){const dx=Math.abs(this.x-(this.scene.soul.x*2+2)),dy=Math.abs(this.y-(this.scene.soul.y*2+6));if(dx<20&&this.alarm>5)this.alarm-=2;if(dy<20&&this.alarm>5)this.alarm-=2;if(dx<10&&this.alarm>4)this.alarm/=2;if(dy<10&&this.alarm>4)this.alarm/=2;}
    this.draw();return this.retreat&&this.segment<4&&this.frames>=this.duration;
  }
  draw(){
    const scene=this.scene,hx=scene.soul.x*2,hy=scene.soul.y*2;this.lines.clear().fillStyle(0xffffff);
    for(const part of this.sections){if(part.x1<=0)continue;const left=Math.min(part.x1,part.x2),right=Math.max(part.x1,part.x2),top=Math.min(part.y1,part.y2),bottom=Math.max(part.y1,part.y2);this.lines.fillRect(left/2,top/2,(right-left)/2,(bottom-top)/2);
      if(scene.invFrames<=0&&hx<=right&&hx+15>=left&&hy<=bottom&&hy+15>=top){scene.hurt(this.damage);scene.invFrames*=2;}}
    const horizontal=this.direction===0||this.direction===180,vertical=this.direction===90||this.direction===270;this.hand.setPosition((this.x+(horizontal?4:0))/2,(this.y+(vertical?4:0))/2);
  }
  destroy(){this.lines.destroy();this.hand.destroy();super.destroy();}
}
