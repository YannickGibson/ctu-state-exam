/*
 * Shared helpers for audiobook narration generation.
 */

// Parses a narration script into per-sentence records.
//
// Each non-blank, non-comment line is one sentence's SPOKEN text (fed to the
// TTS engine). A line starting with ">" overrides the DISPLAYED text of the
// sentence above it (web transcript; may contain LaTeX and **bold**). When no
// ">" line is given, the displayed text equals the spoken text.
//
// A blank line starts a new paragraph: `para` is a 0-based index that the
// player uses to group sentences into spaced blocks. Lines starting with "#"
// are comments. Returns an array of { say, show, para }.
function parseScript(text) {
  const records = [];
  let para = 0;
  let blankSeen = false;
  for (const raw of String(text == null ? '' : text).split('\n')) {
    const line = raw.trim();
    if (!line) {
      if (records.length > 0) blankSeen = true;
      continue;
    }
    if (line.startsWith('#')) continue;
    if (line.startsWith('>')) {
      const show = line.slice(1).trim();
      if (show && records.length > 0) {
        records[records.length - 1].show = show;
      }
      continue;
    }
    if (blankSeen) {
      para += 1;
      blankSeen = false;
    }
    records.push({ say: line, show: line, para });
  }
  return records;
}

module.exports = { parseScript };
