import assert from 'node:assert/strict';

export async function testPapyrusFogEncounter(page) {
  const open = (flags = {}, plot = 65) => page.evaluate(async ({flags, plot}) => {
    const w = __remake.game.scene.getScene('World'); w.flags = flags; w.plot = plot; w.hp = 1; w.maxHp = 20;
    await w.openRoom('room_fogroom'); w.scene.pause(); w.player.setPosition(480, 120);
    const e = w.papyrusFogEncounter; if (!e.checkTrigger()) throw new Error('Không kích hoạt cảnh');
    for (let i = 0; i < 300 && e.stage !== 'talking'; i++) e.step();
  }, {flags, plot});
  const close = () => page.evaluate(() => { const w = __remake.game.scene.getScene('World'); while (w.dialogue && !w.dialogue.choice) w.advanceDialogue(); });
  const choice = (index) => page.evaluate((index) => { const w = __remake.game.scene.getScene('World'); w.dialogue.choice.index = index; w.dialogue.choice.readyAt = 0; w.advanceDialogue(); }, index);
  const stepTo = (stages, limit = 1000) => page.evaluate(({stages, limit}) => { const e = __remake.game.scene.getScene('World').papyrusFogEncounter; for (let i = 0; i < limit && !stages.includes(e.stage); i++) e.step(); return e.stage; }, {stages, limit});

  await open();
  assert.deepEqual(await page.evaluate(() => {const w=__remake.scene,e=w.papyrusFogEncounter;return [e.locked,e.stage,w.dialogue.lines.length,w.hp,w.maxHp,w.player.visible,e.chara.alpha,e.pap.alpha];}), [true,'talking',25,20,20,false,.9,.9]);
  await close(); assert.equal(await stepTo(['beforeBattle']), 'beforeBattle');
  await page.evaluate(() => {const w=__remake.scene,e=w.papyrusFogEncounter;w.scene.resume();for(let i=0;i<40;i++)e.step();});
  await page.waitForFunction(() => __remake.scene?.scene.key === 'PapyrusBattle' && __remake.scene.mode === 'menu');
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[67]), -1);
  await page.evaluate(() => __remake.scene.finishPapyrus(false));
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.key === 'World');
  await page.evaluate(() => __remake.scene.scene.pause());
  assert.equal(await stepTo(['talking']), 'talking');
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /NYOO/);
  await close(); await choice(0); await close(); await close(); await close();
  assert.equal(await stepTo(['done']), 'done');
  assert.deepEqual(await page.evaluate(() => {const w=__remake.scene;return [w.plot,w.flags[27],w.flags[88],w.papyrusFogEncounter.locked,w.player.visible];}), [101,1,1,false,true]);
  await page.evaluate(() => __remake.scene.scene.resume());

  await open({67:-3}); await close(); await choice(1); await close();
  assert.equal(await stepTo(['talking']), 'talking');
  assert.deepEqual(await page.evaluate(() => {const w=__remake.scene;return [w.flags[67],w.flags[68],w.snowdinFog.frozen,w.dialogue.lines[0]];}), [0,1,true,'NYOO HOO HOO...']);
  await page.evaluate(() => {const w=__remake.scene;w.dialogue.onClose=null;while(w.dialogue)w.advanceDialogue();w.scene.resume();});

  await open({67:-1}); await close();
  await page.evaluate(() => {const w=__remake.scene,e=w.papyrusFogEncounter; e.wait('battle'); w.flags[68]=1; w.scene.resume(); e.step();});
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_garage');

  await open({26:7}); await close();
  for (const n of [13,7,4]) { assert.equal(await stepTo(['talking']), 'talking'); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), n); await close(); }
  assert.equal(await stepTo(['beforeBattle']), 'beforeBattle');
  await page.evaluate(() => {const w=__remake.scene;w.scene.resume();});

  await page.evaluate(async () => {const w=__remake.scene;w.flags={};w.plot=101;await w.openRoom('room_tundra_town');});
  assert.deepEqual(await page.evaluate(() => __remake.scene.doors.filter(d=>d.destination==='room_fogroom').map(d=>[d.marker,d.musicFade])), Array(4).fill(['obj_markerX',true]));
  await page.evaluate(() => {const w=__remake.scene;w.player.setPosition(2680,120);});
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_fogroom');
  assert.deepEqual(await page.evaluate(() => {const w=__remake.scene;return [w.papyrusFogEncounter.stage,w.doors.find(d=>d.destination==='room_tundra_town').marker];}), ['done','obj_markerX']);
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_town');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x,__remake.scene.player.y]), [2680,120]);
  await page.evaluate(async () => {const w=__remake.scene;w.townMusic?.destroy();w.townMusic=null;w.flags={7:1};w.plot=101;await w.openRoom('room_tundra_town');w.fogTestMusic=w.townMusic;w.player.setPosition(2680,120);});
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_fogroom');
  assert.equal(await page.evaluate(() => __remake.scene.townMusic === __remake.scene.fogTestMusic && __remake.scene.townMusic.key === 'mus_reunited'), true);
  console.log('✓ Phòng sương Papyrus: camera, lời, trận thật/tha, từ chối lần ba, tuyến giết và cửa thị trấn');
}
