import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { SUBJECT_HUES, subjectHue } from './subjects.js';

const questions = JSON.parse(
  readFileSync(new URL('../../../data/questions.json', import.meta.url), 'utf8')
);

describe('subjectHue', () => {
  it('returns the mapped hue for known subject codes', () => {
    expect(subjectHue('MPI')).toBe(SUBJECT_HUES.MPI);
    expect(subjectHue('SCR')).toBe(SUBJECT_HUES.SCR);
  });

  it('falls back to a stable hue in [0,360) for unknown codes', () => {
    const hue = subjectHue('XYZ');
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
    expect(subjectHue('XYZ')).toBe(hue); // deterministic
  });

  it('handles missing/empty codes without throwing', () => {
    expect(subjectHue(undefined)).toBe(0);
    expect(subjectHue('')).toBe(0);
  });

  it('has a hue for every subject code used in questions.json', () => {
    const codes = [...new Set(questions.map((q) => q.subjectCode))];
    for (const code of codes) {
      expect(SUBJECT_HUES, `missing hue for ${code}`).toHaveProperty(code);
    }
  });

  it('keeps every mapped hue distinct and within [0,360)', () => {
    const hues = Object.values(SUBJECT_HUES);
    expect(new Set(hues).size).toBe(hues.length);
    for (const h of hues) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });
});
