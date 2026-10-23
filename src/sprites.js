// ============================================================
//  Sprite pixel tự vẽ — toàn bộ nhân vật trong game
// ============================================================
import { R } from './core.js';

const P = {
  h: '#3b2733', // tóc
  f: '#f2cfa8', // da
  e: '#241a2a', // mắt
  m: '#a45a5a', // miệng
  s: '#e4573d', // khăn quàng
  c: '#2f4a63', // áo
  l: '#41678a', // áo sáng
  p: '#2b2733', // quần
  b: '#17151d', // giày
};

const NPC = {
  g: '#ffd166', // Đom: quầng sáng
  l: '#ff9a3d',
  y: '#fff3c4',
  c: '#c9b98e', // Bà Mốc: mũ nấm
  w: '#efe6c8',
  F: '#e8c9a0', // da
  E: '#2b1b25',
  M: '#8a5a4a',
  G: '#5f7c4a', // khăn
  L: '#8fae63',
  R: '#c0d38a',
  S: '#7a5c46', // Nhím: gai
  A: '#e6bd97', // mặt
  B: '#8a5c3a',
  D: '#3f5d7a', // tạp dề
  O: '#2b2b38',
};

const ENEMY = {
  s: '#5d7a4a', // Bọ Rêu: mai
  S: '#7f9c5f',
  d: '#3c5232',
  e: '#f2f0d8',
  p: '#20200f',
  a: '#8a6b3a',
  l: '#2f3a26',
  m: '#b56a86', // Nấm Buồn: mũ
  M: '#d98ba4',
  w: '#f4dfe6',
  b: '#8a7a6a',
  x: '#4a4a52',
  k: '#6a6a76', // Chim Tro: lông
  K: '#8d8d9c',
  W: '#efe9df',
  o: '#ff9a3d',
};

