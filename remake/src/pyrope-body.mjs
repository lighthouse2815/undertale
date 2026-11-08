const sprites={spr_pyropefootl:1,spr_pyropefootr:1,spr_pyropebody:6,spr_pyropehead:2,spr_pyropehead2:1};

export function loadPyropeBodyAssets(scene){
  const base=new URL('../assets/',import.meta.url);
  for(const [key,count] of Object.entries(sprites)){
    if(!scene.cache.json.exists(key))scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for(let i=0;i<count;i++)if(!scene.textures.exists(`${key}:${i}`))scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  }
}

// obj_pyropebody: hai chân, sáu đốt dây và đầu; scene dùng nửa tọa độ gốc.
export class PyropeBody{
  constructor(scene,x=58,y=57.5){
    this.scene=scene;this.x=x;this.y=y;this.siner=0;this.rotto=0;this.hurt=false;
    const add=(key,depth)=>{const d=scene.cache.json.get(key);return scene.add.image(x,y,`${key}:0`).setOrigin(d.OriginX/d.Width,d.OriginY/d.Height).setDepth(depth);};
    this.left=add('spr_pyropefootl',10);this.right=add('spr_pyropefootr',11);
    this.segments=Array.from({length:6},(_,i)=>add('spr_pyropebody',12+i));this.head=add('spr_pyropehead',19);
  }
  step(){
    if(this.hurt){this.rotto++;this.siner=28;}else{this.rotto=0;this.siner++;}
    const n=this.siner,step=Math.abs(Math.sin(n/14)),x=this.x,y=this.y;
    this.left.setPosition(x+19,y+60-step*10).setAngle(-step*40);this.right.setPosition(x+30,y+60-step*10).setAngle(step*40);
    let currentY=y+50-step*10;
    for(let i=5;i>=0;i--){this.segments[i].setPosition(x,currentY).setTexture(`spr_pyropebody:${i}`);currentY-=6+Math.abs(Math.sin((n-i)/14)*3);}
    this.head.setPosition(x+25,currentY-15).setTexture(this.hurt?'spr_pyropehead2:0':`spr_pyropehead:${Math.floor(n/10)%2}`).setAngle(-(this.hurt?0:Math.sin(n/6)*4)-Math.sin(this.rotto)*12);
  }
  destroy(){for(const p of [this.left,this.right,...this.segments,this.head])p.destroy();}
}
