interface StepListProps {
  steps: string[];
}

export function StepList({ steps }: StepListProps) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li
          key={i}
          className="flex gap-3 items-baseline text-sm text-foreground leading-relaxed"
        >
          <span className="flex-shrink-0 w-6 text-right font-serif text-lg font-semibold text-persimmon tabular-nums leading-none">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}
