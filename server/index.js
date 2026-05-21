/*
 * Local dev entry: wraps the API app with static mounts for PDFs, answer
 * screenshots, and the built frontend. On Vercel these are served by the
 * static layer instead and this file is never used.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// Load .env (if present) before requiring app, so route handlers see the vars.
// Vercel sets env vars via its UI, so this only runs in local dev.
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.use('/pdfs', express.static(path.join(root, 'sources')));
app.use('/answer-imgs', express.static(path.join(root, 'data', 'answers', 'imgs')));

const dist = path.join(root, 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Study app server: http://localhost:${PORT}`);
  if (!fs.existsSync(dist)) {
    console.log('(frontend not built yet - run `npm run build`, or use `npm run dev`)');
  }
});
