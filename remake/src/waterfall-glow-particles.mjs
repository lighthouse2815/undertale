// obj_glowparticlegen_1 và obj_glowparticle_1.
export class WaterfallGlowParticles {
  constructor(world) {
    this.world=world; this.elapsed=0; this.particles=[];
    this.generators=world.dataSource.room.GameObjects.filter(e=>e.ObjectName==='obj_glowparticlegen_1').map(e=>({x:e.X,y:e.Y,timer:Math.max(1,Math.ceil(Math.random()*12))}));
  }
  update(delta) {
    this.elapsed=Math.min(200,this.elapsed+delta);
    while(this.elapsed>=1000/30) { this.elapsed-=1000/30; this.step(); }
  }
  step() {
    const w=this.world,c=w.cameras.main;
    for(const g of this.generators) if(--g.timer<=0) {
      g.timer=10;
      if(g.x>c.scrollX-100&&g.x<c.scrollX+420&&g.y>c.scrollY-100&&g.y<c.scrollY+340) {
        const size=.2+Math.random()*.4, angle=(90+Math.random()*20-10)*Math.PI/180;
        const image=w.add.image(g.x+Math.random()*60-20,g.y-15,'spr_glowparticle_1:0').setScale(size).setAlpha(0).setDepth(-200);
        this.particles.push({image,angle,speed:1+Math.random(),rising:true});
      }
    }
    for(let i=this.particles.length-1;i>=0;i--) {
      const p=this.particles[i];
      if(p.rising) { p.image.alpha+=.25; if(p.image.alpha>.6) p.rising=false; }
      p.angle+=(Math.random()*6-3)*Math.PI/180; p.speed=Math.max(0,p.speed-.02)+(Math.random()*.04-.02);
      p.image.x+=Math.cos(p.angle)*p.speed; p.image.y-=Math.sin(p.angle)*p.speed; p.image.alpha-=.01;
      if(p.image.alpha<.02) { p.image.destroy(); this.particles.splice(i,1); }
    }
  }
  destroy() { for(const p of this.particles) p.image.destroy(); this.particles=[]; }
}
