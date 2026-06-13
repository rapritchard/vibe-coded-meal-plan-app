# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page React + TypeScript app: a personal meal-planning tool for a low-fat
post-gallbladder-surgery recovery diet (referred to in code as "Phase 1"). It is a
small household app (a couple sharing one Supabase project), not a multi-tenant
product. Domain vocabulary is baked into the types: `moods` (cravings), `effort`
levels, `timeKey` emoji buckets, `goodOnTheGo`, and `isBatch` (cook-once/leftovers).

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b (project refs) then vite build
npm run typecheck    # tsc --noEmit on the root config (see caveat below)
npm run preview      # serve the production build

npm run lint         # ESLint (flat config, eslint.config.js)
npm run format       # Prettier --write across the repo
npm run format:check # Prettier --check (CI-friendly)
npm test             # Vitest unit tests (jsdom)
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright smoke test (auto-starts dev server)
```

- **Correctness gate caveat:** `npm run typecheck` runs `tsc --noEmit` against the
  root `tsconfig.json`, which has `files: []` + project references, so in non-build
  mode it checks almost nothing. **Use `npx tsc -b` (what `build` runs) to actually
  typecheck `src`.** Run `tsc -b`, `lint`, and `test` after changes.
- Vitest specs are co-located as `*.test.ts` under `src/`; the global setup is
  `src/test/setup.ts`. Playwright specs live in `e2e/` and run against a
  localStorage-only dev server (empty Supabase env vars), so they need no secrets.
- Path alias: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig`).
- Env: `.env.local` holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
  When either is missing, `supabase` is `null` and the app runs in
  localStorage-only mode (see Data layer below) — so it boots without any backend.
- Deploys to Netlify/Vercel as an SPA (both configs rewrite all routes to
  `index.html`).

## Architecture

### The recipe catalog is one discriminated union

`src/types/index.ts` defines `AnyRecipe = Recipe | SmoothieRecipe | Snack | Dessert`,
all extending `RecipeBase` and discriminated by a `type` field. This union is the
spine of the app — the catalog, filtering, and persistence all operate on it.
`Recipe` is the only fully-featured cooking type; the others are lighter.

### Data layer: Supabase is source of truth, localStorage is a cache

As of v1.5 the catalog lives in the Supabase `recipes` table, **not** in the repo
(`src/data/recipes.ts` keeps only style-lookup maps and non-recipe content like
principles/flavour-tools/kitchen-tools). The table has denormalised columns plus a
`data` jsonb blob. `src/lib/recipes-supabase.ts` maps both directions:

- `rowToAnyRecipe` / `anyRecipeToRow` — top-level columns are `id, slug, type,
  category, name, moods, effort, is_batch, good_on_the_go, nutrition`; **everything
  else lives in `data` jsonb**.
