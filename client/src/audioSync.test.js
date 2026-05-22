import { describe, it, expect } from 'vitest';
import { findActiveSentence } from './audioSync.js';

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
