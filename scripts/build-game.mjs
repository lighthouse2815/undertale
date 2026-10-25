// Biên dịch GML bằng UndertaleModTool, luôn lấy dữ liệu nền từ bộ đi kèm repo.
import { createHash } from 'node:crypto';
import { readFile, mkdir, mkdtemp, copyFile, rename, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'game/manifest.json'), 'utf8'));
const base = join(root, 'assets/undertale/data.win');
const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex');
if (checksum(await readFile(base)) !== manifest.assets.find((a) => a.name === 'data.win').sha256) {
  throw new Error('Dữ liệu nền đã thay đổi. Khôi phục assets/undertale/data.win trước khi biên dịch GML.');
}
const patches = {};
for (const [name, hash] of Object.entries(manifest.code)) {
  const file = join(root, 'game/code', name);
  if (checksum(await readFile(file)) !== hash) patches[name.slice(0, -4)] = file;
}
const output = join(root, 'build/undertale/data.win');
await mkdir(dirname(output), { recursive: true });
const work = await mkdtemp(join(dirname(output), 'compile-'));
try {
  const next = join(work, 'data.win');
  if (Object.keys(patches).length) {
    const cli = process.env.UNDERTALE_MOD_CLI ?? 'UndertaleModCli';
    const patchFile = join(work, 'patches.json');
    const { writeFile } = await import('node:fs/promises');
    await writeFile(patchFile, JSON.stringify(patches));
    const args = ['load', base, '--scripts', join(root, 'scripts/compile-game.csx'), '--output', next];
    const result = spawnSync(cli.endsWith('.dll') ? 'dotnet' : cli,
      cli.endsWith('.dll') ? [cli, ...args] : args,
      { cwd: root, env: { ...process.env, UNDERTALE_PATCH_FILE: patchFile }, stdio: 'inherit' });
    if (result.error) throw new Error(`Không chạy được UndertaleModCli: ${result.error.message}. Đặt UNDERTALE_MOD_CLI tới CLI hoặc DLL.`);
    if (result.status !== 0) throw new Error('Biên dịch thất bại; giữ nguyên bản build thành công trước đó.');
  } else {
    await copyFile(base, next);
  }
  await rename(next, output);
  console.log(`✓ ${Object.keys(patches).length} mục GML thay đổi; dữ liệu chạy: build/undertale/data.win`);
} finally {
  await rm(work, { recursive: true, force: true });
}
