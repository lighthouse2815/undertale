import { touchesObject } from './npc.mjs';
import { createCollider } from './movement.mjs';

// obj_floweytrigger2/obj_floweytalker1: gặp lại Flowey sau Toriel.
export class FloweyExit {
  constructor(world) {
    this.world = world; this.text = world.dataSource.floweyExitDialogue; this.elapsed = 0; this.locked = false;
    this.entry = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_floweytalker1'); this.flower = this.entry.image;
    this.flower.setDepth(this.entry.item.Y + this.entry.sprite.Height);
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_floweytrigger2');
    this.exit = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_demodoorA');
    try { this.memory = JSON.parse(localStorage.getItem('undertale-remake-flowey-memory') ?? '{}'); } catch { this.memory = {}; }
    if (!this.memory || typeof this.memory !== 'object' || Array.isArray(this.memory)) this.memory = {};
    this.murder = world.flags[26] > 0 ? world.flags[26] >= 2 : world.flags[202] >= 20 && world.flags[45] === 4;
    const seen = this.memory.alter > 0 || this.memory.killed > 0 || this.memory.specialKill > 0;
    this.stage = world.plot > 27 || (seen && !this.murder) || this.memory.alter2 > 0 ? 'complete' : 'waiting';
    if (this.stage === 'complete') this.flower.destroy();
    if (world.flags[7] !== 1) for (const x of [140, 160]) world.colliders.push(createCollider(world.dataSource, { ObjectName: 'obj_solidsmall', X: x, Y: 400, ScaleX: 1, ScaleY: 1 }));
  }

  checkTrigger(previous) {
    const world = this.world;
    if (!this.locked && touchesObject(world, world.player, this.exit)) {
      world.release();
      if (world.flags[7] === 1) world.transitionRoom('room_tundra1', 'obj_markers', 14 * 1000 / 30, true);
      else {
        this.locked = true; this.stage = 'whiteout'; this.frames = 0; world.plot = 30;
        world.sound.stopAll(); this.cymbal = world.sound.add('mus_cymbal', { volume: .9, rate: .95 }); this.cymbal.play();
        this.white = world.add.rectangle(0, 0, 320, 240, 0xffffff).setOrigin(0).setScrollFactor(0).setDepth(200000).setAlpha(0);
      }
      return true;
    }
    if (this.stage !== 'waiting' || !touchesObject(world, world.player, this.trigger, 100, 1)) return false;
    world.player.setPosition(previous.x, previous.y); world.release(); this.locked = true; this.stage = 'talking';
    const killed = Number(localStorage.getItem('undertale-remake-toriel-kills') ?? 0), spared = Number(localStorage.getItem('undertale-remake-toriel-spares') ?? 0);
    const explained = !!this.memory.explained;
    let key = 'fallback'; this.after = 'laugh';
    if (world.flags[45] === 4) {
      key = killed > 2 ? 'killMany' : killed === 2 ? 'killTwice' : 'kill';
      if (spared > 0 && killed > 0) {
        key = explained ? 'killedAfterSpare' : 'explainAfterKill'; this.memory.explained = 1;
        if (!explained) this.after = 'grow';
      }
      if (this.murder) { key = 'murder'; this.after = 'idea'; this.memory.truename = 1; this.memory.alter2 = 1; }
    } else if (world.flags[45] === 5) {
      key = world.kills > 0 ? 'sparedWithKills' : 'sparedWithoutKills'; this.after = world.kills > 0 ? 'laugh' : 'grow';
      if (killed > 0 && !explained) { key = 'sparedAfterKill'; this.memory.explained = 1; this.after = 'grow'; }
    }
    localStorage.setItem('undertale-remake-flowey-memory', JSON.stringify(this.memory));
    const pages = this.text[key].map((page) => ({ ...page, text: page.text.replace(/\\\[C\]/g, world.game.registry.get('charname')) }));
    world.showDialogue(pages.map((page) => page.text), { portrait: pages[0].portrait,
      onPage: (index) => { world.setDialoguePortrait(pages[index].portrait); this.flower.setTexture('spr_flowey:0'); },
      onClose: () => {
        this.frames = 0; this.stage = this.after;
        if (this.after !== 'grow') world.sound.play(this.after === 'idea' ? 'snd_wonderfulidea' : 'snd_floweylaugh');
      } });
    return true;
  }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }

  step() {
    if (['waiting', 'talking', 'complete'].includes(this.stage)) return;
    const world = this.world; this.frames++;
    if (this.stage === 'whiteout') {
      this.white.setAlpha(Math.min(1, this.frames * .006));
      if (this.frames === 180) {
        this.cymbal.destroy(); this.stage = 'title';
        world.scene.sleep(); world.scene.launch('ChapterTitle', { world });
      }
    } else if (this.stage === 'title') return;
    else if (this.stage === 'laugh' || this.stage === 'idea') {
      const count = this.stage === 'idea' ? 80 : 150;
      if (this.frames === count) { world.plot = 28; this.locked = false; this.stage = 'sink'; this.frames = 2; }
      else this.flower.setTexture(`spr_flowey:${Math.floor(this.frames * .25) % this.text.sprites.spr_flowey}`);
    } else if (this.stage === 'grow') {
      const grow = this.text.sprites.spr_floweygrow * 3, shrink = this.text.sprites.spr_floweyshrink * 2;
      if (this.frames < grow) this.flower.setTexture(`spr_floweygrow:${Math.floor(this.frames / 3)}`);
      else if (this.frames < grow + 30) this.flower.setTexture('spr_floweylaughoverworld:0');
      else if (this.frames < grow + 180) {
        if (this.frames === grow + 30) world.sound.play('snd_floweylaugh');
        this.flower.setTexture(`spr_floweylaughoverworld:${Math.floor((this.frames - grow - 30) * .6) % this.text.sprites.spr_floweylaughoverworld}`);
      } else if (this.frames < grow + 180 + shrink) this.flower.setTexture(`spr_floweyshrink:${Math.floor((this.frames - grow - 180) / 2)}`);
      else {
        const frame = Math.floor((this.frames - grow - 180 - shrink) / 2);
        if (frame >= 5) this.flower.setVisible(false); else this.flower.setTexture(`spr_floweysink:${frame}`);
      }
      if (this.frames >= 240) { this.flower.destroy(); world.plot = 28; this.locked = false; this.stage = 'complete'; }
    } else if (this.stage === 'sink') {
      const frame = Math.floor(this.frames / 2);
      if (frame >= 5) { this.flower.destroy(); this.stage = 'complete'; }
      else this.flower.setTexture(`spr_floweysink:${frame}`);
    }
  }

  destroy() { this.cymbal?.destroy(); }
}
