#!/usr/bin/env node
/*
 * Generates short Piper-TTS intro clips for the Podcast tab. Two kinds:
 *
 *   data/audio/intros/subject-<CODE>.mp3   "Předmět M P I."
 *   data/audio/intros/q-<CODE>-<N>.mp3     "M P I, Otázka číslo 1."
 *
 * Each subjectCode's letters are space-separated AES-style so Piper reads
 * each as a Czech letter name (see AUDIOBOOKS.md). No timing JSON — the
 * podcast player does not need sentence-level scrubbing for the intros.
 *
 * Run:  node scripts/generate-podcast-intros.js
 *       LENGTH_SCALE=0.85 node scripts/generate-podcast-intros.js  (>1 = slower)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const piperBin = path.join(root, '.tools', 'piper', 'piper');
const voiceModel = path.join(root, '.tools', 'voices', 'cs_CZ-jirka-medium.onnx');
const introsDir = path.join(root, 'data', 'audio', 'intros');
const questionsFile = path.join(root, 'data', 'questions.json');

function spellCode(code) {
  return code.split('').join(' ');
}

function synth(text, mp3Path, lengthScale) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'introgen-'));
  try {
    const wav = path.join(tmp, 'out.wav');
    execFileSync(
      piperBin,
      ['--model', voiceModel, '--length_scale', lengthScale, '--output_file', wav],
      { input: text }
    );
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-i', wav,
      '-b:a', '96k', mp3Path,
    ]);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function main() {
  const lengthScale = process.env.LENGTH_SCALE || '0.85';

  if (!fs.existsSync(piperBin)) {
    console.error(`Piper binary not found: ${piperBin}\nSee AUDIOBOOKS.md to re-fetch it.`);
    process.exit(1);
  }
  if (!fs.existsSync(voiceModel)) {
    console.error(`Voice model not found: ${voiceModel}`);
    process.exit(1);
  }
  if (!fs.existsSync(questionsFile)) {
    console.error(`Questions file not found: ${questionsFile}`);
    process.exit(1);
  }

  fs.mkdirSync(introsDir, { recursive: true });

  const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

  // Unique subject codes in first-occurrence order.
  const subjectCodes = [];
  const seen = new Set();
  for (const q of questions) {
    if (!seen.has(q.subjectCode)) {
      seen.add(q.subjectCode);
      subjectCodes.push(q.subjectCode);
    }
  }

  console.log(`Generating ${subjectCodes.length} subject intros + ${questions.length} question intros…`);

  for (const code of subjectCodes) {
    const text = `Předmět ${spellCode(code)}.`;
    const file = path.join(introsDir, `subject-${code}.mp3`);
    synth(text, file, lengthScale);
    console.log(`  ✓ ${path.relative(root, file)}   « ${text}`);
  }

  for (const q of questions) {
    const text = `${spellCode(q.subjectCode)}, Otázka číslo ${q.subjectIndex}.`;
    const file = path.join(introsDir, `q-${q.subjectCode}-${q.subjectIndex}.mp3`);
    synth(text, file, lengthScale);
    console.log(`  ✓ ${path.relative(root, file)}   « ${text}`);
  }

  console.log(`Done. Next: node scripts/upload-audio.js intros`);
}

main();
