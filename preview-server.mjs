import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import checkout from './api/checkout.js';
const root=path.resolve('dist'),mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png'};
http.createServer(async(req,res)=>{
  if(req.url==='/api/checkout') {
    let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>4096){res.writeHead(413).end();return;}}
    req.body=body;res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
    return checkout(req,res);
  }
  let p;try{p=decodeURIComponent((req.url||'/').split('?')[0]);}catch{res.writeHead(400).end();return;}
  if(['/','/en','/en/','/ja','/ja/'].includes(p))p='/index.html';
  const file=path.resolve(root,'.'+p);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(b);});
}).listen(4173,'127.0.0.1');
