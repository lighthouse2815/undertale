// ============================================================
//  Thế giới: bản đồ, di chuyển, vật thể, hội thoại, cửa hàng
// ============================================================
import { R, W, H, Input, Dialogue, Embers, audio, clamp, rand, hash2, pick, Save } from './core.js';
import { drawSprite, drawLocal, drawParts } from './sprites.js';
import { art, PLAYER_ART, PROP_ART, NPC_ART, BAMOC_ART, KING_ART } from './localassets.js';
import {
  ROOMS, ITEMS, ENEMIES, NPC_TALK, SPRING_LINES, BOSS_INTRO, BOSS_OUTRO, BOSS_KILL_OUTRO, SHOP_STOCK,
} from './data.js';

export const TILE = 32;
const SOLID = new Set(['#', '~', 'w', 'O', 'T', 'b', '|', 's', 'c', 'h', 'g']);
const INTERACTIVE = new Set(['sign', 'chest', 'lamp', 'npc', 'spring', 'boss']);

const THEMES = {
  moss: { sky: '#010301', floor: ['#0a0e0b', '#0c110d', '#080c09'], dot: '#101a13', wall: '#040705', wallTop: '#16231a', wallLine: '#0b120d', grass: '#1b3320', grassHi: '#2b4a28', accent: '#8fd36a', chasm: '#010204', water: '#123028', glow: '#a8e26b', ember: '#ffcf7a' },
  hall: { sky: '#020206', floor: ['#0a0b12', '#0c0e16', '#080910'], dot: '#131624', wall: '#05060c', wallTop: '#1b2130', wallLine: '#0c0f1a', grass: '#101a16', grassHi: '#1c2b22', accent: '#8fa8d8', chasm: '#010104', water: '#0e2233', glow: '#a9c4ff', ember: '#9fc6ff' },
  ash: { sky: '#040302', floor: ['#100c0b', '#130f0e', '#0c0908'], dot: '#1b1514', wall: '#070505', wallTop: '#241b18', wallLine: '#110d0c', grass: '#161311', grassHi: '#241d1a', accent: '#ff9a4d', chasm: '#020103', water: '#1d1411', glow: '#ffb066', ember: '#ff9a4d' },
  forest: { sky: '#020302', floor: ['#0c0c0a', '#0f0f0d', '#090a08'], dot: '#16150f', wall: '#050505', wallTop: '#1e1c17', wallLine: '#0e0d0b', grass: '#1d2216', grassHi: '#2d3320', accent: '#c9d16a', chasm: '#020202', water: '#142a26', glow: '#e0e08a', ember: '#d8d08a' },
  snow: { sky: '#05070d', floor: ['#141b26', '#171f2c', '#111823'], dot: '#26313f', wall: '#0a0e16', wallTop: '#2b3b50', wallLine: '#141b26', grass: '#1a2333', grassHi: '#2d3d52', accent: '#9fd8ff', chasm: '#03050a', water: '#1b3b52', glow: '#bfe6ff', ember: '#cfeaff' },
  market: { sky: '#040302', floor: ['#120e0b', '#150f0c', '#0d0a08'], dot: '#1d1611', wall: '#070504', wallTop: '#2a1f16', wallLine: '#130e0a', grass: '#15120e', grassHi: '#221c14', accent: '#ffb347', chasm: '#020202', water: '#1d1611', glow: '#ffc46b', ember: '#ffab5c' },
  throne: { sky: '#020104', floor: ['#0b090e', '#0e0b12', '#08070b'], dot: '#141021', wall: '#040309', wallTop: '#1f1829', wallLine: '#0c0913', grass: '#100c17', grassHi: '#1a1422', accent: '#ff7a4d', chasm: '#010103', water: '#160f18', glow: '#ff8a5c', ember: '#ff8a5c' },
};

export class World {
  constructor(game) {
    this.game = game;
    this.room = null;
    this.map = [];
    this.objects = [];
    this.dialogue = null;
    this.shop = null;
    this.paused = false;
    this.pauseIndex = 0;
    this.pauseMessage = '';
    this.pauseMessageTimer = 0;
    this.fade = 1;
    this.titleTimer = 0;
    this.flash = 0;
    this.pendingBattle = null;
    this.blockedCooldown = 0;
    this.encounterDist = 0;
    this.encounterGrace = 400;
    this.encounterNext = 0;
    this.player = { x: 320, y: 240, facing: 'down', anim: 0, moving: false };
    this.companion = { x: 320, y: 200, active: false, phase: 0 };
    this.embers = new Embers(38, { color: '#ffa45c', speed: 10, drift: 12, size: 2, area: { x: 0, y: 0, w: W, h: H } });
    this.nearObject = null;
    this.time = 0;
    this.lastPromptTime = 0;
  }

  get flags() {
    return this.game.flags;
  }

  // ----------------------------------------------------------
  //  Vào phòng
  // ----------------------------------------------------------
  enter(roomId, spawn = null) {
    const room = ROOMS[roomId];
    if (!room) return;
    this.room = room;
    this.map = room.map.map((row) => row.split(''));
    const pos = spawn ?? room.spawn;
    this.player.x = pos.x * TILE + TILE / 2;
    this.player.y = pos.y * TILE + TILE / 2;
    this.player.facing = pos.facing ?? 'down';
    this.objects = room.objects.map((o) => ({ ...o, opened: Boolean(this.flags[`chest:${o.id}`]), done: o.flag ? Boolean(this.flags[o.flag]) : false }));
    this.buildBackground();
    this.fade = 1;
    this.titleTimer = 2.8;
    this.encounterDist = 0;
    this.encounterGrace = 300;
    this.encounterNext = rand(room.encounters?.min ?? 700, room.encounters?.max ?? 1000);
    this.pendingBattle = null;
    this.pendingIntro = null;
    this.nearObject = null;
    this.blockedCooldown = 0;
    this.pauseIndex = 0;
    this.pauseMessage = '';
    this.pauseMessageTimer = 0;
    this.player.moving = false;
    this.player.anim = 0;
    this.companion.x = this.player.x;
    this.companion.y = this.player.y - 24;
    this.companion.active = Boolean(this.flags.met_dom);
    this.dialogue = null;
    this.shop = null;
    this.paused = false;
    if (room.music) audio.playMusic(room.music, room.id);
    if (room.autosave) {
      this.game.healFull();
      this.save(true);
    }
    if (roomId === 'wake' && !this.flags.intro_seen) {
      this.queueIntro();
    }
  }

