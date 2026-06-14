import { useState } from "react";

import type { RecipeNutrition } from "@/types";
import { updateRecipeNutrition } from "@/lib/recipes-supabase";
import { useAuth } from "@/hooks/use-auth";

import { NutritionPanel } from "./NutritionPanel";

interface NutritionSectionProps {
  recipeId: string;
  nutrition: RecipeNutrition | null | undefined;
}

// The per-serving fields the panel displays, in order.
const FIELDS = [
  { key: "calories", label: "Kcal", unit: "kcal" },
  { key: "protein_g", label: "P", unit: "g" },
  { key: "carbs_g", label: "C", unit: "g" },
  { key: "fat_g", label: "F", unit: "g" },
  { key: "fibre_g", label: "Fib", unit: "g" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type FormState = Record<FieldKey, string>;

/** Per-serving value of a stored nutrition field (totals are divided by the
 * stored yieldServings). */
function perServing(n: RecipeNutrition, key: FieldKey): string {
  const yld = n.yieldServings > 0 ? n.yieldServings : 1;
  const v = n.total[key];
  return typeof v === "number" ? String(Math.round((v / yld) * 10) / 10) : "";
}

/**
 * Shows a recipe's nutrition and lets a signed-in household member enter or edit
 * it manually (per serving). Values are stored with yieldServings = 1, so the
 * panel renders exactly what was typed. Manual entry replaced an unreliable
 * USDA auto-estimate.
 */
export function NutritionSection({ recipeId, nutrition }: NutritionSectionProps) {
  const { session } = useAuth();
  const [current, setCurrent] = useState(nutrition);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    fibre_g: "",
  });

  const hasNutrition = Boolean(current?.total);

  function startEditing() {
    setError(null);
    setForm({
      calories: current ? perServing(current, "calories") : "",
      protein_g: current ? perServing(current, "protein_g") : "",
      carbs_g: current ? perServing(current, "carbs_g") : "",
      fat_g: current ? perServing(current, "fat_g") : "",
      fibre_g: current ? perServing(current, "fibre_g") : "",
    });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const num = (s: string) => {
      const n = Number.parseFloat(s);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    };
    const next: RecipeNutrition = {
      yieldServings: 1,
      total: {
        calories: num(form.calories),
        protein_g: num(form.protein_g),
        carbs_g: num(form.carbs_g),
        fat_g: num(form.fat_g),
        fibre_g: num(form.fibre_g),
      },
      source: "manual",
      fetchedAt: new Date().toISOString(),
    };
    try {
      await updateRecipeNutrition(recipeId, next);
      setCurrent(next);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save nutrition");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Nutrition — per serving
        </div>
        <div className="grid grid-cols-5 gap-2">
          {FIELDS.map(({ key, label, unit }) => (
            <label key={key} className="flex flex-col gap-1 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-1 py-1.5 text-center text-sm"
              />
              <span className="text-[10px] text-muted-foreground">{unit}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-xs text-rose-700">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Nothing to show for a signed-out user with no nutrition.
  if (!hasNutrition && !session) return null;

  return (
    <div className="space-y-2">
      {hasNutrition && <NutritionPanel nutrition={current} />}
      {session && (
        <button
          onClick={startEditing}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-muted/60 transition-colors"
        >
          {hasNutrition ? "Edit nutrition" : "Add nutrition"}
        </button>
      )}
    </div>
  );
}
