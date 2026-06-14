import { useState, type MouseEvent } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (next: number) => void;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}

const SIZE_CLASS = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

export function StarRating({
  value,
  onChange,
  size = "md",
  className,
  label,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !!onChange;
  const display = interactive ? (hover ?? value) : value;
  const sizeClass = SIZE_CLASS[size];

  function handleClick(e: MouseEvent, n: number) {
    if (!onChange) return;
    e.stopPropagation();
    e.preventDefault();
    onChange(value === n ? 0 : n);
  }

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={interactive ? () => setHover(null) : undefined}
      aria-label={label ?? (interactive ? "Rate this recipe" : "Rating")}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        const sharedClass = cn(
          "transition-transform",
          interactive && "cursor-pointer hover:scale-110",
        );
        const icon = (
          <Star
            className={cn(
              sizeClass,
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-foreground/30",
            )}
          />
        );

        if (!interactive) {
          return (
            <span key={n} className={sharedClass}>
              {icon}
            </span>
          );
        }

        return (
          <button
            key={n}
            type="button"
            onClick={(e) => handleClick(e, n)}
            onMouseEnter={() => setHover(n)}
            className={sharedClass}
            aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
