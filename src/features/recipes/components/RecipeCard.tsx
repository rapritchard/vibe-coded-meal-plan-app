import type { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecipeTimeTag } from "@/components/shared/RecipeTimeTag";
import { StarRating } from "@/components/shared/StarRating";
import { useRatings } from "@/hooks/use-ratings";

import { MoodPills } from "./MoodPills";

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onView }: RecipeCardProps) {
  const { getRating } = useRatings();
  const rating = getRating("recipe", recipe.id);

  return (
    <Card className="group rounded-lg px-5 py-4 flex items-start justify-between gap-3 transition-colors hover:border-ink/40">
      <div className="flex-1 min-w-0 space-y-2">
        <button
          type="button"
          onClick={() => onView(recipe)}
          className="font-serif font-medium text-ink text-base leading-snug text-left transition-colors hover:text-persimmon focus-visible:text-persimmon focus-visible:outline-none"
        >
          {recipe.name}
        </button>

        <RecipeTimeTag icon={recipe.timeKey} leadTime={recipe.leadTime} />

        <MoodPills moods={recipe.moods} />

        <div className="flex gap-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground items-center">
          <span>{recipe.time}</span>
          <span>Serves {recipe.serves}</span>
          {recipe.isBatch && (
            <span className="text-persimmon font-medium">Batch</span>
          )}
          {rating > 0 && <StarRating value={rating} size="sm" />}
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => onView(recipe)}
        className="flex-shrink-0 rounded-md px-3 py-1.5 h-auto font-mono text-[0.65rem] uppercase tracking-[0.12em]"
      >
        View
      </Button>
    </Card>
  );
}
