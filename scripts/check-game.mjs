import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';

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
console.log(`✓ dữ liệu Undertale: ${resources.rooms.length} phòng, ${resources.objects.length} đối tượng, ${codeFiles.length} mục GML và ${manifest.assets.filter((a) => a.name.endsWith('.ogg')).length} tệp âm thanh`);
