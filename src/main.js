// ============================================================
//  DƯỚI ĐẤT — điểm khởi động, các cảnh, vòng lặp chính
// ============================================================
import { R, W, H, Input, audio, Embers, Save, clamp, rand, hash2, pick, loadFonts } from './core.js';
import { art, loadLocalSprites, PLAYER_ART, PROP_ART } from './localassets.js';
import { drawSprite, drawLocal } from './sprites.js';
import { ROOMS, ENEMIES, ITEMS } from './data.js';
import { World } from './world.js';
import { Battle } from './battle.js';

function newPlayer() {
  return {
    name: 'Bạn',
    lv: 1,
    hp: 20,
    maxHp: 20,
    exp: 0,
    atk: 5,
    def: 0,
    gold: 0,
    items: { bread: 1 },
    kills: 0,
    spares: 0,
  };
}

const now = () => performance.now();

class Game {
  constructor() {
    this.player = newPlayer();
    this.flags = {};
    this.playtime = 0;
    this.scene = 'boot';
    this.suspended = false;
    this.battle = null;
    this.world = new World(this);
    this.embers = new Embers(46, { color: '#ff9a5c', speed: 12, drift: 16, size: 2 });
    this.menuIndex = 0;
    this.helpOpen = false;
    this.newGameConfirm = false;
    this.introPage = 0;
    this.introTimer = 0;
    this.endingType = 'true';
    this.endingTimer = 0;
    this.endingPage = 0;
    this.endingChoice = 0;
    this.toastText = '';
    this.toastColor = '#ffd166';
    this.toastTimer = 0;
    // có nhạc .ogg của bản game trên máy hay không (xem audio.detectLocalMusic)
    this.localMusic = false;
    // có sprite .png trích từ bản game trên máy hay không (xem loadLocalSprites)
    this.localArt = false;
    this.flash = 0;
    this.time = 0;
    this.titleIndex = 0;
  }

  // ---------------- tiện ích người chơi ----------------
  addItem(id, count = 1) {
    this.player.items[id] = (this.player.items[id] ?? 0) + count;
  }

  useItem(id) {
    const item = ITEMS[id];
    if (!item || (this.player.items[id] ?? 0) <= 0) return 0;
    if (this.player.hp >= this.player.maxHp) return 0;
    const healed = Math.min(item.heal, this.player.maxHp - this.player.hp);
    this.player.hp += healed;
    this.player.items[id] -= 1;
    if (this.player.items[id] <= 0) delete this.player.items[id];
    return healed;
  }

  heal(amount) {
    const healed = Math.min(amount, this.player.maxHp - this.player.hp);
    this.player.hp += healed;
    return healed;
  }

  healFull() {
    return this.heal(this.player.maxHp);
  }

  toast(text, color = '#ffd166') {
    this.toastText = text;
    this.toastColor = color;
    this.toastTimer = 2.4;
  }

  // ---------------- chuyển cảnh ----------------
  enterRoom(roomId, spawn = null) {
    this.scene = 'world';
    this.world.enter(roomId, spawn);
  }

  startBattle(enemyId, onEnd) {
    const enemy = ENEMIES[enemyId];
    audio.playMusic(enemy?.isBoss ? 'boss' : 'battle');
    this.scene = 'battle';
    this.battle = new Battle(this, enemyId, (result) => {
      this.battle = null;
      this.scene = 'world';
      audio.playMusic(this.world.room?.music ?? 'field', this.world.room?.id ?? null);
      if (onEnd) onEnd(result);
    });
  }

  suspend() {
    if (this.scene !== 'world' && this.scene !== 'battle') return;
    this.suspended = true;
    Input.clearAll();
  }

  onDeath() {
    this.scene = 'gameover';
    this.gameoverIndex = 0;
    this.endingTimer = 0;
    audio.playMusic('gameover');
  }

  finishGame(result) {
    this.endingType = result === 'kill' ? 'dark' : this.player.kills === 0 ? 'true' : 'neutral';
    this.scene = 'ending';
    this.endingTimer = 0;
    this.endingPage = 0;
    audio.playMusic('ending');
  }

  toTitle() {
    this.suspended = false;
    this.scene = 'title';
    this.menuIndex = 0;
    this.helpOpen = false;
    this.newGameConfirm = false;
    audio.playMusic('title');
  }

  // ---------------- bắt đầu / tiếp tục ----------------
  startNewGame() {
    this.newGameConfirm = false;
    this.suspended = false;
    this.player = newPlayer();
    this.flags = {};
    this.playtime = 0;
    this.scene = 'intro';
    this.introPage = 0;
    this.introTimer = 0;
  }

