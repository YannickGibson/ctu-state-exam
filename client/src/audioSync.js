// Pure helpers for the audiobook player.

// Given the sentence timing map and the audio element's currentTime, returns
// the index of the sentence currently being spoken, or -1 before the first
// sentence begins. Timing entries are contiguous (each sentence's `end` equals
// the next one's `start`), so every time within [0, duration) lands in exactly
// one sentence.
export function findActiveSentence(sentences, time) {
  if (!Array.isArray(sentences) || sentences.length === 0) return -1;
  if (!(time >= sentences[0].start)) return -1;
  let index = 0;
  for (let i = 0; i < sentences.length; i++) {
    if (time >= sentences[i].start) index = i;
    else break;
  }
  return index;
}

// Groups the flat sentence list into paragraphs — runs of consecutive
// sentences sharing the same `para` index. Each returned paragraph is an array
// of sentences with their global `index` attached (needed for highlighting and
// seeking, which work on the flat list).
export function groupParagraphs(sentences) {
  const groups = [];
  (Array.isArray(sentences) ? sentences : []).forEach((s, index) => {
    const last = groups[groups.length - 1];
    if (last && last[0].para === s.para) {
      last.push({ ...s, index });
    } else {
      groups.push([{ ...s, index }]);
    }
  });
  return groups;
}

// KaTeX renders inline math ($...$) as an atomic inline box, so a period or
// comma right after a formula can wrap onto its own line. Pulling that
// trailing punctuation inside the math keeps it glued to the formula.
export function glueMathPunctuation(text) {
  if (typeof text !== 'string') return text;
  return text.replace(
    /\$([^$\n]+)\$([.,]+)/g,
    (_, math, punct) => '$' + math + punct + '$'
  );
}
