import assert from 'node:assert/strict';
import { fightInput } from '../remake/src/fight-input.mjs';
import { itemAction } from '../remake/src/inventory.mjs';
import text from '../remake/src/inventory.json' with { type:'json' };
export async function testPunchCard(page) {
  const sounds=[], world={inventory:[26,26,13],weapon:14,weaponStrength:5,lv:1,flags:{}}, scene={sound:{play:key=>sounds.push(key)},attackBonus:0};
  assert.equal(itemAction(world,0,'info',text).length,2);
  assert.match(itemAction(world,0,'use',text,{scene})[1], /increased by 6/); assert.equal(scene.cardAttackBonus,6);
  assert.match(itemAction(world,0,'use',text,{scene})[1], /increased by 6/); assert.equal(scene.cardAttackBonus,12);
  itemAction(world,0,'use',text,{scene}); assert.equal(scene.cardAttackBonus,0); assert.equal(world.weapon,13);
  world.inventory=[26]; assert.match(itemAction(world,0,'use',text,{scene})[1], /nothing happened/); assert.deepEqual(sounds,['snd_tearcard','snd_tearcard','snd_item']);
  const damage = bonus => { const s={previousScene:{weapon:14,lv:1,weaponStrength:5},cardAttackBonus:bonus,attackX:156,attackSpeed:0,bar:{},confirmPressed:true,enemy:{getBounds:()=>({centerX:1,centerY:1})},add:{image:()=>({setScale(){return this;},setVisible(){return this;}})}}; const random=Math.random; Math.random=()=>0; try { fightInput(s,0,0); return s.glovePunch.damage; } finally { Math.random=random; } };
  assert.ok(damage(6)>damage(0));
  await page.evaluate(async () => { const w=__remake.scene; await w.openRoom('room_water12'); w.waterfallEncounter.disabled=true; w.inventory=[26]; w.menuSelection=0; });
  await page.waitForFunction(() => __remake.scene.scene.isActive()); await page.keyboard.press('c'); await page.waitForFunction(() => __remake.phase==='menu');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode==='items'); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode==='action'); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode==='card');
  assert.equal(await page.evaluate(() => __remake.scene.children.list.some(e=>e.texture?.key==='spr_punchcard:0')),true);
  await page.waitForTimeout(250); await page.keyboard.press('x'); await page.waitForFunction(() => __remake.phase==='running'); assert.deepEqual(await page.evaluate(() => __remake.scene.inventory),[26]);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Punch Card: xem, dùng trong trận và đổi vũ khí');
}