  loadGame() {
    const data = Save.read();
    if (!data) return false;
    this.suspended = false;
    const fresh = newPlayer();
    this.player = { ...fresh, ...(data.player ?? {}) };
    this.player.items = { ...(data.player?.items ?? fresh.items) };
    this.flags = { ...(data.flags ?? {}) };
    this.playtime = data.playtime ?? 0;
    this.scene = 'world';
    this.world.enter(data.roomId ?? 'wake', data.spawn ?? null);
    return true;
  }
}

const game = new Game();
window.__duoidat = game; // tiện cho việc kiểm thử
window.__audio = audio; // tiện cho việc kiểm thử phần nhạc
window.__art = art; // tiện cho việc kiểm thử phần sprite gốc

// ------------------------------------------------------------
// Nền tiêu đề dùng chung
// ------------------------------------------------------------
function drawCaveBackdrop(tint = 0) {
  const ctx = R.ctx;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, tint ? '#140c12' : '#0b0c16');
  grad.addColorStop(0.55, '#07070d');
  grad.addColorStop(1, '#020204');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // trần hang
  ctx.fillStyle = '#05050a';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, 52);
  for (let x = W; x >= 0; x -= 26) {
    ctx.lineTo(x, 46 + Math.sin(x * 0.03) * 12 + hash2(x, 7) * 22);
  }
  ctx.closePath();
  ctx.fill();

  // vệt sáng từ trên
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const shaft = ctx.createLinearGradient(W / 2, 0, W / 2, 460);
  shaft.addColorStop(0, tint ? 'rgba(255,140,90,0.20)' : 'rgba(150,190,255,0.13)');
  shaft.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 60, 0);
  ctx.lineTo(W / 2 + 60, 0);
  ctx.lineTo(W / 2 + 190, 470);
  ctx.lineTo(W / 2 - 190, 470);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // núi xa
  ctx.fillStyle = '#0a0a12';
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, 380);
  ctx.lineTo(120, 250);
  ctx.lineTo(230, 350);
  ctx.lineTo(330, 210);
  ctx.lineTo(430, 340);
  ctx.lineTo(560, 240);
  ctx.lineTo(W, 350);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // tàn tích
  ctx.fillStyle = '#07070c';
  ctx.fillRect(96, 330, 60, 150);
  ctx.fillRect(104, 300, 44, 30);
  ctx.fillRect(470, 340, 70, 140);
  ctx.fillRect(478, 306, 54, 34);
}

function drawStars(t) {
  const ctx = R.ctx;
  ctx.save();
  for (let i = 0; i < 46; i++) {
    const x = (hash2(i, 1) * W);
    const y = hash2(i, 2) * 190;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + hash2(i, 3)) + i));
    ctx.globalAlpha = tw * 0.6;
    ctx.fillStyle = '#cfd8ff';
    ctx.fillRect(Math.round(x), Math.round(y), hash2(i, 4) > 0.8 ? 2 : 1, 1);
  }
  ctx.restore();
}

// ------------------------------------------------------------
// Cảnh: màn hình tiêu đề
// ------------------------------------------------------------
const TITLE_ITEMS = ['BẮT ĐẦU', 'TIẾP TỤC', 'HƯỚNG DẪN', 'ÂM THANH'];

function updateTitle(dt) {
  game.embers.update(dt);
  if (game.newGameConfirm) {
    if (Input.consume('cancel')) {
      game.newGameConfirm = false;
      audio.cancel();
    } else if (Input.consume('confirm')) {
      audio.confirm();
      game.startNewGame();
    }
    return;
  }
  if (game.helpOpen) {
    if (Input.consume('confirm') || Input.consume('cancel')) {
      game.helpOpen = false;
      audio.cancel();
    }
    return;
  }
  const hasSave = Save.exists();
  const count = TITLE_ITEMS.length;
  if (Input.consume('up')) {
    game.titleIndex = (game.titleIndex - 1 + count) % count;
    audio.select();
  }
  if (Input.consume('down')) {
    game.titleIndex = (game.titleIndex + 1) % count;
    audio.select();
  }
  if (Input.consume('confirm')) {
    const item = TITLE_ITEMS[game.titleIndex];
    if (item === 'TIẾP TỤC') {
      if (!hasSave) {
        audio.cancel();
        game.toast('Chưa có hành trình nào được lưu.', '#c46a6a');
      } else if (game.loadGame()) {
        audio.confirm();
        game.toast('Đã quay lại điểm lửa gần nhất.');
      }
    } else if (item === 'HƯỚNG DẪN') {
      game.helpOpen = true;
      audio.confirm();
    } else if (item === 'ÂM THANH') {
      const muted = audio.toggleMuted();
      game.toast(muted ? 'Đã tắt âm thanh (M)' : 'Đã bật âm thanh (M)');
    } else {
      audio.confirm();
      if (hasSave) game.newGameConfirm = true;
      else game.startNewGame();
    }
  }
}

