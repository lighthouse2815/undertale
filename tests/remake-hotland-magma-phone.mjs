import assert from 'node:assert/strict';

export async function testHotlandMagmaPhone(page){
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  const previous=await page.evaluate(async()=>{
    const w=__remake.scene,snapshot=structuredClone({flags:w.flags,plot:w.plot});w.flags={369:7,408:5};w.plot=127;
    await w.openRoom('room_fire6','obj_markerA');w.hotlandEncounter.steps=100000;w.player.setPosition(305,45);
    window.magmaPhoneAudio=[];window.magmaOriginalPlay=w.sound.play;w.sound.play=function(key,...args){window.magmaPhoneAudio.push(key);return window.magmaOriginalPlay.call(this,key,...args);};return snapshot;
  });
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>!!__remake.scene.dialogue);await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.plot,w.dialogue.lines,window.magmaPhoneAudio.filter(k=>k==='snd_phone').length];}),[130,['* Ring... Ring...','* Click...?','* (Whoever was calling hung up\n  before you answered it.)'],1]);
  const x=await page.evaluate(()=>__remake.scene.player.x);await page.keyboard.down('ArrowRight');await page.waitForTimeout(150);await page.keyboard.up('ArrowRight');assert.equal(await page.evaluate(()=>__remake.scene.player.x),x);
  for(let i=0;i<3;i++){await page.waitForTimeout(260);await page.keyboard.press('z');}
  await page.waitForFunction(()=>!__remake.scene.dialogue);assert.equal(await page.evaluate(()=>__remake.scene.hotlandMagmaPhone.done),true);
  const muted=await page.evaluate(async()=>{
    const w=__remake.scene;w.flags={367:1,369:7};w.plot=129;await w.openRoom('room_fire6','obj_markerA');window.magmaPhoneAudio=[];
    w.player.setPosition(340,121);const outside=[w.hotlandMagmaPhone.checkTrigger(),w.plot];
    w.player.setPosition(340,120);const inside=[w.hotlandMagmaPhone.checkTrigger(),w.plot,!!w.dialogue,window.magmaPhoneAudio.includes('snd_phone')];return [outside,inside];
  });
  assert.deepEqual(muted,[[false,129],[false,130,false,false]]);
  const finished=await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=129.5;await w.openRoom('room_fire6','obj_markerA');w.player.setPosition(340,45);return [w.hotlandMagmaPhone.checkTrigger(),w.plot,!!w.dialogue];});
  assert.deepEqual(finished,[false,129.5,false]);
  await page.evaluate(async previous=>{const w=__remake.scene;w.sound.play=window.magmaOriginalPlay;delete window.magmaOriginalPlay;delete window.magmaPhoneAudio;Object.assign(w,previous);await w.openRoom('room_fire3','obj_markerC');},previous);
  console.log('✓ Cuộc gọi Hotland: vùng kích hoạt, lời thoại, cờ tắt và tiến độ');
}
