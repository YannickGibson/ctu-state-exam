/*
 * Express app: API + static mounts. Used by:
 *   - server/index.js (local dev — wraps in app.listen)
 *   - api/index.js   (Vercel serverless function)
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

// Local-dev static mounts. On Vercel these are unused — sources/ and
// data/answers/imgs/ are copied into client/dist at build time and served
// straight by Vercel's static layer.
app.use('/pdfs', express.static(path.join(root, 'sources')));
app.use('/answer-imgs', express.static(path.join(answersDir, 'imgs')));

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

// Serve the built frontend in local prod mode (npm start). On Vercel the
// static layer handles this before the function is ever invoked.
const dist = path.join(root, 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

module.exports = app;
