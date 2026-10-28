import assert from 'node:assert/strict';
export async function testWaterfallUndyneKid(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = { 17: 1 }; w.plot = 108; await w.openRoom('room_water8');
    const base = '/assets/'; for (const [key, count] of Object.entries({ spr_undynea_r: 4, spr_undynea_l: 4, spr_undynea_r_raise: 6, spr_undynea_r_raiseup: 14, spr_mkid_r: 4, spr_mkid_l: 4, spr_mkid_trip_r: 20 })) for (let i = 0; i < count; i++) if (!w.textures.exists(`${key}:${i}`)) w.load.image(`${key}:${i}`, `${base}sprites/${key}/${key}_${i}.png`);
    for (const [key, ext] of [['snd_grab', 'wav'], ['mus_ambientwater', 'ogg']]) if (!w.cache.audio.exists(key)) w.load.audio(key, `${base}sounds/${key}/${key}.${ext}`);
    if (w.load.list.size) await new Promise(resolve => { w.load.once('complete', resolve); w.load.start(); });
    w.scene.pause(); const { WaterfallUndyneKid } = await import('/src/waterfall-undyne-kid.mjs'); w.chaseMusic = w.sound.add('mus_undynefast', { loop: true }); w.chaseMusic.play(); w.kidFixture = new WaterfallUndyneKid(w, { undyne: w.add.image(-40, 90, 'spr_undyne_starkd:0'), kid: w.add.image(360, 100, 'spr_mkid_r:0'), cleanup: () => { w.cleanedKid = true; } });
  });
  const result = await page.evaluate(() => { const w = __remake.scene, c = w.kidFixture, seen = []; for (let i = 0; i < 1500 && c.stage !== 'waitPlayer'; i++) { if (!seen.includes(c.stage)) seen.push(c.stage); c.step(); }
    const wait = [c.stage, c.locked, w.flags[17]]; w.player.setPosition(210, 120); for (let i = 0; i < 300 && c.stage !== 'talk'; i++) c.step(); const lines = w.dialogue.lines.length;
    while (w.dialogue) w.advanceDialogue(); for (let i = 0; i < 300 && c.stage !== 'done'; i++) c.step(); return { seen, wait, lines, end: [c.stage, c.locked, w.plot, w.flags[15], w.flags[16], w.cleanedKid] }; });
  assert.deepEqual(result.wait, ['waitPlayer', false, 0]); assert.ok(result.seen.includes('lift')); assert.ok(result.seen.includes('leave')); assert.equal(result.lines, 7);
  assert.deepEqual(result.end, ['done', false, 110, 0, 0, true]);
  const alternate = await page.evaluate(() => { const w = __remake.scene, c = w.kidFixture; w.flags[284] = 1; c.stage = 'kidPause3'; c.frames = 19; c.step(); const count = w.dialogue.lines.length; while (w.dialogue) w.advanceDialogue(); return count; });
  assert.equal(alternate, 8);
  await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water1'); });
  console.log('✓ Cảnh Undyne và Monster Kid: hoạt ảnh, thoại, khóa và plot 110');
}
