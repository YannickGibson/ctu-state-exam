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
const audioDir = path.join(dataDir, 'audio');

// Private committee analysis: ONE JSON read from the sources/ submodule. This is
// safe despite the header note — that warning is specifically about
// `express.static(sources/)`, which makes the file tracer bundle the whole
// 189 MB dir. A single readFileSync of one declared file (see vercel.json
// `includeFiles`) only pulls in that file. Served by handleGetCommittee, gated
// to the two allowlisted usernames below.
const committeeFile = path.join(root, 'sources', 'committee', 'committee-2026.json');
// Authorize by the server-set, confirmation-protected email. FIT OAuth creates
// each user with email = <fit-username>@fit.cvut.cz (see the callback handler),
// and Supabase email changes require confirming a link sent to the NEW address,
// so an attacker cannot claim these. Do NOT gate on user_metadata — the client
// can rewrite it via supabase.auth.updateUser and spoof the allowlist.
const COMMITTEE_ALLOW_EMAILS = ['gibsoyan@fit.cvut.cz', 'kvasvojt@fit.cvut.cz'];

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

// Content routes — gated by requireAuth (declared below `supabaseAdmin`).
// Defined as plain handlers here; the middleware is wired further down the file
// so the helpers it depends on are already in scope at request time.
const handleListQuestions = (req, res) => {
  res.json(loadQuestions());
};

const handleGetQuestion = (req, res) => {
  const key = req.params.id;
  const q = loadQuestions().find((x) => x.id === key || x.slug === key);
  if (!q) return res.status(404).json({ error: 'question not found' });
  let answer = null;
  try {
    answer = fs.readFileSync(path.join(answersDir, q.id + '.md'), 'utf8');
  } catch {
    answer = null;
  }
  // The narration timing map (data/audio/<id>.json) is bundled inline when it
  // exists; the client uses it to drive the "Listen" player. The MP3 itself is
  // hosted separately on Supabase Storage.
  let audio = null;
  try {
    audio = JSON.parse(fs.readFileSync(path.join(audioDir, q.id + '.json'), 'utf8'));
  } catch {
    audio = null;
  }
  res.json({ ...q, answer, audio });
};

const handleListQuizzes = (req, res) => {
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
};

const handleGetQuiz = (req, res) => {
  const quiz = readJSON(path.join(quizzesDir, req.params.subject + '.json'), null);
  if (!quiz) return res.status(404).json({ error: 'quiz not found' });
  res.json(quiz);
};

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

function defaultSupabaseAdmin() {
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

// Swappable so tests can inject a fake admin client (vi.mock cannot intercept
// the require() of @supabase/supabase-js from this CommonJS module).
let supabaseAdminFactory = defaultSupabaseAdmin;
function supabaseAdmin() {
  return supabaseAdminFactory();
}
app.setSupabaseAdminFactory = (fn) => {
  supabaseAdminFactory = fn;
};

function completeRedirect(res, params) {
  const qs = new URLSearchParams(params).toString();
  return res.redirect('/auth/fit/complete?' + qs);
}

/*
 * Auth gate.
 *
 * Accepts the Supabase access token from either:
 *   - `Authorization: Bearer <jwt>` — used by the SPA's fetch() calls
 *   - `sb_access_token` cookie       — used by browser-initiated loads (<img>,
 *                                      <embed>) that cannot set headers
 *
 * Verification goes through Supabase so revoked / expired tokens are rejected.
 */
const SESSION_COOKIE = 'sb_access_token';

function extractToken(req) {
  const header = req.headers.authorization || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (m) return m[1];
  return readCookie(req, SESSION_COOKIE);
}

async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const { data, error } = await supabaseAdmin().auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'invalid_token' });
    }
    req.user = data.user;
    next();
  } catch (err) {
    console.error('requireAuth error:', err);
    return res.status(401).json({ error: 'auth_failed' });
  }
}

// Exposed so server/index.js can reuse the same gate for the static mounts
// (/pdfs, /answer-imgs) without duplicating verification logic.
app.requireAuth = requireAuth;

function isCommitteeAllowed(user) {
  const email = (user && typeof user.email === 'string' ? user.email : '').toLowerCase();
  return COMMITTEE_ALLOW_EMAILS.includes(email);
}

// Private committee analysis — authed AND on the email allowlist.
async function handleGetCommittee(req, res) {
  if (!isCommitteeAllowed(req.user)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const data = readJSON(committeeFile, null);
  if (!data) return res.status(404).json({ error: 'committee data not found' });
  res.json(data);
}

app.get('/api/questions', requireAuth, handleListQuestions);
app.get('/api/questions/:id', requireAuth, handleGetQuestion);
app.get('/api/quizzes', requireAuth, handleListQuizzes);
app.get('/api/quizzes/:subject', requireAuth, handleGetQuiz);
app.get('/api/committee', requireAuth, handleGetCommittee);

/*
 * Session cookie sync.
 *
 * The SPA holds the Supabase access token in memory / localStorage, but
 * <img>/<embed> loads can't send Authorization headers. So whenever the SPA's
 * Supabase session changes, it POSTs the token here to mirror it into an
 * httpOnly cookie that browser-initiated loads pick up automatically.
 */
app.post('/api/auth/session', async (req, res) => {
  const token = req.body && req.body.access_token;
  if (typeof token !== 'string' || !token) {
    return res.status(400).json({ error: 'missing_access_token' });
  }
  try {
    const { data, error } = await supabaseAdmin().auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'invalid_token' });
    }
  } catch (err) {
    console.error('session verify failed:', err);
    return res.status(401).json({ error: 'auth_failed' });
  }
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,
    path: '/',
  });
  res.json({ ok: true });
});

app.delete('/api/auth/session', (req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
});

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
