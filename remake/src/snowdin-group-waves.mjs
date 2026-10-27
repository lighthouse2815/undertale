import { IceCapWave } from './icecap-waves.mjs';
import { DrakeWave } from './drake-waves.mjs';
import { loadIceCapAssets } from './icecap-battle.mjs';
import { loadDrakeAssets } from './drake-battle.mjs';

export function loadSnowdinGroupWaveAssets(scene) { loadIceCapAssets(scene); loadDrakeAssets(scene); }

// Nhóm35/36 dùng cùng arena/turntimer; Jerry tăng60frame ở Alarm10 khi timer còn>1.
export class SnowdinGroupWave {
  constructor(scene, members) {
    this.scene = scene; this.frames = 0; this.bullets = []; this.parts = [];
    const active = members.filter((m) => m.alive && !m.away), attackers = active.filter((m) => m.type !== 'jerry');
    const drake = active.some((m) => ['snowdrake', 'chilldrake'].includes(m.type));
    this.border = drake ? { left: 227, right: 407, top: 200, bottom: 385 } : { left: 237, right: 397, top: 250, bottom: 385 };
    this.duration = -1; this.jerry = false;
    // Thứ tự instance gốc là Ice Cap/Ice → Jerry → Snowdrake/Chilldrake.
    for (const m of active) {
      if (m.type === 'jerry') { this.jerry = active.length > 1; if (this.jerry && this.duration < 1) this.duration = 1; continue; }
      const options = { border: this.border, population: attackers.length, active: active.length };
      if (m.type === 'icecap' || m.type === 'ice') {
        const wave = new IceCapWave(scene, m.command, m.type === 'ice', options); this.parts.push(wave);
        if (m.type === 'icecap') this.duration = wave.duration;
        else if (active.length === 1) this.duration = 5;
      } else {
        const wave = new DrakeWave(scene, m.command, m.type === 'chilldrake', options); this.parts.push(wave); this.duration = wave.duration;
      }
    }
    this.duration = Math.max(0, this.duration);
    const b = this.border; scene.arena.setPosition(b.left / 2, b.top / 2).setSize((b.right - b.left) / 2, (b.bottom - b.top) / 2);
    scene.soul.setPosition((Math.round((b.left + b.right) / 2) - 8) / 2, (Math.round((b.top + b.bottom) / 2) - 8) / 2);
  }
  step() {
    this.frames++;
    if (this.frames === 10 && this.jerry && this.duration > this.frames) this.duration += 60;
    // Generator tiếp tục tới timer chung, kể cả khi thời lượng trận đơn của nó đã hết.
    for (const part of this.parts) part.step();
    this.bullets = this.parts.flatMap((part) => part.bullets);
    return this.frames >= this.duration;
  }
  destroy() { this.parts.forEach((part) => part.destroy()); this.parts = []; this.bullets = []; }
}
