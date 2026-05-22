import { describe, it, expect } from 'vitest';
import { MAX_PRACTICED } from './config/limits.js';
import { ZERO, optimisticProgress, bumpPracticed } from './progressCache.js';

describe('optimisticProgress — "practice"', () => {
  it('increments the practiced count and clears the passive-read flag', () => {
    expect(optimisticProgress({ practicedCount: 1, readPassively: false }, 'practice'))
      .toEqual({ practicedCount: 2, readPassively: false });
    expect(optimisticProgress({ practicedCount: 0, readPassively: true }, 'practice'))
      .toEqual({ practicedCount: 1, readPassively: false });
  });

  it('caps the count at MAX_PRACTICED', () => {
    const next = optimisticProgress(
      { practicedCount: MAX_PRACTICED, readPassively: false },
      'practice'
    );
    expect(next.practicedCount).toBe(MAX_PRACTICED);
  });

  it('treats missing current progress as zero', () => {
    expect(optimisticProgress(undefined, 'practice'))
      .toEqual({ practicedCount: 1, readPassively: false });
  });
});

describe('optimisticProgress — "readPassively"', () => {
  it('sets the flag while the question is unpracticed', () => {
    expect(optimisticProgress(ZERO, 'readPassively'))
      .toEqual({ practicedCount: 0, readPassively: true });
  });

  it('refuses to set the flag once practicedCount > 0', () => {
    expect(optimisticProgress({ practicedCount: 2, readPassively: false }, 'readPassively'))
      .toEqual({ practicedCount: 2, readPassively: false });
  });
});

describe('optimisticProgress — "reset"', () => {
  it('zeroes both fields regardless of current state', () => {
    expect(optimisticProgress({ practicedCount: 3, readPassively: false }, 'reset'))
      .toEqual(ZERO);
  });

  it('throws on an unknown action', () => {
    expect(() => optimisticProgress(ZERO, 'bogus')).toThrow('unknown action');
  });
});

describe('bumpPracticed', () => {
  it('bumps every given id and clears the passive-read flag', () => {
    const next = bumpPracticed(
      { A: { practicedCount: 1, readPassively: false }, B: { practicedCount: 0, readPassively: true } },
      ['A', 'B', 'C']
    );
    expect(next).toEqual({
      A: { practicedCount: 2, readPassively: false },
      B: { practicedCount: 1, readPassively: false },
      C: { practicedCount: 1, readPassively: false },
    });
  });

  it('caps each bumped count at MAX_PRACTICED', () => {
    const next = bumpPracticed({ A: { practicedCount: MAX_PRACTICED, readPassively: false } }, ['A']);
    expect(next.A.practicedCount).toBe(MAX_PRACTICED);
  });

  it('does not mutate the input map and tolerates empty ids', () => {
    const input = { A: { practicedCount: 1, readPassively: false } };
    const next = bumpPracticed(input, undefined);
    expect(input).toEqual({ A: { practicedCount: 1, readPassively: false } });
    expect(next).not.toBe(input);
    expect(next).toEqual(input);
  });
});
