import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { generateData, parseTable } from './generate-data.js';

// Builds a temp repo root with SPOL.md / ZI.md fixtures so generateData can
// run without touching the real data/ directory.
function makeRoot(spol, zi) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gendata-'));
  fs.writeFileSync(path.join(root, 'SPOL.md'), spol);
  fs.writeFileSync(path.join(root, 'ZI.md'), zi);
  return root;
}

const SPOL = `# Společné otázky

| ID | Subject | Question |
|----|---------|----------|
| NI-SPOL-1 | NI-SPOL | First shared question |
| NI-SPOL-2 | NI-SPOL | Second shared question |

random prose that should be ignored
| not a question row |
`;

const ZI = `# ZI otázky

| NI-ZI-1 | NI-ZI | First ZI question |
| NI-ADM-1 | NI-ADM | An ADM question |
`;

let root;
afterEach(() => {
  if (root) fs.rmSync(root, { recursive: true, force: true });
  root = undefined;
  vi.restoreAllMocks();
});
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('parseTable', () => {
  it('parses only well-formed question rows, ignoring headers and prose', () => {
    root = makeRoot(SPOL, ZI);
    const rows = parseTable(root, 'SPOL.md', 'SPOL');
    expect(rows.map((r) => r.id)).toEqual(['NI-SPOL-1', 'NI-SPOL-2']);
    expect(rows[0]).toMatchObject({ subject: 'NI-SPOL', group: 'SPOL', text: 'First shared question' });
  });
});

describe('generateData — question parsing (#13)', () => {
  it('parses every question with no dropped or duplicated ids', () => {
    root = makeRoot(SPOL, ZI);
    const { questions } = generateData(root, { quiet: true });

    const ids = questions.map((q) => q.id);
    expect(ids).toEqual(['NI-SPOL-1', 'NI-SPOL-2', 'NI-ZI-1', 'NI-ADM-1']);
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
  });

  it('derives number, subjectCode and a per-subject subjectIndex', () => {
    root = makeRoot(SPOL, ZI);
    const { questions } = generateData(root, { quiet: true });

    const spol = questions.filter((q) => q.subject === 'NI-SPOL');
    expect(spol.map((q) => q.subjectIndex)).toEqual([1, 2]);
    expect(spol[0]).toMatchObject({ number: 1, subjectCode: 'SPOL', group: 'SPOL' });
    expect(questions.find((q) => q.id === 'NI-ADM-1')).toMatchObject({
      subjectCode: 'ADM',
      subjectIndex: 1,
    });
  });

  it('writes questions.json to disk', () => {
    root = makeRoot(SPOL, ZI);
    generateData(root, { quiet: true });
    const onDisk = JSON.parse(
      fs.readFileSync(path.join(root, 'data', 'questions.json'), 'utf8')
    );
    expect(onDisk).toHaveLength(4);
  });
});

describe('generateData — re-run preserves existing files', () => {
  it('does not overwrite an edited answer file (#14)', () => {
    root = makeRoot(SPOL, ZI);
    generateData(root, { quiet: true }); // creates stubs

    const answerPath = path.join(root, 'data', 'answers', 'NI-SPOL-1.md');
    const edited = '# My real answer\n\nHand-written content.\n';
    fs.writeFileSync(answerPath, edited);

    generateData(root, { quiet: true }); // re-run

    expect(fs.readFileSync(answerPath, 'utf8')).toBe(edited);
  });

  it('keeps edited progress.json entries and only adds defaults for new ids (#15)', () => {
    root = makeRoot(SPOL, ZI);
    generateData(root, { quiet: true });

    const progressPath = path.join(root, 'data', 'progress.json');
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    progress['NI-SPOL-1'] = { readPassively: true, practicedCount: 99 };
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));

    // Re-run with an extra question added to ZI.md.
    fs.appendFileSync(path.join(root, 'ZI.md'), '| NI-ZI-2 | NI-ZI | New question |\n');
    generateData(root, { quiet: true });

    const after = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    expect(after['NI-SPOL-1']).toEqual({ readPassively: true, practicedCount: 99 });
    expect(after['NI-ZI-2']).toEqual({ readPassively: false, practicedCount: 0 });
  });

  it('does not overwrite an edited quiz file', () => {
    root = makeRoot(SPOL, ZI);
    generateData(root, { quiet: true });

    const quizPath = path.join(root, 'data', 'quizzes', 'NI-SPOL.json');
    const edited = JSON.stringify({ subject: 'NI-SPOL', title: 'real quiz', questions: [] });
    fs.writeFileSync(quizPath, edited);

    generateData(root, { quiet: true });

    expect(fs.readFileSync(quizPath, 'utf8')).toBe(edited);
  });
});
