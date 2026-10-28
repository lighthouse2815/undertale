const SPEECH = [
  [' WHAT THE HECK!', " THAT'S MY\n SPECIAL ATTACK!"],
  [' HEY!\n YOU STUPID DOG!'],
  [' DO YOU HEAR\n ME!?', ' STOP MUNCHING ON\n THAT BONE!!!'],
  [' HEY!!!\n WHAT ARE YOU\n DOING!!!', ' COME BACK HERE\n WITH MY SPECIAL\n ATTACK!!!'],
  [' ...', ' OH WELL.', " I'LL JUST USE\n A REALLY COOL\n REGULAR ATTACK."]
];

export function loadPapyrusSpecialAssets(scene) {
  const base = new URL('../assets/', import.meta.url);
  for (const [key, count] of [['spr_tobydogeat', 8], ['spr_tobydogsurprise', 2], ['spr_tobydogscoot', 2]]) {
    for (let i = 0; i < count; i++) if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  }
}

// Alarm 7: con chó ăn đòn đặc biệt, Papyrus nói và chó bỏ chạy.
export class PapyrusSpecialIntro {
  constructor(scene, onSpeech) {
    this.scene = scene; this.onSpeech = onSpeech; this.bullets = []; this.frames = 0; this.stage = -1; this.wait = 80; this.speaking = false;
    scene.soulMovement = 2; scene.soulJumpStage = 2; scene.soulVSpeed = -1;
    scene.arena.setPosition(96, 125).setSize(160, 67.5);
    this.clip = scene.add.graphics().fillStyle(0xffffff).fillRect(96, 125, 160, 67.5).setVisible(false); this.mask = this.clip.createGeometryMask();
    this.dog = scene.add.image(221, 172.5, 'spr_tobydogeat:0').setOrigin(0).setMask(this.mask); this.dogFrame = 0;
  }
  step() {
    if (this.stage >= SPEECH.length) return true;
    this.frames++;
    if (this.stage < 1 || this.stage >= 3) this.dogFrame += .2;
    if (this.stage >= 3) this.dog.x += .5;
    const key = this.stage < 1 ? 'spr_tobydogeat' : this.stage < 3 ? 'spr_tobydogsurprise' : 'spr_tobydogscoot';
    const frame = this.stage === 1 ? 0 : this.stage === 2 ? 1 : Math.floor(this.dogFrame) % (this.stage < 1 ? 8 : 2);
    this.dog.setTexture(`${key}:${frame}`);
    if (this.speaking || --this.wait > 0) return false;
    this.stage++;
    if (this.stage === SPEECH.length) return true;
    if (this.stage === 1 || this.stage === 3) this.dogFrame = 0;
    if (this.stage === 4) { this.scene.arena.setPosition(96, 125).setSize(125, 67.5); this.clip.clear().fillStyle(0xffffff).fillRect(96, 125, 125, 67.5); }
    this.speaking = true; this.onSpeech(SPEECH[this.stage], () => { this.speaking = false; this.wait = 2; });
    return false;
  }
  destroy() { this.dog.destroy(); this.mask.destroy(); this.clip.destroy(); }
}
