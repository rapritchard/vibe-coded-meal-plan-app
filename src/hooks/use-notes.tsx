import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  deleteNote,
  loadNotes,
  noteKey,
  readNotesCacheSync,
  upsertNote,
  type NotesMap,
} from "@/lib/notes";
import type { RecipeType } from "@/lib/recipe-types";
import { useAuth } from "./use-auth";

interface NotesContextValue {
  getNote: (type: RecipeType, id: string) => string;
  setNote: (type: RecipeType, id: string, value: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: NotesProviderProps) {
  const [notes, setNotes] = useState<NotesMap>(() => readNotesCacheSync());
  const { session } = useAuth();

  useEffect(() => {
    let cancelled = false;
    loadNotes().then((fresh) => {
      if (!cancelled) setNotes(fresh);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const getNote = useCallback(
    (type: RecipeType, id: string) => notes[noteKey(type, id)] ?? "",
    [notes],
  );

  const setNote = useCallback((type: RecipeType, id: string, value: string) => {
    const key = noteKey(type, id);
    setNotes((prev) => {
      const next: NotesMap = { ...prev };
      if (value.trim() === "") delete next[key];
      else next[key] = value;
      return next;
    });
    if (value.trim() === "") {
      void deleteNote(key);
    } else {
      void upsertNote(key, value);
    }
  }, []);

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
