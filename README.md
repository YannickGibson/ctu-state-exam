# ctu-state-exam

Self-hostable study webapp for Czech Technical University (ČVUT) state exam questions. Browse the question list, read tightly-cropped answers extracted from lecture PDFs (with deep links back to the source page for verification), and run subject-level quizzes.

**Currently bundled content**: NI (FIT) AI master's program 2026 — 20 shared (SPOL) questions + 22 Znalostní Inženýrství (ZI) specialization questions. The engine is content-pack-driven, so other CTU programs (or even non-CTU exams) can be added by replacing the markdown files under `data/answers/` and the question lists in `SPOL.md` / `ZI.md`.

## Stack

- **Frontend**: Vite + React, KaTeX for LaTeX rendering
- **Backend**: Express (locally) / Vercel serverless function (in production) — serves the question/answer/quiz APIs and the static PDFs
- **Auth**: FIT ČVUT OAuth 2.0 (Sign in with FIT) bridged into Supabase via a server-issued magic link — the user never sees a Supabase URL. Password sign-up is wired but currently hidden in the UI to avoid username collisions with FIT accounts.
- **Sync**: Supabase (per-user progress, optional leaderboard)
- **Deployment target**: Vercel Hobby tier

## Local development

The lecture PDFs under `sources/` live in a separate **private** submodule (because they're copyrighted by their instructors and can't be redistributed via this public repo). If you have access, clone with submodules; otherwise the app still runs — the `/pdfs/...` deep links from answers will just 404.

```sh
git clone --recurse-submodules https://github.com/YannickGibson/ctu-state-exam.git
# or, in an existing clone: git submodule update --init
npm run setup     # installs root + client deps, generates data/questions.json
cp client/.env.local.example client/.env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — see docs/supabase-setup.md
cp .env.example .env
# fill in FIT OAuth + Supabase service-role key — see "Sign in with FIT" below
npm run dev       # API on :3001, Vite on :5173 with HMR
```

For a production-mode local build (Express also serves the built frontend at :3001):

```sh
npm start
```

## Sign in with FIT

The deployed app uses **FIT ČVUT OAuth** as its primary (and currently only) sign-in. Any FIT account (student, teacher, employee) works. The server exchanges the FIT authorization code for a one-time Supabase magic-link token; the browser stays on this app's domain throughout, and no Supabase URL is ever shown to the user.

Forking? You need your own OAuth client. Go to https://auth.fit.cvut.cz/manager/, log in with FIT credentials, then:

1. Create a project, then a **Web Application** inside it.
2. Set the redirect URI to your deployed URL: `https://<your-domain>/api/auth/fit/callback`. For local dev, create a **second** Web Application with redirect `http://localhost:5173/api/auth/fit/callback` (FIT's manager allows only one redirect URI per app).
3. In the **Services** tab enable scope `urn:ctu:oauth:umapi.read` (self-serve, no admin approval needed — it only grants read access to the public CTU people directory).
4. Copy the `client_id` and `client_secret`.

These go into the server-side env vars below.

## Deploying to Vercel

1. Set up a Supabase project — see [`docs/supabase-setup.md`](./docs/supabase-setup.md).
2. Register a FIT OAuth Web Application — see "Sign in with FIT" above.
3. Push this repo to GitHub and import it on https://vercel.com.
4. In Vercel **Project Settings → Environment Variables**, add (Production + Preview):

   | Var | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_URL` | same as `VITE_SUPABASE_URL` (server-side read) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only, never exposed to the browser) |
   | `FIT_OAUTH_CLIENT_ID` | from AppsManager |
   | `FIT_OAUTH_CLIENT_SECRET` | from AppsManager |
   | `FIT_OAUTH_REDIRECT_URI` | `https://<your-domain>/api/auth/fit/callback` |
5. Deploy. The bundled `vercel.json` wires the Express app as a serverless function (`/api/*`) and serves the SPA + PDFs + answer screenshots as static assets.

In your Supabase project, go to **Authentication → URL Configuration** and add your Vercel domain to the allowlist.

## How it works

- `npm run generate` rebuilds `data/questions.json` from `SPOL.md` and `ZI.md` and creates any missing answer/quiz stub files. It never overwrites existing content.
- Pages: `/questions` (list with progress), `/questions/:id` (single question with answer + screenshots), `/quizzes` and `/quizzes/:subject` (multiple-choice quiz per subject), `/leaderboard` (opt-in).
- Per-question answers in `data/answers/<id>.md` are short Markdown documents that link out to cropped screenshots (`data/answers/imgs/<id>/…`) and deep-link into the merged lecture PDFs (`sources/.../X_Merged.pdf#page=N`).

## Editing or replacing content

Everything is plain files you can edit by hand or with AI:

- `SPOL.md`, `ZI.md` — the canonical question lists. Markdown tables; the columns are parsed by `scripts/generate-data.js`.
- `data/answers/<id>.md` — one Markdown file per question. Supports LaTeX (`$…$`, `$$…$$`). Keep answers dense and short.
- `data/answers/imgs/<id>/` — cropped screenshots referenced from the markdown.
- `data/quizzes/<subject>.json` — one quiz per subject. Each question has `prompt`, `choices`, `correctIndex`, `explanation`.
- `sources/` — merged lecture PDFs the answers cite. Forkers should drop in their own.

After editing question lists, run `npm run generate` to refresh `data/questions.json`.

## Progress rules

- `practicedCount` increments each time a question is practiced (unbounded). Finishing a subject's quiz increments it for every question of that subject.
- `readPassively` may be `true` only while `practicedCount` is `0`.
- In the list, the practiced badge shows its label only at count ≥ 2.

## Content licensing note

The code is MIT-licensed (see [`LICENSE`](./LICENSE)). The lecture PDFs the deployed app serves at `/pdfs/...` belong to their respective CTU instructors and are **not** redistributed by this public repo — they live in a private submodule at `sources/` that the Vercel build clones during deploy. If you fork this for a different program, point the submodule at your own private content repo (or remove the submodule and supply PDFs locally) and make sure you have the right to use whatever you bundle.

## License

MIT
