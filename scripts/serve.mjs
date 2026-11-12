import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve,extname } from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{
 try {const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'));
 if(!path.startsWith(root+'/')&&!path.startsWith(root+'\\')){res.writeHead(403).end();return}
 const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'})[extname(path)]??'application/octet-stream');res.end(data);
 }catch{res.writeHead(404).end()}
}).listen(8088,'127.0.0.1');
