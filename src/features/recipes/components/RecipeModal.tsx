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

  // ── Reusable content sections (composed one way on desktop, another on mobile)
  const ingredients = (
    <RecipeIngredientList ingredients={recipe.ingredients} />
  );
  const tools =
    recipe.toolAlts?.length > 0 ? <ToolAltsPanel alts={recipe.toolAlts} /> : null;
  const nutrition = (
    <NutritionSection recipeId={recipe.id} nutrition={recipe.nutrition} />
  );
  const parallel =
    recipe.parallelTasks?.length > 0 ? (
      <ParallelTasksPanel tasks={recipe.parallelTasks} />
    ) : null;
  const variationBanner =
    activeVar !== null ? (
      <ActiveVariationBanner
        text={recipe.variations[activeVar]}
        onReset={() => setActiveVar(null)}
      />
    ) : null;
  const method = (
    <div className="space-y-2">
      <div className="kicker text-muted-foreground">Method</div>
      <StepList steps={steps} />
    </div>
  );
  const tip = recipe.tip ? <RecipeTip tip={recipe.tip} /> : null;
  const variations =
    recipe.variations?.length > 0 ? (
      <InteractiveVariationList
        variations={recipe.variations}
        variationSteps={recipe.variationSteps}
        activeVar={activeVar}
        onSelect={(i) => setActiveVar(activeVar === i ? null : i)}
      />
    ) : null;
  const notes = <RecipeNotes type="recipe" id={recipe.id} />;

  const titleNode = (Title: typeof DialogTitle | typeof SheetTitle) => (
    <Title className="font-serif font-semibold text-ink text-xl leading-snug">
      {recipe.name}
    </Title>
  );

  const headerMeta: ReactNode = (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{recipe.time}</span>
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
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="p-0 gap-0 w-[90vw] max-w-[1100px] max-h-[90vh] flex flex-col overflow-hidden sm:rounded-lg">
          <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border pr-12">
            {titleNode(DialogTitle)}
            <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {recipe.time}
                </span>
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Serves {recipe.serves}
                </span>
                <RecipeTimeTag icon={recipe.timeKey} leadTime={recipe.leadTime} />
                <MoodPills moods={recipe.moods} />
              </div>
              <StarRating
                value={rating}
                onChange={(next) => setRating("recipe", recipe.id, next)}
              />
            </div>
          </div>

          {/* Two independently-scrolling panes: what you need / what you do. */}
          <div className="flex-1 min-h-0 flex">
            <aside className="w-[300px] flex-shrink-0 min-h-0 overflow-y-auto border-r border-border px-5 py-5 space-y-5">
              {ingredients}
              {tools}
              {nutrition}
            </aside>
            <div className="flex-1 min-w-0 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
              {parallel}
              {variationBanner}
              {method}
              {tip}
              {variations}
              {notes}
            </div>
          </div>
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
        <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-border pr-12">
          {titleNode(SheetTitle)}
          {headerMeta}
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {ingredients}
          {parallel}
          {tools}
          {variationBanner}
          {method}
          {nutrition}
          {tip}
          {variations}
          {notes}
          <div className="h-4" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
