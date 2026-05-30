// ─────────────────────────────────────────────────────────────────────────────
// src/lib/supabase.ts
// Supabase client singleton. Returns `null` when env vars are missing so the
// app gracefully falls back to localStorage-only mode for local dev without
// a configured Supabase project.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

/**
 * The Supabase client, or `null` if env vars aren't configured. Consumers
 * should null-check before calling — and either fall back to localStorage
 * or render an unauthenticated read-only experience.
 */
export const supabase: SupabaseClient | null =
  url && publishableKey
    ? createClient(url, publishableKey, {
        auth: {
          // PKCE flow: immune to email-prefetch consumption of the token.
          flowType: "pkce",
          // Auto-detect the auth response in the URL hash on initial load.
          detectSessionInUrl: true,
          // Persist session in localStorage so reloads stay logged in.
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;
