/*
 * Express app: API routes only. Used by:
 *   - server/index.js (local dev — adds static mounts + frontend fallback, then listens)
 *   - api/index.js   (Vercel serverless function — only the /api/* surface)
 *
 * IMPORTANT: do NOT reference sources/ or data/answers/imgs/ from this file.
 * Vercel's file tracer follows `express.static(...)` paths and bundles whatever
 * they resolve to into the function — which blew past the 300 MB limit when
 * sources/ (189 MB) was reachable from here.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const answersDir = path.join(dataDir, 'answers');
const quizzesDir = path.join(dataDir, 'quizzes');

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

const loadQuestions = () => readJSON(path.join(dataDir, 'questions.json'), []);

const app = express();
app.use(express.json());

app.get('/api/questions', (req, res) => {
  res.json(loadQuestions());
});

app.get('/api/questions/:id', (req, res) => {
  const q = loadQuestions().find((x) => x.id === req.params.id);
  if (!q) return res.status(404).json({ error: 'question not found' });
  let answer = null;
  try {
    answer = fs.readFileSync(path.join(answersDir, q.id + '.md'), 'utf8');
  } catch {
    answer = null;
  }
  res.json({ ...q, answer });
});

app.get('/api/quizzes', (req, res) => {
  const list = [];
  const seen = new Set();
  for (const q of loadQuestions()) {
    if (seen.has(q.subject)) continue;
    seen.add(q.subject);
    const quiz = readJSON(path.join(quizzesDir, q.subject + '.json'), null);
    list.push({
      subject: q.subject,
      subjectCode: q.subjectCode,
      group: q.group,
      title: (quiz && quiz.title) || `${q.subjectCode} quiz`,
      questionCount: quiz && Array.isArray(quiz.questions) ? quiz.questions.length : 0,
    });
  }
  res.json(list);
});

app.get('/api/quizzes/:subject', (req, res) => {
  const quiz = readJSON(path.join(quizzesDir, req.params.subject + '.json'), null);
  if (!quiz) return res.status(404).json({ error: 'quiz not found' });
  res.json(quiz);
});

module.exports = app;
