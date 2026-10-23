// ============================================================
//  DƯỚI ĐẤT — lõi engine: nhập liệu, âm thanh, vẽ, hội thoại, lưu
// ============================================================

export const W = 640;
export const H = 480;

// ------------------------------------------------------------
// Tiện ích
// ------------------------------------------------------------
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

/** Nhiễu tất định để vẽ hoa văn nền ổn định giữa các khung hình. */
export function hash2(x, y) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

// ------------------------------------------------------------
// Nhập liệu (bàn phím + nút cảm ứng)
// ------------------------------------------------------------
const KEYMAP = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Enter: 'confirm',
  NumpadEnter: 'confirm',
  KeyZ: 'confirm',
  Space: 'confirm',
  Escape: 'cancel',
  KeyX: 'cancel',
  Backspace: 'cancel',
  KeyM: 'mute',
  KeyF: 'fullscreen',
  KeyH: 'hint',
};

class InputEngine {
  constructor() {
    this.down = new Set();
    this.just = new Set();
    this.anyJust = false;
    this.pointers = new Map();
    this.touchEnabled = window.matchMedia('(pointer: coarse)').matches;
  }

  attach(root = document) {
    window.addEventListener('keydown', (e) => {
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      if (e.repeat) return;
      if (!this.down.has(action)) this.just.add(action);
      this.down.add(action);
      this.anyJust = true;
    });

    window.addEventListener('keyup', (e) => {
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      this.down.delete(action);
    });

    window.addEventListener('blur', () => this.clearAll());

    root.querySelectorAll('[data-input]').forEach((btn) => {
      const action = btn.dataset.input;
      const press = (e) => {
        e.preventDefault();
        this.pointers.set(e.pointerId, action);
        btn.classList.add('held');
        if (!this.down.has(action)) this.just.add(action);
        this.down.add(action);
        this.anyJust = true;
      };
      const release = (e) => {
        this.pointers.delete(e.pointerId);
        btn.classList.remove('held');
        if (![...this.pointers.values()].includes(action)) this.down.delete(action);
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  clearAll() {
    this.down.clear();
    this.just.clear();
    this.pointers.clear();
    document.querySelectorAll('.tbtn.held').forEach((b) => b.classList.remove('held'));
  }

  isDown(action) {
    return this.down.has(action);
  }

  pressed(action) {
    return this.just.has(action);
  }

  consume(action) {
    const had = this.just.has(action);
    this.just.delete(action);
    return had;
  }

  anyPressed() {
    return this.anyJust;
  }

  endFrame() {
    this.just.clear();
    this.anyJust = false;
  }
}

export const Input = new InputEngine();

// ------------------------------------------------------------
// Âm thanh — nhạc chip-tune và hiệu ứng tổng hợp bằng WebAudio
// ------------------------------------------------------------
const NOTE_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function noteToFreq(token) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(token);
  if (!m) return 0;
  let semi = NOTE_BASE[m[1]];
  if (m[2] === '#') semi += 1;
  if (m[2] === 'b') semi -= 1;
  const midi = (Number(m[3]) + 1) * 12 + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const ch = (wave, gain, notes, opts = {}) => ({
  wave,
  gain,
  notes: notes.trim().split(/\s+/),
  len: opts.len ?? 1,
  detune: opts.detune ?? 0,
});

const TRACKS = {
  title: {
    bpm: 62,
    channels: [
      ch('triangle', 0.15, `A3 . E4 . A4 . E4 . F3 . C4 . F4 . C4 . G3 . D4 . G4 . D4 . A3 . E4 . A4 .`, { len: 2.6 }),
      ch('square', 0.085, `A4 . . . C5 . . . E5 . . . D5 . C5 . B4 . . . G4 . . . A4 . . . . . . .`, { len: 1.9 }),
      ch('triangle', 0.12, `A2 . . . E3 . . . F2 . . . C3 . . . G2 . . . D3 . . . A2 . . . E3 . . .`, { len: 2.4 }),
    ],
  },
  field: {
    bpm: 104,
    channels: [
      ch('square', 0.10, `C5 . E5 . G5 . E5 . A4 . C5 . E5 . D5 . C5 . E5 . G5 . A5 . G5 . E5 . D5 .`, { len: 1.4 }),
      ch('square', 0.045, `E4 . G4 . C5 . G4 . F4 . A4 . C5 . A4 . E4 . G4 . C5 . D5 . B4 . G4 . B4 .`, { len: 1.3 }),
      ch('triangle', 0.12, `C3 . G3 . C3 . G3 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . D3 . A2 . E3 . A2 . E3 .`, { len: 1.2 }),
      ch('drum', 0.05, `x . . x . . x . x . . x . . x . x . . x . . x . x . . x . . x .`),
    ],
  },
  battle: {
    bpm: 146,
    channels: [
      ch('square', 0.10, `D5 . D5 . F5 . E5 . D5 . A4 . C5 . D5 . E5 . F5 . A5 . G5 . F5 . E5 . D5 . C5 .`, { len: 1.3 }),
      ch('square', 0.05, `A4 . A4 . D5 . C5 . A4 . F4 . A4 . A4 . C5 . D5 . C5 . A4 . G4 . F4 . F4 .`, { len: 1.2 }),
      ch('triangle', 0.13, `D3 D3 . D3 . A2 . D3 D3 . D3 . F2 . G2 D3 . D3 . A2 . D3 D3 . D3 . C3 . A2 .`),
      ch('drum', 0.06, `k . x . s . x . k . x . s . x x k . x . s . x . k . x . s . x .`),
    ],
  },
  boss: {
    bpm: 154,
    channels: [
      ch('square', 0.10, `E5 . E5 F5 . E5 . B4 . C5 . B4 . A4 . . . G4 . A4 . B4 . C5 . D5 . E5 . F5 .`, { len: 1.2 }),
      ch('square', 0.05, `B4 . B4 . G4 . B4 . E4 . G4 . F4 . . . D4 . E4 . F4 . G4 . A4 . B4 . C5 .`, { len: 1.2 }),
      ch('triangle', 0.15, `E2 . E2 . E2 . B1 . C2 . C2 . G2 . B1 . A1 . A1 . E2 . F2 . F2 . C3 . B2 .`),
      ch('drum', 0.065, `k . x x s . x . k x x . s . x x k . x x s . x . k x x . s . x x`),
    ],
  },
  ending: {
    bpm: 74,
    channels: [
      ch('triangle', 0.13, `F3 . C4 . F4 . C4 . G3 . D4 . G4 . D4 . Bb2 . F3 . Bb3 . F3 . C3 . G3 . C4 .`, { len: 2.5 }),
      ch('square', 0.085, `F4 . A4 . C5 . A4 . G4 . Bb4 . D5 . C5 . A4 . C5 . F5 . E5 . D5 . C5 . A4 .`, { len: 2.0 }),
      ch('triangle', 0.11, `F2 . . . C3 . . . G2 . . . D3 . . . Bb2 . . . F3 . . . C3 . . . C2 . . .`, { len: 2.8 }),
    ],
  },
  gameover: {
    bpm: 52,
    channels: [
      ch('triangle', 0.13, `A3 . . . G3 . . . F3 . . . E3 . . . . . . . D3 . . . E3 . . . A2 . . . . . . .`, { len: 2.8 }),
      ch('square', 0.07, `A4 . . . G4 . . . F4 . . . E4 . . . . . . . D4 . . . E4 . . . A3 . . . . . . .`, { len: 2.2 }),
    ],
  },
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.noiseBuf = null;
    this.muted = localStorage.getItem('duoidat.muted') === '1';
    this.trackName = null;
    this.track = null;
    this.step = 0;
    this.nextTime = 0;
    this.stepDur = 0.2;
    this.ready = false;
  }

  init() {
    if (this.ready) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.master.gain.value = this.muted ? 0 : 1;
      this.musicGain.gain.value = 0.55;
      this.sfxGain.gain.value = 0.8;
      const len = Math.floor(this.ctx.sampleRate * 0.6);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('duoidat.muted', muted ? '1' : '0');
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    if (!this.muted) this.resume();
    return this.muted;
  }

  // ---------------- nhạc nền ----------------
  playMusic(name) {
    if (!this.ready) return;
    if (this.trackName === name && this.track) return;
    this.trackName = name;
    this.track = TRACKS[name] ?? null;
    this.step = 0;
    if (!this.track) return;
    this.track.loopSteps = Math.max(...this.track.channels.map((c) => c.notes.length));
    this.stepDur = 60 / this.track.bpm / 2;
    this.nextTime = this.ctx.currentTime + 0.08;
  }

  stopMusic() {
    this.trackName = null;
    this.track = null;
  }

  update() {
    if (!this.ready || !this.track) return;
    const now = this.ctx.currentTime;
    if (this.nextTime < now) this.nextTime = now + 0.02;
    const loopSteps = this.track.loopSteps;
    while (this.nextTime < now + 0.35) {
      for (const channel of this.track.channels) {
        const token = channel.notes[this.step % channel.notes.length];
        if (!token || token === '.') continue;
        if (channel.wave === 'drum') {
          this.drum(token, this.nextTime, channel.gain);
        } else {
          const freq = noteToFreq(token);
          if (freq > 0) this.note(channel, freq, this.nextTime, this.stepDur * channel.len);
        }
      }
      this.step = (this.step + 1) % loopSteps;
      this.nextTime += this.stepDur;
    }
  }

  note(channel, freq, when, dur) {
    const { ctx } = this;
    const osc = ctx.createOscillator();
    osc.type = channel.wave;
    osc.frequency.setValueAtTime(freq, when);
    if (channel.detune) osc.detune.value = channel.detune;
    const g = ctx.createGain();
    const peak = channel.gain;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(peak, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.06, dur));
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  drum(token, when, gain) {
    const { ctx } = this;
    if (token === 'k') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, when);
      osc.frequency.exponentialRampToValueAtTime(48, when + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain * 1.8, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start(when);
      osc.stop(when + 0.2);
      return;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = token === 's' ? 'bandpass' : 'highpass';
    filter.frequency.value = token === 's' ? 1400 : 6000;
    const g = ctx.createGain();
    const dur = token === 's' ? 0.12 : 0.05;
    g.gain.setValueAtTime(gain * (token === 's' ? 1.6 : 1), when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.musicGain);
    src.start(when);
    src.stop(when + dur + 0.02);
  }

  // ---------------- hiệu ứng ----------------
  tone({ wave = 'square', f0 = 440, f1 = f0, dur = 0.1, gain = 0.2, delay = 0, bus = 'sfx' }) {
    if (!this.ready) return;
    const { ctx } = this;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(bus === 'music' ? this.musicGain : this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  noiseBurst({ dur = 0.12, gain = 0.2, freq = 1200, type = 'bandpass', delay = 0 }) {
    if (!this.ready) return;
    const { ctx } = this;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.25), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  blip(pitch = 1) {
    this.tone({ wave: 'square', f0: 420 * pitch, f1: 380 * pitch, dur: 0.035, gain: 0.075 });
  }

  select() {
    this.tone({ wave: 'square', f0: 660, f1: 880, dur: 0.05, gain: 0.12 });
  }

  confirm() {
    this.tone({ wave: 'square', f0: 523, dur: 0.06, gain: 0.14 });
    this.tone({ wave: 'square', f0: 784, dur: 0.1, gain: 0.12, delay: 0.05 });
  }

  cancel() {
    this.tone({ wave: 'square', f0: 392, f1: 294, dur: 0.09, gain: 0.12 });
  }

  hurt() {
    this.tone({ wave: 'sawtooth', f0: 220, f1: 60, dur: 0.28, gain: 0.2 });
    this.noiseBurst({ dur: 0.2, gain: 0.14, freq: 900 });
  }

  slash() {
    this.noiseBurst({ dur: 0.16, gain: 0.24, freq: 3200, type: 'highpass' });
    this.tone({ wave: 'sawtooth', f0: 900, f1: 180, dur: 0.14, gain: 0.12 });
  }

  heal() {
    [523, 659, 784].forEach((f, i) =>
      this.tone({ wave: 'sine', f0: f, dur: 0.16, gain: 0.16, delay: i * 0.07 })
    );
  }

  spare() {
    [659, 988, 1319, 1760].forEach((f, i) =>
      this.tone({ wave: 'triangle', f0: f, dur: 0.34, gain: 0.13, delay: i * 0.09 })
    );
  }

  coin() {
    this.tone({ wave: 'square', f0: 988, dur: 0.06, gain: 0.12 });
    this.tone({ wave: 'square', f0: 1319, dur: 0.14, gain: 0.1, delay: 0.06 });
  }

  save() {
    [392, 523, 659, 784, 1047].forEach((f, i) =>
      this.tone({ wave: 'triangle', f0: f, dur: 0.4, gain: 0.12, delay: i * 0.1 })
    );
  }

  encounter() {
    this.tone({ wave: 'square', f0: 180, f1: 120, dur: 0.14, gain: 0.16 });
    this.tone({ wave: 'square', f0: 240, f1: 160, dur: 0.16, gain: 0.14, delay: 0.14 });
    this.noiseBurst({ dur: 0.3, gain: 0.1, freq: 2600, type: 'highpass' });
  }

  death() {
    [392, 330, 262, 196].forEach((f, i) =>
      this.tone({ wave: 'triangle', f0: f, f1: f * 0.8, dur: 0.5, gain: 0.16, delay: i * 0.22 })
    );
    this.noiseBurst({ dur: 0.9, gain: 0.1, freq: 400 });
  }

  roar() {
    this.tone({ wave: 'sawtooth', f0: 90, f1: 45, dur: 0.7, gain: 0.22 });
    this.noiseBurst({ dur: 0.7, gain: 0.16, freq: 300, type: 'lowpass' });
  }

  levelUp() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      this.tone({ wave: 'square', f0: f, dur: 0.22, gain: 0.12, delay: i * 0.08 })
    );
  }
}

export const audio = new AudioEngine();

// ------------------------------------------------------------
// Vẽ
// ------------------------------------------------------------
class Renderer {
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  begin() {
    const c = this.ctx;
    c.save();
    if (this.shake > 0.1) {
      this.shakeX = rand(-this.shake, this.shake);
      this.shakeY = rand(-this.shake, this.shake);
      c.translate(Math.round(this.shakeX), Math.round(this.shakeY));
      this.shake *= 0.88;
    } else {
      this.shake = 0;
    }
  }

  end() {
    this.ctx.restore();
  }

  addShake(power) {
    this.shake = Math.min(14, Math.max(this.shake, power));
  }

  clear(color = '#05050a', x = 0, y = 0, w = W, h = H) {
    const c = this.ctx;
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  }

  /** Vẽ chữ với bóng đổ. Trả về chiều cao đã dùng. */
  text(str, x, y, o = {}) {
    const {
      size = 16,
      color = '#f2eee4',
      align = 'left',
      baseline = 'top',
      shadow = true,
      italic = false,
      bold = false,
      alpha = 1,
      spacing = 0,
      font = '"Courier New", "Lucida Console", monospace',
    } = o;
    const c = this.ctx;
    c.save();
    c.globalAlpha = alpha;
    c.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size}px ${font}`;
    if (spacing && 'letterSpacing' in c) c.letterSpacing = `${spacing}px`;
    c.textAlign = align;
    c.textBaseline = baseline;
    const lh = Math.round(size * 1.34);
    const lines = String(str).split('\n');
    lines.forEach((line, i) => {
      const ly = y + i * lh;
      if (shadow) {
        c.globalAlpha = alpha * 0.8;
        c.fillStyle = '#000';
        c.fillText(line, x + 2, ly + 2);
        c.globalAlpha = alpha;
      }
      c.fillStyle = color;
      c.fillText(line, x, ly);
    });
    c.restore();
    return lines.length * lh;
  }

  measure(str, size = 16, bold = false) {
    const c = this.ctx;
    c.save();
    c.font = `${bold ? 'bold ' : ''}${size}px "Courier New", "Lucida Console", monospace`;
    const w = c.measureText(str).width;
    c.restore();
    return w;
  }

  /** Ngắt dòng theo bề rộng tối đa. Tôn trọng ký tự \n. */
  wrap(str, maxWidth, size = 16, bold = false) {
    const out = [];
    for (const paragraph of String(str).split('\n')) {
      const words = paragraph.split(' ');
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (this.measure(test, size, bold) > maxWidth && line) {
          out.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      out.push(line);
    }
    return out;
  }

  box(x, y, w, h, o = {}) {
    const { fill = 'rgba(5,5,10,0.94)', border = '#f2eee4', lw = 2, cut = 3, alpha = 1 } = o;
    const c = this.ctx;
    c.save();
    c.globalAlpha = alpha;
    if (fill) {
      c.fillStyle = fill;
      c.beginPath();
      c.moveTo(x + cut, y);
      c.lineTo(x + w - cut, y);
      c.lineTo(x + w, y + cut);
      c.lineTo(x + w, y + h - cut);
      c.lineTo(x + w - cut, y + h);
      c.lineTo(x + cut, y + h);
      c.lineTo(x, y + h - cut);
      c.lineTo(x, y + cut);
      c.closePath();
      c.fill();
    }
    if (border && lw > 0) {
      c.strokeStyle = border;
      c.lineWidth = lw;
      c.stroke();
    }
    c.restore();
  }

  glow(x, y, radius, color = '#ff8a3d', alpha = 0.5) {
    const c = this.ctx;
    const g = c.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save();
    c.globalAlpha = alpha;
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = g;
    c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    c.restore();
  }

  /** Trái tim 7x6 pixel — dùng cho nhân vật và con trỏ. */
  heart(x, y, scale = 2, color = '#e5484d', glow = false) {
    const rows = ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'];
    const c = this.ctx;
    if (glow) this.glow(x + 3.5 * scale, y + 3 * scale, 9 * scale, color, 0.55);
    c.fillStyle = color;
    rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        if (row[rx] === 'x') c.fillRect(x + rx * scale, y + ry * scale, scale, scale);
      }
    });
  }

  /** Hình chữ nhật pixel có viền, dùng cho thanh máu / thanh hơi ấm. */
  bar(x, y, w, h, t, o = {}) {
    const { fill = '#ffd166', back = '#3a2c1a', border = null, glow = false } = o;
    const c = this.ctx;
    if (back) {
      c.fillStyle = back;
      c.fillRect(x, y, w, h);
    }
    const fw = Math.max(0, Math.round(w * clamp(t, 0, 1)));
    if (glow && fw > 0) this.glow(x + fw / 2, y + h / 2, fw * 0.9, fill, 0.35);
    c.fillStyle = fill;
    c.fillRect(x, y, fw, h);
    if (border) {
      c.strokeStyle = border;
      c.lineWidth = 1;
      c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }
  }

  vignette(alpha = 0.5) {
    const c = this.ctx;
    const g = c.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${alpha})`);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }

  /** Được thay thế bởi sprites.js để vẽ nhân vật pixel. */
  sprite() {}

  fade(alpha, color = '#000') {
    if (alpha <= 0) return;
    const c = this.ctx;
    c.save();
    c.globalAlpha = clamp(alpha, 0, 1);
    c.fillStyle = color;
    c.fillRect(0, 0, W, H);
    c.restore();
  }
}

export const R = new Renderer();

// ------------------------------------------------------------
// Hội thoại
// ------------------------------------------------------------
export class Typewriter {
  constructor(text, cps = 58) {
    this.text = String(text);
    this.cps = cps;
    this.chars = 0;
    this.done = false;
    this.soundTick = 0;
  }

