// Pure helper for the audiobook player: given the sentence timing map and the
// audio element's currentTime, returns the index of the sentence currently
// being spoken, or -1 before the first sentence begins.
//
// Timing entries are contiguous (each sentence's `end` equals the next one's
// `start`), so every time within [0, duration) lands in exactly one sentence.
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
