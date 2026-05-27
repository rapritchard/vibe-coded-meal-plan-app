import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  loadNotes,
  noteKey,
  saveNotes,
  type NotesMap,
} from "@/lib/notes";
import type { RecipeType } from "@/lib/recipe-types";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

interface NotesContextValue {
  getNote: (type: RecipeType, id: string) => string;
  setNote: (type: RecipeType, id: string, value: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: NotesProviderProps) {
  const [notes, setNotes] = useState<NotesMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadNotes().then((loaded) => {
      if (!cancelled) setNotes(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const getNote = useCallback(
    (type: RecipeType, id: string) => (notes ?? {})[noteKey(type, id)] ?? "",
    [notes],
  );

  const setNote = useCallback((type: RecipeType, id: string, value: string) => {
    setNotes((prev) => {
      const safe = prev ?? {};
      const key = noteKey(type, id);
      const next: NotesMap = { ...safe };
      if (value.trim() === "") {
        delete next[key];
      } else {
        next[key] = value;
      }
      void saveNotes(next);
      return next;
    });
  }, []);

  if (notes === null) {
    return <LoadingScreen />;
  }

  return (
    <NotesContext.Provider value={{ getNote, setNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return ctx;
}