export const SPRITES = {
  // ---------------- nhân vật chính ----------------
  playerDown: {
    palette: P,
    rows: [
      '................',
      '......hhhh......',
      '.....hhhhhh.....',
      '....hhhhhhhh....',
      '....hffffffh....',
      '....hfeffefh....',
      '....hffffffh....',
      '.....ffmmff.....',
      '....ssssssss....',
      '...ssssssssss...',
      '...sccccccccs...',
      '..cccccccccccc..',
      '..clccccccclcc..',
      '..cccccccccccc..',
      '...cccccccccc...',
      '....cccccccc....',
      '....pppppppp....',
      '....pppppppp....',
      '....ppp..ppp....',
      '...bbbb..bbbb...',
      '...bbbb..bbbb...',
      '................',
    ],
  },
  playerUp: {
    palette: P,
    rows: [
      '................',
      '......hhhh......',
      '.....hhhhhh.....',
      '....hhhhhhhh....',
      '....hhhhhhhh....',
      '....hhhhhhhh....',
      '....hhhhhhhh....',
      '.....hhhhhh.....',
      '....ssssssss....',
      '...ssssssssss...',
      '...sccccccccs...',
      '..cccccccccccc..',
      '..clccccccclcc..',
      '..cccccccccccc..',
      '...cccccccccc...',
      '....cccccccc....',
      '....pppppppp....',
      '....pppppppp....',
      '....ppp..ppp....',
      '...bbbb..bbbb...',
      '...bbbb..bbbb...',
      '................',
    ],
  },
  playerSide: {
    palette: P,
    rows: [
      '................',
      '......hhhh......',
      '.....hhhhhhh....',
      '....hhhhhhhh....',
      '....hhhffffh....',
      '....hhhfeffh....',
      '....hhhffffh....',
      '.....ssfffs.....',
      '....ssssssss....',
      '...sssssssss....',
      '....cccccccc....',
      '...cccccccccc...',
      '...clccccccc....',
      '...cccccccccc...',
      '....cccccccc....',
      '....cccccc......',
      '....pppppp......',
      '....pppppp......',
      '....ppp.ppp.....',
      '...bbbb.bbbb....',
      '...bbbb.bbbb....',
      '................',
    ],
  },

  // ---------------- NPC ----------------
  dom: {
    palette: NPC,
    rows: [
      '.........',
      '...ggg...',
      '..glllg..',
      '.glyyyylg',
      '..glllg..',
      '...ggg...',
      '.........',
    ],
  },
  baMoc: {
    palette: NPC,
    rows: [
      '....................',
      '......cccccccc......',
      '....cccccccccccc....',
      '...cccccccccccccc...',
      '..cccccccccccccccc..',
      '..cccccccccccccccc..',
      '.cccwwccccccccwwccc.',
      '..cccccccccccccccc..',
      '....FFFFFFFFFFFF....',
      '....FEFFEFFFEFfEF...',
      '....FFFFFFFFFFFF....',
      '.....FFMMMMMMFF.....',
      '......FFFFFFFF......',
      '....GGGGGGGGGGGG....',
      '...GGGGGGGGGGGGGG...',
      '..GGGGGGGGGGGGGGGG..',
      '..GGLLGGGGGGGGLLGG..',
      '..GGGGGGGGGGGGGGGG..',
      '...GGGGGGGGGGGGGG...',
      '....GGGGGGGGGGGG....',
      '.....GGG....GGG.....',
      '.....GGG....GGG.....',
      '....BBBB....BBBB....',
      '....BBBB....BBBB....',
      '....................',
    ],
  },
  nhim: {
    palette: NPC,
    rows: [
      '....................',
      '......SSSSSSSS......',
      '....SSSSSSSSSSSS....',
      '...SSSBSSSSSSBSSS...',
      '..SSBSSSSSSSSSSBSS..',
      '.SSSSSSSSSSSSSSSSSS.',
      '.SSSSSSSSSSSSSSSSSS.',
      '..BBBBBBBBBBBBBBBB..',
      '...AAAAAAAAAAAAAA...',
      '...AAAAAAAAAAAAAA...',
      '...AAEEAAAAAAEEAA...',
      '...AAEEAAAAAAEEAA...',
      '...AAAAAAAAAAAAAA...',
      '....AAAAMMMMAAAA....',
      '....AAAAAAAAAAAA....',
      '...SAAADDDDDDAAAS...',
      '...SAAADDDDDDAAAS...',
      '...SAAADDDDDDAAAS...',
      '....AAADDDDDDAAA....',
      '....AAAAAAAAAAAA....',
      '.....OOO....OOO.....',
      '....................',
    ],
  },

  // ---------------- kẻ địch ----------------
  moss: {
    palette: ENEMY,
    rows: [
      '........................',
      '..........a..a..........',
      '..........a..a..........',
      '....ssssssssssssssss....',
      '...ssssssssssssssssss...',
      '..sssseeeessssseeeesss..',
      '..ssseppeessssseppeesss.',
      '..ssseppeessssseppeesss.',
      '..sssseeeessssseeeesss..',
      '..SSSSSSSSSSSSSSSSSSSS..',
      '..SSSSSSSSSSSSSSSSSSSS..',
      '...SSSSSSSSSSSSSSSSSS...',
      '....SSSSSSSSSSSSSSSS....',
      '.....dddddddddddddd.....',
      '......dddddddddddd......',
      '.......l..l..l..l.......',
      '......l..l....l..l......',
      '.....l...l....l...l.....',
      '........................',
    ],
  },
  shroom: {
    palette: { ...ENEMY, e: '#ffd166', p: '#241a2a' },
    rows: [
      '........................',
      '..........mmmm..........',
      '........mmmmmmmm........',
      '.......mmwwwwwwmm.......',
      '......mmwwwwwwwwmm......',
      '.....mmwwwwwwwwwwmm.....',
      '.....mmwwwwwwwwwwmm.....',
      '.....mmmwwwwwwwwmmm.....',
      '......mmmwwwwwwmmm......',
      '.......mmmmmmmmmm.......',
      '......bbbbbbbbbbbb......',
      '.....bbbbbbbbbbbbbb.....',
      '....bbbbbbbbbbbbbbbb....',
      '...bbbeeebbbbbbeeebbb...',
      '...bbbeepbbbbbbeepbbbb..',
      '...bbbeeebbbbbbeeebbbb..',
      '....bbbbbbbbbbbbbbbbb...',
      '....bbbbmmmmmmmmbbbb....',
      '.....bbbbbbbbbbbbbbb....',
      '......bbbbbbbbbbbbb.....',
      '.......xxxxxxxxxxx......',
      '.......xxxxxxxxxxx......',
      '......xxxx.....xxxx.....',
      '......xxx.......xxx.....',
      '........................',
    ],
  },
  bird: {
    palette: ENEMY,
    rows: [
      '........................',
      '...........kkkk.........',
      '..........kkkkkk........',
      '.........kkkkkkkk.......',
      '........kkkkkkkkkk......',
      '........kkooooookk......',
      '........kkoooooookk.....',
      '........kkkooooookk.....',
      '.........kkkkkkkkkk.....',
      '..........kkkkkk........',
      '.........kkkkkkkk.......',
      '.......KKKKKKKKKKKK.....',
      '......KWWWWWWWWWWWWK....',
      '.....KWWWWWWWWWWWWWWK...',
      '....KWWWWWWWWWWWWWWWWK..',
      '...KKWWWWWWWWWWWWWWWWKK.',
      '...KKKWWWWWWWWWWWWWWKKK.',
      '....KKKKWWWWWWWWWWKKKK..',
      '.....KKKKKKKKKKKKKKKK...',
      '......KKKKK....KKKKK....',
      '.....KKKK........KKKK...',
      '.....KKK..........KKK...',
      '........................',
    ],
  },
  sentinel: {
    palette: { r: '#8a6b52', R: '#a8836a', s: '#5f6f7f', S: '#7f92a6', e: '#ffd166', o: '#c8862f', k: '#231f28', b: '#3c3a44' },
    rows: [
      '..............................',
      '..............kkk.............',
      '.............kkkkk............',
      '............rrrrrrr...........',
      '...........rrrrrrrrr..........',
      '..........rrrrrrrrrrr.........',
      '..........rrrreeeerrrr........',
      '..........rrrrkkkkrrrr........',
      '..........rrrrrrrrrrrr........',
      '...........rrrrrrrrrr.........',
      '.......rrrrrrrrrrrrrrrr.......',
      '......rrssssssssssssssrr......',
      '.....rrssssssssssssssssrr.....',
      '.....rssssssssssssssssssr.....',
      '.....rsseeessssseeesssssr.....',
      '.....rsseeessssseeesssssr.....',
      '.....rssssssssssssssssssr.....',
      '......rssssssssssssssssr......',
      '.......ssssssssssssssss.......',
      '.......sssssssssssssss........',
      '.......ssssss...sssss.........',
      '.......ssssss...sssss.........',
      '.......sss........sss.........',
      '......bbbbb......bbbbb........',
      '......bbbbb......bbbbb........',
    ],
  },
  king: {
    palette: { o: '#423655', c: '#ffb347', e: '#ff8a45', r: '#7d424f', k: '#241b2b' },
    rows: [
      '........................................',
      '...........c...c...c...c................',
      '...........cc..cc..cc..cc...............',
      '..........cccccccccccccccc..............',
      '..........cccccccccccccccc..............',
      '...........oooooooooooooo...............',
      '..........oooooooooooooooo..............',
      '.........oooooooooooooooooo.............',
      '........oooooooooooooooooooo............',
      '........ooooeeeeoooooeeeeooo............',
      '........ooooeoeoooooooeoeooo............',
      '........ooooeeeeoooooeeeeooo............',
      '.........ooooooooooooooooooo............',
      '..........ooooooooooooooooo.............',
      '..........ooooooooooooooooo.............',
      '.........oooooooooooooooooo.............',
      '........oooooooooooooooooooo............',
      '.......oooooooooooooooooooooo...........',
      '.......oooooooooooooooooooooo...........',
      '......oooooooooooooooooooooooo..........',
      '......oooooooooooooooooooooooo..........',
      '.....oooooooooooooooooooooooooo.........',
      '.....ooooo..................ooooo.......',
      '.....oooo....................oooo.......',
      '.....oooo....................oooo.......',
      '.....oooo....................oooo.......',
      '....oooooo..................oooooo......',
      '....oooooo..................oooooo......',
      '...rrrrrrrr................rrrrrrrr.....',
      '...rrrrrrrr................rrrrrrrr.....',
      '...rrrrrrrr................rrrrrrrr.....',
      '...rrrrrrrr................rrrrrrrr.....',
      '...rrrrrrrr................rrrrrrrr.....',
      '...rrrrrrrr................rrrrrrrr.....',
      '..rrrrrrrrrr..............rrrrrrrrrr....',
      '..rrrrrrrrrr..............rrrrrrrrrr....',
      '.rrrrrrrrrrrr............rrrrrrrrrrrr...',
      '.rrrrrrrrrrrr............rrrrrrrrrrrr...',
      'rrrrrrrrrrrrrr..........rrrrrrrrrrrrrr..',
      'rrrrrrrrrrrrrr..........rrrrrrrrrrrrrr..',
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr.',
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr.',
      'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.',
    ],
  },

  // ---------------- đồ vật ----------------
  chestClosed: {
    palette: { w: '#8a5c34', W: '#c1893f', k: '#3a2a1c', g: '#e0b34f' },
    rows: [
      '................',
      '.....kkkkkk.....',
      '....kWWWWWWk....',
      '...kWWWWWWWWk...',
      '...kWWWWWWWWk...',
      '...kggggggggk...',
      '...kwwwwwwwwk...',
      '...kwwwwwwwwk...',
      '...kwwwwwwwwk...',
      '...kwwwggwwwk...',
      '...kwwwggwwwk...',
      '...kwwwwwwwwk...',
      '...kwwwwwwwwk...',
      '...kkkkkkkkkk...',
      '................',
    ],
  },
  chestOpen: {
    palette: { w: '#8a5c34', W: '#c1893f', k: '#3a2a1c', g: '#e0b34f', y: '#ffe9a3' },
    rows: [
      '................',
      '.....kkkkkk.....',
      '....kyyyyyyk....',
      '...kyyyyyyyyk...',
      '...kkkkkkkkkk...',
      '....kWWWWWWk....',
      '....kggggggk....',
      '...kwwwwwwwwk...',
      '...kyyyyyyyyk...',
      '...kwwwwwwwwk...',
      '...kwwwwwwwwk...',
      '...kwwwwwwwwk...',
      '...kwwwwwwwwk...',
      '...kkkkkkkkkk...',
      '................',
    ],
  },
  lamp: {
    palette: { k: '#2b2530', K: '#4a4152', f: '#ff9a3d', F: '#ffd166', y: '#fff3c4' },
    rows: [
      '.........kk.....',
      '........kFFk....',
      '.......kFyyFk...',
      '.......kFyyFk...',
      '........kFFk....',
      '.......kkffkk...',
      '........kffk....',
      '........kffk....',
      '........kffk....',
      '.......kKffKk...',
      '.......kKffKk...',
      '.......kKffKk...',
      '......kKKffKKk..',
      '......kKkffkKk..',
      '.....kkkkffkkkk.',
      '....kKKKKKKKKKKk',
      '....kKKKKKKKKKKk',
      '.....kkkkkkkkkk.',
      '................',
    ],
  },
  // ngôi sao vàng — điểm lưu
  star: {
    palette: { y: '#c98a2a', Y: '#ffd166', W: '#fff8e0' },
    rows: [
      '................',
      '.......YY.......',
      '.......YY.......',
      '......yYYy......',
      '......yYYy......',
      '.....yyYYyy.....',
      '....yyyYYyyy....',
      '.yyyyyYWWYyyyyy.',
      '.yyyyyYWWYyyyyy.',
      '....yyyYYyyy....',
      '...yyyYYYYyyy...',
      '..yyy.YYYY.yyy..',
      '.yy....YY....yy.',
      'y......YY......y',
    ],
  },
  sign: {
    palette: { w: '#8a5c34', W: '#c1893f', k: '#3a2a1c', l: '#e8d9b0' },
    rows: [
      '................',
      '..kkkkkkkkkkkk..',
      '..kWWWWWWWWWWk..',
      '..kWllllllllWk..',
      '..kWllllllllWk..',
      '..kWkkkkkkklWk..',
      '..kWllllllllWk..',
      '..kWkkkkkkklWk..',
      '..kWllllllllWk..',
      '..kWWWWWWWWWWk..',
      '..kkkkkkkkkkkk..',
      '.......ww.......',
      '.......ww.......',
      '.......ww.......',
      '.......ww.......',
      '......wwww......',
      '......wwww......',
      '......kkkk......',
    ],
  },

  // ---------------- tường lửa cửa vào trùm ----------------
  barrier: {
    palette: { f: '#ff8a3d', F: '#ffd166', k: '#2b1c14' },
    rows: [
      '................',
      '.kFff.....ffFk..',
      '..kFff...ffFk...',
      '...kFff.ffFk....',
      '....kFfffFk.....',
      '.....kFffk......',
      '....kFffffk.....',
      '...kFffkFffk....',
      '..kFff...ffFk...',
      '.kFff.....ffFk..',
      '................',
    ],
  },
};

