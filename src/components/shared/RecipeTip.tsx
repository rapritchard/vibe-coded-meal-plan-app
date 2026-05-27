import { Lightbulb } from "lucide-react";

interface RecipeTipProps {
  tip: string;
}

export function RecipeTip({ tip }: RecipeTipProps) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
      <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800 leading-relaxed">{tip}</p>
    </div>
  );
}
