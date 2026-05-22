import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './auth/AuthContext.jsx';
import { clearContentCache, completeQuiz, getProgress, patchProgress } from './api.js';
import { ZERO, bumpPracticed, optimisticProgress } from './progressCache.js';

// In-memory, authoritative cache of the signed-in user's progress map
// ({ [questionId]: { practicedCount, readPassively } }). The whole map is
// fetched once after login via the single bulk `getProgress()` query, then
// served synchronously so navigating between questions never re-queries the
// database (and the status colours never flicker).

const ProgressCtx = createContext(null);

export function ProgressProvider({ children }) {
  const { session, ready } = useAuth();
  const userId = session?.user?.id ?? null;

  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Which user's progress is loaded / loading. Guards against a duplicate
  // fetch (React StrictMode runs effects twice) and against a stale response
  // landing after the user switched.
  const loadedFor = useRef(null);

  const load = useCallback((uid) => {
    setLoading(true);
    setError(null);
    getProgress()
      .then((map) => {
        if (loadedFor.current === uid) setProgress(map);
      })
      .catch((e) => {
        if (loadedFor.current === uid) setError(e.message);
      })
      .finally(() => {
        if (loadedFor.current === uid) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      // Signed out: drop the progress map and the static content cache so the
      // next user starts clean.
      loadedFor.current = null;
      setProgress({});
      setLoading(false);
      setError(null);
      clearContentCache();
      return;
    }
    if (loadedFor.current === userId) return;
    loadedFor.current = userId;
    setProgress({});
    load(userId);
  }, [ready, userId, load]);

  const reload = useCallback(() => {
    if (userId) load(userId);
  }, [userId, load]);

  const progressFor = useCallback((id) => progress[id] || ZERO, [progress]);

  // Optimistic progress mutation: show the new state immediately, then
  // reconcile with the server (or roll back on failure). The caller decides
  // how to surface a thrown error.
  const markProgress = useCallback(
    async (id, action) => {
      const prev = progress[id] || ZERO;
      let optimistic;
      try {
        optimistic = optimisticProgress(prev, action);
      } catch {
        return;
      }
      setProgress((p) => ({ ...p, [id]: optimistic }));
      try {
        const { progress: next } = await patchProgress(id, action);
        setProgress((p) => ({ ...p, [id]: next }));
      } catch (e) {
        setProgress((p) => ({ ...p, [id]: prev }));
        throw e;
      }
    },
    [progress]
  );

  // Finish a quiz, then fold the capped +1 bump into the cache so the table
  // and detail views reflect it without a refetch.
  const completeQuizCached = useCallback(async (subject, ids) => {
    const result = await completeQuiz(subject, ids);
    setProgress((p) => bumpPracticed(p, result.updated));
    return result;
  }, []);

  const value = useMemo(
    () => ({
      progress,
      loading,
      error,
      progressFor,
      markProgress,
      completeQuizCached,
      reload,
    }),
    [progress, loading, error, progressFor, markProgress, completeQuizCached, reload]
  );

  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
