interface StepListProps {
  steps: string[];
}

export function StepList({ steps }: StepListProps) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li
          key={i}
          className="flex gap-3 text-sm text-stone-700 leading-relaxed"
        >
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}