  update(dt, sound = true) {
    if (this.done) return;
    this.chars += this.cps * dt;
    if (sound) {
      this.soundTick += this.cps * dt;
      if (this.soundTick > 2.4) {
        this.soundTick = 0;
        audio.blip(0.9 + Math.random() * 0.3);
      }
    }
    if (this.chars >= this.text.length) {
      this.chars = this.text.length;
      this.done = true;
    }
  }

  skip() {
    this.chars = this.text.length;
    this.done = true;
  }

  get visible() {
    return this.text.slice(0, Math.floor(this.chars));
  }

  get progress() {
    return this.text.length ? this.chars / this.text.length : 1;
  }
}

const SPEAKER_COLORS = {
  'Đom': '#ffd166',
  'Bà Mốc': '#9fd48c',
  'Nhím': '#ffb3a7',
  'Vua Tro': '#ff8a3d',
  'Lính Sắt Vụn': '#9fb6d8',
  'Bạn': '#f2eee4',
  narration: '#cfc7b8',
};

export class Dialogue {
  /** @param lines mảng {speaker?, text, portrait?, pitch?} */
  constructor(lines, onDone = null, opts = {}) {
    this.lines = Array.isArray(lines) ? lines : [lines];
    this.onDone = onDone;
    this.index = 0;
    this.cps = opts.cps ?? 58;
    this.typer = new Typewriter(this.lines[0]?.text ?? '', this.cps);
    this.finished = false;
    this.blink = 0;
    this.shown = 0;
  }

