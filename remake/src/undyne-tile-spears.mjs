// obj_speartilegen / obj_speartile: tám dấu, trồi giáo rồi mờ dần.
export class UndyneTileSpears {
  constructor({end=false,random=Math.random}={}){this.random=random;this.timer=end?30:2;this.interval=57;this.spears=[];this.frame=0;}
  step({player,direction={},blocked=()=>false,touching=()=>false}){
    this.frame++;let volley=false,rise=false,hit=false,intense=false;
    if(--this.timer<=0){
      this.timer=Math.round(this.interval);if(this.interval>35)this.interval-=.75;if(this.interval<=35&&this.interval>28)this.interval-=.25;if(this.interval>15&&this.interval<=28)this.interval-=.5;
      intense=this.interval<=15;volley=true;
      for(let i=0;i<8;i++){
        const snap=v=>Math.round(v/20)*20;
        let x=snap(player.x)-40+Math.floor(this.random()*5)*20,y=snap(player.y)-40+Math.floor(this.random()*5)*20;
        this.spears.push({x,y,age:0,stage:'appear',alpha:0,frame:0,duty:i===7});
      }
    }
    for(const s of this.spears){
      if(s.age++===0){
        const axes=[['left',-60,0,20,0],['right',60,0,-20,0],['down',0,60,0,-20],['up',0,-60,0,20]];
        for(const [key,dx,dy,cx,cy] of axes)if(direction[key]){s.x+=dx;s.y+=dy;for(let i=0;i<3;i++)if(blocked(s.x+9,s.y+35)){s.x+=cx;s.y+=cy;}}
        if(blocked(s.x+9,s.y+35)){s.dead=true;continue;}
        if(s.duty){s.x=Math.round(player.x/20)*20;s.y=Math.round(player.y/20)*20;}
      }
      if(s.stage==='appear'){s.alpha=Math.min(1,s.alpha+.07);if(s.alpha>.9){s.alpha=1;s.stage='wait';s.timer=10;}}
      else if(s.stage==='wait'){if(--s.timer<=0){s.stage='rise';s.frame=0;}}
      else if(s.stage==='rise'){
        s.frame+=.5;if(s.frame>=1.5&&s.frame<3){if(!s.sounded){rise=true;s.sounded=true;}if(touching(s)){hit=true;break;}}
        if(s.frame>=3){s.frame=3;s.stage='hold';s.timer=5;}
      }else if(s.stage==='hold'){if(--s.timer<=0)s.stage='fade';}
      else if(s.stage==='fade'){s.alpha-=.1;if(s.alpha<.1)s.dead=true;}
    }
    this.spears=this.spears.filter(s=>!s.dead);
    if(hit){this.spears=[];this.timer+=70;}
    return {volley,rise,hit,intense};
  }
}
