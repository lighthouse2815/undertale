import assert from 'node:assert/strict';

export async function testPyropeBattle(page){
  const key=async code=>{await page.keyboard.press(code);await page.waitForTimeout(65);};
  const open=async()=>{
    await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:2};w.plot=127;w.hp=w.maxHp=20;w.lv=1;w.inventory=[];w.weapon=3;w.weaponStrength=0;w.armor=4;w.armorDefense=0;w.xp=w.gold=w.kills=0;await w.openRoom('room_fire5','obj_markerA');w.saveGame(true);__remake.startBattle('pyrope');});
    await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_pyrope'&&!!__remake.scene.music);
  };
  const pages=async()=>{while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages'))await key('z');};
  const choose=async index=>{await page.waitForFunction(()=>__remake.scene.mode==='menu');await page.evaluate(i=>{__remake.scene.menuIndex=i;},index);await key('z');};
  const act=async index=>{await choose(1);await key('z');for(let i=0;i<index;i++)await key('ArrowDown');await key('z');};
  const advance=async command=>{await page.waitForFunction(()=>__remake.scene.mode==='speech');await page.evaluate(n=>{__remake.scene.command=n;},command);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='soul');};
  const finish=()=>page.evaluate(()=>{const s=__remake.scene;s.invFrames=1000;for(let i=0;i<181&&s.mode==='soul';i++)if(s.wave.step())s.finishSoul();s.invFrames=0;});
  await open();assert.deepEqual(await page.evaluate(()=>[__remake.scene.enemyHp,__remake.scene.config.def,__remake.scene.config.xp,__remake.scene.previousScene.hotlandMusic.isPaused]),[110,1,80,true]);
  await act(0);assert.match(await page.evaluate(()=>__remake.scene.message.text),/PYROPE - ATK 29/);await pages();await advance(0);assert.equal(await page.evaluate(()=>__remake.scene.wave.kind),'pyropeRope');await finish();
  await act(2);await pages();await advance(90);assert.deepEqual(await page.evaluate(()=>[__remake.scene.rules.attackPower,__remake.scene.mercyModifier,__remake.scene.wave.kind,__remake.scene.wave.damage]),[6,-200,'pyropeBomb',6]);await finish();
  await act(1);await pages();await advance(0);assert.deepEqual(await page.evaluate(()=>[__remake.scene.rules.heat,__remake.scene.mercyModifier,__remake.scene.wave.kind]),[1,-170,'pyropeRope']);await finish();
  await act(1);await pages();await advance(90);assert.deepEqual(await page.evaluate(()=>[__remake.scene.rules.heat,__remake.scene.mercyModifier,__remake.scene.wave.kind]),[2,900,'pyropeBomb']);await finish();
  assert.equal(await page.evaluate(()=>__remake.scene.spareable()),true);await choose(3);await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.hotlandMusic?.isPlaying);
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[150],w.hotlandMusic.isPlaying];}),[45,0,0,1,true]);
  await open();await page.evaluate(()=>{__remake.scene.enemyHp=1;});await choose(0);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='fight');await page.evaluate(()=>{__remake.scene.attackX=156;});await key('z');await pages();await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[205]];}),[40,80,1,1]);
  await open();await choose(3);await key('ArrowDown');await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[11]];}),[0,0,0,1]);
  console.log('✓ Trận Pyrope: ACT/nhiệt/ATK, hai đợt đạn, tha, FIGHT, Flee và thưởng');
}
