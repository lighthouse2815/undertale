// Đóng gói cùng source và asset, có thể copy đi chạy/dev độc lập.
import { constants } from 'node:fs';
import { cp, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runtimeFiles } from './runtime-files.mjs';
import { buildGame } from './build-game.mjs';

const source = fileURLToPath(new URL('../', import.meta.url)).replace(/[\\/]$/, '');
const content = ['index.html', 'server.mjs', 'package.json', 'README.md', 'CREDITS.txt', 'check.mjs',
  'project.json', 'project', 'resources.json', 'code', 'assets', 'vendor', 'web', 'tools'];
const inside = (file, parent) => { const path = relative(parent, file); return !path || (!path.startsWith(`..${sep}`) && path !== '..' && !path.startsWith(sep)); };

export async function buildWeb(output = join(dirname(source), 'dist/undertale-web')) {
  output = resolve(output);
  await mkdir(dirname(output), { recursive: true });
  output = join(await realpath(dirname(output)), output.slice(dirname(output).length + 1));
  if (inside(output, source) || inside(source, output)) throw new Error('Thư mục xuất phải nằm ngoài source game.');
  let existing = false;
  try {
    if ((await lstat(output)).isSymbolicLink()) throw new Error('Không ghi đè thư mục xuất là symlink.');
    const marker = JSON.parse(await readFile(join(output, 'web-build.json'), 'utf8'));
    if (marker.format !== 'undertale-web') throw new Error('Thư mục xuất không phải gói Undertale do công cụ tạo.');
    existing = true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // Một thư mục có sẵn nhưng thiếu marker cũng không được ghi đè.
    try { await lstat(output); throw new Error('Thư mục xuất đã tồn tại và không có marker Undertale.'); }
    catch (missing) { if (missing.code !== 'ENOENT') throw missing; }
  }
  for (const command of ['check.mjs']) {
    const result = spawnSync(process.execPath, [join(source, command)], { cwd: source, env: process.env, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Không đóng gói vì ${command} thất bại.`);
  }
  const compiled = await buildGame();
  const staging = await mkdtemp(join(dirname(output), '.undertale-web-'));
  try {
    for (const name of content) {
      await cp(join(source, name), join(staging, name), { recursive: true, mode: constants.COPYFILE_FICLONE,
        filter: async (file) => {
          if ((await lstat(file)).isSymbolicLink()) throw new Error(`Không đóng gói symlink: ${file}`);
          return !/^\.env(?:\.|$)/.test(file.slice(file.lastIndexOf(sep) + 1));
        } });
    }
    await mkdir(join(staging, 'runtime'));
    await cp(compiled, join(staging, 'runtime/game.win'), { mode: constants.COPYFILE_FICLONE });
    await cp(join(dirname(compiled), 'source.json'), join(staging, 'runtime/source.json'));
    await writeFile(join(staging, 'runtime.json'), JSON.stringify(runtimeFiles(staging), null, 2) + '\n');
    await writeFile(join(staging, 'web-build.json'), JSON.stringify({ format: 'undertale-web', version: 1,
      source: 'Source GML, JSON, PNG, WAV/OGG và runtime đi kèm' }, null, 2) + '\n');
    let previous;
    if (existing) { previous = `${staging}-previous`; await rename(output, previous); }
    try { await rename(staging, output); }
    catch (error) { if (previous) await rename(previous, output); throw error; }
    if (previous) await rm(previous, { recursive: true, force: true });
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--out')) throw new Error('Cách dùng: node tools/build-web.mjs [--out thư_mục]');
  const output = await buildWeb(args[1]);
  console.log(`✓ Bản web độc lập: ${output}`);
  console.log(`Chạy trong thư mục đó: npm start`);
}
