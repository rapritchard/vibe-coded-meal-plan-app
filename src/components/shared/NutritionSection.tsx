import { useState } from "react";

import type { RecipeNutrition } from "@/types";
import { enrichNutrition } from "@/lib/nutrition";
import { useAuth } from "@/hooks/use-auth";

import { NutritionPanel } from "./NutritionPanel";

interface NutritionSectionProps {
  recipeId: string;
  nutrition: RecipeNutrition | null | undefined;
  servings?: number;
}

/**
 * Wraps NutritionPanel with the on-demand "estimate from USDA" action. A
 * signed-in user can compute nutrition when it's missing, or re-run it to
 * refresh existing values; the result shows immediately and is persisted in
 * Supabase. Enrichment is a signed-in action (the function is JWT-gated), so
 * the button is hidden when signed out.
 */
export function NutritionSection({
  recipeId,
  nutrition,
  servings,
}: NutritionSectionProps) {
  const { session } = useAuth();
  const [current, setCurrent] = useState(nutrition);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);

  const hasNutrition = Boolean(current?.total);

  async function handleEnrich() {
    setLoading(true);
    setError(null);
    try {
      const result = await enrichNutrition(recipeId);
      setCurrent(result.nutrition);
      setSkipped(result.skipped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enrichment failed");
    } finally {
      setLoading(false);
    }
  }

  // Nothing to show for a signed-out user with no nutrition.
  if (!hasNutrition && !session) return null;

  return (
    <div className="space-y-2">
      {hasNutrition && (
        <NutritionPanel nutrition={current} servings={servings} />
      )}

      {session && (
        <button
          onClick={handleEnrich}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
        >
          {loading
            ? "Estimating…"
            : hasNutrition
              ? "Re-estimate nutrition (USDA)"
              : "Estimate nutrition (USDA)"}
        </button>
      )}

      {error && <p className="text-xs text-rose-700">{error}</p>}
      {skipped.length > 0 && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Couldn’t estimate {skipped.length} ingredient
          {skipped.length === 1 ? "" : "s"}: {skipped.join(", ")}
        </p>
      )}
    </div>
  );
}
