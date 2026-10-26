// Chạy GML đã biên dịch từ nguồn dự án bằng Butterscotch.
const canvas = document.getElementById('canvas');
const overlay = document.getElementById('boot');
const button = document.getElementById('bootBtn');
const status = document.getElementById('loadStatus');
const progress = document.getElementById('loadProgress');
const debug = new URL(location.href).searchParams.has('debug');
const state = window.__undertale = { phase: 'loading', room: null, logs: [], module: null, error: null };
const pressed = new Map();

function log(line) {
  state.logs.push(line);
  if (state.logs.length > 250) state.logs.shift();
  const room = line.match(/Room loaded: (\S+) \(room (\d+)\)/);
  if (room) state.room = { name: room[1], id: Number(room[2]) };
  console.info(line);
}

function fail(error) {
  releaseKeys();
  state.error = error.message;
  state.phase = 'error';
  overlay.hidden = false;
  overlay.dataset.error = 'true';
  status.textContent = `Không mở được trò chơi: ${error.message}`;
  button.textContent = 'TẢI LẠI';
  button.disabled = false;
  progress.hidden = true;
  console.error(error);
}

function sendKey(code, down, source) {
  if (state.phase !== 'running') return;
  const sources = pressed.get(code) ?? new Set();
  const wasDown = sources.size > 0;
  if (down) sources.add(source);
  else sources.delete(source);
  if (sources.size) pressed.set(code, sources);
  else pressed.delete(code);
  if (!wasDown && sources.size) state.module._onKeyDown(code);
  if (wasDown && !sources.size) state.module._onKeyUp(code);
}

function releaseKeys() {
  for (const code of pressed.keys()) state.module?._onKeyUp(code);
  pressed.clear();
  document.querySelectorAll('.tbtn.held').forEach((el) => el.classList.remove('held'));
}

async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.getElementById('frame').requestFullscreen();
  } catch (error) {
    console.warn('Không mở được chế độ toàn màn hình:', error.message);
  }
}

function keyCode(event) {
  const keys = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40,
    Enter: 13, NumpadEnter: 13, Escape: 27, Space: 32, ShiftLeft: 16, ShiftRight: 16,
    Backspace: 8, Tab: 9, ControlLeft: 17, ControlRight: 17 };
  if (keys[event.code]) return keys[event.code];
  if (/^Key[A-Z]$/.test(event.code)) return event.code.charCodeAt(3);
  if (/^Digit[0-9]$/.test(event.code)) return event.code.charCodeAt(5);
  if (/^F([1-9]|1[0-2])$/.test(event.code)) return 111 + Number(event.code.slice(1));
  return null;
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'F4') { event.preventDefault(); fullscreen(); return; }
  const code = keyCode(event);
  if (!code) return;
  if (state.phase === 'ready' && (code === 13 || code === 90)) {
    event.preventDefault();
    start();
    return;
  }
  if (state.phase !== 'running') return;
  event.preventDefault();
  if (!event.repeat) sendKey(code, true, event.code);
});
window.addEventListener('keyup', (event) => {
  const code = keyCode(event);
  if (code) sendKey(code, false, event.code);
});
window.addEventListener('blur', releaseKeys);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseKeys(); });
for (const control of document.querySelectorAll('[data-key]')) {
  const pointers = new Map();
  control.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    control.setPointerCapture(event.pointerId);
    control.classList.add('held');
    const source = Symbol('touch');
    pointers.set(event.pointerId, { source, started: performance.now() });
    sendKey(Number(control.dataset.key), true, source);
  });
  const release = (event) => {
    control.classList.remove('held');
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    pointers.delete(event.pointerId);
    // Logic gốc đọc phím giữ ở 30 FPS; giữ tap ngắn qua ít nhất một lượt đọc.
    window.setTimeout(() => sendKey(Number(control.dataset.key), false, pointer.source),
      Math.max(0, 50 - (performance.now() - pointer.started)));
  };
  control.addEventListener('pointerup', release);
  control.addEventListener('pointercancel', release);
  control.addEventListener('lostpointercapture', release);
}
document.getElementById('fullscreenBtn').addEventListener('click', fullscreen);
button.addEventListener('click', () => {
  if (state.phase === 'error' || state.phase === 'ended') location.reload();
  else start();
});

