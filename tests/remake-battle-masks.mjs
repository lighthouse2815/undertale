import assert from 'node:assert/strict';

export async function testBattleMasks(page) {
  const open = async (monster) => {
    await page.evaluate(async (monster) => {
      const world = __remake.scene;
      world.flags = {}; world.hp = 20; world.maxHp = 20; world.lv = 1;
      world.armorDefense = 0; world.inventory = [];
      await world.openRoom('room_area1'); __remake.startBattle(monster);
    }, monster);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.music?.isPlaying);
  };
  await open('froggit');
  const ordinary = await page.evaluate(async () => {
    const { RuinsWave } = await import(new URL('src/ruins-waves.mjs', location.href).href);
    const scene = __remake.scene;
    scene.soul.setPosition(150, 150);
    const wave = new RuinsWave(scene, 'flies'); wave.next = Infinity;
    const bullet = wave.add('spr_flybullet', 294, 294, {});
    const pixel = (x, y) => scene.textures.getPixel(x, y, 'spr_heart:mask');
    const blackAlpha = pixel(0, 0).alpha, black = pixel(0, 0).red, white = pixel(7, 7).red;
    const blackCorner = wave.touchesHeart(bullet);
    scene.hp = 20; scene.invFrames = 0; wave.step();
    const safeHp = scene.hp;
    bullet.x = 301; bullet.y = 301; // Điểm (6,6) của ruồi chạm (7,7) của tim.
    const center = wave.touchesHeart(bullet); wave.step();
    const hitHp = scene.hp;
    wave.add('spr_flybullet', 301, 301, {}); wave.step();
    const invincibleHp = scene.hp;
    wave.destroy();
    const frog = new RuinsWave(scene, 'leap'), leap = frog.bullets[0];
    leap.x = 275; leap.y = 308; // BBox chồng lên tim nhưng chỉ vùng đen của mask chạm nhau.
    const frogBlank = frog.touchesHeart(leap);
    leap.x = 280;
    const frogBody = frog.touchesHeart(leap);
    frog.destroy(); scene.finishBattle();
    return { blackAlpha, black, white, blackCorner, safeHp, center, hitHp, invincibleHp, frogBlank, frogBody };
  });
  assert.deepEqual(ordinary, { blackAlpha: 255, black: 0, white: 255, blackCorner: false, safeHp: 20,
    center: true, hitHp: 18, invincibleHp: 18, frogBlank: false, frogBody: true });
  await page.waitForFunction(() => __remake.phase === 'running');

  await open('napstablook');
  const ghost = await page.evaluate(async () => {
    const { NapstablookWave } = await import(new URL('src/napstablook-waves.mjs', location.href).href);
    const scene = __remake.scene;
    scene.soul.setPosition(150, 150);
    const wave = new NapstablookWave(scene, 'stream'); wave.next = Infinity;
    const checks = [];
    // Kiểm tra hình thật với cả phép xoay/co giãn đang dùng trong generator.
    for (const [sprite, center, frames] of [['spr_teardrop', [5.5, 7], 1], ['spr_streambullet', [8.5, 8], 2]]) {
      const bullet = wave.add(sprite, 0, 0, {});
      for (let frame = 0; frame < frames; frame++) {
        bullet.image.setTexture(`${sprite}:${frame}`);
        for (const scale of [.8, 1, 1.2]) for (const rotation of [0, Math.PI / 2, -Math.PI / 2, Math.PI / 3]) {
          bullet.scale = scale; bullet.rotation = rotation;
          for (const [x, y, expected] of [[0, 15, false], [7, 7, true]]) {
            bullet.x = 300 + x - scale * (center[0] * Math.cos(rotation) - center[1] * Math.sin(rotation));
            bullet.y = 300 + y - scale * (center[0] * Math.sin(rotation) + center[1] * Math.cos(rotation));
            checks.push({ sprite, frame, scale, rotation, expected, hit: wave.touchesHeart(bullet) });
          }
        }
      }
    }
    const secondMaskLoaded = scene.textures.exists('spr_streambullet:mask:1');
    const { maskContains } = await import(new URL('src/collision-mask.mjs', location.href).href);
    let cachedMasksMatch = true;
    for (const key of ['spr_heart:mask', 'spr_teardrop:mask', 'spr_streambullet:mask', 'spr_streambullet:mask:1']) {
      const image = scene.textures.get(key).getSourceImage();
      for (let x = -1; x <= image.width; x++) for (let y = -1; y <= image.height; y++) cachedMasksMatch &&= maskContains(scene, key, x, y) === (scene.textures.getPixel(x, y, key)?.red > 0);
    }
    wave.destroy();
    // Đi qua step thật: đạn sượt góc đen không mất HP; chạm vùng trắng mới trừ máu.
    const damageWave = new NapstablookWave(scene, 'stream'); damageWave.next = Infinity;
    const bullet = damageWave.add('spr_streambullet', 291.5, 307, { scale: 1, rotation: 0, gravity: 0, damage: 5 });
    scene.hp = 20; scene.invFrames = 0; damageWave.step();
    const safeHp = scene.hp;
    bullet.x = 298.5; bullet.y = 299; damageWave.step();
    const hitHp = scene.hp;
    damageWave.destroy(); scene.finishBattle();
    return { checks, secondMaskLoaded, cachedMasksMatch, safeHp, hitHp };
  });
  assert.equal(ghost.secondMaskLoaded, true);
  assert.equal(ghost.cachedMasksMatch, true);
  for (const check of ghost.checks) assert.equal(check.hit, check.expected, JSON.stringify(check));
  assert.deepEqual({ safeHp: ghost.safeHp, hitHp: ghost.hitHp }, { safeHp: 20, hitHp: 17 });
  await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ mask chiến đấu thật: góc đen của tim, ruồi/ếch, nước mắt/dòng nước xoay/co giãn, hai mask khung hình, HP và bất tử');
}
