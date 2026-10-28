import assert from 'node:assert/strict';

export async function testWaterfallHallSave(page) {
  for (const [flags,text] of [[{},/feeling of dread/],[{26:8,204:3},/15 left/],[{26:8,204:18},/Determination/]]) {
    await page.evaluate(async flags=>{const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=106;w.hp=1;w.maxHp=20;await w.openRoom('room_water4');w.player.setPosition(485,280);w.player.facing='u';w.tryInteract();},flags);
    assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),text);assert.equal(await page.evaluate(()=>__remake.scene.hp),20);
    await page.evaluate(()=>__remake.scene.advanceDialogue());await page.waitForFunction(()=>__remake.phase==='saving');await page.keyboard.press('z');await page.waitForFunction(()=>__remake.scene.saved);assert.equal(await page.evaluate(()=>__remake.scene.roomLabel.text),'Waterfall - Hallway');await page.keyboard.press('x');await page.waitForFunction(()=>__remake.phase==='running');
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ SAVE hành lang Waterfall: lời, dân số, hồi HP và tên file');
}
