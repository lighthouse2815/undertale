import { RuinsWave } from './ruins-waves.mjs';

export function loadVulkinLavaAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const [key,count] of [['spr_lavaside',2],['spr_lavaflame',1]]) {
    if (!scene.cache.json.exists(key)) scene.load.json(key,new URL(`sprites/${key}/${key}.json`,base).href);
    for (let i=0;i<count;i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`,new URL(`sprites/${key}/${key}_${i}.png`,base).href);
  }
}

// obj_lavafiregen, obj_sidelava, obj_lavabullet; tọa độ 640×480 ở 30 Hz.
export class VulkinLavaWave extends RuinsWave {
  constructor(scene, { rate = 7, damage = 8, border = {left:237,right:397,top:250,bottom:385} } = {}) {
    super(scene,'vulkinLava'); this.rate = rate; this.damage = damage; this.border = border; this.next = 5; this.lavaTime = 1; this.duration = 160;
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(border.left/2,border.top/2,(border.right-border.left)/2,(border.bottom-border.top)/2).setVisible(false);
    this.mask = this.clip.createGeometryMask();
    scene.arena.setPosition(border.left/2,border.top/2).setSize((border.right-border.left)/2,(border.bottom-border.top)/2); scene.soul.setPosition(154.5,154.5);
  }
  spawnSide(left) {
    const b=this.border, bullet=this.add('spr_lavaside',left ? b.left-40 : b.right-10,b.bottom,{vx:left?3:-3,vy:-3,gravity:left?-.1:.1,damage:this.damage,side:true});
    bullet.image.setTexture(`spr_lavaside:${left?0:1}`).setMask(this.mask); return bullet;
  }
  spawnFlame(left) {
    const b=this.border, bullet=this.add('spr_lavaflame',left?b.left+10:b.right-10,(b.top+b.bottom)/2+60-Math.random()*120,
      {vx:(left?1:-1)*(6+Math.random()*2),vy:-1+Math.random()*2,gravity:left?-.17:.17,damage:this.damage,side:false,left,alpha:1});
    bullet.image.setOrigin(.5).setMask(this.mask); return bullet;
  }
  step() {
    this.frames++;
    if (this.frames >= this.next) {
      this.spawnSide(true); this.spawnSide(false); this.lavaTime++;
      if (this.lavaTime === 2) this.spawnFlame(true);
      if (this.lavaTime === 4) { this.spawnFlame(false); this.lavaTime=0; }
      this.next = this.frames + Math.max(1,Math.round(this.rate));
    }
    for (const b of this.bullets) {
      b.age++; b.vx += b.gravity; b.x += b.vx; b.y += b.vy;
      if (!b.side) {
        b.image.setRotation(Math.atan2(b.vy,b.vx));
        if (b.left ? b.vx < 0 && b.x <= this.border.left : b.vx > 0 && b.x >= this.border.right) {
          b.alpha -= .12; b.image.setAlpha(Math.max(0,b.alpha)); if (b.alpha < .05) b.dead=true;
        }
      } else if (b.x < 100 || b.x > 500) b.dead=true;
      b.image.setPosition(b.x/2,b.y/2);
      if (!b.dead && this.scene.invFrames <= 0 && this.touchesLava(b)) { this.scene.hurt(b.damage); b.dead=true; }
      if (b.dead) b.image.destroy();
    }
    this.bullets=this.bullets.filter(b=>!b.dead); return this.frames >= this.duration;
  }
  touchesLava(bullet) {
    const scene=this.scene, data=scene.cache.json.get(bullet.sprite), hx=scene.soul.x*2, hy=scene.soul.y*2;
    const angle=bullet.side?0:bullet.image.rotation, c=Math.cos(angle), s=Math.sin(angle);
    for (let x=0;x<16;x++) for (let y=0;y<16;y++) {
      if (!(scene.textures.getPixel(x,y,'spr_heart:mask')?.red > 0)) continue;
      const dx=hx+x-bullet.x, dy=hy+y-bullet.y;
      const px=dx*c+dy*s+data.OriginX, py=-dx*s+dy*c+data.OriginY;
      if (px>=data.MarginLeft && px<=data.MarginRight && py>=data.MarginTop && py<=data.MarginBottom) return true;
    }
    return false;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
