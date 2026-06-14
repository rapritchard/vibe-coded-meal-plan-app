import type { RecipeNutrition } from "@/types";

interface NutritionPanelProps {
  nutrition: RecipeNutrition | null | undefined;
  /** Optional override for per-serving division. Falls back to
   * `nutrition.yieldServings`, then 1. */
  servings?: number;
}

type Tone = "good" | "okay" | "high" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  good: "bg-green-50 text-green-900 border border-green-100",
  okay: "bg-amber-50 text-amber-900 border border-amber-100",
  high: "bg-rose-50 text-rose-900 border border-rose-100",
  neutral: "bg-muted text-card-foreground",
};

/**
 * Color thresholds (low-fat, protein- and fibre-forward defaults):
 * - Fat: lower is better (<5g good)
 * - Protein: higher is better
 * - Fibre: higher is better
 * - Calories / carbs: neutral (depends too much on meal type)
 */
function toneFor(label: string, perServing: number): Tone {
  switch (label) {
    case "Fat":
      if (perServing < 5) return "good";
      if (perServing < 12) return "okay";
      return "high";
    case "Protein":
      if (perServing >= 15) return "good";
      if (perServing >= 8) return "okay";
      return "neutral";
    case "Fibre":
      if (perServing >= 5) return "good";
      if (perServing >= 2) return "okay";
      return "neutral";
    default:
      return "neutral";
  }
}

/**
 * Compact per-serving nutrition summary. Provider-independent — reads the
 * normalised `RecipeNutrition` shape. Hides when nutrition isn't set yet
 * (snacks/desserts and recipes we haven't backfilled).
 */
export function NutritionPanel({ nutrition, servings }: NutritionPanelProps) {
  if (!nutrition?.total) return null;

  const yieldServings =
    servings ?? nutrition.yieldServings ?? 1;
  const safeYield = yieldServings > 0 ? yieldServings : 1;

  const perServing = (n: number | undefined): number | null =>
    typeof n === "number" ? n / safeYield : null;

  const fields: {
    value: number | null;
    label: string;
    abbr: string;
    unit: string;
    round: number;
  }[] = [
    {
      value: perServing(nutrition.total.calories),
      label: "Calories",
      abbr: "Kcal",
      unit: "kcal",
      round: 0,
    },
    {
      value: perServing(nutrition.total.protein_g),
      label: "Protein",
      abbr: "P",
      unit: "g",
      round: 1,
    },
    {
      value: perServing(nutrition.total.carbs_g),
      label: "Carbs",
      abbr: "C",
      unit: "g",
      round: 1,
    },
    {
      value: perServing(nutrition.total.fat_g),
      label: "Fat",
      abbr: "F",
      unit: "g",
      round: 1,
    },
    {
      value: perServing(nutrition.total.fibre_g),
      label: "Fibre",
      abbr: "Fib",
      unit: "g",
      round: 1,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="kicker text-muted-foreground">Nutrition — per serving</div>
      <div className="grid grid-cols-5 gap-1.5">
        {fields.map(({ value, label, abbr, unit, round }) => {
          const tone = value == null ? "neutral" : toneFor(label, value);
          return (
            <div
              key={label}
              className={`rounded-lg px-1 py-2 text-center ${TONE_CLASSES[tone]}`}
            >
              <div className="text-[9px] font-semibold uppercase tracking-wide opacity-70">
                {abbr}
              </div>
              <div className="text-sm font-bold mt-0.5 tabular-nums">
                {value == null ? "—" : value.toFixed(round)}
              </div>
              <div className="text-[9px] opacity-70">{unit}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
