import assert from 'node:assert/strict';

export async function testWaterfallSentryMusic(page) {
  const result = await page.evaluate(async () => {const w=__remake.game.scene.getScene('World');w.flags={};w.plot=101;await w.openRoom('room_water1');const ambient=w.waterfallMusic;await w.openRoom('room_water2');const muscle=w.waterfallMusic;await w.openRoom('room_water1');const next=w.waterfallMusic;return [ambient.key,ambient.pendingRemove,muscle.key,muscle.pendingRemove,next.key,next!==ambient];});
  assert.deepEqual(result,['mus_ambientwater',true,'mus_muscle',true,'mus_ambientwater',true]);
  await page.evaluate(async () => {const w=__remake.scene;w.flags={67:1};await w.openRoom('room_water2');});
  assert.equal(await page.evaluate(() => __remake.scene.waterfallMusic),null);
  const reunited=await page.evaluate(async () => {const w=__remake.scene;w.flags={7:1};await w.openRoom('room_tundra_town');const music=w.townMusic;await w.openRoom('room_water2');const same=w.townMusic===music;await w.openRoom('room_area1');return [music.key,same,music.pendingRemove];});
  assert.deepEqual(reunited,['mus_reunited',true,true]);
  console.log('✓ Nhạc trạm Waterfall: muscle/âm nước, tuyến giết, Reunited và dọn');
}
