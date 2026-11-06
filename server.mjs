import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('out');
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};
http
  .createServer(async (req, res) => {
    const target = path.resolve(
      root,
      '.' +
        decodeURIComponent(
          new URL(req.url, 'http://localhost').pathname === '/'
            ? '/index.html'
            : new URL(req.url, 'http://localhost').pathname,
        ),
    );
    if (!target.startsWith(root + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    try {
      const body = await readFile(target);
      res.writeHead(200, {
        'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  })
  .listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
