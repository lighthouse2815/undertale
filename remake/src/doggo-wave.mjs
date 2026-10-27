import { RuinsWave } from './ruins-waves.mjs';

// blt_bluesword: kiếm xanh tăng tốc, chậm lại gần tim rồi tăng tốc rời đi.
export class DoggoWave extends RuinsWave {
  constructor(scene) {
    super(scene, 'blueSword'); this.duration = 120; this.hurted = false;
    scene.arena.setPosition(101, 145).setSize(115, 47.5); scene.soul.setPosition(154.5, 155);
    this.oldHeart = { x: scene.soul.x * 2, y: scene.soul.y * 2 };
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(101, 145, 115, 47.5).setVisible(false); this.mask = this.clip.createGeometryMask();
    this.sword = this.add('spr_bluesword', 427, 290, { vx: -.1, friction: -.1, caught: false, damage: 6 }); this.sword.image.setMask(this.mask);
  }

  step() {
    this.frames++; const sword = this.sword, scene = this.scene;
    const hx = scene.soul.x * 2, hy = scene.soul.y * 2;
    sword.vx = -Math.max(0, Math.abs(sword.vx) - sword.friction); sword.x += sword.vx;
    if (Math.abs(hx - sword.x) < 12) { sword.caught = true; sword.friction = .1; sword.vx = -2; }
    else if (sword.caught) sword.friction = -.3;
    if (hy - sword.y > 47.5) sword.y += 4;
    else if (hy - sword.y < 23.75) sword.y -= 4;
    sword.image.setPosition(sword.x / 2, sword.y / 2);
    const moving = Math.abs(hx - this.oldHeart.x) > .01 || Math.abs(hy - this.oldHeart.y) > .01;
    if (scene.invFrames <= 0 && moving && this.touchesHeart(sword)) { scene.hurt(sword.damage); this.hurted = true; scene.detectMovement(); }
    this.oldHeart = { x: hx, y: hy };
    return this.frames >= this.duration || sword.x + 20 < 0;
  }

  destroy() { super.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
