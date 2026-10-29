import assert from 'node:assert/strict';

export async function testWaterfallKidBridge(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 119; await w.openRoom('room_water20'); window.kidBridgeModule = await import('/src/waterfall-kid-bridge.mjs'); w.scene.pause(); });
  for (const branch of ['rescue', 'fall']) {
    const result = await page.evaluate(branch => {
      const w = __remake.scene; w.flags = {}; w.plot = 119; w.player.setPosition(400, 100); w.player.facing = 'r'; w.updateCamera();
      const bridge = new kidBridgeModule.WaterfallKidBridge(w), seen = []; const triggered = bridge.checkTrigger();
      for (let i = 0; i < 6000 && bridge.stage !== 'done'; i++) {
        if (seen.at(-1) !== bridge.stage) seen.push(bridge.stage);
        if (w.dialogue) while (w.dialogue) w.advanceDialogue();
        if (bridge.stage === 'choice' && branch === 'rescue') { w.player.setPosition(bridge.kid.x, bridge.kid.y + 11); w.player.facing = 'u'; if (!bridge.interact()) throw Error('Không thể cứu Monster Kid'); }
        bridge.step();
      }
      const output = { triggered, seen, stage: bridge.stage, plot: w.plot, flag: w.flags[98], menu: w.flags[17], locked: bridge.locked }; bridge.destroy(); return output;
    }, branch);
    assert.equal(result.triggered, true); assert.equal(result.stage, 'done'); assert.equal(result.plot, 120); assert.equal(result.flag, branch === 'rescue' ? 1 : 2); assert.equal(result.menu, 0); assert.equal(result.locked, false);
    for (const stage of ['cameraLeft','approach1','approach2','trip','fall','undyneEnter','choice', ...(branch === 'rescue' ? ['rescueMove','undyneLeave','kidExit','cameraReturnRescue'] : ['fallFast','undyneJump','grabWait','cameraReturnFall'])]) assert.ok(result.seen.includes(stage), stage);
  }
  await page.waitForFunction(() => !__remake.scene.scene.isActive()); await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water19'); });
  console.log('✓ Cảnh Monster Kid: cứu và chờ rơi, hành động Undyne, plot/cờ');
}
