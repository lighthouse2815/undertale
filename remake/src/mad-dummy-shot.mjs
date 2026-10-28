// blt_dummyshot và blt_dummymissle: đạn bay thẳng hoặc tên lửa đổi hướng.
export class MadDummyShot {
  constructor({type,x,y,vx,vy,damage=0}){
    this.type=type;this.x=x;this.y=y;this.direction=Math.atan2(vy,vx)*180/Math.PI;this.speed=1;this.damage=damage;this.age=0;this.juice=90;this.frame=0;this.explosion=0;this.dead=false;
  }
  step({heart,touchesDummy=()=>false,touchesHeart=()=>false,outside=()=>false}){
    if(this.dead)return null;this.age++;
    if(this.explosion){if(++this.explosion>=8)this.dead=true;return null;}
    if(this.type==='missile'){
      if(this.juice>0){
        const target=Math.atan2(heart.y+10-this.y,heart.x+10-this.x)*180/Math.PI;
        const delta=((target-this.direction+180)%360+360)%360-180,abs=Math.abs(delta);
        if(abs>4)this.direction+=Math.sign(delta)*(abs>100?11:Math.min(10,Math.floor(abs/10)+1));
      }
      this.juice--;this.frame=this.juice<0?3:this.juice<30?2:this.juice<60?1:0;
      if(this.juice< -60){this.explosion=1;return {type:'explode'};}
      if(this.speed<=6)this.speed+=.1;
    }else this.speed+=.15;
    const radians=this.direction*Math.PI/180;this.x+=Math.cos(radians)*this.speed;this.y+=Math.sin(radians)*this.speed;
    const active=this.type!=='missile'||this.age>=6;
    if(active&&touchesDummy(this)){
      if(this.type==='missile'){this.speed=0;this.explosion=1;}else this.dead=true;
      return {type:'dummyHit',damage:1};
    }
    if(active&&touchesHeart(this)){
      if(this.type==='missile'){this.speed=0;this.explosion=1;}else this.dead=true;
      return {type:'heartHit',damage:this.damage};
    }
    if(outside(this)){this.dead=true;return {type:'outside'};}
    return null;
  }
}
