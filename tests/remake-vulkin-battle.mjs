import assert from 'node:assert/strict';

export async function testVulkinBattle(page) {
  const key=async code=>{await page.keyboard.press(code);await page.waitForTimeout(65);};
  const open=async()=>{
    await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=127;w.hp=w.maxHp=20;w.lv=1;w.inventory=[];w.weapon=3;w.weaponStrength=0;w.armor=4;w.armorDefense=0;w.xp=w.gold=w.kills=0;await w.openRoom('room_fire5','obj_markerA');w.saveGame(true);__remake.startBattle('vulkin');});
    await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_vulkin'&&!!__remake.scene.music);
  };
  const pages=async()=>{while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages'))await key('z');};
  const choose=async index=>{await page.waitForFunction(()=>__remake.scene.mode==='menu');await page.evaluate(i=>{__remake.scene.menuIndex=i;},index);await key('z');};
  const act=async index=>{await choose(1);await key('z');for(let i=0;i<index;i++)await key('ArrowDown');await key('z');};
  const advance=async()=>{await page.waitForFunction(()=>__remake.scene.mode==='speech');await key('z');await page.waitForFunction(()=>['soul','menu'].includes(__remake.scene.mode));};
  const finishWave=async()=>{await page.evaluate(()=>{const s=__remake.scene;s.invFrames=1000;for(let i=0;i<161&&s.mode==='soul';i++)if(s.wave.step())s.finishSoul();s.invFrames=0;});};
  await open();assert.deepEqual(await page.evaluate(()=>[__remake.scene.enemyHp,__remake.scene.config.def,__remake.scene.config.xp,__remake.scene.previousScene.hotlandMusic.isPaused]),[20,-10,70,true]);
  await act(0);assert.match(await page.evaluate(()=>__remake.scene.message.text),/VULKIN - ATK 25/);await pages();await advance();
  assert.equal(await page.evaluate(()=>__remake.scene.wave.kind),'vulkinCloud');await finishWave();
  await act(1);await pages();await advance();assert.equal(await page.evaluate(()=>__remake.scene.wave.kind),'vulkinLava');await finishWave();
  await act(2);assert.match(await page.evaluate(()=>__remake.scene.message.text),/NOT helpful/);await pages();await advance();assert.equal(await page.evaluate(()=>__remake.scene.mode),'menu');
  await act(2);assert.match(await page.evaluate(()=>__remake.scene.message.text),/sack/);await pages();await advance();
  await act(3);await pages();assert.deepEqual(await page.evaluate(()=>[__remake.scene.defense,__remake.scene.mercyModifier,__remake.scene.spareable()]),[5,100,true]);
  assert.equal(await page.evaluate(()=>{const s=__remake.scene;s.invFrames=0;s.hurt(8);const hp=s.hp;s.hp=20;s.invFrames=0;s.refreshHp();return hp;}),13);await advance();
  assert.equal(await page.evaluate(()=>__remake.scene.wave.kind),'vulkinCloud');await finishWave();
  await choose(3);await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[148],w.hotlandMusic.isPlaying];}),[40,0,0,1,true]);
  await open();await choose(0);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='fight');await page.evaluate(()=>{__remake.scene.attackX=156;});await key('z');await pages();await pages();
  await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[205]];}),[50,70,1,1]);
  await open();await choose(3);await key('ArrowDown');await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[11]];}),[0,0,0,1]);
  console.log('✓ Trận Vulkin: ACT/DEF, hai đợt đạn, tha/thưởng, FIGHT, Flee và nhạc');
}
