import type { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecipeTimeTag } from "@/components/shared/RecipeTimeTag";

import { MoodPills } from "./MoodPills";

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onView }: RecipeCardProps) {
  return (
    <Card className="rounded-2xl px-5 py-4 border-stone-100 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="font-serif font-semibold text-card-foreground text-sm leading-snug">
          {recipe.name}
        </div>

        <RecipeTimeTag
          icon={recipe.timeKey}
          tools={recipe.tools}
          leadTime={recipe.leadTime}
        />

        <MoodPills moods={recipe.moods} />

        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{recipe.time}</span>
          <span>Serves {recipe.serves}</span>
          {recipe.isBatch && (
            <span className="text-rose-500 font-medium">Batch</span>
          )}
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => onView(recipe)}
        className="flex-shrink-0 rounded-full px-3 py-1.5 h-auto text-xs"
      >
        View
      </Button>
    </Card>
  );
}
