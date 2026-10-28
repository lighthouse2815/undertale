import { PapyrusBones } from './papyrus-bones.mjs';

export function loadPapyrusRegularAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const key of ['spr_tobydogscoot', 'spr_cbone', 'spr_oolbone', 'spr_dbone', 'spr_udebone', 'spr_skatebone', 'spr_coolbus', 'spr_superbone']) {
    if (!scene.cache.json.exists(key)) scene.load.json(key, new URL(`sprites/${key}/${key}.json`, base).href);
    for (let i = 0; i < (key === 'spr_tobydogscoot' ? 2 : 1); i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
}

// Đòn thường cuối của Papyrus: xương, chó, xe buýt và xương lớn.
export class PapyrusRegularAttack extends PapyrusBones {
  constructor(scene) {
    super(scene, { fighto: 16 }); this.duration = 1300; this.actors = [];
    scene.soulMovement = 2; scene.soulJumpStage = 2; scene.soulVSpeed = -1;
    const b = this.border, bone = (x, height, vx, extra = {}) => this.add(x, b.bottom - height, { vx, ...extra });
    for (const dx of [10, 60]) bone(b.left - dx, 20, 4);
    for (const dx of [160, 210]) bone(b.right + dx, 20, -4);
    for (const [dx, height, top, osc, max] of [[360,60,false,0,20], [540,30,false,-4,60], [640,50,true,-4,60], [740,30,false,-2,40], [890,30,false,-2,40]]) {
      for (const side of [-1, 1]) bone(side < 0 ? b.left - dx : b.right + dx, height, -4 * side, { top, osc, oscmin: osc ? -1 : 20, oscmax: max });
    }
    for (const dx of [1090,1120,1150]) bone(b.right + dx, 30, -4, { osc: -1, oscmin: -1, oscmax: 30 });
    for (const dx of [1340,1370,1400]) bone(b.left - dx, 30, 4, { osc: -1, oscmin: -1, oscmax: 30 });
    bone(b.right + 970, 20, -1);
    for (const [dx, height, key, vx] of [[2000,40,'spr_tobydogscoot',-5],[2240,60,'spr_cbone',-5],[2280,60,'spr_oolbone',-5],[2500,60,'spr_dbone',-5],[2540,60,'spr_udebone',-5],[2220,60,'spr_skatebone',-4]]) this.addActor('dog', key, b.right + dx, b.bottom - height, vx);
    for (let dx = 1910; dx <= 2390; dx += 60) this.addActor('bus', 'spr_coolbus', b.right + dx, b.bottom - 60, -3);
    this.addActor('super', 'spr_superbone', b.right + 2450, b.bottom - 240, -3);
  }
  addActor(kind, sprite, x, y, vx) {
    const image = this.scene.add.image(x / 2, y / 2, `${sprite}:0`).setOrigin(0).setScale(.5).setMask(this.mask);
    const actor = { kind, sprite, x, y, vx, image, age: 0, appeared: false }; this.actors.push(actor); return actor;
  }
  removeActor(actor) { actor.image.destroy(); this.actors.splice(this.actors.indexOf(actor), 1); }
  step() {
    const s = this.scene, b = this.border, hx = s.soul.x * 2, hy = s.soul.y * 2, previousY = this.oldHeart.y;
    const done = super.step();
    if (this.captured) { for (const actor of [...this.actors]) this.removeActor(actor); return false; }
    const superBone = this.actors.find((actor) => actor.kind === 'super');
    for (const actor of [...this.actors]) {
      actor.age++; actor.x += actor.vx;
      if (actor.kind === 'super' && actor.x < b.right + 40 && actor.x > b.right + 10 && hx > b.right - 60 && !actor.appeared) { actor.appeared = true; actor.y = hy; }
      if (actor.kind === 'super' && actor.x < b.left + 20) { b.top = 250; s.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2); }
      const up = s.keys.up.isDown || [...s.previousScene.touch.values()].some((pointer) => pointer.direction === 'up');
      if (actor.kind === 'bus' && superBone && actor.x < b.right && up && hx < superBone.x + 20 && hy > 50) {
        if (hy < 270) b.top = Math.round((hy - 20) / 5) * 5;
        s.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2);
        if (s.soulVSpeed >= -2 && previousY > hy) s.soulVSpeed = -2;
      }
      actor.image.setPosition(actor.x / 2, actor.y / 2);
      if (actor.sprite === 'spr_tobydogscoot') actor.image.setTexture(`spr_tobydogscoot:${Math.floor(actor.age * .2) % 2}`);
      const d = s.cache.json.get(actor.sprite), rect = actor.kind === 'bus' ? [actor.x + 5, actor.y + 10, actor.x + 55, b.bottom - 10] : [actor.x + d.MarginLeft, actor.y + d.MarginTop, actor.x + d.MarginRight, actor.y + d.MarginBottom];
      const near = actor.kind === 'bus' ? Math.abs(hx + 25 - actor.x) < 50 : actor.kind === 'super' ? Math.abs(hx + 30 - actor.x) < 80 : true;
      if (s.invFrames < 1 && near && hx <= rect[2] && hx + 15 >= rect[0] && hy <= rect[3] && hy + 15 >= rect[1]) {
        this.hit(actor.kind === 'bus' ? 6 : 3);
        if (!this.captured) this.removeActor(actor);
        else { for (const other of [...this.actors]) this.removeActor(other); break; }
      } else if (actor.kind === 'dog' && actor.x < 0 || actor.kind === 'bus' && actor.x < b.left - 100 || actor.kind === 'super' && actor.x < b.left - 40) this.removeActor(actor);
    }
    this.clip.clear().fillStyle(0xffffff).fillRect(b.left / 2, b.top / 2, (b.right - b.left) / 2, (b.bottom - b.top) / 2);
    return done;
  }
  destroy() { for (const actor of [...this.actors]) this.removeActor(actor); super.destroy(); }
}
