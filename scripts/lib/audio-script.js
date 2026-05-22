/*
 * Shared helpers for audiobook narration generation.
 */

// Parses a narration script into per-sentence records.
//
// Each non-blank, non-comment line is one sentence's SPOKEN text (fed to the
// TTS engine). A line starting with ">" overrides the DISPLAYED text of the
// sentence above it (shown in the web transcript, may contain LaTeX). When no
// ">" line is given, the displayed text equals the spoken text.
//
//   Polynom nad okruhem, er, je formální výraz.
//   > Polynom nad okruhem $R$ je formální výraz.
//
// Blank lines and lines starting with "#" are ignored. Returns an array of
// { say, show }.
function parseScript(text) {
  const records = [];
  for (const raw of String(text == null ? '' : text).split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('>')) {
      const show = line.slice(1).trim();
      if (show && records.length > 0) {
        records[records.length - 1].show = show;
      }
      continue;
    }
    records.push({ say: line, show: line });
  }
  return records;
}

module.exports = { parseScript };
