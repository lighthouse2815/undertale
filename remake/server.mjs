import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
const source = !existsSync(resolve(root, 'assets'));
const mime = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.js': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    let directory = root, path = pathname;
    if (source && pathname.startsWith('/assets/')) { directory = resolve(root, '../game/assets'); path = pathname.slice(7); }
    if (source && pathname === '/vendor/phaser.esm.min.js') {
      directory = resolve(root, '../node_modules/phaser/dist'); path = '/phaser.esm.min.js';
    }
    const file = resolve(directory, `.${path === '/' ? '/index.html' : path}`);
    const base = resolve(directory);
    if (!file.startsWith(base + sep)) { res.writeHead(403).end('Forbidden'); return; }
    if (!(await stat(file)).isFile()) { res.writeHead(404).end('Not found'); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
      'Content-Length': body.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(body);
  } catch (error) {
    res.writeHead(['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 500,
      { 'Content-Type': 'text/plain; charset=utf-8' }).end(error.message);
  }
});
server.listen(Number(process.env.PORT ?? 5191), '127.0.0.1', () => console.log(`Bản viết lại: http://127.0.0.1:${server.address().port}`));
