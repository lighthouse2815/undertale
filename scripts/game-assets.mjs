import { createHash } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export const assetTypes = {
  sprites: 'Sprite', backgrounds: 'Background', sounds: 'Sound', fonts: 'Font',
  paths: 'Path', scripts: 'Script', objects: 'GameObject', rooms: 'Room',
};
export const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => {
    const file = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Không dùng symlink trong source: ${file}`);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

export function readAssets(root) {
  const result = [];
  for (const [folder, type] of Object.entries(assetTypes)) {
    for (const file of filesIn(join(root, folder)).filter((name) => name.endsWith('.json'))) {
      const path = `${folder}/${file.slice(join(root, folder).length + 1).replaceAll('\\', '/')}`;
      const data = JSON.parse(readFileSync(file, 'utf8'));
      if (data.$type !== type) throw new Error(`Sai loại tài nguyên ${path}: cần ${type}`);
      const name = data.DataName ?? basename(file, '.json');
      const ownDirectory = dirname(file) !== join(root, folder);
      const files = ownDirectory ? filesIn(dirname(file)) : [file];
      const hashes = Object.fromEntries(files.map((entry) => [entry.slice(root.length + 1).replaceAll('\\', '/'), checksum(readFileSync(entry))]));
      if (type === 'Sprite') {
        for (const [field, suffix] of [['TextureCount', '.png'], ['MaskCount', '.mask.png']]) {
          for (let i = 0; i < data[field]; i++) {
            const image = join(dirname(file), `${basename(file, '.json')}_${i}${suffix}`);
            if (!lstatSync(image).isFile()) throw new Error(`Thiếu ảnh ${image}`);
          }
        }
      }
      result.push({ path, type, name, data, hashes });
    }
  }
  return result;
}
