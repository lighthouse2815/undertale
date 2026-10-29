import { UndyneGreenShield } from './undyne-green-shield.mjs';

export function loadUndyneGreenSoulAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (let i = 0; i < 2; i++) if (!scene.textures.exists(`spr_heartgreen:${i}`)) scene.load.image(`spr_heartgreen:${i}`, new URL(`sprites/spr_heartgreen/spr_heartgreen_${i}.png`, base).href);
}

// obj_spearblocker vẽ khiên quanh tâm SOUL theo tọa độ battle gốc 640×480.
export class UndyneGreenSoul {
  constructor(scene) {
    this.scene = scene; this.shield = new UndyneGreenShield();
    this.graphics = scene.add.graphics().setDepth(scene.soul.depth + 1);
    scene.soul.setTexture('spr_heartgreen:0').setOrigin(0).setScale(.5).setPosition(156, 116).setVisible(true);
    this.draw();
  }
  step(input) { this.shield.step(input); this.draw(); }
  block(site) { const blocked = this.shield.block(site); this.draw(); return blocked; }
  draw() {
    const g = this.graphics, r = 15, t = this.shield.direction * Math.PI / 180;
    const x = this.scene.soul.x + 4, y = this.scene.soul.y + 4;
    const x1 = x - Math.cos(t) * r - Math.sin(t) * r, y1 = y + Math.sin(t) * r - Math.cos(t) * r;
    const x2 = x - Math.cos(t) * r + Math.sin(t) * r, y2 = y + Math.sin(t) * r + Math.cos(t) * r;
    const x3 = x - Math.cos(t - .2) * r / 2 + Math.sin(t - .2) * r / 2;
    const y3 = y + Math.sin(t - .2) * r / 2 + Math.cos(t - .2) * r / 2;
    g.clear().lineStyle(1.5, this.shield.flash >= 2 ? 0xff0000 : 0x4040ff).beginPath().moveTo(x1, y1).lineTo(x2, y2).strokePath();
    g.lineStyle(1.5, 0x4040ff).beginPath().moveTo(x1, y1).lineTo(x3, y3).strokePath();
    g.lineStyle(.5, 0x008000).strokeCircle(x, y, r);
  }
  destroy() { this.graphics.destroy(); }
}
