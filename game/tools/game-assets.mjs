import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export const assetTypes = {
  sprites: 'Sprite', backgrounds: 'Background', sounds: 'Sound', fonts: 'Font',
  paths: 'Path', scripts: 'Script', objects: 'GameObject', rooms: 'Room',
};
export const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const resourceLists = {
  Sprites: 'Sprite', Backgrounds: 'Background', Sounds: 'Sound', Paths: 'Path',
  Scripts: 'Script', Fonts: 'Font', GameObjects: 'GameObject', Rooms: 'Room', Code: 'Code',
};

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

export function readSource(root) {
  const json = (name) => JSON.parse(readFileSync(join(root, 'project', `${name}.json`), 'utf8'));
  const general = json('general');
  assert.equal(general.Name, 'UNDERTALE');
  assert.equal(general.BytecodeVersion, 16, 'Chỉ hỗ trợ bytecode 16 của Undertale.');
  assert.equal(general.Major, 1, 'Chỉ hỗ trợ định dạng GameMaker 1.');
  json('options');
  json('language');
  const order = json('order');
  assert.deepEqual(Object.keys(order).sort(), [...Object.keys(resourceLists), 'RoomOrder'].sort());
  const emptyBackgrounds = json('empty-backgrounds');
  const assets = readAssets(join(root, 'assets'));
  const codeFiles = filesIn(join(root, 'code')).filter((name) => name.endsWith('.gml'));
  for (const [list, type] of Object.entries(resourceLists)) {
    assert.ok(Array.isArray(order[list]), `Thiếu danh mục ${list}.`);
    const actual = type === 'Code' ? codeFiles.map((file) => basename(file, '.gml'))
      : assets.filter((asset) => asset.type === type).map((asset) => asset.name);
    if (type === 'Background') actual.push(...emptyBackgrounds.map((item) => item.Name));
    assert.ok(order[list].every((name) => typeof name === 'string' && name.length > 0), `Tên ${list} không hợp lệ.`);
    assert.equal(new Set(order[list]).size, order[list].length, `Trùng tên trong project/order.json: ${list}.`);
    assert.equal(new Set(actual).size, actual.length, `Trùng nguồn tài nguyên ${type}.`);
    const expected = new Set(order[list]), found = new Set(actual);
    const missing = order[list].filter((name) => !found.has(name));
    const unlisted = actual.filter((name) => !expected.has(name));
    assert.equal(missing.length, 0, `Thiếu nguồn ${type}: ${missing.join(', ')}.`);
    assert.equal(unlisted.length, 0, `Chưa khai báo ${type} trong project/order.json: ${unlisted.join(', ')}.`);
  }
  assert.ok(order.RoomOrder.length > 0, 'Cần ít nhất một phòng khởi động.');
  assert.equal(new Set(order.RoomOrder).size, order.RoomOrder.length, 'Trùng phòng trong RoomOrder.');
  for (const name of order.RoomOrder) assert.ok(order.Rooms.includes(name), `Không có phòng ${name}.`);
  const ids = { GameObjects: new Set(), Tiles: new Set() };
  for (const asset of assets.filter((item) => item.type === 'Room')) {
    for (const [list, minimum] of [['GameObjects', 100000], ['Tiles', 10000000]]) {
      for (const item of asset.data[list]) {
        if (item.InstanceID == null) continue;
        assert.ok(Number.isInteger(item.InstanceID) && item.InstanceID >= minimum && item.InstanceID <= 0x7fffffff,
          `${asset.path}: InstanceID không hợp lệ.`);
        assert.ok(!ids[list].has(item.InstanceID), `${asset.path}: trùng InstanceID ${item.InstanceID}.`);
        ids[list].add(item.InstanceID);
      }
    }
  }
  return { order, assets, codeFiles, emptyBackgrounds };
}
