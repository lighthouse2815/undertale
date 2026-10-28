import assert from 'node:assert/strict';

export async function testGladDummyBattle(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.hp=w.maxHp=20;w.xp=0;w.gold=0;w.kills=0;w.lv=1;await w.openRoom('room_water_trashzone2');});
  const start=async()=>{await page.evaluate(()=>__remake.startBattle('gladDummy'));await page.waitForFunction(()=>__remake.room==='battle_gladDummy'||__remake.phase==='error');assert.equal(await page.evaluate(()=>__remake.phase),'battle');};
  await start();
  for(const key of ['ArrowRight','z','z','z']){await page.keyboard.press(key);await page.waitForTimeout(80);}
  assert.match(await page.evaluate(()=>__remake.scene.message.text),/GLAD DUMMY/);
  const first=await page.evaluate(()=>{const s=__remake.scene;s.afterPages();const a=[s.mode,s.speechText.text,s.enemyHp];s.speechBox.destroy();s.speechText.destroy();s.beginWave();return [...a,s.mode,s.turn];});
  assert.deepEqual(first,['speech','Thanks!',5,'menu',1]);
  await page.evaluate(()=>{const s=__remake.scene;s.choose('mercy',['Spare']);s.confirmPressed=true;s.updateSubmenu();s.afterPages();});await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[27],__remake.scene.flags[252]??0,__remake.scene.kills,__remake.scene.xp,__remake.scene.gold]),[1,0,0,0,0]);
  await page.evaluate(()=>{__remake.scene.flags={};});await start();
  const killed=await page.evaluate(()=>{const s=__remake.scene;s.scene.pause();s.startFight();s.attackX=152;s.confirmPressed=true;s.updateFight(0);s.afterPages();const a=[s.enemyHp,s.previousScene.flags[252],s.message.text];s.afterPages();return a;});
  assert.deepEqual(killed,[0,1,'* YOU WON!\n* You earned 0 XP and 0 gold.']);await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.kills,__remake.scene.flags[252],__remake.scene.flags[27]??0,__remake.scene.xp,__remake.scene.gold]),[1,1,0,0,0]);
  await page.evaluate(()=>{__remake.scene.flags={};});await start();
  const leave=await page.evaluate(()=>{const s=__remake.scene;s.turn=6;s.dummyTurn();const line=s.speechText.text;s.speechBox.destroy();s.speechText.destroy();s.beginWave();const message=s.message.text;s.afterPages();return [line,message,s.mode];});
  assert.deepEqual(leave,['...','* Dummy tires of your\n  aimless shenanigans.','leaving']);await page.waitForFunction(()=>__remake.scene.mode==='pages'&&__remake.scene.previousScene.flags[27]===1);await page.evaluate(()=>__remake.scene.afterPages());await page.waitForFunction(()=>__remake.phase==='running');assert.equal(await page.evaluate(()=>__remake.scene.flags[27]),1);
  console.log('✓ Glad Dummy: Check, Spare, FIGHT và tự rời sau bảy lượt');
}
