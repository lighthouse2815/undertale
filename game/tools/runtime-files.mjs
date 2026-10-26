import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { filesIn } from './game-assets.mjs';

export function runtimeFiles(root, dataFile = join(root, 'runtime/game.win')) {
  return { format: 'undertale-web-runtime', files: [
    { name: 'data.win', url: 'runtime/game.win', bytes: statSync(dataFile).size }, ...runtimeAssets(root),
  ] };
}

export function runtimeAssets(root) {
  const files = [];
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
  return files;
}
