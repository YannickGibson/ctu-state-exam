// Static content (questions, answers, quizzes) comes from the Express backend.
// Per-user progress lives in Supabase (table `question_progress`).

import { supabase } from './supabaseClient.js';

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const getQuestions = () => request('/api/questions');
export const getQuestion = (id) => request(`/api/questions/${encodeURIComponent(id)}`);
export const getQuizzes = () => request('/api/quizzes');
export const getQuiz = (subject) => request(`/api/quizzes/${encodeURIComponent(subject)}`);

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

// Mirrors the rules from the old server (progressFor invariant):
//  - practicedCount is an integer >= 0
//  - readPassively can only be true while practicedCount === 0
export async function patchProgress(id, action) {
  const userId = await currentUserId();
  const current = await getProgressFor(id);
  let next;
  if (action === 'practice') {
    next = { readPassively: false, practicedCount: current.practicedCount + 1 };
  } else if (action === 'readPassively') {
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

// Finishing a subject quiz: increment practiced_count for every question of that subject.
export async function completeQuiz(subject) {
  const userId = await currentUserId();
  const questions = await getQuestions();
  const subjectIds = questions.filter((q) => q.subject === subject).map((q) => q.id);
  if (subjectIds.length === 0) throw new Error('unknown subject');

  const { data: existing, error: selErr } = await supabase
    .from('question_progress')
    .select('question_id, practiced_count')
    .eq('user_id', userId)
    .in('question_id', subjectIds);
  if (selErr) throw selErr;
  const byId = new Map((existing || []).map((r) => [r.question_id, r.practiced_count]));

  const now = new Date().toISOString();
  const rows = subjectIds.map((qid) => ({
    user_id: userId,
    question_id: qid,
    practiced_count: (byId.get(qid) || 0) + 1,
    read_passively: false,
    updated_at: now,
  }));
  const { error } = await supabase
    .from('question_progress')
    .upsert(rows, { onConflict: 'user_id,question_id' });
  if (error) throw error;
  return { subject, updated: subjectIds };
}
