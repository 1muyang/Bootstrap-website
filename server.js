const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = path.join(__dirname);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.yml': 'text/plain; charset=utf-8',
  '.yaml': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

// Helper: read JSON file
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Helper: write JSON file
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper: parse JSON body from request
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Helper: parse multipart form data (simple implementation for file upload)
function parseMultipart(req, boundary) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const boundaryBuffer = Buffer.from('--' + boundary);
      const parts = [];
      let start = 0;
      
      while (true) {
        const idx = buffer.indexOf(boundaryBuffer, start);
        if (idx === -1) break;
        if (start > 0) {
          const part = buffer.slice(start, idx);
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const headers = part.slice(0, headerEnd).toString();
            const content = part.slice(headerEnd + 4, part.length - 2); // remove trailing \r\n
            const filenameMatch = headers.match(/filename="([^"]+)"/);
            parts.push({
              filename: filenameMatch ? filenameMatch[1] : null,
              content: content
            });
          }
        }
        start = idx + boundaryBuffer.length + 2; // +2 for \r\n
      }
      resolve(parts);
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  
  // CORS headers for admin panel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Get products
  if (urlPath === '/api/products' && req.method === 'GET') {
    try {
      const data = readJSON(path.join(ROOT, 'products.json'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // API: Save products
  if (urlPath === '/api/products' && req.method === 'PUT') {
    try {
      const body = await parseBody(req);
      writeJSON(path.join(ROOT, 'products.json'), body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // API: Get settings
  if (urlPath === '/api/settings' && req.method === 'GET') {
    try {
      const data = readJSON(path.join(ROOT, 'site-settings.json'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // API: Save settings
  if (urlPath === '/api/settings' && req.method === 'PUT') {
    try {
      const body = await parseBody(req);
      writeJSON(path.join(ROOT, 'site-settings.json'), body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // API: Upload image
  if (urlPath === '/api/upload' && req.method === 'POST') {
    try {
      const contentType = req.headers['content-type'];
      const boundaryMatch = contentType.match(/boundary=(.+)/);
      if (!boundaryMatch) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'No boundary' }));
        return;
      }
      
      const parts = await parseMultipart(req, boundaryMatch[1]);
      const filePart = parts.find(p => p.filename);
      
      if (!filePart) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'No file' }));
        return;
      }

      // Generate filename
      const ext = path.extname(filePart.filename).toLowerCase();
      const filename = `upload-${Date.now()}${ext}`;
      const uploadDir = path.join(ROOT, 'images', 'products');
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, filePart.content);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, path: `images/products/${filename}` }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // API: Delete image
  if (urlPath === '/api/upload' && req.method === 'DELETE') {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const imagePath = url.searchParams.get('path');
      
      if (!imagePath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'No path' }));
        return;
      }

      // Security: ensure path is within images/products
      const fullPath = path.join(ROOT, imagePath);
      if (!fullPath.startsWith(path.join(ROOT, 'images', 'products'))) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid path' }));
        return;
      }

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // Static file serving
  if (urlPath === '/') {
    urlPath = '/index.html';
  } else if (urlPath.endsWith('/')) {
    urlPath += 'index.html';
  }
  
  const filePath = path.join(ROOT, urlPath);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Page Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ✅ Server running at http://localhost:${PORT}\n`);
  console.log(`  📱 Main site: http://localhost:${PORT}`);
  console.log(`  🔧 Admin panel: http://localhost:${PORT}/admin/`);
  console.log(`  🛑 Press Ctrl+C to stop the server\n`);
});
