import { describe, it, expect } from 'vitest';
import {
  normalizeBlockquoteMath,
  splitTopLevelPages,
  findTargetPage,
} from './markdownPrep.js';

describe('normalizeBlockquoteMath', () => {
  it('lifts a $$ math block out of a blockquote when fences straddle it', () => {
    const input = [
      '> Some intro text',
      '> $$',
      'f(y|x, \\theta) = h(x, y)',
      '$$',
      '>',
      '> kde \\eta = ...',
    ].join('\n');
    const out = normalizeBlockquoteMath(input);
    // Both fences become bare $$ and the body line is unchanged.
    expect(out).toContain('\n$$\nf(y|x, \\theta) = h(x, y)\n$$\n');
    // The trailing blockquote line is preserved.
    expect(out).toContain('> kde \\eta = ...');
  });

  it('leaves prose blockquotes untouched when no math is present', () => {
    const input = '> just a quote\n> another line';
    expect(normalizeBlockquoteMath(input)).toBe(input);
  });
});

describe('splitTopLevelPages', () => {
  it('starts a new page at every top-level # heading', () => {
    const md = '# Page 1\nbody one\n\n# Page 2\nbody two\n\n## still page 2\nx';
    const pages = splitTopLevelPages(md);
    expect(pages).toHaveLength(2);
    expect(pages[0]).toContain('# Page 1');
    expect(pages[1]).toContain('## still page 2');
  });

  it('does NOT split on `#` inside fenced code blocks', () => {
    const md = '# Real\n```\n# this is a python comment\n```\nbody';
    const pages = splitTopLevelPages(md);
    expect(pages).toHaveLength(1);
  });
});

describe('findTargetPage', () => {
  const pages = [
    '# Intro\nblah',
    '# BML Lecture 1\n## Bayes\nbody',
    '# BML Lecture 2\n## Linear\nbody',
  ];

  it('resolves #page=N (1-indexed) to the page array index', () => {
    expect(findTargetPage(pages, 'page=1')).toBe(0);
    expect(findTargetPage(pages, 'page=3')).toBe(2);
  });

  it('clamps an out-of-range page number to the last page', () => {
    expect(findTargetPage(pages, 'page=99')).toBe(2);
  });

  it('resolves a slug to the page whose heading matches', () => {
    expect(findTargetPage(pages, 'bml-lecture-2')).toBe(2);
  });

  it('matches a heading slug nested under a top-level page', () => {
    expect(findTargetPage(pages, 'bayes')).toBe(1);
  });

  it('returns 0 when nothing matches', () => {
    expect(findTargetPage(pages, 'nonexistent')).toBe(0);
  });
});
