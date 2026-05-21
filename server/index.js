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

/*
 * Gate the static mounts behind the same Supabase JWT check as /api/*.
 * Browser-initiated <img>/<embed> loads can't set Authorization, so the SPA
 * mirrors its access token into the `sb_access_token` httpOnly cookie via
 * POST /api/auth/session — requireAuth reads either source.
 *
 * NOTE: in production on Vercel these mounts are NOT hit. `scripts/copy-static.js`
 * copies `sources/` and `data/answers/imgs/` into `client/dist/` so Vercel's
 * static layer serves them directly, bypassing Express. Gating PDFs in prod
 * would require serving them via an API route (and resolving the 300 MB
 * function size limit for sources/) or moving them to Supabase Storage with
 * signed URLs.
 */
app.use('/pdfs', app.requireAuth, express.static(path.join(root, 'sources')));
app.use(
  '/answer-imgs',
  app.requireAuth,
  express.static(path.join(root, 'data', 'answers', 'imgs'))
);

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
