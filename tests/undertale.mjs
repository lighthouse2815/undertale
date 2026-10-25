import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const executablePath = process.env.CHROME_PATH;
assert.ok(executablePath, 'Đặt CHROME_PATH tới Chrome/Chromium có WebAssembly JSPI.');
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'undertale-web-'));
const port = process.env.ORIGINAL_TEST_PORT ?? '5188';
const origin = `http://127.0.0.1:${port}`;
let server;
let browser;
try {
  for (const name of ['index.html', 'server.mjs', 'src/undertale.js', 'src/undertale.css',
    'src/style.css', 'assets/undertale', 'assets/fonts', 'assets/sprites/spr_undertaletitle_0.png',
    'vendor/butterscotch/butterscotch.mjs', 'vendor/butterscotch/butterscotch.wasm']) {
    const target = join(fixture, name);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(root, name), target, { recursive: true });
  }
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: fixture, env: { ...process.env, PORT: port }, stdio: ['ignore', 'pipe', 'inherit'],
  });
  await Promise.race([
    once(server.stdout, 'data'),
    once(server, 'exit').then(([code]) => { throw new Error(`Server dừng: ${code}`); }),
  ]);
  browser = await chromium.launch({ executablePath, headless: true,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', (request) => requests.push(request.url()));
  const key = async (code) => {
    await page.keyboard.press(code, { delay: 100 });
    await page.waitForTimeout(80);
  };
  const snapshot = async () => {
    await page.evaluate(() => { try { __undertale.module.FS.unlink('/snapshot.json'); } catch {} });
    await key('F11');
    await page.waitForFunction(() => {
      try { return !!__undertale.module.FS.readFile('/snapshot.json').length; } catch { return false; }
    });
    return page.evaluate(() => JSON.parse(__undertale.module.FS.readFile('/snapshot.json', { encoding: 'utf8' })));
  };
  await page.goto(`${origin}/?debug`);
  await page.waitForFunction(() => ['ready', 'error'].includes(window.__undertale?.phase));
  assert.equal(await page.evaluate(() => __undertale.phase), 'ready');
  assert.equal(await page.evaluate(() => __undertale.module.FS.readdir('/game').filter((f) => !f.startsWith('.')).length), 214);
  assert.ok(await page.evaluate(() => __undertale.module.FS.readFile('/game/credits.txt').length > 0));
  await page.click('#bootBtn');
  await page.waitForFunction(() => __undertale.room?.name === 'room_introstory');
  await page.waitForTimeout(350);
  await key('z');
  await page.waitForFunction(() => __undertale.room?.name === 'room_introimage');
  await key('z');
  await page.waitForFunction(() => __undertale.room?.name === 'room_intromenu');
  await key('z'); // Bắt đầu nhập tên.
  await key('z'); // Chọn chữ A.
  for (const code of ['ArrowUp', 'ArrowRight', 'ArrowRight', 'z', 'ArrowRight', 'z']) await key(code);
  await page.waitForFunction(() => __undertale.room?.name === 'room_area1');
  let frame = await snapshot();
  assert.equal(frame.globalVariables.charname, 'A');
  assert.equal(frame.globalVariables.hp, 20);
  const player = (data) => data.instances.find((i) => i.objectName === 'obj_mainchara');
  assert.ok(player(frame));
  const startX = player(frame).x;
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  frame = await snapshot();
  assert.ok(player(frame).x > startX, 'Nhân vật gốc phải di chuyển bằng bàn phím.');
  // Mất tiêu điểm phải thả phím, không để nhân vật tiếp tục đi.
  await page.keyboard.down('ArrowRight');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const stopped = player(await snapshot()).x;
  await page.waitForTimeout(350);
  assert.equal(player(await snapshot()).x, stopped);
  await page.keyboard.up('ArrowRight');
  // Đi vào tường trên bằng va chạm gốc, sau đó xác nhận không đi xuyên.
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(1600);
  const wallY = player(await snapshot()).y;
  await page.waitForTimeout(350);
  assert.equal(player(await snapshot()).y, wallY);
  await page.keyboard.up('ArrowUp');
  assert.ok(wallY > 0);
  const audio = await page.evaluate(() => window.miniaudio.devices.map((d) => ({
    state: d.webaudio.state, time: d.webaudio.currentTime,
  })));
  assert.ok(audio.some((d) => d.state === 'running' && d.time > 0));
  const ini = await page.evaluate(async () => {
    const storage = await navigator.storage.getDirectory();
    const saves = await storage.getDirectoryHandle('undertale');
    return (await (await saves.getFileHandle('undertale.ini')).getFile()).text();
  });
  assert.match(ini, /\[General\]/);
  assert.match(ini, /fun=/);
  // Fixture lưu theo định dạng scr_saveprocess: native GML phải đọc và tiếp tục được.
  const storeCheckpoint = async (room, plot) => {
    const fields = ['A', 1, 20, 20, 10, 0, 10, 0, 4, 0, 37, 0];
    for (let i = 0; i < 8; i++) fields.push(0, 0);
    fields.push(3, 4, ...Array(512).fill(0), plot, 0, 0, 0, -1, room, 1800);
    await page.evaluate(async (save) => {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('undertale');
      for (const [name, contents] of Object.entries(save)) {
        const handle = await dir.getFileHandle(name, { create: true });
        const writer = await handle.createWritable();
        await writer.write(contents);
        await writer.close();
      }
    }, { file0: `${fields.join('\n')}\n`,
      'undertale.ini': `[General]\nName="A"\nLove=1\nTime=1800\nKills=0\nRoom=${room}\n` });
  };
  const continueCheckpoint = async (room) => {
    await page.reload();
    await page.waitForFunction(() => __undertale.phase === 'ready');
    await page.click('#bootBtn');
    await page.waitForFunction(() => __undertale.room?.id === 1);
    await page.waitForTimeout(350);
    await key('z');
    await page.waitForFunction(() => __undertale.room?.id === 2);
    await key('z');
    await page.waitForFunction(() => __undertale.room?.id === 3);
    await key('z');
    await page.waitForFunction((id) => __undertale.room?.id === id, room);
  };
  await storeCheckpoint(4, 2);
  await continueCheckpoint(4);
  frame = await snapshot();
  assert.equal(frame.globalVariables.charname, 'A');
  assert.equal(frame.globalVariables.hp, 20);
  assert.ok(player(frame));
  // Checkpoint trước Toriel: hội thoại, chuyển trận và tấn công đều dùng GML gốc.
  await storeCheckpoint(41, 24);
  await continueCheckpoint(41);
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(1800);
  await page.keyboard.up('ArrowUp');
  for (let i = 0; i < 22; i++) {
    await key('x');
    await key('z');
    if (await page.evaluate(() => __undertale.room?.id === 306)) break;
  }
  await page.waitForFunction(() => __undertale.room?.name === 'room_battle');
  frame = await snapshot();
  for (const name of ['obj_torielboss', 'obj_heart', 'obj_fightbt', 'obj_talkbt', 'obj_itembt', 'obj_sparebt']) {
    assert.ok(frame.instances.some((i) => i.objectName === name), `Thiếu đối tượng trận gốc ${name}`);
  }
  const torielHp = frame.globalVariables.monsterhp[0];
  for (let i = 0; i < 9; i++) { await key('z'); await page.waitForTimeout(200); }
  for (let i = 0; i < 12; i++) {
    frame = await snapshot();
    if (frame.globalVariables.turn > 0) break;
    await page.waitForTimeout(250);
  }
  assert.ok(frame.globalVariables.turn > 0);
  assert.ok(frame.globalVariables.monsterhp[0] < torielHp, 'Đòn đánh phải giảm HP Toriel theo logic gốc.');
  assert.ok(frame.globalVariables.hp > 0 && frame.globalVariables.hp <= 20);
  assert.equal(await page.evaluate(() => __undertale.error), null);
  assert.deepEqual(errors, []);
  assert.ok(requests.every((url) => url.startsWith(origin)), 'Không được tải runtime hoặc dữ liệu từ dịch vụ ngoài.');
  assert.ok(requests.every((url) => !/Undertale-AnkerGames|local-music|local-sprites/.test(url)));
  assert.equal(await page.evaluate(() => __undertale.logs.some((l) => /Failed to load file|Unknown function/i.test(l))), false);
  await context.close();
  console.log('✓ bản sao độc lập chạy bytecode gốc, intro, tiêu đề, đặt tên và vào phòng đầu');
  console.log('✓ 214 tệp dữ liệu/âm thanh/credit trong runtime, âm thanh phát thật, di chuyển và va chạm gốc');
  console.log('✓ thả phím khi mất tiêu điểm, GML ghi OPFS và nạp checkpoint sau khi tải lại trang');
  console.log('✓ hội thoại Toriel, chuyển vào trận gốc, bốn lệnh và thực hiện một lượt tấn công');

  const mobile = await browser.newContext({ hasTouch: true, isMobile: true,
    viewport: { width: 390, height: 844 } });
  const phone = await mobile.newPage();
  await phone.goto(`${origin}/`);
  await phone.waitForFunction(() => __undertale.phase === 'ready');
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 },
    { width: 844, height: 390 }, { width: 568, height: 320 }]) {
    await phone.setViewportSize(viewport);
    const layout = await phone.evaluate(() => {
      const canvas = document.getElementById('canvas').getBoundingClientRect();
      const start = document.getElementById('bootBtn').getBoundingClientRect();
      const status = document.getElementById('loadStatus').getBoundingClientRect();
      const buttons = [...document.querySelectorAll('[data-key]')].map((b) => b.getBoundingClientRect());
      return {
        outsideCanvas: buttons.every((r) => r.top >= canvas.bottom && r.right <= innerWidth && r.bottom <= innerHeight),
        startVisible: start.bottom <= status.top,
        separated: buttons.every((r, i) => buttons.every((s, j) => i === j ||
          r.right <= s.left || s.right <= r.left || r.bottom <= s.top || s.bottom <= r.top)),
      };
    });
    assert.deepEqual(layout, { outsideCanvas: true, startVisible: true, separated: true }, JSON.stringify(viewport));
  }
  await phone.setViewportSize({ width: 390, height: 844 });
  await phone.locator('#bootBtn').tap();
  await phone.waitForFunction(() => __undertale.room?.id === 1);
  await phone.waitForTimeout(350);
  await phone.locator('[data-key="90"]').tap();
  await phone.waitForFunction(() => __undertale.room?.id === 2);
  await mobile.close();
  console.log('✓ nút cảm ứng không chồng màn hình, tap Z điều khiển được logic gốc');

  const unsupported = await browser.newContext();
  await unsupported.addInitScript(() => { WebAssembly.Suspending = undefined; });
  const unsupportedPage = await unsupported.newPage();
  await unsupportedPage.goto(origin);
  await unsupportedPage.waitForFunction(() => __undertale.phase === 'error');
  assert.match(await unsupportedPage.locator('#loadStatus').textContent(), /JSPI/);
  assert.equal(await unsupportedPage.locator('#bootBtn').isDisabled(), false);
  await unsupported.close();
  const missing = await browser.newContext();
  const missingPage = await missing.newPage();
  await missingPage.route('**/assets/undertale/index.json', (route) => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ files: [{ name: 'missing.ogg', bytes: 1 }] }),
  }));
  await missingPage.goto(origin);
  await missingPage.waitForFunction(() => __undertale.phase === 'error');
  assert.match(await missingPage.locator('#loadStatus').textContent(), /missing\.ogg/);
  await missing.close();
  console.log('✓ báo lỗi rõ ràng khi thiếu JSPI hoặc thiếu tài nguyên');
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
  }
  await rm(fixture, { recursive: true, force: true });
}
