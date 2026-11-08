// obj_heatwaver chụp vùng khung trận và dịch từng dòng theo sóng sin.
export class PyropeHeatWave{
  constructor(scene,rules){
    this.scene=scene;this.rules=rules;this.phase=2;this.canvas=document.createElement('canvas');this.context=this.canvas.getContext('2d');this.camera=scene.cameras.main;
    this.onRender=()=>this.render();this.camera.on('postrender',this.onRender);
  }
  step(){if(this.rules.heatWave>0)this.phase+=1+Math.floor(this.scene.arena.height*2);}
  render(){
    if(this.rules.heatWave<=0||!this.scene.arena?.active)return;
    const arena=this.scene.arena,x=Math.floor(arena.x),y=Math.floor(arena.y),width=Math.max(1,Math.floor(arena.width)),height=Math.max(1,Math.floor(arena.height));
    if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
    const target=this.scene.game.canvas,ctx=target.getContext('2d');this.context.clearRect(0,0,width,height);this.context.drawImage(target,x,y,width,height,0,0,width,height);
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(let row=0;row<height;row++){
      const shift=Math.round(Math.sin((this.phase+row*2)/(height*2/50))*this.rules.heatWave/2);
      ctx.drawImage(this.canvas,0,row,width,1,x+shift,y+row,width,1);
    }
    ctx.restore();
  }
  destroy(){this.camera.off('postrender',this.onRender);}
}
