import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, usernameToEmail } from '../supabaseClient.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, username, show_leaderboard, exam_date')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      ready,
      async signUp(username, password) {
        const { data, error } = await supabase.auth.signUp({
          email: usernameToEmail(username),
          password,
          options: { data: { username } },
        });
        if (error) throw error;
        return data;
      },
      async signIn(username, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameToEmail(username),
          password,
        });
        if (error) throw error;
        return data;
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      async setExamDate(value) {
        if (!session) throw new Error('Not signed in');
        const next = value === '' ? null : value;
        const { error } = await supabase
          .from('profiles')
          .update({ exam_date: next })
          .eq('id', session.user.id);
        if (error) throw error;
        setProfile((p) => (p ? { ...p, exam_date: next } : p));
      },
    }),
    [session, profile, ready]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