  queueIntro() {
    const lines = [
      { text: 'Bạn tỉnh dậy trong một hầm đá xanh rêu.\nTrên đầu, một vệt sáng mỏng nhắc rằng bầu trời vẫn còn ở đâu đó.' },
      { speaker: 'Đom', portrait: 'dom', text: 'Ơ! Cậu tỉnh rồi! Tôi tưởng cậu... thôi, không sao.' },
      { speaker: 'Đom', portrait: 'dom', text: 'Tôi là Đom. Con đom đóm duy nhất còn thức ở tầng này. Nghe thì oai, nhưng thật ra chỉ vì tôi ngủ không được.' },
      { speaker: 'Đom', portrait: 'dom', text: 'Đây là Hầm Tro. Muốn ra ngoài thì đi xa hơn nữa... xuống sâu hơn nữa.' },
      { text: '(Điều khiển: phím mũi tên hoặc WASD để đi · Z / Enter để trò chuyện và chọn · X để mở túi đồ và quay lại.)' },
      { speaker: 'Đom', portrait: 'dom', text: 'Cậu thấy cái đèn kia không? Chạm vào nó để nghỉ một chút và ghi lại hành trình. Tôi vẫn thường trú ở đó.' },
    ];
    this.pendingIntro = lines;
  }

  openIntroDialogue() {
    const lines = this.pendingIntro;
    this.pendingIntro = null;
    this.flags.intro_seen = true;
    this.flags.met_dom = true;
    this.companion.active = true;
    this.openDialogue(lines, () => {
      this.save(true);
      this.game.toast('Đã lưu hành trình vào điểm lửa');
    });
  }

