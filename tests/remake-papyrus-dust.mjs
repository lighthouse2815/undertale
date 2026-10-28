import assert from 'node:assert/strict';

export async function testPapyrusDust(page) {
  await page.evaluate(async () => { const w=__remake.game.scene.getScene('World'); w.flags={}; w.plot=65; w.hp=w.maxHp=20; w.lv=1; w.inventory=[]; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('papyrus'); });
  await page.waitForFunction(() => __remake.phase==='battle' && !!__remake.scene.music);
  const result=await page.evaluate(async () => {
    const s=__remake.scene, {PapyrusDust}=await import('/src/papyrus-dust.mjs'); s.scene.pause(); const random=Math.random; Math.random=()=>.5;
    const head=new PapyrusDust(s,'head',125,50); head.step(); const first=[head.line,head.particles.length,head.particles[0].image.x,head.particles[0].image.y,head.particles[0].image.texture.key];
    for(let i=0;i<8;i++)head.step(); const afterRows=[head.line,head.finished,head.image.visible]; for(let i=0;i<12;i++)head.step(); const cleared=[head.finished,head.particles.length]; const old=head.image; head.destroy();
    const body=new PapyrusDust(s,'body',100,50); for(let i=0;i<5;i++)body.step(); const blank=[body.line,body.particles.length]; for(let i=0;i<10;i++)body.step(); const dust=[body.line,body.particles.length>0]; for(let i=0;i<30;i++)body.step(); const done=[body.finished,body.particles.length]; body.destroy(); Math.random=random; s.finishBattle(); return {first,afterRows,cleared,destroyed:!old.active,blank,dust,done};
  });
  assert.deepEqual(result.first.slice(0,3),[4,52,130]); assert.ok(Math.abs(result.first[3]-50.775)<1e-9); assert.equal(result.first[4],'spr_pixwht:1');
  assert.deepEqual(result.afterRows,[36,true,false]); assert.deepEqual(result.cleared,[true,0]); assert.equal(result.destroyed,true);
  assert.deepEqual(result.blank,[20,0]); assert.deepEqual(result.dust,[60,true]); assert.deepEqual(result.done,[true,0]);
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep',resolve)));
  console.log('✓ Bụi Papyrus: dữ liệu hàng đầu/thân, hạt trắng, chuyển động, kết thúc và dọn');
}
