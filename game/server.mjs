import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runtimeData, runtimeFiles } from './tools/runtime-files.mjs';

const root = fileURLToPath(new URL('./', import.meta.url)).replace(/[\\/]$/, '');
const port = Number(process.env.PORT ?? 5173);
const mime = {
  '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.wasm': 'application/wasm',
};
runtimeFiles(root); // Thiếu source/tài nguyên phải báo ngay khi khởi động.
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    let file = normalize(join(root, pathname));
    if (!file.startsWith(root + sep)) { res.writeHead(403).end('Forbidden'); return; }
    let body;
    let contentType;
    if (pathname === '/runtime.json') {
      body = Buffer.from(JSON.stringify(runtimeFiles(root)));
      contentType = mime['.json'];
    } else {
      if (pathname === '/runtime/game.win') file = runtimeData(root);
      const info = await stat(file);
      if (info.isDirectory()) {
        res.writeHead(302, { Location: `${pathname.replace(/\/?$/, '/')}index.html` }).end();
        return;
      }
      body = await readFile(file);
      contentType = mime[extname(file)] ?? 'application/octet-stream';
    }
    res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': body.length,
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(body);
  } catch (error) {
    const status = error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500;
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(error.message);
  }
});
server.listen(port, process.env.HOST ?? '127.0.0.1', () => {
  console.log(`UNDERTALE đang chạy tại http://localhost:${server.address().port}`);
});
