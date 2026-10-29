import { inInteractionRange, touchesObject } from './npc.mjs';
import dialogue from './waterfall-kid-bridge.json' with { type: 'json' };

// Tuyến thường của obj_monsterkidtrigger7; nhánh rơi và nhánh cứu đều đi tới plot 120.
export class WaterfallKidBridge {
  constructor(world) {
    this.world = world; this.stage = 'waiting'; this.elapsed = 0; this.frame = 0; this.locked = false;
    this.trigger = world.plot <= 119 ? world.dataSource.room.GameObjects.find(e => e.ObjectName === 'obj_monsterkidtrigger7') : null;
  }
  sprite(key, x, y, depth = 100) { const data = this.world.dataSource.sprites.get(key); return this.world.add.image(x, y, `${key}:0`).setOrigin(data.OriginX / data.Width, data.OriginY / data.Height).setDepth(depth); }
  pose(image, key, frame = 0) { const sprite = this.world.dataSource.sprites.get(key); image.setTexture(`${key}:${Math.floor(frame) % sprite.TextureCount}`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height); }
  wait(stage, frames) { this.stage = stage; this.timer = frames; this.frame = 0; }
  say(key, next, delay = 0, lines = dialogue[key]) { this.stage = 'dialogue'; this.world.showDialogue(lines, { onClose: () => this.wait(next, delay) }); }
  checkTrigger() {
    const w = this.world;
    if (!this.trigger || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 10)) return false;
    this.trigger = null; this.locked = true; w.release();
    this.kid = this.sprite('spr_mkid_r', w.cameras.main.scrollX - 40, w.player.y);
    this.wait('intro', 4); return true;
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  interact() {
    if (this.stage !== 'choice') return false;
    const w = this.world, sprite = w.dataSource.sprites.get('spr_interactable');
    const entry = { item: { X: this.kid.x + 5, Y: this.kid.y + 10, ScaleX: .5, ScaleY: 1 }, object: { Sprite: 'spr_interactable' }, sprite };
    if (!inInteractionRange(w, entry)) return false;
    this.locked = true; w.flags[17] = 0; w.release(); this.removeEscapeDoors(); this.wait('rescueWait', 30); return true;
  }
  step() {
    const w = this.world, kid = this.kid, undyne = this.undyne;
    if (this.stage === 'waiting' || this.stage === 'dialogue' || this.stage === 'done') return;
    this.frame++;
    if (this.stage === 'choice') {
      this.choiceFrames++; this.undyneTimer++;
      if (this.undyneTimer > 60 && this.undyneTimer <= 75) { undyne.x++; this.pose(undyne, 'spr_undynea_r', this.undyneTimer * .25); }
      if (this.undyneTimer > 75) this.undyneTimer = 0;
      if (this.choiceFrames > 150 && !this.warned && !w.dialogue && Math.abs(w.player.x - this.choiceX) < 10) {
        this.warned = true; w.showDialogue(dialogue.wait);
      }
      if ((this.choiceFrames > 500 || w.player.x < undyne.x + 40) && !w.dialogue) {
        this.charge = w.player.x < undyne.x + 40; this.locked = true; w.flags[17] = 0; w.release(); this.removeEscapeDoors(); this.say('slip', 'fallWait', 20);
      }
      return;
    }
    this.timer--;
    if (this.stage === 'cameraLeft') { w.cameras.main.scrollX = Math.max(0, w.cameras.main.scrollX - 2); if (w.waterfallMusic) w.waterfallMusic.setVolume(Math.max(0, 1 - this.frame * .02)); }
    if (this.stage === 'approach1' || this.stage === 'approach2') { kid.x++; this.pose(kid, 'spr_mkid_r', this.frame * .2); }
    if (this.stage === 'retreat') { kid.x--; this.pose(kid, 'spr_mkid_r', this.frame * .2); }
    if (this.stage === 'runLeft') { kid.x -= 3; this.pose(kid, 'spr_mkid_l', this.frame * .5); }
    if (this.stage === 'trip') this.pose(kid, 'spr_mkid_trip_l', Math.floor(this.frame / 4) % 2);
    if (this.stage === 'fall') { kid.x--; kid.y += 2; }
    if (this.stage === 'undyneEnter') { undyne.x += 2; this.pose(undyne, 'spr_undynea_r', this.frame * .2); }
    if (this.stage === 'rescueMove') { if (undyne.x > w.cameras.main.scrollX + 20) { undyne.x--; this.pose(undyne, 'spr_undynea_r', this.frame * .12); } kid.x += kid.x <= w.player.x ? -.8 : .8; kid.y--; }
    if (this.stage === 'rescueApproach') { undyne.x += .5; this.pose(undyne, 'spr_undynea_r', this.frame * .25); }
    if (this.stage === 'kidRunToPlayer') { kid.x += kid.x > w.player.x ? -5 : -.5; this.pose(kid, 'spr_mkid_l', this.frame * .25); }
    if (this.stage === 'undyneBack1' || this.stage === 'undyneBack2') { undyne.x -= .5; this.pose(undyne, 'spr_undynea_r', this.frame * .2); }
    if (this.stage === 'undyneLeave') { undyne.x -= 2; this.pose(undyne, 'spr_undynea_l', this.frame * .25); }
    if (this.stage === 'kidBack') { kid.x--; this.pose(kid, 'spr_mkid_l', this.frame * .25); }
    if (this.stage === 'kidExit' || this.stage === 'cameraReturnRescue') { kid.x -= 4; this.pose(kid, 'spr_mkid_l', this.frame * .5); }
    if (this.stage === 'cameraReturnRescue' || this.stage === 'cameraReturnFall') {
      const camera = w.cameras.main, target = Math.max(0, Math.min(w.dataSource.room.Width - 322, Math.round(w.player.x - 150)));
      const speed = this.stage === 'cameraReturnRescue' ? 2 : 4, distance = target - camera.scrollX;
      if (Math.abs(distance) <= speed) { camera.scrollX = target; this.finish(); }
      else camera.scrollX += Math.sign(distance) * speed;
      return;
    }
    if (this.stage === 'fallWait') kid.y += .5;
    if (this.stage === 'fallFast') kid.y += 4;
    if (this.stage === 'undyneJump') { undyne.y += this.jumpVy; this.jumpVy += .6; undyne.x += .5; }
    if (this.timer > 0) return;
    switch (this.stage) {
      case 'intro': this.say('calling', 'cameraLeft', 50); break;
      case 'cameraLeft': w.player.facing = 'l'; w.waterfallMusic?.pause(); this.wait('approach1', 20); break;
      case 'approach1': this.pose(kid, 'spr_mkid_r'); this.wait('pause1', 50); break;
      case 'pause1': this.wait('approach2', 130); break;
      case 'approach2': this.pose(kid, 'spr_mkid_r'); this.wait('pause2', 30); break;
      case 'pause2': this.pose(kid, 'spr_mkid_dt'); this.wait('lookDown', 30); break;
      case 'lookDown': this.pose(kid, 'spr_mkid_rt'); this.wait('speakWait', 40); break;
      case 'speakWait': this.say('speech', 'retreatWait', 30); break;
      case 'retreatWait': this.wait('retreat', 15); break;
      case 'retreat': this.pose(kid, 'spr_mkid_r'); this.wait('pause3', 60); break;
      case 'pause3': this.wait('runLeft', 15); break;
      case 'runLeft': this.wait('trip', 18); break;
      case 'trip': this.pose(kid, 'spr_mkid_u'); this.wait('fall', 15); break;
      case 'fall': this.pose(kid, 'spr_mkid_u'); this.wait('fallPause', 10); break;
      case 'fallPause': this.say('fall', 'spawnUndyne'); break;
      case 'spawnUndyne': this.undyne = this.sprite('spr_undynea_r', w.cameras.main.scrollX - 40, 82); this.wait('undyneEnter', 20); break;
      case 'undyneEnter': this.pose(this.undyne, 'spr_undynea_r'); this.wait('undynePause', 30); break;
      case 'undynePause': this.pose(this.undyne, 'spr_undyne_armraise'); w.sound.play('snd_spearappear'); this.wait('arm', 20); break;
      case 'arm': {
        this.pose(this.undyne, 'spr_undynea_r'); this.stage = 'choice'; this.locked = false; w.flags[17] = 1; this.choiceFrames = this.undyneTimer = 0; this.choiceX = w.player.x;
        const y = w.player.y + 10, x = w.cameras.main.scrollX;
        this.escapeDoors = [['room_water19', 'B', x - 20, 'obj_markerB'], ['room_water21', 'A', x + 340, 'obj_markerA']].map(([destination, direction, left, marker]) => ({ destination, direction, marker, left, right: left + 19, top: y, bottom: y + 19, duration: 8 * 1000 / 30, musicFade: false }));
        w.doors.push(...this.escapeDoors); break;
      }
      case 'rescueWait': this.wait('rescueMove', 28); break;
      case 'rescueMove': this.pose(kid, w.player.x > kid.x ? 'spr_mkid_rt' : 'spr_mkid_lt'); this.wait('rescuePause', 40); break;
      case 'rescuePause': this.wait('rescueApproach', 16); break;
      case 'rescueApproach': this.pose(kid, 'spr_mkid_l'); this.wait('rescueStop', 30); break;
      case 'rescueStop': this.wait('kidRunToPlayer', 10); break;
      case 'kidRunToPlayer': this.wait('kidStop', 30); break;
      case 'kidStop': this.pose(kid, 'spr_mkid_lt'); this.say('rescue', 'undyneBack1', 20); break;
      case 'undyneBack1': this.wait('undyneWait1', 30); break;
      case 'undyneWait1': this.wait('undyneBack2', 20); break;
      case 'undyneBack2': this.wait('undyneWait2', 60); break;
      case 'undyneWait2': this.wait('undyneLeave', 90); break;
      case 'undyneLeave': this.undyne.destroy(); this.undyne = null; this.pose(kid, 'spr_mkid_rt'); this.wait('thanksWait', 30); break;
      case 'thanksWait': this.say('thanks', 'kidBack', 30); break;
      case 'kidBack': this.pose(kid, 'spr_mkid_l'); this.wait('kidBackWait', 30); break;
      case 'kidBackWait': this.pose(kid, 'spr_mkid_rt'); this.wait('goodbyeWait', 30); break;
      case 'goodbyeWait': this.say('goodbye', 'kidExit', 40); break;
      case 'kidExit': w.flags[98] = 1; this.wait('cameraReturnRescue', 1); break;
      case 'fallWait': this.wait('fallPause2', 30); break;
      case 'fallPause2': this.wait('fallFast', 30); break;
      case 'fallFast': this.pose(undyne, 'spr_undyne_jump0'); this.wait('jumpWait', 30); break;
      case 'jumpWait': this.pose(undyne, 'spr_undyne_jump1'); w.sound.play('snd_spearrise'); this.jumpVy = -8; this.wait('undyneJump', 20); break;
      case 'undyneJump': w.sound.play('snd_fall'); this.wait('landWait', 90); break;
      case 'landWait': w.sound.play('snd_undynestep'); this.wait('stepWait', 20); break;
      case 'stepWait': w.sound.play('snd_grab'); this.wait('grabWait', 80); break;
      case 'grabWait': { const lines = [...dialogue.aftermath]; if (this.charge) lines[4] = dialogue.charge[0]; this.say('aftermath', 'finishFall', 40, lines); break; }
      case 'finishFall': w.flags[98] = 2; this.wait('cameraReturnFall', 1); break;
    }
  }
  removeEscapeDoors() { if (this.escapeDoors) { this.world.doors = this.world.doors.filter(door => !this.escapeDoors.includes(door)); this.escapeDoors = null; } }
  finish() { this.world.plot = 120; this.world.flags[17] = 0; this.world.waterfallMusic?.destroy(); this.world.waterfallMusic = null; this.kid?.destroy(); this.undyne?.destroy(); this.kid = this.undyne = null; this.locked = false; this.stage = 'done'; this.world.release(); this.world.updateCamera(); }
  destroy() { if (this.stage === 'choice' && this.world.waterfallMusic?.isPaused) { this.world.waterfallMusic.destroy(); this.world.waterfallMusic = null; } this.removeEscapeDoors(); this.kid?.destroy(); this.undyne?.destroy(); if (this.world.flags[17] === 1) this.world.flags[17] = 0; }
}
