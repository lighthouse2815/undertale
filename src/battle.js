// ============================================================
//  Trận đánh: theo lượt, né đạn, ĐÁNH / NÓI / ĐỒ / THA
// ============================================================
import { R, W, H, Input, Typewriter, Embers, audio, clamp, rand, randInt, pick, dist, hash2 } from './core.js';
import { drawSprite, drawLocal, drawParts } from './sprites.js';
import { art, BUTTON_ART, ENEMY_ART, KING_ART } from './localassets.js';
import { ENEMIES, ITEMS } from './data.js';

const PANEL = { x: 20, y: 314, w: 600, h: 150 };
const BUTTONS = [
  { key: 'fight', label: 'ĐÁNH', hint: 'Z' },
  { key: 'act', label: 'NÓI', hint: 'Z' },
  { key: 'item', label: 'ĐỒ', hint: 'Z' },
  { key: 'mercy', label: 'THA', hint: 'Z' },
];

const BG = {
  moss: { top: '#0d1a12', bottom: '#05070a', accent: '#6fae4d', ember: '#a8e26b', silhouette: '#12241a' },
  ash: { top: '#1b1210', bottom: '#050406', accent: '#ff9a4d', ember: '#ffb066', silhouette: '#241715' },
  snow: { top: '#0e1a26', bottom: '#04070c', accent: '#8fd3ff', ember: '#bfe6ff', silhouette: '#16242e' },
  throne: { top: '#1a0f14', bottom: '#050306', accent: '#ff6b3d', ember: '#ff8a4d', silhouette: '#2a1620' },
};

export class Battle {
  constructor(game, enemyId, onEnd) {
    this.game = game;
    this.player = game.player;
    this.enemy = ENEMIES[enemyId];
    this.onEnd = onEnd;
    this.enemyHp = this.enemy.hp;
    this.maxEnemyHp = this.enemy.hp;
    this.warmth = 0;
    this.phase = 'intro';
    this.time = 0;
    this.menuIndex = 0;
    this.subIndex = 0;
    this.subKind = null;
    this.subScroll = 0;
    this.usedActs = {};
    this.stage = 1;
    this.stageLineShown = false;
    this.turn = 0;
    this.flavor = this.enemy.intro;
    this.typer = null;
    this.textQueue = [];
    this.afterText = null;
    this.currentLine = null;
    this.bullets = [];
    this.patternTimer = 0;
    this.patternIndex = 0;
    this.patternRing = [];
    this.attackTime = 0;
    this.attackDuration = 0;
    this.invuln = 0;
    this.soul = { x: W / 2, y: 190 };
    this.box = { x: 190, y: 110, w: 260, h: 150 };
    this.boxTarget = { ...this.box };
    this.enemyShake = 0;
    this.enemyFlash = 0;
    this.enemyBob = 0;
    this.barX = 140;
    this.barDir = 1;
    this.barSpeed = 400;
    this.slashTimer = 0;
    this.deathTimer = 0;
    this.particles = [];
    this.floaters = [];
    this.shakeTimer = 0;
    this.result = null;
    this.bg = BG[this.enemy.theme] ?? BG.moss;
    this.embers = new Embers(34, { color: this.bg.ember, speed: 12, drift: 16, size: 2, area: { x: 0, y: 0, w: W, h: 300 } });
    this.animTime = 0;
    this.soulTrail = [];
    this.startIntro();
  }

  // ----------------------------------------------------------
  //  Hội thoại trong trận
  // ----------------------------------------------------------
  say(lines, after = null) {
    this.textQueue = lines.map((l) => (typeof l === 'string' ? { text: l } : l));
    this.afterText = after;
    this.phase = 'message';
    this.nextLine();
  }

  nextLine() {
    const line = this.textQueue.shift();
    if (!line) {
      this.typer = null;
      this.currentLine = null;
      const cb = this.afterText;
      this.afterText = null;
      if (cb) cb();
      return;
    }
    this.currentLine = line;
    this.typer = new Typewriter(line.text, 62);
  }

  advanceMessage() {
    if (this.typer && !this.typer.done) {
      this.typer.skip();
      audio.select();
      return;
    }
    if (this.textQueue.length) {
      audio.select();
      this.nextLine();
      return;
    }
    const cb = this.afterText;
    this.afterText = null;
    this.typer = null;
    this.currentLine = null;
    if (cb) cb();
  }

  startIntro() {
    const p = this.player;
    const lines = [
      { text: this.enemy.intro },
      { text: `${this.enemy.name} xuất hiện!` },
      { text: `(HP ${Math.max(0, Math.round(p.hp))}/${p.maxHp} · LV ${p.lv} · Z để chọn, X để quay lại)` },
    ];
    this.say(lines, () => this.toMenu());
  }

  toMenu() {
    this.phase = 'menu';
    this.menuIndex = 0;
    this.subKind = null;
    this.refreshFlavor();
  }

  refreshFlavor() {
    this.flavor = pick(this.enemy.banter);
  }

