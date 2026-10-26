import { constants } from 'node:fs';
import { cp, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
export async function buildRemake(output = resolve(root, '../dist/undertale-remake')) {
  output = resolve(output);
  await mkdir(dirname(output), { recursive: true });
  output = join(await realpath(dirname(output)), output.slice(dirname(output).length + 1));
  const inside = (child, parent) => { const path = relative(parent, child); return !path || (path !== '..' && !path.startsWith(`..${sep}`) && !path.startsWith(sep)); };
  for (const source of [root, resolve(root, '../game'), resolve(root, '../node_modules')]) {
    if (inside(output, source) || inside(source, output)) throw new Error('Thư mục xuất phải nằm ngoài nguồn và thư viện.');
  }
  let existing = false;
  try {
    const info = await lstat(output);
    if (info.isSymbolicLink()) throw new Error('Không ghi đè symlink.');
    let marker;
    try { marker = JSON.parse(await readFile(join(output, 'remake-build.json'), 'utf8')); }
    catch { throw new Error('Thư mục xuất có sẵn không có marker của bản viết lại.'); }
    if (marker.format !== 'undertale-remake') throw new Error('Thư mục xuất không phải bản viết lại.');
    existing = true;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const work = await mkdtemp(join(dirname(output), '.undertale-remake-'));
  try {
    for (const name of ['index.html', 'style.css', 'server.mjs', 'README.md', 'src']) {
      await cp(join(root, name), join(work, name), { recursive: true });
    }
    await mkdir(join(work, 'vendor'));
    await cp(resolve(root, '../node_modules/phaser/dist/phaser.esm.min.js'), join(work, 'vendor/phaser.esm.min.js'));
    await cp(resolve(root, '../node_modules/phaser/LICENSE.md'), join(work, 'vendor/Phaser-LICENSE.md'));
    await cp(resolve(root, '../game/assets'), join(work, 'assets'), { recursive: true, mode: constants.COPYFILE_FICLONE });
    await cp(resolve(root, '../game/CREDITS.txt'), join(work, 'CREDITS.txt'));
    await writeFile(join(work, 'remake-build.json'), JSON.stringify({ format: 'undertale-remake', version: 1 }) + '\n');
    const previous = `${work}-previous`;
    if (existing) await rename(output, previous);
    try { await rename(work, output); }
    catch (error) { if (existing) await rename(previous, output); throw error; }
    if (existing) await rm(previous, { recursive: true, force: true });
  } finally { await rm(work, { recursive: true, force: true }); }
  return output;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--out')) throw new Error('Cách dùng: node remake/build.mjs [--out thư_mục]');
  console.log(`✓ Bản viết lại: ${await buildRemake(args[1])}`);
}
