import { touchesObject, walkNpc } from './npc.mjs';
import { startBasementMusic, stopBasementMusic } from './toriel-basement.mjs';

// obj_torieltrigger12: lời thách đấu, lửa, quay lại sau Flee và tạm biệt sau MERCY.
export class TorielGate {
  constructor(world) {
    this.world = world; this.text = world.dataSource.gateDialogue; this.timers = [];
    this.stage = world.plot > 24 ? 'complete' : 'waiting'; this.locked = false;
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_torieltrigger12');
    this.music = startBasementMusic(world);
    if (world.plot === 24) this.later(2, () => {
      this.npc = world.add.image(140, 50, 'spr_toriel_u:0').setOrigin(0).setDepth(103);
    });
  }

  later(frames, after) { const timer = this.world.time.delayedCall(frames * 1000 / 30, after); this.timers.push(timer); return timer; }
  pages(pages, onClose) {
    const world = this.world;
    world.showDialogue(pages.map((page) => page.text), { portrait: pages[0].portrait,
      onPage: (index) => world.setDialoguePortrait(pages[index].portrait), onClose });
  }

  checkTrigger(previous) {
    const world = this.world;
    if (this.stage !== 'waiting' || !this.npc?.active || world.flags[45] >= 4
      || !touchesObject(world, world.player, this.trigger, 100, 1)) return false;
    world.player.setPosition(previous.x, previous.y); world.release(); this.locked = true; this.stage = 'challenge';
    const memory = Number(localStorage.getItem('undertale-remake-toriel-kills') ?? 0) > 0;
    const key = world.flags[45] === 3 ? 'retry' : world.flags[202] > 11 && world.flags[203] > 11 ? 'manyKills' : memory ? 'memory' : 'intro';
    this.npc.setTexture('spr_toriel_d:0');
    this.pages(this.text[key], () => {
      world.flags[45] = 3; this.stage = 'flames'; this.flames = 0;
      this.flame = world.add.image(0, 0, 'spr_pbflame:0').setOrigin(0).setDisplaySize(320, 240).setAlpha(0).setDepth(90000);
      this.later(20, () => this.raiseFlame());
    });
    return true;
  }

  raiseFlame() {
    if (this.flames === 4) {
      this.stage = 'battle'; this.music.stop(); this.flame.setVisible(false);
      window.__remake.startBattle('toriel'); return;
    }
    this.flames++; this.flame.setAlpha(this.flames * .25); this.music.stop(); this.world.sound.play('snd_noise');
    this.later(this.flames === 4 ? 30 : 10, () => this.raiseFlame());
  }

  update() {
    const world = this.world;
    if (this.stage === 'battle' && window.__remake.phase === 'running') {
      this.flame.destroy();
      if (world.flags[45] === 4) { this.npc.destroy(); world.plot = 25; this.locked = false; this.stage = 'complete'; }
      else if (world.flags[45] === 5) {
        this.stage = 'farewell'; stopBasementMusic(world);
        this.music = world.sound.add('mus_toriel', { loop: true, volume: .8, rate: .75 }); this.music.play();
        world.player.setPosition(this.npc.x + 6, this.npc.y + 36); this.npc.setTexture('spr_toriel_d:0');
        this.pages(this.text.spared, () => this.hug());
      } else {
        this.music.play({ loop: true, volume: .5, rate: .3 }); world.player.y += 8; this.stage = 'fled';
        this.pages(this.text.fled, () => { this.stage = 'waiting'; this.locked = false; });
      }
    }
    if (this.stage === 'hug') {
      const frame = Math.floor((this.world.time.now - this.hugStarted) * .006);
      this.npc.setTexture(frame >= 2 ? 'spr_toriel_hug2:0' : `spr_toriel_hug:${frame}`);
    }
    if (this.stage === 'unhug') this.npc.setTexture(`spr_toriel_hug3:${Math.min(this.world.dataSource.sprites.get('spr_toriel_hug3').TextureCount - 1, Math.floor((this.world.time.now - this.hugStarted) * .006))}`);
    return this.locked;
  }

  hug() {
    const world = this.world; this.stage = 'hug'; this.npc.y += 10; world.player.setVisible(false); this.hugStarted = world.time.now;
    this.npc.setTexture('spr_toriel_hug:0');
    this.later(120, () => {
      this.npc.setTexture('spr_toriel_hug3:0'); this.hugStarted = world.time.now; this.stage = 'unhug';
      this.later(60, () => { world.player.setVisible(true); this.stage = 'goodbye'; this.pages(this.text.goodbye, () => this.leave()); });
    });
  }

  leave() {
    const world = this.world; this.stage = 'leaving';
    this.path = walkNpc(world, this.npc, 'path_torielwalkbasement3', { absolute: false, speed: 3, onComplete: () => {
      this.stage = 'lastLook'; this.npc.setTexture('spr_toriel_r:0');
      this.later(30, () => {
        for (let i = 0; i <= 13; i++) this.later(i * 12, () => {
          if (i === 0 || i === 9) this.npc.setTexture('spr_toriel_r:0');
          if (i === 1) this.npc.setTexture('spr_toriel_u:0');
          if (i === 10) this.path = walkNpc(world, this.npc, 'path_walkdown', { absolute: false, speed: 4 });
          if (i === 13) { this.path?.stop(); this.npc.destroy(); world.plot = 25; this.stage = 'complete'; this.locked = false; }
        });
      });
    } });
  }

  destroy() {
    for (const timer of this.timers) timer.remove(); this.path?.stop(); this.world.player?.setVisible(true);
    if (this.music !== this.world.basementMusic) this.music.destroy();
  }
}