  // ----------------------------------------------------------
  //  Cập nhật
  // ----------------------------------------------------------
  update(dt) {
    this.time += dt;
    this.animTime += dt;
    this.embers.update(dt);
    if (this.enemyShake > 0) this.enemyShake = Math.max(0, this.enemyShake - dt * 6);
    if (this.enemyFlash > 0) this.enemyFlash = Math.max(0, this.enemyFlash - dt * 3);
    if (this.invuln > 0) this.invuln -= dt;
    if (this.shakeTimer > 0) this.shakeTimer -= dt;
    this.enemyBob += dt;
    this.updateParticles(dt);

    switch (this.phase) {
      case 'intro':
      case 'message': {
        if (this.typer) this.typer.update(dt);
        if (Input.consume('confirm') || Input.consume('cancel')) this.advanceMessage();
        break;
      }
      case 'menu':
        this.updateMenu();
        break;
      case 'act':
      case 'item':
      case 'mercy':
        this.updateSubmenu();
        break;
      case 'fightAim':
        this.updateFightAim(dt);
        break;
      case 'slash':
        this.slashTimer -= dt;
        if (this.slashTimer <= 0) this.resolveSlash();
        break;
      case 'enemyTurn':
        this.updateEnemyTurn(dt);
        break;
      case 'victory':
        if (this.typer) this.typer.update(dt);
        if (Input.consume('confirm') || Input.consume('cancel')) this.advanceMessage();
        break;
      case 'dying':
        this.deathTimer -= dt;
        if (this.deathTimer <= 0) {
          this.phase = 'gone';
          this.onEnd('dead');
        }
        break;
      default:
        break;
    }
  }

  updateMenu() {
    if (Input.consume('left')) {
      this.menuIndex = (this.menuIndex + 3) % 4;
      audio.select();
    }
    if (Input.consume('right')) {
      this.menuIndex = (this.menuIndex + 1) % 4;
      audio.select();
    }
    if (Input.consume('confirm')) {
      audio.confirm();
      const key = BUTTONS[this.menuIndex].key;
      if (key === 'fight') {
        this.phase = 'fightAim';
        this.barX = 140;
        this.barDir = 1;
      } else if (key === 'act') {
        this.subKind = 'act';
        this.subIndex = 0;
        this.phase = 'act';
        this.refreshSubList();
      } else if (key === 'item') {
        this.subKind = 'item';
        this.subIndex = 0;
        this.phase = 'item';
        this.refreshSubList();
      } else {
        this.subKind = 'mercy';
        this.subIndex = 0;
        this.phase = 'mercy';
      }
    }
  }

  availableActs() {
    const acts = this.enemy.acts.filter((a) => !a.stageOnly || this.stage >= a.stageOnly);
    return acts;
  }

  itemIds() {
    return Object.keys(this.player.items).filter((id) => this.player.items[id] > 0);
  }

  refreshSubList() {
    this.subScroll = 0;
    this.subIndex = clamp(this.subIndex, 0, Math.max(0, this.subCount() - 1));
  }

  subCount() {
    if (this.subKind === 'act') return this.availableActs().length;
    if (this.subKind === 'item') return this.itemIds().length;
    if (this.subKind === 'mercy') return 2;
    return 0;
  }

  updateSubmenu() {
    const count = this.subCount();
    if (Input.consume('cancel')) {
      audio.cancel();
      this.toMenu();
      return;
    }
    if (count === 0) {
      if (Input.consume('confirm')) {
        audio.cancel();
        this.toMenu();
      }
      return;
    }
    if (Input.consume('up')) {
      this.subIndex = (this.subIndex - 1 + count) % count;
      audio.select();
    }
    if (Input.consume('down')) {
      this.subIndex = (this.subIndex + 1) % count;
      audio.select();
    }
    if (Input.consume('confirm')) {
      audio.confirm();
      if (this.subKind === 'act') this.doAct(this.availableActs()[this.subIndex]);
      else if (this.subKind === 'item') this.doItem(this.itemIds()[this.subIndex]);
      else this.doMercy(this.subIndex);
    }
  }

  // ----------------------------------------------------------
  //  Hành động của người chơi
  // ----------------------------------------------------------
  doAct(act) {
    if (!act) return;
    const times = this.usedActs[act.label] ?? 0;
    this.usedActs[act.label] = times + 1;
    const gain = times === 0 ? act.warmth : Math.round(act.warmth * 0.4);
    this.warmth = Math.min(this.enemy.mercyAt, this.warmth + gain);
    const extra = times === 0 ? '' : '\n(Nhắc lại chuyện cũ, hơi ấm tăng ít hơn.)';
    this.say(
      [{ text: act.text + extra }, this.warmthLine()],
      () => this.afterPlayerAction()
    );
  }

  warmthLine() {
    if (this.warmth >= this.enemy.mercyAt) {
      return { text: `${this.enemy.name} đã đủ tin tưởng. Nút THA đang sáng lên!`, color: '#ffd166' };
    }
    const pct = Math.round((this.warmth / this.enemy.mercyAt) * 100);
    return { text: `Hơi ấm trong lòng ${this.enemy.name}: ${pct}%`, color: '#c9b98e' };
  }

  doItem(id) {
    const item = ITEMS[id];
    const healed = this.game.useItem(id);
    audio.heal();
    if (healed <= 0) {
      this.say([{ text: `${item.name}... nhưng bạn đang khoẻ mạnh, chẳng có gì để hồi.` }], () => this.toMenu());
      return;
    }
    this.say(
      [
        { text: `Bạn dùng ${item.name}.` },
        { text: `HP hồi ${healed}. (Còn ${Math.round(this.player.hp)}/${this.player.maxHp})` },
      ],
      () => this.afterPlayerAction()
    );
  }

