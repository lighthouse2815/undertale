import assert from 'node:assert/strict';
import { constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = process.env.UNDERTALE_MOD_CLI;
assert.ok(cli, 'Đặt UNDERTALE_MOD_CLI tới UndertaleModCli để kiểm thử biên dịch.');
const root = fileURLToPath(new URL('../game/', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'undertale-build-'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
let server;
try {
  // Fixture chỉ có nguồn: không copy build, runtime hay dữ liệu game gốc.
  for (const name of ['tools', 'code', 'assets', 'project', 'project.json', 'server.mjs']) {
    await cp(join(root, name), join(fixture, name), { recursive: true, mode: constants.COPYFILE_FICLONE });
  }
  await assert.rejects(access(join(fixture, 'base/data.win')), { code: 'ENOENT' });
  await assert.rejects(access(join(fixture, 'runtime/game.win')), { code: 'ENOENT' });
  const build = (env = {}) => spawnSync(process.execPath, ['tools/build-game.mjs'], {
    cwd: fixture, env: { ...process.env, ...env }, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  });
  const first = build();
  assert.equal(first.status, 0, first.stdout + first.stderr);
  const output = join(fixture, 'build/undertale/data.win');
  const originalHash = hash(await readFile(output));
  const cached = build({ UNDERTALE_MOD_CLI: join(fixture, 'missing-compiler') });
  assert.equal(cached.status, 0, cached.stdout + cached.stderr);
  assert.match(cached.stdout, /đã khớp nguồn/);
  console.log('✓ dựng từ nguồn không có data.win, dùng lại build đúng checksum mà không cần compiler');

  const file = join(fixture, 'code/gml_Script_scr_gettext.gml');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('text = "";', 'text = "kiem-thu-build";'));
  const roomFile = join(fixture, 'assets/rooms/room_area1.json');
  const roomOriginal = await readFile(roomFile, 'utf8');
  const room = JSON.parse(roomOriginal);
  room.Caption = 'kiem-thu-phong';
  const extraInstance = { ...room.GameObjects[0] }, extraTile = { ...room.Tiles[0] };
  delete extraInstance.InstanceID;
  delete extraTile.InstanceID;
  room.GameObjects.push(extraInstance);
  room.Tiles.push(extraTile);
  await writeFile(roomFile, JSON.stringify(room));
  const generalFile = join(fixture, 'project/general.json');
  const generalOriginal = await readFile(generalFile, 'utf8');
  // Thay cấu hình cửa sổ của bản dựng thử.
  await writeFile(generalFile, generalOriginal.replace('"DefaultWindowWidth": 640', '"DefaultWindowWidth": 800'));
  const spriteFile = join(fixture, 'assets/sprites/spr_maincharad/spr_maincharad_0.png');
  const spriteOriginal = await readFile(spriteFile);
  const spriteReplacement = await readFile(join(fixture, 'assets/sprites/spr_maincharad/spr_maincharad_1.png'));
  await writeFile(spriteFile, spriteReplacement);
  const soundFile = join(fixture, 'assets/sounds/snd_damage/snd_damage.wav');
  const soundOriginal = await readFile(soundFile);
  const soundReplacement = await readFile(join(root, 'assets/sounds/snd_squeak/snd_squeak.wav'));
  await writeFile(soundFile, soundReplacement);
  const valid = build();
  assert.equal(valid.status, 0, valid.stdout + valid.stderr);
  const compiledHash = hash(await readFile(output));
  assert.notEqual(compiledHash, originalHash);

  const port = process.env.BUILD_TEST_PORT ?? '5189';
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: fixture, env: { ...process.env, PORT: port }, stdio: ['ignore', 'pipe', 'inherit'],
  });
  await Promise.race([
    new Promise((resolve) => server.stdout.on('data', function ready(chunk) {
      if (chunk.toString().includes('UNDERTALE đang chạy')) {
        server.stdout.off('data', ready);
        resolve();
      }
    })),
    once(server, 'exit').then(([code]) => { throw new Error(`Server dừng: ${code}`); }),
  ]);
  const response = await fetch(`http://127.0.0.1:${port}/runtime/game.win`);
  assert.equal(response.status, 200);
  assert.equal(hash(new Uint8Array(await response.arrayBuffer())), compiledHash);
  const inspectPng = join(fixture, 'sprite-roundtrip.png');
  const inspectCode = `using System;
    using System.IO;
    using System.Linq;
    using System.Collections.Generic;
    using Newtonsoft.Json.Linq;
    using UndertaleModLib;
    using UndertaleModLib.Models;
    var sourceRoot = Environment.GetEnvironmentVariable("INSPECT_GAME_ROOT");
    var expected = JObject.Parse(File.ReadAllText(Path.Combine(sourceRoot, "project/order.json")));
    foreach (var list in expected.Properties().Where(p => p.Name != "RoomOrder"))
      if (!Data[list.Name].Cast<UndertaleNamedResource>().Select(a => a.Name.Content).SequenceEqual(list.Value.Values<string>()))
        throw new Exception("Sai thứ tự tài nguyên " + list.Name);
    if (!Data.GeneralInfo.RoomOrder.Select(r => r.Resource.Name.Content).SequenceEqual(expected["RoomOrder"].Values<string>()))
      throw new Exception("Sai thứ tự phòng");
    var instanceIds = new HashSet<uint>(); var tileIds = new HashSet<uint>();
    foreach (var sourceFile in Directory.EnumerateFiles(Path.Combine(sourceRoot, "assets/rooms"), "*.json")) {
      var json = JObject.Parse(File.ReadAllText(sourceFile));
      var target = Data.Rooms.ByName((string)json["DataName"] ?? Path.GetFileNameWithoutExtension(sourceFile));
      for (int i = 0; i < target.GameObjects.Count; i++) {
        uint actual = target.GameObjects[i].InstanceID;
        if (!instanceIds.Add(actual) || ((uint?)json["GameObjects"][i]["InstanceID"] is uint id && id != actual))
          throw new Exception("Sai/trùng ID instance");
      }
      for (int i = 0; i < target.Tiles.Count; i++) {
        uint actual = target.Tiles[i].InstanceID;
        if (!tileIds.Add(actual) || ((uint?)json["Tiles"][i]["InstanceID"] is uint id && id != actual))
          throw new Exception("Sai/trùng ID tile");
      }
    }
    foreach (var bg in JArray.Parse(File.ReadAllText(Path.Combine(sourceRoot, "project/empty-backgrounds.json"))))
      if (Data.Backgrounds.ByName((string)bg["Name"]).Texture != null) throw new Exception("Nền trống bị thay đổi");
    Console.WriteLine("source-counts=" + Data.Code.Count + "," + Data.Rooms.Count + "," + Data.Sprites.Count);
    Console.WriteLine("caption=" + Data.Rooms[4].Caption.Content);
    Console.WriteLine("width=" + Data.GeneralInfo.DefaultWindowWidth);
    Console.WriteLine("sound=" + Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(Data.Sounds.First(s => s.Name.Content == "snd_damage").AudioFile.Data)).ToLowerInvariant());
    using (var worker = new UndertaleModLib.Util.TextureWorker()) worker.ExportAsPNG(Data.Sprites.First(s => s.Name.Content == "spr_maincharad").Textures[0].Texture, Environment.GetEnvironmentVariable("INSPECT_GAME_PNG"), null, true);`;
  const inspectArgs = ['load', output, '--line', inspectCode];
  const inspection = spawnSync(cli.endsWith('.dll') ? 'dotnet' : cli, cli.endsWith('.dll') ? [cli, ...inspectArgs] : inspectArgs,
    { encoding: 'utf8', env: { ...process.env, INSPECT_GAME_PNG: inspectPng, INSPECT_GAME_ROOT: fixture } });
  assert.equal(inspection.status, 0, inspection.stdout + inspection.stderr);
  assert.match(inspection.stdout, /source-counts=6272,336,2583/);
  assert.match(inspection.stdout, /caption=kiem-thu-phong/);
  assert.match(inspection.stdout, /width=800/);
  assert.ok(inspection.stdout.includes(`sound=${hash(soundReplacement)}`));
  assert.equal(hash(await readFile(inspectPng)), hash(spriteReplacement));
  const args = ['dump', output, '--code', 'gml_Script_scr_gettext', '--output', join(fixture, 'dump')];
  const dump = spawnSync(cli.endsWith('.dll') ? 'dotnet' : cli, cli.endsWith('.dll') ? [cli, ...args] : args,
    { encoding: 'utf8' });
  assert.equal(dump.status, 0, dump.stdout + dump.stderr);
  assert.match(await readFile(join(fixture, 'dump/CodeEntries/gml_Script_scr_gettext.gml'), 'utf8'), /kiem-thu-build/);
  console.log('✓ biên dịch toàn bộ GML, cấu hình, JSON/PNG/WAV; giữ thứ tự tài nguyên, ID cũ và cấp ID mới không trùng');

  // Lỗi nguồn phải dừng build và giữ nguyên dữ liệu chạy trước đó.
  const missingFile = join(fixture, 'code/gml_Script_snd_stop.gml');
  const missingOriginal = await readFile(missingFile);
  await rm(missingFile);
  const missing = build();
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /Thiếu nguồn Code/);
  assert.equal(hash(await readFile(output)), compiledHash);
  await writeFile(missingFile, missingOriginal);
  room.GameObjects[room.GameObjects.length - 1].InstanceID = room.GameObjects[0].InstanceID;
  await writeFile(roomFile, JSON.stringify(room));
  const duplicate = build();
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /trùng InstanceID/);
  assert.equal(hash(await readFile(output)), compiledHash);
  await writeFile(roomFile, roomOriginal);
  await writeFile(file, 'if (');
  const invalidCode = build();
  assert.notEqual(invalidCode.status, 0);
  assert.match(invalidCode.stderr, /gml_Script_scr_gettext/);
  assert.equal(hash(await readFile(output)), compiledHash);
  await writeFile(file, original);
  await writeFile(spriteFile, 'khong-phai-png');
  const invalidImage = build();
  assert.notEqual(invalidImage.status, 0);
  assert.match(invalidImage.stderr, /Failed to import sprite image/);
  assert.equal(hash(await readFile(output)), compiledHash);
  await writeFile(spriteFile, spriteOriginal);
  await writeFile(soundFile, soundOriginal);
  await writeFile(generalFile, generalOriginal);
  const restored = build();
  assert.equal(restored.status, 0, restored.stdout + restored.stderr);
  assert.equal(hash(await readFile(output)), originalHash, 'Hoàn tác nguồn phải dựng lại cùng dữ liệu chạy.');
  console.log('✓ từ chối thiếu GML, ID trùng, GML/PNG lỗi; giữ build cũ và hoàn tác bằng cách dựng lại nguồn');
} finally {
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
  }
  await rm(fixture, { recursive: true, force: true });
}
