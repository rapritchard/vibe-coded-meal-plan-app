import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  loadRatings,
  ratingKey,
  saveRatings,
  type RatingsMap,
} from "@/lib/ratings";
import type { RecipeType } from "@/lib/recipe-types";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

interface RatingsContextValue {
  getRating: (type: RecipeType, id: string) => number;
  setRating: (type: RecipeType, id: string, value: number) => void;
}

const RatingsContext = createContext<RatingsContextValue | null>(null);

interface RatingsProviderProps {
  children: ReactNode;
}

export function RatingsProvider({ children }: RatingsProviderProps) {
  const [ratings, setRatings] = useState<RatingsMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRatings().then((loaded) => {
      if (!cancelled) setRatings(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const getRating = useCallback(
    (type: RecipeType, id: string) =>
      (ratings ?? {})[ratingKey(type, id)] ?? 0,
    [ratings],
  );

  const setRating = useCallback(
    (type: RecipeType, id: string, value: number) => {
      setRatings((prev) => {
        const safe = prev ?? {};
        const key = ratingKey(type, id);
        const next: RatingsMap = { ...safe };
        if (value === 0) {
          delete next[key];
        } else {
          next[key] = value;
        }
        void saveRatings(next);
        return next;
      });
    },
    [],
  );

  if (ratings === null) {
    return <LoadingScreen />;
  }

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
