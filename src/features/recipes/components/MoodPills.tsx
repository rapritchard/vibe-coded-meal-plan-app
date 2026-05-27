interface MoodPillsProps {
  moods: string[] | undefined;
}

export function MoodPills({ moods }: MoodPillsProps) {
  if (!moods?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {moods.map((m) => (
        <span
          key={m}
          className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full"
        >
          {m}
        </span>
      ))}
    </div>
  );
}
