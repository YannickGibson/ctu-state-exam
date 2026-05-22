#!/usr/bin/env node
/*
 * Generates sentence-level audiobook narration for one exam question.
 *
 *   in:  data/audio/scripts/<QID>.txt   narration script (see AUDIOBOOKS.md)
 *   out: data/audio/<QID>.mp3           concatenated narration audio
 *        data/audio/<QID>.json          sentence timing map for the web player
 *
 * Each sentence (one per script line) is synthesized separately by Piper from
 * its SPOKEN text, so its exact duration is known; the clips are concatenated
 * and the cumulative offsets become the timing map. The map stores each
 * sentence's DISPLAYED text, which the player highlights as it is spoken.
 *
 * Run:  node scripts/generate-audio.js NI-SPOL-2
 *       LENGTH_SCALE=0.9 node scripts/generate-audio.js NI-SPOL-2   (>1 = slower)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { parseScript } = require('./lib/audio-script');

const root = path.join(__dirname, '..');
const piperBin = path.join(root, '.tools', 'piper', 'piper');
const voiceModel = path.join(root, '.tools', 'voices', 'cs_CZ-jirka-medium.onnx');
const audioDir = path.join(root, 'data', 'audio');

const round = (n) => Math.round(n * 1000) / 1000;

function ffprobeDuration(file) {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=nk=1:nw=1',
    file,
  ]);
  return parseFloat(String(out).trim());
}

function main() {
  const qid = process.argv[2];
  if (!qid) {
    console.error('Usage: node scripts/generate-audio.js <QUESTION-ID>');
    process.exit(1);
  }
  const lengthScale = process.env.LENGTH_SCALE || '0.8';

  if (!fs.existsSync(piperBin)) {
    console.error(`Piper binary not found: ${piperBin}\nSee AUDIOBOOKS.md to re-fetch it.`);
    process.exit(1);
  }
  if (!fs.existsSync(voiceModel)) {
    console.error(`Voice model not found: ${voiceModel}\nSee AUDIOBOOKS.md to re-fetch it.`);
    process.exit(1);
  }
  const scriptFile = path.join(audioDir, 'scripts', `${qid}.txt`);
  if (!fs.existsSync(scriptFile)) {
    console.error(`Narration script not found: ${scriptFile}`);
    process.exit(1);
  }

  const records = parseScript(fs.readFileSync(scriptFile, 'utf8'));
  if (records.length === 0) {
    console.error('Narration script contains no sentences.');
    process.exit(1);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'audiogen-'));
  try {
    const timing = [];
    const concatList = [];
    let cursor = 0;

    records.forEach((rec, i) => {
      const wav = path.join(tmp, `s${String(i).padStart(3, '0')}.wav`);
      execFileSync(
        piperBin,
        ['--model', voiceModel, '--length_scale', lengthScale, '--output_file', wav],
        { input: rec.say }
      );
      const dur = ffprobeDuration(wav);
      timing.push({ text: rec.show, start: round(cursor), end: round(cursor + dur) });
      cursor += dur;
      concatList.push(`file '${wav.replace(/'/g, "'\\''")}'`);
    });

    const listFile = path.join(tmp, 'concat.txt');
    fs.writeFileSync(listFile, concatList.join('\n') + '\n');

    const mp3 = path.join(audioDir, `${qid}.mp3`);
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-f', 'concat', '-safe', '0', '-i', listFile,
      '-b:a', '96k', mp3,
    ]);

    fs.writeFileSync(
      path.join(audioDir, `${qid}.json`),
      JSON.stringify(
        {
          id: qid,
          voice: 'cs_CZ-jirka-medium',
          lengthScale: Number(lengthScale),
          duration: round(cursor),
          sentences: timing,
        },
        null,
        2
      ) + '\n'
    );

    console.log(
      `Hotovo: ./data/audio/${qid}.mp3 + ${qid}.json  ` +
        `(${records.length} vět, ${(cursor / 60).toFixed(1)} min)`
    );
    console.log(`Dál: node scripts/upload-audio.js ${qid}  (nahraje mp3 na Supabase)`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main();
