// Local development server (not used on Vercel).
// Serves the static files and runs api/data.js at /api/data, like Vercel does.
const http = require('http'), fs = require('fs'), path = require('path');
const handler = require('./api/data.js');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/api/data') {
    res.status = c => { res.statusCode = c; return res; };
    res.json = b => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(b)); };
    return handler(req, res);
  }
  const file = path.join(__dirname, path.normalize(url === '/' ? '/index.html' : url));
  const blocked = url.startsWith('/api') || url.includes('server.js') || url.includes('node_modules');
  if (blocked || !file.startsWith(__dirname) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.statusCode = 404; return res.end('Not found');
  }
  res.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Open http://localhost:${PORT}`));