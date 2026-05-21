# Supabase setup

The app uses Supabase as its user/progress store. Sign-in is currently driven by **FIT ČVUT OAuth** (see the "Sign in with FIT" section in the main [README](../README.md)) — a server-side route mints a Supabase magic-link token for the FIT user. The username/password flow described below is still wired but hidden in the UI (toggle `SHOW_PASSWORD_LOGIN` / `SHOW_PASSWORD_SIGNUP` in `client/src/pages/LoginPage.jsx` and `SignupPage.jsx` to bring it back). Anonymous viewing is **not** supported — the client throws if the env vars are missing.

## 1. Create a Supabase project

1. Sign up at https://supabase.com and create a new project.
2. From **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Locally: `cp client/.env.local.example client/.env.local` and paste the values.
4. On Vercel: add both as project environment variables (Production + Preview).

The anon key is safe to ship in client builds. All access is gated by the RLS policies set up below.

## 2. Disable email confirmation (recommended)

The app signs users up with a synthetic email (`<username>@users.szzstudy.com`); the inbox never receives mail. Either:

- **Easiest**: in **Authentication → Providers → Email**, turn **off** "Confirm email", or
- Change the synthetic-email domain in `client/src/supabaseClient.js` to something you control and keep confirmation on.

## 3. Database schema

Run this in the Supabase SQL editor. Idempotent — safe to re-run.

```sql
-- profiles: one row per user, linked to auth.users via id.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  show_leaderboard boolean not null default false,
  exam_date date,
  created_at timestamptz not null default now()
);

-- For existing deployments, add the per-user exam-date column. The app falls back
-- to the EXAM_DATE constant in client/src/config/exam.js when this is null.
alter table public.profiles add column if not exists exam_date date;

-- question_progress: one row per (user, question).
create table if not exists public.question_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  practiced_count integer not null default 0,
  read_passively boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- Auto-create a profile row on signup, pulling username from user_metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 4. Row-level security

```sql
alter table public.profiles enable row level security;
alter table public.question_progress enable row level security;

-- Users see and edit their own rows.
drop policy if exists "profiles_self_read"  on public.profiles;
drop policy if exists "profiles_self_write" on public.profiles;
create policy "profiles_self_read"  on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_self_write" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "qp_self_read"   on public.question_progress;
drop policy if exists "qp_self_write"  on public.question_progress;
drop policy if exists "qp_self_insert" on public.question_progress;
create policy "qp_self_read"   on public.question_progress
  for select to authenticated using (user_id = auth.uid());
create policy "qp_self_insert" on public.question_progress
  for insert to authenticated with check (user_id = auth.uid());
create policy "qp_self_write"  on public.question_progress
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## 5. Optional: leaderboard

The app has a **Leaderboard** page (`/leaderboard`) that is empty unless your user has `profiles.show_leaderboard = true`. RLS gates this: users with the flag can read everyone's profile + progress; everyone else only sees themselves.

```sql
-- SECURITY DEFINER helper that bypasses RLS to avoid recursion.
create or replace function public.is_leaderboard_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select show_leaderboard from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_leaderboard_admin() from public;
grant execute on function public.is_leaderboard_admin() to authenticated;

drop policy if exists "leaderboard_admins_read_profiles" on public.profiles;
drop policy if exists "leaderboard_admins_read_progress" on public.question_progress;

create policy "leaderboard_admins_read_profiles" on public.profiles
  for select to authenticated using (public.is_leaderboard_admin());
create policy "leaderboard_admins_read_progress" on public.question_progress
  for select to authenticated using (public.is_leaderboard_admin());
```

To bootstrap yourself as admin after signing up:

```sql
update public.profiles set show_leaderboard = true where username = 'your-username';
```

## 6. Sign in + verify

1. Start the app (`npm run dev` locally, or open the Vercel URL).
2. Click **Sign in with FIT ČVUT** on `/login`. (If you've re-enabled password sign-up, `/signup` still works.)
3. Confirm a `profiles` row appeared in the Supabase Table Editor for your FIT username.
4. Practice a question — confirm a `question_progress` row gets inserted/updated.
