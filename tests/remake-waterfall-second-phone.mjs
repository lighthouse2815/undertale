import assert from 'node:assert/strict';
import { waterfallPapyrusSecondCall } from '../remake/src/waterfall-papyrus-second-call.mjs';
export async function testWaterfallSecondPhone(page) {
  for (const first of [4, 12]) for (const choice of [0, 1]) {
    const pages = waterfallPapyrusSecondCall({75:4,77:first,76:choice});
    assert.match(pages[0].text, /Ring/); assert.match(pages.at(-1).text, /Click/);
    assert.ok(pages.every(p => !/\\[\[A-Z]/.test(p.text)));
    assert.ok(pages.some(p => /GROSS BANDAGE/.test(p.text)));
    if (first === 12 && choice === 1) assert.ok(pages.some(p => /FADED RIBBON/.test(p.text)));
  }
  await page.evaluate(async () => { const w=__remake.scene; w.flags={75:4,77:12,76:1}; w.plot=110; await w.openRoom('room_water12'); w.waterfallEncounter.disabled=true; w.player.setPosition(590,660); });
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[354], __remake.scene.waterfallPapyrusPhone.flowey.x, __remake.scene.dialogue.lines.length]),[1,380,28]);
  await page.evaluate(() => { const w=__remake.scene; while(w.dialogue) w.advanceDialogue(); });
  await page.evaluate(async () => { const w=__remake.scene; await w.openRoom('room_water12'); w.player.setPosition(620,660); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallPapyrusPhone.checkTrigger()), false);
  await page.evaluate(async () => { const w=__remake.scene; w.flags={67:1}; await w.openRoom('room_water12'); w.player.setPosition(620,660); });
  assert.deepEqual(await page.evaluate(() => { const w=__remake.scene; return [w.waterfallPapyrusPhone.checkTrigger(),w.flags[354],!!w.waterfallPapyrusPhone.flowey,!!w.dialogue]; }),[false,1,true,false]);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Cuộc gọi Papyrus thứ hai: bốn nhánh, Flowey và điều kiện');
}