- **When adding a field to a recipe type, update three places together**: the
  interface in `types/index.ts`, the `rowToAnyRecipe` reader (with a default), and
  (if it's a new top-level column) `anyRecipeToRow` + its key-exclusion list.

### Cache-first persistence pattern

`lib/cached-store.ts` provides the shared helpers — `readCache`, `writeCache`,
`loadCached` (try Supabase, refresh cache on success, fall back on error/offline),
and `mutateCachedMap` (optimistic per-item update). `recipes-supabase.ts`,
`lib/ratings.ts`, and `lib/notes.ts` are built on these (raw localStorage). The
pattern in all three:

1. A `read*CacheSync()` reads localStorage synchronously so the UI boots instantly.
2. `loadCached` tries Supabase, refreshes the cache on success, falls back otherwise.
3. Writes are optimistic: `mutateCachedMap` first, then fire-and-forget the Supabase
   upsert (failures only warn in console).

Ratings/notes are keyed `${type}:${id}` (`RecipeType` in `lib/recipe-types.ts`),
stored as `(item_type, item_id)` columns in Supabase. `lib/app-state.ts` follows the
same idea but uses the async `lib/storage.ts` adapter (which swaps between
`localStorage` and a Claude-artifact `window.storage` — legacy from the app's origin
as an artifact), so it does not use the `cached-store` helpers.

The `recipes-supabase.ts` jsonb `data` blobs are validated per type with **zod**
(each field has a `.catch` fallback), so a malformed row degrades to defaults instead
of crashing the catalog load. Shared category/effort ordering + labels live once in
`lib/taxonomy.ts` (`CATEGORY_ORDER`, `CATEGORY_LABELS`, `EFFORT_ORDER`, `MEAL_OPTIONS`).

### State & navigation (TanStack Router)

`main.tsx` creates the router and wraps the `RouterProvider` in four context
providers: `AuthProvider`, `RatingsProvider`, `NotesProvider`, and `AppDataProvider`
(`hooks/use-app-data.tsx`). Route components can't take props, so app data — the
catalog (`allItems`/`recipes`), `customWeek`, `customSaved`, `customShoppingList`,
and their mutators — is read via `useAppData()`, not prop-drilled. (There is no more
`App.tsx`; the old root layout now lives in `routes/__root.tsx`.)

Routing is **file-based** (`src/routes/`), generated into `src/routeTree.gen.ts` by
`@tanstack/router-plugin` (configured in `vite.config.ts`; the gen file is committed
and excluded from lint/format). Routes: `/` (Overview), `/meal-plan`, `/recipes`,
`/recipes/$slug` (deep-linkable recipe modal — cooking recipes only), `/kitchen`,
`/shopping`, `/review`.

The `/recipes` route holds **all filter state in the URL** as zod-validated search
params (`features/recipes/search.ts`: `meal`, `moods[]`, `effort[]`, `leftovers`,
`onTheGo`, `q`). The "Food" sidebar entries (Breakfast, Lunch, …) are still not
separate views — they are `<Link>`s to `/recipes?meal=<category>`. `/shopping` keeps
its active week in a `?week=` search param. Sidebar active-state logic lives in
`components/layout/nav-config.ts` (`isNavItemActive`).

### Auth

Supabase magic-link (OTP) with PKCE flow (`hooks/use-auth.tsx`). Access is gated by
RLS on the Supabase side (allowlist). On `SIGNED_IN`, a one-time-per-device
`migrateLocalToSupabaseIfNeeded()` (`lib/migration.ts`) pushes any legacy
localStorage ratings/notes/app-state into Supabase, gated by a sentinel flag.

### Folder conventions

- `src/routes/` — thin route components; they read data via `useAppData()` and render
  feature components. This is the entry layer for each screen.
- `src/features/<feature>/` — feature UI in a `components/` subfolder (some still have
  a `*Tab.tsx` orchestrator, e.g. `ShoppingTab`). Features: dashboard, recipes,
  shopping, stores, review, plus card-only kinds (smoothies, snacks, desserts) which
  render through the unified catalog via `RecipeListItem`'s type dispatcher.
- `src/components/ui/` — shadcn/ui primitives over Radix (don't hand-edit unless
  intentionally customizing).
- `src/components/shared/` — cross-feature presentational pieces (NutritionPanel,
  StarRating, StepList, etc.).
- `src/components/layout/` — header, sidebar, mobile bar, nav-config.
- `src/data/` — static content only: curated week plans + shopping data
  (`shoppingLists.ts`), and style/lookup maps + non-recipe content (`recipes.ts`).
  The custom-week logic + persistence live in `src/lib/shopping.ts` (not in `data/`).
- Large UI is decomposed by presentation: e.g. `features/recipes/components/filters/`
  holds `FilterBar` (orchestrator) → `DesktopFilters` + `MobileFilterSheet` over a
  shared `FilterControlsProps`.

### Styling

Tailwind with shadcn-style HSL CSS variables (`src/index.css`, `tailwind.config.ts`);
warm stone/neutral palette, Georgia serif. Per-category and per-week color tokens are
kept as string maps in the data files (`WEEK_COLORS`, `TIME_COLORS`, `TAG_STYLES`)
rather than inline.
