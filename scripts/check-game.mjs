import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readAssets } from './game-assets.mjs';

const manifest = JSON.parse(await readFile(new URL('../game/manifest.json', import.meta.url), 'utf8'));
const resources = JSON.parse(await readFile(new URL('../game/resources.json', import.meta.url), 'utf8'));
assert.equal(resources.name, 'UNDERTALE');
assert.equal(resources.bytecodeVersion, 16);
assert.equal(resources.rooms.length, 336);
assert.equal(resources.objects.length, 1709);
assert.equal(resources.codeEntries, 6272);
assert.equal(Object.keys(manifest.code).length, resources.codeEntries);
const codeFiles = await readdir(new URL('../game/code/', import.meta.url));
assert.deepEqual(codeFiles.sort(), Object.keys(manifest.code).sort());
for (const file of codeFiles) await readFile(new URL(`../game/code/${file}`, import.meta.url));
for (const asset of manifest.assets) {
  const bytes = await readFile(new URL(`../assets/undertale/${asset.name}`, import.meta.url));
  assert.equal(bytes.length, asset.bytes, `Sai kích thước ${asset.name}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `Sai nội dung ${asset.name}`);
}
const index = JSON.parse(await readFile(new URL('../assets/undertale/index.json', import.meta.url), 'utf8'));
assert.deepEqual(index.files, manifest.assets.map(({ name, bytes }) => ({ name, bytes })));
const runtime = JSON.parse(await readFile(new URL('../vendor/butterscotch/manifest.json', import.meta.url), 'utf8'));
for (const [name, checksum] of Object.entries(runtime.files)) {
  const bytes = await readFile(new URL(`../vendor/butterscotch/${name}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), checksum, `Runtime bị thay đổi: ${name}`);
}
console.log(`✓ runtime Butterscotch tại revision ${runtime.commit}`);
const editable = readAssets(fileURLToPath(new URL('../game/assets', import.meta.url)));
const names = (type) => new Set(editable.filter((asset) => asset.type === type).map((asset) => asset.name));
const references = {
  Sprite: names('Sprite'), GameObject: names('GameObject'), Background: new Set([...names('Background'), ...resources.emptyBackgrounds]),
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
console.log(`✓ ${editable.length} tài nguyên rời PNG/WAV/OGG/JSON và liên kết phòng, đối tượng, GML`);
console.log(`✓ dữ liệu Undertale: ${resources.rooms.length} phòng, ${resources.objects.length} đối tượng, ${codeFiles.length} mục GML và ${manifest.assets.filter((a) => a.name.endsWith('.ogg')).length} tệp âm thanh`);
