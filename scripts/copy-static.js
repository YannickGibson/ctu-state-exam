/*
 * Copies the static datasets that live outside client/ into the Vite build
 * output so Vercel can serve them from the same origin as the SPA.
 *
 *   sources/             -> client/dist/pdfs/
 *   data/answers/imgs/   -> client/dist/answer-imgs/
 *
 * Local dev does NOT need this — Express mounts the same paths directly.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'client', 'dist');

if (!fs.existsSync(dist)) {
  console.error(`copy-static: ${dist} does not exist — run the Vite build first.`);
  process.exit(1);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`copy-static: source ${src} missing — skipping.`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`copy-static: ${path.relative(root, src)} -> ${path.relative(root, dest)}`);
}

copyDir(path.join(root, 'sources'), path.join(dist, 'pdfs'));
copyDir(path.join(root, 'data', 'answers', 'imgs'), path.join(dist, 'answer-imgs'));
