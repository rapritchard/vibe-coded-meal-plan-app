import { useState } from "react";

import type { AnyRecipe } from "@/types";
import { ALL_MOODS, EFFORT_LABELS } from "@/types";
import { Card } from "@/components/ui/card";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  EFFORT_ORDER,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

interface ReviewTabProps {
  items: AnyRecipe[];
}

type ViewMode = "by-category" | "by-recipe";

export default function ReviewTab({ items }: ReviewTabProps) {
  const [mode, setMode] = useState<ViewMode>("by-category");

  return (
    <div className="space-y-6">
      <Card className="p-4 border-stone-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="font-serif font-bold text-card-foreground text-base">
              Categorisation review
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Cross-check that every recipe lands in the right mouth-feel,
              effort, and meal bucket. This page has no filter chips and no
              snazzy UI — it's a master view for review only.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <ViewModeButton
            label="Categories → recipes"
            active={mode === "by-category"}
            onClick={() => setMode("by-category")}
          />
          <ViewModeButton
            label="Recipes → categories"
            active={mode === "by-recipe"}
            onClick={() => setMode("by-recipe")}
          />
        </div>
      </Card>

      <div className="text-xs text-muted-foreground">
        {items.length} items total
      </div>

      {mode === "by-category" ? (
        <ByCategoryView items={items} />
      ) : (
        <ByRecipeView items={items} />
      )}
    </div>
  );
}

interface ViewModeButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function ViewModeButton({ label, active, onClick }: ViewModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:border-stone-300 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

// ─── View 1: categories with recipes underneath ────────────────────────────

interface ByCategoryViewProps {
  items: AnyRecipe[];
}

function ByCategoryView({ items }: ByCategoryViewProps) {
  return (
    <div className="space-y-8">
      <ReviewSection title="Meal type">
        {CATEGORY_ORDER.map((cat) => (
          <ReviewBucket
            key={cat}
            label={CATEGORY_LABELS[cat]}
            names={items.filter((i) => i.category === cat).map((i) => i.name)}
          />
        ))}
      </ReviewSection>

      <ReviewSection title="Mouth-feel">
        {ALL_MOODS.map((mood) => (
          <ReviewBucket
            key={mood}
            label={mood}
            names={items
              .filter((i) => i.moods.includes(mood))
              .map((i) => i.name)}
          />
        ))}
      </ReviewSection>

      <ReviewSection title="Effort">
        {EFFORT_ORDER.map((effort) => (
          <ReviewBucket
            key={effort}
            label={EFFORT_LABELS[effort]}
            names={items.filter((i) => i.effort === effort).map((i) => i.name)}
          />
        ))}
      </ReviewSection>

      <ReviewSection title="Extras">
        <ReviewBucket
          label="Makes leftovers (isBatch=true)"
          names={items.filter((i) => i.isBatch).map((i) => i.name)}
        />
        <ReviewBucket
          label="Good for on the go"
          names={items.filter((i) => i.goodOnTheGo).map((i) => i.name)}
        />
      </ReviewSection>
    </div>
  );
}

interface ReviewSectionProps {
  title: string;
  children: React.ReactNode;
}

function ReviewSection({ title, children }: ReviewSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-serif text-lg font-bold text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface ReviewBucketProps {
  label: string;
  names: string[];
}

function ReviewBucket({ label, names }: ReviewBucketProps) {
  return (
    <Card className="p-4 border-stone-100">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </div>
        <span className="text-xs text-muted-foreground">{names.length}</span>
      </div>
      {names.length === 0 ? (
        <div className="text-xs text-stone-400 italic">no items</div>
      ) : (
        <ul className="space-y-0.5">
          {names.map((n) => (
            <li key={n} className="text-sm text-stone-700">
              · {n}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ─── View 2: recipes with all their categories underneath ──────────────────

interface ByRecipeViewProps {
  items: AnyRecipe[];
}

function ByRecipeView({ items }: ByRecipeViewProps) {
  const grouped = CATEGORY_ORDER.flatMap((cat) =>
    items.filter((i) => i.category === cat),
  );

  return (
    <div className="space-y-3">
      {grouped.map((item) => (
        <ReviewRecipeCard key={`${item.type}:${item.id}`} item={item} />
      ))}
    </div>
  );
}

interface ReviewRecipeCardProps {
  item: AnyRecipe;
}

function ReviewRecipeCard({ item }: ReviewRecipeCardProps) {
  const extras: string[] = [];
  if (item.isBatch) extras.push("Makes leftovers");
  if (item.goodOnTheGo) extras.push("Good on the go");

  return (
    <Card className="p-4 border-stone-100 space-y-2">
      <div className="font-serif font-bold text-card-foreground text-sm">
        {item.name}
      </div>
      <Row label="Meal">{CATEGORY_LABELS[item.category]}</Row>
      <Row label="Mouth-feel">
        {item.moods.length === 0 ? (
          <Muted>none</Muted>
        ) : (
          item.moods.join(", ")
        )}
      </Row>
      <Row label="Effort">{EFFORT_LABELS[item.effort]}</Row>
      <Row label="Extras">
        {extras.length === 0 ? <Muted>none</Muted> : extras.join(" · ")}
      </Row>
      <Row label="ID">
        <code className="text-xs text-stone-500">
          {item.type}:{item.id}
        </code>
      </Row>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 text-xs leading-relaxed">
      <span className="font-semibold text-muted-foreground uppercase tracking-widest w-20 flex-shrink-0">
        {label}
      </span>
      <span className="text-stone-700">{children}</span>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-stone-400 italic">{children}</span>;
}
