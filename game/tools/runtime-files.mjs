import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { filesIn } from './game-assets.mjs';

export function runtimeData(root) {
  for (const name of ['build/undertale/data.win', 'runtime/game.win', 'base/data.win']) {
    const file = join(root, name);
    if (existsSync(file)) return file;
  }
  throw new Error('Thiếu dữ liệu game trong dự án.');
}

export function runtimeFiles(root) {
  const files = [{ name: 'data.win', url: 'runtime/game.win', bytes: statSync(runtimeData(root)).size }];
  const names = new Set(['data.win']);
  for (const file of filesIn(join(root, 'assets/sounds')).filter((name) => name.endsWith('.json'))) {
    const sound = JSON.parse(readFileSync(file, 'utf8'));
    if (!sound.Streamed) continue;
    const name = sound.Filename.includes('.') ? sound.Filename : `${sound.Filename}.ogg`;
    if (basename(name) !== name || !/^[A-Za-z0-9_.-]+$/.test(name)) throw new Error(`Tên âm thanh không hợp lệ: ${name}`);
    if (names.has(name)) throw new Error(`Trùng tên âm thanh: ${name}`);
    names.add(name);
    const source = join(dirname(file), name);
    files.push({ name, url: relative(root, source).replaceAll('\\', '/'), bytes: statSync(source).size });
  }
  for (const name of ['credits.txt', 'splash.png']) {
    const url = `assets/misc/${name}`;
    files.push({ name, url, bytes: statSync(join(root, url)).size });
  }
  return { format: 'undertale-web-runtime', files };
}
