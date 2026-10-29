import assert from 'node:assert/strict';
import { waterfallPapyrusFinalCall } from '../remake/src/waterfall-papyrus-final-call.mjs';

export function testWaterfallPapyrusFinalCall() {
  const before = waterfallPapyrusFinalCall({ 88: 2 });
  const after = waterfallPapyrusFinalCall({ 88: 3 });
  assert.equal(before.length, 8); assert.equal(after.length, 7);
  assert.deepEqual(before.slice(0, 4), after.slice(0, 4));
  assert.notEqual(before[4].text, after[4].text);
  for (const pages of [before, after]) {
    assert.equal(pages[0].papyrus, false); assert.equal(pages.at(-1).papyrus, false);
    assert.ok(pages.slice(1, -1).every(page => page.papyrus && page.text.length > 0));
  }
  console.log('✓ Cuộc gọi trước Hotland: hai nhánh theo cuộc hẹn Papyrus');
}
