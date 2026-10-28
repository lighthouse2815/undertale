import { PapyrusBones } from './papyrus-bones.mjs';

// obj_blueattackgen: xương xanh, nhạc lắng xuống, đổi tim và đợi lời Papyrus.
export class PapyrusBlueAttack extends PapyrusBones {
  constructor(scene, onSpeech) {
    super(scene); this.onSpeech = onSpeech; this.timer = 300; this.alarms = [20, 0, 0, 0, 0, 0, 0];
    this.baseVolume = scene.music.volume; this.volume = 1; this.phase = 'rain'; this.speechFinished = false;
  }
  step() {
    if (this.captured) return false;
    const s = this.scene, b = this.border;
    for (let i = 0; i < this.alarms.length; i++) {
      if (this.alarms[i] <= 0 || --this.alarms[i] !== 0) continue;
      if (i === 0) {
        if (this.timer < 600) {
          const height = Math.random() * 70, top = Math.floor(Math.random() * 2) === 1;
          this.add(b.right + 20, top ? b.top + 40 + height : b.bottom - 40 - height, { vx: -3 - Math.random() * 3, top, blue: true, damage: 1 });
          this.alarms[0] = Math.trunc(5 + Math.random() * 20);
        } else this.alarms[1] = 20;
        this.timer += 37;
      } else if (i === 1) { this.alarms[3] = 2; this.alarms[2] = 100; }
      else if (i === 2) { s.soulMovement = 2; s.soulJumpStage = 2; s.soulVSpeed = -2; s.sound.play('snd_bell'); this.alarms[4] = 2; this.phase = 'fall'; }
      else if (i === 3) {
        this.volume -= .05; s.music.setVolume(Math.max(0, this.baseVolume * this.volume));
        if (this.volume < .06) s.music.stop(); else this.alarms[3] = 2;
      } else if (i === 4) {
        if (s.soul.y * 2 > b.bottom - 60) {
          const right = s.soul.x * 2 > (b.left + b.right) / 2;
          this.add(right ? b.right + 10 : b.left - 10, b.bottom - 20, { vx: right ? -6 : 6 }); this.alarms[5] = 2; this.phase = 'lastBone';
        } else this.alarms[4] = 2;
      } else if (i === 5) {
        if (!this.bullets.length && s.invFrames < 1) { this.phase = 'speech'; this.onSpeech(() => { this.speechFinished = true; }); this.alarms[6] = 2; }
        else this.alarms[5] = 2;
      } else if (i === 6) {
        if (this.speechFinished) { this.phase = 'complete'; return true; }
        this.alarms[6] = 2;
      }
    }
    super.step();
    if (this.timer > 0) this.timer--;
    return false;
  }
}
