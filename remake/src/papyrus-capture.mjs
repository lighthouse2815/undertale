const LAUGH = ' NYEH HEH HEH HEH\n HEH HEH HEH!!!';
const SPEECH = {
  '-1': [" YOU'RE TOO WEAK!!\n I WAS EASILY ABLE\n TO CAPTURE YOU!!!", ' I WILL NOW SEND\n YOU TO THE\n CAPTURE ZONE!!', ' OR, AS SANS\n CALLS IT...', ' OUR GARAGE???', " YOU'RE IN THE\n DOGHOUSE NOW!", LAUGH],
  '-2': [' WELL!!! YOU MAY\n HAVE CLEVERLY\n ESCAPED FROM\n JAIL BEFORE...', " BUT THIS TIME,\n I'VE UPGRADED\n THE FACILITIES.", ' NOT ONLY WILL\n YOU BE\n TRAPPED...', " BUT YOU WON'T\n EVEN WANT\n TO LEAVE!!!", LAUGH],
  '-3': [' YOU ARE...\n PERSISTENT!', ' BUT!\n IT JUST WON\'T\n WORK ON ME!', ' I AM THE\n PERSISTENTEST!', ' AND IF YOU\n THINK YOU ARE\n PERSISTENESTER...', ' THAT IS WRONG!\n GRAMATICALLY\n WRONG!', ' BECAUSE THE\n CORRECT FORM\n WOULD BE...', ' NOT AS\n PERSISTENTEST AS\n PAPYRUS, THE\n PERSISTENTESTEST!', ' I HOPE YOU\n ENJOYED THIS\n LESSON.', LAUGH]
};

// blt_sizebone Alarm 2–6: lời bắt, fade nhạc và hồi HP trước khi về phòng.
export class PapyrusCapture {
  constructor(scene, onSpeech, onReturn) {
    this.scene = scene; this.onSpeech = onSpeech; this.onReturn = onReturn; this.bullets = [];
    this.alarms = [2, 0, 0, 0, 0]; this.volume = scene.music.volume; this.finishedSpeech = false; this.finished = false;
  }
  step() {
    if (this.finished) return true;
    const s = this.scene;
    for (let i = 0; i < this.alarms.length; i++) {
      if (this.alarms[i] <= 0 || --this.alarms[i] !== 0) continue;
      if (i === 0) { this.alarms[1] = 2; this.alarms[2] = 40; }
      else if (i === 1) {
        if (this.volume > .01) { s.music.setVolume(this.volume); this.volume -= .01; this.alarms[1] = 1; }
        else s.music.stop();
      } else if (i === 2) {
        const pages = SPEECH[s.previousScene.flags[67]] ?? [' THIS IS AN ERROR\n MESSAGE.\n REALLY!!!'];
        this.onSpeech(pages, () => { this.finishedSpeech = true; }); this.alarms[3] = 1;
      } else if (i === 3) {
        if (!this.finishedSpeech) this.alarms[3] = 2;
        else { s.cameras.main.fadeOut(13 * 1000 / 30); s.sound.play('snd_txtasg'); this.alarms[4] = 50; }
      } else { s.hp = s.maxHp; s.refreshHp(); this.finished = true; this.onReturn(); return true; }
    }
    return false;
  }
  destroy() {}
}