  doMercy(index) {
    if (index === 0) {
      if (this.warmth >= this.enemy.mercyAt) {
        this.victory('spare');
        return;
      }
      const left = Math.ceil(100 * Math.max(0, this.enemy.mercyAt - this.warmth) / this.enemy.mercyAt);
      this.say(
        [
          { text: `Bạn chìa tay ra và đề nghị dừng lại.` },
          { text: `${this.enemy.name} vẫn còn e dè. (Cần thêm ${left}% hơi ấm — hãy thử NÓI chuyện.)` },
        ],
        () => this.afterPlayerAction()
      );
      return;
    }
    // bỏ chạy
    if (this.enemy.canFlee === false) {
      this.say(
        [{ text: 'Bạn muốn quay lưng... nhưng trận chiến này không cho phép điều đó.' }],
        () => this.toMenu()
      );
      return;
    }
    if (Math.random() < 0.7) {
      this.say([{ text: 'Bạn lùi dần rồi chạy thật nhanh. Thoát được rồi!' }], () => {
        this.phase = 'gone';
        this.onEnd('flee');
      });
    } else {
      this.say([{ text: 'Bạn vấp phải một mảnh tro và ngã. Không chạy được lần này!' }], () => this.afterPlayerAction());
    }
  }

  afterPlayerAction() {
    if (this.enemyHp <= 0) {
      this.victory('kill');
      return;
    }
    if (this.checkStage()) return;
    this.beginEnemyTurn();
  }

  checkStage() {
    const at = this.enemy.phase2At;
    if (at && this.stage === 1 && this.enemyHp <= at) {
      this.stage = 2;
      this.say(
        [
          {
            text:
              this.enemy.id === 'king'
                ? 'Tro trên người Vua Tro bùng lên. Ánh mắt ngài đau đớn hơn, nhưng cũng gần gũi hơn.'
                : this.enemy.id === 'guard'
                  ? 'Chó Tuyết Khổng Lồ đứng bật dậy, giũ tuyết khỏi bộ lông. Nó bắt đầu chạy vòng quanh bạn.'
                  : 'Gỉ sét nứt ra. Lính Sắt Vụn run lên, chuyển sang thế thủ dữ dội hơn.',
          },
          { text: 'Thế trận đã đổi. Hãy cẩn thận hơn!', color: '#ff8a3d' },
        ],
        () => this.beginEnemyTurn()
      );
      return true;
    }
    return false;
  }

  // ----------------------------------------------------------
  //  ĐÁNH
  // ----------------------------------------------------------
  updateFightAim(dt) {
    this.barX += this.barDir * this.barSpeed * dt;
    if (this.barX > 500) {
      this.barX = 500;
      this.barDir = -1;
    }
    if (this.barX < 140) {
      this.barX = 140;
      this.barDir = 1;
    }
    if (Input.consume('confirm')) {
      const center = 320;
      const d = Math.abs(this.barX - center);
      let mult;
      let label;
      if (d <= 9) {
        mult = 2.4;
        label = 'HOÀN HẢO!';
      } else if (d <= 24) {
        mult = 1.7;
        label = 'TỐT!';
      } else if (d <= 48) {
        mult = 1.2;
        label = 'ĐƯỢC';
      } else {
        mult = 0.75;
        label = 'HỤT';
      }
      this.pendingHit = { mult, label };
      this.phase = 'slash';
      this.slashTimer = 0.42;
      audio.slash();
      this.enemyShake = 1;
      this.enemyFlash = 1;
      R.addShake(5);
      for (let i = 0; i < 22; i++) {
        this.particles.push({
          x: W / 2 + rand(-70, 70),
          y: 190 + rand(-60, 60),
          vx: rand(-140, 140),
          vy: rand(-160, 60),
          life: rand(0.3, 0.8),
          age: 0,
          color: pick(['#fff2c8', '#ffb066', '#ff7a3c']),
          size: rand(2, 4),
        });
      }
    } else if (Input.consume('cancel')) {
      audio.cancel();
      this.toMenu();
    }
  }

  resolveSlash() {
    const { mult, label } = this.pendingHit ?? { mult: 1, label: '' };
    this.pendingHit = null;
    const base = this.player.atk + 4;
    const dmg = Math.max(1, Math.round(base * mult) - this.enemy.def);
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.floaters.push({ x: W / 2, y: 180, text: `${dmg}`, age: 0, life: 0.9, color: '#ffd166', size: 30 });

    const lines = [{ text: `Bạn vung tay thật mạnh!\n${label} Gây ${dmg} sát thương.` }];
    if (this.enemyHp <= 0) {
      this.victory('kill');
      return;
    }
    this.say(lines, () => this.afterPlayerAction());
  }

  // ----------------------------------------------------------
  //  Lượt của kẻ địch
  // ----------------------------------------------------------
  beginEnemyTurn() {
    this.turn += 1;
    this.phase = 'enemyTurn';
    this.bullets = [];
    this.attackTime = 0;
    this.attackDuration = 2.4 + this.enemy.attacks * 1.5 + (this.stage === 2 ? 1.1 : 0);
    const pool = this.enemy.patterns;
    this.patternRing = [];
    for (let i = 0; i < this.enemy.attacks; i++) {
      let p = pick(pool);
      let guard = 0;
      while (this.patternRing.length && p === this.patternRing[this.patternRing.length - 1] && guard < 8) {
        p = pick(pool);
        guard++;
      }
      this.patternRing.push(p);
    }
    this.patternIndex = 0;
    this.currentPattern = this.patternRing[0];
    this.patternTimer = 0.5;
    this.setBoxForPattern(this.currentPattern);
    this.soul.x = this.box.x + this.box.w / 2;
    this.soul.y = this.box.y + this.box.h / 2;
    this.soulTrail = [];
    this.patternAngle = 0;
    this.sweepSide = Math.random() < 0.5 ? -1 : 1;
    this.patternCount = 0;
    this.patternSegment = this.attackDuration / this.patternRing.length;
    audio.select();
  }

