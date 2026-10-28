import assert from 'node:assert/strict';
export async function testBalletShoes(page) {
  const result = await page.evaluate(async () => {
    const {itemAction} = await import('/src/inventory.mjs'), w=__remake.scene; await w.openRoom('room_water12');
    const text=await fetch('/src/inventory.json').then(r=>r.json()); w.inventory=[25]; w.weapon=14; w.weaponStrength=5;
    if (!w.cache.audio.exists('snd_item')) await new Promise(resolve => { w.load.audio('snd_item','/assets/sounds/snd_item/snd_item.wav'); w.load.once('complete',resolve); w.load.start(); });
    const info=itemAction(w,0,'info',text), use=itemAction(w,0,'use',text), saved=w.saveGame();
    return {info,use,weapon:w.weapon,strength:w.weaponStrength,inventory:w.inventory,saved};
  });
  assert.match(result.info[0], /AT 7/); assert.match(result.use[0], /equipped Ballet Shoes/); assert.equal(result.weapon,25); assert.equal(result.strength,7); assert.deepEqual(result.inventory,[14]); assert.equal(result.saved.weapon,25); assert.equal(result.saved.weaponStrength,7);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Ballet Shoes: thông tin, trang bị, đổi vũ khí và lưu');
}
