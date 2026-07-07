# Nutrition pipeline

Offline CLI tool that computes per-serving nutrition for every cooking recipe and
writes it back to Supabase (`recipes.nutrition`). It runs from the command line —
it is **not** part of the app bundle — and is the counterpart to the in-app manual
entry (`src/components/shared/NutritionSection.tsx`), which stays the human
override surface for anything this tool can't resolve.

## Run it

```bash
npm run nutrition                      # dry-run: per-recipe old-vs-new diff report
npm run nutrition -- --only <slug>     # one recipe
npm run nutrition -- --limit 5         # first N recipes
npm run nutrition -- --no-llm          # deterministic only (skip Gemini)
npm run nutrition -- --refresh         # ignore the resolution cache
npm run nutrition -- --write           # actually write to Supabase

npm run nutrition:cofid -- <CoFID.xlsx>  # one-off: build data/cofid.json (see data/README.md)
```

Dry-run is the default; nothing is written without `--write`. A recipe is only
written when **every** ingredient resolves confidently — any unresolved or
low-confidence ingredient blocks the whole recipe (a partial total would be
wrong) and is listed in the report for manual entry instead.

## How it works

Per ingredient: **normalise → resolve (cache → CoFID/supplemental → OFF) →
adjudicate (optional LLM) → convert to grams → aggregate per serving → report →
write**. Steps 1, 4, 5 are pure code; only adjudication uses the network/LLM, and
it is skippable.

- **CoFID first.** Whole foods resolve against the bundled UK CoFID dataset
  (`data/cofid.json`) plus a small curated supplemental table; CoFID matches are
  boosted so a real food beats an Open Food Facts snack that merely shares a word.
- **Open Food Facts** is only queried for branded/specialty items CoFID lacks
  (throttled, with backoff). When CoFID already has a strong match the OFF call is
  skipped entirely.
- **Gemini** (`gemini-3.1-flash-lite`, AI Studio free tier) only adjudicates
  genuinely ambiguous matches, and only when `GEMINI_API_KEY` is set. Without a
  key — or when the free-tier daily quota is exhausted — it falls back to the
  top-scored candidate and flags it for review. The free tier is 500 requests/day;
  the resolution cache keeps a full run well under that.
- **Resolution cache** (`cache.json`, committed) stores confident matches so each
  unique ingredient is resolved once. It is saved after every recipe, so a crash
  or network drop never loses progress; re-runs resume from it.

## Files

| File | Role |
|------|------|
| `run.ts` | CLI entry / orchestrator: fetch recipes, resolve, report, write |
| `resolve.ts` | cache → CoFID/supplemental → OFF → LLM/deterministic decision |
| `cofid.ts` | CoFID + supplemental lookup with a base-segment fuzzy scorer |
| `build-cofid.ts` | one-off `.xlsx` → `data/cofid.json` converter |
| `off.ts` | Open Food Facts client (throttle, User-Agent, retry/backoff) |
| `adjudicate.ts` | optional Gemini structured adjudication (no-op without key) |
| `convert.ts` | name normalisation, US→UK aliases, unit→grams conversion |
| `aggregate.ts` | per-100g × grams summing + per-serving maths |
| `db.ts` | Supabase service-role read/write (`recipes` table) |
| `load-env.ts` | loads `.env.local` before env-reading modules (import first) |
| `types.ts` | shared pipeline types |
| `*.test.ts` | Vitest unit tests for the pure modules (`convert`, `aggregate`, `cofid`) |
| `data/cofid.json` | committed UK CoFID dataset (generated once; see `data/README.md`) |
| `cache.json` | committed resolution cache (grows per run) |

## Setup

Reads from `.env.local`:

- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — required (admin write access).
- `GEMINI_API_KEY` — optional; enables LLM adjudication of ambiguous matches.

Generate `data/cofid.json` once before the first run — see `data/README.md`.
