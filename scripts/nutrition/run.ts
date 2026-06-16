// Offline nutrition-resolution pipeline — CLI entry point.
//
//   npm run nutrition                       # dry-run, all recipes
//   npm run nutrition -- --only <slug>      # one recipe
//   npm run nutrition -- --limit 5          # first N recipes
//   npm run nutrition -- --no-llm           # deterministic only
//   npm run nutrition -- --refresh          # ignore the resolution cache
//   npm run nutrition -- --write            # actually write to Supabase
//
// Default is a dry-run report (old-vs-new diff + skipped/low-confidence list);
// nothing is written without --write. Recipes with any unresolved ingredient are
// reported but NOT written (partial totals would be wrong).

import "./load-env";

import type { RecipeNutrition } from "../../src/types";
import { fetchRecipes, writeNutrition } from "./db";
import { resolveIngredient, saveCache } from "./resolve";
import { convertToGrams } from "./convert";
import {
  aggregate,
  parseServes,
  perServing,
  type IngredientContribution,
  type NutritionTotals,
} from "./aggregate";
import { isLLMEnabled } from "./adjudicate";
import type { Source } from "./types";

interface Args {
  write: boolean;
  noLlm: boolean;
  refresh: boolean;
  only?: string;
  limit?: number;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { write: false, noLlm: false, refresh: false };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--write":
        a.write = true;
        break;
      case "--no-llm":
        a.noLlm = true;
        break;
      case "--refresh":
        a.refresh = true;
        break;
      case "--only":
        a.only = argv[++i];
        break;
      case "--limit":
        a.limit = Number.parseInt(argv[++i], 10);
        break;
    }
  }
  return a;
}

interface AuditEntry {
  ingredient: string;
  matched: string;
  source: Source;
  id: string;
  grams: number;
  confidence: number;
  needsReview: boolean;
}

const f = (n: number) => n.toFixed(n % 1 === 0 ? 0 : 1);

function diffLine(label: string, before: number | undefined, after: number) {
  const b = before === undefined ? "—" : f(before);
  return `${label} ${b}→${f(after)}`;
}

function dominantSource(audit: AuditEntry[]): Source {
  const counts = new Map<Source, number>();
  for (const a of audit) counts.set(a.source, (counts.get(a.source) ?? 0) + 1);
  let best: Source = "openfoodfacts";
  let max = -1;
  for (const [s, c] of counts) if (c > max) ((max = c), (best = s));
  return best;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  console.log(
    `\nNutrition pipeline — ${args.write ? "WRITE" : "dry-run"}; ` +
      `LLM ${args.noLlm ? "disabled (--no-llm)" : isLLMEnabled() ? "enabled" : "no key"}.`,
  );
  console.log("Fetching recipes from Supabase…");
  const recipes = await fetchRecipes({ only: args.only, limit: args.limit });
  console.log(
    `${recipes.length} recipe(s). Resolving ingredients ` +
      `(Open Food Facts is throttled ~6.5s/lookup, so this is slow on a cold cache)…\n`,
  );

  let written = 0;
  let skippedRecipes = 0;

  for (const r of recipes) {
    const data = (r.data ?? {}) as {
      ingredients?: [string, number, string][];
      serves?: string;
    };
    const ingredients = data.ingredients ?? [];
    const serves = data.serves;

    const contribs: IngredientContribution[] = [];
    const audit: AuditEntry[] = [];
    const skipped: string[] = [];

    console.log(
      `■ ${r.name}  (${r.slug}, serves ${parseServes(serves)}) — ${ingredients.length} ingredient(s)`,
    );

    for (const [name, quantity, unit] of ingredients) {
      // Print the name before resolving so the throttled OFF wait shows activity.
      process.stdout.write(`  • ${name} … `);
      const outcome = await resolveIngredient(name, {
        quantity,
        unit,
        noLlm: args.noLlm,
        refresh: args.refresh,
      });
      if (!outcome.ok) {
        console.log(`✗ ${outcome.reason}`);
        skipped.push(`${name} — ${outcome.reason}`);
        continue;
      }
      const res = outcome.resolution;
      const { grams, reason } = convertToGrams(quantity, unit, name, {
        servingGrams: res.servingGrams,
      });
      if (grams === null) {
        console.log(`✗ ${reason}`);
        skipped.push(`${name} — ${reason}`);
        continue;
      }
      console.log(
        `${res.displayName.slice(0, 42)} [${res.source}${res.needsReview ? " ⚠ review" : ""}] ${Math.round(grams)}g`,
      );
      contribs.push({ name, grams, per100g: res.per100g });
      audit.push({
        ingredient: name,
        matched: res.displayName,
        source: res.source as Source,
        id: res.id,
        grams: Math.round(grams),
        confidence: res.confidence,
        needsReview: res.needsReview ?? false,
      });
    }

    const totals: NutritionTotals = aggregate(contribs);
    const { yieldServings, total } = perServing(totals, serves);
    const prev = r.nutrition?.total;

    // Per-serving diff summary (per-ingredient results were printed inline).
    console.log(
      `  per serving: ` +
        [
          diffLine("kcal", prev?.calories, total.calories),
          diffLine("P", prev?.protein_g, total.protein_g),
          diffLine("C", prev?.carbs_g, total.carbs_g),
          diffLine("F", prev?.fat_g, total.fat_g),
          diffLine("Fib", prev?.fibre_g, total.fibre_g),
        ].join("  "),
    );

    const nutrition: RecipeNutrition = {
      yieldServings,
      total,
      source: dominantSource(audit),
      fetchedAt: new Date().toISOString(),
      raw: { ingredients: audit, skipped },
    };

    // Block writes on anything unverified: unresolved ingredients OR
    // low-confidence matches would corrupt the per-serving totals.
    const reviewCount = audit.filter((a) => a.needsReview).length;
    const blocked = skipped.length + reviewCount;
    if (blocked > 0) {
      console.log(
        `  ↳ not written (${skipped.length} unresolved, ${reviewCount} low-confidence)`,
      );
      skippedRecipes++;
    } else if (args.write) {
      await writeNutrition(r.id, nutrition);
      console.log(`  ↳ written ✓`);
      written++;
    }
    console.log("");
    saveCache(); // persist after every recipe so a crash never loses progress
  }

  saveCache();
  console.log(
    `Done. ${args.write ? `${written} written, ` : ""}` +
      `${skippedRecipes} recipe(s) had unresolved ingredients. Cache saved.`,
  );
}

main().catch((err) => {
  console.error(err);
  saveCache(); // don't lose resolved ingredients on an unexpected crash
  process.exit(1);
});
