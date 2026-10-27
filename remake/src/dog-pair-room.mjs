import { touchesObject, walkNpc } from './npc.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';

// obj_forcedright: đi ép30frame, hai chó tiến tới/đánh hơi/path, nhóm25 và hậu cảnh.
export class DogPairRoom {
  constructor(world) {
    this.world = world; this.text = world.dataSource.dogPairDialogue; this.elapsed = 0; this.frames = 0; this.total = 0; this.locked = false;
    this.stage = world.plot < 50 ? 'waiting' : 'done'; this.actors = []; this.paths = [];
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_forcedright');
    this.music = startSnowdinMusic(world).music;
  }
  wait(stage, duration) { this.stage = stage; this.frames = 0; this.duration = duration; }
  show(key, next) { this.stage = 'talking'; this.world.showDialogue(this.text[key], { onClose: next }); }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  step() {
    const w = this.world; this.frames++; this.total++;
    if (this.fadeIn !== undefined) {
      this.fadeIn = Math.min(1, this.fadeIn + .04); this.music.setVolume(this.fadeIn);
      if (this.fadeIn === 1) this.fadeIn = undefined;
    }
    if (this.dogSpeed) for (const [i, actor] of this.actors.entries()) {
      if (!actor.active) continue;
      actor.y += this.dogSpeed; actor.setDepth(actor.y + 46).setTexture(`${i ? 'spr_womandogwalk' : 'spr_mandogwalk'}:${Math.floor(this.total * .2) % 4}`);
      if (this.stage === 'done' && actor.y > w.dataSource.room.Height) actor.destroy();
    }
    if (this.stage === 'forcedWalk') {
      w.player.x += 3; const key = `spr_mainchara${this.enterFacing}`;
      w.player.setTexture(`${key}:${Math.floor(this.frames * .25) % w.dataSource.sprites.get(key).TextureCount}`).setDepth(w.player.y + 30); w.updateCamera();
      if (this.volume > .06) { this.volume -= .04; this.music.setVolume(this.volume); }
      else { this.volume = 0; this.music.setVolume(0).pause(); }
      if (this.frames >= 30) {
        w.player.facing = 'd'; w.player.setTexture('spr_maincharad:0');
        this.actors = [-34, 20].map((dx, i) => w.add.image(w.player.x + dx, w.dataSource.room.Height - 40, `${i ? 'spr_womandogwalk' : 'spr_mandogwalk'}:0`).setOrigin(0).setDepth(w.dataSource.room.Height + 6));
        this.dogSpeed = -1; this.wait('approach', 142);
      }
    } else if (this.stage === 'approach' && this.frames >= 142) {
      this.dogSpeed = 0; this.actors.forEach((actor, i) => actor.setTexture(`${i ? 'spr_womandogwalk' : 'spr_mandogwalk'}:0`)); this.wait('sniffWait', 20);
    } else if (this.stage === 'sniffWait' && this.frames >= 20) this.show('sniff', () => this.meander());
    else if (this.stage === 'afterMeander' && this.frames >= 30) {
      this.meanderMusic?.destroy(); this.meanderMusic = null;
      this.show('threat', () => {
        w.flags[200] = 0; w.flags[201] = w.kills;
        for (const flag of [10, 11, 12, 13]) w.flags[flag] = 0;
        this.stage = 'battle'; w.release(); window.__remake.startBattle('dogi');
      });
    } else if (this.stage === 'battle' && w.plot === 50) {
      this.fadeIn = 0;
      if (w.flags[53] === 1) this.finish(true);
      else this.wait('afterBattle', 11);
    } else if (this.stage === 'afterBattle' && this.frames >= 11) this.show(w.flags[53] === 2 ? 'fetch' : 'pet', () => { this.dogSpeed = 4; this.wait('retreat', 40); });
    else if (this.stage === 'retreat' && this.frames >= 40) this.finish();
  }
  meander() {
    this.stage = 'meander'; this.meanderMusic = this.world.sound.add('mus_dogmeander', { volume: 1, rate: 1.4 }); this.meanderMusic.play();
    this.paths = this.actors.map((actor, i) => {
      const sprite = i ? 'spr_womandogwalk' : 'spr_mandogwalk';
      return walkNpc(this.world, actor, i ? 'path_wdog' : 'path_mdog', { absolute: false, speed: 4,
        sprites: { d: sprite, u: sprite, l: sprite, r: sprite }, onUpdate: (actor) => actor.setDepth(actor.y + 46),
        onComplete: () => { if (!i) { this.paths.forEach((path) => path.stop()); this.actors.forEach((a, j) => a.setTexture(`${j ? 'spr_womandogwalk' : 'spr_mandogwalk'}:0`)); this.wait('afterMeander', 30); } } });
    });
  }
  finish(killed = false) {
    if (killed) this.actors.forEach((actor) => actor.destroy());
    this.world.plot = 51; this.stage = 'done'; this.locked = false;
    this.world.release(); this.world.confirmPressed = false; this.world.menuPressed = false;
  }
  checkTrigger() {
    const w = this.world;
    if (this.stage !== 'waiting' || w.dialogue || !touchesObject(w, w.player, this.trigger, 3, 1)) return false;
    this.locked = true; this.enterFacing = w.player.facing; this.volume = this.music.volume; this.originalVolume = this.volume;
    // Lưu tại điểm chạm để Game Over dựng lại cảnh, không đặt Frisk vượt qua trigger sau bước ép.
    w.saveGame(true); w.release(); this.wait('forcedWalk', 30); return true;
  }
  destroy() {
    this.paths.forEach((path) => path.stop()); this.actors.forEach((actor) => actor.destroy()); this.meanderMusic?.destroy();
    if (this.originalVolume !== undefined && this.music === this.world.snowdinMusic && !this.music.pendingRemove) { this.music.setVolume(this.originalVolume ?? 1); if (this.music.isPaused) this.music.resume(); }
  }
}
