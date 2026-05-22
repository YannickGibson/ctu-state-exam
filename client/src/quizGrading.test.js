import { describe, it, expect } from 'vitest';
import {
  normalize,
  normalizeList,
  textIsCorrect,
  partIsCorrect,
} from './quizGrading.js';

describe('normalize (#10)', () => {
  it('lowercases, strips all whitespace and NFKC-normalizes', () => {
    expect(normalize('  Hello   World ')).toBe('helloworld');
    expect(normalize('ABC')).toBe('abc');
    expect(normalize('ﬁnd')).toBe('find'); // NFKC: ligature -> letters
    expect(normalize('ｆｏｏ')).toBe('foo'); // NFKC: full-width -> ASCII
  });

  it('treats null and undefined as empty strings', () => {
    expect(normalize(null)).toBe('');
    expect(normalize(undefined)).toBe('');
    expect(normalize(0)).toBe('0');
  });
});

describe('normalizeList (#10)', () => {
  it('is order-independent and drops empty entries', () => {
    expect(normalizeList('b, a, c')).toBe('a,b,c');
    expect(normalizeList('c,b,a')).toBe('a,b,c');
    expect(normalizeList('a,,b')).toBe('a,b');
    expect(normalizeList('  ')).toBe('');
  });
});

describe('textIsCorrect (#11)', () => {
  it('compares scalar answers case- and whitespace-insensitively', () => {
    const part = { kind: 'text', correctAnswer: 'Binary Tree' };
    expect(textIsCorrect(part, 'binary tree')).toBe(true);
    expect(textIsCorrect(part, '  BINARYTREE ')).toBe(true);
    expect(textIsCorrect(part, 'linked list')).toBe(false);
  });

  it('compares list answers ignoring order when compare === "list"', () => {
    const part = { kind: 'text', compare: 'list', correctAnswer: 'alpha, beta, gamma' };
    expect(textIsCorrect(part, 'gamma, alpha, beta')).toBe(true);
    expect(textIsCorrect(part, 'alpha, beta')).toBe(false);
  });

  it('without compare:list, a reordered list does not match', () => {
    const part = { kind: 'text', correctAnswer: 'a, b' };
    expect(textIsCorrect(part, 'b, a')).toBe(false);
  });
});

describe('partIsCorrect (#11)', () => {
  it('matches a choice part on exact correctIndex', () => {
    const part = { kind: 'choice', correctIndex: 2 };
    expect(partIsCorrect(part, 2)).toBe(true);
    expect(partIsCorrect(part, 1)).toBe(false);
    expect(partIsCorrect(part, undefined)).toBe(false);
  });

  it('delegates text parts to textIsCorrect', () => {
    const part = { kind: 'text', correctAnswer: 'NP' };
    expect(partIsCorrect(part, 'np')).toBe(true);
    expect(partIsCorrect(part, 'p')).toBe(false);
  });
});
