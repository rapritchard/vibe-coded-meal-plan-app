import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import type { RecipeType } from "@/lib/recipe-types";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/hooks/use-notes";

const AUTOSAVE_DELAY_MS = 500;

interface RecipeNotesProps {
  type: RecipeType;
  id: string;
}

export function RecipeNotes({ type, id }: RecipeNotesProps) {
  const { getNote, setNote } = useNotes();
  const saved = getNote(type, id);
  const [draft, setDraft] = useState(saved);

  // When the consumer flips to a different recipe, sync the draft to the new
  // saved value.
  useEffect(() => {
    setDraft(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  // Debounced autosave.
  useEffect(() => {
    if (draft === saved) return;
    const t = setTimeout(() => setNote(type, id, draft), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [draft, saved, type, id, setNote]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <Sparkles className="h-3.5 w-3.5" />
        Notes for next iteration
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What would you change next time? An AI agent will use these notes when iterating on this recipe."
        className="rounded-xl text-sm"
        rows={3}
      />
    </div>
  );
}
