import { describe, it, expect } from 'vitest';
import {
  findActiveSentence,
  groupParagraphs,
  glueMathPunctuation,
} from './audioSync.js';

const SENTENCES = [
  { text: 'A', start: 0, end: 2 },
  { text: 'B', start: 2, end: 5 },
  { text: 'C', start: 5, end: 6 },
];

describe('findActiveSentence', () => {
  it('returns the sentence whose interval contains the time', () => {
    expect(findActiveSentence(SENTENCES, 0)).toBe(0);
    expect(findActiveSentence(SENTENCES, 1.9)).toBe(0);
    expect(findActiveSentence(SENTENCES, 2)).toBe(1);
    expect(findActiveSentence(SENTENCES, 4.99)).toBe(1);
    expect(findActiveSentence(SENTENCES, 5)).toBe(2);
  });

  it('clamps to the last sentence at or past the end', () => {
    expect(findActiveSentence(SENTENCES, 6)).toBe(2);
    expect(findActiveSentence(SENTENCES, 99)).toBe(2);
  });

  it('returns -1 before the first sentence starts', () => {
    expect(findActiveSentence(SENTENCES, -1)).toBe(-1);
  });

  it('returns -1 for empty, missing, or non-numeric input', () => {
    expect(findActiveSentence([], 1)).toBe(-1);
    expect(findActiveSentence(null, 1)).toBe(-1);
    expect(findActiveSentence(SENTENCES, NaN)).toBe(-1);
  });
});

describe('groupParagraphs', () => {
  it('groups consecutive sentences that share a para index', () => {
    const groups = groupParagraphs([
      { text: 'a', para: 0 },
      { text: 'b', para: 0 },
      { text: 'c', para: 1 },
      { text: 'd', para: 2 },
      { text: 'e', para: 2 },
    ]);
    expect(groups.map((g) => g.length)).toEqual([2, 1, 2]);
  });

  it('attaches the global index to each sentence', () => {
    const groups = groupParagraphs([
      { text: 'a', para: 0 },
      { text: 'b', para: 1 },
    ]);
    expect(groups[1][0]).toEqual({ text: 'b', para: 1, index: 1 });
  });

  it('returns an empty array for empty or missing input', () => {
    expect(groupParagraphs([])).toEqual([]);
    expect(groupParagraphs(null)).toEqual([]);
  });
});

describe('glueMathPunctuation', () => {
  it('pulls a trailing period inside the preceding inline math', () => {
    expect(glueMathPunctuation('z okruhu $R$.')).toBe('z okruhu $R.$');
  });

  it('pulls a trailing comma inside the math', () => {
    expect(glueMathPunctuation('výraz $x^i$, tedy')).toBe('výraz $x^i,$ tedy');
  });

  it('leaves math not followed by punctuation untouched', () => {
    expect(glueMathPunctuation('těleso s $p$ prvky')).toBe('těleso s $p$ prvky');
  });

  it('leaves plain text and non-strings untouched', () => {
    expect(glueMathPunctuation('Každé těleso.')).toBe('Každé těleso.');
    expect(glueMathPunctuation(null)).toBe(null);
  });
});
