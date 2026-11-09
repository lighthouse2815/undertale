import assert from 'node:assert/strict';

export async function testTsunderplaneBattle(page){
  const key=async code=>{await page.keyboard.press(code);await page.waitForTimeout(65);};
  const open=async()=>{
    await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:1};w.plot=127;w.hp=w.maxHp=20;w.lv=1;w.inventory=[];w.weapon=3;w.weaponStrength=0;w.armor=4;w.armorDefense=0;w.xp=w.gold=w.kills=0;await w.openRoom('room_fire5','obj_markerA');w.saveGame(true);__remake.startBattle('tsunderplane');});
    await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_tsunderplane'&&!!__remake.scene.music);
  };
  const pages=async()=>{while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages'))await key('z');};
  const choose=async index=>{await page.waitForFunction(()=>__remake.scene.mode==='menu');await page.evaluate(i=>{__remake.scene.menuIndex=i;},index);await key('z');};
  const act=async index=>{await choose(1);await key('z');for(let i=0;i<index;i++)await key('ArrowDown');await key('z');};
  const advance=async command=>{await page.waitForFunction(()=>__remake.scene.mode==='speech');await page.evaluate(n=>{__remake.scene.command=n;},command);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='soul');};
  const finish=()=>page.evaluate(()=>{const s=__remake.scene;s.invFrames=1000;for(let i=0;i<161&&s.mode==='soul';i++)if(s.wave.step())s.finishSoul();s.invFrames=0;});
  await open();assert.deepEqual(await page.evaluate(()=>[__remake.scene.enemyHp,__remake.scene.config.def,__remake.scene.config.xp,__remake.scene.previousScene.hotlandMusic.isPaused]),[80,6,95,true]);
  await act(2);assert.match(await page.evaluate(()=>__remake.scene.message.text),/Tsunderplane/);await pages();await advance(90);
  assert.equal(await page.evaluate(()=>__remake.scene.wave.kind),'tsunderbombs');await finish();
  await act(1);await pages();await advance(90);assert.deepEqual(await page.evaluate(()=>[__remake.scene.wave.kind,__remake.scene.wave.green]),['tsunderplanes',true]);
  const grazes=await page.evaluate(()=>{
    const s=__remake.scene,w=s.wave;w.next=Infinity;s.invFrames=1000;const values=[];
    for(let i=0;i<4;i++){
      const p=w.spawnPlane();p.x=280;p.y=290;p.vy=0;p.green.x=262;p.green.y=282;let found=false;
      for(let dx=-25;dx<65&&!found;dx+=2)for(let dy=-20;dy<60&&!found;dy+=2){s.soul.setPosition((p.x+dx)/2,(p.y+dy)/2);found=w.touches('spr_vertplanegreen',p.green.x,p.green.y)&&!w.touches('spr_vertplanemask',p.x,p.y);}
      if(!found)throw Error('Không tìm được vùng tiếp cận an toàn');w.step();values.push(s.rules.graze);p.image.destroy();p.green?.image.destroy();w.bullets=w.bullets.filter(b=>b!==p);w.planes=w.planes.filter(b=>b!==p);
    }
    return values;
  });
  assert.deepEqual(grazes,[1,2,3,4]);await finish();assert.deepEqual(await page.evaluate(()=>[__remake.scene.mercyModifier,__remake.scene.config.def,__remake.scene.spareable()]),[100,-99,true]);
  await choose(3);await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[149],w.hotlandMusic.isPlaying];}),[60,0,0,1,true]);
  await open();await page.evaluate(()=>{__remake.scene.enemyHp=1;});await choose(0);await key('z');await page.waitForFunction(()=>__remake.scene.mode==='fight');await page.evaluate(()=>{__remake.scene.attackX=156;});await key('z');await pages();
  await page.waitForFunction(()=>__remake.scene.mode==='crash'&&__remake.scene.body.crashStage==='fall');
  assert.equal(await page.evaluate(()=>__remake.scene.body.crashText.text),'B-but I\nnever\ngot to\n...!');
  await page.waitForFunction(()=>__remake.scene.body.crashStage==='explosion');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.body.plane.visible,__remake.scene.body.explosion.visible]),[false,true]);
  await page.waitForFunction(()=>__remake.scene.mode==='pages');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[205]];}),[45,95,1,1]);
  await open();await choose(3);await key('ArrowDown');await key('z');await pages();await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.gold,w.xp,w.kills,w.flags[11]];}),[0,0,0,1]);
  console.log('✓ Trận Tsunderplane: Flirt/Approach, hai đợt đạn, graze/tha, FIGHT, Flee và thưởng');
}
