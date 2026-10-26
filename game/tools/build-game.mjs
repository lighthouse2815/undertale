// Dựng dữ liệu chạy từ GML/JSON/PNG/WAV; không đọc file dữ liệu game gốc.
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { cp, readFile, mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assetTypes, checksum, filesIn, readSource } from './game-assets.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

async function sourceHash() {
  const { assets, codeFiles } = readSource(root);
  const inputs = new Map(assets.flatMap((asset) => Object.entries(asset.hashes)
    .map(([name, hash]) => [`assets/${name}`, hash])));
  for (const file of [join(root, 'project.json'), ...filesIn(join(root, 'project')), ...codeFiles,
    ...['build-game.mjs', 'compile-source.csx', 'game-assets.mjs'].map((name) => join(root, 'tools', name))]) {
    inputs.set(relative(root, file).replaceAll('\\', '/'), checksum(await readFile(file)));
  }
  const hash = createHash('sha256');
  for (const [name, value] of [...inputs].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
    hash.update(name).update('\0').update(value).update('\0');
  }
  return hash.digest('hex');
}

export async function buildGame({ force = false } = {}) {
  const source = await sourceHash();
  if (!force) {
    // Bản xuất có sẵn runtime vẫn chơi được mà không cần cài compiler.
    for (const folder of ['build/undertale', 'runtime']) {
      const file = join(root, folder, folder === 'runtime' ? 'game.win' : 'data.win');
      try {
        const stamp = JSON.parse(await readFile(join(root, folder, 'source.json'), 'utf8'));
        if (stamp.format === 'undertale-source-build' && stamp.source === source && checksum(await readFile(file)) === stamp.sha256) {
          console.log('✓ Dữ liệu chạy đã khớp nguồn GML/JSON/PNG/WAV.');
          return file;
        }
      } catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
    }
  }
  const output = join(root, 'build/undertale/data.win');
  await mkdir(dirname(output), { recursive: true });
  const work = await mkdtemp(join(dirname(output), 'compile-'));
  try {
    const cli = process.env.UNDERTALE_MOD_CLI ?? 'UndertaleModCli';
    const next = join(work, 'data.win');
    const empty = join(work, 'empty.win');
    const project = join(work, 'project');
    await mkdir(project);
    // Importer quét mọi thư mục con: chỉ đưa đúng nguồn vào vùng biên dịch.
    for (const name of ['project.json', 'code', ...Object.keys(assetTypes).map((folder) => `assets/${folder}`)]) {
      await cp(join(root, name), join(project, name), { recursive: true, mode: constants.COPYFILE_FICLONE });
    }
    const run = (args) => {
      const result = spawnSync(cli.endsWith('.dll') ? 'dotnet' : cli,
        cli.endsWith('.dll') ? [cli, ...args] : args, {
          cwd: root, env: { ...process.env, UNDERTALE_BUILD_OUTPUT: next, UNDERTALE_BUILD_PROJECT: join(project, 'project.json') },
          encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
        });
      if (result.error) throw new Error(`Không chạy được UndertaleModCli: ${result.error.message}. Đặt UNDERTALE_MOD_CLI tới CLI hoặc DLL.`);
      if (result.status !== 0) throw new Error(`Biên dịch thất bại; giữ nguyên build trước.\n${result.stdout}${result.stderr}`);
    };
    console.log('Đang biên dịch toàn bộ nguồn bằng UndertaleModTool...');
    run(['new', '--output', empty]);
    run(['load', empty, '--scripts', join(root, 'tools/compile-source.csx'), '--output', next]);
    if (await sourceHash() !== source) throw new Error('Nguồn thay đổi trong khi build; hãy build lại. Giữ nguyên build trước.');
    const bytes = await readFile(next);
    await writeFile(join(work, 'source.json'), JSON.stringify({ format: 'undertale-source-build', source,
      sha256: checksum(bytes), bytes: bytes.length }, null, 2) + '\n');
    await rename(next, output);
    await rename(join(work, 'source.json'), join(dirname(output), 'source.json'));
    console.log('✓ Đã dựng game từ nguồn rời: build/undertale/data.win');
    return output;
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 1 || args[0] !== '--force')) throw new Error('Cách dùng: node tools/build-game.mjs [--force]');
  await buildGame({ force: args.includes('--force') });
}
