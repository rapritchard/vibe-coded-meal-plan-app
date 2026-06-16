// Audit (and optionally rewrite) stored recipes to UK ingredient terminology.
//
//   npx tsx scripts/recipes/uk-variants.ts                 # dry-run audit
//   npx tsx scripts/recipes/uk-variants.ts --spelling      # also US→UK spellings
//   npx tsx scripts/recipes/uk-variants.ts --write         # apply
//
// Dry-run by default: prints every proposed change (recipe, field, before→after).
// Replacements are word-boundary + case-preserving, applied to ingredient names
// and free-text fields (steps/tip/variations/desc) across all recipe types.

import "../nutrition/load-env";

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
}
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// US → UK food terms. Order: longest/most-specific first so "all-purpose flour"
// wins before any "flour" rule. Keys are matched case-insensitively with word
// boundaries; the replacement's case follows the matched text.
const FOOD: [string, string][] = [
  ["all-purpose flour", "plain flour"],
  ["all purpose flour", "plain flour"],
  ["powdered sugar", "icing sugar"],
  ["confectioners sugar", "icing sugar"],
  ["confectioner's sugar", "icing sugar"],
  ["superfine sugar", "caster sugar"],
  ["heavy whipping cream", "double cream"],
  ["heavy cream", "double cream"],
  ["light cream", "single cream"],
  ["half-and-half", "single cream"],
  ["baking soda", "bicarbonate of soda"],
  ["green onions", "spring onions"],
  ["green onion", "spring onion"],
  ["scallions", "spring onions"],
  ["scallion", "spring onion"],
  ["garbanzo beans", "chickpeas"],
  ["garbanzos", "chickpeas"],
  ["garbanzo", "chickpea"],
  ["ground beef", "beef mince"],
  ["ground pork", "pork mince"],
  ["ground turkey", "turkey mince"],
  ["ground lamb", "lamb mince"],
  ["napa cabbage", "chinese leaf"],
  ["bok choy", "pak choi"],
  ["bok choi", "pak choi"],
  ["snow peas", "mangetout"],
  ["cilantro", "coriander"],
  ["eggplants", "aubergines"],
  ["eggplant", "aubergine"],
  ["zucchinis", "courgettes"],
  ["zucchini", "courgette"],
  ["arugula", "rocket"],
  ["cornstarch", "cornflour"],
  ["shrimp", "prawns"],
  ["molasses", "black treacle"],
  ["beets", "beetroot"],
  ["beet", "beetroot"],
  ["popsicles", "ice lollies"],
  ["popsicle", "ice lolly"],
  ["skillet", "frying pan"],
  ["broiler", "grill"],
  ["broil", "grill"],
];

// US → UK spellings (only applied with --spelling).
const SPELLING: [string, string][] = [
  ["flavorings", "flavourings"],
  ["flavoring", "flavouring"],
  ["flavored", "flavoured"],
  ["flavors", "flavours"],
  ["flavor", "flavour"],
  ["colors", "colours"],
  ["colored", "coloured"],
  ["coloring", "colouring"],
  ["color", "colour"],
  ["caramelized", "caramelised"],
  ["caramelize", "caramelise"],
  ["caramelizing", "caramelising"],
  ["fibers", "fibres"],
  ["fiber", "fibre"],
  ["liters", "litres"],
  ["liter", "litre"],
  ["grams", "grams"], // no-op guard; UK uses grams too
];

