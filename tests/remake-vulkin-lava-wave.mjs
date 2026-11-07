import assert from 'node:assert/strict';

export async function testVulkinLavaWave(page) {
  await page.evaluate(async () => {const w=__remake.game.scene.getScene('World'); w.flags={}; w.hp=w.maxHp=20; w.lv=1; w.armorDefense=0; w.inventory=[]; await w.openRoom('room_fire5','obj_markerA'); __remake.startBattle('froggit');});
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.room === 'battle_froggit');
  await page.evaluate(async () => {
    const s=__remake.scene; window.vulkinWaveModule=await import('/src/vulkin-lava-wave.mjs'); vulkinWaveModule.loadVulkinLavaAssets(s);
    if(s.load.list.size) await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();}); s.mode='waveFixture';
  });
  const result=await page.evaluate(() => {
    const s=__remake.scene, w=new vulkinWaveModule.VulkinLavaWave(s); s.wave=w; s.invFrames=9999;
    const old=Math.random; Math.random=()=>.5;
    for(let i=0;i<4;i++)w.step(); const before=w.bullets.length;
    w.step(); const first=w.bullets.map(b=>[b.sprite,b.x,b.y,b.vx,b.vy]);
    for(let i=0;i<7;i++)w.step(); const second=w.bullets.length;
    for(let i=0;i<14;i++)w.step(); const flames=w.bullets.filter(b=>!b.side).map(b=>b.left);
    Math.random=old;
    w.bullets.forEach(b=>b.image.destroy()); w.bullets=[]; w.next=999;
    const b=w.spawnFlame(true); b.x=s.soul.x*2+8; b.y=s.soul.y*2+8; b.vx=0; b.vy=0; b.gravity=0;
    const touches=w.touchesLava(b); s.invFrames=0; w.step(); const hit=[s.hp,b.image.active];
    const until=w.duration-w.frames; for(let i=0;i<until-1;i++)w.step(); const almost=w.step();
    const images=w.bullets.map(b=>b.image); w.destroy(); s.wave=null;
    return {before,first,second,flames,touches,hit,almost,destroyed:images.every(i=>!i.active)&&!w.clip.active};
  });
  assert.equal(result.before,0); assert.deepEqual(result.first.map(x=>x[0]),['spr_lavaside','spr_lavaside','spr_lavaflame']);
  assert.ok(result.first[0][3]>0 && result.first[1][3]<0 && result.first[2][3]>0); assert.equal(result.second,5); assert.deepEqual(result.flames,[true,false]);
  assert.equal(result.touches,true); assert.deepEqual(result.hit,[14,false]); assert.equal(result.almost,true); assert.equal(result.destroyed,true);
  await page.evaluate(()=>__remake.scene.finishBattle());
  await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Đạn dung nham Vulkin: nhịp phát, hai mép, quỹ đạo, sát thương và dọn');
}
