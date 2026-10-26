import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { buildRemake } from '../remake/build.mjs';

assert.ok(process.env.CHROME_PATH, 'Đặt CHROME_PATH tới Chrome/Chromium.');
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'undertale-remake-test-'));
const output = join(fixture, 'native');
const port = process.env.REMAKE_TEST_PORT ?? '5192';
const origin = `http://127.0.0.1:${port}`;
let server, browser;
const stopServer = async () => {
  if (server && server.exitCode === null) { const exited = once(server, 'exit'); server.kill(); await exited; }
};
const startServer = async (script, cwd) => {
  server = spawn(process.execPath, [script], { cwd,
    env: { ...process.env, PORT: port, UNDERTALE_MOD_CLI: '/compiler-khong-ton-tai' }, stdio: ['ignore', 'pipe', 'inherit'] });
  await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(([code]) => { throw new Error(`Server dừng: ${code}`); })]);
};
try {
  await buildRemake(output);
  const exported = await readdir(output, { recursive: true });
  assert.ok(!exported.some((name) => /\.(win|wasm|gml)$/.test(name) || /butterscotch/.test(name)));
  await assert.rejects(access(join(output, 'node_modules')), { code: 'ENOENT' });
  await access(join(output, 'vendor/Phaser-LICENSE.md'));
  const unrelated = join(fixture, 'unrelated');
  await mkdir(unrelated);
  await writeFile(join(unrelated, 'keep.txt'), 'giu-nguyen');
  await assert.rejects(buildRemake(unrelated), /marker/);
  assert.equal(await readFile(join(unrelated, 'keep.txt'), 'utf8'), 'giu-nguyen');
  const link = join(fixture, 'link');
  await symlink(output, link);
  await assert.rejects(buildRemake(link), /symlink/);
  await assert.rejects(buildRemake(join(root, 'game')), /ngoài nguồn/);
  console.log('✓ gói JavaScript độc lập, không có GML/WASM/data.win/compiler, bảo vệ thư mục xuất');

  await startServer(join(output, 'server.mjs'), fixture);
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  await context.addInitScript(() => { WebAssembly.Suspending = undefined; WebAssembly.instantiate = () => { throw new Error('Không được dùng WASM'); }; });
  const page = await context.newPage();
  const errors = [], requests = [];
  let bytes = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', (request) => requests.push(request.url()));
  page.on('response', (response) => { bytes += Number(response.headers()['content-length'] ?? 0); if (response.status() >= 400) errors.push(response.url()); });
  await page.goto(origin);
  await page.waitForFunction(() => ['intro', 'error'].includes(window.__remake?.phase));
  assert.equal(await page.evaluate(() => __remake.phase), 'intro');
  for (let i = 0; i < 11; i++) { await page.keyboard.press('z'); await page.waitForTimeout(50); }
  await page.waitForFunction(() => __remake.phase === 'title');
  await page.keyboard.press('z');
  await page.waitForFunction(() => __remake.phase === 'name');
  for (const key of ['F', 'R', 'I', 'S', 'K']) { await page.keyboard.press(key); await page.waitForTimeout(50); }
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => __remake.room), 'room_area1');
  assert.equal(await page.evaluate(() => __remake.game.registry.get('charname')), 'FRISK');
  assert.ok(requests.every((url) => !/\.(wasm|win|gml|ogg|wav)(?:$|\?)/.test(url)));
  assert.ok(requests.filter((url) => url.includes('/assets/rooms/')).every((url) => url.endsWith('/room_area1.json')));
  assert.ok(bytes < 5 * 1024 * 1024, `Tải phòng đầu quá lớn: ${bytes} byte`);
  const position = () => page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y }));
  assert.deepEqual(await position(), { x: 141, y: 120 });
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  const moved = await position();
  assert.ok(moved.x >= 180 && moved.x <= 192, JSON.stringify(moved));
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(1800);
  const wall = await position();
  await page.waitForTimeout(350);
  assert.deepEqual(await position(), wall);
  await page.keyboard.up('ArrowUp');
  assert.ok(wall.y >= 40 && wall.y <= 45);
  await page.keyboard.down('ArrowRight');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const released = await position();
  await page.waitForTimeout(200);
  assert.deepEqual(await position(), released);
  await page.keyboard.up('ArrowRight');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  const count = requests.length;
  await page.evaluate(() => __remake.scene.openRoom('room_area1'));
  assert.equal(requests.length, count, 'Mở lại phòng phải dùng cache JSON/ảnh trong phiên.');
  await page.evaluate(() => __remake.scene.player.setPosition(141, 156));
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(5000);
  await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.cameras.main.scrollX > 200));
  await page.evaluate(() => __remake.scene.player.setPosition(646, 140));
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_area1_2');
  assert.deepEqual(await position(), { x: 150, y: 381 });
  await page.evaluate(() => __remake.scene.player.setPosition(150, 400));
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_area1');
  assert.deepEqual(await position(), { x: 609, y: 153 });
  await page.screenshot({ path: join(root, 'test-results/remake-room.png') });
  assert.deepEqual(errors, []);
  console.log(`✓ tải ${Math.round(bytes / 1024)} KiB, phòng gốc, bốn hướng, animation, tường, camera và cache; chạy khi tắt WASM`);

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const touchPage = await mobile.newPage();
  await touchPage.goto(origin);
  await touchPage.waitForFunction(() => __remake.phase === 'intro');
  for (let i = 0; i < 11; i++) { await touchPage.keyboard.press('z'); await touchPage.waitForTimeout(50); }
  await touchPage.waitForFunction(() => __remake.phase === 'title');
  await touchPage.keyboard.press('z');
  await touchPage.waitForFunction(() => __remake.phase === 'name');
  await touchPage.keyboard.press('A');
  await touchPage.keyboard.press('Enter');
  await touchPage.waitForFunction(() => __remake.phase === 'running');
  await touchPage.touchscreen.tap(...Object.values(await touchPage.locator('[data-direction="right"]').evaluate((button) => {
    const box = button.getBoundingClientRect(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  })));
  await touchPage.waitForTimeout(150);
  assert.ok(await touchPage.evaluate(() => __remake.scene.player.x > 141));
  const canvas = await touchPage.locator('canvas').boundingBox();
  const controls = await touchPage.locator('.touch').boundingBox();
  assert.ok(canvas.y + canvas.height <= controls.y + 1);
  await mobile.close();
  console.log('✓ tap cảm ứng đi được, bố cục dọc không đè lên canvas');

  await stopServer();
  await startServer(join(root, 'tests/static-server.mjs'), fixture);
  const hosted = await browser.newPage();
  await hosted.goto(`${origin}/native/`);
  await hosted.waitForFunction(() => __remake.phase === 'intro');
  for (let i = 0; i < 11; i++) { await hosted.keyboard.press('z'); await hosted.waitForTimeout(50); }
  await hosted.waitForFunction(() => __remake.phase === 'title');
  await hosted.keyboard.press('z');
  await hosted.waitForFunction(() => __remake.phase === 'name');
  await hosted.keyboard.press('A');
  await hosted.keyboard.press('Enter');
  await hosted.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await hosted.evaluate(() => __remake.phase), 'running');
  const missing = await browser.newPage();
  await missing.route('**/bg_firstroom.png', (route) => route.fulfill({ status: 404, body: 'Không tìm thấy' }));
  await missing.goto(`${origin}/native/`);
  await missing.waitForFunction(() => __remake.phase === 'intro');
  for (let i = 0; i < 11; i++) { await missing.keyboard.press('z'); await missing.waitForTimeout(50); }
  await missing.waitForFunction(() => __remake.phase === 'title');
  await missing.keyboard.press('z');
  await missing.waitForFunction(() => __remake.phase === 'name');
  await missing.keyboard.press('A');
  await missing.keyboard.press('Enter');
  await missing.waitForFunction(() => __remake.phase === 'error');
  assert.match(await missing.locator('#status').textContent(), /bg_firstroom/);
  console.log('✓ hosting tĩnh dưới đường dẫn con; thiếu tài nguyên phải báo lỗi');
} finally {
  await browser?.close();
  await stopServer();
  await rm(fixture, { recursive: true, force: true });
}