function matchCase(sample: string, replacement: string): string {
  if (sample === sample.toUpperCase() && /[A-Z]/.test(sample)) {
    return replacement.toUpperCase();
  }
  if (sample[0] === sample[0]?.toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function applyRules(
  text: string,
  rules: [string, string][],
): { text: string; hits: [string, string][] } {
  let out = text;
  const hits: [string, string][] = [];
  for (const [us, uk] of rules) {
    const re = new RegExp(`\\b${us.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    out = out.replace(re, (m) => {
      const repl = matchCase(m, uk);
      hits.push([m, repl]);
      return repl;
    });
  }
  return { text: out, hits };
}

interface Row {
  id: string;
  slug: string;
  name: string;
  type: string;
  data: Record<string, unknown> | null;
}

async function main() {
  const write = process.argv.includes("--write");
  const rules = process.argv.includes("--spelling")
    ? [...FOOD, ...SPELLING]
    : FOOD;

  const { data, error } = await supabase
    .from("recipes")
    .select("id, slug, name, type, data")
    .order("slug");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];

  console.log(
    `\nUK-variant ${write ? "WRITE" : "audit (dry-run)"} — ${rows.length} recipes; ` +
      `${rules.length} rules${process.argv.includes("--spelling") ? " (incl. spellings)" : ""}\n`,
  );

  // Free-text fields that may contain prose (per recipe type they vary).
  const TEXT_FIELDS = ["desc", "tip"];
  const TEXT_ARRAYS = ["steps", "variations", "parallelTasks"];

  let changedRecipes = 0;
  const termTotals = new Map<string, number>();

  for (const r of rows) {
    const d = { ...(r.data ?? {}) } as Record<string, unknown>;
    const changes: string[] = [];

    // Top-level recipe title (its own column, not in `data`).
    const nameResult = applyRules(r.name, rules);
    let newName: string | null = null;
    if (nameResult.hits.length) {
      newName = nameResult.text;
      changes.push(`  name: "${r.name}" → "${newName}"`);
      nameResult.hits.forEach(([u]) =>
        termTotals.set(u.toLowerCase(), (termTotals.get(u.toLowerCase()) ?? 0) + 1),
      );
    }

    // Ingredient names: tuples [name, qty, unit] or string[] (smoothies).
    if (Array.isArray(d.ingredients)) {
      d.ingredients = (d.ingredients as unknown[]).map((ing) => {
        if (Array.isArray(ing) && typeof ing[0] === "string") {
          const { text, hits } = applyRules(ing[0], rules);
          if (hits.length) {
            changes.push(`  ingredient: "${ing[0]}" → "${text}"`);
            hits.forEach(([u]) => termTotals.set(u.toLowerCase(), (termTotals.get(u.toLowerCase()) ?? 0) + 1));
            return [text, ing[1], ing[2]];
          }
          return ing;
        }
        if (typeof ing === "string") {
          const { text, hits } = applyRules(ing, rules);
          if (hits.length) {
            changes.push(`  ingredient: "${ing}" → "${text}"`);
            hits.forEach(([u]) => termTotals.set(u.toLowerCase(), (termTotals.get(u.toLowerCase()) ?? 0) + 1));
            return text;
          }
          return ing;
        }
        return ing;
      });
    }

    for (const f of TEXT_FIELDS) {
      if (typeof d[f] === "string") {
        const { text, hits } = applyRules(d[f] as string, rules);
        if (hits.length) {
          changes.push(`  ${f}: ${hits.map(([u, k]) => `${u}→${k}`).join(", ")}`);
          hits.forEach(([u]) => termTotals.set(u.toLowerCase(), (termTotals.get(u.toLowerCase()) ?? 0) + 1));
          d[f] = text;
        }
      }
    }
    for (const f of TEXT_ARRAYS) {
      if (Array.isArray(d[f])) {
        d[f] = (d[f] as unknown[]).map((s) => {
          if (typeof s !== "string") return s;
          const { text, hits } = applyRules(s, rules);
          if (hits.length) {
            changes.push(`  ${f}: ${hits.map(([u, k]) => `${u}→${k}`).join(", ")}`);
            hits.forEach(([u]) => termTotals.set(u.toLowerCase(), (termTotals.get(u.toLowerCase()) ?? 0) + 1));
          }
          return text;
        });
      }
    }

    if (changes.length) {
      changedRecipes++;
      console.log(`■ ${r.name} (${r.slug}) [${r.type}]`);
      console.log(changes.join("\n"));
      if (write) {
        const payload: Record<string, unknown> = { data: d };
        if (newName) payload.name = newName;
        const { error: upErr } = await supabase
          .from("recipes")
          .update(payload)
          .eq("id", r.id);
        if (upErr) throw new Error(`update ${r.slug}: ${upErr.message}`);
        console.log("  ↳ written ✓");
      }
      console.log("");
    }
  }

  console.log("Term frequency:");
  for (const [t, n] of [...termTotals.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(22)} ${n}`);
  }
  console.log(
    `\n${changedRecipes} recipe(s) ${write ? "updated" : "would change"}.` +
      (write ? "" : "  Re-run with --write to apply."),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
