import assert from 'node:assert/strict';

export async function testHotlandGroup78(page){
  const key=async code=>{await page.keyboard.press(code);await page.waitForTimeout(65);};
  const open=async()=>{
    await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive()&&!__remake.game.scene.isActive('HotlandGroup78Battle'));
    await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:4};w.plot=127;w.hp=w.maxHp=20;w.lv=1;w.inventory=[];w.weapon=3;w.weaponStrength=0;w.armor=4;w.armorDefense=0;w.xp=w.gold=w.kills=0;await w.openRoom('room_fire5','obj_markerA');w.saveGame(true);__remake.startBattle('hotlandGroup78');});
    await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_hotlandGroup78'&&!!__remake.scene.music);
  };
  const pages=async()=>{while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages'))await key('z');};
  const choose=async index=>{await page.waitForFunction(()=>__remake.scene.mode==='menu');await page.evaluate(i=>{__remake.scene.menuIndex=i;},index);await key('z');};
  const act=async(target,action)=>{await choose(1);if(target)await key('ArrowDown');await key('z');if(action==='down')await key('ArrowDown');if(action==='right')await key('ArrowRight');await key('z');};
  const advance=async()=>{await page.waitForFunction(()=>__remake.scene.mode==='speech');await page.evaluate(()=>{for(const e of __remake.scene.live())e.command=0;});await key('z');await page.waitForFunction(()=>__remake.scene.mode==='soul');};
  const finish=()=>page.evaluate(()=>{const s=__remake.scene;s.invFrames=9999;for(let i=0;i<181&&s.mode==='soul';i++)if(s.wave.step())s.finishSoul();s.invFrames=0;});
  await open();assert.deepEqual(await page.evaluate(()=>__remake.scene.live().map(e=>[e.name,e.hp,e.def])),[['Pyrope',110,1],['Pyrope',110,1]]);
  await act(0,'down');await pages();await advance();
  assert.deepEqual(await page.evaluate(()=>{const s=__remake.scene;return [s.live().map(e=>[e.rules.heat,e.mercy]),s.heatState.heatWave,s.wave.waves.map(w=>[w.kind,w.rate,w.damage])];}),[[[1,50],[1,50]],1,[['pyropeBomb',44,8],['pyropeBomb',44,8]]]);await finish();
  await act(1,'right');await pages();await advance();assert.deepEqual(await page.evaluate(()=>{const s=__remake.scene;return [s.live().map(e=>[e.rules.heat,e.rules.attackPower,e.mercy]),s.heatState.heatWave];}),[[[0,6,-200],[0,6,-200]],0]);await finish();
  await act(0,'down');await pages();await advance();await finish();await act(1,'down');await pages();await advance();
  assert.deepEqual(await page.evaluate(()=>{const s=__remake.scene;return [s.live().map(e=>[e.rules.heat,e.mercy]),s.heatState.heatWave];}),[[[2,900],[2,900]],3]);await finish();
  await choose(3);await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.hotlandMusic?.isPlaying);
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[150],w.flags[23]];}),[90,0,0,1,2]);
  await open();await page.evaluate(()=>{__remake.scene.enemies[0].hp=1;});await choose(0);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='fight');await page.evaluate(()=>{__remake.scene.attackX=156;});await key('z');await pages();await advance();
  assert.deepEqual(await page.evaluate(()=>{const s=__remake.scene;return [s.live().length,s.wave.waves.map(w=>w.kind)];}),[1,['pyropeRope']]);await finish();
  await choose(3);await key('ArrowDown');await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[205],w.flags[11]];}),[40,80,1,1,1]);
  console.log('✓ Nhóm Hotland 78: nhiệt chung, hai đợt bom, tha hai quái và FIGHT/Flee');
}
