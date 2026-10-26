import assert from 'node:assert/strict';

export async function testTorielBedroom(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(70); };
  const place = (x, y, facing = 'u') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing; world.interactionCooldown = 0;
  }, [x, y, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const read = async (x, y, expression, facing = 'u') => {
    await place(x, y, facing); await key('z');
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), expression);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 19; world.flags = {}; await world.openRoom('room_torhouse3', 'obj_markerD');
    world.bedroomTracks = [...world.houseMusic];
  });
  await place(360, 140); await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.room === 'room_torielroom' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [110, 202]);
  assert.ok(await page.evaluate(() => __remake.scene.houseMusic.every((sound, i) => sound === __remake.scene.bedroomTracks[i])));
  await read(65, 178, /regular old bucket/); await drain();
  await read(142, 60, /encyclopedia/); assert.equal(await page.evaluate(() => __remake.scene.flags[50]), 1);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 3); await drain();
  await read(76, 113, /bigger than/); await drain();
  await read(212, 188, /tsundere/); await drain();
  await read(94, 164, /Chairiel/); await drain();
  await read(217, 54, /Scandalous/); await drain();
  await read(217, 54, /can't stop looking/); await drain();
  await read(70, 148, /Read the circled passage/);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.choice.index), 0);
  await page.waitForTimeout(120); await key('ArrowRight'); await key('z');
  assert.equal(await page.evaluate(() => !!__remake.scene.dialogue), false, 'No đóng nhật ký.');
  await read(70, 148, /Read the circled passage/); await page.waitForTimeout(120); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 4);
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[2]), /BONELY/); await drain();
  // Hai đồ vật hiện hữu phải chặn chân và có độ sâu theo vị trí.
  for (const name of ['obj_cactus', 'obj_smallchair']) {
    assert.ok(await page.evaluate((name) => __remake.scene.colliders.some((body) => body.objectName === name && !body.disabled), name));
  }
  await place(192, 190, 'r'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x < 212), 'Xương rồng chặn đường đi.');
  await page.evaluate(() => __remake.scene.saveGame());
  await page.evaluate(async () => { __remake.scene.flags = {}; await __remake.scene.restoreGame(); });
  assert.equal(await page.evaluate(() => __remake.scene.flags[50]), 1);
  await read(217, 54, /Scandalous/); await drain();
  await page.evaluate(() => { __remake.scene.flags[7] = 1; });
  await read(76, 113, /Earlier/); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2); await drain();
  await read(212, 188, /waiting for you/); await drain();
  await read(94, 164, /future/); await drain();
  await place(110, 202, 'd'); await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.room === 'room_torhouse3' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [360, 136]);
  await read(687, 140, /water sausage/); await drain();
  console.log('✓ phòng Toriel: cửa hai chiều/nhạc liên tục, nhật ký Yes-No, tất/đọc lại, sách/cờ 50/cây hành lang, giường/cactus/Chairiel/collider, nhánh kết thúc và lưu nạp');
}
