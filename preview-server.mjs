import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import checkout from './api/checkout.js';
import paypalWebhook from './api/paypal-webhook.js';

const root = path.resolve('dist');
const routes = { '/api/checkout': checkout, '/api/paypal-webhook': paypalWebhook };
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

http.createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return res.writeHead(400).end();
  }
  const handler = Object.hasOwn(routes, pathname) && routes[pathname];
  if (handler) {
    const chunks = [];
    let length = 0;
    for await (const chunk of req) {
      length += chunk.length;
      if (length > 262144) return res.writeHead(413).end();
      chunks.push(chunk);
    }
    req.body = Buffer.concat(chunks).toString('utf8');
    res.status = code => { res.statusCode = code; return res; };
    res.json = body => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
    };
    return handler(req, res);
  }
  if (['/', '/en', '/en/', '/ja', '/ja/'].includes(pathname)) pathname = '/index.html';
  if (pathname === '/mappe') pathname = '/mappe/';
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (error, content) => {
    if (error) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(content);
  });
}).listen(4173, '127.0.0.1');
