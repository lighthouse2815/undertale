import assert from 'node:assert/strict';
import { temArmorPrice, temFirstOffer, temSecondOffer, temSellValue } from '../remake/src/tem-shop-rules.mjs';

export function testTemShopRules() {
  assert.deepEqual([0, 1, 5, 10, 19, 20, 24, 25, 30].map(temArmorPrice), [9999, 9000, 5000, 2800, 1100, 1000, 1000, 750, 750]);
  assert.deepEqual([1, 3, 22, 29, 56, 57, 60, 64, 999].map(temSellValue), [25, 150, 2, 3, -1, -1, -1, 500, 0]);
  assert.equal(temFirstOffer(25), 26); assert.equal(temSecondOffer(26), 34);
  console.log('✓ Tem Shop: giá bán, thương lượng và giảm giá giáp theo số lần thua');
}
