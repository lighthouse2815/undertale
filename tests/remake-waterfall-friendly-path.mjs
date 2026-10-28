import assert from 'node:assert/strict';
export async function testWaterfallFriendlyPath(page) {
  for (const ending of [false, true]) {
    await page.evaluate(async ending => { const w = __remake.scene; w.flags = ending ? {7:1} : {}; w.plot = 116; if (ending) await w.openRoom('room_tundra_town'); await w.openRoom('room_water_bird'); w.player.setPosition(290,100); window.birdHubMusic = ending ? w.townMusic : w.waterfallMusic; }, ending);
    await page.waitForFunction(() => __remake.scene.scene.isActive());
    await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
    await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_friendlyhub');
    const there = await page.evaluate(ending => { const w = __remake.scene, music = ending ? w.townMusic : w.waterfallMusic; return [w.player.x,w.player.y,music.key,music === window.birdHubMusic,music.volume]; }, ending);
    assert.deepEqual(there.slice(0,4), [10,100,ending ? 'mus_reunited' : 'mus_waterquiet',ending]); assert.ok(there[4] > 0);
    await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
    await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_bird');
    const back = await page.evaluate(ending => { const w = __remake.scene, music = ending ? w.townMusic : w.waterfallMusic; return [w.player.x,w.player.y,music.key,music === window.birdHubMusic,music.volume]; }, ending);
    assert.deepEqual(back.slice(0,4), [290,100,ending ? 'mus_reunited' : 'mus_waterquiet',ending]); assert.ok(back[4] > 0);
  }
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Cửa phòng chim ↔ Quiet Area, marker và nhạc');
}
