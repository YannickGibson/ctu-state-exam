import { describe, it, expect } from 'vitest';
import { parseScript } from './audio-script.js';

describe('parseScript', () => {
  it('treats each non-blank line as a sentence; show defaults to say, para is 0', () => {
    expect(parseScript('Okruh.\nTěleso.')).toEqual([
      { say: 'Okruh.', show: 'Okruh.', para: 0 },
      { say: 'Těleso.', show: 'Těleso.', para: 0 },
    ]);
  });

  it('applies a ">" line as the display override of the preceding sentence', () => {
    expect(parseScript('Okruh nad, er.\n> **Okruh** nad $R$.')).toEqual([
      { say: 'Okruh nad, er.', show: '**Okruh** nad $R$.', para: 0 },
    ]);
  });

  it('starts a new paragraph after a blank line', () => {
    expect(parseScript('A.\nB.\n\nC.')).toEqual([
      { say: 'A.', show: 'A.', para: 0 },
      { say: 'B.', show: 'B.', para: 0 },
      { say: 'C.', show: 'C.', para: 1 },
    ]);
  });

  it('collapses multiple blank lines into a single paragraph break', () => {
    expect(parseScript('A.\n\n\n\nB.').map((r) => r.para)).toEqual([0, 1]);
  });

  it('ignores leading blank lines and # comments without making empty paragraphs', () => {
    expect(parseScript('\n\n# note\nA.\n# c\nB.')).toEqual([
      { say: 'A.', show: 'A.', para: 0 },
      { say: 'B.', show: 'B.', para: 0 },
    ]);
  });

  it('ignores a ">" line with no preceding sentence', () => {
    expect(parseScript('> orphan\nA.')).toEqual([{ say: 'A.', show: 'A.', para: 0 }]);
  });

  it('returns an empty array for empty or nullish input', () => {
    expect(parseScript('')).toEqual([]);
    expect(parseScript('   \n  ')).toEqual([]);
    expect(parseScript(null)).toEqual([]);
  });
});
