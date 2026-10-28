import {updateWaterfallRain} from './waterfall-music.mjs';

// obj_rainer, obj_normaldrop và màn thác phía trước trong hành lang mưa.
export class WaterfallRainRoom {
  constructor(world){
    this.world=world;this.elapsed=0;this.frames=0;this.anim=0;this.drops=[];this.splashes=[];
    if(world.flags[7]!==1){
      const inherited=!!world.waterfallRain;world.waterfallRainMix ??= {deep:inherited ? .5 : 0,normal:inherited?0:.5};world.waterfallRain ??= world.sound.add('mus_rain_deep',{loop:true,volume:0,rate:.9});if(!world.waterfallRain.isPlaying)world.waterfallRain.play();
      world.waterfallRainLight ??= world.sound.add('mus_rain',{loop:true,volume:inherited?0:.5,rate:.9});if(!world.waterfallRainLight.isPlaying)world.waterfallRainLight.play();
    }
    this.falls=world.roomObjects.filter(e=>e.item.ObjectName==='obj_foreground_waterfall').map(e=>{e.image.destroy();return {x:e.item.X,y:e.item.Y,tiles:Array.from({length:20},()=>world.add.image(0,0,'spr_waterfall_anim:0').setOrigin(0).setScale(2).setAlpha(.2).setDepth(-e.object.Depth))};});
    this.puddle=world.roomObjects.find(e=>e.item.ObjectName==='obj_puddle');this.puddle.image.setDepth(-100000);
    this.clip=world.add.graphics().fillStyle(0xffffff).fillRect(this.puddle.item.X,this.puddle.item.Y,this.puddle.sprite.Width,this.puddle.sprite.Height).setVisible(false);this.mask=this.clip.createGeometryMask();
    this.reflection=world.add.image(0,0,'spr_maincharad_fall:0').setOrigin(0).setAlpha(.4).setDepth(-99999).setMask(this.mask);
    this.kidReflection=world.add.image(0,0,'spr_mkid_dfall:0').setOrigin(0).setAlpha(.4).setDepth(-99999).setMask(this.mask);
    this.draw();
  }
  update(delta){this.elapsed=Math.min(200,this.elapsed+delta);while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}this.draw();}
  step(){
    const w=this.world,c=w.cameras.main,p=w.player;this.frames++;this.anim=(this.anim+3)%180;updateWaterfallRain(w,false);
    for(let i=0;i<2;i++){const x=c.scrollX-40+Math.random()*360,y=c.scrollY-70-Math.random()*50;this.drops.push({x,y,vy:2+Math.random(),goal:y+240,image:w.add.image(x,y,'spr_statuedrop:0').setOrigin(0).setDepth(0)});}
    for(let i=this.drops.length-1;i>=0;i--){const d=this.drops[i];d.vy+=.2;d.y+=d.vy;if(d.x<c.scrollX-40)d.x+=361;if(d.x>c.scrollX+360)d.x-=361;
      const shield=w.flags[85]===1&&d.x>=p.x-10&&d.x<p.x+30&&d.y+6>=p.y-10&&d.y<p.y+30&&d.goal-d.y>6&&d.goal-d.y<40;
      if(d.y>d.goal||shield){for(let j=0;j<3;j++){const a=(60+Math.random()*60)*Math.PI/180,speed=1+Math.random()*2;this.splashes.push({x:d.x,y:d.y+5,vx:Math.cos(a)*speed,vy:-Math.sin(a)*speed,alpha:1,image:w.add.image(d.x,d.y+5,'spr_statueplink:0').setOrigin(0).setDepth(-(d.y+5))});}d.image.destroy();this.drops.splice(i,1);}else d.image.setPosition(d.x,d.y);
    }
    for(let i=this.splashes.length-1;i>=0;i--){const p=this.splashes[i];p.vy+=.2;p.x+=p.vx;p.y+=p.vy;p.alpha-=.08;p.image.setPosition(p.x,p.y).setAlpha(Math.max(0,p.alpha));if(p.alpha<.09){p.image.destroy();this.splashes.splice(i,1);}}
  }
  draw(){
    const w=this.world,c=w.cameras.main,p=w.player,view=Math.max(0,Math.min(w.dataSource.room.Width-320,c.scrollX));
    for(const f of this.falls)for(const [i,tile] of f.tiles.entries())tile.setPosition(f.x-view*.5,f.y-210+i*30+this.anim);
    const umbrella=w.flags[85]===1,key=`spr_mainchara${p.facing}_${umbrella?'umbrellafall':'fall'}`,data=w.dataSource.sprites.get(key),offset=umbrella?({d:3,u:16,r:10,l:9})[p.facing]:0;
    this.reflection.setTexture(`${key}:${Math.floor(p.frameIndex??0)%data.TextureCount}`).setPosition(p.x-offset,p.y+30).setVisible(p.visible);
    const kid=w.waterfallRainKid?.kid;if(kid?.active){const facing=(w.waterfallRainKid.sprite??'spr_mkid_d').replace('spr_mkid_',''),key=`spr_mkid_${['d','u','l','r','rt'].includes(facing)?facing:'d'}fall`,data=w.dataSource.sprites.get(key);this.kidReflection.setTexture(`${key}:${Math.floor(w.waterfallRainKid.frames*.25)%data.TextureCount}`).setPosition(kid.x,kid.y+kid.height).setVisible(true);}else this.kidReflection.setVisible(false);
  }
  destroy(){for(const p of [...this.drops,...this.splashes])p.image.destroy();for(const f of this.falls)for(const tile of f.tiles)tile.destroy();this.reflection.destroy();this.kidReflection.destroy();this.mask.destroy();this.clip.destroy();}
}
