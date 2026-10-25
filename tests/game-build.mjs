import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = process.env.UNDERTALE_MOD_CLI;
assert.ok(cli, 'Đặt UNDERTALE_MOD_CLI tới UndertaleModCli để kiểm thử biên dịch.');
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'undertale-build-'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
try {
  for (const name of ['scripts', 'game']) await cp(join(root, name), join(fixture, name), { recursive: true });
  await mkdir(join(fixture, 'assets/undertale'), { recursive: true });
  const base = join(fixture, 'assets/undertale/data.win');
  await cp(join(root, 'assets/undertale/data.win'), base);
  const file = join(fixture, 'game/code/gml_Script_scr_gettext.gml');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('text = "";', 'text = "kiem-thu-build";'));
  const build = () => spawnSync(process.execPath, ['scripts/build-game.mjs'], {
    cwd: fixture, env: process.env, encoding: 'utf8',
  });
  const valid = build();
  assert.equal(valid.status, 0, valid.stdout + valid.stderr);
  const output = join(fixture, 'build/undertale/data.win');
  const compiledHash = hash(await readFile(output));
  assert.notEqual(compiledHash, hash(await readFile(base)));
  const args = ['dump', output, '--code', 'gml_Script_scr_gettext', '--output', join(fixture, 'dump')];
  const dump = spawnSync(cli.endsWith('.dll') ? 'dotnet' : cli, cli.endsWith('.dll') ? [cli, ...args] : args,
    { encoding: 'utf8' });
  assert.equal(dump.status, 0, dump.stdout + dump.stderr);
  assert.match(await readFile(join(fixture, 'dump/CodeEntries/gml_Script_scr_gettext.gml'), 'utf8'), /kiem-thu-build/);
  await writeFile(file, 'if (');
  assert.notEqual(build().status, 0);
  assert.equal(hash(await readFile(output)), compiledHash);
  await writeFile(file, original);
  const restored = build();
  assert.equal(restored.status, 0, restored.stdout + restored.stderr);
  assert.equal(hash(await readFile(output)), hash(await readFile(base)));
  console.log('✓ biên dịch GML thật, giải biên dịch xác nhận thay đổi, giữ bản cũ khi lỗi và hoàn tác về dữ liệu gốc');
} finally {
  await rm(fixture, { recursive: true, force: true });
}
