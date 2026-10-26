import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filesIn, readSource } from './tools/game-assets.mjs';
import { runtimeAssets } from './tools/runtime-files.mjs';

const root = fileURLToPath(new URL('./', import.meta.url));
const { order, assets: editable, emptyBackgrounds } = readSource(root);
for (const file of [join(root, 'server.mjs'), join(root, 'check.mjs'), ...filesIn(join(root, 'web')), ...filesIn(join(root, 'tools'))]) {
  if (file.endsWith('.mjs')) execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}
const runtime = JSON.parse(await readFile(join(root, 'vendor/butterscotch/manifest.json'), 'utf8'));
for (const [name, checksum] of Object.entries(runtime.files)) {
  const bytes = await readFile(join(root, 'vendor/butterscotch', name));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), checksum, `Runtime bị thay đổi: ${name}`);
}
const names = (type) => new Set(editable.filter((asset) => asset.type === type).map((asset) => asset.name));
const references = {
  Sprite: names('Sprite'), GameObject: names('GameObject'),
  Background: new Set([...names('Background'), ...emptyBackgrounds.map((item) => item.Name)]),
  Code: new Set(order.Code),
};
const checkReference = (value, type, owner) => {
  if (value != null) assert.ok(references[type].has(value), `${owner}: không tìm thấy ${type} ${value}`);
};
for (const asset of editable) {
  const data = asset.data;
  if (asset.type === 'GameObject') {
    for (const field of ['Sprite', 'MaskSprite']) checkReference(data[field], 'Sprite', asset.path);
    checkReference(data.ParentObject, 'GameObject', asset.path);
    for (const event of data.Events) checkReference(event.CodeEntry, 'Code', asset.path);
  }
  if (asset.type === 'Room') {
    for (const background of data.Backgrounds) checkReference(background.BackgroundAsset, 'Background', asset.path);
    for (const view of data.Views) checkReference(view.FollowsObject, 'GameObject', asset.path);
    for (const instance of data.GameObjects) {
      checkReference(instance.ObjectName, 'GameObject', asset.path);
      for (const field of ['CreationCodeEntry', 'PreCreateCodeEntry']) checkReference(instance[field], 'Code', asset.path);
    }
    for (const tile of data.Tiles) checkReference(tile.Asset, 'Background', asset.path);
    checkReference(data.CreationCodeEntry, 'Code', asset.path);
  }
  if (asset.type === 'Script') checkReference(data.Code, 'Code', asset.path);
}
const audio = runtimeAssets(root);
console.log(`✓ JavaScript, runtime, ${order.Code.length} GML và cấu hình dựng từ nguồn`);
console.log(`✓ ${editable.length} tài nguyên rời; liên kết phòng, đối tượng, sprite, script hợp lệ`);
console.log(`✓ ${audio.length} tệp âm thanh/credit/splash; không cần data.win nền để kiểm tra nguồn`);
