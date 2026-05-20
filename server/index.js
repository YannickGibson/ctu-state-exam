/*
 * Local dev entry: wraps the API app with static mounts for PDFs, answer
 * screenshots, and the built frontend. On Vercel these are served by the
 * static layer instead and this file is never used.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = require('./app');

const root = path.join(__dirname, '..');
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
