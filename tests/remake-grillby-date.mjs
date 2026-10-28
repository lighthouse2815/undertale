import assert from 'node:assert/strict';

export async function testGrillbyDate(page) {
  for (const choice of [0,1]) {
    await page.evaluate(async () => {const w=__remake.game.scene.getScene('World');w.flags={89:1};w.plot=101;await w.openRoom('room_tundra_grillby','obj_markerw');w.scene.pause();});
    const result=await page.evaluate((choice) => {const w=__remake.scene,c=w.grillbyDate,dialogs=[],stages=new Set();let choices=0, cooking=null, serving=null;
      for(let i=0;i<4000 && c.locked;i++) {stages.add(c.stage);if(c.stage==='cooking' && !cooking)cooking=[c.grillby.image.x,c.grillby.image.y,c.grillby.image.visible];if(c.stage==='foodWait' && !serving)serving=[c.grillby.image.x,c.grillby.image.y,c.food.length];if(w.dialogue){if(w.dialogue.choice){w.dialogue.choice.index=choice;w.dialogue.choice.readyAt=0;choices++;}else dialogs.push(w.dialogue.lines[w.dialogue.index]);w.advanceDialogue();}else c.step();}
      const out={locked:c.locked,stage:c.stage,flags:[w.flags[89],w.flags[391]],choices,cooking,serving,dialogs,stages:[...stages],sansmode:w.grillbyNpcs.sansmode,food:c.food?.map(e=>e.texture.key)};w.scene.resume();return out;
    },choice);
    assert.equal(result.locked,false);assert.equal(result.stage,'done');assert.deepEqual(result.flags,[2,choice+1]);assert.equal(result.choices,5);assert.equal(result.sansmode,true);assert.deepEqual(result.cooking,[43,-2,false]);assert.deepEqual(result.serving,[184,28,2]);
    assert.ok(result.stages.includes('dark'));assert.ok(result.stages.includes('sit'));assert.ok(result.dialogs.some(t=>/fast shortcut/.test(t)));assert.ok(result.dialogs.some(t=>/forgot/.test(t)));assert.ok(result.dialogs.some(t=>/echo flower/i.test(t)));
    assert.ok(result.food.every(key=>key.startsWith(choice===0?'spr_sansfries:':'spr_sansburger:')));
  }
  await page.evaluate(async()=>{const w=__remake.scene;await w.openRoom('room_water1');});
  console.log('✓ Bữa ăn Sans: đường tới quầy, năm lựa chọn, món ăn, hoa, rời quán và cờ');
}