  // ----------------------------------------------------------
  //  Vẽ nền phòng
  // ----------------------------------------------------------
  buildBackground() {
    const theme = THEMES[this.room.theme] ?? THEMES.moss;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = theme.sky;
    g.fillRect(0, 0, W, H);

    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const ch = this.map[y][x];
        this.drawTile(g, theme, ch, x, y);
      }
    }

    // bóng tối tĩnh viền phòng
    const grad = g.createRadialGradient(W / 2, H / 2, H * 0.38, W / 2, H / 2, H * 0.95);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    this.background = canvas;
    this.theme = theme;
  }

  drawTile(g, theme, ch, tx, ty) {
    const x = tx * TILE;
    const y = ty * TILE;
    const n = hash2(tx, ty);
    const floorColor = theme.floor[Math.floor(n * theme.floor.length) % theme.floor.length];

    const baseFloor = (color = floorColor) => {
      g.fillStyle = color;
      g.fillRect(x, y, TILE, TILE);
      // đốm nhỏ trên sàn
      const dots = 3 + Math.floor(n * 3);
      for (let i = 0; i < dots; i++) {
        const dx = Math.floor(hash2(tx * 7 + i, ty * 13 + i) * TILE);
        const dy = Math.floor(hash2(tx * 17 + i, ty * 29 + i) * TILE);
        const s = hash2(tx + i * 3, ty + i * 5) > 0.6 ? 2 : 1;
        g.fillStyle = theme.dot;
        g.globalAlpha = 0.35 + 0.4 * hash2(i + tx, i + ty);
        g.fillRect(x + dx, y + dy, s, s);
      }
      g.globalAlpha = 1;
    };

    switch (ch) {
      case '#': {
        g.fillStyle = theme.wall;
        g.fillRect(x, y, TILE, TILE);
        // vân đá
        g.fillStyle = theme.wallLine;
        g.globalAlpha = 0.5;
        g.fillRect(x, y + Math.floor(TILE * (0.3 + n * 0.3)), TILE, 2);
        g.fillRect(x + Math.floor(TILE * hash2(tx + 3, ty)), y, 1, TILE);
        g.globalAlpha = 1;
        // mặt trên sáng nếu phía dưới là sàn
        const below = this.map[ty + 1]?.[tx];
        if (below && !SOLID.has(below) && below !== undefined) {
          g.fillStyle = theme.wallTop;
          g.fillRect(x, y + TILE - 8, TILE, 8);
          g.fillStyle = 'rgba(0,0,0,0.25)';
          g.fillRect(x, y + TILE - 2, TILE, 2);
        }
        break;
      }
      case '~': {
        g.fillStyle = theme.chasm;
        g.fillRect(x, y, TILE, TILE);
        // bóng đổ ở mép trên để hố có chiều sâu
        const shade = g.createLinearGradient(0, y, 0, y + 16);
        shade.addColorStop(0, 'rgba(0,0,0,0.85)');
        shade.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = shade;
        g.fillRect(x, y, TILE, 16);
        g.globalAlpha = 0.35;
        if (n > 0.9) {
          g.fillStyle = theme.ember;
          g.fillRect(x + 8 + Math.floor(n * 12), y + 10 + Math.floor(n * 10), 2, 2);
        } else if (n > 0.72) {
          g.fillStyle = theme.ember;
          g.fillRect(x + 4 + Math.floor(n * 20), y + 16 + Math.floor(n * 8), 1, 1);
        }
        g.globalAlpha = 1;
        break;
      }
      case 'w': {
        g.fillStyle = theme.water;
        g.fillRect(x, y, TILE, TILE);
        g.strokeStyle = 'rgba(255,255,255,0.14)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x + 3, y + 10 + (n > 0.5 ? 4 : 0));
        g.quadraticCurveTo(x + 10, y + 6, x + 17, y + 10 + (n > 0.5 ? 4 : 0));
        g.moveTo(x + 14, y + 22);
        g.quadraticCurveTo(x + 22, y + 18, x + 29, y + 22);
        g.stroke();
        break;
      }
      case '_': {
        g.fillStyle = '#3b2229';
        g.fillRect(x, y, TILE, TILE);
        g.fillStyle = '#4a2a33';
        g.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        g.fillStyle = 'rgba(255,180,120,0.06)';
        g.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
        g.fillStyle = 'rgba(0,0,0,0.22)';
        if (n > 0.62) g.fillRect(x + 5, y + 9, 12, 7);
        if (n < 0.3) g.fillRect(x + 18, y + 20, 8, 5);
        break;
      }
      case '>': {
        baseFloor(theme.floor[0]);
        g.fillStyle = '#05050a';
        g.fillRect(x, y + 2, TILE, TILE - 4);
        g.fillStyle = theme.wallTop;
        g.fillRect(x, y + 2, TILE, 4);
        g.fillStyle = theme.accent;
        g.globalAlpha = 0.25 + 0.15 * Math.sin(tx + ty);
        g.fillRect(x + 4, y + 8, TILE - 8, TILE - 14);
        g.globalAlpha = 1;
        break;
      }
      case ',': {
        baseFloor();
        const blades = 3 + Math.floor(n * 3);
        g.strokeStyle = theme.grass;
        g.lineWidth = 2;
        for (let i = 0; i < blades; i++) {
          const bx = x + 4 + Math.floor(hash2(tx + i, ty * 3 + i) * (TILE - 8));
          const by = y + 6 + Math.floor(hash2(tx * 5 + i, ty + i) * (TILE - 12));
          const hgt = 4 + Math.floor(hash2(i + tx * 2, i + ty) * 5);
          g.beginPath();
          g.moveTo(bx, by + hgt);
          g.lineTo(bx + (i % 2 === 0 ? 1 : -1), by);
          g.stroke();
        }
        g.fillStyle = theme.grassHi;
        g.globalAlpha = 0.6;
        for (let i = 0; i < 2; i++) {
          const bx = x + 6 + Math.floor(hash2(tx + i * 11, ty + i * 3) * (TILE - 12));
          const by = y + 8 + Math.floor(hash2(tx + i, ty + i * 7) * (TILE - 14));
          g.fillRect(bx, by, 2, 3);
        }
        g.globalAlpha = 1;
        break;
      }
      case 'O': {
        baseFloor();
        g.fillStyle = theme.wall;
        g.beginPath();
        g.ellipse(x + 16, y + 20, 12, 9, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = theme.wallTop;
        g.beginPath();
        g.ellipse(x + 15, y + 17, 10, 6, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(0,0,0,0.3)';
        g.beginPath();
        g.ellipse(x + 16, y + 25, 13, 3, 0, 0, Math.PI * 2);
        g.fill();
        break;
      }
      case 'T': {
        baseFloor();
        const cay = art.get(PROP_ART.tree);
        if (cay) {
          // cây gốc, cao khoảng 1,5 ô
          R.image(cay, x + 16, y + 30, 0.8, { anchor: 'bottom-center', ctx: g });
          break;
        }
        g.strokeStyle = '#2d2420';
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(x + 16, y + 28);
        g.lineTo(x + 16, y + 10);
        g.stroke();
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x + 16, y + 16);
        g.lineTo(x + 6, y + 6);
        g.moveTo(x + 16, y + 13);
        g.lineTo(x + 26, y + 5);
        g.stroke();
        g.fillStyle = 'rgba(0,0,0,0.3)';
        g.beginPath();
        g.ellipse(x + 16, y + 29, 9, 3, 0, 0, Math.PI * 2);
        g.fill();
        break;
      }
      case 'm': {
        baseFloor();
        g.fillStyle = '#e8e2c8';
        g.fillRect(x + 14, y + 18, 4, 7);
        g.fillStyle = theme.accent;
        g.beginPath();
        g.ellipse(x + 16, y + 16, 10, 6, 0, Math.PI, 0);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.fillRect(x + 11, y + 14, 3, 2);
        g.fillRect(x + 18, y + 13, 2, 2);
        break;
      }
      case 'f': {
        baseFloor();
        const hoa = art.get(PROP_ART.flower);
        if (hoa) {
          R.image(hoa, x + 16, y + 30, 1.2, { anchor: 'bottom-center', ctx: g });
          break;
        }
        g.fillStyle = theme.glow;
        g.globalAlpha = 0.85;
        g.fillRect(x + 15, y + 14, 2, 8);
        g.fillRect(x + 11, y + 17, 10, 2);
        g.fillStyle = '#fff';
        g.fillRect(x + 15, y + 16, 2, 2);
        g.globalAlpha = 1;
        break;
      }
      case 'l': {
        baseFloor();
        g.fillStyle = '#2a2530';
        g.fillRect(x + 14, y + 16, 3, 12);
        g.fillStyle = '#4a4152';
        g.fillRect(x + 11, y + 28, 9, 3);
        g.fillStyle = theme.accent;
        g.fillRect(x + 12, y + 10, 8, 7);
        g.fillStyle = '#fff3c4';
        g.fillRect(x + 14, y + 12, 4, 3);
        break;
      }
      case 'b': {
        baseFloor();
        g.fillStyle = '#4a3524';
        g.fillRect(x + 5, y + 8, 22, 20);
        g.fillStyle = '#5f4530';
        g.fillRect(x + 7, y + 10, 18, 16);
        g.strokeStyle = '#33241a';
        g.lineWidth = 2;
        g.strokeRect(x + 5, y + 8, 22, 20);
        g.beginPath();
        g.moveTo(x + 5, y + 16);
        g.lineTo(x + 27, y + 16);
        g.stroke();
        break;
      }
      case '|': {
        baseFloor();
        const cot = art.get(PROP_ART.pillar);
        if (cot) {
          R.image(cot, x + 16, y + 32, 0.85, { anchor: 'bottom-center', ctx: g });
          break;
        }
        g.fillStyle = theme.wall;
        g.fillRect(x + 6, y + 2, 20, 30);
        g.fillStyle = theme.wallTop;
        g.fillRect(x + 6, y + 2, 20, 5);
        g.fillRect(x + 4, y + 28, 24, 4);
        g.fillStyle = 'rgba(0,0,0,0.28)';
        g.fillRect(x + 6, y + 7, 3, 21);
        break;
      }
      case 's': {
        // cây thông phủ tuyết
        baseFloor();
        g.fillStyle = 'rgba(0,0,0,0.35)';
        g.beginPath();
        g.ellipse(x + 16, y + 30, 12, 4, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#3a2a20';
        g.fillRect(x + 14, y + 22, 4, 9);
        const tiers = [
          { w: 16, top: 2, hi: '#2b4a3a', snow: '#dfeefc' },
          { w: 13, top: 11, hi: '#26412f', snow: '#cfe2f4' },
          { w: 10, top: 20, hi: '#22392b', snow: '#c2d8ec' },
        ];
        for (const t of tiers) {
          const half = t.w / 2;
          g.fillStyle = t.hi;
          g.beginPath();
          g.moveTo(x + 16, y + t.top);
          g.lineTo(x + 16 + half, y + t.top + 12);
          g.lineTo(x + 16 - half, y + t.top + 12);
          g.closePath();
          g.fill();
          g.fillStyle = t.snow;
          g.globalAlpha = 0.9;
          g.beginPath();
          g.moveTo(x + 16, y + t.top);
          g.lineTo(x + 16 + half * 0.62, y + t.top + 6);
          g.lineTo(x + 16 + half * 0.25, y + t.top + 5);
          g.lineTo(x + 16, y + t.top + 8);
          g.lineTo(x + 16 - half * 0.25, y + t.top + 5);
          g.lineTo(x + 16 - half * 0.62, y + t.top + 6);
          g.closePath();
          g.fill();
          g.globalAlpha = 1;
        }
        break;
      }
      case 'c': {
        // tảng băng (dùng sprite gốc nếu có)
        baseFloor();
        const bang = art.get(PROP_ART.iceblock);
        if (bang) {
          R.image(bang, x + 16, y + 31, 1, { anchor: 'bottom-center', ctx: g });
          break;
        }
        g.fillStyle = '#8fbede';
        g.fillRect(x + 6, y + 10, 20, 20);
        g.fillStyle = '#b9dcf2';
        g.fillRect(x + 8, y + 12, 16, 8);
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillRect(x + 10, y + 14, 4, 4);
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.fillRect(x + 6, y + 26, 20, 4);
        break;
      }
      case 'p': {
        // đống tuyết
        baseFloor();
        g.fillStyle = 'rgba(0,0,0,0.28)';
        g.beginPath();
        g.ellipse(x + 16, y + 26, 13, 5, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#dbe9f6';
        g.beginPath();
        g.ellipse(x + 16, y + 22, 12, 8, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#f2f9ff';
        g.beginPath();
        g.ellipse(x + 14, y + 19, 8, 5, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(120,160,200,0.35)';
        g.fillRect(x + 8, y + 24, 16, 2);
        break;
      }
      case 'h': {
        // nhà tuyết trong làng
        baseFloor();
        g.fillStyle = 'rgba(0,0,0,0.35)';
        g.fillRect(x + 1, y + 4, 30, 28);
        g.fillStyle = '#4a3b34';
        g.fillRect(x + 2, y + 12, 28, 20);
        g.fillStyle = '#5c4a41';
        g.fillRect(x + 4, y + 14, 24, 18);
        // mái phủ tuyết
        g.fillStyle = '#2f241f';
        g.beginPath();
        g.moveTo(x + 16, y - 1);
        g.lineTo(x + 32, y + 13);
        g.lineTo(x, y + 13);
        g.closePath();
        g.fill();
        g.fillStyle = '#e6f1fb';
        g.beginPath();
        g.moveTo(x + 16, y - 2);
        g.lineTo(x + 27, y + 8);
        g.lineTo(x + 19, y + 6);
        g.lineTo(x + 16, y + 9);
        g.lineTo(x + 13, y + 6);
        g.lineTo(x + 5, y + 8);
        g.closePath();
        g.fill();
        // cửa sổ sáng đèn
        g.fillStyle = '#f7d98a';
        g.fillRect(x + 7, y + 17, 7, 7);
        g.fillRect(x + 18, y + 17, 7, 7);
        g.strokeStyle = '#2f241f';
        g.lineWidth = 1;
        g.strokeRect(x + 7, y + 17, 7, 7);
        g.strokeRect(x + 18, y + 17, 7, 7);
        g.fillStyle = 'rgba(255,220,150,0.16)';
        g.fillRect(x + 5, y + 15, 22, 11);
        break;
      }
      case 'g': {
        // hộp quà (dùng sprite gốc nếu có)
        baseFloor();
        const qua = art.get(PROP_ART.gift);
        if (qua) {
          R.image(qua, x + 16, y + 30, 1, { anchor: 'bottom-center', ctx: g });
          break;
        }
        g.fillStyle = '#7a2f38';
        g.fillRect(x + 8, y + 14, 16, 15);
        g.fillStyle = '#9c3d47';
        g.fillRect(x + 9, y + 15, 14, 13);
        g.fillStyle = '#e8c96a';
        g.fillRect(x + 14, y + 14, 4, 15);
        g.fillRect(x + 8, y + 19, 16, 4);
        break;
      }
      case 'v': {
        // hoa băng phát sáng
        baseFloor();
        const hoaBang = art.get(PROP_ART.iceflower);
        if (hoaBang) {
          R.image(hoaBang, x + 16, y + 30, 1.2, { anchor: 'bottom-center', ctx: g });
          break;
        }
        g.fillStyle = '#7fb8dc';
        g.fillRect(x + 15, y + 16, 2, 10);
        g.fillStyle = '#bfe6ff';
        g.fillRect(x + 15, y + 13, 2, 2);
        g.fillRect(x + 11, y + 15, 10, 2);
        g.fillStyle = '#fff';
        g.fillRect(x + 15, y + 15, 2, 2);
        break;
      }
      default: {
        baseFloor();
      }
    }
  }

  // ----------------------------------------------------------
  //  Vật cản và va chạm
  // ----------------------------------------------------------
  solidAt(px, py) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (ty < 0 || ty >= this.map.length || tx < 0 || tx >= this.map[0].length) return true;
    const ch = this.map[ty][tx];
    if (SOLID.has(ch)) return true;
    for (const o of this.objects) {
      if (o.type === 'boss' && o.done) continue;
      if (!INTERACTIVE.has(o.type)) continue;
      const ox = o.x * TILE;
      const oy = o.y * TILE;
      const halfW = o.type === 'boss' ? (o.enemy === 'king' ? 40 : 26) : 16;
      const tall = o.type === 'boss' && o.enemy === 'king' ? 60 : 34;
      if (Math.abs(px - ox) < halfW && py > oy - tall && py < oy + 8) return true;
    }
    return false;
  }

  canStand(x, y) {
    return !this.solidAt(x - 8, y - 4) && !this.solidAt(x + 8, y - 4) && !this.solidAt(x - 8, y + 6) && !this.solidAt(x + 8, y + 6);
  }

  // ----------------------------------------------------------
  //  Vòng lặp
  // ----------------------------------------------------------
  update(dt) {
    this.time += dt;
    this.fade = Math.max(0, this.fade - dt * 2.4);
    if (this.titleTimer > 0) this.titleTimer -= dt;
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.4);
    if (this.blockedCooldown > 0) this.blockedCooldown -= dt;
    if (this.pauseMessageTimer > 0) this.pauseMessageTimer -= dt;
    if (this.shop?.messageTimer > 0) this.shop.messageTimer -= dt;
    if (this.fade < 0.6 && this.pendingIntro) this.openIntroDialogue();
    this.embers.update(dt);

    if (this.pendingBattle) {
      this.pendingBattle.timer -= dt;
      if (this.pendingBattle.timer <= 0) {
        const { enemy, onEnd } = this.pendingBattle;
        this.pendingBattle = null;
        this.game.startBattle(enemy, onEnd);
      }
      return;
    }

    if (this.dialogue) {
      this.dialogue.update(dt);
      if (Input.consume('confirm') || Input.consume('cancel')) this.dialogue.advance();
      return;
    }
    if (this.shop) {
      this.updateShop();
      return;
    }
    if (this.paused) {
      this.updatePause();
      return;
    }

    if (Input.consume('cancel')) {
      this.paused = true;
      this.pauseIndex = 0;
      this.pauseMessage = '';
      audio.select();
      return;
    }

    this.updateMovement(dt);
    this.updateCompanion(dt);
    this.updateInteractions();
  }

  updateMovement(dt) {
    const p = this.player;
    let dx = 0;
    let dy = 0;
    if (Input.isDown('left')) dx -= 1;
    if (Input.isDown('right')) dx += 1;
    if (Input.isDown('up')) dy -= 1;
    if (Input.isDown('down')) dy += 1;
    const len = Math.hypot(dx, dy);
    p.moving = len > 0;
    if (len > 0) {
      dx /= len;
      dy /= len;
      const speed = 146;
      const nx = p.x + dx * speed * dt;
      const ny = p.y + dy * speed * dt;
      let moved = 0;
      if (this.canStand(nx, p.y)) {
        moved += Math.abs(nx - p.x);
        p.x = nx;
      }
      if (this.canStand(p.x, ny)) {
        moved += Math.abs(ny - p.y);
        p.y = ny;
      }
      p.anim += dt * 9;
      if (Math.abs(dx) > Math.abs(dy)) p.facing = dx < 0 ? 'left' : 'right';
      else if (Math.abs(dy) > 0.01) p.facing = dy < 0 ? 'up' : 'down';
      this.encounterDist += moved;
    } else {
      p.anim = 0;
    }

    // lối ra
    const tx = p.x / TILE;
    const ty = p.y / TILE;
    for (const exit of this.room.exits ?? []) {
      if (tx >= exit.x && tx < exit.x + exit.w && ty >= exit.y && ty < exit.y + exit.h) {
        if (exit.requires && !this.flags[exit.requires]) {
          if (this.blockedCooldown <= 0 && exit.blockedText) {
            this.blockedCooldown = 4;
            this.openDialogue(exit.blockedText);
          }
          // Đẩy về phía trong phòng, tránh đặt người chơi ra ngoài bản đồ.
          if (exit.x === 0) p.x = (exit.x + exit.w) * TILE + 10;
          else if (exit.x + exit.w >= this.map[0].length) p.x = exit.x * TILE - 10;
          else if (exit.y === 0) p.y = (exit.y + exit.h) * TILE + 10;
          else p.y = exit.y * TILE - 10;
        } else {
          this.game.enterRoom(exit.to, exit.spawn);
          return;
        }
      }
    }

    // gặp quái ngẫu nhiên
    const enc = this.room.encounters;
    if (enc && this.encounterDist > this.encounterNext) {
      this.encounterDist = 0;
      this.encounterGrace = rand(520, 900);
      this.encounterNext = rand(enc.min, enc.max) + this.encounterGrace;
      if (Math.random() < 0.7) this.triggerBattle(pick(enc.pool));
    }
  }

  updateCompanion(dt) {
    const c = this.companion;
    c.active = Boolean(this.flags.met_dom);
    if (!c.active) return;
    c.phase += dt * 2.2;
    const p = this.player;
    const targetX = p.x - 22 - Math.cos(c.phase) * 4;
    const targetY = p.y - 34 + Math.sin(c.phase * 1.3) * 6;
    c.x += (targetX - c.x) * Math.min(1, dt * 4.5);
    c.y += (targetY - c.y) * Math.min(1, dt * 4.5);
  }

  updateInteractions() {
    const p = this.player;
    let nearest = null;
    let bestDist = 62;
    for (const o of this.objects) {
      if (!INTERACTIVE.has(o.type)) continue;
      if (o.type === 'boss' && this.flags[`${o.flag}_method`] === 'kill') continue;
      const d = Math.hypot(p.x - o.x * TILE, p.y - (o.y * TILE - 10));
      if (d < bestDist) {
        bestDist = d;
        nearest = o;
      }
    }
    this.nearObject = nearest;
    if (nearest && Input.consume('confirm')) this.interact(nearest);
  }

  // ----------------------------------------------------------
  //  Tương tác
  // ----------------------------------------------------------
  openDialogue(lines, onDone = null) {
    if (!lines || !lines.length) {
      if (onDone) onDone();
      return;
    }
    this.dialogue = new Dialogue(lines, () => {
      this.dialogue = null;
      if (onDone) onDone();
    });
  }

  interact(o) {
    switch (o.type) {
      case 'sign': {
        audio.select();
        this.openDialogue(o.lines);
        break;
      }
      case 'chest': {
        if (o.opened) {
          this.openDialogue([{ text: 'Chiếc rương đã trống. Lớp bụi trong đó dày bằng cả một mùa đông.' }]);
          break;
        }
        o.opened = true;
        this.flags[`chest:${o.id}`] = true;
        const item = ITEMS[o.item];
        this.game.addItem(o.item, o.count ?? 1);
        audio.coin();
        this.openDialogue([
          { text: `Bạn mở chiếc rương gỗ. Bên trong là ${item.name} ×${o.count ?? 1}.` },
          { text: item.desc },
        ]);
        break;
      }
      case 'lamp': {
        audio.save();
        this.flash = 0.5;
        const healed = this.game.healFull();
        const saved = this.save();
        this.openDialogue([
          { text: 'Ngôi sao vàng bùng sáng khi bạn lại gần. Hơi ấm quấn quanh vai bạn.' },
          ...(healed > 0 ? [{ text: `HP đã hồi phục hoàn toàn (+${healed}).` }] : []),
          { text: saved ? 'Hành trình đã được ghi lại.' : 'Không lưu được hành trình vì trình duyệt chặn bộ nhớ. Hãy thử lại ở điểm lưu này.' },
          { speaker: 'Đom', portrait: 'dom', text: 'Tôi thích chỗ này. Sáng, ấm, và không có ai giẫm lên tôi.' },
        ]);
        break;
      }
      case 'spring': {
        if (this.flags.spring_used) {
          this.openDialogue(SPRING_LINES.used);
          break;
        }
        this.flags.spring_used = true;
        this.game.healFull();
        audio.heal();
        this.openDialogue(SPRING_LINES.first);
        break;
      }
      case 'npc': {
        this.talkToNpc(o);
        break;
      }
      case 'boss': {
        if (this.flags[`${o.flag}_method`] === 'kill') return;
        if (o.done) {
          const outro = BOSS_OUTRO[o.enemy];
          if (outro) this.openDialogue(outro);
          break;
        }
        const intro = BOSS_INTRO[o.enemy] ?? [];
        this.openDialogue(intro, () => {
          this.triggerBattle(o.enemy, o);
        });
        break;
      }
      default:
        break;
    }
  }

  talkToNpc(o) {
    const handler = NPC_TALK[o.id];
    if (!handler) return;
    const result = handler({ flags: this.flags, room: this.room.id, player: this.game.player });
    if (Array.isArray(result)) {
      this.openDialogue(result);
      return;
    }
    const { lines, reward = {} } = result;
    this.openDialogue(lines, () => {
      if (reward.items) {
        for (const [id, count] of Object.entries(reward.items)) this.game.addItem(id, count);
      }
      if (reward.heal) {
        const healed = this.game.healFull();
        if (healed > 0) this.game.toast(`${o.name ?? 'Người bạn'} hồi cho bạn ${healed} HP`);
      }
      if (reward.flag) this.flags[reward.flag] = true;
      if (reward.openShop) this.openShop(Array.isArray(reward.openShop) ? reward.openShop : SHOP_STOCK);
      audio.confirm();
    });
  }

  // ----------------------------------------------------------
  //  Trận đánh
  // ----------------------------------------------------------
  triggerBattle(enemyId, bossObject = null) {
    audio.encounter();
    this.flash = 0.9;
    this.pendingBattle = {
      enemy: enemyId,
      timer: 0.75,
      onEnd: (result) => this.afterBattle(result, enemyId, bossObject),
    };
  }

  afterBattle(result, enemyId, bossObject) {
    this.encounterDist = 0;
    this.encounterNext = rand(this.room.encounters?.min ?? 700, this.room.encounters?.max ?? 1000);
    if (result === 'dead') {
      this.game.onDeath();
      return;
    }
    const enemy = ENEMIES[enemyId];
    if (bossObject && (result === 'spare' || result === 'kill')) {
      bossObject.done = true;
      this.flags[bossObject.flag] = true;
      this.flags[`${bossObject.flag}_method`] = result;
      if (bossObject.final) {
        this.game.finishGame(result);
        return;
      }
      const outro = (result === 'kill' ? BOSS_KILL_OUTRO : BOSS_OUTRO)[enemyId] ?? [];
      const healAmount = Math.round(this.game.player.maxHp * 0.4);
      const healed = this.game.heal(healAmount);
      this.openDialogue(
        [...outro, { text: `Bạn ngồi nghỉ một lát và hồi ${healed} HP.` }],
        () => {
          if (this.save()) this.game.toast('Hành trình đã được ghi lại');
        }
      );
    }
  }

  // ----------------------------------------------------------
  //  Cửa hàng
  // ----------------------------------------------------------
  openShop(stock = SHOP_STOCK) {
    this.shop = { index: 0, message: '', messageTimer: 0, items: stock };
    audio.select();
  }

  updateShop() {
    const shop = this.shop;
    const list = shop.items;
    if (Input.consume('up')) {
      shop.index = (shop.index - 1 + list.length) % list.length;
      audio.select();
    }
    if (Input.consume('down')) {
      shop.index = (shop.index + 1) % list.length;
      audio.select();
    }
    if (Input.consume('cancel')) {
      this.shop = null;
      audio.cancel();
      return;
    }
    if (Input.consume('confirm')) {
      const id = list[shop.index];
      const item = ITEMS[id];
      const player = this.game.player;
      if (player.gold >= item.price) {
        player.gold -= item.price;
        this.game.addItem(id, 1);
        audio.coin();
        shop.message = `Đã mua ${item.name}. Cảm ơn nhé.`;
      } else {
        audio.cancel();
        shop.message = 'Không đủ tro rồi. Đi nhặt thêm đi.';
      }
      shop.messageTimer = 2.6;
    }
  }

  drawShop() {
    const shop = this.shop;
    const player = this.game.player;
    R.frame(120, 96, 400, 300, { border: '#ffffff', fill: '#000000', lw: 5 });
    R.text('CHỢ TRO', 320, 110, { size: 22, bold: true, align: 'center', color: '#ffb347', spacing: 3 });
    R.text(`Túi của bạn: ${player.gold} tro`, 320, 140, { size: 15, align: 'center', color: '#ffd166' });

    shop.items.forEach((id, i) => {
      const item = ITEMS[id];
      const y = 170 + i * 38;
      const selected = i === shop.index;
      if (selected) {
        R.box(136, y - 6, 368, 32, { fill: 'rgba(255,150,70,0.12)', border: '#ffb347', lw: 1, cut: 2 });
        R.heart(150, y + 2, 2, '#ffd166');
      }
      const owned = player.items[id] ?? 0;
      const name = item.name;
      R.text(name, 180, y, { size: 17, color: selected ? '#fff' : '#d8d2c4' });
      if (owned > 0) {
        R.text(`×${owned}`, 180 + R.measure(name, 17) + 10, y + 4, { size: 12, color: '#8d877c' });
      }
      R.text(`${item.price} tro`, 496, y, { size: 16, align: 'right', color: player.gold >= item.price ? '#9fd48c' : '#c46a6a' });
    });

    // mô tả vật phẩm đang chọn — để dưới danh sách cho khỏi đè chữ
    const sel = ITEMS[shop.items[shop.index]];
    if (sel) {
      const lines = R.wrap(sel.desc, 330, 14);
      lines.slice(0, 2).forEach((l, i) => {
        R.text(l, 320, 314 + i * 20, { size: 14, align: 'center', color: '#a8a294' });
      });
    }

    R.text(shop.message || 'Z: mua · X: rời đi', 320, 362, { size: 14, align: 'center', color: shop.message ? '#ffd166' : '#8d877c' });
  }

  // ----------------------------------------------------------
  //  Túi đồ / tạm dừng
  // ----------------------------------------------------------
  updatePause() {
    const player = this.game.player;
    const ids = Object.keys(player.items).filter((id) => (player.items[id] ?? 0) > 0);
    if (Input.consume('cancel') || Input.consume('hint')) {
      this.paused = false;
      audio.cancel();
      return;
    }
    if (!ids.length) return;
    if (Input.consume('up')) {
      this.pauseIndex = (this.pauseIndex - 1 + ids.length) % ids.length;
      audio.select();
    }
    if (Input.consume('down')) {
      this.pauseIndex = (this.pauseIndex + 1) % ids.length;
      audio.select();
    }
    if (Input.consume('confirm')) {
      const id = ids[clamp(this.pauseIndex, 0, ids.length - 1)];
      const item = ITEMS[id];
      if (player.hp >= player.maxHp) {
        this.pauseMessage = 'Bạn đang khoẻ mạnh. Chưa cần dùng gì cả.';
        audio.cancel();
      } else {
        const healed = this.game.useItem(id);
        if (healed > 0) {
          audio.heal();
          this.pauseMessage = `${item.name}: hồi ${healed} HP.`;
        }
      }
      this.pauseMessageTimer = 2.6;
      const remaining = Object.keys(player.items).filter((id) => player.items[id] > 0).length;
      this.pauseIndex = clamp(this.pauseIndex, 0, Math.max(0, remaining - 1));
    }
  }

  drawPause() {
    const player = this.game.player;
    R.fade(0.6);
    R.frame(70, 44, 500, 392, { border: '#ffffff', fill: 'rgba(0,0,0,0.97)', lw: 5 });
    R.text('TÚI ĐỒ', 320, 60, { size: 24, bold: true, align: 'center', spacing: 4, color: '#f2eee4' });

    R.text(`LV ${player.lv}`, 110, 104, { size: 17, color: '#ffd166' });
    R.text(`HP ${Math.max(0, player.hp)} / ${player.maxHp}`, 250, 104, { size: 17, color: '#9fd48c' });
    R.text(`Tro ${player.gold}`, 440, 104, { size: 17, color: '#ffb347' });
    R.text(`Công ${player.atk} · Tha ${player.spares} · Hạ ${player.kills}`, 110, 130, { size: 14, color: '#8d877c' });

    const ids = Object.keys(player.items).filter((id) => (player.items[id] ?? 0) > 0);
    R.text('VẬT PHẨM', 110, 168, { size: 14, bold: true, color: '#8d877c', spacing: 2 });
    if (!ids.length) {
      R.text('(Không có gì trong túi.)', 130, 194, { size: 15, italic: true, color: '#6f6a60' });
    } else {
      const visibleCount = 3;
      const start = clamp(this.pauseIndex - visibleCount + 1, 0, Math.max(0, ids.length - visibleCount));
      if (ids.length > visibleCount) R.text(`${this.pauseIndex + 1} / ${ids.length} · ↑↓`, 530, 168, { size: 13, align: 'right', color: '#8d877c' });
      ids.slice(start, start + visibleCount).forEach((id, i) => {
        const item = ITEMS[id];
        const y = 194 + i * 40;
        const selected = start + i === this.pauseIndex;
        if (selected) {
          R.heart(118, y + 2, 2, '#ffd166');
        }
        R.text(`${item.name} ×${player.items[id]}`, 146, y, { size: 17, color: selected ? '#fff' : '#d8d2c4' });
        if (selected) R.text(item.desc, 146, y + 20, { size: 12, color: '#a8a294' });
      });
    }

    R.text('Z: dùng vật phẩm · X: đóng túi', 320, 372, { size: 15, align: 'center', color: '#8d877c' });
    R.text(`${this.room?.title ?? ''} — ${this.room?.subtitle ?? ''}`, 320, 402, { size: 13, align: 'center', italic: true, color: '#6f6a60' });
    if (this.pauseMessageTimer > 0) {
      R.text(this.pauseMessage, 320, 352, { size: 15, align: 'center', color: '#ffd166' });
    }
  }

  // ----------------------------------------------------------
  //  Lưu
  // ----------------------------------------------------------
  save(silent = false) {
    const p = this.player;
    const spawn = this.room.saveSpawn ?? { x: p.x / TILE - 0.5, y: p.y / TILE - 0.5, facing: p.facing };
    const ok = Save.write({
      roomId: this.room.id,
      spawn,
      player: this.game.player,
      flags: this.flags,
      playtime: Math.round(this.game.playtime),
    });
    if (!ok && !silent) this.game.toast('Không lưu được (trình duyệt chặn bộ nhớ)');
    return ok;
  }

  // ----------------------------------------------------------
  //  Vẽ
  // ----------------------------------------------------------
  draw() {
    R.ctx.drawImage(this.background, 0, 0);

    // rào tro chắn lối đi chưa mở
    for (const exit of this.room.exits ?? []) {
      if (exit.requires && !this.flags[exit.requires]) this.drawBarrier(exit);
    }

    // các vật thể và người chơi, sắp theo trục dọc
    const drawables = this.objects.map((o) => ({ y: o.y * TILE, draw: () => this.drawObject(o) }));
    drawables.push({ y: this.player.y, draw: () => this.drawPlayer() });
    drawables.sort((a, b) => a.y - b.y);
    drawables.forEach((d) => d.draw());

    // vệt sáng lơ lửng (đèn, nấm, hoa)
    this.drawAmbientLights();
    if (this.companion.active) this.drawCompanion();

    this.embers.draw();
    R.vignette(0.45);

    if (this.nearObject && !this.dialogue && !this.paused && !this.shop && !this.pendingBattle) {
      this.drawPrompt(this.nearObject);
    }

    if (this.titleTimer > 0 && this.room) this.drawRoomTitle();

    if (this.dialogue) this.dialogue.draw();
    if (this.shop) this.drawShop();
    if (this.paused) this.drawPause();

    if (this.flash > 0) R.fade(this.flash * 0.7, '#fff');
    if (this.fade > 0) R.fade(this.fade);
  }

  drawRoomTitle() {
    const a = clamp(this.titleTimer / 2.8, 0, 1);
    const alpha = a > 0.75 ? (1 - a) / 0.25 : Math.min(1, a * 3);
    const y = 66;
    R.fade(alpha * 0.35);
    R.text(this.room.title, 320, y, { size: 30, bold: true, align: 'center', spacing: 8, color: '#f2eee4', alpha });
    R.text(this.room.subtitle, 320, y + 42, { size: 14, italic: true, align: 'center', color: '#c9b98e', alpha });
  }

  drawPlayer() {
    const p = this.player;
    const bob = p.moving ? Math.abs(Math.sin(p.anim)) * 2.4 : 0;
    const spriteName = p.facing === 'left' || p.facing === 'right' ? 'playerSide' : p.facing === 'up' ? 'playerUp' : 'playerDown';
    const flip = p.facing === 'right';
    R.glow(p.x, p.y + 2, 26, '#000', 0.0);
    // bóng
    R.ctx.save();
    R.ctx.globalAlpha = 0.35;
    R.ctx.fillStyle = '#000';
    R.ctx.beginPath();
    R.ctx.ellipse(p.x, p.y + 4, 12, 4, 0, 0, Math.PI * 2);
    R.ctx.fill();
    R.ctx.restore();
    // nhân vật gốc (Frisk): đứng yên dùng khung 0, đi thì đổi khung theo hướng
    const frames = PLAYER_ART[p.facing] || PLAYER_ART.down;
    const frame = p.moving ? frames[Math.floor(p.anim / 1.6) % frames.length] : frames[0];
    if (!drawLocal([frame, frames[0]], p.x, p.y + 4, 2)) {
      drawSprite(spriteName, p.x, p.y + 4 - bob, 2.2, { flip });
    }
  }

  drawCompanion() {
    const c = this.companion;
    R.glow(c.x, c.y, 26, '#ffd166', 0.5);
    const dom = art.get(PROP_ART.dom);
    if (dom) {
      R.image(dom, c.x, c.y + 4, 2.4, { anchor: 'bottom-center' });
    } else {
      drawSprite('dom', c.x, c.y + 4, 1.6, {});
    }
  }

  /** NPC dùng sprite gốc nếu máy có: đom đóm, bà nấm (ghép lại như bản gốc). */
  drawNpcArt(o, x, y, bob) {
    const ay = y + 8 - bob;
    if (o.sprite === 'dom') {
      const dom = art.get(PROP_ART.dom);
      if (dom) {
        R.image(dom, x, ay, 2.4, { anchor: 'bottom-center' });
        return;
      }
    }
    if (
      o.sprite === 'baMoc' &&
      drawParts(BAMOC_ART.parts, x, ay, BAMOC_ART.scale, { offsetScale: BAMOC_ART.scale / 2 })
    ) {
      return;
    }
    const npcImg = art.get(NPC_ART[o.sprite]);
    if (npcImg) {
      R.image(npcImg, x, ay, o.scale ?? 2, { anchor: 'bottom-center' });
      return;
    }
    drawSprite(o.sprite, x, ay, o.scale ?? 2, {});
  }

  drawObject(o) {
    if (o.type === 'boss' && this.flags[`${o.flag}_method`] === 'kill') return;
    const x = o.x * TILE;
    const y = o.y * TILE;
    const bob = o.bob ? Math.sin(this.time * 2.2 + o.x) * 3 : 0;
    switch (o.type) {
      case 'lamp': {
        const pulse = 0.4 + Math.sin(this.time * 2.6) * 0.12;
        R.glow(x, y - 16, 60 + pulse * 20, '#ffd166', 0.30);
        const sao = art.get('spr_savepoint_0.png');
        const saoSang = art.get('spr_savepoint_1.png');
        if (sao) {
          // điểm lưu gốc: hai khung hình nhấp nháy
          const bright = Math.sin(this.time * 3.4) > 0.1 && saoSang;
          R.image(bright ? saoSang : sao, x, y + 8, 1.25, { anchor: 'bottom-center' });
        } else {
          drawSprite('star', x, y + 12, 2.4, {});
        }
        // tia sáng xoay quanh ngôi sao
        const c = R.ctx;
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
          const a = this.time * 1.2 + (i * Math.PI) / 2;
          const rx = x + Math.cos(a) * 22;
          const ry = y - 16 + Math.sin(a) * 10;
          c.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(this.time * 3 + i));
          c.fillStyle = '#fff8e0';
          c.fillRect(Math.round(rx) - 1, Math.round(ry) - 1, 3, 3);
        }
        c.restore();
        break;
      }
      case 'chest': {
        const ruong = art.get(PROP_ART.chest);
        if (ruong) {
          R.image(ruong, x, y + 10, 1.8, {
            anchor: 'bottom-center',
            alpha: o.opened ? 0.45 : 1,
            tint: o.opened ? '#8a8a92' : null,
          });
        } else {
          drawSprite(o.opened ? 'chestOpen' : 'chestClosed', x, y + 8, 2, {});
        }
        if (!o.opened) R.glow(x, y - 4, 30, '#ffd166', 0.18 + Math.sin(this.time * 2.6) * 0.06);
        break;
      }
      case 'sign': {
        const bien = art.get(PROP_ART.sign);
        if (bien) R.image(bien, x, y + 10, 2, { anchor: 'bottom-center' });
        else drawSprite('sign', x, y + 8, 2, {});
        break;
      }
      case 'spring': {
        R.ctx.save();
        R.ctx.globalAlpha = 0.5;
        R.ctx.strokeStyle = '#a8e2ff';
        R.ctx.lineWidth = 2;
        for (let i = 0; i < 2; i++) {
          const r = 10 + ((this.time * 18 + i * 22) % 40);
          R.ctx.globalAlpha = 0.45 * (1 - r / 50);
          R.ctx.beginPath();
          R.ctx.ellipse(x, y + 4, r, r * 0.42, 0, 0, Math.PI * 2);
          R.ctx.stroke();
        }
        R.ctx.restore();
        if (!this.flags.spring_used) R.glow(x, y, 46, '#8fe3d0', 0.34);
        break;
      }
      case 'npc': {
        const nameTag = o.name;
        if (o.stall) {
          // mái che sọc + quầy hàng cho tiệm của Nhím
          const ctx = R.ctx;
          ctx.save();
          // cột chống
          ctx.fillStyle = '#4a3628';
          ctx.fillRect(x - 50, y - 50, 5, 58);
          ctx.fillRect(x + 45, y - 50, 5, 58);
          // mái che
          const aw = 116;
          const ax = x - aw / 2;
          ctx.fillStyle = '#3a2a22';
          ctx.fillRect(ax - 3, y - 66, aw + 6, 20);
          const stripes = 8;
          const sw = aw / stripes;
          for (let i = 0; i < stripes; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#c1523f' : '#e8d9b0';
            ctx.fillRect(ax + i * sw, y - 64, Math.ceil(sw), 16);
          }
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(ax, y - 50, aw, 3);
          ctx.restore();
        }
        R.glow(x, y - 22, 40, '#ffd166', 0.16);
        this.drawNpcArt(o, x, y, bob);
        if (o.stall) {
          const ctx = R.ctx;
          ctx.fillStyle = '#5a4230';
          ctx.fillRect(x - 44, y + 6, 88, 11);
          ctx.fillStyle = '#6d5139';
          ctx.fillRect(x - 44, y + 6, 88, 3);
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          ctx.fillRect(x - 44, y + 14, 88, 3);
        }
        if (nameTag) {
          R.text(nameTag, x, y - (o.sprite === 'baMoc' ? 54 : o.stall ? 76 : 46), { size: 12, align: 'center', color: '#c9b98e' });
        }
        break;
      }
      case 'boss': {
        if (o.enemy === 'king') {
          const ctx = R.ctx;
          // bóng dưới chân
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.ellipse(x, y + 22, 46, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          R.glow(x, y - 30, 130, o.done ? '#5a7fd8' : '#ff7a3c', 0.34);
          R.glow(x, y - 10, 70, o.done ? '#a8c4ff' : '#ffb066', 0.22);
          // Vua Tro: ghép từ sprite gốc, không có thì art tự sinh
          if (!drawParts(KING_ART.parts, x, y + 20 - bob * 0.4, KING_ART.scale, { alpha: o.done ? 0.65 : 1 })) {
            drawSprite('king', x, y + 20 - bob * 0.4, 2.6, { alpha: o.done ? 0.65 : 1 });
          }
        } else {
          R.glow(x, y - 30, 80, o.done ? '#7fd8a8' : '#9fd8ff', 0.30);
          const shadow = (w, h) => {
            const ctx = R.ctx;
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(x, y + 22, w, h, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          };
          const painted = drawLocal(ENEMY_ART[o.enemy], x, y + 12 - bob * 0.3, 3, {
            alpha: o.done ? 0.7 : 1,
          });
          if (painted) {
            shadow(34, 8);
          } else {
            shadow(26, 7);
            drawSprite(o.enemy, x, y + 10 - bob * 0.3, 3, { alpha: o.done ? 0.7 : 1 });
          }
        }
        break;
      }
      default:
        break;
    }
  }

  drawAmbientLights() {
    // đèn lồng và nấm phát sáng theo nhịp thở
    const pulse = 0.22 + Math.sin(this.time * 2.4) * 0.06;
    for (let ty = 0; ty < this.map.length; ty++) {
      for (let tx = 0; tx < this.map[ty].length; tx++) {
        const ch = this.map[ty][tx];
        if (ch === 'l') R.glow(tx * TILE + 16, ty * TILE + 12, 60, this.theme.accent, pulse);
        else if (ch === 'm') R.glow(tx * TILE + 16, ty * TILE + 14, 26, this.theme.accent, 0.20);
        else if (ch === 'f') R.glow(tx * TILE + 16, ty * TILE + 16, 34, this.theme.glow, pulse * 0.8);
        else if (ch === 'v') R.glow(tx * TILE + 16, ty * TILE + 16, 30, this.theme.glow, pulse * 0.7);
      }
    }
  }

  drawBarrier(exit) {
    const x = exit.x * TILE;
    const y = exit.y * TILE;
    const h = exit.h * TILE;
    const ctx = R.ctx;
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(this.time * 4) * 0.1;
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, 'rgba(255,140,60,0.05)');
    grad.addColorStop(0.5, 'rgba(255,140,60,0.35)');
    grad.addColorStop(1, 'rgba(255,140,60,0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 6, y, TILE + 12, h);
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 6; i++) {
      const py = y + ((this.time * 40 + i * 22) % h);
      ctx.fillRect(x + 6 + (i % 3) * 8, py, 2, 4);
    }
    ctx.restore();
    R.glow(x + TILE / 2, y + h / 2, 60, '#ff8a3d', 0.25);
  }

  drawPrompt(o) {
    const x = o.x * TILE;
    const y = o.y * TILE - (o.type === 'boss' ? 70 : o.type === 'npc' ? 52 : 42);
    const bob = Math.sin(this.time * 5) * 2;
    const label = o.type === 'lamp' ? 'NGHỈ' : o.type === 'boss' ? (o.done ? 'NÓI' : 'ĐỐI ĐẦU') : o.type === 'chest' ? 'MỞ' : 'NÓI';
    const w = R.measure(label, 12, true) + 26;
    R.box(x - w / 2, y + bob, w, 24, { fill: 'rgba(5,5,10,0.85)', border: '#ffd166', lw: 1, cut: 2 });
    R.text('Z', x - w / 2 + 8, y + 5 + bob, { size: 13, bold: true, color: '#ffd166' });
    R.text(label, x - w / 2 + 22, y + 6 + bob, { size: 12, color: '#f2eee4' });
  }
}