function drawTitle(dt) {
  const ctx = R.ctx;
  const logo = art.get('spr_undertaletitle_0.png'); // ảnh tiêu đề gốc 320×240 (nền đen + logo + tim đỏ)
  if (logo) {
    // y như màn hình tiêu đề gốc: ảnh phóng 2× kín màn hình
    R.image(logo, 0, 0, 2);
    // phụ đề tiếng Việt ngay dưới logo
    R.text('DƯỚI ĐẤT — một câu chuyện dưới tầng tro', W / 2, 298, {
      size: 12,
      align: 'center',
      spacing: 2,
      color: '#6f6a60',
      shadow: false,
    });
  } else {
    drawCaveBackdrop(Math.sin(game.time * 0.4) > 0.4 ? 1 : 0);
    drawStars(game.time);
    game.embers.draw();

    const glow = 0.5 + 0.2 * Math.sin(game.time * 1.2);
    R.glow(W / 2, 120, 220, '#ff8a3d', glow * 0.22);
    R.text('DƯỚI', W / 2, 58, { size: 66, bold: true, align: 'center', spacing: 12, color: '#f6efe2' });
    R.text('ĐẤT', W / 2, 118, { size: 66, bold: true, align: 'center', spacing: 12, color: '#f6efe2' });
    R.text('một câu chuyện dưới tầng tro', W / 2, 196, {
      size: 15,
      align: 'center',
      italic: true,
      color: '#c9b98e',
      spacing: 2,
    });

    // thực thể nhỏ bên cạnh tiêu đề
    const bob = Math.sin(game.time * 2) * 3;
    const domArt = art.get(PROP_ART.dom);
    if (domArt) R.image(domArt, W / 2 + 178, 168 + bob, 3, { anchor: 'bottom-center' });
    else drawSprite('dom', W / 2 + 178, 168 + bob, 2, {});
    R.glow(W / 2 + 178, 152 + bob, 30, '#ffd166', 0.35);
  }

  // menu
  const hasSave = Save.exists();
  const baseY = logo ? 322 : 258;
  const rowH = logo ? 26 : 40;
  const mx = logo ? 172 : W / 2;
  TITLE_ITEMS.forEach((label, i) => {
    const y = baseY + i * rowH;
    const selected = i === game.titleIndex;
    const disabled = label === 'TIẾP TỤC' && !hasSave;
    const text = label === 'ÂM THANH' ? `${label}: ${audio.muted ? 'TẮT' : 'BẬT'}` : label;
    if (selected) {
      // con trỏ tim đỏ như bản gốc
      R.heart(mx - 26, y + (logo ? 3 : 6), logo ? 1.7 : 2, logo ? '#ff0000' : '#ffd166', !logo);
      if (!logo) {
        ctx.save();
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = '#ffb347';
        ctx.fillRect(W / 2 - 150, y - 4, 300, 32);
        ctx.restore();
      }
    }
    R.text(text, mx, y, {
      size: logo ? 16 : 22,
      bold: !logo,
      align: logo ? 'left' : 'center',
      spacing: logo ? 1 : 3,
      shadow: !logo,
      color: disabled ? '#565049' : selected ? '#fff' : logo ? '#8c8c8c' : '#c9c2b4',
    });
  });

  // thông tin lưu
  if (hasSave) {
    const data = Save.read();
    const room = ROOMS[data.roomId];
    const mins = Math.floor((data.playtime ?? 0) / 60);
    const secs = (data.playtime ?? 0) % 60;
    if (logo) {
      // chữ nhỏ mờ như dòng nhắc của bản gốc
      const sx = 392;
      R.text('HÀNH TRÌNH GẦN NHẤT', sx, 322, { size: 11, color: '#5b554e', spacing: 1, shadow: false });
      R.text(room?.title ?? '?', sx, 338, { size: 14, color: '#a8a294', spacing: 1 });
      R.text(`LV ${data.player?.lv ?? 1} · Tro ${data.player?.gold ?? 0} · ${mins}p${String(secs).padStart(2, '0')}s`, sx, 358, {
        size: 11,
        color: '#6f6a60',
        shadow: false,
      });
      R.text(`Tha ${data.player?.spares ?? 0} · Hạ ${data.player?.kills ?? 0}`, sx, 374, {
        size: 11,
        color: '#6f6a60',
        shadow: false,
      });
    } else {
      R.box(W - 226, 250, 206, 88, { fill: 'rgba(5,5,10,0.7)', border: '#3a3540', lw: 1 });
      R.text('HÀNH TRÌNH GẦN NHẤT', W - 206, 262, { size: 11, color: '#8d877c', spacing: 1 });
      R.text(room?.title ?? '?', W - 206, 282, { size: 17, bold: true, color: '#ffd166' });
      R.text(`LV ${data.player?.lv ?? 1} · ${mins}p${String(secs).padStart(2, '0')}s · ${data.player?.gold ?? 0} tro`, W - 206, 306, {
        size: 12,
        color: '#a8a294',
      });
      R.text(`Tha ${data.player?.spares ?? 0} · Hạ ${data.player?.kills ?? 0}`, W - 206, 322, { size: 12, color: '#a8a294' });
    }
  }

  R.text('Z / Enter: chọn · ↑↓: di chuyển · M: tắt tiếng · F: toàn màn hình', W / 2, H - (logo ? 24 : 30), {
    size: logo ? 11 : 12,
    align: 'center',
    color: logo ? '#4f4a44' : '#6f6a60',
    shadow: !logo,
  });

  if (game.helpOpen) drawHelp();
  if (game.newGameConfirm) {
    R.fade(0.8);
    R.frame(70, 156, 500, 168, { border: '#ffffff', fill: '#000000', lw: 5 });
    R.text('BẮT ĐẦU HÀNH TRÌNH MỚI?', W / 2, 176, { size: 22, bold: true, align: 'center', color: '#ffd166' });
    R.text('Điểm lưu tiếp theo sẽ ghi đè hành trình cũ.', W / 2, 218, { size: 17, align: 'center' });
    R.text('Z / Enter: bắt đầu · X / Esc: quay lại', W / 2, 274, { size: 16, align: 'center', color: '#a8a294' });
  }
  drawToast();
}

