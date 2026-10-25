import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = process.env.UNDERTALE_MOD_CLI;
assert.ok(cli, 'Đặt UNDERTALE_MOD_CLI tới UndertaleModCli để kiểm thử biên dịch.');
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'undertale-build-'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
let server;
try {
  await cp(join(root, 'scripts'), join(fixture, 'scripts'), { recursive: true });
  await mkdir(join(fixture, 'game/code'), { recursive: true });
  const codeName = 'gml_Script_scr_gettext.gml';
  const metadata = JSON.parse(await readFile(join(root, 'game/manifest.json'), 'utf8'));
  metadata.code = { [codeName]: metadata.code[codeName] };
  await writeFile(join(fixture, 'game/manifest.json'), JSON.stringify(metadata));
  await cp(join(root, 'game/code', codeName), join(fixture, 'game/code', codeName));
  for (const folder of ['sprites', 'backgrounds', 'sounds', 'fonts', 'paths', 'scripts', 'objects', 'rooms']) {
    await mkdir(join(fixture, 'game/assets', folder), { recursive: true });
  }
  const baseline = JSON.parse(await readFile(join(root, 'game/asset-baseline.json'), 'utf8'));
  const selected = ['rooms/room_area1.json', 'sprites/spr_maincharad/spr_maincharad.json', 'sounds/snd_damage/snd_damage.json'];
  baseline.resources = Object.fromEntries(selected.map((name) => [name, baseline.resources[name]]));
  for (const files of Object.values(baseline.resources)) {
    for (const name of Object.keys(files)) {
      const target = join(fixture, 'game/assets', name);
      await mkdir(join(target, '..'), { recursive: true });
      await cp(join(root, 'game/assets', name), target);
    }
  }
  await writeFile(join(fixture, 'game/asset-baseline.json'), JSON.stringify(baseline));
  await mkdir(join(fixture, 'assets/undertale'), { recursive: true });
  const base = join(fixture, 'assets/undertale/data.win');
  await cp(join(root, 'assets/undertale/data.win'), base);
  const file = join(fixture, 'game/code/gml_Script_scr_gettext.gml');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('text = "";', 'text = "kiem-thu-build";'));
  const roomFile = join(fixture, 'game/assets/rooms/room_area1.json');
  const roomOriginal = await readFile(roomFile, 'utf8');
  await writeFile(roomFile, JSON.stringify({ ...JSON.parse(roomOriginal), Caption: 'kiem-thu-phong' }));
  const spriteFile = join(fixture, 'game/assets/sprites/spr_maincharad/spr_maincharad_0.png');
  const spriteOriginal = await readFile(spriteFile);
  const spriteReplacement = await readFile(join(fixture, 'game/assets/sprites/spr_maincharad/spr_maincharad_1.png'));
  await writeFile(spriteFile, spriteReplacement);
  const soundFile = join(fixture, 'game/assets/sounds/snd_damage/snd_damage.wav');
  const soundOriginal = await readFile(soundFile);
  const soundReplacement = await readFile(join(root, 'game/assets/sounds/snd_squeak/snd_squeak.wav'));
  await writeFile(soundFile, soundReplacement);
  const build = () => spawnSync(process.execPath, ['scripts/build-game.mjs'], {
    cwd: fixture, env: process.env, encoding: 'utf8',
  });
  const valid = build();
  assert.equal(valid.status, 0, valid.stdout + valid.stderr);
  const output = join(fixture, 'build/undertale/data.win');
  const compiledHash = hash(await readFile(output));
  assert.notEqual(compiledHash, hash(await readFile(base)));
  await cp(join(root, 'server.mjs'), join(fixture, 'server.mjs'));
  const port = process.env.BUILD_TEST_PORT ?? '5189';
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: fixture, env: { ...process.env, PORT: port }, stdio: ['ignore', 'pipe', 'inherit'],
  });
  await Promise.race([
    once(server.stdout, 'data'),
    once(server, 'exit').then(([code]) => { throw new Error(`Server dừng: ${code}`); }),
  ]);
  const response = await fetch(`http://127.0.0.1:${port}/assets/undertale/data.win`);
  assert.equal(response.status, 200);
  assert.equal(hash(new Uint8Array(await response.arrayBuffer())), compiledHash);
  const inspectPng = join(fixture, 'sprite-roundtrip.png');
  const inspectCode = `using System.Linq;
    System.Console.WriteLine("caption=" + Data.Rooms[4].Caption.Content);
    System.Console.WriteLine("sound=" + System.Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(Data.Sounds.First(s => s.Name.Content == "snd_damage").AudioFile.Data)).ToLowerInvariant());
    using (var worker = new UndertaleModLib.Util.TextureWorker()) worker.ExportAsPNG(Data.Sprites.First(s => s.Name.Content == "spr_maincharad").Textures[0].Texture, System.Environment.GetEnvironmentVariable("INSPECT_GAME_PNG"), null, true);`;
  const inspectArgs = ['load', output, '--line', inspectCode];
  const inspection = spawnSync(cli.endsWith('.dll') ? 'dotnet' : cli, cli.endsWith('.dll') ? [cli, ...inspectArgs] : inspectArgs,
    { encoding: 'utf8', env: { ...process.env, INSPECT_GAME_PNG: inspectPng } });
  assert.equal(inspection.status, 0, inspection.stdout + inspection.stderr);
  assert.match(inspection.stdout, /caption=kiem-thu-phong/);
  assert.ok(inspection.stdout.includes(`sound=${hash(soundReplacement)}`));
  assert.equal(hash(await readFile(inspectPng)), hash(spriteReplacement));
  const args = ['dump', output, '--code', 'gml_Script_scr_gettext', '--output', join(fixture, 'dump')];
  const dump = spawnSync(cli.endsWith('.dll') ? 'dotnet' : cli, cli.endsWith('.dll') ? [cli, ...args] : args,
    { encoding: 'utf8' });
  assert.equal(dump.status, 0, dump.stdout + dump.stderr);
  assert.match(await readFile(join(fixture, 'dump/CodeEntries/gml_Script_scr_gettext.gml'), 'utf8'), /kiem-thu-build/);
  await writeFile(file, 'if (');
  assert.notEqual(build().status, 0);
  assert.equal(hash(await readFile(output)), compiledHash);
  await writeFile(file, original);
  await writeFile(spriteFile, 'khong-phai-png');
  assert.notEqual(build().status, 0);
  assert.equal(hash(await readFile(output)), compiledHash);
  await writeFile(spriteFile, spriteOriginal);
  await writeFile(roomFile, roomOriginal);
  await writeFile(soundFile, soundOriginal);
  const restored = build();
  assert.equal(restored.status, 0, restored.stdout + restored.stderr);
  assert.equal(hash(await readFile(output)), hash(await readFile(base)));
  console.log('✓ biên dịch GML + JSON phòng + PNG sprite + WAV, kiểm tra nội dung thật, giữ build cũ khi lỗi và hoàn tác');
} finally {
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
  }
  await rm(fixture, { recursive: true, force: true });
}
