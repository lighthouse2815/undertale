import assert from 'node:assert/strict';

export async function testWaterfallSave(page) {
  const open = (flags) => page.evaluate(async flags => {const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=101;w.hp=1;w.maxHp=20;await w.openRoom('room_water2');w.player.setPosition(164,92);w.player.facing='u';w.tryInteract();}, flags);
  const close = async () => {await page.evaluate(() => __remake.scene.advanceDialogue()); await page.waitForFunction(() => __remake.phase==='saving');};
  const leave = async () => {await page.keyboard.press('x');await page.waitForFunction(() => __remake.phase==='running');};
  for (const [flags,line,font] of [[{},/rushing water/,'fnt_maintext'],[{26:8,204:5},/13 left/,'fnt_maintext:red'],[{26:8,204:18},/Determination/,'fnt_maintext'],[{26:8,204:5,27:1},/rushing water/,'fnt_maintext'],[{26:16},/Determination/,'fnt_maintext']]) {
    await open(flags);assert.match(await page.evaluate(() => __remake.scene.dialogueText.text),line);assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font),font);assert.equal(await page.evaluate(() => __remake.scene.hp),20);await close();await leave();
  }
  await open({}); await close(); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.saved); assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text),'Waterfall - Checkpoint'); await leave();
  console.log('✓ SAVE Waterfall: lời thường/dân số/cờ, màu đỏ, hồi HP và tên file');
}
