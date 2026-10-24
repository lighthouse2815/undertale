import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.env.PORT) || 5173;

// Nhạc từ bản game cài trên máy (KHÔNG nằm trong repo):
// engine chỉ đọc các tệp .ogg có sẵn ở thư mục này, không sao chép vào dự án.
const localMusicDir = resolve(
  process.env.LOCAL_MUSIC_DIR || join(root, 'Undertale-AnkerGames', 'Undertale')
);
const LOCAL_MUSIC_PREFIX = '/local-music/';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    // ---- nhạc từ bản game trên máy (chỉ đọc tại chỗ) ----
    if (pathname.startsWith(LOCAL_MUSIC_PREFIX)) {
      const name = pathname.slice(LOCAL_MUSIC_PREFIX.length);
      if (name === 'index.json') {
        let files = [];
        try {
          files = (await readdir(localMusicDir))
            .filter((f) => f.toLowerCase().endsWith('.ogg'))
            .sort();
        } catch {
          files = [];
        }
        const body = Buffer.from(JSON.stringify({ dir: localMusicDir, files }), 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': body.length,
          'Cache-Control': 'no-store',
        });
        res.end(body);
        return;
      }
      if (!/^[A-Za-z0-9_.-]+\.ogg$/i.test(name)) {
        res.writeHead(400).end('Tên tệp không hợp lệ');
        return;
      }
      const body = await readFile(join(localMusicDir, name));
      res.writeHead(200, {
        'Content-Type': 'audio/ogg',
        'Content-Length': body.length,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(body);
      return;
    }

    const filePath = normalize(join(root, pathname));
    if (!filePath.startsWith(root + sep) && filePath !== root) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const info = await stat(filePath);
    if (info.isDirectory()) {
      res.writeHead(302, { Location: pathname.replace(/\/?$/, '/') + 'index.html' }).end();
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Không tìm thấy');
  }
});

server.listen(port, () => {
  console.log(`\n  DƯỚI ĐẤT đang chạy tại: http://localhost:${port}\n`);
});
