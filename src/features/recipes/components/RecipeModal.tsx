import { useState, type ReactNode } from "react";

import type { Recipe } from "@/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { NutritionSection } from "@/components/shared/NutritionSection";
import { RecipeNotes } from "@/components/shared/RecipeNotes";
import { RecipeTimeTag } from "@/components/shared/RecipeTimeTag";
import { RecipeTip } from "@/components/shared/RecipeTip";
import { StarRating } from "@/components/shared/StarRating";
import { StepList } from "@/components/shared/StepList";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRatings } from "@/hooks/use-ratings";

import { ActiveVariationBanner } from "./ActiveVariationBanner";
import { InteractiveVariationList } from "./InteractiveVariationList";
import { MoodPills } from "./MoodPills";
import { ParallelTasksPanel } from "./ParallelTasksPanel";
import { RecipeIngredientList } from "./RecipeIngredientList";
import { ToolAltsPanel } from "./ToolAltsPanel";

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  const [activeVar, setActiveVar] = useState<number | null>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { getRating, setRating } = useRatings();

  if (!recipe) return null;

  const rating = getRating("recipe", recipe.id);

  const steps =
    activeVar !== null && recipe.variationSteps?.[activeVar]
      ? recipe.variationSteps[activeVar]!
      : recipe.steps;

  function handleOpenChange(open: boolean) {
    if (!open) {
      setActiveVar(null);
      onClose();
    }
  }

  const title = (TitleComponent: typeof DialogTitle | typeof SheetTitle) => (
    <TitleComponent className="font-serif font-bold text-foreground text-base leading-snug">
      {recipe.name}
    </TitleComponent>
  );

  const body: ReactNode = (
    <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
      <RecipeIngredientList ingredients={recipe.ingredients} />

      {recipe.parallelTasks?.length > 0 && (
        <ParallelTasksPanel tasks={recipe.parallelTasks} />
      )}

      {recipe.toolAlts?.length > 0 && <ToolAltsPanel alts={recipe.toolAlts} />}

      {activeVar !== null && (
        <ActiveVariationBanner
          text={recipe.variations[activeVar]}
          onReset={() => setActiveVar(null)}
        />
      )}

      <StepList steps={steps} />

      <NutritionSection recipeId={recipe.id} nutrition={recipe.nutrition} />

      {recipe.tip && <RecipeTip tip={recipe.tip} />}

      {recipe.variations?.length > 0 && (
        <InteractiveVariationList
          variations={recipe.variations}
          variationSteps={recipe.variationSteps}
          activeVar={activeVar}
          onSelect={(i) => setActiveVar(activeVar === i ? null : i)}
        />
      )}

      <RecipeNotes type="recipe" id={recipe.id} />

      <div className="h-4" />
    </div>
  );

  const header = (titleNode: ReactNode) => (
    <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-stone-100 pr-12">
      {titleNode}
      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
        <span>Time: {recipe.time}</span>
        <span>Serves {recipe.serves}</span>
      </div>
      <div className="mt-2">
        <RecipeTimeTag icon={recipe.timeKey} leadTime={recipe.leadTime} />
      </div>
      <div className="mt-2">
        <MoodPills moods={recipe.moods} />
      </div>
      <div className="mt-3">
        <StarRating
          value={rating}
          onChange={(next) => setRating("recipe", recipe.id, next)}
        />
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="p-0 gap-0 max-w-lg max-h-[90vh] flex flex-col sm:rounded-2xl overflow-hidden">
          {header(title(DialogTitle))}
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 gap-0 max-h-[90vh] flex flex-col rounded-t-3xl border-t-0 w-full sm:max-w-none"
      >
        {header(title(SheetTitle))}
        {body}
      </SheetContent>
    </Sheet>
  );
}
