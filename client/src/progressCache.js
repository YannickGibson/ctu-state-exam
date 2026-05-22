// Pure progress-cache transforms — no React, no Supabase, so they can be
// unit-tested directly. These mirror the mutation rules enforced server-side
// by api.js and the `bump_practiced` RPC:
//  - practicedCount is an integer in [0, MAX_PRACTICED]
//  - readPassively can only be true while practicedCount === 0

import { MAX_PRACTICED } from './config/limits.js';

export const ZERO = { practicedCount: 0, readPassively: false };

// One capped practice increment, clearing the passive-read flag.
function bumpOne(current) {
  const prev = current || ZERO;
  return {
    readPassively: false,
    practicedCount: Math.min(prev.practicedCount + 1, MAX_PRACTICED),
  };
}

// The progress to show immediately for an action, before the server responds.
// Throws on an unknown action so callers can skip the optimistic update.
export function optimisticProgress(current, action) {
  const prev = current || ZERO;
  if (action === 'practice') {
    return bumpOne(prev);
  }
  if (action === 'readPassively') {
    return {
      readPassively: prev.practicedCount === 0,
      practicedCount: prev.practicedCount,
    };
  }
  if (action === 'reset') {
    return { ...ZERO };
  }
  throw new Error(`unknown action: ${action}`);
}

// Apply a capped practice bump to many question ids at once (used after a quiz
// is finished). Returns a new map; the input map is never mutated.
export function bumpPracticed(map, ids) {
  const next = { ...map };
  for (const id of ids || []) {
    next[id] = bumpOne(next[id]);
  }
  return next;
}
