// Biên dịch GML bằng UndertaleModTool, luôn lấy dữ liệu nền từ bộ đi kèm repo.
import { readFile, readdir, mkdir, mkdtemp, copyFile, rename, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checksum, readAssets } from './game-assets.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
const base = join(root, manifest.base.path);
if (checksum(await readFile(base)) !== manifest.base.sha256) {
  throw new Error('Dữ liệu nền đã thay đổi. Khôi phục base/data.win trước khi biên dịch GML.');
}
const patches = {};
for (const name of Object.keys(manifest.code)) await readFile(join(root, 'code', name));
for (const name of (await readdir(join(root, 'code'))).filter((file) => file.endsWith('.gml'))) {
  const file = join(root, 'code', name);
  if (checksum(await readFile(file)) !== manifest.code[name]) patches[name] = file;
}
const baseline = JSON.parse(await readFile(join(root, 'asset-baseline.json'), 'utf8'));
const assets = readAssets(join(root, 'assets'));
for (const path of Object.keys(baseline.resources)) {
  if (!assets.some((asset) => asset.path === path)) throw new Error(`Thiếu tài nguyên nguồn ${path}`);
}
const changedAssets = assets.filter((asset) => JSON.stringify(asset.hashes) !== JSON.stringify(baseline.resources[asset.path]));
const output = join(root, 'build/undertale/data.win');
await mkdir(dirname(output), { recursive: true });
const work = await mkdtemp(join(dirname(output), 'compile-'));
try {
  const next = join(work, 'data.win');
  if (Object.keys(patches).length || changedAssets.length) {
    const cli = process.env.UNDERTALE_MOD_CLI ?? 'UndertaleModCli';
    const project = join(work, 'project');
    await mkdir(join(project, 'code'), { recursive: true });
    await writeFile(join(project, 'project.json'), JSON.stringify({ Name: 'UNDERTALE Web', ErrorOnWarnings: true }));
    for (const [name, file] of Object.entries(patches)) await copyFile(file, join(project, 'code', name));
    for (const asset of changedAssets) {
      for (const file of Object.keys(asset.hashes)) {
        const target = join(project, file);
        await mkdir(dirname(target), { recursive: true });
        await copyFile(join(root, 'assets', file), target);
      }
    }
    const args = ['project', 'build', join(project, 'project.json'), '--source', base, '--destination', next];
    const result = spawnSync(cli.endsWith('.dll') ? 'dotnet' : cli,
      cli.endsWith('.dll') ? [cli, ...args] : args,
      { cwd: root, env: process.env, stdio: 'inherit' });
    if (result.error) throw new Error(`Không chạy được UndertaleModCli: ${result.error.message}. Đặt UNDERTALE_MOD_CLI tới CLI hoặc DLL.`);
    if (result.status !== 0) throw new Error('Biên dịch thất bại; giữ nguyên bản build thành công trước đó.');
  } else {
    await copyFile(base, next);
  }
  await rename(next, output);
  console.log(`✓ ${Object.keys(patches).length} mục GML và ${changedAssets.length} tài nguyên thay đổi; dữ liệu chạy: build/undertale/data.win`);
} finally {
  await rm(work, { recursive: true, force: true });
}
