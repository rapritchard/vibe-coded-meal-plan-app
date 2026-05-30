import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  deleteRating,
  loadRatings,
  ratingKey,
  readRatingsCacheSync,
  upsertRating,
  type RatingsMap,
} from "@/lib/ratings";
import type { RecipeType } from "@/lib/recipe-types";
import { useAuth } from "./use-auth";

interface RatingsContextValue {
  getRating: (type: RecipeType, id: string) => number;
  setRating: (type: RecipeType, id: string, value: number) => void;
}

const RatingsContext = createContext<RatingsContextValue | null>(null);

interface RatingsProviderProps {
  children: ReactNode;
}

export function RatingsProvider({ children }: RatingsProviderProps) {
  // Cache-first bootstrap — no hard loading gate. The UI renders with the
  // last-known map (or {} on a fresh device), then refreshes from Supabase
  // in the background as soon as we have a session.
  const [ratings, setRatings] = useState<RatingsMap>(() =>
    readRatingsCacheSync(),
  );
  const { session } = useAuth();

  // Refresh on mount + whenever auth state changes (the partner may have
  // added ratings on their device since we last loaded).
  useEffect(() => {
    let cancelled = false;
    loadRatings().then((fresh) => {
      if (!cancelled) setRatings(fresh);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const getRating = useCallback(
    (type: RecipeType, id: string) => ratings[ratingKey(type, id)] ?? 0,
    [ratings],
  );

  const setRating = useCallback(
    (type: RecipeType, id: string, value: number) => {
      const key = ratingKey(type, id);
      // Optimistic local update.
      setRatings((prev) => {
        const next: RatingsMap = { ...prev };
        if (value === 0) delete next[key];
        else next[key] = value;
        return next;
      });
      // Fire-and-forget the persistence; surfaces silently in console on
      // failure (e.g. signed out, RLS denies).
      if (value === 0) {
        void deleteRating(key);
      } else {
        void upsertRating(key, value);
      }
    },
    [],
  );

  return (
    <RatingsContext.Provider value={{ getRating, setRating }}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings(): RatingsContextValue {
  const ctx = useContext(RatingsContext);
  if (!ctx) {
    throw new Error("useRatings must be used within a RatingsProvider");
  }
  return ctx;
}
