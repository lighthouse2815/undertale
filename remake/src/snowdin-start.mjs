import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { colorBitmapFont } from './fonts.mjs';

export function showSnowdinSave(world, text) {
  colorBitmapFont(world, 'fnt_maintext', 'red', '#ff0000');
  const f = world.flags;
  const level = murderLevel(f);
  let lines = text.save, red = false;
  if (level >= 2 && !f[27]) {
    const left = Math.max(0, 16 - (f[203] ?? 0));
    lines = text.saveLeft.map((line) => line.replace(/\\\[1\]/g, String(left))); red = true;
    if (level === 5) lines = text.saveComedian;
    if (f[57] === 2 && left <= 0) { lines = text.saveDetermination; red = false; }
    if (left <= 0 && f[57] !== 2) { lines = text.saveSnowdrake; red = false; }
  }
  if (level >= 16) { lines = text.saveDetermination; red = false; }
  world.hp = Math.max(world.hp, world.maxHp); world.sound.play('snd_power');
  world.showDialogue(lines, { onPage: () => world.dialogueText.setFont(red ? 'fnt_maintext:red' : 'fnt_maintext'),
    onClose: () => { world.release(); world.scene.pause(); world.scene.launch('SaveMenu'); } });
}

export function stopSnowdinMusic(world) { world.snowdinMusic?.destroy(); world.snowdinMusic = null; }

export function pauseSnowdinMusicForBattle(scene) {
  const world = scene.previousScene, music = world.snowdinMusic;
  music?.pause();
  scene.events.once('shutdown', () => {
    if (music !== world.snowdinMusic || music?.pendingRemove) return;
    if (music?.isPaused) music.resume();
    else if (music && !music.isPlaying) music.play(); // Game Over đã gọi stopAll.
  });
  return music;
}

export function startSnowdinMusic(world, special = false) {
  if (world.snowdinMusic) return { music: world.snowdinMusic, fade: null };
  const end = world.flags[7] === 1, early = world.plot <= 35;
  const murder = murderLevel(world.flags) >= 2;
  const key = end ? 'mus_reunited' : early ? 'mus_tone2' : !special && world.flags[222] && !world.flags[27] ? 'mus_toomuch' : 'mus_snowy';
  const rate = key === 'mus_snowy' ? (!special && murder && !world.flags[27] && !world.flags[222] ? .4 : .95) : 1;
  const music = world.snowdinMusic = world.sound.add(key, { loop: true, rate, volume: key === 'mus_tone2' ? .2 : 1 });
  music.play(); return { music, fade: key === 'mus_tone2' ? 0 : null };
}

// obj_tundramusic và obj_ruins_reentrance tại lối vào Snowdin.
export class SnowdinStart {
  constructor(world) {
    this.world = world; this.elapsed = 0;
    const entry = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_ruins_reentrance');
    if (world.flags[7] === 1) {
      entry.image.setDepth(-entry.object.Depth);
      this.door = { ObjectName: 'obj_door_s_musfade', X: entry.item.X + 3, Y: entry.item.Y + 56 };
    } else {
      entry.image.destroy();
      for (const [ObjectName, X, Y] of [['obj_sul', 35, 150], ['obj_solidsmall', 35, 130]])
        world.colliders.push(createCollider(world.dataSource, { ObjectName, X, Y, ScaleX: 1, ScaleY: 1 }));
    }
    Object.assign(this, startSnowdinMusic(world));
  }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30;
      if (this.fade !== null && this.fade !== undefined) {
        this.fade += .04; if (this.fade > .95) this.fade = 1;
        this.music.setVolume(this.fade); if (this.fade === 1) this.fade = null;
      }
    }
  }

  checkTrigger() {
    if (!this.door || !touchesObject(this.world, this.world.player, this.door)) return false;
    this.world.transitionRoom('room_ruinsexit', 'obj_markers', 14 * 1000 / 30, true); return true;
  }

  interact() {
    const world = this.world;
    if (!world.roomObjects.some((entry) => entry.item.ObjectName === 'obj_readable_room2' && inInteractionRange(world, entry))) return false;
    world.showDialogue(world.dataSource.snowdinStartDialogue.camera); return true;
  }
}
