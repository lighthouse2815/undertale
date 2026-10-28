import assert from 'node:assert/strict';
import { waterfallUndyneReport, waterfallUndyneReportEnd, waterfallUndyneKid } from '../remake/src/waterfall-undyne-dialogue.mjs';

export async function testWaterfallUndyneDialogue() {
  assert.equal(waterfallUndyneReport.length,14);assert.match(waterfallUndyneReport[0].text,/DAILY REPORT/);
  assert.match(waterfallUndyneReport[2].text,/DID I FIGHT/);assert.equal(waterfallUndyneReport[2].emotion,6);
  assert.match(waterfallUndyneReport.at(-1).text,/YOU SEE/);assert.match(waterfallUndyneReportEnd.at(-1).text,/ANY WAY/);
  assert.deepEqual([waterfallUndyneKid(false).length,waterfallUndyneKid(true).length],[6,6]);assert.match(waterfallUndyneKid(true)[4].text,/waiting FOREVER/i);
  assert.match(waterfallUndyneKid(false)[4].text,/attention/);
  console.log('✓ Lời cảnh Undyne: báo cáo Papyrus, writer kết thúc và hai nhánh Monster Kid');
}