function drawHelp() {
  R.fade(0.72);
  R.frame(60, 40, 520, 400, { border: '#ffffff', fill: 'rgba(0,0,0,0.97)', lw: 5 });
  R.text('HƯỚNG DẪN', W / 2, 58, { size: 24, bold: true, align: 'center', spacing: 5 });
  const rows = [
    ['MŨI TÊN / WASD', 'Đi lại, chọn mục'],
    ['Z / Enter / Space', 'Trò chuyện, xác nhận, vung tay'],
    ['X / Esc', 'Mở túi đồ, quay lại'],
    ['M', 'Bật / tắt âm thanh'],
    ['F', 'Toàn màn hình'],
    ['P / nút Ⅱ', 'Tạm dừng, tiếp tục kể cả trong trận'],
    ['Trong trận đánh:', ''],
    ['ĐÁNH', 'Canh vạch giữa để gây sát thương lớn'],
    ['NÓI', 'Trò chuyện để tăng HƠI ẤM'],
    ['ĐỒ', 'Dùng vật phẩm hồi HP'],
    ['THA', 'Tha mạng khi HƠI ẤM đã đầy'],
  ];
  rows.forEach(([keys, desc], i) => {
    const y = 104 + i * 24;
    if (!keys && !desc) return;
    R.text(keys, 96, y, { size: 15, bold: true, color: '#ffd166' });
    R.text(desc, 300, y, { size: 15, color: '#d8d2c4' });
  });
  R.text('Bạn có thể đi hết hành trình mà không giết ai cả.', W / 2, 386, {
    size: 13,
    align: 'center',
    italic: true,
    color: '#9fd48c',
  });
  R.text('Z hoặc X để đóng', W / 2, 412, { size: 12, align: 'center', color: '#8d877c' });
}

// ------------------------------------------------------------
// Cảnh: mở đầu
// ------------------------------------------------------------
const INTRO_PAGES = [
  ['Có một cái hố dưới chân núi Tro.', 'Người ta nói ai rơi xuống đó cũng không trở về.'],
  ['Nhưng đôi khi, những thứ bị bỏ quên', 'chỉ đang chờ một ai đó nhặt lên.'],
  ['Bạn rơi rất lâu.', 'Đủ lâu để nghe thấy tiếng tro thì thầm dưới chân mình.'],
];

function updateIntro(dt) {
  game.embers.update(dt);
  game.introTimer += dt;
  if (Input.consume('confirm') || Input.consume('cancel')) {
    audio.select();
    game.introPage += 1;
    game.introTimer = 0;
    if (game.introPage >= INTRO_PAGES.length) {
      game.flash = 1;
      game.enterRoom('wake', ROOMS.wake.spawn);
    }
  }
}

