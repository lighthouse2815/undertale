import { UndyneTileSpears } from './undyne-tile-spears.mjs';

// Giáo sàn được dùng ở cả hai phòng truy đuổi.
export class UndyneBridgeSpears {
  constructor(world,{end=false}={}){this.world=world;this.end=end;this.mask=end?'spr_nospear2':'spr_nospear';this.generator=new UndyneTileSpears({end});this.images=new Map();}
  blocked(x,y){const sprite=this.world.dataSource.sprites.get(this.mask),px=Math.floor(x/20),py=Math.floor(y/20);return px>=0&&py>=0&&px<sprite.Width&&py<sprite.Height&&(this.world.textures.getPixel(px,py,`${this.mask}:mask`)?.red??0)>0;}
  step(){
    const w=this.world,p=w.player,down=k=>w.keys[k].isDown||[...w.touch.values()].some(t=>t.direction===k);
    const output=this.generator.step({player:p,direction:{left:down('left'),right:down('right'),up:down('up'),down:down('down')},blocked:(x,y)=>this.blocked(x,y),touching:s=>s.x+12>=p.x&&s.x+6<=p.x+19&&s.y+37>=p.y+19&&s.y+28<=p.y+29});
    if(output.volley)w.sound.play('snd_spearappear');if(output.rise)w.sound.play('snd_spearrise');if(output.intense){if(!this.end)w.flags[285]=1;w.sound.play('snd_squeak');}
    for(const spear of this.generator.spears){
      if(!this.images.has(spear))this.images.set(spear,{base:w.add.image(spear.x,spear.y,'spr_tilespear:0').setOrigin(0),bud:w.add.image(spear.x,spear.y,'spr_tilespear:0').setOrigin(0)});
      const {base,bud}=this.images.get(spear);base.setPosition(spear.x,spear.y).setDepth(spear.y+35).setAlpha(spear.alpha);bud.setPosition(spear.x,spear.y).setDepth(spear.y+36).setAlpha(spear.alpha).setVisible(['rise','hold','fade'].includes(spear.stage)).setTexture(`spr_tilespear:${Math.min(3,Math.floor(spear.frame))}`);
    }
    for(const [spear,images] of this.images)if(!this.generator.spears.includes(spear)){images.base.destroy();images.bud.destroy();this.images.delete(spear);}
    if(output.hit){w.flags[15]=1;w.flags[16]=1;w.flags[370]=1;w.release();window.__remake.startBattle('undyneQuick');}
  }
  destroy(){for(const {base,bud} of this.images.values()){base.destroy();bud.destroy();}this.images.clear();this.generator.spears=[];}
}
