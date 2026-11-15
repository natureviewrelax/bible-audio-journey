// Abre a versão web do app numa janela do Windows. Sobe um servidor local só para os arquivos da pasta web/.
const { app, BrowserWindow } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'web');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      let file = path.join(root, url === '/' ? 'index.html' : url);
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv.address().port));
  });
}

app.whenReady().then(async () => {
  const port = await serve();
  const win = new BrowserWindow({ width: 900, height: 700, title: 'Bíblia em Áudio Almeida 1911', autoHideMenuBar: true, icon: path.join(__dirname, 'icon.ico') });
  win.loadURL(`http://127.0.0.1:${port}/`);
});

app.on('window-all-closed', () => app.quit());