function drawIntro() {
  const ctx = R.ctx;
  R.clear('#030305');
  const page = INTRO_PAGES[clamp(game.introPage, 0, INTRO_PAGES.length - 1)];
  // giếng sáng
  const shaft = ctx.createLinearGradient(W / 2, 0, W / 2, H);
  shaft.addColorStop(0, 'rgba(140,170,255,0.14)');
  shaft.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 48, 0);
  ctx.lineTo(W / 2 + 48, 0);
  ctx.lineTo(W / 2 + 150, H);
  ctx.lineTo(W / 2 - 150, H);
  ctx.closePath();
  ctx.fill();

  // nhân vật nhỏ đang rơi
  const fall = (game.introTimer * 90) % 620;
  const y = 60 + fall;
  R.glow(W / 2, y, 40, '#ffd166', 0.4);
  {
    const frames = PLAYER_ART.down;
    const frame = frames[Math.floor(game.time * 7) % frames.length];
    if (!drawLocal([frame, frames[0]], W / 2, y, 2, { alpha: clamp(1 - fall / 620, 0.15, 1) })) {
      drawSprite('playerDown', W / 2, y, 2, { alpha: clamp(1 - fall / 620, 0.15, 1) });
    }
  }
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#ffd166';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(W / 2 - 6 + Math.sin(game.time * 3 + i) * 8, y - 20 - i * 14, 3, 3);
  }
  ctx.restore();

  game.embers.draw();

  const alpha = clamp(game.introTimer * 1.4, 0, 1);
  page.forEach((line, i) => {
    R.text(line, W / 2, H - 170 + i * 34, {
      size: 19,
      align: 'center',
      italic: true,
      color: '#e8e2d4',
      alpha,
    });
  });
  if (game.introTimer > 1.2) {
    const blink = 0.4 + 0.6 * Math.abs(Math.sin(game.time * 3));
    R.text('Z để tiếp tục', W / 2, H - 54, { size: 13, align: 'center', color: '#8d877c', alpha: blink });
  }
  R.fade(clamp(1 - game.introTimer * 2, 0, 1) * 0.6);
}

// ------------------------------------------------------------
// Cảnh: thua cuộc
// ------------------------------------------------------------
const GAMEOVER_ITEMS = ['TIẾP TỤC TỪ ĐIỂM LỬA', 'THỬ LẠI TỪ ĐẦU', 'VỀ MÀN HÌNH CHÍNH'];

function updateGameover(dt) {
  game.embers.update(dt);
  game.endingTimer += dt;
  const hasSave = Save.exists();
  const count = GAMEOVER_ITEMS.length;
  if (Input.consume('up')) {
    game.gameoverIndex = (game.gameoverIndex - 1 + count) % count;
    audio.select();
  }
  if (Input.consume('down')) {
    game.gameoverIndex = (game.gameoverIndex + 1) % count;
    audio.select();
  }
  if (Input.consume('confirm')) {
    const item = GAMEOVER_ITEMS[game.gameoverIndex];
    if (item === 'TIẾP TỤC TỪ ĐIỂM LỬA' && !hasSave) {
      audio.cancel();
      game.toast('Chưa có hành trình nào được lưu.', '#c46a6a');
      return;
    }
    audio.confirm();
    if (item === 'TIẾP TỤC TỪ ĐIỂM LỬA' && hasSave) {
      game.loadGame();
    } else if (item === 'THỬ LẠI TỪ ĐẦU') {
      game.startNewGame();
    } else {
      game.toTitle();
    }
  }
}