const cache = new Map();

function normalize(sprite) {
  const width = Math.max(...sprite.rows.map((r) => r.length));
  const rows = sprite.rows.map((r) => r.padEnd(width, '.'));
  return { rows, width, height: rows.length };
}

function buildCanvas(name, sprite, tint) {
  const { rows, width, height } = normalize(sprite);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const color = sprite.palette[ch];
      if (!color) continue;
      g.fillStyle = color;
      g.fillRect(x, y, 1, 1);
    }
  });
  if (tint) {
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = tint;
    g.fillRect(0, 0, width, height);
  }
  return { canvas, width, height };
}

function get(name, tint) {
  const sprite = SPRITES[name];
  if (!sprite) return null;
  const key = tint ? `${name}|${tint}` : name;
  if (!cache.has(key)) cache.set(key, buildCanvas(name, sprite, tint));
  return cache.get(key);
}

export function spriteSize(name) {
  const s = get(name);
  return s ? { w: s.width, h: s.height } : { w: 0, h: 0 };
}

/**
 * Vẽ sprite. (x, y) là điểm neo, mặc định là "giữa-dưới" (chân nhân vật).
 */
export function drawSprite(name, x, y, scale = 2, opts = {}) {
  const c = R.ctx;
  const { anchor = 'bottom-center', flip = false, alpha = 1, tint = null, ctx = c } = opts;
  const s = get(name, tint);
  if (!s) return;
  const w = s.width * scale;
  const h = s.height * scale;
  let dx = x;
  let dy = y;
  if (anchor === 'bottom-center') {
    dx = x - w / 2;
    dy = y - h;
  } else if (anchor === 'center') {
    dx = x - w / 2;
    dy = y - h / 2;
  } else if (anchor === 'top-center') {
    dx = x - w / 2;
    dy = y;
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  if (flip) {
    ctx.translate(Math.round(dx + w), Math.round(dy));
    ctx.scale(-1, 1);
    ctx.drawImage(s.canvas, 0, 0, s.width, s.height, 0, 0, w, h);
  } else {
    ctx.drawImage(s.canvas, 0, 0, s.width, s.height, Math.round(dx), Math.round(dy), w, h);
  }
  ctx.restore();
}

// Gắn vào renderer để hội thoại và các cảnh khác dùng tiện
R.sprite = drawSprite;
