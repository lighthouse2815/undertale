import assert from 'node:assert/strict';
import { findWaterfallBridge, waterfallBridgeSeeds } from '../remake/src/waterfall-bridge.mjs';

export async function testWaterfallBridge() {
  const board=(x,y,using=3)=>({x,y,using});
  const horizontal=[board(80,40),board(40,40),board(100,40),board(60,40)];
  assert.equal(findWaterfallBridge(horizontal).length,4);
  assert.equal(findWaterfallBridge([board(0,0),board(0,20),board(0,40),board(0,60)]).length,4);
  assert.equal(findWaterfallBridge([board(0,0),board(20,0),board(40,0,1),board(60,0)]).length,0);
  assert.equal(findWaterfallBridge([board(0,0),board(20,0),board(60,0),board(80,0)]).length,0);
  assert.equal(findWaterfallBridge([board(0,0),board(20,0),board(20,20),board(40,20)]).length,0);
  assert.deepEqual(waterfallBridgeSeeds(1,106),[]);
  assert.deepEqual(waterfallBridgeSeeds(2,106),[420,440,460,480].map(x=>({x,y:400})));
  assert.deepEqual(waterfallBridgeSeeds(1,107),[180,200,220,240].map(y=>({x:220,y})));
  assert.equal(waterfallBridgeSeeds(2,107).length,8);
  console.log('✓ Cầu hạt Waterfall: bốn hạt thẳng liền kề/đã dừng và cầu có sẵn theo lối vào/plot');
}
