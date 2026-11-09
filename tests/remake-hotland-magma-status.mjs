import assert from 'node:assert/strict';

export async function testHotlandMagmaStatus(page){
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  const previous=await page.evaluate(async()=>{
    const w=__remake.scene,snapshot=structuredClone({flags:w.flags,plot:w.plot});w.flags={369:5,408:5};w.plot=127;
    await w.openRoom('room_fire6','obj_markerA');w.hotlandEncounter.steps=100000;w.player.setPosition(210,290);return snapshot;
  });
  const outside=await page.evaluate(()=>{const w=__remake.scene;w.player.setPosition(240,346);const first=w.hotlandStatus.checkTrigger();w.player.setPosition(540,81);const second=w.hotlandStatus.checkTrigger();w.player.setPosition(210,290);return [first,second,w.flags[369]];});
  assert.deepEqual(outside,[false,false,5]);
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>!!__remake.scene.dialogue);await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.flags[369],w.dialogue.lines,w.hotlandStatus.title.text,w.hotlandStatus.title.tintTopLeft];}),[6,["\n* I HATE USING THE PHONE I DON'T\n  WANT TO DO THIS LMAO ^0.^0 "],'ALPHYS updated status.',0xffff00]);
  await page.keyboard.press('z');await page.waitForFunction(()=>!__remake.scene.dialogue);await page.waitForTimeout(260);
  await page.evaluate(()=>__remake.scene.player.setPosition(515,70));await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>!!__remake.scene.dialogue);await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[369],__remake.scene.dialogue.lines]),[7,['\n* omg ive had my claw over\n  the last digit for 5 minutes',"* omg i'm just gonna do it\n* i'm just gonna call!!!!"]]);
  await page.waitForTimeout(260);await page.keyboard.press('z');await page.waitForFunction(()=>__remake.scene.dialogue?.index===1);assert.equal(await page.evaluate(()=>__remake.scene.hotlandStatus.title.visible),false);
  await page.waitForTimeout(260);await page.keyboard.press('z');await page.waitForFunction(()=>!__remake.scene.dialogue);
  const muted=await page.evaluate(async()=>{
    const w=__remake.scene;w.flags={368:1,369:5};await w.openRoom('room_fire6','obj_markerA');
    w.player.setPosition(240,320);const first=[w.hotlandStatus.checkTrigger(),w.flags[369],!!w.dialogue];
    w.player.setPosition(540,70);const second=[w.hotlandStatus.checkTrigger(),w.flags[369],!!w.dialogue];return [first,second];
  });
  assert.deepEqual(muted,[[false,6,false],[false,7,false]]);
  const exhausted=await page.evaluate(async()=>{const w=__remake.scene;w.flags={369:7};await w.openRoom('room_fire6','obj_markerA');w.player.setPosition(240,320);return [w.hotlandStatus.checkTrigger(),w.flags[369],!!w.dialogue];});
  assert.deepEqual(exhausted,[false,7,false]);
  await page.evaluate(async previous=>{const w=__remake.scene;Object.assign(w,previous);await w.openRoom('room_fire3','obj_markerC');},previous);
  console.log('✓ Trạng thái Alphys ở Hotland: hai thông báo, vùng kích hoạt và tắt tiếng');
}
