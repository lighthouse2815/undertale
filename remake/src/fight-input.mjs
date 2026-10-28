const GLOVE_SPRITES = { spr_regfist: 5, spr_hyperfist: 6, spr_pressz_press: 1 };

export function loadGloveAssets(scene) {
  const world = scene.game.scene.getScene('World');
  if (world.weapon !== 14 && !world.inventory.includes(14)) return;
  const base = new URL('../assets/', import.meta.url);
  for (const [key, count] of Object.entries(GLOVE_SPRITES)) for (let i = 0; i < count; i++)
    if (!scene.textures.exists(`${key}:${i}`)) scene.load.image(`${key}:${i}`, new URL(`sprites/${key}/${key}_${i}.png`, base).href);
  for (const key of ['snd_punchweak', 'snd_punchstrong']) if (!scene.cache.audio.exists(key))
    scene.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
}

// obj_targetchoice/obj_targetchoicefist: dừng thanh, rồi bốn lần Z trong 30 frame.
export function fightInput(scene, delta, defense) {
  const glove = scene.previousScene.weapon === 14;
  if (!scene.glovePunch) {
    scene.attackX += scene.attackSpeed * delta; scene.bar.x = scene.attackX;
    if (scene.attackX > 300) return { miss: true, damage: 0 };
    if (!scene.confirmPressed) return null;
    const distance = Math.abs(scene.attackX + 3.5 - 159.5) * 2 || 1;
    const attack = scene.previousScene.lv === 20 ? 99 : 8 + scene.previousScene.lv * 2;
    const base = attack + (scene.attackBonus ?? 0) + (scene.previousScene.weaponStrength ?? 0) - defense + Math.random() * 2;
    const damage = Math.round(base * (distance <= 12 ? glove ? 2.1 : 2.2 : (562 - distance) / 562 * 2));
    if (!glove) return { damage };
    const enemy = scene.enemy.getBounds();
    const prompt = scene.add.image(enemy.centerX, enemy.centerY, 'spr_pressz_press:0').setScale(.5).setVisible(false);
    scene.glovePunch = { damage, frames: 0, punches: 0, elapsed: 0, pending: false, prompt, enemy, flash: 3 };
    return null;
  }
  const punch = scene.glovePunch;
  punch.pending ||= scene.confirmPressed;
  punch.elapsed = Math.min(200, punch.elapsed + delta);
  while (punch.elapsed >= 1000 / 30) {
    punch.elapsed -= 1000 / 30; punch.frames++;
    scene.bar.setTexture(`spr_targetchoice:${Math.floor(punch.frames * .4) % 2}`);
    if (--punch.flash === 0) { punch.prompt.setVisible(!punch.prompt.visible); punch.flash = 6; }
    if (punch.pending && punch.punches < 4) {
      punch.pending = false; punch.punches++; punch.prompt.setVisible(false); punch.flash = 7;
      const strong = punch.punches === 4, key = strong ? 'spr_hyperfist' : 'spr_regfist';
      if (!scene.anims.exists(key)) scene.anims.create({ key, frameRate: 15,
        frames: Array.from({ length: GLOVE_SPRITES[key] }, (_, i) => ({ key: `${key}:${i}` })) });
      const effect = scene.add.sprite(strong ? punch.enemy.centerX : punch.enemy.x + Math.random() * punch.enemy.width,
        strong ? punch.enemy.centerY : punch.enemy.y + Math.random() * punch.enemy.height, `${key}:0`).setScale(.5);
      effect.once('animationcomplete', () => effect.destroy()); effect.play(key);
      scene.sound.play(strong ? 'snd_punchstrong' : 'snd_punchweak');
      if (strong) scene.cameras.main.shake(3 * 1000 / 30, .006);
    }
    if (punch.frames >= 30 || punch.punches === 4) {
      punch.prompt.destroy();
      return { damage: Math.ceil(punch.damage * punch.punches / 4), miss: punch.punches === 0 };
    }
  }
  return null;
}