async function prepare() {
  if (typeof WebAssembly.Suspending !== 'function') {
    throw new Error('Trình duyệt chưa hỗ trợ WebAssembly JSPI. Hãy mở bằng Chrome/Chromium có JSPI.');
  }
  const { default: createModule } = await import('../vendor/butterscotch/butterscotch.mjs');
  state.module = await createModule({ canvas, print: log, printErr: (line) => console.warn(line) });
  const module = state.module;
  module.FS.mkdir('/game');
  const mounted = await module.ccall('mountOpfs', 'number', [], [], { async: true });
  if (mounted !== 0) throw new Error('Không mở được bộ nhớ lưu game của trình duyệt.');
  const base = new URL('../', import.meta.url);
  const response = await fetch(new URL('runtime.json', base));
  if (!response.ok) throw new Error('Không tải được danh sách tài nguyên.');
  const { files } = await response.json();
  let total = files.reduce((sum, file) => sum + file.bytes, 0);
  progress.max = total;
  let loaded = 0;
  let next = 0;
  const downloads = new AbortController();
  // Bốn lượt tải đồng thời; không giữ thêm một bản toàn bộ dữ liệu trong JS.
  const tasks = Array.from({ length: 4 }, async () => {
    while (next < files.length) {
      const file = files[next++];
      if (!/^[A-Za-z0-9_.-]+$/.test(file.name)) throw new Error('Tên tài nguyên không hợp lệ.');
      const result = await fetch(new URL(file.url, base), { signal: downloads.signal });
      if (!result.ok) throw new Error(`Thiếu tài nguyên ${file.name}.`);
      const bytes = new Uint8Array(await result.arrayBuffer());
      // GML đã biên dịch có thể làm thay đổi kích thước data.win.
      if (file.name === 'data.win') {
        total += bytes.length - file.bytes;
        progress.max = total;
      } else if (bytes.length !== file.bytes) {
        throw new Error(`Tài nguyên ${file.name} không đầy đủ.`);
      }
      module.FS.writeFile(`/game/${file.name}`, bytes);
      loaded += bytes.length;
      progress.value = loaded;
      status.textContent = `Đang tải ${Math.round(loaded / 1048576)} / ${Math.round(total / 1048576)} MB…`;
    }
  });
  try {
    await Promise.all(tasks);
  } catch (error) {
    downloads.abort();
    throw error;
  }
  state.phase = 'ready';
  status.textContent = 'Z / Enter để bắt đầu';
  button.textContent = 'CHƠI';
  button.disabled = false;
  progress.hidden = true;
}

async function start() {
  if (state.phase !== 'ready') return;
  const module = state.module;
  const args = ['/game/data.win', '--save-folder', '/butterscotch/undertale',
    '--os-type', 'windows', '--lazy-textures', '--disable-log-colors'];
  if (debug) args.push('--debug', '--dump-frame-json-file', '/snapshot.json');
  const strings = args.map((arg) => module.stringToNewUTF8(arg));
  const argv = module._malloc(strings.length * 4);
  strings.forEach((ptr, index) => module.setValue(argv + index * 4, ptr, 'i32'));
  state.phase = 'running';
  overlay.hidden = true;
  canvas.focus();
  try {
    const code = await module.ccall('startRunner', 'number', ['number', 'number'], [args.length, argv], { async: true });
    if (code !== 0) throw new Error(`Trò chơi dừng với mã ${code}.`);
    releaseKeys();
    state.phase = 'ended';
    overlay.hidden = false;
    status.textContent = 'Trò chơi đã đóng.';
    button.textContent = 'MỞ LẠI';
  } catch (error) {
    fail(error);
  } finally {
    strings.forEach((ptr) => module._free(ptr));
    module._free(argv);
  }
}

prepare().catch(fail);
