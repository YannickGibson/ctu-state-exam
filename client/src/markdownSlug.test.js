import { describe, it, expect } from 'vitest';
import { slugify } from './markdownSlug.js';

describe('slugify', () => {
  it('lowercases and collapses spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips Czech diacritics', () => {
    expect(slugify('Úvod do předmětu')).toBe('uvod-do-predmetu');
    expect(slugify('Časová řada jako náhodný proces')).toBe('casova-rada-jako-nahodny-proces');
  });

  it('treats underscores like word separators (for BML lecture filenames)', () => {
    expect(slugify('BML Lecture 1 - Uvod_do_modelovani-KD')).toBe(
      'bml-lecture-1-uvod-do-modelovani-kd'
    );
  });

  it('drops punctuation around section titles', () => {
    expect(slugify('Téma 4: Operátor $B$, ARIMA(p,d,q)')).toBe('tema-4-operator-b-arima-p-d-q');
  });

  it('collapses runs of hyphens and trims them', () => {
    expect(slugify('--Sekce 3 — Anchor jump cíl--')).toBe('sekce-3-anchor-jump-cil');
  });
});
