import { RuinsWave } from './ruins-waves.mjs';

export function loadAaronWaveAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const key of ['spr_muscbul1','spr_muscbul1_r','spr_muscbul2','spr_muscbul2_r','spr_teardrop']) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    if (!scene.textures.exists(`${key}:0`)) scene.load.image(`${key}:0`, new URL(`sprites/${key}/${key}_0.png`, base).href);
  }
}

// obj_muscbulgen, obj_sweatbulgen và hai loại đạn Aaron, tọa độ 640×480.
export class AaronWave extends RuinsWave {
  constructor(scene, command, { population = 1, damage = 7 } = {}) {
    super(scene,'aaron'); this.kind = command <= 50 ? 'muscle' : 'sweat'; this.duration = 160; this.damage = damage;
    const b = this.border = { left: 227, right: 407, top: 200, bottom: 385 };
    scene.arena.setPosition(b.left / 2,b.top / 2).setSize((b.right - b.left) / 2,(b.bottom - b.top) / 2); scene.soul.setPosition(154.5,142.5);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2,b.top / 2,(b.right - b.left) / 2,(b.bottom - b.top) / 2).setVisible(false); this.mask = this.clip.createGeometryMask();
    this.side = Math.floor(Math.random() * 2) === 1 ? -1 : 1; this.offset = population > 1 ? 1 : 0;
    this.rate = this.kind === 'muscle' ? Math.trunc(25 * (population === 3 ? 2.4 : population === 2 ? 1.7 : 1)) + 1 : Math.trunc(5 * (population === 3 ? 2.7 : population === 2 ? 1.8 : 1));
    this.next = this.kind === 'muscle' ? 1 : this.rate;
  }
  spawnMuscle() {
    const b=this.border, right=this.side === -1, x = right ? b.right - 4 + (this.offset ? 38 : 0) - 86 : b.left + 4 - (this.offset ? 38 : 0);
    const key = right ? 'spr_muscbul1_r' : 'spr_muscbul1';
    this.add(key,x,b.bottom + 12,{baseX:x,vy:-3,right,offset:this.offset,damage:this.damage}).image.setMask(this.mask);
    this.bullets[0].vy -= .02;
    this.side = -this.side; this.next = this.rate > 0 ? this.frames + this.rate : Infinity; this.rate -= 2;
  }
  spawnSweat() {
    const b=this.border, count=(this.bullets.filter((e) => !e.dead).length + 1) % 4; let x,y,angle;
    if (count < 2) { x=b.left + Math.random()*(b.right-b.left); y=b.top-40; angle=270; }
    else { x=count===2 ? b.left-16 : b.right+16; y=b.top-40+Math.random()*122*1.5; angle=count===2 ? 310 : 235; }
    const radians=angle*Math.PI/180;
    this.add('spr_teardrop',x,y,{vx:3.5*Math.cos(radians),vy:-3.5*Math.sin(radians),alpha:0,damage:7}).image.setMask(this.mask);
    this.next=this.frames+this.rate;
  }
  step() {
    this.frames++;
    if (this.frames >= this.next) { if (this.kind === 'muscle') this.spawnMuscle(); else this.spawnSweat(); }
    for (const bullet of this.bullets) {
      bullet.age++;
      if (this.kind === 'muscle') {
        bullet.x=bullet.baseX+Math.round(Math.sin(this.frames/20)*2);
        if (bullet.age % 15 === 0) { bullet.sprite=`spr_muscbul${Math.floor(bullet.age/15)%2===1?2:1}${bullet.right?'_r':''}`; if (bullet.offset) bullet.vy=-4; }
      } else bullet.alpha=Math.min(1,bullet.alpha+.05);
      bullet.x+=bullet.vx;bullet.y+=bullet.vy;
      bullet.image.setPosition(bullet.x/2,bullet.y/2).setTexture(`${bullet.sprite}:0`).setAlpha(bullet.alpha ?? 1);
      if (this.scene.invFrames<=0 && this.touchesHeart(bullet)) this.scene.hurt(bullet.damage);
      if (this.kind === 'muscle' ? bullet.y < 150 : bullet.y > 500 || bullet.x < -30 || bullet.x > 670) { bullet.dead=true;bullet.image.destroy(); }
    }
    this.bullets=this.bullets.filter((b)=>!b.dead); return this.frames >= this.duration;
  }
  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
