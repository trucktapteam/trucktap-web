import { createClient } from "@supabase/supabase-js";

/**
 * Server-only, anonymous-read Supabase client. There's no auth/session on
 * this site — every query goes through the anon key and RLS — so this is
 * intentionally simpler than the cookie-aware `@supabase/ssr` client: one
 * shared instance is safe to reuse across requests.
 *
 * Every table this client touches must be queried with an explicit column
 * list. RLS makes rows safe, not columns — `profiles` and `upcoming_stops`
 * in particular carry columns (email/push_token; internal automation
 * state) that RLS does not hide from the anon role. Never `select('*')`
 * here, and never query `public.trucks` directly — always `public_trucks`.
 */
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}
