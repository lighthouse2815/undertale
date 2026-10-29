import assert from 'node:assert/strict';

export async function testHotlandLabObjects(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot, inventory: w.inventory, kills: w.kills });
    w.flags = {}; w.plot = 127; w.inventory = []; w.kills = 0; await w.openRoom('room_fire_lab1', 'obj_markerC'); return snapshot;
  });
  const read = (name, x) => page.evaluate(([name,x]) => {
    const w = __remake.scene, e = w.hotlandLabObjects.objects.find(e => e.item.ObjectName === name && (x === undefined || e.item.X === x));
    w.player.setPosition(e.item.X + (e.sprite.MarginLeft + e.sprite.MarginRight) / 2 - e.sprite.OriginX - 10, e.item.Y + e.sprite.MarginBottom - e.sprite.OriginY - 8); w.player.facing = 'u'; w.tryInteract();
    return w.dialogue?.lines;
  }, [name,x]);
  const drain = () => page.evaluate(() => { const w = __remake.scene; while (w.dialogue && !w.dialogue.choice) w.advanceDialogue(); });
  const choose = value => page.evaluate(value => { const w = __remake.scene; w.dialogue.choice.index = value; w.dialogue.choice.readyAt = 0; w.advanceDialogue(); return w.dialogue?.lines[0]; }, value);
  assert.match((await read('obj_napstafridge'))[0], /instant noodles and soda/); await drain();
  assert.match(await choose(1), /stay healthy/); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory, __remake.scene.flags[109] ?? 0]), [[],0]);
  await page.evaluate(() => { __remake.scene.inventory = Array(8).fill(1); });
  await read('obj_napstafridge'); await drain(); assert.match(await choose(0), /carrying too much/); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.flags[109] ?? 0), 0);
  await page.evaluate(() => { __remake.scene.inventory = []; });
  await read('obj_napstafridge'); await drain(); assert.match(await choose(0), /got the Instant Noodles/); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory, __remake.scene.flags[109]]), [[36],1]);
  await read('obj_napstafridge'); await drain(); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  assert.match((await read('obj_dogfoodbag'))[0], /half-full/); await drain();
  await page.evaluate(() => { const w = __remake.scene; w.kills = 25; Object.assign(w.flags,{52:1,53:1,54:1,55:1}); });
  assert.equal((await read('obj_dogfoodbag')).length, 2); await drain();
  await page.evaluate(() => { __remake.scene.plot = 122; });
  assert.match((await read('obj_napstafridge'))[0], /too dark/); await drain();
  await page.evaluate(() => { __remake.scene.plot = 127; __remake.scene.flags[493] = 10; });
  assert.equal((await read('obj_undynetrash')).length, 4); await drain();
  const reload = await page.evaluate(async () => {
    const w = __remake.scene, old = localStorage.getItem('undertale-remake-temp-v1');
    try { w.saveGame(true); w.flags = {}; w.inventory = []; await w.restoreGame(true); return [w.inventory,w.flags[109]]; }
    finally { if (old===null) localStorage.removeItem('undertale-remake-temp-v1'); else localStorage.setItem('undertale-remake-temp-v1',old); }
  });
  assert.deepEqual(reload, [[36],1]);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_fire_lab2','obj_markerA'); });
  for (const [name,x,length,pattern] of [['obj_readable_room1',740,1,/Scientific/],['obj_readable_room3',680,2,/VHSes/],['obj_readable_room5',57,2,/promo poster/],['obj_readable_room5',165,2,/invention/],['obj_readable_room5',483,1,/Pink goop/]]) {
    const lines = await read(name,x); assert.equal(lines.length,length); assert.match(lines[0],pattern); await drain();
  }
  for (const [name,x,pattern] of [['obj_readable_room2',720,/giant/],['obj_readable_room4',640,/comic/],['obj_readable_room5',580,/comic/]]) {
    await read(name,x); const yes = await choose(0); assert.match(yes, /look inside/); const pages = await page.evaluate(() => __remake.scene.dialogue.lines); assert.ok(pages.some(line=>pattern.test(line))); await drain();
  }
  await page.evaluate(previous => Object.assign(__remake.scene,previous),previous);
  console.log('✓ Lab: tủ mì/túi đầy/từ chối/lưu nạp, đồ vật theo tuyến và ba kệ Human History');
}
