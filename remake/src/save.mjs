const KEY = 'undertale-remake-save-v1';

export function readSave() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!value || typeof value !== 'object' || typeof value.room !== 'string') return null;
    return value;
  } catch { return null; }
}

export function writeSave(value) {
  const save = {
    version: 1,
    name: String(value.name ?? '').slice(0, 6),
    room: String(value.room),
    x: Number(value.x),
    y: Number(value.y),
    hp: Number(value.hp ?? 20),
    maxHp: Number(value.maxHp ?? 20),
    lv: Number(value.lv ?? 1),
    xp: Number(value.xp ?? 0),
    gold: Number(value.gold ?? 0),
    kills: Number(value.kills ?? 0),
    playTime: Number(value.playTime ?? 0),
    flags: { ...(value.flags ?? {}) },
    savedAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(save));
  return save;
}

export function clearSave() { localStorage.removeItem(KEY); }