function drawGameover() {
  const ctx = R.ctx;
  R.clear('#0d0206');
  game.embers.opts.color = '#ff5a5a';
  game.embers.draw();
  const a = clamp(game.endingTimer * 1.2, 0, 1);
  R.glow(W / 2, 150, 220, '#ff3a3a', 0.20);
  // tim vỡ
  const pieces = [
    [-30, -6, -22], [0, -6, -8], [30, -6, 14], [-14, 8, -6], [16, 8, 8],
  ];
  pieces.forEach(([dx, dy, rot], i) => {
    ctx.save();
    ctx.translate(W / 2 + dx + Math.sin(game.endingTimer * 0.8 + i) * 3, 150 + dy + (game.endingTimer * 10) % 20);
    ctx.rotate((rot * Math.PI) / 180);
    R.heart(-14, -12, 4, '#e5484d', false);
    ctx.restore();
  });
  R.text('BẠN ĐÃ NGÃ XUỐNG', W / 2, 240, { size: 30, bold: true, align: 'center', spacing: 6, color: '#ff8a8a', alpha: a });
  R.text('Nhưng dưới tầng tro, hơi ấm vẫn chưa tắt hẳn.', W / 2, 288, {
    size: 15,
    align: 'center',
    italic: true,
    color: '#c9b98e',
    alpha: a,
  });

  const hasSave = Save.exists();
  GAMEOVER_ITEMS.forEach((label, i) => {
    const y = 336 + i * 38;
    const selected = i === game.gameoverIndex;
    const disabled = i === 0 && !hasSave;
    if (selected) R.heart(W / 2 - 176, y + 5, 2, '#ffd166');
    R.text(label, W / 2, y, {
      size: 18,
      bold: true,
      align: 'center',
      spacing: 2,
      color: disabled ? '#4e4841' : selected ? '#fff' : '#c9c2b4',
    });
  });
  R.text('Z: chọn', W / 2, H - 26, { size: 12, align: 'center', color: '#6f6a60' });
  drawToast();
}

// ------------------------------------------------------------
// Cảnh: kết thúc
// ------------------------------------------------------------
const ENDINGS = {
  true: {
    title: 'BÌNH MINH TRO',
    subtitle: 'kết thúc: không ai bị bỏ lại',
    tint: 1,
    lines: [
      'Vua Tro không tan biến.',
      'Ngài đứng dậy khỏi ngai, lần đầu tiên sau cả ngàn năm.',
      'Ngọn lửa nhỏ bạn trao đi cháy lan khắp Hầm Tro —',
      'không nóng, chỉ đủ ấm để người ta thôi run.',
      'Trên mặt đất, một cô bé ngẩng lên khỏi cửa hang,',
      'trong tay là ngọn đèn lồng có một con đom đóm đang ngủ.',
    ],
  },
  neutral: {
    title: 'BÌNH MINH NHỎ',
    subtitle: 'kết thúc: có những vết tro không thể phủi sạch',
    tint: 1,
    lines: [
      'Vua Tro được tha, và Hầm Tro sáng lại.',
      'Nhưng trong lòng bạn vẫn còn vài cái tên không thể trả về.',
      'Ngọn lửa mới vẫn cháy —',
      'chỉ là bóng của nó dài hơn một chút.',
    ],
  },
  dark: {
    title: 'TRO LẠNH',
    subtitle: 'kết thúc: ngọn lửa cuối cùng đã tắt',
    tint: 0,
    lines: [
      'Vua Tro gục xuống, và cùng ngài, cả Hầm Tro lịm đi.',
      'Bạn bước ra khỏi hang khi bầu trời chưa kịp sáng.',
      'Đom không nói gì nữa.',
      'Ánh sáng của cậu ấy nhỏ dần, nhỏ dần... rồi tắt hẳn.',
    ],
  },
};

function updateEnding(dt) {
  game.embers.update(dt);
  game.endingTimer += dt;
  const ending = ENDINGS[game.endingType];
  const pages = ending.lines.length;
  if (Input.consume('confirm') || Input.consume('cancel')) {
    if (game.endingPage < pages) {
      game.endingPage += 1;
      game.endingTimer = 0;
      audio.select();
    } else {
      Save.clear();
      audio.confirm();
      game.toTitle();
    }
  }
}