  setBoxForPattern(p) {
    const sizes = {
      rain: { w: 270, h: 150 },
      sweep: { w: 310, h: 130 },
      aimed: { w: 230, h: 150 },
      ring: { w: 250, h: 170 },
      spiral: { w: 270, h: 170 },
      walls: { w: 320, h: 140 },
    };
    const s = sizes[p] ?? { w: 260, h: 150 };
    this.boxTarget = { w: s.w, h: s.h };
    // chuyển hộp mượt mà
    this.box.w += (this.boxTarget.w - this.box.w) * 0.25;
    this.box.h += (this.boxTarget.h - this.box.h) * 0.25;
  }

  updateEnemyTurn(dt) {
    this.attackTime += dt;
    // mở rộng/thu hộp về kích thước mục tiêu
    this.box.w += (this.boxTarget.w - this.box.w) * Math.min(1, dt * 6);
    this.box.h += (this.boxTarget.h - this.box.h) * Math.min(1, dt * 6);
    this.box.x = W / 2 - this.box.w / 2;
    this.box.y = 96 - (this.box.h - 150) / 2;

    // di chuyển linh hồn
    const speed = 168;
    let dx = 0;
    let dy = 0;
    if (Input.isDown('left')) dx -= 1;
    if (Input.isDown('right')) dx += 1;
    if (Input.isDown('up')) dy -= 1;
    if (Input.isDown('down')) dy += 1;
    const len = Math.hypot(dx, dy) || 1;
    this.soul.x += (dx / len) * speed * dt;
    this.soul.y += (dy / len) * speed * dt;
    this.soul.x = clamp(this.soul.x, this.box.x + 10, this.box.x + this.box.w - 10);
    this.soul.y = clamp(this.soul.y, this.box.y + 10, this.box.y + this.box.h - 10);
    this.soulTrail.push({ x: this.soul.x, y: this.soul.y, age: 0 });
    if (this.soulTrail.length > 10) this.soulTrail.shift();
    this.soulTrail.forEach((t) => (t.age += dt));

    // chuyển pattern theo thời gian
    const idx = Math.min(this.patternRing.length - 1, Math.floor(this.attackTime / this.patternSegment));
    if (idx !== this.patternIndex) {
      this.patternIndex = idx;
      this.currentPattern = this.patternRing[idx];
      this.setBoxForPattern(this.currentPattern);
      this.patternTimer = 0.35;
      this.patternCount = 0;
    }
    const localTime = this.attackTime - this.patternIndex * this.patternSegment;

    this.spawnPattern(dt, localTime);
    this.updateBullets(dt);
    this.checkBulletHits();

    if (this.attackTime >= this.attackDuration && this.player.hp > 0) {
      this.bullets.forEach((b) => (b.dying = true));
      this.endEnemyTurn();
    }
  }

  spawnPattern(dt, localTime) {
    const p = this.currentPattern;
    const stageBoost = this.stage === 2 ? 0.75 : 1;
    const color = this.bg.ember;
    const cx = this.box.x + this.box.w / 2;
    const cy = this.box.y + this.box.h / 2;
    const inBox = () => {
      const side = randInt(0, 3);
      if (side === 0) return { x: rand(this.box.x, this.box.x + this.box.w), y: this.box.y - 8 };
      if (side === 1) return { x: rand(this.box.x, this.box.x + this.box.w), y: this.box.y + this.box.h + 8 };
      if (side === 2) return { x: this.box.x - 8, y: rand(this.box.y, this.box.y + this.box.h) };
      return { x: this.box.x + this.box.w + 8, y: rand(this.box.y, this.box.y + this.box.h) };
    };

    this.patternTimer -= dt;
    if (this.patternTimer > 0) return;

    switch (p) {
      case 'rain': {
        this.patternTimer = rand(0.18, 0.34) * stageBoost;
        const count = this.stage === 2 ? randInt(1, 2) : 1;
        for (let i = 0; i < count; i++) {
          const x = rand(this.box.x + 10, this.box.x + this.box.w - 10);
          this.bullets.push(this.makeBullet({ x, y: this.box.y - 6, vx: rand(-16, 16), vy: rand(110, 175) * (this.stage === 2 ? 1.2 : 1), r: 5, color }));
        }
        break;
      }
      case 'sweep': {
        this.patternTimer = rand(0.24, 0.42) * stageBoost;
        const fromLeft = Math.random() < 0.5;
        const y = rand(this.box.y + 12, this.box.y + this.box.h - 12);
        const vx = (fromLeft ? 1 : -1) * rand(140, 210) * (this.stage === 2 ? 1.15 : 1);
        this.bullets.push(
          this.makeBullet({ x: fromLeft ? this.box.x - 6 : this.box.x + this.box.w + 6, y, vx, vy: 0, r: 5, color })
        );
        break;
      }
      case 'aimed': {
        this.patternTimer = rand(0.5, 0.85) * stageBoost;
        const spawn = inBox();
        const angle = Math.atan2(this.soul.y - spawn.y, this.soul.x - spawn.x);
        const speed = rand(130, 185) * (this.stage === 2 ? 1.15 : 1);
        this.bullets.push(
          this.makeBullet({ x: spawn.x, y: spawn.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 6, color: '#ffcf7a' })
        );
        break;
      }
      case 'ring': {
        this.patternTimer = rand(0.9, 1.4) * stageBoost;
        const bullets = this.stage === 2 ? 14 : 10;
        const offset = rand(0, Math.PI);
        for (let i = 0; i < bullets; i++) {
          const a = offset + (i / bullets) * Math.PI * 2;
          const speed = rand(85, 125) * (this.stage === 2 ? 1.15 : 1);
          this.bullets.push(this.makeBullet({ x: cx, y: cy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: 5, color }));
        }
        break;
      }
      case 'spiral': {
        this.patternTimer = 0.07;
        this.patternAngle = (this.patternAngle ?? 0) + 0.42;
        const speed = 120 * (this.stage === 2 ? 1.2 : 1);
        for (const dir of [0, Math.PI]) {
          const a = this.patternAngle + dir;
          this.bullets.push(this.makeBullet({ x: cx, y: cy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: 4, color: '#ff9a4d' }));
        }
        break;
      }
      case 'walls': {
        this.patternTimer = rand(1.3, 1.9) * stageBoost;
        const gapY = rand(this.box.y + 26, this.box.y + this.box.h - 26);
        const gapSize = this.stage === 2 ? 58 : 76;
        const fromLeft = Math.random() < 0.5;
        const vx = (fromLeft ? 1 : -1) * 105;
        const x = fromLeft ? this.box.x - 8 : this.box.x + this.box.w + 8;
        for (let y = this.box.y + 4; y < this.box.y + this.box.h; y += 18) {
          if (Math.abs(y - gapY) < gapSize / 2) continue;
          this.bullets.push(this.makeBullet({ x, y, vx, vy: 0, r: 7, color: '#ff7a3c' }));
        }
        break;
      }
      default:
        this.patternTimer = 0.4;
        break;
    }
  }

