import assert from 'node:assert/strict';
export async function testWaterfallPapyrusPhone(page) {
  for (const [armor,choice] of [[4,0],[24,1]]) {
    const result=await page.evaluate(async ({armor,choice})=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=106;w.armor=armor;await w.openRoom('room_water5');w.scene.pause();w.player.setPosition(140,120);const c=w.waterfallPapyrusPhone,trigger=c.checkTrigger();const pages=[...w.dialogue.lines];while(w.dialogue&&!w.dialogue.choice)w.advanceDialogue();w.dialogue.choice.index=choice;w.dialogue.choice.readyAt=0;w.advanceDialogue();const answer=[...w.dialogue.lines];while(w.dialogue)w.advanceDialogue();w.cameras.main.setScroll(0,260);for(let i=0;i<15;i++)c.step();const state=[w.plot,w.flags[75],w.flags[76],w.flags[9],!c.flowey.active];w.scene.resume();return {trigger,pages,answer,state};},{armor,choice});
    assert.equal(result.trigger,true);assert.match(result.pages[8],armor===4?/GROSS BANDAGE/:/DUSTY TUTU/);assert.match(result.answer[0],choice===0?/ARE WEARING/:/AREN'T/);assert.deepEqual(result.state,[107,armor,choice,1,true]);
  }
  const killed=await page.evaluate(async()=>{const w=__remake.scene;w.flags={67:1};w.plot=106;await w.openRoom('room_water5');w.scene.pause();w.player.setPosition(140,120);const c=w.waterfallPapyrusPhone;c.checkTrigger();const r=[w.plot,w.dialogue,c.done,!!c.flowey,w.flags[75]??null];w.scene.resume();return r;});assert.deepEqual(killed,[107,null,true,true,null]);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Điện thoại Papyrus Waterfall: trang bị, Yes/No, cờ, Flowey và nhánh Papyrus chết');
}
