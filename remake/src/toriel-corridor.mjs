import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';
import { startHouseMusic } from './house-music.mjs';

// obj_torieltrigger7: nắm tay tới cửa phòng, xoa đầu 90 frame rồi rời đi.
export class TorielCorridor {
  constructor(world) {
    this.world = world; this.text = world.dataSource.bedroomDialogue; this.elapsed = 0;
    this.stage = world.plot > 18 ? 'complete' : 'intro'; this.locked = this.stage !== 'complete';
    this.music = startHouseMusic(world);
    if (world.flags[7] !== 1) this.music[1].setVolume(.001);
    this.mirror = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_mirrorreflection').image;
    this.mirror.setDepth(-2000000);
    this.buster = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_toribuster');
    if (this.locked) {
      world.player.setPosition(38, 144);
      this.npc = world.add.image(54, 120, 'spr_toriel_l:0').setOrigin(0).setDepth(173);
    }
  }

  animate() {
    const player = this.world.player, [sprite, frame] = player.texture.key.split(':');
    const reflected = sprite === 'spr_maincharad' ? 'spr_maincharau' : sprite === 'spr_maincharau' ? 'spr_maincharad' : sprite;
    this.mirror.setTexture(`${reflected}:${frame}`).setPosition(player.x, Math.max(73, 228 - player.y)).setVisible(player.visible);
  }

  update(delta) {
    this.animate();
    const world = this.world;
    if (this.stage === 'intro') {
      this.stage = 'explaining'; world.release();
      world.showDialogue(this.text.intro, { portrait: 'spr_face_torielhappytalk', onClose: () => this.lead() });
    }
    if (this.stage === 'ruffling') {
      this.elapsed = Math.min(this.elapsed + delta, 200);
      while (this.elapsed >= 1000 / 30 && this.stage === 'ruffling') {
        this.elapsed -= 1000 / 30; this.frames++;
        this.ruffle.setTexture(`spr_toriel_ruffle:${Math.floor(this.frames * .1) % 4}`);
        if (this.frames === 90) {
          this.ruffle.destroy(); this.ruffle = null; this.npc.setVisible(true); world.player.setVisible(true); this.stage = 'burning';
          world.showDialogue(this.text.burning, { portrait: 'spr_face_torieltalkside', onClose: () => this.leave() });
        }
      }
    }
    return this.locked;
  }

  lead() {
    const world = this.world, player = world.player;
    this.stage = 'leading'; this.npc.x -= 10; player.setVisible(false);
    this.path = walkNpc(world, this.npc, 'path_torielwalk20_2', { absolute: false, speed: 2,
      sprites: { r: 'spr_toriel_handhold_r', u: 'spr_toriel_handhold_u' },
      onUpdate: (npc) => { npc.setDepth(npc.y + 53); player.setPosition(npc.x - 6, npc.y + 24); world.updateCamera(); },
      onComplete: () => {
        this.npc.x += 19; this.npc.y--; this.npc.setTexture('spr_toriel_u:0');
        player.setPosition(player.x + 41, player.y - 4).setVisible(true); player.facing = 'u'; player.setTexture('spr_maincharau:0');
        world.updateCamera();
        this.stage = 'room';
        world.showDialogue(this.text.room, { portrait: 'spr_face_torielhappytalk', onClose: () => {
          this.stage = 'ruffling'; this.frames = 0; this.elapsed = 0; this.npc.setVisible(false); player.setVisible(false);
          this.ruffle = world.add.image(this.npc.x, this.npc.y, 'spr_toriel_ruffle:0').setOrigin(18 / 48, -1 / 52).setDepth(this.npc.y + 53);
        } });
      } });
  }

  leave() {
    const world = this.world; world.plot = 19; this.locked = false; this.stage = 'leaving';
    this.path = walkNpc(world, this.npc, 'path_torielwalk20', { absolute: false, speed: 6, onUpdate: (npc) => {
      npc.setDepth(npc.y + 53);
      if (touchesObject(world, npc, this.buster)) { this.path.stop(); npc.destroy(); this.stage = 'complete'; }
    } });
  }

  interact() {
    const world = this.world;
    const entry = world.roomObjects.find((entry) => /^obj_readable_room[1-4]$/.test(entry.item.ObjectName) && inInteractionRange(world, entry));
    if (!entry) return false;
    const name = entry.item.ObjectName;
    let lines = name.endsWith('1') ? this.text.renovations : name.endsWith('2') ? world.flags[50] === 1 ? this.text.plantKnown : this.text.plant
      : name.endsWith('3') ? this.text.drawer : world.flags[202] >= 20 ? this.text.mirrorKill.map((line) => line.replace('\\[C]', world.game.registry.get('charname')))
        : world.flags[7] === 1 ? this.text.mirrorEnd : this.text.mirror;
    world.showDialogue(lines); return true;
  }

  destroy() {
    this.path?.stop(); this.ruffle?.destroy();
    if (this.world.player?.active) this.world.player.setVisible(true);
  }
}
