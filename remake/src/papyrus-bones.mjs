export function loadPapyrusBoneAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const key of ['spr_bonetop', 'spr_bonebottom']) {
    for (let i = 0; i < 2; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
}

// Ba xương trắng mở đầu của obj_papyrusboss, cùng xương trên/dưới dùng ở các lượt sau.
export class PapyrusBones {
  constructor(scene, { firstWave = false, fighto = -1, turn = null, xfight = 0, command = 0 } = {}) {
    if (turn === 14 && xfight > 3) throw new RangeError('Đòn đặc biệt của Papyrus chưa được chuyển.');
    this.scene = scene; this.fighto = fighto; this.frames = 0; this.bullets = []; this.captured = false;
    if (turn === 14 && xfight <= 3 && command >= 40) { turn = 2 + Math.floor(Math.random() * 11); this.rolledTurn = turn; xfight++; }
    this.duration = firstWave ? 140 : turn === 14 ? (command < 20 ? 210 : 200) : ({ '-1': 200, 0: 300, 1: 220, 2: 240, 3: 150, 4: 240, 5: 330, 6: 200, 7: 150, 8: 230, 9: 355, 10: 230, 11: 250, 12: 200, 13: 220 })[turn] ?? 140;
    this.border = { left: 192, right: 442, top: 250, bottom: 385 };
    const b = this.border; scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2).setVisible(false);
    this.mask = this.clip.createGeometryMask(); this.oldHeart = { x: scene.soul.x * 2, y: scene.soul.y * 2 };
    if (firstWave) for (const dx of [10, 90, 170]) this.add(b.right + dx, b.bottom - (20 + Math.round(Math.random() * 20)), { vx: -3 });
    if (turn !== null) {
      scene.soulMovement = 2; scene.soulVSpeed = -1; scene.soulJumpStage = 2;
      const patterns = {
        '-1': [[b.right + 30, 20, -3], [b.right + 200, 20, -3], [b.right + 370, 40, -3]],
        0: [[b.right + 20, 20, -4], [b.right + 150, 40, -4], [b.right + 280, 40, -4], [b.right + 410, 40, -4], [b.right + 390, 60, -3], [b.right + 510, 60, -3], [b.right + 630, 60, -3]],
        1: [[b.left - 10, 60, 3], [b.left - 80, 40, 3, true], [b.left - 230, 20, 4], [b.left - 310, 20, 4], [b.left - 390, 20, 4], [b.left - 490, 50, 4], [b.left - 580, 40, 4, true]],
        2: [[b.left - 30, 60, 3.5], [b.left - 160, 60, 3.5], [b.left - 290, 60, 3.5], [b.left - 390, 80, 3.5, false, true], [b.right + 1120, 30, -6]],
        3: [[b.left - 40, 50, 4], [b.left - 40, 90, 4, true], [b.right + 140, 40, -4, true], ...[20, 30, 40, 50, 50, 40, 30, 20].map((height, i) => [b.left - 260 - i * 20, height, 4])],
        4: [[b.left - 40, 30, 4], [b.left - 40, 80, 4, true], [b.left - 60, 30, 4], [b.left - 60, 80, 4, true], [b.left - 170, 60, 4], [b.left - 170, 110, 4, true], [b.left - 190, 60, 4], [b.left - 190, 110, 4, true], [b.left - 320, 90, 4, false, true], [b.right + 480, 60, -4], [b.right + 700, 30, -4], [b.right + 700, 80, -4, true], [b.left - 700, 30, 4], [b.left - 700, 80, 4, true]],
        5: [[40, 30], [70, 45], [100, 60], [130, 45], [160, 30], [190, 15], [300, 15], [330, 30], [360, 45], [390, 60], [700, 30], [730, 45], [760, 60], [790, 45], [820, 30], [850, 15], [970, 15], [1000, 30], [1030, 45], [1060, 60]].map(([dx, height]) => [b.right + dx, height, dx < 700 ? -3 : -4]),
        6: [...[10, 110, 210].map((dx) => [b.left - dx, 35, 2]), ...[10, 110, 210].map((dx) => [b.right + dx, 35, -2])],
        7: [...[10, 110, 210, 310].map((dx) => [b.left - dx, 20, 2]), ...[10, 110, 210, 310].map((dx) => [b.right + dx, 20, -2])],
        8: [[b.right + 40, 20, -4], ...[[170,20], [310,30], [460,40], [610,50], [760,60]].flatMap(([dx, height]) => [[b.right + dx, height, -4], [b.right + dx, height + 50, -4, true]])],
        9: [[b.right + 60, 60, -4], ...[[220,60], [360,50], [500,40], [640,30], [780,10], [990,30], [1130,50]].flatMap(([dx, height]) => [[b.right + dx, height, -4], [b.right + dx, height + 40, -4, true]])],
        10: [[b.left - 40, 30, 4], ...[[60,40], [80,50], [100,60], [280,50], [295,40], [310,30]].flatMap(([dx, height]) => [[b.left - dx, height, 4], [b.left - dx, height + 50, 4, true]]), ...[600, 620, 640].map((dx) => [b.right + dx, 30, -4])],
        11: [...[60, 140, 220, 300, 380, 460, 540, 620, 1250, 1330].map((dx, i) => [b.right + dx, i % 2 ? 20 : 80, i < 8 ? -4.5 : -7, false, i % 2 === 0])],
        12: [...[30, 40, 50, 60, 50, 40, 30].map((height, i) => [b.left - 60 - 27 * i, height, 4]), ...[30, 40, 50, 60, 50, 40, 30].map((height, i) => [b.right + 600 + 40 * i, height, -6.4])],
        13: [...[20, 60, 100].map((dx) => [b.right + dx, 30, -4]), ...[240, 270, 300].map((dx) => [b.right + dx, 10, -4, true]), [b.right + 460, 30, -4], [b.right + 460, 40, -4, true], [b.right + 580, 50, -4], [b.right + 580, 60, -4, true]],
        14: command < 20 ? [...[30, 40, 50, 60, 50, 40, 30].map((height, i) => [b.left - 60 - 30 * i, height, 4]), ...[30, 40, 50, 60, 50, 40, 30].map((height, i) => [b.right + 680 + 40 * i, height, -6.4])] : [10, 90, 170, 250, 330, 410, 490, 570, 1150, 1230].map((dx, i) => [b.right + dx, i % 2 ? 20 : 80, i < 8 ? -5 : -8, false, i % 2 === 0])
      };
      for (const [x, height, vx, top = false, blue = false] of patterns[turn]) this.add(x, b.bottom - height, { vx: turn === 3 && xfight > 0 ? Math.sign(vx) * 4.5 : vx, top, blue });
      // Gán biến qua tên object trong GML áp dụng cho mọi instance, kể cả object con.
      const speed = turn === 1 && xfight > 0 ? 4.5 : turn === 2 && xfight > 0 ? 4 : turn === 7 ? (xfight > 0 ? 4.4 : 4) : turn === 8 ? 4.4 : turn === 9 || turn === 10 ? 4.2 : null;
      if (speed !== null) for (const bone of this.bullets) bone.vx = Math.sign(bone.vx) * speed;
      if (turn === 9) for (const bone of this.bullets.slice(-4)) Object.assign(bone, bone.x === b.right + 990 ? { osc: -1, oscmin: -1, oscmax: 30 } : { osc: -2, oscmin: -20, oscmax: 30 });
      if (turn === 10) for (const bone of this.bullets.slice(-3)) Object.assign(bone, { osc: -3, oscmin: -1, oscmax: 60 });
      if (turn === 13) for (const [i, bone] of this.bullets.entries()) if (i < 6 || i === 7 || i === 9) Object.assign(bone, { osc: -3, oscmin: -1, oscmax: i < 6 ? 60 : 40 });
    }
  }
  add(x, y, { vx = 0, top = false, blue = false, damage = 6, osc = 0, oscmax = 20, oscmin = 20 } = {}) {
    const scene = this.scene, b = this.border, frame = Number(blue), key = top ? 'spr_bonebottom' : 'spr_bonetop';
    const tip = scene.add.image(x / 2, y / 2, `${key}:${frame}`).setOrigin(0).setScale(.5).setMask(this.mask);
    const base = scene.add.image(x / 2, (top ? b.top + 6 : b.bottom - 10) / 2, `${top ? 'spr_bonetop' : 'spr_bonebottom'}:${frame}`).setOrigin(0).setScale(.5).setMask(this.mask);
    const stem = scene.add.graphics().setMask(this.mask);
    const bone = { x, y, startY: y, vx, top, blue, damage, osc, oscmax, oscmin, drawn: false, outsideRoom: false, tip, base, stem };
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
    // collision_rectangle của GML truyền prec=false, nên dùng hộp bao thay vì mask pixel.
    return hx <= x + 9 && hx + 15 >= x + 3 && hy <= y2 && hy + 15 >= y1;
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
      } else {
        // OutsideRoom được phát khi hộp bao rời phòng 640×480, không phải khi rời khung đấu.
        const outside = bone.x + 10 < 0 || bone.x + 2 > 640 || bone.y + 11 < 0 || bone.y + 4 > 480;
        if (outside && !bone.outsideRoom && (bone.x < b.left - 10 && bone.vx < 0 || bone.x > b.right + 10 && bone.vx > 0)) this.remove(bone);
        else bone.outsideRoom = outside;
      }
    }
    this.oldHeart = { x: hx, y: hy }; return this.frames >= this.duration;
  }
  destroy() { for (const bone of [...this.bullets]) this.remove(bone); this.mask.destroy(); this.clip.destroy(); }
}
