const sprites = {spr_vulkinbody:1,spr_vulkinlava:4,spr_vulkinface:2,spr_vulkinface2:2,spr_vulkinface3:2,spr_vulkinface4:2,spr_vulkinface5:1,spr_vulkinfeetback:1,spr_vulkinfeetfront:1,spr_vulkincloud:1};

export function loadVulkinBodyAssets(scene) {
  const base=new URL('../assets/',import.meta.url);
  for(const [key,count] of Object.entries(sprites)) {
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for(let i=0;i<count;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  }
}

// obj_vulkinbody và obj_vulkincloud; scene dùng nửa tọa độ của game gốc.
export class VulkinBody {
  constructor(scene,x=53,y=62.5) {
    this.scene=scene;this.x=x;this.y=y;this.frame=0;this.siner=0;this.pause=0;this.face='spr_vulkinface';this.smoke=[];
    const add=(key,depth)=>{const data=scene.cache.json.get(key);return scene.add.image(x,y,`${key}:0`).setOrigin(data.OriginX/data.Width,data.OriginY/data.Height).setDepth(depth);};
    this.back=add('spr_vulkinfeetback',10);this.body=add('spr_vulkinbody',11);this.lava=add('spr_vulkinlava',12);this.head=add(this.face,13);this.front=add('spr_vulkinfeetfront',14);
  }
  step() {
    this.frame++;this.siner=this.pause ? 0 : this.siner+1;
    if(this.pause===1)this.face='spr_vulkinface5';
    const n=this.siner, x=this.x,y=this.y;
    this.back.setPosition(x+1+Math.cos(n/6),y+51+Math.sin(n/6));
    this.body.setPosition(x,y);
    this.lava.setPosition(x+21,y+5).setTexture(`spr_vulkinlava:${Math.floor(n/8)%4}`);
    const count=sprites[this.face];this.head.setPosition(x+22+Math.sin(n/12)*3.5,y+25).setTexture(`${this.face}:${Math.floor(n/15)%count}`).setScale(1-Math.abs(Math.sin(n/12))*.1,1);
    this.front.setPosition(x+1+Math.sin(n/6),y+51+Math.cos(n/6));
    if(this.pause===0 && this.frame>=10 && (this.frame-10)%15===0) {
      const image=this.scene.add.image(x+25,y+2,'spr_vulkincloud:0').setOrigin(.5,8/17).setDepth(20).setScale(.125);
      this.smoke.push({image,x:x*2+50,y:y*2+4,vx:2-Math.random()*4,vy:-1,phase:Math.random()*100,angle:Math.random()*360,size:.25,alpha:1});
    }
    for(const cloud of this.smoke) {
      cloud.alpha-=.02;cloud.angle+=2;cloud.size+=.07;cloud.phase++;cloud.vy-=.2;cloud.x+=cloud.vx+Math.sin(cloud.phase/5)*2;cloud.y+=cloud.vy;
      cloud.vx=Math.sign(cloud.vx)*Math.max(0,Math.abs(cloud.vx)-.05);
      cloud.image.setPosition(cloud.x/2,cloud.y/2).setScale(cloud.size/2).setAngle(-cloud.angle).setAlpha(Math.max(0,cloud.alpha));
      if(cloud.alpha<.05)cloud.image.destroy();
    }
    this.smoke=this.smoke.filter(c=>c.image.active);
  }
  destroy(){for(const image of [this.back,this.body,this.lava,this.head,this.front])image.destroy();for(const cloud of this.smoke)cloud.image.destroy();this.smoke=[];}
}
