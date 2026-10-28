import assert from 'node:assert/strict';
import { waterfallPapyrusCall } from '../remake/src/waterfall-papyrus-call.mjs';
export async function testWaterfallPapyrusCall() {
  for (const [id,name] of [[4,'GROSS BANDAGE'],[12,'FADED RIBBON'],[15,'BANDANNA'],[24,'DUSTY TUTU'],[999,'BEPIS.']]) {
    const intro=waterfallPapyrusCall(id);assert.equal(intro.length,10);assert.match(intro[8].text,new RegExp(name.replace('.','\\.')));assert.equal(intro[0].papyrus,false);assert.equal(intro[1].papyrus,true);
    assert.match(waterfallPapyrusCall(id,0)[0].text,/SO YOU ARE WEARING/);assert.match(waterfallPapyrusCall(id,1)[0].text,/AREN'T/);
    assert.equal(waterfallPapyrusCall(id,0).at(-1).papyrus,false);assert.equal(waterfallPapyrusCall(id,1).length,5);
  }
  console.log('✓ Cuộc gọi Papyrus: năm loại giáp, Yes/No và trang thoại');
}
