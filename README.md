# ctu-state-exams

Self-hostable study webapp for Czech Technical University (ČVUT) state exam questions. Browse the question list, read tightly-cropped answers extracted from lecture PDFs (with deep links back to the source page for verification), and run subject-level quizzes.

**Currently bundled content**: NI (FIT) AI master's program 2026 — 20 shared (SPOL) questions + 22 Znalostní Inženýrství (ZI) specialization questions. The engine is content-pack-driven, so other CTU programs (or even non-CTU exams) can be added by replacing the markdown files under `data/answers/` and the question lists in `SPOL.md` / `ZI.md`.

## Stack

- **Frontend**: Vite + React, KaTeX for LaTeX rendering
- **Backend**: Express (locally) / Vercel serverless function (in production) — serves the question/answer/quiz APIs and the static PDFs
- **Auth + sync**: Supabase (username/password, per-user progress, optional leaderboard)
- **Deployment target**: Vercel Hobby tier

## Local development

```sh
npm run setup     # installs root + client deps, generates data/questions.json
cp client/.env.local.example client/.env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — see docs/supabase-setup.md
npm run dev       # API on :3001, Vite on :5173 with HMR
```

For a production-mode local build (Express also serves the built frontend at :3001):

```sh
npm start
```

## Deploying to Vercel

1. Set up a Supabase project — see [`docs/supabase-setup.md`](./docs/supabase-setup.md).
2. Push this repo to GitHub and import it on https://vercel.com.
3. In Vercel **Project Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Production + Preview).
4. Deploy. The bundled `vercel.json` wires the Express app as a serverless function (`/api/*`) and serves the SPA + PDFs + answer screenshots as static assets.

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

The code is MIT-licensed (see [`LICENSE`](./LICENSE)). The lecture PDFs bundled under `sources/` belong to their respective CTU instructors and are included only for personal/educational study by other CTU students. If you fork this for a different program, replace them with materials you have the right to redistribute (or gitignore `sources/` and have users supply their own locally).

## License

MIT
