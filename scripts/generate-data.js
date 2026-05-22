#!/usr/bin/env node
/*
 * Generates the file-based database from SPOL.md and ZI.md.
 *
 *   data/questions.json   - always regenerated from the markdown tables
 *   data/progress.json    - created if missing; existing entries are kept
 *   data/answers/<id>.md  - stub created if missing; existing files untouched
 *   data/quizzes/<sub>.json - stub created if missing; existing files untouched
 *
 * Run:  node scripts/generate-data.js
 *
 * The core logic is exported as generateData(root) so it can be exercised
 * against a fixture directory in tests.
 */
const fs = require('fs');
const path = require('path');

function parseTable(root, file, group) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const rows = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*(NI-[A-Z]+-\d+)\s*\|\s*(NI-[A-Z]+)\s*\|\s*(.+?)\s*\|\s*$/);
    if (m) rows.push({ id: m[1], group, subject: m[2], text: m[3] });
  }
  return rows;
}

function buildQuestions(raw) {
  const subjectCounts = {};
  return raw.map((q) => {
    const number = parseInt(q.id.split('-').pop(), 10);
    const subjectCode = q.subject.replace(/^NI-/, '');
    subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    return {
      id: q.id,
      group: q.group,
      number,
      subject: q.subject,
      subjectCode,
      subjectIndex: subjectCounts[q.subject],
      text: q.text,
    };
  });
}

function generateData(root, { quiet = false } = {}) {
  const log = quiet ? () => {} : console.log;
  const dataDir = path.join(root, 'data');
  const answersDir = path.join(dataDir, 'answers');
  const quizzesDir = path.join(dataDir, 'quizzes');

  const raw = [
    ...parseTable(root, 'SPOL.md', 'SPOL'),
    ...parseTable(root, 'ZI.md', 'ZI'),
  ];
  const questions = buildQuestions(raw);

  fs.mkdirSync(answersDir, { recursive: true });
  fs.mkdirSync(quizzesDir, { recursive: true });

  fs.writeFileSync(
    path.join(dataDir, 'questions.json'),
    JSON.stringify(questions, null, 2) + '\n'
  );
  log(`questions.json: ${questions.length} questions`);

  // progress.json - keep existing, add defaults for any new ids
  const progressPath = path.join(dataDir, 'progress.json');
  let progress = {};
  if (fs.existsSync(progressPath)) {
    try { progress = JSON.parse(fs.readFileSync(progressPath, 'utf8')); } catch {}
  }
  for (const q of questions) {
    if (!progress[q.id]) progress[q.id] = { readPassively: false, practicedCount: 0 };
  }
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2) + '\n');
  log(`progress.json: ${Object.keys(progress).length} entries`);

  // answer stubs
  let answerStubs = 0;
  for (const q of questions) {
    const p = path.join(answersDir, q.id + '.md');
    if (fs.existsSync(p)) continue;
    const stub = `# ${q.text}

> _Answer not written yet._

Stub for **${q.id}** (${q.subject}). Edit this file to add the answer.

Supports Markdown and LaTeX: inline \`$a^2 + b^2 = c^2$\` and display:

$$\\int_0^1 x^2 \\,dx = \\tfrac{1}{3}$$
`;
    fs.writeFileSync(p, stub);
    answerStubs++;
  }
  log(`answers/: ${answerStubs} stub file(s) created`);

  // quiz stubs - one per subject
  const subjects = [];
  const seen = new Set();
  for (const q of questions) {
    if (seen.has(q.subject)) continue;
    seen.add(q.subject);
    subjects.push({ subject: q.subject, subjectCode: q.subjectCode, group: q.group });
  }
  let quizStubs = 0;
  for (const s of subjects) {
    const p = path.join(quizzesDir, s.subject + '.json');
    if (fs.existsSync(p)) continue;
    const quiz = {
      subject: s.subject,
      subjectCode: s.subjectCode,
      group: s.group,
      title: `${s.subjectCode} quiz`,
      questions: [
        {
          prompt: `Placeholder question for ${s.subject}. Replace with real content.`,
          choices: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
          explanation: 'Explanation for the correct answer goes here.',
        },
      ],
    };
    fs.writeFileSync(p, JSON.stringify(quiz, null, 2) + '\n');
    quizStubs++;
  }
  log(`quizzes/: ${quizStubs} stub file(s) created (${subjects.length} subjects)`);

  return { questions, progress, answerStubs, quizStubs, subjects };
}

module.exports = { generateData, parseTable, buildQuestions };

if (require.main === module) {
  generateData(path.join(__dirname, '..'));
}