  get current() {
    return this.lines[this.index] ?? { text: '' };
  }

  update(dt) {
    this.typer.update(dt);
    this.blink += dt * 3;
    this.shown += dt;
  }

  /** Trả về true nếu đã kết thúc toàn bộ đoạn hội thoại. */
  advance() {
    if (!this.typer.done) {
      this.typer.skip();
      audio.select();
      return false;
    }
    if (this.index < this.lines.length - 1) {
      this.index += 1;
      this.typer = new Typewriter(this.current.text, this.cps);
      audio.select();
      return false;
    }
    this.finished = true;
    if (this.onDone) this.onDone();
    return true;
  }

  draw() {
    const line = this.current;
    const speaker = line.speaker ?? null;
    const isNarration = !speaker;
    const boxX = 20;
    const boxY = 348;
    const boxW = 600;
    const boxH = 112;
    const portrait = line.portrait;
    R.box(boxX, boxY, boxW, boxH, { fill: 'rgba(6,6,12,0.95)' });

    if (speaker) {
      const label = ` ${speaker} `;
      const tw = R.measure(label, 15, true);
      R.box(boxX + 16, boxY - 15, tw + 12, 26, {
        fill: '#0b0b13',
        border: SPEAKER_COLORS[speaker] ?? '#f2eee4',
        cut: 2,
      });
      R.text(label, boxX + 22, boxY - 10, { size: 15, bold: true, color: SPEAKER_COLORS[speaker] ?? '#f2eee4' });
    }

    let textX = boxX + 26;
    if (portrait) {
      const sizes = { dom: 4, baMoc: 2.4, nhim: 2.6, king: 1.8, sentinel: 2, moss: 2.4, shroom: 2.4, bird: 2.4 };
      const scale = sizes[portrait] ?? 2.4;
      R.glow(boxX + 60, boxY + 58, 46, '#ffb066', 0.2);
      R.sprite(portrait, boxX + 60, boxY + 94, scale, { anchor: 'bottom-center' });
      textX = boxX + 118;
    }

    const maxW = boxX + boxW - 30 - textX;
    const size = isNarration ? 17 : 18;
    const lines = R.wrap(this.typer.visible, maxW, size);
    lines.forEach((l, i) => {
      R.text(l, textX, boxY + 24 + i * 25, {
        size,
        italic: isNarration,
        color: isNarration ? SPEAKER_COLORS.narration : '#f2eee4',
      });
    });

    if (this.typer.done) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(this.blink));
      R.text('▼', boxX + boxW - 34, boxY + boxH - 32, { size: 16, color: '#ffd166', alpha: a });
    }
  }
}

