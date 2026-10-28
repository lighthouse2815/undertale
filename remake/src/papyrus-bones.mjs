import { maskContains } from './collision-mask.mjs';

export function loadPapyrusBoneAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const key of ['spr_bonetop', 'spr_bonebottom']) {
    for (let i = 0; i < 2; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
}

// Ba xương trắng mở đầu của obj_papyrusboss, cùng xương trên/dưới dùng ở các lượt sau.
export class PapyrusBones {
  constructor(scene, { firstWave = false, fighto = -1 } = {}) {
    this.scene = scene; this.fighto = fighto; this.frames = 0; this.bullets = []; this.captured = false;
    this.border = { left: 192, right: 442, top: 250, bottom: 385 };
    const b = this.border; scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false);
    this.mask = this.clip.createGeometryMask(); this.oldHeart = { x: scene.soul.x * 2, y: scene.soul.y * 2 };
    if (firstWave) for (const dx of [10, 90, 170]) this.add(b.right + dx, b.bottom - (20 + Math.round(Math.random() * 20)), { vx: -3 });
  }
  add(x, y, { vx = 0, top = false, blue = false, damage = 6, osc = 0, oscmax = 20, oscmin = 20 } = {}) {
    const scene = this.scene, b = this.border, frame = Number(blue), key = top ? 'spr_bonebottom' : 'spr_bonetop';
    const tip = scene.add.image(x / 2, y / 2, `${key}:${frame}`).setOrigin(0).setScale(.5).setMask(this.mask);
    const base = scene.add.image(x / 2, (top ? b.top + 6 : b.bottom - 10) / 2, `${top ? 'spr_bonetop' : 'spr_bonebottom'}:${frame}`).setOrigin(0).setScale(.5).setMask(this.mask);
    const stem = scene.add.graphics().setMask(this.mask);
    const bone = { x, y, startY: y, vx, top, blue, damage, osc, oscmax, oscmin, drawn: false, tip, base, stem };
    this.bullets.push(bone); this.draw(bone); return bone;
  }
  draw(bone) {
    const b = this.border, { x, y, top, blue } = bone;
    bone.tip.setPosition(x / 2, y / 2); bone.base.setX(x / 2);
    bone.stem.clear();
    if (x > b.left - 5 && x < b.right - 4) {
      bone.drawn = true;
      const y1 = top ? Math.min(y, b.top + 10) : Math.min(y + 4, b.bottom - 6);
      const y2 = top ? Math.max(y, b.top + 10) : Math.max(y + 4, b.bottom - 6);
      bone.stem.fillStyle(blue ? 0x14a9ff : 0xffffff).fillRect((x + 3) / 2, y1 / 2, 3.5, (y2 - y1 + 1) / 2);
    }
  }
  touches(bone) {
    const { x, y, top } = bone, b = this.border, hx = this.scene.soul.x * 2, hy = this.scene.soul.y * 2;
    if (Math.abs(hx - x) >= 15) return false;
    const y1 = top ? Math.min(y, b.top + 10) : Math.min(y + 2, b.bottom - 2);
    const y2 = top ? Math.max(y, b.top + 10) : Math.max(y + 2, b.bottom - 2);
    for (let px = 0; px < 16; px++) for (let py = 0; py < 16; py++) {
      if (hx + px >= x + 3 && hx + px <= x + 9 && hy + py >= y1 && hy + py <= y2 && maskContains(this.scene, 'spr_heart:mask', px, py)) return true;
    }
    return false;
  }
  remove(bone) { bone.tip.destroy(); bone.base.destroy(); bone.stem.destroy(); this.bullets.splice(this.bullets.indexOf(bone), 1); }
  step() {
    const scene = this.scene, b = this.border, hx = scene.soul.x * 2, hy = scene.soul.y * 2;
    const moving = Math.abs(hx - this.oldHeart.x) > .01 || Math.abs(hy - this.oldHeart.y) > .01;
    this.frames++;
    for (const bone of [...this.bullets]) {
      if (bone.drawn) { if (bone.y <= bone.startY - bone.oscmax || bone.y >= bone.startY - bone.oscmin) bone.osc = -bone.osc; bone.y += bone.osc; }
      bone.x += bone.vx; this.draw(bone);
      if (scene.invFrames <= 0 && (!bone.blue || moving) && this.touches(bone)) {
        const w = scene.previousScene, df = w.lv === 20 ? 99 : 9 + Math.ceil(w.lv / 4);
        let damage = Math.max(3, Math.round(bone.damage - (df + w.armorDefense) / 5));
        if (w.flags[6] !== 1 && this.fighto > 13) damage -= Number(scene.hp < 10) + Number(scene.hp < 5);
        scene.hp -= damage; scene.sound.play('snd_hurt1'); scene.cameras.main.shake(1000 / 15, .006);
        if (scene.hp <= 0) {
          scene.hp = 1; scene.invFrames = 50; scene.soulVSpeed = 0; this.captured = true;
          for (const other of [...this.bullets]) this.remove(other);
        } else { scene.invFrames = 3 * (30 + (w.armor === 44 ? 30 : 0) + (w.armor === 64 ? 15 : 0) + (w.weapon === 45 ? 15 : 0)); this.remove(bone); }
        scene.refreshHp();
        if (this.captured) break;
      } else if (bone.x < b.left - 10 && bone.vx < 0 || bone.x > b.right + 10 && bone.vx > 0) this.remove(bone);
    }
    this.oldHeart = { x: hx, y: hy }; return this.frames >= 140;
  }
  destroy() { for (const bone of [...this.bullets]) this.remove(bone); this.mask.destroy(); this.clip.destroy(); }
}
