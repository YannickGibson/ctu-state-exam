# Audiobook narration scripts

Spoken-audio versions of each exam question, generated from text scripts by Piper TTS
(local, free, Czech voice `cs_CZ-jirka-medium`). The web app plays them with
sentence-level highlighting via the "Listen" button on the question detail page.

## Files

- Narration scripts: `data/audio/scripts/<QUESTION-ID>.txt` — committed (source of truth)
- Timing map:        `data/audio/<QUESTION-ID>.json` — committed, bundled into the API
- Audio:             `data/audio/<QUESTION-ID>.mp3` — gitignored, hosted on Supabase Storage
- Generator:         `node scripts/generate-audio.js <QUESTION-ID>`
- Uploader:          `node scripts/upload-audio.js <QUESTION-ID|all>`

## Script file format

A script is a list of sentences, **one sentence per line**. Each line is the **spoken**
text (what the TTS engine reads). It may be followed by a line starting with `>` giving
the **displayed** text for that sentence (the web transcript). With no `>` line, the
displayed text equals the spoken text.

A **blank line starts a new paragraph**. Group sentences that belong together (a
definition and the sentences elaborating it) into one paragraph, and separate distinct
concepts with a blank line — the player renders each paragraph as a spaced block, for
easier following. Lines starting with `#` are comments (ignored).

```
Dva nenulové prvky nazýváme dělitelé nuly, pokud je jejich součin roven nule.
> Dva nenulové prvky nazýváme **dělitelé nuly**, pokud je jejich součin roven nule.
Obor integrity je komutativní okruh, ve kterém dělitelé nuly nejsou.
> **Obor integrity** je komutativní okruh, ve kterém dělitelé nuly nejsou.

Těleso je okruh, kde každý nenulový prvek má inverzi.
> **Těleso** je okruh, kde každý nenulový prvek má inverzi.
```

- One line = one sentence = one highlightable, click-to-seek unit in the player.
- **No intro, no section titles.** Do not open with a sentence naming the question
  ("Otázka číslo 2...") and do not write standalone heading sentences ("Okruh.") — start
  straight into the content. The page already shows the question; paragraphs replace
  section headings.

## Rules for the SPOKEN line

The bare line is read aloud verbatim by a Czech speech engine — write only what should
be heard.

1. **Language: Czech.** Natural spoken sentences; prefer short over long.
2. **No formulas or math symbols.** Write every expression in words: `x²` → "iks na
   druhou", `pⁿ` → "pé na entou", `Σ aᵢxⁱ` → "součet koeficientů...".
3. **Consonant variables → Czech letter name:** `b→bé c→cé d→dé f→ef g→gé h→há j→jé
   k→ká l→el m→em n→en p→pé q→kvé r→er s→es t→té v→vé x→iks z→zet`. Greek → name.
4. **Vowel-letter variables (a, e, i, o, u, y): write the plain unaccented letter** —
   the engine reads `á` as "dlouhé á". If the name carries no meaning, reword it away.
5. **Wrap every variable mention in commas** for a clear pause: `množina, em, je ...`.
6. **Drop definition/theorem numbers** ("Definice 31.1") — state the concept directly.
7. **Acronyms read letter-by-letter:** space them — `AES` → "A E S".
8. **Length: aim for ~2–3 minutes** of audio across the whole script.

## Rules for the DISPLAYED (`>`) line

- Use real notation and inline LaTeX (`$...$`, rendered with KaTeX): `$M$`, `$R[x]$`,
  `$p^n$`, `$\mathrm{GF}(p^n)$`, `$P(x) = \sum_i a_i x^i$`.
- **Bold only the core terms the question itself names**, each at the single sentence
  where it is introduced and defined — `**term**`. Do not bold supporting or minor
  terms, and do not repeat the bold on later mentions.
- Correct capitalization and casing: `AES`, `GF` — not "a es", "gé ef".
- Add a `>` line whenever the displayed form differs from the spoken line — whether for
  notation or for bold.

## Generating and publishing

```
node scripts/generate-audio.js NI-SPOL-2     # synthesize -> writes .mp3 + .json
node scripts/upload-audio.js   NI-SPOL-2     # publish    -> uploads .mp3 to Supabase
```

`generate-audio.js` synthesizes each sentence separately (so its exact offset is known)
and writes `data/audio/<QID>.mp3` plus `data/audio/<QID>.json` (the timing map, with each
sentence's `para` index). Default speed is `LENGTH_SCALE=0.8`; override per run, e.g.
`LENGTH_SCALE=0.9 node scripts/generate-audio.js NI-SPOL-2` (higher = slower).

`upload-audio.js` pushes the `.mp3` to Supabase Storage (creating the bucket on first
run). Always run it after (re)generating, or the player will use stale audio.
`upload-audio.js all` pushes every generated `.mp3`.

## Hosting

- **Timing JSON** — committed to git, bundled into the `/api/questions/:id` response as
  the `audio` field. `vercel.json` `includeFiles` ships it to the serverless function.
- **MP3** — public Supabase Storage bucket `answer-audio`; the player builds the URL with
  `supabase.storage.from('answer-audio').getPublicUrl(...)`. Not in git, not in the
  Vercel bundle. Upload needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (in `.env`).
- The "Listen" button appears on a question only once its timing JSON is committed.

Piper binary and voice model live in `.tools/` (gitignored). If missing, re-fetch: Piper
release `2023.11.14-2` from github.com/rhasspy/piper, and voice `cs_CZ-jirka-medium`
(`.onnx` + `.onnx.json`) from HuggingFace `rhasspy/piper-voices` (`cs/cs_CZ/jirka/medium/`).
