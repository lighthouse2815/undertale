import { updateWaterfallRain } from './waterfall-music.mjs';

// obj_backgrounder_castle và obj_mkid_shadow trong hành lang nhìn về lâu đài.
export class WaterfallCastle {
  constructor(world, spawn) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.look = 0; this.stage = 'following'; this.timer = 0;
    if (world.flags[7] !== 1) {
      const inherited = !!world.waterfallRain;
      world.waterfallRainMix ??= { deep: 0, normal: .5 };
      world.waterfallRain ??= world.sound.add('mus_rain_deep', { loop: true, volume: 0, rate: .9 });
      if (!world.waterfallRain.isPlaying) world.waterfallRain.play();
      world.waterfallRainLight ??= world.sound.add('mus_rain', { loop: true, volume: inherited ? 0 : .5, rate: .9 });
      if (!world.waterfallRainLight.isPlaying) world.waterfallRainLight.play();
    }
    this.background = world.children.getAll().find(e => e.texture?.key === 'bg_waterfall_castle');
    this.ground = world.add.rectangle(140,195,world.dataSource.room.Width-290,46,0x000000).setOrigin(0).setDepth(-100000);
    const object = world.roomObjects.find(e => e.item.ObjectName === 'obj_mkid_shadow');
    this.kid = object?.image;
    if (this.kid && world.plot > 112) { this.kid.destroy(); this.kid = null; }
    if (this.kid) { this.kid.setPosition(world.player.x+(spawn==='obj_markerB'?24:-24),world.player.y+3); this.sprite='spr_mkid_r_shadow'; }
    if (world.flags[85] !== 1) this.playerShadow();
  }
  playerShadow() {
    const p=this.world.player,key=`spr_mainchara${p.facing}_shadow`,s=this.world.dataSource.sprites.get(key);
    p.setTexture(`${key}:0`).setOrigin(s.OriginX/s.Width,s.OriginY/s.Height);
  }
  update(delta) {
    this.elapsed=Math.min(200,this.elapsed+delta);
    while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}
    if(this.background){const c=this.world.cameras.main,scroll=Math.max(0,Math.min(this.world.dataSource.room.Width-320,c.scrollX));this.background.x=200+Math.round(scroll*.92);}
  }
  step() {
    const w=this.world; this.frames++; updateWaterfallRain(w,true); if(!this.kid)return;
    const p=w.player;let moving=false;
    if(this.stage==='following'){
      const distance=p.x-this.kid.x;
      if(Math.abs(distance)>34){this.kid.x+=Math.sign(distance)*(this.speedup?6:3);this.sprite=distance<0?'spr_mkid_l_shadow':'spr_mkid_r_shadow';this.look=0;moving=true;}
      else {this.speedup=false;if(++this.look>60)this.sprite='spr_mkid_u_shadow';}
      if(this.kid.x>450&&(w.flags[91]??0)<6){w.flags[91]=6;this.stage='running';this.timer=60;this.sprite='spr_mkid_r_shadow';}
    } else if(this.stage==='running'){
      this.kid.x+=6;moving=true;if(--this.timer<=0){this.stage='watching';this.timer=110;this.sprite='spr_mkid_u_shadow';}
    } else if(this.stage==='watching'&&--this.timer<=0){this.stage='following';this.speedup=true;}
    const sprite=w.dataSource.sprites.get(this.sprite);this.kid.setTexture(`${this.sprite}:${moving?Math.floor(this.frames*.25)%sprite.TextureCount:0}`).setDepth(p.y+30);
  }
  destroy(){this.ground.destroy();}
}
