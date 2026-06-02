// Static content (questions, answers, quizzes) comes from the Express backend.
// Per-user progress lives in Supabase (table `question_progress`).

import { supabase } from './supabaseClient.js';

async function request(url, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Questions, answers and quizzes are static for the lifetime of a session, so
// memoize each GET by URL. The promise itself is cached, so concurrent callers
// (and React StrictMode's double effect) share a single request. A rejected
// request is evicted so a later call can retry instead of replaying the error.
const contentCache = new Map();

function cachedRequest(url) {
  const hit = contentCache.get(url);
  if (hit) return hit;
  const promise = request(url).catch((err) => {
    contentCache.delete(url);
    throw err;
  });
  contentCache.set(url, promise);
  return promise;
}

// Drop every cached content response — used on sign-out so the next user
// starts from a clean slate.
export function clearContentCache() {
  contentCache.clear();
}

export const getQuestions = () => cachedRequest('/api/questions');
export const getQuestion = (id) => cachedRequest(`/api/questions/${encodeURIComponent(id)}`);
export const getQuizzes = () => cachedRequest('/api/quizzes');
export const getQuiz = (subject) => cachedRequest(`/api/quizzes/${encodeURIComponent(subject)}`);
// Private committee analysis — gated server-side to the allowlisted usernames.
export const getCommittee = () => cachedRequest('/api/committee');

const ZERO = { practicedCount: 0, readPassively: false };

function rowToProgress(row) {
  if (!row) return ZERO;
  const practicedCount = Math.max(0, Number(row.practiced_count) || 0);
  return {
    practicedCount,
    readPassively: practicedCount === 0 && Boolean(row.read_passively),
  };
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Not signed in.');
  return data.user.id;
}

// Returns { [question_id]: { practicedCount, readPassively } } for the signed-in user.
// Missing rows are treated as zeros at read time.
export async function getProgress() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('question_progress')
    .select('question_id, practiced_count, read_passively')
    .eq('user_id', userId);
  if (error) throw error;
  const out = {};
  for (const row of data || []) {
    out[row.question_id] = rowToProgress(row);
  }
  return out;
}

export async function getProgressFor(questionId) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('question_progress')
    .select('practiced_count, read_passively')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle();
  if (error) throw error;
  return rowToProgress(data);
}

// Progress mutation rules:
//  - practicedCount is an integer in [0, cap] (cap enforced by the RPC)
//  - readPassively can only be true while practicedCount === 0
//  - "practice" goes through the bump_practiced RPC for an atomic, capped
//    increment (no read-modify-write race); "readPassively" and "reset" are
//    plain absolute writes.
export async function patchProgress(id, action) {
  if (action === 'practice') {
    const { data, error } = await supabase.rpc('bump_practiced', {
      p_question_ids: [id],
    });
    if (error) throw error;
    return { id, progress: rowToProgress((data || [])[0]) };
  }

  const userId = await currentUserId();
  const current = await getProgressFor(id);
  let next;
  if (action === 'readPassively') {
    next = {
      readPassively: current.practicedCount === 0,
      practicedCount: current.practicedCount,
    };
  } else if (action === 'reset') {
    next = { readPassively: false, practicedCount: 0 };
  } else {
    throw new Error('unknown action');
  }
  const { error } = await supabase.from('question_progress').upsert(
    {
      user_id: userId,
      question_id: id,
      practiced_count: next.practicedCount,
      read_passively: next.readPassively,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,question_id' }
  );
  if (error) throw error;
  return { id, progress: next };
}

// Leaderboard: cumulative practice events per user, descending.
// RLS gates access — non-admins receive empty arrays from both selects.
export async function getLeaderboard() {
  const [{ data: profiles, error: pErr }, { data: rows, error: rErr }] =
    await Promise.all([
      supabase.from('profiles').select('id, username'),
      supabase
        .from('question_progress')
        .select('user_id, question_id, practiced_count, updated_at')
        .gt('practiced_count', 0),
    ]);
  if (pErr) throw pErr;
  if (rErr) throw rErr;

  const byUser = new Map();
  for (const r of rows || []) {
    if (!byUser.has(r.user_id)) byUser.set(r.user_id, []);
    byUser.get(r.user_id).push(r);
  }

  return (profiles || [])
    .map((p) => {
      const userRows = byUser.get(p.id) || [];
      const score = userRows.reduce((s, r) => s + r.practiced_count, 0);
      return {
        userId: p.id,
        username: p.username,
        score,
        questionsCount: userRows.length,
        rows: userRows,
      };
    })
    .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username));
}

// Finishing a quiz: bump practiced_count for the specified question ids via
// the atomic, capped bump_practiced RPC. If no ids are passed, falls back to
// every question of the subject.
export async function completeQuiz(subject, questionIds) {
  let ids = questionIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    const questions = await getQuestions();
    ids = questions.filter((q) => q.subject === subject).map((q) => q.id);
  }
  if (ids.length === 0) throw new Error('no questions to mark');

  const { error } = await supabase.rpc('bump_practiced', { p_question_ids: ids });
  if (error) throw error;
  return { subject, updated: ids };
}
