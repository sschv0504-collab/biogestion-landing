import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../public/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://localhost'); const requested = decodeURIComponent(url.pathname);
    const file = path.resolve(root,'.'+(requested === '/' ? '/index.html' : requested));
    if (!file.startsWith(root) || !types[path.extname(file)]) {res.writeHead(404);res.end('No encontrado');return;}
    const bytes = await readFile(file); res.writeHead(200,{'Content-Type':types[path.extname(file)]});res.end(bytes);
  } catch {res.writeHead(404);res.end('No encontrado');}
}).listen(3000,'127.0.0.1', () => console.log('Vista previa: http://localhost:3000 · Sin configuración, el formulario no enviará datos.'));
