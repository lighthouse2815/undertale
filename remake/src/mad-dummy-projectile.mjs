// blt_dummybullet và blt_dummyshot: đạn con bay vào, nhắm tim rồi bắn.
export class MadDummyProjectile {
  constructor({x,y,side=0,type=0,damage=0}){
    this.x=x;this.y=y;this.side=side;this.type=type;this.damage=damage;this.phase='enter';this.speed=4;this.timer=0;this.flash=0;this.red=false;this.dead=false;
  }
  scatter(){if(!this.dead){this.phase='escape';this.speed=1;this.timer=90;}}
  step({border,heart}){
    if(this.dead)return null;
    const inward=[[1,0],[-1,0],[0,1],[0,-1]][this.side],outward=[-inward[0],-inward[1]];
    if(this.phase==='enter'){
      this.x+=inward[0]*this.speed;this.y+=inward[1]*this.speed;
      const inside=[this.x>border.left+4,this.x<border.right-22,this.y>border.top+4,this.y<border.bottom-22][this.side];
      if(inside){this.speed=0;this.phase='aim';this.timer=this.type===1?1:this.type===2?Infinity:20;if(this.type===1)this.red=true;}
    }else if(this.phase==='aim'){
      if(--this.timer<=0){
        if(this.type===1){this.red=!this.red;this.flash++;if(this.flash>4){this.phase='escape';this.speed=2;this.timer=90;}else this.timer=5;}
        else{this.phase='retreat';this.speed=4;this.timer=30;}
      }
    }else if(this.phase==='retreat'||this.phase==='escape'){
      this.x+=outward[0]*this.speed;this.y+=outward[1]*this.speed;if(this.phase==='escape'&&this.type===1)this.speed+=.2;
      if(--this.timer<=0){this.dead=true;if(this.type===0||this.type===4){const dx=heart.x-this.x,dy=heart.y-this.y,d=Math.hypot(dx,dy)||1;return {type:this.type===4?'missile':'shot',x:this.x,y:this.y,vx:dx/d,vy:dy/d,damage:this.damage};}}
    }
    return null;
  }
}
