import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { migrateLocalToSupabaseIfNeeded } from "@/lib/migration";

interface AuthContextValue {
  /** Current Supabase session, or `null` if signed out / not configured. */
  session: Session | null;
  /** Email address of the currently signed-in user, or `null`. */
  email: string | null;
  /** True while the initial getSession() call is in flight. */
  loading: boolean;
  /** Whether the app is wired up to a Supabase project at all. */
  configured: boolean;
  /**
   * Request a magic link email. Returns an error message if sending failed,
   * `null` on success.
   */
  signInWithMagicLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (event === "SIGNED_IN") {
          void migrateLocalToSupabaseIfNeeded();
        }
      },
    );

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = useCallback(
    async (emailAddress: string): Promise<string | null> => {
      if (!supabase) {
        return "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.";
      }
      const { error } = await supabase.auth.signInWithOtp({
        email: emailAddress,
        options: {
          // Where to land after the user clicks the magic link. Supabase
          // will also append the PKCE code to this URL as a query param.
          emailRedirectTo: window.location.origin,
        },
      });
      return error?.message ?? null;
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        email: session?.user?.email ?? null,
        loading,
        configured: isSupabaseConfigured,
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