  makeBullet({ x, y, vx, vy, r, color }) {
    return { x, y, vx, vy, r, color, age: 0, dying: false };
  }

  updateBullets(dt) {
    const margin = 40;
    for (const b of this.bullets) {
      b.age += dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (
        b.x < this.box.x - margin ||
        b.x > this.box.x + this.box.w + margin ||
        b.y < this.box.y - margin ||
        b.y > this.box.y + this.box.h + margin
      ) {
        b.dying = true;
        b.deadTimer = 0.25;
      }
    }
    this.bullets = this.bullets.filter((b) => !b.dying || (b.deadTimer -= dt) > 0);
  }

  checkBulletHits() {
    if (this.invuln > 0) return;
    for (const b of this.bullets) {
      if (b.dying) continue;
      if (dist(b.x, b.y, this.soul.x, this.soul.y) < b.r + 5) {
        this.hurtPlayer();
        b.dying = true;
        b.deadTimer = 0.2;
        break;
      }
    }
  }

  hurtPlayer() {
    const dmg = this.enemy.atk + (this.stage === 2 ? 1 : 0);
    this.player.hp = Math.max(0, this.player.hp - dmg);
    this.invuln = 1.15;
    audio.hurt();
    R.addShake(9);
    this.game.toast(`-${dmg} HP`, '#ff6b6b');
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: this.soul.x,
        y: this.soul.y,
        vx: rand(-120, 120),
        vy: rand(-120, 120),
        life: rand(0.25, 0.6),
        age: 0,
        color: '#ff5a5a',
        size: rand(2, 4),
      });
    }
    if (this.player.hp <= 0) this.beginDeath();
  }

  beginDeath() {
    this.phase = 'dying';
    this.deathTimer = 2.1;
    this.bullets = [];
    audio.death();
    R.addShake(12);
  }

  endEnemyTurn() {
    this.bullets = [];
    this.toMenu();
  }

  // ----------------------------------------------------------
  //  Kết thúc trận
  // ----------------------------------------------------------
  victory(kind) {
    this.phase = 'victory';
    const p = this.player;
    if (kind === 'spare') {
      p.spares += 1;
      const gold = Math.round(this.enemy.gold * 0.7);
      p.gold += gold;
      const heal = this.game.heal(4);
      audio.spare();
      const lines = [
        { text: this.enemy.spareLine },
        { text: this.enemy.spareReward },
        { text: `Bạn nhận ${gold} tro. (Hồi ${heal} HP nhờ hơi ấm còn lại.)`, color: '#ffd166' },
      ];
      this.say(lines, () => {
        this.finish('spare');
      });
    } else {
      p.kills += 1;
      p.exp += this.enemy.exp;
      p.gold += this.enemy.gold;
      audio.slash();
      const lines = [
        { text: this.enemy.killLine },
        { text: `Bạn nhận ${this.enemy.exp} EXP và ${this.enemy.gold} tro.`, color: '#c9b98e' },
      ];
      const leveled = this.applyLevelUp();
      if (leveled) lines.push(leveled);
      this.say(lines, () => {
        this.finish('kill');
      });
    }
    this.refreshFlavor();
  }

  applyLevelUp() {
    const p = this.player;
    const thresholds = [10, 30, 70, 130, 220, 340];
    const oldLv = p.lv;
    let leveledUp = false;
    while (p.lv - 1 < thresholds.length && p.exp >= thresholds[p.lv - 1]) {
      p.lv += 1;
      p.maxHp += 4;
      p.atk += 1;
      p.hp = p.maxHp;
      leveledUp = true;
    }
    if (!leveledUp) return null;
    audio.levelUp();
    const levels = p.lv - oldLv;
    return { text: `LV tăng lên ${p.lv}! HP tối đa +${levels * 4}, Công +${levels}. Bạn cảm thấy mình cứng cáp hơn.`, color: '#9fd48c' };
  }

  finish(result) {
    this.phase = 'gone';
    this.result = result;
    this.onEnd(result);
  }

  // ----------------------------------------------------------
  //  Vẽ
  // ----------------------------------------------------------
  draw() {
    const ctx = R.ctx;
    // nền
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, this.bg.top);
    grad.addColorStop(1, this.bg.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 320);
    this.drawBackdrop();
    this.embers.draw(ctx, 0.8);

    // kẻ địch + bảng
    if (this.phase === 'enemyTurn') {
      this.drawAttackPhase();
    } else {
      if (this.phase === 'dying') this.drawEnemyFading();
      else if (this.phase !== 'gone') this.drawEnemy();
      this.drawPanel();
    }

    this.drawParticles();
    this.drawFloaters();
    R.vignette(0.4);

    if (this.phase === 'dying') {
      const a = clamp(1 - this.deathTimer / 2.1, 0, 1);
      R.fade(a * 0.85, '#180406');
    }
  }

  drawBackdrop() {
    const ctx = R.ctx;
    ctx.save();
    // vách hang xa
    ctx.fillStyle = this.bg.silhouette;
    ctx.beginPath();
    ctx.moveTo(0, 300);
    for (let x = 0; x <= W; x += 40) {
      ctx.lineTo(x, 250 - Math.sin(x * 0.012 + 1.4) * 26 - hash2(x, 3) * 16);
    }
    ctx.lineTo(W, 300);
    ctx.closePath();
    ctx.fill();
    // sàn đấu
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(W / 2, 300, 400, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.enemy.theme === 'throne') {
      // ngai phía sau
      ctx.fillStyle = 'rgba(90,47,58,0.5)';
      ctx.fillRect(W / 2 - 70, 120, 140, 160);
      ctx.fillStyle = 'rgba(20,12,18,0.9)';
      ctx.fillRect(W / 2 - 54, 132, 108, 148);
      ctx.fillStyle = 'rgba(255,140,80,0.10)';
      ctx.beginPath();
      ctx.ellipse(W / 2, 300, 300, 40, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawEnemy() {
    const bob = Math.sin(this.enemyBob * 1.8) * 6;
    const shake = this.enemyShake > 0 ? rand(-6, 6) * this.enemyShake : 0;
    const x = W / 2 + shake;
    const y = 288 + bob;
    const e = this.enemy;
    R.glow(x, y - 60, e.isBoss ? 150 : 90, this.bg.ember, 0.22);

    const tint = this.enemyFlash > 0.55 ? '#ffffff' : this.enemyFlash > 0 ? '#ffc9c9' : null;
    const flashAlpha = this.enemyFlash > 0 ? 0.6 + Math.sin(this.time * 60) * 0.4 : 1;
    // sprite gốc nếu máy có (trùm ghép từ nhiều phần như bản gốc); không thì art tự sinh
    const painted =
      e.id === 'king'
        ? drawParts(KING_ART.parts, x, y, KING_ART.scale, { alpha: flashAlpha, tint })
        : drawLocal(ENEMY_ART[e.id], x, y, 2, { alpha: flashAlpha, tint });
    if (!painted) {
      drawSprite(e.sprite, x, y, e.scale, { tint, alpha: this.enemyFlash > 0 ? flashAlpha : 1 });
    }
    // kiệt sức: cúi xuống khi máu thấp
    this.drawStatusBars();
  }

  drawEnemyFading() {
    const a = clamp(this.deathTimer / 2.1, 0, 1);
    const ok =
      this.enemy.id === 'king'
        ? drawParts(KING_ART.parts, W / 2, 288, KING_ART.scale, { alpha: a * 0.8, tint: '#ffffff' })
        : drawLocal(ENEMY_ART[this.enemy.id], W / 2, 288, 2, { alpha: a * 0.8, tint: '#ffffff' });
    if (!ok) {
      drawSprite(this.enemy.sprite, W / 2, 288, this.enemy.scale, { alpha: a * 0.8, tint: '#ffffff' });
    }
  }

  drawStatusBars() {
    const name = this.enemy.name;
    R.text(name, W / 2, 22, { size: 20, bold: true, align: 'center', spacing: 6, color: '#f2eee4' });
    const w = 240;
    const x = W / 2 - w / 2;
    R.text('HƠI ẤM', x - 74, 56, { size: 11, color: '#c9b98e', spacing: 1 });
    R.bar(x, 58, w, 8, this.warmth / this.enemy.mercyAt, {
      fill: '#ffd166',
      back: '#2b2418',
      glow: true,
    });
    if (this.warmth >= this.enemy.mercyAt) {
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 6);
      R.text('SẴN SÀNG THA', x + w + 8, 54, { size: 11, color: '#ffd166', alpha: 0.5 + pulse * 0.5 });
    }
    // thanh máu chỉ hiện sau khi bị đánh
    if (this.enemyHp < this.maxEnemyHp) {
      R.bar(x, 72, w, 5, this.enemyHp / this.maxEnemyHp, { fill: '#e4573d', back: '#2a1216' });
    }
  }

  drawPanel() {
    const ctx = R.ctx;
    R.frame(PANEL.x, PANEL.y, PANEL.w, PANEL.h, { border: '#ffffff', fill: '#000', lw: 5 });

    // dòng trạng thái
    const p = this.player;
    R.text(`HP`, PANEL.x + 22, PANEL.y + 16, { size: 14, bold: true, color: '#ffd166' });
    R.bar(PANEL.x + 52, PANEL.y + 18, 120, 12, p.hp / p.maxHp, { fill: '#ffd166', back: '#3a2c1a', glow: p.hp <= p.maxHp * 0.3 });
    R.text(`${Math.max(0, Math.round(p.hp))} / ${p.maxHp}`, PANEL.x + 182, PANEL.y + 16, { size: 13, color: '#d8d2c4' });
    R.text(`LV ${p.lv}`, PANEL.x + 280, PANEL.y + 16, { size: 13, color: '#9fd48c' });
    R.text(`TRO ${p.gold}`, PANEL.x + 350, PANEL.y + 16, { size: 13, color: '#ffb347' });

    // nội dung theo pha
    if (this.phase === 'fightAim') this.drawFightBar();
    else if (this.phase === 'act') this.drawSubList();
    else if (this.phase === 'item') this.drawSubList();
    else if (this.phase === 'mercy') this.drawMercyList();
    else if (this.phase === 'slash') this.drawFlashText('...');
    else this.drawMessage();

    // hàng nút
    if (this.phase === 'menu') this.drawButtons();
  }

  drawMessage() {
    const line = this.currentLine;
    const text = line ? line.text : this.flavor;
    const color = line?.color ?? '#f2eee4';
    const content = this.typer ? this.typer.visible : text;
    const maxLines = this.phase === 'menu' ? 2 : 3;
    const lines = R.wrap(content, PANEL.w - 70, 18);
    lines.slice(0, maxLines).forEach((l, i) => {
      R.text(`* ${i === 0 ? l : l}`, PANEL.x + 28, PANEL.y + 44 + i * 24, { size: 18, color: line ? color : '#e8e2d4' });
    });
    if (this.typer && this.typer.done) {
      const a = 0.4 + 0.6 * Math.abs(Math.sin(this.time * 4));
      if (this.phase === 'menu') R.triangle(PANEL.x + PANEL.w - 26, PANEL.y + PANEL.h - 20, 12, 'down', '#ffd166', a);
      else R.triangle(PANEL.x + PANEL.w - 26, PANEL.y + PANEL.h - 26, 12, 'down', '#ffd166', a);
    }
    if (!line) {
      R.text('Z: chọn · X: túi đồ', PANEL.x + PANEL.w - 210, PANEL.y + 12, { size: 12, color: '#6f6a60' });
    }
  }

  drawFlashText(str) {
    R.text(str, PANEL.x + PANEL.w / 2, PANEL.y + 60, { size: 22, align: 'center', color: '#ffd166' });
  }

  drawFightBar() {
    const y = PANEL.y + 66;
    R.text('Căn giữa —— Z để vung tay!', PANEL.x + 28, PANEL.y + 38, { size: 14, color: '#c9b98e' });
    R.ctx.fillStyle = '#1b1b24';
    R.ctx.fillRect(140, y, 360, 20);
    R.ctx.strokeStyle = '#f2eee4';
    R.ctx.lineWidth = 2;
    R.ctx.strokeRect(140, y, 360, 20);
    // vùng điểm
    R.ctx.fillStyle = 'rgba(159,212,140,0.20)';
    R.ctx.fillRect(296, y, 48, 20);
    R.ctx.fillStyle = 'rgba(255,209,102,0.30)';
    R.ctx.fillRect(311, y, 18, 20);
    R.ctx.fillStyle = '#ffd166';
    R.ctx.fillRect(318, y - 4, 4, 28);
    R.ctx.fillStyle = '#fff';
    R.ctx.fillRect(this.barX - 2, y - 8, 4, 36);
    R.ctx.fillStyle = '#e4573d';
    R.ctx.fillRect(this.barX - 2, y - 8, 4, 4);
  }

  drawButtons() {
    const y = PANEL.y + 94;
    BUTTONS.forEach((b, i) => {
      const x = 38 + i * 143;
      const selected = i === this.menuIndex;
      const ready = b.key === 'mercy' && this.warmth >= this.enemy.mercyAt;
      const names = BUTTON_ART[b.key];
      const img = names ? art.get(selected || ready ? names[1] : names[0]) : null;

      // có sprite gốc (110x42) thì dùng, không thì vẽ ô chữ như trước
      if (img) {
        const sx = x + 12;
        R.image(img, sx, y, 1);
        if (selected) R.heart(sx + 8, y + 14, 2, '#ffd166', true);
        if (ready) {
          const pulse = 0.4 + 0.6 * Math.sin(this.time * 6);
          R.glow(sx + 55, y + 21, 60, '#ffd166', pulse * 0.25);
        }
        return;
      }

      R.box(x, y, 134, 44, {
        fill: selected ? 'rgba(255,150,70,0.20)' : 'rgba(12,12,20,0.9)',
        border: ready ? '#ffd166' : selected ? '#ffb347' : '#4a4550',
        lw: selected || ready ? 2 : 1,
      });
      const color = selected ? '#fff' : ready ? '#ffd166' : '#b8b2a6';
      R.text(b.label, x + 62, y + 10, { size: 19, bold: true, align: 'center', color, spacing: 2 });
      if (selected) R.heart(x + 12, y + 16, 2, '#ffd166', true);
      if (ready && b.key === 'mercy') {
        const pulse = 0.4 + 0.6 * Math.sin(this.time * 6);
        R.glow(x + 67, y + 22, 60, '#ffd166', pulse * 0.25);
      }
    });
  }

  drawSubList() {
    const isAct = this.subKind === 'act';
    const ids = isAct ? this.availableActs().map((a) => a.label) : this.itemIds();
    const items = isAct ? this.availableActs() : ids.map((id) => ITEMS[id]);
    const title = isAct ? 'NÓI ĐIỀU GÌ?' : 'DÙNG GÌ?';
    R.text(title, PANEL.x + 28, PANEL.y + 40, { size: 14, bold: true, color: '#ffb347', spacing: 1 });
    if (!items.length) {
      R.text('(Không có gì cả.)', PANEL.x + 40, PANEL.y + 70, { size: 16, italic: true, color: '#8d877c' });
      R.text('X để quay lại', PANEL.x + PANEL.w - 150, PANEL.y + 70, { size: 13, color: '#6f6a60' });
      return;
    }
    const maxShow = 2;
    const start = clamp(this.subIndex - maxShow + 1, 0, Math.max(0, items.length - maxShow));
    items.slice(start, start + maxShow).forEach((entry, i) => {
      const index = start + i;
      const selected = index === this.subIndex;
      const y = PANEL.y + 66 + i * 34;
      if (selected) {
        R.heart(PANEL.x + 30, y + 3, 2, '#ffd166');
      }
      if (isAct) {
        R.text(entry.label, PANEL.x + 56, y, { size: 18, color: selected ? '#fff' : '#d8d2c4' });
        const used = this.usedActs[entry.label] ? ` (đã nói ${this.usedActs[entry.label]} lần)` : '';
        R.text(used, PANEL.x + 200, y + 3, { size: 12, color: '#8d877c' });
      } else {
        const count = this.player.items[entry === undefined ? '' : ids[index]] ?? 0;
        R.text(`${entry.name} ×${count}`, PANEL.x + 56, y, { size: 18, color: selected ? '#fff' : '#d8d2c4' });
        R.text(entry.desc, PANEL.x + 250, y + 4, { size: 12, color: '#8d877c' });
      }
    });
    R.text('Z: chọn · X: quay lại', PANEL.x + PANEL.w - 210, PANEL.y + PANEL.h - 24, { size: 12, color: '#6f6a60' });
  }

  drawMercyList() {
    const options = [
      { label: 'THA', hint: this.warmth >= this.enemy.mercyAt ? 'Đã đủ hơi ấm — đề nghị dừng lại' : 'Đề nghị dừng lại' },
      { label: 'CHẠY', hint: this.enemy.canFlee === false ? 'Không thể bỏ chạy' : 'Cố gắng rời đi' },
    ];
    R.text('THƯƠNG LƯỢNG', PANEL.x + 28, PANEL.y + 40, { size: 14, bold: true, color: '#ffb347', spacing: 1 });
    options.forEach((o, i) => {
      const y = PANEL.y + 66 + i * 34;
      const selected = i === this.subIndex;
      const ready = i === 0 && this.warmth >= this.enemy.mercyAt;
      if (selected) R.heart(PANEL.x + 30, y + 3, 2, '#ffd166');
      R.text(o.label, PANEL.x + 56, y, { size: 18, color: ready ? '#ffd166' : selected ? '#fff' : '#d8d2c4' });
      R.text(o.hint, PANEL.x + 250, y + 4, { size: 12, color: '#8d877c' });
    });
    R.text('Z: chọn · X: quay lại', PANEL.x + PANEL.w - 210, PANEL.y + PANEL.h - 24, { size: 12, color: '#6f6a60' });
  }

  drawAttackPhase() {
    const ctx = R.ctx;
    const b = this.box;
    // kẻ địch mờ phía sau
    ctx.save();
    ctx.globalAlpha = 0.22;
    const bob = Math.sin(this.enemyBob * 1.8) * 6;
    drawSprite(this.enemy.sprite, W / 2, 288 + bob, this.enemy.scale, {});
    ctx.restore();

    R.box(b.x, b.y, b.w, b.h, { fill: 'rgba(3,3,8,0.92)', border: '#f2eee4', lw: 3, cut: 4 });

    // đường viền cảnh báo khi sắp hết giờ
    const remaining = this.attackDuration - this.attackTime;
    if (remaining < 1.2) {
      const a = 0.25 + 0.35 * Math.sin(this.time * 20);
      R.box(b.x - 4, b.y - 4, b.w + 8, b.h + 8, { fill: null, border: '#ffd166', lw: 2, alpha: a, cut: 4 });
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const t of this.soulTrail) {
      ctx.globalAlpha = Math.max(0, 0.22 - t.age * 0.5);
      ctx.fillStyle = '#e5484d';
      ctx.fillRect(t.x - 2, t.y - 2, 4, 4);
    }
    ctx.restore();

    // đạn
    for (const bl of this.bullets) {
      const alpha = bl.dying ? clamp((bl.deadTimer ?? 0) / 0.25, 0, 1) : clamp(bl.age / 0.08, 0, 1);
      R.glow(bl.x, bl.y, bl.r * 4, bl.color, alpha * 0.35);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = bl.color;
      ctx.beginPath();
      ctx.arc(bl.x, bl.y, bl.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(bl.x - bl.r * 0.2, bl.y - bl.r * 0.2, bl.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // linh hồn
    if (this.invuln > 0 && Math.floor(this.time * 20) % 2 === 0) {
      // nhấp nháy khi vừa trúng đòn
    } else {
      const pulse = 1 + Math.sin(this.time * 8) * 0.08;
      R.heart(this.soul.x - 7 * pulse, this.soul.y - 6 * pulse, 2 * pulse, '#e5484d', true);
    }

    // HP + nhắc nhở
    const p = this.player;
    R.bar(W / 2 - 150, b.y + b.h + 18, 220, 12, p.hp / p.maxHp, { fill: '#ffd166', back: '#2b2418' });
    R.text(`HP ${Math.max(0, Math.round(p.hp))}/${p.maxHp}`, W / 2 - 150 + 230, b.y + b.h + 16, { size: 13, color: '#d8d2c4' });
    R.text('NÉ ĐI!', W / 2 + 220, b.y + b.h + 16, { size: 14, bold: true, color: '#ff8a3d', spacing: 2 });
  }

  drawParticles() {
    const ctx = R.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      const a = clamp(1 - p.age / p.life, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.restore();
  }

  drawFloaters() {
    for (const f of this.floaters) {
      const a = clamp(1 - f.age / f.life, 0, 1);
      R.text(f.text, f.x, f.y - f.age * 60, { size: f.size, bold: true, align: 'center', color: f.color, alpha: a, shadow: true });
    }
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
    }
    this.particles = this.particles.filter((p) => p.age < p.life);
    for (const f of this.floaters) f.age += dt;
    this.floaters = this.floaters.filter((f) => f.age < f.life);
  }
}
