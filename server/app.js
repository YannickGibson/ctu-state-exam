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
const crypto = require('crypto');
const ws = require('ws');
const { createClient } = require('@supabase/supabase-js');

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

/*
 * FIT ČVUT OAuth 2.0 sign-in.
 *
 * Flow: /start → auth.fit.cvut.cz → /callback → magic-link token_hash → /auth/fit/complete
 * (client-side verifyOtp). The browser never sees a Supabase URL.
 */
const FIT_AUTHORIZE = 'https://auth.fit.cvut.cz/oauth/authorize';
const FIT_TOKEN = 'https://auth.fit.cvut.cz/oauth/token';
const FIT_CHECK_TOKEN = 'https://auth.fit.cvut.cz/oauth/check_token';
const FIT_SCOPE = 'urn:ctu:oauth:umapi.read';
const STATE_COOKIE = 'fit_oauth_state';

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const m = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function fitBasicAuth() {
  return 'Basic ' + Buffer.from(
    `${process.env.FIT_OAUTH_CLIENT_ID}:${process.env.FIT_OAUTH_CLIENT_SECRET}`
  ).toString('base64');
}

function supabaseAdmin() {
  // Lazy: only construct when route is hit, so missing env vars don't crash boot.
  // `realtime.transport: ws` — Node 20 has no native WebSocket; Supabase's
  // RealtimeClient is initialised eagerly by createClient and needs one.
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: ws },
    }
  );
}

function completeRedirect(res, params) {
  const qs = new URLSearchParams(params).toString();
  return res.redirect('/auth/fit/complete?' + qs);
}

app.get('/api/auth/fit/start', (req, res) => {
  if (!process.env.FIT_OAUTH_CLIENT_ID || !process.env.FIT_OAUTH_REDIRECT_URI) {
    return res.status(500).send('FIT OAuth not configured on server.');
  }
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000,
    path: '/',
  });
  const url = new URL(FIT_AUTHORIZE);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', process.env.FIT_OAUTH_CLIENT_ID);
  url.searchParams.set('redirect_uri', process.env.FIT_OAUTH_REDIRECT_URI);
  url.searchParams.set('scope', FIT_SCOPE);
  url.searchParams.set('state', state);
  res.redirect(url.toString());
});

app.get('/api/auth/fit/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) return completeRedirect(res, { error: String(error) });

    const expected = readCookie(req, STATE_COOKIE);
    res.clearCookie(STATE_COOKIE, { path: '/' });
    if (!code || !state || !expected || state !== expected) {
      return completeRedirect(res, { error: 'state_mismatch' });
    }

    const tokenRes = await fetch(FIT_TOKEN, {
      method: 'POST',
      headers: {
        Authorization: fitBasicAuth(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: process.env.FIT_OAUTH_REDIRECT_URI,
      }),
    });
    if (!tokenRes.ok) {
      console.error('FIT token exchange failed:', await tokenRes.text());
      return completeRedirect(res, { error: 'token_exchange_failed' });
    }
    const { access_token } = await tokenRes.json();

    const checkRes = await fetch(
      FIT_CHECK_TOKEN + '?token=' + encodeURIComponent(access_token),
      { method: 'POST', headers: { Authorization: fitBasicAuth() } }
    );
    if (!checkRes.ok) {
      console.error('FIT check_token failed:', await checkRes.text());
      return completeRedirect(res, { error: 'introspection_failed' });
    }
    const info = await checkRes.json();
    const username = info.user_name;
    if (!username) return completeRedirect(res, { error: 'no_username' });

    const email = `${username}@fit.cvut.cz`;
    const admin = supabaseAdmin();

    // Lookup-then-create avoids brittle string-matching on "already exists" errors.
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) {
      console.error('Supabase listUsers failed:', listErr);
      return completeRedirect(res, { error: 'user_create_failed' });
    }
    const existing = list.users.find((u) => u.email === email);

    if (!existing) {
      const { error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { username, source: 'fit_oauth' },
      });
      if (createErr) {
        console.error('Supabase createUser failed:', createErr);
        return completeRedirect(res, { error: 'user_create_failed' });
      }
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error('Supabase generateLink failed:', linkErr);
      return completeRedirect(res, { error: 'link_generation_failed' });
    }

    return completeRedirect(res, { token_hash: linkData.properties.hashed_token });
  } catch (err) {
    console.error('FIT callback error:', err);
    return completeRedirect(res, { error: 'unexpected' });
  }
});

module.exports = app;
