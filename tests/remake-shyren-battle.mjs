import assert from 'node:assert/strict';
export async function testShyrenBattle(page) {
  const start=async()=>{await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=110;w.hp=w.maxHp=20;w.lv=1;w.xp=w.kills=w.gold=0;w.weapon=3;w.weaponStrength=0;w.armor=4;w.armorDefense=0;w.inventory=[];await w.openRoom('room_water14');__remake.startBattle('shyren');});await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.scene.scene.key==='ShyrenBattle');};
  const key=async k=>{await page.keyboard.press(k);await page.waitForTimeout(70);};
  await start();assert.deepEqual(await page.evaluate(()=>[__remake.scene.enemyHp,__remake.scene.enemies[0].def,__remake.scene.body.texture.key]),[66,2,'spr_shyren_hide:0']);
  await page.evaluate(()=>__remake.scene.act('hum'));assert.match(await page.evaluate(()=>__remake.scene.message.text),/hum/);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='speech');await key('z');await page.waitForFunction(()=>__remake.scene.mode==='soul');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.wave.rate,__remake.scene.enemies[0].def,__remake.scene.enemies[0].mercy]),[7,-150,140]);
  await page.evaluate(()=>{const s=__remake.scene;s.scene.pause();s.finishSoul();s.scene.resume();});await page.waitForFunction(()=>__remake.scene.scene.isActive());
  await page.evaluate(()=>__remake.scene.end('spare'));assert.deepEqual(await page.evaluate(()=>[__remake.scene.goldReward,__remake.scene.xpReward]),[30,0]);await key('z');await page.waitForFunction(()=>__remake.phase==='running');assert.equal(await page.evaluate(()=>__remake.scene.flags[27]),1);
  await start();await page.evaluate(()=>{const s=__remake.scene;s.actState.encourage=5;s.beginWave();s.scene.pause();s.finishSoul();s.scene.resume();});assert.equal(await page.evaluate(()=>__remake.scene.previousScene.flags[81]),2);await page.waitForFunction(()=>__remake.scene.scene.isActive());await key('z');await page.waitForFunction(()=>__remake.phase==='running');
  await start();await page.evaluate(()=>__remake.scene.end('kill'));assert.deepEqual(await page.evaluate(()=>[__remake.scene.goldReward,__remake.scene.xpReward,__remake.scene.previousScene.flags[81]]),[25,52,1]);await key('z');await page.waitForFunction(()=>__remake.phase==='running');assert.equal(await page.evaluate(()=>__remake.scene.flags[204]),1);
  console.log('✓ Trận Shyren: Hum, đạn, tha, buổi diễn và giết');
}
