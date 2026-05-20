import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to client/.env.local.'
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Username is not native to Supabase Auth (which is email-based), so we synthesise
// a deterministic email. The domain must use a real TLD or Supabase's email validator
// rejects it (e.g. `.local` is reserved by RFC 6762 and treated as invalid).
export const usernameToEmail = (username) => `${username}@users.szzstudy.com`;
