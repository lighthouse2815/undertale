import assert from 'node:assert/strict';

export async function testHotlandGroup77(page){
  const key=async code=>{await page.keyboard.press(code);await page.waitForTimeout(65);};
  const open=async()=>{
    await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive()&&!__remake.game.scene.isActive('HotlandGroup77Battle'));
    await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:3};w.plot=127;w.hp=w.maxHp=20;w.lv=1;w.inventory=[];w.weapon=3;w.weaponStrength=0;w.armor=4;w.armorDefense=0;w.xp=w.gold=w.kills=0;await w.openRoom('room_fire5','obj_markerA');w.saveGame(true);__remake.startBattle('hotlandGroup77');});
    await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_hotlandGroup77'&&!!__remake.scene.music);
  };
  const pages=async()=>{while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages'))await key('z');};
  const choose=async index=>{await page.waitForFunction(()=>__remake.scene.mode==='menu');await page.evaluate(i=>{__remake.scene.menuIndex=i;},index);await key('z');};
  const act=async(target,action)=>{await choose(1);if(target)await key('ArrowDown');await key('z');if(action==='down')await key('ArrowDown');if(action==='right')await key('ArrowRight');await key('z');};
  const advance=async()=>{await page.waitForFunction(()=>__remake.scene.mode==='speech');await page.evaluate(()=>{for(const e of __remake.scene.live())e.command=e.type==='plane'?0:100;});await key('z');await page.waitForFunction(()=>__remake.scene.mode==='soul');};
  const finish=()=>page.evaluate(()=>{const s=__remake.scene;s.invFrames=9999;for(let i=0;i<161&&s.mode==='soul';i++)if(s.wave.step())s.finishSoul();s.invFrames=0;});
  await open();assert.deepEqual(await page.evaluate(()=>__remake.scene.live().map(e=>[e.name,e.hp,e.def])),[['Tsunderplane',80,6],['Vulkin',20,-10]]);
  await act(1,'down');assert.match(await page.evaluate(()=>__remake.scene.message.text),/great job/);await pages();await advance();
  const attacks=await page.evaluate(()=>__remake.scene.wave.waves.map(w=>[w.kind,w.rate]));assert.equal(attacks[0][0],'tsunderplanes');assert.equal(attacks[0][1],34);assert.equal(attacks[1][0],'vulkinLava');assert.ok(Math.abs(attacks[1][1]-9.9)<1e-9);await finish();
  await choose(3);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='speech');
  assert.deepEqual(await page.evaluate(()=>{const s=__remake.scene;return [s.live().map(e=>e.name),s.goldReward,s.previousScene.flags[148]];}),[['Tsunderplane'],40,1]);
  await advance();await finish();await act(0,'down');await pages();await advance();
  const grazes=await page.evaluate(()=>{
    const s=__remake.scene,w=s.wave.waves[0];w.next=Infinity;s.invFrames=9999;const values=[];
    for(let i=0;i<4;i++){
      const p=w.spawnPlane();p.x=280;p.y=290;p.vy=0;p.green.x=262;p.green.y=282;let found=false;
      for(let dx=-25;dx<65&&!found;dx+=2)for(let dy=-20;dy<60&&!found;dy+=2){s.soul.setPosition((p.x+dx)/2,(p.y+dy)/2);found=w.touches('spr_vertplanegreen',p.green.x,p.green.y)&&!w.touches('spr_vertplanemask',p.x,p.y);}
      if(!found)throw Error('Không tìm được vùng xanh');w.step();values.push(s.enemies[0].rules.graze);p.image.destroy();p.green?.image.destroy();w.bullets=w.bullets.filter(b=>b!==p);w.planes=w.planes.filter(b=>b!==p);
    }return values;
  });
  assert.deepEqual(grazes,[1,2,3,4]);await finish();await choose(3);await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.hotlandMusic?.isPlaying);
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[148],w.flags[149]];}),[100,0,0,1,1]);
  await open();await page.evaluate(()=>{__remake.scene.enemies[1].hp=1;});await choose(0);await key('ArrowDown');await key('z');await page.waitForFunction(()=>__remake.scene.mode==='fight');await page.evaluate(()=>{__remake.scene.attackX=156;});await key('z');await pages();await advance();await finish();
  await choose(3);await key('ArrowDown');await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[205],w.flags[11]];}),[50,70,1,1,1]);
  await page.evaluate(()=>__remake.game.scene.getScene('HotlandGroup77Battle').update(0,100));
  await open();await act(0,'down');await pages();await advance();
  const groupGraze=await page.evaluate(()=>{
    const s=__remake.scene,w=s.wave.waves[0];w.next=Infinity;s.invFrames=9999;const p=w.spawnPlane();p.x=280;p.y=290;p.vy=0;p.green.x=252;p.green.y=282;let found=false;
    for(let dx=-35;dx<65&&!found;dx+=2)for(let dy=-20;dy<60&&!found;dy+=2){s.soul.setPosition((p.x+dx)/2,(p.y+dy)/2);found=w.touches('spr_vertplanegreen',p.green.x,p.green.y,p.green.scale)&&!w.touches('spr_vertplanemask',p.x,p.y);}
    if(!found)throw Error('Không tìm được vùng xanh của nhóm');w.step();return s.enemies[0].rules.graze;
  });
  assert.equal(groupGraze,1.5);await finish();
  await page.evaluate(()=>{const e=__remake.scene.enemies[0];while(e.rules.graze<4)e.rules.approach(2);e.mercy=e.rules.mercyModifier;e.def=e.rules.defense;});
  await choose(3);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='speech');await advance();await finish();
  assert.match(await page.evaluate(()=>__remake.scene.message.text),/plane turning tiny/);
  await choose(3);await key('ArrowDown');await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.flags[149],w.flags[11]];}),[60,0,1,1]);
  await open();await page.evaluate(()=>{__remake.scene.enemies[0].hp=1;});await choose(0);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='fight');await page.evaluate(()=>{__remake.scene.attackX=156;});await key('z');await pages();
  await page.waitForFunction(()=>__remake.scene.mode==='speech'&&__remake.scene.enemies[0].body.crashStage==='fall');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.live().map(e=>e.name),__remake.scene.enemies[0].body.crashing]),[['Vulkin'],true]);
  await page.waitForFunction(()=>__remake.scene.enemies[0].body.crashStage==='explosion');
  await page.waitForFunction(()=>!__remake.scene.enemies[0].body.crashing);
  await advance();await finish();await choose(3);await key('ArrowDown');await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[205],w.flags[11]];}),[45,95,1,1,1]);
  await open();await page.evaluate(()=>{__remake.scene.enemies[1].hp=1;});await choose(0);await key('ArrowDown');await key('z');await page.waitForFunction(()=>__remake.scene.mode==='fight');await page.evaluate(()=>{__remake.scene.attackX=156;});await key('z');await pages();await advance();await finish();
  await page.evaluate(()=>{__remake.scene.enemies[0].hp=1;});await choose(0);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='fight');await page.evaluate(()=>{__remake.scene.attackX=156;});await key('z');await pages();
  await page.waitForFunction(()=>__remake.scene.mode==='crash'&&__remake.scene.enemies[0].body.crashing);await page.waitForFunction(()=>__remake.scene.mode==='pages');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[205]];}),[95,165,2,2]);
  console.log('✓ Nhóm Hotland 77: chọn mục tiêu, hai đợt đồng thời, tha từng quái, FIGHT/Flee và thưởng');
}
