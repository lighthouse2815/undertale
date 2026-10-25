import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filesIn, readAssets } from './tools/game-assets.mjs';
import { runtimeFiles } from './tools/runtime-files.mjs';

const root = fileURLToPath(new URL('./', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
const resources = JSON.parse(await readFile(join(root, 'resources.json'), 'utf8'));
const baseline = JSON.parse(await readFile(join(root, 'asset-baseline.json'), 'utf8'));
assert.equal(resources.name, 'UNDERTALE');
assert.equal(resources.bytecodeVersion, 16);
assert.equal(resources.rooms.length, 336);
assert.equal(resources.objects.length, 1709);
assert.equal(resources.codeEntries, 6272);
assert.equal(Object.keys(manifest.code).length, resources.codeEntries);
const codeFiles = (await readdir(join(root, 'code'))).filter((name) => name.endsWith('.gml'));
for (const name of Object.keys(manifest.code)) assert.ok(codeFiles.includes(name), `Thiếu GML ${name}`);
for (const name of codeFiles) await readFile(join(root, 'code', name));
const base = await readFile(join(root, manifest.base.path));
assert.equal(base.length, manifest.base.bytes, 'Sai kích thước dữ liệu nền.');
assert.equal(createHash('sha256').update(base).digest('hex'), manifest.base.sha256, 'Dữ liệu nền phải giữ nguyên.');
for (const file of [join(root, 'server.mjs'), join(root, 'check.mjs'), ...filesIn(join(root, 'web')), ...filesIn(join(root, 'tools'))]) {
  if (file.endsWith('.mjs')) execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}
const runtime = JSON.parse(await readFile(join(root, 'vendor/butterscotch/manifest.json'), 'utf8'));
for (const [name, checksum] of Object.entries(runtime.files)) {
  const bytes = await readFile(join(root, 'vendor/butterscotch', name));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), checksum, `Runtime bị thay đổi: ${name}`);
}
const editable = readAssets(join(root, 'assets'));
const paths = new Set(editable.map((asset) => asset.path));
for (const path of Object.keys(baseline.resources)) assert.ok(paths.has(path), `Thiếu tài nguyên nguồn ${path}`);
const names = (type) => new Set(editable.filter((asset) => asset.type === type).map((asset) => asset.name));
const references = {
  Sprite: names('Sprite'), GameObject: names('GameObject'),
  Background: new Set([...names('Background'), ...resources.emptyBackgrounds]),
  Code: new Set(codeFiles.map((file) => file.slice(0, -4))),
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
const audio = runtimeFiles(root);
console.log(`✓ JavaScript, runtime, ${codeFiles.length} GML và dữ liệu nền`);
console.log(`✓ ${editable.length} tài nguyên rời; liên kết phòng, đối tượng, sprite, script hợp lệ`);
console.log(`✓ ${audio.files.length} tệp chạy web lấy từ asset trong dự án`);
