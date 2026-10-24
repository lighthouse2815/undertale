// Kiểm tra nhanh mã nguồn: cú pháp + kích thước bản đồ + sprite
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let errors = 0;

// 1. cú pháp
const files = [
  ...readdirSync('src').filter((f) => f.endsWith('.js')).map((f) => join('src', f)),
  'server.mjs',
];
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`✓ cú pháp ${file}`);
  } catch (e) {
    errors++;
    console.error(`✗ lỗi cú pháp ${file}\n${e.stderr?.toString() ?? e.message}`);
  }
}

// 2. bản đồ
const { ROOMS, ITEMS, ENEMIES, SHOP_STOCK } = await import('../src/data.js');
for (const [id, room] of Object.entries(ROOMS)) {
  if (room.map.length !== 15) {
    errors++;
    console.error(`✗ ${id}: cần 15 hàng, đang có ${room.map.length}`);
  }
  room.map.forEach((row, i) => {
    if (row.length !== 20) {
      errors++;
      console.error(`✗ ${id} hàng ${i}: cần 20 cột, đang có ${row.length}`);
    }
  });
  for (const exit of room.exits ?? []) {
    if (!ROOMS[exit.to]) {
      errors++;
      console.error(`✗ ${id}: lối ra dẫn tới phòng không tồn tại "${exit.to}"`);
    }
  }
  for (const obj of room.objects ?? []) {
    if (obj.type === 'chest' && !ITEMS[obj.item]) {
      errors++;
      console.error(`✗ ${id}: rương chứa vật phẩm không tồn tại "${obj.item}"`);
    }
    if (obj.type === 'boss' && (obj.x < 0 || obj.x > 20 || obj.y < 0 || obj.y > 15)) {
      errors++;
      console.error(`✗ ${id}: trùm đặt ngoài bản đồ`);
    }
  }
}

for (const id of SHOP_STOCK) {
  if (!ITEMS[id]) {
    errors++;
    console.error(`✗ cửa hàng chứa vật phẩm không tồn tại "${id}"`);
  }
}
for (const [id, enemy] of Object.entries(ENEMIES)) {
  if (!enemy.patterns?.length) {
    errors++;
    console.error(`✗ kẻ địch ${id}: chưa có mẫu tấn công`);
  }
}

// 3. sprite
const spriteSrc = readFileSync('src/sprites.js', 'utf8');
for (const match of spriteSrc.matchAll(/(\w+):\s*\{\s*palette:[\s\S]*?rows:\s*\[([^\]]*)\]/g)) {
  const rows = [...match[2].matchAll(/'([^']*)'/g)].map((m) => m[1]);
  if (!rows.length) continue;
  const first = rows[0].length;
  if (rows.some((r) => r.length !== first)) {
    errors++;
    console.error(`✗ sprite ${match[1]}: các hàng không bằng nhau`);
  }
}

if (errors) {
  console.error(`\n${errors} lỗi cần sửa.`);
  process.exit(1);
}
console.log('\nTất cả kiểm tra đều đạt.');
