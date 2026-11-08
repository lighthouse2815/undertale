const sprites={spr_tsunderplane:1,spr_tsunderplanehat:1,spr_tsunderplane_blush:4,spr_tsunderplanecloud:2};

export function loadTsunderplaneBodyAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const [key,count] of Object.entries(sprites)){
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for(let i=0;i<count;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  }
}

// obj_tsunderplane_body và khói obj_planeexhaust, tọa độ scene bằng một nửa gốc.
export class TsunderplaneBody{
  constructor(scene,rules,x=23,y=18){
    this.scene=scene;this.rules=rules;this.x=x;this.y=y;this.frame=0;this.siner=0;this.hurt=false;this.previousGraze=0;this.flash=0;this.smoke=[];
    const add=(key,depth)=>{const d=scene.cache.json.get(key);return scene.add.image(x,y,`${key}:0`).setOrigin(d.OriginX/d.Width,d.OriginY/d.Height).setDepth(depth);};
    this.plane=add('spr_tsunderplane',11);this.hat=add('spr_tsunderplanehat',12);this.blush=add('spr_tsunderplane_blush',13).setVisible(false);
  }
  step(){
    this.frame++;if(!this.hurt)this.siner++;this.flash=Math.max(0,this.flash-1);
    if(this.rules.graze!==this.previousGraze){this.flash=7;this.previousGraze=this.rules.graze;}
    const x=this.x,y=this.y,n=this.siner,wave=Math.sin(n/7),v=Math.round(255*(1-this.flash/10)),tint=(255<<16)|(v<<8)|v;
    this.plane.setPosition(x+47,y+38+wave*1.5).setTint(tint);
    this.hat.setPosition(x+77,y+45+wave*1.5);
    this.blush.setVisible(this.rules.graze>0).setPosition(x+47+wave,y+38+wave*2).setTexture(`spr_tsunderplane_blush:${Math.floor(Math.min(3,Math.max(0,this.rules.graze-1)))}`).setAlpha(.7+Math.sin(n/4)*.1);
    if(this.frame>=10&&(this.frame-10)%10===0){
      const image=this.scene.add.image(x+23,y+28,'spr_tsunderplanecloud:0').setOrigin(.5).setDepth(10);
      this.smoke.push({image,x:x*2+46,y:y*2+56,vx:-2-Math.random(),vy:0,age:0,size:2,angle:Math.random()*360,alpha:1});
    }
    for(const p of this.smoke){
      p.age++;p.angle++;p.size+=.05;p.vy-=.2;p.x+=p.vx+Math.sin(p.age/2);p.y+=p.vy+Math.cos(p.age/2);
      if(p.age>7)p.alpha-=.04;
      p.image.setPosition(p.x/2,p.y/2).setScale(p.size/2).setAngle(-p.angle).setAlpha(Math.max(0,p.alpha)).setTexture(`spr_tsunderplanecloud:${Math.floor(p.age*.2)%2}`);
      if(p.alpha<.05)p.image.destroy();
    }
    this.smoke=this.smoke.filter(p=>p.image.active);
  }
  destroy(){for(const p of [this.plane,this.hat,this.blush])p.destroy();for(const p of this.smoke)p.image.destroy();this.smoke=[];}
}