function drawEnding() {
  const ctx = R.ctx;
  const ending = ENDINGS[game.endingType];
  const t = game.endingTimer;
  const warm = ending.tint === 1;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  if (warm) {
    grad.addColorStop(0, '#2a1a14');
    grad.addColorStop(0.6, '#120b0c');
    grad.addColorStop(1, '#050405');
  } else {
    grad.addColorStop(0, '#0a0c14');
    grad.addColorStop(0.6, '#07070c');
    grad.addColorStop(1, '#030304');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // vầng sáng bình minh
  if (warm) {
    const r = 180 + Math.sin(t * 0.6) * 10;
    R.glow(W / 2, H - 150, r, '#ff9a4d', 0.22);
    R.glow(W / 2, H - 150, r * 0.5, '#ffd166', 0.20);
  }

  game.embers.opts.color = warm ? '#ffb066' : '#8d8d9c';
  game.embers.opts.speed = warm ? 16 : 7;
  game.embers.draw();

  // bóng lưng nhân vật đi về phía bình minh
  {
    const frames = PLAYER_ART.up;
    const frame = frames[Math.floor(t * 6) % frames.length];
    if (!drawLocal([frame, frames[0]], W / 2 + Math.sin(t * 0.3) * 6, H - 84, 2.4, { alpha: 0.9 })) {
      drawSprite('playerUp', W / 2 + Math.sin(t * 0.3) * 6, H - 84, 2.4, { alpha: 0.9 });
    }
  }

  const lines = ending.lines;
  if (game.endingPage < lines.length) {
    const line = lines[game.endingPage];
    const alpha = clamp(t * 1.4, 0, 1);
    R.text(line, W / 2, 92, { size: 19, align: 'center', italic: true, color: '#e8e2d4', alpha });
    R.text(`${game.endingPage + 1} / ${lines.length}`, W / 2, 132, { size: 11, align: 'center', color: '#6f6a60', alpha });
  } else {
    const alpha = clamp(t * 1.2, 0, 1);
    R.glow(W / 2, 150, 250, warm ? '#ff8a3d' : '#5a7fd8', 0.24);
    R.text(ending.title, W / 2, 118, { size: 40, bold: true, align: 'center', spacing: 10, color: warm ? '#f6efe2' : '#b8c4de', alpha });
    R.text(ending.subtitle, W / 2, 172, { size: 14, align: 'center', italic: true, color: '#c9b98e', alpha });
    const p = game.player;
    R.box(W / 2 - 170, 212, 340, 110, { fill: 'rgba(5,5,10,0.6)', border: '#3a3540', lw: 1, alpha });
    R.text(`LV ${p.lv} · Tha ${p.spares} · Hạ ${p.kills}`, W / 2, 232, { size: 16, align: 'center', color: '#ffd166', alpha });
    R.text(`Tro ${p.gold} · Thời gian ${formatTime(game.playtime)}`, W / 2, 262, { size: 14, align: 'center', color: '#a8a294', alpha });
    R.text(
      game.endingType === 'dark' ? 'Lần sau, hãy thử nghe trước khi đánh.' : 'Cảm ơn bạn đã đi hết con đường này.',
      W / 2,
      292,
      { size: 13, align: 'center', italic: true, color: '#8d877c', alpha }
    );
    const blink = 0.4 + 0.6 * Math.abs(Math.sin(game.time * 3));
    R.text('Z để trở về màn hình chính', W / 2, H - 30, { size: 14, align: 'center', color: '#c9b98e', alpha: blink * alpha });
  }
  drawToast();
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}p${String(s).padStart(2, '0')}s`;
}

// ------------------------------------------------------------
// Toast
// ------------------------------------------------------------
function drawToast() {
  if (game.toastTimer <= 0) return;
  // trong trận đấu chỗ đó là tên kẻ địch nên không hiện thông báo
  if (game.scene === 'battle') return;
  const a = clamp(game.toastTimer / 0.5, 0, 1) * clamp((2.4 - game.toastTimer) / 0.25, 0, 1);
  const w = R.measure(game.toastText, 15, true) + 40;
  R.box(W / 2 - w / 2, 6, w, 34, { fill: 'rgba(5,5,10,0.9)', border: '#ffd166', lw: 1, alpha: a });
  R.text(game.toastText, W / 2, 14, { size: 15, bold: true, align: 'center', color: game.toastColor, alpha: a });
}

// ------------------------------------------------------------
// Vòng lặp
// ------------------------------------------------------------
function update(dt) {
  if (game.suspended) {
    if (!document.hidden && (Input.consume('pause') || Input.consume('confirm') || Input.consume('cancel'))) {
      game.suspended = false;
      Input.clearAll();
      audio.resume();
    }
    return;
  }
  if ((game.scene === 'world' || game.scene === 'battle') && Input.consume('pause')) {
    game.suspend();
    return;
  }
  game.time += dt;
  audio.update();

  if (Input.consume('mute')) {
    const muted = audio.toggleMuted();
    game.toast(muted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh');
  }
  if (Input.consume('fullscreen')) {
    const stage = document.getElementById('stage');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stage?.requestFullscreen?.().catch(() => {});
  }

  game.embers.update(dt);
  if (game.toastTimer > 0) game.toastTimer -= dt;
  if (game.flash > 0) game.flash = Math.max(0, game.flash - dt * 2);

  const playing = game.scene === 'world' || game.scene === 'battle';
  if (playing) game.playtime += dt;

  switch (game.scene) {
    case 'title':
      updateTitle(dt);
      break;
    case 'intro':
      updateIntro(dt);
      break;
    case 'world':
      game.embers.opts.color = '#ff9a5c';
      game.embers.opts.speed = 10;
      game.world.update(dt);
      break;
    case 'battle':
      game.battle?.update(dt);
      break;
    case 'gameover':
      updateGameover(dt);
      break;
    case 'ending':
      updateEnding(dt);
      break;
    default:
      break;
  }
}

function draw() {
  R.begin();
  switch (game.scene) {
    case 'title':
      drawTitle();
      break;
    case 'intro':
      drawIntro();
      break;
    case 'world':
      game.world.draw();
      drawToast();
      break;
    case 'battle':
      game.battle?.draw();
      drawToast();
      break;
    case 'gameover':
      drawGameover();
      break;
    case 'ending':
      drawEnding();
      break;
    default:
      R.clear('#05050a');
      break;
  }
  if (game.flash > 0) R.fade(game.flash * 0.85, '#fff');
  if (game.suspended) {
    R.fade(0.8);
    R.frame(100, 170, 440, 132, { border: '#ffffff', fill: '#000000', lw: 5 });
    R.text('TẠM DỪNG', W / 2, 190, { size: 26, bold: true, align: 'center', color: '#ffd166' });
    R.text('P / Z / Enter / X để tiếp tục', W / 2, 242, { size: 18, align: 'center', color: '#ffffff' });
    R.text('Trên điện thoại: chạm Ⅱ, Z hoặc X', W / 2, 274, { size: 14, align: 'center', color: '#a8a294' });
  }
  R.end();
}

let last = now();
let errorCount = 0;
function frame() {
  const t = now();
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  try {
    update(dt);
    draw();
  } catch (err) {
    errorCount += 1;
    if (errorCount < 5) console.error('Lỗi khung hình:', err);
    if (errorCount === 5) console.error('(Các lỗi tiếp theo sẽ được ẩn bớt.)');
  }
  Input.endFrame();
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------
// Khởi động
// ------------------------------------------------------------
function boot() {
  const canvas = document.getElementById('game');
  R.init(canvas);
  Input.attach(document);

  // nạp font pixel trước khi vẽ để chữ không bị đổi giữa chừng
  loadFonts().then((ok) => {
    if (!ok) console.warn('Không nạp được font pixel, dùng font dự phòng.');
  });

  // tìm nhạc gốc trên máy (nếu có); không có thì dùng nhạc tự tổng hợp
  audio.detectLocalMusic().then((ok) => {
    game.localMusic = ok;
    if (ok) console.info(`Nhạc gốc lấy từ: ${audio.localDir ?? '(không rõ đường dẫn)'}`);
  });

  const overlay = document.getElementById('boot');
  const bootLogo = document.getElementById('bootLogo');

  // tìm sprite gốc trên máy (nếu có); không có thì vẽ bằng art tự sinh
  loadLocalSprites().then((ok) => {
    game.localArt = ok;
    if (!ok) return;
    console.info(`Sprite gốc lấy từ: ${art.dir ?? '(không rõ đường dẫn)'} (${art.count} ảnh)`);

    // màn hình chờ kiểu bản gốc: máy có ảnh tiêu đề gốc thì hiện y như màn hình gốc
    const logo = art.get('spr_undertaletitle_0.png');
    if (!logo || !bootLogo) return;
    bootLogo.addEventListener('load', () => {
      bootLogo.hidden = false;
      overlay.classList.add('has-logo');
    });
    bootLogo.src = logo.src; // ảnh đã nạp sẵn nên hiện ngay
  });

  const start = () => {
    if (overlay.classList.contains('hide')) return;
    overlay.classList.add('hide');
    audio.init();
    audio.resume();
    audio.playMusic('title');
    game.scene = 'title';
    if (game.localMusic) {
      window.setTimeout(() => game.toast('Nhạc: lấy từ bản game trên máy', '#9fd48c'), 1400);
    }
    if (game.localArt) {
      window.setTimeout(() => game.toast('Hình ảnh: lấy từ bản game trên máy', '#9fd48c'), 3400);
    }
    window.setTimeout(() => overlay.remove(), 1000);
  };
  document.getElementById('bootBtn')?.addEventListener('click', start);
  overlay.addEventListener('click', start);
  window.addEventListener('keydown', (e) => {
    if (game.scene === 'boot') {
      e.preventDefault();
      start();
    }
  });
  window.addEventListener('pointerdown', () => audio.resume(), { once: false });
  window.addEventListener('blur', () => game.suspend());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) game.suspend();
    else audio.resume();
  });

  // cho phép bỏ qua màn hình chờ khi kiểm thử: #play
  if (location.hash === '#play') {
    window.setTimeout(start, 60);
  }

  requestAnimationFrame(frame);
}

boot();
