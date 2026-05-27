import type { Phase2Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RecipeNotes } from "@/components/shared/RecipeNotes";
import { StarRating } from "@/components/shared/StarRating";
import { useRatings } from "@/hooks/use-ratings";

interface Phase2RecipeCardProps {
  recipe: Phase2Recipe;
}

export function Phase2RecipeCard({ recipe }: Phase2RecipeCardProps) {
  const { getRating, setRating } = useRatings();
  const rating = getRating("phase2", recipe.id);

  return (
    <Card className="rounded-2xl p-4 border-stone-100">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="font-serif font-bold text-card-foreground text-sm">
          {recipe.name}
        </div>
        <Badge
          variant="outline"
          className="flex-shrink-0 bg-violet-50 text-violet-700 border-violet-100 font-normal"
        >
          Phase 2
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {recipe.moods.map((m) => (
          <span
            key={m}
            className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full"
          >
            {m}
          </span>
        ))}
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground mb-2">
        <span>Time: {recipe.time}</span>
        <span>Serves {recipe.serves}</span>
      </div>
      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 leading-relaxed">
        {recipe.note}
      </p>
      <div className="mt-3">
        <StarRating
          value={rating}
          onChange={(next) => setRating("phase2", recipe.id, next)}
          size="sm"
        />
      </div>
      <div className="mt-4">
        <RecipeNotes type="phase2" id={recipe.id} />
      </div>
    </Card>
  );
}
