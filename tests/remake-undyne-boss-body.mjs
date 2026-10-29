import assert from 'node:assert/strict';

export async function testUndyneBossBody(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; await w.openRoom('room_water1'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  const result = await page.evaluate(async () => {
    const s = __remake.scene, m = await import('/src/undyne-boss-body.mjs'); m.loadUndyneBossBodyAssets(s);
    if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); });
    const body = new m.UndyneBossBody(s), start = body.parts.map(p => [p.x, p.y, p.depth]);
    body.emotion = 4; for (let i = 0; i < 4; i++) body.step();
    const motion = [body.parts[0].texture.key, body.parts[1].texture.key, body.parts[0].y, body.parts[6].y];
    body.destroy(); const cleaned = body.parts.every(p => !p.active); s.finishBattle(); return [start, motion, cleaned];
  });
  assert.deepEqual(result[0], [[145, 10, 30], [107, 8, 29], [131, 38, 28], [179, 49, 27], [144, 70, 26], [146, 43, 25], [144, 87, 24]]);
  assert.equal(result[1][0], 'spr_undyneb_face:4'); assert.equal(result[1][1], 'spr_undyneb_hair:1');
  assert.ok(Math.abs(result[1][2] - (10 + Math.sin(.8))) < 1e-9); assert.equal(result[1][3], 87); assert.equal(result[2], true);
  await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Undyne: vị trí, lớp và chuyển động cơ thể');
}
