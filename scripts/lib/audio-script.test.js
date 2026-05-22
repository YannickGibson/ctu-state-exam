import { describe, it, expect } from 'vitest';
import { parseScript } from './audio-script.js';

describe('parseScript', () => {
  it('treats each non-blank line as a sentence, with show defaulting to say', () => {
    expect(parseScript('Okruh.\nTěleso.')).toEqual([
      { say: 'Okruh.', show: 'Okruh.' },
      { say: 'Těleso.', show: 'Těleso.' },
    ]);
  });

  it('applies a ">" line as the display override of the preceding sentence', () => {
    expect(parseScript('Okruh nad, er.\n> Okruh nad $R$.')).toEqual([
      { say: 'Okruh nad, er.', show: 'Okruh nad $R$.' },
    ]);
  });

  it('ignores blank lines and # comments', () => {
    expect(parseScript('# section\n\nOkruh.\n\n# note\nTěleso.')).toEqual([
      { say: 'Okruh.', show: 'Okruh.' },
      { say: 'Těleso.', show: 'Těleso.' },
    ]);
  });

  it('ignores a ">" line with no preceding sentence', () => {
    expect(parseScript('> orphan\nOkruh.')).toEqual([
      { say: 'Okruh.', show: 'Okruh.' },
    ]);
  });

  it('ignores an empty ">" line, keeping show equal to say', () => {
    expect(parseScript('Okruh.\n>')).toEqual([{ say: 'Okruh.', show: 'Okruh.' }]);
  });

  it('returns an empty array for empty, whitespace-only, or nullish input', () => {
    expect(parseScript('')).toEqual([]);
    expect(parseScript('   \n  ')).toEqual([]);
    expect(parseScript(null)).toEqual([]);
    expect(parseScript(undefined)).toEqual([]);
  });
});