// ------------------------------------------------------------
// Hạt bay (tro, đom, bụi)
// ------------------------------------------------------------
export class Embers {
  constructor(count = 40, opts = {}) {
    this.opts = {
      color: '#ff9a5a',
      speed: 8,
      drift: 14,
      size: 2,
      area: { x: 0, y: 0, w: W, h: H },
      ...opts,
    };
    this.parts = [];
    for (let i = 0; i < count; i++) this.parts.push(this.spawn(true));
  }

  spawn(anywhere = false) {
    const { area, drift, speed, size } = this.opts;
    return {
      x: area.x + rand(0, area.w),
      y: anywhere ? area.y + rand(0, area.h) : area.y + area.h + rand(0, 20),
      vx: rand(-drift, drift) * 0.4,
      vy: -rand(speed * 0.4, speed),
      life: rand(2, 7),
      age: anywhere ? rand(0, 2) : 0,
      size: rand(size * 0.6, size),
      phase: rand(0, Math.PI * 2),
    };
  }

  update(dt) {
    const { area } = this.opts;
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      p.age += dt;
      p.phase += dt * 1.6;
      p.x += (p.vx + Math.sin(p.phase) * 8) * dt;
      p.y += p.vy * dt;
      if (p.age > p.life || p.y < area.y - 10) this.parts[i] = this.spawn();
    }
  }

  draw(ctx = R.ctx, alphaScale = 1) {
    const { color } = this.opts;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.parts) {
      const a = Math.sin(clamp(p.age / p.life, 0, 1) * Math.PI) * 0.75 * alphaScale;
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.max(1, Math.round(p.size)), Math.max(1, Math.round(p.size)));
    }
    ctx.restore();
  }
}

// ------------------------------------------------------------
// Lưu trữ
// ------------------------------------------------------------
const SAVE_KEY = 'duoidat.save.v1';

export const Save = {
  exists() {
    try {
      return Boolean(localStorage.getItem(SAVE_KEY));
    } catch {
      return false;
    }
  },
  read() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  write(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...data, savedAt: Date.now(), version: 1 }));
      return true;
    } catch {
      return false;
    }
  },
  clear() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* bỏ qua */
    }
  },
};
