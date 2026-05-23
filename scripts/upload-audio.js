#!/usr/bin/env node
/*
 * Uploads generated narration audio (the .mp3 files) to Supabase Storage.
 *
 * The timing .json files are committed to git and served inline by the API,
 * so only the .mp3 files need hosting here. Creates the public bucket on
 * first run.
 *
 * Run:  node scripts/upload-audio.js NI-SPOL-2
 *       node scripts/upload-audio.js all
 */
const fs = require('fs');
const path = require('path');
const ws = require('ws');
const { createClient } = require('@supabase/supabase-js');

const root = path.join(__dirname, '..');
const audioDir = path.join(root, 'data', 'audio');
const introsDir = path.join(audioDir, 'intros');
const BUCKET = 'answer-audio';

// Load .env so SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are available locally
// (Vercel injects them as real env vars, so this only matters for local runs).
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/upload-audio.js <QUESTION-ID|all|intros>');
    process.exit(1);
  }
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  // realtime.transport: ws — RealtimeClient is initialised eagerly by
  // createClient and Node has no native WebSocket on older versions.
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
  });

  // Ensure the public bucket exists.
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('listBuckets failed:', listErr.message);
    process.exit(1);
  }
  if (!buckets.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) {
      console.error('createBucket failed:', error.message);
      process.exit(1);
    }
    console.log(`Created public bucket "${BUCKET}".`);
  }

  // Build list of { localPath, storageKey } items based on the argument.
  // - <QID>      : data/audio/<QID>.mp3       → <QID>.mp3
  // - all        : every per-question .mp3 + every intro                 (does NOT skip intros)
  // - intros     : every file under data/audio/intros/   → intros/<name>.mp3
  const items = [];
  if (arg === 'intros') {
    if (fs.existsSync(introsDir)) {
      for (const f of fs.readdirSync(introsDir)) {
        if (!f.endsWith('.mp3')) continue;
        items.push({ localPath: path.join(introsDir, f), storageKey: `intros/${f}` });
      }
    }
    if (items.length === 0) {
      console.error('No .mp3 files in data/audio/intros/ — run generate-podcast-intros.js first.');
      process.exit(1);
    }
  } else if (arg === 'all') {
    for (const f of fs.readdirSync(audioDir)) {
      if (!f.endsWith('.mp3')) continue;
      items.push({ localPath: path.join(audioDir, f), storageKey: f });
    }
    if (fs.existsSync(introsDir)) {
      for (const f of fs.readdirSync(introsDir)) {
        if (!f.endsWith('.mp3')) continue;
        items.push({ localPath: path.join(introsDir, f), storageKey: `intros/${f}` });
      }
    }
    if (items.length === 0) {
      console.error('No .mp3 files found in data/audio/ — run generate-audio.js first.');
      process.exit(1);
    }
  } else {
    const file = path.join(audioDir, `${arg}.mp3`);
    if (!fs.existsSync(file)) {
      console.error(`Not found: ${file} (run generate-audio.js first).`);
      process.exit(1);
    }
    items.push({ localPath: file, storageKey: `${arg}.mp3` });
  }

  for (const { localPath, storageKey } of items) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, fs.readFileSync(localPath), {
        contentType: 'audio/mpeg',
        upsert: true,
      });
    if (error) {
      console.error(`Upload ${storageKey} failed:`, error.message);
      process.exit(1);
    }
    console.log(`Uploaded ${storageKey}`);
  }
  console.log('Done.');
}

main();
